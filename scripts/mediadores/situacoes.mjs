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
      [2, "Não digo nada; para ele aquilo já deve ter passado."],
      [4, "Se ele me perguntar, digo que hoje não deu para ser."],
      [5, "Peço desculpa, e digo que fazemos qualquer dia destes."],
      [7, "Peço desculpa, e remarco ali mesmo com dia e hora."],
      [9, "Peço desculpa, remarco, e explico-lhe porque é que falhei."],
      [10, "Remarco, e passo a apontar o que combino com eles para não voltar a falhar."]] },
    { q: "É quarta-feira, dia de supervisão. Não tens de ir à escola e ninguém te vai buscar a casa…", o: [
      [2, "Não vou; hoje não tenho mesmo cabeça para aquilo."],
      [4, "Aviso que não vou, porque me apareceu outra coisa para fazer."],
      [5, "Vou, mas chego tarde e fico mais calado a ver as horas."],
      [7, "Vou, chego a horas, e oiço o que ali se fala."],
      [9, "Vou, e levo as dúvidas que me apareceram no recreio."],
      [10, "Vou, levo as minhas dúvidas, e uso na escola o que dali trago."]] },
    { q: "As rotinas da escola — estar no recreio, arrumar, acompanhar os miúdos. Como é que isso corre contigo?", o: [
      [2, "Faço só quando me pedem; o resto não é bem comigo."],
      [4, "Faço, mas só me lembro quando vejo os outros a fazer."],
      [5, "Já sei fazer, mas confirmo sempre com alguém antes."],
      [7, "Faço sozinho, sem ninguém me ter de dizer nada."],
      [9, "Faço as minhas, e quando falta alguém pego na parte dele."],
      [10, "Faço, e já mudei a maneira de fazer para aquilo correr melhor."]] },
    { q: "Hoje não te apetece nada ir à escola. Ninguém te vai buscar a casa…", o: [
      [2, "Não vou; um dia não faz diferença nenhuma."],
      [4, "Aviso que não vou, e digo que estou doente."],
      [5, "Vou, mas fico as duas horas mais no meu canto."],
      [7, "Vou, porque me comprometi, e estou com os miúdos como nos outros dias."],
      [9, "Vou, e digo ao gestor de proximidade que hoje estou em baixo."],
      [10, "Vou, digo como estou, e na supervisão falo do que me anda a pesar."]] },
    { q: "Acordaste doente e daqui a duas horas tinhas de estar no recreio…", o: [
      [2, "Não apareço, e explico depois se alguém perguntar."],
      [4, "Aviso só quando já devia lá estar."],
      [5, "Aviso a tempo, e fica para a escola resolver."],
      [7, "Aviso logo o gestor de proximidade, com tempo."],
      [9, "Aviso o gestor de proximidade, e peço-lhe que avise a escola."],
      [10, "Aviso o gestor de proximidade e a escola, e combino com eles como reponho essas horas."]] },
    { q: "Chegaste atrasado pela terceira vez este mês. Ninguém te disse nada…", o: [
      [2, "Se ninguém diz nada, é porque não está a fazer falta."],
      [4, "Penso que tenho de melhorar, mas fica por aí."],
      [5, "Peço desculpa quando me atrasar outra vez."],
      [7, "Vejo que está a virar hábito, e mudo a hora a que saio de casa."],
      [9, "Mudo o que me atrasa, e aviso sempre que não vou conseguir."],
      [10, "Mudo, e falo com o gestor de proximidade antes de ser ele a falar comigo."]] },
    { q: "Prometeste ao grupo uma coisa para hoje e afinal não dá para fazer…", o: [
      [2, "Não falo nisso, a ver se eles não se lembram."],
      [4, "Digo que não dá, e mudo logo de assunto."],
      [5, "Digo que não dá, e prometo para qualquer dia destes."],
      [7, "Digo que não dá e explico-lhes porquê."],
      [9, "Explico porquê, e marco ali o dia em que vai ser."],
      [10, "Explico, marco, e faço hoje outra coisa com eles."]] },
    { q: "A escola pede-te uma coisa que tu achas que não é bem a tua função…", o: [
      [2, "Digo que isso não é comigo."],
      [4, "Faço, a dizer a toda a gente que aquilo não era comigo."],
      [5, "Faço calado, mesmo achando que não devia ser eu."],
      [7, "Faço, e depois pergunto ao gestor de proximidade se aquilo é mesmo comigo."],
      [9, "Digo ali que tenho dúvidas se é comigo, e combinamos."],
      [10, "Combinamos o que é meu e o que não é, e fica claro para todos."]] },
  ],

  // ── D2 · Capacidade de comunicação ───────────────────────────────
  D2: [
    { q: "Na supervisão, um mediador teu amigo conta como resolveu uma zanga entre dois miúdos. A ti pareceu-te mal resolvido…", o: [
      [2, "Digo que fez bem; não me vou meter com um amigo à frente dos outros."],
      [4, "Não digo nada ali, e comento depois com outro colega."],
      [5, "Digo por alto que talvez houvesse outra maneira, e fico por aí."],
      [7, "Digo ali o que eu teria feito de diferente, e porquê."],
      [9, "Digo o que faria, e pergunto-lhe o que o levou a fazer assim."],
      [10, "Digo o que faria, oiço-o, e vemos ali com os outros o que resultaria melhor."]] },
    { q: "Um professor diz à frente dos miúdos que tu estás ali só para brincar, e que quem manda são os adultos…", o: [
      [2, "Respondo-lhe ali, à frente de toda a gente."],
      [4, "Não digo nada, e a partir daí evito-o."],
      [5, "Faço de conta que não ouvi, e fico com aquilo atravessado."],
      [7, "Não respondo ali, e depois falo com ele a sós."],
      [9, "Falo com ele a sós, e explico-lhe o que eu ali faço."],
      [10, "Falo com ele, e peço ao gestor de proximidade que o venha explicar à escola."]] },
    { q: "Na supervisão, discordas de toda a gente…", o: [
      [2, "Alinho com a maioria; se são todos a dizer o mesmo, se calhar quem está errado sou eu."],
      [4, "Calo-me ali, e depois desabafo com quem me aparece."],
      [5, "Digo que tenho dúvidas, mas não chego a dizer quais são."],
      [7, "Digo ali o que penso e porquê, mesmo estando sozinho."],
      [9, "Digo o que penso, e peço as razões deles antes de fechar."],
      [10, "Digo o que penso e, se a decisão for outra, ajudo à mesma."]] },
    { q: "Tens de pedir uma coisa a um professor que mal te conhece…", o: [
      [2, "Não peço; vejo se arranjo outra maneira sem ter de falar com ele."],
      [4, "Falo com ele sem pensar muito no assunto, e vou vendo o que sai dali."],
      [5, "Peço por alto, à espera que seja ele a dizer como se faz."],
      [7, "Peço em concreto: o quê, para quando, para quantos."],
      [9, "Peço em concreto, e explico o que a turma ganha com isso."],
      [10, "Peço em concreto, e proponho fechar já dia e hora."]] },
    { q: "Na sessão de projeto de vida, o técnico de território pergunta-te o que queres fazer depois disto…", o: [
      [2, "Digo que não sei, e mudo de assunto."],
      [4, "Digo o primeiro que me vem à cabeça, só para responder."],
      [5, "Digo uma ideia vaga, e não falo mais nisso."],
      [7, "Digo o que me passa pela cabeça, mesmo sem ter a certeza."],
      [9, "Digo o que gostava, e pergunto-lhe o que é preciso para lá chegar."],
      [10, "Digo o que gostava, pergunto o que falta, e saio dali com uma coisa para fazer."]] },
    { q: "Explicas uma regra a um miúdo e vê-se logo que ele não percebeu nada…", o: [
      [2, "Digo que é assim e pronto; com o tempo ele apanha."],
      [4, "Repito a mesma coisa, mais alto."],
      [5, "Repito igual, mais devagar, até ele dizer que sim."],
      [7, "Explico de outra maneira, com um exemplo que ele conheça."],
      [9, "Explico de outra maneira, e peço-lhe que me diga por palavras dele."],
      [10, "Explico, confirmo que percebeu, e vejo com ele como se faz."]] },
    { q: "No recreio, um miúdo anda a dar encontrões aos outros e a rir-se, e já toda a gente está a olhar…", o: [
      [2, "Levanto a voz dali, para os outros verem que aquilo não pode ser."],
      [4, "Deixo andar, e ao fim de meia hora explodo por uma coisa pequena."],
      [5, "Digo-lhe uma vez para parar, e sigo em frente quando ele não me liga."],
      [7, "Vou ter com ele e digo com firmeza que assim não pode ser."],
      [9, "Chamo-o à parte, longe dos outros, e explico-lhe porquê."],
      [10, "Falo com ele, e depois combino com o grupo como é que ali se brinca."]] },
    { q: "Um miúdo está a contar-te uma história longa e tu já percebeste onde aquilo vai dar…", o: [
      [2, "Corto, e digo-lhe logo o que ele tem de fazer."],
      [4, "Vou dizendo que sim, já a pensar noutra coisa."],
      [5, "Deixo-o acabar, mas noto-se que estou com pressa."],
      [7, "Deixo-o acabar sem o interromper."],
      [9, "Deixo-o acabar, e pergunto-lhe para perceber melhor."],
      [10, "Oiço até ao fim, repito o que percebi, e confirmo com ele."]] },
  ],

  // ── D3 · Espírito de equipa e cooperação ─────────────────────────
  D3: [
    { q: "Na supervisão, outro mediador apresenta como dele uma ideia que era tua…", o: [
      [2, "Deixo passar; não vale a pena estar a discutir por causa de uma ideia."],
      [4, "Não digo nada ali, e depois comento com os outros."],
      [5, "Digo por alto que também já tinha pensado nisso."],
      [7, "Digo ali que a ideia foi minha, e sigo em frente."],
      [9, "Digo ali que foi minha, e falo com ele a sós no fim."],
      [10, "Digo que foi minha, e proponho prepararmos a próxima juntos."]] },
    { q: "Uma auxiliar trata-te como se fosses mais um miúdo da escola…", o: [
      [2, "Respondo-lhe torto; não estou ali para levar com isso."],
      [4, "Não digo nada, e fico a remoer aquilo todos os dias."],
      [5, "Desabafo com os outros mediadores, e fica por aí."],
      [7, "Falo com ela a sós, com calma, e digo o que ali faço."],
      [9, "Falo com ela, e mostro-lhe no dia a dia o trabalho que faço."],
      [10, "Falo com ela, e peço ao gestor de proximidade que explique à escola o meu papel."]] },
    { q: "És novo na escola e ninguém te apresenta a ninguém…", o: [
      [2, "Fico no meu canto; custa-me muito chegar-me a gente que não conheço."],
      [4, "Espero que venham ter comigo; quem recebe são eles."],
      [5, "Apresento-me só a quem me cruza sozinho."],
      [7, "Apresento-me a cada um, e pergunto o que faz ali."],
      [9, "Apresento-me, e peço a alguém que me mostre como aquilo funciona."],
      [10, "Apresento-me, e passo a fazer isso aos que chegam depois de mim."]] },
    { q: "Na supervisão ficou combinada uma coisa para todos fazerem, e ninguém pegou nela…", o: [
      [2, "Também não faço; se ninguém fez, não devia ser assim tão importante."],
      [4, "Não faço, e vou dizendo que ali ninguém faz nada."],
      [5, "Faço só a minha parte; o resto não é comigo."],
      [7, "Faço a minha parte, mesmo sabendo que os outros não fizeram."],
      [9, "Faço, e pergunto a outro mediador se quer fazer comigo."],
      [10, "Faço, e na supervisão seguinte trago o assunto para se combinar melhor."]] },
    { q: "Dão-te uma tarefa que nunca fizeste e não fazes ideia de como se faz…", o: [
      [2, "Digo que não sou capaz, e peço que seja outro a fazer."],
      [4, "Digo que sei fazer, e depois vou vendo como me safo."],
      [5, "Vou tentando às cegas, sem dizer que estou perdido."],
      [7, "Digo que nunca fiz, e vou procurar como é que se faz."],
      [9, "Peço a quem já fez que me mostre, e faço com aquilo à frente."],
      [10, "Faço, e deixo escrito o passo a passo para o próximo."]] },
    { q: "Um colega teu acabou de apanhar com uma situação dura e vê-se que ficou mal…", o: [
      [2, "Não digo nada; se calhar ele não quer estar a falar disso."],
      [4, "Falo do assunto com outro colega, mas não falo com ele."],
      [5, "Pergunto-lhe «então, está tudo?» e sigo o meu caminho."],
      [7, "Pergunto-lhe se está bem, e fico ali um bocado."],
      [9, "Pergunto como está, e ofereço-me para ficar com a parte dele."],
      [10, "Fico com ele, e no fim do dia volto a perguntar como ficou."]] },
    { q: "No grupo de mensagens dos mediadores, começam a imitar a maneira de falar de um colega que não está lá…", o: [
      [2, "Entro na piada; é só uma brincadeira entre nós."],
      [4, "Não digo nada, mas vou lendo e rindo."],
      [5, "Fico calado ali, e depois conto-lhe a ele o que andaram a dizer."],
      [7, "Digo ali que não tem graça, e mudo de assunto."],
      [9, "Digo que não tem graça, e explico porquê."],
      [10, "Digo ali, e na supervisão trago isto para se falar."]] },
    { q: "Aprendeste na formação uma coisa que ia dar jeito aos teus colegas…", o: [
      [2, "Uso na minha escola; cada um depois faz como quiser na sua."],
      [4, "Se alguém perguntar explico, mas não vou puxar o assunto."],
      [5, "Falo nisso por alto, no meio de outra conversa."],
      [7, "Conto na supervisão o que aprendi e como se faz."],
      [9, "Conto, e mostro na prática a quem quiser experimentar."],
      [10, "Mostro, e combinamos passar a partilhar o que cada um aprende."]] },
  ],

  // ── D4 · Gestão emocional e de conflitos ─────────────────────────
  D4: [
    { q: "Dois miúdos começam à luta à tua frente…", o: [
      [2, "Chamo logo um auxiliar; aquilo já não é comigo."],
      [4, "Grito «parem» dali, mas não me meto no meio."],
      [5, "Separo-os aos gritos, e a coisa fica por ali."],
      [7, "Separo, tiro-os dali, e falo com os dois a seguir."],
      [9, "Separo, e oiço cada um sozinho antes de falar com os dois."],
      [10, "Separo, e depois trabalho com o grupo o que esteve por trás."]] },
    { q: "Um miúdo diz-te à frente de todos que és uma seca e que ninguém te liga…", o: [
      [2, "Respondo-lhe no mesmo tom; senão perco-os a todos."],
      [4, "Saio dali, e vou dar uma volta pelo recreio."],
      [5, "Sigo em frente a engolir aquilo, com aquele nó na garganta."],
      [7, "Sigo com o que estava a fazer, sem lhe dar troco nenhum."],
      [9, "Sigo, e no fim chamo-o à parte para perceber."],
      [10, "Sigo, e na próxima vez trago uma coisa escolhida por eles."]] },
    { q: "Levas uma semana em que tudo corre mal e apetece-te desistir…", o: [
      [2, "Falto uns dias, para arejar a cabeça."],
      [4, "Continuo a aparecer, mas ando com pouca paciência."],
      [5, "Aguento calado, e digo a toda a gente que está tudo bem."],
      [7, "Digo ao gestor de proximidade como estou, e peço ajuda."],
      [9, "Falo na supervisão, e vemos juntos o que dá para mudar."],
      [10, "Peço ajuda, e separo o meu feitio do que está mal montado."]] },
    { q: "Um miúdo que já estava a mudar volta a faltar, a responder mal e a desistir de tudo…", o: [
      [2, "Penso que o problema sou eu, e perco a vontade de insistir."],
      [4, "Ponho a energia nos que querem mesmo; o tempo que tenho é pouco."],
      [5, "Continuo na mesma com ele, à espera que aquilo lhe passe."],
      [7, "Digo-lhe que continuo cá, e continuo a contar com ele."],
      [9, "Vou ter com ele, e pergunto o que mudou desde a última vez."],
      [10, "Percebo o que mudou, e mudo o que faço com ele por causa disso."]] },
    { q: "Levaste um jogo que aprendeste na supervisão e ninguém lhe pegou. Ficaste ali sozinho com aquilo…", o: [
      [2, "Fico com vergonha; para a próxima não levo nada."],
      [4, "Fico a pensar que aqueles miúdos não querem nada."],
      [5, "Guardo aquilo, e passo à frente sem pensar mais nisso."],
      [7, "Penso no que falhou e mudo a maneira de o propor."],
      [9, "Pergunto-lhes porque é que não quiseram."],
      [10, "Pergunto-lhes, e levo o assunto à supervisão seguinte."]] },
    { q: "Chove há três dias. Sem recreio lá fora, os miúdos andam irritados e é tudo motivo para discussão…", o: [
      [2, "Fico mais parado; com eles assim não há nada a fazer."],
      [4, "Ando atrás deles a mandá-los acalmar, um a um."],
      [5, "Vou separando as discussões, uma de cada vez, até tocar."],
      [7, "Puxo um jogo que se faça ali, parado e sem gritar."],
      [9, "Puxo um jogo, e ponho os mais irrequietos a ajudar-me a dirigi-lo."],
      [10, "Puxo um jogo, e combino com a auxiliar o que fazer nos próximos dias de chuva."]] },
    { q: "Avisam-te de véspera que a partir de amanhã passas a estar noutra escola. Ninguém te explica porquê…", o: [
      [2, "Fico em baixo, e nos primeiros dias custa-me aparecer."],
      [4, "Vou, e ando sempre a queixar-me de que ninguém me explicou nada."],
      [5, "Vou calado, mas fico com aquilo atravessado o mês todo."],
      [7, "Pergunto ao gestor de proximidade porque é que mudei, e vou."],
      [9, "Pergunto porquê, digo que gostava de ter sido avisado antes, e começo do zero com os novos miúdos."],
      [10, "Pergunto porquê, começo do zero, e pergunto à escola nova o que ali faz mais falta."]] },
    { q: "Estás a mediar uma discussão e um dos miúdos começa a atirar-se a ti…", o: [
      [2, "Respondo-lhe no mesmo tom; senão ele passa-me por cima."],
      [4, "Mando-o embora dali; assim não há conversa possível."],
      [5, "Faço de conta que não ouvi, e continuo como se nada fosse."],
      [7, "Digo-lhe com calma que assim não dá, e paro a conversa."],
      [9, "Paro, dou um tempo aos dois, e retomo quando acalmarem."],
      [10, "Paro, retomo depois, e digo-lhe o que senti quando ele fez aquilo."]] },
  ],

  // ── D5 · Iniciativa ──────────────────────────────────────────────
  D5: [
    { q: "Vês uma coisa que precisa de ser feita na escola, mas não é a tua função…", o: [
      [2, "Não faço; não é a minha função e há quem seja pago para isso."],
      [4, "Digo a alguém que aquilo devia ser feito, e fico à espera."],
      [5, "Faço, mas só depois de alguém me vir pedir."],
      [7, "Faço, porque estava à vista e era preciso."],
      [9, "Faço, e aviso a auxiliar para não se fazer duas vezes."],
      [10, "Faço, e proponho uma forma de aquilo não voltar a ficar."]] },
    { q: "O recreio está calmo, não há confusão nenhuma e ninguém te chamou…", o: [
      [2, "Aproveito para descansar; se está tudo calmo, não estou a fazer falta."],
      [4, "Fico a olhar de longe, a ver se aparece alguma coisa."],
      [5, "Pergunto à auxiliar se precisa de mim; se não precisar, fico por ali."],
      [7, "Vou ter com um grupo e meto-me na brincadeira deles."],
      [9, "Vou ter com os que estão mais sozinhos."],
      [10, "Puxo um jogo com eles, daqueles que juntam quem anda à parte."]] },
    { q: "Do outro lado do recreio, um grupo começa a aquecer. Ainda não é briga…", o: [
      [2, "Só vou lá se aquilo passar a ser mesmo briga."],
      [4, "Fico a olhar de longe, a ver no que dá."],
      [5, "Chamo-os dali para se acalmarem."],
      [7, "Vou até lá, e fico por perto a ver o que se passa."],
      [9, "Vou até lá, meto conversa, e corto aquilo antes de crescer."],
      [10, "Corto aquilo, e depois falo com eles sobre o que esteve por trás."]] },
    { q: "Há um miúdo que anda sempre sozinho no recreio e ninguém parece dar por isso…", o: [
      [2, "Se ele não se queixa, é porque gosta de estar assim."],
      [4, "Reparo, mas não sei bem o que havia de fazer, e deixo andar."],
      [5, "Digo-lhe para ir brincar com os outros, e fico por ali."],
      [7, "Vou ter com ele e meto conversa."],
      [9, "Falo com ele, percebo do que gosta, e ligo-o a quem gosta do mesmo."],
      [10, "Faço a ponte, e falo com o professor dele sobre o que notei."]] },
    { q: "Disseram-te que podes levar o que quiseres para o recreio, à tua escolha…", o: [
      [2, "Não levo nada; sem me dizerem o quê, não sei o que havia de levar."],
      [4, "Levo uma coisa que vi noutro sítio, sem ver se serve a estes miúdos."],
      [5, "Levo, mas vou perguntando a toda a hora se está bem assim."],
      [7, "Escolho eu o que vamos fazer, e levo por diante."],
      [9, "Pergunto-lhes antes do que gostavam, e levo isso."],
      [10, "Escolho com eles, e no fim vemos juntos o que muda para a próxima."]] },
    { q: "O gestor de proximidade vem visitar-te à escola e pergunta como é que aquilo vai…", o: [
      [2, "Digo que está tudo bem, mesmo não estando."],
      [4, "Queixo-me de tudo, sem dar um exemplo concreto."],
      [5, "Conto o que correu bem, e calo o que me está a custar."],
      [7, "Conto como está, o bom e o mau, com exemplos."],
      [9, "Conto como está, e peço-lhe ajuda no que me anda a custar."],
      [10, "Conto, peço ajuda, e proponho-lhe uma coisa que acho que ali resultava."]] },
    { q: "Achas que uma regra da escola está a criar mais conflitos do que a resolver…", o: [
      [2, "Não digo nada; regras são regras e não sou eu que as mudo."],
      [4, "Falo nisso com os colegas, mas não com quem decide."],
      [5, "Digo por alto que aquilo não está a resultar, e fico por aí."],
      [7, "Levo o assunto aos auxiliares e digo o que tenho visto."],
      [9, "Levo, e dou exemplos concretos do que vi acontecer."],
      [10, "Levo exemplos, e proponho uma forma diferente de fazer."]] },
    { q: "Uma auxiliar pede-te para levares um jogo para o recreio de amanhã. Ninguém te obriga…", o: [
      [2, "Digo que não dá; levar jogos não é bem a minha função."],
      [4, "Levo sempre o mesmo jogo, mesmo que eles já estejam fartos dele."],
      [5, "Penso num jogo qualquer ali na hora, no próprio recreio."],
      [7, "Levo um dos jogos que aprendi na formação."],
      [9, "Levo um, e penso antes em como o explicar àqueles miúdos."],
      [10, "Levo um, e mudo-o ali conforme os miúdos que aparecem."]] },
  ],

  // ── D6 · Qualidade da intervenção com as crianças ────────────────
  D6: [
    { q: "Um miúdo conta-te em segredo uma coisa grave que se passa em casa dele…", o: [
      [2, "Prometo que não conto a ninguém, e cumpro; ele confiou em mim."],
      [4, "Falo com outro mediador, e fica entre nós os dois."],
      [5, "Falo com ele outra vez, mas não digo nada a mais ninguém."],
      [7, "Falo nesse mesmo dia com o adulto responsável na escola."],
      [9, "Falo com esse adulto, e escrevo aquilo nas palavras dele."],
      [10, "Falo, e digo ao miúdo o que vai acontecer a seguir."]] },
    { q: "Um miúdo diz-te a rir, como quem não quer a coisa, que em casa lhe batem quando se porta mal…", o: [
      [2, "Rio-me também; ele estava a dizer aquilo a brincar."],
      [4, "Fico com um aperto, mas penso que aquilo é da família dele."],
      [5, "Conto na supervisão seguinte, daí a uma semana."],
      [7, "Falo nesse mesmo dia com um auxiliar ou com a escola."],
      [9, "Falo com a escola, e escrevo o que ele disse pelas palavras dele."],
      [10, "Falo com a escola, aviso o gestor de proximidade, e combinamos o que se segue."]] },
    { q: "Dois miúdos estão zangados e cada um te puxa para o seu lado, à espera que lhe dês razão…", o: [
      [2, "Dou razão ao que me parece estar a ser mais honesto."],
      [4, "Digo que a culpa é dos dois, e mando-os brincar."],
      [5, "Oiço os dois ao mesmo tempo, aos gritos um por cima do outro."],
      [7, "Digo-lhes que não vou escolher lado, e oiço um de cada vez."],
      [9, "Oiço um de cada vez até ao fim, sem o outro interromper."],
      [10, "Oiço os dois, e ponho-os a dizer um ao outro o que sentiram."]] },
    { q: "Estavas a ajudar dois miúdos a resolver uma discussão, e eles chegaram a um acordo. E agora?", o: [
      [2, "Fica por ali; o importante era pararem de discutir."],
      [4, "Digo-lhes que está tudo bem agora, e sigo em frente."],
      [5, "Repito eu o que acho que eles combinaram."],
      [7, "Peço-lhes que digam em voz alta o que ficou combinado."],
      [9, "Confirmo com os dois, e fica claro o que cada um vai fazer."],
      [10, "Confirmo, e combino com eles um dia para ver se resultou."]] },
    { q: "Tens de mediar uma discussão entre dois miúdos, e com um deles dás-te muito melhor…", o: [
      [2, "Dou razão ao que conheço melhor; sei como ele é."],
      [4, "Tento ser justo, mas acho que se nota de que lado estou."],
      [5, "Trato os dois igual, mas por dentro já decidi quem tem razão."],
      [7, "Ponho de lado o que sinto, e oiço os dois da mesma maneira."],
      [9, "Oiço os dois igual, e digo-lhes que me dou bem com os dois."],
      [10, "Peço a outra pessoa para mediar, por eu estar demasiado perto."]] },
    { q: "Chega um miúdo novo, não conhece ninguém, e fica de fora…", o: [
      [2, "Deixo-o estar; nos primeiros dias é normal ficar de fora."],
      [4, "Digo aos outros para o incluírem, e sigo em frente."],
      [5, "Apresento-o ao grupo, e depois deixo-o à vontade dele."],
      [7, "Ponho-o numa tarefa com outros, e vou ficando de olho."],
      [9, "Falo com ele a sós, e ponho-o onde o que gosta encaixa."],
      [10, "Recebo-o eu, e passa a haver alguém do grupo a fazer isso."]] },
    { q: "Tens de trabalhar com um miúdo de quem, sinceramente, não gostas…", o: [
      [2, "Vou-me chegando mais aos outros, sem dar muito nas vistas."],
      [4, "Custa-me esconder o que sinto, e acho que ele nota."],
      [5, "Faço o que tenho a fazer com ele, mas sem grande vontade."],
      [7, "Ponho o que sinto de lado, e faço o meu trabalho."],
      [9, "Faço o trabalho, e procuro conhecê-lo melhor a ver se mudo."],
      [10, "Faço o trabalho, e dou-lhe uma tarefa para fazermos os dois."]] },
    { q: "A meio de um jogo que levaste, percebes que eles estão a detestar aquilo…", o: [
      [2, "Continuo até ao fim; já tinha aquilo preparado."],
      [4, "Fico chateado com eles por não estarem a alinhar."],
      [5, "Mudo para uma coisa mais curta, e acabo mais cedo."],
      [7, "Mudo ali para outra coisa que eu sei que os agarra."],
      [9, "Paro, e pergunto-lhes o que é que preferiam fazer."],
      [10, "Mudo com eles ali, e no fim vemos o que falhou no plano."]] },
  ],
};
