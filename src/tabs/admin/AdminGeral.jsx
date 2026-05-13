import React, { useState } from 'react';
import { doc, setDoc, addDoc, collection, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, Btn, INP } from "../../theme.jsx";
import { nowLabel, getWeekKey, ALLOWED_USERNAMES, JEEP_LIST } from "../../data.js";

export default function AdminGeral({ allShared, leaderboard, adminNotifs, activeQ }) {
  const [launchType, setLaunchType] = useState("auto");
  const [launchTarget, setLaunchTarget] = useState("all");
  const [activeQEdit, setActiveQEdit] = useState("");
  
  // Novos estados para a Teresa criar botões personalizados
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [opt3, setOpt3] = useState("");

  async function launchRequest() {
    let msg = ""; let field = "";
    if (launchType === "auto") { msg = "📊 Nova Autoavaliação pedida!"; field = "autoSaved"; }
    if (launchType === "satisf") { msg = "😊 Nova Avaliação de Satisfação pedida!"; field = "sSaved"; }
    if (launchType === "roda") { msg = "🌸 Nova Roda da Vida pedida!"; field = "rodaSaved"; }
    if (launchType === "pia") { msg = "📋 Atualização do PIA pedida!"; field = "piaSaved"; }
    if (launchType === "swot") { msg = "🔍 Raio-X do Projeto pedido!"; field = "swotSaved"; }
    
    const targets = launchTarget === "all" ? ALLOWED_USERNAMES : [launchTarget];
    for (const u of targets) {
      await setDoc(doc(db, "userData", u), { [field]: false }, { merge: true });
      await addDoc(collection(db, "notifications", u, "items"), { from: "teresa", text: msg, date: nowLabel(), read: false });
    }
    alert("Pedidos lançados com sucesso!");
  }

  async function refreshLeaderboard() {
    const scores = {};
    JEEP_LIST.forEach(j => {
      const d = allShared[j.username] || {};
      scores[j.username] = { name: j.name, xp: d.weekXp || 0 };
    });
    try {
      await setDoc(doc(db, "config", "weeklyLeaderboard"), { week: getWeekKey(), scores: scores, lastUpdate: nowLabel() });
      alert("Ranking de XP atualizado! 🏆");
    } catch (e) { alert("Erro ao atualizar."); }
  }

  async function updateActiveQ() {
    if (!activeQEdit.trim()) return alert("Escreve a pergunta!");
    
    // Filtramos as opções que a Teresa escreveu
    const opcoesFinais = [opt1, opt2, opt3].filter(o => o.trim() !== "");

    await setDoc(doc(db, "config", "activeQuestion"), { 
      text: activeQEdit.trim(), 
      options: opcoesFinais, // Grava os botões
      date: Date.now() 
    });

    for (const u of ALLOWED_USERNAMES) {
      await setDoc(doc(db, "userData", u), { answered: false }, { merge: true });
      await addDoc(collection(db, "notifications", u, "items"), { from:"teresa", text:"💬 Nova pergunta da semana!", date:nowLabel(), read:false });
    }
    alert("Pergunta publicada!");
    setActiveQEdit(""); setOpt1(""); setOpt2(""); setOpt3("");
  }

  async function markAdminNotifAsRead(notifId) {
    await updateDoc(doc(db, "adminNotificacoes", notifId), { lida: true });
  }

  return (
    <div>
      {/* 1. NOTIFICAÇÕES */}
      {adminNotifs.length > 0 && (
        <div style={{ ...CARD, background:"rgba(239, 68, 68, 0.05)", border:`1px solid rgba(239, 68, 68, 0.2)` }}>
          <div style={{ ...SL, color:"#ef4444" }}>🔔 Alertas Recentes</div>
          <div style={{ maxHeight:200, overflowY:"auto" }}>
            {adminNotifs.slice(0, 10).map(n => (
              <div key={n.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px", background:"rgba(0,0,0,0.2)", borderRadius:12, marginBottom:8, borderLeft:n.lida ? "none" : `3px solid #ef4444` }}>
                <div style={{ fontSize:13, color: n.lida ? "#94a3b8" : "white" }}>
                  {n.tipo === "AUTOAVALIACAO" ? `📊 ${JEEP_LIST.find(j=>j.username===n.jovem)?.name || n.jovem} entregou.` : `😊 Nova Satisfação Anónima.`}
                </div>
                {!n.lida && <button onClick={() => markAdminNotifAsRead(n.id)} style={{ background:"none", border:"1px solid #ef4444", color:"#ef4444", borderRadius:8, padding:"4px 8px", fontSize:11 }}>Lido</button>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. LANÇAR PEDIDOS */}
      <div style={CARD}>
        <div style={SL}>Lançar Pedidos aos Jovens</div>
        <div style={{ display:"flex", gap:8, marginBottom:10 }}>
          <select value={launchType} onChange={e=>setLaunchType(e.target.value)} style={{ flex:1, padding:12, borderRadius:12, background:"rgba(0,0,0,0.3)", color:"white", border:"1px solid rgba(255,255,255,0.1)" }}>
            <option value="auto">📊 Autoavaliação</option>
            <option value="satisf">😊 Satisfação</option>
            <option value="pia">📋 Atualizar PIA</option>
          </select>
          <select value={launchTarget} onChange={e=>setLaunchTarget(e.target.value)} style={{ flex:1, padding:12, borderRadius:12, background:"rgba(0,0,0,0.3)", color:"white", border:"1px solid rgba(255,255,255,0.1)" }}>
            <option value="all">Todos</option>
            {JEEP_LIST.map(j=><option key={j.username} value={j.username}>{j.name}</option>)}
          </select>
        </div>
        <Btn onClick={launchRequest}>Lançar Pedido 🚀</Btn>
      </div>

      {/* 3. RANKING */}
      <div style={CARD}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:15 }}>
          <div style={SL}>Tabela de XP Semanal</div>
          <button onClick={refreshLeaderboard} style={{ background:CYN, color:"#0f172a", border:"none", padding:"6px 12px", borderRadius:10, fontSize:11, fontWeight:900, cursor:"pointer" }}>🔄</button>
        </div>              
        {Object.entries(leaderboard).sort((a,b)=>b[1].xp-a[1].xp).map((e, i) => (
          <div key={e[0]} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ fontSize:14, fontWeight:800, color:"#94a3b8", width:25 }}>#{i+1}</span>
            <div style={{ flex:1, fontSize:14, fontWeight:700 }}>{e[1].name}</div>
            <div style={{ fontSize:14, fontWeight:800, color:CYN }}>{e[1].xp} XP</div>
          </div>
        ))}
      </div>

      {/* 4. PERGUNTA DA SEMANA (COM BOTÕES PERSONALIZADOS) */}
      <div style={CARD}>
        <div style={SL}>Lançar Pergunta com Botões</div>
        <div style={{ fontSize:13, color:"white", marginBottom:15, padding:"12px", background:"rgba(0,0,0,0.2)", borderRadius:12, borderLeft:`4px solid ${CYN}` }}>{activeQ}</div>
        
        <input value={activeQEdit} onChange={e=>setActiveQEdit(e.target.value)} placeholder="A pergunta da semana..." style={INP}/>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
          <input value={opt1} onChange={e=>setOpt1(e.target.value)} placeholder="Opção 1" style={{ ...INP, marginBottom: 0, fontSize: 12 }} />
          <input value={opt2} onChange={e=>setOpt2(e.target.value)} placeholder="Opção 2" style={{ ...INP, marginBottom: 0, fontSize: 12 }} />
          <input value={opt3} onChange={e=>setOpt3(e.target.value)} placeholder="Opção 3" style={{ ...INP, marginBottom: 0, fontSize: 12 }} />
        </div>
        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 5 }}>* Deixa as opções vazias para resposta livre por texto.</div>
        
        <button onClick={updateActiveQ} style={{ ...Btn, marginTop: 15 }}>Publicar Pergunta 💬</button>
      </div>

      {/* 5. RESPOSTAS */}
      <div style={CARD}>
        <div style={SL}>Respostas Recebidas</div>
        {JEEP_LIST.map(j => {
          let d = allShared[j.username] || {};
          return (
            <div key={j.username} style={{ padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize:14, fontWeight:700 }}>{j.name}: {d.answered ? <span style={{ color:CYN, fontWeight:400 }}>{d.answerText}</span> : <span style={{ color:"#475569" }}>Pendente</span>}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
