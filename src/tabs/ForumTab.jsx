import React, { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, query, orderBy, doc } from "firebase/firestore";
import { db } from "../firebase.js";
import { CYN, TXT_MUT, BG, PNK, GRN } from "../theme.jsx";
import { CHANNELS, JEEP_LIST, getWeekKey } from "../data.js";
import { ThemeCtx } from "../JovensApp.jsx";
import ForumPost     from './forum/ForumPost.jsx';
import ForumComposer from './forum/ForumComposer.jsx';

// Per-channel accent colors for light mode
const CHANNEL_COLORS = {
  anuncios:  "#f59e0b", // amber — announcements
  csi:       "#ef4444", // red — CSI investigative
  monitor:   "#22c55e", // green — trophies/victories
  backstage: "#ec4899", // pink — creative/stage
  coffee:    "#78716c", // warm brown — coffee
};

const RECURSOS = [
  { label:"Guia Bem-estar Digital", icon:"📱", href:"bem-estar-digital.html", desc:"Conceitos, hábitos e ferramentas para uma relação saudável com o digital" },
];

const isAdmin = (u) => u?.username === "admin" || u?.username === "teresa";

export default function ForumTab({ user, forumCollection = "forum" }) {
  const light = useContext(ThemeCtx);
  const [canalAtivo, setCanalAtivo] = useState("anuncios");
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
    const q = query(collection(db, forumCollection, canalAtivo, "posts"), orderBy("time", "desc"));
    return onSnapshot(q, snap => setListaPosts(snap.docs.map(d => ({ id:d.id, ...d.data() }))));
  }, [canalAtivo, forumCollection]);

  const canalInfo = CHANNELS.find(c => c.id === canalAtivo);
  const adminOnlyLocked = canalInfo?.adminOnly && !isAdmin(user);

  return (
    <div style={{ paddingBottom:100 }}>

      {/* ── RECURSOS ─────────────────────────────────────────────────── */}
      <div style={{ padding:"16px 16px 0" }}>
        <div style={{ fontSize:10, fontWeight:900, letterSpacing:2, color: light ? "#6366f1" : "#5a7a9a", textTransform:"uppercase", marginBottom:8 }}>
          📚 Recursos
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {RECURSOS.map(r => (
            <a key={r.href} href={r.href} target="_blank" rel="noreferrer" style={{
              display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:16,
              background: light ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.08)",
              border: light ? "1px solid rgba(99,102,241,0.2)" : "1px solid rgba(99,102,241,0.2)",
              textDecoration:"none", transition:"all 0.15s",
            }}>
              <span style={{ fontSize:22 }}>{r.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:800, color: light ? "#3730a3" : "#a5b4fc" }}>{r.label}</div>
                <div style={{ fontSize:11, color: light ? "#6366f1" : "#818cf8", marginTop:1 }}>{r.desc}</div>
              </div>
              <span style={{ fontSize:12, color: light ? "#6366f1" : "#818cf8", fontWeight:800 }}>→</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── CANAIS ─────────────────────────────────────────────────── */}
      <div style={{ padding:"16px 16px 0", display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8 }}>
        {CHANNELS.map(ch => {
          const sel = canalAtivo === ch.id;
          const chColor = CHANNEL_COLORS[ch.id] || CYN;
          return (
            <button key={ch.id} onClick={() => setCanalAtivo(ch.id)} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              padding:"12px 8px", borderRadius:16, cursor:"pointer", transition:"all 0.18s",
              border: sel
                ? (light ? `2px solid ${chColor}` : `1px solid ${CYN}50`)
                : (light ? `1px solid ${chColor}35` : "1px solid rgba(255,255,255,0.07)"),
              background: sel
                ? (light ? `${chColor}15` : `${CYN}12`)
                : (light ? "#ffffff" : "rgba(255,255,255,0.03)"),
              color: sel ? (light ? chColor : CYN) : (light ? chColor : TXT_MUT),
              boxShadow: sel
                ? (light ? `0 2px 12px ${chColor}25, 0 0 0 1px ${chColor}20` : `0 0 0 1px ${CYN}20`)
                : (light ? "0 1px 4px rgba(0,0,0,0.08)" : "none"),
            }}>
              <span style={{ fontSize:20 }}>{ch.icon}</span>
              <span style={{ fontSize:8, fontWeight:900, textAlign:"center", letterSpacing:0.3, textTransform:"uppercase", lineHeight:1.3 }}>{ch.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── INFO DO CANAL ────────────────────────────────────────────── */}
      <div style={{ margin:"12px 16px 0", padding:"12px 16px", borderRadius:16,
        background: light ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.03)", borderLeft:`2px solid ${CHANNEL_COLORS[canalAtivo] || CYN}60`,
        fontSize:12, color: light ? "#475569" : TXT_MUT, lineHeight:1.6 }}>
        {canalInfo?.desc}
        {canalInfo?.adminOnly && <span style={{ marginLeft:6, fontSize:10, fontWeight:900, color:"#f59e0b" }}>· apenas a Teresa publica</span>}
      </div>

      {/* ── COMPOSER (locked for adminOnly channels unless admin) ──── */}
      <div style={{ padding:"14px 16px 0" }}>
        {adminOnlyLocked ? (
          <div style={{ padding:"14px 16px", borderRadius:16, background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.2)", fontSize:13, color:"#d97706", textAlign:"center" }}>
            🔔 Este canal é só para anúncios da Teresa. Podes comentar nos posts abaixo!
          </div>
        ) : (
          <ForumComposer user={user} canalAtivo={canalAtivo} infoCanal={canalInfo} forumCollection={forumCollection} />
        )}
      </div>

      {/* ── POSTS ───────────────────────────────────────────────────── */}
      <div style={{ padding:"0 16px", marginTop:8 }}>
        {listaPosts.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 20px", color: light ? "#475569" : TXT_MUT, fontSize:13 }}>
            <div style={{ fontSize:32, marginBottom:10 }}>{canalInfo?.icon}</div>
            {canalInfo?.adminOnly ? "Ainda sem anúncios. Aguarda novidades da Teresa!" : "Ainda sem partilhas neste canal. Sê o primeiro!"}
          </div>
        ) : (
          listaPosts.map(post => (
            <ForumPost key={post.id} post={post} user={user} canalAtivo={canalAtivo}
              forumCollection={forumCollection} authorMedals={allMedals[post.username] || []} />
          ))
        )}
      </div>
    </div>
  );
}
