import React, { useState, useEffect, useContext } from 'react';
import { doc, setDoc, updateDoc, addDoc, collection, arrayUnion } from "firebase/firestore";
import { db } from "../firebase.js";
import { CARD, SL, INP, CYN, GRN, TXT_MUT, PNK } from "../theme.jsx";
import { PIA_SECTIONS, nowFull, nowLabel, getWeekKey } from "../data.js";
import { ThemeCtx } from "../JovensApp.jsx";
import { openPiaPrint } from "../piaPrint.js";

const SUB_TABS = [
  { id:"diag",  label:"🔍 Diagnóstico" },
  { id:"atrib", label:"⭐ Atributos" },
  { id:"raiox", label:"📊 Raio-X" },
  { id:"proj",  label:"🚀 Projeto" },
  { id:"mon",   label:"📈 Monitorização" },
];

const WIZARD_QUESTIONS = {
  s3b: [
    { key:"swotF",    emoji:"💪", q:"O que faço bem e quais os pontos fortes do projeto?", ph:"Criatividade, boa comunicação, apoio da equipa...", rows:4, chips:["Criatividade","Comunicação","Empatia","Conhecimento local","Boa equipa","Motivação"] },
    { key:"swotFraq", emoji:"⚠️", q:"Onde posso melhorar? Quais os pontos fracos?",        ph:"Falta de experiência, recursos limitados, tempo escasso...", rows:4, chips:["Pouca experiência","Recursos limitados","Tempo curto","Equipa pequena","Pouca visibilidade"] },
    { key:"swotOp",   emoji:"🌟", q:"Que oportunidades externas posso aproveitar?",         ph:"Apoios da câmara, interesse da comunidade, parcerias...", rows:4, chips:["Apoio da câmara","Parceiros locais","Interesse dos jovens","Espaços disponíveis","Financiamento"] },
    { key:"swotR",    emoji:"🚨", q:"Que riscos ou obstáculos posso encontrar?",            ph:"Falta de participação, orçamento incerto, conflitos de agenda...", rows:4, chips:["Falta de participação","Orçamento incerto","Conflitos de agenda","Resistência inicial","Falta de espaço"] },
  ],
  s4: [
    { key:"oQue",          emoji:"🎯", q:"O meu projeto é...",               ph:'"Organizar sessões de cinema seguidas de debates."', rows:3, chips:["Sessões de cinema + debate","Ateliers criativos","Workshops de competências","Atividades desportivas","Espaço de conversa aberto"] },
    { key:"fundamento",    emoji:"💡", q:"Faço isto porque...",               ph:'"Muitos jovens não têm espaço para falar e refletir juntos."', rows:3, chips:[] },
    { key:"objetivos",     emoji:"🏁", q:"O objetivo é...",                   ph:'"Promover reflexão crítica, diálogo e consciência social."', rows:3, chips:[] },
    { key:"metas",         emoji:"📊", q:"A minha meta concreta é...",        ph:'"Realizar 6 sessões durante o ano com 8+ participantes cada."', rows:3, chips:[] },
    { key:"onde",          emoji:"📍", q:"Vai acontecer em...",               ph:"Sala polivalente da ludoteca", rows:1, chips:[] },
    { key:"atividadesList", emoji:"📅", q:"As atividades planeadas:",         type:"activities" },
    { key:"recursos",      emoji:"🧰", q:"Vou precisar de...",                ph:'"Projetor, computador, filmes, cadeiras."', rows:3, chips:["Projetor","Computador","Material impresso","Sala","Microfone","Câmara fotográfica"] },
    { key:"avaliacao",     emoji:"📏", q:"Sei que correu bem quando...",      ph:'"Os participantes ficam satisfeitos e continuam a vir."', rows:3, chips:[] },
  ],
  s5: [
    { key:"periodicidade", emoji:"🔄", q:"Vou fazer revisões...", ph:'"Todos os meses vou verificar se as sessões estão a acontecer."', rows:2, chips:["Semanalmente","De 2 em 2 semanas","Mensalmente","Bimensalmente","Depois de cada sessão"] },
    { key:"revisoesList",  emoji:"📝", q:"Registo de revisões:",  type:"revisoes" },
  ],
};

