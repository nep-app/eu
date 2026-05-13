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
      
      {/* CÓDIGO PARA ESCONDER A SCROLLBAR FEIA */}
      <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "25px" }}><AppIcon size={80} /></div>

      {/* SELEÇÃO DE CANAIS (Visual "Pill" sem scrollbar) */}
      <div className="hide-scroll" style={{ display: "flex", overflowX: "auto", gap: "10px", marginBottom: "15px", paddingBottom: "5px" }}>
        {CHANNELS.map(ch => {
          const selecionado = canalAtivo === ch.id;
          return (
            <button key={ch.id} onClick={() => setCanalAtivo(ch.id)} style={{ 
              flexShrink: 0, display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 18px", borderRadius: "24px", fontSize: "13px", fontWeight: "800", cursor: "pointer", transition: "0.2s",
              border: selecionado ? `1.5px solid ${CYN}` : "1px solid rgba(255,255,255,0.05)",
              background: selecionado ? "rgba(34, 211, 238, 0.1)" : "rgba(0,0,0,0.2)",
              color: selecionado ? CYN : "#94a3b8"
            }}>
              <span style={{ fontSize: "16px" }}>{ch.icon}</span> {ch.label}
            </button>
          );
        })}
      </div>

      {/* DESCRIÇÃO DO CANAL */}
      <div style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.6", marginBottom: "25px", padding: "0 5px" }}>
        {infoCanal?.desc}
      </div>

      <ForumComposer user={user} canalAtivo={canalAtivo} infoCanal={infoCanal} data={data} />

      <div style={{ marginTop: "30px" }}>
        {listaPosts.map(post => (
          <ForumPost key={post.id} post={post} user={user} canalAtivo={canalAtivo} listaPosts={listaPosts} />
        ))}
      </div>
    </div>
  );
}
