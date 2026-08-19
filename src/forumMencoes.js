// Menções (@nome) no fórum — um único sítio para posts e comentários.
//
// Regras:
//  - só o fórum real notifica (`forum_demo` nunca notifica ninguém);
//  - aceita @username ou @Nome (ex.: @carina e @Carina);
//  - `@todos` avisa a equipa toda (menos quem escreveu e a conta demo);
//  - a notificação leva sempre `mencao:true` + `postId` + `canal` (para abrir
//    o post) e `push:true` (a Cloud Function `notificarJovem` só envia push
//    quando `push === true`).
import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase.js";
import { ALLOWED_USERNAMES, JEEP_LIST, nowFull } from "./data.js";

// Todos os nomes possíveis → username (para aceitar @Carina além de @carina).
const NOME_PARA_USERNAME = JEEP_LIST.reduce((acc, j) => {
  acc[j.username.toLowerCase()] = j.username;
  if (j.name) acc[j.name.toLowerCase()] = j.username;
  return acc;
}, {});

// Devolve os usernames mencionados num texto (sem repetidos, sem quem escreveu
// e sem a conta demo).
export function extrairMencoes(texto, autorUsername = "") {
  return [...String(texto || "").matchAll(/@([\wÀ-ÿ]+)/g)]
    .map(m => NOME_PARA_USERNAME[m[1].toLowerCase()] || m[1].toLowerCase())
    .filter((u, i, arr) => arr.indexOf(u) === i)
    .filter(u => u !== autorUsername && u !== "demo" && ALLOWED_USERNAMES.includes(u));
}

export function mencionouTodos(texto) {
  return String(texto || "").toLowerCase().includes("@todos");
}

// Cria as notificações de menção. Devolve os usernames avisados.
export async function notificarMencoes({
  texto,                      // texto do post/comentário
  autorUsername,              // quem menciona ("admin" no painel)
  autorNome,                  // nome a mostrar ("Teresa", "Carina"…)
  canal, canalLabel, postId,
  emComentario = false,
  excluir = [],               // quem já é avisado por outra via (ex.: autor do post)
  permitirTodos = true,       // false onde já existe outra forma de avisar toda a gente
  forumCollection = "forum",  // "forum_demo" → não notifica
}) {
  if (forumCollection !== "forum") return [];
  const onde = emComentario
    ? `num comentário em ${canalLabel || canal}`
    : `em ${canalLabel || canal}`;
  const alvos = extrairMencoes(texto, autorUsername).filter(u => !excluir.includes(u));
  const todos = permitirTodos && mencionouTodos(texto)
    ? ALLOWED_USERNAMES.filter(u =>
        u !== autorUsername && u !== "demo" && !alvos.includes(u) && !excluir.includes(u))
    : [];
  const criar = (u, txt) => addDoc(collection(db, "notifications", u, "items"), {
    from: autorUsername, text: txt, date: nowFull(), read: false, ts: Date.now(),
    mencao: true, postId, canal, push: true,
  });
  await Promise.all([
    ...alvos.map(u => criar(u, `🔔 ${autorNome} mencionou-te ${onde}!`)),
    ...todos.map(u => criar(u, `🔔 ${autorNome} mencionou a equipa toda ${onde}!`)),
  ]);
  return [...alvos, ...todos];
}

// ── Ajudas para o dropdown de @menções (usado nas caixas de comentário) ──

// Lê o que está antes do cursor e diz se se está a escrever uma @menção.
export function detetarMencao(valor, cursor) {
  const antes = String(valor || "").substring(0, cursor);
  const match = antes.match(/@(\w*)$/);
  if (!match) return { ativa: false, filtro: "", start: 0 };
  return { ativa: true, filtro: match[1].toLowerCase(), start: cursor - match[0].length };
}

// Substitui a @menção meio-escrita pelo username escolhido.
// Devolve o texto novo e onde deve ficar o cursor.
export function inserirMencao(texto, start, username) {
  const antes = String(texto || "").substring(0, start);
  const depois = String(texto || "").substring(start).replace(/^@\w*/, "");
  return { texto: antes + "@" + username + " " + depois, pos: start + username.length + 2 };
}

// Lista de sugestões para o filtro escrito (pessoas + "toda a equipa").
export function candidatosMencao(filtro = "", excluirUsername = "", { incluirTodos = true, corTodos = "#32C7FF" } = {}) {
  const f = String(filtro || "").toLowerCase();
  const mostrarTodos = incluirTodos && (!f || "todos".includes(f) || "equipa".includes(f) || "toda".includes(f));
  const pessoas = JEEP_LIST
    .filter(j => j.username !== excluirUsername && j.username !== "demo" && j.username !== "ricardo")
    .filter(j => !f || j.username.toLowerCase().includes(f) || j.name.toLowerCase().includes(f))
    .slice(0, mostrarTodos ? 4 : 5);
  return [
    ...(mostrarTodos ? [{ username: "todos", name: "Toda a equipa", color: corTodos }] : []),
    ...pessoas,
  ];
}