const WIZARD_SIDS = { raiox:["s3b"], proj:["s4"], mon:["s5"] };

function VoiceButton({ onResult }) {
  const [listening, setListening] = useState(false);
  function start() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("O teu browser não suporta reconhecimento de voz. Tenta no Chrome."); return; }
    if (listening) return;
    setListening(true);
    const rec = new SR();
    rec.lang = "pt-PT";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = e => { onResult(e.results[0][0].transcript); setListening(false); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    try { rec.start(); } catch { setListening(false); }
  }
  return (
    <button onClick={start} style={{
      flexShrink:0, background: listening ? "rgba(239,68,68,0.15)" : "rgba(139,92,246,0.12)",
      border: listening ? "1.5px solid rgba(239,68,68,0.5)" : "1.5px solid rgba(139,92,246,0.35)",
      borderRadius:10, padding:"10px 12px", cursor:"pointer",
      color: listening ? "#ef4444" : "#a78bfa", fontWeight:800, fontSize:14,
      display:"flex", alignItems:"center", gap:4,
    }}>
      {listening ? "⏹" : "🎙"}
    </button>
  );
}

function SwotGrid({ secData, onSave }) {
  const quadrants = [
    { key:"swotF",    label:"💪 Pontos Fortes",  color:"#22c55e", bg:"rgba(34,197,94,0.08)",  border:"rgba(34,197,94,0.25)",  ph:"O que fazes bem? Quais os teus pontos fortes pessoais e do projeto?" },
    { key:"swotFraq", label:"⚠️ Pontos Fracos",  color:"#f97316", bg:"rgba(249,115,22,0.08)", border:"rgba(249,115,22,0.25)", ph:"Onde podes melhorar? Que limitações tens de ter em conta?" },
    { key:"swotOp",   label:"🌟 Oportunidades",  color:CYN,       bg:`${CYN}08`,              border:`${CYN}25`,              ph:"Que oportunidades externas podes aproveitar?" },
    { key:"swotR",    label:"🚨 Ameaças",         color:"#f43f5e", bg:"rgba(244,63,94,0.08)",  border:"rgba(244,63,94,0.25)",  ph:"Que riscos ou obstáculos externos podes enfrentar?" },
  ];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
      {quadrants.map(q => (
        <div key={q.key} style={{ background:q.bg, border:`1.5px solid ${q.border}`, borderRadius:14, padding:12 }}>
          <div style={{ fontSize:11, fontWeight:900, color:q.color, marginBottom:8, letterSpacing:0.3 }}>{q.label}</div>
          <textarea
            value={secData[q.key] || ""}
            onChange={e => onSave(q.key, e.target.value)}
            placeholder={q.ph}
            rows={4}
            style={{ ...INP, resize:"vertical", marginBottom:0, fontSize:12, background:"rgba(0,0,0,0.2)", borderColor:"rgba(255,255,255,0.06)" }}
          />
        </div>
      ))}
    </div>
  );
}

