import React from 'react';
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import HomeTodo from './home/HomeTodo.jsx';
import HomeAgenda from './home/HomeAgenda.jsx';
import HomeExtras from './home/HomeExtras.jsx';

// Textos que correspondem a ações que já aparecem em Ações Pendentes
const ACAO_PENDENTE_TEXTS = [
  "Nova Autoavaliação", "Nova Avaliação de Satisfação", "Nova Roda da Vida",
  "pergunta da semana", "Dilema (Quiz)", "Atualização do PIA", "Raio-X do Projeto",
  "propôs-te uma tarefa", "adicionou uma tarefa", "propôs um evento", "evento agendado",
];

export default function HomeTab({ user, data, setTab, setDesafiosSubTab }) {
  const notifs = (data.myNotifs || []).filter(n =>
    n.tipo !== "proposta" &&
    !ACAO_PENDENTE_TEXTS.some(t => n.text?.includes(t))
  );

  function deleteNotif(id) {
    deleteDoc(doc(db, "notifications", user.username, "items", id));
  }

  return (
    <div style={{ padding: "18px 16px", paddingBottom: "100px" }}>

      {/* 1. VOTAÇÕES + AÇÕES PENDENTES + NOTIFICAÇÕES + A MINHA LISTA */}
      <HomeTodo
        user={user} data={data} setTab={setTab}
        setDesafiosSubTab={setDesafiosSubTab} features={data.features}
        notifs={notifs} onDeleteNotif={deleteNotif}
      />

      {/* 2. AGENDA */}
      <HomeAgenda user={user} data={data} />

      {/* 4. MISSÕES, RANKING E CONTACTOS */}
      <HomeExtras user={user} data={data} setTab={setTab} />

    </div>
  );
}
