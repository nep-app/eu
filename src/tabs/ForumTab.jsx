import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy, 
  updateDoc, 
  doc 
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
  
  // Estados para interação
  const [postExpandido, setPostExpandido] = useState(null);
  const [responderA, setResponderA] = useState(null);
  const [textoResposta, setTextoResposta] = useState("");

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

  // ── FUNÇÃO: PUBLICAR NO FÓRUM ──
  async function publicarPost() {
    if (!textoPost.trim() && !ficheiroMedia) {
      alert("Escreve alguma coisa ou anexa uma foto antes de publicar!");
      return;
    }

    setEstaAEnviar(true);
    let urlMedia = null;

    try {
      // 1. Upload de Imagem (se houver)
      if (ficheiroMedia) {
        const storageRef = ref(storage, `forum/${Date.now()}_${ficheiroMedia.name}`);
        await uploadBytes(storageRef, ficheiroMedia);
        urlMedia = await getDownloadURL(storageRef);
      }

      // 2. Criar o Post no Firestore
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

      // 3. Lógica de Menção (@nome)
      if (textoPost.includes("@")) {
        const mencionado = textoPost.split("@")[1].split(" ")[0].toLowerCase();
        await addDoc(collection(db, "notifications", mencionado, "items"), {
          text: `${user.realName} mencionou-te no canal ${canalAtivo}!`,
          date: nowLabel()
        });
      }

      setTextoPost("");
      setFicheiroMedia(null);
    } catch (e) {
      alert("Erro ao publicar: " + e.message);
    }
    setEstaAEnviar(false);
  }

  // ── FUNÇÃO: REAGIR A UM POST ──
  async function reagir(postId, tipoReacao) {
    const post = listaPosts.find(p => p.id === postId);
    if (!post) return;

    let novasReacoes = { ...post.reactions };
    let quemReagiu = { ...post.reactedBy };
    let listaUtilizadores = quemReagiu[tipoReacao] || [];

    if (listaUtilizadores.includes(user.username)) {
      // Remover reação
      novasReacoes[tipoReacao] = Math.max(0, (novasReacoes[tipoReacao] || 1) - 1);
      quemReagiu[tipoReacao] = listaUtilizadores.filter(u => u !== user.username);
    } else {
      // Adicionar reação
      novasReacoes[tipoReacao] = (novasReacoes[tipoReacao] || 0) + 1;
      quemReagiu[tipoReacao] = [...listaUtilizadores, user.username];
    }

    await updateDoc(doc(db, "forum", canalAtivo, "posts", postId), {
      reactions: novasReacoes,
      reactedBy: quemReagiu
    });
  }

  // ── FUNÇÃO: RESPONDER A UM POST ──
  async function enviarResposta(postId) {
    if (!textoResposta.trim()) return;
    const post = listaPosts.find(p => p.id === postId);
    
    const novaResposta = {
      user: user.realName || user.username,
      color: user.color || CYN,
      text: textoResposta,
      time: nowLabel()
    };

    await updateDoc(doc(db, "forum", canalAtivo, "posts", postId), {
      replies: [...(post.replies || []), novaResposta]
    });

    setTextoResposta("");
    setResponderA(null);
    setPostExpandido(postId);
  }

  // Identifica a informação completa do canal selecionado
  const infoCanal = CHANNELS.find(c => c.id === canalAtivo);

  return (
    <div style={{ padding: "18px 16px", paddingBottom: "100px" }}>
      
      {/* LOGOTIPO DA APP NO TOPO */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "25px" }}>
        <AppIcon size={80} />
      </div>

      {/* SELEÇÃO DE CANAIS (GRELHA SEM SCROLL) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
        {CHANNELS.map(ch => {
          const selecionado = canalAtivo === ch.id;
          return (
            <button 
              key={ch.id} 
              onClick={() => setCanalAtivo(ch.id)} 
              style={{ 
                flex: "1 1 auto",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "12px 16px", borderRadius: "18px", fontSize: "12px", fontWeight: "800",
                cursor: "pointer", transition: "0.2s",
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

      {/* CORREÇÃO: DESCRIÇÃO DO CANAL (QUADRO DE ORIENTAÇÃO) */}
      <div style={{ 
        ...CARD, 
        background: "rgba(34, 211, 238, 0.05)", 
        borderLeft: `4px solid ${CYN}`, 
        padding: "18px",
        marginBottom: "20px" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "20px" }}>{infoCanal?.icon}</span>
          <div style={{ fontSize: "14px", fontWeight: "900", color: CYN, letterSpacing: "1px" }}>
            {infoCanal?.label.toUpperCase()}
          </div>
        </div>
        <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.6", fontStyle: "italic" }}>
          {infoCanal?.desc}
        </div>
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
              type="file" 
              id="file-upload"
              accept="image/*" 
              onChange={e => setFicheiroMedia(e.target.files[0])} 
              style={{ display: "none" }}
            />
            <label htmlFor="file-upload" style={{ 
              cursor: "pointer", color: ficheiroMedia ? CYN : "#94a3b8", 
              fontSize: "12px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" 
            }}>
              {ficheiroMedia ? "📸 Ficheiro pronto!" : "📎 Anexar Foto"}
            </label>
          </div>
          <button 
            onClick={publicarPost} 
            disabled={estaAEnviar}
            style={{ 
              background: CYN, color: "#070b14", border: "none", borderRadius: "14px", 
              padding: "10px 24px", fontWeight: "900", cursor: "pointer",
              boxShadow: `0 4px 15px ${CYN}40`
            }}
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
                  width: "42px", height: "42px", borderRadius: "14px", 
                  background: `linear-gradient(135deg, ${post.color}, #000)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: "18px", fontWeight: "900", flexShrink: 0,
                  boxShadow: `0 4px 12px ${post.color}40`
                }}>
                  {post.user ? post.user[0].toUpperCase() : "?"}
                </div>

                {/* Conteúdo do Post */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: post.color }}>
                      {post.user}
                      {post.username === "teresa" && (
                        <span style={{ marginLeft: "8px", fontSize: "9px", background: CYN, color: "#070b14", padding: "2px 6px", borderRadius: "6px", verticalAlign: "middle" }}>
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{post.time}</div>
                  </div>

                  <div style={{ fontSize: "15px", lineHeight: "1.6", color: "#e2e8f0" }}>
                    {post.text}
                  </div>

                  {post.media && (
                    <div style={{ marginTop: "12px" }}>
                      <img 
                        src={post.media} 
                        alt="Anexo" 
                        style={{ maxWidth: "100%", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }} 
                      />
                    </div>
                  )}

                  {/* Barra de Reações e Respostas */}
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", marginTop: "18px" }}>
                    {FORUM_REACTIONS.map(r => {
                      const contagem = (post.reactions || {})[r.id] || 0;
                      const reagidoPorMim = (post.reactedBy?.[r.id] || []).includes(user.username);
                      return (
                        <div 
                          key={r.id} 
                          onClick={() => reagir(post.id, r.id)}
                          style={{ 
                            fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                            padding: "6px 10px", borderRadius: "10px",
                            background: reagidoPorMim ? `${CYN}20` : "transparent",
                            color: reagidoPorMim ? CYN : "#94a3b8",
                            border: reagidoPorMim ? `1px solid ${CYN}40` : "1px solid transparent"
                          }}
                        >
                          <span>{r.icon}</span>
                          {contagem > 0 && <span style={{ fontWeight: "800" }}>{contagem}</span>}
                        </div>
                      );
                    })}
                    
                    <div 
                      onClick={() => setResponderA(responderA === post.id ? null : post.id)}
                      style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "700", cursor: "pointer", marginLeft: "5px" }}
                    >
                      💬 RESPONDER
                    </div>

                    {post.replies?.length > 0 && (
                      <div 
                        onClick={() => setPostExpandido(postExpandido === post.id ? null : post.id)}
                        style={{ fontSize: "12px", color: CYN, fontWeight: "900", cursor: "pointer" }}
                      >
                        {postExpandido === post.id ? "FECHAR" : `VER ${post.replies.length} RESPOSTAS`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ÁREA DE RESPOSTAS (THREADS) */}
              {postExpandido === post.id && post.replies?.length > 0 && (
                <div style={{ marginTop: "20px", marginLeft: "40px", borderLeft: "2px solid rgba(255,255,255,0.05)", paddingLeft: "15px" }}>
                  {post.replies.map((reply, idx) => (
                    <div key={idx} style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "12px", fontWeight: "800", color: reply.color, marginBottom: "2px" }}>
                        {reply.user} <span style={{ color: "#64748b", fontWeight: "400", marginLeft: "6px" }}>{reply.time}</span>
                      </div>
                      <div style={{ fontSize: "13px", color: "#cbd5e1" }}>{reply.text}</div>
                    </div>
                  ))}
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
                    style={{ background: CYN, color: "#070b14", border: "none", borderRadius: "12px", padding: "0 15px", fontWeight: "900" }}
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
