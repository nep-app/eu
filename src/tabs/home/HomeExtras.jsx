import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, PNK, INP, Btn, PS } from "../../theme.jsx";
import { nowLabel, getWeekKey } from "../../data.js";

export default function HomeExtras({ user, data, setTab }) {
  const [mensagemTexto, setMensagemTexto] = useState("");
  const [mensagemAnonima, setMensagemAnonima] = useState(false);
  const [mensagemEnviadaSucesso, setMensagemEnviadaSucesso] = useState(false);

  const uData = data.userData || {};
  const notificacoesAdmin = data.myNotifs || [];
  const rankingDados = data.leaderboard || {};
  const listaMissoes = data.missions || [];
  const missoesConcluidas = data.completedMissions || [];

  const destaquesXp = Object.entries(rankingDados)
    .map(([username, detalhes]) => ({ username, ...detalhes }))
    .sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 3).sort((a, b) => a.name.localeCompare(b.name));

  let acoesPendentes = [];
  if (!uData.answered) acoesPendentes.push({ status: "urgent", icon: "💬", title: "Pergunta da semana", sub: "A Teresa aguarda a tua reflexão", go: () => setTab("desafios") });
  if (!uData.autoSaved) acoesPendentes.push({ status: "pending", icon: "📊", title: "Autoavaliação mensal", sub: "Avalia as tuas competências", go: () => setTab("desafios") });
  if (!uData.sSaved) acoesPendentes.push({ status: "new", icon: "😊", title: "Satisfação", sub: "Diz-nos como corre o programa", go: () => setTab("desafios") });
  if (!uData.piaSaved) acoesPendentes.push({ status: "pending", icon: "🚀", title: "Plano Individual (PIA)", sub: "Desenha o teu projeto", go: () => setTab("pia") });

  async function concluirMissaoSemanal(missao) {
    if (missoesConcluidas.includes(missao.id)) return;
    const newHistory = [...(data.history || []), { date: nowLabel(), action: `Cumpriu a missão: ${missao.text}`, ts: Date.now(), xp: missao.xp || 10 }];
    await setDoc(doc(db, "userData", user.username), { completedMissions: [...missoesConcluidas, missao.id], history: newHistory, weekXp: (uData.weekXp || 0) + (missao.xp || 10) }, { merge: true });
    alert(`Parabéns! Ganhaste +${missao.xp || 10} XP ✨`);
  }

  async function enviarMensagemTeresa() {
    if (!mensagemTexto.trim()) return;
    await addDoc(collection(db, "messages"), { text: mensagemTexto, anon: mensagemAnonima, from: mensagemAnonima ? "Anónimo" : user.username, hiddenUser: user.username, date: nowLabel(), adminReply: "" });
    setMensagemTexto(""); setMensagemEnviadaSucesso(true);
    setTimeout(() => setMensagemEnviadaSucesso(false), 3000);
  }

  return (
    <>
      {notificacoesAdmin.length > 0 && (
        <div style={{ ...CARD, background: "rgba(244, 114, 182, 0.15)", border: `1.5px solid ${PNK}` }}>
          <div style={SL}>Mensagens da Coordenação</div>
          {notificacoesAdmin.map(notif => (
            <div key={notif.id} style={{ display: "flex", gap: 12, padding: "14px", background: "rgba(0,0,0,0.4)", borderRadius: 18, marginBottom: 10 }}>
              <div style={{ flex: 1, fontSize: 13, lineHeight: 1.5, color: "#fff" }}>{notif.text}</div>
              <button onClick={() => deleteDoc(doc(db, "notifications", user.username, "items", notif.id))} style={{ background: "none", border: "none", color: PNK, fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {acoesPendentes.length > 0 && (
        <div style={CARD}>
          <div style={SL}>Ações de Acompanhamento</div>
          {acoesPendentes.map((item, idx) => (
            <div key={idx} onClick={item.go} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 22, background: PS[item.status].bg, marginBottom: 12, border: `1.5px solid ${PS[item.status].bl}`, cursor: "pointer" }}>
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 2 }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {listaMissoes.filter(mis => mis.week === getWeekKey()).length > 0 && (
        <div style={CARD}>
          <div style={SL}>🎯 Missões de Campo</div>
          {listaMissoes.filter(mis => mis.week === getWeekKey()).map(missao => {
            const concluida = missoesConcluidas.includes(missao.id);
            return (
              <div key={missao.id} onClick={() => !concluida && concluirMissaoSemanal(missao)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 20, background: concluida ? "rgba(34, 211, 238, 0.12)" : "rgba(0,0,0,0.3)", marginBottom: 10, opacity: concluida ? 0.6 : 1, cursor: concluida ? "default" : "pointer", border: concluida ? `1px solid ${CYN}40` : "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: concluida ? CYN : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {concluida && <span style={{ color: "#070b14", fontWeight: 900, fontSize: 14 }}>✓</span>}
                </div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: concluida ? "#94a3b8" : "#fff", textDecoration: concluida ? "line-through" : "none" }}>{missao.text}</div>
                <div style={{ fontSize: 12, fontWeight: 900, color: CYN }}>+{missao.xp} XP</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={CARD}>
        <div style={SL}>⭐ Destaques da Semana</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: "10px" }}>
          {destaquesXp.map((jovem) => (
            <div key={jovem.username} style={{ padding: "12px 22px", background: "rgba(34, 211, 238, 0.1)", borderRadius: 28, border: `2px solid ${jovem.color}`, fontSize: 13, fontWeight: 900, color: jovem.color, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: jovem.color }} />{jovem.name.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      <div style={CARD}>
        <div style={SL}>📱 Falar com a Teresa</div>
        {mensagemEnviadaSucesso ? (
          <div style={{ textAlign: "center", padding: "20px", color: CYN, fontWeight: 900, background: "rgba(34, 211, 238, 0.1)", borderRadius: 18, border: `1px solid ${CYN}30` }}>✓ ENTREGUE!</div>
        ) : (
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "18px", borderRadius: 22 }}>
            <textarea value={mensagemTexto} onChange={e => setMensagemTexto(e.target.value)} style={{ ...INP, background: "rgba(0,0,0,0.4)" }} rows={3} placeholder="Dúvida ou sugestão..." />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}><input type="checkbox" checked={mensagemAnonima} onChange={() => setMensagemAnonima(!mensagemAnonima)} style={{ width: 20, height: 20, accentColor: PNK }} /><span style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>Anónimo</span></label>
              <button onClick={enviarMensagemTeresa} style={{ background: PNK, color: "#070b14", border: "none", padding: "12px 28px", borderRadius: 16, fontWeight: 900, cursor: "pointer" }}>ENVIAR</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
