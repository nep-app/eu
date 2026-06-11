import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, INP } from "../../theme.jsx";

function fmtOpcaoData(date, time) {
  if (!date) return "";
  const [y, m, d] = date.split("-");
  const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const base = `${parseInt(d)} ${MESES[parseInt(m)-1]}`;
  return time ? `${base} · ${time}` : base;
}

function CriarVotacao() {
  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("texto");
  const [opcoes, setOpcoes] = useState(["", ""]);
  const [opcoesDatas, setOpcoesDatas] = useState([{date:"",time:""},{date:"",time:""}]);
  const [saving, setSaving] = useState(false);

  async function criar() {
    if (!titulo.trim()) return alert("Dá um título à votação!");
    const opcoesFinais = tipo === "data"
      ? opcoesDatas.filter(o => o.date.trim()).map(o => fmtOpcaoData(o.date, o.time))
      : opcoes.filter(o => o.trim());
    if (opcoesFinais.length < 2) return alert("Precisas de pelo menos 2 opções!");
    const votosIniciais = {};
    opcoesFinais.forEach(op => { votosIniciais[op] = []; });
    setSaving(true);
    try {
      await addDoc(collection(db, "polls"), {
        title: titulo, type: tipo,
        options: opcoesFinais, votes: votosIniciais,
        active: true, ts: Date.now(), demo: false, targetUsers: [],
      });
      setTitulo(""); setOpcoes(["",""]); setOpcoesDatas([{date:"",time:""},{date:"",time:""}]);
      setAberto(false);
    } catch(e) { alert("Erro: " + e.message); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ ...CARD, marginBottom: 16, border: `1.5px dashed ${CYN}40` }}>
      <button onClick={() => setAberto(v => !v)} style={{
        width:"100%", background:"none", border:"none", display:"flex", alignItems:"center",
        justifyContent:"space-between", cursor:"pointer", padding:0,
      }}>
        <div style={{ ...SL, marginBottom:0 }}>🗳️ Criar Votação</div>
        <span style={{ fontSize:16, color:CYN }}>{aberto ? "▲" : "▼"}</span>
      </button>

      {aberto && (
        <div style={{ marginTop:14 }}>
          <input value={titulo} onChange={e => setTitulo(e.target.value)}
            placeholder="Ex: Que dia fazemos o encontro?" style={INP} />

          <div style={{ display:"flex", gap:8, marginBottom:14 }}>
            {[["texto","🗳️ Opções"],["data","📅 Doodle"]].map(([id,lbl]) => (
              <button key={id} onClick={() => setTipo(id)} style={{
                flex:1, padding:"8px", borderRadius:10, cursor:"pointer", fontSize:11, fontWeight:800,
                border: tipo === id ? `1.5px solid ${CYN}` : "1.5px solid rgba(255,255,255,0.08)",
                background: tipo === id ? `${CYN}15` : "rgba(255,255,255,0.03)",
                color: tipo === id ? CYN : "#64748b",
              }}>{lbl}</button>
            ))}
          </div>

          {tipo === "texto" && (
            <>
              {opcoes.map((op, idx) => (
                <div key={idx} style={{ display:"flex", gap:8, marginBottom:8 }}>
                  <input value={op} onChange={e => { const n=[...opcoes]; n[idx]=e.target.value; setOpcoes(n); }}
                    placeholder={`Opção ${idx+1}`} style={{ ...INP, marginBottom:0, flex:1 }} />
                  {idx >= 2 && (
                    <button onClick={() => setOpcoes(opcoes.filter((_,i) => i!==idx))}
                      style={{ background:"none", border:"none", color:"#fb7185", cursor:"pointer", fontSize:16 }}>✕</button>
                  )}
                </div>
              ))}
              <button onClick={() => setOpcoes([...opcoes,""])} style={{
                background:"transparent", border:`1px dashed ${CYN}`, color:CYN,
                padding:"7px 12px", borderRadius:10, fontSize:11, fontWeight:800,
                cursor:"pointer", width:"100%", marginBottom:14,
              }}>+ Opção</button>
            </>
          )}

          {tipo === "data" && (
            <>
              {opcoesDatas.map((op, idx) => (
                <div key={idx} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
                  <input type="date" value={op.date} onChange={e => { const n=[...opcoesDatas]; n[idx]={...n[idx],date:e.target.value}; setOpcoesDatas(n); }}
                    style={{ ...INP, marginBottom:0, flex:2 }} />
                  <input type="time" value={op.time} onChange={e => { const n=[...opcoesDatas]; n[idx]={...n[idx],time:e.target.value}; setOpcoesDatas(n); }}
                    style={{ ...INP, marginBottom:0, flex:1 }} />
                  {idx >= 2 && (
                    <button onClick={() => setOpcoesDatas(opcoesDatas.filter((_,i) => i!==idx))}
                      style={{ background:"none", border:"none", color:"#fb7185", cursor:"pointer", fontSize:16 }}>✕</button>
                  )}
                </div>
              ))}
              <button onClick={() => setOpcoesDatas([...opcoesDatas,{date:"",time:""}])} style={{
                background:"transparent", border:`1px dashed ${CYN}`, color:CYN,
                padding:"7px 12px", borderRadius:10, fontSize:11, fontWeight:800,
                cursor:"pointer", width:"100%", marginBottom:14,
              }}>+ Data</button>
            </>
          )}

          <button onClick={criar} disabled={saving} style={{
            width:"100%", padding:"12px", background: saving ? `${CYN}40` : CYN,
            border:"none", borderRadius:11, fontWeight:900, fontSize:13,
            cursor: saving ? "wait" : "pointer", color:"#071529",
          }}>{saving ? "A criar..." : "LANÇAR 🗳️"}</button>
        </div>
      )}
    </div>
  );
}

export default function HomeVotacoes({ user }) {
  const [polls, setPolls] = useState([]);
  const isTeresa = user.username === "teresa";

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
    await updateDoc(doc(db, "polls", pollId), { votes: novosVotos });
  }

  async function fecharVotacao(pollId) {
    await updateDoc(doc(db, "polls", pollId), { active: false });
  }

  async function apagarVotacao(pollId) {
    if (window.confirm("Apagar esta votação?"))
      await deleteDoc(doc(db, "polls", pollId));
  }

  return (
    <>
      {isTeresa && <CriarVotacao />}

      {polls.map(poll => (
        <div key={poll.id} style={{ ...CARD, border: `1.5px solid ${CYN}`, marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
            <div style={SL}>🗳️ {poll.title}</div>
            {isTeresa && (
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <button onClick={() => fecharVotacao(poll.id)} style={{
                  background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
                  color:"#94a3b8", borderRadius:8, padding:"3px 9px", fontSize:10, cursor:"pointer", fontWeight:700,
                }}>Fechar</button>
                <button onClick={() => apagarVotacao(poll.id)} style={{
                  background:"rgba(244,63,94,0.1)", border:"none", color:"#f43f5e",
                  borderRadius:8, padding:"3px 7px", fontSize:13, cursor:"pointer",
                }}>✕</button>
              </div>
            )}
          </div>
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
                    padding: "12px 16px", borderRadius: votos.length > 0 ? "14px 14px 0 0" : 14,
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
