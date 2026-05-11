export function upd(obj, key, val) { let r = Object.assign({}, obj); r[key] = val; return r; }
export function scoreLabel(v) {
  if (v <= 2) return ["Insuficiente","#f43f5e"];
  if (v <= 4) return ["Abaixo do esperado","#fb923c"];
  if (v === 5) return ["Suficiente","#fbbf24"];
  if (v <= 7) return ["Bom","#60a5fa"];
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
  { id:"D1", label:"Comunicação, Assertividade e Relação em Equipa", desc:"Comunica de forma clara, adequada e adaptada às diferentes pessoas, ouve o outro e mantem ambiente de respeito. Colabora e partilha responsabilidades.", s:{ a:"Tenho muita dificuldade em comunicar. Evito pedir ajuda e receber feedback.", b:"Às vezes comunico mal ou evito conversas difíceis. Prefiro trabalhar sozinho.", c:"Consigo comunicar no dia a dia. Respeito a equipa. Aceito feedback com algum esforço.", d:"Adapto a comunicação a quem me ouve. Trabalho bem em equipa e recebo feedback tranquilamente.", e:"Comunico bem mesmo em situações difíceis. Apoio os colegas e melhoro com o feedback.", f:"Sou uma referência na equipa. Ajudo a resolver tensões e apoio todos." } },
  { id:"D2", label:"Resiliência, Gestão da Frustração e Adaptação", desc:"Enfrenta dificuldades e stress com maturidade. Controla a frustração perante imprevistos e mantém a calma.", s:{ a:"Quando as coisas correm mal, bloqueio, desisto ou fico muito agitado.", b:"As dificuldades afetam demasiado o meu espírito e o meu trabalho.", c:"Mantenho-me estável na maioria das situações. Fico desconfortável com imprevistos mas continuo.", d:"Mantenho a calma e encontro soluções. Não desisto à primeira.", e:"Lido bem com situações difíceis, focado e encontrando alternativas.", f:"Sou referência de calma. Transformo problemas em oportunidades de crescimento." } },
  { id:"D3", label:"Autonomia, Proatividade e Cumprimento de Tarefas", desc:"Trabalha de forma independente e antecipa necessidades. Age por iniciativa própria e cumpre compromissos.", s:{ a:"Preciso que me digam sempre o que fazer. Não tenho iniciativa.", b:"Faço o que me pedem mas não costumo agir por conta própria.", c:"Sou autónomo nas tarefas habituais e cumpro o que prometo.", d:"Antecipio o que precisa de ser feito sem que me peçam.", e:"Proponho, tomo iniciativa e cumpro com rigor.", f:"A minha iniciativa faz a diferença no espaço. Proponho e executo com total autonomia." } },
  { id:"D4", label:"Autoconhecimento, Autocrítica e Clareza de Objetivos", desc:"Autorreflexão para reconhecer competências e falhas. Define metas concretas e exequíveis para o futuro.", s:{ a:"Não penso muito no que faço bem ou mal. Não tenho objetivos claros.", b:"Tenho noção das limitações mas custa admiti-las. Ideias vagas para o futuro.", c:"Sei o que faço bem e o que melhorar. Tenho alguns objetivos.", d:"Conheço bem as minhas competências. Defino objetivos concretos e melhoro com as falhas.", e:"Reflito regularmente. Tenho um projeto de vida concreto e trabalho nele.", f:"Autoconhecimento profundo que guia as minhas decisões e relações." } },
  { id:"D5", label:"Competências Digitais e Autonomia Administrativa", desc:"Domínio de ferramentas digitais e gestão burocrática. Literacia digital aplicada ao quotidiano e trabalho.", s:{ a:"Muita dificuldade com tecnologia e burocracia básica.", b:"Uso algumas ferramentas mas com dificuldade e ajuda frequente.", c:"Uso ferramentas digitais básicas e trato de assuntos simples sozinho.", d:"Uso bem a tecnologia no trabalho. Sou autónomo em processos burocráticos.", e:"Uso a tecnologia de forma proativa para melhorar o trabalho. Ajudo outros.", f:"Literacia digital que faz a diferença. Resolvo situações complexas para a equipa." } },
  { id:"D6", label:"Qualidade da Intervenção e Conhecimentos Profissionais", desc:"Conceção e dinamização de atividades ajustadas ao grupo. Postura profissional e alinhamento com a missão.", s:{ a:"Muita dificuldade em fazer atividades adequadas. Não conheço o meu papel.", b:"Atividades ainda pouco ajustadas. Postura profissional inconsistente.", c:"Faço atividades básicas adaptadas. Cumpro regras e percebo o meu papel.", d:"Atividades boas e postura adequada. Identifico-me com os objetivos do espaço.", e:"Atividades com impacto real. Postura profissional de excelência.", f:"O meu trabalho tem impacto duradouro no grupo. Sou referência na conceção de atividades." } }
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
  { id:"csi",       icon:"🔍", label:"CSI Ludotecas",      desc:"Para expores problemas no trabalho e procurares apoio dos outros." },
  { id:"monitor",   icon:"🏆", label:"Super Monitor",      desc:"Para partilhares vitórias diárias no trabalho." },
  { id:"olx",       icon:"📦", label:"OLX EDUCA+",         desc:"Para pedido e partilha de materiais e ajuda." },
  { id:"orienta",   icon:"🧭", label:"Orienta-te",         desc:"Para pensar no futuro, dicas de emprego, o que estás a aprender." },
  { id:"backstage", icon:"🎬", label:"Backstage",          desc:"Work in progress dos teus PIAs e atividades no terreno." },
  { id:"coffee",    icon:"☕", label:"Coffee Break",       desc:"Recreio dos grandes — proibido falar de trabalho." },
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
  { id:"q2", title:"O Desafio do PIA", badge:"D6 — Intervenção",
    scenario:"Preparaste uma atividade incrível. Mas os jovens dizem que estão com preguiça. Como dás a volta?",
    opts:[{ id:"A", text:"Sento-me com eles, crio ligação, depois puxo-os.", reveal:"Relação primeiro — boa estratégia." },
          { id:"B", text:"Relembro as regras e dou-lhes a escolher.", reveal:"Limites claros — pode criar resistência." },
          { id:"C", text:"Pergunto o que mudariam e adapto na hora.", reveal:"Cocriação — a forma mais genuína." }], mock:{ A:35, B:22, C:43 } },
];

export const SWOT_Q = [
  { id:"forcas",    label:"💪 Forças",        sub:"O que o projeto tem de bom",      color:"#4ade80", ph:"Ex: Tenho os materiais todos..." },
  { id:"fraquezas", label:"⚠️ Fraquezas",     sub:"O que pode falhar no projeto",    color:"#fb923c", ph:"Ex: O tempo é pouco..." },
  { id:"oprtns",    label:"🌟 Oportunidades", sub:"O que o local oferece de extra",  color:"#60a5fa", ph:"Ex: Há um jardim para usar..." },
  { id:"riscos",    label:"🚧 Riscos",        sub:"Ameaças externas ao plano",      color:"#f87171", ph:"Ex: Pode chover no dia..." },
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
