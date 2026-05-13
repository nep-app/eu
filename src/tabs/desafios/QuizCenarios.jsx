import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, Btn } from "../../theme.jsx";
import { nowLabel } from "../../data.js";

export default function QuizCenarios({ user, data }) {
  const [quizzes, setQuizzes] = useState([]);
  const [respondido, setRespondido] = useState(false);

  useEffect(() => {
    return onSnapshot(collection(db, "quizzes"), (snap) => {
      setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  async function responder(xpGanhos) {
    await updateDoc(doc(db, "userData", user.username), {
      weekXp: increment(xpGanhos),
      history: arrayUnion({ date: nowLabel(), action: "Completou um Quiz", xp: xpGanhos, ts: Date.now() })
    });
    setRespondido(true);
  }

  if (respondido) return <div style={CARD}>✅ Quiz concluído!</div>;
  if (quizzes.length === 0) return <div style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>Sem quizzes novos.</div>;

  const q = quizzes[0]; // Mostra o primeiro da lista

  return (
    <div style={CARD}>
      <div style={SL}>🧠 {q.title} (+{q.xp} XP)</div>
      <div style={{ marginBottom: 20, fontSize: 15, lineHeight: 1.5 }}>{q.scenario}</div>
      
      {q.options.map(opt => (
        <button key={opt.id} onClick={() => responder(opt.isCorrect ? q.xp : 0)} style={{ 
          display: "block", width: "100%", padding: 15, borderRadius: 12, 
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff", marginBottom: 10, textAlign: "left", cursor: "pointer"
        }}>
          {opt.text}
        </button>
      ))}
    </div>
  );
}
