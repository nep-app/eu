const { onDocumentCreated } = require("firebase-functions/v2/firestore");
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
    if (!data) return;

    const targets = ["teresa", "admin"];
    const tokenDocs = await Promise.all(
      targets.map(u => db.collection("fcmTokens").doc(u).get())
    );
    const tokens = tokenDocs
      .map((doc, i) => ({ token: doc.data()?.token, username: targets[i] }))
      .filter(t => t.token);

    if (tokens.length === 0) return;

    const labeller = NOTIF_LABELS[data.tipo] || ((d) => ({ title: "🔔 JEEP EDUCA+", body: d.texto || "Nova notificação" }));
    const { title, body } = labeller(data);

    await Promise.all(tokens.map(async ({ token, username }) => {
      try {
        await getMessaging().send({
          token,
          notification: { title, body },
          webpush: {
            notification: { icon: "https://nep-app.github.io/eu/logo.png", badge: "https://nep-app.github.io/eu/logo.png" },
            fcmOptions: { link: "https://nep-app.github.io/eu/" },
          },
        });
      } catch (err) {
        if (err.code === "messaging/registration-token-not-registered") {
          await db.collection("fcmTokens").doc(username).delete();
        }
      }
    }));
  }
);

// Admin (Teresa) -> jovem: dispara sempre que é escrita uma notificação
// individual (feedback de PIA/tarefas/agenda, mensagens, recursos novos,
// menções no fórum, pedidos/lembretes, etc.) — cobre tudo o que já escreve
// em notifications/{username}/items sem precisar de mexer nesses ficheiros.
exports.notificarJovem = onDocumentCreated(
  { document: "notifications/{username}/items/{itemId}", region: "europe-west1" },
  async (event) => {
    const data = event.data.data();
    const { username } = event.params;
    if (!data || !username) return;

    const tokenDoc = await db.collection("fcmTokens").doc(username).get();
    const token = tokenDoc.data()?.token;
    if (!token) return;

    const remetente = ["teresa", "admin"].includes(data.from) ? "Teresa" : "JEEP EDUCA+";
    const title = data.mencao ? "🔔 Foste mencionado(a)" : `🔔 ${remetente}`;
    const body  = (data.text || "Tens uma nova notificação").substring(0, 120);

    try {
      await getMessaging().send({
        token,
        notification: { title, body },
        webpush: {
          notification: { icon: "https://nep-app.github.io/eu/logo.png", badge: "https://nep-app.github.io/eu/logo.png" },
          fcmOptions: { link: "https://nep-app.github.io/eu/" },
        },
      });
    } catch (err) {
      if (err.code === "messaging/registration-token-not-registered") {
        await db.collection("fcmTokens").doc(username).delete();
      }
    }
  }
);
