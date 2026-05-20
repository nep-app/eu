import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../firebase.js";
import { CARD, SL, INP, CYN, GRN, TXT_MUT, PNK } from "../theme.jsx";
import { PIA_SECTIONS, nowFull, nowLabel } from "../data.js";

const SUB_TABS = [
  { id:"diag",  label:"🔍 Diagnóstico" },
  { id:"atrib", label:"⭐ Atributos & Raio-X" },
  { id:"proj",  label:"🚀 Projeto" },
  { id:"mon",   label:"📈 Monitorização" },
];

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
  const totalFields  = PIA_SECTIONS.reduce((s, sec) => piaUnlocked[sec.id] ? s + sec.fields.length : s, 0);
  const filledFields = PIA_SECTIONS.reduce((s, sec) => {
    if (!piaUnlocked[sec.id]) return s;
    const sd = piaData[sec.id] || {};
    return s + sec.fields.filter(f => sd[f.key]?.trim()).length;
  }, 0);
  const progress = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  const sectionsForTab = PIA_SECTIONS.filter(s => s.sub === subTab);

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
              const secs = PIA_SECTIONS.filter(s => s.sub === t.id);
              const hasUnlocked = secs.some(s => piaUnlocked[s.id]);
              const allFilled = secs.every(s => {
                if (!piaUnlocked[s.id]) return true;
                const sd = piaData[s.id] || {};
                return s.fields.every(f => sd[f.key]?.trim());
              });
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
          {sectionsForTab.map((sec, idx) => {
            const unlocked = piaUnlocked[sec.id];
            const secData  = piaData[sec.id] || {};
            const filled   = sec.fields.filter(f => secData[f.key]?.trim()).length;

            if (!unlocked) {
              return (
                <div key={sec.id} style={{ ...CARD, opacity:0.5, marginBottom:12 }}>
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
              <div key={sec.id} style={{ ...CARD, marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:22 }}>{sec.icon}</span>
                    <div style={{ fontSize:13, fontWeight:900, color:"#f1f5f9" }}>{sec.title}</div>
                  </div>
                  <div style={{ fontSize:10, fontWeight:900, color: filled === sec.fields.length ? GRN : CYN }}>
                    {filled}/{sec.fields.length}
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  {sec.fields.map(f => (
                    <div key={f.key}>
                      <div style={{ fontSize:11, fontWeight:800, color:"#94a3b8", marginBottom:6, textTransform:"uppercase", letterSpacing:0.6 }}>
                        {f.label}
                      </div>
                      {f.rows === 1 ? (
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

          {/* ENVIAR / ATUALIZAR */}
          <button onClick={enviarTeresa} disabled={sending} style={{
            width:"100%", padding:"14px", borderRadius:14, marginTop:8,
            background: uData.piaSaved ? `${GRN}18` : GRN,
            border: uData.piaSaved ? `1.5px solid ${GRN}50` : "none",
            color: uData.piaSaved ? GRN : "#071529",
            fontWeight:900, fontSize:14, cursor:sending ? "default" : "pointer", letterSpacing:0.5,
          }}>
            {sending ? "A enviar..." : uData.piaSaved ? "🔄 Atualizar PIA" : "🚀 Enviar PIA à Teresa"}
          </button>
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
