import React, { useState, useEffect } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "./firebase.js";
import { BG, CYN } from "./theme.jsx";
import HomeTab from "./tabs/HomeTab.jsx";
import DesafiosTab from "./tabs/DesafiosTab.jsx";
// ... (Importaríamos as outras Tabs)

export default function JovensApp({ user, onLogout }) {
  const [tab, setTab] = useState("home");
  const [data, setData] = useState({ todos:[], events:[], myNotifs:[], leaderboard:{}, dScores:{} });

  useEffect(() => {
    if (!user) return;
    const unsubs = [
      onSnapshot(collection(db, "todos", user.username, "items"), s => setData(p => ({...p, todos: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
      onSnapshot(collection(db, "events"), s => setData(p => ({...p, events: s.docs.map(d=>({id:d.id, ...d.data()}))}))),
      onSnapshot(doc(db, "config", "weeklyLeaderboard"), s => setData(p => ({...p, leaderboard: s.exists() ? s.data().scores : {}})))
    ];
    return () => unsubs.forEach(u => u());
  }, [user]);

  return (
    <div style={{ minHeight:"100vh", background:BG, color:"white", maxWidth:420, margin:"0 auto" }}>
      {tab === "home" && <HomeTab user={user} {...data} setTab={setTab} />}
      {tab === "desafios" && <DesafiosTab user={user} {...data} />}
      
      {/* Bottom Nav */}
      <div style={{ position:"fixed", bottom:0, width:"100%", maxWidth:420, display:"flex", background:"rgba(0,0,0,0.9)", padding:"10px 0 30px" }}>
        {["home", "desafios", "forum", "pia", "perfil"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ flex:1, color: tab===t ? CYN : "#64748b", background:"none", border:"none" }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
