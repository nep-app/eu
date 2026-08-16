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

// post a fingir
const P = (u, text, { time = "há 2 h", reactions = {}, replies = [] } = {}) => ({
  ...quem(u),
  text,
  media: null, medias: [],
  time,
  reactions: { heart: 0, fire: 0, clap: 0, think: 0, ...reactions },
  reactedBy: { heart: [], fire: [], clap: [], think: [] },
  replies,
});

// Canais e os posts de exemplo de cada um.
function seed() {
  return {
    anuncios: [
      P("teresa", "📣 Bem-vindos ao EDUCA+! Esta semana há formação de primeiros socorros na quinta, às 14h. Contamos com todos 💪", {
        time: "ontem", reactions: { heart: 3, fire: 2 },
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
      P("bruno", "Alguém já viu a nova série que toda a gente anda a falar? Sem spoilers 👀🍿", {
        time: "há 6 h", reactions: { heart: 2 },
        replies: [R("carina", "Vi tudo num fim de semana 😅", "cf1")],
      }),
    ],
  };
}

// Notificações a fingir (NÃO de fórum — essas ficam escondidas na demo).
function seedNotifs() {
  return [
    { from: "teresa", tipo: "recurso", text: "📚 A Teresa partilhou um novo recurso: Khan Academy" },
    { from: "teresa", tipo: "auto", text: "💬 Nova Pergunta da Semana! Vai aos Desafios responder." },
    { from: "sistema", text: "🏅 Ganhaste a medalha «Primeiros Passos»! Parabéns 🎉" },
  ];
}

// Apaga o que lá estiver e volta a semear os posts + notificações a fingir.
export async function reseedDemo() {
  try {
    // Fórum
    const dados = seed();
    const canais = Object.keys(dados);
    for (const c of canais) {
      const snap = await getDocs(collection(db, "forum_demo", c, "posts"));
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    }
    const now = Date.now();
    let i = 0;
    for (const c of canais) {
      for (const post of dados[c]) {
        // ts decrescente para ficarem por ordem (mais recente primeiro)
        await addDoc(collection(db, "forum_demo", c, "posts"), { ...post, ts: now - (i++) * 3600000 });
      }
    }
    // Notificações
    const nots = await getDocs(collection(db, "notifications", "demo", "items"));
    await Promise.all(nots.docs.map(d => deleteDoc(d.ref)));
    let j = 0;
    for (const n of seedNotifs()) {
      await addDoc(collection(db, "notifications", "demo", "items"), {
        ...n, read: false, date: nowFull(), ts: now - (j++) * 1800000,
      });
    }
  } catch (_) { /* demo: falha silenciosa */ }
}
