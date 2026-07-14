import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc, addDoc, collection, increment, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, CYN, INP, TXT_MUT, PRP, Linkify } from "../../theme.jsx";
import { nowFull, FORUM_REACTIONS, ALL_MEDALS, JEEP_LIST } from "../../data.js";

export default function ForumPost({ post, user, canalAtivo, forumCollection = "forum", authorMedals = [], mencaoNotif = null }) {
  const [responderA,        setResponderA]        = useState(false);
  const [textoResposta,     setTextoResposta]      = useState("");
  const [editando,          setEditando]           = useState(false);
  const [textoEditado,      setTextoEditado]       = useState(post.text);
  const [editandoReplyId,   setEditandoReplyId]    = useState(null);
  const [textoEditadoReply, setTextoEditadoReply]  = useState("");
  const [whoOpen,           setWhoOpen]            = useState(null);

  async function darXP(acao) {
    await updateDoc(doc(db, "userData", user.username), {
      weekXp: increment(5),
      history: arrayUnion({ date: nowFull(), action: acao, ts: Date.now(), xp: 5 })
    });
  }

  async function enviarNotificacao(tipo) {
    if (!post.username || user.username === post.username) return;
    const msg = tipo === "like"
      ? `❤️ ${user.realName} reagiu à tua partilha!`
      : `💬 ${user.realName} comentou a tua partilha!`;
    if (post.username === "admin") {
      await addDoc(collection(db, "adminNotificacoes"), {
        tipo: tipo === "like" ? "FORUM_REACAO" : "FORUM_COMENTARIO",
        jovem: user.username,
        texto: tipo === "like"
          ? `${user.realName} reagiu ao teu post em #${canalAtivo}`
          : `${user.realName} comentou o teu post em #${canalAtivo}`,
        ts: Date.now(), lida: false
      });
    } else {
      const sobrePreview = post.text ? post.text.substring(0, 80) + (post.text.length > 80 ? "…" : "") : "";
      await addDoc(collection(db, "notifications", post.username, "items"), {
        from: user.username, text: msg, date: nowFull(), read: false,
        canal: canalAtivo, ts: Date.now(),
        // Comentário → push; reação (like) fica só na app para não encher
        // o telemóvel de avisos a cada emoji.
        push: tipo === "reply",
        ...(sobrePreview ? { sobre: sobrePreview } : {})
      });
    }
  }

  async function handleApagarPost() {
    if (window.confirm("Apagar esta partilha?"))
      await deleteDoc(doc(db, forumCollection, canalAtivo, "posts", post.id));
  }

  async function handleGuardarEdicao() {
    if (!textoEditado.trim()) return;
    await updateDoc(doc(db, forumCollection, canalAtivo, "posts", post.id), {
      text: textoEditado, time: nowFull() + " (editado)"
    });
    setEditando(false);
  }

  async function dismissMencao() {
    if (mencaoNotif?.id) {
      await updateDoc(doc(db, "notifications", user.username, "items", mencaoNotif.id), { read: true });
    }
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
      dismissMencao();
    }
    await updateDoc(doc(db, forumCollection, canalAtivo, "posts", post.id), { reactions:rcts, reactedBy:rBy });
  }

  async function handleResponder() {
    if (!textoResposta.trim()) return;
    const novaR = {
      id:"R_"+Date.now(), username:user.username,
      user:user.realName, color:user.color,
      text:textoResposta, time:nowFull()
    };
    await updateDoc(doc(db, forumCollection, canalAtivo, "posts", post.id), {
      replies: [...(post.replies||[]), novaR]
    });
    setResponderA(false); setTextoResposta("");
    darXP("Respondeu no Fórum");
    enviarNotificacao("reply");
    dismissMencao();
  }

  async function handleReagirReply(replyId) {
    const updReplies = (post.replies || []).map(r => {
      if (r.id !== replyId) return r;
      const liked = (r.likedBy || []).includes(user.username);
      return {
        ...r,
        likes: liked ? Math.max(0, (r.likes || 1) - 1) : (r.likes || 0) + 1,
        likedBy: liked ? (r.likedBy || []).filter(u => u !== user.username) : [...(r.likedBy || []), user.username],
      };
    });
    await updateDoc(doc(db, forumCollection, canalAtivo, "posts", post.id), { replies: updReplies });
  }

  function responderAReply(replyUsername) {
    const nome = JEEP_LIST.find(j => j.username === replyUsername)?.name || replyUsername;
    setTextoResposta(`@${nome} `);
    setResponderA(true);
    setTimeout(() => document.querySelector("input[placeholder='Responde aqui...']")?.focus(), 50);
  }

  async function apagarReply(rid) {
    if (window.confirm("Apagar este comentário?")) {
      await updateDoc(doc(db, forumCollection, canalAtivo, "posts", post.id), {
        replies: post.replies.filter(r => r.id !== rid)
      });
    }
  }

  async function handleGuardarEdicaoReply(rid) {
    if (!textoEditadoReply.trim()) return;
    await updateDoc(doc(db, forumCollection, canalAtivo, "posts", post.id), {
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
              {authorMedals.length > 0 && (
                <span style={{ display:"flex", alignItems:"center", gap:1 }}>
                  {authorMedals.slice(0, 3).map(mid => {
                    const m = ALL_MEDALS.find(x => x.id === mid);
                    return m ? <span key={mid} style={{ fontSize:13 }} title={m.label}>{m.icon}</span> : null;
                  })}
                  {authorMedals.length > 3 && <span style={{ fontSize:10, color:"#5a7a9a", fontWeight:800, marginLeft:2 }}>+{authorMedals.length - 3}</span>}
                </span>
              )}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:10, color:TXT_MUT, flexShrink:0 }}>{post.time}</span>
              {(post.username === user.username || (!post.username && post.user === user.realName)) && (
                <>
                  <button onClick={() => setEditando(!editando)} style={{ background: editando ? "rgba(50,199,255,0.12)" : "rgba(255,255,255,0.06)", border:"none", cursor:"pointer", fontSize:12, padding:"3px 8px", borderRadius:8, color: editando ? "#32C7FF" : "#8ba3be" }}>✏️</button>
                  <button onClick={handleApagarPost} style={{ background:"rgba(244,63,94,0.1)", border:"none", cursor:"pointer", fontSize:12, padding:"3px 8px", borderRadius:8, color:"#f43f5e" }}>🗑️</button>
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
              <Linkify>{post.text}</Linkify>
            </div>
          )}

          {/* Imagem */}
          {post.media && (
            <img src={post.media} alt="" style={{ maxWidth:"100%", borderRadius:14, marginTop:8, border:"1px solid rgba(255,255,255,0.06)" }}/>
          )}

          {/* Reações + Responder */}
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:12, flexWrap:"wrap" }}>
            {FORUM_REACTIONS.map(r => {
              const cnt      = post.reactions?.[r.id] || 0;
              const mine     = post.reactedBy?.[r.id]?.includes(user.username);
              const key      = `${post.id}_${r.id}`;
              const isOpen   = whoOpen === key;
              const quem     = (post.reactedBy?.[r.id] || []).map(u => {
                if (u === "admin") return "Teresa (GO)";
                return JEEP_LIST.find(j => j.username === u)?.name || u;
              });
              return (
                <div key={r.id} style={{ position:"relative" }}>
                  <div style={{
                    display:"flex", alignItems:"center",
                    borderRadius:20, overflow:"hidden",
                    background: mine ? `${CYN}15` : "rgba(255,255,255,0.04)",
                    boxShadow: mine ? `0 0 0 1px ${CYN}30` : "none",
                  }}>
                    <button onClick={() => handleReagir(r.id)} style={{
                      display:"flex", alignItems:"center", gap:4,
                      padding: cnt > 0 ? "4px 6px 4px 10px" : "4px 10px",
                      border:"none", cursor:"pointer", background:"transparent",
                      color: mine ? CYN : TXT_MUT, fontSize:12,
                    }}>
                      <span>{r.icon}</span>
                    </button>
                    {cnt > 0 && (
                      <button onClick={() => setWhoOpen(isOpen ? null : key)} style={{
                        padding:"4px 10px 4px 2px", border:"none", cursor:"pointer",
                        background:"transparent", color: mine ? CYN : TXT_MUT,
                        fontSize:12, fontWeight:800,
                      }}>{cnt}</button>
                    )}
                  </div>
                  {isOpen && quem.length > 0 && (
                    <div style={{
                      position:"absolute", bottom:"calc(100% + 6px)", left:0, zIndex:20,
                      background:"#1e293b", border:"1px solid rgba(255,255,255,0.12)",
                      borderRadius:10, padding:"8px 12px", whiteSpace:"nowrap",
                      fontSize:11, color:"#e2e8f0", boxShadow:"0 8px 24px rgba(0,0,0,0.5)",
                    }}>
                      {quem.join(", ")}
                    </div>
                  )}
                </div>
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
                      style={{ background:"rgba(255,255,255,0.06)", border:"none", fontSize:11, cursor:"pointer", padding:"2px 6px", borderRadius:6, color:"#8ba3be" }}>✏️</button>
                    <button onClick={() => apagarReply(reply.id)}
                      style={{ background:"rgba(244,63,94,0.1)", border:"none", fontSize:11, cursor:"pointer", padding:"2px 6px", borderRadius:6, color:"#f43f5e" }}>🗑️</button>
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
                <>
                  <div style={{ fontSize:13, color:"#cbd5e1", lineHeight:1.5 }}><Linkify>{reply.text}</Linkify></div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:6 }}>
                    <button onClick={() => handleReagirReply(reply.id)} style={{
                      background:"none", border:"none", cursor:"pointer", padding:0,
                      fontSize:12, color:(reply.likedBy||[]).includes(user.username) ? "#f43f5e" : TXT_MUT,
                      display:"flex", alignItems:"center", gap:3,
                    }}>
                      ❤️ {reply.likes > 0 ? reply.likes : ""}
                    </button>
                    {(reply.username !== user.username || user.username === "admin" || user.username === "teresa") && (
                      <button onClick={() => responderAReply(reply.username)} style={{
                        background:"none", border:"none", cursor:"pointer", padding:0,
                        fontSize:11, color:TXT_MUT, fontWeight:700,
                      }}>↩ Responder</button>
                    )}
                  </div>
                </>
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
