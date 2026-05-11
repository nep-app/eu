import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, collection, addDoc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase.js";
import { BG, CARD, SL, PS, CYN, PNK, AppIcon, SubTabs, Btn, RadarChart } from "./theme.jsx";
import { 
  upd, scoreLabel, getDimDesc, nowLabel, fmtDate, isOverdue, getWeekKey, 
  SPECIAL_USERS, JEEP_LIST, DIMS, RODA_DIMS, CHANNELS, SURVEY_CATS, QUIZZES, 
  SWOT_Q, ALL_MEDALS, PIA_FIELDS, COMPL, MOODS, SEMOJIS, FORUM_REACTIONS, 
  EVT_COLORS, EVT_ICONS, EC, DEF_PIA, DEF_ACTS, DEF_RODA, DEF_DSCORES, 
  DEF_DNOTAS, DEF_SWOT, DEF_CAP 
} from "./data.js";

export default function JovensApp({ user, onLogout }) {
  const [tab, setTab] = useState("home");
  
  // ── SUB-TABS ──
  const [desafiosTab, setDesafiosTab] = useState("pergunta");
  const [piaTab, setPiaTab] = useState("planeamento");
  const [perfilTab, setPerfilTab] = useState("tarefas");

  // ── STATE ──
  const [history, setHistory] = useState([]);
  const [myNotifs, setMyNotifs] = useState([]);
  const [todos, setTodos] = useState({});
  const [newTodo, setNewTodo] = useState({ text:"", due:"", shared:true });
  
  const [pia, setPia] = useState(DEF_PIA);
  const [piaActs, setPiaActs] = useState(DEF_ACTS);
  const [piaSaved, setPiaSaved] = useState(false);
  const [piaShared, setPiaShared] = useState(false);
  
  const [swotPia, setSwotPia] = useState(DEF_SWOT);
  const [swotSaved, setSwotSaved] = useState(false);
  const [swotShared, setSwotShared] = useState(false);

  const [dScores, setDScores] = useState(DEF_DSCORES);
  const [dNotas, setDNotas] = useState(DEF_DNOTAS);
  const [autoSaved, setAutoSaved] = useState(false);
  const [autoShared, setAutoShared] = useState(false);

  const [sRatings, setSRatings] = useState({ ludoteca:0,teresa:0,equipa:0,geral:0 });
  const [sChips, setSChips] = useState({ ludoteca:[],teresa:[],equipa:[],geral:[] });
  const [sMudaria, setSMudaria] = useState("");
  const [sSaved, setSSaved] = useState(false);
  const [sCatIdx, setSCatIdx] = useState(0);

  const [roda, setRoda] = useState(DEF_RODA);
  const [rodaExp, setRodaExp] = useState(null);
  const [rodaSaves, setRodaSaves] = useState([]);
  const [rodaShared, setRodaShared] = useState(false);

  const [cap, setCap] = useState(DEF_CAP);

  const [channel, setChannel] = useState("csi");
  const [posts, setPosts] = useState({});
  const [fPost, setFPost] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyTxt, setReplyTxt] = useState("");
  const [expanded, setExpanded] = useState(null);
  
  // Media Uploads
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [events, setEvents] = useState([]);
  const [newEvt, setNewEvt] = useState({ title:"", date:"", time:"", userId:"all", type:"visit", shareWithTeresa:false });

  const [msgTxt, setMsgTxt] = useState("");
  const [msgAnon, setMsgAnon] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  
  const [suggTxt, setSuggTxt] = useState("");

  const [activeQ, setActiveQ] = useState("");
  const [activeQMode, setActiveQMode] = useState(["texto"]);
  const [answered, setAnswered] = useState(false);
  const [aTxt, setATxt] = useState("");
  const [cmode, setCmode] = useState("texto");
  const [selMood, setSelMood] = useState(null);
  const [p3, setP3] = useState(["","",""]);
  const [cidx, setCidx] = useState(0);

  const [qIdx, setQIdx] = useState(0);
  const [qAnswers, setQAnswers] = useState({});

  const [weekXp, setWeekXp] = useState(0);
  const [weekKey, setWeekKey] = useState(getWeekKey());
  const [leaderboard, setLeaderboard] = useState({});
  const [dailyStreak, setDailyStreak] = useState(0);
  const [missions, setMissions] = useState([]);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [xpGain, setXpGain] = useState(null);
  const [amMedals, setAmMedals] = useState({});

  // ── REAL-TIME EFFECTS ──
  useEffect(() => {
    if (!user) return;
    loadUserData(user.username);
    
    const unsubs = [
      onSnapshot(collection(db, "events"), snap => setEvents(snap.docs.map(d => ({id:d.id, ...d.data()})))),
      onSnapshot(doc(db, "users", user.username), snap => { if(snap.exists()) setAnswered(snap.data().answered || false); }),
      onSnapshot(collection(db, "todos", user.username, "items"), snap => setTodos(prev => upd(prev, user.username, snap.docs.map(d => ({id:d.id, ...d.data()})) ))),
      onSnapshot(doc(db, "config", "weeklyLeaderboard"), snap => setLeaderboard(snap.exists() && snap.data().week===getWeekKey() ? snap.data().scores : {})),
      onSnapshot(collection(db, "missions"), snap => setMissions(snap.docs.map(d => ({id:d.id, ...d.data()})))),
      onSnapshot(doc(db, "config", "activeQuestion"), snap => { if(snap.exists()){ setActiveQ(snap.data().text); setActiveQMode(snap.data().mode||["texto"]); setCmode((snap.data().mode||["texto"])[0]); } }),
      onSnapshot(collection(db, "notifications", user.username, "items"), snap => setMyNotifs(snap.docs.map(d => ({id:d.id, ...d.data()})))),
      onSnapshot(doc(db, "medals", user.username), snap => { if(snap.exists()){ const j=JEEP_LIST.find(x=>x.username===user.username); if(j) setAmMedals(prev=>upd(prev, j.name, snap.data().list||[])); } })
    ];
    return () => unsubs.forEach(u => u());
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(collection(db, "forum", channel, "posts"), snap => setPosts(p => upd(p, channel, snap.docs.map(d => ({id:d.id, ...d.data()})))));
  }, [channel, user]);

  // ── LOAD USER DATA & STREAK ──
  async function loadUserData(uname) {
    const snap = await getDoc(doc(db, "userData", uname));
    if (!snap.exists()) return;
    const d = snap.data();
    
    if(d.pia) setPia(d.pia); if(d.piaActs) setPiaActs(d.piaActs); if(d.piaSaved) setPiaSaved(d.piaSaved); if(d.piaShared) setPiaShared(d.piaShared);
    if(d.swotPia) setSwotPia(d.swotPia); if(d.swotSaved) setSwotSaved(d.swotSaved); if(d.swotShared) setSwotShared(d.swotShared);
    if(d.dScores) setDScores(d.dScores); if(d.dNotas) setDNotas(d.dNotas); if(d.autoSaved) setAutoSaved(d.autoSaved); if(d.autoShared) setAutoShared(d.autoShared);
    if(d.sRatings) setSRatings(d.sRatings); if(d.sChips) setSChips(d.sChips); if(d.sMudaria!==undefined) setSMudaria(d.sMudaria); if(d.sSaved) setSSaved(d.sSaved);
    if(d.roda) setRoda(d.roda); if(d.rodaSaves) setRodaSaves(d.rodaSaves); if(d.rodaShared) setRodaShared(d.rodaShared);
    if(d.history) setHistory(d.history); if(d.cap) setCap(d.cap); if(d.qAnswers) setQAnswers(d.qAnswers);
    if(d.completedMissions) setCompletedMissions(d.completedMissions);
    
    const wk = getWeekKey();
    let curWXp = (d.weekKey === wk) ? (d.weekXp || 0) : 0;
    const todayStr = new Date().toDateString();
    const yest = new Date(); yest.setDate(yest.getDate()-1);
    let newStreak = d.dailyStreak || 0;
    let didGainXp = false;

    if ((d.lastXpDay || "") !== todayStr) {
      curWXp += 2; didGainXp = true;
      newStreak = (d.lastXpDay === yest.toDateString()) ? newStreak + 1 : 1;
      await setDoc(doc(db, "userData", uname), { weekXp: curWXp, weekKey: wk, lastXpDay: todayStr, dailyStreak: newStreak }, { merge:true });
    }
    setWeekXp(curWXp); setWeekKey(wk); setDailyStreak(newStreak);

    if (didGainXp) {
      const userObj = JEEP_LIST.find(x => x.username === uname);
      if(userObj) {
        try { await updateDoc(doc(db, "config", "weeklyLeaderboard"), { week: wk, ["scores."+uname]: { xp: curWXp, name: userObj.name, color: userObj.color } }); } 
        catch(e) { await setDoc(doc(db, "config", "weeklyLeaderboard"), { week: wk, scores: { [uname]: { xp: curWXp, name: userObj.name, color: userObj.color } } }); }
      }
    }
  }

  async function saveUserField(uname, data) { await setDoc(doc(db, "userData", uname), data, { merge:true }); }
  
  async function addHistoryLog(actionName) {
    const d = new Date();
    const dstr = d.toLocaleDateString("pt-PT") + " às " + d.toLocaleTimeString("pt-PT", {hour:'2-digit', minute:'2-digit'});
    const newH = [...history, { date: dstr, action: actionName, ts: Date.now() }];
    setHistory(newH);
    await saveUserField(user.username, { history: newH });
  }

  async function addXp(amount) {
    const wk = getWeekKey();
    const nv = ((weekKey === wk) ? weekXp : 0) + amount;
    setWeekXp(nv); setWeekKey(wk); setXpGain(`+${amount} XP ✨`);
    await saveUserField(user.username, { weekXp: nv, weekKey: wk });
    try { await updateDoc(doc(db, "config", "weeklyLeaderboard"), { week: wk, ["scores."+user.username]: { xp: nv, name: user.realName, color: user.color } }); }
    catch(e) { await setDoc(doc(db, "config", "weeklyLeaderboard"), { week: wk, scores: { [user.username]: { xp: nv, name: user.realName, color: user.color } } }); }
    setTimeout(() => setXpGain(null), 2500);
  }

  // ── FUNÇÕES DE AÇÃO ──
  async function savePia(share) {
    const sh = share !== undefined ? share : piaShared;
    setPiaSaved(true); setPiaShared(sh);
    await saveUserField(user.username, { pia, piaActs, piaSaved:true, piaShared:sh });
    await addHistoryLog("Atualizou o PIA" + (sh?" (Partilhado)":" (Privado)"));
    if (!piaSaved) await addXp(10);
  }
  async function saveAutoEval(share) {
    const sh = share !== undefined ? share : autoShared;
    setAutoSaved(true); setAutoShared(sh);
    await saveUserField(user.username, { dScores, dNotas, autoSaved:true, autoShared:sh });
    await addHistoryLog("Preencheu a Autoavaliação" + (sh?" (Partilhada)":" (Privada)"));
    await addXp(10);
  }
  async function saveSatisf() {
    setSSaved(true);
    await saveUserField(user.username, { sRatings, sChips, sMudaria, sSaved:true });
    await addHistoryLog("Submeteu a Avaliação de Satisfação (Anónima)");
    await addXp(10);
  }
  async function saveRoda(share) {
    const sh = share !== undefined ? share : rodaShared;
    const newSaves = [...rodaSaves, { label:nowLabel(), scores:{...roda} }];
    setRodaSaves(newSaves); setRodaShared(sh);
    await saveUserField(user.username, { roda, rodaSaves:newSaves, rodaShared:sh });
    await addHistoryLog("Guardou a Roda da Vida" + (sh?" (Partilhada)":" (Privada)"));
    await addXp(15);
  }
  async function saveSwot(share) {
    const sh = share !== undefined ? share : swotShared;
    setSwotSaved(true); setSwotShared(sh);
    await saveUserField(user.username, { swotPia, swotSaved:true, swotShared:sh });
    await addHistoryLog("Atualizou o Raio-X do Projeto" + (sh?" (Partilhado)":" (Privado)"));
  }
  
  async function submitAnswer() {
    if (["foto", "video", "audio"].includes(cmode)) {
      if (!mediaFile) return alert("Escolhe um ficheiro primeiro!");
      setIsUploading(true);
      try {
        const fileRef = ref(storage, "respostas/" + user.username + "_" + Date.now() + "_" + mediaFile.name);
        await uploadBytes(fileRef, mediaFile);
        const url = await getDownloadURL(fileRef);
        await saveUserField(user.username, { answered:true, answerMedia: url, answerType: cmode });
      } catch(e) { setIsUploading(false); return alert("Erro: " + e.message); }
      setIsUploading(false);
    } else {
      await saveUserField(user.username, { answered:true, answerText: aTxt, answerType: cmode });
    }
    setAnswered(true);
    await addHistoryLog("Respondeu à Pergunta da Semana");
    await addXp(20);
  }

  async function postForum() {
    if (!fPost.trim() && !mediaFile) return;
    setIsUploading(true);
    let mediaUrl = null;
    try {
      if (mediaFile) {
        const fileRef = ref(storage, "forum/" + Date.now() + "_" + mediaFile.name);
        await uploadBytes(fileRef, mediaFile);
        mediaUrl = await getDownloadURL(fileRef);
      }
      await addDoc(collection(db, "forum", channel, "posts"), {
        user:user.realName, color:user.color, text:fPost, media:mediaUrl, time:nowLabel(),
        reactions:{ heart:0, fire:0, clap:0, think:0 }, reactedBy:{}, replies:[]
      });
      setFPost(""); setMediaFile(null);
      await addHistoryLog(`Publicou no Fórum (${channel})`);
      await addXp(5);
    } catch(e) { alert("Erro: " + e.message); }
    setIsUploading(false);
  }
  
  async function reactPost(pid, reaction) {
    const cur = (posts[channel]||[]).find(p => p.id === pid); if (!cur) return;
    let rcts = { ...cur.reactions }; let rBy = { ...cur.reactedBy };
    let who = rBy[reaction] || [];
    if (who.includes(user.username)) { rcts[reaction] = Math.max(0, (rcts[reaction]||1)-1); rBy[reaction] = who.filter(u=>u!==user.username); }
    else { rcts[reaction] = (rcts[reaction]||0)+1; rBy[reaction] = [...who, user.username]; }
    await updateDoc(doc(db, "forum", channel, "posts", pid), { reactions:rcts, reactedBy:rBy });
  }

  async function sendReply(pid) {
    if (!replyTxt.trim()) return;
    const cur = (posts[channel]||[]).find(p => p.id === pid); if (!cur) return;
    await updateDoc(doc(db, "forum", channel, "posts", pid), { replies: [...cur.replies, { user:user.realName, color:user.color, text:replyTxt, time:nowLabel() }] });
    setReplyTxt(""); setReplyTo(null);
  }

  async function addTodoForUser() {
    if (!newTodo.text.trim()) return;
    await addDoc(collection(db, "todos", user.username, "items"), { text:newTodo.text, due:newTodo.due, done:false, shared:newTodo.shared, addedBy:"user", accepted:true });
    await addHistoryLog("Adicionou uma Tarefa" + (newTodo.shared?" (Partilhada)":""));
    setNewTodo({ text:"", due:"", shared:true });
  }
  async function toggleTodoDone(id) {
    const cur = (todos[user.username]||[]).find(t => t.id === id); if (!cur) return;
    await updateDoc(doc(db, "todos", user.username, "items", id), { done:!cur.done });
    if(!cur.done) { await addHistoryLog("Concluiu a tarefa: " + cur.text); await addXp(5); }
  }
  async function acceptTodo(id) { await updateDoc(doc(db, "todos", user.username, "items", id), { accepted:true }); }
  async function rejectTodo(id) { await deleteDoc(doc(db, "todos", user.username, "items", id)); }

  async function addPersonalEvent() {
    if (!newEvt.title.trim() || !newEvt.date) return;
    let evtData = { title:newEvt.title, date:newEvt.date, time:newEvt.time, userId:user.username, type:"personal" };
    if (newEvt.shareWithTeresa) evtData.sharedWith = "teresa";
    await addDoc(collection(db, "events"), evtData);
    await addHistoryLog("Adicionou um Evento à agenda");
    setNewEvt({ title:"", date:"", time:"", userId:"all", type:"visit", shareWithTeresa:false });
  }

  async function sendMsg() {
    if (!msgTxt.trim()) return;
    await addDoc(collection(db,"messages"),{ text:msgTxt, anon:msgAnon, from:msgAnon?"Anónimo":user.username, hiddenUser:user.username, date:nowLabel(), adminReply:"" });
    setMsgTxt(""); setMsgSent(true); setTimeout(()=>setMsgSent(false), 3000);
  }
  async function sendSugg() {
    if (!suggTxt.trim()) return;
    await addDoc(collection(db,"suggestions"),{ from:user.username, text:suggTxt, date:nowLabel() });
    await addHistoryLog("Enviou uma Sugestão"); setSuggTxt(""); alert("Sugestão enviada!");
  }
  
  async function completeMission(missionId) {
    if (completedMissions.includes(missionId)) return;
    const mission = missions.find(m => m.id === missionId);
    const newComp = [...completedMissions, missionId];
    setCompletedMissions(newComp);
    await saveUserField(user.username, { completedMissions: newComp });
    if (mission) { await addXp(mission.xp || 10); await addHistoryLog("Completou a Missão: " + mission.text); }
  }

  function doExport() {
    const data = { utilizador:user.realName, exportacao:new Date().toISOString(), pia, piaAtividades:piaActs, rodaDaVida:roda, historicoRoda:rodaSaves, historicoAcoes:history, autoavaliacao:dScores, tarefas:todos[user.username]||[], swot:swotPia };
    const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href=url; a.download="jeep_"+user.username+".json"; a.click(); URL.revokeObjectURL(url);
  }

  // ── DERIVED DATA ──
  const prog = Math.round(((Object.values(pia).filter(v=>v.trim()).length + piaActs.filter(a=>a.oQue.trim()).length)/10)*100);
  const userTodos = todos[user.username]||[];
  const acceptedTodos = userTodos.filter(t=>t.accepted);
  const doneTodos = acceptedTodos.filter(t=>t.done);
  const pendingTeresaTodos = userTodos.filter(t=>t.addedBy==="teresa"&&!t.accepted);
  const todoPercent = acceptedTodos.length>0 ? Math.round((doneTodos.length/acceptedTodos.length)*100) : 0;
  
  const userEvents = events.filter(e=>e.userId===user.username||e.userId==="all"||(SPECIAL_USERS.includes(user.username)&&e.sharedWith===user.username)).sort((a,b)=>a.date.localeCompare(b.date));
  const userMedals = (JEEP_LIST.find(x=>x.username===user.username) && amMedals[JEEP_LIST.find(x=>x.username===user.username).name]) || [];
  
  const top3 = Object.entries(leaderboard).sort((a,b)=>b[1].xp-a[1].xp).slice(0,3);
  const inTop3 = top3.some(e => e[0] === user.username);

  // Pendentes
  let pendingItems = [];
  if (!answered)  pendingItems.push({ status:"urgent",  icon:"💬", title:"Pergunta da semana", sub:"Ainda não respondeste", go:()=>setTab("desafios") });
  if (!autoSaved) pendingItems.push({ status:"pending", icon:"📊", title:"Autoavaliação mensal", sub:"Em falta", go:()=>{setTab("desafios"); setDesafiosTab("auto");} });
  if (!sSaved)    pendingItems.push({ status:"new",     icon:"😊", title:"Avaliação de Satisfação", sub:"Nova!", go:()=>{setTab("desafios"); setDesafiosTab("satisf");} });
  if (!piaSaved)  pendingItems.push({ status:"pending", icon:"📋", title:`PIA — ${prog}% completo`, sub:"Continua a preencher", go:()=>setTab("pia") });
  if (!swotSaved) pendingItems.push({ status:"new",     icon:"🔍", title:"Raio-X do Projeto", sub:"Por preencher", go:()=>{setTab("pia"); setPiaTab("swot");} });
  if (pendingTeresaTodos.length>0) pendingItems.push({ status:"new", icon:"✅", title:`${pendingTeresaTodos.length} sugestão(ões)`, sub:"Aceitar ou rejeitar", go:()=>{setTab("perfil"); setPerfilTab("tarefas");} });

  const C = user.color;

  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:"system-ui,sans-serif", maxWidth:420, margin:"0 auto", display:"flex", flexDirection:"column", color:"white" }}>
      {/* ── HEADER ── */}
      <div style={{ background:`linear-gradient(135deg, ${C}, #0ea5e9)`, padding:"14px 20px 18px", color:"#0f172a", position:"relative", overflow:"hidden", borderBottom:"1px solid rgba(255,255,255,0.2)" }}>
        <div style={{ position:"absolute", right:-30, top:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.2)" }}/>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(0,0,0,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:900, border:"2px solid rgba(255,255,255,0.4)" }}>{user.realName[0]}</div>
            <div>
              <div style={{ fontSize:11, opacity:0.8, fontWeight:700 }}>Olá,</div>
              <div style={{ fontSize:18, fontWeight:900 }}>{user.realName}</div>
              <div style={{ display:"flex", gap:6, marginTop:4 }}>
                {dailyStreak > 0 && <div style={{ fontSize:10, background:"rgba(0,0,0,0.2)", borderRadius:20, padding:"2px 8px", fontWeight:800, color:"white" }}>🔥 {dailyStreak} dias</div>}
                <div style={{ fontSize:10, background:"rgba(0,0,0,0.2)", borderRadius:20, padding:"2px 8px", fontWeight:800, color:"white" }}>⚡ {weekXp} XP</div>
              </div>
            </div>
          </div>
          <button onClick={onLogout} style={{ background:"rgba(0,0,0,0.15)", border:"1px solid rgba(255,255,255,0.3)", color:"#0f172a", padding:"6px 14px", borderRadius:20, fontSize:11, cursor:"pointer", fontWeight:800 }}>Sair</button>
        </div>
      </div>

      {xpGain && <div style={{ position:"fixed", top:70, left:"50%", transform:"translateX(-50%)", zIndex:999, background:CYN, color:"#0f172a", padding:"10px 22px", borderRadius:30, fontSize:15, fontWeight:900, boxShadow:`0 4px 20px ${CYN}80` }}>{xpGain}</div>}
      
      <div style={{ flex:1, overflowY:"auto", paddingBottom:85 }}>
        
        {/* ── INÍCIO ── */}
        {tab === "home" && (
          <div style={{ padding:"18px 16px" }}>
            {myNotifs.length>0 && (
              <div style={{ ...CARD, background:"rgba(244, 114, 182, 0.1)", border:`1px solid ${PNK}` }}>
                <div style={{ fontSize:13, fontWeight:800, color:PNK, marginBottom:10 }}>📩 {myNotifs.length} nova(s) mensagem(ns) da Teresa</div>
                {myNotifs.map(n => (
                  <div key={n.id} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", background:"rgba(0,0,0,0.3)", borderRadius:12, marginBottom:8 }}>
                    <span style={{ fontSize:20 }}>💜</span>
                    <div style={{ flex:1 }}><div style={{ fontSize:13, color:"white", lineHeight:1.6 }}>{n.text}</div><div style={{ fontSize:10, color:"#94a3b8", marginTop:4 }}>{n.date}</div></div>
                    <button onClick={()=>deleteDoc(doc(db, "notifications", user.username, "items", n.id))} style={{ background:"none", border:"none", color:"#94a3b8", fontSize:18 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
            
            {pendingItems.length > 0 ? (
              <div style={CARD}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={SL}>O que tens para fazer</div>
                  <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:800, color:CYN }}>{pendingItems.length}</div>
                </div>
                {pendingItems.map((item,i) => {
                  let ss = PS[item.status];
                  return (
                    <div key={i} onClick={item.go} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 13px", borderRadius:14, background:ss.bg, marginBottom:i<pendingItems.length-1?8:0, cursor:"pointer", border:`1px solid ${ss.bl}` }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:ss.dot, flexShrink:0, boxShadow:`0 0 8px ${ss.dot}` }}/>
                      <span style={{ fontSize:18, flexShrink:0 }}>{item.icon}</span>
                      <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:700, color:"white" }}>{item.title}</div><div style={{ fontSize:11, color:"#94a3b8" }}>{item.sub}</div></div>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}><div style={{ background:"rgba(0,0,0,0.3)", borderRadius:20, padding:"2px 8px", fontSize:9, fontWeight:800, color:ss.bc }}>{ss.badge}</div></div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ ...CARD, background:"rgba(74, 222, 128, 0.1)", border:"1px solid rgba(74, 222, 128, 0.3)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:28 }}>🎉</span>
                  <div><div style={{ fontSize:14, fontWeight:800, color:"#4ade80" }}>Tudo em dia!</div><div style={{ fontSize:12, color:"#cbd5e1" }}>Não tens pedidos pendentes.</div></div>
                </div>
              </div>
            )}

            <div style={CARD}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                <div style={SL}>⚡ Tabela Semanal (Top 3)</div>
                <div style={{ fontSize:11, color:"#94a3b8" }}>reinicia 2ª feira</div>
              </div>
              {top3.length === 0 ? (
                <div style={{ textAlign:"center", padding:"10px 0", color:"#94a3b8", fontSize:13 }}>Ninguém ganhou XP esta semana.</div>
              ) : (
                top3.map(e => {
                  let isMe = e[0] === user.username;
                  return (
                    <div key={e[0]} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:12, background:isMe?"rgba(34, 211, 238, 0.15)":"rgba(255,255,255,0.05)", marginBottom:6, border:isMe?`1px solid ${CYN}`:"1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize:18 }}>⭐</span>
                      <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg, ${e[1].color}, #000)`, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:12, fontWeight:800 }}>{e[1].name[0]}</div>
                      <div style={{ flex:1, fontSize:13, fontWeight:isMe?800:600, color:isMe?CYN:"white" }}>{isMe ? "Tu" : e[1].name}</div>
                      <div style={{ fontSize:14, fontWeight:800, color:isMe?CYN:"#94a3b8" }}>{e[1].xp} XP</div>
                    </div>
                  );
                })
              )}
              <div style={{ marginTop:10, padding:"8px 12px", background:"rgba(0,0,0,0.3)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:inTop3?CYN:"#94a3b8", fontWeight:inTop3?800:400 }}>{inTop3 ? "Estás no TOP 3! 🎉" : "A tua pontuação:"}</span>
                <span style={{ fontSize:14, fontWeight:900, color:inTop3?CYN:"white" }}>{weekXp} XP</span>
              </div>
            </div>

            <div style={CARD}>
              <div style={SL}>📱 Contactar a Teresa</div>
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                <a href="https://wa.me/351916025666" target="_blank" rel="noreferrer" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"11px", borderRadius:12, background:"#4ade80", color:"#0f172a", textDecoration:"none", fontWeight:800, fontSize:13 }}>📲 WhatsApp</a>
                <a href="mailto:teresa.castro@cm-cascais.pt" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"11px", borderRadius:12, background:CYN, color:"#0f172a", textDecoration:"none", fontWeight:800, fontSize:13 }}>✉️ Email</a>
              </div>
              {msgSent ? <div style={{ textAlign:"center", padding:"12px", color:CYN, fontWeight:800, fontSize:13 }}>✓ Mensagem enviada!</div> : (
                <div>
                  <textarea value={msgTxt} onChange={e=>setMsgTxt(e.target.value)} placeholder="Ou envia mensagem aqui..." rows={2} style={{ width:"100%", padding:"10px", borderRadius:12, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", outline:"none", marginBottom:8 }}/>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div onClick={()=>setMsgAnon(!msgAnon)} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
                      <div style={{ width:18, height:18, borderRadius:5, background:msgAnon?PNK:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>{msgAnon&&<span style={{color:"#0f172a", fontWeight:900}}>✓</span>}</div>
                      <span style={{ fontSize:11, color:"#94a3b8" }}>Enviar anonimamente</span>
                    </div>
                    <button onClick={sendMsg} style={{ background:PNK, color:"#0f172a", border:"none", borderRadius:10, padding:"8px 16px", fontSize:12, fontWeight:800, cursor:"pointer" }}>Enviar</button>
                  </div>
                </div>
              )}
            </div>

            {(() => {
              const weekMissions = missions.filter(m => m.week === getWeekKey());
              if (weekMissions.length === 0) return null;
              const doneCnt = weekMissions.filter(m => completedMissions.includes(m.id)).length;
              const allDone = doneCnt === weekMissions.length;
              return (
                <div style={{ ...CARD, border:allDone?`1px solid ${CYN}`:"1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                    <div style={SL}>🎯 Missões da Semana</div>
                    <div style={{ fontSize:11, fontWeight:900, color:allDone?CYN:"white" }}>{doneCnt}/{weekMissions.length}</div>
                  </div>
                  {weekMissions.map(m => {
                    let done = completedMissions.includes(m.id);
                    return (
                      <div key={m.id} onClick={()=>!done&&completeMission(m.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px", borderRadius:12, background:done?"rgba(34, 211, 238, 0.1)":"rgba(0,0,0,0.3)", marginBottom:6, cursor:done?"default":"pointer" }}>
                        <div style={{ width:22, height:22, borderRadius:6, background:done?CYN:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>{done&&<span style={{color:"#0f172a", fontWeight:900}}>✓</span>}</div>
                        <div style={{ flex:1, fontSize:13, fontWeight:done?400:600, color:done?"#94a3b8":"white", textDecoration:done?"line-through":"none" }}>{m.text}</div>
                        <div style={{ fontSize:11, fontWeight:800, color:CYN }}>+{m.xp} XP</div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── DESAFIOS (ANTIGA REFLEXÃO) ── */}
        {tab === "desafios" && (
          <div style={{ padding:"18px 16px" }}>
            <SubTabs options={[["pergunta","💬 Pergunta"],["auto","📊 Autoavaliação"],["satisf","😊 Satisfação"],["quiz","🎯 Quiz"]]} active={desafiosTab} onChange={setDesafiosTab} color={C}/>
            
            {desafiosTab === "pergunta" && (
              <div style={CARD}>
                <div style={SL}>Pergunta da Semana</div>
                <div style={{ fontSize:15, color:"white", fontWeight:700, lineHeight:1.5, marginBottom:16, padding:"12px 14px", background:"rgba(0,0,0,0.3)", borderRadius:12, borderLeft:`3px solid ${CYN}` }}>{activeQ}</div>
                {answered ? (
                  <div style={{ textAlign:"center", padding:"20px 0" }}><div style={{ fontSize:48, marginBottom:10 }}>✅</div><div style={{ fontSize:17, fontWeight:900 }}>Enviado!</div><div style={{ fontSize:13, color:"#94a3b8", marginTop:4 }}>A Teresa vai ler a tua resposta.</div></div>
                ) : (
                  <div>
                    {activeQMode.length > 1 && (
                      <div style={{ marginBottom:14 }}>
                        <div style={SL}>Como queres responder?</div>
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                          {[["texto","✏️","Texto"], ["mood","🌡️","Mood"], ["3p","💡","3 Palavras"], ["completar","🔤","Frase"], ["semana","⭐","Semana"], ["foto","📸","Foto"], ["video","🎥","Vídeo"], ["audio","🎙️","Áudio"]].filter(m=>activeQMode.includes(m[0])).map(m => {
                             let isA = cmode === m[0];
                             return <button key={m[0]} onClick={()=>{setCmode(m[0]); setMediaFile(null);}} style={{ display:"flex", alignItems:"center", gap:4, padding:"7px 12px", borderRadius:20, border:isA?`1px solid ${CYN}`:"1px solid rgba(255,255,255,0.1)", background:isA?"rgba(34, 211, 238, 0.15)":"rgba(255,255,255,0.05)", fontSize:12, fontWeight:700, cursor:"pointer", color:isA?CYN:"#94a3b8" }}>{m[1]} {m[2]}</button>;
                           })}
                        </div>
                      </div>
                    )}
                    {cmode==="texto" && <textarea value={aTxt} onChange={e=>setATxt(e.target.value)} placeholder="Escreve aqui..." rows={4} style={{ width:"100%", padding:"12px", borderRadius:14, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", outline:"none" }}/>}
                    {cmode==="mood" && <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>{MOODS.map((m,i)=><button key={i} onClick={()=>setSelMood(i)} style={{ fontSize:30, background:"none", border:"none", cursor:"pointer", opacity:selMood===i?1:0.3, transform:selMood===i?"scale(1.3)":"" }}>{m}</button>)}</div>}
                    {cmode==="3p" && <div>{[0,1,2].map(i=><input key={i} value={p3[i]||""} onChange={e=>{let n=[...p3]; n[i]=e.target.value; setP3(n);}} placeholder={`Palavra ${i+1}`} style={{ width:"100%", padding:"11px", borderRadius:12, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", marginBottom:8 }}/>)}</div>}
                    {cmode==="completar" && <div><div style={{ display:"flex", gap:8, marginBottom:10 }}><div style={{ flex:1, padding:"11px", background:"rgba(34, 211, 238, 0.1)", borderRadius:12, fontSize:14, fontWeight:700, color:CYN }}>{COMPL[cidx]}</div><button onClick={()=>setCidx((cidx+1)%COMPL.length)} style={{ padding:"8px 12px", background:"rgba(255,255,255,0.1)", color:"white", border:"none", borderRadius:10 }}>↻</button></div><textarea value={aTxt} onChange={e=>setATxt(e.target.value)} placeholder="..." rows={3} style={{ width:"100%", padding:"12px", borderRadius:14, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white" }}/></div>}
                    {cmode==="semana" && <div><div style={{ fontSize:12, color:"#94a3b8", marginBottom:10 }}>Como foi a tua semana? (1 a 10)</div><div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{[1,2,3,4,5,6,7,8,9,10].map(n=>{ let isA=selMood===n; return <button key={n} onClick={()=>setSelMood(n)} style={{ flex:1, minWidth:28, padding:"10px 4px", borderRadius:10, border:isA?`1px solid ${CYN}`:"1px solid rgba(255,255,255,0.1)", background:isA?CYN:"rgba(0,0,0,0.3)", color:isA?"#0f172a":"white", fontWeight:800 }}>{n}</button>; })}</div></div>}
                    {["foto", "video"].includes(cmode) && (
                      <div style={{ padding:"20px", border:"2px dashed rgba(255,255,255,0.2)", borderRadius:14, textAlign:"center", background:"rgba(0,0,0,0.3)" }}>
                        <div style={{ fontSize:12, fontWeight:700, color:"#94a3b8", marginBottom:10 }}>{cmode==="foto" ? "Seleciona Foto 📸" : "Seleciona Vídeo 🎥"}</div>
                        <input type="file" accept={cmode==="foto"?"image/*":"video/*"} onChange={e=>{if(e.target.files[0]) setMediaFile(e.target.files[0]);}} style={{ maxWidth:"100%", fontSize:12, color:"white" }}/>
                        {mediaFile && <div style={{ fontSize:12, color:CYN, fontWeight:800, marginTop:10 }}>✓ {mediaFile.name.slice(0,20)}…</div>}
                      </div>
                    )}
                    <Btn onClick={submitAnswer}>{isUploading ? "A carregar..." : "Enviar Resposta"}</Btn>
                  </div>
                )}
              </div>
            )}

            {desafiosTab === "auto" && (
              <div>
                {DIMS.map(dim => {
                  let v=dScores[dim.id]; let sl=scoreLabel(v); let lb=sl[0]; let col=sl[1];
                  return (
                    <div key={dim.id} style={CARD}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                        <div style={{ flex:1, paddingRight:12 }}><div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", letterSpacing:1.5 }}>{dim.id}</div><div style={{ fontSize:14, fontWeight:800 }}>{dim.label}</div></div>
                        <div style={{ textAlign:"center", flexShrink:0 }}><div style={{ fontSize:28, fontWeight:900, color:col, textShadow:`0 0 10px ${col}80` }}>{v}</div></div>
                      </div>
                      <div style={{ padding:"10px", background:"rgba(0,0,0,0.3)", borderRadius:12, fontSize:12, color:"#cbd5e1", marginBottom:12 }}>{dim.desc}</div>
                      <input type="range" min={1} max={10} value={v} onChange={e=>setDScores(upd(dScores,dim.id,Number(e.target.value)))} style={{ width:"100%", marginBottom:12, accentColor:col }}/>
                      <textarea value={dNotas[dim.id]} onChange={e=>setDNotas(upd(dNotas,dim.id,e.target.value))} placeholder="Notas..." rows={2} style={{ width:"100%", padding:"10px", borderRadius:12, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", outline:"none" }}/>
                    </div>
                  );
                })}
                {autoSaved ? <Btn variant="success">✓ Guardado{autoShared?" e Partilhado":""}</Btn> : (
                  <div style={{ display:"flex", gap:8 }}><Btn variant="dark" onClick={()=>saveAutoEval(false)}>💾 Guardar</Btn><Btn onClick={()=>saveAutoEval(true)}>🔗 Partilhar</Btn></div>
                )}
              </div>
            )}

            {desafiosTab === "satisf" && (
              <div>
                {sSaved ? (
                  <div style={{ textAlign:"center", padding:"40px 20px" }}><div style={{ fontSize:56 }}>🎉</div><div style={{ fontSize:20, fontWeight:900 }}>Obrigada!</div></div>
                ) : (
                  <div>
                    <div style={{ display:"flex", gap:6, marginBottom:14, overflowX:"auto" }}>
                      {SURVEY_CATS.map((sc,i) => {
                        let isA=sCatIdx===i; let hasDot=sRatings[sc.id]>0;
                        return <button key={sc.id} onClick={()=>setSCatIdx(i)} style={{ display:"flex", alignItems:"center", gap:4, padding:"8px 14px", borderRadius:20, border:isA?`1px solid ${PNK}`:"1px solid rgba(255,255,255,0.1)", background:isA?"rgba(244, 114, 182, 0.15)":"rgba(255,255,255,0.05)", fontSize:11, fontWeight:700, cursor:"pointer", color:isA?PNK:"#94a3b8", whiteSpace:"nowrap" }}>{sc.icon} {sc.label}{hasDot&&<span style={{marginLeft:4, color:PNK}}>✓</span>}</button>;
                      })}
                    </div>
                    <div style={CARD}>
                      <div style={{ fontSize:15, fontWeight:800, marginBottom:16 }}>{SURVEY_CATS[sCatIdx].q}</div>
                      <div style={{ display:"flex", justifyContent:"space-around", marginBottom:16 }}>
                        {[1,2,3,4,5].map(n => {
                          let isSel=sRatings[SURVEY_CATS[sCatIdx].id]===n;
                          return <button key={n} onClick={()=>setSRatings(upd(sRatings,SURVEY_CATS[sCatIdx].id,n))} style={{ background:"none", border:"none", cursor:"pointer", fontSize:isSel?38:28, opacity:isSel?1:0.3, transform:isSel?"scale(1.2)":"scale(1)" }}>{SEMOJIS[n]}</button>;
                        })}
                      </div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
                        {SURVEY_CATS[sCatIdx].chips.map(chip => {
                          let isSel=(sChips[SURVEY_CATS[sCatIdx].id]||[]).includes(chip);
                          return <button key={chip} onClick={()=>setSChips(p=>{ let cur=p[SURVEY_CATS[sCatIdx].id]||[]; return upd(p, SURVEY_CATS[sCatIdx].id, cur.includes(chip)?cur.filter(c=>c!==chip):[...cur, chip]); })} style={{ padding:"7px 12px", borderRadius:20, border:isSel?`1px solid ${PNK}`:"1px solid rgba(255,255,255,0.1)", background:isSel?"rgba(244, 114, 182, 0.15)":"rgba(0,0,0,0.3)", fontSize:12, fontWeight:isSel?800:600, color:isSel?PNK:"#94a3b8" }}>{chip}</button>;
                        })}
                      </div>
                      <div style={{ display:"flex", gap:8 }}>
                        {sCatIdx>0 && <Btn variant="dark" onClick={()=>setSCatIdx(sCatIdx-1)}>← Anterior</Btn>}
                        {sCatIdx<SURVEY_CATS.length-1 && <Btn color={PNK} onClick={()=>setSCatIdx(sCatIdx+1)}>Próximo →</Btn>}
                      </div>
                    </div>
                    {sCatIdx===SURVEY_CATS.length-1 && (
                      <div style={CARD}>
                        <div style={{ fontSize:14, fontWeight:800, marginBottom:10 }}>💬 O que mudarias no programa?</div>
                        <textarea value={sMudaria} onChange={e=>setSMudaria(e.target.value)} placeholder="A tua opinião é anónima..." rows={3} style={{ width:"100%", padding:"12px", borderRadius:14, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", marginBottom:14 }}/>
                        <Btn color={PNK} onClick={saveSatisf}>Enviar Avaliação (Anónima) →</Btn>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {desafiosTab === "quiz" && (
              <div style={CARD}>
                <div style={SL}>🎯 O que farias?</div>
                <div style={{ display:"flex", gap:6, marginBottom:14 }}>
                  {QUIZZES.map((q,i) => {
                    let hasAns=qAnswers[q.id];
                    return <button key={q.id} onClick={()=>setQIdx(i)} style={{ flex:1, padding:"7px 4px", borderRadius:10, border:qIdx===i?`1px solid ${CYN}`:"1px solid rgba(255,255,255,0.1)", background:qIdx===i?"rgba(34, 211, 238, 0.15)":"rgba(0,0,0,0.3)", fontSize:10, fontWeight:800, color:qIdx===i?CYN:"#94a3b8" }}>{q.title.slice(0,12)}{hasAns&&" ✓"}</button>;
                  })}
                </div>
                <div style={{ fontSize:13, color:"white", lineHeight:1.6, marginBottom:14, padding:"13px", background:"rgba(0,0,0,0.3)", borderRadius:14, borderLeft:`3px solid ${CYN}` }}>{QUIZZES[qIdx].scenario}</div>
                {!qAnswers[QUIZZES[qIdx].id] ? (
                  <div>
                    {QUIZZES[qIdx].opts.map(opt => (
                      <button key={opt.id} onClick={async ()=>{ const nA={...qAnswers, [QUIZZES[qIdx].id]:opt.id}; setQAnswers(nA); await saveUserField(user.username, {qAnswers:nA}); await addHistoryLog("Respondeu a um Quiz ("+opt.id+")"); await addXp(15); }} style={{ display:"flex", gap:10, width:"100%", padding:"13px", borderRadius:14, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", fontSize:13, cursor:"pointer", textAlign:"left", marginBottom:8, color:"white" }}><span style={{ fontWeight:900, color:CYN }}>{opt.id}</span><span>{opt.text}</span></button>
                    ))}
                  </div>
                ) : (
                  <div>
                    {QUIZZES[qIdx].opts.map(opt => {
                      let chosen = qAnswers[QUIZZES[qIdx].id]===opt.id; let pct = QUIZZES[qIdx].mock[opt.id];
                      return (
                        <div key={opt.id} style={{ marginBottom:10 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><span style={{ fontSize:12, color:chosen?CYN:"#94a3b8", fontWeight:chosen?800:400 }}>{opt.id} {opt.text.slice(0,30)}…</span><span style={{ fontSize:13, fontWeight:900, color:chosen?CYN:"#94a3b8" }}>{pct}%</span></div>
                          <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:99, height:7 }}><div style={{ background:chosen?CYN:"#94a3b8", height:"100%", width:pct+"%", borderRadius:99 }}/></div>
                        </div>
                      );
                    })}
                    <div style={{ marginTop:14, padding:"13px", background:"rgba(34, 211, 238, 0.1)", borderRadius:14, fontSize:13, color:"white" }}>
                      <strong style={{ color:CYN }}>A tua escolha:</strong> {QUIZZES[qIdx].opts.find(o=>o.id===qAnswers[QUIZZES[qIdx].id]).reveal}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── FÓRUM ── */}
        {tab === "forum" && (
          <div style={{ padding:"18px 16px" }}>
            <div style={{ display:"flex", gap:6, marginBottom:12, overflowX:"auto" }}>
              {CHANNELS.map(ch => {
                let isA = channel===ch.id;
                return <button key={ch.id} onClick={()=>setChannel(ch.id)} style={{ display:"flex", alignItems:"center", gap:5, padding:"9px 14px", borderRadius:20, border:isA?`1px solid ${CYN}`:"1px solid rgba(255,255,255,0.1)", background:isA?"rgba(34, 211, 238, 0.15)":"rgba(255,255,255,0.05)", fontSize:12, fontWeight:700, cursor:"pointer", color:isA?CYN:"#94a3b8", whiteSpace:"nowrap" }}>{ch.icon} {ch.label}</button>;
              })}
            </div>
            
            <div style={CARD}>
              <div style={{ display:"flex", gap:8, flexDirection:"column" }}>
                <textarea value={fPost} onChange={e=>setFPost(e.target.value)} placeholder="Escreve no fórum..." rows={2} style={{ width:"100%", padding:"12px", borderRadius:12, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", outline:"none" }}/>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <input type="file" accept="image/*" onChange={e => {if(e.target.files[0]) setMediaFile(e.target.files[0])}} style={{ fontSize:11, color:"#94a3b8" }}/>
                  <button onClick={postForum} disabled={isUploading} style={{ background:CYN, color:"#0f172a", border:"none", borderRadius:12, padding:"8px 16px", fontWeight:800, cursor:"pointer", marginLeft:"auto" }}>{isUploading ? "A carregar..." : "Publicar"}</button>
                </div>
              </div>
            </div>

            {(posts[channel]||[]).slice().reverse().map(p => (
              <div key={p.id} style={CARD}>
                <div style={{ display:"flex", gap:10 }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:`linear-gradient(135deg, ${p.color}, #000)`, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:14, fontWeight:900, flexShrink:0 }}>{p.user[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:13, fontWeight:800 }}>{p.user}</span><span style={{ fontSize:11, color:"#94a3b8" }}>{p.time}</span></div>
                    {p.text && <div style={{ fontSize:14, color:"#cbd5e1", marginTop:4, lineHeight:1.55 }}>{p.text}</div>}
                    {p.media && <div style={{ marginTop:10 }}><img src={p.media} alt="Anexo" style={{ maxWidth:"100%", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)" }}/></div>}
                    
                    <div style={{ marginTop:12, display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                      {FORUM_REACTIONS.map(r => {
                        let cnt = (p.reactions||{})[r.id] || 0;
                        let myReact = ((p.reactedBy||{})[r.id]||[]).includes(user.username);
                        return <span key={r.id} onClick={()=>reactPost(p.id,r.id)} style={{ fontSize:12, padding:"4px 8px", borderRadius:20, background:myReact?"rgba(34, 211, 238, 0.15)":"rgba(255,255,255,0.05)", color:myReact?CYN:"#94a3b8", cursor:"pointer", fontWeight:myReact?800:400 }}>{r.icon}{cnt>0?" "+cnt:""}</span>;
                      })}
                      <span onClick={()=>setReplyTo(replyTo===p.id?null:p.id)} style={{ fontSize:12, color:"#94a3b8", cursor:"pointer", fontWeight:800 }}>💬 Responder</span>
                      {p.replies.length>0&&<span onClick={()=>setExpanded(expanded===p.id?null:p.id)} style={{ fontSize:12, color:CYN, fontWeight:800, cursor:"pointer" }}>{expanded===p.id?"▲":"▼"} {p.replies.length}</span>}
                    </div>
                  </div>
                </div>
                {expanded===p.id && p.replies.length>0 && (
                  <div style={{ marginTop:10, marginLeft:48, borderLeft:"2px solid rgba(255,255,255,0.1)", paddingLeft:12 }}>
                    {p.replies.map((rp,ri) => (
                      <div key={ri} style={{ display:"flex", gap:8, marginBottom:8 }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg, ${rp.color}, #000)`, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:11, fontWeight:900, flexShrink:0 }}>{rp.user[0]}</div>
                        <div><div style={{ fontSize:12, fontWeight:800 }}>{rp.user} <span style={{ color:"#94a3b8", fontWeight:400 }}>· {rp.time}</span></div><div style={{ fontSize:12, color:"#cbd5e1", marginTop:2 }}>{rp.text}</div></div>
                      </div>
                    ))}
                  </div>
                )}
                {replyTo===p.id && (
                  <div style={{ marginTop:10, marginLeft:48, display:"flex", gap:8 }}>
                    <input value={replyTxt} onChange={e=>setReplyTxt(e.target.value)} placeholder="Responder..." style={{ flex:1, padding:"9px 14px", borderRadius:20, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:12, outline:"none" }} autoFocus/>
                    <button onClick={()=>sendReply(p.id)} style={{ background:CYN, color:"#0f172a", border:"none", borderRadius:20, padding:"9px 16px", fontSize:12, cursor:"pointer", fontWeight:900 }}>↑</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── PIA (ANTIGO PERCURSO) ── */}
        {tab === "pia" && (
          <div style={{ padding:"18px 16px" }}>
            <SubTabs options={[["planeamento","📋 O Meu PIA"],["swot","🔍 Raio-X"]]} active={piaTab} onChange={setPiaTab} color={C}/>
            
            {piaTab === "planeamento" && (
              <div>
                <div style={CARD}>
                  <div style={SL}>Termómetro do Projeto</div>
                  <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:99, height:11, overflow:"hidden", marginBottom:6 }}><div style={{ background:CYN, height:"100%", width:prog+"%", borderRadius:99, boxShadow:`0 0 10px ${CYN}` }}/></div>
                  <div style={{ fontSize:11, color:"#94a3b8" }}>{prog}% completo</div>
                </div>
                {PIA_FIELDS.map(f => (
                  <div key={f.key} style={{ ...CARD, borderLeft:pia[f.key].trim()?`4px solid ${CYN}`:"4px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:10 }}>
                      <span style={{ fontSize:18 }}>{f.icon}</span>
                      <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:900 }}>{f.title}</div><div style={{ fontSize:11, color:"#94a3b8" }}>{f.hint}</div></div>
                    </div>
                    <textarea value={pia[f.key]} onChange={e=>setPia(upd(pia,f.key,e.target.value))} placeholder={f.ph} rows={2} style={{ width:"100%", padding:"11px 13px", borderRadius:12, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:13, outline:"none" }}/>
                  </div>
                ))}
                <div style={CARD}>
                  <div style={{ fontSize:13, fontWeight:900, marginBottom:10 }}>🗓️ ATIVIDADES A DESENVOLVER</div>
                  {piaActs.map((a,i) => (
                    <div key={i} style={{ marginBottom:10, padding:12, background:"rgba(255,255,255,0.05)", borderRadius:14, border:a.oQue.trim()?`1px solid ${CYN}`:"1px solid rgba(255,255,255,0.1)" }}>
                      <div style={{ fontSize:10, fontWeight:900, color:CYN, letterSpacing:1, marginBottom:8 }}>ATIVIDADE {i+1}</div>
                      {[["oQue","Descrição"],["quando","Quando?"],["obj","Objetivo"]].map(pair => (
                        <input key={pair[0]} value={a[pair[0]]} onChange={e=>{let n=[...piaActs]; n[i]=upd(n[i],pair[0],e.target.value); setPiaActs(n);}} placeholder={pair[1]} style={{ width:"100%", padding:"9px", borderRadius:10, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:12, outline:"none", marginBottom:6 }}/>
                      ))}
                    </div>
                  ))}
                </div>
                {piaSaved ? <Btn variant="success">✓ Guardado{piaShared?" e Partilhado":""}</Btn> : <div style={{ display:"flex", gap:8 }}><Btn variant="dark" onClick={()=>savePia(false)}>💾 Guardar</Btn><Btn onClick={()=>savePia(true)}>🔗 Partilhar</Btn></div>}
              </div>
            )}

            {piaTab === "swot" && (
              <div>
                <div style={{ ...CARD, background:"rgba(34, 211, 238, 0.1)", border:`1px solid ${CYN}` }}>
                  <div style={{ fontSize:15, fontWeight:900, color:CYN, marginBottom:6 }}>Análise do Projeto</div>
                  <div style={{ fontSize:12, color:"#cbd5e1" }}>Preenche a SWOT focada apenas no teu PIA para a Ludoteca.</div>
                </div>
                {SWOT_Q.map(q => (
                  <div key={q.id} style={{ ...CARD, borderLeft:swotPia[q.id].trim()?`4px solid ${q.color}`:"4px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize:14, fontWeight:900, color:q.color, marginBottom:4 }}>{q.label}</div>
                    <div style={{ fontSize:11, color:"#94a3b8", marginBottom:10 }}>{q.sub}</div>
                    <textarea value={swotPia[q.id]} onChange={e=>setSwotPia(upd(swotPia,q.id,e.target.value))} placeholder={q.ph} rows={3} style={{ width:"100%", padding:"11px 13px", borderRadius:12, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:13, outline:"none" }}/>
                  </div>
                ))}
                {swotSaved ? <Btn variant="success">✓ Guardado{swotShared?" e Partilhado":""}</Btn> : <div style={{ display:"flex", gap:8 }}><Btn variant="dark" onClick={()=>saveSwot(false)}>💾 Guardar</Btn><Btn onClick={()=>saveSwot(true)}>🔗 Partilhar</Btn></div>}
              </div>
            )}
          </div>
        )}

        {/* ── PERFIL ── */}
        {tab === "perfil" && (
          <div style={{ padding:"18px 16px" }}>
            <SubTabs options={[["tarefas","✅ To-Do"],["agenda","📅 Agenda"],["roda","🌸 Roda"],["hist","📜 Hist."],["cap","💌 Cápsula"],["export","📤 Info"]]} active={perfilTab} onChange={setPerfilTab} color={C}/>
            
            {perfilTab === "tarefas" && (
              <div>
                <div style={CARD}>
                  <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:12 }}>
                    <div style={{ flex:1 }}><div style={SL}>A Tua Lista de Tarefas</div><div style={{ fontSize:12, color:"#94a3b8" }}>{doneTodos.length} de {acceptedTodos.length} concluídas</div></div>
                    <div style={{ textAlign:"center" }}><div style={{ fontSize:32, fontWeight:900, color:CYN, textShadow:`0 0 10px ${CYN}80` }}>{todoPercent}%</div></div>
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:99, height:10 }}><div style={{ background:CYN, height:"100%", width:todoPercent+"%", borderRadius:99, boxShadow:`0 0 10px ${CYN}` }}/></div>
                </div>
                
                {pendingTeresaTodos.length>0 && (
                  <div style={{ ...CARD, background:"rgba(34, 211, 238, 0.1)", border:`1px solid ${CYN}` }}>
                    <div style={{ fontSize:12, fontWeight:900, color:CYN, marginBottom:10 }}>📩 {pendingTeresaTodos.length} sugestão(ões) da Teresa</div>
                    {pendingTeresaTodos.map(t => (
                      <div key={t.id} style={{ padding:"12px 14px", background:"rgba(0,0,0,0.4)", borderRadius:14, marginBottom:8 }}>
                        <div style={{ fontSize:13, fontWeight:800, marginBottom:4 }}>{t.text}</div>
                        {t.due && <div style={{ fontSize:11, color:"#94a3b8", marginBottom:10 }}>📅 Limite: {fmtDate(t.due)}</div>}
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={()=>acceptTodo(t.id)} style={{ flex:1, padding:"9px", borderRadius:12, border:"none", background:CYN, color:"#0f172a", fontSize:13, fontWeight:900, cursor:"pointer" }}>✓ Aceitar</button>
                          <button onClick={()=>rejectTodo(t.id)} style={{ flex:1, padding:"9px", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#cbd5e1", fontSize:13, fontWeight:900, cursor:"pointer" }}>✕ Rejeitar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={CARD}>
                  <div style={SL}>Por Fazer</div>
                  {acceptedTodos.filter(t=>!t.done).map(t => (
                    <div key={t.id} onClick={()=>toggleTodoDone(t.id)} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", cursor:"pointer" }}>
                      <div style={{ width:22, height:22, borderRadius:6, border:"2px solid rgba(255,255,255,0.3)", flexShrink:0 }}/>
                      <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:700 }}>{t.text}</div><div style={{ display:"flex", gap:8, marginTop:4 }}>{t.due&&<span style={{ fontSize:10, color:isOverdue(t.due)?"#fb7185":"#94a3b8" }}>📅 {fmtDate(t.due)}</span>}<span style={{ fontSize:10, color:t.shared?CYN:"#94a3b8" }}>{t.shared?"👁️ partilhada":"🔒 privada"}</span></div></div>
                    </div>
                  ))}
                  {acceptedTodos.filter(t=>!t.done).length===0 && <div style={{ textAlign:"center", padding:"10px", color:"#94a3b8", fontSize:13 }}>Nenhuma tarefa pendente 🎉</div>}
                </div>

                {doneTodos.length>0 && (
                  <div style={CARD}>
                    <div style={SL}>Concluídas ✓</div>
                    {doneTodos.map(t => (
                      <div key={t.id} onClick={()=>toggleTodoDone(t.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", cursor:"pointer", opacity:0.6 }}>
                        <div style={{ width:22, height:22, borderRadius:6, background:CYN, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><span style={{ color:"#0f172a", fontSize:12, fontWeight:900 }}>✓</span></div>
                        <div style={{ fontSize:13, textDecoration:"line-through", color:"#94a3b8" }}>{t.text}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={CARD}>
                  <div style={SL}>➕ Nova Tarefa</div>
                  <input value={newTodo.text} onChange={e=>setNewTodo(upd(newTodo,"text",e.target.value))} placeholder="Descrição..." style={{ width:"100%", padding:"11px 14px", borderRadius:12, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", marginBottom:8 }}/>
                  <input type="date" value={newTodo.due} onChange={e=>setNewTodo(upd(newTodo,"due",e.target.value))} style={{ width:"100%", padding:"10px 12px", borderRadius:12, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", marginBottom:10 }}/>
                  <div onClick={()=>setNewTodo(upd(newTodo,"shared",!newTodo.shared))} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, cursor:"pointer" }}>
                    <div style={{ width:22, height:22, borderRadius:6, background:newTodo.shared?CYN:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>{newTodo.shared&&<span style={{ color:"#0f172a", fontWeight:900 }}>✓</span>}</div>
                    <span style={{ fontSize:12, color:"#cbd5e1" }}>Partilhar com a Teresa (ela pode ver)</span>
                  </div>
                  <Btn onClick={addTodoForUser}>Adicionar Tarefa</Btn>
                </div>
              </div>
            )}

            {perfilTab === "agenda" && (
              <div>
                <div style={CARD}>
                  <div style={SL}>➕ Novo Evento</div>
                  <input value={newEvt.title} onChange={e=>setNewEvt(upd(newEvt,"title",e.target.value))} placeholder="Título..." style={{ width:"100%", padding:"11px 14px", borderRadius:12, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", marginBottom:8 }}/>
                  <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                    <input type="date" value={newEvt.date} onChange={e=>setNewEvt(upd(newEvt,"date",e.target.value))} style={{ flex:1, padding:"10px", borderRadius:12, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white" }}/>
                    <input type="time" value={newEvt.time} onChange={e=>setNewEvt(upd(newEvt,"time",e.target.value))} style={{ width:90, padding:"10px", borderRadius:12, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white" }}/>
                  </div>
                  <div onClick={()=>setNewEvt(upd(newEvt,"shareWithTeresa",!newEvt.shareWithTeresa))} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, cursor:"pointer" }}>
                    <div style={{ width:20, height:20, borderRadius:6, background:newEvt.shareWithTeresa?CYN:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>{newEvt.shareWithTeresa&&<span style={{ color:"#0f172a", fontWeight:900 }}>✓</span>}</div>
                    <span style={{ fontSize:12, color:"#cbd5e1" }}>Partilhar com a Teresa</span>
                  </div>
                  <Btn onClick={addPersonalEvent}>Agendar</Btn>
                </div>
                {userEvents.length===0 ? <div style={{ textAlign:"center", padding:"30px", color:"#94a3b8" }}>Sem eventos agendados.</div> : userEvents.map(e => {
                  let col = EVT_COLORS[e.type]||"#94a3b8"; let isGroup = e.userId==="all";
                  return (
                    <div key={e.id} style={{ ...CARD, borderLeft:`4px solid ${col}` }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:24 }}>{EVT_ICONS[e.type]}</span>
                        <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:900 }}>{e.title}</div><div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>{fmtDate(e.date)}{e.time?" · "+e.time:""} {isGroup&&<span style={{ marginLeft:8, background:"rgba(34, 211, 238, 0.1)", color:CYN, padding:"2px 8px", borderRadius:8, fontSize:10, fontWeight:800 }}>Grupo</span>}</div></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {perfilTab === "roda" && (
              <div>
                <div style={CARD}>
                  <div style={SL}>Roda da Vida Atual</div>
                  <RadarChart scores={roda} color={PNK} prev={rodaSaves.length>0?rodaSaves[rodaSaves.length-1].scores:null}/>
                </div>
                {RODA_DIMS.map(dim => {
                  let v=roda[dim.id]; let isExp=rodaExp===dim.id;
                  return (
                    <div key={dim.id} style={CARD}>
                      <div onClick={()=>setRodaExp(isExp?null:dim.id)} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                        <span style={{ fontSize:20 }}>{dim.icon}</span>
                        <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:900 }}>{dim.label}</div><div style={{ background:"rgba(255,255,255,0.1)", borderRadius:99, height:6, marginTop:6 }}><div style={{ background:PNK, height:"100%", width:(v*10)+"%", borderRadius:99, boxShadow:`0 0 8px ${PNK}` }}/></div></div>
                        <div style={{ fontSize:22, fontWeight:900, color:PNK }}>{v}</div>
                      </div>
                      {isExp && (
                        <div style={{ marginTop:14 }}>
                          <div style={{ fontSize:12, color:"#cbd5e1", marginBottom:10, padding:"10px", background:"rgba(0,0,0,0.3)", borderRadius:10 }}>{dim.desc}</div>
                          <input type="range" min={0} max={10} value={v} onChange={e=>setRoda(upd(roda,dim.id,Number(e.target.value)))} style={{ width:"100%", accentColor:PNK }}/>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div style={{ display:"flex", gap:8 }}><Btn variant="dark" onClick={()=>saveRoda(false)}>💾 Guardar</Btn><Btn color={PNK} onClick={()=>saveRoda(true)}>🔗 Partilhar</Btn></div>
              </div>
            )}

            {perfilTab === "hist" && (
              <div>
                <div style={CARD}>
                  <div style={SL}>📜 Histórico de Atividades</div>
                  <div style={{ fontSize:12, color:"#94a3b8", marginBottom:14 }}>Tudo o que fazes e guardas fica registado aqui. Nenhuma informação se perde.</div>
                  {history.length === 0 ? <div style={{ textAlign:"center", padding:"20px", color:"#94a3b8", fontSize:13 }}>Ainda não há atividades registadas.</div> : history.slice().reverse().map((h, i) => (
                    <div key={i} style={{ padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div style={{ fontSize:13, color:"white", fontWeight:700 }}>{h.action}</div>
                      <div style={{ fontSize:11, color:CYN, whiteSpace:"nowrap", marginLeft:10, fontWeight:800 }}>{h.date}</div>
                    </div>
                  ))}
                </div>
                
                <div style={CARD}>
                  <div style={SL}>🌸 Histórico da Roda da Vida</div>
                  {rodaSaves.length===0 ? <div style={{ textAlign:"center", padding:"10px", color:"#94a3b8", fontSize:13 }}>Ainda não guardaste nenhuma roda.</div> : rodaSaves.slice().reverse().map((sv,i) => (
                    <div key={i} style={{ marginBottom:24, paddingBottom:16, borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ fontSize:12, fontWeight:900, color:PNK, marginBottom:10 }}>{sv.label}</div>
                      <RadarChart scores={sv.scores} color={PNK} prev={null}/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {perfilTab === "cap" && (
              <div>
                <div style={{ ...CARD, background:"rgba(168, 85, 247, 0.1)", border:"1px solid #a855f7" }}>
                  <div style={{ fontSize:16, fontWeight:900, color:"#c084fc", marginBottom:8 }}>💌 Cápsula do Tempo</div>
                  <div style={{ fontSize:13, color:"#e9d5ff", lineHeight:1.7 }}>Escreve uma mensagem para ti daqui a 3 meses. Só tu vais poder ler.</div>
                </div>
                {!cap.locked ? (
                  <div style={CARD}>
                    <div style={{ fontSize:13, fontWeight:800, marginBottom:10 }}>Querido/a {user.realName} do futuro...</div>
                    <textarea value={cap.text} onChange={e=>setCap(upd(cap,"text",e.target.value))} placeholder="Como estás hoje? O que esperas?" rows={6} style={{ width:"100%", padding:"12px", borderRadius:14, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", marginBottom:14, outline:"none" }}/>
                    <Btn color="#a855f7" onClick={sealCapsule}>🔒 Selar Cápsula</Btn>
                  </div>
                ) : !cap.revealed ? (
                  <div style={{ textAlign:"center", padding:"40px 20px" }}>
                    <div style={{ fontSize:64, marginBottom:14 }}>🔒</div>
                    <div style={{ fontSize:18, fontWeight:900 }}>Cápsula selada</div>
                    <div style={{ fontSize:14, color:"#c084fc", marginTop:8, marginBottom:28 }}>Abrir em <strong>{cap.lockedDate}</strong></div>
                    <Btn color="#a855f7" onClick={openCapsule}>Abrir mesmo assim →</Btn>
                  </div>
                ) : (
                  <div style={{ ...CARD, background:"rgba(168, 85, 247, 0.15)", border:"1px solid #c084fc" }}>
                    <div style={{ fontSize:14, fontWeight:900, color:"#e9d5ff", marginBottom:14 }}>💌 Mensagem do teu passado:</div>
                    <div style={{ fontSize:14, color:"white", lineHeight:1.8, fontStyle:"italic" }}>{cap.text}</div>
                    <div style={{ marginTop:20 }}><Btn color="#a855f7" onClick={resetCapsule}>Nova Cápsula</Btn></div>
                  </div>
                )}
              </div>
            )}

            {perfilTab === "export" && (
              <div>
                <div style={CARD}>
                  <div style={SL}>📤 Exportar Dados (JSON)</div>
                  <div style={{ fontSize:13, color:"#cbd5e1", lineHeight:1.7, marginBottom:16 }}>Tens o direito de descarregar todos os teus dados. O ficheiro inclui o PIA, histórico, tarefas, etc.</div>
                  <Btn onClick={doExport}>⬇️ Descarregar</Btn>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:420, background:"rgba(15, 23, 42, 0.9)", backdropFilter:"blur(10px)", borderTop:"1px solid rgba(255,255,255,0.1)", display:"flex", padding:"8px 0 20px", zIndex:100 }}>
        {[{id:"home", icon:"🏠", label:"Início"}, {id:"desafios", icon:"⚡", label:"Desafios"}, {id:"forum", icon:"🌐", label:"Fórum"}, {id:"pia", icon:"🚀", label:"PIA"}, {id:"perfil", icon:"👤", label:"Perfil"}].map(t => {
          let isA=tab===t.id; let hasBadge=t.id==="home"&&pendingItems.length>0;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer", position:"relative", opacity:isA?1:0.5 }}>
              <span style={{ fontSize:22, filter:isA?`drop-shadow(0 0 8px ${CYN})`:"none" }}>{t.icon}</span>
              <span style={{ fontSize:9, fontWeight:800, color:isA?CYN:"white", textTransform:"uppercase", letterSpacing:1 }}>{t.label}</span>
              {hasBadge&&<div style={{ position:"absolute", top:0, right:"20%", width:16, height:16, borderRadius:"50%", background:"#f43f5e", color:"white", fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #0f172a" }}>{pendingItems.length}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
