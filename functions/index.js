const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger }            = require("firebase-functions");
const { initializeApp }     = require("firebase-admin/app");
const { getFirestore }      = require("firebase-admin/firestore");
const { getMessaging }      = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();

const NOTIF_LABELS = {
  MENSAGEM:  (d) => ({ title: "💬 Nova mensagem",              body: `${d.jovem}: ${(d.texto||"").substring(0,80)}` }),
  PIA:       (d) => ({ title: "📋 PIA recebido",                body: `${d.jovem} enviou o Plano Individual de Ação` }),
  AJUDA_PIA: (d) => ({ title: `🆘 ${d.jovem} precisa de ajuda`, body: `"${(d.pergunta||"PIA").substring(0,80)}"` }),
};

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
    const tokens = tokenDocs
      .map((doc, i) => ({ token: doc.data()?.token, username: targets[i] }))
      .filter(t => t.token);

    logger.info("notificarAdmin: tokens encontrados", { count: tokens.length, usernames: tokens.map(t => t.username) });
    if (tokens.length === 0) return;

    const labeller = NOTIF_LABELS[data.tipo] || ((d) => ({ title: "🔔 JEEP EDUCA+", body: d.texto || "Nova notificação" }));
    const { title, body } = labeller(data);

    await Promise.all(tokens.map(async ({ token, username }) => {
      try {
        // Mensagem "data-only" (sem campo "notification"): o browser não
        // mostra nada sozinho — só o nosso service worker (onBackgroundMessage
        // em src/sw.js) mostra a notificação. Evita a duplicação que
        // acontecia quando o browser E o service worker mostravam cada um a sua.
        await getMessaging().send({
          token,
          data: {
            title, body,
            icon: "https://nep-app.github.io/eu/logo.png",
            badge: "https://nep-app.github.io/eu/logo.png",
            link: "https://nep-app.github.io/eu/",
          },
        });
        logger.info("notificarAdmin: push enviado", { username });
      } catch (err) {
        logger.error("notificarAdmin: erro ao enviar push", { username, code: err.code, message: err.message });
        if (err.code === "messaging/registration-token-not-registered") {
          await db.collection("fcmTokens").doc(username).delete();
        }
      }
    }));
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
    const token = tokenDoc.data()?.token;
    logger.info("notificarJovem: token encontrado?", { username, hasToken: !!token });
    if (!token) return;

    const remetente = ["teresa", "admin"].includes(data.from) ? "Teresa" : "JEEP EDUCA+";
    const title = data.mencao ? "🔔 Foste mencionado(a)" : `🔔 ${remetente}`;
    const body  = (data.text || "Tens uma nova notificação").substring(0, 120);

    try {
      // Mensagem "data-only" — ver comentário em notificarAdmin acima.
      await getMessaging().send({
        token,
        data: {
          title, body,
          icon: "https://nep-app.github.io/eu/logo.png",
          badge: "https://nep-app.github.io/eu/logo.png",
          link: "https://nep-app.github.io/eu/",
        },
      });
      logger.info("notificarJovem: push enviado", { username });
    } catch (err) {
      logger.error("notificarJovem: erro ao enviar push", { username, code: err.code, message: err.message });
      if (err.code === "messaging/registration-token-not-registered") {
        await db.collection("fcmTokens").doc(username).delete();
      }
    }
  }
);
