const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule }        = require("firebase-functions/v2/scheduler");
const { logger }            = require("firebase-functions");
const { initializeApp }     = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging }      = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();

// Lista de utilizadores que recebem publicações (mesma de ALLOWED_USERNAMES
// no cliente). JOVENS = só os 8 participantes.
const JOVENS  = ["nilton","erick","jucilina","carina","rudmilo","bruno","salimo","marisa","tamara"];
const ALLOWED = [...JOVENS, "teresa", "ricardo", "demo"];
const MTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
function fmtLabel(d) { return MTHS[d.getMonth()] + " " + d.getFullYear(); }
function fmtFull(d) {
  const p = n => (n < 10 ? "0" : "") + n;
  return `${p(d.getDate())} ${MTHS[d.getMonth()]} ${d.getFullYear()}, ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fmtPrazo(s) {
  if (!s) return "";
  const [y, m, dd] = s.split("-");
  return `${+dd} ${MTHS[+m - 1]} ${y}`;
}

const NOTIF_LABELS = {
  MENSAGEM:  (d) => ({ title: "💬 Nova mensagem",              body: `${d.jovem}: ${(d.texto||"").substring(0,80)}` }),
  PIA:       (d) => ({ title: "📋 PIA recebido",                body: `${d.jovem} enviou o Plano Individual de Ação` }),
  AJUDA_PIA: (d) => ({ title: `🆘 ${d.jovem} precisa de ajuda`, body: `"${(d.pergunta||"PIA").substring(0,80)}"` }),
  MISSAO:    (d) => ({ title: "🎯 Missão cumprida",             body: `${d.jovem}: ${(d.texto||"").substring(0,60)}${d.nota ? ` — "${(d.nota||"").substring(0,60)}"` : ""}` }),
};

// Reúne todos os tokens de um documento fcmTokens/{username}: o mapa novo
// "tokens" (um por aparelho) mais o campo antigo "token" (compatibilidade),
// devolvendo [{ token, tid }] onde tid é a chave no mapa (null se for o
// legado) para se poder apagar só o token inválido.
function coletarTokens(docData) {
  const dd = docData || {};
  const out = [];
  if (dd.token) out.push({ token: dd.token, tid: null });
  if (dd.tokens) {
    for (const [tid, v] of Object.entries(dd.tokens)) {
      if (v && v.token) out.push({ token: v.token, tid });
    }
  }
  return out;
}

// Envia um push data-only para um token. Se o token já não estiver
// registado, remove-o do sítio certo (mapa ou campo legado).
async function enviarPush(username, entry, payload) {
  try {
    await getMessaging().send({
      token: entry.token,
      data: payload,
      webpush: { headers: { Urgency: "high" } },
    });
    logger.info("push enviado", { username });
    return true;
  } catch (err) {
    logger.error("erro ao enviar push", { username, code: err.code, message: err.message });
    if (err.code === "messaging/registration-token-not-registered") {
      const ref = db.collection("fcmTokens").doc(username);
      if (entry.tid) await ref.update({ [`tokens.${entry.tid}`]: FieldValue.delete() }).catch(() => {});
      else           await ref.update({ token: FieldValue.delete() }).catch(() => {});
    }
    return false;
  }
}

exports.notificarAdmin = onDocumentCreated(
  { document: "adminNotificacoes/{docId}", region: "europe-west1" },
  async (event) => {
    const data = event.data.data();
    logger.info("notificarAdmin: disparado", { tipo: data?.tipo, jovem: data?.jovem });
    if (!data) return;

    const targets = ["teresa", "admin"];
    const tokenDocs = await Promise.all(
      targets.map(u => db.collection("fcmTokens").doc(u).get())
    );
    // Cada utilizador pode ter vários aparelhos — junta todos os tokens.
    const alvos = [];
    tokenDocs.forEach((docSnap, i) => {
      coletarTokens(docSnap.data()).forEach(entry => alvos.push({ username: targets[i], entry }));
    });

    logger.info("notificarAdmin: tokens encontrados", { count: alvos.length });
    if (alvos.length === 0) return;

    const labeller = NOTIF_LABELS[data.tipo] || ((d) => ({ title: "🔔 JEEP EDUCA+", body: d.texto || "Nova notificação" }));
    const { title, body } = labeller(data);
    const payload = {
      title, body,
      icon: "https://nep-app.github.io/eu/logo.png",
      badge: "https://nep-app.github.io/eu/logo.png",
      link: "https://nep-app.github.io/eu/",
    };

    await Promise.all(alvos.map(a => enviarPush(a.username, a.entry, payload)));
  }
);

// Admin (Teresa) -> jovem: só envia push quando o documento tem push:true
// explícito — a Teresa escolhe, por cada envio, se quer só a notificação
// dentro da app (sempre acontece) ou também um push no telemóvel.
// Menções no fórum continuam automáticas (escrevem push:true na origem).
exports.notificarJovem = onDocumentCreated(
  { document: "notifications/{username}/items/{itemId}", region: "europe-west1" },
  async (event) => {
    const data = event.data.data();
    const { username } = event.params;
    logger.info("notificarJovem: disparado", { username, push: data?.push });
    if (!data || !username || data.push !== true) return;

    const tokenDoc = await db.collection("fcmTokens").doc(username).get();
    const alvos = coletarTokens(tokenDoc.data());
    logger.info("notificarJovem: tokens encontrados", { username, count: alvos.length });
    if (alvos.length === 0) return;

    const remetente = ["teresa", "admin"].includes(data.from) ? "Teresa" : "JEEP EDUCA+";
    const title = data.mencao ? "🔔 Foste mencionado(a)" : `🔔 ${remetente}`;
    const body  = (data.text || "Tens uma nova notificação").substring(0, 120);
    const payload = {
      title, body,
      icon: "https://nep-app.github.io/eu/logo.png",
      badge: "https://nep-app.github.io/eu/logo.png",
      link: "https://nep-app.github.io/eu/",
    };

    // Envia a todos os aparelhos deste utilizador (um por token).
    await Promise.all(alvos.map(entry => enviarPush(username, entry, payload)));
  }
);

// ─── PUBLICAÇÃO AGENDADA ──────────────────────────────────────────────
// Cada documento em `agendados` tem { tipo, payload, publishAt (ms), done }.
// A função corre de 30 em 30 min e publica o que já estiver na hora,
// replicando a lógica do painel admin — mas do lado do servidor, para
// sair sozinho mesmo que ninguém tenha a app aberta.

// tipo "pergunta" — nova Pergunta da Semana (como AdminPrograma.publicar)
async function publicarPergunta(payload) {
  const { text, options = [], modes = [], push = false } = payload || {};
  if (!text) return;
  const agora = new Date();
  // Arquiva a pergunta anterior + respostas (como faz o painel).
  const prev = (await db.collection("config").doc("activeQuestion").get()).data();
  if (prev && prev.text) {
    const respostas = {};
    await Promise.all(JOVENS.map(async u => {
      const ud = (await db.collection("userData").doc(u).get()).data() || {};
      respostas[u] = {
        answered: !!ud.answered, answerText: ud.answerText || null,
        answerType: ud.answerType || null, answerMedia: ud.answerMedia || null,
        answerDate: ud.answerDate || null,
      };
    }));
    await db.collection("perguntasArquivo").add({
      text: prev.text, archivedAt: Date.now(), date: fmtLabel(agora), respostas,
    });
  }
  await db.collection("config").doc("activeQuestion").set({
    text, options, modes, date: Date.now(),
  });
  await Promise.all(ALLOWED.map(async u => {
    await db.collection("userData").doc(u).set({ answered: false, answeredAskedAt: Date.now() }, { merge: true });
    await db.collection("notifications").doc(u).collection("items").add({
      from: "teresa", text: "💬 Nova pergunta da semana!", date: fmtLabel(agora),
      read: false, tipo: "proposta", push: !!push,
    });
  }));
}

// tipo "pedido" — pedidos/lembretes (como AdminGeral.launchRequest)
async function lancarPedido(payload) {
  const { launchType, launchTarget = "all", prazo = null, push = false } = payload || {};
  const MSGS = {
    auto:          "📊 Nova Autoavaliação pedida!",
    satisf:        "😊 Nova Avaliação de Satisfação pedida!",
    pia:           "📋 Atualização do PIA pedida!",
    roda:          "🌸 Nova Roda da Vida pedida!",
    swot:          "🔍 Raio-X do Projeto pedido!",
    pergunta:      "💬 Lembrete: Responde à Pergunta da Semana!",
    lembreteQuiz:  "🧠 Lembrete: Tens um novo Dilema (Quiz) à tua espera nos Desafios!",
    lembreteGeral: "📢 A Teresa tem um aviso para ti. Vai ver as novidades!",
  };
  // NOTA: "pergunta" NÃO está aqui de propósito — o lembrete da pergunta é só
  // uma notificação; repor answered:false apagava respostas já dadas (bug).
  const FIELD = { satisf: "sSaved", pia: "piaSaved", roda: "rodaSaved", swot: "swotSaved" };
  let msg = MSGS[launchType] || "📢 A Teresa tem um aviso para ti.";
  if (prazo) msg += ` ⏰ Prazo: ${fmtPrazo(prazo)}`;
  const targets = launchTarget === "all" ? ALLOWED : [launchTarget];
  const isReminder = launchType === "lembreteGeral";
  const agora = new Date();
  // Autoavaliação agendada: abre um novo ciclo (para agrupar por ronda).
  if (launchType === "auto") {
    await db.collection("config").doc("autoCiclo").set({ id: Date.now(), label: fmtLabel(agora) });
  }
  await Promise.all(targets.map(async u => {
    if (launchType === "auto") {
      await db.collection("userData").doc(u).set({
        autoSaved: false, autoNewRound: false, dScores: {}, dNotas: {}, autoAskedAt: Date.now(),
        ...(prazo ? { autoNewRoundPrazo: prazo } : {}),
      }, { merge: true });
    } else if (FIELD[launchType]) {
      await db.collection("userData").doc(u).set({
        [FIELD[launchType]]: false, [FIELD[launchType] + "AskedAt"]: Date.now(),
        ...(prazo ? { [FIELD[launchType] + "Prazo"]: prazo } : {}),
      }, { merge: true });
    }
    await db.collection("notifications").doc(u).collection("items").add({
      from: "teresa", text: msg, date: fmtFull(agora), read: false, ts: Date.now(), push: !!push,
      ...(isReminder ? {} : { tipo: "proposta" }),
      ...(prazo ? { prazo } : {}),
    });
  }));
}

// tipo "mensagem" — mensagem aos jovens (como AdminMsgs.enviarNovaMsg)
async function enviarMensagem(payload) {
  const { dest = "all", texto, push = false } = payload || {};
  if (!texto) return;
  const targets = dest === "all" ? ALLOWED : [dest];
  const agora = new Date();
  await Promise.all(targets.map(u =>
    db.collection("notifications").doc(u).collection("items").add({
      from: "teresa", text: `💬 Teresa: ${texto}`, date: fmtFull(agora),
      read: false, ts: Date.now(), push: !!push,
    })
  ));
}

// tipo "forum" — post no fórum + notificação (como AdminMural)
async function publicarForum(payload) {
  const { canal = "anuncios", texto, push = false } = payload || {};
  if (!texto) return;
  const agora = new Date();
  await db.collection("forum").doc(canal).collection("posts").add({
    user: "Teresa (GO)", username: "admin", color: "#22d3ee",
    text: texto, media: null, time: fmtFull(agora), ts: Date.now(),
    reactions: {}, reactedBy: {}, replies: [],
  });
  const preview = texto.substring(0, 80) + (texto.length > 80 ? "…" : "");
  await Promise.all(ALLOWED.filter(u => u !== "ricardo").map(u =>
    db.collection("notifications").doc(u).collection("items").add({
      from: "teresa", text: `🌐 Teresa publicou em ${canal}: "${preview}"`,
      date: fmtFull(agora), read: false, ts: Date.now(), canal, push: !!push,
    })
  ));
}

// tipo "dilema" — cria um Dilema/Quiz (como AdminQuizzes.salvarQuiz)
async function publicarDilema(payload) {
  const { title, badge = "", scenario, opts = [], prazo = null, correct = null } = payload || {};
  if (!title || !scenario) return;
  await db.collection("quizzes").add({
    title, badge, scenario, prazo, correct, active: true, ts: Date.now(),
    opts, mock: { A: 0, B: 0, C: 0 }, responses: {},
  });
}

// tipo "votacao" — cria uma votação/poll (como AdminVotacoes.criarVotacao)
async function publicarVotacao(payload) {
  const { title, type = "opcao", options = [], targetUsers = [], push = false } = payload || {};
  if (!title || options.length < 2) return;
  const votes = {};
  options.forEach(op => { votes[op] = []; });
  await db.collection("polls").add({
    title, type, options, votes, active: true, ts: Date.now(), demo: false, targetUsers,
  });
  // Avisar os jovens (com push opcional).
  const alvos = targetUsers.length ? targetUsers : JOVENS;
  const agora = new Date();
  await Promise.all(alvos.map(u =>
    db.collection("notifications").doc(u).collection("items").add({
      from: "teresa", text: `🗳️ Nova votação: ${title}`,
      date: fmtFull(agora), read: false, ts: Date.now(), push: !!push,
    })
  ));
}

// Semana ISO simplificada (igual a getWeekKey no cliente).
function getWeekKey(d) {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const wk = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return d.getFullYear() + "-W" + wk;
}

// tipo "missao" — cria uma missão semanal (como AdminMissoes.addAdminMission)
async function publicarMissao(payload) {
  const { text, xp = 10, prazo = null, push = false } = payload || {};
  if (!text) return;
  await db.collection("missions").add({
    text, xp, week: getWeekKey(new Date()), prazo, ts: Date.now(),
  });
  const agora = new Date();
  await Promise.all(ALLOWED.map(u =>
    db.collection("notifications").doc(u).collection("items").add({
      from: "teresa", text: `🎯 Nova missão: ${text} (+${xp} XP)`,
      date: fmtFull(agora), read: false, ts: Date.now(), push: !!push,
    })
  ));
}

// Função agendada (2ª geração): corre de 30 em 30 min e publica o que
// estiver na hora. Nota: precisa que a conta de deploy tenha o papel
// "Cloud Functions Admin" para conseguir configurar o invoker do Scheduler.
exports.processarAgendados = onSchedule(
  { schedule: "*/30 * * * *", timeZone: "Europe/Lisbon", region: "europe-west1" },
  async () => {
    const agora = Date.now();
    // Salvaguarda: não publicar agendamentos com data já MUITO passada
    // (ex.: o agendador esteve em baixo e um agendamento antigo ficou preso).
    // Evita disparos "zombie" que republicavam a pergunta e apagavam respostas.
    const MAX_ATRASO_MS = 6 * 60 * 60 * 1000; // 6 horas
    // Só os pendentes (done==false); filtra a hora em código para não
    // precisar de índice composto no Firestore.
    const snap = await db.collection("agendados").where("done", "==", false).get();
    const devidos = snap.docs.filter(d => (d.data().publishAt || 0) <= agora);
    logger.info("processarAgendados a correr", { pendentes: snap.size, aPublicar: devidos.length, agora });

    for (const docSnap of devidos) {
      const a = docSnap.data();
      // Demasiado atrasado → não publica, marca como saltado e avisa a admin.
      if (agora - (a.publishAt || 0) > MAX_ATRASO_MS) {
        logger.warn("agendado saltado (demasiado atrasado)", { id: docSnap.id, tipo: a.tipo, publishAt: a.publishAt });
        await docSnap.ref.update({ done: true, saltadoPorAtraso: true, doneAt: agora });
        try {
          await db.collection("adminNotificacoes").add({
            tipo: "MENSAGEM", jovem: "sistema", anon: false, lida: false, ts: agora,
            texto: `Agendamento (${a.tipo}) não publicado: estava demasiado atrasado. Republica à mão se precisares.`,
          });
        } catch (e) { /* não crítico */ }
        continue;
      }
      try {
        if      (a.tipo === "pergunta") await publicarPergunta(a.payload);
        else if (a.tipo === "pedido")   await lancarPedido(a.payload);
        else if (a.tipo === "mensagem") await enviarMensagem(a.payload);
        else if (a.tipo === "forum")    await publicarForum(a.payload);
        else if (a.tipo === "dilema")   await publicarDilema(a.payload);
        else if (a.tipo === "votacao")  await publicarVotacao(a.payload);
        else if (a.tipo === "missao")   await publicarMissao(a.payload);
        else { logger.warn("agendado com tipo desconhecido", { id: docSnap.id, tipo: a.tipo }); }
        await docSnap.ref.update({ done: true, doneAt: agora });
        logger.info("agendado publicado", { id: docSnap.id, tipo: a.tipo });
      } catch (err) {
        logger.error("erro ao publicar agendado", { id: docSnap.id, tipo: a.tipo, message: err.message });
        await docSnap.ref.update({ erro: err.message, tentadoEm: agora });
      }
    }
  }
);
