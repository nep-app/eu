import React, { useState } from 'react';
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, INP, Btn } from "../../theme.jsx";
import { nowLabel } from "../../data.js";

export default function AdminPerguntas() {
  const [pergunta, setPergunta] = useState("");
  const [opcoes,   setOpcoes]   = useState(["", "", ""]);
  const [prazo,    setPrazo]    = useState("");

  async function lancarPergunta() {
    if (!pergunta.trim() || opcoes.some(o => !o.trim())) return alert("Preenche tudo!");
    await setDoc(doc(db, "config", "activeQuestion"), {
      id: "P_" + Date.now(),
      text: pergunta,
      options: opcoes,
      date: nowLabel(),
      prazo: prazo || null,
      active: true,
    });
    alert("Pergunta lançada! 🚀");
    setPergunta(""); setOpcoes(["", "", ""]); setPrazo("");
  }

  return (
    <div style={CARD}>
      <div style={SL}>❓ Lançar Pergunta da Semana</div>
      <textarea value={pergunta} onChange={e => setPergunta(e.target.value)} style={{ ...INP, height:80 }}
        placeholder="Qual é a pergunta de reflexão desta semana?" />

      {opcoes.map((op, idx) => (
        <input key={idx} value={op}
          onChange={e => { const n = [...opcoes]; n[idx] = e.target.value; setOpcoes(n); }}
          style={{ ...INP, marginBottom:10 }} placeholder={`Opção ${idx + 1}`} />
      ))}

      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:10, color:CYN, fontWeight:800, marginBottom:4 }}>Prazo para responder (opcional)</div>
        <input type="date" value={prazo} onChange={e => setPrazo(e.target.value)} style={{ ...INP, marginBottom:0 }} />
      </div>

      <Btn onClick={lancarPergunta}>PUBLICAR PERGUNTA</Btn>
    </div>
  );
}
