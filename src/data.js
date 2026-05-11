export function upd(obj, key, val) { let r = Object.assign({}, obj); r[key] = val; return r; }
export function scoreLabel(v) {
  if (v <= 2) return ["Insuficiente","#ef4444"];
  if (v <= 4) return ["Abaixo do esperado","#f97316"];
  if (v === 5) return ["Suficiente","#eab308"];
  if (v <= 7) return ["Bom","#3b82f6"];
  if (v <= 9) return ["Muito Bom","#a855f7"];
  return ["Excelente","#22d3ee"];
}
export function getDimDesc(dim, v) {
  if (v <= 2) return dim.s.a; if (v <= 4) return dim.s.b; if (v === 5) return dim.s.c;
  if (v <= 7) return dim.s.d; if (v <= 9) return dim.s.e; return dim.s.f;
}
export const MTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
export function nowLabel() { let d = new Date(); return MTHS[d.getMonth()] + " " + d.getFullYear(); }
export function fmtDate(s) {
  if (!s) return ""; let p = s.split("-"); if (p.length < 3) return s;
  return p[2] + " " + MTHS[parseInt(p[1], 10) - 1];
}
export function isOverdue(s) { return !s ? false : new Date(s) < new Date(); }
export function getWeekKey() {
  let d = new Date(), jan1 = new Date(d.getFullYear(),0,1);
  let wk = Math.ceil(((d-jan1)/86400000+jan1.getDay()+1)/7);
  return d.getFullYear()+"-W"+wk;
}

export const ALLOWED_USERNAMES = ["nilton","erick","jucilina","carina","rudmilo","bruno","salimo","teresa","ricardo"];
export const SPECIAL_USERS = ["teresa","ricardo"];
export const USERS = [
  { username:"nilton",   realName:"Nilton",   color:"#22d3ee" },
  { username:"erick",    realName:"Erick",    color:"#f472b6" },
  { username:"jucilina", realName:"Jucilina", color:"#a855f7" },
  { username:"carina",   realName:"Carina",   color:"#4ade80" },
  { username:"rudmilo",  realName:"Rudmilo",  color:"#fbbf24" },
  { username:"bruno",    realName:"Bruno",    color:"#60a5fa" },
  { username:"salimo",   realName:"Salimo",   color:"#f87171" },
  { username:"teresa",   realName:"Teresa",   color:"#e2e8f0" },
  { username:"ricardo",  realName:"Ricardo",  color:"#2dd4bf" },
];

export const JEEP_LIST = [
  { name:"Nilton",   username:"nilton",   color:"#22d3ee", entidade:"", estado:"verde" },
  { name:"Erick",    username:"erick",    color:"#f472b6", entidade:"", estado:"verde" },
  { name:"Jucilina", username:"jucilina", color:"#a855f7", entidade:"", estado:"verde" },
  { name:"Carina",   username:"carina",   color:"#4ade80", entidade:"", estado:"verde" },
  { name:"Rudmilo",  username:"rudmilo",  color:"#fbbf24", entidade:"", estado:"verde" },
  { name:"Bruno",    username:"bruno",    color:"#60a5fa", entidade:"", estado:"verde" },
  { name:"Salimo",   username:"salimo",   color:"#f87171", entidade:"", estado:"verde" },
  { name:"Teresa",   username:"teresa",   color:"#e2e8f0", entidade:"(teste)", estado:"verde" },
  { name:"Ricardo",  username:"ricardo",  color:"#2dd4bf", entidade:"(teste)", estado:"verde" },
];

export const DIMS = [
  { id:"D1", label:"Comunicação e Relação", desc:"Comunica de forma clara e respeitosa. Pede ajuda e lida bem com críticas.", s:{ a:"Dificuldade extrema.", b:"Evito conversas difíceis.", c:"Comunico o básico sem problemas.", d:"Adapto a minha comunicação. Trabalho bem em equipa.", e:"Comunico muito bem mesmo em tensão.", f:"Sou uma referência na comunicação." } },
  { id:"D2", label:"Resiliência e Adaptação", desc:"Enfrenta dificuldades e stress. Controla a frustração e adapta-se a imprevistos.", s:{ a:"Bloqueio e desisto.", b:"O stress afeta o meu trabalho.", c:"Mantenho-me estável no dia a dia.", d:"Mantenho a calma nos imprevistos.", e:"Lido muito bem com a pressão.", f:"Sou um pilar de calma na equipa." } },
  { id:"D3", label:"Autonomia e Proatividade", desc:"Trabalha de forma independente. Antecipa tarefas e tem iniciativa.", s:{ a:"Preciso de ordens para tudo.", b:"Faço o que pedem, sem iniciativa.", c:"Sou autónomo nas tarefas habituais.", d:"Tomo iniciativa frequentemente.", e:"Antecipo quase sempre o que é preciso.", f:"A minha iniciativa muda o espaço." } },
  { id:"D4", label:"Autoconhecimento", desc:"Reconhece competências e limitações. Tem objetivos claros.", s:{ a:"Não tenho objetivos nenhuns.", b:"Custa-me admitir falhas.", c:"Sei o que tenho de melhorar.", d:"Tenho objetivos concretos e plano.", e:"Reflito e adapto o meu projeto de vida.", f:"Autoconhecimento muito maduro." } },
  { id:"D5", label:"Competências Digitais", desc:"Usa a tecnologia de forma útil e navega processos burocráticos.", s:{ a:"Não percebo nada de tecnologia.", b:"Uso com muita dificuldade.", c:"Uso o básico no dia a dia.", d:"Uso bem no trabalho e sou autónomo.", e:"Uso de forma proativa para inovar.", f:"Sou o 'técnico' de salvação da equipa." } },
  { id:"D6", label:"Qualidade da Intervenção", desc:"Cria atividades adequadas e respeita as regras da entidade.", s:{ a:"Não me adapto às regras.", b:"As minhas atividades correm mal.", c:"Faço o básico adequadamente.", d:"Faço atividades muito boas.", e:"O meu trabalho tem muito impacto.", f:"A qualidade do meu trabalho é excecional." } }
];

