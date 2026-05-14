import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, PNK, INP, Btn, TXT_MUT, GRN } from "../../theme.jsx";
import { nowFull, getWeekKey } from "../../data.js";

export default function HomeExtras({ user, data, setTab }) {
  const [mensagemTexto, setMensagemTexto]           = useState("");
  const [mensagemAnonima, setMensagemAnonima]       = useState(false);
  const [mensagemEnviadaSucesso, setMensagemEnviadaSucesso] = useState(false);

  const uData              = data.userData || {};
  const notificacoesAdmin  = data.myNotifs || [];
  const rankingDados       = data.leaderboard || {};
  const listaMissoes       = data.missions || [];
  const missoesConcluidas  = data.completedMissions || [];
  const dayStreak          = uData.dayStreak || 0;
  const weekXp             = uData.weekXp || 0;

  // Top 3 sem ordem de ranking para utilizadores normais
  const destaquesXp = Object.entries(rankingDados)
    .map(([username, d]) => ({ username, ...d }))
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .slice(0, 3)
    .sort((a, b) => a.name.localeCompare(b.name));

  function getDayStreakUpdate() {
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (uData.lastActiveDay === today) return {};
    const newStreak = uData.lastActiveDay === yesterday ? (uData.dayStreak || 0) + 1 : 1;
    return { dayStreak: newStreak, lastActiveDay: today };
  }

  async function concluirMissaoSemanal(missao) {
    if (missoesConcluidas.includes(missao.id)) return;
    const ts = nowFull();
    const newHistory = [...(data.history || []), { date: ts, action: `Cumpriu a missão: ${missao.text}`, ts: Date.now(), xp: missao.xp || 10 }];
    await setDoc(doc(db, "userData", user.username), {
      completedMissions: [...missoesConcluidas, missao.id],
      history: newHistory,
      weekXp: (uData.weekXp || 0) + (missao.xp || 10),
      ...getDayStreakUpdate()
    }, { merge: true });
    alert(`+${missao.xp || 10} XP ✨`);
  }

  async function enviarMensagemTeresa() {
    if (!mensagemTexto.trim()) return;
    await addDoc(collection(db, "messages"), {
      text: mensagemTexto, anon: mensagemAnonima,
      from: mensagemAnonima ? "Anónimo" : user.username,
      hiddenUser: user.username, date: nowFull(), adminReply: ""
    });
    setMensagemTexto(""); setMensagemEnviadaSucesso(true);
    setTimeout(() => setMensagemEnviadaSucesso(false), 3000);
  }

  const missoesSemana = listaMissoes.filter(m => m.week === getWeekKey());
  const missoesDone   = missoesSemana.filter(m => missoesConcluidas.includes(m.id)).length;

  return (
    <>
      {/* ── NOTIFICAÇÕES DA TERESA ───────────────────────────────────── */}
      {notificacoesAdmin.length > 0 && (
        <div style={{ ...CARD, background:"rgba(244,114,182,0.08)", border:`1px solid ${PNK}30` }}>
          <div style={SL}>📩 Mensagens da Teresa</div>
          {notificacoesAdmin.map(notif => (
            <div key={notif.id} style={{ display:"flex", gap:12, padding:"14px 16px", background:"rgba(0,0,0,0.25)", borderRadius:16, marginBottom:10, border:"1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ flex:1, fontSize:13, lineHeight:1.6, color:"#f1f5f9" }}>{notif.text}</div>
              <button onClick={() => deleteDoc(doc(db, "notifications", user.username, "items", notif.id))} style={{ background:"none", border:"none", color:"#64748b", fontSize:16, cursor:"pointer", paddingTop:2, flexShrink:0 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* ── STREAK + XP ──────────────────────────────────────────────── */}
      {dayStreak > 0 && (
        <div style={{ ...CARD, background:"linear-gradient(135deg, rgba(251,146,60,0.1), rgba(239,68,68,0.08))", border:"1px solid rgba(251,146,60,0.2)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ fontSize:40, animation:"fire-pulse 1.8s ease-in-out infinite", lineHeight:1 }}>🔥</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:22, fontWeight:900, color:"#fb923c" }}>{dayStreak} {dayStreak === 1 ? "dia" : "dias"}</div>
              <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>seguido{dayStreak > 1 ? "s" : ""} a usar a app</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:18, fontWeight:900, color:CYN }}>{weekXp}</div>
              <div style={{ fontSize:10, color:"#64748b", fontWeight:700 }}>XP ESTA SEM.</div>
            </div>
          </div>
        </div>
      )}

      {/* ── MISSÕES DE CAMPO ─────────────────────────────────────────── */}
      {missoesSemana.length > 0 && (
        <div style={CARD}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={SL}>🎯 Missões de Campo</div>
            <div style={{ fontSize:11, fontWeight:800, color: missoesDone === missoesSemana.length ? GRN : CYN }}>
              {missoesDone}/{missoesSemana.length}
            </div>
          </div>
          {/* Barra de progresso das missões */}
          <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:3, marginBottom:16, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${(missoesDone/missoesSemana.length)*100}%`, background:`linear-gradient(90deg,${CYN},${GRN})`, transition:"width 0.5s ease", borderRadius:3 }}/>
          </div>
          {missoesSemana.map(missao => {
            const concluida = missoesConcluidas.includes(missao.id);
            return (
              <div key={missao.id} onClick={() => !concluida && concluirMissaoSemanal(missao)} style={{
                display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:16,
                background: concluida ? "rgba(74,222,128,0.06)" : "rgba(255,255,255,0.03)",
                marginBottom:8, border: concluida ? "1px solid rgba(74,222,128,0.15)" : "1px solid rgba(255,255,255,0.05)",
                cursor: concluida ? "default" : "pointer", transition:"all 0.2s",
              }}>
                <div style={{ width:24, height:24, borderRadius:8, flexShrink:0,
                  background: concluida ? GRN : "rgba(255,255,255,0.06)",
                  border: concluida ? "none" : "1.5px solid rgba(255,255,255,0.1)",
                  display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {concluida && <span style={{ color:"#070b14", fontWeight:900, fontSize:13 }}>✓</span>}
                </div>
                <div style={{ flex:1, fontSize:13, fontWeight:600,
                  color: concluida ? "#64748b" : "#f1f5f9",
                  textDecoration: concluida ? "line-through" : "none" }}>
                  {missao.text}
                </div>
                <div style={{ fontSize:11, fontWeight:800, color: concluida ? "#64748b" : CYN }}>+{missao.xp} XP</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DESTAQUES DA SEMANA (TOP 3 sem ordem) ───────────────────── */}
      <div style={CARD}>
        <div style={SL}>⭐ Destaques da Semana</div>
        {destaquesXp.length === 0 ? (
          <div style={{ textAlign:"center", padding:"20px 0", color:"#64748b", fontSize:13 }}>
            Ainda sem destaques esta semana.<br/>
            <span style={{ fontSize:11 }}>Completa desafios para aparecer aqui!</span>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${destaquesXp.length}, 1fr)`, gap:10 }}>
            {destaquesXp.map(jovem => (
              <div key={jovem.username} style={{
                display:"flex", flexDirection:"column", alignItems:"center", gap:8,
                padding:"16px 8px", borderRadius:18,
                background:`${jovem.color}0e`,
                border:`1px solid ${jovem.color}25`,
              }}>
                <div style={{
                  width:44, height:44, borderRadius:"50%",
                  background:`linear-gradient(135deg,${jovem.color},${jovem.color}77)`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:18, fontWeight:900, color:"#0f172a",
                  boxShadow:`0 0 0 3px ${jovem.color}20`,
                }}>
                  {jovem.name[0]}
                </div>
                <span style={{ fontSize:12, fontWeight:800, color:jovem.color, textAlign:"center" }}>{jovem.name}</span>
                <span style={{ fontSize:9, color:"#64748b", fontWeight:700, letterSpacing:0.5 }}>ATIVO ESTA SEM.</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MENSAGEM À TERESA ────────────────────────────────────────── */}
      <div style={CARD}>
        <div style={SL}>📱 Falar com a Teresa</div>
        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          <a href="https://wa.me/351XXXXXXXXX" target="_blank" rel="noreferrer" style={{
            flex:1, background:"rgba(37,211,102,0.12)", color:"#25D366",
            textDecoration:"none", padding:"12px", borderRadius:14, textAlign:"center",
            fontWeight:800, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            border:"1px solid rgba(37,211,102,0.2)" }}>
            💬 WhatsApp
          </a>
          <a href="mailto:teresa@jeep.pt" style={{
            flex:1, background:"rgba(59,130,246,0.1)", color:"#60a5fa",
            textDecoration:"none", padding:"12px", borderRadius:14, textAlign:"center",
            fontWeight:800, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            border:"1px solid rgba(59,130,246,0.2)" }}>
            ✉️ Email
          </a>
        </div>

        {mensagemEnviadaSucesso ? (
          <div style={{ textAlign:"center", padding:"18px", color:CYN, fontWeight:900,
            background:"rgba(56,189,248,0.08)", borderRadius:14, border:`1px solid ${CYN}25`,
            fontSize:13 }}>
            ✓ Mensagem entregue!
          </div>
        ) : (
          <>
            <textarea value={mensagemTexto} onChange={e => setMensagemTexto(e.target.value)}
              style={{ ...INP, minHeight:80, resize:"none", marginBottom:10 }}
              placeholder="Dúvida, sugestão ou desabafo..." />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#94a3b8", cursor:"pointer" }}>
                <input type="checkbox" checked={mensagemAnonima} onChange={() => setMensagemAnonima(!mensagemAnonima)} style={{ accentColor:PNK, width:16, height:16 }} />
                Anónimo
              </label>
              <button onClick={enviarMensagemTeresa} style={{
                background:PNK, color:"#070b14", border:"none", padding:"10px 24px",
                borderRadius:12, fontWeight:900, cursor:"pointer", fontSize:12, letterSpacing:0.8 }}>
                ENVIAR
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
