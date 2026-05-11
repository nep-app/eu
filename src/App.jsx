import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged,
} from "firebase/auth";
import {
  doc, getDoc, setDoc, collection, addDoc, onSnapshot, updateDoc, deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "./firebase";

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

// ── DATA ────────────────────────────────────────────────────────────────
var ALLOWED_USERNAMES = ["nilton","erick","jucilina","carina","rudmilo","bruno","salimo","teresa"];
var USERS = [
  { username:"nilton",   realName:"Nilton",   color:"#7C3AED" },
  { username:"erick",    realName:"Erick",    color:"#2563EB" },
  { username:"jucilina", realName:"Jucilina", color:"#DB2777" },
  { username:"carina",   realName:"Carina",   color:"#059669" },
  { username:"rudmilo",  realName:"Rudmilo",  color:"#D97706" },
  { username:"bruno",    realName:"Bruno",    color:"#0891B2" },
  { username:"salimo",   realName:"Salimo",   color:"#DC2626" },
  { username:"teresa",   realName:"Teresa",   color:"#1e293b" },
];

var DIMS = [
  { 
    id:"D1", 
    label:"Comunicação, Assertividade e Relação em Equipa", 
    desc:"Comunica de forma clara, adequada e adaptada às diferentes pessoas (crianças, colegas, coordenadores), ouve o outro e mantem ambiente de respeito e entreajuda. Capacidade de pedir apoio quando necessário e de lidar com críticas e opiniões diversas de forma construtiva. Colabora com a equipa e partilha responsabilidades.", 
    s:{ 
      a:"Tenho muita dificuldade em comunicar com a equipa e com as crianças. Evito pedir ajuda e não me sinto à vontade para receber observações sobre o meu trabalho.", 
      b:"Às vezes comunico mal, uso o tom errado ou evito conversas difíceis. Prefiro trabalhar sozinho/a e tenho dificuldade em aceitar críticas sem me defender.", 
      c:"Consigo comunicar nas situações do dia a dia sem grandes problemas. Sou respeitoso/a com a equipa e as crianças. Aceito feedback, embora me custe um pouco. Só peço ajuda quando mesmo preciso.", 
      d:"Consigo adaptar a forma como comunico consoante com quem estou. Trabalho bem em equipa, partilho responsabilidades e peço ajuda quando preciso. Recebo feedback de forma tranquila.", 
      e:"Comunico bem mesmo quando as situações são difíceis. Apoio os colegas, peço feedback regularmente e uso-o para melhorar. Contribuo para um ambiente de equipa positivo.", 
      f:"Sinto que sou uma referência na comunicação dentro da equipa. Ajudo a resolver situações de tensão, apoio os colegas e contribuo para que o espaço seja melhor para todos." 
    } 
  },
  { 
    id:"D2", 
    label:"Resiliência, Gestão da Frustração e Adaptação", 
    desc:"Enfrenta dificuldades e o stress do dia a dia com maturidade, sem desistir à primeira tentativa ou ter reações desproporcionais. Controla a frustração quando as situações não correm como planeado e tem facilidade em aceitar imprevistos, manter a calma em momentos de tensão e adaptar as suas ações para encontrar soluções e alternativas", 
    s:{ 
      a:"Quando as coisas não correm bem, bloqueio, desisto ou fico muito agitado/a. Tenho muita dificuldade em lidar com imprevistos ou situações de stress.", 
      b:"Às vezes as dificuldades afetam demasiado o meu estado de espírito e isso nota-se no trabalho. Tenho dificuldade em manter a calma quando as coisas não correm como esperava.", 
      c:"Consigo manter-me estável na maior parte das situações do dia a dia. Quando há imprevistos, fico desconfortável, mas consigo continuar.", 
      d:"Quando surgem dificuldades ou imprevistos, consigo manter-me calmo/a e encontrar formas de continuar. Não desisto à primeira e consigo adaptar-me quando o plano muda.", 
      e:"Lido bem com situações difíceis, pois mantenho-me focado/a e encontro alternativas. A minha estabilidade ajuda os que estão à minha volta.", 
      f:"Sinto que sou uma referência de calma para a equipa. Mesmo nas situações mais difíceis, mantenho equilíbrio, apoio os colegas e transformo os problemas em oportunidades de crescimento." 
    } 
  },
  { 
    id:"D3", 
    label:"Autonomia, Proatividade e Cumprimento de Tarefas", 
    desc:"Trabalha de forma independente e antecipa as necessidades do local. Identifica tarefas que precisam de ser feitas e age por iniciativa própria sem esperar por ordens externas. Cumpre os compromissos a que se propõe até ao fim.", 
    s:{ 
      a:"Preciso que me digam sempre o que fazer. Não tenho iniciativa própria e nem sempre consigo cumprir o que me comprometo a fazer.", 
      b:"Faço o que me pedem, mas não costumo agir por iniciativa própria. Preciso de orientação frequente e nem sempre consigo cumprir os compromissos até ao fim.", 
      c:"Consigo trabalhar de forma autónoma nas tarefas habituais. Não preciso que me estejam sempre a orientar e cumpro o que me comprometo a fazer.", 
      d:"Trabalho de forma autónoma e às vezes antecipo o que precisa de ser feito sem que me peçam. Cumpro o que me comprometo e termino o que começo.", 
      e:"Costumo identificar o que precisa de ser feito antes que me digam. Proponho, tomo iniciativa e cumpro os compromissos que assumo com rigor.", 
      f:"Sinto que a minha iniciativa faz diferença no espaço. A equipa conta comigo sem precisar de me acompanhar. Proponho, executo e cumpro, e isso nota-se no dia a dia." 
    } 
  },
  { 
    id:"D4", 
    label:"Autoconhecimento, Autocrítica e Clareza de Objetivos", 
    desc:"Autorreflexão e maturidade para reconhecer de forma realista as suas competências e limitações. Honestidade com que assume as falhas e procura melhoria contínua. Esforço em definir metas concretas e exequíveis para o futuro e identificar e levar a cabo os passos que precisa de dar para lá chegar.", 
    s:{ 
      a:"Não penso muito sobre o que faço bem ou mal. Não tenho objetivos claros para o futuro nem sei o que fazer para lá chegar.", 
      b:"Tenho alguma noção das minhas limitações, mas custa-me admiti-las. Tenho ideias para o futuro, mas são vagas e não sei como concretizá-las.", 
      c:"Sei, de forma geral, o que faço bem e o que preciso de melhorar. Tenho alguns objetivos para o futuro, mas ainda não tenho um plano claro.", 
      d:"Conheço bem as minhas competências e limitações. Defino objetivos concretos e sei o que preciso de fazer para os atingir. Quando falho, assumo e procuro melhorar.", 
      e:"Reflito regularmente sobre o meu desempenho e os meus padrões. Tenho um projeto de vida concreto, sei os passos que preciso de dar e estou a trabalhar nisso ativamente.", 
      f:"Conheço-me a um nível profundo. Esse autoconhecimento guia as minhas decisões, o meu projeto de vida e a forma como me relaciono com os outros e com o trabalho." 
    } 
  },
  { 
    id:"D5", 
    label:"Competências Digitais e Autonomia Administrativa", 
    desc:"Domínio de ferramentas digitais e gestão das exigências práticas do quotidiano adulto. Capacidade de recorrer à tecnologia de forma útil e orientada para o trabalho ou responsabilidades pessoais e cívicas. e de navegar processos administrativos e burocráticos. Literacia burocrática e digital.", 
    s:{ 
      a:"Tenho muita dificuldade com tecnologia e com processos burocráticos. Não consigo usar ferramentas digitais básicas nem tratar dos meus assuntos de forma autónoma.", 
      b:"Consigo usar algumas ferramentas digitais, mas com dificuldade. Preciso frequentemente de ajuda para tratar de assuntos burocráticos ou usar ferramentas de trabalho online.", 
      c:"Consigo usar as ferramentas digitais básicas no dia a dia. Trato dos meus assuntos administrativos simples de forma autónoma.", 
      d:"Uso bem as ferramentas digitais no trabalho. Consigo tratar de processos burocráticos de forma autónoma e sei onde procurar informação quando preciso.", 
      e:"Uso a tecnologia de forma proativa para melhorar o meu trabalho. Tenho facilidade com processos burocráticos, mesmo os mais complexos, e às vezes ajudo outros a navegá-los.", 
      f:"Tenho uma literacia digital e burocrática que faz diferença no espaço. Resolvo situações que outros não sabem tratar e sou um recurso para a equipa nesta área." 
    } 
  },
  { 
    id:"D6", 
    label:"Qualidade da Intervenção e Conhecimentos Profissionais", 
    desc:"Capacidade de conceção e dinamização de atividades relevantes e ajustadas à população-alvo e às necessidades identificadas. Adequação da postura profissional, respeito pelas regras e rotinas e alinhamento com a missão e objetivos da entidade. Compreende o seu papel na equipa e corresponde às expectativas do local.", 
    s:{ 
      a:"Tenho muita dificuldade em fazer atividades adequadas para o grupo. Não me identifico com as regras e rotinas do espaço e não tenho clareza sobre o meu papel aqui.", 
      b:"As atividades que faço ainda não estão bem ajustadas ao grupo. A minha postura profissional é inconsistente e tenho dificuldade em corresponder regularmente ao que é esperado.", 
      c:"Consigo fazer atividades básicas adaptadas ao grupo. Cumpro as regras e rotinas e percebo o que é esperado de mim.", 
      d:"Faço atividades adaptadas ao grupo e às suas necessidades. Tenho uma postura profissional adequada e identifico-me com os objetivos do espaço.", 
      e:"As atividades que faço têm impacto real no grupo e reflito sobre como melhorá-las. Tenho uma postura profissional que me orgulha e vou além do que é apenas esperado.", 
      f:"A qualidade do meu trabalho tem impacto real e duradouro no grupo. Sou uma referência para a equipa na conceção de atividades e a minha presença faz diferença no espaço." 
    } 
  }
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
    scenario:"Preparaste uma atividade incrível. Mas os jovens dizem que estão com preguiça e preferem os telemóveis. Como dás a volta?",
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
  { name:"Teresa",   username:"teresa",   color:"#1e293b", entidade:"(teste)", estado:"verde" },
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

// ── DEFAULTS ─────────────────────────────────────────────────────────────
var DEF_PIA   = { oQue:"",paraQue:"",quanto:"",onde:"",recursos:"",comoSaber:"" };
var DEF_ACTS  = [{ oQue:"",quando:"",obj:"" },{ oQue:"",quando:"",obj:"" },{ oQue:"",quando:"",obj:"" },{ oQue:"",quando:"",obj:"" }];
var DEF_RODA  = { familia:5,amigos:5,dinheiro:5,trabalho:5,cresc:5,saude:5,lazer:5 };
var DEF_DSCORES = { D1:5,D2:5,D3:5,D4:5,D5:5,D6:5 };
var DEF_DNOTAS  = { D1:"",D2:"",D3:"",D4:"",D5:"",D6:"" };
var DEF_SWOT  = { forcas:"",fraquezas:"",oprtns:"",riscos:"" };
var DEF_CAP   = { text:"",locked:false,revealed:false,lockedDate:"" };

export default function App() {
  // ── AUTH & NAV ─────────────────────────────────────────────────────
  var [loading, setLoading]       = useState(true);
  var [screen,  setScreen]        = useState("login");
  var [user,    setUser]          = useState(null);
  var [uIn,     setUIn]           = useState("");
  var [pIn,     setPIn]           = useState("");
  var [dIn,     setDIn]           = useState("");
  var [lErr,    setLErr]          = useState("");
  var [dispName,setDispName]      = useState("");
  var [tab,     setTab]           = useState("home");

  // ── REGISTER ──────────────────────────────────────────────────────
  var [regUser, setRegUser]   = useState("");
  var [regPw,   setRegPw]     = useState("");
  var [regPw2,  setRegPw2]    = useState("");
  var [gdprOk,  setGdprOk]    = useState(false);
  var [regErr,  setRegErr]    = useState("");
  var [showGdpr,setShowGdpr]  = useState(false);

  // ── PERCURSO TABS ────────────────────────────────────────────────
  var [percTab, setPercTab]   = useState("pia");
  var [avalSub, setAvalSub]   = useState("auto");

  // ── PERFIL TABS ──────────────────────────────────────────────────
  var [perfilTab,setPerfilTab] = useState("roda");

  // ── REFLEXÃO ────────────────────────────────────────────────────
  var [answered, setAnswered] = useState(false);
  var [aTxt,     setATxt]     = useState("");
  var [cmode,    setCmode]    = useState("texto");
  var [selMood,  setSelMood]  = useState(null);
  var [p3,       setP3]       = useState(["","",""]);
  var [cidx,     setCidx]     = useState(0);
  var [srating,  setSrating]  = useState(null);
  var [qIdx,     setQIdx]     = useState(0);
  var [qAnswers, setQAnswers] = useState({});
  var [mediaFile, setMediaFile] = useState(null);
  var [isUploading, setIsUploading] = useState(false);
  var [isRecording, setIsRecording] = useState(false);
  var [mediaRecorderRef, setMediaRecorderRef] = useState(null);
  var [recordedBlob, setRecordedBlob] = useState(null);
  var [teresaTodoTarget, setTeresaTodoTarget] = useState("nilton");
  var [teresaTodoTxt, setTeresaTodoTxt] = useState("");
  var [teresaTodoDue, setTeresaTodoDue] = useState("");
  var [teresaEvt, setTeresaEvt] = useState({ title:"", date:"", time:"", userId:"all", type:"visit" });

  // ── AUTOAVALIAÇÃO ───────────────────────────────────────────────
  var [dScores,   setDScores]   = useState(DEF_DSCORES);
  var [dNotas,    setDNotas]    = useState(DEF_DNOTAS);
  var [autoSaved, setAutoSaved] = useState(false);

  // ── SATISFAÇÃO ──────────────────────────────────────────────────
  var [sRatings, setSRatings] = useState({ ludoteca:0,teresa:0,equipa:0,geral:0 });
  var [sChips,   setSChips]   = useState({ ludoteca:[],teresa:[],equipa:[],geral:[] });
  var [sMudaria, setSMudaria] = useState("");
  var [sSaved,   setSSaved]   = useState(false);
  var [sCatIdx,  setSCatIdx]  = useState(0);

  // ── SWOT ─────────────────────────────────────────────────────────
  var [swotP,    setSwotP]    = useState(DEF_SWOT);
  var [swotPia,  setSwotPia]  = useState(DEF_SWOT);
  var [swotTab,  setSwotTab]  = useState("pessoal");
  var [swotSaved,setSwotSaved]= useState(false);

  // ── PIA ──────────────────────────────────────────────────────────
  var [pia,      setPia]      = useState(DEF_PIA);
  var [piaActs,  setPiaActs]  = useState(DEF_ACTS);
  var [piaSaved, setPiaSaved] = useState(false);

  // ── RODA DA VIDA ─────────────────────────────────────────────────
  var [roda,     setRoda]     = useState(DEF_RODA);
  var [rodaExp,  setRodaExp]  = useState(null);
  var [rodaSaves,setRodaSaves]= useState([]);

  // ── CÁPSULA ──────────────────────────────────────────────────────
  var [cap, setCap] = useState(DEF_CAP);

  // ── MURAL ────────────────────────────────────────────────────────
  var [channel,  setChannel]  = useState("feed");
  var [posts,    setPosts]    = useState({ feed:[], pias:[], sos:[], desabafos:[] });
  var [fPost,    setFPost]    = useState("");
  var [replyTo,  setReplyTo]  = useState(null);
  var [replyTxt, setReplyTxt] = useState("");
  var [expanded, setExpanded] = useState(null);

  // ── CONTACTO TERESA ──────────────────────────────────────────────
  var [msgTxt,  setMsgTxt]  = useState("");
  var [msgAnon, setMsgAnon] = useState(false);
  var [msgSent, setMsgSent] = useState(false);

  // ── SUGESTÕES ────────────────────────────────────────────────────
  var [suggTxt, setSuggTxt] = useState("");

  // ── AGENDA ───────────────────────────────────────────────────────
  var [events,  setEvents]  = useState([]);
  var [newEvt,  setNewEvt]  = useState({ title:"", date:"", time:"", userId:"all", type:"visit", shareWithTeresa:false });

  // ── TAREFAS ──────────────────────────────────────────────────────
  var [todos,   setTodos]   = useState({});
  var [newTodo, setNewTodo] = useState({ text:"", due:"", shared:true });

  // ── MEDALHAS ─────────────────────────────────────────────────────
  var initMedals = {}; JEEP_LIST.forEach(function(j) { initMedals[j.name] = []; });
  var [amMedals, setAmMedals] = useState(initMedals);
  var [amTarget, setAmTarget] = useState("Nilton");

  // ── ADMIN ────────────────────────────────────────────────────────
  var [adminTab,     setAdminTab]     = useState("geral");
  var [adminTodoUsr, setAdminTodoUsr] = useState("nilton");
  var [adminSuggTxt, setAdminSuggTxt] = useState("");
  var [adminSuggDue, setAdminSuggDue] = useState("");
  var [msgs,         setMsgs]         = useState([]);
  var [sggs,         setSggs]         = useState([]);
  var [userGdpr,     setUserGdpr]     = useState({});
  var [rulesOpen,    setRulesOpen]    = useState(false);

  // ── PARTILHAS & NOTIFICAÇÕES ──────────────────────────────────────
  var [piaShared,      setPiaShared]      = useState(false);
  var [rodaShared,     setRodaShared]     = useState(false);
  var [autoShared,     setAutoShared]     = useState(false);
  var [swotShared,     setSwotShared]     = useState(false);
 var [activeQ,          setActiveQ]         = useState("Esta semana, qual foi o momento em que te sentiste mais capaz?");
 var [activeQMode,      setActiveQMode]     = useState(["texto"]);
  var [activeQEdit,      setActiveQEdit]     = useState("");
  var [activeQModeEdit,  setActiveQModeEdit] = useState(["texto"]);
  var [adminMsgTarget, setAdminMsgTarget] = useState("nilton");
  var [adminMsgTxt,    setAdminMsgTxt]    = useState("");
  var [adminReplyId,   setAdminReplyId]   = useState(null);
  var [adminReplyTxt,  setAdminReplyTxt]  = useState("");
  var [myNotifs,       setMyNotifs]       = useState([]);
  var [allShared,      setAllShared]      = useState({});
  var [adminSharedSel, setAdminSharedSel] = useState(null);

  // ── FIREBASE AUTH STATE ──────────────────────────────────────────
  useEffect(function() {
    var unsub = onAuthStateChanged(auth, function(fbUser) {
      if (!fbUser) { setLoading(false); setScreen("login"); return; }
      var email = fbUser.email || "";
      var uname = email.replace("@jeep.app", "");
      if (uname === "admin") {
        setUser({ username:"admin", realName:"Teresa (GO)", color:"#1e293b", isAdmin:true });
        setDispName("Teresa (GO)");
        setScreen("app");
      } else {
        var f = null;
        for (var i = 0; i < USERS.length; i++) { if (USERS[i].username === uname) { f = USERS[i]; break; } }
        if (f) {
          setUser(f); setDispName(f.realName); setScreen("app");
          loadUserData(uname);
        } else {
          signOut(auth);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── REAL-TIME: EVENTS (shared) ───────────────────────────────────
  useEffect(function() {
    if (!user) return;
    var unsub = onSnapshot(collection(db, "events"), function(snap) {
      setEvents(snap.docs.map(function(d) { return Object.assign({ id:d.id }, d.data()); }));
    });
    return unsub;
  }, [user]);


  // ── VIGIAR ESTADO DE RESPOSTA DO USER ──
  useEffect(function() {
    if (!user || user.isAdmin) return;
    var unsub = onSnapshot(doc(db, "users", user.username), function(snap) {
      if (snap.exists()) setAnswered(snap.data().answered || false);
    });
    return unsub;
  }, [user]);
  

  // ── REAL-TIME: TODOS (per user) ──────────────────────────────────
  useEffect(function() {
    if (!user || user.isAdmin) return;
    var uname = user.username;
    var unsub = onSnapshot(collection(db, "todos", uname, "items"), function(snap) {
      var items = snap.docs.map(function(d) { return Object.assign({ id:d.id }, d.data()); });
      setTodos(function(prev) { return upd(prev, uname, items); });
    });
    return unsub;
  }, [user]);

  // ── REAL-TIME: TODOS (admin — all users) ─────────────────────────
  useEffect(function() {
    if (!user || !user.isAdmin) return;
    var unsubs = ALLOWED_USERNAMES.map(function(uname) {
      return onSnapshot(collection(db, "todos", uname, "items"), function(snap) {
        var items = snap.docs.map(function(d) { return Object.assign({ id:d.id }, d.data()); });
        setTodos(function(prev) { return upd(prev, uname, items); });
      });
    });
    // messages + suggestions
    var unsubM = onSnapshot(collection(db, "messages"), function(snap) {
      setMsgs(snap.docs.map(function(d) { return Object.assign({ id:d.id }, d.data()); }));
    });
    var unsubS = onSnapshot(collection(db, "suggestions"), function(snap) {
      setSggs(snap.docs.map(function(d) { return Object.assign({ id:d.id }, d.data()); }));
    });
    // GDPR info for all users
    ALLOWED_USERNAMES.forEach(function(uname) {
      getDoc(doc(db, "users", uname)).then(function(snap) {
        if (snap.exists()) {
          setUserGdpr(function(prev) { return upd(prev, uname, snap.data()); });
        }
      });
    });
    // Medals for all users
    JEEP_LIST.forEach(function(j) {
      getDoc(doc(db, "medals", j.username)).then(function(snap) {
        if (snap.exists()) {
          setAmMedals(function(prev) { return upd(prev, j.name, snap.data().list || []); });
        }
      });
    });
    return function() {
      unsubs.forEach(function(u) { u(); });
      unsubM(); unsubS();
    };
  }, [user]);

  // ── REAL-TIME: FORUM (current channel) ───────────────────────────
  useEffect(function() {
    if (!user || screen !== "app") return;
    var unsub = onSnapshot(collection(db, "forum", channel, "posts"), function(snap) {
      var items = snap.docs.map(function(d) { return Object.assign({ id:d.id }, d.data()); });
      setPosts(function(prev) { return upd(prev, channel, items); });
    });
    return unsub;
  }, [channel, user, screen]);

// ── REAL-TIME: PERGUNTA ATIVA ─────────────────────────────────────
  useEffect(function() {
    var unsub = onSnapshot(doc(db, "config", "activeQuestion"), function(snap) {
      if (snap.exists()) {
        var d = snap.data();
        setActiveQ(d.text);
        var m = d.mode;
        // Isto garante que a memória é sempre uma lista, mesmo que tenhas guardado só 1 opção antes
        if (!m) m = ["texto"];
        else if (!Array.isArray(m)) m = [m]; 
        
        setActiveQMode(m);
        setCmode(m[0]); // Seleciona automaticamente a 1ª opção permitida para os jovens
      }
    });
    return unsub;
  }, []);

  // ── REAL-TIME: NOTIFICAÇÕES DA TERESA ────────────────────────────
  useEffect(function() {
    if (!user || user.isAdmin) return;
    var unsub = onSnapshot(collection(db, "notifications", user.username, "items"), function(snap) {
      setMyNotifs(snap.docs.map(function(d) { return Object.assign({ id:d.id }, d.data()); }));
    });
    return unsub;
  }, [user]);

  // ── CARREGAR DADOS PARTILHADOS (admin) ────────────────────────────
  useEffect(function() {
    if (!user || !user.isAdmin) return;
    ALLOWED_USERNAMES.forEach(function(uname) {
      getDoc(doc(db, "userData", uname)).then(function(snap) {
        if (snap.exists()) setAllShared(function(prev) { return upd(prev, uname, snap.data()); });
      });
    });
  }, [user]);

  // ── LOAD USER DATA ───────────────────────────────────────────────
  async function loadUserData(uname) {
    var snap = await getDoc(doc(db, "userData", uname));
    if (!snap.exists()) return;
    var d = snap.data();
    if (d.pia)       setPia(d.pia);
    if (d.piaActs)   setPiaActs(d.piaActs);
    if (d.piaSaved)  setPiaSaved(d.piaSaved);
    if (d.roda)      setRoda(d.roda);
    if (d.rodaSaves) setRodaSaves(d.rodaSaves);
    if (d.dScores)   setDScores(d.dScores);
    if (d.dNotas)    setDNotas(d.dNotas);
    if (d.autoSaved) setAutoSaved(d.autoSaved);
    if (d.swotP)     setSwotP(d.swotP);
    if (d.swotPia)   setSwotPia(d.swotPia);
    if (d.swotSaved) setSwotSaved(d.swotSaved);
    if (d.cap)       setCap(d.cap);
    if (d.answered)  setAnswered(d.answered);
    if (d.qAnswers)  setQAnswers(d.qAnswers);
    if (d.sRatings)  setSRatings(d.sRatings);
    if (d.sChips)    setSChips(d.sChips);
    if (d.sMudaria !== undefined) setSMudaria(d.sMudaria);
    if (d.sSaved)    setSSaved(d.sSaved);
    if (d.piaShared)  setPiaShared(d.piaShared);
    if (d.rodaShared) setRodaShared(d.rodaShared);
    if (d.autoShared) setAutoShared(d.autoShared);
    if (d.swotShared) setSwotShared(d.swotShared);
    // medals
    var mSnap = await getDoc(doc(db, "medals", uname));
    if (mSnap.exists()) {
      var j = JEEP_LIST.find(function(x) { return x.username === uname; });
      if (j) setAmMedals(function(prev) { return upd(prev, j.name, mSnap.data().list || []); });
    }
  }

  async function saveUserField(uname, data) {
    await setDoc(doc(db, "userData", uname), data, { merge:true });
  }

  // ── AUTH FUNCTIONS ───────────────────────────────────────────────
  async function doLogin() {
    var u = uIn.toLowerCase().trim();
    setLErr("");
    if (!u) { setLErr("Introduz o teu username."); return; }
    if (u !== "admin" && ALLOWED_USERNAMES.indexOf(u) === -1) {
      setLErr("Username não autorizado. Contacta a Teresa."); return;
    }
    try {
      await signInWithEmailAndPassword(auth, u + "@jeep.app", pIn);
    } catch(e) {
      if (e.code === "auth/user-not-found" || e.code === "auth/invalid-credential" || e.code === "auth/invalid-email") {
        if (u === "admin") { setLErr("Conta admin não criada. Fala com o administrador."); return; }
        setRegUser(u); setScreen("register"); return;
      }
      setLErr("Password incorreta. Se a esqueceste, fala com a Teresa.");
    }
  }

  async function doRegister() {
    if (regPw.trim().length < 4) { setRegErr("A password deve ter pelo menos 4 caracteres."); return; }
    if (regPw !== regPw2) { setRegErr("As passwords não coincidem."); return; }
    if (!gdprOk) { setRegErr("Tens de aceitar a política de privacidade para continuar."); return; }
    try {
      await createUserWithEmailAndPassword(auth, regUser + "@jeep.app", regPw);
      await setDoc(doc(db, "users", regUser), { gdpr:true, gdprDate:nowLabel() });
    } catch(e) {
      setRegErr("Erro: " + e.message); return;
    }
  }

  async function doLogout() {
    await signOut(auth);
    setUser(null); setScreen("login");
    setUIn(""); setPIn(""); setDIn("");
    setPia(DEF_PIA); setPiaActs(DEF_ACTS); setPiaSaved(false);
    setRoda(DEF_RODA); setRodaSaves([]); setDScores(DEF_DSCORES);
    setDNotas(DEF_DNOTAS); setAutoSaved(false); setSwotP(DEF_SWOT);
    setSwotPia(DEF_SWOT); setSwotSaved(false); setCap(DEF_CAP);
    setAnswered(false); setQAnswers({}); setSRatings({ ludoteca:0,teresa:0,equipa:0,geral:0 });
    setSChips({ ludoteca:[],teresa:[],equipa:[],geral:[] }); setSMudaria(""); setSSaved(false);
    setTodos({}); setEvents([]); setMsgs([]); setSggs([]);
    setPosts({ feed:[], pias:[], sos:[], desabafos:[] });
    setTab("home");
  }

  // ── FORUM ────────────────────────────────────────────────────────
  async function postForum() {
    if (!fPost.trim() || !user) return;
    await addDoc(collection(db, "forum", channel, "posts"), {
      user:dispName, color:user.color, text:fPost, time:nowLabel(), likes:0, replies:[]
    });
    setFPost("");
  }
  async function sendReply(pid) {
    if (!replyTxt.trim()) return;
    var cur = (posts[channel]||[]).find(function(p) { return p.id === pid; });
    if (!cur) return;
    var newReplies = cur.replies.concat([{ user:dispName, color:user.color, text:replyTxt, time:nowLabel() }]);
    await updateDoc(doc(db, "forum", channel, "posts", pid), { replies:newReplies });
    setReplyTxt(""); setReplyTo(null);
  }
  async function likePost(pid) {
    var cur = (posts[channel]||[]).find(function(p) { return p.id === pid; });
    if (!cur) return;
    await updateDoc(doc(db, "forum", channel, "posts", pid), { likes:(cur.likes||0)+1 });
  }

  // ── TODOS ────────────────────────────────────────────────────────
  async function addTodoForUser() {
    if (!newTodo.text.trim() || !user) return;
    await addDoc(collection(db, "todos", user.username, "items"), {
      text:newTodo.text, due:newTodo.due, done:false,
      shared:newTodo.shared, addedBy:"user", accepted:true
    });
    setNewTodo({ text:"", due:"", shared:true });
  }
  async function toggleTodoDone(id) {
    if (!user) return;
    var cur = (todos[user.username]||[]).find(function(t) { return t.id === id; });
    if (!cur) return;
    await updateDoc(doc(db, "todos", user.username, "items", id), { done:!cur.done });
  }
  async function acceptTodo(id) {
    if (!user) return;
    await updateDoc(doc(db, "todos", user.username, "items", id), { accepted:true });
  }
  async function rejectTodo(id) {
    if (!user) return;
    await deleteDoc(doc(db, "todos", user.username, "items", id));
  }
  async function addAdminTodo() {
    if (!adminSuggTxt.trim()) return;
    await addDoc(collection(db, "todos", adminTodoUsr, "items"), {
      text:adminSuggTxt, due:adminSuggDue, done:false,
      shared:true, addedBy:"teresa", accepted:false
    });
    setAdminSuggTxt(""); setAdminSuggDue("");
  }

  // ── EVENTOS ──────────────────────────────────────────────────────
  async function addAdminEvent() {
    if (!newEvt.title.trim() || !newEvt.date) return;
    var { shareWithTeresa:_, ...evtData } = newEvt;
    await addDoc(collection(db, "events"), evtData);
    setNewEvt({ title:"", date:"", time:"", userId:"all", type:"visit", shareWithTeresa:false });
  }
  async function addPersonalEvent() {
    if (!newEvt.title.trim() || !newEvt.date || !user) return;
    var evtData = { title:newEvt.title, date:newEvt.date, time:newEvt.time, userId:user.username, type:"personal" };
    if (newEvt.shareWithTeresa) evtData.sharedWith = "teresa";
    await addDoc(collection(db, "events"), evtData);
    setNewEvt({ title:"", date:"", time:"", userId:"all", type:"visit", shareWithTeresa:false });
  }

  // ── MEDALHAS ─────────────────────────────────────────────────────
  async function toggleAMedal(jn, mid) {
    var j = null; for (var i=0;i<JEEP_LIST.length;i++){if(JEEP_LIST[i].name===jn){j=JEEP_LIST[i];break;}}
    if (!j) return;
    var cur = amMedals[jn]||[];
    var next = cur.includes(mid) ? cur.filter(function(m){return m!==mid;}) : cur.concat([mid]);
    setAmMedals(function(prev){return upd(prev,jn,next);});
    await setDoc(doc(db,"medals",j.username),{list:next});
  }

  // ── MENSAGENS & SUGESTÕES ────────────────────────────────────────
 async function sendMsg() {
    if (!msgTxt.trim() || !user) return;
    await addDoc(collection(db,"messages"),{
      text:msgTxt, anon:msgAnon, from:msgAnon?"Anónimo":user.username, hiddenUser:user.username, date:nowLabel(), adminReply:""
    });
    setMsgTxt(""); setMsgSent(true);
  }

async function replyToMsg(msgId, hiddenUser, replyText) {
    try {
      if (!replyText.trim()) return;
      var targetUser = hiddenUser || "desconhecido";
      
      // Tenta atualizar a mensagem original
      await updateDoc(doc(db, "messages", msgId), { adminReply: replyText });
      
      // Tenta enviar a notificação secreta para o utilizador
      if (targetUser !== "desconhecido") {
        await addDoc(collection(db, "notifications", targetUser, "items"), {
          from:"teresa", text:"Resposta à tua mensagem: " + replyText, date:nowLabel(), read:false
        });
      }
      
      setAdminReplyId(null);
      setAdminReplyTxt("");
      alert("Resposta enviada com sucesso!");
    } catch (erro) {
      alert("Oops, deu este erro: " + erro.message);
    }
  }
  async function sendSugg() {
    if (!suggTxt.trim() || !user) return;
    await addDoc(collection(db,"suggestions"),{ from:user.username, text:suggTxt, date:nowLabel() });
    setSuggTxt("");
  }

  async function startRecording() {
    try {
      var stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      var mr = new MediaRecorder(stream);
      var chunks = [];
      mr.ondataavailable = function(e) { if(e.data.size>0) chunks.push(e.data); };
      mr.onstop = function() {
        var blob = new Blob(chunks, { type:"audio/webm" });
        var f = new File([blob], "gravacao_"+Date.now()+".webm", { type:"audio/webm" });
        setRecordedBlob(blob);
        setMediaFile(f);
        stream.getTracks().forEach(function(t){ t.stop(); });
      };
      mr.start();
      setMediaRecorderRef(mr);
      setIsRecording(true);
    } catch(e) { alert("Microfone não disponível: " + e.message); }
  }
  function stopRecording() {
    if (mediaRecorderRef) { mediaRecorderRef.stop(); setIsRecording(false); }
  }

  async function addTeresaTodo() {
    if (!teresaTodoTxt.trim()) return;
    await addDoc(collection(db, "todos", teresaTodoTarget, "items"), {
      text:teresaTodoTxt, due:teresaTodoDue, done:false, shared:true, addedBy:"teresa", accepted:false
    });
    setTeresaTodoTxt(""); setTeresaTodoDue("");
    alert("Sugestão enviada!");
  }
  async function addTeresaEvent() {
    if (!teresaEvt.title.trim() || !teresaEvt.date) return;
    await addDoc(collection(db, "events"), Object.assign({}, teresaEvt, { addedBy:"teresa" }));
    setTeresaEvt({ title:"", date:"", time:"", userId:"all", type:"visit" });
  }
  async function launchEvaluation(type) {
    var msg = type==="auto"
      ? "📊 Nova Autoavaliação disponível! Vai ao Percurso para preencher."
      : "😊 Nova Avaliação de Satisfação disponível! Vai ao Percurso para preencher.";
    for (var u of ALLOWED_USERNAMES) {
      await saveUserField(u, type==="auto" ? { autoSaved:false } : { sSaved:false });
      await addDoc(collection(db, "notifications", u, "items"), {
        from:"teresa", text:msg, date:nowLabel(), read:false
      });
    }
    alert("Lançado! Todos os utilizadores receberam notificação. 🎉");
  }

  // ── SAVE FUNCTIONS ───────────────────────────────────────────────
  async function savePia(share) {
    var sh = share !== undefined ? share : piaShared;
    setPiaSaved(true); setPiaShared(sh);
    await saveUserField(user.username, { pia, piaActs, piaSaved:true, piaShared:sh });
  }
  async function saveAutoEval(share) {
    var sh = share !== undefined ? share : autoShared;
    setAutoSaved(true); setAutoShared(sh);
    await saveUserField(user.username, { dScores, dNotas, autoSaved:true, autoShared:sh });
  }
  async function saveSwot(share) {
    var sh = share !== undefined ? share : swotShared;
    setSwotSaved(true); setSwotShared(sh);
    await saveUserField(user.username, { swotP, swotPia, swotSaved:true, swotShared:sh });
  }
  async function saveRoda(share) {
    var sh = share !== undefined ? share : rodaShared;
    var newSaves = rodaSaves.concat([{ label:nowLabel(), scores:Object.assign({},roda) }]);
    setRodaSaves(newSaves); setRodaShared(sh);
    await saveUserField(user.username, { roda, rodaSaves:newSaves, rodaShared:sh });
  }
async function updateActiveQ() {
    try {
      if (!activeQEdit.trim()) return alert("Escreve a pergunta!");
      if (activeQModeEdit.length === 0) return alert("Escolhe um formato!");

      // 1. Guarda a Pergunta
      await setDoc(doc(db, "config", "activeQuestion"), { 
        text: activeQEdit.trim(), 
        mode: activeQModeEdit, 
        date: Date.now() 
      });

      // 2. Limpa o estado da Teresa (Admin) e do Nilton (Teste) para poderes ver logo
      // Vamos usar uma lista de users que queremos resetar para teste
      for (var u of ALLOWED_USERNAMES) {
        await setDoc(doc(db, "users", u), { answered: false }, { merge: true });
        await addDoc(collection(db, "notifications", u, "items"), {
          from:"teresa", text:"💬 Nova pergunta da semana! Vai à Reflexão para responder.", date:nowLabel(), read:false
        });
      }

      setAnswered(false);
      alert("Pergunta publicada! Todos os utilizadores foram notificados. 🎉");
      setActiveQEdit("");
    } catch (erro) {
      alert("Erro ao publicar: " + erro.message);
    }
  }
  async function sendAdminMsg() {
    if (!adminMsgTxt.trim()) return;
    await addDoc(collection(db, "notifications", adminMsgTarget, "items"), {
      from:"teresa", text:adminMsgTxt.trim(), date:nowLabel(), read:false
    });
    setAdminMsgTxt(""); alert("Mensagem enviada!");
  }
  async function dismissNotif(id) {
    if (!user) return;
    await deleteDoc(doc(db, "notifications", user.username, "items", id));
  }
  async function saveSatisf() {
    setSSaved(true);
    await saveUserField(user.username, { sRatings, sChips, sMudaria, sSaved:true });
  }
async function submitAnswer() {
    if (["foto", "video", "audio"].includes(cmode)) {
      if (!mediaFile) { alert("Por favor, escolhe um ficheiro primeiro!"); return; }
      setIsUploading(true);
      try {
        var fileRef = ref(storage, "respostas/" + user.username + "_" + Date.now() + "_" + mediaFile.name);
        await uploadBytes(fileRef, mediaFile);
        var url = await getDownloadURL(fileRef);
        await saveUserField(user.username, { answered:true, answerMedia: url, answerType: cmode });
      } catch(e) {
        alert("Erro ao enviar: " + e.message);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    } else {
      await saveUserField(user.username, { answered:true, answerText: aTxt, answerType: cmode });
    }
    setAnswered(true);
  }
  async function answerQuiz(qId, optId) {
    var newA = upd(qAnswers, qId, optId);
    setQAnswers(newA);
    await saveUserField(user.username, { qAnswers:newA });
  }
  async function sealCapsule() {
    if (!cap.text.trim()) return;
    var d = new Date(); d.setMonth(d.getMonth()+3);
    var newCap = { text:cap.text, locked:true, revealed:false, lockedDate:MTHS[d.getMonth()]+" "+d.getFullYear() };
    setCap(newCap);
    await saveUserField(user.username, { cap:newCap });
  }
  async function openCapsule() {
    var newCap = Object.assign({}, cap, { revealed:true });
    setCap(newCap);
    await saveUserField(user.username, { cap:newCap });
  }
  async function resetCapsule() {
    setCap(DEF_CAP);
    await saveUserField(user.username, { cap:DEF_CAP });
  }

  // ── SURVEY CHIPS ─────────────────────────────────────────────────
  function toggleChip(cid, chip) {
    setSChips(function(prev) {
      var cur = prev[cid]||[];
      var next = cur.includes(chip) ? cur.filter(function(c){return c!==chip;}) : cur.concat([chip]);
      return upd(prev, cid, next);
    });
  }

  // ── EXPORT ───────────────────────────────────────────────────────
  function doExport() {
    if (!user) return;
    var data = { utilizador:user.realName, exportacao:new Date().toISOString(), pia, piaAtividades:piaActs, rodaDaVida:roda, historicoRoda:rodaSaves, autoavaliacao:dScores, tarefas:todos[user.username]||[], swot:{ pessoal:swotP, pia:swotPia } };
    try {
      var blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
      var url = URL.createObjectURL(blob); var a = document.createElement("a");
      a.href=url; a.download="jeep_"+user.username+".json"; a.click(); URL.revokeObjectURL(url);
    } catch(e) { alert("Exportação não suportada neste browser."); }
  }
  function doAdminExport() {
    var data = { exportacao:new Date().toISOString(),
      todos:Object.keys(todos).map(function(u){return{username:u,items:todos[u]||[]};}),
      eventos:events, mensagens:msgs, sugestoes:sggs };
    try {
      var blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
      var url = URL.createObjectURL(blob); var a = document.createElement("a");
      a.href=url; a.download="jeep_admin_export.json"; a.click(); URL.revokeObjectURL(url);
    } catch(e) { alert("Exportação não suportada neste browser."); }
  }

  // ── DERIVED ─────────────────────────────────────────────────────
  function piaProgress() {
    var m = 0;
    Object.keys(pia).forEach(function(k) { if (pia[k].trim()) m++; });
    var a = piaActs.filter(function(x){return x.oQue.trim();}).length;
    return Math.round(((m+a)/10)*100);
  }
  function getPending() {
    if (!user || user.isAdmin) return [];
    var prog = piaProgress();
    var ut = todos[user.username]||[];
    var pendingTeresa = ut.filter(function(t){return t.addedBy==="teresa"&&!t.accepted;}).length;
    var items = [];
    if (!answered)  items.push({ status:"urgent",  icon:"💬", title:"Pergunta da semana", sub:"Ainda não respondeste", go:function(){setTab("refl");} });
    if (!autoSaved) items.push({ status:"pending", icon:"📊", title:"Autoavaliação — "+nowLabel(), sub:"Avaliação mensal em falta", go:function(){setTab("perc");setPercTab("aval");setAvalSub("auto");} });
    if (!sSaved)    items.push({ status:"new",     icon:"😊", title:"Avaliação de Satisfação", sub:"Nova! Disponível em Percurso", go:function(){setTab("perc");setPercTab("aval");setAvalSub("satisf");} });
    if (!piaSaved)  items.push({ status:"pending", icon:"📋", title:"PIA — "+prog+"% completo", sub:prog===0?"Ainda não começaste":"Continua a preencher", go:function(){setTab("perc");setPercTab("pia");} });
    if (!swotSaved) items.push({ status:"new",     icon:"🔍", title:"Raio-X Pessoal", sub:"Por preencher — faz-o no 1º mês", go:function(){setTab("perc");setPercTab("swot");} });
    if (pendingTeresa) items.push({ status:"new", icon:"✅", title:pendingTeresa+" sugestão(ões) da Teresa", sub:"Aceitar ou rejeitar nas Tarefas", go:function(){setTab("perc");setPercTab("tasks");} });
    var uq = null;
    for (var i=0;i<QUIZZES.length;i++){if(!qAnswers[QUIZZES[i].id]){uq=QUIZZES[i];break;}}
    if (uq) items.push({ status:"new", icon:"🎯", title:"Quiz: "+uq.title, sub:"Novo cenário disponível", go:function(){setTab("refl");} });
    return items;
  }

  // ── LOADING SCREEN ───────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(150deg,#0f172a 0%,#1e293b 55%,#0d3320 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <AppIcon size={64}/>
          <div style={{ color:"white", marginTop:16, fontSize:14, opacity:0.6 }}>A carregar...</div>
        </div>
      </div>
    );
  }

  // ── REGISTER ────────────────────────────────────────────────────
  if (screen === "register") {
    var regUserInfo = null;
    for (var ri=0;ri<USERS.length;ri++){if(USERS[ri].username===regUser){regUserInfo=USERS[ri];break;}}
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(150deg,#0f172a 0%,#1e293b 55%,#0d3320 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif", padding:16 }}>
        <div style={{ background:"white", borderRadius:28, padding:"36px 30px", width:320, boxShadow:"0 40px 100px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign:"center", marginBottom:22 }}>
            <AppIcon size={52}/>
            <div style={{ fontSize:19, fontWeight:900, color:"#0f172a", marginTop:10 }}>Criar Conta</div>
            <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>Bem-vindo/a, <strong style={{ color:regUserInfo?regUserInfo.color:"#0f172a" }}>{regUser}</strong>!</div>
          </div>
          <div style={{ fontSize:10, color:"#94a3b8", fontWeight:800, marginBottom:4, letterSpacing:1 }}>NOVA PASSWORD</div>
          <input type="password" value={regPw} onChange={function(e){setRegPw(e.target.value);}} placeholder="Mínimo 4 caracteres" style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:"2px solid #e8edf2", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:10 }}/>
          <div style={{ fontSize:10, color:"#94a3b8", fontWeight:800, marginBottom:4, letterSpacing:1 }}>CONFIRMAR PASSWORD</div>
          <input type="password" value={regPw2} onChange={function(e){setRegPw2(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")doRegister();}} placeholder="Repete a password" style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:"2px solid #e8edf2", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:14 }}/>
          <div style={{ padding:14, background:"#f8fafc", borderRadius:12, marginBottom:14, border:"1px solid #e8edf2" }}>
            <div onClick={function(){setShowGdpr(!showGdpr);}} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#374151" }}>📋 Política de Privacidade (RGPD)</div>
              <span style={{ fontSize:10, color:"#94a3b8" }}>{showGdpr?"▲":"▼ ler"}</span>
            </div>
            {showGdpr&&(<div style={{ fontSize:11, color:"#64748b", lineHeight:1.7, marginTop:10, maxHeight:120, overflowY:"auto" }}>{GDPR_TEXT}</div>)}
            <div onClick={function(){setGdprOk(!gdprOk);}} style={{ display:"flex", alignItems:"center", gap:10, marginTop:12, cursor:"pointer" }}>
              <div style={{ width:22, height:22, borderRadius:6, border:gdprOk?"none":"2px solid #e8edf2", background:gdprOk?"#22c55e":"white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{gdprOk&&(<span style={{ color:"white", fontWeight:900, fontSize:13 }}>✓</span>)}</div>
              <div style={{ fontSize:12, color:"#374151" }}>Li e aceito a política de privacidade do Programa JEEP</div>
            </div>
          </div>
          {regErr&&(<div style={{ color:"#ef4444", fontSize:12, marginBottom:10, padding:"8px 12px", background:"#fef2f2", borderRadius:8 }}>{regErr}</div>)}
          <button onClick={doRegister} style={{ width:"100%", padding:"14px", background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"white", border:"none", borderRadius:14, fontSize:15, fontWeight:700, cursor:"pointer" }}>Criar Conta →</button>
          <button onClick={function(){setScreen("login");setRegPw("");setRegPw2("");setRegErr("");}} style={{ width:"100%", marginTop:10, padding:10, background:"transparent", color:"#94a3b8", border:"none", fontSize:13, cursor:"pointer" }}>← Voltar ao login</button>
        </div>
      </div>
    );
  }

  // ── LOGIN ────────────────────────────────────────────────────────
  if (screen === "login") {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(150deg,#0f172a 0%,#1e293b 55%,#0d3320 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif" }}>
        <div style={{ background:"white", borderRadius:28, padding:"40px 34px", width:320, boxShadow:"0 40px 100px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <AppIcon size={68}/>
            <div style={{ fontSize:22, fontWeight:900, color:"#0f172a", marginTop:12 }}>JEEP</div>
            <div style={{ fontSize:12, color:"#94a3b8", marginTop:3 }}>EDUCA+ · Câmara de Cascais</div>
          </div>
          <div style={{ fontSize:10, color:"#94a3b8", fontWeight:800, marginBottom:4, letterSpacing:1 }}>USERNAME</div>
          <input value={uIn} onChange={function(e){setUIn(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")doLogin();}} placeholder="ex: nilton" style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:"2px solid #e8edf2", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:10 }}/>
          <div style={{ fontSize:10, color:"#94a3b8", fontWeight:800, marginBottom:4, letterSpacing:1 }}>PASSWORD</div>
          <input value={pIn} type="password" onChange={function(e){setPIn(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")doLogin();}} placeholder="••••••••" style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:"2px solid #e8edf2", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:10 }}/>
          <div style={{ fontSize:10, color:"#94a3b8", fontWeight:800, marginBottom:4, letterSpacing:1 }}>NOME QUE APARECE (opcional)</div>
          <input value={dIn} onChange={function(e){setDIn(e.target.value);}} placeholder="Como queres ser chamado/a?" style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:"2px solid #e8edf2", fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:10 }}/>
          {lErr&&(<div style={{ color:"#ef4444", fontSize:12, marginBottom:8, padding:"8px 12px", background:"#fef2f2", borderRadius:8 }}>{lErr}</div>)}
          <button onClick={doLogin} style={{ width:"100%", padding:"14px", background:"linear-gradient(135deg,#1e293b,#0f172a)", color:"white", border:"none", borderRadius:14, fontSize:15, fontWeight:700, cursor:"pointer" }}>Entrar →</button>
          <div style={{ marginTop:14, padding:"12px 14px", background:"#f8fafc", borderRadius:12, fontSize:11, color:"#94a3b8", lineHeight:1.7 }}>
            <b style={{ color:"#64748b" }}>Utilizadores:</b> nilton / erick / jucilina / carina / rudmilo / bruno / salimo<br/>
            <span style={{ fontSize:10 }}>Primeiro acesso: define a tua própria password</span>
          </div>
        </div>
      </div>
    );
  }

  // ── ADMIN ────────────────────────────────────────────────────────
  if (user && user.isAdmin) {
  var ADMIN_TABS = [["geral","📊 Geral"],["mural","🌐 Fórum"],["partilhas","📂 Partilhas"],["tasks","✅ Tarefas"],["agenda","📅 Agenda"],["msgs","💬 Msgs"],["users","👥 Utilizadores"]];
    return (
      <div style={{ minHeight:"100vh", background:BG, fontFamily:"system-ui,sans-serif" }}>
        <div style={{ background:"linear-gradient(135deg,#1e293b,#0f172a)", color:"white", padding:"16px 20px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <AppIcon size={40}/>
            <div><div style={{ fontSize:10, opacity:0.6, letterSpacing:1.5, textTransform:"uppercase" }}>Painel de Gestão</div><div style={{ fontSize:15, fontWeight:800 }}>JEEP · EDUCA+</div></div>
          </div>
          <button onClick={doLogout} style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", color:"white", padding:"7px 16px", borderRadius:20, fontSize:12, cursor:"pointer", fontWeight:600 }}>Sair</button>
        </div>
        <div style={{ display:"flex", gap:0, background:"#1e293b", overflowX:"auto" }}>
          {ADMIN_TABS.map(function(t) {
            var isA=adminTab===t[0];
            return (<button key={t[0]} onClick={function(){setAdminTab(t[0]);}} style={{ padding:"10px 14px", background:isA?"#0f172a":"transparent", color:isA?"white":"#94a3b8", border:"none", fontSize:11, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", borderBottom:isA?"2px solid #22c55e":"2px solid transparent" }}>{t[1]}</button>);
          })}
        </div>
        <div style={{ maxWidth:720, margin:"0 auto", padding:"20px 16px" }}>

{adminTab === "mural" && (
            <div>
              <div style={{ background:"linear-gradient(135deg,#1e293b,#0f172a)", borderRadius:20, padding:22, marginBottom:14 }}>
                <div style={{ fontSize:17, fontWeight:900, color:"white", marginBottom:8 }}>🌐 O Nosso Fórum</div>
                <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.7 }}>Participa e responde aos jovens diretamente no mural.</div>
              </div>
              <div style={{ display:"flex", gap:6, marginBottom:12, overflowX:"auto", paddingBottom:2 }}>
                {CHANNELS.map(function(ch) {
                  var isA=channel===ch.id;
                  return (<button key={ch.id} onClick={function(){setChannel(ch.id);}} style={{ display:"flex", alignItems:"center", gap:5, padding:"9px 14px", borderRadius:20, border:"none", background:isA?"#1e293b":"white", fontSize:12, fontWeight:700, cursor:"pointer", color:isA?"white":"#64748b", whiteSpace:"nowrap", flexShrink:0, boxShadow:isA?"0 4px 12px rgba(15,23,42,0.4)":"0 1px 4px rgba(0,0,0,0.06)" }}>{ch.icon} {ch.label}</button>);
                })}
              </div>
              <div style={CARD}>
                <div style={{ display:"flex", gap:8 }}>
                  <input value={fPost} onChange={function(e){setFPost(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")postForum();}} placeholder="Escreve no mural como Admin..." style={{ flex:1, padding:"11px 14px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none" }}/>
                  <button onClick={postForum} style={{ background:"#1e293b", color:"white", border:"none", borderRadius:12, padding:"11px 16px", fontSize:16, cursor:"pointer" }}>↑</button>
                </div>
              </div>
              {(posts[channel]||[]).slice().reverse().map(function(p) {
                return (
                  <div key={p.id} style={Object.assign({},CARD,{marginBottom:10,padding:"14px 16px"})}>
                    <div style={{ display:"flex", gap:10 }}>
                      <div style={{ width:38, height:38, borderRadius:"50%", background:p.user==="Teresa (GO)"?"#1e293b":"linear-gradient(135deg,"+p.color+","+p.color+"cc)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:14, fontWeight:800, flexShrink:0 }}>{p.user[0]}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:13, fontWeight:700 }}>{p.user} {p.user==="Teresa (GO)"&&<span style={{fontSize:9, background:"#7C3AED", color:"white", padding:"2px 6px", borderRadius:6, marginLeft:4}}>ADMIN</span>}</span><span style={{ fontSize:11, color:"#94a3b8" }}>{p.time}</span></div>
                        <div style={{ fontSize:14, color:"#374151", marginTop:4, lineHeight:1.55 }}>{p.text}</div>
                        <div style={{ marginTop:9, display:"flex", gap:12 }}>
                          <span onClick={function(){likePost(p.id);}} style={{ fontSize:12, color:"#94a3b8", cursor:"pointer" }}>❤️ {p.likes}</span>
                          <span onClick={function(){setReplyTo(replyTo===p.id?null:p.id);setExpanded(p.id);}} style={{ fontSize:12, color:"#94a3b8", cursor:"pointer", fontWeight:600 }}>💬 Responder</span>
                          {p.replies.length>0&&(<span onClick={function(){setExpanded(expanded===p.id?null:p.id);}} style={{ fontSize:12, color:"#1e293b", fontWeight:700, cursor:"pointer" }}>{expanded===p.id?"▲":"▼"} {p.replies.length}</span>)}
                        </div>
                      </div>
                    </div>
                    {expanded===p.id&&p.replies.length>0&&(
                      <div style={{ marginTop:10, marginLeft:48, borderLeft:"2px solid #e8edf2", paddingLeft:12 }}>
                        {p.replies.map(function(rp,ri) {
                          return (<div key={ri} style={{ display:"flex", gap:8, marginBottom:8 }}>
                            <div style={{ width:28, height:28, borderRadius:"50%", background:rp.user==="Teresa (GO)"?"#1e293b":"linear-gradient(135deg,"+rp.color+","+rp.color+"cc)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:11, fontWeight:800, flexShrink:0 }}>{rp.user[0]}</div>
                            <div><div style={{ fontSize:12, fontWeight:700 }}>{rp.user} {rp.user==="Teresa (GO)"&&<span style={{fontSize:8, background:"#7C3AED", color:"white", padding:"1px 4px", borderRadius:4, marginLeft:4}}>ADMIN</span>} <span style={{ color:"#94a3b8", fontWeight:400 }}>· {rp.time}</span></div><div style={{ fontSize:12, color:"#374151", marginTop:2 }}>{rp.text}</div></div>
                          </div>);
                        })}
                      </div>
                    )}
                    {replyTo===p.id&&(
                      <div style={{ marginTop:10, marginLeft:48, display:"flex", gap:8 }}>
                        <input value={replyTxt} onChange={function(e){setReplyTxt(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")sendReply(p.id);}} placeholder={"Responder a "+p.user+"..."} style={{ flex:1, padding:"9px 14px", borderRadius:20, border:"2px solid #1e293b", fontSize:12, outline:"none" }} autoFocus/>
                        <button onClick={function(){sendReply(p.id);}} style={{ background:"#1e293b", color:"white", border:"none", borderRadius:20, padding:"9px 16px", fontSize:12, cursor:"pointer" }}>↑</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
       {adminTab === "geral" && (
            <div>
              <div style={CARD}>
                <div style={SL}>Pergunta Ativa</div>
                <div style={{ fontSize:13, color:"#374151", fontWeight:600, marginBottom:12, padding:"10px 12px", background:"#f8fafc", borderRadius:10, borderLeft:"3px solid #7C3AED" }}>{activeQ}</div>
             <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                  <input value={activeQEdit} onChange={function(e){setActiveQEdit(e.target.value);}} placeholder="Escreve nova pergunta para todos..." style={{ flex:1, minWidth:200, padding:"11px 14px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none" }}/>
                  <button onClick={updateActiveQ} style={{ background:"#7C3AED", color:"white", border:"none", borderRadius:12, padding:"11px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Publicar</button>
                </div>
                <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", letterSpacing:1, marginBottom:6 }}>PERMITIR RESPOSTAS EM:</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
{[["texto","✏️ Texto"],["mood","🌡️ Mood"],["3p","💡 3 Palav."],["completar","🔤 Completar"],["semana","⭐ Avaliação"], ["foto", "📸 Foto"], ["video", "🎥 Vídeo"], ["audio", "🎙️ Áudio"]].map(function(opt) {                    var isSel = activeQModeEdit.includes(opt[0]);
                    return (
                      <button key={opt[0]} onClick={function(){
                        if(isSel && activeQModeEdit.length===1) return; // Não deixa desmarcar o último
                        setActiveQModeEdit(isSel ? activeQModeEdit.filter(function(x){return x!==opt[0];}) : activeQModeEdit.concat([opt[0]]));
                      }} style={{ padding:"6px 12px", borderRadius:20, border:isSel?"2px solid #7C3AED":"2px solid #e8edf2", background:isSel?"#7C3AED15":"white", fontSize:11, fontWeight:700, cursor:"pointer", color:isSel?"#7C3AED":"#64748b" }}>
                        {opt[1]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={CARD}>
                <div style={SL}>Respostas à Pergunta Atual</div>
                {JEEP_LIST.map(function(j) {
                  var d = allShared[j.username] || {};
                  var atype = d.answerType || "texto";
                  return (
                    <div key={j.username} style={{ padding:"10px 0", borderBottom:"1px solid #f1f5f9" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom: d.answered ? 6 : 0 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:d.answered?"#22c55e":"#e2e8f0", flexShrink:0 }}/>
                        <div style={{ fontSize:13, fontWeight:700 }}>{j.name}</div>
                        {d.answered
                          ? <span style={{ fontSize:10, background:"#22c55e15", color:"#15803d", padding:"1px 8px", borderRadius:8, fontWeight:700 }}>✓ respondeu</span>
                          : <span style={{ fontSize:11, color:"#94a3b8" }}>— ainda não respondeu</span>}
                      </div>
                      {d.answered && (
                        <div style={{ marginLeft:16, fontSize:12, color:"#374151", background:"#f8fafc", borderRadius:8, padding:"6px 10px" }}>
                          {["foto","video","audio"].includes(atype) ? (
                            <a href={d.answerMedia} target="_blank" rel="noreferrer" style={{ color:"#7C3AED", fontWeight:700 }}>
                              {atype==="foto"?"📸 Ver foto":atype==="video"?"🎥 Ver vídeo":"🎙️ Ouvir áudio"}
                            </a>
                          ) : (d.answerText || "Resposta sem texto")}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={CARD}>
                <div style={SL}>Lançar Avaliações</div>
                <div style={{ fontSize:12, color:"#64748b", marginBottom:10 }}>Reativa a avaliação para todos os utilizadores e envia notificação.</div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={function(){launchEvaluation("auto");}} style={{ flex:1, padding:"12px 8px", background:"#2563EB", color:"white", border:"none", borderRadius:12, fontSize:12, fontWeight:700, cursor:"pointer" }}>📊 Autoavaliação</button>
                  <button onClick={function(){launchEvaluation("satisf");}} style={{ flex:1, padding:"12px 8px", background:"#DB2777", color:"white", border:"none", borderRadius:12, fontSize:12, fontWeight:700, cursor:"pointer" }}>😊 Satisfação</button>
                </div>
              </div>
              <div style={CARD}>
                <div style={SL}>Acompanhamento</div>
                {JEEP_LIST.map(function(j,i) {
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", padding:"10px 0", borderBottom:i<4?"1px solid #f1f5f9":"none", gap:10 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:EC[j.estado], flexShrink:0 }}/>
                      <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:700 }}>{j.name}</div><div style={{ fontSize:11, color:"#94a3b8" }}>{j.entidade}</div></div>
                      <div style={{ display:"flex", gap:2 }}>
                        {(amMedals[j.name]||[]).map(function(m) {
                          var med=null; for(var k=0;k<ALL_MEDALS.length;k++){if(ALL_MEDALS[k].id===m){med=ALL_MEDALS[k];break;}}
                          if(!med) return null;
                          return (<span key={m} title={med.label} style={{ fontSize:14 }}>{med.icon}</span>);
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={CARD}>
                <div style={SL}>Avaliações de Satisfação</div>
                {JEEP_LIST.filter(function(j){ var d=allShared[j.username]||{}; return d.sSaved; }).length === 0 ? (
                  <div style={{ textAlign:"center", padding:"20px 0", color:"#94a3b8", fontSize:13 }}>Nenhuma avaliação submetida ainda.</div>
                ) : (
                  JEEP_LIST.map(function(j) {
                    var d = allShared[j.username] || {};
                    if (!d.sSaved) return null;
                    return (
                      <div key={j.username} style={{ padding:14, background:"#f8fafc", borderRadius:14, marginBottom:10, border:"1px solid #e8edf2" }}>
                        <div style={{ fontSize:11, fontWeight:700, color:j.color, marginBottom:8 }}>{j.name} <span style={{ color:"#94a3b8", fontWeight:400 }}>— anónima</span></div>
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:8 }}>
                          {SURVEY_CATS.map(function(c){ var r=(d.sRatings||{})[c.id]||0; return(<div key={c.id} style={{ display:"flex", alignItems:"center", gap:4, background:"white", borderRadius:8, padding:"4px 10px", border:"1px solid #e8edf2" }}>{c.icon}<span style={{ fontSize:13 }}>{SEMOJIS[r]}</span><span style={{ fontSize:11, color:"#94a3b8" }}>{r}/5</span></div>);})}
                        </div>
                        {d.sMudaria&&(<div style={{ fontSize:12, color:"#374151", fontStyle:"italic", padding:"8px 12px", background:"white", borderRadius:8 }}>"  {d.sMudaria}"</div>)}
                      </div>
                    );
                  })
                )}
              </div>
              <div style={CARD}>
                <div style={SL}>Atribuir Medalhas</div>
                <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
                  {JEEP_LIST.map(function(j){return(<button key={j.name} onClick={function(){setAmTarget(j.name);}} style={{ padding:"7px 16px", borderRadius:20, border:amTarget===j.name?"2px solid "+j.color:"2px solid #e8edf2", background:amTarget===j.name?j.color+"15":"white", fontSize:13, fontWeight:700, cursor:"pointer", color:amTarget===j.name?j.color:"#64748b" }}>{j.name}</button>);})}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {ALL_MEDALS.map(function(m) {
                    var has=(amMedals[amTarget]||[]).includes(m.id);
                    return (<div key={m.id} onClick={function(){toggleAMedal(amTarget,m.id);}} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px", borderRadius:14, border:has?"2px solid #22c55e":"2px solid #e8edf2", background:has?"#f0fdf4":"#fafbfc", cursor:"pointer" }}>
                      <span style={{ fontSize:20 }}>{m.icon}</span>
                      <div style={{ flex:1 }}><div style={{ fontSize:12, fontWeight:700 }}>{m.label}</div><div style={{ fontSize:10, color:"#94a3b8" }}>{m.desc}</div></div>
                      {has&&(<span style={{ color:"#22c55e", fontWeight:700 }}>✓</span>)}
                    </div>);
                  })}
                </div>
              </div>
              <div style={{ marginTop:8 }}><Btn variant="dark" onClick={doAdminExport}>📤 Exportar Dados (JSON)</Btn></div>
            </div>
          )}

          {adminTab === "tasks" && (
            <div>
              <div style={CARD}>
                <div style={SL}>Adicionar Sugestão de Tarefa</div>
                <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
                  {JEEP_LIST.map(function(j){return(<button key={j.name} onClick={function(){setAdminTodoUsr(j.username);}} style={{ padding:"6px 14px", borderRadius:20, border:adminTodoUsr===j.username?"2px solid "+j.color:"2px solid #e8edf2", background:adminTodoUsr===j.username?j.color+"15":"white", fontSize:12, fontWeight:700, cursor:"pointer", color:adminTodoUsr===j.username?j.color:"#64748b" }}>{j.name}</button>);})}
                </div>
                <input value={adminSuggTxt} onChange={function(e){setAdminSuggTxt(e.target.value);}} placeholder="Descrição da tarefa..." style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:8 }}/>
                <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                  <input type="date" value={adminSuggDue} onChange={function(e){setAdminSuggDue(e.target.value);}} style={{ flex:1, padding:"10px 12px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none" }}/>
                  <button onClick={addAdminTodo} style={{ background:"#1e293b", color:"white", border:"none", borderRadius:12, padding:"10px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Enviar</button>
                </div>
              </div>
              {JEEP_LIST.map(function(j) {
                var jTodos=todos[j.username]||[];
                var shared=jTodos.filter(function(t){return t.shared;});
                if(shared.length===0) return null;
                return (
                  <div key={j.name} style={CARD}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:j.color }}/>
                      <div style={{ fontSize:14, fontWeight:800 }}>{j.name}</div>
                      <div style={{ fontSize:11, color:"#94a3b8" }}>{shared.filter(function(t){return t.done;}).length}/{shared.length} concluídas</div>
                    </div>
                    {shared.map(function(t) {
                      return (
                        <div key={t.id} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"8px 0", borderBottom:"1px solid #f1f5f9" }}>
                          <div style={{ width:18, height:18, borderRadius:5, background:t.done?"#22c55e":"#e8edf2", display:"flex", alignItems:"center", justifyContent:"center", marginTop:2, flexShrink:0 }}>{t.done&&<span style={{ color:"white", fontSize:11 }}>✓</span>}</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:t.done?400:600, color:t.done?"#94a3b8":"#0f172a", textDecoration:t.done?"line-through":"none" }}>{t.text}</div>
                            <div style={{ display:"flex", gap:8, marginTop:3 }}>
                              {t.due&&(<span style={{ fontSize:10, color:isOverdue(t.due)&&!t.done?"#ef4444":"#94a3b8" }}>📅 {fmtDate(t.due)}</span>)}
                              {t.addedBy==="teresa"&&(<span style={{ fontSize:10, background:"#7C3AED18", color:"#7C3AED", padding:"1px 6px", borderRadius:4, fontWeight:700 }}>sugestão tua</span>)}
                              {!t.accepted&&(<span style={{ fontSize:10, background:"#f59e0b20", color:"#d97706", padding:"1px 6px", borderRadius:4 }}>pendente</span>)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {adminTab === "agenda" && (
            <div>
              <div style={CARD}>
                <div style={SL}>Adicionar Evento</div>
                <input value={newEvt.title} onChange={function(e){setNewEvt(upd(newEvt,"title",e.target.value));}} placeholder="Título do evento" style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:8 }}/>
                <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                  <input type="date" value={newEvt.date} onChange={function(e){setNewEvt(upd(newEvt,"date",e.target.value));}} style={{ flex:1, padding:"10px 12px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none" }}/>
                  <input type="time" value={newEvt.time} onChange={function(e){setNewEvt(upd(newEvt,"time",e.target.value));}} style={{ width:90, padding:"10px 12px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none" }}/>
                </div>
                <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                  <select value={newEvt.userId} onChange={function(e){setNewEvt(upd(newEvt,"userId",e.target.value));}} style={{ flex:1, padding:"10px 12px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none" }}>
                    <option value="all">Todos</option>
                    {JEEP_LIST.map(function(j){return(<option key={j.username} value={j.username}>{j.name}</option>);})}
                  </select>
                  <select value={newEvt.type} onChange={function(e){setNewEvt(upd(newEvt,"type",e.target.value));}} style={{ flex:1, padding:"10px 12px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none" }}>
                    <option value="visit">Visita 🏢</option>
                    <option value="group">Grupo 👥</option>
                    <option value="reminder">Lembrete 🔔</option>
                  </select>
                </div>
                <Btn variant="dark" onClick={addAdminEvent}>Adicionar Evento</Btn>
              </div>
              <div style={CARD}>
                <div style={SL}>Todos os Eventos</div>
                {events.slice().sort(function(a,b){return a.date.localeCompare(b.date);}).map(function(e) {
                  var col=EVT_COLORS[e.type]||"#94a3b8";
                  return (
                    <div key={e.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid #f1f5f9" }}>
                      <span style={{ fontSize:18 }}>{EVT_ICONS[e.type]}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700 }}>{e.title}</div>
                        <div style={{ fontSize:11, color:"#94a3b8" }}>{fmtDate(e.date)}{e.time?" · "+e.time:""} · {e.userId==="all"?"Todos":e.userId}</div>
                      </div>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:col, flexShrink:0 }}/>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {adminTab === "msgs" && (
            <div>
              <div style={CARD}>
                <div style={SL}>Enviar Mensagem a Utilizador</div>
                <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
                  {JEEP_LIST.map(function(j){return(<button key={j.name} onClick={function(){setAdminMsgTarget(j.username);}} style={{ padding:"6px 14px", borderRadius:20, border:adminMsgTarget===j.username?"2px solid "+j.color:"2px solid #e8edf2", background:adminMsgTarget===j.username?j.color+"15":"white", fontSize:12, fontWeight:700, cursor:"pointer", color:adminMsgTarget===j.username?j.color:"#64748b" }}>{j.name}</button>);})}
                </div>
                <textarea value={adminMsgTxt} onChange={function(e){setAdminMsgTxt(e.target.value);}} placeholder="Mensagem para o/a utilizador/a..." rows={2} style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none", resize:"none", boxSizing:"border-box", marginBottom:8 }}/>
                <button onClick={sendAdminMsg} style={{ background:"#7C3AED", color:"white", border:"none", borderRadius:12, padding:"10px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>Enviar Mensagem →</button>
              </div>
<div style={CARD}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                  <div style={SL}>Mensagens Recebidas</div>
                  <div style={{ background:"#fef9f0", border:"1px solid #fde68a", borderRadius:20, padding:"3px 10px", fontSize:9, fontWeight:800, color:"#92400e" }}>inclui anónimas</div>
                </div>
                {msgs.length===0 ? (
                  <div style={{ textAlign:"center", padding:"30px 0", color:"#94a3b8", fontSize:13 }}>Ainda não tens mensagens.</div>
                ) : (
                  msgs.slice().reverse().map(function(m) {
                    return (
                      <div key={m.id} style={{ padding:"12px 14px", background:m.anon?"#fef9f0":"#f8fafc", borderRadius:14, marginBottom:10, border:m.anon?"1px solid #fde68a":"1px solid #e8edf2" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <div style={{ fontSize:12, fontWeight:700, color:m.anon?"#92400e":"#374151" }}>{m.anon?"🔒 Anónimo":m.from} <span style={{ fontWeight:400, color:"#94a3b8" }}>· {m.date}</span></div>
                        </div>
                        <div style={{ fontSize:13, color:"#374151", lineHeight:1.6, marginBottom:8 }}>{m.text}</div>
                        
                        {m.adminReply ? (
                          <div style={{ padding:"8px 10px", background:"rgba(124, 58, 237, 0.1)", borderRadius:8, borderLeft:"3px solid #7C3AED", fontSize:12, color:"#4c1d95" }}>
                            <strong>Teresa respondeu:</strong> {m.adminReply}
                          </div>
                        ) : (
                          adminReplyId === m.id ? (
                            <div style={{ display:"flex", gap:8, marginTop:8 }}>
                              <input value={adminReplyTxt} onChange={function(e){setAdminReplyTxt(e.target.value);}} placeholder="Escreve a resposta..." style={{ flex:1, padding:"8px 10px", borderRadius:8, border:"1px solid #cbd5e1", fontSize:12 }} />
                              <button onClick={function(){replyToMsg(m.id, m.hiddenUser, adminReplyTxt);}} style={{ background:"#7C3AED", color:"white", border:"none", borderRadius:8, padding:"8px 12px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Enviar</button>
                              <button onClick={function(){setAdminReplyId(null);}} style={{ background:"transparent", color:"#94a3b8", border:"none", fontSize:12, cursor:"pointer" }}>Cancelar</button>
                            </div>
                          ) : (
                            <button onClick={function(){setAdminReplyId(m.id); setAdminReplyTxt("");}} style={{ background:"white", border:"1px solid #cbd5e1", borderRadius:8, padding:"6px 10px", fontSize:11, fontWeight:700, color:"#475569", cursor:"pointer" }}>💬 Responder</button>
                          )
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <div style={CARD}>
                <div style={SL}>Sugestões Recebidas</div>
                {sggs.length===0 ? (
                  <div style={{ textAlign:"center", padding:"20px 0", color:"#94a3b8", fontSize:13 }}>Ainda não há sugestões.</div>
                ) : (
                  sggs.slice().reverse().map(function(s) {
                    return (
                      <div key={s.id} style={{ padding:"12px 14px", background:"#f8fafc", borderRadius:14, marginBottom:8, border:"1px solid #e8edf2" }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"#64748b", marginBottom:4 }}>{s.from} · {s.date}</div>
                        <div style={{ fontSize:13, color:"#374151" }}>{s.text}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {adminTab === "users" && (
            <div>
              <div style={Object.assign({},CARD,{background:"linear-gradient(135deg,#1e293b,#0f172a)",border:"none"})}>
                <div style={{ fontSize:14, fontWeight:800, color:"white", marginBottom:6 }}>🔑 Gestão de Passwords</div>
                <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.7, marginBottom:12 }}>Para repor a password de um utilizador, vai ao <strong style={{ color:"white" }}>Firebase Console → Authentication</strong> e usa a opção "Reset password" para o email <code style={{ background:"#0f172a", padding:"1px 6px", borderRadius:4, fontSize:11 }}>{`{username}@jeep.app`}</code></div>
                <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#22c55e", color:"white", textDecoration:"none", padding:"9px 18px", borderRadius:12, fontSize:13, fontWeight:700 }}>🔗 Abrir Firebase Console</a>
              </div>
              <div style={CARD}>
                <div style={SL}>Estado dos Utilizadores</div>
                {ALLOWED_USERNAMES.map(function(u,i) {
                  var gdpr = userGdpr[u];
                  var jInfo=null; for(var j=0;j<JEEP_LIST.length;j++){if(JEEP_LIST[j].username===u){jInfo=JEEP_LIST[j];break;}}
                  return (
                    <div key={u} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:i<4?"1px solid #f1f5f9":"none" }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:gdpr?(jInfo?jInfo.color:"#1e293b"):"#e8edf2", flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:700 }}>{u}</div>
                        <div style={{ fontSize:11, color:"#94a3b8" }}>{gdpr?"Registado · RGPD: "+gdpr.gdprDate:"Ainda não se registou"}</div>
                      </div>
                      <div style={{ fontSize:11, fontWeight:700, color:gdpr?"#22c55e":"#f59e0b" }}>{gdpr?"✓ Ativo":"Pendente"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {adminTab === "partilhas" && (
            <div>
              <div style={Object.assign({},CARD,{background:"linear-gradient(135deg,#1e293b,#0f172a)",border:"none",marginBottom:14})}>
                <div style={{ fontSize:13, fontWeight:800, color:"white", marginBottom:4 }}>📂 Dados Partilhados</div>
                <div style={{ fontSize:12, color:"#94a3b8" }}>Só aparecem aqui os dados que cada utilizador escolheu partilhar contigo.</div>
              </div>
              {ALLOWED_USERNAMES.map(function(uname) {
                var d = allShared[uname] || {};
                var jInfo = null; for(var j=0;j<JEEP_LIST.length;j++){if(JEEP_LIST[j].username===uname){jInfo=JEEP_LIST[j];break;}}
                var hasAny = d.piaShared || d.rodaShared || d.autoShared || d.swotShared || d.sSaved;
                var isOpen = adminSharedSel === uname;
                return (
                  <div key={uname} style={CARD}>
                    <div onClick={function(){setAdminSharedSel(isOpen?null:uname);}} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:jInfo?jInfo.color:"#94a3b8", flexShrink:0 }}/>
                      <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:800 }}>{jInfo?jInfo.name:uname}</div></div>
                      <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                        {d.piaShared&&(<span style={{ fontSize:10, background:"#7C3AED15", color:"#7C3AED", padding:"2px 8px", borderRadius:20, fontWeight:700 }}>PIA</span>)}
                        {d.rodaShared&&(<span style={{ fontSize:10, background:"#2563EB15", color:"#2563EB", padding:"2px 8px", borderRadius:20, fontWeight:700 }}>Roda</span>)}
                        {d.autoShared&&(<span style={{ fontSize:10, background:"#05966915", color:"#059669", padding:"2px 8px", borderRadius:20, fontWeight:700 }}>Auto</span>)}
                        {d.swotShared&&(<span style={{ fontSize:10, background:"#D9770615", color:"#D97706", padding:"2px 8px", borderRadius:20, fontWeight:700 }}>SWOT</span>)}
                        {d.sSaved&&(<span style={{ fontSize:10, background:"#DC262615", color:"#DC2626", padding:"2px 8px", borderRadius:20, fontWeight:700 }}>Satisfação</span>)}
                        {!hasAny&&(<span style={{ fontSize:10, color:"#94a3b8" }}>Nada partilhado ainda</span>)}
                      </div>
                      <span style={{ color:"#94a3b8", fontSize:16, marginLeft:4 }}>{isOpen?"▲":"▼"}</span>
                    </div>
                    {isOpen&&(
                      <div style={{ marginTop:14, borderTop:"1px solid #f1f5f9", paddingTop:14 }}>
                        {!hasAny&&(<div style={{ textAlign:"center", padding:"16px 0", color:"#94a3b8", fontSize:13 }}>Este utilizador ainda não partilhou nada.</div>)}
                        {d.piaShared&&d.pia&&(
                          <div style={{ marginBottom:14 }}>
                            <div style={{ fontSize:12, fontWeight:800, color:"#7C3AED", marginBottom:8 }}>📋 PIA</div>
                            {Object.keys(d.pia).filter(function(k){return d.pia[k];}).map(function(k){return(<div key={k} style={{ fontSize:12, color:"#374151", padding:"6px 10px", background:"#f8fafc", borderRadius:8, marginBottom:4 }}><strong>{k}:</strong> {d.pia[k]}</div>);})}
                          </div>
                        )}
                        {d.rodaShared&&d.roda&&(
                          <div style={{ marginBottom:14 }}>
                            <div style={{ fontSize:12, fontWeight:800, color:"#2563EB", marginBottom:8 }}>🌸 Roda da Vida</div>
                            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                              {Object.keys(d.roda).map(function(k){return(<div key={k} style={{ background:"#2563EB10", borderRadius:8, padding:"4px 10px", fontSize:12 }}>{k}: <strong>{d.roda[k]}</strong></div>);})}
                            </div>
                          </div>
                        )}
                        {d.autoShared&&d.dScores&&(
                          <div style={{ marginBottom:14 }}>
                            <div style={{ fontSize:12, fontWeight:800, color:"#059669", marginBottom:8 }}>📊 Autoavaliação</div>
                            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:8 }}>
                              {Object.keys(d.dScores).map(function(k){return(<div key={k} style={{ background:"#05966915", borderRadius:8, padding:"4px 10px", fontSize:12 }}>{k}: <strong>{d.dScores[k]}/10</strong></div>);})}
                            </div>
                            {d.dNotas&&Object.keys(d.dNotas).filter(function(k){return d.dNotas[k];}).map(function(k){return(<div key={k} style={{ fontSize:11, color:"#64748b", padding:"3px 8px", fontStyle:"italic" }}>{k}: {d.dNotas[k]}</div>);})}
                          </div>
                        )}
                        {d.swotShared&&d.swotP&&(
                          <div style={{ marginBottom:14 }}>
                            <div style={{ fontSize:12, fontWeight:800, color:"#D97706", marginBottom:8 }}>🔍 Raio-X Pessoal</div>
                            {Object.keys(d.swotP).filter(function(k){return d.swotP[k];}).map(function(k){return(<div key={k} style={{ fontSize:12, color:"#374151", padding:"6px 10px", background:"#fef3c715", borderRadius:8, marginBottom:4 }}><strong>{k}:</strong> {d.swotP[k]}</div>);})}
                          </div>
                        )}
                        {d.sSaved&&d.sRatings&&(
                          <div>
                            <div style={{ fontSize:12, fontWeight:800, color:"#DC2626", marginBottom:8 }}>😊 Satisfação (anónima)</div>
                            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:6 }}>
                              {Object.keys(d.sRatings).map(function(k){return(<div key={k} style={{ background:"#DC262610", borderRadius:8, padding:"4px 10px", fontSize:12 }}>{k}: {SEMOJIS[d.sRatings[k]]} <strong>{d.sRatings[k]}/5</strong></div>);})}
                            </div>
                            {d.sMudaria&&(<div style={{ fontSize:12, color:"#374151", fontStyle:"italic", padding:"6px 10px", background:"#fef9f0", borderRadius:8 }}>"  {d.sMudaria}"</div>)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── USER APP ─────────────────────────────────────────────────────
  var prog = piaProgress();
  var lastSave = rodaSaves.length > 0 ? rodaSaves[rodaSaves.length-1] : null;
  var pendingItems = getPending();
  var currentQuiz = QUIZZES[qIdx];
  var currentQuizAns = qAnswers[currentQuiz.id];
  var currentSurveyCat = SURVEY_CATS[sCatIdx];
  var swotState = swotTab === "pessoal" ? swotP : swotPia;
  var setSwotState = swotTab === "pessoal" ? setSwotP : setSwotPia;
  var C = user.color;
  var TABS = [
    { id:"home",  icon:"🏠", label:"Início" },
    { id:"refl",  icon:"💬", label:"Reflexão" },
    { id:"mural", icon:"🌐", label:"Mural" },
    { id:"perc",  icon:"📁", label:"Percurso" },
    { id:"perfil",icon:"👤", label:"Perfil" },
  ];
  var userTodos = todos[user.username]||[];
  var acceptedTodos = userTodos.filter(function(t){return t.accepted;});
  var doneTodos = acceptedTodos.filter(function(t){return t.done;});
  var pendingTeresaTodos = userTodos.filter(function(t){return t.addedBy==="teresa"&&!t.accepted;});
  var todoPercent = acceptedTodos.length>0 ? Math.round((doneTodos.length/acceptedTodos.length)*100) : 0;
  var userEvents = events.filter(function(e){return e.userId===user.username||e.userId==="all"||(user.username==="teresa"&&e.sharedWith==="teresa");});
  userEvents.sort(function(a,b){return a.date.localeCompare(b.date);});
  var userMedals = (function(){var j=JEEP_LIST.find(function(x){return x.username===user.username;});return j?(amMedals[j.name]||[]):[];})();

  return (
    <div style={{ minHeight:"100vh", background:BG, fontFamily:"system-ui,sans-serif", maxWidth:420, margin:"0 auto", display:"flex", flexDirection:"column" }}>
      <div style={{ background:"linear-gradient(135deg,"+C+" 0%,"+C+"dd 100%)", padding:"14px 20px 18px", color:"white", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-30, top:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }}/>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, border:"2px solid rgba(255,255,255,0.3)" }}>{dispName[0]}</div>
            <div><div style={{ fontSize:11, opacity:0.75 }}>Olá,</div><div style={{ fontSize:18, fontWeight:800 }}>{dispName}</div></div>
          </div>
          <button onClick={doLogout} style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.2)", color:"white", padding:"6px 14px", borderRadius:20, fontSize:11, cursor:"pointer", fontWeight:600 }}>Sair</button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", paddingBottom:85 }}>

        {/* ── HOME ── */}
        {tab === "home" && (
          <div style={{ padding:"18px 16px" }}>
            {myNotifs.length>0&&(
              <div style={Object.assign({},CARD,{background:"linear-gradient(135deg,#f5f3ff,#ede9fe)",border:"2px solid #7C3AED30"})}>
                <div style={{ fontSize:13, fontWeight:800, color:"#7C3AED", marginBottom:10 }}>📩 {myNotifs.length} mensagem{myNotifs.length>1?"ns":""} da Teresa</div>
                {myNotifs.map(function(n) {
                  return (
                    <div key={n.id} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", background:"white", borderRadius:12, marginBottom:8, border:"1px solid #7C3AED20" }}>
                      <span style={{ fontSize:20 }}>💜</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, color:"#374151", lineHeight:1.6 }}>{n.text}</div>
                        <div style={{ fontSize:10, color:"#94a3b8", marginTop:4 }}>{n.date}</div>
                      </div>
                      <button onClick={function(){dismissNotif(n.id);}} style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:18, lineHeight:1, flexShrink:0 }}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
            {pendingItems.length > 0 ? (
              <div style={CARD}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={SL}>O que tens para fazer</div>
                  <div style={{ background:C+"18", borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:800, color:C }}>{pendingItems.length}</div>
                </div>
                {pendingItems.map(function(item,i) {
                  var ss=PS[item.status];
                  return (
                    <div key={i} onClick={item.go} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 13px", borderRadius:14, background:ss.bg, marginBottom:i<pendingItems.length-1?8:0, cursor:"pointer", border:"1.5px solid "+ss.bl }}>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:ss.dot, flexShrink:0 }}/>
                      <span style={{ fontSize:18, flexShrink:0 }}>{item.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:"#0f172a" }}>{item.title}</div>
                        <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{item.sub}</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                        <div style={{ background:"white", borderRadius:20, padding:"2px 8px", fontSize:9, fontWeight:800, color:ss.bc, border:"1px solid "+ss.bl }}>{ss.badge}</div>
                        <span style={{ color:"#94a3b8", fontSize:16 }}>›</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={Object.assign({},CARD,{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:"1.5px solid #bbf7d0"})}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:28 }}>🎉</span>
                  <div><div style={{ fontSize:14, fontWeight:800, color:"#15803d" }}>Tudo em dia!</div><div style={{ fontSize:12, color:"#22c55e" }}>Não tens nada pendente.</div></div>
                </div>
              </div>
            )}
            <div style={Object.assign({},CARD,{background:"linear-gradient(135deg,#1e293b,#0f172a)",border:"none"})}>
              <div style={{ fontSize:14, fontWeight:800, color:"white", marginBottom:4 }}>📱 Contactar a Teresa</div>
              <div style={{ fontSize:12, color:"#94a3b8", marginBottom:14 }}>Dúvidas? Precisas de ajuda? Fala comigo.</div>
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                <a href="https://wa.me/351916025666" target="_blank" rel="noreferrer" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"11px", borderRadius:12, background:"#22c55e", color:"white", textDecoration:"none", fontWeight:700, fontSize:13 }}>📲 WhatsApp</a>
                <a href="mailto:teresa.castro@cm-cascais.pt" style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"11px", borderRadius:12, background:"#2563EB", color:"white", textDecoration:"none", fontWeight:700, fontSize:13 }}>✉️ Email</a>
              </div>
              {msgSent ? (
                <div style={{ textAlign:"center", padding:"12px", background:"rgba(34,197,94,0.15)", borderRadius:12 }}>
                  <span style={{ color:"#22c55e", fontWeight:700, fontSize:13 }}>✓ Mensagem enviada{msgAnon?" anonimamente":""}!</span>
                </div>
              ) : (
                <div>
                  <textarea value={msgTxt} onChange={function(e){setMsgTxt(e.target.value);}} placeholder="Ou envia-me uma mensagem aqui dentro..." rows={2} style={{ width:"100%", padding:"10px 12px", borderRadius:12, border:"1.5px solid #334155", background:"#0f172a", color:"white", fontSize:12, outline:"none", resize:"none", boxSizing:"border-box", marginBottom:8 }}/>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div onClick={function(){setMsgAnon(!msgAnon);}} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
                      <div style={{ width:18, height:18, borderRadius:5, background:msgAnon?"#22c55e":"#334155", display:"flex", alignItems:"center", justifyContent:"center" }}>{msgAnon&&<span style={{ color:"white", fontSize:10, fontWeight:900 }}>✓</span>}</div>
                      <span style={{ fontSize:11, color:"#94a3b8" }}>Enviar anonimamente</span>
                    </div>
                    <button onClick={sendMsg} style={{ background:"#22c55e", color:"white", border:"none", borderRadius:10, padding:"8px 16px", fontSize:12, fontWeight:700, cursor:"pointer" }}>Enviar</button>
                  </div>
                </div>
              )}
            </div>
            <div onClick={function(){setTab("perc");setPercTab("pia");}} style={Object.assign({},CARD,{cursor:"pointer"})}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <div style={SL}>🌡️ Termómetro do PIA</div>
                <div style={{ fontSize:14, fontWeight:900, color:C }}>{prog}%</div>
              </div>
              <div style={{ background:"#e8edf2", borderRadius:99, height:10, overflow:"hidden" }}>
                <div style={{ background:"linear-gradient(90deg,"+C+","+C+"99)", height:"100%", width:prog+"%", borderRadius:99 }}/>
              </div>
            </div>
            {userMedals.length > 0 && (
              <div style={CARD}>
                <div style={SL}>As tuas Medalhas</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {userMedals.map(function(m) {
                    var med=null; for(var i=0;i<ALL_MEDALS.length;i++){if(ALL_MEDALS[i].id===m){med=ALL_MEDALS[i];break;}}
                    if(!med) return null;
                    return (<div key={m} style={{ display:"flex", flexDirection:"column", alignItems:"center", background:"linear-gradient(135deg,#fffbeb,#fef9c3)", border:"1.5px solid #fde68a", borderRadius:14, padding:"10px 14px" }}><div style={{ fontSize:26 }}>{med.icon}</div><div style={{ fontSize:9, fontWeight:800, color:"#92400e", marginTop:4 }}>{med.label.toUpperCase()}</div></div>);
                  })}
                </div>
              </div>
            )}
          </div>
        )}

{/* ── SEPARADOR: REFLEXÃO ── */}
        {tab === "refl" && (
          <div style={{ padding:"18px 16px" }}>
            <div style={CARD}>
              <div style={SL}>Pergunta da Semana</div>
              <div style={{ fontSize:15, color:"#0f172a", fontWeight:700, lineHeight:1.5, marginBottom:16, padding:"12px 14px", background:C+"08", borderRadius:12, borderLeft:"3px solid "+C }}>{activeQ}</div>
              
              {answered ? (
                <div style={{ textAlign:"center", padding:"20px 0" }}>
                  <div style={{ fontSize:48, marginBottom:10 }}>✅</div>
                  <div style={{ fontSize:17, fontWeight:800 }}>Enviado!</div>
                  <div style={{ fontSize:13, color:"#64748b", marginTop:4 }}>A Teresa vai ler a tua resposta.</div>
                </div>
              ) : (
                <div>
                  {/* Seleção de Formato (se a Teresa permitir mais que um) */}
                  {activeQMode.length > 1 && (
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:11, fontWeight:800, color:C, letterSpacing:1, marginBottom:8, textTransform:"uppercase" }}>Como queres responder?</div>
                      <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                        {[
                          ["texto","✏️","Texto"], ["mood","🌡️","Mood"], ["3p","💡","3 Palavras"], 
                          ["completar","🔤","Frase"], ["semana","⭐","Semana"],
                          ["foto","📸","Foto"], ["video","🎥","Vídeo"], ["audio","🎙️","Áudio"]
                        ].filter(function(m){ return activeQMode.includes(m[0]); })
                         .map(function(m) {
                           var isA = cmode === m[0];
                           return (<button key={m[0]} onClick={function(){setCmode(m[0]); setMediaFile(null);}} style={{ display:"flex", alignItems:"center", gap:4, padding:"7px 12px", borderRadius:20, border:isA?"2px solid "+C:"2px solid #e8edf2", background:isA?C+"15":"white", fontSize:12, fontWeight:700, cursor:"pointer", color:isA?C:"#64748b" }}>{m[1]} {m[2]}</button>);
                         })}
                      </div>
                    </div>
                  )}

                  {/* Zonas de Resposta Consoante o Modo Escolhido */}
                  {cmode==="texto" && (<textarea value={aTxt} onChange={function(e){setATxt(e.target.value);}} placeholder="Escreve aqui..." rows={4} style={{ width:"100%", padding:"12px 14px", borderRadius:14, border:"2px solid #e8edf2", fontSize:14, outline:"none", boxSizing:"border-box" }}/>)}
                  
                  {cmode==="mood" && (
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                      {MOODS.map(function(m,i){return(<button key={i} onClick={function(){setSelMood(i);}} style={{ fontSize:30, background:"none", border:"none", cursor:"pointer", opacity:selMood===i?1:0.3, transform:selMood===i?"scale(1.3)":"" }}>{m}</button>);})}
                    </div>
                  )}

                  {cmode==="3p" && (
                    <div>
                      {[0,1,2].map(function(i){return(<input key={i} value={p3[i]||""} onChange={function(e){var n=p3.slice();n[i]=e.target.value;setP3(n);}} placeholder={"Palavra "+(i+1)} style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:"2px solid #e8edf2", fontSize:14, marginBottom:8, boxSizing:"border-box" }}/>);})}
                    </div>
                  )}

                  {/* ZONA MULTIMÉDIA (Foto, Vídeo) */}
                  {["foto", "video"].includes(cmode) && (
                    <div style={{ padding:"20px", border:"2px dashed #cbd5e1", borderRadius:14, textAlign:"center", background:"#f8fafc", marginBottom:10 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"#64748b", marginBottom:10 }}>
                        {cmode==="foto" ? "Seleciona uma Foto 📸" : "Seleciona um Vídeo 🎥"}
                      </div>
                      <input
                        type="file"
                        accept={cmode==="foto"?"image/*":"video/*"}
                        onChange={function(e){if(e.target.files[0]) setMediaFile(e.target.files[0]);}}
                        style={{ maxWidth:"100%", fontSize:12 }}
                      />
                      {mediaFile && <div style={{ fontSize:12, color:"#22c55e", fontWeight:700, marginTop:10 }}>✓ {mediaFile.name.slice(0,24)}…</div>}
                    </div>
                  )}
                  {/* ÁUDIO — gravar no momento ou escolher ficheiro */}
                  {cmode === "audio" && (
                    <div style={{ padding:"20px", border:"2px dashed #cbd5e1", borderRadius:14, textAlign:"center", background:"#f8fafc", marginBottom:10 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:"#64748b", marginBottom:12 }}>🎙️ Gravar Áudio</div>
                      <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:12 }}>
                        {!isRecording ? (
                          <button onClick={startRecording} style={{ padding:"11px 22px", background:"#ef4444", color:"white", border:"none", borderRadius:12, fontWeight:700, fontSize:13, cursor:"pointer" }}>🔴 Gravar</button>
                        ) : (
                          <button onClick={stopRecording} style={{ padding:"11px 22px", background:"#1e293b", color:"white", border:"none", borderRadius:12, fontWeight:700, fontSize:13, cursor:"pointer" }}>⏹️ Parar</button>
                        )}
                      </div>
                      {isRecording && <div style={{ fontSize:12, color:"#ef4444", fontWeight:700, marginBottom:10 }}>● A gravar…</div>}
                      {recordedBlob && !isRecording && <div style={{ fontSize:12, color:"#22c55e", fontWeight:700, marginBottom:10 }}>✓ Áudio gravado!</div>}
                      <div style={{ fontSize:11, color:"#94a3b8", marginBottom:6 }}>ou escolhe um ficheiro:</div>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={function(e){if(e.target.files[0]){setMediaFile(e.target.files[0]);setRecordedBlob(null);}}}
                        style={{ maxWidth:"100%", fontSize:12 }}
                      />
                      {mediaFile && !recordedBlob && <div style={{ fontSize:12, color:"#22c55e", fontWeight:700, marginTop:8 }}>✓ {mediaFile.name.slice(0,24)}…</div>}
                    </div>
                  )}

                  {/* Botão de Enviar Geral */}
                  <div style={{ marginTop:16 }}>
                    <button 
                      disabled={isUploading}
                      onClick={submitAnswer} 
                      style={{ width:"100%", background:isUploading?"#94a3b8":C, color:"white", border:"none", borderRadius:14, padding:"14px", fontSize:14, fontWeight:800, cursor:"pointer", boxShadow:"0 4px 12px "+C+"44" }}
                    >
                      {isUploading ? "A carregar para a nuvem... ⏳" : "Enviar Resposta →"}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div style={CARD}>
              <div style={SL}>🎯 Quiz — O que farias?</div>
              <div style={{ display:"flex", gap:6, marginBottom:14 }}>
                {QUIZZES.map(function(q,i) {
                  var hasAns=qAnswers[q.id];
                  return (<button key={q.id} onClick={function(){setQIdx(i);}} style={{ flex:1, padding:"7px 4px", borderRadius:10, border:qIdx===i?"2px solid "+C:"2px solid #e8edf2", background:qIdx===i?C+"12":"white", fontSize:9, fontWeight:700, cursor:"pointer", color:qIdx===i?C:"#64748b", position:"relative" }}>{q.title.slice(0,12)}{hasAns&&(<span style={{ position:"absolute", top:-3, right:-3, width:8, height:8, borderRadius:"50%", background:"#22c55e", border:"1.5px solid white" }}/>)}</button>);
                })}
              </div>
              <div style={{ display:"inline-flex", background:C+"12", borderRadius:20, padding:"4px 12px", fontSize:10, color:C, fontWeight:800, marginBottom:10 }}>{currentQuiz.badge}</div>
              <div style={{ fontSize:13, color:"#374151", lineHeight:1.65, marginBottom:14, padding:"13px 15px", background:"#f8fafc", borderRadius:14, borderLeft:"3px solid "+C }}>{currentQuiz.scenario}</div>
              {!currentQuizAns ? (
                <div>
                  {currentQuiz.opts.map(function(opt) {
                    return (<button key={opt.id} onClick={function(){answerQuiz(currentQuiz.id,opt.id);}} style={{ display:"flex", gap:10, alignItems:"flex-start", width:"100%", padding:"13px 15px", borderRadius:14, border:"2px solid #e8edf2", background:"white", fontSize:13, cursor:"pointer", textAlign:"left", marginBottom:8 }}><span style={{ fontWeight:900, color:C, flexShrink:0 }}>{opt.id}</span><span style={{ color:"#374151", lineHeight:1.5 }}>{opt.text}</span></button>);
                  })}
                </div>
              ) : (
                <div>
                  {currentQuiz.opts.map(function(opt) {
                    var chosen=currentQuizAns===opt.id; var pct=currentQuiz.mock[opt.id];
                    return (
                      <div key={opt.id} style={{ marginBottom:10 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                          <span style={{ fontSize:12, color:chosen?"#0f172a":"#94a3b8", fontWeight:chosen?700:400 }}><strong style={{ color:chosen?C:"#94a3b8" }}>{opt.id}</strong> {opt.text.slice(0,40)}…</span>
                          <span style={{ fontSize:13, fontWeight:800, color:chosen?C:"#94a3b8" }}>{pct}%</span>
                        </div>
                        <div style={{ background:"#e8edf2", borderRadius:99, height:7, overflow:"hidden" }}><div style={{ background:chosen?"linear-gradient(90deg,"+C+","+C+"bb)":"#cbd5e1", height:"100%", width:pct+"%", borderRadius:99 }}/></div>
                      </div>
                    );
                  })}
                  <div style={{ marginTop:14, padding:"13px", background:C+"10", borderRadius:14, borderLeft:"3px solid "+C, fontSize:13, color:"#374151", lineHeight:1.6 }}>
                    <strong style={{ color:C }}>A tua escolha ({currentQuizAns}):</strong>{" "}{currentQuiz.opts.filter(function(o){return o.id===currentQuizAns;})[0].reveal}
                  </div>
                </div>
              )}
            </div>
            <div style={CARD}>
              <div style={SL}>💡 Caixa de Sugestões</div>
              <div style={{ fontSize:12, color:"#64748b", marginBottom:12 }}>Ideias para melhorar o programa, atividades, ou qualquer coisa. A Teresa lê tudo.</div>
              <textarea value={suggTxt} onChange={function(e){setSuggTxt(e.target.value);}} placeholder="Escreve a tua sugestão..." rows={3} style={{ width:"100%", padding:"12px 14px", borderRadius:14, border:"2px solid #e8edf2", fontSize:13, outline:"none", resize:"none", boxSizing:"border-box", marginBottom:12 }}/>
              <Btn color={C} onClick={sendSugg}>Enviar Sugestão →</Btn>
            </div>
          </div>
        )}

        {/* ── MURAL ── */}
        {tab === "mural" && (
          <div style={{ padding:"18px 16px" }}>
            <div style={{ display:"flex", gap:6, marginBottom:12, overflowX:"auto", paddingBottom:2 }}>
              {CHANNELS.map(function(ch) {
                var isA=channel===ch.id;
                return (<button key={ch.id} onClick={function(){setChannel(ch.id);}} style={{ display:"flex", alignItems:"center", gap:5, padding:"9px 14px", borderRadius:20, border:"none", background:isA?C:"white", fontSize:12, fontWeight:700, cursor:"pointer", color:isA?"white":"#64748b", whiteSpace:"nowrap", flexShrink:0, boxShadow:isA?"0 4px 12px "+C+"40":"0 1px 4px rgba(0,0,0,0.06)" }}>{ch.icon} {ch.label}</button>);
              })}
            </div>
            <div style={{ padding:"8px 14px", background:"white", borderRadius:12, marginBottom:12, fontSize:12, color:"#64748b" }}>{CHANNELS.filter(function(ch){return ch.id===channel;})[0].desc}</div>
            <div style={Object.assign({},CARD,{marginBottom:12})}>
              <div style={{ display:"flex", gap:8 }}>
                <input value={fPost} onChange={function(e){setFPost(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")postForum();}} placeholder="Escreve no mural..." style={{ flex:1, padding:"11px 14px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none" }}/>
                <button onClick={postForum} style={{ background:"linear-gradient(135deg,"+C+","+C+"cc)", color:"white", border:"none", borderRadius:12, padding:"11px 16px", fontSize:16, cursor:"pointer" }}>↑</button>
              </div>
            </div>
            {(posts[channel]||[]).slice().reverse().map(function(p) {
              return (
                <div key={p.id} style={Object.assign({},CARD,{marginBottom:10,padding:"14px 16px"})}>
                  <div style={{ display:"flex", gap:10 }}>
                    <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,"+p.color+","+p.color+"cc)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:14, fontWeight:800, flexShrink:0 }}>{p.user[0]}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:13, fontWeight:700 }}>{p.user}</span><span style={{ fontSize:11, color:"#94a3b8" }}>{p.time}</span></div>
                      <div style={{ fontSize:14, color:"#374151", marginTop:4, lineHeight:1.55 }}>{p.text}</div>
                      <div style={{ marginTop:9, display:"flex", gap:12 }}>
                        <span onClick={function(){likePost(p.id);}} style={{ fontSize:12, color:"#94a3b8", cursor:"pointer" }}>❤️ {p.likes}</span>
                        <span onClick={function(){setReplyTo(replyTo===p.id?null:p.id);setExpanded(p.id);}} style={{ fontSize:12, color:"#94a3b8", cursor:"pointer", fontWeight:600 }}>💬 Responder</span>
                        {p.replies.length>0&&(<span onClick={function(){setExpanded(expanded===p.id?null:p.id);}} style={{ fontSize:12, color:C, fontWeight:700, cursor:"pointer" }}>{expanded===p.id?"▲":"▼"} {p.replies.length}</span>)}
                      </div>
                    </div>
                  </div>
                  {expanded===p.id&&p.replies.length>0&&(
                    <div style={{ marginTop:10, marginLeft:48, borderLeft:"2px solid #e8edf2", paddingLeft:12 }}>
                      {p.replies.map(function(rp,ri) {
                        return (<div key={ri} style={{ display:"flex", gap:8, marginBottom:8 }}>
                          <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,"+rp.color+","+rp.color+"cc)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:11, fontWeight:800, flexShrink:0 }}>{rp.user[0]}</div>
                          <div><div style={{ fontSize:12, fontWeight:700 }}>{rp.user} <span style={{ color:"#94a3b8", fontWeight:400 }}>· {rp.time}</span></div><div style={{ fontSize:12, color:"#374151", marginTop:2 }}>{rp.text}</div></div>
                        </div>);
                      })}
                    </div>
                  )}
                  {replyTo===p.id&&(
                    <div style={{ marginTop:10, marginLeft:48, display:"flex", gap:8 }}>
                      <input value={replyTxt} onChange={function(e){setReplyTxt(e.target.value);}} onKeyDown={function(e){if(e.key==="Enter")sendReply(p.id);}} placeholder={"Responder a "+p.user+"..."} style={{ flex:1, padding:"9px 14px", borderRadius:20, border:"2px solid "+C, fontSize:12, outline:"none" }} autoFocus/>
                      <button onClick={function(){sendReply(p.id);}} style={{ background:"linear-gradient(135deg,"+C+","+C+"cc)", color:"white", border:"none", borderRadius:20, padding:"9px 16px", fontSize:12, cursor:"pointer" }}>↑</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── PERCURSO ── */}
        {tab === "perc" && (
          <div style={{ padding:"18px 16px" }}>
            <SubTabs options={[["pia","📋 PIA"],["aval","📊 Aval."],["swot","🔍 Raio-X"],["tasks","✅ Tarefas"]]} active={percTab} onChange={setPercTab} color={C}/>

            {percTab === "pia" && (
              <div>
                <div style={CARD}>
                  <div style={SL}>Plano Individual de Ação</div>
                  <div style={{ background:"#e8edf2", borderRadius:99, height:11, overflow:"hidden", marginBottom:6 }}><div style={{ background:"linear-gradient(90deg,"+C+","+C+"99)", height:"100%", width:prog+"%", borderRadius:99 }}/></div>
                  <div style={{ fontSize:11, color:"#94a3b8" }}>{prog}% completo</div>
                </div>
                {PIA_FIELDS.map(function(f) {
                  var val=pia[f.key];
                  return (
                    <div key={f.key} style={Object.assign({},CARD,{padding:"16px 18px",borderLeft:val.trim()?"4px solid "+C:"4px solid #e8edf2"})}>
                      <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:10 }}>
                        <span style={{ fontSize:18 }}>{f.icon}</span>
                        <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:800 }}>{f.title}</div><div style={{ fontSize:11, color:"#94a3b8" }}>{f.hint}</div></div>
                        {val.trim()&&(<span style={{ color:"#22c55e", fontSize:16, fontWeight:700 }}>✓</span>)}
                      </div>
                      <textarea value={val} onChange={function(e){setPia(upd(pia,f.key,e.target.value));}} placeholder={f.ph} rows={2} style={{ width:"100%", padding:"11px 13px", borderRadius:12, border:"2px solid #e8edf2", fontSize:12, outline:"none", resize:"none", boxSizing:"border-box" }}/>
                    </div>
                  );
                })}
                <div style={Object.assign({},CARD,{padding:"16px 18px"})}>
                  <div style={{ fontSize:13, fontWeight:800, marginBottom:4 }}>🗓️ COMO E QUANDO</div>
                  {piaActs.map(function(a,i) {
                    return (
                      <div key={i} style={{ marginBottom:10, padding:12, background:"#f8fafc", borderRadius:14, border:a.oQue.trim()?"1.5px solid "+C+"50":"1.5px solid #e8edf2" }}>
                        <div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", letterSpacing:1, marginBottom:8 }}>ATIVIDADE {i+1}</div>
                        {[["oQue","Descrição"],["quando","Quando?"],["obj","Objetivo específico"]].map(function(pair) {
                          return (<input key={pair[0]} value={a[pair[0]]} onChange={function(e){var n=piaActs.slice();n[i]=upd(n[i],pair[0],e.target.value);setPiaActs(n);}} placeholder={pair[1]} style={{ width:"100%", padding:"9px 11px", borderRadius:10, border:"1.5px solid #e8edf2", fontSize:12, outline:"none", boxSizing:"border-box", marginBottom:6, background:"white" }}/>);
                        })}
                      </div>
                    );
                  })}
                </div>
                {piaSaved ? (
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <Btn variant="success" onClick={function(){}}>✓ Guardado{piaShared?" e Partilhado":""}</Btn>
                    {!piaShared&&(<Btn color="#7C3AED" onClick={function(){savePia(true);}}>🔗 Partilhar com Teresa</Btn>)}
                  </div>
                ) : (
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <Btn color={C} onClick={function(){savePia(false);}}>💾 Guardar só para mim</Btn>
                    <Btn color="#7C3AED" onClick={function(){savePia(true);}}>🔗 Guardar e Partilhar</Btn>
                  </div>
                )}
              </div>
            )}

            {percTab === "aval" && (
              <div>
                <SubTabs options={[["auto","📋 Autoavaliação"],["satisf","😊 Satisfação"]]} active={avalSub} onChange={setAvalSub} color={C}/>
                {avalSub === "auto" && (
                  <div>
                    <div style={{ background:"linear-gradient(135deg,#1e293b,#0f172a)", borderRadius:20, padding:22, marginBottom:14 }}>
                      <div style={{ fontSize:17, fontWeight:900, color:"white", marginBottom:8 }}>📊 Autoavaliação</div>
                      <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.8 }}>Preenche com honestidade. Podes guardar só para ti ou partilhar com a Teresa. 🌱</div>
                    </div>
                    {DIMS.map(function(dim) {
                      var v=dScores[dim.id]; var sl=scoreLabel(v); var lb=sl[0]; var col=sl[1];
                      return (
                        <div key={dim.id} style={CARD}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                            <div style={{ flex:1, paddingRight:12 }}><div style={{ fontSize:10, fontWeight:800, color:"#94a3b8", letterSpacing:1.5, marginBottom:3 }}>{dim.id}</div><div style={{ fontSize:14, fontWeight:800, lineHeight:1.3 }}>{dim.label}</div></div>
                            <div style={{ textAlign:"center", flexShrink:0 }}><div style={{ fontSize:28, fontWeight:900, color:col }}>{v}</div><div style={{ fontSize:9, fontWeight:800, color:col }}>{lb.toUpperCase()}</div></div>
                          </div>
                          <div style={{ padding:"10px 13px", background:"#f8fafc", borderRadius:12, fontSize:12, color:"#64748b", lineHeight:1.6, marginBottom:12 }}>{dim.desc}</div>
                          <input type="range" min={1} max={10} value={v} onChange={function(e){setDScores(upd(dScores,dim.id,Number(e.target.value)));}} style={{ width:"100%", marginBottom:12, accentColor:col, cursor:"pointer" }}/>
                          <div style={{ padding:"10px 13px", background:col+"10", borderRadius:12, borderLeft:"3px solid "+col, fontSize:12, color:"#374151", marginBottom:10 }}>{getDimDesc(dim,v)}</div>
                          <textarea value={dNotas[dim.id]} onChange={function(e){setDNotas(upd(dNotas,dim.id,e.target.value));}} placeholder="Notas..." rows={2} style={{ width:"100%", padding:"10px 12px", borderRadius:12, border:"1.5px solid #e8edf2", fontSize:12, outline:"none", resize:"none", boxSizing:"border-box" }}/>
                        </div>
                      );
                    })}
                    {autoSaved ? (
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        <Btn variant="success" onClick={function(){}}>✓ Guardado{autoShared?" e Partilhado":""}</Btn>
                        {!autoShared&&(<Btn color="#7C3AED" onClick={function(){saveAutoEval(true);}}>🔗 Partilhar com Teresa</Btn>)}
                      </div>
                    ) : (
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        <Btn variant="dark" onClick={function(){saveAutoEval(false);}}>💾 Guardar só para mim</Btn>
                        <Btn color="#7C3AED" onClick={function(){saveAutoEval(true);}}>🔗 Guardar e Partilhar</Btn>
                      </div>
                    )}
                  </div>
                )}
                {avalSub === "satisf" && (
                  <div>
                    <div style={{ background:"linear-gradient(135deg,#1e293b,#0f172a)", borderRadius:20, padding:20, marginBottom:14 }}>
                      <div style={{ fontSize:16, fontWeight:800, color:"white", marginBottom:8 }}>😊 Avaliação de Satisfação</div>
                      <div style={{ display:"inline-flex", alignItems:"center", background:"#fef9f0", border:"1px solid #fde68a", borderRadius:20, padding:"4px 12px", fontSize:10, color:"#92400e", fontWeight:800 }}>🔒 ANÓNIMA</div>
                    </div>
                    {sSaved ? (
                      <div style={{ textAlign:"center", padding:"40px 20px" }}><div style={{ fontSize:56, marginBottom:16 }}>🎉</div><div style={{ fontSize:20, fontWeight:900 }}>Obrigada!</div></div>
                    ) : (
                      <div>
                        <div style={{ display:"flex", gap:6, marginBottom:14, overflowX:"auto" }}>
                          {SURVEY_CATS.map(function(sc,i) {
                            var isA=sCatIdx===i; var hasDot=sRatings[sc.id]>0;
                            return (<button key={sc.id} onClick={function(){setSCatIdx(i);}} style={{ display:"flex", alignItems:"center", gap:4, padding:"8px 14px", borderRadius:20, border:"none", background:isA?C:"white", fontSize:11, fontWeight:700, cursor:"pointer", color:isA?"white":"#64748b", whiteSpace:"nowrap", flexShrink:0, boxShadow:isA?"0 4px 12px "+C+"40":"0 1px 4px rgba(0,0,0,0.06)", position:"relative" }}>{sc.icon} {sc.label}{hasDot&&(<span style={{ position:"absolute", top:-2, right:-2, width:8, height:8, borderRadius:"50%", background:"#22c55e", border:"1.5px solid white" }}/>)}</button>);
                          })}
                        </div>
                        <div style={CARD}>
                          <div style={{ fontSize:15, fontWeight:700, marginBottom:16 }}>{currentSurveyCat.q}</div>
                          <div style={{ display:"flex", justifyContent:"space-around", marginBottom:16 }}>
                            {[1,2,3,4,5].map(function(n) {
                              var isSel=sRatings[currentSurveyCat.id]===n;
                              return (<button key={n} onClick={function(){setSRatings(upd(sRatings,currentSurveyCat.id,n));}} style={{ background:"none", border:"none", cursor:"pointer", fontSize:isSel?38:28, opacity:isSel?1:0.35, transform:isSel?"scale(1.2)":"scale(1)" }}>{SEMOJIS[n]}</button>);
                            })}
                          </div>
                          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
                            {currentSurveyCat.chips.map(function(chip) {
                              var isSel=(sChips[currentSurveyCat.id]||[]).includes(chip);
                              return (<button key={chip} onClick={function(){toggleChip(currentSurveyCat.id,chip);}} style={{ padding:"7px 12px", borderRadius:20, border:isSel?"2px solid "+C:"2px solid #e8edf2", background:isSel?C+"15":"white", fontSize:12, cursor:"pointer", fontWeight:isSel?700:500, color:isSel?C:"#64748b" }}>{chip}</button>);
                            })}
                          </div>
                          <div style={{ display:"flex", gap:8 }}>
                            {sCatIdx>0&&(<button onClick={function(){setSCatIdx(sCatIdx-1);}} style={{ flex:1, padding:"11px", borderRadius:14, border:"2px solid #e8edf2", background:"white", fontSize:13, fontWeight:700, cursor:"pointer", color:"#64748b" }}>← Anterior</button>)}
                            {sCatIdx<SURVEY_CATS.length-1&&(<button onClick={function(){setSCatIdx(sCatIdx+1);}} style={{ flex:1, padding:"11px", borderRadius:14, border:"none", background:"linear-gradient(135deg,"+C+","+C+"cc)", color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>Próximo →</button>)}
                          </div>
                        </div>
                        {sCatIdx===SURVEY_CATS.length-1&&(
                          <div style={CARD}>
                            <div style={{ fontSize:14, fontWeight:700, marginBottom:10 }}>💬 O que mudarias no programa?</div>
                            <textarea value={sMudaria} onChange={function(e){setSMudaria(e.target.value);}} placeholder="A tua opinião é anónima..." rows={3} style={{ width:"100%", padding:"12px 14px", borderRadius:14, border:"2px solid #e8edf2", fontSize:13, outline:"none", resize:"none", boxSizing:"border-box", marginBottom:14 }}/>
                            <Btn color={C} onClick={saveSatisf}>Enviar Avaliação →</Btn>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {percTab === "swot" && (
              <div>
                <SubTabs options={[["pessoal","👤 Pessoal"],["pia","📋 PIA"]]} active={swotTab} onChange={setSwotTab} color={C}/>
                {SWOT_Q.map(function(q) {
                  var val=swotState[q.id];
                  return (
                    <div key={q.id} style={Object.assign({},CARD,{borderLeft:val.trim()?"4px solid "+q.color:"4px solid #e8edf2"})}>
                      <div style={{ fontSize:14, fontWeight:800, color:q.color, marginBottom:4 }}>{q.label}</div>
                      <div style={{ fontSize:11, color:"#94a3b8", marginBottom:10 }}>{q.sub}</div>
                      <textarea value={val} onChange={function(e){setSwotState(upd(swotState,q.id,e.target.value));}} placeholder={q.ph} rows={3} style={{ width:"100%", padding:"11px 13px", borderRadius:12, border:"2px solid #e8edf2", fontSize:12, outline:"none", resize:"none", boxSizing:"border-box" }}/>
                    </div>
                  );
                })}
                {swotSaved ? (
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <Btn variant="success" onClick={function(){}}>✓ Guardado{swotShared?" e Partilhado":""}</Btn>
                    {!swotShared&&(<Btn color="#7C3AED" onClick={function(){saveSwot(true);}}>🔗 Partilhar com Teresa</Btn>)}
                  </div>
                ) : (
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <Btn color={C} onClick={function(){saveSwot(false);}}>💾 Guardar só para mim</Btn>
                    <Btn color="#7C3AED" onClick={function(){saveSwot(true);}}>🔗 Guardar e Partilhar</Btn>
                  </div>
                )}
              </div>
            )}

            {percTab === "tasks" && (
              <div>
                <div style={CARD}>
                  <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:12 }}>
                    <div style={{ flex:1 }}><div style={SL}>As tuas Tarefas</div><div style={{ fontSize:12, color:"#64748b" }}>{doneTodos.length} de {acceptedTodos.length} concluídas</div></div>
                    <div style={{ textAlign:"center" }}><div style={{ fontSize:32, fontWeight:900, color:C }}>{todoPercent}%</div><div style={{ fontSize:9, color:"#94a3b8", fontWeight:700 }}>CONCLUÍDO</div></div>
                  </div>
                  <div style={{ background:"#e8edf2", borderRadius:99, height:10, overflow:"hidden" }}><div style={{ background:"linear-gradient(90deg,"+C+","+C+"99)", height:"100%", width:todoPercent+"%", borderRadius:99 }}/></div>
                </div>
                {pendingTeresaTodos.length>0&&(
                  <div style={Object.assign({},CARD,{border:"2px solid #7C3AED30",background:"#faf5ff"})}>
                    <div style={{ fontSize:12, fontWeight:800, color:"#7C3AED", marginBottom:10 }}>📩 {pendingTeresaTodos.length} sugestão(ões) da Teresa</div>
                    {pendingTeresaTodos.map(function(t) {
                      return (
                        <div key={t.id} style={{ padding:"12px 14px", background:"white", borderRadius:14, marginBottom:8, border:"1.5px solid #7C3AED30" }}>
                          <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{t.text}</div>
                          {t.due&&(<div style={{ fontSize:11, color:"#94a3b8", marginBottom:10 }}>📅 Data limite: {fmtDate(t.due)}</div>)}
                          <div style={{ display:"flex", gap:8 }}>
                            <button onClick={function(){acceptTodo(t.id);}} style={{ flex:1, padding:"9px", borderRadius:12, border:"none", background:"#22c55e", color:"white", fontSize:13, fontWeight:700, cursor:"pointer" }}>✓ Aceitar</button>
                            <button onClick={function(){rejectTodo(t.id);}} style={{ flex:1, padding:"9px", borderRadius:12, border:"2px solid #e8edf2", background:"white", color:"#94a3b8", fontSize:13, fontWeight:700, cursor:"pointer" }}>✕ Rejeitar</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={CARD}>
                  <div style={SL}>Por fazer</div>
                  {acceptedTodos.filter(function(t){return !t.done;}).map(function(t) {
                    return (
                      <div key={t.id} onClick={function(){toggleTodoDone(t.id);}} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 0", borderBottom:"1px solid #f1f5f9", cursor:"pointer" }}>
                        <div style={{ width:22, height:22, borderRadius:6, border:"2px solid #e8edf2", background:"white", flexShrink:0, marginTop:2 }}/>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:600 }}>{t.text}</div>
                          <div style={{ display:"flex", gap:8, marginTop:3 }}>
                            {t.due&&(<span style={{ fontSize:10, color:isOverdue(t.due)?"#ef4444":"#94a3b8" }}>📅 {fmtDate(t.due)}{isOverdue(t.due)?" ⚠️":""}</span>)}
                            <span style={{ fontSize:10, color:t.shared?"#22c55e":"#94a3b8" }}>{t.shared?"👁️ partilhada":"🔒 privada"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {acceptedTodos.filter(function(t){return !t.done;}).length===0&&(<div style={{ textAlign:"center", padding:"16px 0", color:"#94a3b8", fontSize:13 }}>Nenhuma tarefa por fazer 🎉</div>)}
                </div>
                {doneTodos.length>0&&(
                  <div style={CARD}>
                    <div style={SL}>Concluídas ✓</div>
                    {doneTodos.map(function(t) {
                      return (
                        <div key={t.id} onClick={function(){toggleTodoDone(t.id);}} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:"1px solid #f1f5f9", cursor:"pointer", opacity:0.6 }}>
                          <div style={{ width:22, height:22, borderRadius:6, background:"#22c55e", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><span style={{ color:"white", fontSize:12, fontWeight:900 }}>✓</span></div>
                          <div style={{ fontSize:13, textDecoration:"line-through", color:"#94a3b8" }}>{t.text}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={CARD}>
                  <div style={SL}>➕ Adicionar Tarefa</div>
                  <input value={newTodo.text} onChange={function(e){setNewTodo(upd(newTodo,"text",e.target.value));}} placeholder="Descrição da tarefa..." style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:8 }}/>
                  <input type="date" value={newTodo.due} onChange={function(e){setNewTodo(upd(newTodo,"due",e.target.value));}} style={{ width:"100%", padding:"10px 12px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:10 }}/>
                  <div onClick={function(){setNewTodo(upd(newTodo,"shared",!newTodo.shared));}} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14, cursor:"pointer" }}>
                    <div style={{ width:22, height:22, borderRadius:6, background:newTodo.shared?C:"#e8edf2", display:"flex", alignItems:"center", justifyContent:"center" }}>{newTodo.shared&&<span style={{ color:"white", fontWeight:900, fontSize:12 }}>✓</span>}</div>
                    <span style={{ fontSize:12, color:"#374151" }}>Partilhar com a Teresa (ela pode ver)</span>
                  </div>
                  <Btn color={C} onClick={addTodoForUser}>Adicionar Tarefa</Btn>
                </div>
                {user.username === "teresa" && (
                  <div style={Object.assign({},CARD,{border:"2px solid #1e293b20"})}>
                    <div style={SL}>📤 Propor Tarefa a Colega</div>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:10 }}>
                      {JEEP_LIST.map(function(j){return(<button key={j.name} onClick={function(){setTeresaTodoTarget(j.username);}} style={{ padding:"5px 12px", borderRadius:20, border:teresaTodoTarget===j.username?"2px solid "+j.color:"2px solid #e8edf2", background:teresaTodoTarget===j.username?j.color+"15":"white", fontSize:11, fontWeight:700, cursor:"pointer", color:teresaTodoTarget===j.username?j.color:"#64748b" }}>{j.name}</button>);})}
                    </div>
                    <input value={teresaTodoTxt} onChange={function(e){setTeresaTodoTxt(e.target.value);}} placeholder="Descrição da tarefa..." style={{ width:"100%", padding:"10px 12px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:8 }}/>
                    <input type="date" value={teresaTodoDue} onChange={function(e){setTeresaTodoDue(e.target.value);}} style={{ width:"100%", padding:"9px 12px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:10 }}/>
                    <Btn color="#1e293b" onClick={addTeresaTodo}>Enviar Sugestão →</Btn>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── PERFIL ── */}
        {tab === "perfil" && (
          <div style={{ padding:"18px 16px" }}>
            <SubTabs options={[["roda","🌸 Roda"],["agenda","📅 Agenda"],["hist","📊 Hist."],["cap","💌 Cápsula"],["export","📤 Exportar"]]} active={perfilTab} onChange={setPerfilTab} color={C}/>

            {perfilTab === "roda" && (
              <div>
                <div style={CARD}>
                  <div style={SL}>Roda da Vida — {nowLabel()}</div>
                  <RadarChart scores={roda} color={C} prev={lastSave?lastSave.scores:null}/>
                  {lastSave&&(<div style={{ textAlign:"center", fontSize:11, color:"#94a3b8", marginTop:6 }}>linha tracejada: {lastSave.label}</div>)}
                </div>
                {RODA_DIMS.map(function(dim) {
                  var v=roda[dim.id]; var isExp=rodaExp===dim.id;
                  return (
                    <div key={dim.id} style={Object.assign({},CARD,{padding:"14px 16px"})}>
                      <div onClick={function(){setRodaExp(isExp?null:dim.id);}} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
                        <span style={{ fontSize:20 }}>{dim.icon}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:700 }}>{dim.label}</div>
                          <div style={{ background:"#e8edf2", borderRadius:99, height:6, marginTop:4, overflow:"hidden" }}><div style={{ background:"linear-gradient(90deg,"+C+","+C+"99)", height:"100%", width:(v*10)+"%", borderRadius:99 }}/></div>
                        </div>
                        <div style={{ fontSize:22, fontWeight:900, color:C }}>{v}</div>
                      </div>
                      {isExp&&(
                        <div style={{ marginTop:12 }}>
                          <div style={{ fontSize:12, color:"#64748b", lineHeight:1.6, marginBottom:10, padding:"8px 10px", background:"#f8fafc", borderRadius:10 }}>{dim.desc}</div>
                          <input type="range" min={0} max={10} value={v} onChange={function(e){setRoda(upd(roda,dim.id,Number(e.target.value)));}} style={{ width:"100%", accentColor:C, cursor:"pointer" }}/>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <Btn color={C} onClick={function(){saveRoda(false);}}>💾 Guardar só para mim</Btn>
                  <Btn color="#7C3AED" onClick={function(){saveRoda(true);}}>🔗 Guardar e Partilhar</Btn>
                </div>
              </div>
            )}

            {perfilTab === "agenda" && (
              <div>
                {user.username === "teresa" ? (
                  <div style={CARD}>
                    <div style={SL}>➕ Adicionar Evento</div>
                    <input value={teresaEvt.title} onChange={function(e){setTeresaEvt(upd(teresaEvt,"title",e.target.value));}} placeholder="Título do evento..." style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:8 }}/>
                    <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                      <input type="date" value={teresaEvt.date} onChange={function(e){setTeresaEvt(upd(teresaEvt,"date",e.target.value));}} style={{ flex:1, padding:"10px 12px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none" }}/>
                      <input type="time" value={teresaEvt.time} onChange={function(e){setTeresaEvt(upd(teresaEvt,"time",e.target.value));}} style={{ width:90, padding:"10px 12px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none" }}/>
                    </div>
                    <select value={teresaEvt.userId} onChange={function(e){setTeresaEvt(upd(teresaEvt,"userId",e.target.value));}} style={{ width:"100%", padding:"10px 12px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none", marginBottom:8 }}>
                      <option value="all">Todos</option>
                      {JEEP_LIST.map(function(j){return(<option key={j.username} value={j.username}>{j.name}</option>);})}
                    </select>
                    <Btn color={C} onClick={addTeresaEvent}>Adicionar Evento</Btn>
                  </div>
                ) : (
                  <div style={CARD}>
                    <div style={SL}>➕ Adicionar Evento Pessoal</div>
                    <input value={newEvt.title} onChange={function(e){setNewEvt(upd(newEvt,"title",e.target.value));}} placeholder="Título..." style={{ width:"100%", padding:"11px 14px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none", boxSizing:"border-box", marginBottom:8 }}/>
                    <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                      <input type="date" value={newEvt.date} onChange={function(e){setNewEvt(upd(newEvt,"date",e.target.value));}} style={{ flex:1, padding:"10px 12px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none" }}/>
                      <input type="time" value={newEvt.time} onChange={function(e){setNewEvt(upd(newEvt,"time",e.target.value));}} style={{ width:90, padding:"10px 12px", borderRadius:12, border:"2px solid #e8edf2", fontSize:13, outline:"none" }}/>
                    </div>
                    <div onClick={function(){setNewEvt(upd(newEvt,"shareWithTeresa",!newEvt.shareWithTeresa));}} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, cursor:"pointer" }}>
                      <div style={{ width:20, height:20, borderRadius:6, background:newEvt.shareWithTeresa?"#7C3AED":"#e8edf2", display:"flex", alignItems:"center", justifyContent:"center" }}>{newEvt.shareWithTeresa&&<span style={{ color:"white", fontWeight:900, fontSize:11 }}>✓</span>}</div>
                      <span style={{ fontSize:12, color:"#374151" }}>Partilhar com a Teresa</span>
                    </div>
                    <Btn color={C} onClick={addPersonalEvent}>Adicionar</Btn>
                  </div>
                )}
                {userEvents.length===0 ? (
                  <div style={{ textAlign:"center", padding:"40px 20px", color:"#94a3b8" }}><div style={{ fontSize:40 }}>📭</div><div style={{ marginTop:10, fontSize:13 }}>Sem eventos agendados.</div></div>
                ) : (
                  userEvents.map(function(e) {
                    var col=EVT_COLORS[e.type]||"#94a3b8"; var isGroup=e.userId==="all";
                    return (
                      <div key={e.id} style={Object.assign({},CARD,{borderLeft:"4px solid "+col})}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <span style={{ fontSize:24 }}>{EVT_ICONS[e.type]}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:14, fontWeight:700 }}>{e.title}</div>
                            <div style={{ fontSize:12, color:"#94a3b8", marginTop:3 }}>{fmtDate(e.date)}{e.time?" · "+e.time:""}
                              {isGroup&&(<span style={{ marginLeft:8, background:"#2563EB15", color:"#2563EB", fontWeight:700, padding:"1px 8px", borderRadius:8, fontSize:10 }}>grupo</span>)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {perfilTab === "hist" && (
              <div>
                {rodaSaves.length===0 ? (
                  <div style={{ textAlign:"center", padding:"40px 20px", color:"#94a3b8" }}><div style={{ fontSize:40 }}>📭</div><div style={{ marginTop:10, fontSize:13 }}>Ainda não guardaste nenhuma roda.</div></div>
                ) : (
                  rodaSaves.slice().reverse().map(function(sv,i) {
                    return (
                      <div key={i} style={CARD}>
                        <div style={SL}>{sv.label}</div>
                        <RadarChart scores={sv.scores} color={C} prev={null}/>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:10 }}>
                          {RODA_DIMS.map(function(dim){return(<div key={dim.id} style={{ display:"flex", alignItems:"center", gap:4, background:"#f8fafc", borderRadius:8, padding:"4px 10px" }}><span style={{ fontSize:12 }}>{dim.icon}</span><span style={{ fontSize:12, fontWeight:700, color:C }}>{sv.scores[dim.id]}</span></div>);})}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {perfilTab === "cap" && (
              <div>
                <div style={{ background:"linear-gradient(135deg,#1e293b,#0f172a)", borderRadius:20, padding:22, marginBottom:14 }}>
                  <div style={{ fontSize:17, fontWeight:900, color:"white", marginBottom:8 }}>💌 Cápsula do Tempo</div>
                  <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.7 }}>Escreve uma mensagem para ti daqui a 3 meses. Só tu vais poder ler.</div>
                </div>
                {!cap.locked ? (
                  <div style={CARD}>
                    <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>Querido/a {dispName} do futuro...</div>
                    <textarea value={cap.text} onChange={function(e){setCap(upd(cap,"text",e.target.value));}} placeholder="Como estás hoje? O que esperas? O que queres mudar?" rows={6} style={{ width:"100%", padding:"12px 14px", borderRadius:14, border:"2px solid #e8edf2", fontSize:13, outline:"none", resize:"none", boxSizing:"border-box", marginBottom:14 }}/>
                    <Btn color={C} onClick={sealCapsule}>🔒 Selar Cápsula</Btn>
                  </div>
                ) : !cap.revealed ? (
                  <div style={{ textAlign:"center", padding:"40px 20px" }}>
                    <div style={{ fontSize:64, marginBottom:14 }}>🔒</div>
                    <div style={{ fontSize:18, fontWeight:900 }}>Cápsula selada</div>
                    <div style={{ fontSize:14, color:"#64748b", marginTop:8, marginBottom:28 }}>Abrir em <strong>{cap.lockedDate}</strong></div>
                    <Btn color={C} onClick={openCapsule}>Abrir mesmo assim →</Btn>
                  </div>
                ) : (
                  <div style={Object.assign({},CARD,{background:"linear-gradient(135deg,#fef9f0,#fffbeb)",border:"2px solid #fde68a"})}>
                    <div style={{ fontSize:14, fontWeight:800, color:"#92400e", marginBottom:14 }}>💌 Mensagem do teu passado:</div>
                    <div style={{ fontSize:14, color:"#374151", lineHeight:1.8, fontStyle:"italic" }}>{cap.text}</div>
                    <div style={{ marginTop:20 }}><Btn color={C} onClick={resetCapsule}>Escrever Nova Cápsula</Btn></div>
                  </div>
                )}
              </div>
            )}

            {perfilTab === "export" && (
              <div>
                <div style={{ background:"linear-gradient(135deg,#1e293b,#0f172a)", borderRadius:20, padding:22, marginBottom:14 }}>
                  <div style={{ fontSize:17, fontWeight:900, color:"white", marginBottom:8 }}>📤 Exportar os Meus Dados</div>
                  <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.7 }}>Tens sempre o direito de aceder e descarregar os teus dados pessoais. O ficheiro JSON inclui o teu PIA, Roda da Vida, autoavaliações, tarefas e SWOT.</div>
                </div>
                <div style={CARD}>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:10 }}>O que está incluído:</div>
                  {["PIA e atividades","Roda da Vida (histórico completo)","Autoavaliação das 6 dimensões","Tarefas (pessoais e partilhadas)","Análise SWOT pessoal e PIA"].map(function(item) {
                    return (<div key={item} style={{ display:"flex", gap:8, padding:"7px 0", borderBottom:"1px solid #f1f5f9", fontSize:13, color:"#374151" }}><span style={{ color:"#22c55e", fontWeight:700 }}>✓</span>{item}</div>);
                  })}
                  <div style={{ marginTop:16 }}><Btn color={C} onClick={doExport}>⬇️ Descarregar os Meus Dados</Btn></div>
                </div>
                <div style={Object.assign({},CARD,{background:"#fef9f0",border:"1.5px solid #fde68a"})}>
                  <div style={{ fontSize:12, color:"#92400e", lineHeight:1.7 }}>Para pedidos de correção ou eliminação dos teus dados, contacta: <strong>teresa.castro@cm-cascais.pt</strong></div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:420, background:"white", borderTop:"1px solid #e8edf2", display:"flex", padding:"8px 0 20px", boxShadow:"0 -4px 20px rgba(15,23,42,0.08)", zIndex:100 }}>
        {TABS.map(function(t) {
          var isA=tab===t.id; var hasBadge=t.id==="home"&&pendingItems.length>0;
          return (
            <button key={t.id} onClick={function(){setTab(t.id);}} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"none", border:"none", cursor:"pointer", padding:"6px 0", position:"relative" }}>
              <span style={{ fontSize:20 }}>{t.icon}</span>
              <span style={{ fontSize:9, fontWeight:700, color:isA?C:"#94a3b8" }}>{t.label}</span>
              {isA&&(<div style={{ position:"absolute", bottom:0, width:20, height:3, background:C, borderRadius:99 }}/>)}
              {hasBadge&&(<div style={{ position:"absolute", top:2, right:"18%", width:16, height:16, borderRadius:"50%", background:"#ef4444", color:"white", fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid white" }}>{pendingItems.length}</div>)}
            </button>
          );
        })}
      </div>
    </div>
  );
}