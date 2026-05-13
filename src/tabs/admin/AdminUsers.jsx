import React from 'react';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, CYN } from "../../theme.jsx";
import { JEEP_LIST, ALL_MEDALS, upd, nowLabel } from "../../data.js";

export default function AdminUsers({ amMedals, setAmMedals }) {
  
  async function toggleAMedal(jn, mid) {
    const j = JEEP_LIST.find(x=>x.name===jn); if(!j) return;
    const cur = amMedals[jn]||[];
    const isAdding = !cur.includes(mid);
    
    const next = isAdding ? [...cur, mid] : cur.filter(m=>m!==mid);
    setAmMedals(p=>upd(p,jn,next)); 
    await setDoc(doc(db,"medals",j.username),{list:next});

    if (isAdding) {
      const userRef = doc(db, "userData", j.username);
      const userSnap = await getDoc(userRef);
      const uData = userSnap.exists() ? userSnap.data() : {};
      
      const newHistory = [...(uData.history || []), { date: nowLabel(), action: `Conquistaste uma nova Medalha! 🏅`, ts: Date.now(), xp: 50 }];
      await setDoc(userRef, { history: newHistory, weekXp: (uData.weekXp || 0) + 50 }, { merge: true });
    }
  }

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:15 }}>
      {JEEP_LIST.map(j => {
        const medals = amMedals[j.name] || [];
        return (
          <div key={j.username} style={CARD}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <div style={{ width:12, height:12, borderRadius:"50%", background:j.color }}/>
              <div style={{ fontWeight:800 }}>{j.name}</div>
            </div>
            <div style={{ fontSize:11, color:"#94a3b8", marginBottom:12 }}>Medalhas Conquistadas:</div>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {ALL_MEDALS.map(m => {
                const has = medals.includes(m.id);
                return (
                  <div key={m.id} onClick={() => toggleAMedal(j.name, m.id)} style={{ 
                    width:35, height:35, borderRadius:10, background:has?CYN:"rgba(255,255,255,0.05)", 
                    display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
                    opacity:has?1:0.3, transition:"0.2s"
                  }}>
                    {m.icon}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
