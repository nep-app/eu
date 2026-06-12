import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, PNK, GRN, INP, Btn } from "../../theme.jsx";
import { JEEP_LIST } from "../../data.js";

const JEEP_8 = JEEP_LIST.filter(j => !["ricardo","demo"].includes(j.username));

function parseFmtData(str) {
  const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const [datePart, timePart] = str.split(" · ");
  const parts = datePart.trim().split(" ");
  const day = parseInt(parts[0]);
  const month = MESES.indexOf(parts[1]) + 1;
  if (!month) return null;
  const now = new Date();
  let year = now.getFullYear();
  const testDate = new Date(year, month - 1, day);
  if (testDate < now) year++;
  return {
    date: `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
    time: timePart || "",
  };
}

function fmtOpcaoData(date, time) {
  if (!date) return "";
  const [y, m, d] = date.split("-");
  const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const base = `${parseInt(d)} ${MESES[parseInt(m)-1]}`;
  return time ? `${base} · ${time}` : base;
}

function hasVotes(poll) {
  return poll.options.some(op => (poll.votes[op] || []).length > 0);
}

export default function AdminVotacoes() {
  const [polls, setPolls] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("texto");
  const [opcoes, setOpcoes] = useState(["", ""]);
  const [opcoesDatas, setOpcoesDatas] = useState([{date:"",time:""},{date:"",time:""}]);
  const [targetUsers, setTargetUsers] = useState(JEEP_8.map(j => j.username));
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editOpcoes, setEditOpcoes] = useState([]);
  const [editTargetUsers, setEditTargetUsers] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, "polls"), snap => {
      setPolls(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.ts - a.ts));
    });
  }, []);

  async function criarVotacao() {
    if (!titulo.trim()) return alert("Dá um título à votação!");

    let opcoesFinais;
    if (tipo === "data") {
      opcoesFinais = opcoesDatas
        .filter(o => o.date.trim())
        .map(o => fmtOpcaoData(o.date, o.time));
    } else {
      opcoesFinais = opcoes.filter(o => o.trim() !== "");
    }

    if (opcoesFinais.length < 2) return alert("Precisas de pelo menos 2 opções!");

    const votosIniciais = {};
    opcoesFinais.forEach(op => { votosIniciais[op] = []; });

    setSaving(true);
    try {
      await addDoc(collection(db, "polls"), {
        title: titulo, type: tipo,
        options: opcoesFinais, votes: votosIniciais,
        active: true, ts: Date.now(),
        demo: false,
        targetUsers: targetUsers.length === JEEP_8.length ? [] : targetUsers,
      });
      setTitulo("");
      setOpcoes(["", ""]);
      setOpcoesDatas([{date:"",time:""},{date:"",time:""}]);
      setTargetUsers(JEEP_8.map(j => j.username));
    } catch(e) {
      alert("Erro ao criar votação: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  function abrirEdicao(poll) {
    setEditId(poll.id);
    setEditTitulo(poll.title);
    setEditOpcoes([...poll.options]);
    setEditTargetUsers(poll.targetUsers?.length > 0 ? poll.targetUsers : JEEP_8.map(j => j.username));
  }

  async function guardarEdicao(poll) {
    const opcoesFinais = editOpcoes.filter(o => o.trim());
    if (!editTitulo.trim() || opcoesFinais.length < 2) return alert("Título e pelo menos 2 opções são obrigatórios.");
    const votosIniciais = {};
    opcoesFinais.forEach(op => { votosIniciais[op] = []; });
    await updateDoc(doc(db, "polls", poll.id), {
      title: editTitulo,
      options: opcoesFinais,
      votes: votosIniciais,
      targetUsers: editTargetUsers.length === JEEP_8.length ? [] : editTargetUsers,
    });
    setEditId(null);
  }

  async function apagarVotacao(id) {
    if (window.confirm("Apagar esta votação definitivamente?"))
      await deleteDoc(doc(db, "polls", id));
  }

  async function fecharVotacao(id, estadoAtual) {
    await updateDoc(doc(db, "polls", id), { active: !estadoAtual });

    if (estadoAtual) {
      const poll = polls.find(p => p.id === id);
      if (!poll) return;

      const vencedora = poll.options.reduce((best, op) =>
        (poll.votes[op]||[]).length > (poll.votes[best]||[]).length ? op : best
      , poll.options[0]);

      const empate = poll.options.filter(op =>
        (poll.votes[op]||[]).length === (poll.votes[vencedora]||[]).length &&
        (poll.votes[vencedora]||[]).length > 0
      ).length > 1;

      const totalVotos = poll.options.reduce((s, op) => s + (poll.votes[op]||[]).length, 0);

      let texto;
      if (totalVotos === 0) {
        texto = `🗳️ A votação "${poll.title}" foi encerrada sem votos.`;
      } else if (empate) {
        texto = `🗳️ A votação "${poll.title}" encerrou em empate! Aguarda decisão da Teresa.`;
      } else {
        texto = `🗳️ Está escolhido! "${poll.title}" → ${vencedora}`;
      }

      const targets = poll.targetUsers?.length > 0
        ? poll.targetUsers
        : JEEP_8.map(j => j.username);

      // Notificação para todos os destinatários
      const isDoodleResult = poll.type === "data" && !empate && totalVotos > 0;
      await Promise.all(targets.map(u =>
        addDoc(collection(db, "notifications", u, "items"), {
          from: "sistema", text: texto, read: false, ts: Date.now(),
          date: new Date().toLocaleString("pt-PT", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }),
          ...(isDoodleResult ? { tipo: "doodle_resultado" } : {})
        })
      ));

      // Para Doodle com vencedor claro, criar UM único evento de grupo
      if (poll.type === "data" && !empate && totalVotos > 0) {
        const parsed = parseFmtData(vencedora);
        if (parsed) {
          const hasSpecificTargets = poll.targetUsers?.length > 0;
          const votantes = poll.votes[vencedora] || [];
          await addDoc(collection(db, "events"), {
            title: poll.title, date: parsed.date, time: parsed.time,
            userId: hasSpecificTargets ? "group" : "all",
            ...(hasSpecificTargets ? { targetUsers: poll.targetUsers } : {}),
            votantes,
            type: "group", shared: false,
            accepted: true, ts: Date.now(), fromPoll: poll.id,
          });
        }
      }
    }
  }

  return (
    <div>
      <div style={CARD}>
        <div style={SL}>Criar Nova Votação / Doodle</div>

        <input value={titulo} onChange={e => setTitulo(e.target.value)}
          placeholder="Ex: Que dia fazemos o acampamento?" style={INP} />

        {/* Tipo */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {[
            { id:"texto", label:"🗳️ Opções", desc:"Atividades, preferências..." },
            { id:"data",  label:"📅 Doodle", desc:"Escolha de datas/horas" },
          ].map(t => (
            <button key={t.id} onClick={() => setTipo(t.id)} style={{
              flex:1, padding:"9px 6px", borderRadius:11, cursor:"pointer",
              border: tipo === t.id ? `1.5px solid ${CYN}` : "1.5px solid rgba(255,255,255,0.08)",
              background: tipo === t.id ? `${CYN}15` : "rgba(255,255,255,0.03)",
              color: tipo === t.id ? CYN : "#64748b",
              fontWeight:800, fontSize:11, textAlign:"center",
            }}>
              <div>{t.label}</div>
              <div style={{ fontSize:9, fontWeight:600, marginTop:2, opacity:0.7 }}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* Opções texto */}
        {tipo === "texto" && (
          <>
            <div style={{ fontSize:11, color:"#94a3b8", marginBottom:8, fontWeight:800 }}>OPÇÕES:</div>
            {opcoes.map((op, idx) => (
              <div key={idx} style={{ display:"flex", gap:8, marginBottom:8 }}>
                <input value={op} onChange={e => {
                  const n = [...opcoes]; n[idx] = e.target.value; setOpcoes(n);
                }} placeholder={`Opção ${idx+1}`} style={{ ...INP, marginBottom:0, flex:1 }} />
                {idx >= 2 && (
                  <button onClick={() => setOpcoes(opcoes.filter((_,i) => i !== idx))}
                    style={{ background:"none", border:"none", color:"#fb7185", cursor:"pointer", fontWeight:900, fontSize:16 }}>✕</button>
                )}
              </div>
            ))}
            <button onClick={() => setOpcoes([...opcoes, ""])} style={{
              background:"transparent", border:`1px dashed ${CYN}`, color:CYN,
              padding:"8px 12px", borderRadius:12, fontSize:12, fontWeight:800,
              cursor:"pointer", width:"100%", marginBottom:15
            }}>+ ADICIONAR OPÇÃO</button>
          </>
        )}

        {/* Opções doodle (data + hora opcional) */}
        {tipo === "data" && (
          <>
            <div style={{ fontSize:11, color:"#94a3b8", marginBottom:8, fontWeight:800 }}>DATAS / HORÁRIOS:</div>
            {opcoesDatas.map((op, idx) => (
              <div key={idx} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
                <input type="date" value={op.date} onChange={e => {
                  const n = [...opcoesDatas]; n[idx] = {...n[idx], date:e.target.value}; setOpcoesDatas(n);
                }} style={{ ...INP, marginBottom:0, flex:2 }} />
                <input type="time" value={op.time} onChange={e => {
                  const n = [...opcoesDatas]; n[idx] = {...n[idx], time:e.target.value}; setOpcoesDatas(n);
                }} style={{ ...INP, marginBottom:0, flex:1 }} placeholder="hora (opcional)" />
                {idx >= 2 && (
                  <button onClick={() => setOpcoesDatas(opcoesDatas.filter((_,i) => i !== idx))}
                    style={{ background:"none", border:"none", color:"#fb7185", cursor:"pointer", fontWeight:900, fontSize:16 }}>✕</button>
                )}
              </div>
            ))}
            <div style={{ fontSize:10, color:"#475569", marginBottom:10 }}>A hora é opcional — deixa em branco se for dia inteiro.</div>
            <button onClick={() => setOpcoesDatas([...opcoesDatas, {date:"",time:""}])} style={{
              background:"transparent", border:`1px dashed ${CYN}`, color:CYN,
              padding:"8px 12px", borderRadius:12, fontSize:12, fontWeight:800,
              cursor:"pointer", width:"100%", marginBottom:15
            }}>+ ADICIONAR DATA</button>
          </>
        )}

        {/* Target users */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, color:"#94a3b8", fontWeight:800, marginBottom:8 }}>
            VISÍVEL PARA:
            <button onClick={() => setTargetUsers(
              targetUsers.length === JEEP_8.length ? [] : JEEP_8.map(j => j.username)
            )} style={{ background:"none", border:"none", color:CYN, cursor:"pointer", fontSize:11, fontWeight:800, marginLeft:10 }}>
              {targetUsers.length === JEEP_8.length ? "Desselecionar todos" : "Selecionar todos"}
            </button>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {JEEP_8.map(j => {
              const sel = targetUsers.includes(j.username);
              return (
                <button key={j.username} onClick={() => setTargetUsers(
                  sel ? targetUsers.filter(u => u !== j.username) : [...targetUsers, j.username]
                )} style={{
                  padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:800, cursor:"pointer",
                  border: sel ? `1.5px solid ${CYN}` : "1.5px solid rgba(255,255,255,0.1)",
                  background: sel ? `${CYN}20` : "rgba(255,255,255,0.03)",
                  color: sel ? CYN : "#64748b",
                }}>{j.name}</button>
              );
            })}
          </div>
          {targetUsers.length === 0 && (
            <div style={{ fontSize:11, color:"#f43f5e", marginTop:6 }}>Nenhum jovem selecionado — a votação não será visível para ninguém.</div>
          )}
        </div>

        <button onClick={criarVotacao} disabled={saving} style={{
          width:"100%", padding:"13px", background: saving ? "rgba(50,199,255,0.3)" : CYN,
          border:"none", borderRadius:12, fontWeight:900, fontSize:13,
          cursor: saving ? "wait" : "pointer", color:"#071529",
        }}>
          {saving ? "A criar..." : "LANÇAR VOTAÇÃO 🗳️"}
        </button>
      </div>

      {/* LISTA DE VOTAÇÕES */}
      {polls.length > 0 && (
        <>
          <div style={{ ...SL, marginTop:24, marginBottom:12 }}>Votações ({polls.length})</div>
          {polls.map(poll => (
            <div key={poll.id} style={{ ...CARD, borderLeft: poll.active ? `4px solid ${CYN}` : "4px solid #334155", opacity: poll.active ? 1 : 0.6 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:900 }}>{poll.title}</div>
                  <div style={{ fontSize:11, color: poll.active ? CYN : "#64748b", fontWeight:800, marginTop:3 }}>
                    {poll.active ? "🟢 A DECORRER" : "🔴 ENCERRADA"} · {poll.type === "data" ? "Doodle" : "Escolha múltipla"}
                  </div>
                  {poll.targetUsers && poll.targetUsers.length > 0 && (
                    <div style={{ fontSize:10, color:"#64748b", marginTop:3 }}>
                      👥 {poll.targetUsers.map(u => JEEP_8.find(j => j.username === u)?.name || u).join(", ")}
                    </div>
                  )}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  {!hasVotes(poll) && editId !== poll.id && (
                    <button onClick={() => abrirEdicao(poll)} style={{
                      background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
                      color:"#94a3b8", borderRadius:8, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:700,
                    }}>✏️ Editar</button>
                  )}
                  <button onClick={() => fecharVotacao(poll.id, poll.active)} style={{
                    background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
                    color:"#fff", borderRadius:8, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:700,
                  }}>{poll.active ? "Fechar" : "Reabrir"}</button>
                  <button onClick={() => apagarVotacao(poll.id)} style={{
                    background:"rgba(244,63,94,0.1)", border:"none", color:"#f43f5e",
                    borderRadius:8, padding:"4px 8px", fontSize:14, cursor:"pointer",
                  }}>✕</button>
                </div>
              </div>
              {editId === poll.id && (
                <div style={{ background:"rgba(0,0,0,0.25)", borderRadius:14, padding:14, marginBottom:14 }}>
                  <input value={editTitulo} onChange={e => setEditTitulo(e.target.value)}
                    style={{ ...INP, marginBottom:10 }} placeholder="Título" />
                  <div style={{ fontSize:11, color:"#94a3b8", fontWeight:800, marginBottom:8 }}>OPÇÕES:</div>
                  {editOpcoes.map((op, idx) => (
                    <div key={idx} style={{ display:"flex", gap:8, marginBottom:8 }}>
                      <input value={op} onChange={e => { const n=[...editOpcoes]; n[idx]=e.target.value; setEditOpcoes(n); }}
                        placeholder={`Opção ${idx+1}`} style={{ ...INP, marginBottom:0, flex:1 }} />
                      {idx >= 2 && (
                        <button onClick={() => setEditOpcoes(editOpcoes.filter((_,i) => i!==idx))}
                          style={{ background:"none", border:"none", color:"#fb7185", cursor:"pointer", fontSize:16 }}>✕</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setEditOpcoes([...editOpcoes,""])} style={{
                    background:"transparent", border:`1px dashed ${CYN}`, color:CYN,
                    padding:"6px 12px", borderRadius:10, fontSize:11, fontWeight:800,
                    cursor:"pointer", width:"100%", marginBottom:12,
                  }}>+ Opção</button>
                  <div style={{ fontSize:11, color:"#94a3b8", fontWeight:800, marginBottom:8 }}>VISÍVEL PARA:</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                    {JEEP_8.map(j => {
                      const sel = editTargetUsers.includes(j.username);
                      return (
                        <button key={j.username} onClick={() => setEditTargetUsers(
                          sel ? editTargetUsers.filter(u => u !== j.username) : [...editTargetUsers, j.username]
                        )} style={{
                          padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:800, cursor:"pointer",
                          border: sel ? `1.5px solid ${CYN}` : "1.5px solid rgba(255,255,255,0.1)",
                          background: sel ? `${CYN}20` : "rgba(255,255,255,0.03)",
                          color: sel ? CYN : "#64748b",
                        }}>{j.name}</button>
                      );
                    })}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => guardarEdicao(poll)} style={{
                      flex:1, padding:"10px", background:CYN, border:"none", borderRadius:10,
                      fontWeight:900, fontSize:12, cursor:"pointer", color:"#071529",
                    }}>✓ Guardar</button>
                    <button onClick={() => setEditId(null)} style={{
                      padding:"10px 16px", background:"rgba(255,255,255,0.07)", border:"none",
                      borderRadius:10, color:"#64748b", cursor:"pointer", fontSize:12,
                    }}>Cancelar</button>
                  </div>
                </div>
              )}

              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {poll.options.map(op => {
                  const votos = poll.votes[op] || [];
                  const pct = poll.options.reduce((s,o) => s + (poll.votes[o]||[]).length, 0);
                  const barW = pct > 0 ? Math.round((votos.length/pct)*100) : 0;
                  return (
                    <div key={op} style={{ background:"rgba(0,0,0,0.25)", padding:"10px 14px", borderRadius:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontWeight:800, fontSize:13, marginBottom:6 }}>
                        <span style={{ color:"#e2e8f0" }}>{op}</span>
                        <span style={{ color:CYN }}>{votos.length} {votos.length === 1 ? "voto" : "votos"}</span>
                      </div>
                      {pct > 0 && (
                        <div style={{ height:4, background:"rgba(255,255,255,0.07)", borderRadius:4, marginBottom:6 }}>
                          <div style={{ height:4, width:`${barW}%`, background:CYN, borderRadius:4, transition:"width 0.4s" }} />
                        </div>
                      )}
                      {votos.length > 0 && (
                        <div style={{ fontSize:11, color:"#64748b" }}>🙋 {votos.join(", ")}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {polls.length === 0 && (
        <div style={{ textAlign:"center", color:"#475569", fontSize:13, padding:"30px 0" }}>
          Ainda não há votações criadas.
        </div>
      )}
    </div>
  );
}
