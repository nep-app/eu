import React, { useRef } from 'react';
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { MTHS, CHANNELS } from "../data.js";
import HomeTodo from './home/HomeTodo.jsx';
import HomeAgenda from './home/HomeAgenda.jsx';
import HomeExtras from './home/HomeExtras.jsx';
import HomeMissoes from './home/HomeMissoes.jsx';
import HomeAvisos from './home/HomeAvisos.jsx';

// Textos que correspondem a ações que já aparecem em Ações Pendentes
const ACAO_PENDENTE_TEXTS = [
  "Nova Autoavaliação", "Nova Avaliação de Satisfação", "Nova Roda da Vida",
  "pergunta da semana", "Dilema (Quiz)", "Atualização do PIA", "Raio-X do Projeto",
  "propôs-te uma tarefa", "adicionou uma tarefa", "propôs um evento", "evento agendado",
];

function isRelevant(n) {
  // soPush = notificação que só serve para disparar push (não aparece na lista).
  return !n.soPush && n.tipo !== "proposta" && !n.mencao && !ACAO_PENDENTE_TEXTS.some(t => n.text?.includes(t));
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
  const agendaRef = useRef(null);
  // Na conta demo escondemos as notificações do fórum (são mais privadas).
  const isDemo = user?.isDemo || user?.username === "demo";
  const isForumN = (n) => !!n.canal || n.mencao || CHANNELS.some(ch => n.text?.startsWith(ch.icon))
    || n.text?.startsWith("🌐") || n.text?.startsWith("📢")
    || n.text?.includes("reagiu à tua partilha") || n.text?.includes("comentou a tua partilha")
    || n.text?.includes("publicação no Fórum");
  const allRelev = (data.myNotifs || []).filter(isRelevant).filter(n => !(isDemo && isForumN(n)));
  const notifs = allRelev
    .filter(n => !n.read)
    .sort((a, b) => {
      const ta = a.ts || parseDateStr(a.date);
      const tb = b.ts || parseDateStr(b.date);
      return tb - ta;
    });
  const mencaoNotifs = isDemo ? [] : (data.myNotifs || []).filter(n => n.mencao && !n.read);

  function dismissNotif(id) {
    // Na Pré-visualização (admin a ver a app de um jovem) NUNCA se escreve:
    // senão a Teresa marcava como lidas as notificações reais do jovem.
    if (previewMode) return;
    updateDoc(doc(db, "notifications", user.username, "items", id), { read: true });
  }

  return (
    <div style={{ padding: "18px 16px", paddingBottom: "100px" }}>

      {/* 0. AVISOS DA TERESA — destaque máximo, mesmo no topo */}
      <HomeAvisos user={user} setTab={setTab} setForumCanal={setForumCanal} previewMode={previewMode} />

      {/* 0. MISSÃO ESPECIAL — sempre no topo */}
      <HomeMissoes user={user} data={data} />

      {/* 1. VOTAÇÕES + AÇÕES PENDENTES + NOTIFICAÇÕES + A MINHA LISTA */}
      <HomeTodo
        user={user} data={data} setTab={setTab}
        setDesafiosSubTab={setDesafiosSubTab} features={data.features}
        notifs={notifs} onDeleteNotif={dismissNotif} setForumCanal={setForumCanal}
        mencaoNotifs={mencaoNotifs} previewMode={previewMode}
        scrollToAgenda={() => agendaRef.current?.scrollIntoView({ behavior:"smooth" })}
      />

      {/* 2. AGENDA */}
      <div ref={agendaRef}><HomeAgenda user={user} data={data} /></div>

      {/* 3. MISSÕES, RANKING E CONTACTOS */}
      <HomeExtras user={user} data={data} setTab={setTab} />

    </div>
  );
}