function AtividadesEditor({ list = [], onChange }) {
  function add() {
    onChange([...list, { id: Date.now(), titulo:"", data:"", hora:"", local:"", descricao:"", recursos:"" }]);
  }
  function upd(idx, key, val) {
    onChange(list.map((a, i) => i === idx ? { ...a, [key]: val } : a));
  }
  function remove(idx) {
    onChange(list.filter((_, i) => i !== idx));
  }
  return (
    <div>
      {list.map((atv, idx) => (
        <div key={atv.id || idx} style={{ background:"rgba(0,0,0,0.25)", borderRadius:14, padding:14, marginBottom:10, border:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ fontSize:11, fontWeight:900, color:CYN, letterSpacing:1 }}>ATIVIDADE {idx+1}</span>
            <button onClick={() => remove(idx)} style={{ background:"rgba(244,63,94,0.12)", border:"none", color:"#f43f5e", borderRadius:8, padding:"3px 10px", cursor:"pointer", fontSize:11, fontWeight:900 }}>✕</button>
          </div>
          <input value={atv.titulo} onChange={e => upd(idx,"titulo",e.target.value)} placeholder="Nome da atividade *" style={{ ...INP, marginBottom:8, fontWeight:700 }} />
          <div style={{ display:"flex", gap:8, marginBottom:8 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:"#64748b", fontWeight:800, marginBottom:4 }}>DATA</div>
              <input type="date" value={atv.data} onChange={e => upd(idx,"data",e.target.value)} style={{ ...INP, marginBottom:0 }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:"#64748b", fontWeight:800, marginBottom:4 }}>HORA</div>
              <input type="time" value={atv.hora} onChange={e => upd(idx,"hora",e.target.value)} style={{ ...INP, marginBottom:0 }} />
            </div>
          </div>
          <input value={atv.local} onChange={e => upd(idx,"local",e.target.value)} placeholder="Local" style={{ ...INP, marginBottom:8 }} />
          <textarea value={atv.descricao} onChange={e => upd(idx,"descricao",e.target.value)} placeholder="Descrição — o que vai acontecer" rows={2} style={{ ...INP, resize:"vertical", marginBottom:8 }} />
          <input value={atv.recursos} onChange={e => upd(idx,"recursos",e.target.value)} placeholder="Recursos necessários" style={{ ...INP, marginBottom:0 }} />
        </div>
      ))}
      <button onClick={add} style={{ width:"100%", padding:"11px", borderRadius:12, background:`${CYN}10`, border:`1.5px dashed ${CYN}35`, color:CYN, fontWeight:900, fontSize:13, cursor:"pointer" }}>
        + Adicionar Atividade
      </button>
    </div>
  );
}

