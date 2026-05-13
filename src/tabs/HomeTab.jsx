import React from 'react';
import { AppIcon } from "../theme.jsx";

// Importar as nossas novas fatias
import HomeTodo from './home/HomeTodo.jsx';
import HomeVotacoes from './home/HomeVotacoes.jsx'; // ADICIONA ISTO
import HomeAgenda from './home/HomeAgenda.jsx';
import HomeExtras from './home/HomeExtras.jsx';

export default function HomeTab({ user, data, setTab }) {
  return (
    <div style={{ padding: "18px 16px", paddingBottom: "100px" }}>
      
      {/* LOGOTIPO CENTRAL */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px", marginTop: "10px" }}>
        <AppIcon size={100} />
      </div>

      {/* 1. GESTÃO DE TAREFAS (To-Do & Sugestões da Teresa) */}
      <HomeTodo user={user} data={data} />

      {/* 2. GESTÃO DE AGENDA (Eventos) */}
      <HomeAgenda user={user} data={data} />

      {/* 3. MISSÕES, RANKING E CONTACTOS */}
      <HomeExtras user={user} data={data} setTab={setTab} />

    </div>
  );
}
