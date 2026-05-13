import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, getDoc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase.js";
import { CARD, CYN, INP } from "../../theme.jsx";
import { nowLabel, CHANNELS, JEEP_LIST, FORUM_REACTIONS } from "../../data.js";

export default function AdminMural() {
  const [channel, setChannel] = useState("csi");
  const [posts, setPosts] = useState([]);
  const [fPost, setFPost] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [replyTxt, setReplyTxt] = useState("");

  useEffect(() => {
    return onSnapshot(collection(db, "forum", channel, "posts"), snap => {
      setPosts(snap.docs.map(d => ({id:d.id, ...d.data()})));
    });
  }, [channel]);

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
    const cur = posts.find(p => p.id === pid);
    if (!cur) return;
    await updateDoc(doc(db, "forum", channel, "posts", pid), { 
      replies: [...cur.replies, { user:"Teresa (GO)", color:"#22d3ee", text:replyTxt, time:nowLabel() }] 
    });
    setReplyTxt(""); setReplyTo(null);
  }

  async function reactPost(pid, reaction) {
    const cur = posts.find(p => p.id === pid);
    if (!cur) return;
    let rcts = { ...cur.reactions }; let rBy = { ...cur.reactedBy };
    let who = rBy[reaction] || [];
    let isAdding = false;

    if (who.includes("admin")) { 
      rcts[reaction] = Math.max(0, (rcts[reaction]||1)-1); 
      rBy[reaction] = who.filter(u=>u!=="admin"); 
    } else { 
      rcts[reaction] = (rcts[reaction]||0)+1; 
      rBy[reaction] = [...who, "admin"]; 
      isAdding = true;
    }
    await updateDoc(doc(db, "forum", channel, "posts", pid), { reactions:rcts, reactedBy:rBy });

    // XP pela reação da Teresa
    if (isAdding && cur.user !== "Teresa (GO)") {
       const author = JEEP_LIST.find(x => x.name === cur.user);
       if (author) {
           const userRef = doc(db, "userData", author.username);
           const userSnap = await getDoc(userRef);
           const uData = userSnap.exists() ? userSnap.data() : {};
           const newHistory = [...(uData.history || []), { date: nowLabel(), action: `A Teresa reagiu ao teu post! ❤️`, ts: Date.now(), xp: 10 }];
           await setDoc(userRef, { history: newHistory, weekXp: (uData.weekXp || 0) + 10 }, { merge: true });
       }
    }
  }

  const activeChannelInfo = CHANNELS.find(c => c.id === channel);

  return (
    <div>
      {/* SELEÇÃO DE CANAIS */}
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

      <div style={{ ...CARD, background:"rgba(34, 211, 238, 0.05)", borderLeft:`4px solid ${CYN}`, padding:"15px", marginBottom:20 }}>
        <div style={{ fontSize:14, fontWeight:900, color:CYN, textTransform:"uppercase", marginBottom:4 }}>{activeChannelInfo?.label}</div>
        <div style={{ fontSize:12, color:"#cbd5e1", lineHeight:1.5 }}>{activeChannelInfo?.desc}</div>
      </div>
      
      {/* PUBLICAR NOVO POST */}
      <div style={CARD}>
        <div style={{ display:"flex", gap:8, flexDirection:"column" }}>
          <textarea value={fPost} onChange={e => setFPost(e.target.value)} placeholder={`Publicar no canal ${activeChannelInfo?.label}...`} rows={2} style={{ ...INP, marginBottom:0 }} />
          <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:10 }}>
            <input type="file" accept="image/*" onChange={e => {if(e.target.files[0]) setMediaFile(e.target.files[0])}} style={{ fontSize:11, color:"#94a3b8" }}/>
            <button onClick={postForum} disabled={isUploading} style={{ background:CYN, color:"#0f172a", border:"none", borderRadius:12, padding:"8px 16px", fontWeight:800, cursor:"pointer", marginLeft:"auto" }}>
              {isUploading ? "A carregar..." : "Publicar"}
            </button>
          </div>
        </div>
      </div>

      {/* MURAL DE POSTS */}
      {posts.slice().reverse().map(p => (
        <div key={p.id} style={CARD}>
          <div style={{ display:"flex", gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:"50%", background:`linear-gradient(135deg, ${p.color}, #000)`, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:14, fontWeight:800, flexShrink:0 }}>
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
              {p.media && <div style={{ marginTop:10 }}><img src={p.media} alt="Anexo" style={{ maxWidth:"100%", borderRadius:12, border:"1px solid rgba(255,255,255,0.1)" }}/></div>}
              
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
              <input value={replyTxt} onChange={e => setReplyTxt(e.target.value)} onKeyDown={e => { if(e.key==="Enter") sendReply(p.id); }} placeholder="Escreve uma resposta..." style={{ ...INP, flex:1, marginBottom:0, fontSize:12, padding:"8px 12px" }} autoFocus />
              <button onClick={() => sendReply(p.id)} style={{ background:CYN, color:"#0f172a", border:"none", borderRadius:20, padding:"9px 16px", fontSize:12, cursor:"pointer", fontWeight:800 }}>↑</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
