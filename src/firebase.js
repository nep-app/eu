import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Dynamic import — só carrega firebase/messaging quando chamado, nunca ao iniciar a app
export async function getMessagingInstance() {
  try {
    const { getMessaging, isSupported } = await import("firebase/messaging");
    const ok = await isSupported();
    return ok ? getMessaging(app) : null;
  } catch {
    return null;
  }
}

// O Firebase só entrega ao onBackgroundMessage do service worker quando a
// aba não está em foco — com a app aberta, as mensagens (data-only) chegam
// aqui em vez disso. Sem isto, um push enviado enquanto a app está aberta
// desaparece sem mostrar nada.
let pushForegroundOuvido = false;
async function escutarPushEmPrimeiroPlano(messaging) {
  if (pushForegroundOuvido) return;
  pushForegroundOuvido = true;
  const { onMessage } = await import("firebase/messaging");
  onMessage(messaging, payload => {
    const d = payload.data || {};
    if (Notification.permission === "granted") {
      new Notification(d.title || "JEEP EDUCA+", {
        body: d.body || "",
        icon: d.icon || "/eu/logo.png",
        tag: "jeep-push",
      });
    }
  });
}

// Pede permissão e guarda o token FCM para este username — chamado tanto
// pelo JovensApp (jovens + conta teresa) como pelo TeresaAdmin (conta admin),
// que são componentes completamente separados. Devolve { ok, reason } para
// quem chamar (ex: botão manual no Perfil) poder mostrar o resultado real
// em vez de falhar sempre em silêncio.
export async function registarPushNotifications(username) {
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!username)  return { ok:false, reason:"sem-username" };
  if (!vapidKey)  return { ok:false, reason:"sem-vapid-key" };
  if (!("serviceWorker" in navigator)) return { ok:false, reason:"sem-service-worker" };
  if (!("Notification" in window))     return { ok:false, reason:"sem-notification-api" };

  try {
    if (Notification.permission !== "granted") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return { ok:false, reason:`permissao-${perm}` };
    }
    const swReg = await navigator.serviceWorker.ready;
    console.log("SW ready:", swReg.scope, swReg.active?.state);
    const messaging = await getMessagingInstance();
    if (!messaging) return { ok:false, reason:"messaging-nao-suportado" };
    const { getToken } = await import("firebase/messaging");
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg });
    if (!token) return { ok:false, reason:"sem-token" };
    await setDoc(doc(db, "fcmTokens", username), { token, updatedAt: Date.now() }, { merge: true });
    escutarPushEmPrimeiroPlano(messaging);
    return { ok:true };
  } catch (err) {
    console.error("registarPushNotifications falhou:", err);
    const detalhe = [err?.name, err?.code, err?.message].filter(Boolean).join(" | ");
    return { ok:false, reason: detalhe || "erro-desconhecido" };
  }
}
