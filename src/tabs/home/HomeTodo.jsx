import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, INP } from "../../theme.jsx";
import { nowLabel, fmtDate, isOverdue } from "../../data.js";

export default function HomeTodo({ user, data }) {
  const [novaTarefaTexto, setNovaTarefaTexto] = useState("");
  const [novaTarefaData, setNovaTarefaData] = useState("");
  const [partilharTarefaCheck, setPartilharTarefaCheck] = useState(false);

  const uData = data.userData || {};
  const listaTarefas = data.todos || [];
  const tarefasSugestao = listaTarefas.filter(t => t.addedBy === "teresa" && t.accepted === false);
  const minhasTarefas = listaTarefas.filter(t => t.addedBy !== "teresa" || t.accepted === true);

  async function criarNovaTarefa() {
    if (!novaTarefaTexto.trim()) return;
    try {
      await addDoc(collection(db, "todos", user.username, "items"), {
        text: novaTarefaTexto, due: novaTarefaData, done: false, shared: partilharTarefaCheck, ts: Date.now()
      });
      setNovaTarefaTexto(""); setNovaTarefaData(""); setPartilharTarefaCheck(false);
    } catch (erro) { console.error(erro); }
  }

  async function alternarEstadoTarefa(tarefa) {
    try {
      await updateDoc(doc(db, "todos", user.username, "items", tarefa.id), { done: !tarefa.done });
      if (!tarefa.done) {
        const newHistory = [...(data.history || []), { date: nowLabel(), action: `Concluiu a tarefa: ${tarefa.text}`, ts: Date.now(), xp: 5 }];
        await setDoc(doc(db, "userData", user.username), { history: newHistory, weekXp: (uData.weekXp || 0) + 5 }, { merge: true });
      }
    } catch (erro) { console.error(erro); }
  }

  async function removerTarefa(idTarefa) {
    if (window.confirm("Queres mesmo apagar esta tarefa?")) {
      await deleteDoc(doc(db, "todos", user.username, "items", idTarefa));
    }
  }

  async function aceitarTarefa(id) {
    await updateDoc(doc(db, "todos", user.username, "items", id), { accepted: true, shared: true });
    alert("Tarefa aceite e adicionada à tua lista! 💪");
  }

  async function recusarTarefa(id) {
    if (window.confirm("Queres mesmo recusar esta sugestão?")) {
      await deleteDoc(doc(db, "todos", user.username, "items", id));
    }
  }

  return (
    <>
      {tarefasSugestao.length > 0 && (
        <div style={{ ...CARD, background: "rgba(34, 211, 238, 0.1)", border: `1.5px solid ${CYN}` }}>
          <div style={SL}>📩 Sugestões da Coordenação</div>
          {tarefasSugestao.map(t => (
            <div key={t.id} style={{ background: "rgba(0,0,0,0.3)", padding: 15, borderRadius: 18, marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 5 }}>{t.text}</div>
              <div style={{ fontSize: 11, color: CYN, fontWeight: 800, marginBottom: 12 }}>Prazo sugerido: {fmtDate(t.due)}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => aceitarTarefa(t.id)} style={{ flex: 1, background: CYN, color: "#070b14", border: "none", padding: "8px", borderRadius: 10, fontWeight: 900, cursor: "pointer" }}>ACEITAR</button>
                <button onClick={() => recusarTarefa(t.id)} style={{ flex: 1, background: "rgba(244, 63, 94, 0.2)", color: "#f43f5e", border: "none", padding: "8px", borderRadius: 10, fontWeight: 900, cursor: "pointer" }}>RECUSAR</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={CARD}>
        <div style={SL}>✅ A Minha To-Do List</div>
        <div style={{ marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "15px" }}>
          <input value={novaTarefaTexto} onChange={e => setNovaTarefaTexto(e.target.value)} style={INP} placeholder="O que precisas de fazer hoje?" />
          <input type="date" value={novaTarefaData} onChange={e => setNovaTarefaData(e.target.value)} style={{ ...INP, marginBottom: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8", cursor: "pointer" }}>
              <input type="checkbox" checked={partilharTarefaCheck} onChange={e => setPartilharTarefaCheck(e.target.checked)} style={{ accentColor: CYN }} />
              Partilhar com Coordenação
            </label>
            <button onClick={criarNovaTarefa} style={{ background: CYN, border: "none", borderRadius: 18, padding: "8px 20px", fontWeight: 900, cursor: "pointer", color: "#070b14", marginLeft: "auto" }}>ADICIONAR</button>
          </div>
        </div>

        {minhasTarefas.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "15px 0" }}>Não tens tarefas pendentes.</div>
        ) : (
          minhasTarefas.sort((a,b) => b.ts - a.ts).map(tarefa => (
            <div key={tarefa.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div onClick={() => alternarEstadoTarefa(tarefa)} style={{ width: 26, height: 26, borderRadius: 9, border: `2.5px solid ${tarefa.done ? "#4ade80" : CYN}`, background: tarefa.done ? "#4ade80" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {tarefa.done && <span style={{ color: "#070b14", fontWeight: 900 }}>✓</span>}
              </div>
              <div style={{ flex: 1, opacity: tarefa.done ? 0.4 : 1, textDecoration: tarefa.done ? "line-through" : "none" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                  {tarefa.text} {tarefa.shared && <span style={{ fontSize: 9, background: CYN, color: "#000", padding: "2px 5px", borderRadius: 4, marginLeft: 8, verticalAlign: "middle" }}>PARTILHADO</span>}
                </div>
                {tarefa.due && <div style={{ fontSize: 11, color: isOverdue(tarefa.due) ? "#f43f5e" : "#94a3b8", marginTop: 2, fontWeight: 800 }}>LIMITE: {fmtDate(tarefa.due)}</div>}
              </div>
              <button onClick={() => removerTarefa(tarefa.id)} style={{ background: "none", border: "none", color: "#f43f5e", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
