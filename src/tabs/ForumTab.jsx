import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase.js";
import { CARD, SL, CYN, INP, Btn, SubTabs } from "../theme.jsx";
import { CHANNELS, FORUM_REACTIONS, ALLOWED_USERNAMES, nowLabel } from "../data.js";

export default function ForumTab({ user }) {
  const [channel, setChannel] = useState("csi");
  const [posts, setPosts] = useState([]);
  const [fPost, setFPost] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyTxt, setReplyTxt] = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "forum", channel, "posts"), orderBy("time", "desc"));
    return onSnapshot(q, s => setPosts(s.docs.map(d => ({id:d.id, ...d.data()}))));
  }, [channel]);

  async function handlePost() {
    if (!fPost.trim() && !mediaFile) return;
    setIsUploading(true);
    try {
      let url = null;
      if (mediaFile) {
        const r = ref(storage, `forum/${Date.now()}_${mediaFile.name}`);
        await uploadBytes(r, mediaFile);
        url = await getDownloadURL(r);
      }
      
      // Lógica de Mentions @nome
      fPost.split(" ").forEach(async word => {
        if (word.startsWith("@")) {
          const target = word.substring(1).toLowerCase();
          if (ALLOWED_USERNAMES.includes(target)) {
            await addDoc(collection(db, "notifications", target, "items"), {
              from: user.username, text: `Mencionou-te no canal ${channel}!`, date: nowLabel(), read: false
            });
          }
        }
      });

      await addDoc(collection(db, "forum", channel, "posts"), {
        user: user.realName, color: user.color, text: fPost, media: url, 
        time: new Date().toISOString(), reactions: {}, reactedBy: {}, replies: []
      });
      setFPost(""); setMediaFile(null);
    } catch(e) { alert("Erro ao publicar."); }
    setIsUploading(false);
  }

  async function react(pid, emojiId) {
    const p = posts.find(x => x.id === pid);
    let rcts = {...p.reactions}; let rBy = {...p.reactedBy};
    let who = rBy[emojiId] || [];
    if (who.includes(user.username)) {
      rcts[emojiId] = Math.max(0, (rcts[emojiId] || 1) - 1);
      rBy[emojiId] = who.filter(u => u !== user.username);
    } else {
      rcts[emojiId] = (rcts[emojiId] || 0) + 1;
      rBy[emojiId] = [...who, user.username];
    }
    await updateDoc(doc(db, "forum", channel, "posts", pid), { reactions: rcts, reactedBy: rBy });
  }

  return (
    <div style={{ padding:"18px 16px" }}>
      <SubTabs options={CHANNELS.map(c=>[c.id, `${c.icon} ${c.label.split(" ")[0]}`])} active={channel} onChange={setChannel} color={CYN}/>
      
      <div style={CARD}>
        <div style={{fontSize:12, color:"#94a3b8", marginBottom:10}}>{CHANNELS.find(c=>c.id===channel).desc}</div>
        <textarea value={fPost} onChange={e=>setFPost(e.target.value)} style={INP} rows={2} placeholder="O que queres partilhar? @nome para mencionar..."/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
          <input type="file" accept="image/*" onChange={e=>setMediaFile(e.target.files[0])} style={{fontSize:10}}/>
          <button onClick={handlePost} disabled={isUploading} style={{ background:CYN, color:"#070b14", border:"none", padding:"8px 16px", borderRadius:12, fontWeight:900 }}>
            {isUploading ? "..." : "PUBLICAR"}
          </button>
        </div>
      </div>

      {posts.map(p => (
        <div key={p.id} style={CARD}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontWeight:900, color:p.color }}>{p.user}</span>
            <span style={{ fontSize:10, opacity:0.5 }}>{new Date(p.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
          </div>
          {p.text && <div style={{ fontSize:14, lineHeight:1.5 }}>{p.text}</div>}
          {p.media && <img src={p.media} style={{ width:"100%", borderRadius:16, marginTop:12, border:"1px solid rgba(255,255,255,0.1)" }}/>}
          
          <div style={{ display:"flex", gap:12, marginTop:15 }}>
            {FORUM_REACTIONS.map(r => (
              <button key={r.id} onClick={()=>react(p.id, r.id)} style={{ background:"none", border:"none", color:(p.reactedBy?.[r.id]||[]).includes(user.username)?CYN:"#94a3b8", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                {r.icon} <span style={{fontSize:12, fontWeight:800}}>{p.reactions?.[r.id] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
