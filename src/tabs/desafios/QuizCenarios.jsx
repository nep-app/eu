import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, increment, arrayUnion, addDoc, query, orderBy } from "firebase/firestore";
import { db, notifyAdmin } from "../../firebase.js";
import { CARD, SL, CYN, INP, Btn } from "../../theme.jsx";
import { fmtDate, isOverdue, nowLabel } from "../../data.js";

export default function QuizCenarios({ user, data }) {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuizId, setCurrentQuizId] = useState(null);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [nota, setNota] = useState("");

  const uData = data.userData || {};
  const feitos = uData.completedQuizzes || [];
  const quizResponses = uData.quizResponses || {};

  useEffect(() => {
    const q = query(collection(db, "quizzes"), orderBy("ts", "desc"));
    return onSnapshot(q, (snap) => {
      setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(item => item.active !== false));
    });
  }, []);

  // Set first available quiz when list loads
  useEffect(() => {
    if (currentQuizId) return;
    const disponiveis = quizzes.filter(q => !feitos.includes(q.id));
    if (disponiveis.length > 0) setCurrentQuizId(disponiveis[0].id);
  }, [quizzes, feitos, currentQuizId]);

  async function submeter() {
    if (!selectedOpt || !currentQuizId) return;
    const quiz = quizzes.find(q => q.id === currentQuizId);
    if (!quiz) return;
    setSubmitted(true);
    // XP escondido do jovem: se o dilema tem uma opção "certa" definida pela Teresa,
    // quem lhe acerta ganha mais (15) do que quem não (5). Sem opção certa → 10 (neutro).
    const xp = quiz.correct ? (selectedOpt === quiz.correct ? 15 : 5) : 10;
    // 1. Guardar em userData (user tem sempre permissão sobre os seus próprios dados)
    try {
      await setDoc(doc(db, "userData", user.username), {
        weekXp: increment(xp),
        completedQuizzes: arrayUnion(quiz.id),
        quizResponses: { [quiz.id]: selectedOpt },
        ...(nota.trim() ? { quizNotes: { [quiz.id]: nota.trim() } } : {}),
        history: arrayUnion({ date: nowLabel(), action: `Respondeu ao dilema: ${quiz.title}`, ts: Date.now(), xp })
      }, { merge: true });
    } catch (e) {
      console.error("Erro ao guardar resposta:", e);
      setSubmitted(false);
      return;
    }

    // 2. Notificação ao admin — try/catch independente, não reverte o submit
    try {
      await notifyAdmin({
        tipo: "QUIZ", jovem: user.username, quizTitle: quiz.title,
        quizId: quiz.id, opcaoId: selectedOpt, nota: nota.trim(), ts: Date.now(), lida: false
      });
    } catch (e) {
      console.warn("Erro ao notificar admin:", e);
    }
  }

  function proximoDilema() {
    const disponiveis = quizzes.filter(q => !feitos.includes(q.id) && q.id !== currentQuizId);
    setCurrentQuizId(disponiveis[0]?.id || null);
    setSelectedOpt(null);
    setSubmitted(false);
    setNota("");
  }

  if (quizzes.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 30, color: "#94a3b8", fontSize: 14 }}>
        Não há novos dilemas para resolver agora. ✨
      </div>
    );
  }

  const disponiveis = quizzes.filter(q => !feitos.includes(q.id));

  if (!currentQuizId && disponiveis.length === 0) {
    return (
      <div style={CARD}>
        <div style={SL}>🎯 Missão Cumprida</div>
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          Já respondeste a todos os dilemas disponíveis. <br/> Aguarda por novos desafios!
        </div>
      </div>
    );
  }

  const quiz = quizzes.find(q => q.id === currentQuizId);
  if (!quiz) return null;

  // After submit: feitos may not have updated yet via onSnapshot, so use submitted flag too
  const jaRespondeu = submitted || feitos.includes(quiz.id);
  // Which option was chosen (local during session, or persisted from userData)
  const chosenOpt = submitted ? selectedOpt : quizResponses[quiz.id];

  const temProximo = disponiveis.filter(q => q.id !== quiz.id).length > 0;

  return (
    <div style={{ ...CARD, borderLeft: `4px solid ${CYN}` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
        <div style={{ fontSize:10, fontWeight:900, color:CYN }}>{quiz.badge}</div>
        {quiz.prazo && <div style={{ fontSize:10, fontWeight:800, color: isOverdue(quiz.prazo) ? "#f43f5e" : "#fbbf24" }}>⏰ Até {fmtDate(quiz.prazo)}</div>}
      </div>
      <div style={SL}>{quiz.title}</div>

      <p style={{ fontSize: 14, lineHeight: 1.6, color: "#cbd5e1", marginBottom: 12 }}>
        {quiz.scenario}
      </p>

      <div style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic", marginBottom: 16, padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", borderLeft: "2px solid rgba(50,199,255,0.3)" }}>
        💡 Isto não é para te avaliar — é para te fazer pensar.
      </div>

      {/* Opções */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {quiz.opts.map((opt) => {
          const isChosen = opt.id === chosenOpt;
          const isLocalSelected = !jaRespondeu && opt.id === selectedOpt;

          return (
            <div key={opt.id}>
              <button
                disabled={jaRespondeu}
                onClick={() => !jaRespondeu && setSelectedOpt(opt.id)}
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 14, border: "none",
                  textAlign: "left", cursor: jaRespondeu ? "default" : "pointer",
                  background: isChosen
                    ? CYN
                    : isLocalSelected
                      ? "rgba(50,199,255,0.15)"
                      : jaRespondeu
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(255,255,255,0.05)",
                  color: isChosen ? "#071529" : "#fff",
                  fontWeight: (isChosen || isLocalSelected) ? 800 : 500,
                  outline: isLocalSelected ? `2px solid ${CYN}55` : "none",
                  transition: "all 0.18s"
                }}
              >
                <span style={{ marginRight: 10, opacity: 0.5 }}>{opt.id}</span>
                {opt.text}
                {isChosen && <span style={{ marginLeft: 8 }}>✓</span>}
              </button>

              {/* Reveals de todas as opções após submeter */}
              {jaRespondeu && opt.reveal && (
                <div style={{
                  marginTop: 6, padding: 12, borderRadius: 12, lineHeight: 1.5, fontSize: 12,
                  background: isChosen ? "rgba(34,211,238,0.12)" : "rgba(255,255,255,0.03)",
                  color: isChosen ? CYN : "#94a3b8",
                  border: `1px solid ${isChosen ? CYN + "30" : "rgba(255,255,255,0.06)"}`,
                }}>
                  {isChosen ? "✅" : "💡"} {opt.reveal}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Nota + Submeter — apenas antes de responder */}
      {!jaRespondeu && (
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <textarea
            value={nota}
            onChange={e => setNota(e.target.value)}
            placeholder="Notas (opcional) — a Teresa também vai ver..."
            style={{ ...INP, minHeight: 68, resize: "none", fontSize: 13, marginBottom: 10 }}
          />
          <button
            disabled={!selectedOpt}
            onClick={submeter}
            style={{
              width: "100%", padding: "14px 20px", borderRadius: 14, border: "none",
              background: selectedOpt
                ? `linear-gradient(135deg, ${CYN}, #2196F3)`
                : "rgba(255,255,255,0.06)",
              color: selectedOpt ? "#071529" : "#475569",
              fontSize: 13, fontWeight: 900,
              cursor: selectedOpt ? "pointer" : "not-allowed",
              letterSpacing: 1, textTransform: "uppercase", transition: "all 0.2s"
            }}
          >
            {selectedOpt ? "Submeter resposta →" : "Escolhe uma opção primeiro"}
          </button>
        </div>
      )}

      {/* Após submeter */}
      {jaRespondeu && (
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            ✓ Resposta enviada. Obrigado por partilhares!
          </div>
          {temProximo && (
            <Btn variant="dark" style={{ marginTop: 10, fontSize: 11 }} onClick={proximoDilema}>
              Próximo Dilema →
            </Btn>
          )}
        </div>
      )}
    </div>
  );
}
