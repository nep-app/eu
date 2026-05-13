import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, INP, Btn } from "../../theme.jsx";
import { nowLabel } from "../../data.js";

export default function AdminPerguntas() {
  const [pergunta, setPergunta] = useState("");
  const [opcoes, setOpcoes] = useState(["", "", ""]);

  async function lancarPergunta() {
    if (!pergunta.trim() || opcoes.some(o => !o.trim())) return alert("Preenche tudo!");
    
    const novaP = {
      id: "P_" + Date.now(),
      text: pergunta,
      options: opcoes,
      date: nowLabel(),
      active: true
    };

    // Aqui podes guardar numa coleção global ou disparar para os users
    await updateDoc(doc(db, "global", "pergunta_semanal"), novaP);
    alert("Pergunta lançada com sucesso! 🚀");
    setPergunta(""); setOpcoes(["", "", ""]);
  }

  return (
    <div style={CARD}>
      <div style={SL}>❓ Lançar Pergunta da Semana</div>
      <textarea 
        value={pergunta} 
        onChange={e => setPergunta(e.target.value)} 
        style={INP} 
        placeholder="Qual é a pergunta de reflexão desta semana?" 
      />
      
      {opcoes.map((op, idx) => (
        <input 
          key={idx} 
          value={op} 
          onChange={e => {
            const novas = [...opcoes];
            novas[idx] = e.target.value;
            setOpcoes(novas);
          }} 
          style={{ ...INP, marginBottom: 10 }} 
          placeholder={`Opção ${idx + 1}`} 
        />
      ))}

      <button onClick={lancarPergunta} style={Btn}>PUBLICAR PERGUNTA</button>
    </div>
  );
}
