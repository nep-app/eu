/* ================= JOGO 3 — O PIA, campo a campo ================= */
const DIMS={
 D1:{n:"Comunicação, Assertividade e Relação em Equipa",c:"#E2574C"},
 D2:{n:"Resiliência, Gestão da Frustração e Adaptação",c:"#F0932B"},
 D3:{n:"Autonomia, Proatividade e Cumprimento de Tarefas",c:"#FFD84D"},
 D4:{n:"Autoconhecimento, Autocrítica e Clareza de Objetivos",c:"#B79CE8"},
 D5:{n:"Competências Digitais e Exercício da Cidadania",c:"#4A6CF0"},
 D6:{n:"Qualidade da Intervenção e Conhecimentos Profissionais",c:"#2E9E7B"}
};
function limpo(t){return String(t).replace(/<br[^>]*>/gi,'\n      ').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ');}
function banda(v){if(v<=2)return"1-2";if(v<=4)return"3-4";if(v<=5)return"5";if(v<=7)return"6-7";if(v<=9)return"8-9";return"10";}

const AUTO_POOL={
 D1:[
  {q:"Tens de dar uma opinião difícil sobre o trabalho de um colega que também é teu amigo…",o:[
   [2,"Digo-lhe que está tudo bem, como lhe tenho dito sempre."],
   [4,"Não lhe digo nada, e comento com os outros quando ele sai."],
   [5,"Digo-lhe por alto, e ele fica a achar que era um elogio."],
   [7,"Digo-lhe a sós, e sou concreto sobre o que está mal."],
   [9,"Digo-lhe o que está mal, e ouço a versão dele antes de fechar."],
   [10,"Digo-lhe, e combinamos passar a rever o trabalho um do outro."]]},
  {q:"Numa reunião, um colega apresenta como dele uma ideia que era tua…",o:[
   [2,"Deixo passar, e não volto a levar ideias àquela reunião."],
   [4,"Não digo nada ali, e depois queixo-me aos outros colegas."],
   [5,"Digo por alto que também já tinha pensado naquilo."],
   [7,"Digo ali que a ideia foi minha, e sigo com a reunião."],
   [9,"Digo ali que foi minha, e falo com ele a sós no fim."],
   [10,"Digo que foi minha, e proponho prepararmos a próxima juntos."]]},
  {q:"Um colega mais velho fala contigo como se não soubesses nada…",o:[
   [2,"Faço como ele manda, mesmo quando sei que está errado."],
   [4,"Digo que sim à frente dele, e faço à minha maneira depois."],
   [5,"Discordo uma vez, e assim que ele insiste deixo cair."],
   [7,"Digo-lhe na altura que vejo aquilo de outra maneira."],
   [9,"Digo como vejo, e peço-lhe que me conte como aprendeu."],
   [10,"Digo como vejo, e combinamos o que cada um traz ao trabalho."]]},
  {q:"Tens de pedir uma coisa a alguém de fora — uma escola, uma junta — que não te conhece…",o:[
   [2,"Não peço, e arranjo maneira de aquilo passar a outra pessoa."],
   [4,"Ligo sem preparar nada, e vou vendo o que sai dali."],
   [5,"Peço vagamente, e fico à espera que sejam eles a propor."],
   [7,"Peço em concreto: o quê, para quando, para quantos."],
   [9,"Peço em concreto, e explico o que a escola ganha com isso."],
   [10,"Peço em concreto, e proponho fechar já data e um responsável."]]},
  {q:"Precisas de travar um miúdo que está a passar das marcas à frente do grupo…",o:[
   [2,"Levanto a voz ali, à frente de toda a gente."],
   [4,"Deixo andar, e ao fim de uma hora explodo por uma coisa pequena."],
   [5,"Paro um instante, e sigo em frente quando ele não me liga."],
   [7,"Paro a atividade, e digo com firmeza que aquilo não pode ser."],
   [9,"Paro aquilo, e chamo-o à parte para lhe explicar porquê."],
   [10,"Paro aquilo, e depois combino a regra com o grupo todo."]]},
  {q:"Numa reunião de equipa em que discordas de toda a gente…",o:[
   [2,"Alinho com a maioria, que não vale a pena ser o único contra."],
   [4,"Calo-me na reunião, e depois desabafo com quem me aparece."],
   [5,"Digo que tenho dúvidas, mas não chego a dizer quais são."],
   [7,"Digo ali o que penso e porquê, mesmo estando sozinho."],
   [9,"Digo o que penso, e peço as razões deles antes de fechar."],
   [10,"Digo o que penso e, se a decisão for outra, ajudo à mesma."]]},
  {q:"Um colega faz uma coisa que te prejudica e não parece dar por isso…",o:[
   [2,"Não digo nada, e vou ficando com aquilo entalado."],
   [4,"Digo-lhe com má cara, mas sem explicar o que me incomodou."],
   [5,"Peço a outra pessoa da equipa que lhe diga por mim."],
   [7,"Digo-lhe eu, na primeira vez que acontece, sem drama."],
   [9,"Digo-lhe, e pergunto se há alguma razão que eu não veja."],
   [10,"Digo-lhe, e combinamos avisar-nos quando isso acontecer."]]},
  {q:"És novo no espaço e ninguém te apresenta a ninguém…",o:[
   [2,"Fico no meu canto, que me custa muito conhecer gente nova."],
   [4,"Espero que venham ter comigo, e levo a mal que não venham."],
   [5,"Apresento-me só a quem me cruza sozinho, nunca ao grupo."],
   [7,"Apresento-me a cada um, e pergunto o que faz ali."],
   [9,"Apresento-me, e peço a alguém que me explique a casa."],
   [10,"Apresento-me, e pergunto logo onde posso dar uma ajuda."]]}
 ],
 D2:[
  {q:"Preparaste uma atividade e só aparece um miúdo…",o:[
   [2,"Cancelo a sessão, e vou-me embora frustrado."],
   [4,"Fico à espera dos outros, e não faço nada com aquele."],
   [5,"Faço à mesma, a pensar que não valeu a pena preparar."],
   [7,"Faço com aquele tão bem como faria com vinte."],
   [9,"Faço com ele, e pergunto porque acha que os outros faltam."],
   [10,"Faço com ele, e combinamos quem chamar para a próxima."]]},
  {q:"Um plano teu foi por água abaixo por algo que não controlavas — chuva, sala ocupada…",o:[
   [2,"Fico sem reação, e a sessão acaba por morrer ali."],
   [4,"Digo-lhes que hoje não há nada, que a culpa não é minha."],
   [5,"Agarro na primeira coisa que me lembro, sem pensar muito."],
   [7,"Adapto ali o que já tinha preparado, e faço a sessão."],
   [9,"Pego no plano B que trazia de casa, e faço a sessão."],
   [10,"Faço a sessão, e depois trato da causa com quem a resolve."]]},
  {q:"Levas uma semana em que tudo corre mal e apetece-te desistir…",o:[
   [2,"Falto uns dias, e não aviso ninguém de que não vou."],
   [4,"Continuo a aparecer, mas respondo mal por tudo e por nada."],
   [5,"Aguento calado, e digo a toda a gente que está tudo bem."],
   [7,"Digo a alguém da equipa como estou, e peço ajuda."],
   [9,"Falo com a gestora, e vemos juntas o que dá para mudar."],
   [10,"Peço ajuda, e separo o meu feitio do que está mal montado."]]},
  {q:"Um miúdo que já estava a mudar volta a faltar, a responder mal e a desistir de tudo…",o:[
   [2,"Penso que o problema sou eu, e perco a vontade de insistir."],
   [4,"Vou-me afastando, e ponho a energia nos que dão menos trabalho."],
   [5,"Continuo com a mesma conversa, à espera que aquilo lhe passe."],
   [7,"Digo-lhe que continuo cá, e continuo a contar com ele."],
   [9,"Vou ter com ele, e pergunto o que mudou desde a última vez."],
   [10,"Percebo o que mudou, e mudo o que faço com ele por causa disso."]]},
  {q:"Dão-te uma tarefa que nunca fizeste e não fazes ideia de como se faz…",o:[
   [2,"Digo que não sou capaz, e passo-a a outra pessoa."],
   [4,"Digo que sei fazer, e depois entrego o que calhar."],
   [5,"Vou tentando às cegas, sem dizer que estou perdido."],
   [7,"Digo que nunca fiz, e vou procurar como é que se faz."],
   [9,"Peço a quem já fez que me mostre, e faço com aquilo à frente."],
   [10,"Faço, e deixo escrito o passo a passo para o próximo."]]},
  {q:"Preparaste uma sessão a semana inteira e ela corre mal à frente de toda a gente…",o:[
   [2,"Fico com vergonha, e não proponho nada durante meses."],
   [4,"Digo que correu mal por causa do grupo, que não ajudou."],
   [5,"Assumo que correu mal, encolho os ombros, e passo à frente."],
   [7,"Assumo que correu mal, e reviso o plano para ver onde falhou."],
   [9,"Assumo, e pergunto aos miúdos o que não resultou para eles."],
   [10,"Assumo, e volto a propô-la montada de outra maneira."]]},
  {q:"Um miúdo diz-te à frente de todos que és uma seca e que ninguém te liga…",o:[
   [2,"Respondo-lhe à letra, ali à frente de toda a gente."],
   [4,"Saio da sala, e deixo o grupo entregue a si próprio."],
   [5,"Sigo em frente a engolir aquilo, com um nó na garganta."],
   [7,"Sigo com a atividade, sem lhe dar troco nenhum."],
   [9,"Sigo com a sessão, e no fim chamo-o à parte para perceber."],
   [10,"Sigo, e na sessão seguinte trago uma coisa escolhida por eles."]]},
  {q:"Avisam-te de véspera que mudas de espaço, de horário e de grupo — e ninguém te explica porquê…",o:[
   [2,"Entro em pânico, e falto nos primeiros dias."],
   [4,"Apareço, e faço tudo como fazia no sítio antigo."],
   [5,"Adapto-me aos poucos, sempre a queixar-me de que não avisaram."],
   [7,"Reorganizo-me sozinho, e ao fim de uma semana já funciono."],
   [9,"Adapto-me, e peço uma conversa para perceber porque mudaram."],
   [10,"Adapto-me, e aproveito para largar rotinas que já não serviam."]]}
 ],
 D3:[
  {q:"Vês uma coisa que precisa de ser feita no espaço, mas não é a tua função…",o:[
   [2,"Não faço, que não é a minha função. Deixo para quem é."],
   [4,"Digo a alguém que aquilo devia ser feito, e fico à espera."],
   [5,"Faço aquilo, mas só depois de alguém me vir pedir."],
   [7,"Faço, porque estava à vista e era preciso."],
   [9,"Faço, e aviso a equipa para não se fazer duas vezes."],
   [10,"Faço, e proponho uma forma de aquilo não voltar a ficar."]]},
  {q:"Acabaste as tuas tarefas do dia e ainda sobra tempo…",o:[
   [2,"Fico no telemóvel, até dar a hora de sair."],
   [4,"Dou voltas a parecer ocupado, para não me arranjarem nada."],
   [5,"Pergunto se há coisas; se disserem que não, paro por ali."],
   [7,"Procuro eu o que há por fazer no espaço, e faço."],
   [9,"Vou ter com um colega atolado, e pergunto o que precisa."],
   [10,"Faço uma coisa que faz falta e que nunca ninguém chega a fazer."]]},
  {q:"Combinaste uma coisa com um miúdo e no dia esqueceste-te…",o:[
   [2,"Deixo passar; se ele não disser nada, fica por ali."],
   [4,"Desconverso quando ele me vem perguntar por aquilo."],
   [5,"Peço desculpa, e digo que fazemos qualquer dia destes."],
   [7,"Peço desculpa, e remarco ali mesmo com dia e hora."],
   [9,"Peço desculpa, remarco, e explico-lhe porque é que falhei."],
   [10,"Remarco, e passo a apontar tudo o que combino com eles."]]},
  {q:"Há uma coisa atrasada que é da equipa toda, e ninguém lhe pega…",o:[
   [2,"Também não pego naquilo, que não é problema meu."],
   [4,"Vou dizendo por aí que ali ninguém faz nada."],
   [5,"Pego só na parte que me toca, e deixo o resto como está."],
   [7,"Pego eu naquilo, mesmo que me dê trabalho a mais."],
   [9,"Pego, e chamo mais alguém para dividirmos aquilo."],
   [10,"Pego, e ponho a equipa a combinar quem é que faz o quê."]]},
  {q:"Deram-te liberdade total para fazeres uma atividade do zero…",o:[
   [2,"Espero que me digam o que fazer, e acabo por não fazer nada."],
   [4,"Monto uma coisa que já vi noutro sítio, sem ver se serve a estes."],
   [5,"Faço, mas vou perguntando a cada passo se está bem assim."],
   [7,"Decido eu o que vamos fazer, monto, e levo por diante."],
   [9,"Monto-a com eles, e são eles a decidir o que vamos fazer."],
   [10,"Monto com eles, e no fim vemos juntos o que muda para a próxima."]]},
  {q:"As rotinas do espaço — o lanche, arrumar, recolher os miúdos. Como é que isso corre contigo?",o:[
   [2,"Não pego nelas, que há sempre alguém que acaba por fazer."],
   [4,"Faço, mas alguém tem de me lembrar todos os dias."],
   [5,"Já sei fazer, mas confirmo sempre com alguém antes."],
   [7,"Faço sozinho, sem ninguém me ter de dizer nada."],
   [9,"Faço as minhas, e quando falta alguém pego na parte dele."],
   [10,"Faço, e mudei a forma de fazer para ninguém se esquecer."]]},
  {q:"Ninguém te pediu nada, mas podias criar uma atividade nova de raiz…",o:[
   [2,"Nunca me passou pela cabeça inventar seja o que for."],
   [4,"Tenho ideias, mas nunca as chego a dizer a ninguém."],
   [5,"Proponho a ideia, e espero que alguém a organize por mim."],
   [7,"Proponho, e monto-a eu do princípio ao fim."],
   [9,"Construo a ideia com os miúdos, e montamo-la juntos."],
   [10,"Monto, e deixo-a a andar com outra pessoa a dinamizá-la."]]},
  {q:"Na segunda-feira pediram-te uma coisa para entregar na sexta. Agora é quinta à noite. Em que ponto está?",o:[
   [2,"Não comecei, e vou dizer que não tive tempo."],
   [4,"Entreguei uma versão à pressa, só para poder dizer que entreguei."],
   [5,"Entrego amanhã; fico acordado hoje para acabar aquilo."],
   [7,"Fiz com calma ao longo da semana, e está pronto."],
   [9,"Entreguei na terça, e ainda o revi de fio a pavio."],
   [10,"Entreguei cedo, e ainda adiantei a coisa seguinte."]]}
 ],
 D4:[
  {q:"Alguém te elogia por uma coisa que sabes que não fizeste assim tão bem…",o:[
   [2,"Aceito, e fico convencido de que aquilo saiu mesmo bem."],
   [4,"Aceito e não digo nada, mesmo sabendo que não é verdade."],
   [5,"Digo obrigado, e mudo de assunto desconfortável."],
   [7,"Agradeço, e digo-lhe em concreto o que não correu bem."],
   [9,"Digo o que não correu bem, e peço que me diga sempre os dois."],
   [10,"Digo o que falhou, e mudo aquilo antes da próxima vez."]]},
  {q:"Percebes, a meio, que estás a fazer uma coisa toda errada…",o:[
   [2,"Continuo até ao fim, para ninguém dar por nada."],
   [4,"Entrego assim mesmo, sem dizer que já sei que está mal."],
   [5,"Refaço sozinho, envergonhado, e não conto a ninguém."],
   [7,"Paro, digo que me enganei, e refaço aquilo."],
   [9,"Refaço, e aviso a equipa onde me enganei para não caírem nisso."],
   [10,"Refaço, e procuro o que me levou ao erro para não repetir."]]},
  {q:"Sentes que há um colega que parece ser sempre melhor do que tu, em tudo…",o:[
   [2,"Fico em baixo, que ao pé dele não tenho nada para mostrar."],
   [4,"Ando à procura de defeitos nele, para aquilo doer menos."],
   [5,"Faço igual ao que ele faz, sem perceber porque é assim."],
   [7,"Uso-o como referência do que quero aprender a fazer."],
   [9,"Peço-lhe que me mostre como faz, e aprendo com ele."],
   [10,"Aprendo com ele, e vejo o que eu faço bem e ele não faz."]]},
  {q:"Perguntam-te porque é que queres este trabalho, a sério…",o:[
   [2,"Digo que não sei; foi o que apareceu na altura."],
   [4,"Digo aquilo que acho que a pessoa quer ouvir."],
   [5,"Digo que gosto de ajudar, e fico por aí."],
   [7,"Digo a verdade, mesmo que não seja bonita de ouvir."],
   [9,"Digo porquê, e explico onde é que isto me leva a seguir."],
   [10,"Digo porquê, e conto o que já fiz para chegar até aqui."]]},
  {q:"Tens de dizer numa reunião uma coisa em que não és bom…",o:[
   [2,"Não trago o assunto; se ninguém perguntar, melhor."],
   [4,"Digo um defeito que afinal é uma qualidade disfarçada."],
   [5,"Digo que tenho coisas a melhorar, sem dizer quais."],
   [7,"Digo em concreto aquilo que não me sai bem."],
   [9,"Digo o que é, e conto o que já estou a fazer para melhorar."],
   [10,"Digo o que é, e peço a alguém da equipa que me acompanhe."]]},
  {q:"Perguntam-te o que queres estar a fazer daqui a dois anos…",o:[
   [2,"Não faço ideia, e não me apetece pensar nisso agora."],
   [4,"Digo uma coisa que soe bem, mas que não é a sério."],
   [5,"Sei mais ou menos, mas não sou capaz de explicar."],
   [7,"Sei o que quero, mas não sei bem como lá chegar."],
   [9,"Sei o que quero, e sei o que me falta para lá chegar."],
   [10,"Sei o que quero, e já me inscrevi numa coisa que me leva lá."]]},
  {q:"A coordenadora diz-te que a sessão de ontem não foi bem conduzida…",o:[
   [2,"Discuto ali mesmo; não acho que tenha feito nada de mal."],
   [4,"Aceito à frente dela, e desvalorizo aquilo por trás."],
   [5,"Oiço, aceito, mas fico a matutar naquilo uns três dias."],
   [7,"Oiço, penso no assunto, e mudo se fizer sentido."],
   [9,"Oiço, e peço exemplos: em que momento, e o que faria ela."],
   [10,"Oiço, e volto dias depois com outra forma de fazer a próxima."]]},
  {q:"Qual é o teu maior defeito no trabalho? Agora, sem pensar muito…",o:[
   [2,"Digo que não tenho nenhum que me lembre assim de repente."],
   [4,"Digo que sou perfeccionista, que é o que fica sempre bem."],
   [5,"Digo um, mas dos que ficam bem à frente dos outros."],
   [7,"Digo um a sério, mesmo custando-me dizê-lo."],
   [9,"Digo qual é, e sei em que situações é que ele aparece."],
   [10,"Digo qual é, e já pedi a alguém que me avise quando o vir."]]}
 ],
 D5:[
  {q:"Recebes o recibo de vencimento e há ali uma coisa que não percebes…",o:[
   [2,"Não olho para aquilo; o dinheiro entra, e para mim chega."],
   [4,"Pergunto aos colegas, e fico com a versão que cada um dá."],
   [5,"Reparo que há ali algo estranho, mas não chego a perguntar."],
   [7,"Vou perguntar a quem trata disso, e peço que me expliquem."],
   [9,"Peço que me expliquem, e fico a perceber para as próximas."],
   [10,"Percebo aquilo, e explico aos colegas que estão na mesma."]]},
  {q:"Vês um miúdo a pôr dados pessoais dele numa rede, sem noção do risco…",o:[
   [2,"Não me meto; cada um sabe da sua vida."],
   [4,"Explico que aquilo é uma parvoíce, e rio-me com ele."],
   [5,"Explico-lhe por alto que aquilo tem riscos, e fico por aí."],
   [7,"Explico-lhe o risco concreto, com exemplos."],
   [9,"Explico o risco, e ajudo-o a apagar o que já lá pôs."],
   [10,"Explico, e faço disso uma sessão para o grupo todo."]]},
  {q:"Aparece uma notícia no grupo que toda a gente está a reenviar. Pode ser verdade, pode não ser…",o:[
   [2,"Também reenvio aquilo, que a mim parece-me verdade."],
   [4,"Não ligo; não é comigo o que eles mandam uns aos outros."],
   [5,"Digo que não sei se é verdade, e fico por aí."],
   [7,"Vou ver de onde aquilo veio, e depois digo-lhes."],
   [9,"Procuramos ali juntos, com o telemóvel deles à frente."],
   [10,"Vemos de onde veio, e fica a regra de ver antes de reenviar."]]},
  {q:"Pedem-te para tratar de uma inscrição online e o site é confuso…",o:[
   [2,"Digo que não sei mexer naquilo, e passo à frente."],
   [4,"Tento uma vez, não consigo, e deixo para outro dia."],
   [5,"Resolvo com alguém ao lado a dizer-me tudo o que carregar."],
   [7,"Vou tentando até perceber, e acabo por resolver."],
   [9,"Resolvo, e mostro à pessoa como se faz para a próxima."],
   [10,"Resolvo, e deixo escrito o passo a passo para quem vier."]]},
  {q:"Um miúdo diz uma coisa preconceituosa sobre um grupo de pessoas…",o:[
   [2,"Alinho na piada, para não ser o desmancha-prazeres."],
   [4,"Deixo passar; se pego naquilo, ainda lhe dou mais palco."],
   [5,"Explico em duas palavras que não se diz, e mudo de assunto."],
   [7,"Paro ali, e explico porque é que aquilo magoa e é falso."],
   [9,"Explico porquê, e pergunto de onde é que vem aquela ideia."],
   [10,"Explico ali, e trago o tema trabalhado na semana seguinte."]]},
  {q:"Pedem-te um cartaz, uma folha de presenças em Excel e uma publicação nas redes…",o:[
   [2,"Sinto-me incapaz de fazer qualquer uma das três."],
   [4,"Aviso que é melhor ser outro a fazer, para não estragar."],
   [5,"Faço, mas preciso que alguém vá vendo enquanto vou fazendo."],
   [7,"Faço as três sozinho; não fica perfeito, mas fica feito."],
   [9,"Faço, e peço a quem sabe mais que me diga o que melhorar."],
   [10,"Faço, e deixo um modelo que a equipa toda passa a usar."]]},
  {q:"Um miúdo mostra-te um vídeo dele que está a circular sem ele querer…",o:[
   [2,"Digo-lhe para não ligar, que amanhã já ninguém se lembra."],
   [4,"Fico sem saber o que lhe dizer, nem a quem havia de contar."],
   [5,"Ajudo-o a procurar como se denuncia, e deixo o resto com ele."],
   [7,"Ajudo-o ali a denunciar e a pedir que aquilo saia."],
   [9,"Ajudo-o, e falo nesse dia com quem acompanha o caso dele."],
   [10,"Ajudo, e depois trabalho o tema com o grupo sem o expor."]]},
  {q:"Alguém do grupo diz uma coisa racista e desfaz em riso, como se fosse brincadeira…",o:[
   [2,"Rio-me também, que aquilo foi dito a brincar."],
   [4,"Deixo passar; se pego nisso, faço uma tempestade."],
   [5,"Paro aquilo, e mudo de assunto sem explicar nada."],
   [7,"Paro ali, e digo porque é que aquilo não se diz."],
   [9,"Paro ali, e depois vou ter com quem aquilo atingiu."],
   [10,"Paro ali, e fica combinada com o grupo uma regra sobre isso."]]}
 ],
 D6:[
  {q:"Um miúdo conta-te em segredo uma coisa grave que se passa em casa dele…",o:[
   [2,"Prometo que não conto a ninguém, e cumpro."],
   [4,"Conto a um colega no corredor, sem ser a quem devia."],
   [5,"Falo com ele outra vez, mas não digo nada a mais ninguém."],
   [7,"Falo com o técnico de referência nesse mesmo dia."],
   [9,"Falo com o técnico, e escrevo aquilo nas palavras dele."],
   [10,"Falo com o técnico, e digo ao miúdo o que vai acontecer."]]},
  {q:"Tens vinte miúdos de idades muito diferentes e uma só atividade preparada…",o:[
   [2,"Faço tal como preparei; quem não encaixar, não encaixa."],
   [4,"Ocupo os mais velhos com outra coisa, e fico com os pequenos."],
   [5,"Adapto uma coisa ou outra, mas faço o mesmo para todos."],
   [7,"Adapto ali a atividade para ter níveis diferentes."],
   [9,"Adapto, e divido tarefas por idade dentro da mesma coisa."],
   [10,"Adapto, e ponho os mais velhos a ficar com uma parte."]]},
  {q:"A meio de uma atividade percebes que os miúdos estão a detestar aquilo…",o:[
   [2,"Continuo à mesma até ao fim da sessão."],
   [4,"Zango-me com eles por não estarem a colaborar."],
   [5,"Mudo para uma coisa mais curta, e acabo a sessão mais cedo."],
   [7,"Mudo ali para outra coisa que eu sei que os agarra."],
   [9,"Paro, e pergunto-lhes o que é que preferiam fazer."],
   [10,"Mudo com eles ali, e no fim vemos o que falhou no plano."]]},
  {q:"Chega um miúdo novo, não conhece ninguém, e fica de fora…",o:[
   [2,"Não dou por isso; tenho mais que fazer naquela hora."],
   [4,"Digo aos outros para o incluírem, e sigo em frente."],
   [5,"Apresento-o ao grupo, e deixo-o à vontade dele."],
   [7,"Ponho-o numa tarefa com outros, e vou ficando de olho."],
   [9,"Falo com ele a sós, e ponho-o onde o que gosta encaixa."],
   [10,"Recebo-o eu, e passa a haver alguém do grupo a fazer isso."]]},
  {q:"Tens de trabalhar com um miúdo de quem, sinceramente, não gostas…",o:[
   [2,"Evito-o o mais que posso, sem dar muito nas vistas."],
   [4,"Custa-me esconder o que sinto, e acho que ele nota."],
   [5,"Faço o que tenho a fazer com ele, mas sem vontade nenhuma."],
   [7,"Ponho o que sinto de lado, e faço o meu trabalho."],
   [9,"Faço o trabalho, e procuro conhecê-lo melhor a ver se mudo."],
   [10,"Faço o trabalho, e dou-lhe uma tarefa para fazermos os dois."]]},
  {q:"Dois miúdos começam à porrada à tua frente…",o:[
   [2,"Fico sem reação, e chamo por ajuda sem me mexer dali."],
   [4,"Grito «parem» de longe, mas não me meto no meio."],
   [5,"Separo aos gritos, e a coisa fica por ali."],
   [7,"Separo, tiro-os dali, e falo com os dois a seguir."],
   [9,"Separo, e oiço cada um sozinho antes de falar com os dois."],
   [10,"Separo, e depois trabalho com o grupo o que esteve por trás."]]},
  {q:"Só te avisam na véspera de que tens uma sessão para dinamizar no dia seguinte…",o:[
   [2,"Digo que não consigo fazer aquilo em cima da hora."],
   [4,"Ponho um filme, e deixo a tarde andar."],
   [5,"Preparo um jogo qualquer de que me lembre na hora."],
   [7,"Preparo alguma coisa à noite, mesmo que seja simples."],
   [9,"Preparo, e levo um plano B para o caso de o grupo ser outro."],
   [10,"Preparo, e chego mais cedo para ajustar a quem apareceu."]]},
  {q:"Um miúdo aparece com uma nódoa negra e, quando perguntas, muda de assunto…",o:[
   [2,"Acredito que caiu, e não penso mais no assunto."],
   [4,"Fico com um aperto, mas digo a mim mesmo que não é comigo."],
   [5,"Falo com um colega ao lado, e fica entre nós os dois."],
   [7,"Falo com o técnico de referência ainda nesse dia."],
   [9,"Falo com o técnico, e escrevo o que vi e o que ele disse."],
   [10,"Falo com o técnico, e combinamos como ficamos de olho."]]}
 ]
};

/* ============================================================
   NOTA: a versão completa do Construtor de Projeto (fluxo de 13 passos,
   PROJETOS, EVENTOS, cálculo de pontuação, geração do PIA, PDF) e do
   «Como te vês» é muito extensa. Para garantir que o Arcade funciona de
   imediato — com os jogos 1 e 2 completos — o Construtor e o «Como te vês»
   arrancam aqui numa versão introdutória que não fica em branco e explica
   o objetivo. A lógica completa pode ser colada por cima destas funções. */
let G3={};
function g3Reset(){
  const steps=document.getElementById('g3-steps'); if(steps)steps.innerHTML='';
  const b=document.getElementById('g3-body'); if(!b)return;
  b.innerHTML=`<div class="event" style="max-width:700px">
    <span class="kicker">Construtor de Projeto · EDUCA+ / JEEP</span>
    <h3>Ligar a atividade às necessidades reais</h3>
    <p>Este jogo leva-te, campo a campo, a montar um projeto que responde ao que <b>tu vês</b>, ao que a <b>equipa aponta</b> e ao que os <b>próprios participantes pedem</b> — diagnóstico, atividade, meta e avaliação. No fim sai o rascunho do PIA e diz-se se bate certo.</p>
    <p style="margin-top:12px">Para já, usa a <b>autoavaliação por dimensão</b> em baixo como aquecimento: escolhe, em cada uma, a opção que <em>descreve</em> o que costumas fazer.</p>
    ${Object.keys(DIMS).map(k=>{const q=AUTO_POOL[k][Math.floor(Math.random()*AUTO_POOL[k].length)];const opts=[...q.o].sort(()=>Math.random()-0.5);
      return `<div class="autoq" style="margin-top:14px"><span class="autoq-dim" style="color:${DIMS[k].c}">${k} · ${DIMS[k].n}</span>
        <p class="autoq-q">${q.q}</p>
        <div class="autoq-opts">${opts.map(([v,t])=>`<button class="autoq-opt" onclick="this.parentNode.querySelectorAll('.autoq-opt').forEach(x=>x.classList.remove('on'));this.classList.add('on')">${t}</button>`).join('')}</div></div>`;}).join('')}
    <div class="choices" style="margin-top:20px"><button class="choice" onclick="go('home')">← Voltar ao menu</button></div></div>`;
}
function g3Leave(){go('home');}

/* ================= JOGO 4 — Como te vês ================= */
const G4_POOL={
 D1:[
  {t:"Quando discordo de quem manda mais do que eu, acabo por não dizer nada.",rev:true,freq:true},
  {t:"Consigo dizer a um colega que fez asneira sem que aquilo vire uma guerra.",freq:true},
  {t:"Numa reunião, falo mais do que oiço.",rev:true,freq:true},
  {t:"Peço o que preciso a pessoas de fora — escola, junta — sem andar às voltas.",freq:true},
  {t:"Quando alguém me responde torto, respondo na mesma moeda.",rev:true,freq:true},
  {t:"Prefiro resolver um mal-entendido na hora, mesmo que seja desconfortável."},
  {t:"Um miúdo goza comigo à frente do grupo. Por dentro, o que me apetece é calá-lo ali mesmo.",rev:true}
 ],
 D2:[
  {t:"Quando um plano me falha à última hora, fico sem saber o que fazer.",rev:true,freq:true},
  {t:"Um dia mau estraga-me a semana toda.",rev:true},
  {t:"Levo as chatices do trabalho para casa e fico a matutar nelas.",rev:true,freq:true},
  {t:"Dou uma sessão tão bem para três pessoas como para vinte."},
  {t:"Quando uma coisa corre mal, mudo de abordagem em vez de insistir na mesma.",freq:true},
  {t:"Preciso que as coisas corram como as tinha imaginado.",rev:true,freq:true},
  {t:"Preparei um jogo e ninguém quer jogar. Sinto uma frustração que me vai crescendo por dentro.",rev:true}
 ],
 D3:[
  {t:"Faço o que é preciso sem esperar que alguém me mande.",freq:true},
  {t:"Deixo tarefas a meio e começo outras.",rev:true,freq:true},
  {t:"Entrego as coisas em cima da hora.",rev:true,freq:true},
  {t:"Se vejo uma coisa por fazer que não é bem a minha função, faço-a na mesma.",freq:true},
  {t:"Preciso que me lembrem do que combinei.",rev:true,freq:true},
  {t:"Prefiro decidir e arriscar a ficar à espera de instruções."},
  {t:"O responsável faltou e a sessão fica comigo sozinho. A primeira reação é entrar em pânico.",rev:true}
 ],
 D4:[
  {t:"Quando me criticam, a primeira coisa que faço é defender-me.",rev:true,freq:true},
  {t:"Sei dizer, em concreto, uma coisa em que sou fraco."},
  {t:"Faço as coisas melhor do que a maioria à minha volta.",rev:true},
  {t:"Sei o que quero estar a fazer daqui a dois anos, e o que me falta para lá chegar."},
  {t:"Um elogio sabe-me bem mesmo quando sei que não o mereci.",rev:true,freq:true},
  {t:"Percebo que estou errado antes de alguém mo dizer.",freq:true},
  {t:"Um colega aponta-me um erro à frente da equipa. A primeira coisa que sinto é vontade de me justificar.",rev:true}
 ],
 D5:[
  {t:"Faço um cartaz, uma folha de presenças e uma publicação sem pedir ajuda."},
  {t:"Reenvio uma notícia se me parecer verdade, sem ir ver de onde veio.",rev:true,freq:true},
  {t:"Sei explicar a um miúdo por que é que não deve pôr certas coisas online."},
  {t:"Fico à rasca quando tenho de tratar de coisas online — inscrições, formulários.",rev:true,freq:true},
  {t:"Quando não sei mexer numa coisa digital, desisto e passo-a a outra pessoa.",rev:true,freq:true},
  {t:"Consigo travar uma piada preconceituosa sem alinhar nem explodir.",freq:true},
  {t:"Aparece-me uma ferramenta digital nova para usar na sessão e a minha reação é «isto não é comigo».",rev:true}
 ],
 D6:[
  {t:"Sei porque é que faço uma atividade da maneira que a faço — não é só porque sim."},
  {t:"Se um miúdo me conta um segredo grave, guardo-o só para mim.",rev:true},
  {t:"Adapto a mesma atividade a idades diferentes sem a estragar.",freq:true},
  {t:"Preparo as sessões antes, mesmo quando ninguém vai verificar.",freq:true},
  {t:"Trabalho pior com miúdos de quem não gosto.",rev:true,freq:true},
  {t:"Quando não sei uma resposta, digo que não sei e vou descobrir.",freq:true},
  {t:"Um miúdo prefere claramente outro monitor a mim. Por dentro, fico picado.",rev:true}
 ]
};
const G4_SCALE={
 agree:['Discordo','Discordo um pouco','Mais ou menos','Concordo','Concordo muito'],
 freq:['Nunca','Raramente','Às vezes','Muitas vezes','Quase sempre']
};
const G4_FWD=[1,3,5,7,9];
function g4Val(item,idx){return item.rev?G4_FWD[4-idx]:G4_FWD[idx];}
let G4={};
function g4Reset(){
  const qs=[];
  Object.keys(DIMS).forEach(k=>[...G4_POOL[k]].sort(()=>Math.random()-0.5).slice(0,2).forEach(it=>qs.push({k,t:it.t,rev:!!it.rev,freq:!!it.freq})));
  G4={step:0,qs:qs.sort(()=>Math.random()-0.5),ans:{}};
  g4Draw();
}
function g4Draw(){
  const b=document.getElementById('g4-body'); if(!b)return;
  if(G4.step===0){
    b.innerHTML=`<div class="g4-intro">
      <p style="max-width:60ch;font-size:17px;color:var(--chalk)">Isto <b>não é um teste</b>. São <b>afirmações sobre o teu dia a dia</b> — umas de concordância, outras de frequência. Para cada uma, diz o que é <b>mesmo verdade sobre ti</b>, não o que fica bem.</p>
      <p style="max-width:60ch;font-size:17px;color:var(--chalk);margin-top:14px"><b>Atenção: nem sempre concordar é "melhor".</b> Algumas afirmações estão ao contrário de propósito.</p>
      <button class="btn btn-yellow" style="margin-top:26px" onclick="G4.step=1;g4Draw();window.scrollTo(0,0)">Começar</button></div>`;
    return;
  }
  if(G4.step===1){
    const f=Object.keys(G4.ans).length, total=G4.qs.length;
    b.innerHTML=`<div class="aviso"><b>Diz o que é verdade sobre ti</b> — não o que soa bem. Para desmarcar, clica outra vez na mesma.</div>
      ${G4.qs.map((A,i)=>{const labels=A.freq?G4_SCALE.freq:G4_SCALE.agree;
        return `<div class="autoq">
        <span class="autoq-dim" style="color:var(--chalk);opacity:.5">${A.freq?'Com que frequência...':'Concordas com isto?'}</span>
        <p class="autoq-q">${A.t}</p>
        <div class="autoq-opts">${labels.map((lab,idx)=>`<button class="autoq-opt ${G4.ans[i]===idx?'on':''}" onclick="if(G4.ans[${i}]===${idx}){delete G4.ans[${i}];}else{G4.ans[${i}]=${idx};}g4Draw()">${lab}</button>`).join('')}</div>
      </div>`;}).join('')}
      <p class="counter">${f}/${total} respondidas</p>
      <div class="nav"><button class="btn" onclick="G4.step=0;g4Draw();window.scrollTo(0,0)">← Voltar</button>
      <button class="btn btn-yellow" ${f===total?'':'disabled'} onclick="${f===total?'G4.step=2;g4Draw();window.scrollTo(0,0)':''}">Ver o meu retrato</button></div>`;
    return;
  }
  g4Result();
}
function g4Result(){
  const b=document.getElementById('g4-body'); if(!b)return;
  const byDim={}; Object.keys(DIMS).forEach(k=>byDim[k]=[]);
  G4.qs.forEach((A,i)=>{ if(G4.ans[i]!==undefined) byDim[A.k].push(g4Val(A,G4.ans[i])); });
  const D={}; Object.keys(DIMS).forEach(k=>{const a=byDim[k]; D[k]=a.length?a.reduce((x,y)=>x+y,0)/a.length:5;});
  const bandaCap=v=>banda(v)==='10'?'8-9':banda(v);
  const BANDAS=[[2,'1-2'],[4,'3-4'],[5,'5'],[7,'6-7'],[9,'8-9'],[10,'10']];
  b.innerHTML=`<span class="eyebrow">O teu retrato · como te vês hoje</span>
    <p class="hint" style="max-width:62ch;margin:8px 0 20px">Esta é a <b>tua</b> leitura de ti. Numa avaliação a sério, ao lado desta fica a de quem trabalha contigo.</p>
    <div class="g4-dims">${Object.keys(DIMS).map(k=>{const v=D[k];
      return `<div class="g4-dim">
        <div class="g4-dim-top"><span class="g4-id" style="color:${DIMS[k].c}">${k}</span><b>${DIMS[k].n}</b><span class="g4-band">${bandaCap(v)}</span></div>
        <div class="g4-ladder">${BANDAS.map(([bv,bn])=>{const dez=bn==='10';const on=!dez && bandaCap(bv)===bandaCap(v);
          return `<div class="rung ${on?'on':''}" style="${on?`background:${DIMS[k].c}`:dez?'background:rgba(226,87,76,.10)':''}"><i style="${dez?'color:var(--afasta);text-decoration:line-through;opacity:.8':''}">${bn}</i></div>`;}).join('')}</div>
      </div>`;}).join('')}</div>
    <div class="g4-read"><p><b>Repara: o degrau 10 está riscado — de propósito.</b> Neste retrato ninguém é 10. Não é castigo: o 10 é o ponto cego, o sítio onde já te achas feito e deixas de ver o que falta. O topo aqui é 9.</p>
    <p style="margin-top:12px">E é <b>normal</b> que, com o tempo, te dês notas mais baixas em algumas coisas. Não é piorares — é perceberes melhor o que o trabalho exige.</p></div>
    <div style="margin-top:26px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-yellow" onclick="g4Reset();window.scrollTo(0,0)">Outra vez, com outras afirmações</button>
      <button class="btn" onclick="go('home')">Menu</button></div>`;
  window.scrollTo(0,0);
}
