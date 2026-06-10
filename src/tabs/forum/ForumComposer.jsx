import React, { useState } from 'react';
import { collection, addDoc, doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase.js";
import { CARD, SL, CYN, INP, TXT_MUT } from "../../theme.jsx";
import { nowFull, ALLOWED_USERNAMES } from "../../data.js";

export default function ForumComposer({ user, canalAtivo, infoCanal, forumCollection = "forum" }) {
  const [textoPost,     setTextoPost]     = useState("");
  const [ficheiroMedia, setFicheiroMedia] = useState(null);
  const [estaAEnviar,   setEstaAEnviar]   = useState(false);

  async function darXPComStreak(acaoTexto) {
    try {
      const userRef = doc(db, "userData", user.username);
      const today     = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      // Nota: não temos acesso ao userData aqui, por isso só actualizamos se necessário
      await updateDoc(userRef, {
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
      await addDoc(collection(db, forumCollection, canalAtivo, "posts"), {
        user: user.realName || user.username,
        username: user.username,
        color: user.color || CYN,
        text: textoPost,
        media: urlMedia,
        time: nowFull(),
        reactions: { heart:0, fire:0, clap:0, think:0 },
        reactedBy: { heart:[], fire:[], clap:[], think:[] },
        replies: []
      });
      if (forumCollection === "forum") {
        const canalLabel = infoCanal?.label || canalAtivo;
        const preview = textoPost.trim().substring(0, 60);
        const notifText = `🌐 ${user.realName} publicou em ${canalLabel}${preview ? `: "${preview}${textoPost.length > 60 ? "…" : ""}"` : ""}`;
        await Promise.all(
          ALLOWED_USERNAMES
            .filter(u => u !== user.username && u !== "demo")
            .map(u => addDoc(collection(db, "notifications", u, "items"), {
              from: user.username, text: notifText, date: nowFull(), read: false
            }))
        );
        await addDoc(collection(db, "adminNotificacoes"), {
          tipo: "FORUM_POST", jovem: user.username, canal: canalAtivo,
          texto: textoPost.substring(0, 60), ts: Date.now(), lida: false
        });
      }
      if (textoPost.includes("@")) {
        const mencionado = textoPost.split("@")[1].split(" ")[0].toLowerCase();
        await addDoc(collection(db, "notifications", mencionado, "items"), {
          from: user.username, text: `🔔 ${user.realName} mencionou-te em ${infoCanal?.label || canalAtivo}!`,
          date: nowFull(), read: false
        });
      }
      darXPComStreak("Publicou uma partilha no Fórum");
      setTextoPost(""); setFicheiroMedia(null);
    } catch (e) { alert("Erro ao publicar: " + e.message); }
    setEstaAEnviar(false);
  }

  return (
    <div style={CARD}>
      <div style={SL}>Partilhar com o grupo</div>

      <textarea
        value={textoPost}
        onChange={e => setTextoPost(e.target.value)}
        placeholder={`Escreve algo para ${infoCanal?.label || "o canal"}...`}
        style={{ ...INP, minHeight:80, resize:"none" }}
      />

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {/* Anexar foto */}
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
