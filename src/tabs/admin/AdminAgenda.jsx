import React, { useState } from 'react';
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, INP, Btn } from "../../theme.jsx";
import { fmtDate, EVT_COLORS } from "../../data.js";

export default function AdminAgenda({ events }) {
  const [newEvt, setNewEvt] = useState({ title:"", date:"", time:"", userId:"all", type:"visit" });

  async function addAdminEvent() {
    if (!newEvt.title.trim() || !newEvt.date) return;
    await addDoc(collection(db, "events"), newEvt);
    setNewEvt({ title:"", date:"", time:"", userId:"all", type:"visit" });
    alert("Evento adicionado à agenda!");
  }

  return (
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
            <button onClick={async() => { if(window.confirm("Apagar?")) await deleteDoc(doc(db,"events",e.id)); }} style={{ background:"none", border:"none", color:"#fb7185", cursor:"pointer", fontSize:18 }}>✕</button>
          </div>
        </div>
      ))}
    </div>
  );
}
