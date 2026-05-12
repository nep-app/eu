import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc, addDoc, collection, increment, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, CYN, INP, FORUM_REACTIONS } from "../../theme.jsx";
import { nowLabel } from "../../data.js";

export default function ForumPost({ post, user, canalAtivo, listaPosts }) {
  const [responderA, setResponderA] = useState(false);
  const [textoResposta, setTextoResposta] = useState("");
  const [editando, setEditando] = useState(false);
  const [textoEditado, setTextoEditado] = useState(post.text);

  async function darXP(acao) {
    await updateDoc(doc(db, "userData", user.username), {
      weekXp: increment(5),
      history: arrayUnion({ date: nowLabel(), action: acao, ts: Date.now(), xp: 5 })
    });
  }

  async function handleReagir(tipo) {
    let rcts = { ...post.reactions };
    let rBy = { ...post.reactedBy };
    let users = rBy[tipo] || [];

    if (users.includes(user.username)) {
      rcts[tipo] = Math.max(0, rcts[tipo] - 1);
      rBy[tipo] = users.filter(u => u !== user.username);
    } else {
      rcts[tipo] = (rcts[tipo] || 0) + 1;
      rBy[tipo] = [...users, user.username];
      darXP("Interagiu no Fórum");
      if (post.username !== user.username) {
        await addDoc(collection(db, "notifications", post.username, "items"), {
          text: `${FORUM_REACTIONS.find(r=>r.id===tipo).icon} ${user.realName} reagiu ao teu post!`,
          date: nowLabel()
        });
      }
    }
    await updateDoc(doc(db, "forum", canalAtivo, "posts", post.id), { reactions: rcts, reactedBy: rBy });
  }

  async function handleResponder() {
    if (!textoResposta.trim()) return;
    const novaR = { id: Date.now().toString(), username: user.username, user: user.realName, color: user.color, text: textoResposta, time: nowLabel() };
    await updateDoc(doc(db, "forum", canalAtivo, "posts", post.id), { replies: [...(post.replies || []), novaR] });
    setResponderA(false); setTextoResposta(""); darXP("Respondeu no Fórum");
  }

  return (
    <div style={CARD}>
      {/* Aqui metes toda a estrutura visual do post (Avatar, Texto, Imagem) */}
      {/* Botões de Reagir, Responder, Editar e Apagar */}
      {/* Mapeamento das Replies (respostas) */}
    </div>
  );
}
