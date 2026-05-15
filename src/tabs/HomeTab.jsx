import React from 'react';
import HomeTodo from './home/HomeTodo.jsx';
import HomeVotacoes from './home/HomeVotacoes.jsx';
import HomeAgenda from './home/HomeAgenda.jsx';
import HomeExtras from './home/HomeExtras.jsx';

export default function HomeTab({ user, data, setTab, setDesafiosSubTab }) {
  return (
    <div style={{ padding: "18px 16px", paddingBottom: "100px" }}>

      {/* 1. GESTÃO DE TAREFAS (Ações Pendentes, To-Do & Sugestões da Teresa) */}
      <HomeTodo user={user} data={data} setTab={setTab} setDesafiosSubTab={setDesafiosSubTab} />

      {/* 1.5 VOTAÇÕES ATIVAS (Aparece automaticamente se houver) */}
      <HomeVotacoes user={user} />

      {/* 2. GESTÃO DE AGENDA (Eventos) */}
      <HomeAgenda user={user} data={data} />

      {/* 3. MISSÕES, RANKING E CONTACTOS */}
      <HomeExtras user={user} data={data} setTab={setTab} />

    </div>
  );
}
