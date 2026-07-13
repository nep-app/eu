import React, { useState } from 'react';
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, INP, Btn } from "../../theme.jsx";
import { getWeekKey, fmtDate } from "../../data.js";
import Agendador from "./Agendador.jsx";

export default function AdminMissoes({ missions }) {
  const [adminMissionTxt, setAdminMissionTxt] = useState("");
  const [adminMissionXp,  setAdminMissionXp]  = useState(10);
  const [adminMissionPrazo, setAdminMissionPrazo] = useState("");

  async function addAdminMission() {
    if (!adminMissionTxt.trim()) return;
    await addDoc(collection(db, "missions"), {
      text: adminMissionTxt,
      xp: adminMissionXp,
      week: getWeekKey(),
      prazo: adminMissionPrazo || null,
    });
    setAdminMissionTxt(""); setAdminMissionPrazo("");
    alert("Missão lançada!");
  }

  async function deleteAdminMission(id) {
    if (window.confirm("Apagar missão?")) await deleteDoc(doc(db, "missions", id));
  }

  return (
    <div>
      <div style={CARD}>
        <div style={SL}>Lançar Missão Semanal</div>
        <input value={adminMissionTxt} onChange={e => setAdminMissionTxt(e.target.value)}
          placeholder="Descrição da missão..." style={INP} />
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10, color:CYN, fontWeight:800, marginBottom:4 }}>XP</div>
            <input type="number" value={adminMissionXp} onChange={e => setAdminMissionXp(Number(e.target.value))}
              style={{ ...INP, marginBottom:0 }} />
          </div>
          <div style={{ flex:2 }}>
            <div style={{ fontSize:10, color:CYN, fontWeight:800, marginBottom:4 }}>Prazo (opcional)</div>
            <input type="date" value={adminMissionPrazo} onChange={e => setAdminMissionPrazo(e.target.value)}
              style={{ ...INP, marginBottom:0 }} />
          </div>
        </div>
        <Agendador
          tipo="missao"
          rotuloJa="Lançar Missão 🎯"
          publicarJa={addAdminMission}
          construirPayload={() => {
            if (!adminMissionTxt.trim()) { alert("Escreve a descrição da missão."); return null; }
            return { text: adminMissionTxt.trim(), xp: adminMissionXp, prazo: adminMissionPrazo || null };
          }}
          rotuloItem={p => `🎯 ${p.text} (${p.xp} XP)`}
          onAgendado={() => { setAdminMissionTxt(""); setAdminMissionPrazo(""); }}
        />
      </div>

      {missions.filter(m => m.week === getWeekKey()).map(m => (
        <div key={m.id} style={{ ...CARD, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontWeight:800 }}>{m.text}</div>
            <div style={{ fontSize:11, color:CYN, fontWeight:900, marginTop:2 }}>
              {m.xp} XP
              {m.prazo && <span style={{ color:"#fbbf24", marginLeft:8 }}>· Prazo: {fmtDate(m.prazo)}</span>}
            </div>
          </div>
          <button onClick={() => deleteAdminMission(m.id)}
            style={{ background:"none", border:"none", color:"#fb7185", cursor:"pointer", fontSize:18 }}>✕</button>
        </div>
      ))}
    </div>
  );
}
