import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, increment, arrayUnion, addDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, INP, Btn } from "../../theme.jsx";
import { fmtDate, isOverdue, nowLabel } from "../../data.js";

export default function QuizCenarios({ user, data }) {
  const [quizzes, setQuizzes] = useState([]);
  const [answered, setAnswered] = useState(null); // { quizId, optId }
  const [nota, setNota] = useState("");
  const [notaSalva, setNotaSalva] = useState(false);

  const uData = data.userData || {};
  const feitos = uData.completedQuizzes || [];
  const quizNotes = uData.quizNotes || {};

  useEffect(() => {
    const q = query(collection(db, "quizzes"), orderBy("ts", "desc"));
    return onSnapshot(q, (snap) => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setQuizzes(lista.filter(item => item.active !== false));
    });
  }, []);

  async function escolherOpcao(quiz, opcaoId) {
    if (feitos.includes(quiz.id)) return;
    setAnswered({ quizId: quiz.id, optId: opcaoId });
    try {
      await setDoc(doc(db, "userData", user.username), {
        weekXp: increment(10),
        completedQuizzes: arrayUnion(quiz.id),
        history: arrayUnion({
          date: nowLabel(), action: `Respondeu ao dilema: ${quiz.title}`, ts: Date.now(), xp: 10
        })
      }, { merge: true });
      await updateDoc(doc(db, "quizzes", quiz.id), { [`mock.${opcaoId}`]: increment(1) });
      await addDoc(collection(db, "adminNotificacoes"), {
        tipo: "QUIZ", jovem: user.username, quizTitle: quiz.title, ts: Date.now(), lida: false
      });
    } catch (e) {
      console.error("Erro ao gravar resposta:", e);
    }
  }

  async function guardarNota(quizId) {
    try {
      await setDoc(doc(db, "userData", user.username), {
        quizNotes: { [quizId]: nota }
      }, { merge: true });
      setNotaSalva(true);
      setTimeout(() => setNotaSalva(false), 2000);
    } catch (e) {
      console.error("Erro ao guardar nota:", e);
    }
  }

  if (quizzes.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 30, color: "#94a3b8", fontSize: 14 }}>
        Não há novos dilemas para resolver agora. ✨
      </div>
    );
  }

  const disponiveis = quizzes.filter(q => !feitos.includes(q.id));

  const q = answered
    ? quizzes.find(item => item.id === answered.quizId)
    : disponiveis[0];

  if (!q && disponiveis.length === 0) {
    return (
      <div style={CARD}>
        <div style={SL}>🎯 Missão Cumprida</div>
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          Já respondeste a todos os dilemas disponíveis. <br/> Aguarda por novos desafios da Teresa!
        </div>
      </div>
    );
  }

  if (!q) return null;

  const jaRespondeu = answered?.quizId === q.id || feitos.includes(q.id);

  return (
    <div style={{ ...CARD, borderLeft: `4px solid ${CYN}` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
        <div style={{ fontSize:10, fontWeight:900, color:CYN }}>{q.badge}</div>
        {q.prazo && <div style={{ fontSize:10, fontWeight:800, color: isOverdue(q.prazo) ? "#f43f5e" : "#fbbf24" }}>⏰ Até {fmtDate(q.prazo)}</div>}
      </div>
      <div style={SL}>{q.title}</div>

      <p style={{ fontSize: 14, lineHeight: 1.6, color: "#cbd5e1", marginBottom: 12 }}>
        {q.scenario}
      </p>

      {/* Disclaimer */}
      <div style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic", marginBottom: 16, padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", borderLeft: "2px solid rgba(50,199,255,0.3)" }}>
        💡 Isto não é para te avaliar — é para te fazer pensar.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map((opt) => {
          const isSelected = answered?.quizId === q.id && answered?.optId === opt.id;

          return (
            <div key={opt.id}>
              <button
                disabled={jaRespondeu}
                onClick={() => escolherOpcao(q, opt.id)}
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 14, border: "none",
                  textAlign: "left", cursor: jaRespondeu ? "default" : "pointer",
                  background: isSelected ? CYN : (jaRespondeu ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.05)"),
                  color: isSelected ? "#000" : "#fff",
                  fontWeight: isSelected ? 800 : 500,
                  transition: "0.2s"
                }}
              >
                <span style={{ marginRight: 10, opacity: 0.5 }}>{opt.id}</span>
                {opt.text}
              </button>

              {jaRespondeu && isSelected && opt.reveal && (
                <div style={{
                  marginTop: 8, padding: 12, borderRadius: 12, background: "rgba(34,211,238,0.10)",
                  fontSize: 12, color: CYN, border: `1px solid ${CYN}30`, lineHeight: 1.5
                }}>
                  💡 {opt.reveal}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Notes field — always visible */}
      <div style={{ marginTop: 20, paddingTop: 15, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
          As tuas notas
        </div>
        <textarea
          value={nota || quizNotes[q.id] || ""}
          onChange={e => setNota(e.target.value)}
          placeholder="Escreve aqui os teus pensamentos sobre este dilema..."
          style={{ ...INP, minHeight: 72, resize: "none", fontSize: 13 }}
        />
        <button
          onClick={() => guardarNota(q.id)}
          style={{
            background: notaSalva ? "rgba(74,222,128,0.15)" : "rgba(50,199,255,0.12)",
            border: `1px solid ${notaSalva ? "rgba(74,222,128,0.4)" : `${CYN}30`}`,
            color: notaSalva ? "#4ade80" : CYN,
            padding: "8px 18px", borderRadius: 10, fontSize: 11, fontWeight: 800,
            cursor: "pointer", transition: "all 0.2s"
          }}
        >
          {notaSalva ? "✓ Guardado" : "Guardar nota"}
        </button>
      </div>

      {jaRespondeu && (
        <div style={{ marginTop: 16, paddingTop: 15, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            XP ganho: <span style={{ color: CYN, fontWeight: 900 }}>+10 XP</span>
          </div>
          {disponiveis.filter(dq => dq.id !== q.id).length > 0 && (
            <Btn variant="dark" style={{ marginTop: 10, fontSize: 11 }} onClick={() => { setAnswered(null); setNota(""); }}>
              Próximo Dilema →
            </Btn>
          )}
        </div>
      )}
    </div>
  );
}
