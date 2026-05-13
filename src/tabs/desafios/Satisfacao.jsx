import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection, increment, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, PNK, INP, Btn, CYN } from "../../theme.jsx";
import { SURVEY_CATS, SEMOJIS, nowLabel } from "../../data.js";

export default function Satisfacao({ user, data }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSaved, setLocalSaved] = useState(false);
  
  // Guardar respostas localmente antes de submeter
  // Estrutura: { "ludoteca": { score: 4, chips: ["Boa equipa"], comment: "" } }
  const [resps, setResps] = useState({});

  const uData = data.userData || {};

  function handleScore(catId, score) {
    setResps(prev => ({ ...prev, [catId]: { ...prev[catId], score } }));
  }

  function toggleChip(catId, chip) {
    setResps(prev => {
      const cur = prev[catId] || {};
      const chips = cur.chips || [];
      const nextChips = chips.includes(chip) ? chips.filter(c => c !== chip) : [...chips, chip];
      return { ...prev, [catId]: { ...cur, chips: nextChips } };
    });
  }

  function handleComment(catId, comment) {
    setResps(prev => ({ ...prev, [catId]: { ...prev[catId], comment } }));
  }

  async function submit() {
    // Validar se todas as categorias têm um score base
    const faltam = SURVEY_CATS.filter(c => !resps[c.id]?.score);
    if (faltam.length > 0) {
      return alert("Por favor, avalia todas as categorias com as carinhas antes de submeter!");
    }

    if (uData.sSaved || localSaved || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Formatar as respostas para a base de dados anónima
      const arrayRespostas = SURVEY_CATS.map(cat => ({
        catId: cat.id,
        score: resps[cat.id]?.score || 0,
        chips: resps[cat.id]?.chips || [],
        comment: resps[cat.id]?.comment || ""
      }));

      // 1. Guardar na coleção "satisfacao" (TOTALMENTE ANÓNIMO)
      await addDoc(collection(db, "satisfacao"), {
        respostas: arrayRespostas,
        ts: Date.now()
      });

      // 2. Marcar no perfil do jovem que já fez e dar XP
      await setDoc(doc(db, "userData", user.username), { 
        sSaved: true, 
        sDate: nowLabel(),
        weekXp: increment(30),
        history: arrayUnion({ date: nowLabel(), action: "Submeteu a Avaliação de Satisfação", ts: Date.now(), xp: 30 })
      }, { merge: true });

      // 3. Notificar a Teresa
      await addDoc(collection(db, "adminNotificacoes"), {
        tipo: "SATISFACAO_ANONIMA", jovem: "Anónimo", data: nowLabel(), ts: Date.now(), lida: false
      });

      setLocalSaved(true);
      alert("Feedback anónimo recebido com sucesso! Ganhaste +30 XP. 🏆");
    } catch (e) { 
      console.error(e);
      alert("Erro ao enviar feedback.");
    }
    setIsSubmitting(false);
  }

  if (uData.sSaved || localSaved) return (
    <div style={{ ...CARD, textAlign: "center", padding: "40px 20px", borderLeft: `4px solid ${PNK}` }}>
      <div style={{ fontSize: 40, marginBottom: 15 }}>💖</div>
      <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>FEEDBACK ENVIADO!</div>
      <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 10 }}>Obrigado por ajudares a melhorar o programa.<br/>As tuas respostas são 100% anónimas.</div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={SL}>Avaliação de Satisfação</div>
        <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>Responde com sinceridade. Nenhuma destas respostas está ligada ao teu nome, a Teresa apenas vê os resultados gerais da equipa para poder ajudar-vos melhor.</p>
      </div>

      {SURVEY_CATS.map(cat => {
        const myR = resps[cat.id] || {};
        const score = myR.score || 0;
        const myChips = myR.chips || [];

        return (
          <div key={cat.id} style={{ ...CARD, borderLeft: score > 0 ? `4px solid ${PNK}` : "4px solid transparent" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 15 }}>
              <div style={{ fontSize: 24 }}>{cat.icon}</div>
              <div>
                <div style={{ fontSize: 11, color: PNK, fontWeight: 900 }}>{cat.label.toUpperCase()}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginTop: 2 }}>{cat.q}</div>
              </div>
            </div>

            {/* AVALIAÇÃO COM EMOJIS */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15, background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 16 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} 
                  onClick={() => handleScore(cat.id, n)}
                  style={{ 
                    fontSize: 26, cursor: "pointer", transition: "0.2s",
                    opacity: score === n ? 1 : (score === 0 ? 0.5 : 0.2), 
                    background: "none", border: "none",
                    transform: score === n ? "scale(1.2)" : "scale(1)"
                  }}
                >{SEMOJIS[n]}</button>
              ))}
            </div>

            {/* FRASES PRÉ-FEITAS (CHIPS) - Aparecem só depois de dar a nota */}
            {score > 0 && (
              <div style={{ animation: "fadeIn 0.3s ease-out" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 800, marginBottom: 8 }}>O QUE DESTACAS? (Opcional)</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 15 }}>
                  {cat.chips.map(chip => {
                    const isSel = myChips.includes(chip);
                    return (
                      <button key={chip} onClick={() => toggleChip(cat.id, chip)} style={{
                        padding: "8px 12px", borderRadius: 12, fontSize: 11, fontWeight: 800, cursor: "pointer", border: "none", transition: "0.2s",
                        background: isSel ? PNK : "rgba(255,255,255,0.05)",
                        color: isSel ? "#000" : "#cbd5e1"
                      }}>
                        {chip}
                      </button>
                    )
                  })}
                </div>

                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 800, marginBottom: 8 }}>TENS MAIS ALGUMA COISA A DIZER? (Opcional)</div>
                <textarea 
                  value={myR.comment || ""} 
                  onChange={(e) => handleComment(cat.id, e.target.value)} 
                  style={{ ...INP, marginBottom: 0, fontSize: 13, background: "rgba(0,0,0,0.2)" }} 
                  rows={2} 
                  placeholder="Escreve aqui outros comentários ou justifica a tua escolha..." 
                />
              </div>
            )}
          </div>
        )
      })}
      
      <Btn color={PNK} onClick={submit} disabled={isSubmitting || localSaved}>
        {isSubmitting ? "A ENVIAR..." : "SUBMETER FEEDBACK ANÓNIMO"}
      </Btn>
    </div>
  );
}
