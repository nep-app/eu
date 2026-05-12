import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy, 
  updateDoc, 
  doc,
  deleteDoc,
  increment,
  arrayUnion
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase.js";
import { 
  CARD, 
  SL, 
  CYN, 
  PNK, 
  INP, 
  Btn, 
  AppIcon 
} from "../theme.jsx";
import { 
  upd, 
  nowLabel, 
  CHANNELS, 
  FORUM_REACTIONS 
} from "../data.js";

export default function ForumTab({ user, data }) {
  // ── ESTADOS DE NAVEGAÇÃO E CONTEÚDO ──
  const [canalAtivo, setCanalAtivo] = useState("csi");
  const [listaPosts, setListaPosts] = useState([]);
  const [textoPost, setTextoPost] = useState("");
  const [ficheiroMedia, setFicheiroMedia] = useState(null);
  const [estaAEnviar, setEstaAEnviar] = useState(false);
  
  // Estados para interação (Responder)
  const [responderA, setResponderA] = useState(null);
  const [textoResposta, setTextoResposta] = useState("");

  // Estados para Edição (Posts e Respostas)
  const [editandoPostId, setEditandoPostId] = useState(null);
  const [textoEditadoPost, setTextoEditadoPost] = useState("");
  const [editandoReplyInfo, setEditandoReplyInfo] = useState(null); // { postId, replyId }
  const [textoEditadoReply, setTextoEditadoReply] = useState("");

  // ── LIGAÇÃO EM TEMPO REAL AO CANAL SELECIONADO ──
  useEffect(() => {
    const q = query(
      collection(db, "forum", canalAtivo, "posts"), 
      orderBy("time", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setListaPosts(postsData);
    });

    return () => unsubscribe();
  }, [canalAtivo]);

  // ── LÓGICA DE XP FANTASMA (SECRETO) ──
  async function darXPFantasma(acaoTexto) {
    try {
      const userRef = doc(db, "userData", user.username);
      await updateDoc(userRef, {
        weekXp: increment(5),
        history: arrayUnion({
          date: nowLabel(),
          action: acaoTexto,
          ts: Date.now(),
          xp: 5
        })
      });
    } catch (e) {
      console.error("Erro no XP Fantasma:", e);
    }
  }

  // ── FUNÇÃO: PUBLICAR NO FÓRUM ──
  async function publicarPost() {
    if (!textoPost.trim() && !ficheiroMedia) {
      alert("Escreve alguma coisa ou anexa uma foto antes de publicar!");
      return;
    }

    setEstaAEnviar(true);
    let urlMedia = null;

    try {
      if (ficheiroMedia) {
        const storageRef = ref(storage, `forum/${Date.now()}_${ficheiroMedia.name}`);
        await uploadBytes(storageRef, ficheiroMedia);
        urlMedia = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "forum", canalAtivo, "posts"), {
        user: user.realName || user.username,
        username: user.username,
        color: user.color || CYN,
        text: textoPost,
        media: urlMedia,
        time: nowLabel(),
        reactions: { heart: 0, fire: 0, clap: 0, think: 0 },
        reactedBy: {},
        replies: []
      });

      if (textoPost.includes("@")) {
        const mencionado = textoPost.split("@")[1].split(" ")[0].toLowerCase();
        await addDoc(collection(db, "notifications", mencionado, "items"), {
          text: `🔔 ${user.realName} mencionou-te no canal ${canalAtivo}!`,
          date: nowLabel()
        });
      }

      darXPFantasma("Publicou uma partilha no Fórum");
      setTextoPost("");
      setFicheiroMedia(null);
    } catch (e) {
      alert("Erro ao publicar: " + e.message);
    }
    setEstaAEnviar(false);
  }

  // ── FUNÇÃO: APAGAR E EDITAR POSTS ──
  async function apagarPost(postId) {
    if (window.confirm("Queres mesmo apagar esta partilha?")) {
      await deleteDoc(doc(db, "forum", canalAtivo, "posts", postId));
    }
  }

  function iniciarEdicaoPost(post) {
    setEditandoPostId(post.id);
    setTextoEditadoPost(post.text);
  }

  async function guardarEdicaoPost(postId) {
    if (!textoEditadoPost.trim()) return;
    await updateDoc(doc(db, "forum", canalAtivo, "posts", postId), {
      text: textoEditadoPost,
      time: nowLabel() + " (editado)"
    });
    setEditandoPostId(null);
  }

  // ── FUNÇÃO: REAGIR A UM POST E NOTIFICAR ──
  async function reagir(postId, tipoReacao) {
    const post = listaPosts.find(p => p.id === postId);
    if (!post) return;

    let novasReacoes = { ...post.reactions };
    let quemReagiu = { ...post.reactedBy };
    let listaUtilizadores = quemReagiu[tipoReacao] || [];

    if (listaUtilizadores.includes(user.username)) {
      novasReacoes[tipoReacao] = Math.max(0, (novasReacoes[tipoReacao] || 1) - 1);
      quemReagiu[tipoReacao] = listaUtilizadores.filter(u => u !== user.username);
    } else {
      novasReacoes[tipoReacao] = (novasReacoes[tipoReacao] || 0) + 1;
      quemReagiu[tipoReacao] = [...listaUtilizadores, user.username];
      
      darXPFantasma("Interagiu com uma partilha no Fórum");

      // NOTIFICAÇÃO: Se eu reagi ao post de outra pessoa
      if (post.username && post.username !== user.username) {
        const iconeReacao = FORUM_REACTIONS.find(r => r.id === tipoReacao)?.icon || "👍";
        await addDoc(collection(db, "notifications", post.username, "items"), {
          text: `${iconeReacao} ${user.realName || user.username} reagiu à tua partilha no Fórum!`,
          date: nowLabel()
        });
      }
    }

    await updateDoc(doc(db, "forum", canalAtivo, "posts", postId), {
      reactions: novasReacoes,
      reactedBy: quemReagiu
    });
  }

  // ── FUNÇÕES: RESPONDER E EDITAR/APAGAR RESPOSTAS ──
  async function enviarResposta(postId) {
    if (!textoResposta.trim()) return;
    const post = listaPosts.find(p => p.id === postId);
    
    const novaResposta = {
      id: Date.now().toString(), // Dá um ID único à resposta para podermos apagar/editar
      username: user.username,
      user: user.realName || user.username,
      color: user.color || CYN,
      text: textoResposta,
      time: nowLabel()
    };

    await updateDoc(doc(db, "forum", canalAtivo, "posts", postId), {
      replies: [...(post.replies || []), novaResposta]
    });

    // NOTIFICAÇÃO: Se eu respondi ao post de outra pessoa
    if (post.username && post.username !== user.username) {
      await addDoc(collection(db, "notifications", post.username, "items"), {
        text: `💬 ${user.realName || user.username} respondeu à tua partilha no Fórum!`,
        date: nowLabel()
      });
    }

    darXPFantasma("Respondeu a uma conversa no Fórum");
    setTextoResposta("");
    setResponderA(null);
  }

  async function apagarReply(postId, replyId) {
    if (window.confirm("Apagar resposta?")) {
      const post = listaPosts.find(p => p.id === postId);
      const novasRespostas = post.replies.filter(r => r.id !== replyId);
      await updateDoc(doc(db, "forum", canalAtivo, "posts", postId), { replies: novasRespostas });
    }
  }

  function iniciarEdicaoReply(postId, reply) {
    setEditandoReplyInfo({ postId, replyId: reply.id });
    setTextoEditadoReply(reply.text);
  }

  async function guardarEdicaoReply(postId, replyId) {
    if (!textoEditadoReply.trim()) return;
    const post = listaPosts.find(p => p.id === postId);
    const novasRespostas = post.replies.map(r => 
      r.id === replyId ? { ...r, text: textoEditadoReply, time: nowLabel() + " (editado)" } : r
    );
    await updateDoc(doc(db, "forum", canalAtivo, "posts", postId), { replies: novasRespostas });
    setEditandoReplyInfo(null);
  }

  const infoCanal = CHANNELS.find(c => c.id === canalAtivo);

  return (
    <div style={{ padding: "18px 16px", paddingBottom: "100px" }}>
      
      {/* LOGOTIPO */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "25px" }}>
        <AppIcon size={80} />
      </div>

      {/* SELEÇÃO DE CANAIS */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
        {CHANNELS.map(ch => {
          const selecionado = canalAtivo === ch.id;
          return (
            <button 
              key={ch.id} 
              onClick={() => setCanalAtivo(ch.id)} 
              style={{ 
                flex: "1 1 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "12px 16px", borderRadius: "18px", fontSize: "12px", fontWeight: "800", cursor: "pointer", transition: "0.2s",
                border: selecionado ? `1.5px solid ${CYN}` : "1px solid rgba(255,255,255,0.1)",
                background: selecionado ? "rgba(34, 211, 238, 0.15)" : "rgba(255,255,255,0.05)",
                color: selecionado ? CYN : "#94a3b8"
              }}
            >
              <span style={{ fontSize: "16px" }}>{ch.icon}</span>
              {ch.label.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* DESCRIÇÃO DO CANAL */}
      <div style={{ ...CARD, background: "rgba(34, 211, 238, 0.05)", borderLeft: `4px solid ${CYN}`, padding: "18px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "20px" }}>{infoCanal?.icon}</span>
          <div style={{ fontSize: "14px", fontWeight: "900", color: CYN, letterSpacing: "1px" }}>{infoCanal?.label.toUpperCase()}</div>
        </div>
        <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6", fontStyle: "italic" }}>{infoCanal?.desc}</div>
      </div>

      {/* ÁREA DE PUBLICAÇÃO */}
      <div style={CARD}>
        <div style={SL}>Partilha com o grupo</div>
        <textarea 
          value={textoPost} 
          onChange={e => setTextoPost(e.target.value)} 
          placeholder={`Escreve algo para o canal ${infoCanal?.label}...`} 
          style={{ ...INP, minHeight: "80px" }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "5px" }}>
          <div style={{ position: "relative" }}>
            <input 
              type="file" id="file-upload" accept="image/*" 
              onChange={e => setFicheiroMedia(e.target.files[0])} 
              style={{ display: "none" }}
            />
            <label htmlFor="file-upload" style={{ cursor: "pointer", color: ficheiroMedia ? CYN : "#94a3b8", fontSize: "12px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
              {ficheiroMedia ? "📸 Ficheiro pronto!" : "📎 Anexar Foto"}
            </label>
          </div>
          <button 
            onClick={publicarPost} disabled={estaAEnviar}
            style={{ background: CYN, color: "#070b14", border: "none", borderRadius: "14px", padding: "10px 24px", fontWeight: "900", cursor: "pointer", boxShadow: `0 4px 15px ${CYN}40` }}
          >
            {estaAEnviar ? "A enviar..." : "PUBLICAR"}
          </button>
        </div>
      </div>

      {/* LISTAGEM DE MENSAGENS */}
      <div style={{ marginTop: "30px" }}>
        <div style={{ ...SL, marginBottom: "20px" }}>Mural de Conversas</div>
        
        {listaPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#64748b", fontSize: "14px" }}>
            Ainda não há partilhas neste canal.<br/>Sê o primeiro a escrever!
          </div>
        ) : (
          listaPosts.map(post => (
            <div key={post.id} style={CARD}>
              <div style={{ display: "flex", gap: "14px" }}>
                
                {/* Avatar */}
                <div style={{ 
                  width: "42px", height: "42px", borderRadius: "14px", background: `linear-gradient(135deg, ${post.color}, #000)`,
                  display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "18px", fontWeight: "900", flexShrink: 0, boxShadow: `0 4px 12px ${post.color}40`
                }}>
                  {post.user ? post.user[0].toUpperCase() : "?"}
                </div>

                {/* Conteúdo do Post */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: post.color }}>
                      {post.user}
                      {post.username === "teresa" && (
                        <span style={{ marginLeft: "8px", fontSize: "9px", background: CYN, color: "#070b14", padding: "2px 6px", borderRadius: "6px", verticalAlign: "middle" }}>ADMIN</span>
                      )}
                    </div>
                    
                    {/* Data e Botões de Edição/Apagar (Só se for o dono) */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{post.time}</div>
                      {post.username === user.username && (
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button onClick={() => iniciarEdicaoPost(post)} style={{ background: "none", border: "none", fontSize: "12px", cursor: "pointer", opacity: 0.7 }}>✏️</button>
                          <button onClick={() => apagarPost(post.id)} style={{ background: "none", border: "none", fontSize: "12px", cursor: "pointer", opacity: 0.7 }}>🗑️</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mostra input de Edição ou Texto Normal */}
                  {editandoPostId === post.id ? (
                    <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                      <textarea 
                        value={textoEditadoPost} 
                        onChange={e => setTextoEditadoPost(e.target.value)} 
                        style={{ ...INP, flex: 1, minHeight: "60px", marginBottom: 0, fontSize: "13px" }}
                      />
                      <button onClick={() => guardarEdicaoPost(post.id)} style={{ background: CYN, color: "#070b14", border: "none", borderRadius: "10px", padding: "0 15px", fontWeight: "900", cursor: "pointer" }}>OK</button>
                      <button onClick={() => setEditandoPostId(null)} style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "10px", padding: "0 10px", cursor: "pointer" }}>✕</button>
                    </div>
                  ) : (
                    <div style={{ fontSize: "15px", lineHeight: "1.6", color: "#e2e8f0" }}>{post.text}</div>
                  )}

                  {post.media && (
                    <div style={{ marginTop: "12px" }}>
                      <img src={post.media} alt="Anexo" style={{ maxWidth: "100%", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }} />
                    </div>
                  )}

                  {/* Reações e Responder */}
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", marginTop: "18px" }}>
                    {FORUM_REACTIONS.map(r => {
                      const contagem = (post.reactions || {})[r.id] || 0;
                      const reagidoPorMim = (post.reactedBy?.[r.id] || []).includes(user.username);
                      return (
                        <div 
                          key={r.id} onClick={() => reagir(post.id, r.id)}
                          style={{ 
                            fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: "6px 10px", borderRadius: "10px",
                            background: reagidoPorMim ? `${CYN}20` : "transparent", color: reagidoPorMim ? CYN : "#94a3b8", border: reagidoPorMim ? `1px solid ${CYN}40` : "1px solid transparent"
                          }}
                        >
                          <span>{r.icon}</span>
                          {contagem > 0 && <span style={{ fontWeight: "800" }}>{contagem}</span>}
                        </div>
                      );
                    })}
                    
                    <div onClick={() => setResponderA(responderA === post.id ? null : post.id)} style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "700", cursor: "pointer", marginLeft: "5px" }}>
                      💬 RESPONDER
                    </div>
                  </div>
                </div>
              </div>

              {/* ÁREA DE RESPOSTAS (THREADS) - SEMPRE VISÍVEL! */}
              {post.replies?.length > 0 && (
                <div style={{ marginTop: "20px", marginLeft: "40px", borderLeft: "2px solid rgba(255,255,255,0.05)", paddingLeft: "15px" }}>
                  {post.replies.map((reply) => {
                    const emEdicao = editandoReplyInfo?.postId === post.id && editandoReplyInfo?.replyId === reply.id;
                    return (
                      <div key={reply.id || Math.random()} style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div style={{ fontSize: "12px", fontWeight: "800", color: reply.color, marginBottom: "2px" }}>
                            {reply.user} <span style={{ color: "#64748b", fontWeight: "400", marginLeft: "6px" }}>{reply.time}</span>
                          </div>
                          
                          {/* Botões Edição Resposta (Só se for o dono) */}
                          {reply.username === user.username && (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button onClick={() => iniciarEdicaoReply(post.id, reply)} style={{ background: "none", border: "none", fontSize: "10px", cursor: "pointer", opacity: 0.6 }}>✏️</button>
                              <button onClick={() => apagarReply(post.id, reply.id)} style={{ background: "none", border: "none", fontSize: "10px", cursor: "pointer", opacity: 0.6 }}>🗑️</button>
                            </div>
                          )}
                        </div>

                        {emEdicao ? (
                          <div style={{ display: "flex", gap: "8px", marginTop: "5px" }}>
                            <input 
                              value={textoEditadoReply} 
                              onChange={e => setTextoEditadoReply(e.target.value)} 
                              style={{ ...INP, flex: 1, marginBottom: 0, fontSize: "12px", padding: "6px 10px" }}
                            />
                            <button onClick={() => guardarEdicaoReply(post.id, reply.id)} style={{ background: CYN, color: "#070b14", border: "none", borderRadius: "8px", padding: "0 10px", fontWeight: "900", cursor: "pointer" }}>OK</button>
                            <button onClick={() => setEditandoReplyInfo(null)} style={{ background: "none", color: "#f43f5e", border: "none", cursor: "pointer" }}>✕</button>
                          </div>
                        ) : (
                          <div style={{ fontSize: "13px", color: "#cbd5e1" }}>{reply.text}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* INPUT PARA RESPONDER */}
              {responderA === post.id && (
                <div style={{ marginTop: "15px", marginLeft: "40px", display: "flex", gap: "10px" }}>
                  <input 
                    value={textoResposta} 
                    onChange={e => setTextoResposta(e.target.value)} 
                    placeholder="Escreve uma resposta..."
                    style={{ ...INP, marginBottom: 0, fontSize: "13px", padding: "10px 14px" }}
                    autoFocus
                  />
                  <button 
                    onClick={() => enviarResposta(post.id)}
                    style={{ background: CYN, color: "#070b14", border: "none", borderRadius: "12px", padding: "0 15px", fontWeight: "900", cursor: "pointer" }}
                  >
                    ↑
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
