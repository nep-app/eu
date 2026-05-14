import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, Btn, INP } from "../../theme.jsx";

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [novo, setNovo] = useState({
    title: "",
    badge: "D1 — Geral",
    scenario: "",
    optA: "", revA: "",
    optB: "", revB: "",
    optC: "", revC: ""
  });

  // 1. Carregar Quizzes existentes da Firebase
  useEffect(() => {
    const q = query(collection(db, "quizzes"), orderBy("ts", "desc"));
    return onSnapshot(q, (snap) => {
      setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  // 2. Gravar novo Quiz
  async function salvarQuiz() {
    if (!novo.title || !novo.scenario || !novo.optA) return alert("Preenche os campos básicos!");

    try {
      await addDoc(collection(db, "quizzes"), {
        title: novo.title,
        badge: novo.badge,
        scenario: novo.scenario,
        active: true,
        ts: Date.now(),
        opts: [
          { id: "A", text: novo.optA, reveal: novo.revA },
          { id: "B", text: novo.optB, reveal: novo.revB },
          { id: "C", text: novo.optC, reveal: novo.revC }
        ],
        // Iniciamos com votos fictícios para o gráfico não estar vazio
        mock: { A: 1, B: 1, C: 1 }
      });

      // Limpar formulário
      setNovo({ title: "", badge: "D1 — Geral", scenario: "", optA: "", revA: "", optB: "", revB: "", optC: "", revC: "" });
      alert("Novo Dilema publicado com sucesso! 🚀");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar.");
    }
  }

  async function apagarQuiz(id) {
    if (window.confirm("Apagar este dilema para sempre?")) {
      await deleteDoc(doc(db, "quizzes", id));
    }
  }

  return (
    <div style={{ paddingBottom: 50 }}>
      
      {/* FORMULÁRIO DE CRIAÇÃO */}
      <div style={CARD}>
        <div style={SL}>Criar Novo Dilema (Quiz)</div>
        
        <div style={{ marginBottom: 15 }}>
          <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>TÍTULO E CATEGORIA</label>
          <input 
            style={INP} placeholder="Ex: O Problema do Atraso" 
            value={novo.title} onChange={e => setNovo({...novo, title: e.target.value})} 
          />
          <select 
            style={{ ...INP, background: "rgba(0,0,0,0.3)" }}
            value={novo.badge} onChange={e => setNovo({...novo, badge: e.target.value})}
          >
            <option value="D1 — Comunicação">D1 — Comunicação</option>
            <option value="D2 — Resiliência">D2 — Resiliência</option>
            <option value="D3 — Proatividade">D3 — Proatividade</option>
            <option value="D4 — Autoconhecimento">D4 — Autoconhecimento</option>
            <option value="D5 — Digital">D5 — Digital</option>
            <option value="D6 — Intervenção">D6 — Intervenção</option>
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>CENÁRIO / PERGUNTA</label>
          <textarea 
            style={{ ...INP, height: 80 }} placeholder="Descreve a situação desafiante..." 
            value={novo.scenario} onChange={e => setNovo({...novo, scenario: e.target.value})}
          />
        </div>

        {/* OPÇÕES E REVELAÇÕES */}
        {['A', 'B', 'C'].map(letter => (
          <div key={letter} style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 12, marginBottom: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
            <label style={{ fontSize: 10, color: "#94a3b8" }}>OPÇÃO {letter}</label>
            <input 
              style={{ ...INP, marginBottom: 5 }} placeholder={`Texto da opção ${letter}`}
              value={novo[`opt${letter}`]} onChange={e => setNovo({...novo, [`opt${letter}`]: e.target.value})}
            />
            <input 
              style={{ ...INP, fontSize: 12, color: CYN }} placeholder="Explicação após responder (Reveal)"
              value={novo[`rev${letter}`]} onChange={e => setNovo({...novo, [`rev${letter}`]: e.target.value})}
            />
          </div>
        ))}

        <Btn onClick={salvarQuiz}>Publicar Dilema 🚩</Btn>
      </div>

      {/* LISTA DE QUIZZES ATIVOS */}
      <div style={SL}>Dilemas na Base de Dados ({quizzes.length})</div>
      {quizzes.map(q => (
        <div key={q.id} style={{ ...CARD, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: CYN }}>{q.badge}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{q.title}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{q.scenario.substring(0, 60)}...</div>
          </div>
          <button 
            onClick={() => apagarQuiz(q.id)}
            style={{ background: "none", border: "none", color: "#f43f5e", fontSize: 18, cursor: "pointer", marginLeft: 10 }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
