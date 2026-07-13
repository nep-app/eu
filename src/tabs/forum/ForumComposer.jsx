import React, { useState, useRef } from 'react';
import { collection, addDoc, doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase.js";
import { CARD, SL, CYN, INP, TXT_MUT } from "../../theme.jsx";
import { nowFull, ALLOWED_USERNAMES, CHANNELS, JEEP_LIST } from "../../data.js";

export default function ForumComposer({ user, canalAtivo, infoCanal, forumCollection = "forum" }) {
  const [textoPost,      setTextoPost]      = useState("");
  const [ficheiroMedia,  setFicheiroMedia]  = useState(null);
  const [estaAEnviar,    setEstaAEnviar]    = useState(false);
  const [mencaoDropdown, setMencaoDropdown] = useState(false);
  const [mencaoFiltro,   setMencaoFiltro]   = useState("");
  const [mencaoStart,    setMencaoStart]    = useState(0);
  const textareaRef = useRef(null);

  const mostrarTodos = !mencaoFiltro || "todos".includes(mencaoFiltro) || "equipa".includes(mencaoFiltro) || "toda".includes(mencaoFiltro);
  const candidatosPessoas = JEEP_LIST
    .filter(j => j.username !== user.username && j.username !== "demo" && j.username !== "ricardo")
    .filter(j => !mencaoFiltro || j.username.toLowerCase().includes(mencaoFiltro) || j.name.toLowerCase().includes(mencaoFiltro))
    .slice(0, mostrarTodos ? 4 : 5);
  const candidatos = [
    ...(mostrarTodos ? [{ username: "todos", name: "Toda a equipa", color: CYN }] : []),
    ...candidatosPessoas,
  ];

  function handleTextoChange(e) {
    const val = e.target.value;
    setTextoPost(val);
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
    const antes = textoPost.substring(0, mencaoStart);
    const depois = textoPost.substring(mencaoStart).replace(/^@\w*/, "");
    const novo = antes + "@" + username + " " + depois;
    setTextoPost(novo);
    setMencaoDropdown(false);
    setTimeout(() => {
      if (textareaRef.current) {
        const pos = mencaoStart + username.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
  }

  async function darXPComStreak(acaoTexto) {
    try {
      await updateDoc(doc(db, "userData", user.username), {
        weekXp: increment(5),
        history: arrayUnion({ date: nowFull(), action: acaoTexto, ts: Date.now(), xp: 5 }),
      });
    } catch (e) { console.error("Erro XP:", e); }
  }

  async function publicarPost() {
    if (!textoPost.trim() && !ficheiroMedia) return alert("Escreve algo ou anexa uma foto!");
    setEstaAEnviar(true);
    let urlMedia = null;
    try {
      if (ficheiroMedia) {
        const storageRef = ref(storage, `forum/${Date.now()}_${ficheiroMedia.name}`);
        await uploadBytes(storageRef, ficheiroMedia);
        urlMedia = await getDownloadURL(storageRef);
      }
      const docRef = await addDoc(collection(db, forumCollection, canalAtivo, "posts"), {
        user: user.realName || user.username,
        username: user.username,
        color: user.color || CYN,
        text: textoPost,
        media: urlMedia,
        time: nowFull(),
        ts: Date.now(),
        reactions: { heart:0, fire:0, clap:0, think:0 },
        reactedBy: { heart:[], fire:[], clap:[], think:[] },
        replies: []
      });
      if (forumCollection === "forum") {
        const canalLabel = infoCanal?.label || canalAtivo;
        const canalIcon = (CHANNELS.find(c => c.id === canalAtivo) || {}).icon || "🌐";
        const preview = textoPost.trim().substring(0, 60);
        const notifText = `${canalIcon} ${user.realName} publicou em ${canalLabel}${preview ? `: "${preview}${textoPost.length > 60 ? "…" : ""}"` : ""}`;
        await Promise.all(
          ALLOWED_USERNAMES
            .filter(u => u !== (user.username || "__none__") && u !== "demo")
            .map(u => addDoc(collection(db, "notifications", u, "items"), {
              from: user.username, text: notifText, date: nowFull(), read: false, canal: canalAtivo, ts: Date.now()
            }))
        );
        await addDoc(collection(db, "adminNotificacoes"), {
          tipo: "FORUM_POST", jovem: user.username, canal: canalAtivo,
          texto: textoPost.substring(0, 60), ts: Date.now(), lida: false
        });
      }
      // @menções — suporta múltiplas + @todos
      const textoLower = textoPost.toLowerCase();
      const mencionouTodos = textoLower.includes("@todos");
      const mencoes = [...textoPost.matchAll(/@(\w+)/g)]
        .map(m => m[1].toLowerCase())
        .filter((u, i, arr) => arr.indexOf(u) === i)
        .filter(u => u !== user.username && u !== "todos" && ALLOWED_USERNAMES.includes(u));
      const destinatariosTodos = mencionouTodos
        ? ALLOWED_USERNAMES.filter(u => u !== user.username && u !== "demo" && !mencoes.includes(u))
        : [];
      await Promise.all([
        ...mencoes.map(mencionado =>
          addDoc(collection(db, "notifications", mencionado, "items"), {
            from: user.username,
            text: `🔔 ${user.realName} mencionou-te em ${infoCanal?.label || canalAtivo}!`,
            date: nowFull(), read: false, ts: Date.now(),
            mencao: true, postId: docRef.id, canal: canalAtivo, push: true
          })
        ),
        ...destinatariosTodos.map(u =>
          addDoc(collection(db, "notifications", u, "items"), {
            from: user.username,
            text: `🔔 ${user.realName} mencionou a equipa toda em ${infoCanal?.label || canalAtivo}!`,
            date: nowFull(), read: false, ts: Date.now(),
            mencao: true, postId: docRef.id, canal: canalAtivo, push: true
          })
        ),
      ]);
      darXPComStreak("Publicou uma partilha no Fórum");
      setTextoPost(""); setFicheiroMedia(null); setMencaoDropdown(false);
    } catch (e) { alert("Erro ao publicar: " + e.message); }
    setEstaAEnviar(false);
  }

  return (
    <div style={CARD}>
      <div style={SL}>Partilhar com o grupo</div>

      <div style={{ position:"relative" }}>
        <textarea
          ref={textareaRef}
          value={textoPost}
          onChange={handleTextoChange}
          onBlur={() => setTimeout(() => setMencaoDropdown(false), 150)}
          placeholder={`Escreve algo para ${infoCanal?.label || "o canal"}... (usa @ para mencionar)`}
          style={{ ...INP, minHeight:80, resize:"none" }}
        />
        {mencaoDropdown && candidatos.length > 0 && (
          <div style={{
            position:"absolute", top:"calc(100% - 10px)", left:0, right:0, zIndex:50,
            background:"#1e293b", border:"1px solid rgba(255,255,255,0.12)",
            borderRadius:12, overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.5)",
          }}>
            {candidatos.map(j => (
              <div key={j.username} onMouseDown={() => selecionarMencao(j.username)} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 14px", cursor:"pointer",
                borderBottom:"1px solid rgba(255,255,255,0.05)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width:28, height:28, borderRadius:10, flexShrink:0,
                  background: j.username === "todos" ? `rgba(34,211,238,0.15)` : `linear-gradient(135deg, ${j.color}, ${j.color}66)`,
                  border: j.username === "todos" ? `1px solid ${CYN}40` : "none",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize: j.username === "todos" ? 14 : 12, fontWeight:900, color: j.username === "todos" ? CYN : "#0f172a" }}>
                  {j.username === "todos" ? "👥" : j.name[0]}
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

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <input type="file" id="forum-file-input" accept="image/*"
            onChange={e => setFicheiroMedia(e.target.files[0])} style={{ display:"none" }} />
          <label htmlFor="forum-file-input" style={{
            cursor:"pointer", display:"flex", alignItems:"center", gap:6,
            fontSize:12, fontWeight:800, color: ficheiroMedia ? CYN : TXT_MUT,
            padding:"8px 12px", borderRadius:10,
            background: ficheiroMedia ? `${CYN}12` : "transparent",
            border: ficheiroMedia ? `1px solid ${CYN}30` : "1px solid transparent",
            transition:"all 0.2s",
          }}>
            {ficheiroMedia ? "📸 Pronto!" : "📎 Foto"}
          </label>
        </div>

        <button onClick={publicarPost} disabled={estaAEnviar} style={{
          background: estaAEnviar ? "rgba(255,255,255,0.05)" : CYN,
          color: estaAEnviar ? TXT_MUT : "#0f172a",
          border:"none", borderRadius:14, padding:"11px 26px",
          fontWeight:900, cursor: estaAEnviar ? "default" : "pointer",
          fontSize:13, letterSpacing:0.8, transition:"all 0.2s",
          boxShadow: estaAEnviar ? "none" : `0 4px 14px ${CYN}35`,
        }}>
          {estaAEnviar ? "A enviar..." : "PUBLICAR"}
        </button>
      </div>
    </div>
  );
}
