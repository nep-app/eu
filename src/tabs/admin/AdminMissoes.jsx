import React, { useState } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, GRN, INP, Btn } from "../../theme.jsx";
import { getWeekKey, fmtDate, nowFull, ALLOWED_USERNAMES, JEEP_LIST } from "../../data.js";
import Agendador from "./Agendador.jsx";

const JOVENS_MISSAO = JEEP_LIST.filter(j => !["ricardo","demo"].includes(j.username));

export default function AdminMissoes({ missions, allShared = {} }) {
  const [adminMissionTxt, setAdminMissionTxt] = useState("");
  const [adminMissionXp,  setAdminMissionXp]  = useState(10);
  const [adminMissionPrazo, setAdminMissionPrazo] = useState("");
  const [pushMissao, setPushMissao] = useState(false);

  async function encerrarMissao(m) {
    await updateDoc(doc(db, "missions", m.id), { encerrada: !m.encerrada });
  }

  async function addAdminMission() {
    if (!adminMissionTxt.trim()) return;
    await addDoc(collection(db, "missions"), {
      text: adminMissionTxt,
      xp: adminMissionXp,
      week: getWeekKey(),
      prazo: adminMissionPrazo || null,
    });
    // Avisar os jovens (com push opcional).
    await Promise.all(ALLOWED_USERNAMES.map(u =>
      addDoc(collection(db, "notifications", u, "items"), {
        from: "teresa", text: `🎯 Nova missão: ${adminMissionTxt.trim()} (+${adminMissionXp} XP)`,
        date: nowFull(), read: false, ts: Date.now(), push: pushMissao,
      })
    ));
    setAdminMissionTxt(""); setAdminMissionPrazo(""); setPushMissao(false);
    alert("Missão lançada!");
  }

  async function deleteAdminMission(id) {
    if (window.confirm("Apagar missão?")) await deleteDoc(doc(db, "missions", id));
  }

  return (
    <div>
      <div style={CARD}>
        <div style={SL}>Lançar Missão Especial</div>
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
        <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#94a3b8", cursor:"pointer", marginBottom:12 }}>
          <input type="checkbox" checked={pushMissao} onChange={() => setPushMissao(v => !v)}
            style={{ accentColor:CYN, width:14, height:14 }} />
          🔔 Enviar também como notificação push
        </label>
        <Agendador
          tipo="missao"
          rotuloJa="Lançar Missão Especial 🎯"
          publicarJa={addAdminMission}
          construirPayload={() => {
            if (!adminMissionTxt.trim()) { alert("Escreve a descrição da missão."); return null; }
            return { text: adminMissionTxt.trim(), xp: adminMissionXp, prazo: adminMissionPrazo || null, push: pushMissao };
          }}
          rotuloItem={p => `🎯 ${p.text} (${p.xp} XP)`}
          onAgendado={() => { setAdminMissionTxt(""); setAdminMissionPrazo(""); setPushMissao(false); }}
        />
      </div>

      {missions.filter(m => m.week === getWeekKey()).map(m => {
        const feitas = JOVENS_MISSAO.filter(j => (allShared[j.username]?.completedMissions || []).includes(m.id));
        return (
          <div key={m.id} style={CARD}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:800 }}>
                  {m.text}
                  {m.encerrada && <span style={{ fontSize:10, fontWeight:800, color:"#94a3b8", background:"rgba(255,255,255,0.08)", borderRadius:8, padding:"2px 7px", marginLeft:8 }}>ENCERRADA</span>}
                </div>
                <div style={{ fontSize:11, color:CYN, fontWeight:900, marginTop:2 }}>
                  {m.xp} XP
                  {m.prazo && <span style={{ color:"#fbbf24", marginLeft:8 }}>· Prazo: {fmtDate(m.prazo)}</span>}
                </div>
              </div>
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <button onClick={() => encerrarMissao(m)} title={m.encerrada ? "Reabrir" : "Encerrar"} style={{
                  background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
                  color: m.encerrada ? GRN : "#94a3b8", borderRadius:8, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:700,
                }}>{m.encerrada ? "Reabrir" : "Encerrar"}</button>
                <button onClick={() => deleteAdminMission(m.id)}
                  style={{ background:"rgba(244,63,94,0.1)", border:"none", color:"#fb7185", cursor:"pointer", fontSize:14, borderRadius:8, padding:"4px 8px" }}>✕</button>
              </div>
            </div>

            {/* Quem já fez */}
            <div style={{ marginTop:10, borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:10 }}>
              <div style={{ fontSize:11, fontWeight:800, color: feitas.length ? GRN : "#64748b", marginBottom: feitas.length ? 6 : 0 }}>
                ✅ Fizeram: {feitas.length}/{JOVENS_MISSAO.length}
              </div>
              {feitas.map(j => {
                const nota = (allShared[j.username]?.missionNotes || {})[m.id];
                return (
                  <div key={j.username} style={{ fontSize:12, color:"#e2e8f0", padding:"3px 0" }}>
                    <span style={{ fontWeight:700, color:j.color }}>{j.name}</span>
                    {nota && <span style={{ color:"#94a3b8", fontStyle:"italic" }}> — "{nota}"</span>}
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
