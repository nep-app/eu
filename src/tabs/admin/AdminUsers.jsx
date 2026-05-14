import React, { useState } from 'react';
import { doc, setDoc, getDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, PRP, RadarChart, INP } from "../../theme.jsx";
import { JEEP_LIST, ALL_MEDALS, upd, nowLabel, PIA_FIELDS, getWeekKey } from "../../data.js";

export default function AdminUsers({ amMedals, setAmMedals, allShared }) {
  const [userSelecionado, setUserSelecionado] = useState(null);
  const [medalModal, setMedalModal]           = useState(null); // { username, medal }
  const [medalMsg,   setMedalMsg]             = useState("");

  // Função para formatar o Timestamp (Milissegundos) para Dia/Mês e Horas
  function formatarDataHora(ts, dataAntiga) {
    if (!ts) return dataAntiga; 
    const d = new Date(ts);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes} às ${hora}:${min}`;
  }

  // ── 1. LÓGICA DE ATRIBUIÇÃO DE MEDALHAS (semanal + histórico) ──
  async function assignMedal(username, mid, msg) {
    const medalDoc  = amMedals[username] || {};
    const weekKey   = getWeekKey();
    const curWeek   = (medalDoc.weekKey === weekKey ? medalDoc.week : []) || [];
    const allTime   = medalDoc.allTime || [];
    if (curWeek.includes(mid)) return; // já tem esta semana

    const nextWeek    = [...curWeek, mid];
    const nextAllTime = allTime.includes(mid) ? allTime : [...allTime, mid];
    const newDoc      = { week: nextWeek, weekKey, allTime: nextAllTime };

    setAmMedals(p => upd(p, username, newDoc));
    await setDoc(doc(db, "medals", username), newDoc);

    const medal = ALL_MEDALS.find(m => m.id === mid);
    const userRef  = doc(db, "userData", username);
    const userSnap = await getDoc(userRef);
    const uData    = userSnap.exists() ? userSnap.data() : {};
    const newHistory = [...(uData.history || []),
      { date: nowLabel(), action: `Recebeste a medalha ${medal?.icon} ${medal?.label}! 🏅`, ts: Date.now(), xp: 50 }];
    await setDoc(userRef, { history: newHistory, weekXp: (uData.weekXp || 0) + 50 }, { merge: true });

    const notifText = `🏅 A Teresa atribuiu-te a medalha ${medal?.icon} ${medal?.label}!${msg ? ` "${msg}"` : ""}`;
    await addDoc(collection(db, "notifications", username, "items"), {
      from:"teresa", text: notifText, date: nowLabel(), read: false
    });
  }

  async function removeMedal(username, mid) {
    if (!window.confirm("Remover esta medalha da semana atual?")) return;
    const medalDoc = amMedals[username] || {};
    const weekKey  = getWeekKey();
    const curWeek  = (medalDoc.weekKey === weekKey ? medalDoc.week : []) || [];
    const nextWeek = curWeek.filter(m => m !== mid);
    const newDoc   = { ...medalDoc, week: nextWeek, weekKey };
    setAmMedals(p => upd(p, username, newDoc));
    await setDoc(doc(db, "medals", username), newDoc);
  }

  // ── 2. COMPONENTE DO MODAL (DOSSIER) ──
  function DossierModal({ username, onClose }) {
    const uData     = allShared[username] || {};
    const medalDoc  = amMedals[username] || {};
    const weekKey   = getWeekKey();
    const weekMedals = (medalDoc.weekKey === weekKey ? medalDoc.week : []) || [];
    const allTimeMedals = medalDoc.allTime || [];
    const totalXp   = (uData.history || []).reduce((s, h) => s + (h.xp || 0), 0);
    const jeep      = JEEP_LIST.find(j => j.username === username);

    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(7,11,20,0.98)", zIndex: 999, padding: "20px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: jeep.color }} />
            <div>
              <h2 style={{ margin: 0, fontSize: 20 }}>{jeep.name}</h2>
              <div style={{ fontSize:11, color:CYN, fontWeight:800 }}>{totalXp} XP total · {allTimeMedals.length} medalhas histórico</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 12, fontWeight: 900, cursor: "pointer" }}>FECHAR ✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 15, maxWidth: 600, margin: "0 auto" }}>
          
          {/* SECÇÃO: MEDALHAS SEMANAIS */}
          <div style={CARD}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={SL}>🏅 Medalhas desta Semana</div>
              {allTimeMedals.length > 0 && (
                <div style={{ fontSize:10, color:CYN, fontWeight:800 }}>
                  {allTimeMedals.length} no total
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: allTimeMedals.length > 0 ? 16 : 0 }}>
              {ALL_MEDALS.map(m => {
                const hasWeek = weekMedals.includes(m.id);
                const hasEver = allTimeMedals.includes(m.id);
                return (
                  <div key={m.id} style={{
                    flex: "1 0 28%", minWidth: 90, padding: "10px 6px 8px", borderRadius: 16, textAlign: "center",
                    background: hasWeek ? `${CYN}18` : hasEver ? "rgba(50,199,255,0.06)" : "rgba(255,255,255,0.04)",
                    border: hasWeek ? `2px solid ${CYN}60` : hasEver ? `1.5px solid rgba(50,199,255,0.2)` : "1.5px solid rgba(255,255,255,0.07)",
                    position: "relative",
                  }}>
                    {/* Remove button if assigned this week */}
                    {hasWeek && (
                      <button onClick={() => removeMedal(username, m.id)} style={{
                        position:"absolute", top:4, right:4, background:"rgba(244,63,94,0.15)",
                        border:"none", color:"#f43f5e", fontSize:10, borderRadius:6,
                        cursor:"pointer", padding:"1px 5px", fontWeight:900, lineHeight:1.4,
                      }}>✕</button>
                    )}
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{m.icon}</div>
                    <div style={{ fontSize: 9, fontWeight: 900, color: hasWeek ? CYN : hasEver ? "#5a7a9a" : "#475569", marginBottom: 4 }}>
                      {m.label.toUpperCase()}
                    </div>
                    {!hasWeek && (
                      <button onClick={() => { setMedalModal({ username, medal: m }); setMedalMsg(""); }} style={{
                        background: "rgba(50,199,255,0.12)", border:`1px solid ${CYN}30`,
                        color: CYN, fontSize:9, fontWeight:900, borderRadius:8,
                        padding:"3px 8px", cursor:"pointer", width:"100%",
                      }}>
                        + Atribuir
                      </button>
                    )}
                    {hasWeek && (
                      <div style={{ fontSize:8, color:"#5a7a9a", fontWeight:700 }}>✓ Esta semana</div>
                    )}
                  </div>
                );
              })}
            </div>
            {allTimeMedals.length > 0 && (
              <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:10 }}>
                <div style={{ fontSize:10, color:"#5a7a9a", fontWeight:800, marginBottom:6 }}>HISTÓRICO — TODAS AS SEMANAS</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {allTimeMedals.map(mid => {
                    const m = ALL_MEDALS.find(x => x.id === mid);
                    return m ? <span key={mid} style={{ fontSize:20 }} title={m.label}>{m.icon}</span> : null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* SECÇÃO: RODA DA VIDA */}
          <div style={CARD}>
            <div style={SL}>🌸 Bem-estar (Roda da Vida)</div>
            {uData.roda ? (
              <RadarChart scores={uData.roda} color={CYN} />
            ) : (
              <div style={{ textAlign: "center", color: "#475569", padding: 20, fontSize: 13 }}>Sem dados de Roda da Vida.</div>
            )}
          </div>

          {/* SECÇÃO: PIA (PROJETO) */}
          <div style={CARD}>
            <div style={SL}>🚀 Plano Individual (PIA)</div>
            {uData.pia ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PIA_FIELDS.map(f => (
                  <div key={f.key} style={{ background: "rgba(0,0,0,0.2)", padding: "10px 12px", borderRadius: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 900, color: CYN, marginBottom: 2 }}>{f.title}</div>
                    <div style={{ fontSize: 13, color: "#e2e8f0" }}>{uData.pia[f.key] || "---"}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#475569", fontSize: 13 }}>PIA por preencher.</div>
            )}
          </div>

          {/* SECÇÃO: CÁPSULA FINAL */}
          <div style={CARD}>
            <div style={SL}>💌 Cápsula Final</div>
            {(() => {
              const cap2 = uData.cap2 || {};
              const isUnlocked = cap2.unlocked;
              const isSealed   = cap2.locked;
              const isRevealed = cap2.revealed;

              async function toggleCap2Unlock() {
                await setDoc(doc(db, "userData", username), {
                  cap2: { ...cap2, unlocked: !isUnlocked }
                }, { merge: true });
              }
              async function toggleCap2Reveal() {
                await setDoc(doc(db, "userData", username), {
                  cap2: { ...cap2, revealed: !isRevealed }
                }, { merge: true });
              }

              return (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", borderRadius:12, background:"rgba(0,0,0,0.2)" }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:800 }}>
                        {!isUnlocked ? "🔐 Fechada" : isSealed ? "✅ Entregue pelo jovem" : "📝 Aberta para escrita"}
                      </div>
                      {isSealed && cap2.sealedAt && <div style={{ fontSize:10, color:"#64748b", marginTop:2 }}>Selada: {cap2.sealedAt}</div>}
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={toggleCap2Unlock} style={{
                        background: isUnlocked ? "rgba(244,63,94,0.15)" : "rgba(50,199,255,0.15)",
                        border: isUnlocked ? "1px solid rgba(244,63,94,0.3)" : "1px solid rgba(50,199,255,0.3)",
                        color: isUnlocked ? "#f43f5e" : CYN,
                        borderRadius:10, padding:"6px 14px", fontWeight:900, fontSize:11, cursor:"pointer",
                      }}>
                        {isUnlocked ? "🔒 Fechar" : "🔓 Abrir"}
                      </button>
                      {isSealed && (
                        <button onClick={toggleCap2Reveal} style={{
                          background: isRevealed ? "rgba(251,191,36,0.1)" : "rgba(74,222,128,0.12)",
                          border: isRevealed ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(74,222,128,0.3)",
                          color: isRevealed ? "#fbbf24" : "#4ade80",
                          borderRadius:10, padding:"6px 14px", fontWeight:900, fontSize:11, cursor:"pointer",
                        }}>
                          {isRevealed ? "👁 Esconder" : "👁 Revelar"}
                        </button>
                      )}
                    </div>
                  </div>
                  {isRevealed && cap2.text && (
                    <div style={{ fontSize:13, color:"#e2e8f0", lineHeight:1.6, padding:"12px 14px", background:"rgba(0,0,0,0.2)", borderRadius:12, whiteSpace:"pre-wrap" }}>
                      {cap2.text}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* SECÇÃO: HISTÓRICO COMPLETO COM HORA */}
          <div style={CARD}>
            <div style={SL}>📜 Linha do Tempo</div>
            <div style={{ maxHeight: 400, overflowY: "auto", paddingRight: 5 }}>
              {uData.history && uData.history.length > 0 ? (
                uData.history.slice().reverse().map((h, i) => (
                  <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, flex: 1, paddingRight: 10 }}>{h.action}</div>
                    <div style={{ fontSize: 10, color: CYN, fontWeight: 800, textAlign: "right" }}>
                      {formatarDataHora(h.ts, h.date)}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", color: "#475569", padding: 20, fontSize: 13 }}>Sem atividade registada.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
      {JEEP_LIST.map(j => {
        const medalDoc   = amMedals[j.username] || {};
        const weekKey    = getWeekKey();
        const wMedals    = (medalDoc.weekKey === weekKey ? medalDoc.week : []) || [];
        const atMedals   = medalDoc.allTime || [];
        const uData      = allShared[j.username] || {};
        const totalXpCard = (uData.history || []).reduce((s, h) => s + (h.xp || 0), 0);

        return (
          <div key={j.username} style={{ ...CARD, textAlign: "center", padding: "20px 15px" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: j.color, margin: "0 auto 8px auto" }} />
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{j.name}</div>
            <div style={{ fontSize: 10, color: CYN, fontWeight: 900 }}>{uData.weekXp || 0} XP semana</div>
            <div style={{ fontSize: 9, color: "#5a7a9a", fontWeight: 700, marginBottom: 10 }}>{totalXpCard} XP total</div>

            {/* Medalhas desta semana */}
            {wMedals.length > 0 && (
              <div style={{ display:"flex", gap:3, justifyContent:"center", marginBottom:6, flexWrap:"wrap" }}>
                {wMedals.map(mid => {
                  const m = ALL_MEDALS.find(x => x.id === mid);
                  return m ? <span key={mid} style={{ fontSize:16 }}>{m.icon}</span> : null;
                })}
              </div>
            )}
            {atMedals.length > 0 && (
              <div style={{ fontSize:9, color:"#5a7a9a", marginBottom:12 }}>
                🏅 {atMedals.length} medalha{atMedals.length !== 1 ? "s" : ""} no histórico
              </div>
            )}

            <button
              onClick={() => setUserSelecionado(j.username)}
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${CYN}40`, color: CYN, borderRadius: 12, padding: "10px", fontSize: 11, fontWeight: 900, cursor: "pointer" }}
            >
              VER DOSSIER
            </button>
          </div>
        );
      })}

      {userSelecionado && (
        <DossierModal
          username={userSelecionado}
          onClose={() => setUserSelecionado(null)}
        />
      )}

      {/* ── MODAL DE ATRIBUIÇÃO DE MEDALHA ── */}
      {medalModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:1100,
          display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ ...CARD, maxWidth:360, width:"100%", padding:28 }}>
            <div style={{ fontSize:48, textAlign:"center", marginBottom:8 }}>{medalModal.medal.icon}</div>
            <div style={{ fontWeight:900, fontSize:17, textAlign:"center", color:CYN, marginBottom:4 }}>
              {medalModal.medal.label}
            </div>
            <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.65, marginBottom:18, textAlign:"center" }}>
              {medalModal.medal.desc}
            </div>
            <div style={{ fontSize:10, color:"#5a7a9a", fontWeight:800, marginBottom:6, textTransform:"uppercase", letterSpacing:0.8 }}>
              Mensagem opcional para o jovem
            </div>
            <textarea value={medalMsg} onChange={e => setMedalMsg(e.target.value)}
              style={{ ...INP, resize:"none", marginBottom:18, fontSize:13 }} rows={3}
              placeholder="Ex: Foste incrível hoje na sessão! 🌟" />
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setMedalModal(null)} style={{
                flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
                color:"#94a3b8", borderRadius:12, padding:"12px", fontWeight:900, fontSize:13, cursor:"pointer",
              }}>
                Cancelar
              </button>
              <button onClick={async () => {
                await assignMedal(medalModal.username, medalModal.medal.id, medalMsg);
                setMedalModal(null);
                setMedalMsg("");
              }} style={{
                flex:2, background:CYN, border:"none", color:"#071529",
                borderRadius:12, padding:"12px", fontWeight:900, fontSize:13, cursor:"pointer",
              }}>
                ✓ Atribuir Medalha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
