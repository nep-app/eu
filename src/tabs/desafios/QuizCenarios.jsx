import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, increment, arrayUnion, addDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, Btn } from "../../theme.jsx";
import { fmtDate, isOverdue } from "../../data.js";
import { nowLabel } from "../../data.js";

export default function QuizCenarios({ user, data }) {
  const [quizzes, setQuizzes] = useState([]);
  const [answered, setAnswered] = useState(null); // { quizId, optId }

  const uData = data.userData || {};
  const feitos = uData.completedQuizzes || [];

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

  if (quizzes.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 30, color: "#94a3b8", fontSize: 14 }}>
        Não há novos dilemas para resolver agora. ✨
      </div>
    );
  }

  const disponiveis = quizzes.filter(q => !feitos.includes(q.id));

  // Determinar qual quiz mostrar: o que acabou de ser respondido, ou o primeiro disponível
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
    <div style={{ ...CARD, borderLeft: `4px solid ${CYN}` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
        <div style={{ fontSize:10, fontWeight:900, color:CYN }}>{q.badge}</div>
        {q.prazo && <div style={{ fontSize:10, fontWeight:800, color: isOverdue(q.prazo) ? "#f43f5e" : "#fbbf24" }}>⏰ Até {fmtDate(q.prazo)}</div>}
      </div>
      <div style={SL}>{q.title}</div>
      
      <p style={{ fontSize: 14, lineHeight: 1.6, color: "#cbd5e1", marginBottom: 20 }}>
        {q.scenario}
      </p>

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

              {/* REVEAL: aparece para a opção escolhida após responder */}
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

      {jaRespondeu && (
        <div style={{ marginTop: 20, paddingTop: 15, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            XP ganho: <span style={{ color: CYN, fontWeight: 900 }}>+10 XP</span>
          </div>
          {disponiveis.filter(dq => dq.id !== q.id).length > 0 && (
            <Btn variant="dark" style={{ marginTop: 10, fontSize: 11 }} onClick={() => setAnswered(null)}>
              Próximo Dilema →
            </Btn>
          )}
        </div>
      )}
    </div>
  );
}