function RevisoesEditor({ list = [], onChange }) {
  function add() {
    onChange([...list, { id: Date.now(), data: new Date().toISOString().split("T")[0], notas:"", ajustes:"" }]);
  }
  function upd(idx, key, val) {
    onChange(list.map((r, i) => i === idx ? { ...r, [key]: val } : r));
  }
  function remove(idx) {
    if (window.confirm("Apagar esta revisão?")) onChange(list.filter((_, i) => i !== idx));
  }
  return (
    <div>
      {list.map((rev, idx) => (
        <div key={rev.id || idx} style={{ background:"rgba(0,0,0,0.25)", borderRadius:14, padding:14, marginBottom:10, border:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <span style={{ fontSize:11, fontWeight:900, color:"#a78bfa", letterSpacing:1 }}>REVISÃO {idx+1}</span>
            <button onClick={() => remove(idx)} style={{ background:"rgba(244,63,94,0.12)", border:"none", color:"#f43f5e", borderRadius:8, padding:"3px 10px", cursor:"pointer", fontSize:11, fontWeight:900 }}>✕</button>
          </div>
          <div style={{ marginBottom:8 }}>
            <div style={{ fontSize:10, color:"#64748b", fontWeight:800, marginBottom:4 }}>DATA DA REVISÃO</div>
            <input type="date" value={rev.data} onChange={e => upd(idx,"data",e.target.value)} style={{ ...INP, marginBottom:0 }} />
          </div>
          <textarea value={rev.notas} onChange={e => upd(idx,"notas",e.target.value)} placeholder="O que aconteceu? Como está a correr?" rows={3} style={{ ...INP, resize:"vertical", marginBottom:8 }} />
          <textarea value={rev.ajustes} onChange={e => upd(idx,"ajustes",e.target.value)} placeholder="Ajustes ao plano — o que vou mudar?" rows={2} style={{ ...INP, resize:"vertical", marginBottom:0 }} />
        </div>
      ))}
      <button onClick={add} style={{ width:"100%", padding:"11px", borderRadius:12, background:"rgba(167,139,250,0.1)", border:"1.5px dashed rgba(167,139,250,0.35)", color:"#a78bfa", fontWeight:900, fontSize:13, cursor:"pointer" }}>
        + Adicionar Revisão
      </button>
    </div>
  );
}

function fieldFilled(f, secData) {
  if (f.type === "activities" || f.type === "revisoes") return (secData[f.key] || []).length > 0;
  if (f.type === "swot") return ["swotF","swotFraq","swotOp","swotR"].some(k => secData[k]?.trim());
  return !!secData[f.key]?.trim();
}

export default function PiaTab({ user, data }) {
  const light = useContext(ThemeCtx);
  const isTeresa = user?.username === "teresa";
  const uData       = data.userData || {};
  const piaUnlocked = uData.piaUnlocked || {};
  const piaData     = uData.piaData     || {};
  const [subTab, setSubTab] = useState("diag");
  const [sending, setSending] = useState(false);
  const [wizStep, setWizStep] = useState(0);

  useEffect(() => { setWizStep(0); }, [subTab]);

  function saveField(sectionId, key, val) {
    const newSectionData = { ...(piaData[sectionId] || {}), [key]: val };
    setDoc(doc(db, "userData", user.username), { piaData: { ...piaData, [sectionId]: newSectionData } }, { merge: true });
  }

  async function enviarTeresa() {
    const jaEnviou = uData.piaSaved;
    if (!window.confirm(jaEnviou ? "Atualizar o PIA enviado à Teresa?" : "Enviar o PIA à Teresa?")) return;
    setSending(true);
    const ts = nowFull();
    const submittedSections = uData.piaSubmittedSections || [];
    const novasSeccoes = PIA_SECTIONS.filter(sec =>
      piaUnlocked[sec.id] &&
      !submittedSections.includes(sec.id) &&
      sec.fields.some(f => fieldFilled(f, piaData[sec.id] || {}))
    );
    const xpGanho = novasSeccoes.length * 30;
    const todasSeccoes = [...submittedSections, ...novasSeccoes.map(s => s.id)];
    const newHistory = xpGanho > 0
      ? [...(data.history || []), { date: ts, action: jaEnviou ? "Atualizou o PIA 🔄" : "Enviou o Plano Individual de Ação (PIA) à Teresa 🚀", ts: Date.now(), xp: xpGanho }]
      : (data.history || []);
    await setDoc(doc(db, "userData", user.username), {
      piaSaved: true, piaSavedAt: ts,
      piaSentFilled: filledFields,
      piaSentTotal: totalFields,
      piaSubmittedSections: todasSeccoes,
      history: newHistory,
      weekXp: (uData.weekXp || 0) + xpGanho,
    }, { merge: true });
    await updateDoc(doc(db, "userData", user.username), {
      piaHistorico: arrayUnion({
        week: getWeekKey(), sentAt: ts,
        piaData: piaData, ts: Date.now()
      })
    });
    const seccoesNomes = novasSeccoes.map(s => s.title).join(", ") || PIA_SECTIONS.filter(s => piaUnlocked[s.id]).map(s => s.title).join(", ");
    await addDoc(collection(db, "adminNotificacoes"), {
      tipo: "PIA", jovem: user.username, ts: Date.now(), lida: false,
      atualizado: jaEnviou, texto: seccoesNomes
    });
    setSending(false);
    alert(jaEnviou ? "PIA atualizado! 🔄" : "PIA enviado à Teresa! 🚀");
  }

  const unlockedCount = PIA_SECTIONS.filter(s => piaUnlocked[s.id]).length;

  const totalFields = PIA_SECTIONS.reduce((s, sec) => piaUnlocked[sec.id] ? s + sec.fields.length : s, 0);
  const filledFields = PIA_SECTIONS.reduce((s, sec) => {
    if (!piaUnlocked[sec.id]) return s;
    const sd = piaData[sec.id] || {};
    return s + sec.fields.filter(f => fieldFilled(f, sd)).length;
  }, 0);
  const sentFilled = uData.piaSentFilled || 0;
  const sentTotal  = uData.piaSentTotal  || totalFields || 1;
  const progress   = uData.piaSaved ? Math.round((sentFilled / sentTotal) * 100) : 0;

  const sectionsForTab = PIA_SECTIONS.filter(s => s.sub === subTab);

  function tabHasUnlocked(tabId) {
    return PIA_SECTIONS.filter(s => s.sub === tabId).some(s => piaUnlocked[s.id]);
  }

  function tabAllFilled(tabId) {
    return PIA_SECTIONS.filter(s => s.sub === tabId).every(sec => {
      if (!piaUnlocked[sec.id]) return true;
      const sd = piaData[sec.id] || {};
      return sec.fields.every(f => fieldFilled(f, sd));
    });
  }

  // Wizard mode: Teresa user on raiox/proj/mon
  const isWizardTab = isTeresa && ["raiox","proj","mon"].includes(subTab);
  const wizardSids = WIZARD_SIDS[subTab] || [];
  const wizardQuestions = wizardSids.flatMap(sid =>
    piaUnlocked[sid]
      ? (WIZARD_QUESTIONS[sid] || []).map(q => ({ ...q, sectionId:sid }))
      : [{ type:"locked", sectionId:sid }]
  );
  const totalSteps = wizardQuestions.length;
  const safeStep = Math.min(wizStep, Math.max(0, totalSteps - 1));
  const currentQ = wizardQuestions[safeStep];

  function appendChip(q, chip) {
    const cur = piaData[q.sectionId]?.[q.key] || "";
    const newVal = cur ? cur + ", " + chip : chip;
    saveField(q.sectionId, q.key, newVal);
  }

  return (
    <div style={{ padding:"18px 16px", paddingBottom:100 }}>

      {/* HEADER */}
      <div style={{ ...CARD, background:"rgba(14,36,68,0.9)", marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ fontSize:13, fontWeight:900, color:CYN, marginBottom:4 }}>📋 Plano Individual de Ação</div>
          {unlockedCount > 0 && (
            <button onClick={() => openPiaPrint(piaData, piaUnlocked, user.name || user.username)} style={{
              flexShrink:0, background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.14)",
              borderRadius:10, padding:"6px 12px", color:"#94a3b8", fontWeight:800, fontSize:11, cursor:"pointer",
            }}>
              ⬇ PDF
            </button>
          )}
        </div>
        <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.6, marginBottom: unlockedCount > 0 ? 14 : 0 }}>
          A Teresa vai desbloqueando as secções à medida que o programa avança.
        </div>
        {unlockedCount > 0 && (
          <>
            <div style={{ height:4, background:"rgba(255,255,255,0.08)", borderRadius:4, overflow:"hidden", marginBottom:6 }}>
              <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg, ${CYN}, ${GRN})`, borderRadius:4, transition:"width 0.5s" }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, fontWeight:800 }}>
              <span style={{ color: light ? "#475569" : TXT_MUT }}>PROGRESSO GLOBAL</span>
              <span style={{ color:CYN }}>{progress}% ({filledFields}/{totalFields})</span>
            </div>
          </>
        )}
      </div>

      {unlockedCount === 0 ? (
        <div style={{ textAlign:"center", padding:"40px 20px", color:"#475569" }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🔐</div>
          <div style={{ fontSize:14, fontWeight:800 }}>Aguarda a Teresa</div>
          <div style={{ fontSize:12, marginTop:6, lineHeight:1.6 }}>As secções do teu PIA vão sendo desbloqueadas ao longo do programa.</div>
        </div>
      ) : (
        <>
          {/* SUB-TABS */}
          <div style={{ display:"flex", gap:6, marginBottom:16, overflowX:"auto", paddingBottom:2 }}>
            {SUB_TABS.map(t => {
              const hasUnlocked = tabHasUnlocked(t.id);
              const allFilled = hasUnlocked && tabAllFilled(t.id);
              return (
                <button key={t.id} onClick={() => setSubTab(t.id)} style={{
                  flexShrink:0, padding:"8px 14px", borderRadius:20, fontSize:12, fontWeight:800,
                  cursor:"pointer", transition:"all 0.18s",
                  border: subTab === t.id ? `1.5px solid ${CYN}` : isTeresa ? "1.5px solid rgba(100,80,180,0.40)" : "1.5px solid rgba(255,255,255,0.08)",
                  background: subTab === t.id ? `${CYN}18` : isTeresa ? "rgba(18,14,38,0.72)" : "rgba(255,255,255,0.03)",
                  color: subTab === t.id ? CYN : hasUnlocked ? (isTeresa ? "#c4b8f3" : "#94a3b8") : (isTeresa ? "#9880c0" : "#64748b"),
                  position:"relative",
                }}>
                  {t.label}
                  {hasUnlocked && allFilled && <span style={{ marginLeft:4, color:GRN }}>✓</span>}
                  {!hasUnlocked && <span style={{ marginLeft:4, fontSize:10 }}>🔐</span>}
                </button>
              );
            })}
          </div>

          {/* ── WIZARD VIEW (Teresa, raiox / proj / mon) ───────────────── */}
          {isWizardTab ? (
            totalSteps === 0 ? (
              <div style={{ ...CARD, textAlign:"center", padding:"40px 20px" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>🔐</div>
                <div style={{ fontSize:13, fontWeight:800, color:"#64748b" }}>Secção bloqueada</div>
                <div style={{ fontSize:11, color:"#475569", marginTop:4 }}>A Teresa vai desbloquear quando for altura.</div>
              </div>
            ) : (
              <>
                {/* Progress bar */}
                <div style={{ marginBottom:6 }}>
                  <div style={{ height:4, background:"rgba(255,255,255,0.07)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${((safeStep+1)/totalSteps)*100}%`, background:`linear-gradient(90deg,${CYN},${GRN})`, borderRadius:4, transition:"width 0.35s" }} />
                  </div>
                  <div style={{ display:"flex", justifyContent:"flex-end", marginTop:4, fontSize:10, fontWeight:800, color:"#64748b" }}>
                    {safeStep+1} / {totalSteps}
                  </div>
                </div>

                {currentQ?.type === "locked" ? (
                  <div style={{ ...CARD, textAlign:"center", padding:"40px 20px", opacity:0.6 }}>
                    <div style={{ fontSize:40, marginBottom:10 }}>🔐</div>
                    <div style={{ fontSize:13, fontWeight:800, color:"#64748b" }}>Secção bloqueada</div>
                  </div>
                ) : (
                  <div style={{ ...CARD }}>
                    <div style={{ fontSize:28, marginBottom:12 }}>{currentQ.emoji}</div>
                    <div style={{ fontSize:17, fontWeight:800, color: isTeresa ? "#c4b8f3" : "#f1f5f9", marginBottom:18, lineHeight:1.5 }}>
                      {currentQ.q}
                    </div>

                    {currentQ.type === "activities" ? (
                      <AtividadesEditor
                        list={piaData[currentQ.sectionId]?.[currentQ.key] || []}
                        onChange={val => saveField(currentQ.sectionId, currentQ.key, val)}
                      />
                    ) : currentQ.type === "revisoes" ? (
                      <RevisoesEditor
                        list={piaData[currentQ.sectionId]?.[currentQ.key] || []}
                        onChange={val => saveField(currentQ.sectionId, currentQ.key, val)}
                      />
                    ) : (
                      <>
                        {currentQ.chips?.length > 0 && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                            {currentQ.chips.map(chip => (
                              <button key={chip} onClick={() => appendChip(currentQ, chip)} style={{
                                padding:"6px 13px", borderRadius:20, fontSize:11, fontWeight:800, cursor:"pointer",
                                background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(255,255,255,0.10)",
                                color:"#94a3b8", transition:"all 0.15s",
                              }}>
                                {chip}
                              </button>
                            ))}
                          </div>
                        )}
                        <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                          {currentQ.rows === 1 ? (
                            <input
                              value={piaData[currentQ.sectionId]?.[currentQ.key] || ""}
                              onChange={e => saveField(currentQ.sectionId, currentQ.key, e.target.value)}
                              placeholder={currentQ.ph}
                              style={{ ...INP, flex:1, marginBottom:0 }}
                              autoFocus
                            />
                          ) : (
                            <textarea
                              value={piaData[currentQ.sectionId]?.[currentQ.key] || ""}
                              onChange={e => saveField(currentQ.sectionId, currentQ.key, e.target.value)}
                              placeholder={currentQ.ph}
                              rows={currentQ.rows || 3}
                              style={{ ...INP, flex:1, resize:"vertical", marginBottom:0 }}
                              autoFocus
                            />
                          )}
                          <VoiceButton onResult={text => {
                            const cur = piaData[currentQ.sectionId]?.[currentQ.key] || "";
                            saveField(currentQ.sectionId, currentQ.key, cur ? cur + " " + text : text);
                          }} />
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Nav buttons */}
                <div style={{ display:"flex", gap:8, marginTop:12 }}>
                  {safeStep > 0 && (
                    <button onClick={() => setWizStep(s => s - 1)} style={{
                      flex:1, padding:14, borderRadius:14,
                      border: isTeresa ? "1.5px solid rgba(100,80,180,0.35)" : "1.5px solid rgba(255,255,255,0.1)",
                      background: isTeresa ? "rgba(18,14,38,0.72)" : "rgba(255,255,255,0.04)",
                      color: isTeresa ? "#c4b8f3" : "#94a3b8", fontWeight:900, fontSize:13, cursor:"pointer",
                    }}>← Anterior</button>
                  )}
                  {safeStep < totalSteps - 1 ? (
                    <button onClick={() => setWizStep(s => s + 1)} style={{
                      flex:2, padding:14, borderRadius:14,
                      background:`${CYN}18`, border:`1.5px solid ${CYN}50`,
                      color:CYN, fontWeight:900, fontSize:13, cursor:"pointer",
                    }}>Seguinte →</button>
                  ) : (
                    <button onClick={enviarTeresa} disabled={sending} style={{
                      flex:2, padding:14, borderRadius:14, border:"none",
                      background: uData.piaSaved ? `${GRN}18` : GRN,
                      border: uData.piaSaved ? `1.5px solid ${GRN}50` : "none",
                      color: uData.piaSaved ? GRN : "#071529",
                      fontWeight:900, fontSize:13, cursor:sending ? "default" : "pointer",
                    }}>
                      {sending ? "A enviar..." : uData.piaSaved ? "🔄 Atualizar PIA" : "🚀 Enviar à Teresa"}
                    </button>
                  )}
                </div>

                {uData.piaSaved && uData.piaSavedAt && (
                  <div style={{ textAlign:"center", fontSize:10, color:"#475569", marginTop:6 }}>
                    Último envio: {uData.piaSavedAt}
                  </div>
                )}
              </>
            )
          ) : (
            /* ── CLASSIC VIEW (diag / atrib, or non-Teresa on any tab) ─ */
            <>
              {sectionsForTab.map((sec) => {
                const unlocked = piaUnlocked[sec.id];
                const secData  = piaData[sec.id] || {};
                const visibleFields = sec.fields;
                const filled = visibleFields.filter(f => fieldFilled(f, secData)).length;

                if (!unlocked) {
                  return (
                    <div key={sec.id + subTab} style={{ ...CARD, opacity:0.5, marginBottom:12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <span style={{ fontSize:28 }}>🔐</span>
                        <div>
                          <div style={{ fontSize:13, fontWeight:900, color:"#64748b" }}>{sec.title}</div>
                          <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>A Teresa vai desbloquear esta secção quando for altura</div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={sec.id + subTab} style={{ ...CARD, marginBottom:12 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:22 }}>{sec.icon}</span>
                        <div style={{ fontSize:13, fontWeight:900, color:"#f1f5f9" }}>{sec.title}</div>
                      </div>
                      <div style={{ fontSize:10, fontWeight:900, color: filled === visibleFields.length ? GRN : CYN }}>
                        {filled}/{visibleFields.length}
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                      {visibleFields.map(f => (
                        <div key={f.key}>
                          {f.type !== "swot" && (
                            <div style={{ fontSize:11, fontWeight:800, color: light ? "#475569" : "#94a3b8", marginBottom:6, textTransform:"uppercase", letterSpacing:0.6 }}>
                              {f.label}
                            </div>
                          )}
                          {f.type === "swot" ? (
                            <SwotGrid secData={secData} onSave={(key, val) => saveField(sec.id, key, val)} />
                          ) : f.type === "activities" ? (
                            <AtividadesEditor list={secData[f.key] || []} onChange={val => saveField(sec.id, f.key, val)} />
                          ) : f.type === "revisoes" ? (
                            <RevisoesEditor list={secData[f.key] || []} onChange={val => saveField(sec.id, f.key, val)} />
                          ) : f.rows === 1 ? (
                            <input value={secData[f.key] || ""} onChange={e => saveField(sec.id, f.key, e.target.value)}
                              placeholder={f.ph} style={{ ...INP, marginBottom:0 }} />
                          ) : (
                            <textarea value={secData[f.key] || ""} onChange={e => saveField(sec.id, f.key, e.target.value)}
                              placeholder={f.ph} rows={f.rows} style={{ ...INP, resize:"vertical", marginBottom:0 }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* GUARDAR / ENVIAR */}
              <div style={{ display:"flex", gap:8, marginTop:8 }}>
                <button onClick={() => alert("✓ Guardado! As tuas respostas estão a ser guardadas automaticamente.")} style={{
                  flex:1, padding:"14px", borderRadius:14,
                  background: isTeresa ? "rgba(80,40,140,0.14)" : "rgba(255,255,255,0.06)",
                  border: isTeresa ? "1.5px solid rgba(80,40,140,0.35)" : "1.5px solid rgba(255,255,255,0.12)",
                  color: isTeresa ? "#4a3878" : "#94a3b8", fontWeight:900, fontSize:13, cursor:"pointer",
                }}>
                  💾 Guardar Privado
                </button>
                <button onClick={enviarTeresa} disabled={sending} style={{
                  flex:2, padding:"14px", borderRadius:14,
                  background: uData.piaSaved ? `${GRN}18` : GRN,
                  border: uData.piaSaved ? `1.5px solid ${GRN}50` : "none",
                  color: uData.piaSaved ? GRN : "#071529",
                  fontWeight:900, fontSize:13, cursor:sending ? "default" : "pointer",
                }}>
                  {sending ? "A enviar..." : uData.piaSaved ? "🔄 Atualizar PIA" : "🚀 Enviar à Teresa"}
                </button>
              </div>
              {uData.piaSaved && uData.piaSavedAt && (
                <div style={{ textAlign:"center", fontSize:10, color: light ? "#334155" : "#475569", marginTop:6 }}>
                  Último envio: {uData.piaSavedAt}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
