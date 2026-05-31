import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, PNK, GRN } from "../../theme.jsx";
import { SURVEY_CATS, satisfLabel, SEMOJIS, USERS } from "../../data.js";

const JOVENS = USERS.filter(u => !["teresa","ricardo","demo"].includes(u.username));

export default function AdminSatisfacao() {
  const [respostas, setRespostas] = useState([]);
  const [stats, setStats] = useState({});
  const [vista, setVista] = useState("media"); // "media" | "individuais"
  const [participacao, setParticipacao] = useState({}); // { username: true/false }

  useEffect(() => {
    const q = query(collection(db, "satisfacao"), orderBy("ts", "desc"));
    return onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRespostas(docs);
      calcularEstatisticas(docs.filter(d => !d.username));
    });
  }, []);

  useEffect(() => {
    async function carregarParticipacao() {
      const resultado = {};
      await Promise.all(JOVENS.map(async (u) => {
        const snap = await getDoc(doc(db, "userData", u.username));
        resultado[u.username] = snap.exists() ? (snap.data().sSaved === true) : false;
      }));
      setParticipacao(resultado);
    }
    carregarParticipacao();
  }, []);

  function calcularEstatisticas(lista) {
    const s = {};
    SURVEY_CATS.forEach(cat => {
      s[cat.id] = { totalScore: 0, count: 0, comments: [], allChips: [] };
    });
    lista.forEach(resp => {
      resp.respostas.forEach(r => {
        if (s[r.catId]) {
          s[r.catId].totalScore += r.score;
          s[r.catId].count += 1;
          if (r.comment) s[r.catId].comments.push(r.comment);
          if (r.chips) s[r.catId].allChips.push(...r.chips);
        }
      });
    });
    setStats(s);
  }

  function fmtTs(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  }

  return (
    <div style={{ paddingBottom: 50 }}>
      {/* Painel de participação */}
      <div style={{ ...CARD, marginBottom:18 }}>
        <div style={{ ...SL, marginBottom:12 }}>
          Participação — {Object.values(participacao).filter(Boolean).length}/{JOVENS.length} responderam
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {JOVENS.map(u => {
            const fez = participacao[u.username];
            return (
              <div key={u.username} style={{
                display:"flex", alignItems:"center", gap:6,
                padding:"6px 12px", borderRadius:20,
                background: fez ? `${GRN}15` : "rgba(255,255,255,0.04)",
                border: `1px solid ${fez ? GRN+"40" : "rgba(255,255,255,0.08)"}`,
              }}>
                <span style={{ fontSize:11 }}>{fez ? "✅" : "⏳"}</span>
                <span style={{ fontSize:12, fontWeight:700, color: fez ? GRN : "#64748b" }}>{u.realName}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toggle vista */}
      <div style={{ display:"flex", gap:8, marginBottom:18 }}>
        {[["media","📊 Médias"],["individuais","📋 Individuais"]].map(([v,l]) => (
          <button key={v} onClick={() => setVista(v)} style={{
            flex:1, padding:"10px 8px", borderRadius:12, border:"none", cursor:"pointer",
            background: vista === v ? `${CYN}20` : "rgba(255,255,255,0.04)",
            color: vista === v ? CYN : "#94a3b8",
            fontWeight:800, fontSize:12,
            boxShadow: vista === v ? `0 0 0 1px ${CYN}35` : "none",
          }}>{l}</button>
        ))}
      </div>

      {respostas.length === 0 ? (
        <div style={CARD}>Ainda não existem respostas submetidas.</div>
      ) : vista === "media" ? (
        <>
          {SURVEY_CATS.map(cat => {
            const data = stats[cat.id] || { totalScore:0, count:0, comments:[], allChips:[] };
            const media = data.count > 0 ? (data.totalScore / data.count).toFixed(1) : 0;
            const [label, color] = satisfLabel(parseFloat(media));
            return (
              <div key={cat.id} style={CARD}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:15 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:24 }}>{cat.icon}</span>
                    <div>
                      <div style={{ fontWeight:800, fontSize:15 }}>{cat.label}</div>
                      <div style={{ fontSize:11, color:"#94a3b8" }}>{data.count} respostas</div>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:22, fontWeight:900, color }}>{media}</div>
                    <div style={{ fontSize:9, fontWeight:800, color:"#94a3b8" }}>{label.toUpperCase()}</div>
                  </div>
                </div>
                <div style={{ width:"100%", height:6, background:"rgba(255,255,255,0.05)", borderRadius:3, marginBottom:20 }}>
                  <div style={{ width:`${media*10}%`, height:"100%", background:color, borderRadius:3, transition:"0.5s" }}/>
                </div>
                {data.allChips.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:15 }}>
                    {[...new Set(data.allChips)].map((chip,i) => (
                      <span key={i} style={{ fontSize:10, background:"rgba(255,255,255,0.05)", padding:"4px 8px", borderRadius:8, color:"#cbd5e1", border:"1px solid rgba(255,255,255,0.1)" }}>
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
                {data.comments.length > 0 && (
                  <div style={{ background:"rgba(0,0,0,0.2)", borderRadius:12, padding:12 }}>
                    <div style={{ fontSize:10, fontWeight:900, color, marginBottom:8, opacity:0.8 }}>COMENTÁRIOS:</div>
                    {data.comments.map((txt,i) => (
                      <div key={i} style={{ fontSize:12, color:"#fff", fontStyle:"italic", marginBottom:8, paddingLeft:10, borderLeft:`2px solid ${color}` }}>
                        "{txt}"
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ textAlign:"center", fontSize:11, color:"#475569", marginTop:10, marginBottom:16 }}>
            {respostas.filter(r => !r.username).length} respostas anónimas contabilizadas
          </div>

          {/* Respostas identificadas (teresa, ricardo) */}
          {respostas.filter(r => r.username).length > 0 && (
            <div style={{ marginTop:8 }}>
              <div style={{ ...SL, marginBottom:12 }}>👤 Respostas Identificadas</div>
              {respostas.filter(r => r.username).map((resp) => (
                <div key={resp.id} style={{ ...CARD, borderLeft:`3px solid ${PNK}`, marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                    <div style={{ fontSize:13, fontWeight:900, color:PNK }}>{resp.username}</div>
                    <div style={{ fontSize:11, color:"#475569" }}>{fmtTs(resp.ts)}</div>
                  </div>
                  {(resp.respostas || []).map((r, i) => {
                    const cat = SURVEY_CATS.find(c => c.id === r.catId);
                    const [label, color] = satisfLabel(r.score);
                    return (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontSize:14 }}>{cat?.icon}</span>
                          <span style={{ fontSize:12, color:"#e2e8f0" }}>{cat?.label}</span>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ fontSize:14 }}>{SEMOJIS[r.score] || ""}</span>
                          <span style={{ fontSize:13, fontWeight:900, color }}>{r.score}</span>
                          <span style={{ fontSize:9, color:"#64748b" }}>{label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ fontSize:11, color:"#475569", marginBottom:14, textAlign:"center" }}>
            {respostas.length} resposta{respostas.length !== 1 ? "s" : ""} anónima{respostas.length !== 1 ? "s" : ""}
          </div>
          {respostas.map((resp, idx) => (
            <div key={resp.id} style={{ ...CARD, marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:900, color:CYN }}>Resposta #{respostas.length - idx}</div>
                <div style={{ fontSize:11, color:"#475569" }}>{fmtTs(resp.ts)}</div>
              </div>
              {(resp.respostas || []).map((r, i) => {
                const cat = SURVEY_CATS.find(c => c.id === r.catId);
                const [label, color] = satisfLabel(r.score);
                return (
                  <div key={i} style={{ padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:16 }}>{cat?.icon}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:"#e2e8f0" }}>{cat?.label}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:16 }}>{SEMOJIS[r.score] || ""}</span>
                        <span style={{ fontSize:14, fontWeight:900, color }}>{r.score}</span>
                        <span style={{ fontSize:9, color:"#64748b", fontWeight:700 }}>{label}</span>
                      </div>
                    </div>
                    {r.chips?.length > 0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:4, marginLeft:24 }}>
                        {r.chips.map((c,j) => (
                          <span key={j} style={{ fontSize:9, background:"rgba(255,255,255,0.06)", padding:"2px 7px", borderRadius:6, color:"#94a3b8" }}>{c}</span>
                        ))}
                      </div>
                    )}
                    {r.comment && (
                      <div style={{ marginTop:6, marginLeft:24, fontSize:11, color:"#94a3b8", fontStyle:"italic", paddingLeft:8, borderLeft:`2px solid ${color}50` }}>
                        "{r.comment}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
