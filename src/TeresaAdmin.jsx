import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, getDoc, updateDoc, deleteDoc, addDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase.js";
import { BG, CARD, SL, AppIcon, Btn, CYN, PNK } from "./theme.jsx";
import { upd, nowLabel, fmtDate, getWeekKey, ALLOWED_USERNAMES, JEEP_LIST, CHANNELS, SURVEY_CATS, SEMOJIS, QUIZZES, ALL_MEDALS, FORUM_REACTIONS, EVT_COLORS, EVT_ICONS, EC } from "./data.js";

export default function TeresaAdmin({ user, onLogout }) {
  const [adminTab, setAdminTab] = useState("geral");
  const [channel, setChannel] = useState("csi");
  const [posts, setPosts] = useState({});
  const [fPost, setFPost] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [replyTxt, setReplyTxt] = useState("");
  
  const [launchType, setLaunchType] = useState("auto");
  const [launchTarget, setLaunchTarget] = useState("all");

  const [activeQ, setActiveQ] = useState("");
  const [activeQEdit, setActiveQEdit] = useState("");
  const [activeQModeEdit, setActiveQModeEdit] = useState(["texto"]);
  const [allShared, setAllShared] = useState({});
  const [adminSharedSel, setAdminSharedSel] = useState(null);

  const [todos, setTodos] = useState({});
  const [adminTodoUsr, setAdminTodoUsr] = useState("nilton");
  const [adminSuggTxt, setAdminSuggTxt] = useState("");
  const [adminSuggDue, setAdminSuggDue] = useState("");

  const [msgs, setMsgs] = useState([]);
  const [sggs, setSggs] = useState([]);
  const [adminMsgTarget, setAdminMsgTarget] = useState("nilton");
  const [adminMsgTxt, setAdminMsgTxt] = useState("");
  const [adminReplyId, setAdminReplyId] = useState(null);
  const [adminReplyTxt, setAdminReplyTxt] = useState("");

  const [events, setEvents] = useState([]);
  const [newEvt, setNewEvt] = useState({ title:"", date:"", time:"", userId:"all", type:"visit" });

  const [missions, setMissions] = useState([]);
  const [adminMissionTxt, setAdminMissionTxt] = useState("");
  const [adminMissionXp, setAdminMissionXp] = useState(10);
  const [leaderboard, setLeaderboard] = useState({});
  
  const [userGdpr, setUserGdpr] = useState({});
  const [amMedals, setAmMedals] = useState({});
  const [amTarget, setAmTarget] = useState("Nilton");

  useEffect(() => {
    const unsubs = ALLOWED_USERNAMES.map(uname => {
      onSnapshot(doc(db, "userData", uname), snap => {
        if(snap.exists()) setAllShared(prev => upd(prev, uname, snap.data()));
      });
      return onSnapshot(collection(db, "todos", uname, "items"), snap => {
        setTodos(prev => upd(prev, uname, snap.docs.map(d => ({id:d.id, ...d.data()}))));
      });
    });
    const uM = onSnapshot(collection(db, "messages"), snap => setMsgs(snap.docs.map(d => ({id:d.id, ...d.data()}))));
    const uS = onSnapshot(collection(db, "suggestions"), snap => setSggs(snap.docs.map(d => ({id:d.id, ...d.data()}))));
    const uE = onSnapshot(collection(db, "events"), snap => setEvents(snap.docs.map(d => ({id:d.id, ...d.data()}))));
    const uL = onSnapshot(doc(db, "config", "weeklyLeaderboard"), snap => setLeaderboard(snap.exists() && snap.data().week===getWeekKey() ? snap.data().scores : {}));
    const uMi = onSnapshot(collection(db, "missions"), snap => setMissions(snap.docs.map(d => ({id:d.id, ...d.data()}))));
    const uQ = onSnapshot(doc(db, "config", "activeQuestion"), snap => { if(snap.exists()){ setActiveQ(snap.data().text); setActiveQModeEdit(snap.data().mode||["texto"]); } });
    
    ALLOWED_USERNAMES.forEach(u => getDoc(doc(db, "users", u)).then(s => { if(s.exists()) setUserGdpr(p => upd(p, u, s.data())); }));
    JEEP_LIST.forEach(j => getDoc(doc(db, "medals", j.username)).then(s => { if(s.exists()) setAmMedals(p => upd(p, j.name, s.data().list||[])); }));
    
    return () => { unsubs.forEach(u=>u()); uM(); uS(); uE(); uL(); uMi(); uQ(); };
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "forum", channel, "posts"), snap => {
      setPosts(p => upd(p, channel, snap.docs.map(d => ({id:d.id, ...d.data()}))));
    });
  }, [channel]);

  // ── LANÇAR PEDIDOS (NOVO) ──
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
      await addDoc(collection(db, "notifications", u, "items"), {
        from: "teresa", text: msg, date: nowLabel(), read: false
      });
    }
    alert("Pedido lançado com sucesso para " + (launchTarget==="all"?"todos os jovens!":launchTarget+"!"));
  }

  // ── FÓRUM COM UPLOAD ──
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
        user: "Teresa (GO)", color: "#22d3ee", text: fPost, media: mediaUrl, time: nowLabel(),
        reactions: { heart:0, fire:0, clap:0, think:0 }, reactedBy: {}, replies: []
      });
      setFPost(""); setMediaFile(null);
    } catch(e) { alert("Erro: " + e.message); }
    setIsUploading(false);
  }

  async function deleteForumPost(pid) {
    if(window.confirm("Apagar este post?")) await deleteDoc(doc(db, "forum", channel, "posts", pid));
  }
  async function sendReply(pid) {
    if (!replyTxt.trim()) return;
    const cur = (posts[channel]||[]).find(p => p.id === pid);
    if (!cur) return;
    await updateDoc(doc(db, "forum", channel, "posts", pid), { replies: [...cur.replies, { user:"Teresa (GO)", color:"#22d3ee", text:replyTxt, time:nowLabel() }] });
    setReplyTxt(""); setReplyTo(null);
  }
  async function reactPost(pid, reaction) {
    const cur = (posts[channel]||[]).find(p => p.id === pid);
    if (!cur) return;
    let rcts = { ...cur.reactions }; let rBy = { ...cur.reactedBy };
    let who = rBy[reaction] || [];
    if (who.includes("admin")) { rcts[reaction] = Math.max(0, (rcts[reaction]||1)-1); rBy[reaction] = who.filter(u=>u!=="admin"); }
    else { rcts[reaction] = (rcts[reaction]||0)+1; rBy[reaction] = [...who, "admin"]; }
    await updateDoc(doc(db, "forum", channel, "posts", pid), { reactions:rcts, reactedBy:rBy });
  }

  // ── ADMIN FUNCTIONS ──
  async function updateActiveQ() {
    if (!activeQEdit.trim()) return alert("Escreve a pergunta!");
    await setDoc(doc(db, "config", "activeQuestion"), { text: activeQEdit.trim(), mode: activeQModeEdit, date: Date.now() });
    for (const u of ALLOWED_USERNAMES) {
      await setDoc(doc(db, "users", u), { answered: false }, { merge: true });
      await addDoc(collection(db, "notifications", u, "items"), { from:"teresa", text:"💬 Nova pergunta da semana!", date:nowLabel(), read:false });
    }
    alert("Pergunta publicada!"); setActiveQEdit("");
  }
  async function addAdminTodo() {
    if (!adminSuggTxt.trim()) return;
    await addDoc(collection(db, "todos", adminTodoUsr, "items"), { text:adminSuggTxt, due:adminSuggDue, done:false, shared:true, addedBy:"teresa", accepted:false });
    setAdminSuggTxt(""); setAdminSuggDue("");
  }
  async function addAdminEvent() {
    if (!newEvt.title.trim() || !newEvt.date) return;
    await addDoc(collection(db, "events"), newEvt);
    setNewEvt({ title:"", date:"", time:"", userId:"all", type:"visit" });
  }
  async function sendAdminMsg() {
    if (!adminMsgTxt.trim()) return;
    await addDoc(collection(db, "notifications", adminMsgTarget, "items"), { from:"teresa", text:adminMsgTxt.trim(), date:nowLabel(), read:false });
    setAdminMsgTxt(""); alert("Mensagem enviada!");
  }
  async function replyToMsg(msgId, hiddenUser, replyText) {
    if (!replyText.trim()) return;
    await updateDoc(doc(db, "messages", msgId), { adminReply: replyText });
    if (hiddenUser) await addDoc(collection(db, "notifications", hiddenUser, "items"), { from:"teresa", text:"Resposta: "+replyText, date:nowLabel(), read:false });
    setAdminReplyId(null); setAdminReplyTxt(""); alert("Respondido!");
  }
  async function addAdminMission() {
    if(!adminMissionTxt.trim()) return;
    await addDoc(collection(db, "missions"), { text:adminMissionTxt, xp:adminMissionXp, week:getWeekKey() });
    setAdminMissionTxt("");
  }
  async function deleteAdminMission(id) { if(window.confirm("Apagar?")) await deleteDoc(doc(db,"missions",id)); }
  async function toggleAMedal(jn, mid) {
    const j = JEEP_LIST.find(x=>x.name===jn); if(!j) return;
    const cur = amMedals[jn]||[];
    const next = cur.includes(mid) ? cur.filter(m=>m!==mid) : [...cur, mid];
    setAmMedals(p=>upd(p,jn,next)); await setDoc(doc(db,"medals",j.username),{list:next});
  }

  const ADMIN_TABS = [["geral","📊 Geral"],["mural","🌐 Fórum"],["partilhas","📂 Partilhas"],["tasks","✅ Tarefas"],["agenda","📅 Agenda"],["missoes","🎯 Missões"],["msgs","💬 Msgs"],["users","👥 Utilizadores"]];

  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:"system-ui,sans-serif", color:"white" }}>
      <div style={{ background:"rgba(15, 23, 42, 0.8)", padding:"16px 20px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(34, 211, 238, 0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <AppIcon size={40}/>
          <div><div style={{ fontSize:10, opacity:0.6, letterSpacing:1.5, textTransform:"uppercase" }}>Painel de Gestão</div><div style={{ fontSize:15, fontWeight:800, color:CYN }}>JEEP · EDUCA+</div></div>
        </div>
        <button onClick={onLogout} style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"white", padding:"7px 16px", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:600 }}>Sair</button>
      </div>
      
      <div style={{ display:"flex", gap:0, background:"rgba(0,0,0,0.5)", overflowX:"auto" }}>
        {ADMIN_TABS.map(t => {
          let isA=adminTab===t[0];
          return <button key={t[0]} onClick={()=>setAdminTab(t[0])} style={{ padding:"12px 16px", background:isA?"rgba(34, 211, 238, 0.1)":"transparent", color:isA?CYN:"#94a3b8", border:"none", fontSize:12, fontWeight:800, cursor:"pointer", whiteSpace:"nowrap", borderBottom:isA?`2px solid ${CYN}`:"2px solid transparent" }}>{t[1]}</button>;
        })}
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"20px 16px" }}>
        {/* ── FÓRUM ── */}
        {adminTab === "mural" && (
          <div>
            <div style={{ display:"flex", gap:6, marginBottom:12, overflowX:"auto" }}>
              {CHANNELS.map(ch => {
                let isA=channel===ch.id;
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
                  <div style={{ width:38, height:38, borderRadius:"50%", background:`linear-gradient(135deg, ${p.color}, #000)`, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:14, fontWeight:800, flexShrink:0 }}>{p.user[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:13, fontWeight:700 }}>{p.user} {p.user==="Teresa (GO)"&&<span style={{fontSize:9, background:CYN, color:"#0f172a", padding:"2px 6px", borderRadius:6, marginLeft:4}}>ADMIN</span>}</span><span style={{ fontSize:11, color:"#94a3b8" }}>{p.time}</span></div>
                    {p.text && <div style={{ fontSize:14, color:"#cbd5e1", marginTop:4, lineHeight:1.55 }}>{p.text}</div>}
                    {p.media && <div style={{ marginTop:10 }}><img src={p.media} alt="Anexo" style={{ maxWidth:"100%", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)" }}/></div>}
                    
                    <div style={{ marginTop:12, display:"flex", gap:12, alignItems:"center" }}>
                      {FORUM_REACTIONS.map(r => {
                        let cnt = (p.reactions||{})[r.id] || 0;
                        return <span key={r.id} onClick={()=>reactPost(p.id,r.id)} style={{ fontSize:12, color:"#94a3b8", cursor:"pointer" }}>{r.icon}{cnt>0?" "+cnt:""}</span>;
                      })}
                      <span onClick={()=>setReplyTo(replyTo===p.id?null:p.id)} style={{ fontSize:12, color:"#94a3b8", cursor:"pointer", fontWeight:600 }}>💬 Responder</span>
                      {p.replies.length>0&&<span onClick={()=>setExpanded(expanded===p.id?null:p.id)} style={{ fontSize:12, color:CYN, fontWeight:700, cursor:"pointer" }}>{expanded===p.id?"▲":"▼"} {p.replies.length}</span>}
                      <span onClick={()=>deleteForumPost(p.id)} style={{ fontSize:12, color:"#fb7185", cursor:"pointer", marginLeft:"auto" }}>🗑️ Apagar</span>
                    </div>
                  </div>
                </div>
                {expanded===p.id && p.replies.length>0 && (
                  <div style={{ marginTop:10, marginLeft:48, borderLeft:"2px solid rgba(255,255,255,0.1)", paddingLeft:12 }}>
                    {p.replies.map((rp,ri) => (
                      <div key={ri} style={{ display:"flex", gap:8, marginBottom:8 }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg, ${rp.color}, #000)`, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:11, fontWeight:800, flexShrink:0 }}>{rp.user[0]}</div>
                        <div><div style={{ fontSize:12, fontWeight:700 }}>{rp.user} {rp.user==="Teresa (GO)"&&<span style={{fontSize:8, background:CYN, color:"#0f172a", padding:"1px 4px", borderRadius:4, marginLeft:4}}>ADMIN</span>} <span style={{ color:"#94a3b8", fontWeight:400 }}>· {rp.time}</span></div><div style={{ fontSize:12, color:"#cbd5e1", marginTop:2 }}>{rp.text}</div></div>
                      </div>
                    ))}
                  </div>
                )}
                {replyTo===p.id && (
                  <div style={{ marginTop:10, marginLeft:48, display:"flex", gap:8 }}>
                    <input value={replyTxt} onChange={e=>setReplyTxt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")sendReply(p.id);}} placeholder="Responder..." style={{ flex:1, padding:"9px 14px", borderRadius:20, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:12, outline:"none" }} autoFocus/>
                    <button onClick={()=>sendReply(p.id)} style={{ background:CYN, color:"#0f172a", border:"none", borderRadius:20, padding:"9px 16px", fontSize:12, cursor:"pointer", fontWeight:800 }}>↑</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── GERAL ── */}
        {adminTab === "geral" && (
          <div>
            <div style={CARD}>
              <div style={SL}>Lançar Pedidos aos Jovens</div>
              <div style={{ fontSize:12, color:"#94a3b8", marginBottom:14 }}>Escolhe um pedido e a quem queres enviar. O jovem recebe notificação e o pedido entra nos "Pendentes".</div>
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                <select value={launchType} onChange={e=>setLaunchType(e.target.value)} style={{ flex:1, padding:"10px", borderRadius:10, background:"rgba(0,0,0,0.3)", color:"white", border:"1px solid rgba(255,255,255,0.1)" }}>
                  <option value="auto">📊 Autoavaliação</option>
                  <option value="satisf">😊 Satisfação</option>
                  <option value="roda">🌸 Roda da Vida</option>
                  <option value="pia">📋 Atualizar PIA</option>
                  <option value="swot">🔍 Raio-X do Projeto</option>
                </select>
                <select value={launchTarget} onChange={e=>setLaunchTarget(e.target.value)} style={{ flex:1, padding:"10px", borderRadius:10, background:"rgba(0,0,0,0.3)", color:"white", border:"1px solid rgba(255,255,255,0.1)" }}>
                  <option value="all">Todos os Jovens</option>
                  {JEEP_LIST.map(j=><option key={j.username} value={j.username}>{j.name}</option>)}
                </select>
              </div>
              <Btn onClick={launchRequest}>Lançar Pedido 🚀</Btn>
            </div>

            <div style={CARD}>
              <div style={SL}>Tabela de XP da Semana</div>
              {Object.entries(leaderboard).sort((a,b)=>b[1].xp-a[1].xp).map((e, i) => (
                <div key={e[0]} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize:14, fontWeight:800, color:"#94a3b8", width:20 }}>#{i+1}</span>
                  <div style={{ width:22, height:22, borderRadius:"50%", background:`linear-gradient(135deg, ${e[1].color}, #000)`, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:10, fontWeight:800 }}>{e[1].name[0]}</div>
                  <div style={{ flex:1, fontSize:13, fontWeight:700 }}>{e[1].name}</div>
                  <div style={{ fontSize:13, fontWeight:800, color:CYN }}>{e[1].xp} XP</div>
                </div>
              ))}
              {Object.keys(leaderboard).length === 0 && <div style={{ fontSize:13, color:"#94a3b8", textAlign:"center", padding:"10px 0" }}>Nenhum XP ganho esta semana.</div>}
            </div>

            <div style={CARD}>
              <div style={SL}>Pergunta Ativa</div>
              <div style={{ fontSize:13, color:"white", fontWeight:600, marginBottom:12, padding:"10px 12px", background:"rgba(0,0,0,0.3)", borderRadius:10, borderLeft:`3px solid ${CYN}` }}>{activeQ}</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                <input value={activeQEdit} onChange={e=>setActiveQEdit(e.target.value)} placeholder="Nova pergunta..." style={{ flex:1, minWidth:200, padding:"11px 14px", borderRadius:12, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:13, outline:"none" }}/>
                <button onClick={updateActiveQ} style={{ background:CYN, color:"#0f172a", border:"none", borderRadius:12, padding:"11px 18px", fontSize:13, fontWeight:800, cursor:"pointer" }}>Publicar</button>
              </div>
              <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", letterSpacing:1, marginBottom:6 }}>PERMITIR RESPOSTAS EM:</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {[["texto","✏️ Texto"],["mood","🌡️ Mood"],["3p","💡 3 Palav."],["completar","🔤 Completar"],["semana","⭐ Avaliação"], ["foto", "📸 Foto"], ["video", "🎥 Vídeo"], ["audio", "🎙️ Áudio"]].map(opt => {
                  let isSel = activeQModeEdit.includes(opt[0]);
                  return <button key={opt[0]} onClick={()=>{ if(isSel && activeQModeEdit.length===1) return; setActiveQModeEdit(isSel ? activeQModeEdit.filter(x=>x!==opt[0]) : [...activeQModeEdit, opt[0]]); }} style={{ padding:"6px 12px", borderRadius:20, border:isSel?`1px solid ${CYN}`:"1px solid rgba(255,255,255,0.1)", background:isSel?"rgba(34, 211, 238, 0.15)":"rgba(255,255,255,0.05)", fontSize:11, fontWeight:700, cursor:"pointer", color:isSel?CYN:"#94a3b8" }}>{opt[1]}</button>;
                })}
              </div>
            </div>

            <div style={CARD}>
              <div style={SL}>Respostas à Pergunta Atual</div>
              {JEEP_LIST.map(j => {
                let d = allShared[j.username] || {};
                let atype = d.answerType || "texto";
                return (
                  <div key={j.username} style={{ padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: d.answered ? 6 : 0 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:d.answered?CYN:"#e2e8f0", flexShrink:0 }}/>
                      <div style={{ fontSize:13, fontWeight:700 }}>{j.name}</div>
                      {d.answered ? <span style={{ fontSize:10, background:"rgba(34, 211, 238, 0.15)", color:CYN, padding:"1px 8px", borderRadius:8, fontWeight:700 }}>✓ respondeu</span> : <span style={{ fontSize:11, color:"#94a3b8" }}>— aguarda</span>}
                    </div>
                    {d.answered && (
                      <div style={{ marginLeft:16, marginTop:8, fontSize:12, color:"#cbd5e1", background:"rgba(0,0,0,0.3)", borderRadius:8, padding:"10px", border:"1px solid rgba(255,255,255,0.05)" }}>
                        {atype === "foto" && d.answerMedia ? (
                          <div style={{ textAlign: "center" }}><img src={d.answerMedia} alt="Resposta" style={{ maxWidth: "100%", borderRadius: 8, marginTop: 5 }} /><a href={d.answerMedia} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 11, color: CYN, marginTop: 5, fontWeight: 700 }}>Ver foto ↗</a></div>
                        ) : atype === "video" && d.answerMedia ? (
                          <div style={{ textAlign: "center" }}><video controls style={{ width: "100%", borderRadius: 8, marginTop: 5 }}><source src={d.answerMedia} /></video><a href={d.answerMedia} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 11, color: CYN, marginTop: 5, fontWeight: 700 }}>Ver vídeo ↗</a></div>
                        ) : atype === "audio" && d.answerMedia ? (
                          <div style={{ marginTop: 5 }}><audio controls style={{ width: "100%" }}><source src={d.answerMedia} /></audio></div>
                        ) : ( <div style={{ fontSize: 13 }}>{d.answerText || "Sem resposta escrita."}</div> )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* O Resto das Informações de Acompanhamento */}
            <div style={CARD}>
              <div style={SL}>Avaliações de Satisfação Anónimas</div>
              {JEEP_LIST.filter(j=>(allShared[j.username]||{}).sSaved).length === 0 ? <div style={{ textAlign:"center", padding:"20px 0", color:"#94a3b8", fontSize:13 }}>Sem avaliações.</div> : JEEP_LIST.map(j => {
                let d = allShared[j.username] || {}; if (!d.sSaved) return null;
                return (
                  <div key={j.username} style={{ padding:14, background:"rgba(0,0,0,0.2)", borderRadius:14, marginBottom:10, border:"1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:j.color, marginBottom:8 }}>{j.name} <span style={{ color:"#94a3b8", fontWeight:400 }}>— anónima</span></div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
                      {SURVEY_CATS.map(c=>{ let r=(d.sRatings||{})[c.id]||0; return(<div key={c.id} style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"4px 10px" }}>{c.icon}<span style={{ fontSize:13 }}>{SEMOJIS[r]}</span><span style={{ fontSize:11, color:"#94a3b8" }}>{r}/5</span></div>);})}
                    </div>
                    {d.sMudaria&&<div style={{ fontSize:12, color:"#cbd5e1", fontStyle:"italic", padding:"8px 12px", background:"rgba(0,0,0,0.3)", borderRadius:8 }}>"{d.sMudaria}"</div>}
                  </div>
                );
              })}
            </div>

            <div style={CARD}>
              <div style={SL}>Respostas ao Quiz</div>
              {JEEP_LIST.map(j => {
                let qa = (allShared[j.username] || {}).qAnswers || {}; let count = Object.keys(qa).length;
                return (
                  <div key={j.username} style={{ padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:count>0?CYN:"#e2e8f0", flexShrink:0 }}/>
                      <div style={{ flex:1, fontSize:13, fontWeight:700 }}>{j.name}</div>
                      <span style={{ fontSize:11, color:"#94a3b8" }}>{count}/{QUIZZES.length} resp.</span>
                    </div>
                    {count>0&&<div style={{ marginLeft:16, marginTop:4, display:"flex", gap:6, flexWrap:"wrap" }}>{QUIZZES.map(q=>{let ans=qa[q.id]; return ans?<span key={q.id} style={{ fontSize:10, background:"rgba(255,255,255,0.1)", borderRadius:8, padding:"2px 8px" }}>{q.title.slice(0,10)}: <strong>{ans}</strong></span>:null;})}</div>}
                  </div>
                );
              })}
            </div>

            <div style={CARD}>
              <div style={SL}>Atribuir Medalhas</div>
              <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
                {JEEP_LIST.map(j=><button key={j.name} onClick={()=>setAmTarget(j.name)} style={{ padding:"7px 16px", borderRadius:20, border:amTarget===j.name?`1px solid ${j.color}`:"1px solid rgba(255,255,255,0.1)", background:amTarget===j.name?`${j.color}20`:"rgba(255,255,255,0.05)", fontSize:12, fontWeight:700, cursor:"pointer", color:amTarget===j.name?j.color:"#94a3b8" }}>{j.name}</button>)}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {ALL_MEDALS.map(m => {
                  let has=(amMedals[amTarget]||[]).includes(m.id);
                  return (<div key={m.id} onClick={()=>toggleAMedal(amTarget,m.id)} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:14, border:has?`1px solid ${CYN}`:"1px solid rgba(255,255,255,0.1)", background:has?"rgba(34, 211, 238, 0.1)":"rgba(0,0,0,0.3)", cursor:"pointer" }}>
                    <span style={{ fontSize:20 }}>{m.icon}</span>
                    <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:700 }}>{m.label}</div></div>
                    {has&&<span style={{ color:CYN, fontWeight:900 }}>✓</span>}
                  </div>);
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── PARTILHAS (PIAs, SWOT, etc) ── */}
        {adminTab === "partilhas" && (
          <div>
            {ALLOWED_USERNAMES.map(uname => {
              let d = allShared[uname] || {};
              let jInfo = JEEP_LIST.find(x=>x.username===uname);
              let hasAny = d.piaShared || d.rodaShared || d.autoShared || d.swotShared || d.sSaved;
              let isOpen = adminSharedSel === uname;
              return (
                <div key={uname} style={CARD}>
                  <div onClick={()=>setAdminSharedSel(isOpen?null:uname)} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:jInfo?jInfo.color:"#94a3b8", flexShrink:0 }}/>
                    <div style={{ flex:1, fontSize:14, fontWeight:800 }}>{jInfo?jInfo.name:uname}</div>
                    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                      {d.piaShared&&<span style={{ fontSize:10, background:"rgba(168, 85, 247, 0.2)", color:"#c084fc", padding:"2px 8px", borderRadius:20, fontWeight:700 }}>PIA</span>}
                      {d.rodaShared&&<span style={{ fontSize:10, background:"rgba(96, 165, 250, 0.2)", color:"#93c5fd", padding:"2px 8px", borderRadius:20, fontWeight:700 }}>Roda</span>}
                      {d.autoShared&&<span style={{ fontSize:10, background:"rgba(74, 222, 128, 0.2)", color:"#86efac", padding:"2px 8px", borderRadius:20, fontWeight:700 }}>Auto</span>}
                      {d.swotShared&&<span style={{ fontSize:10, background:"rgba(251, 191, 36, 0.2)", color:"#fcd34d", padding:"2px 8px", borderRadius:20, fontWeight:700 }}>SWOT</span>}
                      {!hasAny&&<span style={{ fontSize:10, color:"#64748b" }}>Nada partilhado</span>}
                    </div>
                    <span style={{ color:"#94a3b8", fontSize:16, marginLeft:4 }}>{isOpen?"▲":"▼"}</span>
                  </div>
                  {isOpen && (
                    <div style={{ marginTop:14, borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:14 }}>
                      {!hasAny && <div style={{ textAlign:"center", padding:"16px 0", color:"#94a3b8", fontSize:13 }}>Nada para mostrar.</div>}
                      {d.piaShared&&d.pia&&<div style={{marginBottom:14}}><div style={{fontSize:12,fontWeight:800,color:"#c084fc",marginBottom:8}}>📋 PIA</div>{Object.keys(d.pia).filter(k=>d.pia[k]).map(k=><div key={k} style={{fontSize:12,color:"#cbd5e1",padding:"6px 10px",background:"rgba(0,0,0,0.3)",borderRadius:8,marginBottom:4}}><strong>{k}:</strong> {d.pia[k]}</div>)}</div>}
                      {d.swotShared&&d.swotPia&&<div style={{marginBottom:14}}><div style={{fontSize:12,fontWeight:800,color:"#fcd34d",marginBottom:8}}>🔍 Raio-X do Projeto</div>{Object.keys(d.swotPia).filter(k=>d.swotPia[k]).map(k=><div key={k} style={{fontSize:12,color:"#cbd5e1",padding:"6px 10px",background:"rgba(0,0,0,0.3)",borderRadius:8,marginBottom:4}}><strong>{k}:</strong> {d.swotPia[k]}</div>)}</div>}
                      {d.autoShared&&d.dScores&&<div style={{marginBottom:14}}><div style={{fontSize:12,fontWeight:800,color:"#86efac",marginBottom:8}}>📊 Autoavaliação</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{Object.keys(d.dScores).map(k=><div key={k} style={{background:"rgba(74, 222, 128, 0.1)",borderRadius:8,padding:"4px 10px",fontSize:12}}>{k}: <strong>{d.dScores[k]}/10</strong></div>)}</div></div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── OUTROS TABS (Simplificados no código, usam a mesma lógica) ── */}
        {adminTab === "tasks" && (
          <div style={CARD}>
            <div style={SL}>Sugerir Tarefa a Jovem</div>
            <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
              {JEEP_LIST.map(j=><button key={j.name} onClick={()=>setAdminTodoUsr(j.username)} style={{ padding:"6px 14px", borderRadius:20, border:adminTodoUsr===j.username?`1px solid ${j.color}`:"1px solid rgba(255,255,255,0.1)", background:adminTodoUsr===j.username?`${j.color}20`:"rgba(255,255,255,0.05)", fontSize:12, fontWeight:700, cursor:"pointer", color:adminTodoUsr===j.username?j.color:"#94a3b8" }}>{j.name}</button>)}
            </div>
            <input value={adminSuggTxt} onChange={e=>setAdminSuggTxt(e.target.value)} placeholder="Descrição da tarefa..." style={{ width:"100%", padding:"11px 14px", borderRadius:12, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", marginBottom:8 }}/>
            <button onClick={addAdminTodo} style={{ background:CYN, color:"#0f172a", border:"none", borderRadius:12, padding:"10px 18px", fontSize:13, fontWeight:800, cursor:"pointer" }}>Enviar Tarefa</button>
          </div>
        )}

        {adminTab === "msgs" && (
          <div>
            <div style={CARD}>
              <div style={SL}>Caixa de Mensagens & Sugestões</div>
              {msgs.map(m => (
                <div key={m.id} style={{ padding:"12px 14px", background:"rgba(0,0,0,0.3)", borderRadius:14, marginBottom:10, border:"1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize:12, fontWeight:700, color:m.anon?PNK:CYN }}>{m.anon?"🔒 Anónimo":m.from} <span style={{ fontWeight:400, color:"#94a3b8" }}>· {m.date}</span></div>
                  <div style={{ fontSize:13, color:"#cbd5e1", marginTop:6 }}>{m.text}</div>
                  {!m.adminReply ? (
                    <div style={{ marginTop:8 }}><input value={adminReplyTxt} onChange={e=>setAdminReplyTxt(e.target.value)} placeholder="Responder..." style={{ width:"100%", padding:"8px", borderRadius:8, background:"rgba(255,255,255,0.05)", color:"white", border:"none" }}/><button onClick={()=>replyToMsg(m.id, m.hiddenUser, adminReplyTxt)} style={{ marginTop:6, background:CYN, color:"#0f172a", padding:"6px 12px", borderRadius:8, border:"none", fontWeight:800, cursor:"pointer" }}>Enviar</button></div>
                  ) : ( <div style={{ marginTop:8, fontSize:12, color:CYN }}><strong>Tu respondeste:</strong> {m.adminReply}</div> )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
