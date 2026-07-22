import React, { useState, useEffect, useRef } from "react";
import { onSnapshot, doc, collection } from "firebase/firestore";
import { db, registarPushNotifications } from "./firebase.js";
import { BG, CYN, BLUE, PRP, TXT_MUT } from "./theme.jsx";
import { SPECIAL_USERS } from "./data.js";
import { processarLoginStreak } from "./streak.js";
import logoImg from "./logo.png";

export const ThemeCtx = React.createContext(false);

import HomeTab     from "./tabs/HomeTab.jsx";
import DesafiosTab from "./tabs/DesafiosTab.jsx";
import ForumTab    from "./tabs/ForumTab.jsx";
import PiaTab      from "./tabs/PiaTab.jsx";
import PerfilTab   from "./tabs/PerfilTab.jsx";

const NAV = [
  ["home",     "🏠", "Início"],
  ["desafios", "⚡", "Desafios"],
  ["forum",    "🌐", "Fórum"],
  ["pia",      "🚀", "PIA"],
  ["perfil",   "👤", "Perfil"],
];

const TERESA_BG  = "#ebe6f7";
const TERESA_ACC = "#a78bfa"; // soft violet

export default function JovensApp({ user, onLogout, previewMode = false, onExitPreview = null }) {
  const isTeresa = user.username === "teresa" && !previewMode;
  const light = false; // always dark mode; action card colors handled independently
  const [tab, setTab] = useState("home");
  const [desafiosSubTab, setDesafiosSubTab] = useState("pergunta");
  const [forumCanal, setForumCanal] = useState(null);
  const [streakPopup, setStreakPopup] = useState(null); // { streak, xp, medal }
  const streakFeitoRef = useRef(null);
  const [allData, setAllData] = useState({
    todos: [], events: [], myNotifs: [], leaderboard: {},
    missions: [], completedMissions: [], history: [],
    userData: {}, medals: [], features: {}, weekStartTs: 0
  });

  useEffect(() => {
    if (!user) return;
    const unsubs = [
      onSnapshot(collection(db, "events"), s => setAllData(p => ({...p, events: s.docs.map(d=>({id:d.id,...d.data()}))}))),
      onSnapshot(collection(db, "todos", user.username, "items"), s => setAllData(p => ({...p, todos: s.docs.map(d=>({id:d.id,...d.data()}))}))),
      onSnapshot(collection(db, "notifications", user.username, "items"), s => setAllData(p => ({...p, myNotifs: s.docs.map(d=>({id:d.id,...d.data()}))}))),
      onSnapshot(doc(db, "config", "weeklyLeaderboard"), s => setAllData(p => ({...p, leaderboard: s.exists() ? s.data().scores || {} : {}}))),
      onSnapshot(doc(db, "config", "features"), s => setAllData(p => ({...p, features: s.exists() ? s.data() : {}}))),
      onSnapshot(doc(db, "config", "weekStart"), s => setAllData(p => ({...p, weekStartTs: s.exists() ? s.data().ts || 0 : 0}))),
      onSnapshot(collection(db, "missions"), s => setAllData(p => ({...p, missions: s.docs.map(d=>({id:d.id,...d.data()}))}))),
      onSnapshot(doc(db, "userData", user.username), s => {
        if (s.exists()) {
          const d = s.data();
          setAllData(p => ({...p, userData: d, history: d.history || [], completedMissions: d.completedMissions || []}));
        }
      }),
      onSnapshot(doc(db, "medals", user.username), s => setAllData(p => ({...p, medals: s.exists() ? s.data() : {}}))),
    ];
    return () => unsubs.forEach(u => u());
  }, [user]);

  // Limpeza: remove qualquer service worker de push antigo (firebase-messaging-sw.js)
  // de uma versão anterior que entrava em conflito com o da PWA.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(reg => {
        if (reg.active?.scriptURL?.includes("firebase-messaging-sw.js")) reg.unregister();
      });
    }).catch(() => {});
  }, []);

  // Registo de notificações push — reutiliza o ÚNICO service worker da PWA
  // (nunca regista um segundo), e falha em silêncio se algo não suportar.
  useEffect(() => {
    if (user) registarPushNotifications(user.username);
  }, [user]);

  // Streak de ENTRADAS — corre uma vez por abertura da app. Só jovens reais
  // (não teresa/ricardo/demo, não preview, não demo). Dá XP + medalhas e
  // mostra pop-up nos dias premiados (2 dias, e a cada +5).
  useEffect(() => {
    if (!user || previewMode || user.isDemo) return;
    if (SPECIAL_USERS.includes(user.username)) return;
    if (streakFeitoRef.current === user.username) return; // já corrido nesta sessão
    streakFeitoRef.current = user.username;
    processarLoginStreak(user.username)
      .then(res => { if (res) setStreakPopup(res); })
      .catch(() => {});
  }, [user, previewMode]);

  // Tema escuro-violeta para teresa
  useEffect(() => {
    if (!isTeresa) return;
    document.body.style.backgroundColor = TERESA_BG;
    document.body.style.backgroundImage = `
      linear-gradient(rgba(139,92,246,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139,92,246,0.07) 1px, transparent 1px)
    `;
    document.body.style.backgroundSize = "32px 32px";
    return () => {
      document.body.style.backgroundColor = "#071529";
      document.body.style.backgroundImage = `
        linear-gradient(rgba(50,199,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(50,199,255,0.04) 1px, transparent 1px)
      `;
    };
  }, [isTeresa]);

  const ud = allData.userData;
  const dayStreak = ud.loginStreak || 0; // contador no topo = streak de entradas
  const weekStartTs = allData.weekStartTs || 0;
  const weekXp = weekStartTs > 0
    ? (allData.history || []).filter(h => (h.ts || 0) >= weekStartTs && (h.xp || 0) > 0).reduce((s, h) => s + (h.xp || 0), 0)
    : (ud.weekXp || 0);
  const notifCount = allData.myNotifs.filter(n => !n.read).length;

  // Merge global feature flags with per-user overrides (override wins when set)
  const globalFeatures   = allData.features || {};
  const featureOverrides = ud.featureOverrides || {};
  const effectiveFeatures = Object.fromEntries(
    ["perguntaSemanal","autoAvaliacao","satisfacao","rodaVida"].map(k => [
      k, featureOverrides[k] !== undefined ? featureOverrides[k] : (globalFeatures[k] || false)
    ])
  );

  return (
    <ThemeCtx.Provider value={light}>
    <div style={{ minHeight:"100vh", background: isTeresa ? TERESA_BG : BG, maxWidth:420, margin:"0 auto", display:"flex", flexDirection:"column", fontFamily:"'Inter',system-ui,sans-serif",
      ...(isTeresa && {
        "--card-bg": "rgba(18,14,38,0.94)",
        "--card-text": "#e8e4f8",
        "--card-border": "rgba(139,92,246,0.16)",
        "--card-shadow": "0 4px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(139,92,246,0.08)",
        "--inp-bg": "rgba(10,8,24,0.80)",
        "--inp-border": "rgba(139,92,246,0.50)",
        "--sl-color": "#c4b8f3",
        "--subtabs-bg": "rgba(10,8,24,0.65)",
      })
    }}>
      {isTeresa && (
        <style>{`
          input::placeholder, textarea::placeholder { color: rgba(196,184,243,0.55) !important; }
        `}</style>
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      {isTeresa ? (
        /* Teresa — dark violet header */
        <div style={{ position:"relative", padding:"22px 20px 18px", overflow:"hidden",
          background:"linear-gradient(160deg, #1c1530 0%, #0d0f1a 100%)",
          borderBottom:"1px solid rgba(139,92,246,0.18)" }}>
          {/* Violet glow */}
          <div style={{ position:"absolute", top:-50, right:-30, width:180, height:180, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(139,92,246,0.14), transparent 68%)", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", top:-10, left:-40, width:140, height:140, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)", pointerEvents:"none" }}/>

          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", position:"relative" }}>
            <div>
              <div style={{ fontSize:11, color:"#6b6f8a", fontWeight:500, letterSpacing:0.3 }}>Olá,</div>
              <div style={{ fontSize:26, fontWeight:900, color:"#ede8ff", lineHeight:1.1, letterSpacing:-0.5 }}>{user.realName}</div>
              <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap", alignItems:"center" }}>
                {dayStreak > 0 && (
                  <div style={{ fontSize:10, background:"rgba(251,146,60,0.14)", border:"1px solid rgba(251,146,60,0.30)",
                    borderRadius:20, padding:"3px 11px", fontWeight:700, color:"#fb923c" }}>
                    🔥 {dayStreak} dia{dayStreak > 1 ? "s" : ""}
                  </div>
                )}
                <div style={{ fontSize:10, background:"rgba(167,139,250,0.14)", border:"1px solid rgba(167,139,250,0.28)",
                  borderRadius:20, padding:"3px 11px", fontWeight:700, color:TERESA_ACC }}>
                  ⚡ {weekXp} XP
                </div>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, flexShrink:0 }}>
              <img src={logoImg} alt="JEEP" style={{ width:72, height:72, objectFit:"contain", opacity:0.88 }} />
              <button onClick={onLogout} style={{
                background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)",
                color:"#9490b8", padding:"6px 15px", borderRadius:20, fontSize:11,
                cursor:"pointer", fontWeight:600
              }}>Sair</button>
            </div>
          </div>
        </div>
      ) : (
        /* Modo escuro — header original */
        <div style={{ position:"relative", padding:"18px 20px 16px", overflow:"hidden",
          background:"linear-gradient(160deg, rgba(24,62,112,0.88) 0%, rgba(16,44,84,0.84) 100%)",
          borderBottom:"1px solid rgba(50,199,255,0.12)" }}>

          <div style={{ position:"absolute", top:-40, left:-20, width:160, height:160, borderRadius:"50%",
            background:`radial-gradient(circle, ${user.color}14, transparent 70%)`, pointerEvents:"none" }}/>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>
            <div>
              <div style={{ fontSize:11, color:TXT_MUT, fontWeight:600, letterSpacing:0.3 }}>Olá,</div>
              <div style={{ fontSize:22, fontWeight:900, color:"#ffffff", lineHeight:1.15, letterSpacing:-0.3 }}>{user.realName}</div>
              <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap", alignItems:"center" }}>
                {dayStreak > 0 && (
                  <div style={{ fontSize:10, background:"rgba(251,146,60,0.18)", border:"1px solid rgba(251,146,60,0.35)",
                    borderRadius:20, padding:"3px 10px", fontWeight:800, color:"#fb923c" }}>
                    🔥 {dayStreak} dia{dayStreak > 1 ? "s" : ""}
                  </div>
                )}
                <div style={{ fontSize:10, background:"rgba(50,199,255,0.12)", border:"1px solid rgba(50,199,255,0.28)",
                  borderRadius:20, padding:"3px 10px", fontWeight:800, color:CYN }}>
                  ⚡ {weekXp} XP
                </div>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, flexShrink:0 }}>
              <img src={logoImg} alt="JEEP" style={{ width:68, height:68, objectFit:"cover", opacity:0.95 }} />
              <button onClick={onLogout} style={{
                background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)",
                color:"white", padding:"7px 16px", borderRadius:20, fontSize:12,
                cursor:"pointer", fontWeight:600
              }}>Sair</button>
            </div>
          </div>
        </div>
      )}

      {/* ── PRÉ-VISUALIZAR STREAK (só teresa vê — não grava nada) ───────── */}
      {isTeresa && (
        <div style={{ padding:"10px 16px", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap",
          background:"rgba(139,92,246,0.06)", borderBottom:"1px solid rgba(139,92,246,0.14)" }}>
          <span style={{ fontSize:10, fontWeight:800, color:"#8b7fb8", letterSpacing:0.5 }}>
            👁️ PRÉ-VER (só tu vês)
          </span>
          <button onClick={() => setStreakPopup({ streak:2, xp:10, medal:null })} style={{
            fontSize:11, fontWeight:800, cursor:"pointer", borderRadius:20, padding:"5px 12px",
            background:"rgba(251,146,60,0.14)", border:"1px solid rgba(251,146,60,0.32)", color:"#fb923c" }}>
            🔥 Streak (2 dias)
          </button>
          <button onClick={() => setStreakPopup({ streak:5, xp:20, medal:{ icon:"🔥", label:"5 Dias Seguidos" } })} style={{
            fontSize:11, fontWeight:800, cursor:"pointer", borderRadius:20, padding:"5px 12px",
            background:"rgba(251,191,36,0.14)", border:"1px solid rgba(251,191,36,0.32)", color:"#fbbf24" }}>
            🏅 Medalha (5 dias)
          </button>
        </div>
      )}

      {/* ── BANNER PREVIEW ─────────────────────────────────────────────── */}
      {previewMode && (
        <div style={{ background:"rgba(7,21,41,0.97)", borderBottom:`2px solid ${CYN}`,
          padding:"8px 16px", display:"flex", alignItems:"center", justifyContent:"space-between",
          position:"sticky", top:0, zIndex:50 }}>
          <div>
            <div style={{ fontSize:9, color:"#64748b", fontWeight:800, letterSpacing:1 }}>PREVIEW — SÓ LEITURA</div>
            <div style={{ fontSize:13, fontWeight:900, color:user.color || CYN }}>👁️ {user.realName || user.name}</div>
          </div>
          <button onClick={onExitPreview} style={{
            background:`${CYN}15`, border:`1px solid ${CYN}40`, color:CYN,
            padding:"6px 14px", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:800
          }}>← Sair</button>
        </div>
      )}

      {/* ── BANNER DEMO ────────────────────────────────────────────────── */}
      {user.isDemo && (
        <div style={{ background:"rgba(163,230,53,0.12)", borderBottom:"1px solid rgba(163,230,53,0.25)",
          padding:"8px 16px", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:16 }}>🎭</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11, fontWeight:900, color:"#a3e635", letterSpacing:0.5 }}>MODO DEMONSTRAÇÃO</div>
            <div style={{ fontSize:10, color:"#84cc16", lineHeight:1.4 }}>O fórum está isolado. Nenhuma ação afeta os dados reais.</div>
          </div>
        </div>
      )}

      {/* ── CONTEÚDO ───────────────────────────────────────────────────── */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:90, ...(previewMode ? { pointerEvents:"none", userSelect:"none" } : {}) }}>
        {tab === "home"     && <HomeTab     user={user} data={{...allData, features: effectiveFeatures}} setTab={setTab} setDesafiosSubTab={setDesafiosSubTab} setForumCanal={setForumCanal} previewMode={previewMode} />}
        {tab === "desafios" && <DesafiosTab user={user} data={allData} subTab={desafiosSubTab} setSubTab={setDesafiosSubTab} features={effectiveFeatures} />}
        {tab === "forum"    && <ForumTab    user={user} data={allData} forumCollection={user.isDemo ? "forum_demo" : "forum"} initialCanal={forumCanal} />}
        {tab === "pia"      && <PiaTab      user={user} data={allData} />}
        {tab === "perfil"   && <PerfilTab   user={user} data={allData} features={effectiveFeatures} />}
      </div>

      {/* ── NAV BAR ────────────────────────────────────────────────────── */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:420, zIndex:100,
        background: isTeresa ? "rgba(10,8,22,0.97)" : "rgba(7,21,41,0.97)", backdropFilter:"blur(24px)",
        borderTop: isTeresa ? "1px solid rgba(139,92,246,0.14)" : "1px solid rgba(255,255,255,0.06)",
        display:"flex", padding:"12px 0 28px" }}>
        {NAV.map(([id, icon, label]) => {
          const active = tab === id;
          const hasNotif = id === "home" && notifCount > 0;
          const acc = isTeresa ? TERESA_ACC : CYN;
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              flex:1, background:"none", border:"none", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", gap:3,
              color: active ? acc : TXT_MUT,
              transition:"all 0.2s", position:"relative",
            }}>
              {active && (
                <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)",
                  width:28, height:2, borderRadius:2, background:acc,
                  boxShadow:`0 0 8px ${acc}` }}/>
              )}
              <span style={{ fontSize:20, filter: active ? `drop-shadow(0 0 6px ${acc}80)` : "none", transition:"filter 0.2s" }}>
                {icon}
                {hasNotif && (
                  <span style={{ position:"absolute", top:-2, right:-2, width:8, height:8,
                    background:"#f43f5e", borderRadius:"50%", border:"1.5px solid #070b14" }}/>
                )}
              </span>
              <span style={{ fontSize:9, fontWeight: active ? 900 : 700, textTransform:"uppercase", letterSpacing:0.8 }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── POP-UP DE STREAK DE ENTRADAS ───────────────────────────────── */}
      {streakPopup && (
        <div onClick={() => setStreakPopup(null)} style={{
          position:"fixed", inset:0, background:"rgba(4,10,22,0.92)", zIndex:2000,
          display:"flex", alignItems:"center", justifyContent:"center", padding:28,
          animation:"fadeUp 0.25s ease" }}>
          <div onClick={e => e.stopPropagation()} style={{
            maxWidth:340, width:"100%", textAlign:"center", padding:"32px 26px",
            borderRadius:24, background:"linear-gradient(160deg, rgba(24,62,112,0.96), rgba(16,30,58,0.98))",
            border:"1px solid rgba(251,146,60,0.35)",
            boxShadow:"0 12px 48px rgba(0,0,0,0.5), 0 0 40px rgba(251,146,60,0.12)" }}>
            <div style={{ fontSize:64, marginBottom:6 }}>
              {streakPopup.medal ? streakPopup.medal.icon : "🔥"}
            </div>
            <div style={{ fontSize:30, fontWeight:900, color:"#fb923c", lineHeight:1 }}>
              {streakPopup.streak} dias seguidos!
            </div>
            {streakPopup.medal ? (
              <div style={{ marginTop:14 }}>
                <div style={{ fontSize:13, color:"#e2e8f0", fontWeight:700 }}>
                  Ganhaste uma medalha nova:
                </div>
                <div style={{ fontSize:16, fontWeight:900, color:"#fbbf24", marginTop:4 }}>
                  {streakPopup.medal.label}
                </div>
              </div>
            ) : (
              <div style={{ fontSize:14, color:"#cbd5e1", marginTop:12, lineHeight:1.5 }}>
                Continua a entrar todos os dias para não perderes o streak!
              </div>
            )}
            <div style={{ display:"inline-block", marginTop:16, fontSize:15, fontWeight:900,
              color:CYN, background:"rgba(50,199,255,0.12)", border:"1px solid rgba(50,199,255,0.30)",
              borderRadius:20, padding:"6px 18px" }}>
              +{streakPopup.xp} XP ⚡
            </div>
            <button onClick={() => setStreakPopup(null)} style={{
              display:"block", width:"100%", marginTop:22, padding:"12px",
              background:CYN, border:"none", color:"#071529", borderRadius:14,
              fontWeight:900, fontSize:14, cursor:"pointer" }}>
              Boa! 🎉
            </button>
          </div>
        </div>
      )}
    </div>
    </ThemeCtx.Provider>
  );
}
