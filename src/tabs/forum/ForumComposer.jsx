import React, { useState } from 'react';
import { collection, addDoc, updateDoc, doc, increment, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase.js";
import { CARD, SL, CYN, INP, nowLabel } from "../../theme.jsx";

export default function ForumComposer({ user, canalAtivo, infoCanal }) {
  const [texto, setTexto] = useState("");
  const [media, setMedia] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function handlePublicar() {
    if (!texto.trim() && !media) return;
    setEnviando(true);
    let url = null;
    if (media) {
      const sRef = ref(storage, `forum/${Date.now()}_${media.name}`);
      await uploadBytes(sRef, media);
      url = await getDownloadURL(sRef);
    }
    await addDoc(collection(db, "forum", canalAtivo, "posts"), {
      user: user.realName, username: user.username, color: user.color, text: texto, media: url,
      time: nowLabel(), reactions: {}, reactedBy: {}, replies: []
    });
    // Lógica de XP e Notificação @
    setTexto(""); setMedia(null); setEnviando(false);
  }

  return (
    <div style={CARD}>
      <div style={SL}>Partilha com o grupo</div>
      <textarea value={texto} onChange={e => setTexto(e.target.value)} style={INP} placeholder="Escreve algo..." />
      <input type="file" onChange={e => setMedia(e.target.files[0])} />
      <button onClick={handlePublicar} disabled={enviando}>{enviando ? "A enviar..." : "PUBLICAR"}</button>
    </div>
  );
}
