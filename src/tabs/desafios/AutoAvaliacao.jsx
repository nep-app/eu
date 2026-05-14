import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection, increment } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, CYN, INP, Btn } from "../../theme.jsx";
import { scoreLabel, getDimDesc, DIMS, nowLabel } from "../../data.js";

export default function AutoAvaliacao({ user, data }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSaved, setLocalSaved] = useState(false);
  const uData = data.userData || {};

  async function submit() {
    if (uData.autoSaved || localSaved || isSubmitting) return;
    setIsSubmitting(true);
    setLocalSaved(true);

    try {
      const date = nowLabel();
      const newHistory = [...(data.history || []), { 
        date, action: `Concluiu a Autoavaliação com a Teresa`, ts: Date.now(), xp: 30 
      }];

      await setDoc(doc(db, "userData", user.username), { 
        autoSaved: true, autoDate: date, history: newHistory, weekXp: increment(30) 
      }, { merge: true });

      await addDoc(collection(db, "adminNotificacoes"), {
        tipo: "AUTOAVALIACAO", jovem: user.username, data: date, ts: Date.now(), lida: false
      });

      alert("Excelente reflexão! Ganhaste um belo boost de XP. 🏆");
    } catch (e) {
      alert("Erro: " + e.message);
      setLocalSaved(false);
    }
    setIsSubmitting(false);
  }

  async function limparTeste() {
    if (window.confirm("Teresa, queres limpar a tua entrega para testar de novo?")) {
      await setDoc(doc(db, "userData", user.username), { autoSaved: false }, { merge: true });
      window.location.reload();
    }
  }

  return (
    <div style={{ paddingBottom: "40px" }}>
      {uData.autoSaved || localSaved ? (
        <div style={{ ...CARD, textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
          <div style={{ fontWeight: 900, color: CYN, fontSize: 18 }}>AVALIAÇÃO ENTREGUE!</div>
          <p style={{ color: "#94a3b8", fontSize: 14 }}>A Teresa já recebeu a tua reflexão.</p>
          
          {user.username === "teresa" && (
            <button onClick={limparTeste} style={{ marginTop: "25px", background: "rgba(244, 63, 94, 0.15)", border: "1.5px dashed #f43f5e", color: "#f43f5e", padding: "10px 20px", borderRadius: "14px", fontWeight: "900", cursor: "pointer", fontSize: "12px" }}>
              🔧 MODO DEV: LIMPAR E REFAZER
            </button>
          )}
        </div>
      ) : (
        <>
          {/* CABEÇALHO DE SEGURANÇA */}
          <div style={{ background: "#1e293b", borderRadius: "24px", padding: "20px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "white", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span>🔒</span> Espaço Seguro
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 10 }}>
              Só tu e a **Teresa** têm acesso a estas notas. Isto serve para perceberem **juntos** o teu crescimento no JEEP.
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: CYN, lineHeight: 1.6 }}>
              Sê honesto/a contigo mesmo/a. Errar faz parte do percurso! 🌱
            </div>
          </div>

          {/* LISTA DINÂMICA (D1 A D6) */}
          {DIMS.map(dim => {
            const val = uData.dScores?.[dim.id] || 5;
            const status = scoreLabel(val);
            const textoEspecifico = getDimDesc(dim, val); // Puxa o texto 1-2, 3-4, etc.

            return (
              <div key={dim.id} style={CARD}>
                {/* Título e Descrição Geral */}
                <div style={{ fontWeight: 900, fontSize: 15, color: "#fff", marginBottom: 6 }}>{dim.label}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20, lineHeight: 1.5 }}>{dim.desc}</div>
                
                {/* Slider */}
                <input type="range" min="1" max="10" value={val} 
                  onChange={async (e) => {
                    const nS = { ...(uData.dScores || {}), [dim.id]: Number(e.target.value) };
                    await setDoc(doc(db, "userData", user.username), { dScores: nS }, { merge: true });
                  }} 
                  style={{ width: "100%", accentColor: status[1] }} 
                />
                
                {/* Badge da Nota */}
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                  <div style={{ display: "inline-block", padding: "8px 20px", borderRadius: "12px", background: "rgba(0,0,0,0.3)", border: `1px solid ${status[1]}` }}>
                    <span style={{ fontSize: 24, fontWeight: 900, color: status[1] }}>{val}</span>
                    <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 800, color: status[1], textTransform: "uppercase" }}>{status[0]}</span>
                  </div>
                </div>

                {/* TEXTO DINÂMICO (O que muda com a nota) */}
                <div style={{ 
                  background: "rgba(15, 23, 42, 0.4)", 
                  padding: "16px", 
                  borderRadius: "16px", 
                  fontSize: 13, 
                  color: "#e2e8f0", 
                  lineHeight: 1.6, 
                  borderLeft: `4px solid ${status[1]}`,
                  marginBottom: 15
                }}>
                  {textoEspecifico}
                </div>

                {/* Notas em Texto */}
                <textarea 
                  value={uData.dNotas?.[dim.id] || ""} 
                  onChange={async (e) => {
                    const nN = { ...(uData.dNotas || {}), [dim.id]: e.target.value };
                    await setDoc(doc(db, "userData", user.username), { dNotas: nN }, { merge: true });
                  }}
                  style={{ ...INP, fontSize: 12, background: "rgba(0,0,0,0.2)" }} 
                  placeholder="Queres dar um exemplo ou explicar esta nota à Teresa?" 
                  rows={2}
                />
              </div>
            );
          })}
          
          <div style={{ marginTop: "10px" }}>
            <Btn onClick={submit} disabled={isSubmitting || localSaved} variant="success">
              {isSubmitting ? "A ENVIAR..." : "FINALIZAR E ENVIAR À TERESA"}
            </Btn>
          </div>
        </>
      )}
    </div>
  );
}
