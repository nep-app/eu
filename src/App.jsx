import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, collection, addDoc, onSnapshot, updateDoc, deleteDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";

var BG = "#eef1f6";
var CARD = { background:"white", borderRadius:20, padding:"18px 20px", marginBottom:14, boxShadow:"0 2px 12px rgba(15,23,42,0.07),0 0 0 1px rgba(15,23,42,0.04)" };
var SL = { fontSize:10, fontWeight:800, letterSpacing:1.5, textTransform:"uppercase", color:"#94a3b8", marginBottom:10 };
var PS = {
  urgent:  { dot:"#ef4444", bg:"#fff1f2", badge:"URGENTE",   bc:"#ef4444", bl:"#fecaca" },
  pending: { dot:"#f59e0b", bg:"#fffbf0", badge:"POR FAZER", bc:"#d97706", bl:"#fde68a" },
  new:     { dot:"#6366f1", bg:"#f5f3ff", badge:"NOVO",      bc:"#4f46e5", bl:"#c7d2fe" },
};

function upd(obj, key, val) { var r = Object.assign({}, obj); r[key] = val; return r; }
function scoreLabel(v) {
  if (v <= 2) return ["Insuficiente","#ef4444"];
  if (v <= 4) return ["Abaixo do esperado","#f97316"];
  if (v === 5) return ["Suficiente","#eab308"];
  if (v <= 7) return ["Bom","#3b82f6"];
  if (v <= 9) return ["Muito Bom","#8b5cf6"];
  return ["Excelente","#22c55e"];
}
function getDimDesc(dim, v) {
  if (v <= 2) return dim.s.a; if (v <= 4) return dim.s.b; if (v === 5) return dim.s.c;
  if (v <= 7) return dim.s.d; if (v <= 9) return dim.s.e; return dim.s.f;
}
var MTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
function nowLabel() { var d = new Date(); return MTHS[d.getMonth()] + " " + d.getFullYear(); }
function fmtDate(s) {
  if (!s) return "";
  var p = s.split("-");
  if (p.length < 3) return s;
  return p[2] + " " + MTHS[parseInt(p[1], 10) - 1];
}
function isOverdue(s) {
  if (!s) return false;
  return new Date(s) < new Date();
}

