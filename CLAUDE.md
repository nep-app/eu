# CLAUDE.md

Guia do projeto para o Claude. Contém tudo o que já foi aprendido sobre a
app: estrutura, o que cada ficheiro faz, escolhas de design, preferências
da autora e as secções que existem.

---

## O que é

**JEEP EDUCA+** — PWA de acompanhamento de um programa educativo. A
"Teresa" (gestora) acompanha um grupo de jovens: desafios, reflexões,
plano individual (PIA), fórum, agenda, gamificação (XP/medalhas) e
notificações. React + Vite + Firebase, publicada no GitHub Pages.

- **Idioma do projeto:** português (código, UI, comentários e commits).
- **Branch de produção/deploy:** `haha` (cada push faz deploy automático).

---

## Convenções do projeto (IMPORTANTE — manter)

- Projeto em JavaScript (**React + Firebase**).
- As notificações de recursos devem navegar para a secção **Recursos** e
  ser etiquetadas de forma fiável com `tipo: "recurso"`.
- Cada tipo de notificação usa um campo `tipo` para saber para onde navegar
  (ex.: `recurso`, `pia`, `roda`, `auto`, `proposta`, ...). Ao criar novas
  notificações, define sempre o `tipo` correto.

## Testes & Commits

- Executa a build (`npm run build`) e verifica que passa **antes de qualquer
  commit**, sobretudo depois de mexer na lógica de **notificações** ou de
  **navegação**.
- Mensagens de commit curtas, em português, no estilo convencional
  (`fix:`, `feat:`, `docs:`...).
- Não abrir Pull Requests a menos que seja pedido explicitamente.

---

## Stack técnica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite |
| PWA / Service Worker | `vite-plugin-pwa` (`src/sw.js`) |
| Auth | Firebase Auth (email/password, `username@jeep.app`) |
| Base de dados | Cloud Firestore (tempo real via `onSnapshot`) |
| Ficheiros | Firebase Storage (fotos/áudio) |
| Push | Firebase Cloud Messaging (FCM) |
| Servidor | Firebase Cloud Functions (`functions/index.js`) |
| Hosting | GitHub Pages (GitHub Actions) |

---

## Estrutura de pastas

```
src/
  App.jsx            # Login + roteamento: escolhe JovensApp ou TeresaAdmin
  JovensApp.jsx      # App dos jovens: liga ao Firestore, define as 5 tabs
  TeresaAdmin.jsx    # Painel de admin (componente separado)
  firebase.js        # Config Firebase + registo de push (token por aparelho)
  data.js            # Constantes: utilizadores, dimensões, canais, medalhas, helpers de data
  theme.jsx          # Paleta, CSS global, componentes de UI partilhados
  sw.js              # Service worker (push em segundo plano)
  piaPrint.js        # Impressão/exportação do PIA
  logo.png
  tabs/
    HomeTab.jsx        # Início
    DesafiosTab.jsx    # Desafios (sub-tabs)
    ForumTab.jsx       # Fórum + Recursos
    PiaTab.jsx         # Plano Individual de Ação
    PerfilTab.jsx      # Perfil, Roda da Vida, medalhas, ativar push
    home/
      HomeTodo.jsx     # Ações pendentes, notificações, tarefas
      HomeAgenda.jsx   # Agenda/eventos
      HomeVotacoes.jsx # Votações
      HomeExtras.jsx   # Extras
    desafios/
      PerguntaSemanal.jsx  # Pergunta da semana (texto/3 palavras/rating/media)
      AutoAvaliacao.jsx    # Autoavaliação por dimensões
      Satisfacao.jsx       # Satisfação (anónima)
      QuizCenarios.jsx     # Dilemas/quiz
    forum/
      ForumComposer.jsx    # Criar post
      ForumPost.jsx        # Render de post + reações/comentários
    admin/
      AdminJovens, AdminPrograma, AdminPia, AdminGeral, AdminMsgs,
      AdminMural, AdminAgenda, AdminMissoes, AdminPerguntas,
      AdminQuizzes, AdminRecursos, AdminRelatorio, AdminSatisfacao,
      AdminTarefas, AdminUsers, AdminVotacoes
functions/
  index.js           # Cloud Functions: notificarAdmin, notificarJovem
.github/workflows/
  deploy.yml         # Build + deploy Pages + deploy Functions (branch haha)
```

