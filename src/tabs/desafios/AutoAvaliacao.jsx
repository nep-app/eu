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
        date, action: `Concluiu a Autoavaliação de Competências`, ts: Date.now(), xp: 30 
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

  // ── FUNÇÃO MÁGICA SÓ PARA A TERESA TESTAR ──
  async function limparTeste() {
    if (window.confirm("Queres limpar a tua entrega para poderes testar de novo?")) {
      // Limpa a flag 'autoSaved' na base de dados
      await setDoc(doc(db, "userData", user.username), { autoSaved: false }, { merge: true });
      // Força a página a recarregar para mostrar o formulário
      window.location.reload();
    }
  }

  return (
    <div>
      {uData.autoSaved || localSaved ? (
        <div style={{ ...CARD, textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
          <div style={{ fontWeight: 900, color: CYN, fontSize: 18 }}>AVALIAÇÃO ENTREGUE!</div>
          
          {/* BOTÃO SECRETO DA TERESA */}
          {user.username === "teresa" && (
            <button 
              onClick={limparTeste}
              style={{ 
                marginTop: "25px", 
                background: "rgba(244, 63, 94, 0.15)", 
                border: "1.5px dashed #f43f5e", 
                color: "#f43f5e", 
                padding: "10px 20px", 
                borderRadius: "14px", 
                fontWeight: "900", 
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              🔧 MODO DEV: LIMPAR AVALIAÇÃO
            </button>
          )}

        </div>
      ) : (
        <>
          {/* MENSAGEM DA TERESA AQUI NO TOPO */}
          <div style={{ background: "#0f172a", borderRadius: "20px", padding: "20px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "white", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span>🔒</span> Ninguém vai ver isto.
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, marginBottom: 12 }}>
              Só tu e eu (Teresa) temos acesso. Não serve para te avaliar — serve para percebermos <em style={{ color: "#cbd5e1" }}>juntos</em> se estás a evoluir.
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "white", lineHeight: 1.6 }}>
              Sê honesto/a. Ninguém é perfeito em tudo — não é suposto ser. Se deres tudo 10 não há margem para crescer. 🌱
            </div>
          </div>

          {/* LISTA DE SLIDERS DE AVALIAÇÃO */}
          {DIMS.map(dim => {
            const val = uData.dScores?.[dim.id] || 5;
            const status = scoreLabel(val);
            return (
              <div key={dim.id} style={CARD}>
                <div style={{ fontWeight: 900, fontSize: 14, color: "#fff" }}>{dim.label}</div>
                <input type="range" min="1" max="10" value={val} 
                  onChange={async (e) => {
                    const nS = { ...(uData.dScores || {}), [dim.id]: Number(e.target.value) };
                    await setDoc(doc(db, "userData", user.username), { dScores: nS }, { merge: true });
                  }} 
                  style={{ width: "100%", accentColor: status[1], marginTop: 15 }} 
                />
                <div style={{ textAlign: "center", margin: "15px 0", color: status[1], fontWeight: 900 }}>{val} — {status[0]}</div>
                <textarea 
                  value={uData.dNotas?.[dim.id] || ""} 
                  onChange={async (e) => {
                    const nN = { ...(uData.dNotas || {}), [dim.id]: e.target.value };
                    await setDoc(doc(db, "userData", user.username), { dNotas: nN }, { merge: true });
                  }}
                  style={{ ...INP, fontSize: 12 }} placeholder="Notas..." rows={2}
                />
              </div>
            );
          })}
          <Btn onClick={submit} disabled={isSubmitting || localSaved}>FINALIZAR E ENVIAR</Btn>
        </>
      )}
    </div>
  );
}
