import React, { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, query, orderBy, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { CYN, TXT_MUT, BG, PNK, GRN } from "../theme.jsx";
import { CHANNELS, JEEP_LIST, getWeekKey, nowLabel } from "../data.js";
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

const RECURSOS_FIXOS = [
  { id:"__bem-estar", icone:"📱", titulo:"Guia Bem-estar Digital", url:"bem-estar-digital.html", desc:"Conceitos, hábitos e ferramentas para uma relação saudável com o digital" },
];

const isAdmin = (u) => u?.username === "admin";

export default function ForumTab({ user, data = {}, forumCollection = "forum", initialCanal = null }) {
  const light = useContext(ThemeCtx);
  const [canalAtivo, setCanalAtivo] = useState(initialCanal || "anuncios");
  const [listaPosts, setListaPosts]  = useState([]);
  const [allMedals,  setAllMedals]   = useState({});
  const [recursos,   setRecursos]    = useState(RECURSOS_FIXOS);

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

  useEffect(() => {
    return onSnapshot(collection(db, "recursos"), snap => {
      const fromDb = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.ts || 0) - (b.ts || 0));
      setRecursos([...RECURSOS_FIXOS, ...fromDb]);
    });
  }, []);

  const canalInfo = CHANNELS.find(c => c.id === canalAtivo);
  const adminOnlyLocked = canalInfo?.adminOnly && !isAdmin(user);

  return (
    <div style={{ paddingBottom:100 }}>

      {/* ── CANAIS + RECURSOS ──────────────────────────────────────────── */}
      <div style={{ padding:"16px 16px 0", display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8 }}>
        {CHANNELS.map(ch => {
          const sel = canalAtivo === ch.id;
          const chColor = CHANNEL_COLORS[ch.id] || CYN;
          return (
            <button key={ch.id} onClick={() => setCanalAtivo(ch.id)} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              padding:"12px 8px", borderRadius:16, cursor:"pointer", transition:"all 0.18s",
              border: sel ? `1px solid ${chColor}60` : "1px solid rgba(255,255,255,0.10)",
              background: sel ? `${chColor}14` : "rgba(255,255,255,0.06)",
              color: sel ? chColor : TXT_MUT,
              boxShadow: sel ? `0 0 0 1px ${chColor}25` : "none",
            }}>
              <span style={{ fontSize:20 }}>{ch.icon}</span>
              <span style={{ fontSize:8, fontWeight:900, textAlign:"center", letterSpacing:0.3, textTransform:"uppercase", lineHeight:1.3 }}>{ch.label}</span>
            </button>
          );
        })}
        {/* Recursos — mostra só 1 botão no grid (abre lista inline) */}
        <button onClick={async () => {
          setCanalAtivo("__recursos");
          const uData = data.userData || {};
          if (!uData.recursosVisitados) {
            const ts = Date.now();
            const newHistory = [...((data.history) || []), { date:nowLabel(), action:"Visitou os recursos", ts, xp:20 }];
            await setDoc(doc(db, "userData", user.username), { recursosVisitados:true, history:newHistory, weekXp:(uData.weekXp||0)+20 }, { merge:true });
          }
        }} style={{
          display:"flex", flexDirection:"column", alignItems:"center", gap:4,
          padding:"12px 8px", borderRadius:16, cursor:"pointer", transition:"all 0.18s",
          border: canalAtivo === "__recursos" ? "1px solid rgba(99,102,241,0.55)" : "1px solid rgba(99,102,241,0.22)",
          background: canalAtivo === "__recursos" ? "rgba(99,102,241,0.16)" : "rgba(255,255,255,0.06)",
          color: canalAtivo === "__recursos" ? "#818cf8" : "#6b7cb8",
          boxShadow: canalAtivo === "__recursos" ? "0 0 0 1px rgba(99,102,241,0.25)" : "none",
        }}>
          <span style={{ fontSize:20 }}>📚</span>
          <span style={{ fontSize:8, fontWeight:900, textAlign:"center", letterSpacing:0.3, textTransform:"uppercase", lineHeight:1.3 }}>Recursos</span>
        </button>
      </div>

      {canalAtivo === "__recursos" ? (
        /* ── VISTA DE RECURSOS ──────────────────────────────────────── */
        <div style={{ padding:"16px 16px 0" }}>
          <div style={{ fontSize:10, fontWeight:900, letterSpacing:2, color: light ? "#4a3f80" : "#6366f1", textTransform:"uppercase", marginBottom:12 }}>
            📚 Recursos
          </div>
          {recursos.length === 0 ? (
            <div style={{ textAlign:"center", padding:"30px 20px", color: light ? "#6b5fa8" : TXT_MUT, fontSize:13 }}>
              Ainda não há recursos disponíveis.
            </div>
          ) : (
            recursos.map(r => {
              const safeUrl = /^https?:\/\//i.test(r.url) ? r.url : "#";
              return (
              <a key={r.id} href={safeUrl} target="_blank" rel="noreferrer" style={{
                display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:18,
                background:"rgba(99,102,241,0.08)",
                border:"1px solid rgba(99,102,241,0.20)",
                textDecoration:"none", marginBottom:10, transition:"all 0.15s",
              }}>
                <span style={{ fontSize:26, flexShrink:0 }}>{r.icone || "📄"}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:"#a5b4fc" }}>{r.titulo}</div>
                  {r.desc && <div style={{ fontSize:11, color:"#818cf8", marginTop:2 }}>{r.desc}</div>}
                </div>
                <span style={{ fontSize:14, color:"#818cf8" }}>→</span>
              </a>
              );
            })
          )}
        </div>
      ) : (
        <>
          {/* ── INFO DO CANAL ────────────────────────────────────────── */}
          <div style={{ margin:"12px 16px 0", padding:"12px 16px", borderRadius:16,
            background:"rgba(255,255,255,0.04)",
            borderLeft:`2px solid ${CHANNEL_COLORS[canalAtivo] || CYN}60`,
            fontSize:12, color:TXT_MUT, lineHeight:1.6 }}>
            {canalInfo?.desc}
            {canalInfo?.adminOnly && <span style={{ marginLeft:6, fontSize:10, fontWeight:900, color:"#f59e0b" }}>· apenas a Teresa publica</span>}
          </div>

          {/* ── COMPOSER ─────────────────────────────────────────────── */}
          <div style={{ padding:"14px 16px 0" }}>
            {adminOnlyLocked ? (
              <div style={{ padding:"14px 16px", borderRadius:16, background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.2)", fontSize:13, color:"#d97706", textAlign:"center" }}>
                🔔 Este canal é só para anúncios da Teresa. Podes comentar nos posts abaixo!
              </div>
            ) : (
              <ForumComposer user={user} canalAtivo={canalAtivo} infoCanal={canalInfo} forumCollection={forumCollection} />
            )}
          </div>

          {/* ── POSTS ────────────────────────────────────────────────── */}
          <div style={{ padding:"0 16px", marginTop:8 }}>
            {listaPosts.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 20px", color:TXT_MUT, fontSize:13 }}>
                <div style={{ fontSize:32, marginBottom:10 }}>{canalInfo?.icon}</div>
                {canalInfo?.adminOnly ? "Ainda sem anúncios. Aguarda novidades da Teresa!" : "Ainda sem partilhas neste canal. Sê o primeiro!"}
              </div>
            ) : (
              listaPosts.map(post => {
                const mencaoNotif = (data.myNotifs || []).find(n => n.mencao && !n.read && n.postId === post.id);
                return (
                  <ForumPost key={post.id} post={post} user={user} canalAtivo={canalAtivo}
                    forumCollection={forumCollection} authorMedals={allMedals[post.username] || []}
                    mencaoNotif={mencaoNotif} />
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
