export function upd(obj, key, val) { let r = Object.assign({}, obj); r[key] = val; return r; }
export function scoreLabel(v) {
  if (v <= 2) return ["Insuficiente","#f43f5e"];
  if (v <= 4) return ["Abaixo do esperado","#fb923c"];
  if (v === 5) return ["Suficiente","#fbbf24"];
  if (v <= 7) return ["Bom","#60a5fa"];
  if (v <= 9) return ["Muito Bom","#a855f7"];
  return ["Excelente","#22d3ee"];
}

// ── REGRA DE OURO: Mapear nota (1-10) para o texto certo (a-f) ──
export function getDimDesc(dim, v) {
  if (v <= 2) return dim.s.a; // 1-2
  if (v <= 4) return dim.s.b; // 3-4
  if (v === 5) return dim.s.c; // 5
  if (v <= 7) return dim.s.d; // 6-7
  if (v <= 9) return dim.s.e; // 8-9
  return dim.s.f; // 10
}

export const EVT_COLORS = { 
  "formacao": "#a855f7", 
  "reuniao": "#22d3ee", 
  "evento": "#f472b6", 
  "outro": "#94a3b8" 
};

export const EVT_ICONS = { 
  "formacao": "🎓", 
  "reuniao": "👥", 
  "evento": "🎉", 
  "outro": "📌" 
};

export const SEMOJIS = ["", "😟", "😐", "🙂", "😊", "🤩"];

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
  { 
    id:"D1", 
    label:"Comunicação, Assertividade e Relação em Equipa", 
    desc:"Comunica de forma clara, adequada e adaptada às diferentes pessoas, ouve o outro e mantem ambiente de respeito. Colabora e partilha responsabilidades.", 
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
    desc:"Enfrenta dificuldades e stress com maturidade, sem desistir à primeira tentativa. Controla a frustração quando as situações não correm como planeado.", 
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
    desc:"Trabalha de forma independente e antecipa as necessidades do local. Identifica tarefas que precisam de ser feitas e age por iniciativa própria.", 
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
    desc:"Autorreflexão e maturidade para reconhecer as suas competências e limitações. Honestidade com que assume as falhas e define metas para o futuro.", 
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
    desc:"Domínio de ferramentas digitais e gestão das exigências práticas do quotidiano. Capacidade de recorrer à tecnologia de forma útil.", 
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
    desc:"Capacidade de conceção e dinamização de atividades relevantes e ajustadas. Adequação da postura profissional e respeito pelas regras.", 
    s:{ 
      a:"Tenho muita dificuldade em fazer atividades adequadas para o grupo. Não me identifico com as regras e rotinas do espaço e não tenho clareza sobre o meu papel aqui.", 
      b:"As atividades que faço ainda não estão bem ajustadas ao grupo. A minha postura profissional é inconsistente e tenho dificuldade em corresponder ao que é esperado.", 
      c:"Consigo fazer atividades básicas adaptadas ao grupo. Cumpro as regras e rotinas e percebo o que é esperado de mim.", 
      d:"Faço atividades adaptadas ao grupo e às suas necessidades. Tenho uma postura profissional adequada e identifico-me com os objetivos do espaço.", 
      e:"As atividades que faço têm impacto real no grupo e reflito sobre como melhorá-las. Tenho uma postura profissional que me orgulha e vou além do que é apenas esperado.", 
      f:"A qualidade do meu trabalho tem impacto real e duradouro no grupo. Sou uma referência para a equipa na conceção de atividades e a minha presença faz diferença no espaço." 
    } 
  }
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
  { id:"csi",       icon:"🔍", label:"CSI Ludotecas",      desc:"A tua linha de apoio 24/7 com a Teresa. Usa este canal para expores desafios e procurares soluções." },
  { id:"monitor",   icon:"🏆", label:"Super Monitor",      desc:"O palco das tuas vitórias! Partilha as atividades que correram incrivelmente bem." },
  { id:"olx",       icon:"📦", label:"OLX EDUCA+",         desc:"O mercado de trocas, empréstimos e partilha de materiais entre todos os espaços JEEP." },
  { id:"orienta",   icon:"🧭", label:"Orienta-te",         desc:"O teu espaço de desenvolvimento pessoal. Partilha cursos e dicas de emprego." },
  { id:"backstage", icon:"🎬", label:"Backstage",          desc:"Onde a magia acontece! Mostra fotos da preparação e o 'Work In Progress' do teu projeto." },
  { id:"coffee",    icon:"☕", label:"Coffee Break",       desc:"Convívio virtual! Espaço livre onde é proibido falar de trabalho." },
];

