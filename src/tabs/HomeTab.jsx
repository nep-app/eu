import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { CARD, SL, CYN, PNK, INP, Btn, PS } from "../theme.jsx";
import { 
  nowLabel, fmtDate, isOverdue, getWeekKey, EVT_COLORS, EVT_ICONS 
} from "../data.js";

export default function HomeTab({ user, data, setTab }) {
  // ── ESTADOS LOCAIS ──
  const [msgTxt, setMsgTxt] = useState("");
  const [msgAnon, setMsgAnon] = useState(false);
  const [msgSent, setMsgSent] = useState(false);

  // ── EXTRAÇÃO DE DADOS DO ESTADO GLOBAL ──
  // Garantimos que se o dado não existir, a App não "crasha" (usando || [])
  const uData = data.userData || {};
  const myNotifs = data.myNotifs || [];
  const todos = data.todos || [];
  const events = data.events || [];
  const leaderboard = data.leaderboard || {};
  const missions = data.missions || [];
  const completedMissions = data.completedMissions || [];

  // ── 1. LÓGICA DE PRIORIDADES (ITENS PENDENTES) ──
  let pendingItems = [];
  
  if (!uData.answered) {
    pendingItems.push({ 
      status: "urgent", 
      icon: "💬", 
      title: "Pergunta da semana", 
      sub: "A Teresa aguarda a tua reflexão",
      go: () => setTab("desafios") 
    });
  }
  
  if (!uData.autoSaved) {
    pendingItems.push({ 
      status: "pending", 
      icon: "📊", 
      title: "Autoavaliação mensal", 
      sub: "Avalia as tuas competências",
      go: () => { setTab("desafios"); } 
    });
  }
  
  if (!uData.sSaved) {
    pendingItems.push({ 
      status: "new", 
      icon: "😊", 
      title: "Satisfação", 
      sub: "Diz-nos como corre o programa",
      go: () => { setTab("desafios"); } 
    });
  }
  
  if (!uData.piaSaved) {
    pendingItems.push({ 
      status: "pending", 
      icon: "🚀", 
      title: "Plano Individual (PIA)", 
      sub: "Desenha o teu projeto",
      go: () => setTab("pia") 
    });
  }

  // ── 2. MURAL "JOVENS EM AÇÃO" (ORDEM ALFABÉTICA) ──
  // Removemos o pódio e o XP para evitar competitividade tóxica
  const activeUsers = Object.entries(leaderboard)
    .map(([username, details]) => ({ 
      username, 
      name: details.name, 
      color: details.color 
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // ── 3. FUNÇÕES DE INTERAÇÃO ──

  async function sendQuickMsg() {
    if (!msgTxt.trim()) return;
    try {
      await addDoc(collection(db, "messages"), { 
        text: msgTxt, 
        anon: msgAnon, 
        from: msgAnon ? "Anónimo" : user.username, 
        hiddenUser: user.username, 
        date: nowLabel(), 
        adminReply: "" 
      });
      setMsgTxt(""); 
      setMsgSent(true);
      setTimeout(() => setMsgSent(false), 3000);
    } catch (error) {
      alert("Erro ao enviar mensagem.");
    }
  }

  async function toggleTodo(t) {
    try {
      const todoRef = doc(db, "todos", user.username, "items", t.id);
      await updateDoc(todoRef, { done: !t.done });
      
      // Se marcou como concluído, ganha XP e gera log no histórico
      if (!t.done) {
        const currentHistory = data.history || [];
        const newHistoryEntry = { 
          date: nowLabel(), 
          action: `Concluiu a tarefa: ${t.text}`, 
          ts: Date.now() 
        };
        
        await setDoc(doc(db, "userData", user.username), { 
          history: [...currentHistory, newHistoryEntry], 
          weekXp: (uData.weekXp || 0) + 5 
        }, { merge: true });
      }
    } catch (error) {
      alert("Erro ao atualizar tarefa.");
    }
  }

  async function completeMission(m) {
    if (completedMissions.includes(m.id)) return;
    
    try {
      const currentHistory = data.history || [];
      const newHistoryEntry = { 
        date: nowLabel(), 
        action: `Cumpriu a missão: ${m.text}`, 
        ts: Date.now() 
      };
      
      await setDoc(doc(db, "userData", user.username), { 
        completedMissions: [...completedMissions, m.id], 
        history: [...currentHistory, newHistoryEntry],
        weekXp: (uData.weekXp || 0) + (m.xp || 10)
      }, { merge: true });
      
      alert(`Excelente! Ganhaste +${m.xp || 10} XP ✨`);
    } catch (error) {
      alert("Erro ao registar missão.");
    }
  }

  // ── 4. RENDERIZAÇÃO DA INTERFACE ──
  return (
    <div style={{ padding: "18px 16px" }}>
      
      {/* SECÇÃO: AVISOS DA ADMIN */}
      {myNotifs.length > 0 && (
        <div style={{ ...CARD, background: "rgba(244, 114, 182, 0.12)", border: `1.5px solid ${PNK}` }}>
          <div style={SL}>Mensagens Diretas</div>
          {myNotifs.map(n => (
            <div key={n.id} style={{ display: "flex", gap: 12, padding: "14px", background: "rgba(0,0,0,0.4)", borderRadius: 18, marginBottom: 8, alignItems: "flex-start" }}>
              <div style={{ flex: 1, fontSize: 13, lineHeight: 1.6, color: "#fff" }}>{n.text}</div>
              <button 
                onClick={() => deleteDoc(doc(db, "notifications", user.username, "items", n.id))} 
                style={{ background: "none", border: "none", color: PNK, fontSize: 18, cursor: "pointer", padding: "0 5px" }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SECÇÃO: TAREFAS PRIORITÁRIAS */}
      <div style={CARD}>
        <div style={SL}>✅ As Minhas Tarefas</div>
        {todos.filter(t => !t.done).length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "15px 0" }}>
            Não tens tarefas pendentes. Bom trabalho! 🎉
          </div>
        ) : (
          todos.filter(t => !t.done).slice(0, 3).map(t => (
            <div key={t.id} onClick={() => toggleTodo(t)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}>
              <div style={{ width: 22, height: 22, borderRadius: 8, border: `2.5px solid ${CYN}`, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{t.text}</div>
                {t.due && (
                  <div style={{ fontSize: 10, color: isOverdue(t.due) ? "#f43f5e" : "#94a3b8", marginTop: 2, fontWeight: 700 }}>
                    📅 LIMITE: {fmtDate(t.due)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div style={{ marginTop: 15 }}>
          <Btn variant="dark" onClick={() => setTab("perfil")}>VER TODA A LISTA</Btn>
        </div>
      </div>

      {/* SECÇÃO: AGENDA */}
      <div style={CARD}>
        <div style={SL}>📅 Próximos Eventos</div>
        {events.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "15px 0" }}>
            Nenhum evento agendado para breve.
          </div>
        ) : (
          events.slice(0, 2).map(e => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 15 }}>
              <div style={{ 
                width: 46, height: 46, background: `${EVT_COLORS[e.type] || CYN}25`, 
                borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 
              }}>
                {EVT_ICONS[e.type] || "📌"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{e.title}</div>
                <div style={{ fontSize: 11, color: CYN, fontWeight: 800, marginTop: 2 }}>
                  {fmtDate(e.date)} {e.time && ` às ${e.time}`}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SECÇÃO: PENDENTES DE RESPOSTA */}
      {pendingItems.length > 0 && (
        <div style={CARD}>
          <div style={SL}>Ações Necessárias</div>
          {pendingItems.map((item, i) => (
            <div key={i} onClick={item.go} style={{ 
              display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 20, 
              background: PS[item.status].bg, marginBottom: 10, border: `1.5px solid ${PS[item.status].bl}`, cursor: "pointer" 
            }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{item.title}</div>
                <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 2 }}>{item.sub}</div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 900, color: PS[item.status].bc, background: "rgba(0,0,0,0.25)", padding: "3px 10px", borderRadius: 10 }}>
                {PS[item.status].badge}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECÇÃO: MISSÕES SEMANAIS */}
      {missions.filter(m => m.week === getWeekKey()).length > 0 && (
        <div style={CARD}>
          <div style={SL}>🎯 Missões da Semana</div>
          {missions.filter(m => m.week === getWeekKey()).map(m => {
            const isDone = completedMissions.includes(m.id);
            return (
              <div 
                key={m.id} 
                onClick={() => !isDone && completeMission(m)} 
                style={{ 
                  display: "flex", alignItems: "center", gap: 12, padding: "14px", borderRadius: 18, 
                  background: isDone ? "rgba(34, 211, 238, 0.1)" : "rgba(0,0,0,0.3)", 
                  marginBottom: 8, opacity: isDone ? 0.6 : 1, cursor: isDone ? "default" : "pointer",
                  border: isDone ? `1px solid ${CYN}40` : "1px solid rgba(255,255,255,0.05)"
                }}
              >
                <div style={{ 
                  width: 24, height: 24, borderRadius: 8, 
                  background: isDone ? CYN : "rgba(255,255,255,0.1)", 
                  display: "flex", alignItems: "center", justifyContent: "center" 
                }}>
                  {isDone && <span style={{ color: "#070b14", fontWeight: 900, fontSize: 14 }}>✓</span>}
                </div>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: isDone ? "#94a3b8" : "#fff", textDecoration: isDone ? "line-through" : "none" }}>
                  {m.text}
                </div>
                <div style={{ fontSize: 11, fontWeight: 900, color: CYN }}>+{m.xp} XP</div>
              </div>
            );
          })}
        </div>
      )}

      {/* SECÇÃO: MURAL JOVENS EM AÇÃO */}
      <div style={CARD}>
        <div style={SL}>✨ Jovens Participantes</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {activeUsers.length === 0 ? (
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Aguardando primeira atividade da semana...</div>
          ) : (
            activeUsers.map((item) => (
              <div key={item.username} style={{ 
                padding: "8px 16px", background: "rgba(255,255,255,0.08)", borderRadius: 24, 
                border: `1px solid ${item.color}50`, fontSize: 12, fontWeight: 800, color: item.color,
                display: "flex", alignItems: "center", gap: 8
              }}>
                <div style={{ 
                  width: 7, height: 7, borderRadius: "50%", background: item.color, 
                  boxShadow: `0 0 10px ${item.color}` 
                }} />
                {item.name}
              </div>
            ))
          )}
        </div>
      </div>

      {/* SECÇÃO: CONTACTO E MENSAGENS */}
      <div style={CARD}>
        <div style={SL}>📱 Contactar a Teresa</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <a href="https://wa.me/351916025666" target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: "none" }}>
            <Btn color="#22c55e" style={{ fontSize: 11 }}>WHATSAPP</Btn>
          </a>
          <a href="mailto:teresa.castro@cm-cascais.pt" style={{ flex: 1, textDecoration: "none" }}>
            <Btn color={CYN} style={{ fontSize: 11 }}>EMAIL</Btn>
          </a>
        </div>
        
        {msgSent ? (
          <div style={{ textAlign: "center", padding: "18px", color: CYN, fontWeight: 900, background: "rgba(34, 211, 238, 0.1)", borderRadius: 16 }}>
            ✓ MENSAGEM ENTREGUE!
          </div>
        ) : (
          <div>
            <textarea 
              value={msgTxt} 
              onChange={e => setMsgTxt(e.target.value)} 
              style={INP} 
              rows={2} 
              placeholder="Escreve uma mensagem rápida..." 
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input 
                  type="checkbox" 
                  checked={msgAnon} 
                  onChange={() => setMsgAnon(!msgAnon)} 
                  style={{ width: 18, height: 18, accentColor: PNK }} 
                />
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>Anónimo</span>
              </label>
              <button 
                onClick={sendQuickMsg} 
                style={{ 
                  background: PNK, color: "#070b14", border: "none", 
                  padding: "10px 24px", borderRadius: 14, fontWeight: 900, cursor: "pointer" 
                }}
              >
                ENVIAR
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