---

## Perfis / contas

- **Jovens** (`ALLOWED_USERNAMES`): nilton, erick, jucilina, carina,
  rudmilo, bruno, salimo, marisa.
- **teresa** — usa a app dos jovens mas com **tema claro**; também recebe
  as notificações de admin.
- **admin** — o painel `TeresaAdmin.jsx` (conta `admin@jeep.app`).
- **demo / ricardo** — contas de demonstração/observação. A conta demo usa
  um fórum isolado (`forum_demo`).

---

## Secções / páginas

**App dos jovens** — navegação por 5 tabs (barra inferior):
`🏠 Início` · `⚡ Desafios` · `🌐 Fórum` · `🚀 PIA` · `👤 Perfil`.

- **Início** — Ações Pendentes, Notificações, A minha lista (tarefas),
  Agenda, Votações.
- **Desafios** — Pergunta da Semana, Autoavaliação, Satisfação, Dilemas/Quiz.
- **Fórum** — canais temáticos + Recursos; posts, reações, comentários, menções `@`.
- **PIA** — Plano Individual de Ação.
- **Perfil** — Roda da Vida, medalhas/XP, cápsulas do tempo, guia da app,
  **ativação das notificações push** (mostra o estado: ativo/bloqueado/por ativar).

**Painel de admin** — separadores:
`👥 Jovens` · `🎯 Programa` · `📋 PIA` · `🌐 Fórum` · `😊 Satisfação` ·
`💬 Msgs` · `👁️ Preview` (ver a app como um jovem a vê).

---

## Design / estilo (em `src/theme.jsx`)

**Fonte:** `Inter` (Google Fonts), pesos 400–900. Fallback system-ui.

**Paleta** (tema escuro, estética "neon sobre navy"):
| Nome | Hex | Uso |
|---|---|---|
| `BG` | `#071529` | fundo (navy profundo) |
| `CYN` | `#32C7FF` | cor primária (cyan neon) |
| `BLUE` | `#2196F3` | botões principais |
| `PRP` | `#7B5CFF` | roxo, profundidade/acentos |
| `PNK` | `#FF4FA3` | rosa, só detalhe (~5%) |
| `YLW` | `#FFE44D` | amarelo, badges/energia |
| `GRN` | `#4ade80` | verde, estados de sucesso |
| `TXT_MAIN` | `#FFFFFF` | texto principal |
| `TXT_MUT` | `#B8C7DA` | texto secundário |

Cada jovem tem uma **cor própria** (`JEEP_LIST`) usada em avatares/nomes.

**Layout & aparência:**
- Cartões (`CARD`) com cantos muito arredondados (raio 20px), `backdrop-blur`,
  borda cyan translúcida e sombra suave. Variante `CARD_SOLID` e `AccentCard`
  (borda de topo colorida).
- Fundo com **grelha subtil** (linhas cyan a 4% de opacidade, 32px).
- **Labels de secção** (`SL`) minúsculas→maiúsculas, 10px, `letter-spacing` 2,
  a cinzento-azulado.
- Inputs (`INP`) arredondados (14px), fundo azul-escuro translúcido.
- **Animações** suaves: `fadeUp`, `pop-in`, `pulse-glow`, `fire-pulse`,
  `shimmer`, `cyan-pulse`. Botões encolhem ligeiramente ao carregar
  (`button:active { scale(0.96) }`). Scrollbars escondidas.
- Estados (`PS`): `urgent` (vermelho), `pending` (amarelo), `new` (roxo),
  cada um com dot + badge.
- O tema da `teresa` é **claro** (variáveis CSS `--card-*` sobrepostas).

