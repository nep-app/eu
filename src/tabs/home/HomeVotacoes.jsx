import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, addDoc, increment, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN } from "../../theme.jsx";
import { nowFull } from "../../data.js";

export default function HomeVotacoes({ user }) {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, "polls"), snap => {
      const isDemo = user.isDemo || false;
      const ativas = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => {
          if (!p.active) return false;
          if (isDemo ? p.demo !== true : p.demo) return false;
          if (p.targetUsers && p.targetUsers.length > 0 && !p.targetUsers.includes(user.username)) return false;
          return true;
        });
      setPolls(ativas.sort((a, b) => b.ts - a.ts));
    });
  }, []);

  async function votar(pollId, opcao) {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;
    let novosVotos = { ...poll.votes };
    let quemVotouNesta = novosVotos[opcao] || [];
    if (quemVotouNesta.includes(user.realName)) {
      novosVotos[opcao] = quemVotouNesta.filter(nome => nome !== user.realName);
    } else {
      novosVotos[opcao] = [...quemVotouNesta, user.realName];
    }
    const aVotar = !quemVotouNesta.includes(user.realName);
    await updateDoc(doc(db, "polls", pollId), { votes: novosVotos });
    if (aVotar) {
      await updateDoc(doc(db, "userData", user.username), {
        weekXp: increment(5),
        history: arrayUnion({ date: nowFull(), action: `Votou em "${poll.title}"`, ts: Date.now(), xp: 5 }),
      });
      await addDoc(collection(db, "adminNotificacoes"), {
        tipo: "VOTO", jovem: user.username,
        texto: `${user.realName} votou em "${poll.title}" → ${opcao}`,
        ts: Date.now(), lida: false,
      });
    }
  }

  if (polls.length === 0) return null;

  return (
    <>
      {polls.map(poll => (
        <div key={poll.id} style={{ ...CARD, border: `1.5px solid ${CYN}`, marginBottom:16 }}>
          <div style={SL}>🗳️ {poll.title}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 15 }}>
            {poll.type === "data" ? "✅ Seleciona as datas/horas em que tens disponibilidade (podes escolher várias):" : "Seleciona a tua opção favorita:"}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {poll.options.map(op => {
              const votos = poll.votes[op] || [];
              const voteiNesta = votos.includes(user.realName);
              return (
                <div key={op}>
                  <div onClick={() => votar(poll.id, op)} style={{
                    background: voteiNesta ? `${CYN}20` : "rgba(255,255,255,0.05)",
                    border: voteiNesta ? `1.5px solid ${CYN}` : "1.5px solid rgba(255,255,255,0.1)",
                    padding: "12px 16px",
                    borderRadius: votos.length > 0 ? "14px 14px 0 0" : 14,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    cursor: "pointer", transition: "0.2s"
                  }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${voteiNesta ? CYN : "#64748b"}`, display:"flex", alignItems:"center", justifyContent:"center", background: voteiNesta ? CYN : "transparent" }}>
                        {voteiNesta && <span style={{ color:"#000", fontSize:12, fontWeight:900 }}>✓</span>}
                      </div>
                      <span style={{ fontSize:14, fontWeight: voteiNesta ? 800 : 600, color: voteiNesta ? "#fff" : "#cbd5e1" }}>{op}</span>
                    </div>
                    {votos.length > 0 && <span style={{ fontSize:12, fontWeight:800, color:CYN }}>{votos.length} 🙋</span>}
                  </div>
                  {votos.length > 0 && (
                    <div style={{ background: voteiNesta ? `${CYN}10` : "rgba(255,255,255,0.03)", border: voteiNesta ? `1.5px solid ${CYN}` : "1.5px solid rgba(255,255,255,0.1)", borderTop:"none", padding:"6px 16px", borderRadius:"0 0 14px 14px", fontSize:12, color:"#94a3b8" }}>
                      🙋 {votos.join(", ")}
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
