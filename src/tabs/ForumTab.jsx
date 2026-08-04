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
  olx:       "#a855f7", // purple — marketplace/trocas
  coffee:    "#78716c", // warm brown — coffee
};

const isAdmin = (u) => u?.username === "admin";

function parseTimeStr(t) {
  if (!t) return 0;
  const MTHS_PT = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
  // Formato completo: "09 Jul 2026, 16:44"
  const m = t.match(/^(\d{1,2})\s+(\w+)\s+(\d{4}),\s*(\d{1,2}):(\d{2})/);
  if (m) {
    const mon = MTHS_PT.indexOf(m[2].toLowerCase());
    if (mon >= 0) return new Date(+m[3], mon, +m[1], +m[4], +m[5]).getTime();
  }
  // Formato antigo só com mês e ano: "Jun 2026" (posts sem hora nem ts).
  // Sem dia, assume o início do mês — chega para os ordenar entre si e
  // face aos posts mais recentes, em vez de irem todos para o valor 0.
  const m2 = t.match(/^(\w+)\s+(\d{4})$/);
  if (m2) {
    const mon = MTHS_PT.indexOf(m2[1].toLowerCase());
    if (mon >= 0) return new Date(+m2[2], mon, 1).getTime();
  }
  return 0;
}

export default function ForumTab({ user, data = {}, forumCollection = "forum", initialCanal = null }) {
  const light = useContext(ThemeCtx);
  const isTeresa = user?.username === "teresa";
  const [canalAtivo, setCanalAtivo] = useState(initialCanal || "anuncios");
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
    const q = query(collection(db, forumCollection, canalAtivo, "posts"));
    return onSnapshot(q, snap => {
      const posts = snap.docs.map(d => ({ id:d.id, ...d.data() }))
        // Posts de teste (com target) só aparecem ao próprio destinatário.
        .filter(p => !p.target || p.target === "all" || p.target === user.username);
      posts.sort((a, b) => {
        const ta = a.ts || parseTimeStr(a.time);
        const tb = b.ts || parseTimeStr(b.time);
        return tb - ta;
      });
      setListaPosts(posts);
    });
  }, [canalAtivo, forumCollection]);


  const canalInfo = CHANNELS.find(c => c.id === canalAtivo);
  const adminOnlyLocked = canalInfo?.adminOnly && !isAdmin(user);

  return (
    <div style={{ paddingBottom:100 }}>

      {/* ── CANAIS ─────────────────────────────────────────────────────── */}
      <div style={{ padding:"16px 16px 0", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:8 }}>
        {CHANNELS.map(ch => {
          const sel = canalAtivo === ch.id;
          const chColor = CHANNEL_COLORS[ch.id] || CYN;
          return (
            <button key={ch.id} onClick={() => setCanalAtivo(ch.id)} style={{
              flex:"0 0 calc(33.333% - 6px)",
              display:"flex", flexDirection:"column", alignItems:"center", gap:4,
              padding:"12px 8px", borderRadius:16, cursor:"pointer", transition:"all 0.18s",
              border: sel ? `1px solid ${chColor}60` : `1px solid ${chColor}35`,
              background: sel ? `${chColor}18` : `${chColor}0c`,
              color: sel ? chColor : `${chColor}cc`,
              boxShadow: sel ? `0 0 0 1px ${chColor}25` : "none",
            }}>
              <span style={{ fontSize:20 }}>{ch.icon}</span>
              <span style={{ fontSize:9, fontWeight:900, textAlign:"center", letterSpacing:0.3, textTransform:"uppercase", lineHeight:1.3 }}>{ch.label}</span>
            </button>
          );
        })}
      </div>

      {(
        <>
          {/* ── INFO DO CANAL ────────────────────────────────────────── */}
          <div style={{ margin:"12px 16px 0", padding:"12px 16px", borderRadius:16,
            background: isTeresa ? "rgba(100,80,180,0.08)" : "rgba(255,255,255,0.04)",
            borderLeft:`2px solid ${CHANNEL_COLORS[canalAtivo] || CYN}60`,
            fontSize:12, color: isTeresa ? "#4a3f80" : TXT_MUT, lineHeight:1.6 }}>
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