function AppIcon(props) {
  var sz = props.size || 64;
  return (
    <svg width={sz} height={sz} viewBox="0 0 64 64">
      <defs>
        <linearGradient id="ig1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#1e293b"/><stop offset="100%" stopColor="#0f172a"/></linearGradient>
        <linearGradient id="ig2" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#22c55e"/><stop offset="100%" stopColor="#4ade80"/></linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#ig1)"/>
      <circle cx="32" cy="32" r="22" fill="#22c55e" opacity="0.06"/>
      <line x1="32" y1="50" x2="32" y2="28" stroke="url(#ig2)" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M32 31 Q43 24 46 13 Q35 15 32 31" fill="url(#ig2)"/>
      <path d="M32 38 Q21 31 19 20 Q29 23 32 38" fill="#4ade80" opacity="0.8"/>
      <line x1="25" y1="50" x2="39" y2="50" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" opacity="0.35"/>
    </svg>
  );
}
function SubTabs(props) {
  var options = props.options; var active = props.active; var onChange = props.onChange; var color = props.color;
  return (
    <div style={{ display:"flex", gap:4, marginBottom:16, padding:4, background:"#e8edf2", borderRadius:16, overflowX:"auto" }}>
      {options.map(function(opt) {
        var id = opt[0]; var lb = opt[1]; var isA = active === id;
        return (
          <button key={id} onClick={function() { onChange(id); }}
            style={{ flex:1, padding:"8px 4px", borderRadius:12, border:"none", background:isA ? "white" : "transparent",
              fontSize:9, fontWeight:700, cursor:"pointer", color:isA ? color : "#64748b",
              boxShadow:isA ? "0 1px 4px rgba(0,0,0,0.1)" : "none", whiteSpace:"nowrap", minWidth:50 }}>
            {lb}
          </button>
        );
      })}
    </div>
  );
}
function Btn(props) {
  var ch = props.children; var onClick = props.onClick; var variant = props.variant; var color = props.color || "#1e293b";
  var base = { width:"100%", padding:"14px", fontSize:15, fontWeight:700, cursor:"pointer", border:"none", borderRadius:14 };
  if (variant === "success") return (<button onClick={onClick} style={Object.assign({}, base, { background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"white", boxShadow:"0 4px 14px rgba(34,197,94,0.35)" })}>{ch}</button>);
  if (variant === "dark")    return (<button onClick={onClick} style={Object.assign({}, base, { background:"linear-gradient(135deg,#1e293b,#0f172a)", color:"white", boxShadow:"0 4px 14px rgba(15,23,42,0.3)" })}>{ch}</button>);
  if (variant === "ghost")   return (<button onClick={onClick} style={Object.assign({}, base, { background:"white", color:"#64748b", border:"2px solid #e8edf2" })}>{ch}</button>);
  return (<button onClick={onClick} style={Object.assign({}, base, { background:"linear-gradient(135deg,"+color+","+color+"cc)", color:"white", boxShadow:"0 4px 14px "+color+"40" })}>{ch}</button>);
}
function RadarChart(props) {
  var scores = props.scores; var color = props.color; var prev = props.prev;
  var NR=7; var CX=150; var CY=150; var RR=100;
  var IDS = ["familia","amigos","dinheiro","trabalho","cresc","saude","lazer"];
  var LBL = ["🏠 Família","👥 Amigos","💰 Dinheiro","💼 Trabalho","🌱 Crescimento","❤️ Saúde","🎉 Lazer"];
  function ang(i) { return (i/NR)*2*Math.PI - Math.PI/2; }
  function pt(i,f) { return [CX+f*RR*Math.cos(ang(i)), CY+f*RR*Math.sin(ang(i))]; }
  function polyStr(fracs) { return fracs.map(function(f,i) { var c=pt(i,f); return c[0].toFixed(1)+","+c[1].toFixed(1); }).join(" "); }
  var fracs = IDS.map(function(id) { return (scores[id]||0)/10; });
  var pF = prev ? IDS.map(function(id) { return (prev[id]||0)/10; }) : null;
  var rings = [0.2,0.4,0.6,0.8,1.0].map(function(f) { return (<polygon key={f} points={polyStr(Array(NR).fill(f))} fill="none" stroke="#e2e8f0" strokeWidth="1"/>); });
  var axes = IDS.map(function(_,i) { var c=pt(i,1); return (<line key={i} x1={CX} y1={CY} x2={c[0].toFixed(1)} y2={c[1].toFixed(1)} stroke="#e2e8f0" strokeWidth="1"/>); });
  var dots = IDS.map(function(_,i) { var c=pt(i,fracs[i]); return (<circle key={i} cx={c[0].toFixed(1)} cy={c[1].toFixed(1)} r="5" fill={color} stroke="white" strokeWidth="2"/>); });
  var labels = LBL.map(function(lb,i) {
    var a=ang(i); var lx=CX+(RR+26)*Math.cos(a); var ly=CY+(RR+26)*Math.sin(a);
    var anchor=Math.cos(a)>0.2?"start":Math.cos(a)<-0.2?"end":"middle";
    var baseline=Math.sin(a)>0.3?"hanging":Math.sin(a)<-0.3?"auto":"middle";
    return (<text key={i} x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor={anchor} dominantBaseline={baseline} fontSize="9" fill="#475569" fontWeight="700">{lb}</text>);
  });
  return (
    <svg viewBox="0 0 300 300" style={{ width:"100%", maxWidth:270, display:"block", margin:"0 auto" }}>
      {rings}{axes}
      {pF && (<polygon points={polyStr(pF)} fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4,3"/>)}
      <polygon points={polyStr(fracs)} fill={color+"28"} stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
      {dots}{labels}
    </svg>
  );
}

// ── DATA ────────────────────────────────────────────────────────────────────────
var ALLOWED_USERNAMES = ["nilton","erick","jucilina","carina","rudmilo","bruno","salimo"];
var USERS = [
  { username:"nilton",   realName:"Nilton",   color:"#7C3AED" },
  { username:"erick",    realName:"Erick",    color:"#2563EB" },
  { username:"jucilina", realName:"Jucilina", color:"#DB2777" },
  { username:"carina",   realName:"Carina",   color:"#059669" },
  { username:"rudmilo",  realName:"Rudmilo",  color:"#D97706" },
  { username:"bruno",    realName:"Bruno",    color:"#0891B2" },
  { username:"salimo",   realName:"Salimo",   color:"#DC2626" },
];

var DIMS = [
  { id:"D1", label:"Comunicação, Assertividade e Relação em Equipa", desc:"Comunica de forma clara e adaptada às diferentes pessoas, ouve o outro e mantém ambiente de respeito.", s:{ a:"Tenho muita dificuldade em comunicar. Evito pedir ajuda.", b:"Às vezes comunico mal ou evito conversas difíceis.", c:"Consigo comunicar nas situações do dia a dia.", d:"Adapto a forma como comunico consoante com quem estou.", e:"Comunico bem em situações difíceis. Apoio os colegas.", f:"Sou referência na comunicação. Ajudo a resolver tensões." } },
  { id:"D2", label:"Resiliência, Gestão da Frustração e Adaptação", desc:"Enfrenta dificuldades com maturidade, sem desistir à primeira.", s:{ a:"Quando as coisas não correm bem, bloqueio ou desisto.", b:"As dificuldades afetam demasiado o meu estado de espírito.", c:"Consigo manter-me estável na maior parte das situações.", d:"Mantenho-me calmo/a e encontro formas de continuar.", e:"Lido bem com situações difíceis. Estabilizo os outros.", f:"Sou referência de calma. Transformo problemas em oportunidades." } },
  { id:"D3", label:"Autonomia, Proatividade e Cumprimento de Tarefas", desc:"Trabalha de forma independente e antecipa necessidades.", s:{ a:"Preciso que me digam sempre o que fazer.", b:"Faço o que me pedem, mas raramente ajo por iniciativa.", c:"Trabalho de forma autónoma nas tarefas habituais.", d:"Às vezes antecipo o que precisa de ser feito.", e:"Identifico o que é preciso antes que me digam.", f:"A minha iniciativa faz diferença. A equipa conta comigo." } },
  { id:"D4", label:"Autoconhecimento, Autocrítica e Clareza de Objetivos", desc:"Autorreflexão para reconhecer competências e limitações de forma realista.", s:{ a:"Não penso muito sobre o que faço bem ou mal.", b:"Tenho alguma noção das minhas limitações, mas custa-me admiti-las.", c:"Sei, de forma geral, o que faço bem e o que preciso de melhorar.", d:"Conheço bem as minhas competências e limitações.", e:"Reflito regularmente. Tenho um projeto de vida concreto.", f:"Conheço-me profundamente. Isso guia as minhas decisões." } },
  { id:"D5", label:"Competências Digitais e Autonomia Administrativa", desc:"Domínio de ferramentas digitais e gestão das exigências do quotidiano adulto.", s:{ a:"Tenho muita dificuldade com tecnologia e burocracia.", b:"Consigo usar algumas ferramentas digitais, mas com dificuldade.", c:"Uso ferramentas digitais básicas de forma autónoma.", d:"Uso bem as ferramentas digitais e os processos burocráticos.", e:"Uso a tecnologia de forma proativa. Às vezes ajudo outros.", f:"A minha literacia digital faz diferença." } },
  { id:"D6", label:"Qualidade da Intervenção e Conhecimentos Profissionais", desc:"Concebe e dinamiza atividades relevantes ajustadas à população-alvo.", s:{ a:"Tenho dificuldade em fazer atividades adequadas para o grupo.", b:"As atividades ainda não estão bem ajustadas.", c:"Faço atividades básicas adaptadas. Cumpro as regras.", d:"Faço atividades adaptadas. Tenho postura profissional adequada.", e:"As atividades têm impacto real. Reflito sobre como melhorá-las.", f:"A qualidade do meu trabalho tem impacto duradouro." } },
];
var RODA_DIMS = [
  { id:"familia",  label:"Família",            icon:"🏠", desc:"Como te sentes nas relações com a tua família?" },
  { id:"amigos",   label:"Amigos",              icon:"👥", desc:"Tens amizades que te fazem bem?" },
  { id:"dinheiro", label:"Dinheiro",            icon:"💰", desc:"Como está a tua situação financeira?" },
  { id:"trabalho", label:"Trabalho",            icon:"💼", desc:"Como te sentes no local de colocação?" },
  { id:"cresc",    label:"Crescimento Pessoal", icon:"🌱", desc:"Estás a aprender coisas novas? Sentes que evoluís?" },
  { id:"saude",    label:"Saúde",               icon:"❤️", desc:"Como está a tua saúde física e mental?" },
  { id:"lazer",    label:"Lazer",               icon:"🎉", desc:"Tens tempo para ti? Fazes atividades que te dão prazer?" },
];
var CHANNELS = [
  { id:"feed",      icon:"📣", label:"O Feed",             desc:"Perguntas e vitórias da semana" },
  { id:"pias",      icon:"🚀", label:"Os Nossos PIAs",     desc:"Fotos e ideias dos projetos" },
  { id:"sos",       icon:"🆘", label:"SOS JEEP",           desc:"Pede ou oferece ajuda à malta" },
  { id:"desabafos", icon:"💭", label:"Desabafos & Ideias", desc:"O espaço livre, sem filtros" },
];
var SURVEY_CATS = [
  { id:"ludoteca", icon:"🏢", label:"A tua Ludoteca",   q:"Como te sentes no teu local de trabalho?",               chips:["Boa equipa 🤝","Aprendo muito 📚","Sinto-me útil 💡","Boa energia ✨","Difícil integração 😓","Pouco apoio ⚡","Rotina chata 😐"] },
  { id:"teresa",   icon:"📞", label:"Apoio da Câmara",  q:"Sentes que a Teresa tem estado presente quando precisas?", chips:["Disponível quando preciso ✓","Reuniões úteis 🗓️","Bom acompanhamento 👍","Sinto-me apoiado/a 🤗","Difícil de contactar 📵","Preciso de mais apoio"] },
  { id:"equipa",   icon:"👥", label:"A tua Equipa",     q:"Sentes que a equipa do local te apoia?",                  chips:["Somos um bom grupo 💪","Aprendo com eles 🎓","Integrado/a ✨","Boa comunicação 📢","Há conflitos 😬","Sinto-me de fora 😔"] },
  { id:"geral",    icon:"⭐", label:"Satisfação Geral", q:"No geral, como estás a sentir o programa?",               chips:["Melhor do que esperava 🚀","Está a correr bem ✓","Estou a aprender 📚","Difícil mas vale a pena 💪","Podia ser melhor 🤔"] },
];
var SEMOJIS = ["","😞","😕","😐","🙂","😄"];
var MOCK_SURVEYS = [
  { anon:"Resposta Anónima 1", ratings:{ ludoteca:4,teresa:5,equipa:3,geral:4 }, mudaria:"Ter mais tempo para o PIA" },
  { anon:"Resposta Anónima 2", ratings:{ ludoteca:3,teresa:4,equipa:4,geral:3 }, mudaria:"Mais formação no início" },
];
var QUIZZES = [
  { id:"q1", title:"Dilema da Autonomia", badge:"D3 — Proatividade",
    scenario:"O Coordenador pediu-te para organizares os materiais de uma sala, mas teve de sair de urgência. O que fazes?",
    opts:[{ id:"A", text:"Faço tudo à minha maneira.", reveal:"Muita autonomia — mas risco de retrabalho." },
          { id:"B", text:"Paro e vou fazer outra tarefa até ele voltar.", reveal:"Respeito pela hierarquia — mas falta de iniciativa." },
          { id:"C", text:"Arrumo uma prateleira, tiro foto e mando WhatsApp.", reveal:"Iniciativa + comunicação proativa. A mais equilibrada." }], mock:{ A:28, B:15, C:57 } },
  { id:"q2", title:"O Desafio do PIA", badge:"D6 — Intervenção",
    scenario:"Preparaste uma atividade incrível. Mas os jovens dizem que estão com preguiça e preferem os telemoóveis. Como dás a volta?",
    opts:[{ id:"A", text:"Sento-me com eles, crio ligação, depois puxo-os.", reveal:"Relação primeiro — boa estratégia." },
          { id:"B", text:"Relembro as regras e dou-lhes a escolher.", reveal:"Limites claros — pode criar resistência." },
          { id:"C", text:"Pergunto o que mudariam e adapto na hora.", reveal:"Cocriação — a forma mais genuína." }], mock:{ A:35, B:22, C:43 } },
  { id:"q3", title:"Conflito com a Equipa", badge:"D1 — Comunicação",
    scenario:"Estás a fazer um jogo com os miúdos, mas o auxiliar interrompe e muda as regras. Como geres?",
    opts:[{ id:"A", text:"Deixo-o ajudar, mas depois falo com ele a sós.", reveal:"Harmonia imediata + resolução privada." },
          { id:"B", text:"Interrompo-o de forma simpática: as regras são estas.", reveal:"Assertividade direta — exige confiança." },
          { id:"C", text:"Afasto-me com ele 1 min para alinharmos as regras.", reveal:"Gestão discreta do conflito — provavelmente a mais eficaz." }], mock:{ A:38, B:25, C:37 } },
];
var SWOT_Q = [
  { id:"forcas",    label:"💪 Forças",        sub:"O que faço bem no trabalho",      color:"#22c55e", ph:"Ex: Sou criativo/a, comunico bem..." },
  { id:"fraquezas", label:"⚠️ Fraquezas",     sub:"O que ainda preciso de melhorar", color:"#f97316", ph:"Ex: Tenho dificuldade em pedir ajuda..." },
  { id:"oprtns",    label:"🌟 Oportunidades", sub:"O que posso aproveitar no PIA",   color:"#3b82f6", ph:"Ex: A Ludoteca tem espaço exterior..." },
  { id:"riscos",    label:"🚧 Riscos",        sub:"O que pode fazer o PIA falhar",   color:"#ef4444", ph:"Ex: Falta de materiais, agenda cheia..." },
];
var ALL_MEDALS = [
  { id:"proativo",    icon:"🎯", label:"Proatividade",       desc:"Agiu por iniciativa própria" },
  { id:"equipa",      icon:"🤝", label:"Espírito de Equipa", desc:"Apoiou os colegas de forma notável" },
  { id:"criativo",    icon:"💡", label:"Criatividade",       desc:"Propôs ou executou uma ideia original" },
  { id:"destaque",    icon:"⭐", label:"Destaque da Semana", desc:"Momento especial reconhecido pela GO" },
  { id:"pia",         icon:"📋", label:"PIA Completo",       desc:"Completou o Plano Individual de Ação" },
  { id:"evolucao",    icon:"📈", label:"Evolução",           desc:"Progresso notável desde o início" },
  { id:"voz",         icon:"🎤", label:"Voz Ativa",          desc:"Participou ativamente no mural" },
  { id:"resiliencia", icon:"💪", label:"Resiliência",        desc:"Superou uma situação difícil com maturidade" },
  { id:"pontual",     icon:"⏰", label:"Pontualidade",       desc:"Presença e pontualidade consistentes" },
  { id:"crescimento", icon:"🌱", label:"Crescimento",        desc:"Demonstrou vontade genuína de melhorar" },
];
var JEEP_LIST = [
  { name:"Nilton",   username:"nilton",   color:"#7C3AED", entidade:"", estado:"verde" },
  { name:"Erick",    username:"erick",    color:"#2563EB", entidade:"", estado:"verde" },
  { name:"Jucilina", username:"jucilina", color:"#DB2777", entidade:"", estado:"verde" },
  { name:"Carina",   username:"carina",   color:"#059669", entidade:"", estado:"verde" },
  { name:"Rudmilo",  username:"rudmilo",  color:"#D97706", entidade:"", estado:"verde" },
  { name:"Bruno",    username:"bruno",    color:"#0891B2", entidade:"", estado:"verde" },
  { name:"Salimo",   username:"salimo",   color:"#DC2626", entidade:"", estado:"verde" },
];
var EC = { verde:"#22c55e", amarelo:"#f59e0b", vermelho:"#ef4444" };
var PIA_FIELDS = [
  { key:"oQue",     title:"O QUÊ",    icon:"🎯", hint:"Título e natureza do projeto",   ph:"Que projeto ou atividade quero desenvolver?" },
  { key:"paraQue",  title:"PARA QUÊ", icon:"🏁", hint:"Objetivo global",               ph:"Qual é o propósito? O que vai mudar?" },
  { key:"quanto",   title:"QUANTO",   icon:"📊", hint:"Volume e frequência",            ph:"Quantas sessões? Com que frequência?" },
  { key:"onde",     title:"ONDE",     icon:"📍", hint:"Local e contexto",              ph:"Onde vai acontecer? Com que grupo?" },
  { key:"recursos", title:"RECURSOS", icon:"🧰", hint:"O que é necessário",            ph:"Materiais, pessoas, espaços." },
  { key:"comoSaber",title:"COMO SABER SE CORREU BEM", icon:"📏", hint:"Critérios de avaliação", ph:"O que vai ser diferente? Como vou medir?" },
];
var COMPL = ["Esta semana aprendi que...","A maior dificuldade foi...","Surpreendi-me quando...","Da próxima vez vou...","Orgulhei-me quando..."];
var MOODS = ["😴","😟","😐","🙂","😄","🔥"];
var EVT_COLORS = { visit:"#7C3AED", group:"#2563EB", reminder:"#D97706", personal:"#059669" };
var EVT_ICONS  = { visit:"🏢",      group:"👥",      reminder:"🔔",      personal:"📌" };
var GDPR_TEXT = "Os dados recolhidos nesta plataforma destinam-se exclusivamente ao acompanhamento do Programa JEEP EDUCA+ pela Câmara Municipal de Cascais. Os teus dados pessoais (nome, avaliações, PIA, Roda da Vida e reflexões) serão tratados de forma confidencial e utilizados apenas para fins de monitorização e melhoria do programa. Não serão partilhados com terceiros sem o teu consentimento. Podes solicitar o acesso, correção ou eliminação dos teus dados em qualquer momento, contactando a coordenadora do programa: teresa.castro@cm-cascais.pt. O armazenamento dos dados é feito de forma segura e o acesso é restrito à coordenadora do programa. Esta plataforma cumpre os requisitos do Regulamento Geral sobre a Proteção de Dados (RGPD) — Regulamento (UE) 2016/679.";