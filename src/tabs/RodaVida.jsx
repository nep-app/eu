import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../firebase.js";
import { CARD, SL, CYN, PNK, Btn, RadarChart } from "../theme.jsx";
import { nowLabel, nowFull, RODA_DIMS, DEF_RODA } from "../data.js";

// Roda da Vida — extraída do Perfil para a aba de atividades. Lê/escreve os
// mesmos campos em userData (roda, rodaSaves…), por isso os dados mantêm-se.
export default function RodaVida({ user, data, features = {} }) {
  const [expandedDim, setExpandedDim] = useState(null);
  const uData = data.userData || {};
  const roda = uData.roda || DEF_RODA;
  const rodaSaves = uData.rodaSaves || [];
  const history = data.history || [];
  const light = user.username === "teresa";
  const thm = { card:CARD, sl:SL, text:"#f1f5f9", muted:"#94a3b8", sub:"#64748b" };

  async function saveRoda(share) {
    try {
      const ts = nowFull();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = uData.lastActiveDay === today ? (uData.dayStreak || 1) : (uData.lastActiveDay === yesterday ? (uData.dayStreak || 0) + 1 : 1);
      const streakUpdate = uData.lastActiveDay !== today ? { dayStreak: newStreak, lastActiveDay: today } : {};
      const newSaves = [...rodaSaves, { label: nowLabel(), savedAt: ts, scores: { ...roda } }];
      const newH = [...history, { date: ts, action: `Atualizou Roda da Vida (${share ? "Enviado à Admin" : "Privado"})`, ts: Date.now(), xp: 20 }];
      await setDoc(doc(db, "userData", user.username), {
        roda, rodaSaves: newSaves, rodaShared: share, rodaSavedAt: ts,
        history: newH, weekXp: (uData.weekXp || 0) + 20, ...streakUpdate
      }, { merge: true });
      if (share) {
        await addDoc(collection(db, "adminNotificacoes"), {
          tipo: "RODA", jovem: user.username, ts: Date.now(), lida: false
        });
      }
      alert(share ? "Roda enviada para a Teresa! 🌸" : "Roda guardada no teu histórico.");
    } catch (e) { alert("Erro ao guardar a roda."); }
  }

  const updateRoda = (id, val) => {
    setDoc(doc(db, "userData", user.username), { roda: { ...roda, [id]: val } }, { merge: true });
  };

  // Gravação "anterior" a mostrar tracejada: normalmente a última gravada. Mas se
  // acabaste de gravar (a atual é igual à última), a "anterior" verdadeira é a de
  // antes dessa — senão a linha tracejada sobrepunha-se à cheia e não se via.
  const prevSave = (() => {
    if (!rodaSaves.length) return null;
    const last = rodaSaves[rodaSaves.length - 1];
    const igualUltima = RODA_DIMS.every(d => (roda[d.id] ?? 0) === (last.scores?.[d.id] ?? 0));
    if (igualUltima) return rodaSaves.length >= 2 ? rodaSaves[rodaSaves.length - 2] : null;
    return last;
  })();

  if (!features.rodaVida) return (
    <div style={{ ...thm.card, textAlign:"center", padding:"48px 20px" }}>
      <div style={{ fontSize:48, marginBottom:12 }}>🔐</div>
      <div style={{ fontWeight:900, fontSize:15, color:thm.sub, marginBottom:8 }}>Roda da Vida</div>
      <div style={{ fontSize:13, color:thm.muted, lineHeight:1.6 }}>
        A Teresa ainda não lançou esta secção.<br/>Fica atento!
      </div>
    </div>
  );

  return (
    <div>
      <div style={thm.card}>
        <div style={thm.sl}>A Minha Roda Atual</div>
        <RadarChart scores={roda} color={PNK} prev={prevSave ? prevSave.scores : null} />
        <div style={{ fontSize:10, color:thm.muted, textAlign:"center", marginTop:8, lineHeight:1.5 }}>
          De 0 a 10 — quando a roda fica torta, é porque alguma área precisa de atenção.<br/>
          {prevSave && <span>Linha tracejada = avaliação anterior ({prevSave.label}).</span>}
        </div>
      </div>

      {RODA_DIMS.map(dim => {
        const isOpen = expandedDim === dim.id;
        const val = roda[dim.id];
        const dimCard  = light ? { ...CARD, background:"rgba(255,255,255,0.85)", boxShadow:"0 2px 12px rgba(0,0,0,0.08)" } : thm.card;
        const dimText  = light ? "#1e293b" : thm.text;
        const dimSub   = light ? "#64748b" : thm.sub;
        const dimMuted = light ? "#64748b" : thm.muted;
        return (
          <div key={dim.id} style={{ ...dimCard, padding:"16px 18px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:22 }}>{dim.icon}</span>
                <span style={{ fontWeight:900, fontSize:14, color:dimText }}>{dim.label}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontWeight:900, color:PNK, fontSize:22 }}>{val}</span>
                <button onClick={() => setExpandedDim(isOpen ? null : dim.id)} style={{
                  background:"none", border:"none", cursor:"pointer",
                  fontSize:10, color:dimSub, fontWeight:700, padding:0,
                }}>
                  {isOpen ? "▲ fechar" : "▼ o que é isto?"}
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="fade-up" style={{ marginTop:14 }}>
                <div style={{ fontSize:13, color:dimMuted, lineHeight:1.6, marginBottom:14 }}>{dim.desc}</div>
                <input type="range" min="0" max="10" value={val}
                  onChange={(e) => updateRoda(dim.id, Number(e.target.value))}
                  style={{ width:"100%", accentColor:PNK }}
                />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:dimSub, marginTop:4 }}>
                  <span>0 Muito mal</span>
                  <span>10 Óptimo</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ display:"flex", gap:10, marginTop:4 }}>
        <Btn variant="dark" onClick={() => saveRoda(false)}>💾 Guardar Privado</Btn>
        <Btn color={PNK} onClick={() => saveRoda(true)}>🚀 Enviar à Teresa</Btn>
      </div>
    </div>
  );
}
