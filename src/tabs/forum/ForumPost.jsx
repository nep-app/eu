import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc, addDoc, collection, increment, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, CYN, INP } from "../../theme.jsx";
import { nowLabel, FORUM_REACTIONS } from "../../data.js";

export default function ForumPost({ post, user, canalAtivo }) {
  const [responderA, setResponderA] = useState(false);
  const [textoResposta, setTextoResposta] = useState("");
  const [editando, setEditando] = useState(false);
  const [textoEditado, setTextoEditado] = useState(post.text);
  
  // Estados para edição de RESPOSTAS
  const [editandoReplyId, setEditandoReplyId] = useState(null);
  const [textoEditadoReply, setTextoEditadoReply] = useState("");

  const isAdmin = user.username === "teresa";

  // ── FUNÇÕES DE APOIO ──
  async function darXP(acao) {
    await updateDoc(doc(db, "userData", user.username), {
      weekXp: increment(5),
      history: arrayUnion({ date: nowLabel(), action: acao, ts: Date.now(), xp: 5 })
    });
  }

  // ── LÓGICA DE POST PRINCIPAL ──
  async function handleApagarPost() {
    if (window.confirm("Apagar esta partilha?")) {
      await deleteDoc(doc(db, "forum", canalAtivo, "posts", post.id));
    }
  }

  async function handleGuardarEdicao() {
    if (!textoEditado.trim()) return;
    await updateDoc(doc(db, "forum", canalAtivo, "posts", post.id), {
      text: textoEditado,
      time: nowLabel() + " (editado)"
    });
    setEditando(false);
  }

  // ── LÓGICA DE REAÇÕES ──
  async function handleReagir(tipo) {
    let rcts = { ...post.reactions };
    let rBy = { ...post.reactedBy };
    let users = rBy[tipo] || [];

    if (users.includes(user.username)) {
      rcts[tipo] = Math.max(0, (rcts[tipo] || 1) - 1);
      rBy[tipo] = users.filter(u => u !== user.username);
    } else {
      rcts[tipo] = (rcts[tipo] || 0) + 1;
      rBy[tipo] = [...users, user.username];
      darXP("Interagiu no Fórum");
    }
    await updateDoc(doc(db, "forum", canalAtivo, "posts", post.id), { 
      reactions: rcts, reactedBy: rBy 
    });
  }

  // ── LÓGICA DE RESPOSTAS (THREADS) ──
  async function handleResponder() {
    if (!textoResposta.trim()) return;
    const novaR = { 
      id: "R_" + Date.now(), 
      username: user.username, 
      user: user.realName, 
      color: user.color, 
      text: textoResposta, 
      time: nowLabel() 
    };
    await updateDoc(doc(db, "forum", canalAtivo, "posts", post.id), { 
      replies: [...(post.replies || []), novaR] 
    });
    setResponderA(false); setTextoResposta(""); darXP("Respondeu no Fórum");
  }

  async function apagarReply(rid) {
    if (window.confirm("Apagar esta resposta?")) {
      const novas = post.replies.filter(r => r.id !== rid);
      await updateDoc(doc(db, "forum", canalAtivo, "posts", post.id), { replies: novas });
    }
  }

  async function handleGuardarEdicaoReply(rid) {
    if (!textoEditadoReply.trim()) return;
    const novas = post.replies.map(r => {
      if (r.id === rid) return { ...r, text: textoEditadoReply, time: nowLabel() + " (editado)" };
      return r;
    });
    await updateDoc(doc(db, "forum", canalAtivo, "posts", post.id), { replies: novas });
    setEditandoReplyId(null);
  }

  return (
    <div style={CARD}>
      <div style={{ display: "flex", gap: "14px" }}>
        {/* Avatar */}
        <div style={{ width: 42, height: 42, borderRadius: 14, background: `linear-gradient(135deg, ${post.color}, #000)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, flexShrink: 0 }}>
          {post.user ? post.user[0].toUpperCase() : "?"}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: post.color }}>
              {post.user} {post.username === "teresa" && <span style={{ fontSize: 9, background: CYN, color: "#000", padding: "2px 5px", borderRadius: 5, marginLeft: 5 }}>ADMIN</span>}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "#64748b" }}>{post.time}</div>
              
              {/* APAGAR/EDITAR POST (Teresa apaga tudo, o dono edita/apaga o seu) */}
              {(post.username === user.username || isAdmin) && (
                <div style={{ display: "flex", gap: 8 }}>
                  {post.username === user.username && (
                    <button onClick={() => setEditando(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>✏️</button>
                  )}
                  <button onClick={handleApagarPost} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                </div>
              )}
            </div>
          </div>

          {editando ? (
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <textarea value={textoEditado} onChange={e => setTextoEditado(e.target.value)} style={{ ...INP, flex: 1, marginBottom: 0 }} />
              <button onClick={handleGuardarEdicao} style={{ background: CYN, border: "none", borderRadius: 10, padding: "0 15px", fontWeight: 900, cursor: "pointer" }}>OK</button>
            </div>
          ) : (
            <div style={{ fontSize: 15, color: "#e2e8f0", marginTop: 5, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{post.text}</div>
          )}

          {post.media && <img src={post.media} alt="Post" style={{ maxWidth: "100%", borderRadius: 16, marginTop: 12 }} />}

          {/* Reações e Botão Responder */}
          <div style={{ display: "flex", gap: 15, marginTop: 15 }}>
            {FORUM_REACTIONS.map(r => {
              const cont = post.reactions?.[r.id] || 0;
              const isMine = post.reactedBy?.[r.id]?.includes(user.username);
              return (
                <div key={r.id} onClick={() => handleReagir(r.id)} style={{ cursor: "pointer", color: isMine ? CYN : "#94a3b8", display: "flex", gap: 4, background: isMine ? `${CYN}20` : "transparent", padding: "4px 8px", borderRadius: 8, transition: "0.2s" }}>
                  <span>{r.icon}</span> {cont > 0 && <b>{cont}</b>}
                </div>
              );
            })}
            <div onClick={() => setResponderA(!responderA)} style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, cursor: "pointer", alignSelf: "center" }}>💬 RESPONDER</div>
          </div>
        </div>
      </div>

      {/* ── THREAD DE RESPOSTAS ── */}
      {post.replies?.length > 0 && (
        <div style={{ marginTop: 20, marginLeft: 45, borderLeft: "2px solid rgba(255,255,255,0.05)", paddingLeft: 15 }}>
          {post.replies.map(reply => (
            <div key={reply.id} style={{ marginBottom: 15 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: reply.color }}>
                  {reply.user} <span style={{ color: "#64748b", fontWeight: 400, marginLeft: 5 }}>{reply.time}</span>
                </div>
                
                {/* APAGAR/EDITAR RESPOSTA */}
                {(reply.username === user.username || isAdmin) && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {reply.username === user.username && (
                      <button onClick={() => { setEditandoReplyId(reply.id); setTextoEditadoReply(reply.text); }} style={{ background: "none", border: "none", fontSize: 12, cursor: "pointer", opacity: 0.6 }}>✏️</button>
                    )}
                    <button onClick={() => apagarReply(reply.id)} style={{ background: "none", border: "none", fontSize: 12, cursor: "pointer", opacity: 0.6 }}>🗑️</button>
                  </div>
                )}
              </div>

              {editandoReplyId === reply.id ? (
                <div style={{ marginTop: 5, display: "flex", gap: 8 }}>
                  <input value={textoEditadoReply} onChange={e => setTextoEditadoReply(e.target.value)} style={{ ...INP, flex: 1, padding: "8px", marginBottom: 0 }} />
                  <button onClick={() => handleGuardarEdicaoReply(reply.id)} style={{ background: CYN, border: "none", borderRadius: 8, padding: "0 10px", fontWeight: 900, cursor: "pointer", fontSize: 11 }}>OK</button>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 2, whiteSpace: "pre-wrap" }}>{reply.text}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Campo para Nova Resposta */}
      {responderA && (
        <div style={{ marginTop: 15, marginLeft: 45, display: "flex", gap: 10 }}>
          <input value={textoResposta} onChange={e => setTextoResposta(e.target.value)} placeholder="Escreve uma resposta..." style={{ ...INP, flex: 1, marginBottom: 0 }} />
          <button onClick={handleResponder} style={{ background: CYN, border: "none", borderRadius: 12, padding: "0 15px", fontWeight: 900, cursor: "pointer" }}>↑</button>
        </div>
      )}
    </div>
  );
}
