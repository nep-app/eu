import React, { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, doc, getDoc, setDoc, query, orderBy } from "firebase/firestore";
import { db } from "./firebase.js";
import { BG, CYN, AppIcon } from "./theme.jsx";
import { upd, getWeekKey, nowLabel, ALLOWED_USERNAMES, JEEP_LIST } from "./data.js";

// ── IMPORTAÇÃO DAS FATIAS ──
import AdminGeral from './tabs/admin/AdminGeral.jsx';
import AdminMural from './tabs/admin/AdminMural.jsx';
import AdminPartilhas from './tabs/admin/AdminPartilhas.jsx';
import AdminTarefas from './tabs/admin/AdminTarefas.jsx';
import AdminAgenda from './tabs/admin/AdminAgenda.jsx';
import AdminMissoes from './tabs/admin/AdminMissoes.jsx';
import AdminMsgs from './tabs/admin/AdminMsgs.jsx';
import AdminUsers from './tabs/admin/AdminUsers.jsx';
import AdminVotacoes from './tabs/admin/AdminVotacoes.jsx'; // ADICIONA ESTA LINHA
import AdminQuizzes from './tabs/admin/AdminQuizzes.jsx';
export default function TeresaAdmin({ user, onLogout }) {
  const [adminTab, setAdminTab] = useState("geral");

  // ── DADOS GLOBAIS DA COORDENAÇÃO ──
  const [allShared, setAllShared] = useState({});
  const [amMedals, setAmMedals] = useState({});
  const [msgs, setMsgs] = useState([]);
  const [events, setEvents] = useState([]);
  const [missions, setMissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState({});
  const [adminNotifs, setAdminNotifs] = useState([]);
  const [activeQ, setActiveQ] = useState("");
  const [weekStartTs, setWeekStartTs] = useState(0);

  // ── LIGAÇÃO CENTRAL AO FIREBASE ──
  useEffect(() => {
    const unsubs = ALLOWED_USERNAMES.map(uname => {
      return onSnapshot(doc(db, "userData", uname), snap => {
        if(snap.exists()) {
          setAllShared(prev => upd(prev, uname, snap.data()));
        }
      });
    });

    const uM = onSnapshot(collection(db, "messages"), snap => 
      setMsgs(snap.docs.map(d => ({id:d.id, ...d.data()})))
    );
    
    const uE = onSnapshot(collection(db, "events"), snap => 
      setEvents(snap.docs.map(d => ({id:d.id, ...d.data()})))
    );
    
    const uL = onSnapshot(doc(db, "config", "weeklyLeaderboard"), snap => 
      setLeaderboard(snap.exists() && snap.data().week === getWeekKey() ? snap.data().scores : {})
    );
    
    const uMi = onSnapshot(collection(db, "missions"), snap => 
      setMissions(snap.docs.map(d => ({id:d.id, ...d.data()})))
    );
    
    const uQ = onSnapshot(doc(db, "config", "activeQuestion"), snap => { 
      if(snap.exists()) setActiveQ(snap.data().text); 
    });
    
    const uNotifs = onSnapshot(query(collection(db, "adminNotificacoes"), orderBy("ts", "desc")), snap => {
      setAdminNotifs(snap.docs.map(d => ({id:d.id, ...d.data()})));
    });

    const uWS = onSnapshot(doc(db, "config", "weekStart"), snap => {
      setWeekStartTs(snap.exists() ? snap.data().ts || 0 : 0);
    });

    JEEP_LIST.forEach(j => {
      getDoc(doc(db, "medals", j.username)).then(s => {
        if (s.exists()) setAmMedals(p => upd(p, j.username, s.data()));
      });
    });
    
    return () => {
      unsubs.forEach(u => u());
      uM();
      uE();
      uL();
      uMi();
      uQ();
      uNotifs();
      uWS();
    };
  }, []);

  // Auto-refresh leaderboard whenever any user's XP changes (debounced 3s)
  // Calculates XP from history entries since weekStartTs (no data reset needed)
  const lbTimer = useRef(null);
  useEffect(() => {
    if (Object.keys(allShared).length === 0) return;
    clearTimeout(lbTimer.current);
    lbTimer.current = setTimeout(() => {
      const scores = {};
      JEEP_LIST.forEach(j => {
        const d = allShared[j.username] || {};
        const hist = d.history || [];
        const xp = weekStartTs > 0
          ? hist.filter(h => (h.ts || 0) >= weekStartTs && (h.xp || 0) > 0).reduce((s, h) => s + (h.xp || 0), 0)
          : (d.weekXp || 0);
        scores[j.username] = { name: j.name, xp, color: j.color };
      });
      setDoc(doc(db, "config", "weeklyLeaderboard"), { week: getWeekKey(), scores, lastUpdate: nowLabel() });
    }, 3000);
  }, [allShared, weekStartTs]);

  const unreadNotifsCount = adminNotifs.filter(n => !n.lida).length;

const ADMIN_TABS = [
    ["geral",     unreadNotifsCount > 0 ? `📊 Geral (${unreadNotifsCount})` : "📊 Geral"],
    ["mural",     "🌐 Fórum"],
    ["votacoes",  "🗳️ Votações"],
    ["quizzes",   "🧠 Dilemas"],
    ["partilhas", "📂 Partilhas"],
    ["tasks",     "✅ Tarefas"],
    ["agenda",    "📅 Agenda"],
    ["missoes",   "🎯 Missões"],
    ["msgs",      "💬 Msgs"],
    ["users",     "👥 Utilizadores"]
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "system-ui,sans-serif", color: "white" }}>
      
      {/* HEADER FIXO */}
      <div style={{ 
        background: "rgba(15, 23, 42, 0.8)", 
        padding: "16px 20px 20px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        borderBottom: "1px solid rgba(34, 211, 238, 0.2)" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AppIcon size={40}/>
          <div>
            <div style={{ fontSize: 10, opacity: 0.6, letterSpacing: 1.5, textTransform: "uppercase" }}>
              Painel de Gestão
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: CYN }}>
              JEEP · EDUCA+
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={onLogout} style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white", padding: "7px 16px",
            borderRadius: 20, fontSize: 12,
            cursor: "pointer", fontWeight: 600
          }}>Sair</button>
        </div>
      </div>

      
      {/* NAVEGAÇÃO DE TABS */}
      <div style={{ display: "flex", gap: 0, background: "rgba(0,0,0,0.5)", overflowX: "auto" }}>
        {ADMIN_TABS.map(t => {
          let isA = adminTab === t[0];
          return (
            <button 
              key={t[0]} 
              onClick={() => setAdminTab(t[0])} 
              style={{ 
                padding: "12px 16px", 
                background: isA ? "rgba(34, 211, 238, 0.1)" : "transparent", 
                color: isA ? CYN : "#94a3b8", 
                border: "none", 
                fontSize: 12, 
                fontWeight: 800, 
                cursor: "pointer", 
                whiteSpace: "nowrap", 
                borderBottom: isA ? `2px solid ${CYN}` : "2px solid transparent" 
              }}
            >
              {t[1]}
            </button>
          );
        })}
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px" }}>
        {/* RENDERIZAÇÃO DAS FATIAS */}
        {adminTab === "geral"     && <AdminGeral allShared={allShared} leaderboard={leaderboard} adminNotifs={adminNotifs} activeQ={activeQ} />}
        {adminTab === "mural"     && <AdminMural />}
        {adminTab === "votacoes"  && <AdminVotacoes />}
        {adminTab === "quizzes"   && <AdminQuizzes />}
        {adminTab === "partilhas" && <AdminPartilhas allShared={allShared} />}
        {adminTab === "tasks"     && <AdminTarefas />}
        {adminTab === "agenda"    && <AdminAgenda events={events} />}
        {adminTab === "missoes" && <AdminMissoes missions={missions} />}
        {adminTab === "msgs" && <AdminMsgs msgs={msgs} />}
        {adminTab === "users" && <AdminUsers amMedals={amMedals} setAmMedals={setAmMedals} allShared={allShared} />}
      </div>
      
    </div>
  );
}
