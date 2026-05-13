import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, increment, arrayUnion, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, Btn } from "../../theme.jsx";
import { nowLabel } from "../../data.js";

export default function QuizCenarios({ user, data }) {
  const [quizzes, setQuizzes] = useState([]);
  const [selecionado, setSelecionado] = useState(null); // Guarda o ID do quiz que o jovem está a ver
  const [respondidoId, setRespondidoId] = useState(null); // Guarda qual opção ele escolheu
  
  const uData = data.userData || {};
  const feitos = uData.completedQuizzes || []; // Lista de IDs de quizzes já respondidos pelo jovem

  // 1. Carregar Quizzes do Firebase
  useEffect(() => {
    const q = query(collection(db, "quizzes"), orderBy("ts", "desc"));
    return onSnapshot(q, (snap) => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setQuizzes(lista.filter(item => item.active !== false));
    });
  }, []);

  // 2. Função para responder e ganhar XP
  async function escolherOpcao(quiz, opcaoId) {
    if (feitos.includes(quiz.id)) return; // Evita responder duas vezes

    setRespondidoId(opcaoId);

    try {
      // Atualiza o perfil do jovem: ganha XP e marca como feito
      await setDoc(doc(db, "userData", user.username), {
        weekXp: increment(10), // Ganha 10 XP por participar no dilema
        completedQuizzes: arrayUnion(quiz.id),
        history: arrayUnion({ 
          date: nowLabel(), 
          action: `Respondeu ao dilema: ${quiz.title}`, 
          ts: Date.now(), 
          xp: 10 
        })
      }, { merge: true });

      // Atualiza as estatísticas do quiz (Firestore) para outros verem
      const field = `mock.${opcaoId}`;
      await updateDoc(doc(db, "quizzes", quiz.id), {
        [field]: increment(1)
      });

    } catch (e) {
      console.error("Erro ao gravar resposta:", e);
    }
  }

  // Se não houver quizzes
  if (quizzes.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 30, color: "#94a3b8", fontSize: 14 }}>
        Não há novos dilemas para resolver agora. ✨
      </div>
    );
  }

  // Filtrar quizzes que o jovem ainda NÃO fez
  const disponiveis = quizzes.filter(q => !feitos.includes(q.id));

  // Se já fez todos
  if (disponiveis.length === 0 && !respondidoId) {
    return (
      <div style={CARD}>
        <div style={SL}>🎯 Missão Cumprida</div>
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
          Já respondeste a todos os dilemas disponíveis. <br/> Aguarda por novos desafios da Teresa!
        </div>
      </div>
    );
  }

  // Quiz atual (o primeiro da lista dos disponíveis ou o que acabou de responder)
  const q = respondidoId 
    ? quizzes.find(item => item.id === quizzes.find(curr => !feitos.includes(curr.id) || curr.id === respondidoId)?.id)
    : disponiveis[0];

  if (!q) return null;

  return (
    <div style={{ ...CARD, borderLeft: `4px solid ${CYN}` }}>
      <div style={{ fontSize: 10, fontWeight: 900, color: CYN, marginBottom: 5 }}>{q.badge}</div>
      <div style={SL}>{q.title}</div>
      
      <p style={{ fontSize: 14, lineHeight: 1.6, color: "#cbd5e1", marginBottom: 20 }}>
        {q.scenario}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map((opt) => {
          const isSelected = respondidoId === opt.id;
          const jaRespondeu = feitos.includes(q.id) || respondidoId;

          return (
            <div key={opt.id}>
              <button
                disabled={jaRespondeu}
                onClick={() => escolherOpcao(q, opt.id)}
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 14, border: "none",
                  textAlign: "left", cursor: jaRespondeu ? "default" : "pointer",
                  background: isSelected ? CYN : "rgba(255,255,255,0.05)",
                  color: isSelected ? "#000" : "#fff",
                  fontWeight: isSelected ? 800 : 500,
                  transition: "0.2s"
                }}
              >
                <span style={{ marginRight: 10, opacity: 0.5 }}>{opt.id}</span>
                {opt.text}
              </button>

              {/* REVEAL: Só aparece depois de responder */}
              {jaRespondeu && (isSelected || (feitos.includes(q.id) && !respondidoId)) && (
                <div style={{ 
                  marginTop: 8, padding: 12, borderRadius: 12, background: "rgba(34, 211, 238, 0.1)", 
                  fontSize: 12, color: CYN, border: `1px solid ${CYN}30`, lineHeight: 1.4 
                }}>
                  <strong>💡 Feedback:</strong> {opt.reveal}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER DO CARD */}
      {(respondidoId || feitos.includes(q.id)) && (
        <div style={{ marginTop: 20, paddingTop: 15, borderTop: "1px solid rgba(255,255,255,0.05)", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            XP ganho: <span style={{ color: CYN, fontWeight: 900 }}>+10 XP</span>
          </div>
          <Btn variant="dark" style={{ marginTop: 10, fontSize: 11 }} onClick={() => setRespondidoId(null)}>
            Próximo Dilema →
          </Btn>
        </div>
      )}
    </div>
  );
}
