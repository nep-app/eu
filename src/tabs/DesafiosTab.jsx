import React, { useState } from 'react';
import { SubTabs, CYN } from "../theme.jsx";

// Importamos os novos componentes "fatiados"
import PerguntaSemanal from './desafios/PerguntaSemanal.jsx';
import AutoAvaliacao from './desafios/AutoAvaliacao.jsx';
import Satisfacao from './desafios/Satisfacao.jsx';
import QuizCenarios from './desafios/QuizCenarios.jsx';

export default function DesafiosTab({ user, data }) {
  const [subTab, setSubTab] = useState("pergunta");

  return (
    <div style={{ padding: "18px 16px" }}>
      <SubTabs 
        options={[
          ["pergunta","💬 Pergunta"],
          ["auto","📊 Auto"],
          ["satisf","😊 Satis."],
          ["quiz","🎯 Quiz"]
        ]} 
        active={subTab} onChange={setSubTab} color={CYN}
      />

      {/* Renderização Condicional Limpa */}
      {subTab === "pergunta" && <PerguntaSemanal user={user} data={data} />}
      {subTab === "auto"     && <AutoAvaliacao user={user} data={data} />}
      {subTab === "satisf"   && <Satisfacao user={user} data={data} />}
      {subTab === "quiz"     && <QuizCenarios user={user} data={data} />}
    </div>
  );
}
