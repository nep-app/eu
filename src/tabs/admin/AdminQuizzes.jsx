import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, INP, Btn } from "../../theme.jsx";

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [pergunta, setPergunta] = useState("");
  const [correta, setCorreta] = useState("");
  const [errada, setErrada] = useState("");
  const [xp, setXp] = useState(20);

  useEffect(() => {
    return onSnapshot(collection(db, "quizzes"), (snap) => {
      setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  async function criarQuiz() {
    if (!pergunta || !correta || !errada) return alert("Preenche tudo!");
    await addDoc(collection(db, "quizzes"), {
      title: "Desafio de Cenário",
      scenario: pergunta,
      xp: Number(xp),
      options: [
        { id: "a", text: correta, isCorrect: true, feedback: "Boa! É isso mesmo." },
        { id: "b", text: errada, isCorrect: false, feedback: "Humm, pensa melhor na próxima." }
      ]
    });
    setPergunta(""); setCorreta(""); setErrada("");
  }

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={CARD}>
        <div style={SL}>🆕 Criar Novo Quiz</div>
        <textarea value={pergunta} onChange={e => setPergunta(e.target.value)} style={INP} placeholder="Cenário/Pergunta..." />
        <input value={correta} onChange={e => setCorreta(e.target.value)} style={{ ...INP, border: "1px solid #4ade80" }} placeholder="Resposta CORRETA" />
        <input value={errada} onChange={e => setErrada(e.target.value)} style={{ ...INP, border: "1px solid #f43f5e" }} placeholder="Resposta ERRADA" />
        <input type="number" value={xp} onChange={e => setXp(e.target.value)} style={INP} placeholder="XP" />
        <Btn onClick={criarQuiz}>PUBLICAR QUIZ 🚀</Btn>
      </div>

      <div style={SL}>Quizzes Ativos ({quizzes.length})</div>
      {quizzes.map(q => (
        <div key={q.id} style={{ ...CARD, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13 }}>{q.scenario}</div>
          <button onClick={() => deleteDoc(doc(db, "quizzes", q.id))} style={{ background: "none", border: "none", color: "#f43f5e", cursor: "pointer" }}>🗑️</button>
        </div>
      ))}
    </div>
  );
}
