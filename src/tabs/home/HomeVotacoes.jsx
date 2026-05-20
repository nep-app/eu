import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN } from "../../theme.jsx";

export default function HomeVotacoes({ user }) {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, "polls"), snap => {
      // Mostrar apenas votações ativas aos jovens
      const ativas = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.active);
      setPolls(ativas.sort((a, b) => b.ts - a.ts));
    });
  }, []);

  async function votar(pollId, opcao) {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;

    let novosVotos = { ...poll.votes };
    let quemVotouNesta = novosVotos[opcao] || [];

    // Se o jovem já votou nesta opção, tira o voto (Toggle)
    if (quemVotouNesta.includes(user.realName)) {
      novosVotos[opcao] = quemVotouNesta.filter(nome => nome !== user.realName);
    } else {
      // Se não votou, adiciona o nome
      novosVotos[opcao] = [...quemVotouNesta, user.realName];
    }

    await updateDoc(doc(db, "polls", pollId), { votes: novosVotos });
  }

  if (polls.length === 0) return null; // Se não houver votações, não mostra nada

  return (
    <>
      {polls.map(poll => (
        <div key={poll.id} style={{ ...CARD, border: `1.5px solid ${CYN}` }}>
          <div style={SL}>🗳️ {poll.title}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 15 }}>
            {poll.type === "data" ? "✅ Seleciona as datas/horas em que tens disponibilidade (podes escolher várias):" : "Seleciona a tua opção favorita:"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {poll.options.map(op => {
              const votos = poll.votes[op] || [];
              const voteiNesta = votos.includes(user.realName);

              return (
                <div 
                  key={op} 
                  onClick={() => votar(poll.id, op)}
                  style={{ 
                    background: voteiNesta ? `${CYN}20` : "rgba(255,255,255,0.05)", 
                    border: voteiNesta ? `1.5px solid ${CYN}` : "1.5px solid rgba(255,255,255,0.1)",
                    padding: "12px 16px", 
                    borderRadius: 14, 
                    display: "flex", 
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${voteiNesta ? CYN : "#64748b"}`, display: "flex", alignItems: "center", justifyContent: "center", background: voteiNesta ? CYN : "transparent" }}>
                      {voteiNesta && <span style={{ color: "#000", fontSize: 12, fontWeight: 900 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: voteiNesta ? 800 : 600, color: voteiNesta ? "#fff" : "#cbd5e1" }}>
                      {op}
                    </span>
                  </div>
                  
                  {/* Mostrar quantos votaram (opcional, mas fixe para verem a tendência) */}
                  {votos.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: CYN }}>{votos.length}</span>
                      <span style={{ fontSize: 12 }}>🙋‍♂️</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
