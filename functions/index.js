const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp }     = require("firebase-admin/app");
const { getFirestore }      = require("firebase-admin/firestore");
const { getMessaging }      = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();

const NOTIF_LABELS = {
  MENSAGEM:  (d) => ({ title: "💬 Nova mensagem",      body: `${d.jovem}: ${(d.texto||"").substring(0,80)}` }),
  PIA:       (d) => ({ title: "📋 PIA recebido",        body: `${d.jovem} enviou o Plano Individual de Ação` }),
  AJUDA_PIA: (d) => ({ title: `🆘 ${d.jovem} precisa de ajuda`, body: `"${(d.pergunta||"PIA").substring(0,80)}"` }),
};

exports.notificarAdmin = onDocumentCreated(
  { document: "adminNotificacoes/{docId}", region: "europe-west1" },
  async (event) => {
    const data = event.data.data();
    if (!data) return;

    // Collect tokens: teresa + admin (if different token exists)
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
            notification: {
              icon:  "https://nep-app.github.io/eu/logo.png",
              badge: "https://nep-app.github.io/eu/logo.png",
              requireInteraction: false,
            },
            fcmOptions: { link: "https://nep-app.github.io/eu/" },
          },
        });
      } catch (err) {
        // Token expirado — limpar
        if (err.code === "messaging/registration-token-not-registered") {
          await db.collection("fcmTokens").doc(username).delete();
        }
      }
    }));
  }
);