export const SURVEY_CATS = [
  { id:"ludoteca", icon:"🏢", label:"A tua Ludoteca",   q:"Como te sentes no teu local de trabalho?",                chips:["Boa equipa 🤝","Aprendo muito 📚","Sinto-me útil 💡","Boa energia ✨","Difícil integração 😓","Pouco apoio ⚡","Rotina chata 😐"] },
  { id:"teresa",   icon:"📞", label:"Apoio da Teresa",  q:"Sentes que a Teresa tem estado presente quando precisas?", chips:["Disponível quando preciso ✓","Reuniões úteis 🗓️","Bom acompanhamento 👍","Sinto-me apoiado/a 🤗","Difícil de contactar 📵","Preciso de mais apoio"] },
  { id:"equipa",   icon:"👥", label:"A tua Equipa",     q:"Sentes que a equipa do local te apoia?",                  chips:["Somos um bom grupo 💪","Aprendo com eles 🎓","Integrado/a ✨","Boa comunicação 📢","Há conflitos 😬","Sinto-me de fora 😔"] },
  { id:"geral",    icon:"⭐", label:"Satisfação Geral", q:"No geral, como estás a sentir o programa JEEP?",          chips:["Melhor do que esperava 🚀","Está a correr bem ✓","Estou a aprender 📚","Difícil mas vale a pena 💪","Podia ser melhor 🤔"] },
];

export const ALL_MEDALS = [
  { id: "primeiro_passo", icon: "🌱", label: "Primeiro Passo" },
  { id: "comunicador",    icon: "💬", label: "Comunicador" },
  { id: "focado",         icon: "🎯", label: "Focado" },
  { id: "equipa",         icon: "🤝", label: "Team Player" },
  { id: "criativo",       icon: "🎨", label: "Criativo" },
  { id: "resiliente",     icon: "🛡️", label: "Resiliente" },
  { id: "on_fire",        icon: "🔥", label: "On Fire" },
  { id: "lider",          icon: "👑", label: "Líder" }
];

export const QUIZZES = [
  {
    id: "q_exemplo",
    title: "Cenário de Teste",
    desc: "Como geres esta situação?",
    xp: 20,
    options: [
      { id: "a", text: "Falo com a equipa", isCorrect: true, feedback: "Exato! A comunicação é a chave." },
      { id: "b", text: "Ignoro o problema", isCorrect: false, feedback: "Ignorar raramente resolve." }
    ]
  }
];

export const PIA_FIELDS = [
  { id: "diagnostico", label: "Diagnóstico Inicial", desc: "Breve caracterização da situação." },
  { id: "objetivos", label: "Objetivos a Atingir", desc: "O que pretendes alcançar?" },
  { id: "atividades", label: "Estratégias / Atividades", desc: "Como vais atingir os objetivos?" },
  { id: "indicadores", label: "Indicadores de Sucesso", desc: "Como sabes que alcançaste o objetivo?" }
];

export const FORUM_REACTIONS = [{ id:"heart", icon:"❤️" }, { id:"fire", icon:"🔥" }, { id:"clap", icon:"👏" }, { id:"think", icon:"🤔" }];
export const EC = { verde:"#4ade80", amarelo:"#fbbf24", vermelho:"#f87171" };
export const DEF_RODA  = { familia:5,amigos:5,dinheiro:5,trabalho:5,cresc:5,saude:5,lazer:5 };
export const DEF_CAP   = { text:"",locked:false,revealed:false,lockedDate:"" };
export const GDPR_TEXT = "Os dados recolhidos destinam-se exclusivamente ao acompanhamento do JEEP pela Teresa. Os dados são confidenciais.";