export const RODA_DIMS = [
  { id:"familia",  label:"Família",             icon:"🏠", desc:"Como te sentes nas relações com a tua família?" },
  { id:"amigos",   label:"Amigos",              icon:"👥", desc:"Tens amizades que te fazem bem?" },
  { id:"dinheiro", label:"Dinheiro",            icon:"💰", desc:"Como está a tua situação financeira?" },
  { id:"trabalho", label:"Trabalho",            icon:"💼", desc:"Como te sentes no local de colocação?" },
  { id:"cresc",    label:"Crescimento Pessoal", icon:"🌱", desc:"Estás a aprender coisas novas? Sentes que evoluís?" },
  { id:"saude",    label:"Saúde",               icon:"❤️", desc:"Como está a tua saúde física e mental?" },
  { id:"lazer",    label:"Lazer",               icon:"🎉", desc:"Tens tempo para ti? Fazes atividades que te dão prazer?" },
];

export const CHANNELS = [
  { id:"csi",       icon:"🔍", label:"CSI Ludotecas",      desc:"Problemas no trabalho e apoio." },
  { id:"monitor",   icon:"🏆", label:"Super Monitor",      desc:"Partilha de vitórias diárias." },
  { id:"olx",       icon:"📦", label:"OLX EDUCA+",         desc:"Pedido e partilha de materiais." },
  { id:"orienta",   icon:"🧭", label:"Orienta-te",         desc:"Dicas de emprego e futuro." },
  { id:"backstage", icon:"🎬", label:"Backstage",          desc:"Work in progress dos PIAs." },
  { id:"coffee",    icon:"☕", label:"Coffee Break",       desc:"Recreio dos grandes." },
];

export const SURVEY_CATS = [
  { id:"ludoteca", icon:"🏢", label:"A tua Ludoteca",   q:"Como te sentes no teu local de trabalho?",                chips:["Boa equipa 🤝","Aprendo muito 📚","Sinto-me útil 💡","Boa energia ✨","Difícil integração 😓","Pouco apoio ⚡","Rotina chata 😐"] },
  { id:"teresa",   icon:"📞", label:"Apoio da Câmara",  q:"Sentes que a Teresa tem estado presente quando precisas?", chips:["Disponível quando preciso ✓","Reuniões úteis 🗓️","Bom acompanhamento 👍","Sinto-me apoiado/a 🤗","Difícil de contactar 📵","Preciso de mais apoio"] },
  { id:"equipa",   icon:"👥", label:"A tua Equipa",     q:"Sentes que a equipa do local te apoia?",                  chips:["Somos um bom grupo 💪","Aprendo com eles 🎓","Integrado/a ✨","Boa comunicação 📢","Há conflitos 😬","Sinto-me de fora 😔"] },
  { id:"geral",    icon:"⭐", label:"Satisfação Geral", q:"No geral, como estás a sentir o programa?",               chips:["Melhor do que esperava 🚀","Está a correr bem ✓","Estou a aprender 📚","Difícil mas vale a pena 💪","Podia ser melhor 🤔"] },
];

export const QUIZZES = [
  { id:"q1", title:"Dilema da Autonomia", badge:"D3 — Proatividade",
    scenario:"O Coordenador pediu-te para organizares os materiais de uma sala, mas teve de sair de urgência. O que fazes?",
    opts:[{ id:"A", text:"Faço tudo à minha maneira.", reveal:"Muita autonomia — mas risco de retrabalho." },
          { id:"B", text:"Paro e vou fazer outra tarefa até ele voltar.", reveal:"Respeito pela hierarquia — mas falta de iniciativa." },
          { id:"C", text:"Arrumo uma prateleira, tiro foto e mando WhatsApp.", reveal:"Iniciativa + comunicação proativa. A mais equilibrada." }], mock:{ A:28, B:15, C:57 } },
];

