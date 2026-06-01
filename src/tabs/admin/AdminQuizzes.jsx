import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, Btn, INP } from "../../theme.jsx";

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [erro, setErro] = useState(null);
  const [novo, setNovo] = useState({
    title: "",
    badge: "D1 — Comunicação",
    scenario: "",
    prazo: "",
    optA: "", revA: "",
    optB: "", revB: "",
    optC: "", revC: ""
  });

  useEffect(() => {
    try {
      const q = query(collection(db, "quizzes"), orderBy("ts", "desc"));
      return onSnapshot(q,
        (snap) => {
          setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setErro(null);
        },
        (err) => {
          console.error("Quizzes snapshot error:", err);
          setErro(err.message);
        }
      );
    } catch (e) {
      console.error(e);
      setErro(e.message);
    }
  }, []);

  async function salvarQuiz() {
    if (!novo.title || !novo.scenario || !novo.optA) return alert("Preenche os campos básicos!");
    try {
      await addDoc(collection(db, "quizzes"), {
        title: novo.title,
        badge: novo.badge,
        scenario: novo.scenario,
        prazo: novo.prazo || null,
        active: true,
        ts: Date.now(),
        opts: [
          { id: "A", text: novo.optA, reveal: novo.revA },
          { id: "B", text: novo.optB, reveal: novo.revB },
          { id: "C", text: novo.optC, reveal: novo.revC }
        ],
        mock: { A: 1, B: 1, C: 1 }
      });
      setNovo({ title: "", badge: "D1 — Comunicação", scenario: "", prazo: "", optA: "", revA: "", optB: "", revB: "", optC: "", revC: "" });
      alert("Novo Dilema publicado com sucesso! 🚀");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar: " + e.message);
    }
  }

  async function apagarQuiz(id) {
    if (window.confirm("Apagar este dilema para sempre?")) {
      await deleteDoc(doc(db, "quizzes", id));
    }
  }

  if (erro) return (
    <div style={{ ...CARD, color: "#f43f5e" }}>
      ⚠️ Erro ao carregar dilemas: {erro}
    </div>
  );

  return (
    <div style={{ paddingBottom: 50 }}>

      {/* FORMULÁRIO DE CRIAÇÃO */}
      <div style={CARD}>
        <div style={SL}>Criar Novo Dilema (Quiz)</div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>TÍTULO</label>
          <input
            style={INP} placeholder="Ex: O Problema do Atraso"
            value={novo.title} onChange={e => setNovo({...novo, title: e.target.value})}
          />
          <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>CATEGORIA</label>
          <select
            style={{ ...INP, background: "rgba(0,0,0,0.3)" }}
            value={novo.badge} onChange={e => setNovo({...novo, badge: e.target.value})}
          >
            <option>D1 — Comunicação</option>
            <option>D2 — Resiliência</option>
            <option>D3 — Proatividade</option>
            <option>D4 — Autoconhecimento</option>
            <option>D5 — Digital</option>
            <option>D6 — Intervenção</option>
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>CENÁRIO / PERGUNTA</label>
          <textarea
            style={{ ...INP, height: 80 }} placeholder="Descreve a situação desafiante..."
            value={novo.scenario} onChange={e => setNovo({...novo, scenario: e.target.value})}
          />
        </div>

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

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>PRAZO (opcional)</label>
          <input type="date" style={{ ...INP, marginTop: 6 }}
            value={novo.prazo} onChange={e => setNovo({...novo, prazo: e.target.value})} />
        </div>

        <Btn onClick={salvarQuiz}>Publicar Dilema 🚩</Btn>
      </div>

      {/* LISTA */}
      <div style={SL}>Dilemas na Base de Dados ({quizzes.length})</div>
      {quizzes.length === 0 && (
        <div style={{ ...CARD, color: "#475569", textAlign: "center" }}>Ainda não há dilemas criados.</div>
      )}
      {quizzes.map(q => (
        <div key={q.id} style={{ ...CARD, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: CYN }}>{q.badge || "—"}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{q.title || "Sem título"}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
              {(q.scenario || "").substring(0, 80)}{(q.scenario || "").length > 80 ? "…" : ""}
            </div>
            {q.prazo && <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 4 }}>⏰ Prazo: {q.prazo}</div>}
            {q.mock && (
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                {(q.opts || []).map(opt => {
                  const votes = (q.mock[opt.id] || 1) - 1;
                  const total = Object.values(q.mock).reduce((s, v) => s + v, 0) - Object.keys(q.mock).length;
                  const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
                  return (
                    <div key={opt.id} style={{ background: "rgba(50,199,255,0.08)", border: "1px solid rgba(50,199,255,0.15)", borderRadius: 8, padding: "4px 10px", fontSize: 11 }}>
                      <span style={{ color: CYN, fontWeight: 900 }}>{opt.id}</span>
                      <span style={{ color: "#94a3b8", marginLeft: 4 }}>{votes} resp. ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <button
            onClick={() => apagarQuiz(q.id)}
            style={{ background: "none", border: "none", color: "#f43f5e", fontSize: 18, cursor: "pointer", marginLeft: 10, flexShrink: 0 }}
          >✕</button>
        </div>
      ))}
    </div>
  );
}
