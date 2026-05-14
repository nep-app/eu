import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc, addDoc, collection, increment, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, CYN, INP, TXT_MUT, PRP } from "../../theme.jsx";
import { nowFull, FORUM_REACTIONS } from "../../data.js";

export default function ForumPost({ post, user, canalAtivo }) {
  const [responderA,        setResponderA]        = useState(false);
  const [textoResposta,     setTextoResposta]      = useState("");
  const [editando,          setEditando]           = useState(false);
  const [textoEditado,      setTextoEditado]       = useState(post.text);
  const [editandoReplyId,   setEditandoReplyId]    = useState(null);
  const [textoEditadoReply, setTextoEditadoReply]  = useState("");

  async function darXP(acao) {
    await updateDoc(doc(db, "userData", user.username), {
      weekXp: increment(5),
      history: arrayUnion({ date: nowFull(), action: acao, ts: Date.now(), xp: 5 })
    });
  }

  async function enviarNotificacao(tipo) {
    if (user.username === post.username) return;
    const msg = tipo === "like"
      ? `❤️ ${user.realName} reagiu à tua partilha!`
      : `💬 ${user.realName} comentou a tua partilha!`;
    await addDoc(collection(db, "notifications", post.username, "items"), {
      from:"sistema", text:msg, date:nowFull(), read:false
    });
  }

  async function handleApagarPost() {
    if (window.confirm("Apagar esta partilha?"))
      await deleteDoc(doc(db, "forum", canalAtivo, "posts", post.id));
  }

  async function handleGuardarEdicao() {
    if (!textoEditado.trim()) return;
    await updateDoc(doc(db, "forum", canalAtivo, "posts", post.id), {
      text: textoEditado, time: nowFull() + " (editado)"
    });
    setEditando(false);
  }

  async function handleReagir(tipo) {
    const rcts = { ...post.reactions };
    const rBy  = { ...post.reactedBy };
    const users = rBy[tipo] || [];
    if (users.includes(user.username)) {
      rcts[tipo] = Math.max(0, (rcts[tipo] || 1) - 1);
      rBy[tipo]  = users.filter(u => u !== user.username);
    } else {
      rcts[tipo] = (rcts[tipo] || 0) + 1;
      rBy[tipo]  = [...users, user.username];
      darXP("Interagiu no Fórum");
      enviarNotificacao("like");
    }
    await updateDoc(doc(db, "forum", canalAtivo, "posts", post.id), { reactions:rcts, reactedBy:rBy });
  }

  async function handleResponder() {
    if (!textoResposta.trim()) return;
    const novaR = {
      id:"R_"+Date.now(), username:user.username,
      user:user.realName, color:user.color,
      text:textoResposta, time:nowFull()
    };
    await updateDoc(doc(db, "forum", canalAtivo, "posts", post.id), {
      replies: [...(post.replies||[]), novaR]
    });
    setResponderA(false); setTextoResposta("");
    darXP("Respondeu no Fórum");
    enviarNotificacao("reply");
  }

  async function apagarReply(rid) {
    if (window.confirm("Apagar este comentário?")) {
      await updateDoc(doc(db, "forum", canalAtivo, "posts", post.id), {
        replies: post.replies.filter(r => r.id !== rid)
      });
    }
  }

  async function handleGuardarEdicaoReply(rid) {
    if (!textoEditadoReply.trim()) return;
    await updateDoc(doc(db, "forum", canalAtivo, "posts", post.id), {
      replies: post.replies.map(r => r.id === rid ? {...r, text:textoEditadoReply, time:nowFull()+" (editado)"} : r)
    });
    setEditandoReplyId(null);
  }

  const isAdmin = post.username === "admin" || post.username === "teresa";

  return (
    <div style={{ ...CARD, marginBottom:12 }} className="fade-up">
      <div style={{ display:"flex", gap:12 }}>

        {/* Avatar */}
        <div style={{ flexShrink:0 }}>
          <div style={{ width:40, height:40, borderRadius:14,
            background:`linear-gradient(135deg, ${post.color}, ${post.color}66)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:16, fontWeight:900, color:"#0f172a",
            boxShadow:`0 0 0 2px ${post.color}20` }}>
            {(post.user || "?")[0].toUpperCase()}
          </div>
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          {/* Header do post */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
              <span style={{ fontSize:13, fontWeight:800, color:post.color }}>{post.user}</span>
              {isAdmin && (
                <span style={{ fontSize:9, background:CYN, color:"#0f172a", padding:"2px 6px", borderRadius:5, fontWeight:900, letterSpacing:0.5 }}>ADMIN</span>
              )}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:10, color:TXT_MUT, flexShrink:0 }}>{post.time}</span>
              {post.username === user.username && (
                <>
                  <button onClick={() => setEditando(!editando)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, opacity:0.5, padding:0 }}>✏️</button>
                  <button onClick={handleApagarPost} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, opacity:0.5, padding:0 }}>🗑️</button>
                </>
              )}
            </div>
          </div>

          {/* Texto */}
          {editando ? (
            <div style={{ display:"flex", gap:8, marginBottom:10 }}>
              <textarea value={textoEditado} onChange={e => setTextoEditado(e.target.value)}
                style={{ ...INP, flex:1, marginBottom:0, minHeight:60, resize:"none" }} />
              <button onClick={handleGuardarEdicao} style={{ background:CYN, border:"none", borderRadius:10, padding:"0 14px", fontWeight:900, cursor:"pointer", color:"#0f172a", fontSize:13 }}>OK</button>
            </div>
          ) : (
            <div style={{ fontSize:14, color:"#e2e8f0", lineHeight:1.6, whiteSpace:"pre-wrap", marginBottom:post.media ? 10 : 0 }}>
              {post.text}
            </div>
          )}

          {/* Imagem */}
          {post.media && (
            <img src={post.media} alt="" style={{ maxWidth:"100%", borderRadius:14, marginTop:8, border:"1px solid rgba(255,255,255,0.06)" }}/>
          )}

          {/* Reações + Responder */}
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:12, flexWrap:"wrap" }}>
            {FORUM_REACTIONS.map(r => {
              const cnt   = post.reactions?.[r.id] || 0;
              const mine  = post.reactedBy?.[r.id]?.includes(user.username);
              return (
                <button key={r.id} onClick={() => handleReagir(r.id)} style={{
                  display:"flex", alignItems:"center", gap:4, padding:"4px 10px",
                  borderRadius:20, border:"none", cursor:"pointer", transition:"all 0.15s",
                  background: mine ? `${CYN}15` : "rgba(255,255,255,0.04)",
                  color: mine ? CYN : TXT_MUT, fontSize:12,
                  boxShadow: mine ? `0 0 0 1px ${CYN}30` : "none",
                }}>
                  <span>{r.icon}</span>
                  {cnt > 0 && <span style={{ fontWeight:800 }}>{cnt}</span>}
                </button>
              );
            })}
            <button onClick={() => setResponderA(!responderA)} style={{
              background:"none", border:"none", cursor:"pointer",
              fontSize:11, color:responderA ? CYN : TXT_MUT, fontWeight:800,
              padding:"4px 8px", borderRadius:10, marginLeft:4, transition:"color 0.15s",
            }}>
              💬 {(post.replies?.length||0) > 0 ? post.replies.length : ""} Responder
            </button>
          </div>
        </div>
      </div>

      {/* ── THREAD ────────────────────────────────────────────────── */}
      {(post.replies?.length > 0 || responderA) && (
        <div style={{ marginTop:14, marginLeft:52, borderLeft:"2px solid rgba(255,255,255,0.05)", paddingLeft:14 }}>

          {post.replies?.map(reply => (
            <div key={reply.id} style={{ marginBottom:12, padding:"10px 12px", borderRadius:12, background:"rgba(255,255,255,0.02)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontSize:12, fontWeight:800, color:reply.color }}>{reply.user}</span>
                  <span style={{ fontSize:10, color:TXT_MUT }}>{reply.time}</span>
                </div>
                {reply.username === user.username && (
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={() => { setEditandoReplyId(reply.id); setTextoEditadoReply(reply.text); }}
                      style={{ background:"none", border:"none", fontSize:11, cursor:"pointer", opacity:0.4 }}>✏️</button>
                    <button onClick={() => apagarReply(reply.id)}
                      style={{ background:"none", border:"none", fontSize:11, cursor:"pointer", opacity:0.4 }}>🗑️</button>
                  </div>
                )}
              </div>

              {editandoReplyId === reply.id ? (
                <div style={{ display:"flex", gap:6 }}>
                  <input value={textoEditadoReply} onChange={e => setTextoEditadoReply(e.target.value)}
                    style={{ ...INP, flex:1, padding:"8px 12px", marginBottom:0, fontSize:12 }} />
                  <button onClick={() => handleGuardarEdicaoReply(reply.id)}
                    style={{ background:CYN, border:"none", borderRadius:8, padding:"0 10px", fontWeight:900, cursor:"pointer", fontSize:11, color:"#0f172a" }}>OK</button>
                </div>
              ) : (
                <div style={{ fontSize:13, color:"#cbd5e1", lineHeight:1.5 }}>{reply.text}</div>
              )}
            </div>
          ))}

          {/* Campo de resposta */}
          {responderA && (
            <div style={{ display:"flex", gap:8, marginTop:8 }}>
              <input value={textoResposta} onChange={e => setTextoResposta(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleResponder()}
                placeholder="Responde aqui..." style={{ ...INP, flex:1, marginBottom:0, padding:"10px 14px", fontSize:13 }} />
              <button onClick={handleResponder} style={{
                background:CYN, border:"none", borderRadius:12, padding:"0 16px",
                fontWeight:900, cursor:"pointer", fontSize:16, color:"#0f172a", flexShrink:0 }}>↑</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
