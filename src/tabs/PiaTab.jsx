import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../firebase.js";
import { CARD, SL, INP, CYN, GRN, TXT_MUT, PNK } from "../theme.jsx";
import { PIA_SECTIONS, nowFull, nowLabel } from "../data.js";

const SUB_TABS = [
  { id:"diag",  label:"🔍 Diagnóstico" },
  { id:"atrib", label:"⭐ Atributos" },
  { id:"raiox", label:"📊 Raio-X" },
  { id:"proj",  label:"🚀 Projeto" },
  { id:"mon",   label:"📈 Monitorização" },
];

function getSectionsForTab(subTab) {
  if (subTab === "raiox") {
    return PIA_SECTIONS
      .filter(s => s.sub === "atrib")
      .map(s => ({ ...s, fields: s.fields.filter(f => f.fieldSub === "raiox") }))
      .filter(s => s.fields.length > 0);
  }
  if (subTab === "atrib") {
    return PIA_SECTIONS
      .filter(s => s.sub === "atrib")
      .map(s => ({ ...s, fields: s.fields.filter(f => !f.fieldSub || f.fieldSub === "atrib") }))
      .filter(s => s.fields.length > 0);
  }
  return PIA_SECTIONS.filter(s => s.sub === subTab);
}

function isSwotFilled(secData) {
  return ["swotF","swotFraq","swotOp","swotR"].some(k => secData[k]?.trim());
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
  if (f.type === "swot") return isSwotFilled(secData);
  return !!secData[f.key]?.trim();
}

export default function PiaTab({ user, data }) {
  const uData       = data.userData || {};
  const piaUnlocked = uData.piaUnlocked || {};
  const piaData     = uData.piaData     || {};
  const [subTab, setSubTab] = useState("diag");
  const [sending, setSending] = useState(false);

  function saveField(sectionId, key, val) {
    const newSectionData = { ...(piaData[sectionId] || {}), [key]: val };
    setDoc(doc(db, "userData", user.username), { piaData: { ...piaData, [sectionId]: newSectionData } }, { merge: true });
  }

  async function enviarTeresa() {
    const jaEnviou = uData.piaSaved;
    if (!window.confirm(jaEnviou ? "Atualizar o PIA enviado à Teresa?" : "Enviar o PIA à Teresa?")) return;
    setSending(true);
    const ts = nowFull();
    const newHistory = [...(data.history || []),
      { date: ts, action: jaEnviou ? "Atualizou o PIA 🔄" : "Enviou o Plano Individual de Ação (PIA) à Teresa 🚀", ts: Date.now(), xp: jaEnviou ? 0 : 30 }];
    await setDoc(doc(db, "userData", user.username), {
      piaSaved: true, piaSavedAt: ts,
      history: newHistory,
      weekXp: (uData.weekXp || 0) + (jaEnviou ? 0 : 30),
    }, { merge: true });
    await addDoc(collection(db, "adminNotificacoes"), {
      tipo: "PIA", jovem: user.username, ts: Date.now(), lida: false,
      atualizado: jaEnviou
    });
    setSending(false);
    alert(jaEnviou ? "PIA atualizado! 🔄" : "PIA enviado à Teresa! 🚀");
  }

  const unlockedCount = PIA_SECTIONS.filter(s => piaUnlocked[s.id]).length;

  // For progress: count all unique fields across all sections (deduplicated by sectionId+key)
  const totalFields = PIA_SECTIONS.reduce((s, sec) => piaUnlocked[sec.id] ? s + sec.fields.length : s, 0);
  const filledFields = PIA_SECTIONS.reduce((s, sec) => {
    if (!piaUnlocked[sec.id]) return s;
    const sd = piaData[sec.id] || {};
    return s + sec.fields.filter(f => fieldFilled(f, sd)).length;
  }, 0);
  const progress = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  const sectionsForTab = getSectionsForTab(subTab);

  function tabHasUnlocked(tabId) {
    if (tabId === "raiox") return PIA_SECTIONS.filter(s => s.sub === "atrib").some(s => piaUnlocked[s.id]);
    if (tabId === "atrib") return PIA_SECTIONS.filter(s => s.sub === "atrib").some(s => piaUnlocked[s.id]);
    return PIA_SECTIONS.filter(s => s.sub === tabId).some(s => piaUnlocked[s.id]);
  }

  function tabAllFilled(tabId) {
    const secs = getSectionsForTab(tabId);
    return secs.every(sec => {
      if (!piaUnlocked[sec.id]) return true;
      const sd = piaData[sec.id] || {};
      return sec.fields.every(f => fieldFilled(f, sd));
    });
  }

  return (
    <div style={{ padding:"18px 16px", paddingBottom:100 }}>

      {/* HEADER */}
      <div style={{ ...CARD, background:"rgba(14,36,68,0.9)", marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:900, color:CYN, marginBottom:4 }}>📋 Plano Individual de Ação</div>
        <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.6, marginBottom: unlockedCount > 0 ? 14 : 0 }}>
          A Teresa vai desbloqueando as secções à medida que o programa avança.
        </div>
        {unlockedCount > 0 && (
          <>
            <div style={{ height:4, background:"rgba(255,255,255,0.08)", borderRadius:4, overflow:"hidden", marginBottom:6 }}>
              <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg, ${CYN}, ${GRN})`, borderRadius:4, transition:"width 0.5s" }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, fontWeight:800 }}>
              <span style={{ color:TXT_MUT }}>PROGRESSO GLOBAL</span>
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
                  border: subTab === t.id ? `1.5px solid ${CYN}` : "1.5px solid rgba(255,255,255,0.08)",
                  background: subTab === t.id ? `${CYN}18` : "rgba(255,255,255,0.03)",
                  color: subTab === t.id ? CYN : hasUnlocked ? "#94a3b8" : "#334155",
                  position:"relative",
                }}>
                  {t.label}
                  {hasUnlocked && allFilled && <span style={{ marginLeft:4, color:GRN }}>✓</span>}
                  {!hasUnlocked && <span style={{ marginLeft:4, fontSize:10 }}>🔐</span>}
                </button>
              );
            })}
          </div>

          {/* SECTIONS FOR ACTIVE SUB-TAB */}
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
                        <div style={{ fontSize:11, fontWeight:800, color:"#94a3b8", marginBottom:6, textTransform:"uppercase", letterSpacing:0.6 }}>
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
              background:"rgba(255,255,255,0.06)", border:"1.5px solid rgba(255,255,255,0.12)",
              color:"#94a3b8", fontWeight:900, fontSize:13, cursor:"pointer",
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
            <div style={{ textAlign:"center", fontSize:10, color:"#475569", marginTop:6 }}>
              Último envio: {uData.piaSavedAt}
            </div>
          )}
        </>
      )}
    </div>
  );
}
