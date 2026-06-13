import React, { useState, useEffect, useContext } from 'react';
import { doc, setDoc, addDoc, collection, deleteDoc, updateDoc, getDocs } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, PNK, INP, PS, TXT_MUT } from "../../theme.jsx";
import { nowLabel, fmtDate, isOverdue, TASK_TYPES, CHANNELS } from "../../data.js";
import { ThemeCtx } from "../../JovensApp.jsx";
import HomeVotacoes from "./HomeVotacoes.jsx";

function fmtDatePt(str) {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${parseInt(d)} ${MESES[parseInt(m)-1]} ${y}`;
}

export default function HomeTodo({ user, data, setTab, setDesafiosSubTab, features = {}, notifs = [], onDeleteNotif, setForumCanal, mencaoNotifs = [], previewMode, scrollToAgenda }) {
  const light = useContext(ThemeCtx);
  const [novaTarefaTexto, setNovaTarefaTexto]       = useState("");
  const [novaTarefaData, setNovaTarefaData]         = useState("");
  const [partilharTarefaCheck, setPartilharTarefaCheck] = useState(false);
  const [temQuizPendente, setTemQuizPendente]       = useState(false);
  const [editTarefaId,    setEditTarefaId]    = useState(null);
  const [editTarefaTexto, setEditTarefaTexto] = useState("");
  const [editTarefaData,  setEditTarefaData]  = useState("");

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
  if (features.perguntaSemanal && !uData.answered)  acoesPendentes.push({ status:"urgent",  icon:"💬", title:"Pergunta da semana",    sub:"A Teresa aguarda a tua reflexão", prazo:uData.answeredPrazo,  go:() => { setDesafiosSubTab("pergunta"); setTab("desafios"); } });
  if (features.autoAvaliacao   && !uData.autoSaved) acoesPendentes.push({ status:"pending", icon:"📊", title:"Autoavaliação mensal",  sub:"Avalia as tuas competências",     prazo:uData.autoSavedPrazo, go:() => { setDesafiosSubTab("auto");     setTab("desafios"); } });
  if (features.satisfacao      && !uData.sSaved)    acoesPendentes.push({ status:"new",     icon:"😊", title:"Satisfação",            sub:"Diz-nos como corre o programa",   prazo:uData.sSavedPrazo,    go:() => { setDesafiosSubTab("satisf");   setTab("desafios"); } });
  const piaUnlocked = uData.piaUnlocked || {};
  const temPiaAberto = Object.values(piaUnlocked).some(v => v === true);
  if (temPiaAberto && !uData.piaSaved) acoesPendentes.push({ status:"pending", icon:"🚀", title:"Plano Individual (PIA)", sub:"Desenha o teu projeto", prazo:uData.piaSavedPrazo, go:() => setTab("pia") });
  if (temQuizPendente) acoesPendentes.push({ status:"pending", icon:"🧠", title:"Dilema Pendente", sub:"Tens um novo quiz para resolver", go:() => { setDesafiosSubTab("quiz"); setTab("desafios"); } });
  const cap  = uData.cap  || {};
  const cap2 = uData.cap2 || {};
  if (cap.unlocked  && !cap.locked)  acoesPendentes.push({ status:"new", icon:"🔒", title:"Cápsula de Dezembro",  sub:"Escreve a tua mensagem para o futuro", go:() => setTab("perfil") });
  if (cap2.unlocked && !cap2.locked) acoesPendentes.push({ status:"new", icon:"🔐", title:"Cápsula Final",         sub:"A Teresa desbloqueou a tua cápsula final", go:() => setTab("perfil") });
  mencaoNotifs.forEach(n => acoesPendentes.push({
    status:"new", icon:"🔔",
    title:"Foste mencionado no fórum",
    sub: n.text?.replace("🔔 ", "") || "Vai reagir ou comentar para concluir",
    go: () => { if (n.canal && setForumCanal) setForumCanal(n.canal); setTab("forum"); }
  }));

  async function criarNovaTarefa() {
    if (!novaTarefaTexto.trim()) return;
    await addDoc(collection(db, "todos", user.username, "items"), {
      text: novaTarefaTexto, due: novaTarefaData, done: false,
      shared: partilharTarefaCheck, ts: Date.now()
    });
    if (partilharTarefaCheck) {
      await addDoc(collection(db, "adminNotificacoes"), {
        tipo: "TAREFA_PARTILHADA", jovem: user.username,
        texto: novaTarefaTexto.substring(0, 60), ts: Date.now(), lida: false,
      });
    }
    const newHistory = [...(data.history || []), { date:nowLabel(), action:"Criou uma tarefa", ts:Date.now(), xp:5 }];
    await setDoc(doc(db, "userData", user.username), { history:newHistory, weekXp:(uData.weekXp||0)+5 }, { merge:true });
    setNovaTarefaTexto(""); setNovaTarefaData(""); setPartilharTarefaCheck(false);
  }

  async function alternarEstadoTarefa(tarefa) {
    await updateDoc(doc(db, "todos", user.username, "items", tarefa.id), { done: !tarefa.done });
    if (!tarefa.done) {
      const newHistory = [...(data.history || []), { date:nowLabel(), action:`Concluiu a tarefa: ${tarefa.text}`, ts:Date.now(), xp:10 }];
      await setDoc(doc(db, "userData", user.username), { history:newHistory, weekXp:(uData.weekXp||0)+10 }, { merge:true });
    }
  }

  async function removerTarefa(id) {
    if (window.confirm("Apagar esta tarefa?")) await deleteDoc(doc(db, "todos", user.username, "items", id));
  }

  async function guardarEdicaoTarefa(id) {
    if (!editTarefaTexto.trim()) return;
    await updateDoc(doc(db, "todos", user.username, "items", id), { text: editTarefaTexto, due: editTarefaData });
    setEditTarefaId(null);
  }

  async function aceitarTarefa(id) {
    await updateDoc(doc(db, "todos", user.username, "items", id), { accepted:true, shared:true });
    await addDoc(collection(db, "adminNotificacoes"), { tipo:"TAREFA_ACEITE", jovem:user.username, ts:Date.now(), lida:false });
    const newHistory = [...(data.history || []), { date:nowLabel(), action:"Aceitou uma tarefa sugerida", ts:Date.now(), xp:5 }];
    await setDoc(doc(db, "userData", user.username), { history:newHistory, weekXp:(uData.weekXp||0)+5 }, { merge:true });
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
      {/* ── VOTAÇÕES ────────────────────────────────────────────────── */}
      <HomeVotacoes user={user} />

      {/* ── AÇÕES PENDENTES ─────────────────────────────────────────── */}
      {acoesPendentes.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ ...SL, color: light ? "#4a5568" : undefined, marginBottom:10 }}>Ações Pendentes</div>
          {acoesPendentes.map((item, idx) => {
            const ICON_C = {
              "💬": { bg:"#7860c8", border:"#5a40a8", dot:"#3e2888", text:"#ffffff", sub:"rgba(255,255,255,0.78)" },
              "📊": { bg:"#4a78c8", border:"#3060a8", dot:"#1e4888", text:"#ffffff", sub:"rgba(255,255,255,0.78)" },
              "😊": { bg:"#4aada0", border:"#388a7e", dot:"#286a60", text:"#ffffff", sub:"rgba(255,255,255,0.78)" },
              "🚀": { bg:"#c8a06a", border:"#a87e48", dot:"#886020", text:"#ffffff", sub:"rgba(255,255,255,0.78)" },
              "🧠": { bg:"#c07848", border:"#a05828", dot:"#804010", text:"#ffffff", sub:"rgba(255,255,255,0.78)" },
              "🔒": { bg:"#9878c8", border:"#7858a8", dot:"#584088", text:"#ffffff", sub:"rgba(255,255,255,0.78)" },
              "🔐": { bg:"#9878c8", border:"#7858a8", dot:"#584088", text:"#ffffff", sub:"rgba(255,255,255,0.78)" },
              "🔔": { bg:"#0f3050", border:"#1a4870", dot:"#22d3ee", text:"#ffffff", sub:"rgba(255,255,255,0.78)" },
            };
            const ls = ICON_C[item.icon] || ICON_C["💬"];
            return (
            <div key={idx} onClick={item.go} style={{
              display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
              borderRadius:18, marginBottom:10, cursor:"pointer", transition:"all 0.18s",
              background: ls ? ls.bg : PS[item.status].bg,
              border: ls ? `1px solid ${ls.border}` : `1px solid ${PS[item.status].bl}`,
              borderLeft: `4px solid ${ls ? ls.dot : PS[item.status].bc}`,
            }}>
              <div style={{ fontSize:22, lineHeight:1, flexShrink:0 }}>{item.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:800, color: ls ? ls.text : "#f1f5f9" }}>{item.title}</div>
                <div style={{ fontSize:11, color: ls ? ls.sub : "#94a3b8", marginTop:2 }}>{item.sub}</div>
                {item.prazo && (
                  <div style={{ fontSize:10, fontWeight:900, marginTop:4, color: isOverdue(item.prazo) ? "#e11d48" : (light ? "#b45309" : "#fbbf24") }}>
                    ⏰ {isOverdue(item.prazo) ? "Prazo expirado" : `Até ${fmtDatePt(item.prazo)}`}
                  </div>
                )}
              </div>
              <div style={{ color: ls ? ls.dot : PS[item.status].bc, fontWeight:900, fontSize:18 }}>›</div>
            </div>
            );
          })}
        </div>
      )}

      {/* ── EVENTOS PROPOSTOS ───────────────────────────────────────── */}
      {eventosProposta.length > 0 && (
        <div style={{ ...CARD, border:"1px solid rgba(245,158,11,0.25)", marginBottom:16 }}>
          <div style={{ ...SL, color:"#f59e0b" }}>📅 Eventos Propostos</div>
          {eventosProposta.map(ev => (
            <div key={ev.id} style={{ background:"rgba(245,158,11,0.05)", padding:14, borderRadius:14, marginBottom:10, border:"1px solid rgba(245,158,11,0.12)" }}>
              <div style={{ fontSize:14, fontWeight:700, color: light ? "#0f172a" : "#f1f5f9", marginBottom:2 }}>{ev.title}</div>
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
              <div style={{ fontSize:14, fontWeight:700, color: light ? "#0f172a" : "#f1f5f9", marginBottom:4 }}>{t.text}</div>
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
          {notifs.map(n => {
            const isForumNotif = !!n.canal || CHANNELS.some(ch => n.text?.startsWith(ch.icon)) || n.text?.startsWith("🌐") || n.text?.startsWith("📢") || n.text?.includes("reagiu à tua partilha") || n.text?.includes("comentou a tua partilha") || n.text?.includes("publicação no Fórum");
            const isMedalNotif = n.text?.includes("medalha") || n.text?.includes("🏅") || n.text?.includes("⭐");
            const isDoodleNotif = n.tipo === "doodle_resultado" || (n.text?.startsWith("🗳️") && n.text?.includes("→"));
            const isRecursoNotif = n.tipo === "recurso" || n.text?.startsWith("📚");
            const isRodaNotif = n.tipo === "roda" || (!n.tipo && n.text?.includes("Roda da Vida") && !n.text?.match(/tarefa|evento/i));
            const isPiaNotif = n.tipo === "pia" || (!n.tipo && !isForumNotif && n.text?.includes("PIA"));
            const isAutoNotif = n.tipo === "auto" || (!n.tipo && (n.text?.includes("Autoavaliação") || n.text?.includes("Satisfação") || n.text?.includes("Pergunta da Semana") || n.text?.includes("Dilema")));
            function handleClick() {
              if (isRecursoNotif) {
                if (setForumCanal) setForumCanal("__recursos");
                setTab("forum");
              } else if (isForumNotif) {
                let canal = n.canal;
                if (!canal) {
                  for (const ch of CHANNELS) {
                    if (n.text?.includes(`em ${ch.label}`) || n.text?.includes(`em ${ch.id}`)) { canal = ch.id; break; }
                  }
                  if (!canal && (n.text?.toLowerCase().includes("anúncio") || n.text?.toLowerCase().includes("anuncio"))) canal = "anuncios";
                  if (!canal) canal = "anuncios";
                }
                if (setForumCanal) setForumCanal(canal);
                setTab("forum");
              } else if (isDoodleNotif) {
                setTab("home");
                setTimeout(() => scrollToAgenda?.(), 100);
              } else if (isMedalNotif) {
                setTab("perfil");
              } else if (isRodaNotif) {
                setDesafiosSubTab?.("roda"); setTab("desafios");
              } else if (isPiaNotif) {
                setTab("pia");
              } else if (isAutoNotif) {
                setTab("desafios");
              }
            }
            return (
              <div key={n.id} onClick={handleClick}
                style={{ display:"flex", gap:12, padding:"13px 14px",
                  background:"rgba(0,0,0,0.2)",
                  borderRadius:14, marginBottom:8,
                  border:"1px solid rgba(255,255,255,0.05)",
                  cursor: "pointer",
                  transition:"all 0.15s",
                  ...(previewMode ? { pointerEvents:"auto" } : {}),
                }}>
                <div style={{ flex:1 }}>
                  {(() => {
                    // "X — sobre: "Y": Z"  → action | context (italic) | reply
                    const m = n.text?.match(/^(.+?) — sobre: "(.+?)": (.+)$/s);
                    if (m) return (
                      <>
                        <div style={{ fontSize:11, color:"#64748b", marginBottom:4 }}>{m[1]}</div>
                        <div style={{ fontSize:11, color:"#94a3b8", fontStyle:"italic", paddingLeft:8, borderLeft:"2px solid rgba(255,255,255,0.1)", marginBottom:6, lineHeight:1.4 }}>"{m[2]}"</div>
                        <div style={{ fontSize:13, color:"#f1f5f9", fontWeight:600, lineHeight:1.5 }}>{m[3]}</div>
                      </>
                    );
                    // n.sobre field (forum reactions/comments)
                    if (n.sobre) return (
                      <>
                        <div style={{ fontSize:13, color:"#f1f5f9", lineHeight:1.5 }}>{n.text}</div>
                        <div style={{ fontSize:11, color:"#94a3b8", fontStyle:"italic", paddingLeft:8, borderLeft:"2px solid rgba(255,255,255,0.1)", marginTop:5, lineHeight:1.4 }}>"{n.sobre}"</div>
                      </>
                    );
                    // Teresa message with action: reply format
                    if (n.from === "teresa" && n.text?.includes(": ")) {
                      const ci = n.text.indexOf(": ");
                      if (ci < 90) return (
                        <>
                          <div style={{ fontSize:11, color:"#64748b", marginBottom:4 }}>{n.text.substring(0, ci)}</div>
                          <div style={{ fontSize:13, color:"#f1f5f9", fontWeight:600, lineHeight:1.5 }}>{n.text.substring(ci + 2)}</div>
                        </>
                      );
                    }
                    return <div style={{ fontSize:13, lineHeight:1.5, color:"#f1f5f9" }}>{n.text}</div>;
                  })()}
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
                    {(n.date || n.ts) && (
                      <span style={{ fontSize:10, color:"#475569", fontWeight:600 }}>
                        {n.ts ? new Date(n.ts).toLocaleString("pt-PT", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }) : n.date}
                      </span>
                    )}
                    {isRecursoNotif && <span style={{ fontSize:10, fontWeight:800, color:"#818cf8" }}>→ ver recursos</span>}
                    {!isRecursoNotif && isForumNotif && <span style={{ fontSize:10, fontWeight:800, color:"#7c5cbf" }}>→ ver no fórum</span>}
                    {isDoodleNotif && <span style={{ fontSize:10, fontWeight:800, color:"#22d3ee" }}>→ ver na agenda</span>}
                    {isMedalNotif && <span style={{ fontSize:10, fontWeight:800, color:"#f59e0b" }}>→ ver no perfil</span>}
                    {isRodaNotif && <span style={{ fontSize:10, fontWeight:800, color:"#a78bfa" }}>→ ver Roda da Vida</span>}
                    {isPiaNotif && <span style={{ fontSize:10, fontWeight:800, color:"#f59e0b" }}>→ ver PIA</span>}
                    {isAutoNotif && <span style={{ fontSize:10, fontWeight:800, color:"#34d399" }}>→ ver Desafios</span>}
                  </div>
                </div>
                <button onClick={e => { e.stopPropagation(); onDeleteNotif && onDeleteNotif(n.id); }}
                  style={{ background:"none", border:"none", color:"#475569", fontSize:16, cursor:"pointer", paddingTop:2, flexShrink:0, lineHeight:1,
                    ...(previewMode ? { pointerEvents:"auto" } : {}) }}>✕</button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TO-DO LIST ──────────────────────────────────────────────── */}
      <div style={CARD}>
        <div style={SL}>✅ A Minha Lista</div>

        {/* Novo item */}
        <div style={{ marginBottom:16, paddingBottom:16, borderBottom: light ? "1px solid rgba(0,0,0,0.07)" : "1px solid rgba(255,255,255,0.05)" }}>
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
          <div style={{ textAlign:"center", color: light ? "#64748b" : TXT_MUT, fontSize:13, padding:"14px 0" }}>Sem tarefas pendentes 🎉</div>
        ) : (
          minhasTarefas.sort((a,b) => (b.ts||0)-(a.ts||0)).map(tarefa => (
            <div key={tarefa.id} style={{ padding:"12px 0", borderBottom: light ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(255,255,255,0.04)" }}>
              {editTarefaId === tarefa.id ? (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <input value={editTarefaTexto} onChange={e => setEditTarefaTexto(e.target.value)}
                    style={{ ...INP, marginBottom:0 }} />
                  <input type="date" value={editTarefaData} onChange={e => setEditTarefaData(e.target.value)}
                    style={{ ...INP, marginBottom:0, fontSize:12 }} />
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => guardarEdicaoTarefa(tarefa.id)} style={{ background:"rgba(50,199,255,0.15)", border:"1px solid rgba(50,199,255,0.3)", color:CYN, borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:800, cursor:"pointer" }}>✓ Guardar</button>
                    <button onClick={() => setEditTarefaId(null)} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", color:"#64748b", borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer" }}>✕</button>
                  </div>
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div onClick={() => alternarEstadoTarefa(tarefa)} style={{
                    width:24, height:24, borderRadius:8, flexShrink:0, cursor:"pointer",
                    border:`2px solid ${tarefa.done ? "#4ade80" : light ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.15)"}`,
                    background: tarefa.done ? "#4ade80" : "transparent",
                    display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s",
                  }}>
                    {tarefa.done && <span style={{ color:"#070b14", fontWeight:900, fontSize:12 }}>✓</span>}
                  </div>
                  <div style={{ flex:1, opacity:tarefa.done ? 0.35 : 1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color: light ? "#0f172a" : "#f1f5f9", textDecoration:tarefa.done?"line-through":"none" }}>
                      {(() => { const tt = TASK_TYPES.find(t => t.id === tarefa.type); return tt && tt.id !== "geral" ? <span style={{ marginRight:5 }}>{tt.icon}</span> : null; })()}
                      {tarefa.text}
                      {tarefa.shared && <span style={{ fontSize:9, background:CYN, color:"#000", padding:"2px 5px", borderRadius:4, marginLeft:7, verticalAlign:"middle", fontWeight:900 }}>PARTILHADO</span>}
                    </div>
                    {tarefa.due && <div style={{ fontSize:11, color:isOverdue(tarefa.due) ? "#e11d48" : (light ? "#475569" : TXT_MUT), marginTop:2, fontWeight:700 }}>{fmtDate(tarefa.due)}</div>}
                  </div>
                  {!tarefa.done && (
                    <button onClick={() => { setEditTarefaId(tarefa.id); setEditTarefaTexto(tarefa.text); setEditTarefaData(tarefa.due || ""); }} style={{ background:"none", border:"none", color:"#64748b", fontSize:13, cursor:"pointer", padding:"2px 4px" }}>✏️</button>
                  )}
                  <button onClick={() => removerTarefa(tarefa.id)} style={{ background:"none", border:"none", color:"rgba(244,63,94,0.5)", fontSize:17, cursor:"pointer", padding:"2px 4px" }}>✕</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
}
