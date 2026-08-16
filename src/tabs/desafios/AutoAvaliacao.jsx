import React, { useState, useContext } from 'react';
import { doc, getDoc, setDoc, updateDoc, addDoc, collection, increment, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, CYN, INP, Btn } from "../../theme.jsx";
import { scoreLabel, getDimDesc, DIMS, nowLabel, getWeekKey } from "../../data.js";
import { ThemeCtx } from "../../JovensApp.jsx";

export default function AutoAvaliacao({ user, data }) {
  const light = useContext(ThemeCtx);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSaved, setLocalSaved] = useState(false);
  const uData = data.userData || {};
  const isDemo = user?.username === "demo";

  // autoSaved=true means user submitted. autoNewRound=true means admin launched a new round.
  // If both are true simultaneously it's stale data from old launch code — treat as done.
  const alreadyDone = uData.autoSaved || localSaved;

  async function submit() {
    if (alreadyDone || isSubmitting) return;
    setIsSubmitting(true);
    setLocalSaved(true);

    try {
      const date = nowLabel();
      const newHistory = [...(data.history || []), {
        date, action: `Concluiu a Autoavaliação com a Teresa`, ts: Date.now(), xp: 30
      }];

      const cicloSnap = await getDoc(doc(db, "config", "autoCiclo"));
      const ciclo = cicloSnap.exists() ? cicloSnap.data() : null;
      // Um só setDoc com merge (cria o doc se não existir — evita "no document to update").
      await setDoc(doc(db, "userData", user.username), {
        autoSaved: true, autoDate: date, autoNewRound: false, history: newHistory, weekXp: increment(30),
        autoAvaliacaoHistorico: arrayUnion({
          week: getWeekKey(), scores: uData.dScores || {},
          notas: uData.dNotas || {}, date, ts: Date.now(),
          ...(ciclo && ciclo.id != null ? { ciclo: ciclo.id, cicloLabel: ciclo.label } : {}),
        }),
      }, { merge: true });

      // A conta demo não notifica a Teresa a sério (é uma demonstração).
      if (!isDemo) {
        await addDoc(collection(db, "adminNotificacoes"), {
          tipo: "AUTOAVALIACAO", jovem: user.username, data: date, ts: Date.now(), lida: false
        });
      }

      alert("Excelente reflexão! Ganhaste um belo boost de XP. 🏆");
    } catch (e) {
      // Na demo fingimos sucesso; nas contas reais mostramos o erro.
      if (isDemo) { alert("Excelente reflexão! Ganhaste um belo boost de XP. 🏆"); }
      else { alert("Erro: " + e.message); setLocalSaved(false); }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function limparTeste() {
    if (window.confirm("Teresa, queres limpar a tua entrega para testar de novo?")) {
      await setDoc(doc(db, "userData", user.username), { autoSaved: false }, { merge: true });
      window.location.reload();
    }
  }

  return (
    <div style={{ paddingBottom: "40px" }}>
      {alreadyDone ? (
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
          <div style={{ background: light ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.25)", borderRadius: "24px", padding: "20px", marginBottom: "20px", border: light ? "1px solid rgba(0,0,0,0.12)" : "1px solid rgba(255,255,255,0.10)" }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: light ? "#1e293b" : "white", display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              🔒 NINGUÉM VAI VER ISTO.
            </div>
            <div style={{ fontSize: 13, color: light ? "#334155" : "#cbd5e1", lineHeight: 1.6, marginBottom: 10 }}>
              Só tu e eu (Teresa) temos acesso. Não serve para te avaliar — serve para percebermos <strong>juntos</strong> se estás a evoluir.
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: light ? "#1e293b" : "#f1f5f9", lineHeight: 1.6 }}>
              Sê honesto/a. Ninguém é perfeito em tudo e não é suposto ser. Se deres tudo 10 não há margem para crescer. 🌱
            </div>
          </div>

          {/* LISTA DINÂMICA (D1 A D6) */}
          {DIMS.map(dim => {
            const raw = uData.dScores?.[dim.id];
            const val = (raw !== undefined && raw > 0) ? raw : 0;
            const isSet = val > 0;
            const status = scoreLabel(isSet ? val : 1);
            const textoEspecifico = getDimDesc(dim, isSet ? val : 1);

            return (
              <div key={dim.id} style={CARD}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <div style={{ fontSize:9, fontWeight:900, color:"#64748b", letterSpacing:1.5 }}>{dim.id}</div>
                  {isSet && <div style={{ fontSize:10, fontWeight:900, color:status[1], background:`${status[1]}15`, border:`1px solid ${status[1]}40`, padding:"2px 8px", borderRadius:6 }}>{status[0].toUpperCase()}</div>}
                </div>
                <div style={{ fontWeight: 900, fontSize: 14, color: "#fff", marginBottom: 6 }}>{dim.label}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20, lineHeight: 1.5 }}>{dim.desc}</div>

                {/* Slider 1-10 */}
                <input type="range" min="1" max="10" value={isSet ? val : 1}
                  onChange={async (e) => {
                    const nS = { ...(uData.dScores || {}), [dim.id]: Number(e.target.value) };
                    await setDoc(doc(db, "userData", user.username), { dScores: nS }, { merge: true });
                  }}
                  style={{ width: "100%", accentColor: isSet ? status[1] : "#475569" }}
                />
                {!isSet && (
                  <div style={{ textAlign:"center", fontSize:11, color:"#475569", marginTop:4, fontWeight:700 }}>
                    Arrasta o slider para avaliar
                  </div>
                )}

                {/* Badge da Nota + Texto dinâmico — só quando avaliado */}
                {isSet && (
                  <>
                    <div style={{ display:"flex", alignItems:"center", gap:12, margin:"16px 0", padding:"14px 18px", borderRadius:16, background:`${status[1]}12`, border:`1px solid ${status[1]}30` }}>
                      <span style={{ fontSize:40, fontWeight:900, color:"#ffffff", lineHeight:1 }}>{val}</span>
                      <div>
                        <div style={{ fontSize:13, fontWeight:900, color:status[1], textTransform:"uppercase", letterSpacing:0.5 }}>{status[0]}</div>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:2 }}>em 10 possíveis</div>
                      </div>
                    </div>
                    <div style={{ background:"rgba(15,23,42,0.4)", padding:"16px", borderRadius:"16px", fontSize:13, color:"#e2e8f0", lineHeight:1.6, borderLeft:`4px solid ${status[1]}`, marginBottom:15 }}>
                      {textoEspecifico}
                    </div>
                  </>
                )}

                {/* Notas em Texto */}
                {light && <style>{`textarea.auto-nota::placeholder { color: rgba(255,255,255,0.35) !important; }`}</style>}
                <textarea
                  className="auto-nota"
                  value={uData.dNotas?.[dim.id] || ""}
                  onChange={async (e) => {
                    const nN = { ...(uData.dNotas || {}), [dim.id]: e.target.value };
                    await setDoc(doc(db, "userData", user.username), { dNotas: nN }, { merge: true });
                  }}
                  style={{ ...INP, fontSize:12, background:"rgba(0,0,0,0.2)" }}
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
