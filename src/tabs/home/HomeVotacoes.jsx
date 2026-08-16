import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, addDoc, increment, arrayUnion } from "firebase/firestore";
import { db, notifyAdmin } from "../../firebase.js";
import { CARD, SL, CYN } from "../../theme.jsx";
import { nowFull } from "../../data.js";

export default function HomeVotacoes({ user }) {
  const [polls, setPolls] = useState([]);
  const [expandedPolls, setExpandedPolls] = useState(new Set());
  const isDemo = user.isDemo || false;
  // Votação a fingir para a conta demo (voto local, não vai à base de dados).
  const [demoVotes, setDemoVotes] = useState({ "Praia 🏖️": ["Nilton", "Carina"], "Parque 🌳": ["Erick"], "Café no centro ☕": ["Marisa", "Bruno"] });
  const demoPoll = { id: "demo_poll", title: "Onde fazemos o próximo convívio da equipa?", type: "opcao", options: ["Praia 🏖️", "Parque 🌳", "Café no centro ☕"], votes: demoVotes, active: true, ts: 9e15, demo: true };

  useEffect(() => {
    return onSnapshot(collection(db, "polls"), snap => {
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
    // Votação a fingir (demo): muda só o estado local, não escreve nada.
    if (pollId === "demo_poll") {
      setDemoVotes(prev => {
        const nv = { ...prev };
        const arr = nv[opcao] || [];
        nv[opcao] = arr.includes(user.realName) ? arr.filter(n => n !== user.realName) : [...arr, user.realName];
        return nv;
      });
      return;
    }
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
      await notifyAdmin({
        tipo: "VOTO", jovem: user.username,
        texto: `${user.realName} votou em "${poll.title}" → ${opcao}`,
        ts: Date.now(), lida: false,
      });
    }
  }

  const pollsToShow = isDemo ? [demoPoll, ...polls] : polls;
  if (pollsToShow.length === 0) return null;

  return (
    <>
      {pollsToShow.map(poll => {
        const votasMinhas = poll.options.filter(op => (poll.votes[op] || []).includes(user.realName));
        const hasVoted = votasMinhas.length > 0;
        const isExpanded = expandedPolls.has(poll.id);
        const showFull = !hasVoted || isExpanded;

        return (
          <div key={poll.id} style={{ ...CARD, border: `1.5px solid ${CYN}`, marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={SL}>🗳️ {poll.title}</div>
              {hasVoted && (
                <button onClick={() => setExpandedPolls(prev => {
                  const next = new Set(prev);
                  if (next.has(poll.id)) next.delete(poll.id); else next.add(poll.id);
                  return next;
                })} style={{
                  background:"none", border:"none", cursor:"pointer", fontSize:12,
                  color:CYN, fontWeight:800, padding:"0 0 14px 8px", flexShrink:0,
                }}>
                  {isExpanded ? "▲ Fechar" : "✏️ Alterar"}
                </button>
              )}
            </div>

            {!showFull ? (
              /* ── VISTA COMPACTA (já votou) ───────────────────────── */
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {votasMinhas.map(op => (
                  <div key={op} style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"8px 14px", borderRadius:12,
                    background:`${CYN}18`, border:`1.5px solid ${CYN}50`,
                  }}>
                    <span style={{ color:CYN, fontWeight:900, fontSize:13 }}>✓</span>
                    <span style={{ fontSize:13, fontWeight:800, color:"#e2e8f0" }}>{op}</span>
                  </div>
                ))}
                <div style={{ fontSize:11, color:"#64748b", alignSelf:"center", paddingLeft:4 }}>
                  {votasMinhas.length === 1 && poll.type !== "data" ? "votaste aqui" : `${votasMinhas.length} opções selecionadas`}
                </div>
              </div>
            ) : (
              /* ── VISTA COMPLETA ───────────────────────────────────── */
              <>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 15 }}>
                  {poll.type === "data" ? "✅ Seleciona as datas/horas em que tens disponibilidade (podes escolher várias):" : "Seleciona a tua opção favorita:"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(poll.options || []).map(op => {
                    const votos = (poll.votes || {})[op] || [];
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
              </>
            )}
          </div>
        );
      })}
    </>
  );
}
