// Streak de ENTRADAS (login) — separado do dayStreak baseado em ações.
// Corre uma vez por abertura da app (ver JovensApp.jsx). Regras pedidas:
//  - 2 dias seguidos  → XP + pop-up.
//  - a cada +5 dias seguidos (5,10,15,20…) → sempre XP + pop-up.
//  - medalha automática (1ª vez em cada patamar) aos 5, 10, 20, 30, 40, 50…
//    (5 e depois múltiplos de 10). Voltar a atingir o mesmo patamar = só XP + pop-up.
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import { nowFull, ALL_MEDALS, STREAK_MEDALHAS } from "./data.js";

const XP_NORMAL    = 10; // 2 dias e patamares intermédios
const XP_MILESTONE = 20; // dias em que também há (ou houve) medalha

// Milestone de medalha: 5, e depois 10/20/30/40/50… (5 ou múltiplo de 10)
function isMedalMilestone(streak) {
  return streak === 5 || (streak >= 10 && streak % 10 === 0);
}

// Devolve null se não há nada a mostrar; caso contrário
// { streak, xp, medal } (medal pode ser null quando é só XP + pop-up).
export async function processarLoginStreak(username) {
  const ref  = doc(db, "userData", username);
  const snap = await getDoc(ref);
  const d    = snap.exists() ? snap.data() : {};

  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // Já contámos a entrada de hoje — nada a fazer.
  if (d.lastLoginDay === today) return null;

  const streak = d.lastLoginDay === yesterday ? (d.loginStreak || 0) + 1 : 1;
  const premia = streak === 2 || streak % 5 === 0;
  const milestone = isMedalMilestone(streak);

  const update = { loginStreak: streak, lastLoginDay: today };
  let xp = 0, medal = null;

  if (premia) {
    xp = milestone ? XP_MILESTONE : XP_NORMAL;

    // Medalha automática só na 1ª vez de cada patamar. Guardada em
    // userData.streakMedals (o próprio jovem pode escrever no seu userData;
    // as regras não deixam o cliente escrever em medals/{username}).
    if (milestone) {
      const medalId = STREAK_MEDALHAS[streak];
      const jaTem   = (d.streakMedals || []).includes(medalId);
      if (medalId && !jaTem) {
        update.streakMedals = [...(d.streakMedals || []), medalId];
        medal = ALL_MEDALS.find(m => m.id === medalId) || null;
      }
    }

    const acao = medal
      ? `Medalha ${medal.icon} ${medal.label} — ${streak} dias seguidos na app! 🏅`
      : `🔥 ${streak} dias seguidos a entrar na app!`;
    update.history = [...(d.history || []), { date: nowFull(), action: acao, ts: Date.now(), xp }];
    update.weekXp  = (d.weekXp || 0) + xp;
  }

  await setDoc(ref, update, { merge: true });
  return premia ? { streak, xp, medal } : null;
}
