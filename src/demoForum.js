// Fórum de DEMONSTRAÇÃO (forum_demo) — posts e respostas a fingir, só para
// mostrar como o fórum funciona. É semeado de novo a cada sessão da conta demo,
// por isso está sempre igual e limpo (o que a pessoa escrever não fica guardado
// para a próxima). O aviso "é a fingir" aparece no topo do fórum (ver ForumTab).
import { collection, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import { JEEP_LIST, nowFull } from "./data.js";

const quem = (u) => {
  const j = JEEP_LIST.find(x => x.username === u) || {};
  return { username: u, user: j.name || u, color: j.color || "#32C7FF" };
};

// resposta (reply) a fingir
const R = (u, text, tag) => ({ id: "R_seed_" + u + "_" + tag, ...quem(u), text, time: "há pouco" });

// Imagem a fingir (SVG embutido — não precisa de internet nem de Storage).
const DEMO_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='230'>
    <defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
      <stop offset='0' stop-color='#7c3aed'/><stop offset='1' stop-color='#db2777'/></linearGradient></defs>
    <rect width='400' height='230' rx='16' fill='url(#g)'/>
    <circle cx='200' cy='95' r='40' fill='rgba(255,255,255,0.92)'/>
    <polygon points='188,73 188,117 226,95' fill='#7c3aed'/>
    <text x='200' y='170' font-family='Arial,sans-serif' font-size='23' font-weight='bold' fill='#fff' text-anchor='middle'>Serao de cinema</text>
    <text x='200' y='200' font-family='Arial,sans-serif' font-size='13' fill='rgba(255,255,255,0.85)' text-anchor='middle'>(foto de exemplo)</text>
  </svg>`
);

// post a fingir
const P = (u, text, { time = "há 2 h", reactions = {}, replies = [], destaque = false, media = null } = {}) => ({
  ...quem(u),
  text,
  media,
  medias: media ? [{ tipo: "image", url: media }] : [],
  time,
  destaque, // só o anúncio da Teresa é destaque (aparece como "Aviso da Teresa")
  reactions: { heart: 0, fire: 0, clap: 0, think: 0, ...reactions },
  reactedBy: { heart: [], fire: [], clap: [], think: [] },
  replies,
});

// Canais e os posts de exemplo de cada um.
function seed() {
  return {
    anuncios: [
      P("teresa", "📣 Bem-vindos ao EDUCA+! Esta semana há formação de primeiros socorros na quinta, às 14h. Contamos com todos 💪", {
        time: "ontem", destaque: true, reactions: { heart: 3, fire: 2 },
        replies: [R("nilton", "Lá estarei! 🙌", "a1")],
      }),
    ],
    monitor: [
      P("nilton", "Hoje montei um torneio de matraquilhos improvisado e os miúdos ADORARAM 🏓🔥", {
        time: "há 3 h", reactions: { fire: 4, clap: 3 },
        replies: [R("carina", "Boa!! Tens de me ensinar 😄", "m1"), R("erick", "Que ideia top 👏", "m2")],
      }),
    ],
    csi: [
      P("marisa", "Tive hoje um grupo muito agitado antes de começar a atividade. Alguém tem truques para acalmar o pessoal nos primeiros minutos?", {
        time: "há 5 h", reactions: { think: 2 },
        replies: [
          R("rudmilo", "Eu costumo começar com um jogo de silêncio, funciona sempre 🤫", "c1"),
          R("teresa", "Ótima pergunta, Marisa — podemos falar disto na próxima reunião 🙂", "c2"),
        ],
      }),
    ],
    olx: [
      P("jucilina", "Preciso de cartolinas e canetas de feltro para uma atividade na sexta. Alguém tem a mais? 🙏", {
        time: "há 1 dia",
        replies: [R("bruno", "Tenho cartolinas, levo-te amanhã!", "o1")],
      }),
    ],
    coffee: [
      P("bruno", "Maratona de cinema no fim de semana 🍿🎬 aceito sugestões de filmes!", {
        time: "há 6 h", media: DEMO_IMG, reactions: { heart: 4, fire: 2 },
        replies: [R("carina", "Vi um ótimo ontem, depois digo-te 😄", "cf1"), R("erick", "Conta comigo para a próxima 🙌", "cf2")],
      }),
    ],
  };
}

// Notificações a fingir (NÃO de fórum — essas ficam escondidas na demo).
function seedNotifs() {
  return [
    { from: "teresa", tipo: "recurso", text: "📚 A Teresa partilhou um novo recurso: Khan Academy" },
    { from: "teresa", tipo: "auto", text: "💬 Nova Pergunta da Semana! Vai aos Desafios responder." },
    { from: "teresa", text: "🎯 A Teresa atribuiu-te a medalha «Proatividade»! 🎉" },
  ];
}

// Tarefas a fingir (todos/demo/items) — a lista "A minha lista" do Início.
function seedTodos() {
  return [
    // Proposta da Teresa — aparece em "Sugestões da Teresa" com ACEITAR / RECUSAR.
    { text: "Sugestão: lê o Guia de Bem-estar Digital e diz-me o que achaste 📘", due: "", done: false, shared: true, addedBy: "teresa", accepted: false, type: "geral" },
    // Tarefas do próprio (a fingir), em "A minha lista".
    { text: "Preparar a atividade de sexta-feira 🎨", due: "", done: false, shared: false },
    { text: "Tirar fotos da última sessão para partilhar no fórum 📷", due: "", done: true, shared: false },
  ];
}

// Missão a fingir (client-side — a coleção "missions" é global, não se escreve).
export function demoMissions() {
  return [{ id: "demo_missao", text: "Esta semana, experimenta uma dinâmica nova com o teu grupo e conta como correu 🚀", xp: 20, encerrada: false, ts: Date.now() }];
}

// Certificado a fingir (SVG embutido) — aparece nos Docs da demo.
const DEMO_CERT = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='560'>
    <rect width='800' height='560' fill='#0f0d1e'/>
    <rect x='24' y='24' width='752' height='512' rx='14' fill='#141230' stroke='#7c3aed' stroke-width='3'/>
    <rect x='40' y='40' width='720' height='480' rx='8' fill='none' stroke='#db2777' stroke-width='1'/>
    <text x='400' y='120' font-family='Georgia,serif' font-size='34' font-weight='bold' fill='#fff' text-anchor='middle'>CERTIFICADO</text>
    <text x='400' y='158' font-family='Arial,sans-serif' font-size='14' fill='#a9beff' text-anchor='middle' letter-spacing='3'>DE PARTICIPACAO</text>
    <text x='400' y='230' font-family='Arial,sans-serif' font-size='15' fill='#cbd5e1' text-anchor='middle'>Este certificado e atribuido a</text>
    <text x='400' y='280' font-family='Georgia,serif' font-size='30' font-weight='bold' fill='#f9a8d4' text-anchor='middle'>Utilizador de Demonstracao</text>
    <text x='400' y='330' font-family='Arial,sans-serif' font-size='15' fill='#cbd5e1' text-anchor='middle'>pela conclusao da formacao</text>
    <text x='400' y='362' font-family='Arial,sans-serif' font-size='18' font-weight='bold' fill='#fff' text-anchor='middle'>"Introducao ao Trabalho em Ludotecas"</text>
    <text x='400' y='396' font-family='Arial,sans-serif' font-size='13' fill='#94a3b8' text-anchor='middle'>Duracao: 12 horas</text>
    <line x1='250' y1='456' x2='550' y2='456' stroke='#475569' stroke-width='1'/>
    <text x='400' y='476' font-family='Georgia,serif' font-size='16' fill='#e2e8f0' text-anchor='middle'>Teresa Castro</text>
    <text x='400' y='496' font-family='Arial,sans-serif' font-size='11' fill='#64748b' text-anchor='middle'>Gestora do Programa EDUCA+</text>
    <text x='400' y='524' font-family='Arial,sans-serif' font-size='11' fill='#7c3aed' text-anchor='middle'>(certificado de exemplo — a fingir)</text>
  </svg>`
);

