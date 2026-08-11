import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, INP, Btn, CYN, GRN, PNK } from "../../theme.jsx";
import { JEEP_LIST, ALLOWED_USERNAMES, fmtDate, nowFull, TASK_TYPES } from "../../data.js";

export default function AdminTarefas() {
  const [adminTodoUsr, setAdminTodoUsr] = useState("nilton");
  const [adminSuggTxt, setAdminSuggTxt] = useState("");
  const [adminSuggDue, setAdminSuggDue] = useState("");
  const [tipoTarefa,   setTipoTarefa]   = useState("geral");
  const [modo, setModo] = useState("propor"); // "propor" | "forcar"
  const [tarefasPartilhadas, setTarefasPartilhadas] = useState([]);
  const [editId,      setEditId]      = useState(null);
  const [editText,    setEditText]    = useState("");
  const [editDue,     setEditDue]     = useState("");
  const [feedbackTxts, setFeedbackTxts] = useState({});
  const [feedbackOpen, setFeedbackOpen] = useState({});
  const [feedbackPush, setFeedbackPush] = useState({});
  const [pushTarefa,   setPushTarefa]   = useState(false);

  async function enviarFeedbackTarefa(t) {
    const txt = feedbackTxts[t.id]?.trim();
    if (!txt) return;
    const contexto = t.text ? ` — sobre: "${t.text.substring(0, 60)}${t.text.length > 60 ? "…" : ""}"` : "";
    await addDoc(collection(db, "notifications", t.userId, "items"), {
      from:"teresa", text:`Teresa reagiu ao teu tarefa partilhada${contexto}: ${txt}`,
      date:nowFull(), read:false, ts:Date.now(), tipo:"tarefa", push: !!feedbackPush[t.id]
    });
    setFeedbackTxts(p => ({ ...p, [t.id]: "" }));
    setFeedbackOpen(p => ({ ...p, [t.id]: false }));
    setFeedbackPush(p => ({ ...p, [t.id]: false }));
    alert("Feedback enviado! ✓");
  }

  useEffect(() => {
    let unsubs = [];
    let todasTarefas = [];
    ALLOWED_USERNAMES.forEach(uname => {
      const q = query(collection(db, "todos", uname, "items"));
      const unsub = onSnapshot(q, (snap) => {
        const tarefasDoUser = snap.docs
          .map(d => ({ id: d.id, userId: uname, ...d.data() }))
          .filter(t => t.shared === true);
        todasTarefas = todasTarefas.filter(t => t.userId !== uname).concat(tarefasDoUser);
        setTarefasPartilhadas([...todasTarefas].sort((a, b) => b.ts - a.ts));
      });
      unsubs.push(unsub);
    });
    return () => unsubs.forEach(u => u());
  }, []);

  async function guardarEdicao(tarefa) {
    await updateDoc(doc(db, "todos", tarefa.userId, "items", tarefa.id), { text: editText, due: editDue });
    setEditId(null);
  }

  // Só o admin pode marcar/desmarcar como feita as tarefas que o próprio admin
  // atribuiu (addedBy === "teresa"). Escreve no mesmo documento que o jovem lê,
  // por isso o estado aparece logo no perfil dele.
  async function toggleDoneAdmin(t) {
    if (t.addedBy !== "teresa") return;
    await updateDoc(doc(db, "todos", t.userId, "items", t.id), { done: !t.done });
  }

  async function addAdminTodo() {
    if (!adminSuggTxt.trim()) return;
    const isForcar = modo === "forcar";
    const targetUsr = adminTodoUsr;
    await addDoc(collection(db, "todos", targetUsr, "items"), {
      text: adminSuggTxt, due: adminSuggDue, done: false,
      shared: true, addedBy: "teresa", type: tipoTarefa,
      accepted: isForcar, ts: Date.now()
    });
    const notifText = isForcar
      ? `📋 A Teresa adicionou uma tarefa à tua lista: "${adminSuggTxt}"`
      : `📋 A Teresa propôs-te uma tarefa: "${adminSuggTxt}". Vai ao Início para aceitar ou recusar!`;
    await addDoc(collection(db, "notifications", targetUsr, "items"), {
      from: "teresa", text: notifText, date: nowFull(), read: false, ts: Date.now(), tipo: "proposta", push: pushTarefa
    });
    setAdminSuggTxt(""); setAdminSuggDue(""); setPushTarefa(false);
    alert(isForcar ? "Tarefa adicionada diretamente!" : "Sugestão de tarefa enviada!");
  }

  return (
    <div>
      {/* 1. ATRIBUIR TAREFA */}
      <div style={CARD}>
        <div style={SL}>Atribuir Tarefa a Jovem</div>

        {/* Modo propor / forçar */}
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {[
            { id:"propor", label:"📩 Propor", desc:"Jovem aceita ou recusa" },
            { id:"forcar", label:"✅ Forçar",  desc:"Entra diretamente na lista" },
          ].map(m => (
            <button key={m.id} onClick={() => setModo(m.id)} style={{
              flex:1, padding:"10px 8px", borderRadius:12, cursor:"pointer",
              border: modo === m.id ? `1.5px solid ${m.id === "forcar" ? GRN : CYN}` : "1.5px solid rgba(255,255,255,0.08)",
              background: modo === m.id ? `${m.id === "forcar" ? GRN : CYN}15` : "rgba(255,255,255,0.03)",
              color: modo === m.id ? (m.id === "forcar" ? GRN : CYN) : "#64748b",
              fontWeight:800, fontSize:12, textAlign:"center",
            }}>
              <div>{m.label}</div>
              <div style={{ fontSize:10, fontWeight:600, marginTop:2, opacity:0.75 }}>{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Selecionar jovem */}
        <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
          {JEEP_LIST.map(j => (
            <button key={j.name} onClick={() => setAdminTodoUsr(j.username)} style={{
              padding:"8px 16px", borderRadius:20,
              border: adminTodoUsr === j.username ? `1px solid ${j.color}` : "1px solid rgba(255,255,255,0.1)",
              background: adminTodoUsr === j.username ? `${j.color}20` : "rgba(255,255,255,0.05)",
              fontSize:12, fontWeight:700, cursor:"pointer",
              color: adminTodoUsr === j.username ? j.color : "#94a3b8"
            }}>
              {j.name}
            </button>
          ))}
        </div>

        {/* Tipo de tarefa */}
        <div style={{ display:"flex", gap:6, marginBottom:14 }}>
          {TASK_TYPES.map(t => (
            <button key={t.id} onClick={() => setTipoTarefa(t.id)} style={{
              flex:1, padding:"8px 4px", borderRadius:10, cursor:"pointer",
              border: tipoTarefa === t.id ? `1.5px solid ${t.color}` : "1.5px solid rgba(255,255,255,0.08)",
              background: tipoTarefa === t.id ? `${t.color}18` : "rgba(255,255,255,0.03)",
              color: tipoTarefa === t.id ? t.color : "#64748b",
              fontWeight:800, fontSize:11, textAlign:"center",
            }}>
              <div style={{ fontSize:16, marginBottom:2 }}>{t.icon}</div>
              {t.label}
            </button>
          ))}
        </div>

        <input value={adminSuggTxt} onChange={e => setAdminSuggTxt(e.target.value)}
          placeholder="O que é preciso fazer?" style={INP} />
        <input type="date" value={adminSuggDue} onChange={e => setAdminSuggDue(e.target.value)}
          style={{ ...INP, marginBottom:10 }} />
        <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#94a3b8", cursor:"pointer", marginBottom:12 }}>
          <input type="checkbox" checked={pushTarefa} onChange={() => setPushTarefa(v => !v)}
            style={{ accentColor:CYN, width:14, height:14 }} />
          🔔 Enviar também como notificação push
        </label>
        <Btn onClick={addAdminTodo}>
          {modo === "forcar" ? "Adicionar Tarefa ✅" : "Enviar Sugestão 📩"}
        </Btn>
      </div>

      {/* 2. TAREFAS PARTILHADAS PELOS JOVENS */}
      <div style={CARD}>
        <div style={SL}>Tarefas Partilhadas Connosco</div>
        {tarefasPartilhadas.length === 0 ? (
          <div style={{ textAlign:"center", color:"#94a3b8", fontSize:13, padding:"15px 0" }}>Nenhuma tarefa partilhada pelos jovens.</div>
        ) : (
          tarefasPartilhadas.map(t => {
            const jInfo = JEEP_LIST.find(j => j.username === t.userId);
            const nomeJovem = jInfo ? jInfo.name : t.userId;
            const corJovem  = jInfo ? jInfo.color : CYN;
            return (
              <div key={t.id} style={{ padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                {editId === t.id ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <input value={editText} onChange={e => setEditText(e.target.value)}
                      style={{ ...INP, marginBottom:0 }} />
                    <input type="date" value={editDue} onChange={e => setEditDue(e.target.value)}
                      style={{ ...INP, marginBottom:0, fontSize:12 }} />
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => guardarEdicao(t)} style={{ background:"rgba(50,199,255,0.15)", border:"1px solid rgba(50,199,255,0.3)", color:CYN, borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:800, cursor:"pointer" }}>✓ Guardar</button>
                      <button onClick={() => setEditId(null)} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", color:"#64748b", borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer" }}>✕ Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      {t.addedBy === "teresa" ? (
                        <button onClick={() => toggleDoneAdmin(t)} title={t.done ? "Marcar como por fazer" : "Marcar como feita"}
                          style={{ width:20, height:20, borderRadius:5, border:`2px solid ${t.done ? "#4ade80" : "#64748b"}`, background:t.done ? "#4ade80" : "transparent", flexShrink:0, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", padding:0, color:"#0b1220", fontSize:13, fontWeight:900, lineHeight:1 }}>
                          {t.done ? "✓" : ""}
                        </button>
                      ) : (
                        <div title="Só podes marcar as tarefas que foste tu a atribuir" style={{ width:16, height:16, borderRadius:4, border:`2px solid ${t.done ? "#4ade80" : "#64748b"}`, background:t.done ? "#4ade80" : "transparent", flexShrink:0 }} />
                      )}
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, color:"#fff", textDecoration:t.done?"line-through":"none", opacity:t.done?0.5:1 }}>{t.text}</div>
                        <div style={{ fontSize:11, color:"#94a3b8", marginTop:4 }}>
                          <span style={{ color:corJovem, fontWeight:800 }}>{nomeJovem}</span>
                          {t.due && ` • Limite: ${fmtDate(t.due)}`}
                          {t.addedBy === "teresa" && <span style={{ marginLeft:6, color:CYN, fontWeight:800 }}>·admin</span>}
                        </div>
                      </div>
                      {t.addedBy === "teresa" && (
                        <button onClick={() => { setEditId(t.id); setEditText(t.text); setEditDue(t.due || ""); }} style={{ background:"none", border:"none", color:"#64748b", fontSize:13, cursor:"pointer", padding:"2px 4px" }}>✏️</button>
                      )}
                      <button onClick={() => setFeedbackOpen(p => ({ ...p, [t.id]: !p[t.id] }))} style={{ background:"none", border:"none", color: feedbackOpen[t.id] ? CYN : "#64748b", fontSize:13, cursor:"pointer", padding:"2px 4px" }}>💬</button>
                    </div>
                    {feedbackOpen[t.id] && (
                      <div style={{ marginTop:8 }}>
                        <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                          <input value={feedbackTxts[t.id] || ""} onChange={e => setFeedbackTxts(p => ({ ...p, [t.id]: e.target.value }))}
                            placeholder={`Comentar tarefa de ${nomeJovem}…`}
                            style={{ ...INP, flex:1, marginBottom:0, fontSize:12, padding:"8px 12px" }} />
                          <button onClick={() => enviarFeedbackTarefa(t)}
                            style={{ background:`${CYN}20`, border:`1px solid ${CYN}40`, color:CYN, borderRadius:10, padding:"0 14px", fontWeight:900, fontSize:12, cursor:"pointer" }}>
                            Enviar
                          </button>
                        </div>
                        <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:11, color:"#94a3b8", cursor:"pointer" }}>
                          <input type="checkbox" checked={!!feedbackPush[t.id]} onChange={() => setFeedbackPush(p => ({ ...p, [t.id]: !p[t.id] }))}
                            style={{ accentColor:CYN, width:13, height:13 }} />
                          🔔 Enviar também como notificação push
                        </label>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
