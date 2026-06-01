export function upd(obj, key, val) { let r = Object.assign({}, obj); r[key] = val; return r; }
export function scoreLabel(v) {
  if (v <= 2) return ["Insuficiente","#f43f5e"];
  if (v <= 4) return ["Abaixo do esperado","#fb923c"];
  if (v === 5) return ["Suficiente","#fbbf24"];
  if (v <= 7) return ["Bom","#60a5fa"];
  if (v <= 9) return ["Muito Bom","#a855f7"];
  return ["Excelente","#22d3ee"];
}
// Escala 1-5 usada na Satisfação
export function satisfLabel(v) {
  if (v <= 1) return ["Muito Insatisfeito","#f43f5e"];
  if (v <= 2) return ["Insatisfeito","#fb923c"];
  if (v <= 3) return ["Neutro","#fbbf24"];
  if (v <= 4) return ["Satisfeito","#60a5fa"];
  return ["Muito Satisfeito","#4ade80"];
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

export const MTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
export function nowLabel() { let d = new Date(); return MTHS[d.getMonth()] + " " + d.getFullYear(); }
export function nowFull() {
  let d = new Date();
  let pad = n => n < 10 ? "0"+n : ""+n;
  return pad(d.getDate())+" "+MTHS[d.getMonth()]+" "+d.getFullYear()+", "+pad(d.getHours())+":"+pad(d.getMinutes());
}
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

export const ALLOWED_USERNAMES = ["nilton","erick","jucilina","carina","rudmilo","bruno","salimo","marisa","teresa","ricardo"];
export const SPECIAL_USERS = ["teresa","ricardo","demo"];
export const USERS = [
  { username:"nilton",   realName:"Nilton",   color:"#22d3ee" },
  { username:"erick",    realName:"Erick",    color:"#f472b6" },
  { username:"jucilina", realName:"Jucilina", color:"#a855f7" },
  { username:"carina",   realName:"Carina",   color:"#4ade80" },
  { username:"rudmilo",  realName:"Rudmilo",  color:"#fbbf24" },
  { username:"bruno",    realName:"Bruno",    color:"#60a5fa" },
  { username:"salimo",   realName:"Salimo",   color:"#f87171" },
  { username:"marisa",   realName:"Marisa",   color:"#fb923c" },
  { username:"teresa",   realName:"Teresa",   color:"#e2e8f0" },
  { username:"ricardo",  realName:"Ricardo",  color:"#2dd4bf" },
  { username:"demo",     realName:"Demo JEEP",color:"#a3e635", isDemo:true },
];

export const JEEP_LIST = [
  { name:"Nilton",   username:"nilton",   color:"#22d3ee", entidade:"", estado:"verde" },
  { name:"Erick",    username:"erick",    color:"#f472b6", entidade:"", estado:"verde" },
  { name:"Jucilina", username:"jucilina", color:"#a855f7", entidade:"", estado:"verde" },
  { name:"Carina",   username:"carina",   color:"#4ade80", entidade:"", estado:"verde" },
  { name:"Rudmilo",  username:"rudmilo",  color:"#fbbf24", entidade:"", estado:"verde" },
  { name:"Bruno",    username:"bruno",    color:"#60a5fa", entidade:"", estado:"verde" },
  { name:"Salimo",   username:"salimo",   color:"#f87171", entidade:"", estado:"verde" },
  { name:"Marisa",   username:"marisa",   color:"#fb923c", entidade:"", estado:"verde" },
  { name:"Teresa",   username:"teresa",   color:"#e2e8f0", entidade:"(teste)", estado:"verde" },
  { name:"Ricardo",  username:"ricardo",  color:"#2dd4bf", entidade:"(teste)", estado:"verde" },
];

export const DIMS = [
  {
    id:"D1",
    label:"Comunicação, Assertividade e Relação em Equipa",
    desc:"Comunica de forma clara e adaptada a cada pessoa (crianças, colegas, coordenadores). Ouve o outro, mantém um ambiente de respeito e entreajuda, pede apoio quando necessário e lida bem com críticas. Colabora com a equipa e partilha responsabilidades.",
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
    desc:"Enfrenta dificuldades e o stress do dia a dia com maturidade, sem desistir à primeira ou ter reações desproporcionais. Controla a frustração quando as coisas não correm como planeado e adapta-se a imprevistos mantendo a calma.",
    s:{
      a:"Quando as coisas não correm bem, bloqueio, desisto ou fico muito agitado/a. Tenho muita dificuldade em lidar com imprevistos ou situações de stress.",
      b:"Às vezes as dificuldades afetam demasiado o meu estado de espírito e isso nota-se no trabalho. Tenho dificuldade em manter a calma quando as coisas não correm como esperava.",
      c:"Consigo manter-me estável na maior parte das situações do dia a dia. Quando há imprevistos, fico desconfortável, mas consigo continuar.",
      d:"Quando surgem dificuldades ou imprevistos, consigo manter-me calmo/a e encontrar formas de continuar. Não desisto à primeira e consigo adaptar-me quando o plano muda.",
      e:"Lido bem com situações difíceis: mantenho-me focado/a e encontro alternativas. A minha estabilidade ajuda os que estão à minha volta.",
      f:"Sinto que sou uma referência de calma para a equipa. Mesmo nas situações mais difíceis, mantenho o equilíbrio, apoio os colegas e transformo os problemas em oportunidades de crescimento."
    }
  },
  {
    id:"D3",
    label:"Autonomia, Proatividade e Cumprimento de Tarefas",
    desc:"Trabalha de forma independente e antecipa as necessidades do local. Identifica o que precisa de ser feito e age por iniciativa própria, sem esperar por ordens. Cumpre os compromissos a que se propõe até ao fim.",
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
    desc:"Autorreflexão para reconhecer de forma realista as competências e limitações. Honestidade para assumir as falhas e procurar melhoria. Esforço em definir metas concretas e os passos para lá chegar.",
    s:{
      a:"Não penso muito sobre o que faço bem ou mal. Não tenho objetivos claros para o futuro nem sei o que fazer para lá chegar.",
      b:"Tenho alguma noção das minhas limitações, mas custa-me admiti-las. Tenho ideias para o futuro, mas são vagas e não sei como concretizá-las.",
      c:"Sei, de forma geral, o que faço bem e o que preciso de melhorar. Tenho alguns objetivos para o futuro, mas ainda não tenho um plano claro.",
      d:"Conheço bem as minhas competências e limitações. Defino objetivos concretos e sei o que preciso de fazer para os atingir. Quando falho, assumo e procuro melhorar.",
      e:"Reflito regularmente sobre o meu desempenho. Tenho um projeto de vida concreto, sei os passos que preciso de dar e estou a trabalhar nisso ativamente.",
      f:"Conheço-me a um nível profundo. Esse autoconhecimento guia as minhas decisões, o meu projeto de vida e a forma como me relaciono com os outros e com o trabalho."
    }
  },
  {
    id:"D5",
    label:"Competências Digitais e Autonomia Administrativa",
    desc:"Domínio de ferramentas digitais e gestão das exigências práticas do dia a dia. Capacidade de usar a tecnologia de forma útil, navegar processos burocráticos e ser autónomo/a nestas áreas.",
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
    desc:"Capacidade de conceber e dinamizar atividades relevantes e ajustadas ao grupo. Postura profissional adequada, respeito pelas regras e alinhamento com a missão e objetivos da entidade.",
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
  { id:"csi",       icon:"🔍", label:"CSI Ludotecas",      desc:"A tua linha de apoio 24/7. Usa este canal para expores desafios, desabafares sobre situações difíceis no terreno e procurares soluções em conjunto com a Teresa e os teus colegas." },
  { id:"monitor",   icon:"🏆", label:"Super Monitor",      desc:"O palco das tuas vitórias! Partilha as atividades que correram incrivelmente bem, os sorrisos que arrancaste e as pequenas conquistas diárias do teu trabalho." },
  { id:"olx",       icon:"📦", label:"OLX EDUCA+",         desc:"Precisas de 5 tesouras para amanhã? Sobraram-te cartolinas? Este é o mercado de trocas, empréstimos e partilha de materiais entre todos os espaços JEEP." },
  { id:"orienta",   icon:"🧭", label:"Orienta-te",         desc:"O teu espaço de desenvolvimento pessoal. Partilha cursos, dicas de emprego, dúvidas sobre o teu futuro profissional ou coisas novas que aprendeste." },
  { id:"backstage", icon:"🎬", label:"Backstage",          desc:"Onde a magia acontece! Mostra fotos do processo, a preparação dos teus PIAs, a sala desarrumada antes da atividade e o 'Work In Progress' do teu projeto." },
  { id:"coffee",    icon:"☕", label:"Coffee Break",       desc:"A sala de convívio virtual! Um espaço livre de stress onde é literalmente proibido falar de trabalho. Partilha músicas, memes, séries e combina cafés com a malta." },
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
  { id:"riscos",    label:"🚧 Riscos",        sub:"Ameaças externas ao plano",       color:"#f87171", ph:"Ex: Pode chover no dia..." },
];

export const ALL_MEDALS = [
  { id:"proativo",    icon:"🎯", label:"Proatividade",         desc:"Tomou iniciativa sem que ninguém pedisse — identificou uma necessidade e agiu." },
  { id:"equipa",      icon:"🤝", label:"Espírito de Equipa",   desc:"Apoiou os colegas de forma notável, colocando o grupo à frente do individual." },
  { id:"criativo",    icon:"💡", label:"Criatividade",         desc:"Propôs ou executou uma ideia original que fez a diferença no espaço." },
  { id:"destaque",    icon:"⭐", label:"Destaque da Semana",   desc:"Momento especial reconhecido pela GO — esta semana brilhaste." },
  { id:"pia",         icon:"📋", label:"PIA Completo",         desc:"Entregou e trabalhou o Plano Individual de Ação com rigor e comprometimento." },
  { id:"evolucao",    icon:"📈", label:"Evolução",             desc:"Progresso notável e visível desde o início do programa — estás a crescer." },
  { id:"pontual",     icon:"⏰", label:"Pontualidade",         desc:"Demonstrou consistência e respeito pelo tempo dos outros esta semana." },
  { id:"coragem",     icon:"🦁", label:"Coragem",              desc:"Enfrentou uma situação desafiante ou desconfortável com determinação." },
  { id:"presenca",    icon:"🌟", label:"Presença Marcante",    desc:"A tua energia e atitude positiva elevou o grupo esta semana." },
  { id:"curiosidade", icon:"🔍", label:"Curiosidade",          desc:"Fez perguntas, investigou e foi além do que foi pedido para aprender mais." },
  { id:"comunicacao", icon:"🗣", label:"Comunicação",          desc:"Comunicou de forma clara, assertiva e empática em situações difíceis." },
  { id:"superacao",     icon:"🏆", label:"Superação",              desc:"Ultrapassou um obstáculo pessoal ou profissional que parecia impossível." },
  { id:"persistencia",  icon:"🐢", label:"Persistente",             desc:"Não desistiu mesmo quando foi difícil — continuou em frente com determinação." },
  { id:"resolver",      icon:"🧗", label:"Resolução de Problemas",  desc:"Identificou um problema e encontrou uma solução em vez de ficar à espera." },
  { id:"organizado",    icon:"🗂️", label:"Organizado/a",            desc:"Demonstrou ordem, método e cuidado na gestão das suas tarefas e compromissos." },
  { id:"positivo",      icon:"☀️", label:"Positivo/a",              desc:"Manteve uma atitude construtiva e animou o grupo mesmo nos momentos mais difíceis." },
  { id:"zen",           icon:"🧘", label:"Mestre Zen",              desc:"Manteve a calma e o equilíbrio numa situação de pressão ou conflito." },
  { id:"techguru",      icon:"💻", label:"Tech Guru",               desc:"Mostrou aptidão e vontade de ajudar os outros com ferramentas digitais." },
  { id:"madrugador",    icon:"🌅", label:"Madrugador/a",            desc:"Foi dos primeiros a responder ou agir — não espera que as coisas aconteçam." },
  { id:"feras",         icon:"🦁", label:"Encantador/a de Feras",   desc:"Tem um jeito especial para lidar com pessoas difíceis ou situações tensas." },
  { id:"arrumado",      icon:"🧹", label:"Arrumadinho/a",           desc:"Deixa sempre os espaços melhor do que os encontrou — respeito pelo comum." },
  { id:"aviso",         icon:"🚨", label:"Aviso Prévio",            desc:"Avisou atempadamente de um imprevisto em vez de simplesmente não aparecer — responsabilidade e respeito pelos outros." },
];

// s1 removido (identificação do jovem não necessária)
// sub: "diag" = Diagnóstico, "atrib" = Atributos & Raio-X, "proj" = Projeto, "mon" = Monitorização
export const PIA_SECTIONS = [
  {
    id: "s2", title: "Diagnóstico da Instituição", icon: "🔍", sub: "diag",
    fields: [
      { key: "nomeInst",     label: "Nome da instituição",                   ph: "",                                                               rows: 1 },
      { key: "tipoServico",  label: "Tipo de serviço",                       ph: "Ex: ludoteca, polo comunitário",                                 rows: 1 },
      { key: "publicoAlvo",  label: "Público-alvo",                          ph: "Faixa etária, perfil...",                                        rows: 2 },
      { key: "missao",       label: "Missão e áreas de intervenção",         ph: "Principais objetivos da instituição...",                         rows: 3 },
      { key: "recHumanos",   label: "Recursos humanos",                      ph: "Técnicos, mediadores, voluntários...",                           rows: 3 },
      { key: "recMateriais", label: "Recursos materiais",                    ph: "Espaços, equipamentos, tecnologia...",                           rows: 3 },
      { key: "necInst",      label: "Necessidades — ótica da instituição",   ph: "O que falta? Falta de diversidade, recursos especializados...", rows: 3 },
      { key: "necUsers",     label: "Necessidades — ótica dos jovens",       ph: "Baixa motivação, déficit de competências, carências digitais...", rows: 3 },
    ]
  },
  {
    id: "s3", title: "Atributos", icon: "⭐", sub: "atrib",
    fields: [
      { key: "percPessoal",    label: "Percurso pessoal",        ph: "Experiências de vida relevantes, voluntariado...",         rows: 3 },
      { key: "percAcademico",  label: "Percurso académico",      ph: "Cursos concluídos, formações, áreas de interesse...",      rows: 3 },
      { key: "competencias",   label: "Competências formais",    ph: "Competências técnicas (informática, línguas)...",          rows: 2 },
      { key: "personalidade",  label: "Traços de personalidade", ph: "Comunicação, empatia, criatividade, liderança...",        rows: 2 },
      { key: "hobbies",        label: "Gostos / Hobbies",        ph: "Música, desporto, jogos, atividades culturais...",        rows: 2 },
    ]
  },
  {
    id: "s3b", title: "Raio-X do Projeto", icon: "📊", sub: "raiox",
    fields: [
      { key: "swot", label: "Raio-X do Projeto", type: "swot" },
    ]
  },
  {
    id: "s4", title: "Conceção do Projeto", icon: "🚀", sub: "proj",
    fields: [
      { key: "oQue",       label: "O QUÊ — Natureza / Temática",              ph: 'Ex: "Organizar sessões de cinema seguidas de debates."',                  rows: 2 },
      { key: "fundamento", label: "PORQUÊ — Fundamento",                      ph: 'Ex: "Porque muitos jovens não têm espaço para falar."',                  rows: 2 },
      { key: "objetivos",  label: "PARA QUÊ — Objetivos",                     ph: 'Ex: "Para promover reflexão, diálogo e consciência social."',             rows: 2 },
      { key: "metas",      label: "QUANTO — Metas concretas",                 ph: 'Ex: "Realizar 6 sessões de cinema com debate durante o ano."',            rows: 2 },
      { key: "onde",       label: "ONDE — Localização",                       ph: 'Ex: "Na sala polivalente da ludoteca."',                                  rows: 1 },
      { key: "atividadesList", label: "COMO E QUANDO — Atividades e Calendário", type: "activities" },
      { key: "recursos",   label: "COM O QUÊ — Recursos",                     ph: 'Ex: "Projetor, computador, filmes, cadeiras, cartazes."',                 rows: 2 },
      { key: "avaliacao",  label: "COMO AVALIAR — Critérios",                 ph: 'Ex: "Contar quantos participaram e pedir opiniões."',                    rows: 2 },
    ]
  },
  {
    id: "s5", title: "Monitorização e Revisão", icon: "📈", sub: "mon",
    fields: [
      { key: "periodicidade",  label: "Periodicidade de revisão", ph: 'Ex: "Vou verificar todos os meses se as sessões estão a acontecer."', rows: 2 },
      { key: "revisoesList",   label: "REVISÕES — Registo de evolução e ajustes", type: "revisoes" },
    ]
  },
];

export const PIA_FIELDS = [
  { key:"oQue",     title:"O QUÊ",    icon:"🎯", hint:"Título e natureza do projeto",   ph:"Que projeto ou atividade quero desenvolver?" },
  { key:"paraQue",  title:"PARA QUÊ", icon:"🏁", hint:"Objetivo global",                ph:"Qual é o propósito? O que vai mudar?" },
  { key:"quanto",   title:"QUANTO",   icon:"📊", hint:"Volume e frequência",            ph:"Quantas sessões? Com que frequência?" },
  { key:"onde",     title:"ONDE",     icon:"📍", hint:"Local e contexto",               ph:"Onde vai acontecer? Com que grupo?" },
  { key:"recursos", title:"RECURSOS", icon:"🧰", hint:"O que é necessário",             ph:"Materiais, pessoas, espaços." },
  { key:"comoSaber",title:"COMO SABER SE CORREU BEM", icon:"📏", hint:"Critérios de avaliação", ph:"O que vai ser diferente? Como vou medir?" },
];

export const COMPL = ["Esta semana aprendi que...","A maior dificuldade foi...","Surpreendi-me quando...","Da próxima vez vou...","Orgulhei-me quando..."];
export const MOODS = ["😴","😟","😐","🙂","😄","🔥"];
export const SEMOJIS = ["","😞","😕","😐","🙂","😄"];
export const FORUM_REACTIONS = [{ id:"heart", icon:"❤️" }, { id:"fire", icon:"🔥" }, { id:"clap", icon:"👏" }, { id:"think", icon:"🤔" }];
export const EVT_COLORS = { group:"#f472b6", visit:"#22d3ee", formacao:"#a78bfa", personal:"#4ade80" };
export const EVT_ICONS  = { group:"👥",      visit:"🏢",      formacao:"🎓",       personal:"📌" };

export const TASK_TYPES = [
  { id:"geral",    label:"Geral",     icon:"📋", color:"#94a3b8" },
  { id:"objetivo", label:"Objetivo",  icon:"🎯", color:"#f472b6" },
  { id:"estudo",   label:"Estudo",    icon:"📚", color:"#a78bfa" },
  { id:"reuniao",  label:"Reunião",   icon:"🤝", color:"#22d3ee" },
];
export const EC = { verde:"#4ade80", amarelo:"#fbbf24", vermelho:"#f87171" };

export const DEF_PIA   = { oQue:"",paraQue:"",quanto:"",onde:"",recursos:"",comoSaber:"" };
export const DEF_ACTS  = [{ oQue:"",quando:"",obj:"" },{ oQue:"",quando:"",obj:"" },{ oQue:"",quando:"",obj:"" },{ oQue:"",quando:"",obj:"" }];

// Valores por defeito: 0 em tudo
export const DEF_RODA  = { familia:0,amigos:0,dinheiro:0,trabalho:0,cresc:0,saude:0,lazer:0 };
export const DEF_DSCORES = { D1:0,D2:0,D3:0,D4:0,D5:0,D6:0 };
export const DEF_DNOTAS  = { D1:"",D2:"",D3:"",D4:"",D5:"",D6:"" };
export const DEF_SWOT  = { forcas:"",fraquezas:"",oprtns:"",riscos:"" };
export const DEF_CAP   = { text:"",locked:false,revealed:false,lockedDate:"" };

export const GDPR_TEXT = "Os dados recolhidos nesta plataforma destinam-se exclusivamente ao acompanhamento do Programa JEEP EDUCA+ pela Câmara Municipal de Cascais. Os teus dados pessoais serão tratados de forma confidencial. O armazenamento cumpre o RGPD.";
