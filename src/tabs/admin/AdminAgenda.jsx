import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, INP, Btn, CYN } from "../../theme.jsx";
import { JEEP_LIST, ALLOWED_USERNAMES, fmtDate } from "../../data.js";

export default function AdminTarefas() {
  const [adminTodoUsr, setAdminTodoUsr] = useState("nilton");
  const [adminSuggTxt, setAdminSuggTxt] = useState("");
  const [adminSuggDue, setAdminSuggDue] = useState("");
  const [tarefasPartilhadas, setTarefasPartilhadas] = useState([]);

  // Buscar todas as tarefas partilhadas por todos os utilizadores
  useEffect(() => {
    let unsubs = [];
    let todasTarefas = [];

    ALLOWED_USERNAMES.forEach(uname => {
      const q = query(collection(db, "todos", uname, "items"));
      const unsub = onSnapshot(q, (snap) => {
        const tarefasDoUser = snap.docs
          .map(d => ({ id: d.id, userId: uname, ...d.data() }))
          .filter(t => t.shared === true && t.addedBy !== "teresa"); // Apenas partilhadas pelo jovem

        // Atualizar lista global
        todasTarefas = todasTarefas.filter(t => t.userId !== uname).concat(tarefasDoUser);
        
        // Ordenar por data mais recente de adição
        setTarefasPartilhadas([...todasTarefas].sort((a, b) => b.ts - a.ts));
      });
      unsubs.push(unsub);
    });

    return () => unsubs.forEach(u => u());
  }, []);

  async function addAdminTodo() {
    if (!adminSuggTxt.trim()) return;
    await addDoc(collection(db, "todos", adminTodoUsr, "items"), { 
      text: adminSuggTxt, due: adminSuggDue, done: false, shared: true, addedBy: "teresa", accepted: false, ts: Date.now()
    });
    setAdminSuggTxt(""); setAdminSuggDue("");
    alert("Tarefa enviada como sugestão!");
  }

  return (
    <div>
      {/* 1. ATRIBUIR TAREFA */}
      <div style={CARD}>
        <div style={SL}>Atribuir Tarefa a Jovem</div>
        <div style={{ display:"flex", gap:8, marginBottom:15, flexWrap:"wrap" }}>
          {JEEP_LIST.map(j => (
            <button key={j.name} onClick={()=>setAdminTodoUsr(j.username)} style={{ 
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
        <input value={adminSuggTxt} onChange={e=>setAdminSuggTxt(e.target.value)} placeholder="O que é preciso fazer?" style={INP}/>
        <input type="date" value={adminSuggDue} onChange={e=>setAdminSuggDue(e.target.value)} style={{ ...INP, marginBottom: 15 }}/>
        <Btn onClick={addAdminTodo}>Enviar Tarefa ✅</Btn>
      </div>

      {/* 2. TAREFAS PARTILHADAS PELOS JOVENS */}
      <div style={CARD}>
        <div style={SL}>Tarefas Partilhadas Connosco</div>
        
        {tarefasPartilhadas.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "15px 0" }}>Nenhuma tarefa partilhada pelos jovens.</div>
        ) : (
          tarefasPartilhadas.map(t => {
            const jInfo = JEEP_LIST.find(j => j.username === t.userId);
            const nomeJovem = jInfo ? jInfo.name : t.userId;
            const corJovem = jInfo ? jInfo.color : CYN;

            return (
              <div key={t.id} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
                {/* Checkbox visual para saber se está feita */}
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${t.done ? "#4ade80" : "#64748b"}`, background: t.done ? "#4ade80" : "transparent" }} />
                
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: "#fff", textDecoration: t.done ? "line-through" : "none", opacity: t.done ? 0.5 : 1 }}>
                    {t.text}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                    <span style={{ color: corJovem, fontWeight: 800 }}>{nomeJovem}</span>
                    {t.due && ` • Limite: ${fmtDate(t.due)}`}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
