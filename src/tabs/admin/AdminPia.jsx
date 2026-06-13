import React, { useState } from 'react';
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, GRN, INP } from "../../theme.jsx";
import { ALLOWED_USERNAMES, JEEP_LIST, PIA_SECTIONS } from "../../data.js";

const JEEP_8 = JEEP_LIST.filter(j => !["teresa","ricardo","demo"].includes(j.username));

const PIA_SECS_META = [
  { id:"s1",  title:"1. Identificação", icon:"👤" },
  { id:"s2",  title:"2. Diagnóstico",   icon:"🔍" },
  { id:"s3",  title:"3. Atributos",     icon:"⭐" },
  { id:"s3b", title:"3b. Raio-X",       icon:"📊" },
  { id:"s4",  title:"4. Projeto",       icon:"🚀" },
  { id:"s5",  title:"5. Monitorização", icon:"📈" },
];

export default function AdminPia({ allShared }) {
  const [prazo, setPrazo] = useState("");
  const [expanded, setExpanded] = useState({});

  return (
    <div>
      {/* Global PIA section unlock */}
      <div style={CARD}>
        <div style={SL}>🚀 Lançar Secções do PIA</div>
        <div style={{ fontSize:11, color:"#475569", marginBottom:12 }}>
          Abre/fecha secções para todos os jovens de uma vez. Para controlo individual usa o Dossier em Jovens.
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14, padding:"10px 14px", background:"rgba(0,0,0,0.2)", borderRadius:12 }}>
          <div style={{ fontSize:11, fontWeight:800, color:"#94a3b8", flexShrink:0 }}>⏰ Data limite (opcional):</div>
          <input type="date" value={prazo} onChange={e => setPrazo(e.target.value)}
            style={{ ...INP, marginBottom:0, flex:1, fontSize:12, padding:"6px 10px" }} />
          {prazo && <button onClick={() => setPrazo("")} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer", fontSize:16 }}>✕</button>}
        </div>
        {PIA_SECS_META.map(sec => (
          <div key={sec.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderRadius:12, background:"rgba(0,0,0,0.2)", marginBottom:6 }}>
            <div style={{ fontSize:13, fontWeight:800 }}>{sec.icon} {sec.title}</div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={async () => {
                for (const u of ALLOWED_USERNAMES)
                  await setDoc(doc(db,"userData",u), { piaUnlocked:{ [sec.id]:true }, ...(prazo ? { piaSavedPrazo: prazo } : {}) }, { merge:true });
                alert(`"${sec.title}" aberta para todos!${prazo ? ` Prazo: ${prazo}` : ""}`);
              }} style={{ background:`${GRN}18`, border:`1px solid ${GRN}40`, color:GRN, borderRadius:8, padding:"5px 12px", fontWeight:900, fontSize:11, cursor:"pointer" }}>
                🔓 Abrir a todos
              </button>
              <button onClick={async () => {
                if (!window.confirm(`Fechar "${sec.title}" para todos?`)) return;
                for (const u of ALLOWED_USERNAMES)
                  await setDoc(doc(db,"userData",u), { piaUnlocked:{ [sec.id]:false } }, { merge:true });
              }} style={{ background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.25)", color:"#f43f5e", borderRadius:8, padding:"5px 12px", fontWeight:900, fontSize:11, cursor:"pointer" }}>
                🔒 Fechar a todos
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* All PIAs */}
      <div style={CARD}>
        <div style={SL}>📋 PIAs dos Jovens</div>
        {JEEP_8.map(j => {
          const uData = allShared[j.username] || {};
          const piaData = uData.piaData || {};

          const filledSections = PIA_SECTIONS.filter(sec => {
            const sd = piaData[sec.id] || {};
            if (sec.id === "s3b") return ["swotF","swotFraq","swotOp","swotR"].some(k => sd[k]?.trim());
            return sec.fields.some(f => {
              if (f.type === "activities") return (sd[f.key]||[]).some(a => a.oQue || a.titulo);
              if (f.type === "revisoes")   return (sd[f.key]||[]).some(r => r.texto || r.notas);
              return sd[f.key]?.trim?.();
            });
          });

          const isExpanded = !!expanded[j.username];
          return (
            <div key={j.username} style={{ marginBottom:10, borderRadius:12, background:"rgba(0,0,0,0.2)", overflow:"hidden" }}>
              <div style={{ padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:j.color }} />
                  <span style={{ fontSize:13, fontWeight:800, color:j.color }}>{j.name}</span>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  {uData.piaSaved
                    ? <span style={{ fontSize:10, color:GRN, fontWeight:800 }}>✓ Enviado {uData.piaSavedAt||""}</span>
                    : <span style={{ fontSize:10, color:"#475569" }}>Não enviado</span>}
                  <span style={{ fontSize:10, color:CYN, fontWeight:800 }}>{filledSections.length}/{PIA_SECTIONS.length} secções</span>
                  {filledSections.length > 0 && (
                    <button onClick={() => setExpanded(p => ({ ...p, [j.username]: !p[j.username] }))}
                      style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, padding:"3px 8px", fontSize:10, fontWeight:800, color:"#94a3b8", cursor:"pointer" }}>
                      {isExpanded ? "▲ fechar" : "▼ ver tudo"}
                    </button>
                  )}
                </div>
              </div>

              {filledSections.length > 0 && (
                <div style={{ padding:"0 14px 12px", borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                  {filledSections.map(sec => {
                    const sd = piaData[sec.id] || {};
                    return (
                      <div key={sec.id} style={{ marginTop:8 }}>
                        <div style={{ fontSize:10, fontWeight:800, color:CYN, marginBottom:3 }}>{sec.icon} {sec.title.toUpperCase()}</div>
                        {sec.id === "s3b" ? (
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
                            {[["swotF","Forças"],["swotFraq","Fraquezas"],["swotOp","Oportunidades"],["swotR","Riscos"]].map(([k,l]) => sd[k] && (
                              <div key={k} style={{ fontSize:11, color:"#94a3b8", background:"rgba(0,0,0,0.2)", borderRadius:6, padding:"5px 8px" }}>
                                <strong style={{ color:"#e2e8f0" }}>{l}:</strong>{" "}
                                {isExpanded ? sd[k] : (sd[k].substring(0,60) + (sd[k].length > 60 ? "…" : ""))}
                              </div>
                            ))}
                          </div>
                        ) : sec.fields.map(f => {
                          const v = sd[f.key];
                          if (!v || (Array.isArray(v) && !v.length)) return null;
                          const preview = Array.isArray(v)
                            ? (isExpanded
                                ? v.map((a,i) => <div key={i} style={{ paddingLeft:8, borderLeft:"2px solid rgba(255,255,255,0.08)", marginTop:3 }}>{Object.entries(a).filter(([,val])=>val).map(([k,val])=>`${k}: ${val}`).join(" · ")}</div>)
                                : `${v.length} entrada(s)`)
                            : (isExpanded ? String(v) : String(v).substring(0,100) + (String(v).length > 100 ? "…" : ""));
                          return (
                            <div key={f.key} style={{ fontSize:11, color:"#94a3b8", marginBottom:2, whiteSpace: isExpanded ? "pre-wrap" : "normal" }}>
                              <strong style={{ color:"#e2e8f0" }}>{f.label}:</strong> {preview}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
