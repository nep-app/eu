import React, { useState } from 'react';
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, INP, Btn } from "../../theme.jsx";
import { getWeekKey } from "../../data.js";

export default function AdminMissoes({ missions }) {
  const [adminMissionTxt, setAdminMissionTxt] = useState("");
  const [adminMissionXp, setAdminMissionXp] = useState(10);

  async function addAdminMission() {
    if(!adminMissionTxt.trim()) return;
    await addDoc(collection(db, "missions"), { text:adminMissionTxt, xp:adminMissionXp, week:getWeekKey() });
    setAdminMissionTxt("");
    alert("Missão lançada!");
  }

  async function deleteAdminMission(id) { 
    if(window.confirm("Apagar missão?")) await deleteDoc(doc(db, "missions", id)); 
  }

  return (
    <div>
      <div style={CARD}>
        <div style={SL}>Lançar Missão Semanal</div>
        <input value={adminMissionTxt} onChange={e=>setAdminMissionTxt(e.target.value)} placeholder="Descrição da missão..." style={INP}/>
        <input type="number" value={adminMissionXp} onChange={e=>setAdminMissionXp(Number(e.target.value))} style={INP}/>
        <Btn onClick={addAdminMission}>Lançar Missão 🎯</Btn>
      </div>
      {missions.filter(m => m.week === getWeekKey()).map(m => (
        <div key={m.id} style={{ ...CARD, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:800 }}>{m.text}</div>
            <div style={{ fontSize:11, color:CYN, fontWeight:900 }}>{m.xp} XP</div>
          </div>
          <button onClick={()=>deleteAdminMission(m.id)} style={{ background:"none", border:"none", color:"#fb7185", cursor:"pointer", fontSize:18 }}>✕</button>
        </div>
      ))}
    </div>
  );
}
