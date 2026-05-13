import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase.js";
import { CYN, AppIcon } from "../theme.jsx";
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
      
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "25px" }}>
        <AppIcon size={60} />
      </div>

      {/* GRELHA DE CANAIS (2 COLUNAS) */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "10px", 
        marginBottom: "20px" 
      }}>
        {CHANNELS.map(ch => {
          const selecionado = canalAtivo === ch.id;
          return (
            <button key={ch.id} onClick={() => setCanalAtivo(ch.id)} style={{ 
              display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
              padding: "15px 10px", borderRadius: "20px", cursor: "pointer", transition: "0.3s",
              border: selecionado ? `2px solid ${CYN}` : "1px solid rgba(255,255,255,0.05)",
              background: selecionado ? "rgba(34, 211, 238, 0.15)" : "rgba(255,255,255,0.03)",
              color: selecionado ? CYN : "#94a3b8"
            }}>
              <span style={{ fontSize: "24px" }}>{ch.icon}</span>
              <span style={{ fontSize: "11px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px", textAlign: "center" }}>
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
