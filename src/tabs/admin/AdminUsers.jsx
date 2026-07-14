import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, addDoc, collection, onSnapshot, updateDoc, deleteField, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, PRP, GRN, RadarChart, INP } from "../../theme.jsx";
import { JEEP_LIST, ALL_MEDALS, upd, nowLabel, nowFull, PIA_FIELDS, PIA_SECTIONS, getWeekKey, fmtDate } from "../../data.js";

export default function AdminUsers({ amMedals, setAmMedals, allShared, weekStartTs = 0 }) {
  // Todas as missões (por id) para poder mostrar o texto/prazo das que cada jovem cumpriu.
  const [missoesPorId, setMissoesPorId] = useState({});
  useEffect(() => {
    return onSnapshot(collection(db, "missions"), snap => {
      const map = {};
      snap.docs.forEach(d => { map[d.id] = { id: d.id, ...d.data() }; });
      setMissoesPorId(map);
    });
  }, []);
  const [userSelecionado, setUserSelecionado] = useState(null);
  const [medalModal, setMedalModal]           = useState(null);
  const [medalMsg,   setMedalMsg]             = useState("");
  const [medalPush,  setMedalPush]            = useState(true);
  const [piaPrazoExt, setPiaPrazoExt]         = useState("");

  function formatarDataHora(ts, dataAntiga) {
    if (!ts) return dataAntiga;
    const d = new Date(ts);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} às ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  // ── ATRIBUIR MEDALHA ──────────────────────────────────────────────────────
  async function assignMedal(username, mid, msg, push = true) {
    const medalDoc  = amMedals[username] || {};
    const weekKey   = getWeekKey();
    const curWeek   = (medalDoc.weekKey === weekKey ? medalDoc.week : []) || [];
    const allTime   = medalDoc.allTime || [];
    if (curWeek.includes(mid)) return;

    const newMedalDoc = { week:[...curWeek, mid], weekKey, allTime: allTime.includes(mid) ? allTime : [...allTime, mid] };
    setAmMedals(p => upd(p, username, newMedalDoc));
    await setDoc(doc(db, "medals", username), newMedalDoc);

    const medal   = ALL_MEDALS.find(m => m.id === mid);
    const userRef = doc(db, "userData", username);
    const snap    = await getDoc(userRef);
    const uData   = snap.exists() ? snap.data() : {};
    const newHistory = [...(uData.history || []),
      { date: nowLabel(), action: `Recebeste a medalha ${medal?.icon} ${medal?.label}! 🏅`, ts: Date.now(), xp: 50 }];
    await setDoc(userRef, { history: newHistory, weekXp: (uData.weekXp || 0) + 50 }, { merge: true });

    const notifText = `🏅 A Teresa atribuiu-te a medalha ${medal?.icon} ${medal?.label}!${msg ? ` "${msg}"` : ""}`;
    await addDoc(collection(db, "notifications", username, "items"), { from:"teresa", text:notifText, date:nowFull(), read:false, ts:Date.now(), push });
  }

  // ── REMOVER MEDALHA (semana + allTime + histórico + XP) ──────────────────
  async function removeMedal(username, mid) {
    if (!window.confirm("Remover esta medalha completamente?\n(semana + histórico + XP devolvido)")) return;
    const medalDoc  = amMedals[username] || {};
    const weekKey   = getWeekKey();
    const curWeek   = (medalDoc.weekKey === weekKey ? medalDoc.week : []) || [];
    const newMedalDoc = {
      ...medalDoc,
      week:    curWeek.filter(m => m !== mid),
      allTime: (medalDoc.allTime || []).filter(m => m !== mid),
      weekKey,
    };
    setAmMedals(p => upd(p, username, newMedalDoc));
    await setDoc(doc(db, "medals", username), newMedalDoc);

    // Remove história + devolve XP
    const medal   = ALL_MEDALS.find(m => m.id === mid);
    const userRef = doc(db, "userData", username);
    const snap    = await getDoc(userRef);
    if (snap.exists()) {
      const uData   = snap.data();
      const history = uData.history || [];
      // Remove a entrada mais recente que mencione esta medalha
      let found = false;
      const newHistory = [...history].reverse().filter(h => {
        if (!found && h.action?.includes(medal?.label)) { found = true; return false; }
        return true;
      }).reverse();
      const xpRemoved = found ? 50 : 0;
      await setDoc(userRef, { history: newHistory, weekXp: Math.max(0, (uData.weekXp || 0) - xpRemoved) }, { merge: true });
    }
  }

  // ── APAGAR ENTRADA DO HISTÓRICO (por ts) ─────────────────────────────────
  async function deleteHistoryEntry(username, entry) {
    if (!window.confirm(`Apagar esta entrada?\n"${entry.action}"`)) return;
    const userRef = doc(db, "userData", username);
    const snap    = await getDoc(userRef);
    if (!snap.exists()) return;
    const uData      = snap.data();
    const newHistory = (uData.history || []).filter(h =>
      entry.ts ? h.ts !== entry.ts : h.action !== entry.action
    );
    // Recalcula weekXp a partir do histórico restante (evita erros acumulados)
    const newWeekXp = newHistory.reduce((s, h) => s + (h.xp || 0), 0);
    await setDoc(userRef, { history: newHistory, weekXp: newWeekXp }, { merge: true });
  }

  // ── RESET TOTAL (XP + histórico + missões + medalhas + entregas) ──────────
  async function resetTotal(username) {
    if (!window.confirm(`RESET TOTAL do ${username}?\n\nApaga: todo o XP, histórico, missões concluídas, medalhas (semana + histórico), autoavaliação e pergunta semanal.\n\nEsta ação não tem volta!`)) return;
    const userRef = doc(db, "userData", username);
    await setDoc(userRef, {
      weekXp: 0, history: [], completedMissions: [],
      autoSaved: false, autoDate: null,
      answered: false, qAnswer: null,
    }, { merge: true });
    const newMedalDoc = { week: [], weekKey: getWeekKey(), allTime: [] };
    setAmMedals(p => upd(p, username, newMedalDoc));
    await setDoc(doc(db, "medals", username), newMedalDoc);
  }

  // ── RESET MISSÕES CONCLUÍDAS ──────────────────────────────────────────────
  async function resetMissoes(username) {
    if (!window.confirm("Limpar todas as missões concluídas deste jovem?")) return;
    await setDoc(doc(db, "userData", username), { completedMissions: [] }, { merge: true });
  }

  // ── RESET AUTOAVALIAÇÃO ───────────────────────────────────────────────────
  async function resetAutoavaliacao(username) {
    if (!window.confirm("Repor a autoavaliação? O jovem poderá submeter de novo. A versão atual fica guardada no histórico.")) return;
    const uData = allShared[username] || {};
    if (uData.autoSaved || Object.keys(uData.dScores || {}).length > 0) {
      await updateDoc(doc(db, "userData", username), {
        autoAvaliacaoHistorico: arrayUnion({
          week: getWeekKey(), scores: uData.dScores || {},
          notas: uData.dNotas || {}, date: uData.autoDate || null,
          saved: !!uData.autoSaved, ts: Date.now()
        })
      });
    }
    await setDoc(doc(db, "userData", username), { autoSaved: false, autoDate: null, dScores: {}, dNotas: {} }, { merge: true });
  }

  // ── RESET PERGUNTA SEMANAL ────────────────────────────────────────────────
  async function resetPergunta(username) {
    if (!window.confirm("Repor a pergunta semanal? O jovem poderá responder de novo. A resposta atual fica guardada no histórico.")) return;
    const uData = allShared[username] || {};
    if (uData.answerText) {
      await updateDoc(doc(db, "userData", username), {
        perguntasHistorico: arrayUnion({
          week: getWeekKey(), answer: uData.answerText,
          type: uData.answerType || "texto", ts: Date.now()
        })
      });
    }
    await setDoc(doc(db, "userData", username), { answered: false, qAnswer: null }, { merge: true });
  }

  // ── RESET SATISFAÇÃO ──────────────────────────────────────────────────────
  async function resetSatisfacao(username) {
    if (!window.confirm("Repor a satisfação? O jovem poderá submeter de novo. A versão atual fica guardada no histórico.")) return;
    const uData = allShared[username] || {};
    if (uData.sSaved) {
      await updateDoc(doc(db, "userData", username), {
        satisfacaoHistorico: arrayUnion({
          week: getWeekKey(), ratings: uData.sRatings || {},
          chips: uData.sChips || [], mudaria: uData.sMudaria || "",
          ts: Date.now()
        })
      });
    }
    await setDoc(doc(db, "userData", username), { sSaved: false, sRatings: {}, sChips: [], sMudaria: "" }, { merge: true });
  }

  // ── DOSSIER MODAL ─────────────────────────────────────────────────────────
  function DossierModal({ username, onClose }) {
    const uData         = allShared[username] || {};
    const medalDoc      = amMedals[username] || {};
    const weekKey       = getWeekKey();
    const weekMedals    = (medalDoc.weekKey === weekKey ? medalDoc.week : []) || [];
    const allTimeMedals = medalDoc.allTime || [];
    const publicHistory = (uData.history || []).filter(h => !h.private);
    const totalXp       = publicHistory.reduce((s, h) => s + (h.xp || 0), 0);
    const semanaXp      = weekStartTs > 0
      ? publicHistory.filter(h => (h.ts || 0) >= weekStartTs && (h.xp || 0) > 0).reduce((s, h) => s + (h.xp || 0), 0)
      : (uData.weekXp || 0);
    const jeep          = JEEP_LIST.find(j => j.username === username);
    const [xpEdit, setXpEdit] = useState(String(uData.weekXp || 0));
    const [feedbackAuto, setFeedbackAuto] = useState("");
    const [feedbackPia, setFeedbackPia]   = useState("");
    const [feedbackPush, setFeedbackPush] = useState(false);
    const piaPrazo = piaPrazoExt;
    const setPiaPrazo = setPiaPrazoExt;

    async function enviarFeedback(tipo, texto, setTexto) {
      if (!texto.trim()) return;
      const tipoLabel = { pia:"PIA", auto:"Autoavaliação", roda:"Roda da Vida", geral:"mensagem" }[tipo] || "dossier";
      await addDoc(collection(db, "notifications", username, "items"), {
        from: "teresa", text: `💬 Teresa (sobre o teu ${tipoLabel}): ${texto.trim()}`, date: nowFull(), read: false, ts: Date.now(), push: feedbackPush
      });
      setTexto(""); setFeedbackPush(false);
      alert("Feedback enviado! ✓");
    }

    const BTN_RESET = {
      background:"rgba(244,63,94,0.10)", border:"1.5px dashed rgba(244,63,94,0.4)",
      color:"#f43f5e", borderRadius:10, padding:"8px 14px",
      fontWeight:900, fontSize:11, cursor:"pointer",
    };

    return (
      <div style={{ position:"fixed", inset:0, background:"rgba(7,11,20,0.98)", zIndex:999, padding:20, overflowY:"auto" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:20, height:20, borderRadius:"50%", background:jeep.color }} />
            <div>
              <h2 style={{ margin:0, fontSize:20 }}>{jeep.name}</h2>
              <div style={{ fontSize:11, color:CYN, fontWeight:800 }}>
                {totalXp} XP total · {allTimeMedals.length} medalhas histórico · {semanaXp} XP esta semana
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"#fff", padding:"10px 20px", borderRadius:12, fontWeight:900, cursor:"pointer" }}>FECHAR ✕</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:15, maxWidth:600, margin:"0 auto" }}>



          {/* MEDALHAS */}
          <div style={CARD}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={SL}>🏅 Medalhas desta Semana</div>
              {allTimeMedals.length > 0 && <div style={{ fontSize:10, color:CYN, fontWeight:800 }}>{allTimeMedals.length} no total</div>}
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center", marginBottom: allTimeMedals.length > 0 ? 16 : 0 }}>
              {ALL_MEDALS.map(m => {
                const hasWeek = weekMedals.includes(m.id);
                const hasEver = allTimeMedals.includes(m.id);
                return (
                  <div key={m.id} style={{
                    flex:"1 0 28%", minWidth:90, padding:"10px 6px 8px", borderRadius:16, textAlign:"center",
                    background: hasWeek ? `${CYN}18` : hasEver ? "rgba(50,199,255,0.06)" : "rgba(255,255,255,0.04)",
                    border: hasWeek ? `2px solid ${CYN}60` : hasEver ? "1.5px solid rgba(50,199,255,0.2)" : "1.5px solid rgba(255,255,255,0.07)",
                    position:"relative",
                  }}>
                    {(hasWeek || hasEver) && (
                      <button onClick={() => removeMedal(username, m.id)} style={{
                        position:"absolute", top:4, right:4, background:"rgba(244,63,94,0.18)",
                        border:"none", color:"#f43f5e", fontSize:10, borderRadius:6,
                        cursor:"pointer", padding:"1px 5px", fontWeight:900, lineHeight:1.4,
                      }}>✕</button>
                    )}
                    <div style={{ fontSize:24, marginBottom:4 }}>{m.icon}</div>
                    <div style={{ fontSize:9, fontWeight:900, color: hasWeek ? CYN : hasEver ? "#5a7a9a" : "#475569", marginBottom:4 }}>
                      {m.label.toUpperCase()}
                    </div>
                    {hasWeek ? (
                      <div style={{ fontSize:8, color:"#5a7a9a", fontWeight:700 }}>✓ Esta semana</div>
                    ) : (
                      <>
                        {hasEver && <div style={{ fontSize:8, color:"#475569", fontWeight:700, marginBottom:3 }}>📅 Histórico</div>}
                        <button onClick={() => { setMedalModal({ username, medal:m }); setMedalMsg(""); }} style={{
                          background:"rgba(50,199,255,0.12)", border:`1px solid ${CYN}30`,
                          color:CYN, fontSize:9, fontWeight:900, borderRadius:8,
                          padding:"3px 8px", cursor:"pointer", width:"100%",
                        }}>+ Atribuir</button>
                      </>
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

          {/* RODA DA VIDA */}
          <div style={CARD}>
            <div style={SL}>🌸 Bem-estar (Roda da Vida)</div>
            {uData.roda
              ? <RadarChart scores={uData.roda} color={CYN} />
              : <div style={{ textAlign:"center", color:"#475569", padding:20, fontSize:13 }}>Sem dados.</div>}
          </div>

          {/* SECÇÃO: PIA — conteúdo completo */}
          <div style={CARD}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <div style={SL}>🚀 PIA — Plano Individual de Ação</div>
              {uData.piaSaved
                ? <span style={{ fontSize:10, color:GRN, fontWeight:800 }}>✓ Enviado {uData.piaSavedAt||""}</span>
                : <span style={{ fontSize:10, color:"#475569", fontWeight:700 }}>Ainda não enviado</span>}
            </div>
            {(() => {
              const piaUnlocked = uData.piaUnlocked || {};
              const piaData     = uData.piaData     || {};
              async function togglePiaSection(sectionId) {
                const cur = piaUnlocked[sectionId] || false;
                const opening = !cur;
                await setDoc(doc(db, "userData", username), {
                  piaUnlocked: { ...piaUnlocked, [sectionId]: opening },
                  ...(opening && piaPrazo ? { piaSavedPrazo: piaPrazo } : {}),
                }, { merge: true });
              }
              return (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {/* Prazo para esta secção */}
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", background:"rgba(0,0,0,0.2)", borderRadius:10 }}>
                    <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", flexShrink:0 }}>⏰ Prazo (aplicado ao abrir):</div>
                    <input type="date" value={piaPrazo} onChange={e => setPiaPrazo(e.target.value)}
                      style={{ ...INP, marginBottom:0, flex:1, fontSize:11, padding:"4px 8px" }} />
                    {piaPrazo && <button onClick={() => setPiaPrazo("")} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer", fontSize:14 }}>✕</button>}
                  </div>
                  {PIA_SECTIONS.map(sec => {
                    const sd = piaData[sec.id] || {};
                    const isOpen = piaUnlocked[sec.id] || false;
                    const hasContent = sec.id === "s3b"
                      ? ["swotF","swotFraq","swotOp","swotR"].some(k => sd[k]?.trim())
                      : sec.fields.some(f => {
                          if (f.type === "activities") return (sd[f.key]||[]).some(a => a.oQue);
                          if (f.type === "revisoes")   return (sd[f.key]||[]).some(r => r.texto);
                          return sd[f.key]?.trim?.();
                        });
                    return (
                      <div key={sec.id} style={{ borderRadius:12, background:"rgba(0,0,0,0.2)", overflow:"hidden" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ fontSize:16 }}>{sec.icon}</span>
                            <span style={{ fontSize:12, fontWeight:800, color: hasContent ? "#f1f5f9" : "#475569" }}>{sec.title}</span>
                            {hasContent && <span style={{ fontSize:10, color:GRN }}>✓</span>}
                          </div>
                          <button onClick={() => togglePiaSection(sec.id)} style={{
                            background: isOpen ? "rgba(244,63,94,0.12)" : "rgba(50,199,255,0.10)",
                            border: isOpen ? "1px solid rgba(244,63,94,0.3)" : `1px solid ${CYN}25`,
                            color: isOpen ? "#f43f5e" : CYN,
                            borderRadius:8, padding:"3px 10px", fontWeight:900, fontSize:10, cursor:"pointer",
                          }}>{isOpen ? "🔒 Bloquear" : "🔓 Abrir"}</button>
                        </div>
                        {hasContent && (
                          <div style={{ padding:"0 14px 12px", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                            {sec.id === "s3b" ? (
                              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginTop:8 }}>
                                {[["swotF","Forças 💪"],["swotFraq","Fraquezas 🔍"],["swotOp","Oportunidades 🌱"],["swotR","Riscos ⚠️"]].map(([k,l]) => sd[k] && (
                                  <div key={k} style={{ background:"rgba(0,0,0,0.25)", borderRadius:8, padding:"8px 10px" }}>
                                    <div style={{ fontSize:9, fontWeight:900, color:"#5a7a9a", marginBottom:3 }}>{l}</div>
                                    <div style={{ fontSize:11, color:"#e2e8f0", lineHeight:1.5, whiteSpace:"pre-wrap" }}>{sd[k]}</div>
                                  </div>
                                ))}
                              </div>
                            ) : sec.fields.map(f => {
                              if (f.type === "activities") {
                                const acts = (sd[f.key]||[]).filter(a => a.oQue);
                                if (!acts.length) return null;
                                return (
                                  <div key={f.key} style={{ marginTop:8 }}>
                                    <div style={{ fontSize:9, color:"#5a7a9a", fontWeight:800, marginBottom:4 }}>{f.label.toUpperCase()}</div>
                                    {acts.map((a,i) => (
                                      <div key={i} style={{ fontSize:11, color:"#e2e8f0", marginBottom:4, paddingLeft:8, borderLeft:`2px solid ${CYN}40` }}>
                                        <strong>{a.oQue}</strong>{a.quando && ` · ${a.quando}`}{a.obj && ` — ${a.obj}`}
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                              if (f.type === "revisoes") {
                                const revs = (sd[f.key]||[]).filter(r => r.texto);
                                if (!revs.length) return null;
                                return (
                                  <div key={f.key} style={{ marginTop:8 }}>
                                    <div style={{ fontSize:9, color:"#5a7a9a", fontWeight:800, marginBottom:4 }}>{f.label.toUpperCase()}</div>
                                    {revs.map((r,i) => (
                                      <div key={i} style={{ fontSize:11, color:"#e2e8f0", marginBottom:4, paddingLeft:8, borderLeft:"2px solid rgba(167,139,250,0.4)" }}>
                                        {r.data && <span style={{ color:"#5a7a9a" }}>{r.data}: </span>}{r.texto}
                                      </div>
                                    ))}
                                  </div>
                                );
                              }
                              const val = sd[f.key];
                              if (!val?.trim?.()) return null;
                              return (
                                <div key={f.key} style={{ marginTop:8 }}>
                                  <div style={{ fontSize:9, color:"#5a7a9a", fontWeight:800, marginBottom:3 }}>{f.label.toUpperCase()}</div>
                                  <div style={{ fontSize:12, color:"#e2e8f0", lineHeight:1.6, whiteSpace:"pre-wrap" }}>{val}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {uData.piaSaved && (
                    <div style={{ marginTop:4 }}>
                      <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                        <input value={feedbackPia} onChange={e => setFeedbackPia(e.target.value)}
                          placeholder="Dar feedback ao PIA…"
                          style={{ ...INP, flex:1, marginBottom:0, fontSize:12, padding:"8px 12px" }} />
                        <button onClick={() => enviarFeedback("pia", feedbackPia, setFeedbackPia)}
                          style={{ background:`${CYN}20`, border:`1px solid ${CYN}40`, color:CYN, borderRadius:10, padding:"0 14px", fontWeight:900, fontSize:12, cursor:"pointer" }}>
                          Enviar
                        </button>
                      </div>
                      <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:11, color:"#94a3b8", cursor:"pointer" }}>
                        <input type="checkbox" checked={feedbackPush} onChange={() => setFeedbackPush(v => !v)}
                          style={{ accentColor:CYN, width:13, height:13 }} />
                        🔔 Enviar também como notificação push
                      </label>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* SECÇÃO: FUNCIONALIDADES INDIVIDUAIS */}
          <div style={CARD}>
            <div style={SL}>🔧 Funcionalidades (este jovem)</div>
            <div style={{ fontSize:11, color:"#475569", marginBottom:12 }}>
              Override ao toggle global. "Global" segue o que está no painel Geral.
            </div>
            {(() => {
              const overrides = uData.featureOverrides || {};
              const FEATS = [
                { key:"perguntaSemanal", label:"💬 Pergunta da Semana" },
                { key:"autoAvaliacao",   label:"📊 Autoavaliação" },
                { key:"satisfacao",      label:"😊 Satisfação" },
                { key:"rodaVida",        label:"🌸 Roda da Vida" },
              ];
              async function setOverride(key, val) {
                if (val === null) {
                  await updateDoc(doc(db, "userData", username), { [`featureOverrides.${key}`]: deleteField() });
                } else {
                  await updateDoc(doc(db, "userData", username), { [`featureOverrides.${key}`]: val });
                }
              }
              return (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {FEATS.map(f => {
                    const v = overrides[f.key];
                    return (
                      <div key={f.key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderRadius:12, background:"rgba(0,0,0,0.2)" }}>
                        <div style={{ fontSize:12, fontWeight:800, color: v === true ? "#f1f5f9" : v === false ? "#475569" : "#94a3b8" }}>{f.label}</div>
                        <div style={{ display:"flex", gap:5 }}>
                          {[
                            { val:null,  label:"🌐",    title:"Seguir global" },
                            { val:true,  label:"✓ ON",  title:"Forçar ON"     },
                            { val:false, label:"✗ OFF", title:"Bloquear"      },
                          ].map(opt => {
                            const active = v === opt.val || (opt.val === null && v === undefined);
                            return (
                              <button key={String(opt.val)} onClick={() => setOverride(f.key, opt.val)} title={opt.title} style={{
                                padding:"4px 9px", borderRadius:8, fontSize:11, fontWeight:800, cursor:"pointer",
                                border: active ? `1.5px solid ${opt.val === true ? GRN : opt.val === false ? "#f43f5e" : CYN}` : "1.5px solid rgba(255,255,255,0.08)",
                                background: active ? `${opt.val === true ? GRN : opt.val === false ? "#f43f5e" : CYN}18` : "rgba(255,255,255,0.03)",
                                color: active ? (opt.val === true ? GRN : opt.val === false ? "#f43f5e" : CYN) : "#475569",
                              }}>{opt.label}</button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* SECÇÃO: CÁPSULA DE MEIO-CAMINHO */}
          <div style={CARD}>
            <div style={SL}>💌 Cápsula de Meio-Caminho</div>
            {(() => {
              const cap1 = uData.cap || {};
              return (
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", borderRadius:12, background:"rgba(0,0,0,0.2)" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:800 }}>
                      {!cap1.unlocked ? "🔐 Fechada" : cap1.locked ? "✅ Entregue pelo jovem" : "📝 Aberta para escrita"}
                    </div>
                    {cap1.locked && cap1.sealedAt && <div style={{ fontSize:10, color:"#64748b", marginTop:2 }}>Selada: {cap1.sealedAt}</div>}
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    {cap1.locked && (
                      <button onClick={() => { if(window.confirm("Desfazer o selo? O jovem poderá editar de novo.")) setDoc(doc(db,"userData",username),{cap:{...cap1,locked:false,sealedAt:""}},{merge:true}); }} style={{
                        background:"rgba(251,191,36,0.15)", border:"1px solid rgba(251,191,36,0.35)",
                        color:"#fbbf24", borderRadius:10, padding:"6px 14px", fontWeight:900, fontSize:11, cursor:"pointer",
                      }}>✏️ Desfazer selo</button>
                    )}
                    <button onClick={() => setDoc(doc(db,"userData",username),{cap:{...cap1,unlocked:!cap1.unlocked}},{merge:true})} style={{
                      background: cap1.unlocked ? "rgba(244,63,94,0.15)" : "rgba(50,199,255,0.15)",
                      border: cap1.unlocked ? "1px solid rgba(244,63,94,0.3)" : "1px solid rgba(50,199,255,0.3)",
                      color: cap1.unlocked ? "#f43f5e" : CYN,
                      borderRadius:10, padding:"6px 14px", fontWeight:900, fontSize:11, cursor:"pointer",
                    }}>{cap1.unlocked ? "🔒 Fechar" : "🔓 Abrir"}</button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* CÁPSULA FINAL */}
          <div style={CARD}>
            <div style={SL}>💌 Cápsula Final</div>
            {(() => {
              const cap2 = uData.cap2 || {};
              return (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", borderRadius:12, background:"rgba(0,0,0,0.2)" }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:800 }}>
                        {!cap2.unlocked ? "🔐 Fechada" : cap2.locked ? "✅ Entregue" : "📝 Aberta para escrita"}
                      </div>
                      {cap2.locked && cap2.sealedAt && <div style={{ fontSize:10, color:"#64748b", marginTop:2 }}>Selada: {cap2.sealedAt}</div>}
                    </div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"flex-end" }}>
                      {cap2.locked && (
                        <button onClick={() => { if(window.confirm("Desfazer o selo? O jovem poderá editar de novo.")) setDoc(doc(db,"userData",username),{cap2:{...cap2,locked:false,sealedAt:""}},{merge:true}); }} style={{
                          background:"rgba(251,191,36,0.15)", border:"1px solid rgba(251,191,36,0.35)",
                          color:"#fbbf24", borderRadius:10, padding:"6px 14px", fontWeight:900, fontSize:11, cursor:"pointer",
                        }}>✏️ Desfazer selo</button>
                      )}
                      <button onClick={() => setDoc(doc(db,"userData",username),{cap2:{...cap2,unlocked:!cap2.unlocked}},{merge:true})} style={{
                        background: cap2.unlocked ? "rgba(244,63,94,0.15)" : "rgba(50,199,255,0.15)",
                        border: cap2.unlocked ? "1px solid rgba(244,63,94,0.3)" : "1px solid rgba(50,199,255,0.3)",
                        color: cap2.unlocked ? "#f43f5e" : CYN,
                        borderRadius:10, padding:"6px 14px", fontWeight:900, fontSize:11, cursor:"pointer",
                      }}>{cap2.unlocked ? "🔒 Fechar" : "🔓 Abrir"}</button>
                      {cap2.locked && (
                        <button onClick={() => setDoc(doc(db,"userData",username),{cap2:{...cap2,revealed:!cap2.revealed}},{merge:true})} style={{
                          background: cap2.revealed ? "rgba(251,191,36,0.1)" : "rgba(74,222,128,0.12)",
                          border: cap2.revealed ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(74,222,128,0.3)",
                          color: cap2.revealed ? "#fbbf24" : "#4ade80",
                          borderRadius:10, padding:"6px 14px", fontWeight:900, fontSize:11, cursor:"pointer",
                        }}>{cap2.revealed ? "👁 Esconder" : "👁 Revelar"}</button>
                      )}
                    </div>
                  </div>
                  {cap2.revealed && cap2.text && (
                    <div style={{ fontSize:13, color:"#e2e8f0", lineHeight:1.6, padding:"12px 14px", background:"rgba(0,0,0,0.2)", borderRadius:12, whiteSpace:"pre-wrap" }}>
                      {cap2.text}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* HISTÓRICO — com botão de apagar por entrada */}
          <div style={CARD}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={SL}>📜 Linha do Tempo</div>
              <div style={{ fontSize:10, color:"#5a7a9a", fontWeight:700 }}>✕ apaga entrada + devolve XP</div>
            </div>
            <div style={{ maxHeight:400, overflowY:"auto", paddingRight:4 }}>
              {uData.history?.length > 0 ? (
                [...(uData.history)].reverse().filter(h => !h.private).map((h, i) => (
                  <div key={h.ts ?? i} style={{ padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", gap:10 }}>
                    <button onClick={() => deleteHistoryEntry(username, h)} style={{
                      background:"rgba(244,63,94,0.12)", border:"none", color:"#f43f5e",
                      borderRadius:6, width:22, height:22, cursor:"pointer", fontWeight:900,
                      fontSize:12, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                    }}>✕</button>
                    <div style={{ flex:1, fontSize:12, fontWeight:600, color:"#e2e8f0", lineHeight:1.4 }}>{h.action}</div>
                    <div style={{ fontSize:10, color:CYN, fontWeight:800, textAlign:"right", flexShrink:0 }}>
                      {h.xp ? `+${h.xp} XP` : ""}<br/>
                      <span style={{ color:"#5a7a9a", fontSize:9 }}>{formatarDataHora(h.ts, h.date)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign:"center", color:"#475569", padding:20, fontSize:13 }}>Sem atividade registada.</div>
              )}
            </div>
          </div>

          {/* HISTÓRICO DE RESPOSTAS ARQUIVADAS */}
          {(() => {
            const hP = [...(uData.perguntasHistorico || [])].reverse();
            const hS = [...(uData.satisfacaoHistorico || [])].reverse();
            const hA = [...(uData.autoAvaliacaoHistorico || [])].reverse();
            const hPIA = [...(uData.piaHistorico || [])].reverse();
            if (hP.length === 0 && hS.length === 0 && hA.length === 0 && hPIA.length === 0) return null;
            return (
              <div style={CARD}>
                <div style={SL}>🗄️ Arquivo de Respostas Anteriores</div>

                {hP.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize:10, fontWeight:900, color:"#5a7a9a", letterSpacing:1.5, textTransform:"uppercase", marginBottom:8 }}>💬 Perguntas Semanais</div>
                    {hP.map((e, i) => (
                      <div key={i} style={{ padding:"10px 12px", borderRadius:10, background:"rgba(0,0,0,0.2)", marginBottom:6 }}>
                        <div style={{ fontSize:10, color:"#475569", marginBottom:3 }}>{e.week} · {e.type || "texto"} · {formatarDataHora(e.ts, "")}</div>
                        <div style={{ fontSize:13, color:"#e2e8f0", lineHeight:1.5 }}>{e.answer || "—"}</div>
                      </div>
                    ))}
                  </div>
                )}

                {hS.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize:10, fontWeight:900, color:"#5a7a9a", letterSpacing:1.5, textTransform:"uppercase", marginBottom:8 }}>😊 Satisfação</div>
                    {hS.map((e, i) => (
                      <div key={i} style={{ padding:"10px 12px", borderRadius:10, background:"rgba(0,0,0,0.2)", marginBottom:6 }}>
                        <div style={{ fontSize:10, color:"#475569", marginBottom:4 }}>{e.week} · {formatarDataHora(e.ts, "")}</div>
                        {Object.keys(e.ratings || {}).length > 0 && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:4 }}>
                            {Object.entries(e.ratings).map(([k, v]) => (
                              <span key={k} style={{ fontSize:11, background:"rgba(50,199,255,0.1)", border:"1px solid rgba(50,199,255,0.2)", borderRadius:6, padding:"2px 8px", color:CYN }}>
                                {k}: <strong>{v}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                        {e.chips?.length > 0 && <div style={{ fontSize:11, color:"#94a3b8", marginBottom:2 }}>Pontos: {e.chips.join(", ")}</div>}
                        {e.mudaria && <div style={{ fontSize:12, color:"#e2e8f0", fontStyle:"italic" }}>"{e.mudaria}"</div>}
                      </div>
                    ))}
                  </div>
                )}

                {hA.length > 0 && (
                  <div style={{ marginBottom: hPIA.length > 0 ? 14 : 0 }}>
                    <div style={{ fontSize:10, fontWeight:900, color:"#5a7a9a", letterSpacing:1.5, textTransform:"uppercase", marginBottom:8 }}>📊 Auto-Avaliações</div>
                    {hA.map((e, i) => (
                      <div key={i} style={{ padding:"10px 12px", borderRadius:10, background:"rgba(0,0,0,0.2)", marginBottom:6 }}>
                        <div style={{ fontSize:10, color:"#475569", marginBottom:4 }}>
                          {e.week}{e.date ? ` · Entregue ${e.date}` : ""} · {formatarDataHora(e.ts, "")}
                        </div>
                        {Object.keys(e.scores || {}).length > 0 && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                            {Object.entries(e.scores).map(([k, v]) => (
                              <span key={k} style={{ fontSize:11, background:"rgba(167,139,250,0.1)", border:"1px solid rgba(167,139,250,0.2)", borderRadius:6, padding:"2px 8px", color:"#a78bfa" }}>
                                {k}: <strong>{v}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                        {Object.keys(e.notas || {}).length > 0 && (
                          <div style={{ marginTop:6, display:"flex", flexDirection:"column", gap:3 }}>
                            {Object.entries(e.notas).filter(([,v]) => v).map(([k, v]) => (
                              <div key={k} style={{ fontSize:11, color:"#94a3b8", fontStyle:"italic" }}>
                                <span style={{ color:"#a78bfa", fontStyle:"normal", fontWeight:800 }}>{k}:</span> "{v}"
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {hPIA.length > 0 && (
                  <div>
                    <div style={{ fontSize:10, fontWeight:900, color:"#5a7a9a", letterSpacing:1.5, textTransform:"uppercase", marginBottom:8 }}>🚀 Versões do PIA</div>
                    {hPIA.map((e, i) => (
                      <div key={i} style={{ padding:"10px 12px", borderRadius:10, background:"rgba(0,0,0,0.2)", marginBottom:6 }}>
                        <div style={{ fontSize:10, color:"#475569", marginBottom:6 }}>
                          Versão {hPIA.length - i} · {e.week} · {formatarDataHora(e.ts, e.sentAt || "")}
                        </div>
                        {PIA_SECTIONS.map(sec => {
                          const sd = (e.piaData || {})[sec.id] || {};
                          const hasAny = sec.id === "s3b"
                            ? ["swotF","swotFraq","swotOp","swotR"].some(k => sd[k]?.trim())
                            : sec.fields.some(f => sd[f.key]?.trim?.() || (Array.isArray(sd[f.key]) && sd[f.key].length));
                          if (!hasAny) return null;
                          return (
                            <div key={sec.id} style={{ marginBottom:4 }}>
                              <span style={{ fontSize:10, fontWeight:800, color:CYN }}>{sec.icon} {sec.title}</span>
                              {sec.id === "s3b" ? (
                                <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:3 }}>
                                  {[["swotF","Forças"],["swotFraq","Fraquezas"],["swotOp","Oportunidades"],["swotR","Riscos"]].map(([k,l]) => sd[k] && (
                                    <span key={k} style={{ fontSize:10, color:"#94a3b8" }}><strong style={{ color:"#e2e8f0" }}>{l}:</strong> {sd[k].substring(0,60)}{sd[k].length > 60 ? "…" : ""}</span>
                                  ))}
                                </div>
                              ) : sec.fields.map(f => {
                                const v = sd[f.key];
                                if (!v || (Array.isArray(v) && !v.length)) return null;
                                const preview = Array.isArray(v) ? `${v.length} entrada(s)` : String(v).substring(0,80) + (String(v).length > 80 ? "…" : "");
                                return <div key={f.key} style={{ fontSize:10, color:"#94a3b8", marginTop:2 }}><strong style={{ color:"#e2e8f0" }}>{f.label}:</strong> {preview}</div>;
                              })}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* REPOSIÇÕES DE EMERGÊNCIA */}
          <div style={{ ...CARD, border:"1.5px dashed rgba(244,63,94,0.25)", background:"rgba(244,63,94,0.04)" }}>
            <div style={{ fontSize:10, fontWeight:900, color:"#f43f5e", letterSpacing:1.5, textTransform:"uppercase", marginBottom:14 }}>
              🔧 Reposições de Emergência
            </div>
            {/* RESET TOTAL */}
            <button onClick={() => resetTotal(username)} style={{
              width:"100%", marginBottom:14, padding:"13px",
              background:"rgba(244,63,94,0.15)", border:"2px solid rgba(244,63,94,0.5)",
              color:"#f43f5e", borderRadius:12, fontWeight:900, fontSize:13, cursor:"pointer",
              letterSpacing:0.5,
            }}>
              🗑 RESET TOTAL — apagar tudo deste jovem
            </button>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {/* XP DIRETO */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"rgba(0,0,0,0.2)", borderRadius:12 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:800 }}>XP desta semana</div>
                  <div style={{ fontSize:10, color:"#64748b" }}>valor atual: {uData.weekXp || 0} XP</div>
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <input
                    type="number" min="0" value={xpEdit}
                    onChange={e => setXpEdit(e.target.value)}
                    style={{ width:64, background:"rgba(0,0,0,0.4)", border:"1px solid rgba(50,199,255,0.3)",
                      color:"#fff", borderRadius:8, padding:"6px 8px", fontSize:13, fontWeight:900, textAlign:"center" }}
                  />
                  <button onClick={async () => {
                    const v = Math.max(0, parseInt(xpEdit) || 0);
                    await setDoc(doc(db, "userData", username), { weekXp: v }, { merge: true });
                  }} style={{ ...BTN_RESET, padding:"6px 12px" }}>Guardar</button>
                  <button onClick={async () => {
                    const snap2 = await getDoc(doc(db, "userData", username));
                    const ud2 = snap2.exists() ? snap2.data() : {};
                    await setDoc(doc(db, "userData", username), {
                      weekXp: (ud2.weekXp || 0) + 5,
                      history: [...(ud2.history || []), { date: nowLabel(), action: "Votou numa votação", ts: Date.now(), xp: 5 }],
                    }, { merge: true });
                    setXpEdit(String((ud2.weekXp || 0) + 5));
                  }} style={{ ...BTN_RESET, padding:"6px 10px", fontSize:10 }}>+5 XP 🗳️</button>
                </div>
              </div>
              <div style={{ padding:"10px 12px", background:"rgba(0,0,0,0.2)", borderRadius:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:(uData.completedMissions||[]).length ? 8 : 0 }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:800 }}>Missões Concluídas</div>
                    <div style={{ fontSize:10, color:"#64748b" }}>{(uData.completedMissions||[]).length} missão(ões) concluída(s)</div>
                  </div>
                  <button onClick={() => resetMissoes(username)} style={BTN_RESET}>Limpar</button>
                </div>
                {(uData.completedMissions || []).map(mid => {
                  const m = missoesPorId[mid];
                  const nota = (uData.missionNotes || {})[mid];
                  return (
                    <div key={mid} style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:7, marginTop:7 }}>
                      <div style={{ fontSize:12, color:"#e2e8f0", fontWeight:700 }}>
                        ✅ {m ? m.text : "Missão (removida)"}
                        {m && <span style={{ color:GRN, fontWeight:800 }}> · +{m.xp} XP</span>}
                      </div>
                      {m?.prazo && <div style={{ fontSize:10, color:"#fbbf24", fontWeight:700, marginTop:1 }}>⏰ Prazo era {fmtDate(m.prazo)}</div>}
                      {nota && <div style={{ fontSize:11, color:"#94a3b8", fontStyle:"italic", marginTop:2 }}>"{nota}"</div>}
                    </div>
                  );
                })}
              </div>
              <div style={{ padding:"10px 12px", background:"rgba(0,0,0,0.2)", borderRadius:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: uData.autoSaved ? 10 : 0 }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:800 }}>Autoavaliação</div>
                    <div style={{ fontSize:10, color:"#64748b" }}>{uData.autoSaved ? `Entregue em ${uData.autoDate||"?"}` : Object.keys(uData.dScores||{}).length > 0 ? "Iniciada (não submetida)" : "Ainda não submetida"}</div>
                  </div>
                  {(uData.autoSaved || Object.keys(uData.dScores||{}).length > 0) && <button onClick={() => resetAutoavaliacao(username)} style={BTN_RESET}>Repor</button>}
                </div>
                {uData.autoSaved && (
                  <div>
                    <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                      <input value={feedbackAuto} onChange={e => setFeedbackAuto(e.target.value)}
                        placeholder="Dar feedback à autoavaliação…"
                        style={{ ...INP, flex:1, marginBottom:0, fontSize:12, padding:"8px 12px" }} />
                      <button onClick={() => enviarFeedback("auto", feedbackAuto, setFeedbackAuto)}
                        style={{ background:`${CYN}20`, border:`1px solid ${CYN}40`, color:CYN, borderRadius:10, padding:"0 14px", fontWeight:900, fontSize:12, cursor:"pointer" }}>
                        Enviar
                      </button>
                    </div>
                    <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:11, color:"#94a3b8", cursor:"pointer" }}>
                      <input type="checkbox" checked={feedbackPush} onChange={() => setFeedbackPush(v => !v)}
                        style={{ accentColor:CYN, width:13, height:13 }} />
                      🔔 Enviar também como notificação push
                    </label>
                  </div>
                )}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"rgba(0,0,0,0.2)", borderRadius:12 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:800 }}>Pergunta Semanal</div>
                  <div style={{ fontSize:10, color:"#64748b" }}>{uData.answered ? "Respondida" : "Ainda não respondida"}</div>
                </div>
                {uData.answered && <button onClick={() => resetPergunta(username)} style={BTN_RESET}>Repor</button>}
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", background:"rgba(0,0,0,0.2)", borderRadius:12 }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:800 }}>Satisfação</div>
                  <div style={{ fontSize:10, color:"#64748b" }}>{uData.sSaved ? "Submetida" : "Ainda não submetida"}</div>
                </div>
                {uData.sSaved && <button onClick={() => resetSatisfacao(username)} style={BTN_RESET}>Repor</button>}
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:15 }}>
      {JEEP_LIST.map(j => {
        const medalDoc    = amMedals[j.username] || {};
        const weekKey     = getWeekKey();
        const wMedals     = (medalDoc.weekKey === weekKey ? medalDoc.week : []) || [];
        const atMedals    = medalDoc.allTime || [];
        const uData       = allShared[j.username] || {};
        const pubHistory   = (uData.history || []).filter(h => !h.private);
        const totalXpCard  = pubHistory.reduce((s, h) => s + (h.xp || 0), 0);
        const semanaXpCard = weekStartTs > 0
          ? pubHistory.filter(h => (h.ts || 0) >= weekStartTs && (h.xp || 0) > 0).reduce((s, h) => s + (h.xp || 0), 0)
          : (uData.weekXp || 0);

        return (
          <div key={j.username} style={{ ...CARD, textAlign:"center", padding:"20px 15px" }}>
            <div style={{ width:12, height:12, borderRadius:"50%", background:j.color, margin:"0 auto 8px" }} />
            <div style={{ fontWeight:800, fontSize:15, marginBottom:2 }}>{j.name}</div>
            <div style={{ fontSize:10, color:CYN, fontWeight:900 }}>{semanaXpCard} XP semana</div>
            <div style={{ fontSize:9, color:"#5a7a9a", fontWeight:700, marginBottom:10 }}>{totalXpCard} XP total</div>
            {wMedals.length > 0 && (
              <div style={{ display:"flex", gap:3, justifyContent:"center", marginBottom:6, flexWrap:"wrap" }}>
                {wMedals.map(mid => { const m = ALL_MEDALS.find(x=>x.id===mid); return m ? <span key={mid} style={{fontSize:16}}>{m.icon}</span> : null; })}
              </div>
            )}
            {atMedals.length > 0 && (
              <div style={{ fontSize:9, color:"#5a7a9a", marginBottom:12 }}>🏅 {atMedals.length} medalha{atMedals.length!==1?"s":""} no histórico</div>
            )}
            <button onClick={() => { setUserSelecionado(j.username); setPiaPrazoExt((allShared[j.username]||{}).piaSavedPrazo || ""); }} style={{
              width:"100%", background:"rgba(255,255,255,0.05)", border:`1px solid ${CYN}40`,
              color:CYN, borderRadius:12, padding:10, fontSize:11, fontWeight:900, cursor:"pointer",
            }}>VER DOSSIER</button>
          </div>
        );
      })}

      {userSelecionado && (
        <DossierModal username={userSelecionado} onClose={() => setUserSelecionado(null)} />
      )}

      {/* MODAL DE ATRIBUIÇÃO DE MEDALHA */}
      {medalModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:1100,
          display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ ...CARD, maxWidth:360, width:"100%", padding:28 }}>
            <div style={{ fontSize:48, textAlign:"center", marginBottom:8 }}>{medalModal.medal.icon}</div>
            <div style={{ fontWeight:900, fontSize:17, textAlign:"center", color:CYN, marginBottom:4 }}>{medalModal.medal.label}</div>
            <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.65, marginBottom:18, textAlign:"center" }}>{medalModal.medal.desc}</div>
            <div style={{ fontSize:10, color:"#5a7a9a", fontWeight:800, marginBottom:6, textTransform:"uppercase", letterSpacing:0.8 }}>Mensagem opcional para o jovem</div>
            <textarea value={medalMsg} onChange={e => setMedalMsg(e.target.value)}
              style={{ ...INP, resize:"none", marginBottom:12, fontSize:13 }} rows={3}
              placeholder="Ex: Foste incrível hoje na sessão! 🌟" />
            <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#94a3b8", cursor:"pointer", marginBottom:18 }}>
              <input type="checkbox" checked={medalPush} onChange={() => setMedalPush(v => !v)}
                style={{ accentColor:CYN, width:14, height:14 }} />
              🔔 Enviar também como notificação push
            </label>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setMedalModal(null)} style={{
                flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
                color:"#94a3b8", borderRadius:12, padding:12, fontWeight:900, fontSize:13, cursor:"pointer",
              }}>Cancelar</button>
              <button onClick={async () => {
                await assignMedal(medalModal.username, medalModal.medal.id, medalMsg, medalPush);
                setMedalModal(null); setMedalMsg(""); setMedalPush(true);
              }} style={{
                flex:2, background:CYN, border:"none", color:"#071529",
                borderRadius:12, padding:12, fontWeight:900, fontSize:13, cursor:"pointer",
              }}>✓ Atribuir Medalha</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
