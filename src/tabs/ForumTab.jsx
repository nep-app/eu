import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc } from "firebase/firestore";
import { db } from "../firebase.js";
import { CYN, TXT_MUT, BG } from "../theme.jsx";
import { CHANNELS, JEEP_LIST, getWeekKey } from "../data.js";
import ForumPost     from './forum/ForumPost.jsx';
import ForumComposer from './forum/ForumComposer.jsx';

export default function ForumTab({ user }) {
  const [canalAtivo, setCanalAtivo] = useState("csi");
  const [listaPosts, setListaPosts]  = useState([]);
  const [allMedals,  setAllMedals]   = useState({});

  // Load current-week medals for all users
  useEffect(() => {
    const wk = getWeekKey();
    const unsubs = JEEP_LIST.map(j =>
      onSnapshot(doc(db, "medals", j.username), s => {
        if (!s.exists()) return;
        const d = s.data();
        const week = d.weekKey === wk ? (d.week || []) : [];
        setAllMedals(prev => ({ ...prev, [j.username]: week }));
      })
    );
    return () => unsubs.forEach(u => u());
  }, []);

  useEffect(() => {
    const q = query(collection(db, "forum", canalAtivo, "posts"), orderBy("time", "desc"));
    return onSnapshot(q, snap => setListaPosts(snap.docs.map(d => ({ id:d.id, ...d.data() }))));
  }, [canalAtivo]);

  const infoCanal = CHANNELS.find(c => c.id === canalAtivo);

  return (
    <div style={{ paddingBottom:100 }}>

      {/* ── CANAIS EM GRELHA 3×2 ────────────────────────────────────── */}
      <div style={{ padding:"16px 16px 0", display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8 }}>
        {CHANNELS.map(ch => {
          const sel = canalAtivo === ch.id;
          return (
            <button key={ch.id} onClick={() => setCanalAtivo(ch.id)} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              padding:"12px 8px", borderRadius:16, cursor:"pointer", transition:"all 0.18s",
              border: sel ? `1px solid ${CYN}50` : "1px solid rgba(255,255,255,0.07)",
              background: sel ? `${CYN}12` : "rgba(255,255,255,0.03)",
              color: sel ? CYN : TXT_MUT,
              boxShadow: sel ? `0 0 0 1px ${CYN}20` : "none",
            }}>
              <span style={{ fontSize:20 }}>{ch.icon}</span>
              <span style={{ fontSize:8, fontWeight:900, textAlign:"center", letterSpacing:0.3, textTransform:"uppercase", lineHeight:1.3 }}>{ch.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── INFO DO CANAL ────────────────────────────────────────────── */}
      <div style={{ margin:"12px 16px 0", padding:"12px 16px", borderRadius:16,
        background:"rgba(255,255,255,0.03)", borderLeft:`2px solid ${CYN}50`,
        fontSize:12, color:TXT_MUT, lineHeight:1.6 }}>
        {infoCanal?.desc}
      </div>

      {/* ── COMPOSER ────────────────────────────────────────────────── */}
      <div style={{ padding:"14px 16px 0" }}>
        <ForumComposer user={user} canalAtivo={canalAtivo} infoCanal={infoCanal} />
      </div>

      {/* ── POSTS ───────────────────────────────────────────────────── */}
      <div style={{ padding:"0 16px", marginTop:8 }}>
        {listaPosts.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 20px", color:TXT_MUT, fontSize:13 }}>
            <div style={{ fontSize:32, marginBottom:10 }}>{infoCanal?.icon}</div>
            Ainda sem partilhas neste canal. Sê o primeiro!
          </div>
        ) : (
          listaPosts.map(post => (
            <ForumPost key={post.id} post={post} user={user} canalAtivo={canalAtivo}
              authorMedals={allMedals[post.username] || []} />
          ))
        )}
      </div>
    </div>
  );
}
