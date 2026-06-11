import React, { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, doc, getDoc, setDoc, query, orderBy } from "firebase/firestore";
import { db } from "./firebase.js";
import { BG, CYN, AppIcon } from "./theme.jsx";
import { upd, getWeekKey, nowLabel, ALLOWED_USERNAMES, JEEP_LIST } from "./data.js";

// ── IMPORTAÇÃO DAS FATIAS ──
import AdminGeral from './tabs/admin/AdminGeral.jsx';
import AdminJovens from './tabs/admin/AdminJovens.jsx';
import AdminPrograma from './tabs/admin/AdminPrograma.jsx';
import AdminPia from './tabs/admin/AdminPia.jsx';
import AdminMural from './tabs/admin/AdminMural.jsx';
import AdminSatisfacao from './tabs/admin/AdminSatisfacao.jsx';
import AdminMsgs from './tabs/admin/AdminMsgs.jsx';
import JovensApp from './JovensApp.jsx';

const JEEP_8 = JEEP_LIST.filter(j => !["teresa","ricardo","demo"].includes(j.username));

export default function TeresaAdmin({ user, onLogout }) {
  const [adminTab, setAdminTab] = useState("geral");
  const [previewUser, setPreviewUser] = useState(null);
  const [showPreviewPicker, setShowPreviewPicker] = useState(false);

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
    ["jovens",    "👥 Jovens"],
    ["programa",  "🎯 Programa"],
    ["pia",       "📋 PIA"],
    ["forum",     "🌐 Fórum"],
    ["satisfacao","😊 Satisfação"],
    ["msgs",      "💬 Msgs"],
  ];

  // ── MODO PREVIEW ──
  if (previewUser) {
    return (
      <div style={{ position:"relative", minHeight:"100vh" }}>
        {/* Banner fixo — fora do pointer-events:none */}
        <div style={{
          position:"fixed", top:0, left:"50%", transform:"translateX(-50%)",
          width:"100%", maxWidth:420, zIndex:9999,
          background:"rgba(7,21,41,0.97)", borderBottom:`2px solid ${CYN}`,
          padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between",
          backdropFilter:"blur(12px)"
        }}>
          <div>
            <div style={{ fontSize:9, color:"#64748b", fontWeight:800, letterSpacing:1 }}>MODO PREVIEW — SÓ LEITURA</div>
            <div style={{ fontSize:14, fontWeight:900, color:previewUser.color }}>👁️ A ver como {previewUser.name}</div>
          </div>
          <button onClick={() => setPreviewUser(null)} style={{
            background:`${CYN}15`, border:`1px solid ${CYN}40`, color:CYN,
            padding:"7px 14px", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:800
          }}>← Sair</button>
        </div>

        {/* App do jovem — pointer-events:none impede qualquer clique/escrita */}
        <div style={{ pointerEvents:"none", paddingTop:52 }}>
          <JovensApp user={previewUser} onLogout={() => {}} />
        </div>
      </div>
    );
  }

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
        <div style={{ display:"flex", gap:8, alignItems:"center", position:"relative" }}>
          <button onClick={() => setShowPreviewPicker(p => !p)} style={{
            background: "rgba(50,199,255,0.1)",
            border: `1px solid ${CYN}40`,
            color: CYN, padding: "7px 14px",
            borderRadius: 20, fontSize: 12,
            cursor: "pointer", fontWeight: 700
          }}>👁️ Ver como</button>
          <button onClick={onLogout} style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white", padding: "7px 16px",
            borderRadius: 20, fontSize: 12,
            cursor: "pointer", fontWeight: 600
          }}>Sair</button>

          {/* Picker de utilizador */}
          {showPreviewPicker && (
            <div style={{
              position:"absolute", top:"calc(100% + 8px)", right:0, zIndex:200,
              background:"#0f172a", border:`1px solid ${CYN}30`, borderRadius:16,
              padding:14, minWidth:200, boxShadow:"0 8px 32px rgba(0,0,0,0.5)"
            }}>
              <div style={{ fontSize:10, color:"#64748b", fontWeight:800, marginBottom:10, letterSpacing:1 }}>VER APP COMO:</div>
              {JEEP_8.map(j => (
                <button key={j.username} onClick={() => { setPreviewUser(j); setShowPreviewPicker(false); }}
                  style={{
                    display:"block", width:"100%", textAlign:"left", padding:"9px 12px",
                    background:"rgba(255,255,255,0.03)", border:"none", color:"#e2e8f0",
                    fontSize:13, fontWeight:700, cursor:"pointer", borderRadius:10, marginBottom:6,
                    borderLeft:`3px solid ${j.color}`
                  }}>
                  {j.name}
                </button>
              ))}
            </div>
          )}
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
        {adminTab === "geral"     && <AdminGeral allShared={allShared} leaderboard={leaderboard} adminNotifs={adminNotifs} />}
        {adminTab === "jovens"    && <AdminJovens amMedals={amMedals} setAmMedals={setAmMedals} allShared={allShared} weekStartTs={weekStartTs} />}
        {adminTab === "programa"  && <AdminPrograma allShared={allShared} events={events} missions={missions} activeQ={activeQ} />}
        {adminTab === "pia"       && <AdminPia allShared={allShared} />}
        {adminTab === "forum"     && <AdminMural />}
        {adminTab === "satisfacao"&& <AdminSatisfacao />}
        {adminTab === "msgs"      && <AdminMsgs />}
      </div>
      
    </div>
  );
}
