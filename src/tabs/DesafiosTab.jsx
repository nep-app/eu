import React, { useContext } from 'react';
import { SubTabs, CARD, CYN } from "../theme.jsx";
import { ThemeCtx } from "../JovensApp.jsx";

import PerguntaSemanal from './desafios/PerguntaSemanal.jsx';
import AutoAvaliacao   from './desafios/AutoAvaliacao.jsx';
import Satisfacao      from './desafios/Satisfacao.jsx';
import QuizCenarios    from './desafios/QuizCenarios.jsx';

function LockedFeature({ label, light }) {
  return (
    <div style={{ ...CARD, textAlign:"center", padding:"48px 20px", marginTop:16 }}>
      <div style={{ fontSize:48, marginBottom:12 }}>🔐</div>
      <div style={{ fontWeight:900, fontSize:15, color:"#94a3b8", marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.6 }}>
        A Teresa ainda não lançou esta secção.<br/>Fica atento!
      </div>
    </div>
  );
}

export default function DesafiosTab({ user, data, subTab = "pergunta", setSubTab, features = {} }) {
  const light = useContext(ThemeCtx);
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

      {subTab === "pergunta" && (
        features.perguntaSemanal
          ? <PerguntaSemanal user={user} data={data} />
          : <LockedFeature label="Pergunta da Semana" light={light} />
      )}
      {subTab === "auto" && (
        features.autoAvaliacao
          ? <AutoAvaliacao user={user} data={data} />
          : <LockedFeature label="Autoavaliação" light={light} />
      )}
      {subTab === "satisf" && (
        features.satisfacao
          ? <Satisfacao user={user} data={data} />
          : <LockedFeature label="Avaliação de Satisfação" light={light} />
      )}
      {subTab === "quiz" && <QuizCenarios user={user} data={data} />}
    </div>
  );
}
