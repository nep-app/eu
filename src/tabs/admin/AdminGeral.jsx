import React, { useState, useEffect } from 'react';
import { doc, setDoc, addDoc, collection, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, GRN, Btn, INP, PNK } from "../../theme.jsx";
import { nowLabel, fmtDate, getWeekKey, ALLOWED_USERNAMES, JEEP_LIST } from "../../data.js";

export default function AdminGeral({ allShared, leaderboard, adminNotifs, activeQ }) {
  const [features, setFeatures] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "features"), s => {
      setFeatures(s.exists() ? s.data() : {});
    });
    return unsub;
  }, []);

  async function toggleFeature(key) {
    const newVal = !features[key];
    await setDoc(doc(db, "config", "features"), { [key]: newVal }, { merge: true });
  }

  const FEATURES = [
    { key:"perguntaSemanal", label:"💬 Pergunta da Semana",      desc:"Sub-tab Pergunta nos Desafios" },
    { key:"autoAvaliacao",   label:"📊 Autoavaliação",           desc:"Sub-tab Auto nos Desafios" },
    { key:"satisfacao",      label:"😊 Satisfação",              desc:"Sub-tab Satisfação nos Desafios" },
    { key:"rodaVida",        label:"🌸 Roda da Vida",            desc:"Secção Roda no Perfil" },
  ];
  const [launchType, setLaunchType] = useState("auto");
  const [launchTarget, setLaunchTarget] = useState("all");
  const [launchPrazo, setLaunchPrazo] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState({});
  const [feedbackTexts, setFeedbackTexts] = useState({});
  const [activeQEdit, setActiveQEdit] = useState("");
  
  // Opções para botões
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [opt3, setOpt3] = useState("");

  // SELEÇÃO MÚLTIPLA DE MODOS (HÍBRIDO)
  const MODOS_DISPONIVEIS = [
    { id: "texto", label: "Texto", icon: "📝" },
    { id: "audio", label: "Áudio", icon: "🎤" },
    { id: "3palavras", label: "3 Palavras", icon: "🔢" },
    { id: "semana", label: "Rating (1-5)", icon: "⭐" },
    { id: "imagem", label: "Imagem", icon: "📸" },
    { id: "mood", label: "Emoji/Mood", icon: "🎭" }
  ];
  const [selectedModes, setSelectedModes] = useState(["texto"]);

  const toggleMode = (id) => {
    if (selectedModes.includes(id)) {
      setSelectedModes(selectedModes.filter(m => m !== id));
    } else {
      setSelectedModes([...selectedModes, id]);
    }
  };

  async function launchRequest() {
    let msg = ""; let field = null;
    if (launchType === "auto")         { msg = "📊 Nova Autoavaliação pedida!"; field = "autoSaved"; }
    if (launchType === "satisf")       { msg = "😊 Nova Avaliação de Satisfação pedida!"; field = "sSaved"; }
    if (launchType === "pia")          { msg = "📋 Atualização do PIA pedida!"; field = "piaSaved"; }
    if (launchType === "roda")         { msg = "🌸 Nova Roda da Vida pedida!"; field = "rodaSaved"; }
    if (launchType === "swot")         { msg = "🔍 Raio-X do Projeto pedido!"; field = "swotSaved"; }
    if (launchType === "pergunta")     { msg = "💬 Lembrete: Responde à Pergunta da Semana!"; field = "answered"; }
    if (launchType === "lembreteQuiz") { msg = "🧠 Lembrete: Tens um novo Dilema (Quiz) à tua espera nos Desafios!"; }
    if (launchType === "lembreteGeral"){ msg = "📢 A Teresa tem um aviso para ti. Vai ver as novidades!"; }
    if (launchPrazo) msg += ` ⏰ Prazo: ${fmtDate(launchPrazo)}`;

    const targets = launchTarget === "all" ? ALLOWED_USERNAMES : [launchTarget];
    for (const u of targets) {
      if (field) {
        const prazoData = launchPrazo ? { [field + "Prazo"]: launchPrazo } : {};
        await setDoc(doc(db, "userData", u), { [field]: false, ...prazoData }, { merge: true });
      }
      const isReminder = launchType === "lembreteGeral";
      await addDoc(collection(db, "notifications", u, "items"), { from:"teresa", text:msg, date:nowLabel(), read:false, ...(!isReminder ? { tipo:"proposta" } : {}), ...(launchPrazo ? { prazo:launchPrazo } : {}) });
    }
    setLaunchPrazo("");
    alert("Pedidos/Lembretes lançados com sucesso!");
  }

  async function sendFeedback(notif, msg) {
    if (!msg?.trim() || !ALLOWED_USERNAMES.includes(notif.jovem)) return;
    const tipoLabel = {
      PERGUNTA: "resposta à Pergunta da Semana", AUTOAVALIACAO: "Autoavaliação",
      PIA: "PIA", RODA: "Roda da Vida", QUIZ: "Dilema",
      FORUM_POST: "publicação no Fórum", MENSAGEM: "mensagem",
      TAREFA_ACEITE: "tarefa", EVENTO_ACEITE: "participação no evento",
    }[notif.tipo] || "envio";
    const text = `Teresa reagiu ao teu ${tipoLabel}: ${msg.trim()}`;
    await addDoc(collection(db, "notifications", notif.jovem, "items"), { from:"teresa", text, date:nowLabel(), read:false });
    await updateDoc(doc(db, "adminNotificacoes", notif.id), { feedback: msg.trim(), lida: true });
    setFeedbackTexts(p => ({...p, [notif.id]: ""}));
    setFeedbackOpen(p => ({...p, [notif.id]: false}));
  }

  async function iniciarNovaSemana(fromMidnight) {
    const ts = fromMidnight
      ? new Date(new Date().toDateString()).getTime() // hoje às 00:00
      : Date.now();
    const label = fromMidnight ? "hoje à meia-noite" : "agora";
    if (!window.confirm(`Iniciar semana desde ${label}? Nenhum dado é apagado — o XP semanal passa a contar a partir desse momento.`)) return;
    await setDoc(doc(db, "config", "weekStart"), { ts, label: nowLabel() });
    alert(`Semana iniciada desde ${label}! 🆕\nO ranking já está a calcular o XP a partir dessa hora.`);
  }

  async function updateActiveQ() {
    if (!activeQEdit.trim()) return alert("Escreve a pergunta!");
    if (selectedModes.length === 0 && opt1 === "") return alert("Seleciona pelo menos um modo de resposta!");
    
    const opcoesFinais = [opt1, opt2, opt3].filter(o => o.trim() !== "");

    await setDoc(doc(db, "config", "activeQuestion"), { 
      text: activeQEdit.trim(), 
      options: opcoesFinais, 
      modes: selectedModes, 
      date: Date.now() 
    });

    const qTargets = ALLOWED_USERNAMES;
    for (const u of qTargets) {
      await setDoc(doc(db, "userData", u), { answered: false }, { merge: true });
      await addDoc(collection(db, "notifications", u, "items"), { from:"teresa", text:"💬 Nova pergunta da semana!", date:nowLabel(), read:false, tipo:"proposta" });
    }
    alert("Pergunta publicada com os modos selecionados!");
    setActiveQEdit(""); setOpt1(""); setOpt2(""); setOpt3("");
  }

  async function markAdminNotifAsRead(notifId) {
    await updateDoc(doc(db, "adminNotificacoes", notifId), { lida: true });
  }

  // Filtramos as notificações não lidas
  const alertasNaoLidos = adminNotifs.filter(n => !n.lida);

  return (
    <div>
      {/* 0. CONTROLO DE FUNCIONALIDADES */}
      <div style={CARD}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={SL}>🔧 Funcionalidades Ativas</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {FEATURES.map(f => {
            const on = !!features[f.key];
            return (
              <div key={f.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderRadius:12, background:"rgba(0,0,0,0.2)", border: on ? `1px solid ${GRN}30` : "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:800, color: on ? "#f1f5f9" : "#64748b" }}>{f.label}</div>
                  <div style={{ fontSize:10, color:"#475569" }}>{f.desc}</div>
                </div>
                <button onClick={() => toggleFeature(f.key)} style={{
                  background: on ? `${GRN}20` : "rgba(255,255,255,0.06)",
                  border: on ? `1.5px solid ${GRN}60` : "1.5px solid rgba(255,255,255,0.1)",
                  color: on ? GRN : "#64748b",
                  borderRadius:20, padding:"6px 18px", fontWeight:900, fontSize:12, cursor:"pointer",
                  minWidth:70, textAlign:"center",
                }}>
                  {on ? "ON ✓" : "OFF"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 0b. UTILIZADOR DEMO */}
      <div style={CARD}>
        <div style={SL}>🎭 Utilizador Demo</div>
        <div style={{ fontSize:11, color:"#475569", marginBottom:12, lineHeight:1.6 }}>
          Partilha o username <span style={{ color:CYN, fontWeight:800 }}>demo</span> com quem queiras (Gulbenkian, colegas, etc.). O fórum é isolado e nenhuma ação afeta os dados reais. Usa o botão abaixo para pré-popular dados realistas.
        </div>
        <button onClick={async () => {
          const { setDoc: sd, addDoc: ad, collection: col, doc: d } = await import("firebase/firestore");
          const now = Date.now();
          await sd(d(db, "userData", "demo"), {
            weekXp: 95, dayStreak: 3, answered: false, autoSaved: false, sSaved: false, piaSaved: false,
            piaUnlocked: { s1:true, s2:true }, featureOverrides: {},
            dScores: { empreendedorismo:7, comunicacao:6, trabalhoEquipa:8, autonomia:5, criatividade:7, lideranca:6, adaptabilidade:8, responsabilidade:7 },
            roda: { saude:6, familia:7, amigos:8, amor:5, financas:4, carreira:7, diversao:8, desenvolvimentoPessoal:6 },
            history: [
              { date:nowLabel(), action:"Respondeu à Pergunta da Semana", ts:now-3600000, xp:15 },
              { date:nowLabel(), action:"Completou missão: Partilha no Fórum", ts:now-7200000, xp:20 },
              { date:nowLabel(), action:"Concluiu a tarefa: Pesquisar estágios", ts:now-86400000, xp:5 },
              { date:nowLabel(), action:"Autoavaliação submetida", ts:now-172800000, xp:25 },
              { date:nowLabel(), action:"Publicou no Fórum", ts:now-259200000, xp:5 },
            ],
            completedMissions: [],
          }, { merge:false });
          await sd(d(db, "medals", "demo"), {
            week: ["estrela", "comunicador"], weekKey: (await import("../../data.js")).getWeekKey(),
            allTime: ["estrela", "comunicador", "pontual"]
          });
          await sd(d(db, "todos", "demo"), {});
          await ad(col(db, "todos", "demo", "items"), { text:"Pesquisar oportunidades de estágio", due:"", done:true, shared:false, ts:now-86400000 });
          await ad(col(db, "todos", "demo", "items"), { text:"Preparar apresentação do projeto", due:"2026-06-01", done:false, shared:true, ts:now-3600000 });
          alert("Dados demo inicializados! ✅");
        }} style={{ width:"100%", padding:"12px", background:`${CYN}18`, border:`1px solid ${CYN}30`, color:CYN, borderRadius:12, fontWeight:900, fontSize:13, cursor:"pointer" }}>
          🔄 Inicializar / Resetar Dados Demo
        </button>
      </div>

      {/* 0d. PIA — LANÇAR SECÇÕES A TODOS */}
      <div style={CARD}>
        <div style={SL}>🚀 PIA — Lançar Secções</div>
        <div style={{ fontSize:11, color:"#475569", marginBottom:12 }}>
          Abre/fecha secções do PIA para todos os jovens de uma vez. Usa o Dossier individual para controlo por pessoa.
        </div>
        {[
          { id:"s1",  title:"1. Identificação", icon:"👤" },
          { id:"s2",  title:"2. Diagnóstico",   icon:"🔍" },
          { id:"s3",  title:"3. Atributos",     icon:"⭐" },
          { id:"s3b", title:"3b. Raio-X",       icon:"📊" },
          { id:"s4",  title:"4. Projeto",       icon:"🚀" },
          { id:"s5",  title:"5. Monitorização", icon:"📈" },
        ].map(sec => (
          <div key={sec.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderRadius:12, background:"rgba(0,0,0,0.2)", marginBottom:6 }}>
            <div style={{ fontSize:13, fontWeight:800 }}>{sec.icon} {sec.title}</div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={async () => {
                const targets = ALLOWED_USERNAMES;
                for (const u of targets) await setDoc(doc(db,"userData",u), { piaUnlocked: { [sec.id]: true } }, { merge:true });
                alert(`Secção "${sec.title}" aberta para todos!`);
              }} style={{ background:`${GRN}18`, border:`1px solid ${GRN}40`, color:GRN, borderRadius:8, padding:"5px 12px", fontWeight:900, fontSize:11, cursor:"pointer" }}>
                🔓 Abrir a todos
              </button>
              <button onClick={async () => {
                if (!window.confirm(`Fechar "${sec.title}"?`)) return;
                const targets = ALLOWED_USERNAMES;
                for (const u of targets) await setDoc(doc(db,"userData",u), { piaUnlocked: { [sec.id]: false } }, { merge:true });
                alert(`Secção "${sec.title}" fechada para todos.`);
              }} style={{ background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.25)", color:"#f43f5e", borderRadius:8, padding:"5px 12px", fontWeight:900, fontSize:11, cursor:"pointer" }}>
                🔒 Fechar a todos
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 1. NOTIFICAÇÕES */}
      {alertasNaoLidos.length > 0 && (
        <div style={{ ...CARD, background:"rgba(239,68,68,0.05)", border:"1px solid rgba(239,68,68,0.2)" }}>
          <div style={{ ...SL, color:"#ef4444" }}>🔔 Alertas Recentes</div>
          {alertasNaoLidos.slice(0, 15).map(n => {
            const nome = JEEP_LIST.find(j=>j.username===n.jovem)?.name || n.jovem;
            const canReply = ALLOWED_USERNAMES.includes(n.jovem);
            const isOpen = feedbackOpen[n.id];
            const texto = (() => {
              if (n.tipo === "AUTOAVALIACAO")   return `📊 ${nome} entregou a autoavaliação.`;
              if (n.tipo === "PIA")             return `📋 ${nome} ${n.atualizado ? "atualizou" : "enviou"} o PIA.`;
              if (n.tipo === "MENSAGEM")        return `💬 ${n.anon ? "Mensagem anónima" : nome + " enviou uma mensagem"}: "${n.texto}${n.texto?.length>=60?"…":""}"`;
              if (n.tipo === "PERGUNTA")        return `💬 ${nome} respondeu à pergunta semanal${n.texto ? `: "${n.texto}${n.texto.length>=60?"…":""}"` : "."}`;
              if (n.tipo === "QUIZ")            return `🧠 ${nome} respondeu ao dilema "${n.quizTitle||""}".`;
              if (n.tipo === "RODA")            return `🌸 ${nome} partilhou a Roda da Vida.`;
              if (n.tipo === "FORUM_POST")      return `🌐 ${nome} publicou no fórum (${n.canal})${n.texto ? `: "${n.texto}${n.texto.length>=60?"…":""}"` : "."}`;
              if (n.tipo === "TAREFA_ACEITE")   return `✅ ${nome} aceitou uma tarefa proposta.`;
              if (n.tipo === "TAREFA_RECUSADA") return `❌ ${nome} recusou uma tarefa proposta.`;
              if (n.tipo === "EVENTO_ACEITE")   return `✅ ${nome} aceitou um evento proposto.`;
              if (n.tipo === "EVENTO_RECUSADO") return `❌ ${nome} recusou um evento proposto.`;
              return `😊 Nova Satisfação Anónima submetida.`;
            })();
            return (
              <div key={n.id} style={{ background:"rgba(0,0,0,0.2)", borderRadius:12, marginBottom:8, overflow:"hidden" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"10px 12px" }}>
                  <div style={{ fontSize:13, color:"white", flex:1, lineHeight:1.5 }}>{texto}</div>
                  <div style={{ display:"flex", gap:5, flexShrink:0, marginLeft:8 }}>
                    {canReply && (
                      <button onClick={() => setFeedbackOpen(p => ({...p, [n.id]: !isOpen}))}
                        style={{ background: isOpen ? `${CYN}20` : "rgba(255,255,255,0.07)", border: isOpen ? `1px solid ${CYN}40` : "1px solid rgba(255,255,255,0.1)", color: isOpen ? CYN : "#94a3b8", borderRadius:8, padding:"4px 9px", fontSize:11, cursor:"pointer", fontWeight:800 }}>
                        💬
                      </button>
                    )}
                    <button onClick={() => markAdminNotifAsRead(n.id)}
                      style={{ background:"none", border:"1px solid #ef4444", color:"#ef4444", borderRadius:8, padding:"4px 8px", fontSize:11, cursor:"pointer" }}>
                      ✓
                    </button>
                  </div>
                </div>
                {n.feedback && (
                  <div style={{ padding:"6px 12px 10px", fontSize:11, color:CYN, borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                    Feedback enviado: {n.feedback}
                  </div>
                )}
                {isOpen && (
                  <div style={{ padding:"8px 12px 12px", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                      {["👏","🔥","⭐","💪","❤️","🙌","👀"].map(emoji => (
                        <button key={emoji} onClick={() => sendFeedback(n, emoji)}
                          style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"5px 8px", fontSize:16, cursor:"pointer" }}>
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <input value={feedbackTexts[n.id]||""} onChange={e => setFeedbackTexts(p => ({...p, [n.id]: e.target.value}))}
                        onKeyDown={e => e.key === "Enter" && sendFeedback(n, feedbackTexts[n.id])}
                        placeholder="Escreve um feedback..." style={{ ...INP, flex:1, marginBottom:0, fontSize:12, padding:"8px 12px" }} />
                      <button onClick={() => sendFeedback(n, feedbackTexts[n.id])}
                        style={{ background:CYN, color:"#0f172a", border:"none", borderRadius:10, padding:"0 16px", fontWeight:900, fontSize:12, cursor:"pointer" }}>
                        Enviar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 2. LANÇAR PEDIDOS & LEMBRETES */}
      <div style={CARD}>
        <div style={SL}>Lançar Pedidos aos Jovens</div>
        <div style={{ display:"flex", gap:8, marginBottom:8 }}>
          <select value={launchType} onChange={e=>setLaunchType(e.target.value)} style={{ flex:1, padding:12, borderRadius:12, background:"rgba(0,0,0,0.3)", color:"white", border:"1px solid rgba(255,255,255,0.1)" }}>
            <optgroup label="Ações Obrigatórias">
              <option value="auto">📊 Autoavaliação</option>
              <option value="satisf">😊 Satisfação</option>
              <option value="pia">📋 Atualizar PIA</option>
              <option value="roda">🌸 Roda da Vida</option>
              <option value="swot">🔍 Raio-X do Projeto (SWOT)</option>
              <option value="pergunta">💬 Pergunta da Semana</option>
            </optgroup>
            <optgroup label="Lembretes">
              <option value="lembreteQuiz">🧠 Lembrete: Novo Dilema (Quiz)</option>
              <option value="lembreteGeral">📢 Lembrete: Aviso Geral</option>
            </optgroup>
          </select>
          <select value={launchTarget} onChange={e=>setLaunchTarget(e.target.value)} style={{ flex:1, padding:12, borderRadius:12, background:"rgba(0,0,0,0.3)", color:"white", border:"1px solid rgba(255,255,255,0.1)" }}>
            <option value="all">Todos</option>
            {JEEP_LIST.map(j=><option key={j.username} value={j.username}>{j.name}</option>)}
          </select>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <div style={{ fontSize:11, fontWeight:800, color:"#64748b", flexShrink:0 }}>⏰ Prazo (opcional):</div>
          <input type="date" value={launchPrazo} onChange={e => setLaunchPrazo(e.target.value)}
            style={{ ...INP, flex:1, marginBottom:0, fontSize:12, padding:"8px 12px" }} />
          {launchPrazo && <button onClick={() => setLaunchPrazo("")} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer", fontSize:16 }}>✕</button>}
        </div>
        <Btn onClick={launchRequest}>Enviar Pedido / Lembrete 🚀</Btn>
      </div>

      {/* 3. RANKING */}
      <div style={CARD}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:15 }}>
          <div style={SL}>🏆 XP Semanal</div>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={() => iniciarNovaSemana(true)} style={{ background:"rgba(251,191,36,0.12)", color:"#fbbf24", border:"1px solid rgba(251,191,36,0.3)", padding:"6px 10px", borderRadius:10, fontSize:11, fontWeight:900, cursor:"pointer" }}>🌅 Desde hoje</button>
            <button onClick={() => iniciarNovaSemana(false)} style={{ background:"rgba(244,63,94,0.12)", color:"#f43f5e", border:"1px solid rgba(244,63,94,0.25)", padding:"6px 10px", borderRadius:10, fontSize:11, fontWeight:900, cursor:"pointer" }}>⏱ Agora</button>
          </div>
        </div>              
        <div style={{ display:"flex", justifyContent:"flex-end", gap:8, marginBottom:8, fontSize:10, fontWeight:900, color:"#475569", paddingRight:2 }}>
          <span style={{ width:70, textAlign:"right" }}>TOTAL</span>
          <span style={{ width:70, textAlign:"right" }}>SEMANA</span>
        </div>
        {Object.entries(leaderboard).sort((a,b)=>b[1].xp-a[1].xp).map((e, i) => {
          const totalXp = (allShared[e[0]]?.history || []).reduce((s,h) => s + (h.xp||0), 0);
          return (
            <div key={e[0]} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize:14, fontWeight:800, color:"#94a3b8", width:22 }}>#{i+1}</span>
              <div style={{ flex:1, fontSize:14, fontWeight:700 }}>{e[1].name}</div>
              <div style={{ width:70, textAlign:"right", fontSize:13, fontWeight:700, color:"#64748b" }}>{totalXp} XP</div>
              <div style={{ width:70, textAlign:"right", fontSize:14, fontWeight:800, color:CYN }}>{e[1].xp} XP</div>
            </div>
          );
        })}
      </div>

      {/* 4. PERGUNTA DA SEMANA */}
      <div style={CARD}>
        <div style={SL}>Lançar Pergunta da Semana</div>
        <div style={{ fontSize:13, color:"white", marginBottom:15, padding:"12px", background:"rgba(0,0,0,0.2)", borderRadius:12, borderLeft:`4px solid ${CYN}` }}>{activeQ}</div>
        
        <input value={activeQEdit} onChange={e=>setActiveQEdit(e.target.value)} placeholder="A pergunta da semana..." style={INP}/>
        
        <div style={{ marginBottom: 15 }}>
          <div style={{ fontSize: 11, color: CYN, fontWeight: 800, marginBottom: 8 }}>MODOS DE RESPOSTA PERMITIDOS:</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {MODOS_DISPONIVEIS.map(m => (
              <button 
                key={m.id} 
                onClick={() => toggleMode(m.id)}
                style={{
                  padding: "10px 5px", borderRadius: "10px", fontSize: "11px", border: "none", cursor: "pointer",
                  background: selectedModes.includes(m.id) ? CYN : "rgba(255,255,255,0.05)",
                  color: selectedModes.includes(m.id) ? "#000" : "#fff",
                  fontWeight: selectedModes.includes(m.id) ? 900 : 600,
                  transition: "0.2s"
                }}
              >
                <span style={{ fontSize: 16, display: "block", marginBottom: 2 }}>{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 15 }}>
          <div style={{ fontSize: 11, color: PNK, fontWeight: 800, marginBottom: 8 }}>OU CRIAR BOTÕES DE OPÇÃO:</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <input value={opt1} onChange={e=>setOpt1(e.target.value)} placeholder="Opção 1" style={{ ...INP, marginBottom: 0, fontSize: 11 }} />
            <input value={opt2} onChange={e=>setOpt2(e.target.value)} placeholder="Opção 2" style={{ ...INP, marginBottom: 0, fontSize: 11 }} />
            <input value={opt3} onChange={e=>setOpt3(e.target.value)} placeholder="Opção 3" style={{ ...INP, marginBottom: 0, fontSize: 11 }} />
          </div>
        </div>
        
        <button onClick={updateActiveQ} style={{ marginTop:15, width:"100%", padding:"14px 20px", fontSize:13, fontWeight:800, letterSpacing:1.2, textTransform:"uppercase", background:CYN, color:"#0f172a", border:"none", borderRadius:14, cursor:"pointer" }}>Publicar Desafio Semanal 💬</button>
      </div>

      {/* 5. RESPOSTAS */}
      <div style={CARD}>
        <div style={SL}>Respostas Recebidas</div>
        {JEEP_LIST.map(j => {
          let d = allShared[j.username] || {};
          return (
            <div key={j.username} style={{ padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize:14, fontWeight:700 }}>{j.name}: {d.answered ? <span style={{ color:CYN, fontWeight:400 }}>{d.answerText}</span> : <span style={{ color:"#475569" }}>Pendente</span>}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
