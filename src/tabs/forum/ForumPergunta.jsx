import React, { useState } from 'react';
import { doc, updateDoc, addDoc, collection, arrayUnion, arrayRemove, deleteField, increment } from "firebase/firestore";
import { db, notifyAdmin } from "../../firebase.js";
import { CYN, INP, TXT_MUT, Linkify } from "../../theme.jsx";
import { nowFull } from "../../data.js";

// Pergunta aberta dentro de um post do fórum: cada um responde (uma resposta
// por pessoa, editável), todos veem as respostas uns dos outros e podem dar ❤️
// e comentar cada resposta. Guardado no próprio post: respostas.{username}.
//
// `user` = { username, realName, color }. O admin vê tudo e comenta, mas não
// responde (a pergunta é dele).
export default function ForumPergunta({ post, user, canal, forumCollection = "forum" }) {
  const [texto, setTexto] = useState("");
  const [editar, setEditar] = useState(false);
  const [aEnviar, setAEnviar] = useState(false);
  const [comentarAberto, setComentarAberto] = useState(null); // username da resposta
  const [textoComentario, setTextoComentario] = useState("");

  const ref = doc(db, forumCollection, canal, "posts", post.id);
  const ehAdmin = user.username === "admin";
  const ehDemo = forumCollection === "forum_demo";
  const respostas = Object.values(post.respostas || {}).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  const minha = (post.respostas || {})[user.username];
  // "Só vê depois de responder" — o admin vê sempre tudo.
  const escondidas = post.ocultarAteResponder && !minha && !ehAdmin;

  async function enviarResposta() {
    const t = texto.trim();
    if (!t || aEnviar) return;
    setAEnviar(true);
    try {
      if (minha) {
        // Editar: só o texto — mantém os ❤️ e os comentários.
        await updateDoc(ref, { [`respostas.${user.username}.text`]: t, [`respostas.${user.username}.time`]: nowFull() + " (editado)" });
      } else {
        await updateDoc(ref, { [`respostas.${user.username}`]: {
          username: user.username, user: user.realName, color: user.color,
          text: t, ts: Date.now(), time: nowFull(), likedBy: [], comentarios: [],
        } });
        if (!ehDemo) {
          await updateDoc(doc(db, "userData", user.username), {
            weekXp: increment(5),
            history: arrayUnion({ date: nowFull(), action: "Respondeu no Fórum", ts: Date.now(), xp: 5 }),
          }).catch(() => {});
          // Posts de teste (só para a Teresa) não avisam a admin.
          if (!post.target) {
            await notifyAdmin({
              tipo: "FORUM_COMENTARIO", jovem: user.username,
              texto: `${user.realName} respondeu à tua pergunta no fórum (#${canal})`,
              ts: Date.now(), lida: false,
            });
          }
        }
      }
      setTexto(""); setEditar(false);
    } catch (e) {
      alert("Não foi possível enviar: " + (e?.message || e));
    } finally {
      setAEnviar(false);
    }
  }

  async function apagarMinha() {
    if (!window.confirm("Apagar a tua resposta? (os comentários a ela também desaparecem)")) return;
    await updateDoc(ref, { [`respostas.${user.username}`]: deleteField() });
  }

  async function gostar(r) {
    const jaGostei = (r.likedBy || []).includes(user.username);
    await updateDoc(ref, { [`respostas.${r.username}.likedBy`]: jaGostei ? arrayRemove(user.username) : arrayUnion(user.username) });
  }

  async function comentar(r) {
    const t = textoComentario.trim();
    if (!t) return;
    await updateDoc(ref, { [`respostas.${r.username}.comentarios`]: arrayUnion({
      id: "C_" + Date.now(), username: user.username, user: user.realName, color: user.color,
      text: t, ts: Date.now(), time: nowFull(),
    }) });
    setTextoComentario("");
    // Avisa quem respondeu (não se avisa a si próprio; a demo não avisa ninguém).
    if (!ehDemo && r.username !== user.username) {
      await addDoc(collection(db, "notifications", r.username, "items"), {
        from: user.username, text: `💬 ${user.realName} comentou a tua resposta no fórum`,
        date: nowFull(), read: false, canal, ts: Date.now(), push: true,
        sobre: (r.text || "").substring(0, 80),
      }).catch(() => {});
    }
  }

  async function apagarComentario(r, c) {
    if (!window.confirm("Apagar este comentário?")) return;
    await updateDoc(ref, { [`respostas.${r.username}.comentarios`]: arrayRemove(c) });
  }

  return (
    <div style={{ marginTop:12, padding:"12px 12px 4px", borderRadius:14, background:"rgba(50,199,255,0.06)", border:`1px solid ${CYN}30` }}>
      <div style={{ fontSize:10, fontWeight:900, letterSpacing:1.5, color:CYN, marginBottom:8 }}>
        ❓ PERGUNTA ABERTA · {respostas.length} {respostas.length === 1 ? "RESPOSTA" : "RESPOSTAS"}
      </div>

      {/* A minha resposta (o admin não responde à própria pergunta) */}
      {!ehAdmin && (!minha || editar) && (
        <div style={{ marginBottom:12 }}>
          <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={3}
            placeholder={minha ? "Edita a tua resposta…" : "Escreve a tua resposta… todos vão poder ler e comentar."}
            style={{ ...INP, width:"100%", resize:"vertical", marginBottom:6, fontSize:13 }} />
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={enviarResposta} disabled={!texto.trim() || aEnviar} style={{
              background: texto.trim() ? CYN : "rgba(255,255,255,0.08)", border:"none", borderRadius:10, padding:"8px 16px",
              fontWeight:900, fontSize:12, cursor: texto.trim() ? "pointer" : "default", color: texto.trim() ? "#0f172a" : TXT_MUT }}>
              {aEnviar ? "A enviar…" : minha ? "Guardar" : "Responder"}
            </button>
            {editar && <button onClick={() => { setEditar(false); setTexto(""); }} style={{ background:"none", border:"1px solid rgba(255,255,255,0.15)", borderRadius:10, padding:"8px 14px", fontSize:12, color:TXT_MUT, cursor:"pointer" }}>Cancelar</button>}
          </div>
        </div>
      )}

      {escondidas ? (
        <div style={{ fontSize:12, color:TXT_MUT, padding:"6px 2px 10px", lineHeight:1.5 }}>
          🙈 Responde primeiro para veres o que os outros disseram{respostas.length ? ` (já ${respostas.length === 1 ? "respondeu 1 pessoa" : `responderam ${respostas.length}`})` : ""}.
        </div>
      ) : respostas.length === 0 ? (
        <div style={{ fontSize:12, color:TXT_MUT, padding:"2px 2px 10px" }}>Ainda ninguém respondeu.</div>
      ) : respostas.map(r => {
        const gosteiEu = (r.likedBy || []).includes(user.username);
        const coms = r.comentarios || [];
        const aberto = comentarAberto === r.username;
        const minhaEsta = r.username === user.username;
        return (
          <div key={r.username} style={{ marginBottom:10, padding:"10px 12px", borderRadius:12, background:"rgba(0,0,0,0.18)", border: minhaEsta ? `1px solid ${CYN}40` : "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4, gap:8 }}>
              <span style={{ fontSize:12, fontWeight:800, color:r.color }}>{r.user}{minhaEsta ? " (tu)" : ""}</span>
              <span style={{ fontSize:10, color:TXT_MUT, flexShrink:0 }}>{r.time}</span>
            </div>
            <div style={{ fontSize:13, color:"#e2e8f0", lineHeight:1.55, whiteSpace:"pre-wrap" }}><Linkify>{r.text}</Linkify></div>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:6, flexWrap:"wrap" }}>
              <button onClick={() => gostar(r)} style={{ background:"none", border:"none", padding:0, cursor:"pointer", fontSize:12, color: gosteiEu ? "#f43f5e" : TXT_MUT }}>
                ❤️ {(r.likedBy || []).length || ""}
              </button>
              <button onClick={() => { setComentarAberto(aberto ? null : r.username); setTextoComentario(""); }} style={{ background:"none", border:"none", padding:0, cursor:"pointer", fontSize:11, fontWeight:700, color: aberto ? CYN : TXT_MUT }}>
                💬 {coms.length ? `${coms.length} ` : ""}Comentar
              </button>
              {minhaEsta && !editar && (
                <>
                  <button onClick={() => { setEditar(true); setTexto(r.text); }} style={{ background:"none", border:"none", padding:0, cursor:"pointer", fontSize:11, color:TXT_MUT }}>✏️ Editar</button>
                  <button onClick={apagarMinha} style={{ background:"none", border:"none", padding:0, cursor:"pointer", fontSize:11, color:"#f43f5e" }}>🗑️</button>
                </>
              )}
            </div>

            {(coms.length > 0 || aberto) && (
              <div style={{ marginTop:8, paddingLeft:10, borderLeft:"2px solid rgba(255,255,255,0.07)" }}>
                {coms.map(c => (
                  <div key={c.id} style={{ marginBottom:6 }}>
                    <span style={{ fontSize:11, fontWeight:800, color:c.color }}>{c.user}</span>
                    <span style={{ fontSize:10, color:TXT_MUT }}> · {c.time}</span>
                    {(c.username === user.username || ehAdmin) && (
                      <button onClick={() => apagarComentario(r, c)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:10, color:"#f43f5e", marginLeft:4 }}>🗑️</button>
                    )}
                    <div style={{ fontSize:12, color:"#cbd5e1", lineHeight:1.45 }}><Linkify>{c.text}</Linkify></div>
                  </div>
                ))}
                {aberto && (
                  <div style={{ display:"flex", gap:6, marginTop:4 }}>
                    <input value={textoComentario} onChange={e => setTextoComentario(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); comentar(r); } }}
                      placeholder={`Comenta a resposta de ${r.user}…`}
                      style={{ ...INP, flex:1, marginBottom:0, padding:"8px 12px", fontSize:12 }} />
                    <button onClick={() => comentar(r)} style={{ background:CYN, border:"none", borderRadius:10, padding:"0 12px", fontWeight:900, cursor:"pointer", color:"#0f172a" }}>↑</button>
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
