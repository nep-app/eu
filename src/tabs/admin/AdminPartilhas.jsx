import React, { useState } from 'react';
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, PNK, INP } from "../../theme.jsx";
import { ALLOWED_USERNAMES, JEEP_LIST, nowFull } from "../../data.js";

export default function AdminPartilhas({ allShared }) {
  const [adminSharedSel, setAdminSharedSel] = useState(null);
  const [feedbackTxts, setFeedbackTxts] = useState({});

  async function enviarFeedback(uname, tipo, texto) {
    if (!texto?.trim()) return;
    const tipoLabel = { auto:"Autoavaliação", pia:"PIA", swot:"Raio-X" }[tipo] || tipo;
    await addDoc(collection(db, "notifications", uname, "items"), {
      from:"teresa", text:`Teresa reagiu ao teu ${tipoLabel}: ${texto.trim()}`,
      date:nowFull(), read:false, ts:Date.now(), tipo
    });
    setFeedbackTxts(p => ({ ...p, [`${uname}_${tipo}`]: "" }));
    alert("Feedback enviado! ✓");
  }

  return (
    <div>
      {ALLOWED_USERNAMES.map(uname => {
        let d = allShared[uname] || {};
        let jInfo = JEEP_LIST.find(x=>x.username===uname);
        let isOpen = adminSharedSel === uname;
        return (
          <div key={uname} style={CARD}>
            <div onClick={()=>setAdminSharedSel(isOpen?null:uname)} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
              <div style={{ width:12, height:12, borderRadius:"50%", background:jInfo?jInfo.color:"#94a3b8" }}/>
              <div style={{ flex:1, fontSize:15, fontWeight:800 }}>{jInfo?jInfo.name:uname}</div>
              <div style={{ display:"flex", gap:5 }}>
                {d.autoSaved && <span style={{ fontSize:9, background:"#ef4444", color:"#fff", padding:"2px 6px", borderRadius:6 }}>AUTO ✓</span>}
                {!d.autoSaved && Object.keys(d.dScores||{}).length > 0 && <span style={{ fontSize:9, background:"#f97316", color:"#fff", padding:"2px 6px", borderRadius:6 }}>AUTO (não entregue)</span>}
                {d.piaShared && <span style={{ fontSize:9, background:PNK, color:"#fff", padding:"2px 6px", borderRadius:6 }}>PIA</span>}
                {d.swotShared && <span style={{ fontSize:9, background:CYN, color:"#0f172a", padding:"2px 6px", borderRadius:6 }}>SWOT</span>}
              </div>
              <span style={{ color:"#94a3b8", marginLeft:10 }}>{isOpen?"▲":"▼"}</span>
            </div>
            
            {isOpen && (
              <div style={{ marginTop:15, borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:15 }}>
                
                {/* AUTOAVALIAÇÃO */}
                {Object.keys(d.dScores||{}).length > 0 && (
                  <div style={{ marginBottom:20, background:"rgba(0,0,0,0.2)", padding:15, borderRadius:12 }}>
                     <div style={{ ...SL, color:"#ef4444", fontSize:11 }}>📊 Autoavaliação Mensal{!d.autoSaved ? " — não entregue ainda" : ""}</div>
                     {Object.keys(d.dScores).map(dimId => (
                       <div key={dimId} style={{ marginBottom:10, borderBottom:"1px solid rgba(255,255,255,0.05)", paddingBottom:5 }}>
                         <div style={{ fontSize:12, fontWeight:800, color:CYN }}>{dimId.toUpperCase()}</div>
                         <div style={{ display:"flex", justifyContent:"space-between", fontSize:13 }}>
                           <span>Nota: <strong style={{ color:"white" }}>{d.dScores[dimId]}</strong></span>
                         </div>
                         {d.dNotas && d.dNotas[dimId] && (
                           <div style={{ fontSize:11, color:"#94a3b8", marginTop:4, fontStyle:"italic" }}>"{d.dNotas[dimId]}"</div>
                         )}
                       </div>
                     ))}
                  </div>
                )}

                {/* PIA */}
                {d.piaShared && d.pia && (
                  <div style={{ marginBottom:15 }}>
                    <div style={{ ...SL, color:PNK, fontSize:10 }}>Plano Individual (PIA)</div>
                    {Object.keys(d.pia).map(k => d.pia[k] && (
                      <div key={k} style={{ fontSize:12, marginBottom:6, background:"rgba(0,0,0,0.2)", padding:8, borderRadius:8 }}>
                        <strong style={{ color:PNK }}>{k.toUpperCase()}:</strong> {d.pia[k]}
                      </div>
                    ))}
                  </div>
                )}

                {/* SWOT */}
                {d.swotShared && d.swotPia && (
                  <div>
                    <div style={{ ...SL, fontSize:10 }}>Raio-X (SWOT)</div>
                    {Object.keys(d.swotPia).map(k => d.swotPia[k] && (
                      <div key={k} style={{ fontSize:12, marginBottom:6, background:"rgba(0,0,0,0.2)", padding:8, borderRadius:8 }}>
                        <strong style={{ color:CYN }}>{k.toUpperCase()}:</strong> {d.swotPia[k]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
