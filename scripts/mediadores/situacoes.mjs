// ═══════════════════════════════════════════════════════════════════
// COMO É O TRABALHO DE UM EDUCA MEDIADOR (contado pela Teresa)
//
// · Recebem uma BOLSA. Não têm contrato nem salário.
// · Fazem mediação nos RECREIOS das escolas: brincam com os miúdos e
//   resolvem problemas. DUAS HORAS por dia, à segunda, terça, quinta e sexta.
// · Às QUARTAS, de duas em duas semanas, há SUPERVISÃO: duas horas, todos
//   juntos. Às vezes formação, às vezes conversa.
// · Normalmente NÃO levam nada preparado. Podem levar, não é obrigatório.
//   Tiveram formação com jogos e atividades, e vão recebendo mais nas
//   supervisões.
// · Respondem a: a ESCOLA e os AUXILIARES; o GESTOR DE PROXIMIDADE (é um
//   deles, com mais responsabilidade, que os visita na escola); e o TÉCNICO
//   DE TERRITÓRIO, que dá a supervisão.
// · Normalmente é UM POR ESCOLA. Às vezes dois.
//
// NÃO existe: "a equipa" na escola, "sessões", "a coordenação",
// "dinamizar", "o espaço". Isso é dos monitores das ludotecas.
// ═══════════════════════════════════════════════════════════════════

// "Como te vês — SITUAÇÕES" para os EDUCA Mediadores.
// Mesmo formato do que já existe no Jogo 3 dos monitores: uma situação e seis
// maneiras de reagir, da pior (2) à melhor (10). Nenhuma está assinalada como
// certa — o jogo mostra-as baralhadas.
// 6 competências × 8 situações. A maior parte vem das situações que já existiam,
// adaptadas à escola; as novas são as que a mediação pede e não havia.

