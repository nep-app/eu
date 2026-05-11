import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  setDoc,
  query,
  orderBy
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase.js";
import { BG, CARD, SL, AppIcon, Btn, CYN, PNK, INP } from "./theme.jsx";
import { 
  upd, 
  nowLabel, 
  fmtDate, 
  getWeekKey, 
  ALLOWED_USERNAMES, 
  JEEP_LIST, 
  CHANNELS, 
  SURVEY_CATS, 
  SEMOJIS, 
  QUIZZES, 
  ALL_MEDALS, 
  FORUM_REACTIONS, 
  EVT_COLORS, 
  EVT_ICONS, 
  EC 
} from "./data.js";

export default function TeresaAdmin({ user, onLogout }) {
  // ── ESTADOS DE NAVEGAÇÃO E FÓRUM ──
  const [adminTab, setAdminTab] = useState("geral");
  const [channel, setChannel] = useState("csi");
  const [posts, setPosts] = useState({});
  const [fPost, setFPost] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [replyTxt, setReplyTxt] = useState("");
  
  // ── ESTADOS DE LANÇAMENTO E PERGUNTA ──
  const [launchType, setLaunchType] = useState("auto");
  const [launchTarget, setLaunchTarget] = useState("all");
  const [activeQ, setActiveQ] = useState("");
  const [activeQEdit, setActiveQEdit] = useState("");
  const [activeQModeEdit, setActiveQModeEdit] = useState(["texto"]);
  
  // ── ESTADOS DE DADOS DOS UTILIZADORES ──
  const [allShared, setAllShared] = useState({});
  const [adminSharedSel, setAdminSharedSel] = useState(null);
  const [todos, setTodos] = useState({});
  const [userGdpr, setUserGdpr] = useState({});
  const [amMedals, setAmMedals] = useState({});
  const [amTarget, setAmTarget] = useState("Nilton");

  // ── ESTADOS DE TAREFAS E MENSAGENS ──
  const [adminTodoUsr, setAdminTodoUsr] = useState("nilton");
  const [adminSuggTxt, setAdminSuggTxt] = useState("");
  const [adminSuggDue, setAdminSuggDue] = useState("");
  const [msgs, setMsgs] = useState([]);
  const [sggs, setSggs] = useState([]);
  const [adminMsgTarget, setAdminMsgTarget] = useState("nilton");
  const [adminMsgTxt, setAdminMsgTxt] = useState("");
  const [adminReplyId, setAdminReplyId] = useState(null);
  const [adminReplyTxt, setAdminReplyTxt] = useState("");

  // ── ESTADOS DE AGENDA E MISSÕES ──
  const [events, setEvents] = useState([]);
  const [newEvt, setNewEvt] = useState({ title:"", date:"", time:"", userId:"all", type:"visit" });
  const [missions, setMissions] = useState([]);
  const [adminMissionTxt, setAdminMissionTxt] = useState("");
  const [adminMissionXp, setAdminMissionXp] = useState(10);
  const [leaderboard, setLeaderboard] = useState({});

  // ── EFFECT: MONITORIZAÇÃO GLOBAL ──
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
    const uQ = onSnapshot(doc(db, "config", "activeQuestion"), snap => { 
      if(snap.exists()){ 
        setActiveQ(snap.data().text); 
        setActiveQModeEdit(snap.data().mode||["texto"]); 
      } 
    });
    
    ALLOWED_USERNAMES.forEach(u => getDoc(doc(db, "users", u)).then(s => { if(s.exists()) setUserGdpr(p => upd(p, u, s.data())); }));
    JEEP_LIST.forEach(j => getDoc(doc(db, "medals", j.username)).then(s => { if(s.exists()) setAmMedals(p => upd(p, j.name, s.data().list||[])); }));
    
    return () => { unsubs.forEach(u=>u()); uM(); uS(); uE(); uL(); uMi(); uQ(); };
  }, []);

  // ── EFFECT: FÓRUM POR CANAL ──
  useEffect(() => {
    return onSnapshot(collection(db, "forum", channel, "posts"), snap => {
      setPosts(p => upd(p, channel, snap.docs.map(d => ({id:d.id, ...d.data()}))));
    });
  }, [channel]);

  // ── FUNÇÃO: LANÇAR PEDIDOS ──
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
    alert("Pedido lançado com sucesso!");
  }

  // ── FUNÇÕES DO FÓRUM ──
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
    await updateDoc(doc(db, "forum", channel, "posts", pid), { 
      replies: [...cur.replies, { user:"Teresa (GO)", color:"#22d3ee", text:replyTxt, time:nowLabel() }] 
    });
    setReplyTxt(""); setReplyTo(null);
  }

  async function reactPost(pid, reaction) {
    const cur = (posts[channel]||[]).find(p => p.id === pid);
    if (!cur) return;
    let rcts = { ...cur.reactions }; let rBy = { ...cur.reactedBy };
    let who = rBy[reaction] || [];
    if (who.includes("admin")) { 
      rcts[reaction] = Math.max(0, (rcts[reaction]||1)-1); 
      rBy[reaction] = who.filter(u=>u!=="admin"); 
    } else { 
      rcts[reaction] = (rcts[reaction]||0)+1; 
      rBy[reaction] = [...who, "admin"]; 
    }
    await updateDoc(doc(db, "forum", channel, "posts", pid), { reactions:rcts, reactedBy:rBy });
  }

  // ── FUNÇÕES ADMIN GERAIS ──
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
    await addDoc(collection(db, "todos", adminTodoUsr, "items"), { 
      text:adminSuggTxt, due:adminSuggDue, done:false, shared:true, addedBy:"teresa", accepted:false 
    });
    setAdminSuggTxt(""); setAdminSuggDue("");
  }

  async function addAdminEvent() {
    if (!newEvt.title.trim() || !newEvt.date) return;
    await addDoc(collection(db, "events"), newEvt);
    setNewEvt({ title:"", date:"", time:"", userId:"all", type:"visit" });
  }

  async function replyToMsg(msgId, hiddenUser, replyText) {
    if (!replyText.trim()) return;
    await updateDoc(doc(db, "messages", msgId), { adminReply: replyText });
    if (hiddenUser) await addDoc(collection(db, "notifications", hiddenUser, "items"), { 
      from:"teresa", text:"Resposta: "+replyText, date:nowLabel(), read:false 
    });
    setAdminReplyId(null); setAdminReplyTxt(""); alert("Respondido!");
  }

  async function addAdminMission() {
    if(!adminMissionTxt.trim()) return;
    await addDoc(collection(db, "missions"), { text:adminMissionTxt, xp:adminMissionXp, week:getWeekKey() });
    setAdminMissionTxt("");
  }

  async function deleteAdminMission(id) { 
    if(window.confirm("Apagar?")) await deleteDoc(doc(db, "missions", id)); 
  }

  async function toggleAMedal(jn, mid) {
    const j = JEEP_LIST.find(x=>x.name===jn); if(!j) return;
    const cur = amMedals[jn]||[];
    const next = cur.includes(mid) ? cur.filter(m=>m!==mid) : [...cur, mid];
    setAmMedals(p=>upd(p,jn,next)); 
    await setDoc(doc(db,"medals",j.username),{list:next});
  }

  // ── CONSTANTES DE UI ──
  const ADMIN_TABS = [
    ["geral","📊 Geral"],["mural","🌐 Fórum"],["partilhas","📂 Partilhas"],
    ["tasks","✅ Tarefas"],["agenda","📅 Agenda"],["missoes","🎯 Missões"],
    ["msgs","💬 Msgs"],["users","👥 Utilizadores"]
  ];

  const activeChannelInfo = CHANNELS.find(c => c.id === channel);

  // ── RENDERIZAÇÃO PRINCIPAL ──
  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:"system-ui,sans-serif", color:"white" }}>
      
      {/* HEADER FIXO */}
      <div style={{ 
        background:"rgba(15, 23, 42, 0.8)", padding:"16px 20px 20px", 
        display:"flex", alignItems:"center", justifyContent:"space-between", 
        borderBottom:"1px solid rgba(34, 211, 238, 0.2)" 
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <AppIcon size={40}/>
          <div>
            <div style={{ fontSize:10, opacity:0.6, letterSpacing:1.5, textTransform:"uppercase" }}>Painel de Gestão</div>
            <div style={{ fontSize:15, fontWeight:800, color:CYN }}>JEEP · EDUCA+</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ 
          background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", 
          color:"white", padding:"7px 16px", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:600 
        }}>Sair</button>
      </div>
      
      {/* NAVEGAÇÃO DE TABS */}
      <div style={{ display:"flex", gap:0, background:"rgba(0,0,0,0.5)", overflowX:"auto" }}>
        {ADMIN_TABS.map(t => {
          let isA = adminTab === t[0];
          return (
            <button key={t[0]} onClick={() => setAdminTab(t[0])} style={{ 
              padding:"12px 16px", background:isA?"rgba(34, 211, 238, 0.1)":"transparent", 
              color:isA?CYN:"#94a3b8", border:"none", fontSize:12, fontWeight:800, 
              cursor:"pointer", whiteSpace:"nowrap", borderBottom:isA?`2px solid ${CYN}`:"2px solid transparent" 
            }}>
              {t[1]}
            </button>
          );
        })}
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"20px 16px" }}>
        
        {/* TAB: FÓRUM */}
        {adminTab === "mural" && (
          <div>
            <div style={{ display:"flex", gap:6, marginBottom:12, overflowX:"auto", paddingBottom:8 }}>
              {CHANNELS.map(ch => {
                let isA = channel === ch.id;
                return (
                  <button key={ch.id} onClick={() => setChannel(ch.id)} style={{ 
                    display:"flex", alignItems:"center", gap:5, padding:"9px 14px", 
                    borderRadius:20, border:isA?`1px solid ${CYN}`:"1px solid rgba(255,255,255,0.1)", 
                    background:isA?"rgba(34, 211, 238, 0.15)":"rgba(255,255,255,0.05)", 
                    fontSize:12, fontWeight:700, cursor:"pointer", color:isA?CYN:"#94a3b8", whiteSpace:"nowrap" 
                  }}>
                    {ch.icon} {ch.label}
                  </button>
                );
              })}
            </div>

            {/* CORREÇÃO: Descritivo do Canal como Legenda */}
            <div style={{ 
              ...CARD, background:"rgba(34, 211, 238, 0.05)", 
              borderLeft:`4px solid ${CYN}`, padding:"15px", marginBottom:20 
            }}>
              <div style={{ fontSize:14, fontWeight:900, color:CYN, textTransform:"uppercase", marginBottom:4 }}>
                {activeChannelInfo?.label}
              </div>
              <div style={{ fontSize:12, color:"#cbd5e1", lineHeight:1.5 }}>
                {activeChannelInfo?.desc}
              </div>
            </div>
            
            <div style={CARD}>
              <div style={{ display:"flex", gap:8, flexDirection:"column" }}>
                <textarea 
                  value={fPost} 
                  onChange={e => setFPost(e.target.value)} 
                  placeholder={`Publicar no canal ${activeChannelInfo?.label}...`} 
                  rows={2} 
                  style={{ ...INP, marginBottom:0 }}
                />
                <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:10 }}>
                  <input type="file" accept="image/*" onChange={e => {if(e.target.files[0]) setMediaFile(e.target.files[0])}} style={{ fontSize:11, color:"#94a3b8" }}/>
                  <button onClick={postForum} disabled={isUploading} style={{ background:CYN, color:"#0f172a", border:"none", borderRadius:12, padding:"8px 16px", fontWeight:800, cursor:"pointer", marginLeft:"auto" }}>
                    {isUploading ? "A carregar..." : "Publicar"}
                  </button>
                </div>
              </div>
            </div>

            {/* LISTAGEM DE POSTS */}
            {(posts[channel]||[]).slice().reverse().map(p => (
              <div key={p.id} style={CARD}>
                <div style={{ display:"flex", gap:10 }}>
                  <div style={{ 
                    width:38, height:38, borderRadius:"50%", 
                    background:`linear-gradient(135deg, ${p.color}, #000)`, 
                    display:"flex", alignItems:"center", justifyContent:"center", 
                    color:"white", fontSize:14, fontWeight:800, flexShrink:0 
                  }}>
                    {p.user[0]}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:13, fontWeight:700 }}>
                        {p.user} {p.user==="Teresa (GO)" && <span style={{fontSize:9, background:CYN, color:"#0f172a", padding:"2px 6px", borderRadius:6, marginLeft:4}}>ADMIN</span>}
                      </span>
                      <span style={{ fontSize:11, color:"#94a3b8" }}>{p.time}</span>
                    </div>
                    {p.text && <div style={{ fontSize:14, color:"#cbd5e1", marginTop:4, lineHeight:1.55 }}>{p.text}</div>}
                    {p.media && (
                      <div style={{ marginTop:10 }}>
                        <img src={p.media} alt="Anexo" style={{ maxWidth:"100%", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)" }}/>
                      </div>
                    )}
                    
                    <div style={{ marginTop:12, display:"flex", gap:12, alignItems:"center" }}>
                      {FORUM_REACTIONS.map(r => {
                        let cnt = (p.reactions||{})[r.id] || 0;
                        return (
                          <span key={r.id} onClick={() => reactPost(p.id,r.id)} style={{ fontSize:12, color:"#94a3b8", cursor:"pointer" }}>
                            {r.icon}{cnt>0?" "+cnt:""}
                          </span>
                        );
                      })}
                      <span onClick={() => setReplyTo(replyTo===p.id?null:p.id)} style={{ fontSize:12, color:"#94a3b8", cursor:"pointer", fontWeight:600 }}>💬 Responder</span>
                      {p.replies.length > 0 && (
                        <span onClick={() => setExpanded(expanded===p.id?null:p.id)} style={{ fontSize:12, color:CYN, fontWeight:700, cursor:"pointer" }}>
                          {expanded===p.id ? "▲" : "▼"} {p.replies.length}
                        </span>
                      )}
                      <span onClick={() => deleteForumPost(p.id)} style={{ fontSize:12, color:"#fb7185", cursor:"pointer", marginLeft:"auto" }}>🗑️ Apagar</span>
                    </div>
                  </div>
                </div>

                {/* RESPOSTAS EXPANDIDAS */}
                {expanded===p.id && p.replies.length > 0 && (
                  <div style={{ marginTop:10, marginLeft:48, borderLeft:"2px solid rgba(255,255,255,0.1)", paddingLeft:12 }}>
                    {p.replies.map((rp,ri) => (
                      <div key={ri} style={{ display:"flex", gap:8, marginBottom:8 }}>
                        <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg, ${rp.color}, #000)`, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:11, fontWeight:800, flexShrink:0 }}>{rp.user[0]}</div>
                        <div>
                          <div style={{ fontSize:12, fontWeight:700 }}>
                            {rp.user} {rp.user==="Teresa (GO)" && <span style={{fontSize:8, background:CYN, color:"#0f172a", padding:"1px 4px", borderRadius:4, marginLeft:4}}>ADMIN</span>} 
                            <span style={{ color:"#94a3b8", fontWeight:400 }}> · {rp.time}</span>
                          </div>
                          <div style={{ fontSize:12, color:"#cbd5e1", marginTop:2 }}>{rp.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* INPUT DE RESPOSTA */}
                {replyTo===p.id && (
                  <div style={{ marginTop:10, marginLeft:48, display:"flex", gap:8 }}>
                    <input 
                      value={replyTxt} 
                      onChange={e => setReplyTxt(e.target.value)} 
                      onKeyDown={e => { if(e.key==="Enter") sendReply(p.id); }} 
                      placeholder="Escreve uma resposta..." 
                      style={{ ...INP, flex:1, marginBottom:0, fontSize:12, padding:"8px 12px" }} 
                      autoFocus
                    />
                    <button onClick={() => sendReply(p.id)} style={{ background:CYN, color:"#0f172a", border:"none", borderRadius:20, padding:"9px 16px", fontSize:12, cursor:"pointer", fontWeight:800 }}>↑</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: GERAL (XP, PERGUNTA, PEDIDOS) ── */}
        {adminTab === "geral" && (
          <div>
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

            <div style={CARD}>
              <div style={SL}>Tabela de XP Semanal</div>
              {Object.entries(leaderboard).sort((a,b)=>b[1].xp-a[1].xp).map((e, i) => (
                <div key={e[0]} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize:14, fontWeight:800, color:"#94a3b8", width:25 }}>#{i+1}</span>
                  <div style={{ flex:1, fontSize:14, fontWeight:700 }}>{e[1].name}</div>
                  <div style={{ fontSize:14, fontWeight:800, color:CYN }}>{e[1].xp} XP</div>
                </div>
              ))}
            </div>

            <div style={CARD}>
              <div style={SL}>Pergunta da Semana Ativa</div>
              <div style={{ fontSize:13, color:"white", fontWeight:600, marginBottom:15, padding:"12px", background:"rgba(0,0,0,0.3)", borderRadius:12, borderLeft:`4px solid ${CYN}` }}>{activeQ}</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <input value={activeQEdit} onChange={e=>setActiveQEdit(e.target.value)} placeholder="Nova pergunta..." style={{ ...INP, flex:1, marginBottom:0 }}/>
                <button onClick={updateActiveQ} style={{ background:CYN, color:"#0f172a", border:"none", borderRadius:15, padding:"11px 20px", fontSize:13, fontWeight:800, cursor:"pointer" }}>Publicar</button>
              </div>
            </div>

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
                      <div style={{ marginLeft:20, marginTop:10, padding:12, background:"rgba(0,0,0,0.2)", borderRadius:12, fontSize:13, color:"#cbd5e1", border:"1px solid rgba(255,255,255,0.05)" }}>
                        {d.answerType === "audio" ? <audio src={d.answerMedia} controls style={{ width:"100%", height:30 }} /> : d.answerText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB: PARTILHAS (PIA, SWOT, AUTO) ── */}
        {adminTab === "partilhas" && (
          <div>
            {ALLOWED_USERNAMES.map(uname => {
              let d = allShared[uname] || {};
              let jInfo = JEEP_LIST.find(x=>x.username===uname);
              let isOpen = adminSharedSel === uname;
              return (
                <div key={uname} style={CARD}>
                  <div onClick={()=>setAdminSharedSel(isOpen?null:uname)} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                    <div style={{ width:12, height:12, borderRadius:"50%", background:jInfo?jInfo.color:"#94a3b8" }}/>
                    <div style={{ flex:1, fontSize:15, fontWeight:800 }}>{jInfo?jInfo.name:uname}</div>
                    <div style={{ display:"flex", gap:5 }}>
                      {d.piaShared && <span style={{ fontSize:9, background:PNK, color:"#fff", padding:"2px 6px", borderRadius:6 }}>PIA</span>}
                      {d.swotShared && <span style={{ fontSize:9, background:CYN, color:"#0f172a", padding:"2px 6px", borderRadius:6 }}>SWOT</span>}
                    </div>
                    <span style={{ color:"#94a3b8", marginLeft:10 }}>{isOpen?"▲":"▼"}</span>
                  </div>
                  {isOpen && (
                    <div style={{ marginTop:15, borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:15 }}>
                      {d.piaShared && d.pia && (
                        <div style={{ marginBottom:15 }}>
                          <div style={{ ...SL, color:PNK, fontSize:10 }}>Plano Individual (PIA)</div>
                          {Object.keys(d.pia).map(k => d.pia[k] && (
                            <div key={k} style={{ fontSize:12, marginBottom:6, background:"rgba(0,0,0,0.2)", padding:8, borderRadius:8 }}>
                              <strong style={{ color:PNK }}>{k.toUpperCase()}:</strong> {d.pia[k]}
                            </div>
                          ))}
                        </div>
                      )}
                      {d.swotShared && d.swotPia && (
                        <div>
                          <div style={{ ...SL, fontSize:10 }}>Raio-X (SWOT)</div>
                          {Object.keys(d.swotPia).map(k => d.swotPia[k] && (
                            <div key={k} style={{ fontSize:12, marginBottom:6, background:"rgba(0,0,0,0.2)", padding:8, borderRadius:8 }}>
                              <strong style={{ color:CYN }}>{k.toUpperCase()}:</strong> {d.swotPia[k]}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB: TAREFAS ── */}
        {adminTab === "tasks" && (
          <div style={CARD}>
            <div style={SL}>Atribuir Tarefa a Jovem</div>
            <div style={{ display:"flex", gap:8, marginBottom:15, flexWrap:"wrap" }}>
              {JEEP_LIST.map(j=><button key={j.name} onClick={()=>setAdminTodoUsr(j.username)} style={{ padding:"8px 16px", borderRadius:20, border:adminTodoUsr===j.username?`1px solid ${j.color}`:"1px solid rgba(255,255,255,0.1)", background:adminTodoUsr===j.username?`${j.color}20`:"rgba(255,255,255,0.05)", fontSize:12, fontWeight:700, cursor:"pointer", color:adminTodoUsr===j.username?j.color:"#94a3b8" }}>{j.name}</button>)}
            </div>
            <input value={adminSuggTxt} onChange={e=>setAdminSuggTxt(e.target.value)} placeholder="O que é preciso fazer?" style={INP}/>
            <input type="date" value={adminSuggDue} onChange={e=>setAdminSuggDue(e.target.value)} style={INP}/>
            <Btn onClick={addAdminTodo}>Enviar Tarefa ✅</Btn>
          </div>
        )}

        {/* ── TAB: AGENDA ── */}
        {adminTab === "agenda" && (
          <div>
            <div style={CARD}>
              <div style={SL}>Novo Evento na Agenda</div>
              <input value={newEvt.title} onChange={e=>setNewEvt({...newEvt, title:e.target.value})} placeholder="Nome do evento..." style={INP}/>
              <div style={{ display:"flex", gap:10 }}>
                <input type="date" value={newEvt.date} onChange={e=>setNewEvt({...newEvt, date:e.target.value})} style={{ ...INP, flex:1 }}/>
                <input type="time" value={newEvt.time} onChange={e=>setNewEvt({...newEvt, time:e.target.value})} style={{ ...INP, flex:1 }}/>
              </div>
              <Btn onClick={addAdminEvent}>Publicar Evento 📅</Btn>
            </div>
            {events.slice().reverse().map(e => (
              <div key={e.id} style={{ ...CARD, borderLeft:`4px solid ${EVT_COLORS[e.type]||CYN}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:15 }}>{e.title}</div>
                    <div style={{ fontSize:11, color:CYN, fontWeight:800 }}>{fmtDate(e.date)} {e.time && `· ${e.time}`}</div>
                  </div>
                  <button onClick={async() => { if(window.confirm("Apagar?")) await deleteDoc(doc(db,"events",e.id)); }} style={{ background:"none", border:"none", color:"#fb7185", cursor:"pointer" }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: MISSÕES ── */}
        {adminTab === "missoes" && (
          <div>
            <div style={CARD}>
              <div style={SL}>Lançar Missão Semanal</div>
              <input value={adminMissionTxt} onChange={e=>setAdminMissionTxt(e.target.value)} placeholder="Descrição da missão..." style={INP}/>
              <input type="number" value={adminMissionXp} onChange={e=>setAdminMissionXp(Number(e.target.value))} style={INP}/>
              <Btn onClick={addAdminMission}>Lançar Missão 🎯</Btn>
            </div>
            {missions.filter(m => m.week === getWeekKey()).map(m => (
              <div key={m.id} style={{ ...CARD, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ fontWeight:800 }}>{m.text}</div>
                  <div style={{ fontSize:11, color:CYN, fontWeight:900 }}>{m.xp} XP</div>
                </div>
                <button onClick={()=>deleteAdminMission(m.id)} style={{ background:"none", border:"none", color:"#fb7185", cursor:"pointer", fontSize:18 }}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: MENSAGENS ── */}
        {adminTab === "msgs" && (
          <div>
            {msgs.slice().reverse().map(m => (
              <div key={m.id} style={{ ...CARD, borderLeft:m.adminReply ? "1px solid rgba(255,255,255,0.1)" : `4px solid ${PNK}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontSize:12, fontWeight:800, color:m.anon?PNK:CYN }}>{m.anon?"🔒 ANÓNIMO":m.from.toUpperCase()}</span>
                  <span style={{ fontSize:11, color:"#94a3b8" }}>{m.date}</span>
                </div>
                <div style={{ fontSize:14, lineHeight:1.5, color:"#fff", marginBottom:12 }}>{m.text}</div>
                
                {m.adminReply ? (
                  <div style={{ background:"rgba(34, 211, 238, 0.1)", padding:12, borderRadius:12, borderLeft:`2px solid ${CYN}` }}>
                    <div style={{ fontSize:10, fontWeight:900, color:CYN, marginBottom:4 }}>TUA RESPOSTA:</div>
                    <div style={{ fontSize:13 }}>{m.adminReply}</div>
                  </div>
                ) : (
                  <div style={{ display:"flex", gap:8 }}>
                    <input 
                      value={adminReplyTxt} 
                      onChange={e => setAdminReplyTxt(e.target.value)} 
                      placeholder="Responder..." 
                      style={{ ...INP, flex:1, marginBottom:0, fontSize:12 }}
                    />
                    <button onClick={() => replyToMsg(m.id, m.hiddenUser, adminReplyTxt)} style={{ background:CYN, color:"#0f172a", border:"none", borderRadius:12, padding:"0 20px", fontWeight:800, cursor:"pointer" }}>Enviar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: UTILIZADORES ── */}
        {adminTab === "users" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:15 }}>
            {JEEP_LIST.map(j => {
              const medals = amMedals[j.name] || [];
              return (
                <div key={j.username} style={CARD}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <div style={{ width:12, height:12, borderRadius:"50%", background:j.color }}/>
                    <div style={{ fontWeight:800 }}>{j.name}</div>
                  </div>
                  <div style={{ fontSize:11, color:"#94a3b8", marginBottom:12 }}>Medalhas Conquistadas:</div>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    {ALL_MEDALS.map(m => {
                      const has = medals.includes(m.id);
                      return (
                        <div key={m.id} onClick={() => toggleAMedal(j.name, m.id)} style={{ 
                          width:35, height:35, borderRadius:10, background:has?CYN:"rgba(255,255,255,0.05)", 
                          display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
                          opacity:has?1:0.3, transition:"0.2s"
                        }}>
                          {m.icon}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
