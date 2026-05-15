import React from 'react';
import { SubTabs, CARD, CYN } from "../theme.jsx";

import PerguntaSemanal from './desafios/PerguntaSemanal.jsx';
import AutoAvaliacao   from './desafios/AutoAvaliacao.jsx';
import Satisfacao      from './desafios/Satisfacao.jsx';
import QuizCenarios    from './desafios/QuizCenarios.jsx';

function LockedFeature({ label }) {
  return (
    <div style={{ ...CARD, textAlign:"center", padding:"48px 20px", marginTop:16 }}>
      <div style={{ fontSize:48, marginBottom:12 }}>🔐</div>
      <div style={{ fontWeight:900, fontSize:15, color:"#64748b", marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:13, color:"#475569", lineHeight:1.6 }}>
        A Teresa ainda não lançou esta secção.<br/>Fica atento!
      </div>
    </div>
  );
}

export default function DesafiosTab({ user, data, subTab = "pergunta", setSubTab, features = {} }) {
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
          : <LockedFeature label="Pergunta da Semana" />
      )}
      {subTab === "auto" && (
        features.autoAvaliacao
          ? <AutoAvaliacao user={user} data={data} />
          : <LockedFeature label="Autoavaliação" />
      )}
      {subTab === "satisf" && (
        features.satisfacao
          ? <Satisfacao user={user} data={data} />
          : <LockedFeature label="Avaliação de Satisfação" />
      )}
      {subTab === "quiz" && <QuizCenarios user={user} data={data} />}
    </div>
  );
}
