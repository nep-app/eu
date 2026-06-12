import React from 'react';
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { MTHS } from "../data.js";
import HomeTodo from './home/HomeTodo.jsx';
import HomeAgenda from './home/HomeAgenda.jsx';
import HomeExtras from './home/HomeExtras.jsx';

// Textos que correspondem a ações que já aparecem em Ações Pendentes
const ACAO_PENDENTE_TEXTS = [
  "Nova Autoavaliação", "Nova Avaliação de Satisfação", "Nova Roda da Vida",
  "pergunta da semana", "Dilema (Quiz)", "Atualização do PIA", "Raio-X do Projeto",
  "propôs-te uma tarefa", "adicionou uma tarefa", "propôs um evento", "evento agendado",
];

function isRelevant(n) {
  return n.tipo !== "proposta" && !n.mencao && !ACAO_PENDENTE_TEXTS.some(t => n.text?.includes(t));
}

function parseDateStr(str) {
  if (!str) return 0;
  try {
    // "12 Jun 2026, 14:30"
    const m1 = str.match(/^(\d{1,2})\s+([A-Za-zÀ-ú]+)\s+(\d{4}),\s*(\d{1,2}):(\d{2})/);
    if (m1) {
      const mon = MTHS.findIndex(m => m.toLowerCase() === m1[2].toLowerCase().substring(0,3));
      if (mon >= 0) return new Date(+m1[3], mon, +m1[1], +m1[4], +m1[5]).getTime();
    }
    // "12/06/2026, 12:06"
    const m2 = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),\s*(\d{1,2}):(\d{2})/);
    if (m2) return new Date(+m2[3], +m2[2]-1, +m2[1], +m2[4], +m2[5]).getTime();
  } catch(e) {}
  return 0;
}

export default function HomeTab({ user, data, setTab, setDesafiosSubTab, setForumCanal, previewMode }) {
  const allRelev = (data.myNotifs || []).filter(isRelevant);
  const notifs = allRelev
    .filter(n => !n.read)
    .sort((a, b) => {
      const ta = a.ts || parseDateStr(a.date);
      const tb = b.ts || parseDateStr(b.date);
      return tb - ta;
    });
  const mencaoNotifs = (data.myNotifs || []).filter(n => n.mencao && !n.read);

  function dismissNotif(id) {
    if (previewMode) {
      deleteDoc(doc(db, "notifications", user.username, "items", id));
    } else {
      updateDoc(doc(db, "notifications", user.username, "items", id), { read: true });
    }
  }

  return (
    <div style={{ padding: "18px 16px", paddingBottom: "100px" }}>

      {/* 1. VOTAÇÕES + AÇÕES PENDENTES + NOTIFICAÇÕES + A MINHA LISTA */}
      <HomeTodo
        user={user} data={data} setTab={setTab}
        setDesafiosSubTab={setDesafiosSubTab} features={data.features}
        notifs={notifs} onDeleteNotif={dismissNotif} setForumCanal={setForumCanal}
        mencaoNotifs={mencaoNotifs} previewMode={previewMode}
      />

      {/* 2. AGENDA */}
      <HomeAgenda user={user} data={data} />

      {/* 3. MISSÕES, RANKING E CONTACTOS */}
      <HomeExtras user={user} data={data} setTab={setTab} />

    </div>
  );
}
