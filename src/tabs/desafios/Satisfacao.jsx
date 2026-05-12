import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, PNK, INP, Btn } from "../../theme.jsx";
import { SURVEY_CATS, SEMOJIS, nowLabel } from "../../data.js";

export default function Satisfacao({ user, data }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSaved, setLocalSaved] = useState(false);
  const uData = data.userData || {};

  async function submit() {
    if (uData.sSaved || localSaved || isSubmitting) return;
    setIsSubmitting(true);
    try {
      setLocalSaved(true);
      await setDoc(doc(db, "userData", user.username), { sSaved: true, sDate: nowLabel() }, { merge: true });
      await addDoc(collection(db, "adminNotificacoes"), {
        tipo: "SATISFACAO_ANONIMA", jovem: "Anónimo", data: nowLabel(), ts: Date.now(), lida: false
      });
      alert("Feedback recebido! Ganhaste um belo boost de XP. 🏆");
    } catch (e) { setLocalSaved(false); }
    setIsSubmitting(false);
  }

  return (
    <div>
      {uData.sSaved || localSaved ? (
        <div style={{ ...CARD, textAlign: "center", padding: "40px 20px" }}>💖 FEEDBACK ENVIADO!</div>
      ) : (
        <>
          {SURVEY_CATS.map(cat => (
            <div key={cat.id} style={CARD}>
              <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 12 }}>{cat.q}</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} 
                    onClick={async () => {
                      const nR = { ...(uData.sRatings || {}), [cat.id]: n };
                      await setDoc(doc(db, "userData", user.username), { sRatings: nR }, { merge: true });
                    }}
                    style={{ fontSize: 30, opacity: uData.sRatings?.[cat.id] === n ? 1 : 0.2, background: "none", border: "none" }}
                  >{SEMOJIS[n]}</button>
                ))}
              </div>
            </div>
          ))}
          <div style={CARD}>
            <textarea value={uData.sMudaria || ""} onChange={async (e) => await setDoc(doc(db, "userData", user.username), { sMudaria: e.target.value }, { merge: true })} style={INP} rows={3} placeholder="Melhorias..." />
            <Btn color={PNK} onClick={submit} disabled={isSubmitting || localSaved}>SUBMETER</Btn>
          </div>
        </>
      )}
    </div>
  );
}
