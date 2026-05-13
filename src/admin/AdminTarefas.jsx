import React, { useState } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, INP, Btn } from "../../theme.jsx";
import { JEEP_LIST } from "../../data.js";

export default function AdminTarefas() {
  const [adminTodoUsr, setAdminTodoUsr] = useState("nilton");
  const [adminSuggTxt, setAdminSuggTxt] = useState("");
  const [adminSuggDue, setAdminSuggDue] = useState("");

  async function addAdminTodo() {
    if (!adminSuggTxt.trim()) return;
    await addDoc(collection(db, "todos", adminTodoUsr, "items"), { 
      text: adminSuggTxt, due: adminSuggDue, done: false, shared: true, addedBy: "teresa", accepted: false 
    });
    setAdminSuggTxt(""); setAdminSuggDue("");
    alert("Tarefa enviada como sugestão!");
  }

  return (
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
      <input type="date" value={adminSuggDue} onChange={e=>setAdminSuggDue(e.target.value)} style={INP}/>
      <Btn onClick={addAdminTodo}>Enviar Tarefa ✅</Btn>
    </div>
  );
}
