import React, { useState } from 'react';
import { collection, addDoc, doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase.js";
import { CARD, SL, CYN, INP } from "../theme.jsx";
import { nowLabel } from "../data.js";

export default function ForumComposer({ user, canalAtivo, infoCanal }) {
  const [textoPost, setTextoPost] = useState("");
  const [ficheiroMedia, setFicheiroMedia] = useState(null);
  const [estaAEnviar, setEstaAEnviar] = useState(false);

  // ── LÓGICA DE XP FANTASMA ──
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
    } catch (e) { console.error("Erro XP:", e); }
  }

  // ── PUBLICAR ──
  async function publicarPost() {
    if (!textoPost.trim() && !ficheiroMedia) {
      return alert("Escreve algo ou anexa uma foto!");
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
        reactedBy: { heart: [], fire: [], clap: [], think: [] },
        replies: []
      });

      // Notificação de Menção (@)
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

  return (
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
            id="file-upload-composer"
            accept="image/*" 
            onChange={e => setFicheiroMedia(e.target.files[0])} 
            style={{ display: "none" }}
          />
          <label htmlFor="file-upload-composer" style={{ 
            cursor: "pointer", color: ficheiroMedia ? CYN : "#94a3b8", 
            fontSize: "12px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" 
          }}>
            {ficheiroMedia ? "📸 Foto pronta!" : "📎 Anexar Foto"}
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
  );
}
