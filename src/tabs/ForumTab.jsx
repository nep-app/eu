import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase.js";
import { CYN } from "../theme.jsx";
import { CHANNELS } from "../data.js";
import ForumPost from './forum/ForumPost.jsx';
import ForumComposer from './forum/ForumComposer.jsx';

export default function ForumTab({ user, data }) {
  const [canalAtivo, setCanalAtivo] = useState("csi");
  const [listaPosts, setListaPosts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "forum", canalAtivo, "posts"), orderBy("time", "desc"));
    return onSnapshot(q, (snap) => {
      setListaPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [canalAtivo]);

  const infoCanal = CHANNELS.find(c => c.id === canalAtivo);

  return (
    <div style={{ padding: "18px 16px", paddingBottom: "100px" }}>
      
      {/* MENU DE CANAIS (TIPO "BOLHAS" HORIZONTAIS) */}
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        overflowX: "auto", 
        paddingBottom: "10px", 
        marginBottom: "20px",
        scrollbarWidth: "none" // Esconde a barra de scroll no Android/Firefox
      }}>
        {CHANNELS.map(ch => {
          const selecionado = canalAtivo === ch.id;
          return (
            <button key={ch.id} onClick={() => setCanalAtivo(ch.id)} style={{ 
              display: "flex", alignItems: "center", gap: "6px", flexShrink: 0,
              padding: "10px 16px", borderRadius: "30px", cursor: "pointer", transition: "0.2s",
              border: selecionado ? `1px solid ${CYN}` : "1px solid rgba(255,255,255,0.1)",
              background: selecionado ? "rgba(34, 211, 238, 0.15)" : "rgba(0,0,0,0.3)",
              color: selecionado ? CYN : "#94a3b8"
            }}>
              <span style={{ fontSize: "16px" }}>{ch.icon}</span>
              <span style={{ fontSize: "12px", fontWeight: "800", whiteSpace: "nowrap" }}>
                {ch.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* INFO DO CANAL ATIVO */}
      <div style={{ 
        background: "rgba(0,0,0,0.2)", padding: "15px", borderRadius: "18px", 
        fontSize: "12px", color: "#cbd5e1", lineHeight: "1.5", marginBottom: "25px",
        borderLeft: `3px solid ${CYN}`
      }}>
        <strong style={{ color: CYN, display: "block", marginBottom: "4px" }}>{infoCanal?.label}</strong>
        {infoCanal?.desc}
      </div>

      <ForumComposer user={user} canalAtivo={canalAtivo} infoCanal={infoCanal} data={data} />

      <div style={{ marginTop: "30px" }}>
        {listaPosts.map(post => (
          <ForumPost key={post.id} post={post} user={user} canalAtivo={canalAtivo} />
        ))}
      </div>
    </div>
  );
}
