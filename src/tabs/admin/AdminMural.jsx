import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase.js";
import { CARD, SL, CYN, PNK, INP } from "../../theme.jsx";
import { nowLabel, nowFull, CHANNELS, JEEP_LIST, FORUM_REACTIONS, ALLOWED_USERNAMES } from "../../data.js";

export default function AdminMural() {
  const [subtab, setSubtab] = useState("forum");

  // ── FORUM ──
  const [channel, setChannel] = useState("anuncios");
  const [posts, setPosts] = useState([]);
  const [fPost, setFPost] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [replyTxt, setReplyTxt] = useState("");
  const [notificarForum, setNotificarForum] = useState(true);

  // ── RECURSOS ──
  const [recursos, setRecursos] = useState([]);
  const [rTitulo, setRTitulo] = useState("");
  const [rIcone, setRIcone] = useState("📄");
  const [rUrl, setRUrl] = useState("");
  const [rDesc, setRDesc] = useState("");
  const [notificarRecurso, setNotificarRecurso] = useState(true);
  const [enviandoR, setEnviandoR] = useState(false);

  useEffect(() => {
    return onSnapshot(collection(db, "forum", channel, "posts"), snap =>
      setPosts(snap.docs.map(d => ({ id:d.id, ...d.data() })))
    );
  }, [channel]);

  useEffect(() => {
    return onSnapshot(collection(db, "recursos"), snap =>
      setRecursos(snap.docs.map(d => ({ id:d.id, ...d.data() })).sort((a,b) => (a.ts||0)-(b.ts||0)))
    );
  }, []);

  async function notificarTodos(texto) {
    await Promise.all(ALLOWED_USERNAMES.map(u =>
      addDoc(collection(db, "notifications", u, "items"), {
        from:"teresa", text:texto, date:nowFull(), read:false
      })
    ));
  }

  // ── PUBLICAR POST ──
  async function postForum() {
    if (!fPost.trim() && !mediaFile) return;
    setIsUploading(true);
    let mediaUrl = null;
    try {
      if (mediaFile) {
        const fileRef = ref(storage, "forum/" + Date.now() + "_" + mediaFile.name);
        await uploadBytes(fileRef, mediaFile);
        mediaUrl = await getDownloadURL(fileRef);
      }
      await addDoc(collection(db, "forum", channel, "posts"), {
        user:"Teresa (GO)", username:"admin", color:"#22d3ee",
        text:fPost, media:mediaUrl, time:nowLabel(),
        reactions:{ heart:0, fire:0, clap:0, think:0 }, reactedBy:{}, replies:[]
      });
      if (notificarForum && fPost.trim()) {
        const ch = CHANNELS.find(c => c.id === channel);
        const preview = fPost.trim().substring(0, 80);
        const label = ch?.label || channel;
        await notificarTodos(`📢 ${channel === "anuncios" ? "Novo anúncio" : `Nova publicação em ${label}`}: ${preview}`);
      }
      setFPost(""); setMediaFile(null);
    } catch(e) { alert("Erro: " + e.message); }
    setIsUploading(false);
  }

  async function reagirPost(pid, reactionId) {
    const p = posts.find(x => x.id === pid);
    if (!p) return;
    const rcts = { ...p.reactions };
    const rBy  = { ...p.reactedBy };
    const users = rBy[reactionId] || [];
    if (users.includes("admin")) {
      rcts[reactionId] = Math.max(0, (rcts[reactionId] || 1) - 1);
      rBy[reactionId]  = users.filter(u => u !== "admin");
    } else {
      rcts[reactionId] = (rcts[reactionId] || 0) + 1;
      rBy[reactionId]  = [...users, "admin"];
    }
    await updateDoc(doc(db, "forum", channel, "posts", pid), { reactions: rcts, reactedBy: rBy });
  }

  async function deleteForumPost(pid) {
    if (window.confirm("Apagar este post e todos os seus comentários?"))
      await deleteDoc(doc(db, "forum", channel, "posts", pid));
  }

  async function sendReply(pid) {
    if (!replyTxt.trim()) return;
    const cur = posts.find(p => p.id === pid);
    if (!cur) return;
    await updateDoc(doc(db, "forum", channel, "posts", pid), {
      replies:[...cur.replies, { id:"R_"+Date.now(), user:"Teresa (GO)", username:"admin", color:"#22d3ee", text:replyTxt, time:nowLabel() }]
    });
    setReplyTxt(""); setReplyTo(null);
  }

  async function deleteReply(pid, rp) {
    if (!window.confirm("Apagar este comentário?")) return;
    const cur = posts.find(p => p.id === pid);
    if (!cur) return;
    await updateDoc(doc(db, "forum", channel, "posts", pid), {
      replies: cur.replies.filter(r => r.id ? r.id !== rp.id : r !== rp)
    });
  }

  // ── ADICIONAR RECURSO ──
  async function adicionarRecurso() {
    if (!rTitulo.trim() || !rUrl.trim()) return alert("Título e URL são obrigatórios.");
    setEnviandoR(true);
    try {
      await addDoc(collection(db, "recursos"), {
        titulo:rTitulo.trim(), icone:rIcone.trim()||"📄",
        url:rUrl.trim(), desc:rDesc.trim(), ts:Date.now(), addedAt:nowFull()
      });
      if (notificarRecurso)
        await notificarTodos(`📚 Novo recurso disponível: ${rTitulo.trim().substring(0,60)}`);
      setRTitulo(""); setRUrl(""); setRDesc(""); setRIcone("📄");
    } catch(e) { alert("Erro: " + e.message); }
    setEnviandoR(false);
  }

  async function eliminarRecurso(id) {
    if (window.confirm("Eliminar este recurso?"))
      await deleteDoc(doc(db, "recursos", id));
  }

  const activeChannelInfo = CHANNELS.find(c => c.id === channel);

  return (
    <div>
      {/* SUB-TABS */}
      <div style={{ display:"flex", gap:0, marginBottom:16, background:"rgba(0,0,0,0.3)", borderRadius:14, padding:4 }}>
        {[["forum","🌐 Fórum"],["recursos","📚 Recursos"]].map(([id,label]) => (
          <button key={id} onClick={() => setSubtab(id)} style={{
            flex:1, padding:"9px", borderRadius:10, border:"none", cursor:"pointer",
            background: subtab===id ? `${CYN}20` : "transparent",
            color: subtab===id ? CYN : "#94a3b8", fontWeight:800, fontSize:13,
            boxShadow: subtab===id ? `0 0 0 1px ${CYN}35` : "none",
          }}>{label}</button>
        ))}
      </div>

      {subtab === "forum" && (
        <>
          {/* CANAIS */}
          <div style={{ display:"flex", gap:6, marginBottom:12, overflowX:"auto", paddingBottom:6 }}>
            {CHANNELS.map(ch => {
              const isA = channel === ch.id;
              return (
                <button key={ch.id} onClick={() => setChannel(ch.id)} style={{
                  display:"flex", alignItems:"center", gap:5, padding:"8px 13px",
                  borderRadius:20, border:isA?`1px solid ${CYN}`:"1px solid rgba(255,255,255,0.1)",
                  background:isA?"rgba(34,211,238,0.15)":"rgba(255,255,255,0.05)",
                  fontSize:12, fontWeight:700, cursor:"pointer", color:isA?CYN:"#94a3b8", whiteSpace:"nowrap"
                }}>
                  {ch.icon} {ch.label}
                </button>
              );
            })}
          </div>

          {/* PUBLICAR */}
          <div style={CARD}>
            <textarea value={fPost} onChange={e => setFPost(e.target.value)}
              placeholder={`Publicar no canal ${activeChannelInfo?.label}...`} rows={2}
              style={{ ...INP, marginBottom:8, resize:"none" }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#94a3b8", cursor:"pointer" }}>
                <input type="checkbox" checked={notificarForum} onChange={() => setNotificarForum(v => !v)}
                  style={{ accentColor:CYN, width:14, height:14 }} />
                Notificar todos os jovens
              </label>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <input type="file" accept="image/*" onChange={e => { if(e.target.files[0]) setMediaFile(e.target.files[0]); }}
                  style={{ fontSize:11, color:"#94a3b8", maxWidth:140 }}/>
                <button onClick={postForum} disabled={isUploading} style={{
                  background:CYN, color:"#0f172a", border:"none", borderRadius:12,
                  padding:"8px 18px", fontWeight:800, cursor:"pointer", fontSize:13
                }}>
                  {isUploading ? "A carregar..." : "Publicar"}
                </button>
              </div>
            </div>
          </div>

          {/* POSTS */}
          {posts.slice().reverse().map(p => (
            <div key={p.id} style={CARD}>
              <div style={{ display:"flex", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,${p.color},#000)`,
                  display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:13, fontWeight:800, flexShrink:0 }}>
                  {(p.user||"?")[0]}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:13, fontWeight:700 }}>
                      {p.user}
                      {(p.user==="Teresa (GO)"||p.username==="admin") &&
                        <span style={{ fontSize:9, background:CYN, color:"#0f172a", padding:"2px 6px", borderRadius:6, marginLeft:6 }}>ADMIN</span>}
                    </span>
                    <span style={{ fontSize:11, color:"#94a3b8" }}>{p.time}</span>
                  </div>
                  {p.text && <div style={{ fontSize:13, color:"#cbd5e1", marginTop:4, lineHeight:1.55 }}>{p.text}</div>}
                  {p.media && <img src={p.media} alt="" style={{ maxWidth:"100%", borderRadius:12, marginTop:8, border:"1px solid rgba(255,255,255,0.1)" }}/>}

                  <div style={{ marginTop:10, display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                    {FORUM_REACTIONS.map(r => {
                      const count = ((p.reactions||{})[r.id]||0);
                      const who   = ((p.reactedBy||{})[r.id]||[]);
                      const mine  = who.includes("admin");
                      return (
                        <button key={r.id} onClick={() => reagirPost(p.id, r.id)}
                          title={who.length ? who.join(", ") : r.id}
                          style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px",
                            borderRadius:20, border:"none", cursor:"pointer", transition:"all 0.15s",
                            background: mine ? `${CYN}15` : "rgba(255,255,255,0.04)",
                            color: mine ? CYN : "#94a3b8", fontSize:12,
                            boxShadow: mine ? `0 0 0 1px ${CYN}30` : "none",
                          }}>
                          <span>{r.icon}</span>
                          {count > 0 && <span style={{ fontWeight:800 }}>{count}</span>}
                          {who.filter(u => u !== "admin").length > 0 && (
                            <span style={{ fontSize:10, color:"#60a5fa" }}>{who.filter(u => u !== "admin").join(", ")}</span>
                          )}
                        </button>
                      );
                    })}
                    <span onClick={() => setReplyTo(replyTo===p.id?null:p.id)}
                      style={{ fontSize:12, color:"#94a3b8", cursor:"pointer", fontWeight:600 }}>💬 Responder</span>
                    {(p.replies||[]).length > 0 && (
                      <span onClick={() => setExpanded(expanded===p.id?null:p.id)}
                        style={{ fontSize:12, color:CYN, fontWeight:700, cursor:"pointer" }}>
                        {expanded===p.id ? "▲" : "▼"} {p.replies.length}
                      </span>
                    )}
                    <span onClick={() => deleteForumPost(p.id)}
                      style={{ fontSize:12, color:PNK, cursor:"pointer", marginLeft:"auto" }}>🗑️ Apagar</span>
                  </div>
                </div>
              </div>

              {expanded===p.id && (p.replies||[]).length > 0 && (
                <div style={{ marginTop:10, marginLeft:46, borderLeft:"2px solid rgba(255,255,255,0.08)", paddingLeft:12 }}>
                  {p.replies.map((rp, ri) => (
                    <div key={rp.id||ri} style={{ display:"flex", gap:8, marginBottom:10, alignItems:"flex-start" }}>
                      <div style={{ width:26, height:26, borderRadius:"50%", background:`linear-gradient(135deg,${rp.color||CYN},#000)`,
                        display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:10, fontWeight:800, flexShrink:0 }}>
                        {(rp.user||"?")[0]}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <span style={{ fontSize:12, fontWeight:700 }}>{rp.user}
                            <span style={{ color:"#94a3b8", fontWeight:400 }}> · {rp.time}</span>
                          </span>
                          <button onClick={() => deleteReply(p.id, rp)}
                            style={{ background:"none", border:"none", color:PNK, cursor:"pointer", fontSize:12 }}>🗑️</button>
                        </div>
                        <div style={{ fontSize:12, color:"#cbd5e1", marginTop:2 }}>{rp.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {replyTo===p.id && (
                <div style={{ marginTop:10, marginLeft:46, display:"flex", gap:8 }}>
                  <input value={replyTxt} onChange={e => setReplyTxt(e.target.value)}
                    onKeyDown={e => e.key==="Enter" && sendReply(p.id)}
                    placeholder="Escreve uma resposta..." autoFocus
                    style={{ ...INP, flex:1, marginBottom:0, fontSize:12, padding:"8px 12px" }} />
                  <button onClick={() => sendReply(p.id)}
                    style={{ background:CYN, color:"#0f172a", border:"none", borderRadius:20, padding:"9px 16px", fontSize:12, cursor:"pointer", fontWeight:800 }}>↑</button>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {subtab === "recursos" && (
        <>
          {/* ADICIONAR RECURSO */}
          <div style={{ ...CARD, border:`1.5px solid ${CYN}25` }}>
            <div style={SL}>Adicionar Recurso</div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={rIcone} onChange={e => setRIcone(e.target.value)} maxLength={4}
                placeholder="📄" style={{ ...INP, width:56, flex:"none", textAlign:"center", fontSize:18, padding:"10px 6px" }} />
              <input value={rTitulo} onChange={e => setRTitulo(e.target.value)}
                placeholder="Título" style={{ ...INP, flex:1 }} />
            </div>
            <input value={rUrl} onChange={e => setRUrl(e.target.value)}
              placeholder="URL (https://... ou ficheiro.html)" style={{ ...INP }} />
            <input value={rDesc} onChange={e => setRDesc(e.target.value)}
              placeholder="Descrição curta (opcional)" style={{ ...INP }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:4 }}>
              <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#94a3b8", cursor:"pointer" }}>
                <input type="checkbox" checked={notificarRecurso} onChange={() => setNotificarRecurso(v => !v)}
                  style={{ accentColor:CYN, width:14, height:14 }} />
                Notificar todos os jovens
              </label>
              <button onClick={adicionarRecurso} disabled={enviandoR} style={{
                background:`${CYN}20`, border:`1.5px solid ${CYN}40`, color:CYN,
                borderRadius:12, padding:"9px 20px", fontWeight:900, fontSize:13, cursor:"pointer"
              }}>
                {enviandoR ? "A adicionar..." : "Adicionar"}
              </button>
            </div>
          </div>

          {/* LISTA DE RECURSOS */}
          {recursos.length === 0 ? (
            <div style={{ textAlign:"center", padding:"30px 20px", color:"#475569", fontSize:13 }}>
              Ainda não há recursos. Adiciona o primeiro acima.
            </div>
          ) : recursos.map(r => (
            <div key={r.id} style={{ ...CARD, display:"flex", alignItems:"flex-start", gap:12 }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{r.icone||"📄"}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:800, color:"#f1f5f9", marginBottom:2 }}>{r.titulo}</div>
                {r.desc && <div style={{ fontSize:12, color:"#94a3b8", marginBottom:4 }}>{r.desc}</div>}
                <div style={{ fontSize:11, color:`${CYN}90`, wordBreak:"break-all" }}>{r.url}</div>
              </div>
              <button onClick={() => eliminarRecurso(r.id)} style={{
                background:"rgba(244,63,94,0.10)", border:"none", color:PNK,
                borderRadius:10, padding:"6px 10px", cursor:"pointer", fontSize:12, flexShrink:0
              }}>🗑️</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
