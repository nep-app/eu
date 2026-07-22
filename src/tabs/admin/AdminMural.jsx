import React, { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase.js";
import { CARD, SL, CYN, PNK, INP } from "../../theme.jsx";
import { nowLabel, nowFull, CHANNELS, JEEP_LIST, FORUM_REACTIONS, ALLOWED_USERNAMES } from "../../data.js";
import Agendador from "./Agendador.jsx";

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
  const [whoOpen, setWhoOpen] = useState(null);
  const [notificarForum, setNotificarForum] = useState(true);
  const [pushForumPost,  setPushForumPost]  = useState(false);
  const [fTarget, setFTarget] = useState("all"); // "all" ou "teresa" (post de teste)
  const [mencaoDropdown, setMencaoDropdown] = useState(false);
  const [mencaoFiltro,   setMencaoFiltro]   = useState("");
  const [mencaoStart,    setMencaoStart]    = useState(0);
  const fPostRef = useRef(null);

  // ── RECURSOS ──
  const [recursos, setRecursos] = useState([]);
  const [rTitulo, setRTitulo] = useState("");
  const [rIcone, setRIcone] = useState("📄");
  const [rUrl, setRUrl] = useState("");
  const [rDesc, setRDesc] = useState("");
  const [rFile, setRFile] = useState(null);      // ficheiro a carregar (PDF, etc.)
  const [rTarget, setRTarget] = useState("all"); // "all" ou username de um jovem
  const [notificarRecurso, setNotificarRecurso] = useState(true);
  const [pushRecurso,      setPushRecurso]      = useState(false);
  const [enviandoR, setEnviandoR] = useState(false);
  const [editandoR, setEditandoR] = useState(null);
  const [editRDraft, setEditRDraft] = useState({});

  useEffect(() => {
    return onSnapshot(collection(db, "forum", channel, "posts"), snap =>
      setPosts(snap.docs.map(d => ({ id:d.id, ...d.data() })))
    );
  }, [channel]);

  useEffect(() => {
    return onSnapshot(collection(db, "recursos"), snap =>
      setRecursos(snap.docs.map(d => ({ id:d.id, ...d.data() })).sort((a,b) => (b.ts||0)-(a.ts||0)))
    );
  }, []);

  async function notificarTodos(texto, canal = null, push = false) {
    await Promise.all(
      ALLOWED_USERNAMES
        .filter(u => u !== "ricardo")
        .map(u => addDoc(collection(db, "notifications", u, "items"), {
          from:"teresa", text:texto, date:nowFull(), read:false, ts:Date.now(), push,
          ...(canal ? { canal } : {}),
        }))
    );
  }

  const mencaoCandidatos = JEEP_LIST
    .filter(j => j.username !== "demo" && j.username !== "ricardo")
    .filter(j => !mencaoFiltro || j.username.toLowerCase().includes(mencaoFiltro) || j.name.toLowerCase().includes(mencaoFiltro))
    .slice(0, 5);

  function handleFPostChange(e) {
    const val = e.target.value;
    setFPost(val);
    const cursor = e.target.selectionStart;
    const antes = val.substring(0, cursor);
    const match = antes.match(/@(\w*)$/);
    if (match) {
      setMencaoDropdown(true);
      setMencaoFiltro(match[1].toLowerCase());
      setMencaoStart(cursor - match[0].length);
    } else {
      setMencaoDropdown(false);
    }
  }

  function selecionarMencao(username) {
    const antes = fPost.substring(0, mencaoStart);
    const depois = fPost.substring(mencaoStart).replace(/^@\w*/, "");
    const novo = antes + "@" + username + " " + depois;
    setFPost(novo);
    setMencaoDropdown(false);
    setTimeout(() => {
      if (fPostRef.current) {
        const pos = mencaoStart + username.length + 2;
        fPostRef.current.focus();
        fPostRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
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
      const docRef = await addDoc(collection(db, "forum", channel, "posts"), {
        user:"Teresa (GO)", username:"admin", color:"#22d3ee",
        text:fPost, media:mediaUrl, time:nowFull(), ts:Date.now(),
        ...(fTarget !== "all" ? { target: fTarget } : {}),
        reactions:{ heart:0, fire:0, clap:0, think:0 }, reactedBy:{}, replies:[]
      });
      // Post de teste (só para a Teresa) não notifica ninguém.
      if (notificarForum && fPost.trim() && fTarget === "all") {
        const ch = CHANNELS.find(c => c.id === channel);
        const preview = fPost.trim().substring(0, 80);
        const label = ch?.label || channel;
        await notificarTodos(`${ch?.icon || "🌐"} Teresa publicou em ${label}: "${preview}${fPost.length > 80 ? "…" : ""}"`, channel, pushForumPost);
      }
      // @menções → ação pendente
      const mencoes = [...fPost.matchAll(/@(\w+)/g)]
        .map(m => m[1].toLowerCase())
        .filter((u, i, arr) => arr.indexOf(u) === i)
        .filter(u => ALLOWED_USERNAMES.includes(u));
      const chInfo = CHANNELS.find(c => c.id === channel);
      await Promise.all(mencoes.map(u =>
        addDoc(collection(db, "notifications", u, "items"), {
          from: "admin",
          text: `🔔 Teresa mencionou-te em ${chInfo?.label || channel}!`,
          date: nowFull(), read: false, ts: Date.now(),
          mencao: true, postId: docRef.id, canal: channel, push: true
        })
      ));
      setFPost(""); setMediaFile(null); setMencaoDropdown(false); setPushForumPost(false); setFTarget("all");
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
      replies:[...cur.replies, { id:"R_"+Date.now(), user:"Teresa (GO)", username:"admin", color:"#22d3ee", text:replyTxt, time:nowFull() }]
    });
    // Avisar o autor (se for jovem) que a Teresa respondeu — com push.
    if (cur.username && cur.username !== "admin" && cur.username !== "demo" && ALLOWED_USERNAMES.includes(cur.username)) {
      const ch = CHANNELS.find(c => c.id === channel);
      await addDoc(collection(db, "notifications", cur.username, "items"), {
        from: "admin",
        text: `🔔 Teresa respondeu à tua partilha em ${ch?.label || channel}`,
        date: nowFull(), read: false, ts: Date.now(), canal: channel, push: true,
      });
    }
    setReplyTxt(""); setReplyTo(null);
  }

  async function reagirReply(pid, replyId) {
    const cur = posts.find(p => p.id === pid);
    if (!cur) return;
    const updReplies = cur.replies.map(r => {
      if (r.id !== replyId) return r;
      const liked = (r.likedBy || []).includes("admin");
      return {
        ...r,
        likes: liked ? Math.max(0, (r.likes || 1) - 1) : (r.likes || 0) + 1,
        likedBy: liked ? (r.likedBy || []).filter(u => u !== "admin") : [...(r.likedBy || []), "admin"],
      };
    });
    await updateDoc(doc(db, "forum", channel, "posts", pid), { replies: updReplies });
  }

  function responderAReply(pid, replyUser) {
    setReplyTxt(`@${replyUser} `);
    setReplyTo(pid);
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
    if (!rTitulo.trim()) return alert("O título é obrigatório.");
    if (!rUrl.trim() && !rFile) return alert("Indica um URL ou escolhe um ficheiro para carregar.");
    setEnviandoR(true);
    try {
      let url = rUrl.trim();
      if (rFile) {
        const fileRef = ref(storage, `recursos/${Date.now()}_${rFile.name}`);
        await uploadBytes(fileRef, rFile);
        url = await getDownloadURL(fileRef);
      }
      await addDoc(collection(db, "recursos"), {
        titulo:rTitulo.trim(), icone:rIcone.trim()||"📄",
        url, desc:rDesc.trim(), target:rTarget, ts:Date.now(), addedAt:nowFull()
      });
      if (notificarRecurso) {
        const texto = `📚 Novo recurso disponível: ${rTitulo.trim().substring(0,60)}`;
        if (rTarget === "all") {
          await notificarTodos(texto, null, pushRecurso);
        } else {
          await addDoc(collection(db, "notifications", rTarget, "items"), {
            from:"teresa", text:texto, date:nowFull(), read:false, ts:Date.now(), push:pushRecurso, tipo:"recurso",
          });
        }
      }
      setRTitulo(""); setRUrl(""); setRDesc(""); setRIcone("📄"); setPushRecurso(false); setRFile(null); setRTarget("all");
    } catch(e) { alert("Erro: " + e.message); }
    setEnviandoR(false);
  }

  async function eliminarRecurso(id) {
    if (window.confirm("Eliminar este recurso?"))
      await deleteDoc(doc(db, "recursos", id));
  }

  // Reordenar recursos: troca o 'ts' com o recurso vizinho (a lista ordena
  // por ts decrescente, por isso trocar o ts troca as posições).
  async function moverRecurso(r, dir) {
    const i = recursos.findIndex(x => x.id === r.id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= recursos.length) return;
    const outro = recursos[j];
    const tsA = r.ts || 0, tsB = outro.ts || 0;
    // Se tiverem o mesmo ts, dá um pequeno desvio para garantir a troca.
    const novoA = tsB === tsA ? tsA + (dir === "up" ? 1 : -1) : tsB;
    await Promise.all([
      updateDoc(doc(db, "recursos", r.id), { ts: novoA }),
      updateDoc(doc(db, "recursos", outro.id), { ts: tsA }),
    ]);
  }

  async function guardarEdicaoRecurso(id) {
    if (!editRDraft.titulo?.trim() || !editRDraft.url?.trim()) return alert("Título e URL são obrigatórios.");
    try {
      await updateDoc(doc(db, "recursos", id), {
        titulo: editRDraft.titulo.trim(),
        icone: editRDraft.icone?.trim() || "📄",
        url: editRDraft.url.trim(),
        desc: (editRDraft.desc || "").trim(),
      });
      setEditandoR(null);
    } catch(e) { alert("Erro: " + e.message); }
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
            <div style={{ position:"relative" }}>
              <textarea ref={fPostRef} value={fPost} onChange={handleFPostChange}
                onBlur={() => setTimeout(() => setMencaoDropdown(false), 150)}
                placeholder={`Publicar no canal ${activeChannelInfo?.label}... (@ para mencionar)`} rows={2}
                style={{ ...INP, marginBottom:8, resize:"none" }} />
              {mencaoDropdown && mencaoCandidatos.length > 0 && (
                <div style={{
                  position:"absolute", top:"calc(100% - 8px)", left:0, right:0, zIndex:50,
                  background:"#1e293b", border:"1px solid rgba(255,255,255,0.12)",
                  borderRadius:12, overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.5)",
                }}>
                  {mencaoCandidatos.map(j => (
                    <div key={j.username} onMouseDown={() => selecionarMencao(j.username)} style={{
                      display:"flex", alignItems:"center", gap:10, padding:"10px 14px", cursor:"pointer",
                      borderBottom:"1px solid rgba(255,255,255,0.05)",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ width:26, height:26, borderRadius:8, background:`linear-gradient(135deg,${j.color},${j.color}66)`,
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#0f172a" }}>
                        {j.name[0]}
                      </div>
                      <div>
                        <div style={{ fontSize:12, fontWeight:800, color:j.color }}>{j.name}</div>
                        <div style={{ fontSize:10, color:"#64748b" }}>@{j.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {channel === "anuncios" && (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8, padding:"8px 10px", background:"rgba(255,196,61,0.06)", border:"1px solid rgba(255,196,61,0.2)", borderRadius:10 }}>
                <span style={{ fontSize:11, fontWeight:800, color:"#94a3b8", flexShrink:0 }}>Quem vê:</span>
                {[["all","👥 Todos"],["teresa","🧪 Só teste (Teresa)"]].map(([val,lbl]) => (
                  <button key={val} onClick={() => setFTarget(val)} style={{
                    fontSize:11, fontWeight:800, cursor:"pointer", borderRadius:8, padding:"4px 10px",
                    border: fTarget === val ? "1.5px solid #fbbf24" : "1px solid rgba(255,255,255,0.1)",
                    background: fTarget === val ? "rgba(251,191,36,0.16)" : "rgba(255,255,255,0.03)",
                    color: fTarget === val ? "#fbbf24" : "#94a3b8",
                  }}>{lbl}</button>
                ))}
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:8, opacity: fTarget === "all" ? 1 : 0.4 }}>
              <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#94a3b8", cursor: fTarget === "all" ? "pointer" : "not-allowed" }}>
                <input type="checkbox" checked={notificarForum && fTarget === "all"} disabled={fTarget !== "all"} onChange={() => setNotificarForum(v => !v)}
                  style={{ accentColor:CYN, width:14, height:14 }} />
                Notificar todos os jovens {fTarget !== "all" && "(desligado no modo teste)"}
              </label>
              {notificarForum && (
                <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:11, color:"#94a3b8", cursor:"pointer", marginLeft:21 }}>
                  <input type="checkbox" checked={pushForumPost} onChange={() => setPushForumPost(v => !v)}
                    style={{ accentColor:CYN, width:13, height:13 }} />
                  🔔 Enviar também como notificação push
                </label>
              )}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
              <input type="file" accept="image/*" onChange={e => { if(e.target.files[0]) setMediaFile(e.target.files[0]); }}
                style={{ fontSize:11, color:"#94a3b8" }}/>
            </div>
            <Agendador
              tipo="forum"
              rotuloJa={isUploading ? "A carregar..." : "Publicar"}
              publicarJa={postForum}
              construirPayload={() => {
                if (!fPost.trim()) { alert("Escreve algo para publicar."); return null; }
                if (mediaFile) { alert("Agendar posts com foto ainda não é suportado. Publica já, ou agenda sem foto."); return null; }
                return { canal: channel, texto: fPost.trim(), push: pushForumPost };
              }}
              rotuloItem={p => `#${p.canal}: ${p.texto}`}
              onAgendado={() => { setFPost(""); setMediaFile(null); setPushForumPost(false); }}
            />
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
                      const count  = ((p.reactions||{})[r.id]||0);
                      const who    = ((p.reactedBy||{})[r.id]||[]);
                      const mine   = who.includes("admin");
                      const key    = `${p.id}_${r.id}`;
                      const isOpen = whoOpen === key;
                      return (
                        <div key={r.id} style={{ position:"relative" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:1,
                            borderRadius:20, overflow:"hidden",
                            boxShadow: mine ? `0 0 0 1px ${CYN}30` : "none",
                            background: mine ? `${CYN}15` : "rgba(255,255,255,0.04)",
                          }}>
                            <button onClick={() => reagirPost(p.id, r.id)} style={{
                              display:"flex", alignItems:"center", gap:3, padding:"4px 8px 4px 10px",
                              border:"none", cursor:"pointer", background:"transparent",
                              color: mine ? CYN : "#94a3b8", fontSize:12,
                            }}>
                              <span>{r.icon}</span>
                            </button>
                            {count > 0 && (
                              <button onClick={() => setWhoOpen(isOpen ? null : key)} style={{
                                padding:"4px 10px 4px 2px", border:"none", cursor:"pointer",
                                background:"transparent", color: mine ? CYN : "#94a3b8",
                                fontSize:12, fontWeight:800,
                              }}>{count}</button>
                            )}
                          </div>
                          {isOpen && who.length > 0 && (
                            <div style={{
                              position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:10,
                              background:"#1e293b", border:"1px solid rgba(255,255,255,0.12)",
                              borderRadius:10, padding:"8px 12px", whiteSpace:"nowrap",
                              fontSize:11, color:"#e2e8f0", boxShadow:"0 8px 24px rgba(0,0,0,0.4)",
                            }}>
                              {who.map(u => u === "admin" ? "Teresa (tu)" : u).join(", ")}
                            </div>
                          )}
                        </div>
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
                    <span onClick={async () => {
                      const ch = CHANNELS.find(c => c.id === channel);
                      const label = ch?.label || channel;
                      const preview = (p.text||"").trim().substring(0, 80);
                      const nome = p.username === "admin" ? "Teresa (GO)" : (p.user || p.username);
                      await notificarTodos(`${ch?.icon || "🌐"} ${nome} publicou em ${label}${preview ? `: "${preview}${p.text.length > 80 ? "…" : ""}"` : ""}`, channel, true);
                      alert("Notificação enviada a todos (com push)! ✅");
                    }} style={{ fontSize:12, color:CYN, cursor:"pointer", fontWeight:700 }}>🔔 Notificar</span>
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
                        <div style={{ display:"flex", gap:10, marginTop:4 }}>
                          <button onClick={() => reagirReply(p.id, rp.id)} style={{
                            background:"none", border:"none", cursor:"pointer", padding:0,
                            fontSize:11, color:(rp.likedBy||[]).includes("admin") ? "#f43f5e" : "#64748b",
                          }}>❤️ {rp.likes > 0 ? rp.likes : ""}</button>
                          <button onClick={() => responderAReply(p.id, rp.user)} style={{
                            background:"none", border:"none", cursor:"pointer", padding:0,
                            fontSize:11, color:"#64748b", fontWeight:700,
                          }}>↩ Responder</button>
                        </div>
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
              placeholder="URL (https://...) — ou carrega um ficheiro em baixo" style={{ ...INP }} />
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, flexWrap:"wrap" }}>
              <span style={{ fontSize:11, color:"#94a3b8", fontWeight:700 }}>📎 Ficheiro (PDF, imagem):</span>
              <input type="file" accept="application/pdf,image/*"
                onChange={e => setRFile(e.target.files?.[0] || null)}
                style={{ fontSize:11, color:"#94a3b8", flex:1, minWidth:140 }} />
            </div>
            <input value={rDesc} onChange={e => setRDesc(e.target.value)}
              placeholder="Descrição curta (opcional)" style={{ ...INP }} />
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, color:CYN, fontWeight:800, marginBottom:5 }}>PARA QUEM:</div>
              <select value={rTarget} onChange={e => setRTarget(e.target.value)}
                style={{ width:"100%", padding:12, borderRadius:12, background:"rgba(0,0,0,0.3)", color:"white", border:"1px solid rgba(255,255,255,0.1)", fontSize:13 }}>
                <option value="all">👥 Todos os jovens</option>
                {JEEP_LIST.filter(j => ALLOWED_USERNAMES.includes(j.username) && j.username !== "demo").map(j =>
                  <option key={j.username} value={j.username}>Só {j.name}</option>
                )}
              </select>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:4, marginBottom:10 }}>
              <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#94a3b8", cursor:"pointer" }}>
                <input type="checkbox" checked={notificarRecurso} onChange={() => setNotificarRecurso(v => !v)}
                  style={{ accentColor:CYN, width:14, height:14 }} />
                {rTarget === "all" ? "Notificar todos os jovens" : "Notificar o destinatário"}
              </label>
              {notificarRecurso && (
                <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:11, color:"#94a3b8", cursor:"pointer", marginLeft:21 }}>
                  <input type="checkbox" checked={pushRecurso} onChange={() => setPushRecurso(v => !v)}
                    style={{ accentColor:CYN, width:13, height:13 }} />
                  🔔 Enviar também como notificação push
                </label>
              )}
            </div>
            <button onClick={adicionarRecurso} disabled={enviandoR} style={{
              width:"100%", background:`${CYN}20`, border:`1.5px solid ${CYN}40`, color:CYN,
              borderRadius:12, padding:"9px 20px", fontWeight:900, fontSize:13, cursor:"pointer"
            }}>
              {enviandoR ? "A adicionar..." : "Adicionar"}
            </button>
          </div>

          {/* LISTA DE RECURSOS */}
          {recursos.length === 0 ? (
            <div style={{ textAlign:"center", padding:"30px 20px", color:"#475569", fontSize:13 }}>
              Ainda não há recursos. Adiciona o primeiro acima.
            </div>
          ) : recursos.map(r => (
            <div key={r.id} style={CARD}>
              {editandoR === r.id ? (
                <div>
                  <div style={{ display:"flex", gap:8 }}>
                    <input value={editRDraft.icone} onChange={e => setEditRDraft(p => ({ ...p, icone: e.target.value }))}
                      maxLength={4} style={{ ...INP, width:56, flex:"none", textAlign:"center", fontSize:18, padding:"10px 6px" }} />
                    <input value={editRDraft.titulo} onChange={e => setEditRDraft(p => ({ ...p, titulo: e.target.value }))}
                      placeholder="Título" style={{ ...INP, flex:1 }} />
                  </div>
                  <input value={editRDraft.url} onChange={e => setEditRDraft(p => ({ ...p, url: e.target.value }))}
                    placeholder="URL" style={INP} />
                  <input value={editRDraft.desc} onChange={e => setEditRDraft(p => ({ ...p, desc: e.target.value }))}
                    placeholder="Descrição (opcional)" style={INP} />
                  <div style={{ display:"flex", gap:8, marginTop:4 }}>
                    <button onClick={() => guardarEdicaoRecurso(r.id)} style={{
                      flex:1, padding:"9px", background:`${CYN}20`, border:`1.5px solid ${CYN}40`,
                      color:CYN, borderRadius:10, fontWeight:900, fontSize:13, cursor:"pointer"
                    }}>Guardar</button>
                    <button onClick={() => setEditandoR(null)} style={{
                      padding:"9px 16px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                      color:"#94a3b8", borderRadius:10, fontSize:13, cursor:"pointer"
                    }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{r.icone||"📄"}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:800, color:"#f1f5f9", marginBottom:2 }}>{r.titulo}</div>
                    {r.target && r.target !== "all" && (
                      <div style={{ display:"inline-block", fontSize:10, fontWeight:800, color:PNK, background:"rgba(236,72,153,0.12)", border:"1px solid rgba(236,72,153,0.3)", borderRadius:8, padding:"2px 7px", marginBottom:4 }}>
                        🔒 Só para {JEEP_LIST.find(j => j.username === r.target)?.name || r.target}
                      </div>
                    )}
                    {r.desc && <div style={{ fontSize:12, color:"#94a3b8", marginBottom:4 }}>{r.desc}</div>}
                    <div style={{ fontSize:11, color:`${CYN}90`, wordBreak:"break-all" }}>{r.url}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:4, flexShrink:0 }}>
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={() => moverRecurso(r, "up")} title="Subir" style={{
                        background:"rgba(255,255,255,0.06)", border:"none", color:"#94a3b8",
                        borderRadius:8, padding:"4px 9px", cursor:"pointer", fontSize:12
                      }}>▲</button>
                      <button onClick={() => moverRecurso(r, "down")} title="Descer" style={{
                        background:"rgba(255,255,255,0.06)", border:"none", color:"#94a3b8",
                        borderRadius:8, padding:"4px 9px", cursor:"pointer", fontSize:12
                      }}>▼</button>
                    </div>
                    <div style={{ display:"flex", gap:4 }}>
                      <button onClick={() => { setEditRDraft({ titulo:r.titulo, icone:r.icone||"📄", url:r.url, desc:r.desc||"" }); setEditandoR(r.id); }} style={{
                        background:"rgba(255,255,255,0.06)", border:"none", color:"#94a3b8",
                        borderRadius:8, padding:"4px 9px", cursor:"pointer", fontSize:12
                      }}>✏️</button>
                      <button onClick={() => eliminarRecurso(r.id)} style={{
                        background:"rgba(244,63,94,0.10)", border:"none", color:PNK,
                        borderRadius:8, padding:"4px 9px", cursor:"pointer", fontSize:12
                      }}>🗑️</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
