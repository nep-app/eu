import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection, increment } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, CYN, INP, Btn } from "../../theme.jsx";
import { scoreLabel, getDimDesc, DIMS, nowLabel } from "../../data.js";

export default function AutoAvaliacao({ user, data }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSaved, setLocalSaved] = useState(false);
  const uData = data.userData || {};

  async function submit() {
    if (uData.autoSaved || localSaved || isSubmitting) return;
    setIsSubmitting(true);
    setLocalSaved(true);

    try {
      const date = nowLabel();
      const newHistory = [...(data.history || []), { 
        date, action: `Concluiu a Autoavaliação de Competências`, ts: Date.now(), xp: 30 
      }];

      await setDoc(doc(db, "userData", user.username), { 
        autoSaved: true, autoDate: date, history: newHistory, weekXp: increment(30) 
      }, { merge: true });

      await addDoc(collection(db, "adminNotificacoes"), {
        tipo: "AUTOAVALIACAO", jovem: user.username, data: date, ts: Date.now(), lida: false
      });

      alert("Excelente reflexão! Ganhaste um belo boost de XP. 🏆");
    } catch (e) {
      alert("Erro: " + e.message);
      setLocalSaved(false);
    }
    setIsSubmitting(false);
  }

  return (
    <div>
      {uData.autoSaved || localSaved ? (
        <div style={{ ...CARD, textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
          <div style={{ fontWeight: 900, color: CYN, fontSize: 18 }}>AVALIAÇÃO ENTREGUE!</div>
        </div>
      ) : (
        <>
          <div style={{ ...CARD, background: "rgba(34, 211, 238, 0.05)", border: `1px solid ${CYN}30` }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: CYN }}>Autoavaliação de Competências</div>
          </div>
          {DIMS.map(dim => {
            const val = uData.dScores?.[dim.id] || 5;
            const status = scoreLabel(val);
            return (
              <div key={dim.id} style={CARD}>
                <div style={{ fontWeight: 900, fontSize: 14, color: "#fff" }}>{dim.label}</div>
                <input type="range" min="1" max="10" value={val} 
                  onChange={async (e) => {
                    const nS = { ...(uData.dScores || {}), [dim.id]: Number(e.target.value) };
                    await setDoc(doc(db, "userData", user.username), { dScores: nS }, { merge: true });
                  }} 
                  style={{ width: "100%", accentColor: status[1], marginTop: 15 }} 
                />
                <div style={{ textAlign: "center", margin: "15px 0", color: status[1], fontWeight: 900 }}>{val} — {status[0]}</div>
                <textarea 
                  value={uData.dNotas?.[dim.id] || ""} 
                  onChange={async (e) => {
                    const nN = { ...(uData.dNotas || {}), [dim.id]: e.target.value };
                    await setDoc(doc(db, "userData", user.username), { dNotas: nN }, { merge: true });
                  }}
                  style={{ ...INP, fontSize: 12 }} placeholder="Notas..." rows={2}
                />
              </div>
            );
          })}
          <Btn onClick={submit} disabled={isSubmitting || localSaved}>FINALIZAR E ENVIAR</Btn>
        </>
      )}
    </div>
  );
}
