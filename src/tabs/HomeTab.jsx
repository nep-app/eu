import React from 'react';
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { CARD, SL, CYN, PNK, Btn, PS } from "../theme.jsx";
import { fmtDate, JEEP_LIST, EVT_COLORS, EVT_ICONS } from "../data.js";

export default function HomeTab({ user, todos, events, myNotifs, leaderboard, setTab }) {
  const top3 = Object.entries(leaderboard).sort((a,b) => b[1].xp - a[1].xp).slice(0,3);

  return (
    <div style={{ padding:"18px 16px" }}>
      {/* Notificações */}
      {myNotifs.length > 0 && (
        <div style={{ ...CARD, background:"rgba(244, 114, 182, 0.1)", border:`1px solid ${PNK}` }}>
          <div style={SL}>Avisos da Teresa</div>
          {myNotifs.map(n => (
            <div key={n.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px", background:"rgba(0,0,0,0.3)", borderRadius:12, marginBottom:8 }}>
              <div style={{ flex:1, fontSize:13 }}>{n.text}</div>
              <button onClick={() => deleteDoc(doc(db, "notifications", user.username, "items", n.id))} style={{ background:"none", border:"none", color:PNK, fontSize:18 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* To-Do List vinda do Perfil */}
      <div style={CARD}>
        <div style={SL}>✅ Minha To-Do List</div>
        {todos.filter(t => !t.done).length === 0 ? <div style={{textAlign:"center", color:"#94a3b8", fontSize:12}}>Tudo em dia!</div> : 
          todos.filter(t => !t.done).slice(0,3).map(t => (
            <div key={t.id} onClick={async () => await updateDoc(doc(db, "todos", user.username, "items", t.id), {done: true})} style={{ display:"flex", gap:12, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", cursor:"pointer" }}>
              <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${CYN}` }}/>
              <div style={{ fontSize:14 }}>{t.text}</div>
            </div>
          ))
        }
        <button onClick={() => setTab("perfil")} style={{marginTop:12, background:"none", border:"none", color:CYN, fontWeight:800, fontSize:11, cursor:"pointer"}}>VER TODAS AS TAREFAS</button>
      </div>

      {/* Agenda vinda do Perfil */}
      <div style={CARD}>
        <div style={SL}>📅 Próximos Eventos</div>
        {events.length === 0 ? <div style={{textAlign:"center", color:"#94a3b8", fontSize:12}}>Agenda vazia.</div> : 
          events.slice(0,2).map(e => (
            <div key={e.id} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <div style={{ padding:8, background:`${EVT_COLORS[e.type]}20`, borderRadius:10 }}>{EVT_ICONS[e.type]}</div>
              <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:800 }}>{e.title}</div><div style={{ fontSize:11, color:CYN }}>{fmtDate(e.date)}</div></div>
            </div>
          ))
        }
      </div>

      {/* Top 3 Anónimo */}
      <div style={CARD}>
        <div style={SL}>⭐ Ativos da Semana</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {top3.map(e => (
            <div key={e[0]} style={{ padding:"6px 14px", background:"rgba(255,255,255,0.05)", borderRadius:20, border:`1px solid ${CYN}40`, fontSize:12, fontWeight:800, color:CYN }}>{e[1].name}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
