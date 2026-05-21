import React, { useState, useEffect } from 'react';
import { doc, setDoc, addDoc, collection, deleteDoc, updateDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, PNK, INP, PS, TXT_MUT } from "../../theme.jsx";
import { nowLabel, fmtDate, isOverdue, TASK_TYPES } from "../../data.js";

function fmtDatePt(str) {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${parseInt(d)} ${MESES[parseInt(m)-1]} ${y}`;
}

export default function HomeTodo({ user, data, setTab, setDesafiosSubTab, features = {}, notifs = [], onDeleteNotif }) {
  const [novaTarefaTexto, setNovaTarefaTexto]       = useState("");
  const [novaTarefaData, setNovaTarefaData]         = useState("");
  const [partilharTarefaCheck, setPartilharTarefaCheck] = useState(false);
  const [temQuizPendente, setTemQuizPendente]       = useState(false);

  const uData        = data.userData || {};
  const listaTarefas = data.todos    || [];
  const listaEventos = data.events   || [];

  useEffect(() => {
    async function checkQuizzes() {
      const snap = await getDocs(collection(db, "quizzes"));
      const ativos = snap.docs.map(d => ({id:d.id,...d.data()})).filter(q => q.active !== false);
      const feitos = uData.completedQuizzes || [];
      setTemQuizPendente(ativos.some(q => !feitos.includes(q.id)));
    }
    checkQuizzes();
  }, [uData.completedQuizzes]);

  const NOMES_FIXAS = ["Pergunta da semana","Autoavaliação mensal","Satisfação","Plano Individual (PIA)","Autoavaliação"];
  const tarefasSugestao = listaTarefas.filter(t => t.addedBy === "teresa" && t.accepted === false && !NOMES_FIXAS.includes(t.text));
  const minhasTarefas   = listaTarefas.filter(t => (t.addedBy !== "teresa" || t.accepted === true) && !NOMES_FIXAS.includes(t.text));

  // Eventos propostos (accepted === false) destinados ao utilizador ou a todos
  const eventosProposta = listaEventos.filter(e =>
    e.accepted === false && (e.userId === user.username || e.userId === "all")
  );

  let acoesPendentes = [];
  if (features.perguntaSemanal && !uData.answered)  acoesPendentes.push({ status:"urgent",  icon:"💬", title:"Pergunta da semana",    sub:"A Teresa aguarda a tua reflexão", go:() => { setDesafiosSubTab("pergunta"); setTab("desafios"); } });
  if (features.autoAvaliacao   && !uData.autoSaved) acoesPendentes.push({ status:"pending", icon:"📊", title:"Autoavaliação mensal",  sub:"Avalia as tuas competências",     go:() => { setDesafiosSubTab("auto");     setTab("desafios"); } });
  if (features.satisfacao      && !uData.sSaved)    acoesPendentes.push({ status:"new",     icon:"😊", title:"Satisfação",            sub:"Diz-nos como corre o programa",   go:() => { setDesafiosSubTab("satisf");   setTab("desafios"); } });
  const piaUnlocked = uData.piaUnlocked || {};
  const temPiaAberto = Object.values(piaUnlocked).some(v => v === true);
  if (temPiaAberto && !uData.piaSaved) acoesPendentes.push({ status:"pending", icon:"🚀", title:"Plano Individual (PIA)", sub:"Desenha o teu projeto", go:() => setTab("pia") });
  if (temQuizPendente)  acoesPendentes.push({ status:"pending", icon:"🧠", title:"Dilema Pendente",        sub:"Tens um novo quiz para resolver", go:() => { setDesafiosSubTab("quiz");     setTab("desafios"); } });
  const cap  = uData.cap  || {};
  const cap2 = uData.cap2 || {};
  if (cap.unlocked  && !cap.locked)  acoesPendentes.push({ status:"new", icon:"🔒", title:"Cápsula de Dezembro",  sub:"Escreve a tua mensagem para o futuro", go:() => setTab("perfil") });
  if (cap2.unlocked && !cap2.locked) acoesPendentes.push({ status:"new", icon:"🔐", title:"Cápsula Final",         sub:"A Teresa desbloqueou a tua cápsula final", go:() => setTab("perfil") });

  async function criarNovaTarefa() {
    if (!novaTarefaTexto.trim()) return;
    await addDoc(collection(db, "todos", user.username, "items"), {
      text: novaTarefaTexto, due: novaTarefaData, done: false,
      shared: partilharTarefaCheck, ts: Date.now()
    });
    setNovaTarefaTexto(""); setNovaTarefaData(""); setPartilharTarefaCheck(false);
  }

  async function alternarEstadoTarefa(tarefa) {
    await updateDoc(doc(db, "todos", user.username, "items", tarefa.id), { done: !tarefa.done });
    if (!tarefa.done) {
      const newHistory = [...(data.history || []), { date:nowLabel(), action:`Concluiu a tarefa: ${tarefa.text}`, ts:Date.now(), xp:5 }];
      await setDoc(doc(db, "userData", user.username), { history:newHistory, weekXp:(uData.weekXp||0)+5 }, { merge:true });
    }
  }

  async function removerTarefa(id) {
    if (window.confirm("Apagar esta tarefa?")) await deleteDoc(doc(db, "todos", user.username, "items", id));
  }

  async function aceitarTarefa(id) {
    await updateDoc(doc(db, "todos", user.username, "items", id), { accepted:true, shared:true });
    await addDoc(collection(db, "adminNotificacoes"), { tipo:"TAREFA_ACEITE", jovem:user.username, ts:Date.now(), lida:false });
  }

  async function recusarTarefa(id) {
    if (!window.confirm("Recusar esta sugestão?")) return;
    await deleteDoc(doc(db, "todos", user.username, "items", id));
    await addDoc(collection(db, "adminNotificacoes"), { tipo:"TAREFA_RECUSADA", jovem:user.username, ts:Date.now(), lida:false });
  }

  async function aceitarEvento(id) {
    await updateDoc(doc(db, "events", id), { accepted: true });
    await addDoc(collection(db, "adminNotificacoes"), { tipo:"EVENTO_ACEITE", jovem:user.username, ts:Date.now(), lida:false });
  }

  async function recusarEvento(id) {
    if (!window.confirm("Recusar este evento?")) return;
    await deleteDoc(doc(db, "events", id));
    await addDoc(collection(db, "adminNotificacoes"), { tipo:"EVENTO_RECUSADO", jovem:user.username, ts:Date.now(), lida:false });
  }

  return (
    <>
      {/* ── AÇÕES PENDENTES ─────────────────────────────────────────── */}
      {acoesPendentes.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div style={SL}>Ações Pendentes</div>
          {acoesPendentes.map((item, idx) => (
            <div key={idx} onClick={item.go} style={{
              display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
              borderRadius:18, marginBottom:10, cursor:"pointer", transition:"all 0.18s",
              background: PS[item.status].bg,
              border:`1px solid ${PS[item.status].bl}`,
              borderLeft:`3px solid ${PS[item.status].bc}`,
            }}>
              <div style={{ fontSize:22, lineHeight:1, flexShrink:0 }}>{item.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:800, color:"#f1f5f9" }}>{item.title}</div>
                <div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>{item.sub}</div>
              </div>
              <div style={{ color:PS[item.status].bc, fontWeight:900, fontSize:18, opacity:0.8 }}>›</div>
            </div>
          ))}
        </div>
      )}

      {/* ── EVENTOS PROPOSTOS ───────────────────────────────────────── */}
      {eventosProposta.length > 0 && (
        <div style={{ ...CARD, border:"1px solid rgba(245,158,11,0.25)", marginBottom:16 }}>
          <div style={{ ...SL, color:"#f59e0b" }}>📅 Eventos Propostos</div>
          {eventosProposta.map(ev => (
            <div key={ev.id} style={{ background:"rgba(245,158,11,0.05)", padding:14, borderRadius:14, marginBottom:10, border:"1px solid rgba(245,158,11,0.12)" }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", marginBottom:2 }}>{ev.title}</div>
              <div style={{ fontSize:11, color:"#f59e0b", fontWeight:800, marginBottom:12 }}>
                {fmtDatePt(ev.date)}{ev.time ? ` · ${ev.time}` : ""}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => aceitarEvento(ev.id)} style={{ flex:1, background:"rgba(245,158,11,0.18)", color:"#f59e0b", border:"1px solid rgba(245,158,11,0.3)", padding:"8px", borderRadius:10, fontWeight:800, cursor:"pointer", fontSize:12 }}>ACEITAR</button>
                <button onClick={() => recusarEvento(ev.id)} style={{ flex:1, background:"rgba(244,63,94,0.08)", color:"#f43f5e", border:"1px solid rgba(244,63,94,0.2)", padding:"8px", borderRadius:10, fontWeight:800, cursor:"pointer", fontSize:12 }}>RECUSAR</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SUGESTÕES DA TERESA ─────────────────────────────────────── */}
      {tarefasSugestao.length > 0 && (
        <div style={{ ...CARD, border:`1px solid ${CYN}25`, marginBottom:16 }}>
          <div style={SL}>📩 Sugestões da Teresa</div>
          {tarefasSugestao.map(t => (
            <div key={t.id} style={{ background:"rgba(56,189,248,0.04)", padding:14, borderRadius:14, marginBottom:10, border:"1px solid rgba(56,189,248,0.1)" }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", marginBottom:4 }}>{t.text}</div>
              <div style={{ fontSize:11, color:CYN, fontWeight:800, marginBottom:12 }}>Prazo: {fmtDate(t.due)}</div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => aceitarTarefa(t.id)} style={{ flex:1, background:`${CYN}18`, color:CYN, border:`1px solid ${CYN}30`, padding:"8px", borderRadius:10, fontWeight:800, cursor:"pointer", fontSize:12 }}>ACEITAR</button>
                <button onClick={() => recusarTarefa(t.id)} style={{ flex:1, background:"rgba(244,63,94,0.08)", color:"#f43f5e", border:"1px solid rgba(244,63,94,0.2)", padding:"8px", borderRadius:10, fontWeight:800, cursor:"pointer", fontSize:12 }}>RECUSAR</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── NOTIFICAÇÕES ────────────────────────────────────────────── */}
      {notifs.length > 0 && (
        <div style={{ ...CARD, marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={SL}>🔔 Notificações</div>
            <div style={{ fontSize:11, fontWeight:900, color:CYN, background:`${CYN}18`, borderRadius:20, padding:"3px 10px" }}>{notifs.length}</div>
          </div>
          {notifs.map(n => (
            <div key={n.id} style={{ display:"flex", gap:12, padding:"13px 14px", background:"rgba(0,0,0,0.2)", borderRadius:14, marginBottom:8, border:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ flex:1, fontSize:13, lineHeight:1.6, color:"#f1f5f9" }}>{n.text}</div>
              <button onClick={() => onDeleteNotif && onDeleteNotif(n.id)} style={{ background:"none", border:"none", color:"#475569", fontSize:16, cursor:"pointer", paddingTop:2, flexShrink:0, lineHeight:1 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* ── TO-DO LIST ──────────────────────────────────────────────── */}
      <div style={CARD}>
        <div style={SL}>✅ A Minha Lista</div>

        {/* Novo item */}
        <div style={{ marginBottom:16, paddingBottom:16, borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
          <input value={novaTarefaTexto} onChange={e => setNovaTarefaTexto(e.target.value)}
            onKeyDown={e => e.key === "Enter" && criarNovaTarefa()}
            style={INP} placeholder="O que precisas de fazer?" />
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input type="date" value={novaTarefaData} onChange={e => setNovaTarefaData(e.target.value)}
              style={{ ...INP, flex:1, marginBottom:0, fontSize:12 }} />
            <button onClick={criarNovaTarefa} style={{
              background:CYN, border:"none", borderRadius:12, padding:"12px 18px",
              fontWeight:900, cursor:"pointer", color:"#070b14", fontSize:12, flexShrink:0, letterSpacing:0.5 }}>
              + ADD
            </button>
          </div>
          <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:11, color:TXT_MUT, cursor:"pointer", marginTop:8 }}>
            <input type="checkbox" checked={partilharTarefaCheck} onChange={e => setPartilharTarefaCheck(e.target.checked)} style={{ accentColor:CYN }} />
            Partilhar com a Teresa
          </label>
        </div>

        {/* Lista */}
        {minhasTarefas.length === 0 ? (
          <div style={{ textAlign:"center", color:TXT_MUT, fontSize:13, padding:"14px 0" }}>Sem tarefas pendentes 🎉</div>
        ) : (
          minhasTarefas.sort((a,b) => (b.ts||0)-(a.ts||0)).map(tarefa => (
            <div key={tarefa.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
              <div onClick={() => alternarEstadoTarefa(tarefa)} style={{
                width:24, height:24, borderRadius:8, flexShrink:0, cursor:"pointer",
                border:`2px solid ${tarefa.done ? "#4ade80" : "rgba(255,255,255,0.15)"}`,
                background: tarefa.done ? "#4ade80" : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s",
              }}>
                {tarefa.done && <span style={{ color:"#070b14", fontWeight:900, fontSize:12 }}>✓</span>}
              </div>
              <div style={{ flex:1, opacity:tarefa.done ? 0.35 : 1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", textDecoration:tarefa.done?"line-through":"none" }}>
                  {(() => { const tt = TASK_TYPES.find(t => t.id === tarefa.type); return tt && tt.id !== "geral" ? <span style={{ marginRight:5 }}>{tt.icon}</span> : null; })()}
                  {tarefa.text}
                  {tarefa.shared && <span style={{ fontSize:9, background:CYN, color:"#000", padding:"2px 5px", borderRadius:4, marginLeft:7, verticalAlign:"middle", fontWeight:900 }}>PARTILHADO</span>}
                </div>
                {tarefa.due && <div style={{ fontSize:11, color:isOverdue(tarefa.due) ? "#f43f5e" : TXT_MUT, marginTop:2, fontWeight:700 }}>{fmtDate(tarefa.due)}</div>}
              </div>
              <button onClick={() => removerTarefa(tarefa.id)} style={{ background:"none", border:"none", color:"rgba(244,63,94,0.5)", fontSize:17, cursor:"pointer", padding:"2px 4px" }}>✕</button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