export const SITUACOES = {
  // ── D1 · Responsabilidade e compromisso ──────────────────────────
  D1: [
    { q: "Combinaste uma coisa com um miúdo e no dia esqueceste-te…", o: [
      [2, "Deixo passar; se ele não disser nada, fica por ali."],
      [4, "Desconverso quando ele me vem perguntar por aquilo."],
      [5, "Peço desculpa, e digo que fazemos qualquer dia destes."],
      [7, "Peço desculpa, e remarco ali mesmo com dia e hora."],
      [9, "Peço desculpa, remarco, e explico-lhe porque é que falhei."],
      [10, "Remarco, e passo a apontar tudo o que combino com eles."]] },
    { q: "Na segunda-feira pediram-te uma coisa para entregar na sexta. Agora é quinta à noite. Em que ponto está?", o: [
      [2, "Não comecei, e vou dizer que não tive tempo."],
      [4, "Fiz uma versão à pressa, só para poder dizer que entreguei."],
      [5, "Entrego amanhã; fico acordado hoje para acabar aquilo."],
      [7, "Fiz com calma ao longo da semana, e está pronto."],
      [9, "Está pronto, e já mostrei a alguém para ver se falta algo."],
      [10, "Está pronto, e entreguei antes para dar tempo de mudarem."]] },
    { q: "As rotinas da escola — estar no recreio, arrumar, acompanhar os miúdos. Como é que isso corre contigo?", o: [
      [2, "Não pego nelas, que há sempre alguém que acaba por fazer."],
      [4, "Faço, mas alguém tem de me lembrar todos os dias."],
      [5, "Já sei fazer, mas confirmo sempre com alguém antes."],
      [7, "Faço sozinho, sem ninguém me ter de dizer nada."],
      [9, "Faço as minhas, e quando falta alguém pego na parte dele."],
      [10, "Faço, e mudei a forma de fazer para ninguém se esquecer."]] },
    { q: "Hoje não te apetece nada ir à escola. Recebes a bolsa na mesma, faltes ou não…", o: [
      [2, "Não vou, e não digo nada a ninguém."],
      [4, "Mando mensagem à hora de entrar a dizer que estou doente."],
      [5, "Vou, mas fico as duas horas encostado a um canto do recreio."],
      [7, "Vou, porque me comprometi, e estou com os miúdos como nos outros dias."],
      [9, "Vou, e digo ao gestor de proximidade que hoje estou em baixo."],
      [10, "Vou, digo como estou, e na supervisão falo do que me anda a pesar."]] },
    { q: "Acordaste doente e daqui a duas horas tinhas de estar no recreio…", o: [
      [2, "Não apareço, e explico depois se alguém perguntar."],
      [4, "Aviso só quando já devia lá estar."],
      [5, "Aviso a tempo, e fica para a escola resolver."],
      [7, "Aviso logo o gestor de proximidade, com tempo."],
      [9, "Aviso o gestor de proximidade e também a escola."],
      [10, "Aviso os dois, e combino como é que reponho essas horas."]] },
    { q: "Chegaste atrasado pela terceira vez este mês. Ninguém te disse nada…", o: [
      [2, "Se ninguém diz nada, é porque não faz diferença."],
      [4, "Penso que tenho de melhorar, mas fica por aí."],
      [5, "Peço desculpa das próximas vezes que me atrasar."],
      [7, "Reconheço que está a virar hábito, e mudo a hora a que saio."],
      [9, "Mudo o que me atrasa, e aviso sempre que não vou conseguir."],
      [10, "Mudo, e falo com o gestor de proximidade antes de ser ele a falar comigo."]] },
    { q: "Prometeste ao grupo uma coisa para hoje e afinal não dá para fazer…", o: [
      [2, "Não digo nada, a ver se eles se esquecem."],
      [4, "Digo que não dá, e mudo logo de assunto."],
      [5, "Digo que não dá, e prometo para qualquer dia destes."],
      [7, "Digo que não dá e explico-lhes porquê."],
      [9, "Explico porquê, e marco ali o dia em que vai ser."],
      [10, "Explico, marco, e faço com eles outra coisa hoje."]] },
    { q: "A escola pede-te uma coisa que tu achas que não é bem a tua função…", o: [
      [2, "Digo que sim e depois não faço."],
      [4, "Faço, mas a queixar-me a toda a gente de que não é comigo."],
      [5, "Faço calado, mesmo achando que não devia ser eu."],
      [7, "Faço, e depois pergunto ao gestor de proximidade se aquilo é mesmo comigo."],
      [9, "Digo ali que tenho dúvidas se é comigo, e combinamos."],
      [10, "Combinamos o que é meu e o que não é, e fica claro para todos."]] },
  ],

  // ── D2 · Capacidade de comunicação ───────────────────────────────
  D2: [
    { q: "Na supervisão, um mediador teu amigo conta como resolveu uma zanga entre dois miúdos. A ti pareceu-te mal resolvido…", o: [
      [2, "Digo que fez bem, como lhe digo sempre."],
      [4, "Não digo nada ali, e comento com outro quando ele sai."],
      [5, "Digo por alto que talvez houvesse outra maneira, e fico por aí."],
      [7, "Digo ali o que eu teria feito de diferente, e porquê."],
      [9, "Digo o que faria, e pergunto-lhe o que o levou a fazer assim."],
      [10, "Digo o que faria, oiço-o, e vemos ali com os outros o que resultaria melhor."]] },
    { q: "Um professor diz à frente dos miúdos que tu estás ali só para brincar, e que quem manda são os adultos…", o: [
      [2, "Respondo-lhe ali, à frente de toda a gente."],
      [4, "Não digo nada, e a partir daí ando a fugir-lhe."],
      [5, "Faço de conta que não ouvi, e fico com aquilo atravessado."],
      [7, "Não respondo ali, e depois falo com ele a sós."],
      [9, "Falo com ele a sós, e explico-lhe o que eu ali faço."],
      [10, "Falo com ele, e peço ao gestor de proximidade que o venha explicar à escola."]] },
    { q: "Na supervisão, discordas de toda a gente…", o: [
      [2, "Alinho com a maioria, que não vale a pena ser o único contra."],
      [4, "Calo-me ali, e depois desabafo com quem me aparece."],
      [5, "Digo que tenho dúvidas, mas não chego a dizer quais são."],
      [7, "Digo ali o que penso e porquê, mesmo estando sozinho."],
      [9, "Digo o que penso, e peço as razões deles antes de fechar."],
      [10, "Digo o que penso e, se a decisão for outra, ajudo à mesma."]] },
    { q: "Tens de pedir uma coisa a um professor que mal te conhece…", o: [
      [2, "Não peço, e arranjo maneira de aquilo passar a outra pessoa."],
      [4, "Abordo-o sem preparar nada, e vou vendo o que sai dali."],
      [5, "Peço vagamente, e fico à espera que seja ele a propor."],
      [7, "Peço em concreto: o quê, para quando, para quantos."],
      [9, "Peço em concreto, e explico o que a turma ganha com isso."],
      [10, "Peço em concreto, e proponho fechar já dia e hora."]] },
    { q: "Tens de dizer a um encarregado de educação uma coisa sobre o filho que ele não quer ouvir…", o: [
      [2, "Não digo nada; aquilo não me compete a mim."],
      [4, "Digo à pressa, à porta da escola, e saio dali depressa."],
      [5, "Digo por alto, e ele fica sem perceber a gravidade."],
      [7, "Digo com calma e em concreto, num sítio onde dê para falar."],
      [9, "Digo, e pergunto-lhe como é que ele vê aquilo em casa."],
      [10, "Digo, ouço-o, e combinamos o que cada um faz a seguir."]] },
    { q: "Explicas uma regra a um miúdo e vê-se logo que ele não percebeu nada…", o: [
      [2, "Digo que é assim e pronto, e sigo em frente."],
      [4, "Repito exatamente a mesma coisa, mais alto."],
      [5, "Repito igual, mais devagar, até ele dizer que sim."],
      [7, "Explico de outra maneira, com um exemplo que ele conheça."],
      [9, "Explico de outra maneira, e peço-lhe que me diga por palavras dele."],
      [10, "Explico, confirmo que percebeu, e vejo com ele como se faz."]] },
    { q: "No recreio, um miúdo anda a dar encontrões aos outros e a rir-se, e já toda a gente está a olhar…", o: [
      [2, "Levanto a voz ali, à frente de toda a gente."],
      [4, "Deixo andar, e ao fim de meia hora explodo por uma coisa pequena."],
      [5, "Digo-lhe uma vez para parar, e sigo em frente quando ele não me liga."],
      [7, "Vou ter com ele e digo com firmeza que assim não pode ser."],
      [9, "Chamo-o à parte, longe dos outros, e explico-lhe porquê."],
      [10, "Falo com ele, e depois combino com o grupo como é que ali se brinca."]] },
    { q: "Um miúdo está a contar-te uma história longa e tu já percebeste onde aquilo vai dar…", o: [
      [2, "Corto e digo-lhe logo o que ele tem de fazer."],
      [4, "Vou dizendo que sim, já a pensar noutra coisa."],
      [5, "Deixo-o acabar, mas noto-se que estou com pressa."],
      [7, "Deixo-o acabar sem o interromper."],
      [9, "Deixo-o acabar, e pergunto-lhe para perceber melhor."],
      [10, "Oiço até ao fim, repito o que percebi, e confirmo com ele."]] },
  ],

  // ── D3 · Espírito de equipa e cooperação ─────────────────────────
  D3: [
    { q: "Na supervisão, outro mediador apresenta como dele uma ideia que era tua…", o: [
      [2, "Deixo passar, e não volto a levar ideias àquela reunião."],
      [4, "Não digo nada ali, e depois queixo-me aos outros colegas."],
      [5, "Digo por alto que também já tinha pensado naquilo."],
      [7, "Digo ali que a ideia foi minha, e sigo em frente."],
      [9, "Digo ali que foi minha, e falo com ele a sós no fim."],
      [10, "Digo que foi minha, e proponho prepararmos a próxima juntos."]] },
    { q: "Um colega faz uma coisa que te prejudica e não parece dar por isso…", o: [
      [2, "Não digo nada, e vou ficando com aquilo entalado."],
      [4, "Digo-lhe com má cara, mas sem explicar o que me incomodou."],
      [5, "Peço a outro mediador que lhe diga por mim."],
      [7, "Digo-lhe eu, na primeira vez que acontece, sem drama."],
      [9, "Digo-lhe, e pergunto se há alguma razão que eu não veja."],
      [10, "Digo-lhe, e combinamos avisar-nos quando isso acontecer."]] },
    { q: "És novo na escola e ninguém te apresenta a ninguém…", o: [
      [2, "Fico no meu canto, que me custa muito conhecer gente nova."],
      [4, "Espero que venham ter comigo, e levo a mal que não venham."],
      [5, "Apresento-me só a quem me cruza sozinho, nunca ao grupo."],
      [7, "Apresento-me a cada um, e pergunto o que faz ali."],
      [9, "Apresento-me, e peço a alguém que me mostre como aquilo funciona."],
      [10, "Apresento-me, e passo a fazer isso aos que chegam depois de mim."]] },
    { q: "Na supervisão ficou combinada uma coisa para todos fazerem, e ninguém pegou nela…", o: [
      [2, "Também não pego, que ninguém pegou."],
      [4, "Vou dizendo por aí que ali ninguém faz nada."],
      [5, "Faço só a minha parte, e o resto que se desenrasque."],
      [7, "Faço a minha parte, mesmo sabendo que os outros não fizeram."],
      [9, "Faço, e pergunto a outro mediador se quer fazer comigo."],
      [10, "Faço, e na supervisão seguinte trago o assunto para se combinar melhor."]] },
    { q: "Dão-te uma tarefa que nunca fizeste e não fazes ideia de como se faz…", o: [
      [2, "Digo que não sou capaz, e passo-a a outra pessoa."],
      [4, "Digo que sei fazer, e depois entrego o que calhar."],
      [5, "Vou tentando às cegas, sem dizer que estou perdido."],
      [7, "Digo que nunca fiz, e vou procurar como é que se faz."],
      [9, "Peço a quem já fez que me mostre, e faço com aquilo à frente."],
      [10, "Faço, e deixo escrito o passo a passo para o próximo."]] },
    { q: "Um colega teu acabou de apanhar com uma situação dura e vê-se que ficou mal…", o: [
      [2, "Não digo nada; cada um sabe de si."],
      [4, "Comento com outro colega que ele não aguenta nada."],
      [5, "Digo-lhe «então, está tudo?» e sigo o meu caminho."],
      [7, "Pergunto-lhe se está bem, e fico ali um bocado."],
      [9, "Pergunto como está, e ofereço-me para ficar com a parte dele."],
      [10, "Fico com ele, e no fim do dia volto a perguntar como ficou."]] },
    { q: "No grupo de mensagens dos mediadores, começam a imitar a maneira de falar de um colega que não está lá…", o: [
      [2, "Entro na piada e mando mais uma."],
      [4, "Não digo nada, mas vou lendo e rindo."],
      [5, "Fico calado ali, e depois conto-lhe a ele o que andaram a dizer."],
      [7, "Digo ali que não tem graça, e mudo de assunto."],
      [9, "Digo que não tem graça, e explico porquê."],
      [10, "Digo ali, e na supervisão trago isto para se falar."]] },
    { q: "Aprendeste na formação uma coisa que ia dar jeito aos teus colegas…", o: [
      [2, "Guardo para mim; assim sou eu que sei fazer aquilo."],
      [4, "Uso, e se alguém perguntar explico — mas não digo nada."],
      [5, "Falo disso por alto, no meio de outra conversa."],
      [7, "Conto na supervisão o que aprendi e como se faz."],
      [9, "Conto, e mostro na prática a quem quiser experimentar."],
      [10, "Mostro, e combinamos passar a partilhar o que cada um aprende."]] },
  ],

  // ── D4 · Gestão emocional e de conflitos ─────────────────────────
  D4: [
    { q: "Dois miúdos começam à porrada à tua frente…", o: [
      [2, "Fico sem reação, e chamo por ajuda sem me mexer dali."],
      [4, "Grito «parem» de longe, mas não me meto no meio."],
      [5, "Separo aos gritos, e a coisa fica por ali."],
      [7, "Separo, tiro-os dali, e falo com os dois a seguir."],
      [9, "Separo, e oiço cada um sozinho antes de falar com os dois."],
      [10, "Separo, e depois trabalho com o grupo o que esteve por trás."]] },
    { q: "Um miúdo diz-te à frente de todos que és uma seca e que ninguém te liga…", o: [
      [2, "Respondo-lhe à letra, ali à frente de toda a gente."],
      [4, "Saio dali, e deixo o grupo entregue a si próprio."],
      [5, "Sigo em frente a engolir aquilo, com um nó na garganta."],
      [7, "Sigo com o que estava a fazer, sem lhe dar troco nenhum."],
      [9, "Sigo, e no fim chamo-o à parte para perceber."],
      [10, "Sigo, e na próxima vez trago uma coisa escolhida por eles."]] },
    { q: "Levas uma semana em que tudo corre mal e apetece-te desistir…", o: [
      [2, "Falto uns dias, e não aviso ninguém de que não vou."],
      [4, "Continuo a aparecer, mas respondo mal por tudo e por nada."],
      [5, "Aguento calado, e digo a toda a gente que está tudo bem."],
      [7, "Digo ao gestor de proximidade como estou, e peço ajuda."],
      [9, "Falo na supervisão, e vemos juntos o que dá para mudar."],
      [10, "Peço ajuda, e separo o meu feitio do que está mal montado."]] },
    { q: "Um miúdo que já estava a mudar volta a faltar, a responder mal e a desistir de tudo…", o: [
      [2, "Penso que o problema sou eu, e perco a vontade de insistir."],
      [4, "Vou-me afastando, e ponho a energia nos que dão menos trabalho."],
      [5, "Continuo com a mesma conversa, à espera que aquilo lhe passe."],
      [7, "Digo-lhe que continuo cá, e continuo a contar com ele."],
      [9, "Vou ter com ele, e pergunto o que mudou desde a última vez."],
      [10, "Percebo o que mudou, e mudo o que faço com ele por causa disso."]] },
    { q: "Levaste um jogo que aprendeste na supervisão e ninguém lhe pegou. Ficaste ali sozinho com aquilo…", o: [
      [2, "Fico com vergonha, e não volto a levar nada."],
      [4, "Digo que aqueles miúdos não querem nada."],
      [5, "Encolho os ombros, guardo aquilo, e passo à frente."],
      [7, "Penso no que falhou e mudo a maneira de o propor."],
      [9, "Pergunto-lhes porque é que não quiseram."],
      [10, "Pergunto-lhes, e levo o assunto à supervisão seguinte."]] },
    { q: "Chove há três dias. Sem recreio lá fora, os miúdos andam irritados e é tudo motivo para discussão…", o: [
      [2, "Encosto-me a um canto e deixo as duas horas passar."],
      [4, "Ando atrás deles a mandá-los calar."],
      [5, "Vou separando as discussões, uma de cada vez, até tocar."],
      [7, "Puxo um jogo que se faça ali, parado e sem gritar."],
      [9, "Puxo um jogo, e ponho os mais irrequietos a ajudar-me a dirigi-lo."],
      [10, "Puxo um jogo, e combino com a auxiliar o que fazer nos próximos dias de chuva."]] },
    { q: "Avisam-te de véspera que a partir de amanhã passas a estar noutra escola. Ninguém te explica porquê…", o: [
      [2, "Entro em pânico, e falto nos primeiros dias."],
      [4, "Apareço, e trato aqueles miúdos como tratava os de antes."],
      [5, "Lá vou andando, sempre a queixar-me de que não avisaram."],
      [7, "Começo do zero com eles, e ao fim de uma semana já me conhecem."],
      [9, "Começo do zero, e peço uma conversa para perceber porque mudei."],
      [10, "Começo do zero, e pergunto à escola nova o que ali faz mais falta."]] },
    { q: "Estás a mediar uma discussão e um dos miúdos começa a atirar-se a ti…", o: [
      [2, "Perco a cabeça e respondo-lhe no mesmo tom."],
      [4, "Mando-o embora dali, e a conversa fica por fazer."],
      [5, "Faço de conta que não ouvi, e continuo como se nada fosse."],
      [7, "Digo-lhe com calma que assim não dá, e paro a conversa."],
      [9, "Paro, dou um tempo aos dois, e retomo quando acalmarem."],
      [10, "Paro, retomo depois, e digo-lhe o que senti quando ele fez aquilo."]] },
  ],

  // ── D5 · Iniciativa ──────────────────────────────────────────────
  D5: [
    { q: "Vês uma coisa que precisa de ser feita na escola, mas não é a tua função…", o: [
      [2, "Não faço, que não é a minha função. Deixo para quem é."],
      [4, "Digo a alguém que aquilo devia ser feito, e fico à espera."],
      [5, "Faço aquilo, mas só depois de alguém me vir pedir."],
      [7, "Faço, porque estava à vista e era preciso."],
      [9, "Faço, e aviso a auxiliar para não se fazer duas vezes."],
      [10, "Faço, e proponho uma forma de aquilo não voltar a ficar."]] },
    { q: "O recreio está calmo, ninguém está à porrada e ninguém te chamou…", o: [
      [2, "Fico no telemóvel até dar a hora de ir embora."],
      [4, "Fico a olhar de longe, a ver se aparece alguma coisa."],
      [5, "Pergunto à auxiliar se precisa de mim; se não, fico parado."],
      [7, "Vou ter com um grupo e meto-me na brincadeira deles."],
      [9, "Vou ter com os que estão mais sozinhos."],
      [10, "Puxo um jogo com eles, daqueles que juntam quem anda à parte."]] },
    { q: "Do outro lado do recreio, um grupo começa a aquecer. Ainda não é briga…", o: [
      [2, "Não é comigo; só vou lá se aquilo rebentar mesmo."],
      [4, "Fico a olhar de longe, a ver no que dá."],
      [5, "Grito dali para eles se acalmarem."],
      [7, "Vou até lá, e fico por perto a ver o que se passa."],
      [9, "Vou até lá, meto conversa, e corto aquilo antes de crescer."],
      [10, "Corto aquilo, e depois falo com eles sobre o que esteve por trás."]] },
    { q: "Há um miúdo que anda sempre sozinho no recreio e ninguém parece dar por isso…", o: [
      [2, "Se ele não se queixa, é porque gosta de estar assim."],
      [4, "Reparo, mas não sei bem o que fazer, e deixo andar."],
      [5, "Digo-lhe para ir brincar com os outros."],
      [7, "Vou ter com ele e meto conversa."],
      [9, "Falo com ele, percebo do que gosta, e ligo-o a quem gosta do mesmo."],
      [10, "Faço a ponte, e falo com o professor dele sobre o que notei."]] },
    { q: "Deram-te liberdade total para fazeres uma atividade do zero…", o: [
      [2, "Espero que me digam o que fazer, e acabo por não fazer nada."],
      [4, "Monto uma coisa que já vi noutro sítio, sem ver se serve a estes."],
      [5, "Faço, mas vou perguntando a cada passo se está bem assim."],
      [7, "Decido eu o que vamos fazer, monto, e levo por diante."],
      [9, "Monto-a com eles, e são eles a decidir o que vamos fazer."],
      [10, "Monto com eles, e no fim vemos juntos o que muda para a próxima."]] },
    { q: "Ninguém te pediu nada, mas podias criar uma atividade nova de raiz…", o: [
      [2, "Nunca me passou pela cabeça inventar seja o que for."],
      [4, "Tenho ideias, mas nunca as chego a dizer a ninguém."],
      [5, "Proponho a ideia, e espero que alguém a organize por mim."],
      [7, "Proponho, e monto-a eu do princípio ao fim."],
      [9, "Construo a ideia com os miúdos, e montamo-la juntos."],
      [10, "Monto, e deixo-a a andar com outra pessoa a dinamizá-la."]] },
    { q: "Achas que uma regra da escola está a criar mais conflitos do que a resolver…", o: [
      [2, "Não digo nada; regras são regras e não é comigo."],
      [4, "Queixo-me aos colegas, mas nunca a quem decide."],
      [5, "Digo por alto que aquilo não resulta, sem explicar."],
      [7, "Levo o assunto aos auxiliares e digo o que tenho visto."],
      [9, "Levo, e dou exemplos concretos do que vi acontecer."],
      [10, "Levo exemplos, e proponho uma forma diferente de fazer."]] },
    { q: "Uma auxiliar pede-te para levares um jogo para o recreio de amanhã. Ninguém te obriga…", o: [
      [2, "Digo que não dá, que isso não é comigo."],
      [4, "Digo que levo, e no dia apareço de mãos a abanar."],
      [5, "Invento um jogo qualquer na hora, ali no recreio."],
      [7, "Levo um dos jogos que aprendi na formação."],
      [9, "Levo um, e penso antes em como o explicar àqueles miúdos."],
      [10, "Levo um, e mudo-o ali conforme os miúdos que aparecem."]] },
  ],

  // ── D6 · Qualidade da intervenção com as crianças ────────────────
  D6: [
    { q: "Um miúdo conta-te em segredo uma coisa grave que se passa em casa dele…", o: [
      [2, "Prometo que não conto a ninguém, e cumpro."],
      [4, "Conto a um colega no corredor, sem ser a quem devia."],
      [5, "Falo com ele outra vez, mas não digo nada a mais ninguém."],
      [7, "Falo nesse mesmo dia com o adulto responsável na escola."],
      [9, "Falo com esse adulto, e escrevo aquilo nas palavras dele."],
      [10, "Falo, e digo ao miúdo o que vai acontecer a seguir."]] },
    { q: "Um miúdo diz-te a rir, como quem não quer a coisa, que em casa lhe batem quando se porta mal…", o: [
      [2, "Rio-me também, e mudo de assunto."],
      [4, "Fico com um aperto, mas digo a mim mesmo que não é comigo."],
      [5, "Conto a outro mediador, e fica entre nós os dois."],
      [7, "Falo nesse mesmo dia com um auxiliar ou com a escola."],
      [9, "Falo com a escola, e escrevo o que ele disse pelas palavras dele."],
      [10, "Falo com a escola, aviso o gestor de proximidade, e combinamos o que se segue."]] },
    { q: "Dois miúdos estão zangados e cada um te puxa para o seu lado, à espera que lhe dês razão…", o: [
      [2, "Dou razão ao que me parece melhor pessoa."],
      [4, "Digo que a culpa é dos dois, e mando-os embora."],
      [5, "Oiço os dois ao mesmo tempo, aos gritos um por cima do outro."],
      [7, "Digo-lhes que não vou escolher lado, e oiço um de cada vez."],
      [9, "Oiço um de cada vez até ao fim, sem o outro interromper."],
      [10, "Oiço os dois, e ponho-os a dizer um ao outro o que sentiram."]] },
    { q: "Numa mediação, os dois miúdos chegaram a um acordo. E agora?", o: [
      [2, "Fica por ali; o importante era pararem de discutir."],
      [4, "Digo-lhes que está tudo bem agora, e sigo em frente."],
      [5, "Repito eu o que acho que eles combinaram."],
      [7, "Peço-lhes que digam em voz alta o que ficou combinado."],
      [9, "Confirmo com os dois, e fica claro o que cada um vai fazer."],
      [10, "Confirmo, e combino com eles um dia para ver se resultou."]] },
    { q: "Tens de mediar uma discussão entre dois miúdos, e com um deles dás-te muito melhor…", o: [
      [2, "Acabo por dar razão ao que me dou melhor, e nem dou por isso."],
      [4, "Tento ser justo, mas vê-se de que lado estou."],
      [5, "Trato os dois igual, mas por dentro já decidi quem tem razão."],
      [7, "Ponho de lado o que sinto, e oiço os dois da mesma maneira."],
      [9, "Oiço os dois igual, e digo-lhes que me dou bem com os dois."],
      [10, "Peço a outra pessoa para mediar, por eu estar demasiado perto."]] },
    { q: "Chega um miúdo novo, não conhece ninguém, e fica de fora…", o: [
      [2, "Não dou por isso; tenho mais que fazer naquela hora."],
      [4, "Digo aos outros para o incluírem, e sigo em frente."],
      [5, "Apresento-o ao grupo, e deixo-o à vontade dele."],
      [7, "Ponho-o numa tarefa com outros, e vou ficando de olho."],
      [9, "Falo com ele a sós, e ponho-o onde o que gosta encaixa."],
      [10, "Recebo-o eu, e passa a haver alguém do grupo a fazer isso."]] },
    { q: "Tens de trabalhar com um miúdo de quem, sinceramente, não gostas…", o: [
      [2, "Evito-o o mais que posso, sem dar muito nas vistas."],
      [4, "Custa-me esconder o que sinto, e acho que ele nota."],
      [5, "Faço o que tenho a fazer com ele, mas sem vontade nenhuma."],
      [7, "Ponho o que sinto de lado, e faço o meu trabalho."],
      [9, "Faço o trabalho, e procuro conhecê-lo melhor a ver se mudo."],
      [10, "Faço o trabalho, e dou-lhe uma tarefa para fazermos os dois."]] },
    { q: "A meio de uma atividade percebes que os miúdos estão a detestar aquilo…", o: [
      [2, "Continuo à mesma até ao fim."],
      [4, "Zango-me com eles por não estarem a colaborar."],
      [5, "Mudo para uma coisa mais curta, e acabo mais cedo."],
      [7, "Mudo ali para outra coisa que eu sei que os agarra."],
      [9, "Paro, e pergunto-lhes o que é que preferiam fazer."],
      [10, "Mudo com eles ali, e no fim vemos o que falhou no plano."]] },
  ],
};
