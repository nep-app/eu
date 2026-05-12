import React from 'react';
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN } from "../../theme.jsx";
import { QUIZZES, nowLabel } from "../../data.js";

export default function QuizCenarios({ user, data }) {
  const uData = data.userData || {};

  async function handleQuiz(qId, optId) {
    const nA = { ...(uData.qAnswers || {}), [qId]: optId };
    const newHistory = [...(data.history || []), { 
      date: nowLabel(), action: `Completou um Cenário JEEP`, ts: Date.now(), xp: 15 
    }];
    await setDoc(doc(db, "userData", user.username), { 
      qAnswers: nA, history: newHistory, weekXp: (uData.weekXp || 0) + 15 
    }, { merge: true });
  }

  return (
    <div style={CARD}>
      <div style={SL}>Cenários JEEP</div>
      {QUIZZES.map((q) => {
        const hasAns = uData.qAnswers?.[q.id];
        return (
          <div key={q.id} style={{ marginBottom: 32, borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: CYN, marginBottom: 10 }}>{q.title}</div>
            {!hasAns ? (
              q.opts.map(opt => (
                <button key={opt.id} onClick={() => handleQuiz(q.id, opt.id)} style={{ width: "100%", textAlign: "left", padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.05)", color: "#fff", marginBottom: 10 }}>
                  <strong style={{ color: CYN }}>{opt.id}</strong> {opt.text}
                </button>
              ))
            ) : (
              <div style={{ background: "rgba(34, 211, 238, 0.1)", padding: "18px", borderRadius: 20 }}>
                {q.opts.find(o => o.id === hasAns)?.reveal}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
