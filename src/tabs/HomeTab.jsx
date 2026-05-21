import React from 'react';
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { CARD, SL, CYN } from "../theme.jsx";
import HomeTodo from './home/HomeTodo.jsx';
import HomeVotacoes from './home/HomeVotacoes.jsx';
import HomeAgenda from './home/HomeAgenda.jsx';
import HomeExtras from './home/HomeExtras.jsx';

export default function HomeTab({ user, data, setTab, setDesafiosSubTab }) {
  const notifs = (data.myNotifs || []).filter(n => n.tipo !== "proposta");

  return (
    <div style={{ padding: "18px 16px", paddingBottom: "100px" }}>

      {/* 1. GESTÃO DE TAREFAS (Ações Pendentes, To-Do & Sugestões da Teresa) */}
      <HomeTodo user={user} data={data} setTab={setTab} setDesafiosSubTab={setDesafiosSubTab} features={data.features} />

      {/* 2. NOTIFICAÇÕES */}
      {notifs.length > 0 && (
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div style={SL}>🔔 Notificações</div>
            <div style={{ fontSize:11, fontWeight:900, color:CYN, background:`${CYN}18`, borderRadius:20, padding:"3px 10px" }}>{notifs.length}</div>
          </div>
          {notifs.map(notif => (
            <div key={notif.id} style={{ display:"flex", gap:12, padding:"13px 14px", background:"rgba(0,0,0,0.2)", borderRadius:14, marginBottom:8, border:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ flex:1, fontSize:13, lineHeight:1.6, color:"#f1f5f9" }}>{notif.text}</div>
              <button onClick={() => deleteDoc(doc(db, "notifications", user.username, "items", notif.id))}
                style={{ background:"none", border:"none", color:"#475569", fontSize:16, cursor:"pointer", paddingTop:2, flexShrink:0, lineHeight:1 }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* 3. VOTAÇÕES ATIVAS */}
      <HomeVotacoes user={user} />

      {/* 4. AGENDA */}
      <HomeAgenda user={user} data={data} />

      {/* 5. MISSÕES, RANKING E CONTACTOS */}
      <HomeExtras user={user} data={data} setTab={setTab} />

    </div>
  );
}
