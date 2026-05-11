import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { CARD, SL, CYN, PNK, INP, Btn, PS } from "../theme.jsx";
import { 
  nowLabel, fmtDate, isOverdue, getWeekKey, EVT_COLORS, EVT_ICONS 
} from "../data.js";

export default function HomeTab({ user, data, setTab }) {
  const [msgTxt, setMsgTxt] = useState("");
  const [msgAnon, setMsgAnon] = useState(false);
  const [msgSent, setMsgSent] = useState(false);

  const uData = data.userData || {};
  const myNotifs = data.myNotifs || [];
  const todos = data.todos || [];
  const events = data.events || [];
  const leaderboard = data.leaderboard || {};
  const missions = data.missions || [];
  const completedMissions = data.completedMissions || [];

  // ── LÓGICA DE PENDENTES ──
  let pendingItems = [];
  if (!uData.answered)  pendingItems.push({ status:"urgent",  icon:"💬", title:"Pergunta da semana", go:()=>setTab("desafios") });
  if (!uData.autoSaved) pendingItems.push({ status:"pending", icon:"📊", title:"Autoavaliação mensal", go:()=>setTab("desafios") });
  if (!uData.sSaved)    pendingItems.push({ status:"new",     icon:"😊", title:"Avaliação de Satisfação", go:()=>setTab("desafios") });
  if (!uData.piaSaved)  pendingItems.push({ status:"pending", icon:"🚀", title:"Completar o teu PIA", go:()=>setTab("pia") });

  // ── LÓGICA DE TOP 3 ──
  const top3 = Object.entries(leaderboard).sort((a,b) => b[1].xp - a[1].xp).slice(0,3);

  // ── FUNÇÕES ──
  async function sendQuickMsg() {
    if (!msgTxt.trim()) return;
    await addDoc(collection(db, "messages"), { 
      text: msgTxt, 
      anon: msgAnon, 
      from: msgAnon ? "Anónimo" : user.username, 
      hiddenUser: user.username, 
      date: nowLabel(), 
      adminReply: "" 
    });
    setMsgTxt(""); setMsgSent(true);
    setTimeout(() => setMsgSent(false), 3000);
  }

  async function toggleTodo(t) {
    await updateDoc(doc(db, "todos", user.username, "items", t.id), { done: !t.done });
    if(!t.done) {
      const newH = [...(data.history || []), { date: nowLabel(), action: `Concluiu: ${t.text}`, ts: Date.now() }];
      await setDoc(doc(db, "userData", user.username), { 
        history: newH, 
        weekXp: (uData.weekXp || 0) + 5 
      }, { merge: true });
    }
  }

  async function completeMission(m) {
    if (completedMissions.includes(m.id)) return;
    const newComp = [...completedMissions, m.id];
    const newH = [...(data.history || []), { date: nowLabel(), action: `Missão: ${m.text}`, ts: Date.now() }];
    await setDoc(doc(db, "userData", user.username), { 
      completedMissions: newComp, 
      history: newH,
      weekXp: (uData.weekXp || 0) + (m.xp || 10)
    }, { merge: true });
  }

  return (
    <div style={{ padding: "18px 16px" }}>
      
      {/* 1. NOTIFICAÇÕES DA ADMIN */}
      {myNotifs.length > 0 && (
        <div style={{ ...CARD, background: "rgba(244, 114, 182, 0.12)", border: `1.5px solid ${PNK}` }}>
          <div style={SL}>Avisos da Teresa</div>
          {myNotifs.map(n => (
            <div key={n.id} style={{ display: "flex", gap: 10, padding: "12px", background: "rgba(0,0,0,0.35)", borderRadius: 16, marginBottom: 8, alignItems: "flex-start" }}>
              <div style={{ flex: 1, fontSize: 13, lineHeight: 1.5 }}>{n.text}</div>
              <button onClick={() => deleteDoc(doc(db, "notifications", user.username, "items", n.id))} style={{ background: "none", border: "none", color: PNK, fontSize: 18, cursor: "pointer" }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* 2. PRIORIDADES (O QUE FALTA FAZER) */}
      {pendingItems.length > 0 && (
        <div style={CARD}>
          <div style={SL}>Prioridades</div>
          {pendingItems.map((item, i) => (
            <div key={i} onClick={item.go} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px", borderRadius: 18, background: PS[item.status].bg, marginBottom: 8, border: `1px solid ${PS[item.status].bl}`, cursor: "pointer" }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div style={{ flex: 1, fontSize: 14, fontWeight: 800 }}>{item.title}</div>
              <div style={{ fontSize: 10, fontWeight: 900, color: PS[item.status].bc, background: "rgba(0,0,0,0.2)", padding: "2px 8px", borderRadius: 8 }}>{PS[item.status].badge}</div>
            </div>
          ))}
        </div>
      )}

      {/* 3. TO-DO LIST (DINÂMICA) */}
      <div style={CARD}>
        <div style={SL}>✅ Minha To-Do List</div>
        {todos.filter(t => !t.done).length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "10px 0" }}>Tudo em dia! 🎉</div>
        ) : (
          todos.filter(t => !t.done).slice(0, 3).map(t => (
            <div key={t.id} onClick={() => toggleTodo(t)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
              <div style={{ width: 22, height: 22, borderRadius: 8, border: `2px solid ${CYN}`, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{t.text}</div>
                {t.due && <div style={{ fontSize: 10, color: isOverdue(t.due) ? "#f43f5e" : "#94a3b8" }}>Até {fmtDate(t.due)}</div>}
              </div>
            </div>
          ))
        )}
        <div style={{ marginTop: 15 }}>
          <Btn variant="dark" onClick={() => setTab("perfil")}>Ver todas as tarefas</Btn>
        </div>
      </div>

      {/* 4. AGENDA (PRÓXIMOS EVENTOS) */}
      <div style={CARD}>
        <div style={SL}>📅 Agenda</div>
        {events.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "10px 0" }}>Sem eventos agendados.</div>
        ) : (
          events.slice(0, 2).map(e => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ padding: 10, background: `${EVT_COLORS[e.type] || CYN}20`, borderRadius: 12, fontSize: 18 }}>{EVT_ICONS[e.type] || "📌"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{e.title}</div>
                <div style={{ fontSize: 11, color: CYN, fontWeight: 700 }}>{fmtDate(e.date)} {e.time && `· ${e.time}`}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. TOP 3 DA SEMANA */}
      <div style={CARD}>
        <div style={SL}>⭐ Jovens Mais Ativos</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {top3.length === 0 ? (
            <div style={{ fontSize: 12, color: "#94a3b8" }}>A calcular pontuações...</div>
          ) : (
            top3.map((e, idx) => (
              <div key={e[0]} style={{ padding: "8px 14px", background: "rgba(255,255,255,0.06)", borderRadius: 24, border: `1.5px solid ${CYN}30`, fontSize: 12, fontWeight: 900, color: CYN, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ opacity: 0.5 }}>#{idx + 1}</span> {e[1].name}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 6. MISSÕES SEMANAIS */}
      {missions.filter(m => m.week === getWeekKey()).length > 0 && (
        <div style={CARD}>
          <div style={SL}>🎯 Missões da Semana</div>
          {missions.filter(m => m.week === getWeekKey()).map(m => {
            const isDone = completedMissions.includes(m.id);
            return (
              <div key={m.id} onClick={() => !isDone && completeMission(m)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 16, background: isDone ? "rgba(34, 211, 238, 0.08)" : "rgba(0,0,0,0.2)", marginBottom: 8, opacity: isDone ? 0.6 : 1, cursor: isDone ? "default" : "pointer" }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: isDone ? CYN : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isDone && <span style={{ color: "#070b14", fontWeight: 900 }}>✓</span>}
                </div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600, textDecoration: isDone ? "line-through" : "none" }}>{m.text}</div>
                <div style={{ fontSize: 11, fontWeight: 900, color: CYN }}>+{m.xp} XP</div>
              </div>
            );
          })}
        </div>
      )}

      {/* 7. CONTACTAR A TERESA */}
      <div style={CARD}>
        <div style={SL}>📱 Contactar a Coordenadora</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
          <a href="https://wa.me/351916025666" target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: "none" }}>
            <Btn color="#22c55e" style={{ fontSize: 11 }}>📲 WhatsApp</Btn>
          </a>
          <a href="mailto:teresa.castro@cm-cascais.pt" style={{ flex: 1, textDecoration: "none" }}>
            <Btn color={CYN} style={{ fontSize: 11 }}>✉️ Email</Btn>
          </a>
        </div>
        
        {msgSent ? (
          <div style={{ textAlign: "center", padding: "10px", color: CYN, fontWeight: 800 }}>✓ Mensagem enviada!</div>
        ) : (
          <div>
            <textarea value={msgTxt} onChange={e => setMsgTxt(e.target.value)} style={INP} rows={2} placeholder="Ou envia mensagem interna..." />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input type="checkbox" checked={msgAnon} onChange={() => setMsgAnon(!msgAnon)} />
                <span style={{ fontSize: 11, color: "#94a3b8" }}>Anónimo</span>
              </label>
              <button onClick={sendQuickMsg} style={{ background: PNK, color: "#070b14", border: "none", padding: "8px 16px", borderRadius: 12, fontWeight: 900, cursor: "pointer" }}>ENVIAR</button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
