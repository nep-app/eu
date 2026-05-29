import { useState, useEffect } from "react";
import { onSnapshot, doc, collection } from "firebase/firestore";
import { db } from "./firebase.js";
import { BG, CYN, BLUE, PRP, TXT_MUT } from "./theme.jsx";
import logoImg from "./logo.png";

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

const LIGHT_BG = "#110d2e";

export default function JovensApp({ user, onLogout }) {
  const light = user.username === "teresa";
  const [tab, setTab] = useState("home");
  const [desafiosSubTab, setDesafiosSubTab] = useState("pergunta");
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

  // Tema roxo para teresa — muda body bg + grid
  useEffect(() => {
    if (!light) return;
    document.body.style.backgroundColor = LIGHT_BG;
    document.body.style.backgroundImage = `
      linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)
    `;
    return () => {
      document.body.style.backgroundColor = "#071529";
      document.body.style.backgroundImage = `
        linear-gradient(rgba(50,199,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(50,199,255,0.04) 1px, transparent 1px)
      `;
    };
  }, [light]);

  const ud = allData.userData;
  const dayStreak = ud.dayStreak || 0;
  const weekStartTs = allData.weekStartTs || 0;
  const weekXp = weekStartTs > 0
    ? (allData.history || []).filter(h => (h.ts || 0) >= weekStartTs && (h.xp || 0) > 0).reduce((s, h) => s + (h.xp || 0), 0)
    : (ud.weekXp || 0);
  const notifCount = allData.myNotifs.length;

  // Merge global feature flags with per-user overrides (override wins when set)
  const globalFeatures   = allData.features || {};
  const featureOverrides = ud.featureOverrides || {};
  const effectiveFeatures = Object.fromEntries(
    ["perguntaSemanal","autoAvaliacao","satisfacao","rodaVida"].map(k => [
      k, featureOverrides[k] !== undefined ? featureOverrides[k] : (globalFeatures[k] || false)
    ])
  );

  return (
    <div style={{ minHeight:"100vh", background: light ? LIGHT_BG : BG, maxWidth:420, margin:"0 auto", display:"flex", flexDirection:"column", fontFamily:"'Inter',system-ui,sans-serif" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ position:"relative", padding:"18px 20px 16px", overflow:"hidden",
        background: light
          ? "linear-gradient(160deg, rgba(60,20,120,0.90) 0%, rgba(40,10,90,0.88) 100%)"
          : "linear-gradient(160deg, rgba(24,62,112,0.88) 0%, rgba(16,44,84,0.84) 100%)",
        borderBottom: light ? "1px solid rgba(139,92,246,0.20)" : "1px solid rgba(50,199,255,0.12)" }}>

        <div style={{ position:"absolute", top:-40, left:-20, width:160, height:160, borderRadius:"50%",
          background:`radial-gradient(circle, ${user.color}14, transparent 70%)`, pointerEvents:"none" }}/>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>
          {/* Left: greeting + badges */}
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

          {/* Right: logo + Sair */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, flexShrink:0 }}>
            <img src={logoImg} alt="JEEP" style={{ width:68, height:68, objectFit:"contain", opacity:0.95 }} />
            <button onClick={onLogout} style={{ background:"none", border:"none",
              color:"#5a7a9a", fontSize:10, cursor:"pointer", fontWeight:600, padding:0, letterSpacing:0.2 }}>
              Sair →
            </button>
          </div>
        </div>
      </div>

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
      <div style={{ flex:1, overflowY:"auto", paddingBottom:90 }}>
        {tab === "home"     && <HomeTab     user={user} data={{...allData, features: effectiveFeatures}} setTab={setTab} setDesafiosSubTab={setDesafiosSubTab} />}
        {tab === "desafios" && <DesafiosTab user={user} data={allData} subTab={desafiosSubTab} setSubTab={setDesafiosSubTab} features={effectiveFeatures} />}
        {tab === "forum"    && <ForumTab    user={user} forumCollection={user.isDemo ? "forum_demo" : "forum"} />}
        {tab === "pia"      && <PiaTab      user={user} data={allData} />}
        {tab === "perfil"   && <PerfilTab   user={user} data={allData} features={effectiveFeatures} />}
      </div>

      {/* ── NAV BAR ────────────────────────────────────────────────────── */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:420, zIndex:100,
        background: light ? "rgba(25,10,60,0.97)" : "rgba(7,21,41,0.97)", backdropFilter:"blur(24px)",
        borderTop: light ? "1px solid rgba(139,92,246,0.18)" : "1px solid rgba(255,255,255,0.06)",
        display:"flex", padding:"12px 0 28px" }}>
        {NAV.map(([id, icon, label]) => {
          const active = tab === id;
          const hasNotif = id === "home" && notifCount > 0;
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              flex:1, background:"none", border:"none", cursor:"pointer",
              display:"flex", flexDirection:"column", alignItems:"center", gap:3,
              color: active ? CYN : TXT_MUT,
              transition:"all 0.2s", position:"relative",
            }}>
              {/* Indicador activo */}
              {active && (
                <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)",
                  width:28, height:2, borderRadius:2, background:CYN,
                  boxShadow:`0 0 8px ${CYN}` }}/>
              )}
              <span style={{ fontSize:20, filter: active ? `drop-shadow(0 0 6px ${CYN}80)` : "none", transition:"filter 0.2s" }}>
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
    </div>
  );
}
