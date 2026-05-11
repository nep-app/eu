import { useState, useEffect } from "react";
import { onSnapshot, doc, collection } from "firebase/firestore";
import { db } from "./firebase.js";
import { BG, CYN } from "./theme.jsx";
import { getWeekKey, USERS, JEEP_LIST, upd } from "./data.js";

// Importamos as abas que vamos criar a seguir
import HomeTab from "./tabs/HomeTab.jsx";
import DesafiosTab from "./tabs/DesafiosTab.jsx";
import ForumTab from "./tabs/ForumTab.jsx";
import PiaTab from "./tabs/PiaTab.jsx";
import PerfilTab from "./tabs/PerfilTab.jsx";

export default function JovensApp({ user, onLogout }) {
  const [tab, setTab] = useState("home");
  const [allData, setAllData] = useState({
    todos: [], events: [], myNotifs: [], leaderboard: {}, 
    missions: [], completedMissions: [], history: [], 
    userData: {}, medals: []
  });

  // ── Sincronização em Tempo Real de TUDO ──
  useEffect(() => {
    if (!user) return;
    const unsubs = [
      onSnapshot(collection(db, "events"), s => setAllData(p => ({...p, events: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
      onSnapshot(collection(db, "todos", user.username, "items"), s => setAllData(p => ({...p, todos: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
      onSnapshot(collection(db, "notifications", user.username, "items"), s => setAllData(p => ({...p, myNotifs: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
      onSnapshot(doc(db, "config", "weeklyLeaderboard"), s => setAllData(p => ({...p, leaderboard: s.exists() && s.data().week === getWeekKey() ? s.data().scores : {}}))),
      onSnapshot(collection(db, "missions"), s => setAllData(p => ({...p, missions: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
      onSnapshot(doc(db, "userData", user.username), s => {
        if(s.exists()) {
          const d = s.data();
          setAllData(p => ({...p, userData: d, history: d.history || [], completedMissions: d.completedMissions || []}));
        }
      }),
      onSnapshot(doc(db, "medals", user.username), s => setAllData(p => ({...p, medals: s.exists() ? s.data().list || [] : []})))
    ];
    return () => unsubs.forEach(u => u());
  }, [user]);

  return (
    <div style={{ minHeight:"100vh", background:BG, color:"white", maxWidth:420, margin:"0 auto", display:"flex", flexDirection:"column" }}>
      {/* HEADER */}
      <div style={{ background:`linear-gradient(135deg, ${user.color}, #0ea5e9)`, padding:"14px 20px 18px", color:"#0f172a", borderBottom:"1px solid rgba(255,255,255,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(0,0,0,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, border:"2px solid rgba(255,255,255,0.4)" }}>{user.realName[0]}</div>
            <div>
              <div style={{ fontSize:18, fontWeight:900 }}>{user.realName}</div>
              <div style={{ fontSize:10, background:"rgba(0,0,0,0.2)", borderRadius:20, padding:"2px 8px", fontWeight:800, color:"white", marginTop:4, display:"inline-block" }}>
                ⚡ {allData.userData.weekXp || 0} XP ESTA SEMANA
              </div>
            </div>
          </div>
          <button onClick={onLogout} style={{ background:"rgba(0,0,0,0.15)", border:"1px solid rgba(255,255,255,0.3)", color:"#0f172a", padding:"6px 14px", borderRadius:20, fontSize:11, cursor:"pointer", fontWeight:800 }}>SAIR</button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", paddingBottom:90 }}>
        {tab === "home" && <HomeTab user={user} data={allData} setTab={setTab} />}
        {tab === "desafios" && <DesafiosTab user={user} data={allData} />}
        {tab === "forum" && <ForumTab user={user} />}
        {tab === "pia" && <PiaTab user={user} data={allData} />}
        {tab === "perfil" && <PerfilTab user={user} data={allData} />}
      </div>

      {/* NAV */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:420, background:"rgba(15, 23, 42, 0.95)", backdropFilter:"blur(10px)", borderTop:"1px solid rgba(255,255,255,0.1)", display:"flex", padding:"10px 0 30px", zIndex:100 }}>
        {[["home","🏠","Início"],["desafios","⚡","Desafios"],["forum","🌐","Fórum"],["pia","🚀","PIA"],["perfil","👤","Perfil"]].map(t => (
          <button key={t[0]} onClick={()=>setTab(t[0])} style={{ flex:1, background:"none", border:"none", color:tab===t[0]?CYN:"#94a3b8", display:"flex", flexDirection:"column", alignItems:"center", gap:4, opacity:tab===t[0]?1:0.5 }}>
            <span style={{ fontSize:22 }}>{t[1]}</span>
            <span style={{ fontSize:9, fontWeight:900, textTransform:"uppercase" }}>{t[2]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
