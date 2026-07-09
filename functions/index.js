const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger }            = require("firebase-functions");
const { initializeApp }     = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging }      = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();

const NOTIF_LABELS = {
  MENSAGEM:  (d) => ({ title: "💬 Nova mensagem",              body: `${d.jovem}: ${(d.texto||"").substring(0,80)}` }),
  PIA:       (d) => ({ title: "📋 PIA recebido",                body: `${d.jovem} enviou o Plano Individual de Ação` }),
  AJUDA_PIA: (d) => ({ title: `🆘 ${d.jovem} precisa de ajuda`, body: `"${(d.pergunta||"PIA").substring(0,80)}"` }),
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
