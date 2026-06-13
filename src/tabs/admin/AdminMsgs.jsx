import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, PNK, INP } from "../../theme.jsx";
import { nowFull, JEEP_LIST, ALLOWED_USERNAMES } from "../../data.js";

export default function AdminMsgs() {
  const [msgs, setMsgs] = useState([]);
  const [loadErr, setLoadErr] = useState(null);
  const [adminReplyTxt, setAdminReplyTxt] = useState({});
  const [novaMsgTexto, setNovaMsgTexto] = useState("");
  const [novaMsgDest, setNovaMsgDest] = useState("all");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "messages"),
      (snap) => {
        const lista = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.ts || 0) - (a.ts || 0));
        setMsgs(lista);
        setLoadErr(null);
      },
      (err) => {
        console.error("Erro ao carregar mensagens:", err);
        setLoadErr(err.message);
      }
    );
    return unsub;
  }, []);

  async function replyToMsg(msgId, hiddenUser) {
    const replyText = adminReplyTxt[msgId];
    if (!replyText?.trim()) return;
    await updateDoc(doc(db, "messages", msgId), { adminReply: replyText });
    if (hiddenUser) {
      const original = msgs.find(m => m.id === msgId)?.text || "";
      const contexto = original ? ` — sobre: "${original.substring(0, 60)}${original.length > 60 ? "…" : ""}"` : "";
      await addDoc(collection(db, "notifications", hiddenUser, "items"), {
        from:"teresa", text:`A Teresa respondeu à tua mensagem${contexto}: ${replyText}`, date:nowFull(), read:false, ts:Date.now()
      });
    }
    setAdminReplyTxt({ ...adminReplyTxt, [msgId]: "" });
  }

  async function enviarNovaMsg() {
    if (!novaMsgTexto.trim()) return alert("Escreve uma mensagem.");
    setEnviando(true);
    try {
      const targets = novaMsgDest === "all" ? ALLOWED_USERNAMES : [novaMsgDest];
      for (const u of targets) {
        await addDoc(collection(db, "notifications", u, "items"), {
          from:"teresa", text: `💬 Teresa: ${novaMsgTexto.trim()}`, date: nowFull(), read: false, ts: Date.now()
        });
      }
      setNovaMsgTexto("");
      const nome = novaMsgDest === "all" ? "todos" : JEEP_LIST.find(j => j.username === novaMsgDest)?.name || novaMsgDest;
      alert(`Mensagem enviada a ${nome}! ✓`);
    } catch (e) { alert("Erro: " + e.message); }
    setEnviando(false);
  }

  return (
    <div>
      {/* NOVA MENSAGEM */}
      <div style={{ ...CARD, border:`1.5px solid ${CYN}30` }}>
        <div style={SL}>📤 Nova Mensagem</div>
        <select value={novaMsgDest} onChange={e => setNovaMsgDest(e.target.value)}
          style={{ width:"100%", padding:"10px 12px", borderRadius:12, background:"rgba(0,0,0,0.3)", color:"white", border:"1px solid rgba(255,255,255,0.1)", fontSize:13, marginBottom:10 }}>
          <option value="all">👥 Todos os jovens</option>
          {JEEP_LIST.filter(j => ALLOWED_USERNAMES.includes(j.username)).map(j =>
            <option key={j.username} value={j.username}>{j.name}</option>
          )}
        </select>
        <textarea value={novaMsgTexto} onChange={e => setNovaMsgTexto(e.target.value)}
          placeholder="Escreve a mensagem..." rows={3}
          style={{ ...INP, resize:"none", marginBottom:10 }} />
        <button onClick={enviarNovaMsg} disabled={enviando} style={{
          width:"100%", padding:"12px", background:`${CYN}20`, border:`1.5px solid ${CYN}40`,
          color:CYN, borderRadius:12, fontWeight:900, fontSize:13, cursor:"pointer"
        }}>
          {enviando ? "A enviar..." : `Enviar${novaMsgDest === "all" ? " a todos" : ""}`}
        </button>
      </div>

      {/* MENSAGENS RECEBIDAS */}
      {loadErr && (
        <div style={{ ...CARD, color:"#f43f5e", fontSize:13 }}>
          ⚠️ Erro ao carregar mensagens: {loadErr}
        </div>
      )}

      {!loadErr && msgs.length === 0 && (
        <div style={{ textAlign:"center", padding:"30px 20px", color:"#475569", fontSize:13 }}>
          Sem mensagens recebidas.
        </div>
      )}

      {msgs.map(m => (
        <div key={m.id} style={{ ...CARD, borderLeft: m.adminReply ? "1px solid rgba(255,255,255,0.1)" : `4px solid ${PNK}` }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:12, fontWeight:800, color: m.anon ? PNK : CYN }}>
              {m.anon ? "🔒 ANÓNIMO" : m.from?.toUpperCase()}
            </span>
            <span style={{ fontSize:11, color:"#94a3b8" }}>{m.date}</span>
          </div>
          <div style={{ fontSize:14, lineHeight:1.5, color:"#fff", marginBottom:12 }}>{m.text}</div>
          {m.adminReply ? (
            <div style={{ background:"rgba(34,211,238,0.1)", padding:12, borderRadius:12, borderLeft:`2px solid ${CYN}` }}>
              <div style={{ fontSize:10, fontWeight:900, color:CYN, marginBottom:4 }}>A TUA RESPOSTA:</div>
              <div style={{ fontSize:13 }}>{m.adminReply}</div>
            </div>
          ) : (
            <div style={{ display:"flex", gap:8 }}>
              <input value={adminReplyTxt[m.id] || ""} onChange={e => setAdminReplyTxt({...adminReplyTxt, [m.id]: e.target.value})}
                placeholder="Escreve uma resposta..." style={{ ...INP, flex:1, marginBottom:0, fontSize:12 }} />
              <button onClick={() => replyToMsg(m.id, m.hiddenUser)}
                style={{ background:CYN, color:"#0f172a", border:"none", borderRadius:12, padding:"0 20px", fontWeight:800, cursor:"pointer" }}>
                Enviar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
