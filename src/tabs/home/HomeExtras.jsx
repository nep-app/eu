import React, { useState, useContext } from 'react';
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { db, notifyAdmin, sendAdminMessage } from "../../firebase.js";
import { CARD, SL, CYN, BLUE, PNK, YLW, INP, Btn, TXT_MUT, GRN, Linkify } from "../../theme.jsx";
import { nowFull, getWeekKey, fmtDate, isOverdue, SPECIAL_USERS } from "../../data.js";
import { ThemeCtx } from "../../JovensApp.jsx";

export default function HomeExtras({ user, data, setTab }) {
  const light = useContext(ThemeCtx);
  const [mensagemTexto, setMensagemTexto]           = useState("");
  const [mensagemAnonima, setMensagemAnonima]       = useState(false);
  const [mensagemEnviadaSucesso, setMensagemEnviadaSucesso] = useState(false);
  const destinatarios = ["admin"];

  const uData              = data.userData || {};
  const rankingDados       = data.leaderboard || {};
  const listaMissoes       = data.missions || [];
  const missoesConcluidas  = data.completedMissions || [];
  const dayStreak          = uData.dayStreak || 0;
  const weekStartTs        = data.weekStartTs || 0;
  const weekXp             = weekStartTs > 0
    ? (data.history || []).filter(h => (h.ts || 0) >= weekStartTs && (h.xp || 0) > 0).reduce((s, h) => s + (h.xp || 0), 0)
    : (uData.weekXp || 0);

  const destaquesXp = Object.entries(rankingDados)
    .map(([username, d]) => ({ username, ...d }))
    .filter(d => !SPECIAL_USERS.includes(d.username) && (d.xp || 0) > 0)
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .slice(0, 3)
    .sort(() => Math.random() - 0.5);

  function getDayStreakUpdate() {
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (uData.lastActiveDay === today) return {};
    const newStreak = uData.lastActiveDay === yesterday ? (uData.dayStreak || 0) + 1 : 1;
    return { dayStreak: newStreak, lastActiveDay: today };
  }

  async function enviarMensagem() {
    if (!mensagemTexto.trim() || destinatarios.length === 0) return;
    const ts = Date.now();

    if (destinatarios.includes("admin")) {
      await sendAdminMessage({
        text: mensagemTexto, anon: mensagemAnonima,
        from: mensagemAnonima ? "Anónimo" : user.username,
        hiddenUser: user.username, date: nowFull(), ts, adminReply: ""
      });
      await notifyAdmin({
        tipo: "MENSAGEM", anon: mensagemAnonima,
        jovem: user.username,
        texto: mensagemTexto.substring(0, 60),
        ts, lida: false
      });
    }

    const newHistory = [...(data.history || []), { date:nowFull(), action:"Enviou uma mensagem", ts, xp:5 }];
    await setDoc(doc(db, "userData", user.username), { history:newHistory, weekXp:(uData.weekXp||0)+5 }, { merge:true });
    setMensagemTexto(""); setMensagemEnviadaSucesso(true);
    setTimeout(() => setMensagemEnviadaSucesso(false), 3000);
  }

  return (
    <>

      {/* ── DESTAQUES DA SEMANA ───────────────────────────────────── */}
      <div style={{ ...CARD }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:1.5, color: light ? "#4b5563" : "#7da3c4", textTransform:"uppercase" }}>
            ⭐ Destaques da semana
          </div>
          <div style={{ fontSize:9, fontWeight:700, color: light ? "#9ca3af" : "#4a6080", letterSpacing:0.5, textTransform:"uppercase" }}>
            ordem aleatória
          </div>
        </div>
        {destaquesXp.length > 0 ? (
          <div style={{ fontSize:16, fontWeight:800, lineHeight:1.8, color:"#94a3b8" }}>
            {destaquesXp.map((jovem, i) => (
              <span key={jovem.username}>
                <span style={{ color:jovem.color, fontWeight:900 }}>{jovem.name}</span>
                {i < destaquesXp.length - 2 && ", "}
                {i === destaquesXp.length - 2 && " e "}
              </span>
            ))}
            <span style={{ fontSize:18, marginLeft:6 }}>✨</span>
          </div>
        ) : (
          <div style={{ fontSize:13, color:"#94a3b8", fontStyle:"italic" }}>
            Esta semana ainda não temos destaques — vai lá ganhar XP! 🚀
          </div>
        )}
      </div>

      {/* ── MENSAGEM ────────────────────────────────────────────────── */}
      <div style={CARD}>
        <div style={SL}>📱 Enviar Mensagem</div>
        <div style={{ display:"flex", gap:10, marginBottom:14 }}>
          <a href="https://wa.me/351916025666" target="_blank" rel="noreferrer" style={{
            flex:1, background:"rgba(37,211,102,0.18)", color:"#25D366",
            textDecoration:"none", padding:"13px 12px", borderRadius:14, textAlign:"center",
            fontWeight:700, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            border:"1px solid rgba(37,211,102,0.35)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </a>
          <a href="mailto:teresa.castro@cm-cascais.pt" style={{
            flex:1, background:"rgba(33,150,243,0.18)", color:"#60a5fa",
            textDecoration:"none", padding:"13px 12px", borderRadius:14, textAlign:"center",
            fontWeight:700, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            border:"1px solid rgba(33,150,243,0.35)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            Email
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
            <div style={{ fontSize:11, fontWeight:900, color: light ? "#4b5563" : "#7da3c4", textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Para: Teresa (GO)</div>

            <textarea value={mensagemTexto} onChange={e => setMensagemTexto(e.target.value)}
              style={{ ...INP, minHeight:80, resize:"none", marginBottom:10 }}
              placeholder="Dúvida, sugestão ou desabafo..." />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#94a3b8", cursor:"pointer" }}>
                <input type="checkbox" checked={mensagemAnonima} onChange={() => setMensagemAnonima(!mensagemAnonima)} style={{ display:"none" }} />
                <div style={{ width:18, height:18, borderRadius:5, flexShrink:0, border: mensagemAnonima ? `2px solid ${PNK}` : "2px solid #64748b", background: mensagemAnonima ? PNK : "transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                  {mensagemAnonima && <span style={{ color:"#fff", fontSize:11, fontWeight:900, lineHeight:1 }}>✓</span>}
                </div>
                Anónimo
              </label>
              <button onClick={enviarMensagem} disabled={destinatarios.length === 0} style={{
                background: destinatarios.length === 0 ? "rgba(255,255,255,0.05)" : PNK,
                color: destinatarios.length === 0 ? "#64748b" : "#070b14",
                border:"none", padding:"10px 24px",
                borderRadius:12, fontWeight:900, cursor: destinatarios.length === 0 ? "default" : "pointer", fontSize:12, letterSpacing:0.8 }}>
                ENVIAR
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
