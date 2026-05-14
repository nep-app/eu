import { useState, useEffect } from "react";
import { onSnapshot, doc, collection } from "firebase/firestore";
import { db } from "./firebase.js";
import { BG, CYN, PRP, TXT_MUT } from "./theme.jsx";
import { getWeekKey } from "./data.js";

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

export default function JovensApp({ user, onLogout }) {
  const [tab, setTab] = useState("home");
  const [allData, setAllData] = useState({
    todos: [], events: [], myNotifs: [], leaderboard: {},
    missions: [], completedMissions: [], history: [],
    userData: {}, medals: []
  });

  useEffect(() => {
    if (!user) return;
    const unsubs = [
      onSnapshot(collection(db, "events"), s => setAllData(p => ({...p, events: s.docs.map(d=>({id:d.id,...d.data()}))}))),
      onSnapshot(collection(db, "todos", user.username, "items"), s => setAllData(p => ({...p, todos: s.docs.map(d=>({id:d.id,...d.data()}))}))),
      onSnapshot(collection(db, "notifications", user.username, "items"), s => setAllData(p => ({...p, myNotifs: s.docs.map(d=>({id:d.id,...d.data()}))}))),
      onSnapshot(doc(db, "config", "weeklyLeaderboard"), s => setAllData(p => ({...p, leaderboard: s.exists() && s.data().week === getWeekKey() ? s.data().scores : {}}))),
      onSnapshot(collection(db, "missions"), s => setAllData(p => ({...p, missions: s.docs.map(d=>({id:d.id,...d.data()}))}))),
      onSnapshot(doc(db, "userData", user.username), s => {
        if (s.exists()) {
          const d = s.data();
          setAllData(p => ({...p, userData: d, history: d.history || [], completedMissions: d.completedMissions || []}));
        }
      }),
      onSnapshot(doc(db, "medals", user.username), s => setAllData(p => ({...p, medals: s.exists() ? s.data().list || [] : []}))),
    ];
    return () => unsubs.forEach(u => u());
  }, [user]);

  const ud = allData.userData;
  const dayStreak = ud.dayStreak || 0;
  const weekXp    = ud.weekXp || 0;
  const notifCount = allData.myNotifs.length;

  return (
    <div style={{ minHeight:"100vh", background:BG, maxWidth:420, margin:"0 auto", display:"flex", flexDirection:"column", fontFamily:"'Inter',system-ui,sans-serif" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ position:"relative", padding:"20px 20px 22px", overflow:"hidden",
        background:`linear-gradient(135deg, ${user.color}22 0%, rgba(56,189,248,0.08) 100%)`,
        borderBottom:"1px solid rgba(255,255,255,0.06)" }}>

        {/* Glow orb de fundo */}
        <div style={{ position:"absolute", top:-40, right:-40, width:140, height:140, borderRadius:"50%",
          background:`radial-gradient(circle, ${user.color}30, transparent 70%)`, pointerEvents:"none" }}/>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>
          {/* Avatar + info */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ position:"relative" }}>
              <div style={{ width:48, height:48, borderRadius:"50%",
                background:`linear-gradient(135deg, ${user.color}, ${user.color}88)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:20, fontWeight:900, color:"#0f172a",
                boxShadow:`0 0 0 3px ${user.color}30, 0 4px 16px ${user.color}30` }}>
                {user.realName[0]}
              </div>
              {dayStreak > 0 && (
                <div style={{ position:"absolute", bottom:-4, right:-4, fontSize:14,
                  animation:"fire-pulse 1.8s ease-in-out infinite" }}>🔥</div>
              )}
            </div>

            <div>
              <div style={{ fontSize:11, color:TXT_MUT, fontWeight:700, letterSpacing:0.5 }}>Olá,</div>
              <div style={{ fontSize:19, fontWeight:900, color:"#f1f5f9", lineHeight:1.2 }}>{user.realName}</div>
              <div style={{ display:"flex", gap:6, marginTop:5, flexWrap:"wrap" }}>
                {dayStreak > 0 && (
                  <div style={{ fontSize:10, background:"rgba(251,146,60,0.15)", border:"1px solid rgba(251,146,60,0.3)",
                    borderRadius:20, padding:"2px 9px", fontWeight:800, color:"#fb923c" }}>
                    🔥 {dayStreak} dia{dayStreak > 1 ? "s" : ""}
                  </div>
                )}
                <div style={{ fontSize:10, background:"rgba(56,189,248,0.12)", border:"1px solid rgba(56,189,248,0.25)",
                  borderRadius:20, padding:"2px 9px", fontWeight:800, color:CYN }}>
                  ⚡ {weekXp} XP
                </div>
              </div>
            </div>
          </div>

          {/* Botão sair */}
          <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
            color:TXT_MUT, padding:"7px 16px", borderRadius:20, fontSize:11, cursor:"pointer", fontWeight:700,
            transition:"all 0.2s" }}>
            Sair
          </button>
        </div>
      </div>

      {/* ── CONTEÚDO ───────────────────────────────────────────────────── */}
      <div style={{ flex:1, overflowY:"auto", paddingBottom:90 }}>
        {tab === "home"     && <HomeTab     user={user} data={allData} setTab={setTab} />}
        {tab === "desafios" && <DesafiosTab user={user} data={allData} />}
        {tab === "forum"    && <ForumTab    user={user} />}
        {tab === "pia"      && <PiaTab      user={user} data={allData} />}
        {tab === "perfil"   && <PerfilTab   user={user} data={allData} />}
      </div>

      {/* ── NAV BAR ────────────────────────────────────────────────────── */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:420, zIndex:100,
        background:"rgba(7,11,20,0.92)", backdropFilter:"blur(20px)",
        borderTop:"1px solid rgba(255,255,255,0.06)",
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