// Documento a fingir (client-side) — aparece na secção Docs da demo.
export function demoDocs() {
  return [{ id: "demo_cert", categoria: "doc", icone: "🎓", titulo: "Certificado — Introdução ao Trabalho em Ludotecas", desc: "Certificado de participação na formação (exemplo).", url: DEMO_CERT }];
}

// Eventos a fingir para a agenda (client-side — a coleção "events" é global).
export function demoEvents() {
  const dia = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
  return [
    { id: "demo_ev1", title: "Reunião de equipa EDUCA+", date: dia(2), time: "14:00", userId: "demo", type: "personal", shared: false },
    { id: "demo_ev2", title: "Formação: Primeiros Socorros", date: dia(5), time: "10:00", userId: "demo", type: "personal", shared: false },
  ];
}

// Apaga um por um (cada delete no seu try — se um falhar, os outros continuam).
async function limpar(ref) {
  try {
    const snap = await getDocs(ref);
    for (const d of snap.docs) { try { await deleteDoc(d.ref); } catch (_) {} }
  } catch (_) {}
}

// Apaga o que lá estiver e volta a semear os posts + notificações + tarefas a
// fingir. Cada parte é independente: se uma falhar, as outras semeiam na mesma.
export async function reseedDemo() {
  const now = Date.now();

  // Fórum (posts + imagem + aviso da Teresa a fingir)
  try {
    const dados = seed();
    const canais = Object.keys(dados);
    for (const c of canais) await limpar(collection(db, "forum_demo", c, "posts"));
    let i = 0;
    for (const c of canais) {
      for (const post of dados[c]) {
        await addDoc(collection(db, "forum_demo", c, "posts"), { ...post, ts: now - (i++) * 3600000 });
      }
    }
  } catch (_) {}

  // Notificações a fingir
  try {
    await limpar(collection(db, "notifications", "demo", "items"));
    let j = 0;
    for (const n of seedNotifs()) {
      await addDoc(collection(db, "notifications", "demo", "items"), { ...n, read: false, date: nowFull(), ts: now - (j++) * 1800000 });
    }
  } catch (_) {}

  // Tarefas ("A minha lista" + proposta da Teresa)
  try {
    await limpar(collection(db, "todos", "demo", "items"));
    let k = 0;
    for (const t of seedTodos()) {
      await addDoc(collection(db, "todos", "demo", "items"), { ...t, ts: now - (k++) * 3600000 });
    }
  } catch (_) {}
}