**Preferências de UX observadas:**
- UI simples e direta; explicações claras em português para os jovens.
- Feedback visível ao utilizador (estados de "ativo", mensagens de sucesso/erro
  legíveis, nada de botões ambíguos que "dão sempre" sem indicar estado).
- Emojis nos títulos/labels como parte da linguagem visual.

---

## Notificações push (área sensível — histórico de decisões)

Arquitetura: token FCM por **aparelho** guardado em `fcmTokens/{username}`
(mapa `tokens`, chave = hash do token) → Cloud Functions enviam → service
worker mostra.

Regras que já custaram bugs (não reverter sem pensar):
- **Um token por aparelho**, não por utilizador (senão PC e telemóvel
  apagam o token um do outro, porque `teresa`/`admin` entram em vários sítios).
- Mensagens **data-only** (sem `notification`) + service worker a mostrar →
  evita **duplicados**.
- Header **`Urgency: high`** nas mensagens webpush → senão o Android/MIUI
  segura o push em segundo plano.
- Handler de **primeiro plano** (`onMessage` + `registration.showNotification`,
  **não** `new Notification()` que rebenta no Android) → mostra o push com a
  app aberta.
- `notificarAdmin` → dispara em `adminNotificacoes`, envia para `teresa` e `admin`.
- `notificarJovem` → dispara em `notifications/{u}/items`, envia **só** se
  `push: true`.

Limitações de dispositivo (não são bugs da app):
- **iPhone/iOS**: push só com a app **instalada no ecrã principal** (Safari →
  Partilhar → Adicionar ao ecrã principal) e **iOS 16.4+**.
- **Android/Xiaomi (MIUI)**: pode falhar o registo (`AbortError`) ou a
  entrega em segundo plano por gestão de bateria.

---

## Base de dados (Firestore) — coleções principais

| Coleção | Conteúdo |
|---|---|
| `users` | Consentimento/GDPR |
| `userData/{username}` | Dados pessoais: respostas, scores, XP, histórico, PIA |
| `todos/{username}/items` | Tarefas do jovem |
| `events` | Eventos/agenda |
| `forum/{canal}/posts` · `forum_demo/...` | Posts do fórum (demo isolado) |
| `recursos` | Recursos partilhados |
| `messages` | Mensagens para a Teresa |
| `notifications/{username}/items` | Notificações recebidas (com flag `push` e `tipo`) |
| `adminNotificacoes` | Ações dos jovens que notificam a Teresa |
| `fcmTokens/{username}` | Tokens de push (mapa `tokens`, um por aparelho) |
| `config` | Configuração global (pergunta ativa, features) |
| `medals`, `polls`, `missions`, `quizzes`, `satisfacao`, `perguntasArquivo` | Gamificação e conteúdos |

Regras: cada jovem só acede aos seus dados; áreas de admin exigem
`admin@jeep.app`. As Cloud Functions usam o Admin SDK (não passam pelas regras).

---

## Datas (helpers em `data.js`)

- `nowLabel()` → `"Jun 2026"` (mês + ano; formato **antigo**, sem hora).
- `nowFull()` → `"09 Jul 2026, 16:44"` (completo, usado nos posts recentes).
- Ao ordenar por data, ter em conta que há registos nos dois formatos e sem
  `ts` — usar `ts` quando existe e fazer parse de ambos os formatos como fallback.

---

## Deploy / desenvolvimento

```bash
npm install
npm run dev     # desenvolvimento
npm run build   # produção (dist/)
```

- Push para `haha` → GitHub Actions faz build + deploy no Pages e deploy das
  Functions.
- O job `deploy` (GitHub Pages) falha às vezes de forma **transitória**;
  basta voltar a correr os jobs falhados (rerun) — não é problema de código.
- Chaves Firebase vêm dos **secrets** do GitHub (`VITE_FIREBASE_*`), não estão
  no repositório. Localmente usar `.env` (ver `.env.example`).
