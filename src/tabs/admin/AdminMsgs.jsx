import React, { useState } from 'react';
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, CYN, PNK, INP } from "../../theme.jsx";
import { nowLabel } from "../../data.js";

export default function AdminMsgs({ msgs }) {
  const [adminReplyTxt, setAdminReplyTxt] = useState({});

  async function replyToMsg(msgId, hiddenUser) {
    const replyText = adminReplyTxt[msgId];
    if (!replyText || !replyText.trim()) return;
    
    await updateDoc(doc(db, "messages", msgId), { adminReply: replyText });
    if (hiddenUser) {
      await addDoc(collection(db, "notifications", hiddenUser, "items"), { 
        from:"teresa", text:"A Teresa respondeu à tua mensagem: " + replyText, date:nowLabel(), read:false 
      });
    }
    setAdminReplyTxt({ ...adminReplyTxt, [msgId]: "" });
    alert("Resposta enviada com sucesso!");
  }

  return (
    <div>
      {msgs.slice().reverse().map(m => (
        <div key={m.id} style={{ ...CARD, borderLeft:m.adminReply ? "1px solid rgba(255,255,255,0.1)" : `4px solid ${PNK}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:12, fontWeight:800, color:m.anon?PNK:CYN }}>{m.anon?"🔒 ANÓNIMO":m.from.toUpperCase()}</span>
            <span style={{ fontSize:11, color:"#94a3b8" }}>{m.date}</span>
          </div>
          <div style={{ fontSize:14, lineHeight:1.5, color:"#fff", marginBottom:12 }}>{m.text}</div>
          
          {m.adminReply ? (
            <div style={{ background:"rgba(34, 211, 238, 0.1)", padding:12, borderRadius:12, borderLeft:`2px solid ${CYN}` }}>
              <div style={{ fontSize:10, fontWeight:900, color:CYN, marginBottom:4 }}>A TUA RESPOSTA:</div>
              <div style={{ fontSize:13 }}>{m.adminReply}</div>
            </div>
          ) : (
            <div style={{ display:"flex", gap:8 }}>
              <input 
                value={adminReplyTxt[m.id] || ""} 
                onChange={e => setAdminReplyTxt({...adminReplyTxt, [m.id]: e.target.value})} 
                placeholder="Escreve uma resposta..." 
                style={{ ...INP, flex:1, marginBottom:0, fontSize:12 }}
              />
              <button onClick={() => replyToMsg(m.id, m.hiddenUser)} style={{ background:CYN, color:"#0f172a", border:"none", borderRadius:12, padding:"0 20px", fontWeight:800, cursor:"pointer" }}>Enviar</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
