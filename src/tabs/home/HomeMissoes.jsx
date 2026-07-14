import React, { useState, useContext } from 'react';
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, INP, GRN, Linkify } from "../../theme.jsx";
import { nowFull, getWeekKey, fmtDate, isOverdue } from "../../data.js";
import { ThemeCtx } from "../../JovensApp.jsx";

// Missão Especial — aparece no topo do Início dos jovens.
export default function HomeMissoes({ user, data }) {
  const light = useContext(ThemeCtx);
  const [missaoAberta, setMissaoAberta] = useState(null);
  const [notaMissao, setNotaMissao]     = useState("");

  const uData             = data.userData || {};
  const listaMissoes      = data.missions || [];
  const missoesConcluidas = data.completedMissions || [];
  const missoesSemana     = listaMissoes.filter(m => m.week === getWeekKey());
  const missoesDone       = missoesSemana.filter(m => missoesConcluidas.includes(m.id)).length;

  function getDayStreakUpdate() {
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (uData.lastActiveDay === today) return {};
    const newStreak = uData.lastActiveDay === yesterday ? (uData.dayStreak || 0) + 1 : 1;
    return { dayStreak: newStreak, lastActiveDay: today };
  }

  async function concluirMissao(missao, nota = "") {
    if (missoesConcluidas.includes(missao.id)) return;
    const ts = nowFull();
    const newHistory = [...(data.history || []), { date: ts, action: `Cumpriu a missão: ${missao.text}`, ts: Date.now(), xp: missao.xp || 10 }];
    await setDoc(doc(db, "userData", user.username), {
      completedMissions: [...missoesConcluidas, missao.id],
      missionNotes: { ...(uData.missionNotes || {}), [missao.id]: nota || "" },
      history: newHistory,
      weekXp: (uData.weekXp || 0) + (missao.xp || 10),
      ...getDayStreakUpdate()
    }, { merge: true });
    // Avisar a Teresa de que a missão foi cumprida (com nota, se houver).
    await addDoc(collection(db, "adminNotificacoes"), {
      tipo: "MISSAO", jovem: user.username,
      texto: (missao.text || "").substring(0, 80),
      nota: nota ? nota.substring(0, 200) : null,
      ts: Date.now(), lida: false,
    });
    setMissaoAberta(null); setNotaMissao("");
    alert("Missão concluída! ✨");
  }

  if (missoesSemana.length === 0) return null;

  return (
    <div style={CARD}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={SL}>🎯 Missão Especial</div>
        <div style={{ fontSize:11, fontWeight:800, color: missoesDone === missoesSemana.length ? GRN : CYN }}>
          {missoesDone}/{missoesSemana.length}
        </div>
      </div>
      <div style={{ height:3, background: light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.06)", borderRadius:3, marginBottom:16, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${(missoesDone/missoesSemana.length)*100}%`, background:`linear-gradient(90deg,${CYN},${GRN})`, transition:"width 0.5s ease", borderRadius:3 }}/>
      </div>
      {missoesSemana.map(missao => {
        const concluida = missoesConcluidas.includes(missao.id);
        const aberta = missaoAberta === missao.id;
        return (
          <div key={missao.id} style={{
            padding:"14px 16px", borderRadius:16,
            background: concluida ? (light ? "rgba(74,222,128,0.10)" : "rgba(74,222,128,0.06)") : (light ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)"),
            marginBottom:8, border: concluida ? "1px solid rgba(74,222,128,0.25)" : (light ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(255,255,255,0.05)"),
            transition:"all 0.2s",
          }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
              {concluida && (
                <div style={{ width:22, height:22, borderRadius:7, flexShrink:0, background:GRN, display:"flex", alignItems:"center", justifyContent:"center", marginTop:1 }}>
                  <span style={{ color:"#070b14", fontWeight:900, fontSize:12 }}>✓</span>
                </div>
              )}
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600,
                  color: concluida ? "#64748b" : (light ? "#0f172a" : "#f1f5f9"),
                  textDecoration: concluida ? "line-through" : "none" }}>
                  <Linkify>{missao.text}</Linkify>
                </div>
                {missao.prazo && !concluida && (
                  <div style={{ fontSize:10, fontWeight:800, marginTop:3,
                    color: isOverdue(missao.prazo) ? "#f43f5e" : "#fbbf24" }}>
                    ⏰ {isOverdue(missao.prazo) ? "Prazo expirado" : `Até ${fmtDate(missao.prazo)}`}
                  </div>
                )}
                {concluida && (uData.missionNotes || {})[missao.id] && (
                  <div style={{ fontSize:11, color:"#94a3b8", fontStyle:"italic", marginTop:3 }}>"{(uData.missionNotes || {})[missao.id]}"</div>
                )}
              </div>
            </div>

            {!concluida && !aberta && (
              <button onClick={() => { setMissaoAberta(missao.id); setNotaMissao(""); }} style={{
                width:"100%", marginTop:10, padding:"10px", borderRadius:10, border:`1px solid ${GRN}55`,
                background:"rgba(74,222,128,0.08)", color:GRN, fontWeight:800, fontSize:12, cursor:"pointer" }}>
                ✓ Marcar como feita
              </button>
            )}

            {!concluida && aberta && (
              <div style={{ marginTop:10 }}>
                <textarea value={notaMissao} onChange={e => setNotaMissao(e.target.value)}
                  placeholder="Queres dizer como correu? (opcional)" rows={2}
                  style={{ ...INP, resize:"none", marginBottom:8, fontSize:13 }} />
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { setMissaoAberta(null); setNotaMissao(""); }} style={{
                    flex:1, padding:"10px", borderRadius:10, border:"1px solid rgba(255,255,255,0.15)",
                    background:"transparent", color:"#94a3b8", fontWeight:800, fontSize:12, cursor:"pointer" }}>
                    Cancelar
                  </button>
                  <button onClick={() => concluirMissao(missao, notaMissao.trim())} style={{
                    flex:2, padding:"10px", borderRadius:10, border:"none",
                    background:GRN, color:"#070b14", fontWeight:900, fontSize:12, cursor:"pointer" }}>
                    Confirmar missão feita
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
