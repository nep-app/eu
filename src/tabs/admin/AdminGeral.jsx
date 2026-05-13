import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, Btn, INP, PNK } from "../../theme.jsx";
import { nowLabel, getWeekKey, ALLOWED_USERNAMES, JEEP_LIST } from "../../data.js";

export default function AdminGeral({ allShared, leaderboard, adminNotifs, activeQ }) {
  const [launchType, setLaunchType] = useState("auto");
  const [launchTarget, setLaunchTarget] = useState("all");
  const [activeQEdit, setActiveQEdit] = useState("");

  // ── FERRAMENTA DE TESTE (Reset para a Teresa) ──
  async function resetUserParaTeste(username) {
    if (window.confirm(`Limpar progresso de ${username} para testes?`)) {
      await updateDoc(doc(db, "userData", username), {
        answered: false,
        autoSaved: false,
        sSaved: false,
        piaSaved: false,
        weekXp: 0,
        history: []
      });
      alert("Status resetado! Podes testar os cards na Home agora.");
    }
  }

  async function launchRequest() {
    let msg = ""; let fieldToReset = "";
    if (launchType === "auto") { msg = "📊 Nova Autoavaliação pedida!"; fieldToReset = "autoSaved"; }
    if (launchType === "satisf") { msg = "😊 Nova Avaliação de Satisfação pedida!"; fieldToReset = "sSaved"; }
    if (launchType === "roda") { msg = "🌸 Nova Roda da Vida pedida!"; fieldToReset = "rodaSaved"; }
    if (launchType === "pia") { msg = "📋 Atualização do PIA pedida!"; fieldToReset = "piaSaved"; }
    if (launchType === "swot") { msg = "🔍 Raio-X do Projeto pedido!"; fieldToReset = "swotSaved"; }
    
    const targets = launchTarget === "all" ? ALLOWED_USERNAMES : [launchTarget];
    for (const u of targets) {
      await setDoc(doc(db, "userData", u), { [fieldToReset]: false }, { merge: true });
      await addDoc(collection(db, "notifications", u, "items"), { from: "teresa", text: msg, date: nowLabel(), read: false });
    }
    alert("Pedido lançado com sucesso!");
  }

  async function refreshLeaderboard() {
    const scores = {};
    JEEP_LIST.forEach(j => {
      const d = allShared[j.username] || {};
      scores[j.username] = { name: j.name, xp: d.weekXp || 0 };
    });
    try {
      await setDoc(doc(db, "config", "weeklyLeaderboard"), { week: getWeekKey(), scores: scores, lastUpdate: nowLabel() });
      alert("Tabela de XP atualizada com sucesso! 🏆");
    } catch (e) { alert("Erro ao atualizar: " + e.message); }
  }

  async function updateActiveQ() {
    if (!activeQEdit.trim()) return alert("Escreve a pergunta!");
    await setDoc(doc(db, "config", "activeQuestion"), { text: activeQEdit.trim(), mode: ["texto"], date: Date.now() });
    for (const u of ALLOWED_USERNAMES) {
      await setDoc(doc(db, "userData", u), { answered: false }, { merge: true });
      await addDoc(collection(db, "notifications", u, "items"), { from:"teresa", text:"💬 Nova pergunta da semana!", date:nowLabel(), read:false });
    }
    alert("Pergunta publicada!"); setActiveQEdit("");
  }

  async function markAdminNotifAsRead(notifId) {
    await updateDoc(doc(db, "adminNotificacoes", notifId), { lida: true });
  }

  return (
    <div>
      {/* 0. FERRAMENTAS DE TESTE (Novo) */}
      <div style={{ ...CARD, border: `1px solid ${CYN}` }}>
        <div style={SL}>🛠️ Modo de Teste (Reset Rápido)</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {JEEP_LIST.map(j => (
            <button key={j.username} onClick={() => resetUserParaTeste(j.username)} style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 10px", borderRadius: 10, fontSize: 10, cursor: "pointer" }}>
              Reset {j.name}
            </button>
          ))}
        </div>
      </div>

      {/* 1. NOTIFICAÇÕES */}
      {adminNotifs.length > 0 && (
        <div style={{ ...CARD, background:"rgba(239, 68, 68, 0.05)", border:`1px solid rgba(239, 68, 68, 0.2)` }}>
          <div style={{ ...SL, color:"#ef4444" }}>🔔 Alertas Recentes</div>
          <div style={{ maxHeight:200, overflowY:"auto", paddingRight:5 }}>
            {adminNotifs.slice(0, 10).map(n => (
              <div key={n.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px", background:"rgba(0,0,0,0.2)", borderRadius:12, marginBottom:8, borderLeft:n.lida ? "none" : `3px solid #ef4444` }}>
                <div>
                  <div style={{ fontSize:11, color:"#94a3b8" }}>{n.data}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:n.lida?"#cbd5e1":"white" }}>
                    {n.tipo === "AUTOAVALIACAO" ? `📊 ${JEEP_LIST.find(j=>j.username===n.jovem)?.name || n.jovem} entregou a Autoavaliação.` : `😊 Nova Avaliação de Satisfação Anónima.`}
                  </div>
                </div>
                {!n.lida && <button onClick={() => markAdminNotifAsRead(n.id)} style={{ background:"none", border:"1px solid #ef4444", color:"#ef4444", borderRadius:8, padding:"4px 8px", fontSize:11, cursor:"pointer", fontWeight:800 }}>Lido</button>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. LANÇAR PEDIDOS */}
      <div style={CARD}>
        <div style={SL}>Lançar Pedidos aos Jovens</div>
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          <select value={launchType} onChange={e=>setLaunchType(e.target.value)} style={{ flex:1, padding:"12px", borderRadius:12, background:"rgba(0,0,0,0.3)", color:"white", border:"1px solid rgba(255,255,255,0.1)" }}>
            <option value="auto">📊 Autoavaliação</option>
            <option value="satisf">😊 Satisfação</option>
            <option value="roda">🌸 Roda da Vida</option>
            <option value="pia">📋 Atualizar PIA</option>
            <option value="swot">🔍 Raio-X do Projeto</option>
          </select>
          <select value={launchTarget} onChange={e=>setLaunchTarget(e.target.value)} style={{ flex:1, padding:"12px", borderRadius:12, background:"rgba(0,0,0,0.3)", color:"white", border:"1px solid rgba(255,255,255,0.1)" }}>
            <option value="all">Todos os Jovens</option>
            {JEEP_LIST.map(j=><option key={j.username} value={j.username}>{j.name}</option>)}
          </select>
        </div>
        <Btn onClick={launchRequest}>Lançar Pedido 🚀</Btn>
      </div>

      {/* 3. RANKING E XP */}
      <div style={CARD}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:15 }}>
          <div style={SL}>Tabela de XP Semanal</div>
          <button onClick={refreshLeaderboard} style={{ background:CYN, color:"#0f172a", border:"none", padding:"6px 12px", borderRadius:10, fontSize:11, fontWeight:900, cursor:"pointer" }}>ATUALIZAR 🔄</button>
        </div>              
        {Object.entries(leaderboard).sort((a,b)=>b[1].xp-a[1].xp).map((e, i) => (
          <div key={e[0]} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize:14, fontWeight:800, color:"#94a3b8", width:25 }}>#{i+1}</span>
            <div style={{ flex:1, fontSize:14, fontWeight:700 }}>{e[1].name}</div>
            <div style={{ fontSize:14, fontWeight:800, color:CYN }}>{e[1].xp} XP</div>
          </div>
        ))}
      </div>

      {/* 4. PERGUNTA DA SEMANA */}
      <div style={CARD}>
        <div style={SL}>Pergunta da Semana Ativa</div>
        <div style={{ fontSize:13, color:"white", fontWeight:600, marginBottom:15, padding:"12px", background:"rgba(0,0,0,0.2)", borderRadius:12, borderLeft:`4px solid ${CYN}` }}>{activeQ}</div>
        <div style={{ display:"flex", gap:8 }}>
          <input value={activeQEdit} onChange={e=>setActiveQEdit(e.target.value)} placeholder="Nova pergunta..." style={{ ...INP, flex:1, marginBottom:0 }}/>
          <button onClick={updateActiveQ} style={{ background:CYN, color:"#0f172a", border:"none", borderRadius:15, padding:"11px 20px", fontSize:13, fontWeight:800, cursor:"pointer" }}>Publicar</button>
        </div>
      </div>

      {/* 5. RESPOSTAS À PERGUNTA */}
      <div style={CARD}>
        <div style={SL}>Respostas Recebidas</div>
        {JEEP_LIST.map(j => {
          let d = allShared[j.username] || {};
          return (
            <div key={j.username} style={{ padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:d.answered?CYN:"rgba(255,255,255,0.1)" }}/>
                <div style={{ flex:1, fontSize:14, fontWeight:700 }}>{j.name}</div>
                {d.answered && <span style={{ fontSize:10, color:CYN, fontWeight:800 }}>✓ RESPONDEU</span>}
              </div>
              {d.answered && (
                <div style={{ marginLeft:20, marginTop:10, padding:12, background:"rgba(0,0,0,0.2)", borderRadius:12, fontSize:13, color:"#cbd5e1" }}>
                  {d.answerType === "audio" ? <audio src={d.answerMedia} controls style={{ width:"100%", height:30 }} /> : d.answerText}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
