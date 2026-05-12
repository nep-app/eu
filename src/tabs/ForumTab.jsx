import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase.js";
import { SL, CYN, AppIcon, CARD } from "../theme.jsx";
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
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "25px" }}><AppIcon size={80} /></div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
        {CHANNELS.map(ch => (
          <button key={ch.id} onClick={() => setCanalAtivo(ch.id)} style={{ 
            flex: "1 1 auto", padding: "12px 16px", borderRadius: "18px", fontSize: "12px", fontWeight: "800", cursor: "pointer",
            border: canalAtivo === ch.id ? `1.5px solid ${CYN}` : "1px solid rgba(255,255,255,0.1)",
            background: canalAtivo === ch.id ? "rgba(34, 211, 238, 0.15)" : "rgba(255,255,255,0.05)",
            color: canalAtivo === ch.id ? CYN : "#94a3b8"
          }}>{ch.icon} {ch.label.toUpperCase()}</button>
        ))}
      </div>

      <ForumComposer user={user} canalAtivo={canalAtivo} infoCanal={infoCanal} data={data} />

      <div style={{ marginTop: "30px" }}>
        <div style={{ ...SL, marginBottom: "20px" }}>Mural de Conversas</div>
        {listaPosts.map(post => (
          <ForumPost key={post.id} post={post} user={user} canalAtivo={canalAtivo} listaPosts={listaPosts} />
        ))}
      </div>
    </div>
  );
}
