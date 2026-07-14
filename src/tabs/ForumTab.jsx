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
  // Arcade EDUCA+ escondido por agora (o ficheiro continua em public/jogos/).
  // { id:"__arcade", icone:"🎮", titulo:"Arcade EDUCA+", url:"/eu/jogos/arcade-educa.html", desc:"Três jogos para dinamizar sessões: Aproxima ou Afasta, Tabu e Construtor de Projeto. Funciona offline." },
  { id:"__bem-estar", icone:"📱", titulo:"Guia Bem-estar Digital", url:"/eu/bem-estar-digital.html", desc:"Conceitos, hábitos e ferramentas para uma relação saudável com o digital" },
  {
    id:"__fdr",
    icone:"⚽",
    titulo:"Manual de Treino de Competências",
    desc:"Ferramenta da Associação CAIS para desenvolver valores e competências pessoais e sociais com crianças e jovens",
    sublinks: [
      { label:"🎯 Resumo de Dinâmicas", url:"/eu/resumo-dinamicas-fdr.html", desc:"Seleção de dinâmicas do manual, preparada pela Teresa, para usar no dia-a-dia e para dinamizar com crianças e jovens nos vossos espaços" },
      { label:"📖 Manual Completo", url:"https://drive.google.com/file/d/1T-2eomdfBOgYXnsCAZHkEuV4PBq9N8zq/view?usp=sharing", desc:"Manual original da Associação CAIS com todas as dinâmicas, energizers e indicações de debriefing para 20 competências pessoais e sociais" },
    ],
  },
];

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
    const q = query(collection(db, forumCollection, canalAtivo, "posts"));
    return onSnapshot(q, snap => {
      const posts = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      posts.sort((a, b) => {
        const ta = a.ts || parseTimeStr(a.time);
        const tb = b.ts || parseTimeStr(b.time);
        return tb - ta;
      });
      setListaPosts(posts);
    });
  }, [canalAtivo, forumCollection]);

  useEffect(() => {
    return onSnapshot(collection(db, "recursos"), snap => {
      const fromDb = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        // Recursos com destinatário específico só aparecem a esse jovem (e ao admin).
        .filter(r => !r.target || r.target === "all" || r.target === user.username || isAdmin(user))
        .sort((a, b) => (b.ts || 0) - (a.ts || 0)); // mais recente primeiro
      // Os recursos adicionados (mais recentes no topo) antes dos guias fixos.
      setRecursos([...fromDb, ...RECURSOS_FIXOS]);
    });
  }, [user.username]);

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
          border: canalAtivo === "__recursos" ? "1px solid rgba(139,92,246,0.60)" : "1px solid rgba(139,92,246,0.35)",
          background: canalAtivo === "__recursos" ? "rgba(139,92,246,0.18)" : "rgba(139,92,246,0.07)",
          color: canalAtivo === "__recursos" ? "#a78bfa" : "#a78bfacc",
          boxShadow: canalAtivo === "__recursos" ? "0 0 0 1px rgba(99,102,241,0.25)" : "none",
        }}>
          <span style={{ fontSize:20 }}>📚</span>
          <span style={{ fontSize:9, fontWeight:900, textAlign:"center", letterSpacing:0.3, textTransform:"uppercase", lineHeight:1.3 }}>Recursos</span>
        </button>
      </div>

      {canalAtivo === "__recursos" ? (
        /* ── VISTA DE RECURSOS ──────────────────────────────────────── */
        <div style={{ padding:"16px 16px 0" }}>
          <div style={{ fontSize:10, fontWeight:900, letterSpacing:2, color: isTeresa ? "#4a3f80" : "#6366f1", textTransform:"uppercase", marginBottom:12 }}>
            📚 Recursos
          </div>
          {recursos.length === 0 ? (
            <div style={{ textAlign:"center", padding:"30px 20px", color: light ? "#6b5fa8" : TXT_MUT, fontSize:13 }}>
              Ainda não há recursos disponíveis.
            </div>
          ) : (
            recursos.map(r => {
              const cardStyle = {
                padding:"14px 16px", borderRadius:18, marginBottom:10,
                background: isTeresa ? "rgba(99,102,241,0.10)" : "rgba(99,102,241,0.08)",
                border: isTeresa ? "1px solid rgba(99,102,241,0.40)" : "1px solid rgba(99,102,241,0.20)",
              };
              if (r.sublinks) {
                return (
                  <div key={r.id} style={cardStyle}>
                    <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:12 }}>
                      <span style={{ fontSize:26, flexShrink:0 }}>{r.icone || "📄"}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:800, color: isTeresa ? "#6d28d9" : "#a5b4fc" }}>{r.titulo}</div>
                        {r.desc && <div style={{ fontSize:11, color: isTeresa ? "#7c3aed" : "#818cf8", marginTop:2 }}>{r.desc}</div>}
                      </div>
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {r.sublinks.map((sl, i) => {
                        const slUrl = /^(https?:\/\/|\/)/.test(sl.url) ? sl.url : "#";
                        const isPdf = sl.url.endsWith(".pdf");
                        return (
                          <div key={i} onClick={() => window.open(slUrl, "_blank")} style={{
                            display:"flex", flexDirection:"column", gap:2, padding:"10px 14px", borderRadius:12,
                            background: isTeresa ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.10)",
                            border: isTeresa ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(99,102,241,0.18)",
                            cursor:"pointer", transition:"all 0.15s",
                          }}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                              <span style={{ fontSize:12, fontWeight:800, color: isTeresa ? "#5b21b6" : "#a5b4fc" }}>{sl.label}</span>
                              <span style={{ fontSize:12, color: isTeresa ? "#7c3aed" : "#818cf8" }}>{isPdf ? "⬇️" : "→"}</span>
                            </div>
                            {sl.desc && <div style={{ fontSize:10, color: isTeresa ? "#7c3aed" : "#818cf8", lineHeight:1.4 }}>{sl.desc}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              const safeUrl = /^(https?:\/\/|\/)/.test(r.url) ? r.url : "#";
              return (
                <a key={r.id} href={safeUrl} target="_blank" rel="noreferrer" style={{
                  ...cardStyle, display:"flex", alignItems:"center", gap:14, textDecoration:"none", transition:"all 0.15s",
                }}>
                  <span style={{ fontSize:26, flexShrink:0 }}>{r.icone || "📄"}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:800, color: isTeresa ? "#6d28d9" : "#a5b4fc" }}>{r.titulo}</div>
                    {r.desc && <div style={{ fontSize:11, color: isTeresa ? "#7c3aed" : "#818cf8", marginTop:2 }}>{r.desc}</div>}
                  </div>
                  <span style={{ fontSize:14, color: isTeresa ? "#7c3aed" : "#818cf8" }}>→</span>
                </a>
              );
            })
          )}
        </div>
      ) : (
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
