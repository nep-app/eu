import React, { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, query, orderBy, doc, getDocs, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
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
  const [editRecurso, setEditRecurso] = useState(null);
  const [editRecDraft, setEditRecDraft] = useState({});
  const isTeresa = user?.username === "teresa" || user?.username === "admin";

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
      const posts = snap.docs.map((d, i) => ({ id:d.id, ...d.data(), _idx: i }));
      posts.sort((a, b) => {
        const diff = (b.ts || 0) - (a.ts || 0);
        return diff !== 0 ? diff : b._idx - a._idx;
      });
      setListaPosts(posts);
    });
  }, [canalAtivo, forumCollection]);

  useEffect(() => {
    return onSnapshot(collection(db, "recursos"), snap => {
      const fromDb = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.ts || 0) - (b.ts || 0));
      setRecursos([...RECURSOS_FIXOS, ...fromDb]);
    });
  }, []);

  async function guardarEdicaoRecurso(id) {
    if (!editRecDraft.titulo?.trim() || !editRecDraft.url?.trim()) return alert("Título e URL são obrigatórios.");
    try {
      await updateDoc(doc(db, "recursos", id), {
        titulo: editRecDraft.titulo.trim(),
        icone: editRecDraft.icone?.trim() || "📄",
        url: editRecDraft.url.trim(),
        desc: (editRecDraft.desc || "").trim(),
      });
      setEditRecurso(null);
    } catch (e) { alert("Erro: " + e.message); }
  }

  async function eliminarRecursoForum(id) {
    if (!window.confirm("Eliminar este recurso?")) return;
    await deleteDoc(doc(db, "recursos", id));
  }

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
              const isFixed = r.id?.startsWith("__");
              const isEditing = editRecurso === r.id;
              return (
                <div key={r.id} style={{ marginBottom:10 }}>
                  {isEditing ? (
                    <div style={{ padding:"14px 16px", borderRadius:18, background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.35)" }}>
                      <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                        <input value={editRecDraft.icone} onChange={e => setEditRecDraft(p => ({ ...p, icone: e.target.value }))}
                          maxLength={4} style={{ width:50, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"8px", fontSize:20, textAlign:"center", color:"white" }} />
                        <input value={editRecDraft.titulo} onChange={e => setEditRecDraft(p => ({ ...p, titulo: e.target.value }))}
                          placeholder="Título" style={{ flex:1, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"8px 12px", color:"white", fontSize:13 }} />
                      </div>
                      <input value={editRecDraft.url} onChange={e => setEditRecDraft(p => ({ ...p, url: e.target.value }))}
                        placeholder="URL" style={{ width:"100%", background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"8px 12px", color:"white", fontSize:12, marginBottom:8, boxSizing:"border-box" }} />
                      <input value={editRecDraft.desc} onChange={e => setEditRecDraft(p => ({ ...p, desc: e.target.value }))}
                        placeholder="Descrição (opcional)" style={{ width:"100%", background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"8px 12px", color:"white", fontSize:12, marginBottom:8, boxSizing:"border-box" }} />
                      <div style={{ display:"flex", gap:8 }}>
                        <button onClick={() => guardarEdicaoRecurso(r.id)} style={{ flex:1, padding:"9px", background:"rgba(99,102,241,0.25)", border:"1px solid rgba(99,102,241,0.5)", color:"#a5b4fc", borderRadius:10, fontWeight:900, fontSize:12, cursor:"pointer" }}>Guardar</button>
                        <button onClick={() => setEditRecurso(null)} style={{ padding:"9px 14px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8", borderRadius:10, fontSize:12, cursor:"pointer" }}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <a href={safeUrl} target="_blank" rel="noreferrer" style={{
                        flex:1, display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:18,
                        background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.20)",
                        textDecoration:"none", transition:"all 0.15s",
                      }}>
                        <span style={{ fontSize:26, flexShrink:0 }}>{r.icone || "📄"}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:800, color:"#a5b4fc" }}>{r.titulo}</div>
                          {r.desc && <div style={{ fontSize:11, color:"#818cf8", marginTop:2 }}>{r.desc}</div>}
                        </div>
                        <span style={{ fontSize:14, color:"#818cf8" }}>→</span>
                      </a>
                      {isTeresa && !isFixed && (
                        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                          <button onClick={() => { setEditRecDraft({ titulo:r.titulo, icone:r.icone||"📄", url:r.url, desc:r.desc||"" }); setEditRecurso(r.id); }}
                            style={{ background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)", color:"#a5b4fc", borderRadius:8, padding:"5px 8px", cursor:"pointer", fontSize:13 }}>✏️</button>
                          <button onClick={() => eliminarRecursoForum(r.id)}
                            style={{ background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.25)", color:PNK, borderRadius:8, padding:"5px 8px", cursor:"pointer", fontSize:13 }}>🗑️</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
