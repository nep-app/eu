# JEEP EDUCA+

Aplicação web (PWA) de acompanhamento do programa **JEEP EDUCA+**, para
educadores/gestores de operação (a "Teresa") acompanharem um grupo de
jovens ao longo do programa: desafios, reflexões, plano individual,
fórum, agenda, gamificação (XP e medalhas) e notificações.

É uma **PWA** (instalável no telemóvel e no computador), construída em
**React + Vite** e assente em **Firebase** (Auth, Firestore, Storage,
Cloud Messaging e Cloud Functions). É publicada automaticamente no
**GitHub Pages**.

---

## Índice

- [Como funciona (visão geral)](#como-funciona-visão-geral)
- [Tecnologias](#tecnologias)
- [Perfis de utilizador](#perfis-de-utilizador)
- [Funcionalidades — Jovens](#funcionalidades--jovens)
- [Funcionalidades — Admin (Teresa)](#funcionalidades--admin-teresa)
- [Notificações push](#notificações-push)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Base de dados (Firestore)](#base-de-dados-firestore)
- [Desenvolvimento local](#desenvolvimento-local)
- [Deploy](#deploy)

---

## Como funciona (visão geral)

Cada utilizador entra com um **username + password** (autenticação Firebase
por email interno `username@jeep.app`). Conforme a conta, a app mostra:

- **Jovens** → a app de acompanhamento (Início, Desafios, Fórum, PIA, Perfil).
- **Admin (Teresa)** → um painel de gestão separado (jovens, programa,
  fórum, satisfação, mensagens, etc.).

Todos os dados são guardados em tempo real no **Firestore**, por isso as
alterações aparecem imediatamente em todos os aparelhos. A Teresa lança
desafios e pedidos; os jovens respondem; as ações geram notificações
dentro da app e (opcionalmente) **push** no telemóvel.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite |
| PWA / Service Worker | `vite-plugin-pwa` (`src/sw.js`) |
| Autenticação | Firebase Auth (email/password) |
| Base de dados | Cloud Firestore (tempo real) |
| Ficheiros (fotos/áudio) | Firebase Storage |
| Push | Firebase Cloud Messaging (FCM) |
| Backend/servidor | Firebase Cloud Functions (`functions/index.js`) |
| Hosting | GitHub Pages (deploy automático via GitHub Actions) |

---

## Perfis de utilizador

- **Jovens** — os participantes do programa (lista em `ALLOWED_USERNAMES`).
- **teresa** — conta especial: usa a app dos jovens mas com tema claro e
  também recebe as notificações de admin.
- **admin** — o painel de gestão (`TeresaAdmin.jsx`), componente totalmente
  separado da app dos jovens.
- **demo / ricardo** — contas especiais para demonstração/observação.

---

## Funcionalidades — Jovens

- **Início** (`HomeTab`) — painel principal:
  - **Ações Pendentes** — desafios lançados pela Teresa que ainda faltam fazer.
  - **Notificações** — reações/respostas da Teresa, menções no fórum, etc.
  - **A minha lista** — tarefas pessoais (com opção de partilhar com a Teresa).
  - **Agenda / eventos** e **votações**.
- **Desafios** (`DesafiosTab`):
  - **Pergunta da Semana** — reflexão (texto, 3 palavras, rating, áudio/foto).
  - **Autoavaliação** — avaliação de competências por dimensões.
  - **Satisfação** — avaliação (anónima) de como corre o programa.
  - **Dilemas / Quiz** — cenários de escolha.
- **Fórum** (`ForumTab`) — canais temáticos, publicações, reações,
  comentários, menções (`@`) e um separador de **Recursos**.
- **PIA** (`PiaTab`) — Plano Individual de Ação do jovem.
- **Perfil** (`PerfilTab`) — Roda da Vida, medalhas/XP, cápsulas do tempo,
  guia da app e **ativação das notificações push**.

Gamificação transversal: **XP**, **streaks** e **medalhas** por participação.

---

## Funcionalidades — Admin (Teresa)

Painel `TeresaAdmin.jsx`, com os separadores:

- **Jovens** — estado de cada jovem, histórico, reset de desafios, feedback.
- **Programa** — lançar Pergunta da Semana, gerir Autoavaliações, arquivar rondas.
- **PIA** — desbloquear e comentar os planos individuais.
- **Fórum** — publicar anúncios, gerir posts e recursos.
- **Satisfação** — ver respostas de satisfação.
- **Msgs** — mensagens diretas de/para os jovens.
- **Preview** — ver a app tal como um jovem a vê.

A Teresa pode ainda: lançar pedidos/lembretes (com prazo opcional),
gerir agenda, missões, quizzes, votações, mural e relatórios.

Sempre que um jovem faz uma ação relevante (entregar PIA, responder a um
desafio, partilhar tarefa/evento, publicar/comentar no fórum, etc.), é
criado um registo em `adminNotificacoes` que notifica a Teresa.

---

## Notificações push

Sistema baseado em **Firebase Cloud Messaging** com dois lados:

**No cliente** (`src/firebase.js` + `src/sw.js`):
1. Pede permissão e gera um **token FCM** do aparelho (`getToken`).
2. Guarda o token em `fcmTokens/{username}` — **um token por aparelho**
   (mapa `tokens`, indexado por um hash do token), para que o mesmo
   utilizador possa receber em vários aparelhos (ex: PC + telemóvel) sem
   um apagar o token do outro.
3. Mostra a notificação através do **service worker**
   (`onBackgroundMessage` com a app fechada; `onMessage` +
   `registration.showNotification()` com a app aberta).

**No servidor** (`functions/index.js`):
- `notificarAdmin` — dispara quando há um novo `adminNotificacoes` e envia
  push para as contas `teresa` e `admin`.
- `notificarJovem` — dispara em `notifications/{username}/items` e envia
  push ao jovem **apenas quando o documento tem `push: true`** (a Teresa
  escolhe, por envio, se quer só a notificação na app ou também push).

Decisões importantes (e porquê):
- Mensagens **data-only** (sem o campo `notification`) + o service worker a
  mostrar a notificação → evita **notificações duplicadas**.
- Header **`Urgency: high`** → mensagens data-only iriam com prioridade
  normal e o Android (sobretudo Xiaomi/MIUI) pode retê-las em segundo plano.

Limitações conhecidas (do lado do dispositivo, não da app):
- **iPhone/iOS** — o push só funciona com a app **instalada no ecrã
  principal** (via Safari → Partilhar → "Adicionar ao ecrã principal") e
  em **iOS 16.4+**. Em separador normal do Safari, não funciona.
- **Android/Xiaomi** — a gestão de bateria agressiva da MIUI pode bloquear
  o registo (`AbortError`) ou a entrega em segundo plano; pode ser preciso
  reiniciar, atualizar o Google Play Services ou permitir o arranque
  automático da app.

---

## Estrutura do projeto

```
src/
  App.jsx            # Login + roteamento entre app de jovens e admin
  JovensApp.jsx      # App dos jovens (liga ao Firestore, define tabs)
  TeresaAdmin.jsx    # Painel de administração da Teresa
  firebase.js        # Config Firebase + registo de push (por aparelho)
  data.js            # Constantes: utilizadores, dimensões, canais, medalhas…
  theme.jsx          # Componentes e estilos partilhados
  sw.js              # Service worker (push em segundo plano)
  tabs/
    HomeTab, DesafiosTab, ForumTab, PiaTab, PerfilTab
    home/     # Início: tarefas, agenda, votações, extras
    desafios/ # Pergunta, Autoavaliação, Satisfação, Quiz
    forum/    # Composer e Post do fórum
    admin/    # Todos os separadores do painel de admin
functions/
  index.js           # Cloud Functions (notificarAdmin, notificarJovem)
.github/workflows/
  deploy.yml         # Build + deploy (Pages) + deploy das Functions
```

---

## Base de dados (Firestore)

Principais coleções:

| Coleção | Conteúdo |
|---|---|
| `users` | Consentimento/GDPR por utilizador |
| `userData/{username}` | Dados pessoais: respostas, scores, XP, histórico, PIA… |
| `todos/{username}/items` | Tarefas do jovem |
| `events` | Eventos/agenda |
| `forum/{canal}/posts` | Publicações do fórum |
| `recursos` | Recursos partilhados pela Teresa |
| `messages` | Mensagens para a Teresa |
| `notifications/{username}/items` | Notificações recebidas (com flag `push`) |
| `adminNotificacoes` | Ações dos jovens que notificam a Teresa |
| `fcmTokens/{username}` | Tokens de push, um por aparelho (mapa `tokens`) |
| `config` | Configuração global (pergunta ativa, features…) |
| `medals`, `polls`, `missions`, `quizzes`, `satisfacao`, `perguntasArquivo` | Gamificação e conteúdos |

As regras de segurança do Firestore garantem que cada jovem só acede aos
seus dados e que as áreas de admin exigem a conta `admin@jeep.app`.

---

## Desenvolvimento local

Requisitos: Node 20.

```bash
npm install
cp .env.example .env    # preencher com as chaves do teu projeto Firebase
npm run dev             # arranca em modo desenvolvimento
npm run build           # build de produção (pasta dist/)
```

Variáveis de ambiente necessárias (ver `.env.example`):
`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
`VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
`VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` e
`VITE_FIREBASE_VAPID_KEY` (para o push).

---

## Deploy

O deploy é **automático**: cada `push` para o branch `haha` dispara o
workflow `.github/workflows/deploy.yml`, que:

1. Faz **build** da app e publica no **GitHub Pages**.
2. Faz **deploy das Cloud Functions** para o Firebase.

As chaves do Firebase são injetadas a partir dos **secrets** do GitHub, não
estão no código.
