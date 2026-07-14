import React, { useState, useEffect, useRef } from "react";
import { collection, onSnapshot, doc, getDoc, setDoc, query, orderBy } from "firebase/firestore";
import { db, registarPushNotifications } from "./firebase.js";
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
  const [ativandoPush, setAtivandoPush] = useState(false);
  const [pushStatus, setPushStatus] = useState("off"); // on | off | blocked | unsupported

  // Registo de notificações push para a conta admin — este ecrã é um
  // componente totalmente separado do JovensApp, por isso precisa do seu
  // próprio registo (é aqui que o telemóvel da Teresa fica a "ouvir").
  useEffect(() => {
    if (user) registarPushNotifications(user.username);
  }, [user]);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) setPushStatus("unsupported");
    else if (Notification.permission === "granted") setPushStatus("on");
    else if (Notification.permission === "denied") setPushStatus("blocked");
    else setPushStatus("off");
  }, []);

  async function ativarPushAdmin() {
    setAtivandoPush(true);
    const res = await registarPushNotifications(user.username);
    setAtivandoPush(false);
    if (res.ok) { setPushStatus("on"); alert("✓ Notificações push do admin ativadas neste aparelho!"); }
    else {
      if (res.reason === "permissao-denied") setPushStatus("blocked");
      const msgs = {
        "permissao-denied": "Bloqueaste as notificações. Vai às definições do browser/telemóvel e permite para este site.",
        "permissao-default": "Não confirmaste a permissão. Tenta outra vez.",
      };
      alert("Não foi possível ativar: " + (msgs[res.reason] || res.reason));
    }
  }

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
    ["preview",   "👁️ Preview"],
  ];

  // ── MODO PREVIEW — full screen JovensApp quando um jovem está selecionado ──
  if (adminTab === "preview" && previewUser) {
    return (
      <JovensApp
        user={previewUser}
        onLogout={() => {}}
        previewMode={true}
        onExitPreview={() => setPreviewUser(null)}
      />
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
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {pushStatus !== "unsupported" && (
            <button onClick={ativarPushAdmin} disabled={ativandoPush || pushStatus === "blocked"} title="Notificações push do admin"
              style={{
                background: pushStatus === "on" ? "rgba(74,222,128,0.15)" : pushStatus === "blocked" ? "rgba(244,63,94,0.15)" : "rgba(34,211,238,0.15)",
                border: `1px solid ${pushStatus === "on" ? "rgba(74,222,128,0.5)" : pushStatus === "blocked" ? "rgba(244,63,94,0.5)" : "rgba(34,211,238,0.5)"}`,
                color: pushStatus === "on" ? "#4ade80" : pushStatus === "blocked" ? "#f43f5e" : CYN,
                padding: "7px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap",
              }}>
              {ativandoPush ? "A ativar..." : pushStatus === "on" ? "🔔 Push ativo" : pushStatus === "blocked" ? "🔔 Bloqueado" : "🔔 Ativar push"}
            </button>
          )}
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
        {adminTab === "geral"     && <AdminGeral allShared={allShared} leaderboard={leaderboard} adminNotifs={adminNotifs} />}
        {adminTab === "jovens"    && <AdminJovens amMedals={amMedals} setAmMedals={setAmMedals} allShared={allShared} weekStartTs={weekStartTs} />}
        {adminTab === "programa"  && <AdminPrograma allShared={allShared} events={events} missions={missions} activeQ={activeQ} />}
        {adminTab === "pia"       && <AdminPia allShared={allShared} />}
        {adminTab === "forum"     && <AdminMural />}
        {adminTab === "satisfacao"&& <AdminSatisfacao />}
        {adminTab === "msgs"      && <AdminMsgs />}
        {adminTab === "preview"   && !previewUser && (
          <div>
            <div style={{ fontSize:12, color:"#64748b", marginBottom:20, lineHeight:1.6 }}>
              Escolhe um jovem para ver a app exatamente como ele/ela a vê. Podes navegar entre tabs mas não podes fazer alterações.
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {JEEP_8.map(j => (
                <button key={j.username} onClick={() => setPreviewUser(j)} style={{
                  display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
                  background:"rgba(255,255,255,0.03)", border:`1px solid rgba(255,255,255,0.07)`,
                  borderLeft:`4px solid ${j.color}`, borderRadius:14, cursor:"pointer",
                  textAlign:"left", color:"#e2e8f0", fontSize:14, fontWeight:700,
                }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:j.color, flexShrink:0 }} />
                  {j.name}
                  <span style={{ marginLeft:"auto", fontSize:11, color:"#475569" }}>Ver app →</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}
