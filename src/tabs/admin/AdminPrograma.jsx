import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, PNK, INP } from "../../theme.jsx";
import { ALLOWED_USERNAMES, JEEP_LIST, nowLabel } from "../../data.js";
import AdminQuizzes from './AdminQuizzes.jsx';
import AdminVotacoes from './AdminVotacoes.jsx';
import AdminMissoes from './AdminMissoes.jsx';
import AdminAgenda from './AdminAgenda.jsx';
import AdminTarefas from './AdminTarefas.jsx';

const SUBTABS = [
  ["pergunta", "💬 Pergunta"],
  ["dilemas",  "🧠 Dilemas"],
  ["votacoes", "🗳️ Votações"],
  ["missoes",  "🎯 Missões"],
  ["agenda",   "📅 Agenda"],
  ["tarefas",  "✅ Tarefas"],
];

const JEEP_8 = JEEP_LIST.filter(j => !["teresa","ricardo","demo"].includes(j.username));

const MODOS = [
  { id:"texto",     label:"Texto",       icon:"📝" },
  { id:"audio",     label:"Áudio",       icon:"🎤" },
  { id:"3palavras", label:"3 Palavras",  icon:"🔢" },
  { id:"semana",    label:"Rating(1-5)", icon:"⭐" },
  { id:"imagem",    label:"Imagem",      icon:"📸" },
  { id:"mood",      label:"Emoji/Mood",  icon:"🎭" },
];

function PerguntaManager({ allShared, activeQ }) {
  const [activeQEdit, setActiveQEdit] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [opt3, setOpt3] = useState("");
  const [selectedModes, setSelectedModes] = useState(["texto"]);

  const toggleMode = (id) => setSelectedModes(prev =>
    prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
  );

  async function publicar() {
    if (!activeQEdit.trim()) return alert("Escreve a pergunta!");
    if (selectedModes.length === 0 && !opt1.trim()) return alert("Seleciona pelo menos um modo de resposta!");
    const opcoes = [opt1, opt2, opt3].filter(o => o.trim());
    await setDoc(doc(db, "config", "activeQuestion"), {
      text: activeQEdit.trim(), options: opcoes, modes: selectedModes, date: Date.now()
    });
    for (const u of ALLOWED_USERNAMES) {
      await setDoc(doc(db, "userData", u), { answered: false }, { merge: true });
      await addDoc(collection(db, "notifications", u, "items"), {
        from:"teresa", text:"💬 Nova pergunta da semana!", date:nowLabel(), read:false, tipo:"proposta"
      });
    }
    alert("Pergunta publicada!");
    setActiveQEdit(""); setOpt1(""); setOpt2(""); setOpt3("");
  }

  return (
    <div>
      <div style={CARD}>
        <div style={SL}>Pergunta Atual</div>
        <div style={{ fontSize:14, color:"#e2e8f0", padding:"12px", background:"rgba(0,0,0,0.2)", borderRadius:12, borderLeft:`4px solid ${CYN}` }}>
          {activeQ || <span style={{ color:"#475569" }}>Nenhuma pergunta ativa</span>}
        </div>
      </div>

      <div style={CARD}>
        <div style={SL}>Respostas Recebidas</div>
        {JEEP_8.map(j => {
          const d = allShared[j.username] || {};
          return (
            <div key={j.username} style={{ padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", gap:8, alignItems:"flex-start" }}>
              <span style={{ fontSize:13, fontWeight:800, color:j.color, flexShrink:0, minWidth:72 }}>{j.name}:</span>
              {d.answered
                ? <span style={{ fontSize:13, color:"#e2e8f0", lineHeight:1.5 }}>{d.answerText}</span>
                : <span style={{ fontSize:13, color:"#475569" }}>Pendente</span>}
            </div>
          );
        })}
      </div>

      <div style={CARD}>
        <div style={SL}>Lançar Nova Pergunta</div>
        <input value={activeQEdit} onChange={e => setActiveQEdit(e.target.value)}
          placeholder="A pergunta da semana..." style={INP} />

        <div style={{ marginBottom:15 }}>
          <div style={{ fontSize:11, color:CYN, fontWeight:800, marginBottom:8 }}>MODOS DE RESPOSTA PERMITIDOS:</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {MODOS.map(m => (
              <button key={m.id} onClick={() => toggleMode(m.id)} style={{
                padding:"10px 5px", borderRadius:10, fontSize:11, border:"none", cursor:"pointer",
                background: selectedModes.includes(m.id) ? CYN : "rgba(255,255,255,0.05)",
                color: selectedModes.includes(m.id) ? "#000" : "#fff",
                fontWeight: selectedModes.includes(m.id) ? 900 : 600,
              }}>
                <span style={{ fontSize:16, display:"block", marginBottom:2 }}>{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:15, marginBottom:15 }}>
          <div style={{ fontSize:11, color:PNK, fontWeight:800, marginBottom:8 }}>OU CRIAR BOTÕES DE OPÇÃO:</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            <input value={opt1} onChange={e => setOpt1(e.target.value)} placeholder="Opção 1" style={{ ...INP, marginBottom:0, fontSize:11 }} />
            <input value={opt2} onChange={e => setOpt2(e.target.value)} placeholder="Opção 2" style={{ ...INP, marginBottom:0, fontSize:11 }} />
            <input value={opt3} onChange={e => setOpt3(e.target.value)} placeholder="Opção 3" style={{ ...INP, marginBottom:0, fontSize:11 }} />
          </div>
        </div>

        <button onClick={publicar} style={{
          width:"100%", padding:"14px 20px", fontSize:13, fontWeight:800, letterSpacing:1.2,
          textTransform:"uppercase", background:CYN, color:"#0f172a", border:"none", borderRadius:14, cursor:"pointer"
        }}>Publicar Desafio Semanal 💬</button>
      </div>
    </div>
  );
}

export default function AdminPrograma({ allShared, events, missions, activeQ }) {
  const [sub, setSub] = useState("pergunta");
  return (
    <div>
      <div style={{ display:"flex", gap:4, marginBottom:20, overflowX:"auto", background:"rgba(0,0,0,0.3)", borderRadius:14, padding:4 }}>
        {SUBTABS.map(([id, label]) => (
          <button key={id} onClick={() => setSub(id)} style={{
            flexShrink:0, padding:"9px 14px", borderRadius:10, border:"none", cursor:"pointer", whiteSpace:"nowrap",
            background: sub === id ? CYN : "transparent",
            color: sub === id ? "#0f172a" : "#94a3b8",
            fontWeight:900, fontSize:12,
          }}>{label}</button>
        ))}
      </div>
      {sub === "pergunta" && <PerguntaManager allShared={allShared} activeQ={activeQ} />}
      {sub === "dilemas"  && <AdminQuizzes />}
      {sub === "votacoes" && <AdminVotacoes />}
      {sub === "missoes"  && <AdminMissoes missions={missions} />}
      {sub === "agenda"   && <AdminAgenda events={events} />}
      {sub === "tarefas"  && <AdminTarefas />}
    </div>
  );
}