export const SWOT_Q = [
  { id:"forcas",    label:"💪 Forças",        sub:"O que faço bem no trabalho",      color:"#4ade80", ph:"Ex: Sou criativo/a, comunico bem..." },
  { id:"fraquezas", label:"⚠️ Fraquezas",     sub:"O que ainda preciso de melhorar", color:"#fb923c", ph:"Ex: Tenho dificuldade em pedir ajuda..." },
  { id:"oprtns",    label:"🌟 Oportunidades", sub:"O que posso aproveitar no PIA",   color:"#60a5fa", ph:"Ex: A Ludoteca tem espaço exterior..." },
  { id:"riscos",    label:"🚧 Riscos",        sub:"O que pode fazer o PIA falhar",   color:"#f87171", ph:"Ex: Falta de materiais, agenda cheia..." },
];

export const ALL_MEDALS = [
  { id:"proativo",    icon:"🎯", label:"Proatividade",       desc:"Agiu por iniciativa própria" },
  { id:"equipa",      icon:"🤝", label:"Espírito de Equipa", desc:"Apoiou os colegas de forma notável" },
  { id:"criativo",    icon:"💡", label:"Criatividade",       desc:"Propôs ou executou uma ideia original" },
  { id:"destaque",    icon:"⭐", label:"Destaque da Semana", desc:"Momento especial reconhecido pela GO" },
  { id:"pia",         icon:"📋", label:"PIA Completo",       desc:"Completou o Plano Individual de Ação" },
  { id:"evolucao",    icon:"📈", label:"Evolução",           desc:"Progresso notável desde o início" },
];

export const PIA_FIELDS = [
  { key:"oQue",     title:"O QUÊ",    icon:"🎯", hint:"Título e natureza do projeto",   ph:"Que projeto ou atividade quero desenvolver?" },
  { key:"paraQue",  title:"PARA QUÊ", icon:"🏁", hint:"Objetivo global",               ph:"Qual é o propósito? O que vai mudar?" },
  { key:"quanto",   title:"QUANTO",   icon:"📊", hint:"Volume e frequência",            ph:"Quantas sessões? Com que frequência?" },
  { key:"onde",     title:"ONDE",     icon:"📍", hint:"Local e contexto",              ph:"Onde vai acontecer? Com que grupo?" },
  { key:"recursos", title:"RECURSOS", icon:"🧰", hint:"O que é necessário",            ph:"Materiais, pessoas, espaços." },
  { key:"comoSaber",title:"COMO SABER SE CORREU BEM", icon:"📏", hint:"Critérios de avaliação", ph:"O que vai ser diferente? Como vou medir?" },
];

export const COMPL = ["Esta semana aprendi que...","A maior dificuldade foi...","Surpreendi-me quando...","Da próxima vez vou...","Orgulhei-me quando..."];
export const MOODS = ["😴","😟","😐","🙂","😄","🔥"];
export const SEMOJIS = ["","😞","😕","😐","🙂","😄"];
export const FORUM_REACTIONS = [{ id:"heart", icon:"❤️" }, { id:"fire", icon:"🔥" }, { id:"clap", icon:"👏" }, { id:"think", icon:"🤔" }];
export const EVT_COLORS = { visit:"#22d3ee", group:"#f472b6", reminder:"#fbbf24", personal:"#4ade80" };
export const EVT_ICONS  = { visit:"🏢",      group:"👥",      reminder:"🔔",      personal:"📌" };
export const EC = { verde:"#4ade80", amarelo:"#fbbf24", vermelho:"#f87171" };

export const DEF_PIA   = { oQue:"",paraQue:"",quanto:"",onde:"",recursos:"",comoSaber:"" };
export const DEF_ACTS  = [{ oQue:"",quando:"",obj:"" },{ oQue:"",quando:"",obj:"" },{ oQue:"",quando:"",obj:"" },{ oQue:"",quando:"",obj:"" }];
export const DEF_RODA  = { familia:5,amigos:5,dinheiro:5,trabalho:5,cresc:5,saude:5,lazer:5 };
export const DEF_DSCORES = { D1:5,D2:5,D3:5,D4:5,D5:5,D6:5 };
export const DEF_DNOTAS  = { D1:"",D2:"",D3:"",D4:"",D5:"",D6:"" };
export const DEF_SWOT  = { forcas:"",fraquezas:"",oprtns:"",riscos:"" };
export const DEF_CAP   = { text:"",locked:false,revealed:false,lockedDate:"" };

export const GDPR_TEXT = "Os dados recolhidos nesta plataforma destinam-se exclusivamente ao acompanhamento do Programa JEEP EDUCA+ pela Câmara Municipal de Cascais. Os teus dados pessoais serão tratados de forma confidencial. Não serão partilhados com terceiros sem o teu consentimento. O armazenamento cumpre o RGPD.";
