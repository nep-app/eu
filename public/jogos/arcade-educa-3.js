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


const FAIXAS=[
 {id:'novos',n:"Crianças mais novas",sub:"6 aos 10 anos",d:"Energia a mais, paciência a menos.",
  needs:['energia','conflitos','regras','diversidade','familias','competencias','telemovel']},
 {id:'medios',n:"Pré-adolescentes",sub:"11 aos 15 anos",d:"Já não são crianças e ainda não são jovens.",
  needs:['energia','emocional','telemovel','consola','fechados','escolar','participacao','conflitos','digital','familias']},
 {id:'jovens',n:"Jovens mais velhos",sub:"16 anos ou mais",d:"Vêm pela wi-fi e ficam pelo sofá.",
  needs:['emocional','telemovel','consola','transicao','escolar','participacao','fechados','digital','competencias']}
];
const NEEDS_ESPACO=['espaco','comunidade','motivacao'];

const FONTE={preparacao:'Preparação',materiais:'Materiais',parceiros:'Apoio',divulgacao:'Divulgação',registo:'Registo'};
const ENERGIA_ROWS=[
 ['preparacao','Preparação','Horas a preparar ANTES: pensar, montar, ensaiar. Não é o tempo de lá estar — esse é dado.'],
 ['materiais','Materiais','O que se compra, empresta ou improvisa.'],
 ['parceiros','Apoio','A equipa do espaço, a entidade, outros colegas JEEP e parceiros de fora. Quem te safa quando corre mal.'],
 ['divulgacao','Divulgação','Cartazes, boca a boca, avisar as famílias. Sem isto ninguém sabe que existes.'],
 ['registo','Registo','Fotos, presenças, números. É o que prova que aconteceu.']
];
const DESBLOQUEIA=[
 {k:'materiais',min:3,t:"Tens reserva: se faltar material a meio, não paras."},
 {k:'parceiros',min:3,t:"Podes pedir material emprestado quando faltar."},
 {k:'parceiros',min:2,t:"Podes pedir reforço quando aparecer gente a mais."},
 {k:'divulgacao',min:3,t:"Se ninguém aparecer à primeira, consegues recuperar."},
 {k:'registo',min:3,t:"Entregas o relatório com números — e passas o projeto a alguém."},
 {k:'registo',min:4,t:"Consegues PROVAR o que fizeste na avaliação final."},
 {k:'preparacao',min:3,t:"Montas coisas de raiz a meio, sem improvisar."}
];
const PASSOS_CUSTOM=[
 ["Preparar as sessões antes de as dar",'preparacao'],
 ["Decidir com eles como se faz",'preparacao'],
 ["Falar com quem me pode dar espaço ou apoio",'parceiros'],
 ["Arranjar o material necessário",'materiais'],
 ["Divulgar e chamar as pessoas",'divulgacao'],
 ["Registar presenças, fotos e resultados",'registo']
];
const EIXO_FONTES={
  alcance:{divulgacao:1,parceiros:.5}, qualidade:{preparacao:1,materiais:.75},
  sust:{parceiros:1,registo:.75,preparacao:.25},
  aprend:{registo:.5,preparacao:.5,materiais:.25,parceiros:.25,divulgacao:.25}
};
const EIXO_NOME={alcance:'Alcance',qualidade:'Qualidade',sust:'Sustentabilidade',aprend:'O que tu aprendes'};
let G3={},G3_STEPS=13;
const EV_BOM=1.15, EV_MAU=1.85;

function g3Leave(){
  if(G3.step>0 && G3.step<14){
    if(!confirm('Se saíres agora, perdes este PIA — o jogo não guarda nada. Sair mesmo assim?'))return;
  }
  go('home');
}
function g3Reset(){
  const auto=Object.keys(DIMS).map(k=>{
    const q=AUTO_POOL[k][Math.floor(Math.random()*AUTO_POOL[k].length)];
    return {k,q:q.q,o:shuffle([...q.o])};
  });
  G3={step:0,nome:'',autoQ:auto,auto:{},
      faixas:[],vejo:[],perguntou:[],ouvi:[],alvo:[],apostaT:[],apostaL:[],limTest:[],
      trunfos:[],limites:[],projeto:null,custom:'',customTags:[],
      mFreq:null,mGrupo:null,mDur:null, local:null, correu:false,
      passos:[],energia:{preparacao:0,materiais:0,parceiros:0,divulgacao:0,registo:0},
      indicadores:[],
      eventos:[],evIdx:0,evSel:null,evLog:[],envLog:[],sc:{alcance:0,qualidade:0,sust:0,aprend:0},scLog:{},
      projOrd:shuffle(PROJETOS.map(p=>p.id)), projFase:0, aposta:[],
      planoFalhas:[],
      sessPerdidas:0,sessLog:[],grupo:0,grupoLog:[],comps:[],compOutra:''};
  const t=document.getElementById('g3-title'); if(t)t.textContent='Construtor de Projeto';
  const e=document.getElementById('g3-eyebrow'); if(e)e.textContent='Jogo 03';
  g3Draw();
}
const G3_SHOWN=[0,2,3,4,5,6,7,8,9,10,12];
function g3Bar(){let cur=G3_SHOWN.indexOf(G3.step);if(G3.step>=14)cur=G3_SHOWN.length;if(cur<0)cur=0;
  document.getElementById('g3-steps').innerHTML=G3_SHOWN.map((s,i)=>`<div class="step ${i<cur?'done':i===cur?'now':''}"></div>`).join('');}
function g3Next(){G3.step++;if(G3.step===1)G3.step=2;
  if(G3.step===5&&G3.faixas.length<=1){G3.alvo=G3.faixas.length?[G3.faixas[0]]:['todos'];G3.step=6;}
  if(G3.step===11)G3.step=12;g3Draw();window.scrollTo(0,0);}
function g3Back(){if(G3.step>0){G3.step--;if(G3.step===11)G3.step=10;
  if(G3.step===5&&G3.faixas.length<=1)G3.step=4;
  if(G3.step===1)G3.step=0;g3Draw();window.scrollTo(0,0);}}
function g3Pick(f,v,max){const a=G3[f],i=a.indexOf(v);if(i>=0)a.splice(i,1);else if(a.length<max)a.push(v);g3Draw();}
function g3Set(f,v){G3[f]=v;g3Draw();}
function g3Resumo(){
  const vejo=G3.vejo, eq=G3.ouvi.filter(v=>v.g==='tecnicos');
  const outros=G3.perguntou.filter(g=>g!=='tecnicos');
  const bloco=(cls,titulo,sub,itens)=>`<div class="rz ${cls}">
    <span class="eyebrow">${titulo}${sub?`<em>${sub}</em>`:''}</span>${itens}</div>`;
  const linhas=arr=>`<ul>${arr.map(x=>x).join('')}</ul>`;
  let out='';
  out+=bloco('meu','O que tu viste','',
    vejo.length?linhas(vejo.map(t=>`<li><b>${NEEDS[t].n}</b></li>`))
    :'<p class="rz-vazio">Não apontaste nada por ti.</p>');
  out+=bloco('eq','A equipa do espaço','',
    eq.length?linhas(eq.map(v=>`<li><b>${NEEDS[v.need].n}</b><u>«${v.q}»</u></li>`))
    :'<p class="rz-vazio">Não falaste com eles.</p>');
  outros.forEach(g=>{
    const G=GRUPOS_ESCUTA.find(x=>x.id===g), vs=G3.ouvi.filter(v=>v.g===g);
    out+=bloco('gr',G.n,'escolha tua',
      vs.length?linhas(vs.map(v=>`<li><b>${NEEDS[v.need].n}</b><u>«${v.q}»</u></li>`)):'<p class="rz-vazio">Não trouxe nada de novo.</p>');
  });
  const falta=2-outros.length;
  if(falta>0) out+=bloco('gr vazio',falta===2?'Dois grupos por ouvir':'Um grupo por ouvir',
    '','<p class="rz-vazio">Podias ter ouvido mais alguém.</p>');
  out+=bloco('atr','Tu','trunfos e limites',
    `<ul>${G3.trunfos.map(i=>`<li class="t"><b>${TRUNFOS.find(t=>t.id===i).n}</b></li>`).join('')}
     ${G3.limites.map(i=>`<li class="l"><b>${LIMITES.find(t=>t.id===i).n}</b></li>`).join('')}</ul>`);
  return `<div class="resumo">${out}</div>`;
}
function g3Aposta(t){const i=G3.aposta.indexOf(t);if(i>=0)G3.aposta.splice(i,1);else G3.aposta.push(t);g3Draw();}
function g3Ap(campo,id){const a=G3[campo],i=a.indexOf(id);if(i>=0)a.splice(i,1);else a.push(id);g3Draw();}
function g3ApTotal(){return G3.aposta.length+G3.apostaT.length+G3.apostaL.length;}
function g3Acerto(){
  const p=g3ProjSel(), M=g3Match(p,g3Needs());
  const real=M.dir, ap=G3.aposta||[];
  const bomT=(PROJ_BOM[p.id]||[]).filter(t=>G3.trunfos.includes(t));
  const apT=G3.apostaT||[], apL=G3.apostaL||[], tst=G3.limTest||[];
  return {certos:ap.filter(t=>real.includes(t)),
          deLado:ap.filter(t=>M.lado.includes(t)),
          fora:ap.filter(t=>M.fora.includes(t)),
          falta:real.filter(t=>!ap.includes(t)), real,
          tCertos:apT.filter(t=>bomT.includes(t)),
          tFora:apT.filter(t=>!bomT.includes(t)),
          tFalta:bomT.filter(t=>!apT.includes(t)), bomT,
          lTest:apL.filter(l=>tst.some(x=>x.l===l)),
          lAperta:apL.filter(l=>!tst.some(x=>x.l===l)&&(LIM_TRAVA[l]||[]).some(t=>(PROJ_BOM[p.id]||[]).includes(t))),
          lNao:apL.filter(l=>!tst.some(x=>x.l===l)&&!(LIM_TRAVA[l]||[]).some(t=>(PROJ_BOM[p.id]||[]).includes(t))),
          lFalta:G3.limites.filter(l=>!apL.includes(l)&&((LIM_TRAVA[l]||[]).some(t=>(PROJ_BOM[p.id]||[]).includes(t))||tst.some(x=>x.l===l))),
          tst};
}
function g3SetTog(f,v){G3[f]=(G3[f]===v)?null:v;g3Draw();}
function g3PoolIdade(){const out=[];G3.faixas.forEach(f=>FAIXAS.find(x=>x.id===f).needs.forEach(n=>{if(!out.includes(n))out.push(n);}));return out;}
function alvoFaixas(){const a=G3.alvo||[];if(!a.length||a.includes('todos'))return G3.faixas.slice();return a.filter(x=>x!=='todos');}
const GRUPO_IDADE={velhos:['jovens']};
function grupoServeAlvo(gid){const ages=GRUPO_IDADE[gid];if(!ages)return true;const alvo=alvoFaixas();return ages.some(a=>alvo.includes(a));}
function g3Needs(){
  const ouvidas=G3.ouvi.filter(v=>grupoServeAlvo(v.g));
  return [...G3.vejo, ...ouvidas.map(v=>v.need)].filter((v,i,a)=>a.indexOf(v)===i);
}
function g3ForaAlvo(){
  const alvo=G3.alvo||[]; if(!alvo.length||alvo.includes('todos'))return [];
  const noAlvo=g3Needs();
  return [...new Set(G3.ouvi.filter(v=>!grupoServeAlvo(v.g)).map(v=>v.need))].filter(n=>!noAlvo.includes(n));
}
function g3AlvoNomes(){const a=G3.alvo||[];if(!a.length||a.includes('todos'))return 'todos os grupos etários do espaço';return a.map(id=>(FAIXAS.find(x=>x.id===id)||{n:id}).n).join(', ');}
function g3PickAlvo(v){
  if(v==='todos'){G3.alvo=G3.alvo.includes('todos')?[]:['todos'];}
  else{G3.alvo=G3.alvo.filter(x=>x!=='todos');const i=G3.alvo.indexOf(v);if(i>=0)G3.alvo.splice(i,1);else G3.alvo.push(v);}
  g3Draw();
}
function g3Energy(k,d){const E=G3.energia,u=Object.values(E).reduce((x,y)=>x+y,0);
  if(d>0&&(u>=14||E[k]>=6))return; if(d<0&&E[k]<=0)return; E[k]+=d;g3Draw();}
function pT2(p){return p.tags2||[];}
function g3Match(p,needs){
  const dir=p.tags.filter(t=>needs.includes(t));
  const lado=pT2(p).filter(t=>needs.includes(t)&&!p.tags.includes(t));
  const fora=needs.filter(t=>!p.tags.includes(t)&&!pT2(p).includes(t));
  return {dir,lado,fora,peso:dir.length+lado.length*0.5};
}
function g3ProjSel(){return G3.projeto==='custom'?{id:'custom',n:G3.custom||'Projeto próprio',d:'Ideia do próprio jovem.',tags:G3.customTags,tags2:[],passos:PASSOS_CUSTOM}:PROJETOS.find(p=>p.id===G3.projeto);}
function g3Txt(t){
  const L=LOCAIS.find(l=>l.id===G3.local);
  return t.replace(/\{P\}/g,g3ProjSel().n)
          .replace(/\{L\}/g,L?L.n.toLowerCase():'')
          .replace(/\{S\}/g,g3Sessoes())
          .replace(/\{G\}/g,G3.grupo)
          .replace(/\{F\}/g,(META_FREQ.find(x=>x.id===G3.mFreq)||{n:''}).n.toLowerCase());
}
function g3Passo(i){const a=G3.passos,k=a.indexOf(i);if(k>=0)a.splice(k,1);else if(a.length<3)a.push(i);g3Draw();}
function g3Sessoes(){
  if(!G3.mFreq||!G3.mDur)return 0;
  const f=META_FREQ.find(x=>x.id===G3.mFreq), d=META_DUR.find(x=>x.id===G3.mDur);
  if(f.fixo)return f.fixo;
  return Math.round(f.mes*d.meses);
}
const ENV_PADRAO=/deixá-los|deixa-los|com eles|com elas|COM eles|que sejam eles|pedir-lhes|perguntar-lhes|convidá-l|convida-l|escolher|escolhem|decidir|decidem|um papel|papel de que|a cada um|entre pares|eles a |por eles|votação|votar|proposta deles|que eles/i;
function g3Envolveu(){
  const L=[];
  G3.ouvi.forEach(v=>L.push(`Foste ouvi-los antes de decidir: «${v.q}»`));
  const p=g3ProjSel();
  G3.passos.forEach(i=>{const t=p.passos[i][0]; if(ENV_PADRAO.test(t)) L.push(`Nos teus passos: «${t}»`);});
  G3.envLog.forEach(t=>L.push(t));
  return L;
}
const G_JOVENS=['sempre','nunca','velhos'];
function g3Escuta(){return G3.ouvi.filter(v=>G_JOVENS.includes(v.g)).length;}
function g3EscutaAdultos(){return G3.ouvi.filter(v=>v.g==='familias').length;}
function g3Perguntar(g){
  const i=G3.perguntou.indexOf(g);
  if(i>=0){
    G3.perguntou.splice(i,1);
    G3.ouvi=G3.ouvi.filter(v=>v.g!==g);
    g3Draw(); return;
  }
  if(G3.perguntou.length>=3)return;
  G3.perguntou.push(g);
  const pool=shuffle([...VOZES[g]]);
  const nova=pool.find(v=>!G3.vejo.includes(v.need) && !G3.ouvi.find(x=>x.need===v.need));
  const v=nova||pool[0];
  G3.ouvi.push({...v,g,reforco:!nova});
  g3Draw();
}
function g3Campo(n,t){return `<p class="campo">CAMPO ${n} DE 6 · ${t}</p>`;}
function g3NaoPia(t){return `<p class="campo grelha">ISTO NÃO É O PIA · ${t}</p>`;}

function g3Draw(){
  g3Bar();
  const b=document.getElementById('g3-body');
  switch(G3.step){

  case 0:
    b.innerHTML=`<h3 class="q">Como te chamas?</h3><p class="q-sub">Vai no cabeçalho do PIA que sai no fim.</p>
      <input class="txtin" id="g3-nome" value="${G3.nome}" placeholder="O teu nome" maxlength="40">
      <div class="nav"><span></span><button class="btn btn-yellow" onclick="G3.nome=document.getElementById('g3-nome').value.trim()||'Jovem JEEP';g3Next()">Continuar</button></div>`;
    setTimeout(()=>{const e=document.getElementById('g3-nome');if(e)e.focus();},40);break;

  case 1:{
    const f=Object.keys(G3.auto).length;
    b.innerHTML=`${g3NaoPia('grelha de avaliação EDUCA+, 6 dimensões')}
      <h3 class="q">Antes de começar: como te vês?</h3>
      <div class="aviso"><b>Aqui não há resposta certa.</b> Clicaste sem querer? <b>Clica outra vez na mesma opção e a seleção sai.</b> Nenhuma opção é "a boa" — são quatro maneiras de estar, e todas existem. Escolhe a que <em>descreve</em> o que costumas fazer, não a que gostavas que fosse verdade. As perguntas mudam a cada partida e as opções nunca estão pela mesma ordem.</div>
      ${G3.autoQ.map((A,i)=>`<div class="autoq">
        <span class="autoq-dim" style="color:${DIMS[A.k].c}">${A.k} · ${DIMS[A.k].n}</span>
        <p class="autoq-q">${A.q}</p>
        <div class="autoq-opts">${A.o.map(([v,t])=>`<button class="autoq-opt ${G3.auto[A.k]===v?'on':''}" onclick="if(G3.auto['${A.k}']===${v}){delete G3.auto['${A.k}'];}else{G3.auto['${A.k}']=${v};}g3Draw()">${t}</button>`).join('')}</div>
      </div>`).join('')}
      <p class="counter">${f}/6 respondidas</p>
      <div class="nav"><button class="btn" onclick="g3Back()">← Voltar</button>
      <button class="btn btn-yellow" ${f===6?'':'disabled'} onclick="${f===6?'g3Next()':''}">Continuar</button></div>`;break;}

  case 2:
    b.innerHTML=`<h3 class="q">Quem são os participantes do teu local?</h3>
      <p class="q-sub">Que idades tem o grupo? <b>Escolhe todas as que se aplicam.</b></p>
      <div class="opts">${FAIXAS.map(l=>`<button class="opt ${G3.faixas.includes(l.id)?'sel':''}" onclick="g3Pick('faixas','${l.id}',3);G3.vejo=[];G3.ouvi=[];G3.perguntou=[];G3.alvo=[];g3Draw()">
        <strong>${l.n}</strong><span class="fonte" style="margin-bottom:6px">${l.sub}</span><span>${l.d}</span></button>`).join('')}</div>
      <div class="nav"><button class="btn" onclick="g3Back()">← Voltar</button>
      <button class="btn btn-yellow" ${G3.faixas.length?'':'disabled'} onclick="${G3.faixas.length?'g3Next()':''}">Continuar</button></div>`;break;

  case 3:{
    const pool=g3PoolIdade().concat(NEEDS_ESPACO.filter(n=>!g3PoolIdade().includes(n)));
    b.innerHTML=`<h3 class="q">Diagnóstico — o que <em>tu</em> vês</h3>
      <p class="q-sub">O que te salta à vista quando olhas para o espaço. Escolhe <b>dois</b>.</p>
      <div class="opts">${pool.map(k=>`<button class="opt postit ${G3.vejo.includes(k)?'sel':''}" onclick="g3Pick('vejo','${k}',2)"><strong>${NEEDS[k].n}</strong><span>${NEEDS[k].d}</span></button>`).join('')}</div>
      <p class="counter">${G3.vejo.length}/2</p>
      <div class="nav"><button class="btn" onclick="g3Back()">← Voltar</button>
      <button class="btn btn-yellow" ${G3.vejo.length===2?'':'disabled'} onclick="${G3.vejo.length===2?'g3Next()':''}">Continuar</button></div>`;break;}

  case 4:{
    const jaOuviu=G3.ouvi.length>0;
    const ultimo=G3.perguntou[G3.perguntou.length-1];
    const novas=jaOuviu?G3.ouvi.filter(v=>v.g===ultimo):[];
    b.innerHTML=`<h3 class="q">Diagnóstico — o que <em>eles</em> disseram</h3>
      <p class="q-sub">Escolhe até <b>três grupos</b> para ouvir. Cada um traz problemas que tu podes não ter visto.</p>
      ${jaOuviu?`<div class="acabou-de-dizer">${G3.perguntou.map(gid=>{
        const vs=G3.ouvi.filter(v=>v.g===gid); if(!vs.length) return '';
        return `<div class="grupo-disse"><span class="eyebrow">${GRUPOS_ESCUTA.find(g=>g.id===gid).n}</span>
          ${vs.map(v=>`<blockquote>«${v.q}»<cite>trouxe: ${NEEDS[v.need].n}</cite></blockquote>`).join('')}</div>`;}).join('')}</div>`:''}
      <div class="opts">${GRUPOS_ESCUTA.map(g=>{
        const feito=G3.perguntou.includes(g.id), cheio=G3.perguntou.length>=3 && !feito;
        return `<button class="opt ${feito?'sel':''}" ${cheio?'disabled style="opacity:.35;cursor:default"':''} onclick="g3Perguntar('${g.id}')">
          <strong>${feito?'✓ ':'▸ '}${g.n}</strong><span>${g.d}</span>
          ${feito?'<span class="fonte desfaz">clica outra vez para desfazer e falar com outro grupo</span>':cheio?'<span class="fonte">já falaste com três grupos</span>':''}</button>`;}).join('')}</div>
      <p class="counter ${G3.perguntou.includes('tecnicos')?'':'zero'}">${G3.perguntou.includes('tecnicos')?`O teu diagnóstico tem ${g3Needs().length} problemas: ${G3.vejo.length} vistos por ti${G3.ouvi.length?`, ${G3.ouvi.length} trazidos por quem ouviste`:', nenhum trazido por outra pessoa'}.`:`Falaste com ${G3.perguntou.length} grupo${G3.perguntou.length===1?'':'s'}. O teu diagnóstico tem ${g3Needs().length} problemas.`}</p>
      <div class="nav"><button class="btn" onclick="g3Back()">← Voltar</button>
      <button class="btn btn-yellow" ${G3.perguntou.length?'':'disabled'} onclick="${G3.perguntou.length?'g3Next()':''}">Continuar</button></div>`;break;}

  case 5:{
    b.innerHTML=`<h3 class="q">Com que grupo etário vais trabalhar?</h3>
      <p class="q-sub">Trabalhas com mais do que uma faixa etária, e ouviste vários para diagnosticar. Agora escolhe <b>para que idades</b> é este PIA. A atividade e as necessidades vão ser lidas <b>para este grupo</b> — não se serve toda a gente com a mesma coisa. Podes escolher mais do que uma faixa.</p>
      <div class="opts">
        ${G3.faixas.map(fid=>{const F=FAIXAS.find(x=>x.id===fid);
          return `<button class="opt ${G3.alvo.includes(fid)?'sel':''}" onclick="g3PickAlvo('${fid}')"><strong>${F.n}</strong><span class="fonte" style="margin-bottom:6px">${F.sub}</span><span>${F.d}</span></button>`;}).join('')}
        <button class="opt ${G3.alvo.includes('todos')?'sel':''}" onclick="g3PickAlvo('todos')"><strong>Todos os grupos etários</strong><span>O PIA é para o conjunto. A atividade vai ter de servir todas as idades que escolheste no início.</span></button>
      </div>
      <p class="counter ${G3.alvo.length?'':'zero'}">${G3.alvo.length?'Público-alvo escolhido.':'Escolhe pelo menos uma faixa.'}</p>
      <div class="nav"><button class="btn" onclick="g3Back()">← Voltar</button>
      <button class="btn btn-yellow" ${G3.alvo.length?'':'disabled'} onclick="${G3.alvo.length?'g3Next()':''}">Continuar</button></div>`;break;}

  case 6:
    b.innerHTML=`<h3 class="q">Os teus trunfos e os teus limites</h3>
      <p class="q-sub">Os que tens mesmo. Vão para o PIA como forças e fraquezas.</p>
      <p class="eyebrow" style="margin-top:16px">Trunfos — escolhe <b>quatro</b></p>
      <div class="opts" style="margin-top:10px">${TRUNFOS.map(t=>`<button class="opt ${G3.trunfos.includes(t.id)?'sel':''}" onclick="g3Pick('trunfos','${t.id}',4)"><strong>${t.n}</strong><span>${t.d}</span></button>`).join('')}</div>
      <p class="counter">${G3.trunfos.length}/4 trunfos</p>
      <p class="eyebrow" style="margin-top:24px">Limites — escolhe <b>dois</b></p>
      <div class="opts" style="margin-top:10px">${LIMITES.map(t=>`<button class="opt limite ${G3.limites.includes(t.id)?'sel':''}" onclick="g3Pick('limites','${t.id}',2)"><strong>${t.n}</strong><span>${t.d}</span></button>`).join('')}</div>
      <p class="counter">${G3.limites.length}/2 limites</p>
      <div class="nav"><button class="btn" onclick="g3Back()">← Voltar</button>
      <button class="btn btn-yellow" ${G3.trunfos.length===4&&G3.limites.length===2?'':'disabled'} onclick="${G3.trunfos.length===4&&G3.limites.length===2?'g3Next()':''}">Continuar</button></div>`;break;

  case 7:{
    const needs=g3Needs();
    const ord=G3.projOrd.map(id=>PROJETOS.find(p=>p.id===id)).filter(Boolean);
    const p=G3.projeto?g3ProjSel():null;
    if(p){
      const M=g3Match(p,needs);
      const why=n=>{const w=(PORQUE[p.id]||{})[n];return w?`<span style="display:block;opacity:.72;font-size:12.5px;line-height:1.45;margin-top:2px">${w}</span>`:'';};
      const li=n=>`<li style="padding:7px 0"><b>${NEEDS[n].n}</b>${why(n)}</li>`;
      b.innerHTML=`${g3Campo(1,'O QUE SE QUER FAZER')}
        <span class="eyebrow">Escolheste</span>
        <h3 class="q" style="margin-top:4px">${p.n}</h3>
        <p class="q-sub">${p.d}</p>
        <div class="aposta ${M.dir.length?'ok':''}" style="margin-top:14px">
          <span class="eyebrow">A que necessidades do teu diagnóstico é que isto responde</span>
          <p class="bal-lead">É esta a pergunta que interessa — e é aqui que se aprende a ligar a atividade ao que viste e ao que te disseram.</p>
          <div class="ap-cols">
            ${M.dir.length?`<div class="ap-col bom"><span class="eyebrow">Responde mesmo a</span><ul>${M.dir.map(li).join('')}</ul></div>`:''}
            ${M.lado.length?`<div class="ap-col meio"><span class="eyebrow">Também ajuda em</span><ul>${M.lado.map(li).join('')}</ul></div>`:''}
            ${M.fora.length?`<div class="ap-col mau"><span class="eyebrow">Não toca em</span><ul>${M.fora.map(n=>`<li style="padding:7px 0"><b>${NEEDS[n].n}</b></li>`).join('')}</ul></div>`:''}
          </div>
          ${M.dir.length?'':'<p class="q-sub" style="margin-top:10px;color:var(--afasta)"><b>Atenção:</b> não responde a nenhum dos problemas que diagnosticaste. Escolhe outra que encaixe — ou é mesmo isto que queres fazer?</p>'}
        </div>
        ${(()=>{
          const bom=PROJ_BOM[p.id]||[];
          const tName=id=>TRUNFOS.find(x=>x.id===id)||{n:id,d:''};
          const lName=id=>LIMITES.find(x=>x.id===id)||{n:id,d:''};
          const tBons=G3.trunfos.filter(t=>bom.includes(t));
          const tNeutros=G3.trunfos.filter(t=>!bom.includes(t));
          const lAperta=G3.limites.filter(l=>(LIM_TRAVA[l]||[]).some(t=>bom.includes(t)));
          const lNeutro=G3.limites.filter(l=>!lAperta.includes(l));
          const tLi=id=>{const t=tName(id);return `<li style="padding:7px 0"><b>${t.n}</b><span style="display:block;opacity:.72;font-size:12.5px;line-height:1.45;margin-top:2px">${t.d}</span></li>`;};
          const lLi=id=>{const l=lName(id);const blk=(LIM_TRAVA[id]||[]).filter(t=>bom.includes(t)).map(t=>tName(t).n.toLowerCase());return `<li style="padding:7px 0"><b>${l.n}</b><span style="display:block;opacity:.72;font-size:12.5px;line-height:1.45;margin-top:2px">Trava ${blk.join(', ')} — e é disso que esta atividade mais precisa.</span></li>`;};
          const neutros=[...tNeutros.map(t=>tName(t).n),...lNeutro.map(l=>lName(l).n)];
          return `<div class="aposta ${lAperta.length?'':'ok'}" style="margin-top:14px">
            <span class="eyebrow">O que os teus atributos e fraquezas fazem a este projeto</span>
            <p class="bal-lead">A atividade certa puxa pelo que tens de bom e não depende do que te falta.</p>
            <div class="ap-cols">
              ${tBons.length?`<div class="ap-col bom"><span class="eyebrow">Puxa por estes teus trunfos</span><ul>${tBons.map(tLi).join('')}</ul></div>`:''}
              ${lAperta.length?`<div class="ap-col mau"><span class="eyebrow">A tua fraqueza vai bater aqui</span><ul>${lAperta.map(lLi).join('')}</ul></div>`:''}
            </div>
            ${(!tBons.length&&!lAperta.length)?'<p class="q-sub" style="margin-top:8px">Nenhum dos teus trunfos é dos que esta atividade mais usa, e nenhuma das tuas fraquezas a trava — aqui nem ajudas nem atrapalhas.</p>':''}
            ${neutros.length?`<p class="q-sub" style="margin-top:8px;opacity:.7">Aqui não pesam: ${neutros.join(', ')}.</p>`:''}
          </div>`;
        })()}
        <div class="nav"><button class="btn" onclick="G3.projeto=null;G3.passos=[];G3.local=null;g3Draw()">← Escolher outra</button>
        <button class="btn btn-yellow" onclick="g3Next()">Continuar com esta</button></div>`;
    } else {
      b.innerHTML=`${g3Campo(1,'O QUE SE QUER FAZER')}
        ${g3Resumo()}
        <h3 class="q">A atividade</h3>
        <p class="q-sub">${ord.length} atividades, por ordem aleatória. ${G3.ouvi.length?`<b style="color:var(--postit)">${G3.ouvi.length} ${G3.ouvi.length===1?'problema veio':'problemas vieram'} dos grupos que ouviste.</b>`:'Nenhum destes problemas veio deles.'}</p>
        <div class="aviso">Escolhe uma. <b>Assim que escolheres, mostro-te logo a que necessidades ela responde</b> — e o porquê de cada uma.</div>
        <div class="opts">
          ${ord.map(x=>`<button class="opt" onclick="G3.projeto='${x.id}';G3.passos=[];G3.local=null;g3Draw()">
            <strong>${x.n}</strong><span>${x.d}</span></button>`).join('')}
        </div>
        <div class="nav"><button class="btn" onclick="g3Back()">← Voltar</button><span></span></div>`;
    }
    break;}

  case 8:{
    const s=g3Sessoes(), g=META_GRUPO.find(x=>x.id===G3.mGrupo), d=META_DUR.find(x=>x.id===G3.mDur);
    const ok=G3.mFreq&&G3.mGrupo&&G3.mDur;
    b.innerHTML=`${g3Campo(3,'QUANTO — as metas')}
      <h3 class="q">Quanto?</h3>
      <p class="q-sub">Quantas sessões, para quantas pessoas, durante quanto tempo. <b>Conta tudo</b> — as sessões de preparação também são sessões.</p>
      <span class="eyebrow">Quantas vezes?</span>
      <div class="chips">${META_FREQ.map(f=>`<button class="chip ${G3.mFreq===f.id?'on':''}" onclick="g3Set('mFreq','${f.id}')">${f.n}</button>`).join('')}</div>
      <span class="eyebrow" style="margin-top:22px;display:block">Com quantas pessoas?</span>
      <div class="chips">${META_GRUPO.map(f=>`<button class="chip ${G3.mGrupo===f.id?'on':''}" onclick="g3Set('mGrupo','${f.id}')">${f.n}</button>`).join('')}</div>
      <span class="eyebrow" style="margin-top:22px;display:block">Até quando?</span>
      <div class="chips">${META_DUR.map(f=>`<button class="chip ${G3.mDur===f.id?'on':''}" onclick="g3Set('mDur','${f.id}')">${f.n}</button>`).join('')}</div>
      ${ok?`<div class="meta-out">
        <span class="eyebrow" style="color:var(--ink);opacity:.6">A tua meta</span>
        <p>${META_FREQ.find(x=>x.id===G3.mFreq).n.toLowerCase()}, com ${g.n.toLowerCase()}, ${d.n.toLowerCase()}.</p>
        <b>São ${s} ${s===1?'sessão':'sessões'}. Vais ter de aparecer ${s} ${s===1?'vez':'vezes'}${s>1?' seguidas':''}.</b>
        <small>O jogo não simula as ${s} sessões — ninguém tem paciência para isso. O que ele faz é <b>descontar as que se perdem</b> nos acontecimentos: uma escolha que corre mal come sessões, e no fim vês quantas perdeste e porquê. As restantes ficam por conta da tua palavra — e é a tua gestora quem as confirma.</small>
      </div>`:'<p class="counter">Escolhe uma de cada.</p>'}
      <div class="nav"><button class="btn" onclick="g3Back()">← Voltar</button>
      <button class="btn btn-yellow" ${ok?'':'disabled'} onclick="${ok?'g3Next()':''}">Continuar</button></div>`;break;}

  case 9:{
    const p=g3ProjSel();
    b.innerHTML=`${g3Campo(4,'ONDE')}
      <h3 class="q">Onde é que isto acontece?</h3>
      <p class="q-sub">Onde é que o <b>«${p.n}»</b> se faz mesmo? Nem todos os sítios servem.</p>
      <div class="opts">${LOCAIS.map(l=>`<button class="opt ${G3.local===l.id?'sel':''}" onclick="g3SetTog('local','${l.id}')">
          <strong>${l.n}</strong><span>${l.d}</span></button>`).join('')}</div>
      <div class="nav"><button class="btn" onclick="g3Back()">← Voltar</button>
      <button class="btn btn-yellow" ${G3.local?'':'disabled'} onclick="${G3.local?'g3Next()':''}">Continuar</button></div>`;break;}

  case 10:{
    const p=g3ProjSel();
    b.innerHTML=`${g3Campo(5,'COMO — os três passos')}
      <h3 class="q">Que três passos vais mesmo dar</h3>
      <p class="q-sub">Não os que ficam bem escritos — os que vais mesmo dar. Vão para o Campo 5 do PIA.</p>
      <p class="eyebrow" style="margin-top:22px">Passos possíveis para «${p.n}» — escolhe três</p>
      <div class="opts" style="margin-top:12px">${p.passos.map(([t,e],i)=>{
        const sel=G3.passos.includes(i);
        return `<button class="opt ${sel?'sel':''}" onclick="g3Passo(${i})"><strong style="font-size:16px;padding-right:28px">${t}</strong>${sel?'<span class="fonte">clica outra vez para tirar</span>':''}</button>`;}).join('')}</div>
      <p class="counter">${G3.passos.length}/3 escolhidos</p>
      <div class="nav"><button class="btn" onclick="g3Back()">← Voltar</button>
      <button class="btn btn-yellow" ${G3.passos.length===3?'':'disabled'} onclick="${G3.passos.length===3?'g3Next()':''}">Continuar</button></div>`;break;}

  case 11:{
    const E=G3.energia, u=Object.values(E).reduce((x,y)=>x+y,0), left=14-u;
    const p=g3ProjSel(), pedidas=G3.passos.map(i=>p.passos[i][1]);
    b.innerHTML=`${g3Campo(6,'COM QUE RECURSOS')}
      <h3 class="q">14 fichas de esforço</h3>
      <p class="q-sub">Onde pões o esforço à volta da atividade. Máximo <b>seis</b> em cada.</p>
      <div class="energy-top"><div><span class="eyebrow">Por gastar</span><div class="energy-left ${left===0?'zero':''}">${left}</div></div></div>
      <div class="sliders">${ENERGIA_ROWS.map(([k,n,d])=>{
        return `<div class="slider-row">
          <div style="flex:1;min-width:220px"><b>${n}</b><small>${d}</small></div>
          <div class="pm-wrap"><button class="pmbtn" ${E[k]===0?'disabled':''} onclick="g3Energy('${k}',-1)">−</button>
          <div class="pips">${Array.from({length:6},(_,i)=>`<div class="pip ${i<E[k]?'on':''}"></div>`).join('')}</div>
          <button class="pmbtn" ${left===0||E[k]>=6?'disabled':''} onclick="g3Energy('${k}',1)">+</button></div></div>`;}).join('')}</div>
      <div class="nav"><button class="btn" onclick="g3Back()">← Voltar</button>
      <button class="btn btn-yellow" ${left===0?'':'disabled'} onclick="${left===0?'g3Next()':''}">Continuar</button></div>`;break;}

  case 12:{
    const n=G3.indicadores.length;
    const TIPO={conta:'conta-se',ouve:'ouve-se','vé':'vê-se','vê':'vê-se'};
    b.innerHTML=`${g3Campo(6,'COMO AVALIAR')}
      <h3 class="q">Como vais saber se correu bem?</h3>
      <p class="q-sub">Escolhe <b>dois</b>. É por eles que vais avaliar o projeto no fim.</p>
      <div class="aviso"><b>Um indicador é como vais SABER que mudou</b> — não é o que queres que mude. «A relação» é o objetivo; o indicador é <em>quantos te procuram por iniciativa</em>. Uns contam-se, outros ouvem-se ou veem-se — <b>os dois valem</b>. O que dizem os jovens é avaliação a sério.</div>
      <div class="opts">${INDICADORES.map(x=>`<button class="opt ${G3.indicadores.includes(x.id)?'sel':''}" onclick="g3Pick('indicadores','${x.id}',2)">
        <strong>${x.n}</strong><span class="fonte" style="margin:6px 0">${TIPO[x.tipo]||'observa-se'}</span><span>${x.d}</span></button>`).join('')}</div>
      <p class="counter">${n}/2</p>
      <div class="nav"><button class="btn" onclick="g3Back()">← Voltar</button>
      <button class="btn btn-yellow" ${n===2?'':'disabled'} onclick="${n===2?'g3Desenhar()':''}">Ver o rascunho do PIA</button></div>`;break;}

  case 13: g3Event(); break;
  case 14: (G3.correu ? g3Result() : g3ResultDesenho()); break;
  }
}

function g3Inds(){
  const needs=g3Needs(), inds=G3.indicadores;
  const CASA={frequencia:['regras','motivacao','escolar'],envolvimento:['motivacao','participacao','fechados'],
    autonomia:['participacao','motivacao','competencias'],abertura:['fechados','diversidade'],
    permanencia:['motivacao','fechados','escolar'],familias:['familias','comunidade','emocional'],
    escola:['escolar','transicao','competencias'],palavradeles:['motivacao','participacao','emocional'],
    pessoais:['competencias','emocional','conflitos'],relacao:['emocional','conflitos','fechados'],equipa:['regras','conflitos','espaco'],
    relacao:['conflitos','emocional','competencias'],novos:['participacao','comunidade','familias'],
    competencias:['competencias','emocional','conflitos','escolar'],ecra:['telemovel','consola','energia']};
  const casam=inds.filter(i=>(CASA[i]||[]).some(n=>needs.includes(n)));
  const nao=inds.filter(i=>!casam.includes(i));
  const nm=i=>(INDICADORES.find(x=>x.id===i)||{n:i}).n.toLowerCase();
  if(!inds.length) return '';
  let t;
  if(!nao.length) t=`As duas formas de avaliar que escolheste — ${inds.map(nm).join(' e ')} — servem para os problemas que diagnosticaste. Se subirem, subiu alguma coisa que fazia falta.`;
  else if(casam.length) t=`<b>${nm(casam[0])}</b> serve para o que diagnosticaste. <b>${nm(nao[0])}</b> não: pode subir sem que nenhum dos teus problemas mude.`;
  else t=`Nem <b>${nm(inds[0])}</b> nem <b>${nm(inds[1]||inds[0])}</b> tocam nos problemas que diagnosticaste. Podem subir as duas e o espaço ficar na mesma.`;
  return `<div class="ind-check"><span class="eyebrow">As formas de avaliar que escolheste</span><p>${t}</p></div>`;
}
const PROJ_META={
 consolatorneio:{fmax:8,gmin:4,gmax:20,mmin:1,idades:['medios','jovens']},
 criadores:{fmax:8,gmin:2,gmax:12,mmin:2,idades:['medios','jovens']},
 cinema:{fmax:4,gmin:5,gmax:35,mmin:1,idades:['novos','medios','jovens']},
 torneio:{fmax:4,gmin:11,gmax:40,mmin:1,idades:['novos','medios','jovens']},
 radio:{fmax:8,gmin:2,gmax:12,mmin:3,idades:['medios','jovens']},
 estudo:{fmax:12,gmin:2,gmax:15,mmin:3,idades:['novos','medios','jovens']},
 horta:{fmax:8,gmin:4,gmax:20,mmin:3,idades:['novos','medios','jovens']},
 jornal:{fmax:8,gmin:2,gmax:12,mmin:3,idades:['medios','jovens']},
 artes:{fmax:8,gmin:2,gmax:15,mmin:1,idades:['novos','medios','jovens']},
 mural:{fmax:8,gmin:4,gmax:20,mmin:1,idades:['novos','medios','jovens']},
 cozinha:{fmax:8,gmin:2,gmax:12,mmin:1,idades:['novos','medios','jovens']},
 jantar:{fmax:2,gmin:11,gmax:40,mmin:3,idades:['novos','medios','jovens']},
 forum:{fmax:4,gmin:6,gmax:25,mmin:2,idades:['medios','jovens']},
 danca:{fmax:12,gmin:4,gmax:25,mmin:2,idades:['novos','medios','jovens']},
 mostra:{fmax:2,gmin:11,gmax:40,mmin:3,idades:['novos','medios','jovens']},
 tabuleiro:{fmax:12,gmin:4,gmax:20,mmin:1,idades:['novos','medios','jovens']},
 reparar:{fmax:8,gmin:2,gmax:12,mmin:2,idades:['medios','jovens']},
 foto:{fmax:4,gmin:2,gmax:15,mmin:2,idades:['medios','jovens']},
 carreira:{fmax:4,gmin:2,gmax:15,mmin:2,idades:['jovens']},
 jogosativos:{fmax:12,gmin:6,gmax:35,mmin:1,idades:['novos','medios','jovens']},
 socioemocional:{fmax:8,gmin:4,gmax:15,mmin:2,idades:['medios','jovens']},
 imagem:{fmax:8,gmin:2,gmax:12,mmin:2,idades:['medios','jovens']},
 maisvelhos:{fmax:8,gmin:4,gmax:20,mmin:3,idades:['jovens']},
 musica:{fmax:8,gmin:2,gmax:15,mmin:2,idades:['medios','jovens']}
};
function g3MetaAv(){
  const p=g3ProjSel(), R=PROJ_META[p.id]; if(!R) return [];
  const f=META_FREQ.find(x=>x.id===G3.mFreq), g=META_GRUPO.find(x=>x.id===G3.mGrupo), d=META_DUR.find(x=>x.id===G3.mDur);
  if(!f||!g||!d) return [];
  const av=[];
  if(f.mes>R.fmax) av.push([`<b>${f.n.toLowerCase()}</b> é de mais para isto`, `Uma coisa destas não se faz ${f.n.toLowerCase()}. Prepara-se, faz-se, e depois deixa-se assentar.`]);
  if(g.max<R.gmin) av.push([`<b>${g.n.toLowerCase()}</b> é pouca gente`, `Isto só funciona com um grupo — com ${g.max} pessoas fica sem sentido.`]);
  if(g.min>R.gmax) av.push([`<b>${g.n.toLowerCase()}</b> é gente a mais`, `Com ${g.min} pessoas ninguém chega às mãos nem à conversa. Isto pede grupo pequeno.`]);
  if(d.meses<R.mmin) av.push([`<b>${d.n.toLowerCase()}</b> é pouco tempo`, `Precisa de ${R.mmin} ${R.mmin===1?'mês':'meses'} no mínimo para chegar a alguma coisa.`]);
  const fora=alvoFaixas().filter(x=>!R.idades.includes(x));
  if(fora.length) av.push([`não serve <b>${fora.map(x=>FAIXAS.find(y=>y.id===x).n.toLowerCase()).join(' nem ')}</b>`, `Escolheste este PIA para ${g3AlvoNomes().toLowerCase()}, e «${p.n}» foi pensada para ${R.idades.map(x=>FAIXAS.find(y=>y.id===x).n.toLowerCase()).join(', ')}. Ou trocas de atividade, ou tiras essa faixa do alvo.`]);
  return av;
}
function g3Coerencia(){
  const p=g3ProjSel(), R=PROJ_META[p.id]; if(!R) return '';
  const av=g3MetaAv();
  if(!av.length) return `<div class="coer ok"><span class="eyebrow">A meta que puseste</span><p>Frequência, duração, número de pessoas e idades: tudo bate certo com «${p.n}».</p></div>`;
  return `<div class="coer"><span class="eyebrow">A meta que puseste não bate certo</span>
    <ul>${av.map(([t,x])=>`<li>Para «${p.n}», ${t}.<u>${x}</u></li>`).join('')}</ul></div>`;
}
function g3Tabela(A){
  const eixos=['alcance','qualidade','sust','aprend'], curto={alcance:'ALC',qualidade:'QUA',sust:'SUS',aprend:'APR'};
  const linhas={}, ordem=[];
  eixos.forEach(k=>(G3.scLog[k]||[]).forEach(x=>{
    if(!linhas[x.t]){linhas[x.t]={t:x.t,alcance:0,qualidade:0,sust:0,aprend:0,soma:0};ordem.push(x.t);}
    linhas[x.t][k]+=x.v; linhas[x.t].soma+=x.v;}));
  const base=ordem.filter(t=>/^Ponto de partida/.test(t));
  const resto=ordem.filter(t=>!/^Ponto de partida/.test(t));
  const cel=v=>v===0?'<td class="z">·</td>':`<td class="${v>0?'pos':'neg'}">${v>0?'+':'−'}${Math.abs(Math.round(v*10)/10)}</td>`;
  const linha=t=>{const L=linhas[t];
    return `<tr><td class="lbl">${t}</td>${eixos.map(k=>cel(L[k])).join('')}</tr>`;};
  return `<p class="tab-lead">Cada linha é uma coisa que decidiste ou que aconteceu. À frente, onde é que ela bateu.</p>
  <div class="tab-wrap"><table class="tab-dec">
    <thead><tr><th></th>${eixos.map(k=>`<th title="${EIXO_NOME[k]}">${curto[k]}</th>`).join('')}</tr></thead>
    <tbody>
      <tr class="base"><td class="lbl">Ponto de partida — igual para toda a gente</td>${eixos.map(()=>'<td>50</td>').join('')}</tr>
      ${resto.map(linha).join('')}
      <tr class="tot"><td class="lbl">Onde ficou</td>${eixos.map(k=>`<td>${A[k]}</td>`).join('')}</tr>
    </tbody></table></div>
  <p class="tab-nota">ALC alcance · QUA qualidade · SUS sustentabilidade · APR aprendizagem</p>`;
}
function g3Narrativa(media){
  const soma=k=>(G3.scLog[k]||[]).reduce((a,x)=>a+x.v,0);
  const tudo=['alcance','qualidade','sust','aprend'].map(k=>G3.scLog[k]||[]).flat();
  const junta=f=>Math.round(tudo.filter(x=>f(x.t)).reduce((a,x)=>a+x.v,0)/4);
  const enc=junta(t=>/responde a|sem resposta|não responde|não se destaca|Ficaram/.test(t));
  const esc=junta(t=>/perguntaste|Foste às|equipa do espaço|ouviste|disseram|jovens/.test(t));
  const mont=junta(t=>/ficha|sítio|Preparação|Materiais|Divulgação|Registo|Quem te ajuda|passo/i.test(t));
  const evs=junta(t=>/: /.test(t)&&!/ficha/i.test(t));
  const eu=junta(t=>/trunfo|limite|Sabias|Acertaste|Leste/i.test(t));
  const f=[['a escolha do projeto',enc],['ter ido perguntar',esc],['a montagem',mont],['as decisões que tomaste',evs],['o que trouxeste de ti',eu]]
    .filter(x=>Math.abs(x[1])>=3).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]));
  if(!f.length) return '';
  const diz=([n,v])=>`<b>${n}</b> (${v>0?'+':'−'}${Math.abs(v)})`;
  const sobem=f.filter(x=>x[1]>0), descem=f.filter(x=>x[1]<0);
  let t=`Começaste nos 50, como toda a gente. `;
  if(sobem.length) t+=`A subir: ${sobem.map(diz).join(', ')}. `;
  if(descem.length) t+=`A descer: ${descem.map(diz).join(', ')}. `;
  t+=`O que mais pesou: ${f[0][0]}. `;
  t+=media>=80?'Deu para um projeto que se aguenta sem ti.'
    :media>=62?'Deu para um projeto que aconteceu. Olha para a coluna mais baixa das quatro: é aí que se decide a próxima vez.'
    :media>=45?'Deu para um projeto que só se aguentou porque tu o seguraste.'
    :'Não deu. Vale mais perceber aqui porquê do que lá.';
  return `<p class="narrativa">${t}</p>`;
}
function g3Balanco(){
  const m={};
  ['alcance','qualidade','sust','aprend'].forEach(k=>(G3.scLog[k]||[]).forEach(x=>{
    if(!m[x.t]) m[x.t]={t:x.t,v:0,eixos:[]};
    m[x.t].v+=x.v; if(!m[x.t].eixos.includes(k)) m[x.t].eixos.push(k);
  }));
  const todas=Object.values(m).filter(x=>Math.abs(x.v)>=2 && !/^Ponto de partida/.test(x.t));
  const fortes=todas.filter(x=>x.v>0).sort((a,b)=>b.v-a.v).slice(0,4);
  const fracos=todas.filter(x=>x.v<0).sort((a,b)=>a.v-b.v).slice(0,4);
  return {fortes,fracos};
}
function addSc(k,v,l){G3.sc[k]+=v;(G3.scLog[k]=G3.scLog[k]||[]).push({t:l,v:Math.round(v*10)/10});}

function g3Score(){
  const E=G3.energia, p=g3ProjSel(), needs=g3Needs();
  G3.sc={alcance:0,qualidade:0,sust:0,aprend:0}; G3.scLog={}; G3.planoFalhas=[];
  Object.keys(EIXO_NOME).forEach(k=>addSc(k,50,'Ponto de partida: um projeto médio'));

  const M=g3Match(p,needs);
  const pesoMax=needs.length?Math.max(...PROJETOS.map(x=>g3Match(x,needs).peso)):0;
  const rel=pesoMax>0?M.peso/pesoMax:(needs.length?0:1);
  const enc = rel>=0.6 ? (rel-0.6)/0.4 : -(0.6-rel)/0.6;
  const cob=needs.length?M.peso/needs.length:0.5;
  const desc = M.dir.length
    ? `Responde a ${M.dir.length} ${M.dir.length===1?'problema':'problemas'} dos ${needs.length} que tinhas${M.lado.length?`, e também ajuda um pouco em mais ${M.lado.length}`:''}`
    : M.lado.length
      ? `Não resolve nenhum dos ${needs.length} problemas que tinhas — só ajuda um pouco`
      : `Não mexe em nenhum dos ${needs.length} problemas que tinhas`;
  const pe = enc>=0 ? 1 : (M.dir.length ? 1.8 : (M.lado.length ? 2.6 : 3.4));
  addSc('qualidade',enc*22*pe,desc);
  addSc('alcance',enc*18*pe,desc);
  addSc('sust',enc*10*pe,desc);
  if(M.fora.length&&rel<1&&M.dir.length) addSc('qualidade',-(1-rel)*12,`Ficaram ${M.fora.length} ${M.fora.length===1?'problema':'problemas'} sem resposta nenhuma`);
  if(needs.length&&!M.dir.length) G3.planoFalhas.push('O projeto escolhido não responde a nenhum dos problemas diagnosticados.');

  const bomT=(PROJ_BOM[p.id]||[]).filter(t=>G3.trunfos.includes(t));
  if(bomT.length){
    addSc('qualidade',bomT.length*9,`Este projeto assenta no que já sabes fazer: ${bomT.map(t=>TRUNFOS.find(x=>x.id===t).n).join(', ')}`);
    addSc('sust',bomT.length*6,'Um projeto que assenta nos teus trunfos aguenta-se melhor');
    addSc('aprend',bomT.length*4,'Fazes com gosto o que já te sai bem');
  } else if(p.id!=='custom'){
    G3.planoFalhas.push('O projeto escolhido não pede nenhum dos quatro trunfos assumidos.');
    addSc('qualidade',-12,'Nenhum dos teus quatro trunfos é dos que este projeto pede');
    addSc('sust',-8,'Vais precisar de mais esforço para o mesmo resultado, e isso cansa');
    addSc('aprend',-5,'Aprende-se menos quando se passa o tempo a tapar buracos');
  }
  if(!G3.perguntou.includes('tecnicos')){
    const f = G3.perguntou.length? 1 : 0.3;
    addSc('qualidade',-26*f,'Não falaste com a equipa do espaço');
    addSc('sust',-22*f,'Montaste isto por cima de quem lá trabalha todos os dias');
    addSc('alcance',-12*f,'Quem abre a porta e conhece os miúdos ficou de fora');
    addSc('aprend',-8*f,'Perdeste o que só eles sabiam e ninguém mais te ia contar');
    G3.planoFalhas.push('Não ouviste a equipa do espaço. São eles que abrem a porta, que conhecem os miúdos pelo nome e que ficam lá quando tu saíres — e montaste isto sem lhes perguntar nada.');
  }
  const esc=g3Escuta();
  const escA=g3EscutaAdultos();
  const nAll=g3Needs(), famPesa=nAll.includes('familias')||nAll.includes('comunidade');
  if(escA>0){
    if(famPesa){
      addSc('alcance',escA*6,`Ouviste as famílias, e o diagnóstico tinha mesmo problemas de família e de comunidade`);
      addSc('qualidade',escA*3,'Foste à origem do problema, não a quem estava à mão');
      addSc('sust',escA*3,'Uma família que entra uma vez volta a entrar — e traz o filho');
    } else {
      addSc('qualidade',escA*1.5,`Falaste com as famílias — mas nada do que diagnosticaste passa por elas`);
      addSc('sust',escA*1,'Fica a conhecê-las, e isso nunca é perdido');
      G3.planoFalhas.push('Gastaste uma das tuas duas escolhas nas famílias, e o teu diagnóstico não fala delas. Podias ter ouvido mais um grupo de jovens.');
    }}
  if(esc>0){addSc('alcance',esc*3,`${esc} ${esc===1?'problema veio':'problemas vieram'} da boca dos jovens`);
      addSc('sust',esc*3,`Um problema apontado por eles continua a fazer sentido depois de saíres`);
      addSc('aprend',esc*2,`Perguntaste antes de decidir — é o hábito que levas para o próximo PIA`);
    addSc('qualidade',esc*3,'O diagnóstico tem a voz dos jovens'); addSc('sust',esc*3,'O diagnóstico tem a voz dos jovens');
}
  else {const so=escA>0?' Falaste com as famílias — mas o PIA pede as necessidades na ótica DOS JOVENS.':' A equipa não conta: falar com ela é obrigatório, não é escutar os jovens.';
    addSc('alcance',-30,'NÃO perguntaste aos jovens o que precisavam.'+so);
    addSc('qualidade',-25,'Diagnóstico feito sobre eles, sem eles');
    addSc('sust',-15,'Um projeto que eles não pediram não sobrevive sem ti');
    addSc('aprend',-10,'Falhaste a única coisa que o PIA pede a sério: ouvi-los primeiro');
    G3.planoFalhas.push('Não falaste com nenhum grupo de jovens. Os adultos sabem muito, mas não substituem quem vai usar o projeto — e a equipa era obrigatória, não foi escolha tua.');
}

  const bons=PROJ_LOCAIS[p.id]||[];
  if(bons.includes(G3.local)) addSc('qualidade',6,`O sítio serve para o que querias fazer`);
  else {addSc('qualidade',-14,`O sítio escolhido não serve para isto`); addSc('alcance',-6,'O sítio escolhido não serve para isto');
    G3.planoFalhas.push(`Escolheste fazer «${p.n}» ${LOCAIS.find(l=>l.id===G3.local).n.toLowerCase()}. Não é sítio para isso.`);}

  G3.trunfos.forEach(id=>{if(bomT.includes(id))return;
    const t=TRUNFOS.find(x=>x.id===id);for(const k in t.b)addSc(k,t.b[k]*0.38,'Trunfo teu que aqui não faz diferença: '+t.n);});
  G3.limites.forEach(id=>{const t=LIMITES.find(x=>x.id===id);for(const k in t.b)addSc(k,t.b[k]*0.9,'Limite: '+t.n);});

  const mav=g3MetaAv();
  if(mav.length){
    addSc('qualidade',-mav.length*7,`A meta não bate certo com a atividade (${mav.length} ${mav.length===1?'problema':'problemas'})`);
    addSc('alcance',-mav.length*4,`A meta não bate certo com a atividade (${mav.length} ${mav.length===1?'problema':'problemas'})`);
    G3.planoFalhas.push(`A meta que puseste não bate certo com «${p.n}» (${mav.length} ${mav.length===1?'ponto':'pontos'}).`);
  }

}

function g3SetupEventos(){
  const p=g3ProjSel(), needs=g3Needs();
  G3.grupo=META_GRUPO.find(x=>x.id===G3.mGrupo).max;
  G3.grupoLog=[{t:'Apareceram todos os que cabiam',v:G3.grupo}];
  G3.sessPerdidas=0; G3.sessLog=[];
  const evProj=EV_PROJ[p.id]||EV_PROJ.custom;
  const comDiag=needs.filter(n=>EV_DIAG[n]);
  const evDiag=comDiag.length?EV_DIAG[shuffle([...comDiag])[0]]:null;
  const evLocal=EV_LOCAL[G3.local];
  const evMeta=EV_META[metaBucket()];
  G3.eventos=shuffle([evProj,evDiag,evLocal,evMeta].filter(Boolean));
  G3.eventos.push(g3BossAvaliacao());
  G3.evIdx=0;G3.evLog=[];
}
function g3BossAvaliacao(){
  const inds=G3.indicadores.map(id=>INDICADORES.find(x=>x.id===id)).filter(Boolean);
  const nomes=inds.length?inds.map(i=>'«'+i.n.toLowerCase()+'»').join(' e '):'o que combinaste medir';
  const soQuali=inds.length>0 && inds.every(i=>i.tipo==='ouve');
  return {
    k:"Fim do ciclo · a avaliação do projeto", h:"Chegou a altura de avaliar o projeto", dim:"D4", boss:true,
    p:`Prometeste medir «{P}» por ${nomes}. Agora, à frente da gestora e de quem financiou, tens de mostrar se isso se mexeu. O que levas?`,
    swot:"Avaliação final do projeto pelos indicadores escolhidos.",
    c:[
      {t:"Levo o que fui registando ao longo do projeto — os números e as respostas que guardei.", reqE:{k:'registo',min:3},
       e:{sust:14,qualidade:9,aprend:6},
       o:`Tinhas tudo. A avaliação deixou de ser uma opinião e passou a ser um retrato do que mudou neles, medido por ${nomes}.`,
       fail:{sust:-9,aprend:8},
       of:"Querias mostrar e não tinhas registado quase nada. Fizeste imenso e não o consegues provar — e o que não se prova, para quem avalia, não aconteceu. Bastavam quatro fichas em Registo."},
      {t:"Conto de cabeça — eu sei bem o que mudou em cada um deles.",
       e:{qualidade:-4,aprend:4},
       o:"Foi honesto, e não chegou. Quem avalia não estava lá; sem nada guardado, fica a tua memória contra o esquecimento."},
      {t:"Peço aos próprios — jovens, famílias, equipa — que digam eles o que mudou.",
       e:soQuali?{qualidade:13,alcance:7,sust:5}:{qualidade:10,alcance:6,sust:4},
       o:"Foi a prova mais forte, e a que ninguém contesta: quem viveu aquilo a dizer, com as palavras deles, o que é diferente agora. Avaliação qualitativa é avaliação."}
    ]
  };
}
function g3Desenhar(){ g3Score(); G3.correu=false; G3.step=14; g3Draw(); window.scrollTo(0,0); }
function g3Correr(){
  const t=document.getElementById('g3-title'); if(t)t.textContent='Pôr o Projeto em Prática';
  const e=document.getElementById('g3-eyebrow'); if(e)e.textContent='Jogo 04 · Em prática';
  G3.correu=true; g3SetupEventos(); G3.step=13; g3Draw(); window.scrollTo(0,0);
}
function g5Start(){
  go('g3');
  const proj=PROJETOS[Math.floor(Math.random()*PROJETOS.length)];
  G3.nome='Jovem JEEP';
  G3.faixas=[FAIXAS[Math.floor(Math.random()*FAIXAS.length)].id];
  G3.alvo=[G3.faixas[0]];
  const projNeeds=[...proj.tags,...(proj.tags2||[])].filter((v,i,a)=>a.indexOf(v)===i);
  G3.vejo=shuffle([...projNeeds]).slice(0,2);
  G3.perguntou=[]; G3.ouvi=[];
  g3Perguntar('tecnicos'); g3Perguntar('sempre');
  const bom=(PROJ_BOM[proj.id]||[]);
  const resto=shuffle(TRUNFOS.map(t=>t.id).filter(id=>!bom.includes(id)));
  G3.trunfos=[...bom,...resto].slice(0,4);
  G3.limites=shuffle(LIMITES.map(t=>t.id)).slice(0,2);
  G3.projeto=proj.id;
  G3.mFreq='semanal'; G3.mGrupo='pequeno'; G3.mDur='verao';
  G3.local=(PROJ_LOCAIS[proj.id]||['comum'])[0];
  G3.passos=[0,1,2];
  G3.energia={preparacao:3,materiais:3,parceiros:3,divulgacao:3,registo:2};
  G3.indicadores=shuffle(INDICADORES.map(x=>x.id)).slice(0,2);
  g3Score(); g3Correr();
}
const G3_TETO=92;
function g3Val(k){
  let v=G3.sc[k];
  if(v>75) v=75+(v-75)*0.24;
  return Math.max(0,Math.min(G3_TETO,Math.round(v)));
}
function g3Marcador(d){
  return `<div class="marcador">
    <span class="eyebrow">Onde vais</span>
    <div class="mk-unl" style="margin-top:6px">Acontecimento <b>${G3.evIdx+1}</b> de <b>${G3.eventos.length}</b> · grupo: <b>${G3.grupo}</b> pessoas · ${G3.ouvi.length?`ouviste ${G3.ouvi.length} ${G3.ouvi.length===1?'necessidade':'necessidades'} deles`:'<span style="color:var(--afasta)">não perguntaste a ninguém</span>'}</div>
    <p class="hint" style="margin-top:8px">A pontuação só aparece no fim.</p>
  </div>`;
}
function g3EvTipo(ev){
  const p=g3ProjSel(), L=LOCAIS.find(l=>l.id===G3.local);
  if(ev.boss||EV_BOSS_POOL.includes(ev))return{c:'boss',t:'ACONTECIMENTO FINAL · A AVALIAÇÃO DO PROJETO',f:'Aqui avalia-se o projeto — pelos indicadores que tu escolheste no Campo 7.'};
  if(Object.values(EV_PROJ).includes(ev))return{c:'',t:'CAMPO 1 · O PROJETO QUE ESCOLHESTE',f:`Isto acontece porque escolheste «${p.n}».`};
  if(Object.values(EV_DIAG).includes(ev))return{c:'',t:'DIAGNÓSTICO · UM PROBLEMA QUE APONTASTE',f:'Isto acontece porque foi isto que diagnosticaste.'};
  if(Object.values(EV_LOCAL).includes(ev))return{c:'oport',t:'CAMPO 4 · O SÍTIO QUE ESCOLHESTE',f:`Isto acontece porque escolheste ${L.n.toLowerCase()}. Noutro sítio, não acontecia.`};
  if(Object.values(EV_META).includes(ev))return{c:'oport',t:'CAMPO 3 · A META QUE PROMETESTE',f:`Isto acontece porque prometeste ${META_FREQ.find(x=>x.id===G3.mFreq).n.toLowerCase()}. Com outra meta, era outro problema.`};
  return{c:'oport',t:'ACONTECIMENTO',f:''};
}
function g3Event(){
  if(G3.evIdx>=G3.eventos.length){G3.step=14;g3Draw();return;}
  if(G3.evSel===undefined)G3.evSel=null;
  const ev=G3.eventos[G3.evIdx], tp=g3EvTipo(ev);
  document.getElementById('g3-body').innerHTML=`${g3Marcador(null)}
    <p class="eyebrow" style="margin-top:26px">${G3.evIdx+1} de ${G3.eventos.length} · ${tp.t}</p>
    ${tp.f?`<p class="proveniencia">${tp.f}</p>`:''}
    <div class="event ${tp.c}" style="margin-top:14px">
      <span class="kicker">${ev.k}</span><h3>${ev.h}</h3><p>${g3Txt(ev.p)}</p>
      <div class="choices">${ev.c.map((c,i)=>{
        const sel=G3.evSel===i;
        return `<button class="choice ${sel?'sel':''}" onclick="g3Sel(${i})">${sel?'<span class="tick">✓</span>':''}${c.t}</button>`;}).join('')}</div>
      <div class="confirmar">
        ${G3.evSel!==null&&G3.evSel!==undefined
          ? `<p>Escolheste: <b>${ev.c[G3.evSel].t}</b></p>
             <div class="cf-btns"><button class="btn" onclick="g3Sel(${G3.evSel})">Tirar a seleção</button>
             <button class="btn btn-yellow" onclick="g3Choose(G3.evSel)">Confirmar e ver o que acontece →</button></div>`
          : `<p class="vazio">Escolhe uma opção e confirma. <b>Só podes decidir uma vez.</b></p>`}
      </div>
    </div>`;
}
function g3Sel(i){ G3.evSel = (G3.evSel===i) ? null : i; g3Event(); }
function g3Undo(){ if(!G3.snap)return; Object.assign(G3,JSON.parse(G3.snap)); G3.snap=null; G3.evSel=null; g3Event(); }
function g3Choose(i){
  const ev=G3.eventos[G3.evIdx], c=ev.c[i];
  let ok=true, motivo='', porque='';
  if(c.reqE){ if(G3.energia[c.reqE.k]<c.reqE.min){ok=false;motivo=`Este caminho precisava de ${c.reqE.min} fichas em ${FONTE[c.reqE.k]}, e tu puseste ${G3.energia[c.reqE.k]}.`;}
    else porque=`porque tinhas ${G3.energia[c.reqE.k]} fichas em ${FONTE[c.reqE.k]}; sem elas, este caminho nem se abria`;}
  if(c.reqT){ if(!G3.trunfos.includes(c.reqT)){ok=false;motivo=`Este caminho só se abre com o trunfo «${TRUNFOS.find(x=>x.id===c.reqT).n}», e tu não o assumiste.`;}
    else porque=`por causa do trunfo que assumiste no início, «${TRUNFOS.find(x=>x.id===c.reqT).n}»`;}
  if(c.badL && G3.limites.includes(c.badL)){G3.limTest.push({l:c.badL,h:ev.h});ok=false;motivo=`O limite que assumiste — «${LIMITES.find(x=>x.id===c.badL).n}» — apanhou-te precisamente aqui.`;}
  const eff=ok?c.e:(c.fail||c.e), txt=ok?c.o:(c.of||c.o);
  const antes={}; Object.keys(EIXO_NOME).forEach(k=>antes[k]=g3Val(k));
  const somaBruta=Object.values(eff).reduce((a,b)=>a+b,0);
  const restoSemAprend=Object.entries(eff).filter(([k])=>k!=='aprend').reduce((a,[,v])=>a+v,0);
  const peso=somaBruta>=0?EV_BOM:EV_MAU;
  for(const k in eff){
    let d=eff[k]*peso;
    if(k==='aprend' && d>0 && restoSemAprend<0) d=0;
    addSc(k,d,`${ev.h}: ${c.t}`);
  }
  if(restoSemAprend<0 && !(eff.aprend>0)) addSc('aprend', restoSemAprend*0.14, `${ev.h}: fugiste à lição`);
  const deltas={}; Object.keys(EIXO_NOME).forEach(k=>deltas[k]=g3Val(k)-antes[k]);
  const soma=Object.values(eff).reduce((a,b)=>a+b,0), d=ev.dim||'D2';

  if(!ok){G3.sessPerdidas+=2;G3.sessLog.push(`−2 sessões: ${ev.h} — não resultou.`);
    G3.grupo=Math.max(0,G3.grupo-4);G3.grupoLog.push({t:`${ev.h}: correu mal, saíram 4`,v:-4});}
  else if(soma<0){G3.sessPerdidas+=1;G3.sessLog.push(`−1 sessão: ${ev.h}.`);
    G3.grupo=Math.max(0,G3.grupo-3);G3.grupoLog.push({t:`${ev.h}: perdeste gente`,v:-3});}
  else if(soma>=12){G3.grupo+=3;G3.grupoLog.push({t:`${ev.h}: correu bem, vieram mais 3`,v:3});}

  if(ok && ENV_PADRAO.test(c.t)) G3.envLog.push(`Num acontecimento («${ev.h}») escolheste: «${c.t}»`);
  G3.evLog.push({h:ev.h,escolha:c.t,res:txt,ok,swot:ev.swot,tipo:g3EvTipo(ev).c==='oport'?'oport':'ameaca'});

  const b=document.getElementById('g3-body');
  const cf=b.querySelector('.confirmar'); if(cf)cf.remove();
  const mk=b.querySelector('.marcador'); if(mk)mk.remove();
  b.querySelector('.choices').innerHTML=`<div class="outcome ${ok?'':'bad'}">${ok?(porque?`<b>Resultou ${porque}.</b><br>`:''):`<b>Não resultou. ${motivo}</b><br>`}${txt}<p class="hint" style="margin-top:10px">Não dá para voltar atrás.</p></div>`;
  const last=G3.evIdx>=G3.eventos.length-1;
  b.insertAdjacentHTML('beforeend',`<div class="nav"><span></span>
    <button class="btn btn-yellow" onclick="G3.evSel=null;G3.evIdx++;g3Event()">${last?'Ver resultado':'Continuar'} →</button></div>`);
  window.scrollTo(0,0);
}
function g3Toggle(k){const e=document.getElementById('det-'+k);if(e)e.classList.toggle('open');}

function g3Indicador(id,A,sessFeitas,sessMeta,gMeta){
  const I=INDICADORES.find(x=>x.id===id), E=G3.energia, p=g3ProjSel();
  const ouviu=g3Escuta(), ouviuAd=g3EscutaAdultos(), bons=PROJ_LOCAIS[p.id]||[], sitioOk=bons.includes(G3.local);
  const maos=/energia|telemovel/.test([...p.tags,...(p.tags2||[])].join(','));
  let ok=null,foi,medir;
  switch(id){
   case 'frequencia':
    ok=E.divulgacao>=2;
    foi=ok?`Das ${sessMeta} sessões que prometeste fizeram-se quase todas, e ao fim de um mês ainda apareciam os mesmos — mais dois ou três que ninguém tinha chamado.`
          :`Começou cheio e foi definhando. À terceira semana eram metade da sala, e as sessões que sobraram fizeram-se para meia dúzia.`;
    medir=`Regista sessão a sessão, com nomes. Ao fim de um mês vês se é sempre a mesma gente.`;break;
   case 'envolvimento':
    ok=ouviu>0;
    foi=ok?`Como o projeto nasceu do que eles disseram, houve quem tomasse conta de partes sem tu pedires. Ao fim de umas semanas havia coisas a acontecer sem tu mandares.`
          :`Fizeram o que mandaste, e só isso. Participaram quando chamados e não pegaram em nada por iniciativa própria — ${ouviuAd?'o projeto foi decidido com as famílias, não com eles':'ninguém lhes perguntou nada antes de começar'}.`;
    medir=`Aponta, por sessão, quantas decisões foram deles e não tuas.`;break;
   case 'abertura':
    ok=ouviu>0;
    foi=ok?`Aceitaram sem grande resistência. Estavam a receber uma coisa que eles próprios tinham pedido — mesmo sem se lembrarem de a ter pedido.`
          :`Disseram que não às duas primeiras propostas. Não por serem novas: por não terem nada a ver com o que eles queriam — e ${ouviuAd?'quem foi consultado foram as famílias':'ninguém foi saber'}.`;
    medir=`O sinal é o segundo dia: quem voltou sem ser chamado.`;break;
   case 'autonomia':
    ok=E.registo>=2&&E.parceiros>=2;
    foi=ok?`Faltaste uma semana e a coisa aconteceu à mesma. Estava escrito o que era preciso fazer, e havia gente de fora a segurar.`
          :`Faltaste uma semana e não houve sessão. Sem registo e sem ninguém de fora, o projeto eras tu.`;
    medir=`Vê se alguém consegue conduzir a sessão sem ti. Se ninguém conseguir, o projeto é o teu horário.`;break;
   case 'relacao':
    ok=E.preparacao>=3&&sitioOk;
    foi=ok?`Chegaste preparado, semana após semana, e num sítio que servia. Ao fim de um mês começaram a procurar-te para coisas que já não eram da atividade.`
          :`Passaste as sessões a lutar contra o plano e contra o sítio. Eles viram isso, e trataram-te como quem está ali de passagem.`;
    medir=`Vê se te procuram quando têm um problema. Não é obedecerem — é virem ter contigo.`;break;
   case 'novos':
    ok=E.divulgacao>=3;
    foi=ok?`Apareceram caras que nunca tinham entrado. Não muitas — quatro, cinco — mas nenhuma delas viria se não tivesses ido buscá-las.`
          :`Vieram os do costume. Quem não vinha continuou a não vir, porque ninguém lhe disse que isto existia.`;
    medir=`Conta caras novas, não presenças. Uma lista de quem nunca tinha vindo, atualizada todas as semanas.`;break;
   case 'competencias':
    ok=(PROJ_BOM[p.id]||[]).some(t=>G3.trunfos.includes(t));
    foi=ok?`Ao fim de dois meses havia quem fizesse sozinho o que no primeiro dia não sabia fazer. Aprenderam contigo porque tu sabias aquilo.`
          :`Passaram tempo contigo e gostaram. Mas nenhum sabe hoje fazer uma coisa que não soubesse antes — estavas a aprender ao mesmo tempo que eles.`;
    medir=`Escolhe uma competência concreta por pessoa e regista o antes e o depois. A grelha do EDUCA+ não pergunta se participou: pergunta o que consegue fazer agora que não conseguia.`;break;
   case 'ecra':
    ok=maos;
    foi=ok?`Aos dez minutos ainda havia telemóveis na mão. Aos quarenta não havia nenhum — e ninguém tinha pedido para os guardarem.`
          :`Os telemóveis nunca chegaram a sair da mão. A atividade deixava-as livres, e mãos livres voltam ao ecrã.`;
    medir=`Conta telemóveis à vista aos dez minutos e aos quarenta. A diferença entre os dois números é o teu indicador.`;break;
   case 'permanencia':
    ok=E.registo>=2&&ouviu>0;
    foi=ok?`Ao fim de três meses ainda cá estava mais de metade dos que começaram. Os que saíram, saíram por motivos de fora.`
          :`As primeiras semanas encheram e depois foi a esvaziar. Ao terceiro mês restava um punhado.`;
    medir=`Lista de quem entrou no primeiro mês. Conta quantos desses ainda cá estão ao terceiro.`;break;
   case 'familias':
    ok=ouviuAd>0||E.divulgacao>=3;
    foi=ok?`Houve famílias a comentar em casa e a vir dizê-lo à porta. Duas perguntaram se havia mais.`
          :`Nenhuma família disse nada. Não é que não tenham notado — é que ninguém lhes perguntou.`;
    medir=`Uma pergunta à porta, sempre a mesma, a cinco famílias: «notou alguma diferença em casa?»`;break;
   case 'escola':
    ok=/escolar|transicao/.test([...p.tags,...(p.tags2||[])].join(','));
    foi=ok?`Houve dois casos com menos faltas, e uma professora que perguntou o que se andava a fazer aqui.`
          :`Na escola não mudou nada de visível. O que se fez aqui não chegou lá.`;
    medir=`Pede o número de faltas de três miúdos no início e no fim. É o dado mais difícil de arranjar e o mais forte de todos.`;break;
   case 'palavradeles':
    ok=ouviu>0;
    foi=ok?`No fim disseram coisas concretas: o que aprenderam, com quem passaram a falar, o que querem a seguir.`
          :`Responderam «foi fixe» e ficaram por aí. Não havia hábito de lhes perguntar nada.`;
    medir=`Uma folha no fim com três perguntas abertas. Guarda as respostas em bruto, com as palavras deles.`;break;
   case 'conflito':
    ok=/conflitos|emocional|competencias/.test([...p.tags,...(p.tags2||[])].join(','));
    foi=ok?`As chatices continuaram a acontecer — mas passaram a resolver-se a falar, e às vezes sem ti.`
          :`Continuou tudo a resolver-se aos gritos ou à força. A atividade não mexia nisso.`;
    medir=`Conta as vezes que tiveste de intervir, semana a semana. O que interessa é a curva, não o número.`;break;
   case 'iniciativa':
    ok=ouviu>0&&E.preparacao>=2;
    foi=ok?`Ao fim de um mês começaram a propor coisas — e uma delas foi feita.`
          :`Esperaram sempre que fosses tu a dizer o que se fazia.`;
    medir=`Aponta cada proposta que vier deles, e quantas foram para a frente.`;break;
   case 'pessoais':
    ok=/competencias|emocional|conflitos|participacao/.test([...p.tags,...(p.tags2||[])].join(','));
    foi=ok?`Ao fim de uns meses esperavam a vez, falavam com um adulto sem ser à bruta, e resolviam uma chatice sem partir tudo. Não em todos — mas via-se.`
          :`Continuaram a interromper-se, a fugir da conversa difícil e a resolver à força. A atividade não chegou a mexer nisso.`;
    medir=`Escolhe dois ou três comportamentos concretos — esperar a vez, pedir ajuda sem ser à bruta, ouvir até ao fim — e regista, por miúdo, o antes e o depois.`;break;
   case 'equipa':
    ok=G3.perguntou.includes('tecnicos')||ouviuAd>0;
    foi=ok?`Quem está à volta — a equipa do espaço, as famílias — reparou na diferença e disse-o sem tu perguntares.`
          :`Nem a equipa nem as famílias disseram nada — e tu também nunca lhes perguntaste. É a leitura mais fácil de recolher, e ficou por fazer.`;
    medir=`Uma pergunta à equipa e a algumas famílias, ao fim de um mês, sempre a mesma: «notaram alguma diferença nestes miúdos?» Guarda o que disserem, com as palavras deles.`;break;
  }
  const txt=`${foi}<br><b>Para medires isto a sério:</b> ${medir}`;
  return {n:I.n,d:I.d,ok,foi,medir,txt};
}

function g3PIA(full){
  const proj=g3ProjSel(), needs=g3Needs(), MATCH=g3Match(proj,needs);
  const local=LOCAIS.find(l=>l.id===G3.local);
  const sessMeta=g3Sessoes(), sessFeitas=Math.max(0,sessMeta-G3.sessPerdidas);
  const gMeta=META_GRUPO.find(x=>x.id===G3.mGrupo);
  const fMeta=META_FREQ.find(x=>x.id===G3.mFreq), dMeta=META_DUR.find(x=>x.id===G3.mDur);
  const A={alcance:g3Val('alcance'),qualidade:g3Val('qualidade'),sust:g3Val('sust'),aprend:g3Val('aprend')};
  const media=Math.round((A.alcance+A.qualidade+A.sust+A.aprend)/4);
  const trunfos=G3.trunfos.map(i=>TRUNFOS.find(t=>t.id===i));
  const limites=G3.limites.map(i=>LIMITES.find(t=>t.id===i));
  const inds=G3.indicadores.map(id=>g3Indicador(id,A,sessFeitas,sessMeta,gMeta));
  const passos=G3.passos.map(i=>proj.passos[i]);
  const op=G3.evLog.filter(e=>e.tipo==='oport'), am=G3.evLog.filter(e=>e.tipo!=='oport');
  const compsTxt=[...G3.comps,...(G3.compOutra?[G3.compOutra]:[])];
  const linhaPdv=compsTxt.length?`Quero levar deste projeto, para o meu percurso: ${compsTxt.join('; ')}.`:'________________________________________________';
  return `PLANO INDIVIDUAL DE AÇÃO (PIA) — RASCUNHO
Programa EDUCA+

DIAGNÓSTICO DO LOCAL
  O que eu vejo:
${G3.vejo.map(k=>`    · ${NEEDS[k].n} — ${NEEDS[k].d}`).join('\n')}
  Necessidades na ótica dos participantes:
${G3.ouvi.length?G3.ouvi.map(v=>`    · «${v.q}»
      quem disse: ${GRUPOS_ESCUTA.find(g=>g.id===v.g).n}
      problema que daqui resulta: ${NEEDS[v.need].n}`).join('\n'):'    ______________________  (OS JOVENS NÃO FORAM CONSULTADOS)'}

PÚBLICO-ALVO — PARA QUEM É O PROJETO
  ${g3AlvoNomes()||'________________________'}
  As necessidades que a atividade tem de responder são as deste grupo: ${g3Needs().map(k=>NEEDS[k].n.toLowerCase()).join('; ')}.${g3ForaAlvo().length?`
  Fica por responder (outros que ouvi pediram, mas não são o alvo): ${g3ForaAlvo().map(k=>NEEDS[k].n.toLowerCase()).join('; ')}.`:''}

ATRIBUTOS
${trunfos.map(t=>`  · ${t.n} — ${t.d}`).join('\n')}

CAMPO 1 — O QUE SE QUER FAZER
  ${proj.n}
  ${proj.d}

CAMPO 2 — PARA QUE SE QUER FAZER
  Identifiquei: ${needs.map(k=>NEEDS[k].n.toLowerCase()).join('; ')}.
  É PARA ISTO QUE O PROJETO EXISTE: ${MATCH.dir.map(k=>NEEDS[k].n).join('; ')||'nenhum dos problemas diagnosticados'}.
  E AINDA MEXE EM (pelo caminho): ${MATCH.lado.map(k=>NEEDS[k].n).join('; ')||'nada'}.
  NÃO TOCA EM: ${MATCH.fora.map(k=>NEEDS[k].n).join('; ')||'nada — cobre tudo o que diagnosticaste'}.
  Ligação ao meu projeto de vida: ${linhaPdv}

CAMPO 3 — QUANTO (metas)
  ${fMeta.n}, com ${gMeta.n.toLowerCase()}, ${dMeta.n.toLowerCase()}.
  META: ${sessMeta} ${sessMeta===1?'sessão':'sessões'}, ${gMeta.min} a ${gMeta.max} pessoas.${full?`
  REALIZADO NA SIMULAÇÃO: ${sessFeitas} ${sessFeitas===1?'sessão':'sessões'}, ${G3.grupo} pessoas no fim.
${G3.sessLog.length?G3.sessLog.map(l=>`    ! ${l}`).join('\n'):'    Sem perdas.'}`:''}

CAMPO 4 — ONDE
  ${local.n}${(PROJ_LOCAIS[proj.id]||[]).includes(G3.local)?'':'   ← ATENÇÃO: não é sítio para este projeto'}

CAMPO 5 — COMO (os três passos)
  · ${passos[0][0]}
  · ${passos[1][0]}
  · ${passos[2][0]}

CAMPO 6 — COMO AVALIAR
${inds.map(x=>full?`  ${x.ok?'[✓]':'[✗]'} ${x.n} — ${x.d}
      ${limpo(x.txt)}`:`  [ ] ${x.n} — ${x.d}
      Como medir: ${limpo(x.medir)}`).join('\n')}

BALANÇO — O QUE ESTE PIA TEM DE FORTE E DE FRACO
${(()=>{const B=g3Balanco();
 return '  PONTOS FORTES\n'+(B.fortes.length?B.fortes.map(f=>`    + ${limpo(f.t)}`).join('\n'):'    (nenhum se destacou)')
   +'\n  PONTOS FRACOS\n'+(B.fracos.length?B.fracos.map(f=>`    - ${limpo(f.t)}`).join('\n'):'    (nenhum erro grande)');})()}

${G3.planoFalhas.length?`ALERTAS DE COERÊNCIA
${G3.planoFalhas.map(f=>`  ! ${f}`).join('\n')}
`:''}
ANÁLISE SWOT
  FORÇAS
${trunfos.map(t=>`    · ${t.n}`).join('\n')}
  FRAQUEZAS
${limites.map(t=>`    · ${t.n} — ${t.d}`).join('\n')}
  OPORTUNIDADES
${full?(op.length?op.map(e=>`    · ${e.swot}
       Como reagi: ${e.escolha}
       Resultado: ${e.res}`).join('\n'):'    ______________________________________'):'    ______________________  (a preencher no terreno, quando o projeto arrancar)'}
  AMEAÇAS
${full?am.map(e=>`    · ${e.swot}
       Como reagi: ${e.escolha}
       Resultado: ${e.res}`).join('\n'):'    ______________________  (a preencher no terreno, quando o projeto arrancar)'}
${full?`
O PROJETO (0-100)
  Alcance ${A.alcance} · Qualidade ${A.qualidade} · Sustentabilidade ${A.sust} · Aprendizagem ${A.aprend}  →  MÉDIA ${media}`:''}`;
}

function g3ResultDesenho(){
  const proj=g3ProjSel(), needs=g3Needs(), MATCH=g3Match(proj,needs);
  const local=LOCAIS.find(l=>l.id===G3.local);
  const bons=PROJ_LOCAIS[proj.id]||[];
  const mav=g3MetaAv();
  const checks=[
    {ok:g3Escuta()>0, t:'Ouviste os jovens', s:g3Escuta()>0?'O diagnóstico tem a voz de quem vai usar o projeto.':'Montaste o diagnóstico sobre eles, sem eles. É a única coisa que o PIA pede mesmo.'},
    {ok:G3.perguntou.includes('tecnicos'), t:'Falaste com a equipa do espaço', s:G3.perguntou.includes('tecnicos')?'Quem abre a porta e conhece os miúdos entrou no plano.':'Montaste isto por cima de quem lá trabalha todos os dias.'},
    {ok:MATCH.dir.length>0, t:'A atividade responde às necessidades do público-alvo', s:MATCH.dir.length?`«${proj.n}» destaca-se em ${MATCH.dir.length} ${MATCH.dir.length===1?'necessidade':'necessidades'} de ${g3AlvoNomes()}.`:`«${proj.n}» não responde a nenhuma das necessidades de ${g3AlvoNomes()}.`},
    {ok:bons.includes(G3.local), t:'O sítio serve para a atividade', s:bons.includes(G3.local)?`${local.n} dá para fazer isto.`:`${local.n} não é sítio para «${proj.n}».`},
    {ok:mav.length===0, t:'A meta bate certo com a atividade', s:mav.length===0?'Frequência, tempo, número de pessoas e idades: tudo encaixa.':`${mav.length} ${mav.length===1?'coisa não bate certo':'coisas não batem certo'}.`}
  ];
  const passam=checks.filter(c=>c.ok).length;
  const pia=g3PIA(false); window.__pia=pia;
  try{if(window.parent!==window)window.parent.postMessage({type:'educa:pia',nome:G3.nome,fase:'desenho',consultou:G3.ouvi.length,coerencia:passam+'/'+checks.length,pia},'*');}catch(e){}
  document.getElementById('g3-body').innerHTML=`
    <span class="eyebrow">Fim do desenho · ${proj.n} · ${local.n}</span>
    <h3 class="q" style="margin-top:10px">O teu plano está desenhado.</h3>
    <p class="q-sub">Um desenho não se avalia por pontos — avalia-se por coerência. A pergunta é: <b>o plano bate certo consigo próprio?</b></p>
    <div class="metas-box">
      <span class="eyebrow" style="color:var(--postit)">Cartão de coerência · ${passam} de ${checks.length}</span>
      <div class="inds" style="margin-top:12px">${checks.map(c=>`<div class="ind ${c.ok?'ok':''}">
        <b>${c.ok?'✓':'✗'} ${c.t}</b><span>${c.s}</span></div>`).join('')}</div>
    </div>
    <div class="aposta" style="margin-top:16px">
      <span class="eyebrow">A quem ouviste, e para quem é o projeto</span>
      <p class="bal-lead">Ouviste <b>${G3.perguntou.map(g=>GRUPOS_ESCUTA.find(x=>x.id===g).n.toLowerCase()).join(', ')}</b>. O projeto é para <b>${g3AlvoNomes()}</b> — e é às necessidades desse grupo que a atividade tem de responder.</p>
      ${(()=>{const fora=g3ForaAlvo();return fora.length
        ?`<div class="ap-cols"><div class="ap-col falta"><span class="eyebrow">Fica por responder — outros que ouviste pediram, mas não são o alvo</span><ul>${fora.map(t=>`<li>${NEEDS[t].n}</li>`).join('')}</ul></div></div><p class="q-sub" style="margin-top:8px">Não é erro — é a decisão de focar. Mas fica claro: estas necessidades, de quem ouviste, este projeto não as serve. Se são importantes, ou é outro projeto, ou mudas o alvo.</p>`
        :'<p class="q-sub" style="margin-top:4px">Tudo o que ouviste é do público-alvo — a escolha do grupo não deixou nada de fora.</p>';})()}
    </div>
    ${g3Coerencia()}
    ${(()=>{const M=MATCH, li=t=>`<li>${NEEDS[t].n}</li>`;
      return `<div class="aposta ${M.dir.length?'ok':''}">
        <span class="eyebrow">Para que serve mesmo «${proj.n}»</span>
        <p class="bal-lead">${M.dir.length?`Das ${needs.length} necessidades do teu público-alvo, esta atividade destaca-se em <b>${M.dir.length}</b>.`:`Não se destaca em nenhuma das necessidades do teu público-alvo — é aqui que o plano não bate certo.`}</p>
        <div class="ap-cols">
          ${M.dir.length?`<div class="ap-col bom"><span class="eyebrow">É para isto que existe</span><ul>${M.dir.map(li).join('')}</ul></div>`:''}
          ${M.lado.length?`<div class="ap-col meio"><span class="eyebrow">Também ajuda em</span><ul>${M.lado.map(li).join('')}</ul></div>`:''}
          ${M.fora.length?`<div class="ap-col mau"><span class="eyebrow">Nisto não mexe</span><ul>${M.fora.map(li).join('')}</ul></div>`:''}
        </div>
      </div>`;})()}
    ${G3.planoFalhas.length?`<div class="alerta"><span class="eyebrow">O que ficou incoerente no plano</span><ul>${G3.planoFalhas.map(f=>`<li>${f}</li>`).join('')}</ul></div>`:''}
    <div class="pia-out">
      <span class="eyebrow" style="color:#8b8499">Sai daqui um documento</span>
      <h3 style="color:var(--ink);font-size:23px;margin-top:6px">Rascunho do teu PIA</h3>
      <pre>${pia.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre>
      <div class="pia-actions"><button class="btn btn-solid" onclick="g3PDF()">Descarregar PDF</button>
      <button class="btn" onclick="g3Download()">Descarregar .txt</button>
      <button class="btn" onclick="g3Copy(this)">Copiar</button></div>
    </div>
    <div style="margin-top:28px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-yellow" onclick="g3Reset()">Montar outro</button>
      <button class="btn" onclick="go('home')">Menu</button></div>`;
  window.scrollTo(0,0);
}

function g3Result(keep){
  {const p0=g3ProjSel(), n0=g3Needs(), M0=g3Match(p0,n0);
   if(n0.length && !M0.dir.length){
     const teto = M0.lado.length ? 55 : 40;
     const rot = `Teto: uma atividade que não responde ao teu diagnóstico não passa de ${teto}, por muito bem que corra tudo o resto`;
     ['alcance','qualidade','sust','aprend'].forEach(k=>{
       let bruto=G3.sc[k];
       if(g3Val(k)>teto){
         let alvo = teto<=78 ? teto : 78+(teto-78)/0.28;
         addSc(k, alvo-bruto, rot);
       }});
   }}
  const A={alcance:g3Val('alcance'),qualidade:g3Val('qualidade'),sust:g3Val('sust'),aprend:g3Val('aprend')};
  const media=Math.round((A.alcance+A.qualidade+A.sust+A.aprend)/4);
  const proj=g3ProjSel(), needs=g3Needs(), MATCH=g3Match(proj,needs);
  const local=LOCAIS.find(l=>l.id===G3.local);
  const sessMeta=g3Sessoes(), sessFeitas=Math.max(0,sessMeta-G3.sessPerdidas);
  const gMeta=META_GRUPO.find(x=>x.id===G3.mGrupo);
  const fMeta=META_FREQ.find(x=>x.id===G3.mFreq), dMeta=META_DUR.find(x=>x.id===G3.mDur);
  const trunfos=G3.trunfos.map(i=>TRUNFOS.find(t=>t.id===i));
  const limites=G3.limites.map(i=>LIMITES.find(t=>t.id===i));
  const inds=G3.indicadores.map(id=>g3Indicador(id,A,sessFeitas,sessMeta,gMeta));
  const metaSess = sessFeitas>=Math.ceil(sessMeta*0.85);
  const metaGrupo = G3.grupo>=gMeta.min;
  let vt,vp;
  const semJovens=g3Escuta()===0;
  const semEncaixe=needs.length>0&&MATCH.dir.length===0;
  if(semEncaixe){vt="Ao lado.";vp=`${media>=62?`Fizeste isto bem — ${sessFeitas} sessões, gente a aparecer, tudo registado. Só que o`:`O`} «${proj.n}» não existe para nenhum dos ${needs.length} problemas que tu próprio diagnosticaste. Pode ter corrido lindamente e ter servido para alguma coisa — só não para o que tu próprio tinhas identificado como prioridade. É o erro mais difícil de ver, porque de fora vê-se um projeto a funcionar.`;}
  else if(media>=80&&semJovens){vt="Correu — mas não chega.";vp="A nota até deu para «o projeto pegou». Só que não falaste com um único jovem: montaste isto sobre eles, sem eles. Um PIA assim não é dos jovens, é teu — e por isso o veredicto máximo não está disponível. É a única coisa que este jogo não deixa passar.";}
  else if(media>=80){vt="O projeto pegou.";vp="Chegou a gente, foi bem feito, ficou registado. Sobreviveria sem ti.";}
  else if(media>=62){vt="Correu.";vp="Não foi desastre nem foi memorável. Olha para a coluna mais baixa das quatro: é aí que se decide a próxima vez.";}
  else if(media>=45){vt="Ficou por um fio.";vp="Aconteceu, mas à custa de ti e sem deixar rasto. Abaixo de 62 não é um projeto que se aguente — é um que tu aguentaste.";}
  else{vt="Não chegou lá.";vp="Vale mais descobrir isto aqui do que lá. Abre os eixos e vê onde é que se desfez.";}

  const nomes=EIXO_NOME;
  const passos=G3.passos.map(i=>proj.passos[i]);
  const op=G3.evLog.filter(e=>e.tipo==='oport'), am=G3.evLog.filter(e=>e.tipo!=='oport');
  const compsTxt=[...G3.comps,...(G3.compOutra?[G3.compOutra]:[])];
  const linhaPdv=compsTxt.length?`Quero levar deste projeto, para o meu percurso: ${compsTxt.join('; ')}.`:'________________________________________________';

  const pia=g3PIA(true);
  window.__pia=pia;
  try{if(window.parent!==window)window.parent.postMessage({type:'educa:pia',nome:G3.nome,media,metas:{sessMeta,grupo:G3.grupo},consultou:G3.ouvi.length,pia},'*');}catch(e){}

  document.getElementById('g3-body').innerHTML=`
    <span class="eyebrow">Fim de percurso · ${proj.n} · ${local.n}</span>

    <div class="metas-box">
      <span class="eyebrow" style="color:var(--postit)">CAMPO 3 + CAMPO 7 · a tua meta e como a vais medir</span>
      <p class="hint" style="margin:6px 0 14px">O jogo não simula as sessões uma a uma. O que fica registado é a meta que prometeste e como vais avaliá-la.</p>
      <div class="meta-line"><b>A tua meta:</b> ${sessMeta} ${sessMeta===1?'sessão':'sessões'} — ${fMeta.n.toLowerCase()}, com ${gMeta.n.toLowerCase()}, ${dMeta.n.toLowerCase()}.</div>
      <p class="eyebrow" style="margin:16px 0 8px">Escolheste medir por</p>
      <div class="inds">${inds.map(x=>`<div class="ind ${x.ok?'ok':'no'}">
        <b>${x.ok?'✓ resultou':'✗ não resultou'} · ${x.n}</b><span>${x.txt}</span></div>`).join('')}</div>
    </div>

    <h2 class="display" style="font-size:clamp(30px,5.5vw,50px);margin:26px 0 4px">${media}<span style="color:var(--chalk);font-size:.4em">/100</span></h2>
    <div class="verdict" style="background:var(--ink);color:var(--paper);margin:0 0 16px">
      <span class="eyebrow" style="color:var(--postit)">O teto é 92. Nunca é 100.</span>
      <p style="margin-top:6px">Não há projeto perfeito — nem aqui, nem no terreno. ${media>=88?'Chegaste ao topo do que este jogo dá, e mesmo aí ficou coisa por afinar.':'Há sempre um eixo mais baixo que o resto.'} <b>Ninguém é 10.</b> A diferença não está em quem faz tudo bem — está em quem sabe apontar onde é que o seu não foi. Olha para a coluna mais baixa: é essa a conversa da próxima supervisão.</p>
    </div>
    <p class="hint" style="margin-bottom:18px">Isto é um jogo, não uma avaliação a sério — serve para veres o efeito das decisões que tomaste. Toda a gente começa no mesmo sítio; o que muda daí para a frente é o que decidiste.</p>
    <div class="axes">${Object.entries(A).map(([k,v])=>`
      <div class="dim-block"><div class="axis-row">
        <b>${nomes[k]}</b><div class="bar"><i data-w="${v}"></i></div><span class="v">${v}</span></div>
      </div>`).join('')}</div>
    <div class="dim-block" style="margin-top:14px">
      <div class="axis-row" style="cursor:pointer" onclick="g3Toggle('sc-tudo')">
        <b>O que contou para este resultado</b><span class="ver-conta">abrir</span></div>
      <div class="det" id="det-sc-tudo">${g3Tabela(A)}</div>
    </div>
    <div class="verdict"><h3>${vt}</h3><p>${vp}</p></div>
    ${g3Narrativa(media)}
    ${g3Coerencia()}
    ${g3Inds()}
    ${(()=>{const p=g3ProjSel(), M=g3Match(p,g3Needs());
      const li=t=>`<li>${NEEDS[t].n}</li>`;
      return `<div class="aposta ${M.dir.length?'ok':''}">
        <span class="eyebrow">Para que serve mesmo «${p.n}»</span>
        <p class="bal-lead">${M.dir.length
          ? `Dos ${g3Needs().length} problemas que diagnosticaste, esta atividade destaca-se em <b>${M.dir.length}</b>.`
          : `Esta atividade não se destaca em nenhum dos problemas que diagnosticaste. Pode ter servido para outra coisa — mas não para o que tu próprio apontaste.`}</p>
        <div class="ap-cols">
          ${M.dir.length?`<div class="ap-col bom"><span class="eyebrow">É para isto que existe</span><ul>${M.dir.map(li).join('')}</ul></div>`:''}
          ${M.lado.length?`<div class="ap-col meio"><span class="eyebrow">Também ajuda em</span><ul>${M.lado.map(li).join('')}</ul></div>`:''}
          ${M.fora.length?`<div class="ap-col mau"><span class="eyebrow">Nisto não mexe</span><ul>${M.fora.map(li).join('')}</ul></div>`:''}
        </div>
      </div>`;})()}
    ${(()=>{const B=g3Balanco(), nm=EIXO_NOME;
      const eixos=['alcance','qualidade','sust','aprend'].map(k=>({k,v:A[k]})).sort((a,b)=>b.v-a.v);
      const alto=eixos[0], baixo=eixos[eixos.length-1];
      const LEIT={alcance:['chegaste a gente','chegaste a pouca gente'],qualidade:['foi bem feito','ficou mal amarrado'],sust:['aguenta-se sem ti','fica preso a ti'],aprend:['aprendeste com isto','passaste sem aprender']};
      return `<div class="balanco">
        <span class="eyebrow">O balanço do teu PIA</span>
        <p class="bal-lead">${alto.v===baixo.v
          ? `Os quatro eixos ficaram todos em <b>${alto.v}/100</b>. O plano está parelho — não há aqui um ponto fraco a apontar.`
          : `O que este PIA tem de mais forte é <b>${nm[alto.k]}</b> (${alto.v}/100): ${LEIT[alto.k][0]}. O que o puxa para baixo é <b>${nm[baixo.k]}</b> (${baixo.v}/100): ${LEIT[baixo.k][1]}. Entre os dois vão <b>${alto.v-baixo.v} pontos</b> — ${alto.v-baixo.v>=30?'é muito, e é aí que este plano está torto':'é pouco, o plano está equilibrado'}.`}</p>
        <div class="bal-cols">
          <div class="bal-col bom"><span class="eyebrow">O que está bem, e porquê</span>
            ${B.fortes.length?`<ul>${B.fortes.map(f=>`<li><b>+${Math.round(f.v)}</b> ${f.t}</li>`).join('')}</ul>`:'<p class="hint">Nada no teu plano se destacou.</p>'}</div>
          <div class="bal-col mau"><span class="eyebrow">O que te custou mais</span>
            ${B.fracos.length?`<ul>${B.fracos.map(f=>`<li><b>${Math.round(f.v)}</b> ${f.t}</li>`).join('')}</ul>`:'<p class="hint">Não houve nenhum erro grande. É raro.</p>'}</div>
        </div>
        <p class="bal-next"><b>Se voltasses a fazer este PIA amanhã</b>, a coisa que mais mudava a nota era ${B.fracos.length?`isto: <b>${B.fracos[0].t.toLowerCase()}</b>`:`subir ${nm[baixo.k]}`}. O que interessa levar à supervisão é isto, não o número.</p>
      </div>`;})()}
    ${G3.planoFalhas.length?`<div class="alerta"><span class="eyebrow">O que ficou incoerente</span><ul>${G3.planoFalhas.map(f=>`<li>${f}</li>`).join('')}</ul></div>`:''}

    <div class="pia-out">
      <span class="eyebrow" style="color:#8b8499">Sai daqui um documento</span>
      <h3 style="color:var(--ink);font-size:23px;margin-top:6px">Rascunho do teu PIA</h3>
      <pre>${pia.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</pre>
      <div class="pia-actions"><button class="btn btn-solid" onclick="g3PDF()">Descarregar PDF</button>
      <button class="btn" onclick="g3Download()">Descarregar .txt</button>
      <button class="btn" onclick="g3Copy(this)">Copiar</button></div>
    </div>
    <div style="margin-top:28px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-yellow" onclick="g3Reset()">Jogar outra vez</button>
      <button class="btn" onclick="go('home')">Menu</button></div>`;
  requestAnimationFrame(()=>document.querySelectorAll('.bar i, .dim-two .tr i').forEach(i=>i.style.width=i.dataset.w+'%'));
  if(!keep)window.scrollTo(0,0);
}

function pesc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
const PA_CSS=`@page{size:A4;margin:14mm 14mm}
*{box-sizing:border-box}
body{margin:0;color:#1b1630;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;font-size:10.5pt;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pa-doc{max-width:182mm;margin:0 auto;padding:4mm 0}
.pa-head{border-bottom:3px solid #1b1630;padding-bottom:10px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:flex-end;gap:18px}
.pa-head h1{font-size:20pt;margin:0;letter-spacing:-.02em;line-height:1.05}
.pa-kicker{font-size:8pt;letter-spacing:.14em;text-transform:uppercase;color:#7a7490;margin:0 0 5px;font-weight:800}
.pa-meta{font-size:8.5pt;color:#57516e;text-align:right;white-space:nowrap;line-height:1.7}
.pa-badge{display:inline-block;background:#FFD84D;color:#1b1630;font-weight:800;font-size:7.5pt;letter-spacing:.1em;text-transform:uppercase;padding:3px 8px;border-radius:3px;margin-bottom:2px}
h2{font-size:10.5pt;letter-spacing:.05em;text-transform:uppercase;color:#1b1630;margin:16px 0 7px;padding-bottom:4px;border-bottom:1px solid #d8d4e2;break-after:avoid}
p{margin:5px 0}
p.lbl{font-weight:700;margin:9px 0 2px;color:#33304a}
ul{margin:5px 0;padding:0;list-style:none}
li{position:relative;padding:3px 0 3px 16px;break-inside:avoid}
li::before{content:'·';position:absolute;left:5px;color:#9a94ad;font-weight:700}
li.pos::before{content:'+';color:#2e8b57}
li.neg::before{content:'–';color:#c0392b}
li.box::before{content:'☐';left:3px}
.pa-foot{margin-top:22px;padding-top:8px;border-top:1px solid #d8d4e2;font-size:7.5pt;color:#8b8499;line-height:1.45}
.pa-dim{display:flex;align-items:baseline;gap:10px;padding:7px 2px;border-bottom:1px solid #eee;break-inside:avoid}
.pa-dim .pa-band{margin-left:auto;font-weight:800;font-size:13pt;color:#1b1630}
.pa-q{break-inside:avoid;margin:8px 0;padding:8px 11px;border:1px solid #e4e0ec;border-radius:4px}
.pa-qt{font-weight:700;margin-bottom:4px}
.pa-ans .v{display:inline-block;min-width:18px;font-weight:800;color:#6a6482}
.pa-note{font-size:9.2pt;color:#4a445f;background:#faf8ef;border-left:3px solid #FFD84D;padding:9px 11px;margin:10px 0;border-radius:0 4px 4px 0}
.noprint{margin:0 0 16px;padding:11px 15px;background:#FFD84D;border-radius:3px;font-size:10pt;color:#1b1630}
.noprint button{font:inherit;font-weight:800;padding:8px 15px;border:0;background:#1b1630;color:#fff;border-radius:3px;cursor:pointer;margin-left:10px}
@media print{.noprint{display:none}}`;
function paOpen(title,inner){
  const w=window.open('','_blank');
  if(!w){alert('O browser bloqueou a janela. Permite pop-ups e tenta outra vez.');return;}
  w.document.write(`<!DOCTYPE html><html lang="pt"><head><meta charset="utf-8"><title>${pesc(title)}</title><style>${PA_CSS}</style></head><body>
    <div class="noprint">Na janela de impressão, escolhe <b>«Guardar como PDF»</b> no destino.<button onclick="window.print()">Imprimir / Guardar PDF</button></div>
    ${inner}</body></html>`);
  w.document.close();
  setTimeout(()=>{try{w.print();}catch(e){}},450);
}
function piaHTML(){
  const raw=(window.__pia||g3PIA(false)).split('\n');
  let i=0; while(i<raw.length && raw[i].trim()!=='') i++;
  let html='',inList=false; const close=()=>{if(inList){html+='</ul>';inList=false;}};
  raw.slice(i+1).forEach(ln=>{
    const t=ln.trim(); if(!t){close();return;}
    const indent=ln.match(/^ */)[0].length;
    const noParen=t.replace(/\([^)]*\)/g,'').trim();
    const caps=noParen && noParen===noParen.toUpperCase() && /[A-ZÀ-Ú]/.test(noParen);
    if(indent===0 && caps){close();html+=`<h2>${pesc(t)}</h2>`;return;}
    if(indent>0 && caps){close();html+=`<p class="lbl">${pesc(t)}</p>`;return;}
    const bm=t.match(/^([·+\-]|\[[ ✓✗x]\])\s+([\s\S]*)$/);
    if(bm){if(!inList){html+='<ul>';inList=true;}
      const m=bm[1],cls=m==='+'?'pos':m==='-'?'neg':m[0]==='['?(m.includes('✓')?'pos':m.includes('✗')?'neg':'box'):'';
      html+=`<li class="${cls}">${pesc(bm[2])}</li>`;return;}
    if(t.endsWith(':')){close();html+=`<p class="lbl">${pesc(t)}</p>`;return;}
    close();html+=`<p>${pesc(t)}</p>`;
  });
  close();
  return `<div class="pa-doc">
    <div class="pa-head"><div><p class="pa-kicker">Programa EDUCA+ · Construtor de Projeto</p><h1>Plano Individual de Ação</h1></div>
      <div class="pa-meta"><span class="pa-badge">Rascunho</span></div></div>
    ${html}
    <p class="pa-foot">Rascunho gerado por simulação no Construtor de Projeto. A coluna de indicadores não é uma nota e não substitui a avaliação formal; as metas por confirmar validam-se com a gestora operacional.</p>
  </div>`;
}
function g3PDF(){ paOpen('PIA — '+(G3.nome||'EDUCA+'), piaHTML()); }
function g4HTML(){
  const byDim={};Object.keys(DIMS).forEach(k=>byDim[k]=[]);
  G4.qs.forEach((A,i)=>{if(G4.ans[i]!==undefined)byDim[A.k].push(g4Val(A,G4.ans[i]));});
  const D={};Object.keys(DIMS).forEach(k=>{const a=byDim[k];D[k]=a.length?a.reduce((x,y)=>x+y,0)/a.length:5;});
  const bandaCap=v=>banda(v)==='10'?'8-9':banda(v);
  const dims=Object.keys(DIMS).map(k=>`<div class="pa-dim"><b>${DIMS[k].n}</b><span class="pa-band">${bandaCap(D[k])}</span></div>`).join('');
  const qs=G4.qs.map((A,i)=>{const labels=A.freq?G4_SCALE.freq:G4_SCALE.agree;const meu=G4.ans[i];
    return `<div class="pa-q"><div class="pa-qt">${A.k}${A.rev?' ↺':''} · ${pesc(A.t)}</div>
      <div class="pa-ans"><span class="v">${meu!==undefined?g4Val(A,meu):'—'}</span> ${meu!==undefined?pesc(labels[meu]):'(sem resposta)'}</div></div>`;}).join('');
  return `<div class="pa-doc">
    <div class="pa-head"><div><p class="pa-kicker">Programa EDUCA+ · Como te vês</p><h1>O teu retrato</h1></div>
      <div class="pa-meta"><span class="pa-badge">Autoavaliação</span></div></div>
    <h2>Como te vês, por dimensão</h2>
    ${dims}
    <div class="pa-note"><b>Ninguém é 10.</b> O topo deste retrato é 9 — o 10 é o ponto cego, onde já te achas feito e deixas de ver o que falta. É normal dares-te notas mais baixas com o tempo: não é piorar, é perceber melhor o que o trabalho exige. Esta é a tua leitura; numa avaliação a sério, ao lado dela fica a de quem trabalha contigo.</div>
    <h2>As afirmações e o que cada resposta valeu</h2>
    <p style="font-size:9pt;color:#57516e;margin:4px 0 8px">O número é o que a resposta conta (1 a 9, nunca 10). As marcadas com ↺ estavam ao contrário: aí, concordar contava a menos.</p>
    ${qs}
    <p class="pa-foot">Autoavaliação gerada no jogo «Como te vês». É a leitura do próprio e não substitui a avaliação formal do programa.</p>
  </div>`;
}
function g4PDF(){ paOpen('Como te vês', g4HTML()); }
function g3Copy(btn){navigator.clipboard.writeText(window.__pia).then(()=>{const o=btn.textContent;btn.textContent='Copiado';setTimeout(()=>btn.textContent=o,1600);});}
function g3Download(){
  const b=new Blob([window.__pia],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(b);
  a.download=`PIA_${(G3.nome||'JEEP').replace(/\s+/g,'_')}.txt`;a.click();URL.revokeObjectURL(a.href);
}

const GRUPOS_ESCUTA=[
 {id:'sempre',n:"Os que estão sempre lá",d:"Os do costume. Conhecem o espaço melhor do que ninguém."},
 {id:'nunca',n:"Os que quase nunca aparecem",d:"Vêm uma vez por mês, ficam à porta, vão-se embora."},
 {id:'velhos',n:"Os mais velhos que desistiram",d:"Já não vêm. Acham que o espaço não é para eles."},
 {id:'familias',n:"As famílias",d:"Deixam os miúdos à porta. Nunca entram, nunca dizem nada."},
 {id:'tecnicos',n:"A equipa do espaço",d:"Os técnicos e os animadores que já cá estavam antes de ti."}
];
const VOZES={
 sempre:[
  {q:"Queríamos matraquilhos. Já pedimos mil vezes e ninguém fez nada.",need:'motivacao'},
  {q:"É sempre a mesma coisa, todos os dias.",need:'diversidade'},
  {q:"Se tirassem a consola, eu não vinha cá. É só por isso que venho.",need:'consola'},
  {q:"Há aqui um grupo que decide tudo. Nós vamos atrás, ou ficamos de fora.",need:'participacao'},
  {q:"Aqui é aos gritos. Quem grita mais é que tem razão — e depois ninguém vem falar connosco.",need:'conflitos'},
  {q:"Aqui não há horas para nada. Entra e sai quem quer, e arrumar não arruma ninguém.",need:'regras'}],
 nunca:[
  {q:"Não venho porque não há nada para fazer aqui. É tudo para os pequenos.",need:'diversidade'},
  {q:"Da última vez que vim, estava tudo já decidido. Ninguém me perguntou o que eu queria fazer.",need:'motivacao'},
  {q:"Ninguém me disse que isto estava aberto. Passo à porta todos os dias.",need:'comunidade'},
  {q:"É sempre a mesma malta. Não me sinto à vontade para entrar.",need:'participacao'},
  {q:"Da última vez que vim havia uma briga à porta. Não voltei mais.",need:'conflitos'},
  {q:"As inscrições para as atividades daqui são todas online. Fiquei a olhar para aquilo e desisti.",need:'digital'}],
 velhos:[
  {q:"Isto nunca muda, é sempre a mesma coisa. Foi por isso que deixei de vir.",need:'diversidade'},
  {q:"Acabei a escola e aqui ninguém fala do que vem a seguir. Deixei de ver razões para vir.",need:'transicao'},
  {q:"Nunca nos deixavam decidir nada — decidiam tudo por nós. Fartei-me e parei de vir.",need:'motivacao'},
  {q:"Aqui era cada um no seu telemóvel, ninguém falava. Deixou de fazer sentido vir.",need:'telemovel'},
  {q:"Quando alguma coisa me chateava, ia-me embora sem dizer nada. Um dia foi de vez.",need:'emocional'},
  {q:"Andava tudo sempre aos gritos e ninguém resolvia. Cansei-me e não voltei.",need:'conflitos'}],
 familias:[
  {q:"Ele chumbou outra vez. E aqui dentro ninguém me disse nada sobre isso.",need:'escolar'},
  {q:"Digo-lhe para ir experimentar coisas novas e é sempre «não». Fica-se pelo que já conhece.",need:'fechados'},
  {q:"Eu não entro. Aquilo não é para mim.",need:'familias'},
  {q:"O meu filho passa ali a tarde inteira agarrado ao telemóvel.",need:'telemovel'},
  {q:"Ele chega a casa e ainda tem corda para três horas. Não gastou nada ali dentro.",need:'energia'},
  {q:"Vem de lá calado, fecha-se no quarto, e depois explode por causa de um copo mal lavado.",need:'emocional'}],
 tecnicos:[
  {q:"Reclamam que decidimos tudo por eles. Só que, quando lhes passamos alguma coisa, não lá chega — e voltamos a ser nós a tratar de tudo.",need:'motivacao'},
  {q:"Aquela sala está fechada há dois anos.",need:'espaco'},
  {q:"Acabam a escola e ficam por aqui sem rumo. Não há ninguém a trabalhar com eles o que vem a seguir.",need:'transicao'},
  {q:"Propomos coisas novas e a resposta é sempre não. Ficam pelo que já conhecem.",need:'fechados'},
  {q:"Ao fim de meia hora sentados começa tudo aos saltos e já não há quem os segure.",need:'energia'},
  {q:"Combina-se uma hora para começar e entram quando lhes apetece. Arrumar, nem se fala.",need:'regras'},
  {q:"Damos-lhes uma coisa para fazerem em grupo e desfaz-se sempre. Não se ouvem uns aos outros.",need:'competencias'},
  {q:"Sabem tudo do TikTok e não sabem anexar um ficheiro a um email.",need:'digital'}]
};

const LOCAIS=[
 {id:'todo',n:"O espaço todo",d:"A atividade ocupa a casa inteira: sala, corredor, entrada, o que for preciso."},
 {id:'comum',n:"A sala comum",d:"O sítio onde já estão todos. Não tens de pedir nada a ninguém — e também não tens sossego nenhum."},
 {id:'sala',n:"Uma sala fechada só nossa",d:"Concentração e privacidade. É a mais difícil de conseguir, e a primeira a ser-te tirada."},
 {id:'campo',n:"O campo ou o exterior",d:"Espaço a sério, barulho permitido. Depende do tempo, e o tempo não te obedece."},
 {id:'informatica',n:"A sala de computadores",d:"Ecrãs e net. É a desculpa perfeita para eles virem — e para não saírem de lá."},
 {id:'cozinha',n:"A cozinha",d:"Ninguém sai de uma cozinha zangado. Mas tens de a pedir, e tens de a vigiar."},
 {id:'entrada',n:"A entrada ou o corredor",d:"Toda a gente passa e ninguém pára. Bom para mostrar, péssimo para fazer."},
 {id:'fora',n:"Fora do equipamento",d:"A rua, a escola, a junta. Ganhas alcance e perdes controlo."}
];

const LIM_TRAVA={
 timidez:['lider','redes','humor'], experiencia:['organizado','profissional'],
 autoridade:['lider'], escrita:['digital','academico'],
 frustracao:['paciencia','maos'], calma:['paciencia','escuta'],
 foco:['organizado'], atraso:['organizado'],
 pedir:['redes','lider'], dizernao:['lider'],
 conflito:['lider','escuta'], levo:['escuta','cuidar'],
 comparo:['digital','arte','maos'],
 improviso:['criatividade','humor'], digitalbaixo:['digital','gaming'],
 amigo:['lider','cuidar']
};

const PROJ_BOM={
  musica:['musicaarte','digital','redes','criatividade'],
  jogosativos:['desporto','lider','criatividade','escuta','paciencia'], socioemocional:['escuta','paciencia','lider','cuidar'], imagem:['maos','cuidar','escuta','paciencia','criatividade'], maisvelhos:['lider','escuta','percurso'],
  consolatorneio:['gaming','organizado','lider'], criadores:['gaming','digital','arte','criatividade','organizado'],
  cinema:['escuta','lider','humor'],  torneio:['desporto','organizado','lider'],
  radio:['digital','escuta','linguas','criatividade','organizado'], estudo:['academico','paciencia','escuta','organizado','cuidar'],
  horta:['maos','paciencia','organizado'], mural:['arte','maos','organizado','criatividade'], jornal:['arte','digital','academico','criatividade','maos'], artes:['maos','arte','paciencia','criatividade'],
  cozinha:['cozinha','organizado','paciencia'], jantar:['cozinha','linguas','redes','cuidar','organizado'], forum:['musicaarte','lider','escuta','criatividade'],
  danca:['musicaarte','desporto','lider','criatividade','organizado'], mostra:['redes','organizado','lider','linguas'],
  tabuleiro:['paciencia','humor','escuta'], reparar:['maos','paciencia','organizado','criatividade'],
  foto:['arte','digital','redes','criatividade'], carreira:['profissional','organizado','digital']
};

const PROJ_LOCAIS={
 musica:['sala','informatica','comum'],
 jogosativos:['campo','comum','sala','fora'], socioemocional:['sala','comum'], imagem:['sala','cozinha','comum'], maisvelhos:['sala','fora','comum'],
 consolatorneio:['informatica','comum','sala'], criadores:['informatica','sala','fora'], cinema:['sala','comum'],
 torneio:['campo','fora'], radio:['sala','informatica'],
 estudo:['sala','informatica'], horta:['campo','fora'],
 mural:['entrada','comum','fora'], jornal:['entrada','sala','comum'], artes:['sala','comum','fora'], cozinha:['cozinha'], jantar:['cozinha','comum'],
 forum:['sala','comum'], danca:['sala','campo','comum'],
 mostra:['todo','entrada','fora','campo','comum'], tabuleiro:['comum','sala'],
 reparar:['campo','cozinha','fora'], foto:['fora','entrada'],
 carreira:['informatica','sala'],
 custom:['comum','sala','campo','informatica','cozinha','entrada','fora']
};

const PORQUE={
 jornal:{participacao:"Cabe o texto de cada um: quem escreve pouco também sai publicado, não só os do costume.",motivacao:"Cada número é decidido por eles — o que entra, quem escreve, o que fica de fora. A linha é deles, não do adulto.",digital:"Escrever, rever, paginar, fotografar. É trabalho digital sem parecer aula.",competencias:"Entrevistar alguém e escrever o que essa pessoa disse é falar com adultos a sério.",comunidade:"O jornal sai do espaço e chega a quem nunca lá entrou.",escolar:"Escrever todos os meses com alguém a rever é apoio ao estudo disfarçado.",diversidade:"Cada número pode ser sobre outra coisa e envolver outra gente."},
 artes:{diversidade:"Traz quem não gosta de bola nem de consola e não tinha ali nada.",emocional:"Trabalhar com as mãos acalma, e é aí que se fala do que se sente.",telemovel:"Com barro ou tinta nas mãos, o telemóvel fica na mesa.",competencias:"Partilhar material, esperar pela ferramenta, arrumar no fim.",fechados:"Quem recusa tudo aceita mexer nas mãos — é a porta mais fácil.",participacao:"Cada um faz a sua peça; não há palco para uns e plateia para outros.",motivacao:"São eles a escolher o que se faz em cada sessão — a mão é deles, não é o adulto a mandar.",energia:"Ocupa as mãos e a cabeça durante uma hora seguida.",transicao:"Trabalhar madeira, costura ou cerâmica é um ofício com saída. Para quem não sabe o que quer a seguir, é uma pista concreta."},
 jantar:{familias:"É a única coisa que faz uma família entrar no espaço e ficar sentada uma hora.",comunidade:"Junta à mesma mesa gente que vive a cem metros e nunca falou.",diversidade:"Cada prato vem de um sítio, e é a comida que abre a conversa sobre isso.",competencias:"Servir, esperar, dividir a mesa. Aprende-se à frente de adultos, que é onde custa.",fechados:"Quem não fala numa roda, fala a servir um prato.",participacao:"Cada um cozinha, serve ou recebe — ninguém fica só sentado a ver.",motivacao:"São eles que decidem o menu, quem convidam e como se recebe — a casa é deles nesse dia.",conflitos:"Organizar uma mesa para trinta é negociar de dez em dez minutos."},
 musica:{digital:"Produzir, gravar, editar e publicar — hoje faz-se tudo num telemóvel e de graça. É competência a sério, não é brincadeira.",telemovel:"O telemóvel deixa de ser onde se ouve e passa a ser onde se faz. Ganha-se ao ecrã dando-lhe trabalho, não tirando-o.",motivacao:"Já andam com música nos ouvidos o dia todo. Isto não lhes pede que gostem de outra coisa — pede-lhes que passem para o outro lado.",fechados:"Não é uma atividade nova para eles: é a coisa de que já gostam, feita de outra maneira.",participacao:"Um faz o beat, outro escreve, outro grava, outro trata da capa. Ninguém sobra.",transicao:"No fim há temas publicados. Isso é portefólio — e portefólio abre portas.",competencias:"Escrever uma letra que caiba no tempo certo é estrutura, métrica e paciência.",emocional:"Uma letra é o sítio onde se diz o que não se consegue dizer a falar.",diversidade:"Cada tema é diferente do anterior — não é a mesma atividade repetida, é uma coisa nova de cada vez.",energia:"Um miúdo que não pára quieto consegue estar duas horas colado a fazer um beat. A energia não se gasta a correr — canaliza-se para criar."},
 jogosativos:{emocional:"Perder um jogo e não partir tudo é o treino mais rápido que há para a frustração.",energia:"Toda aquela energia ganha um sítio para ir — canalizada num jogo, não travada com um não.",telemovel:"O corpo ocupado é a única coisa que compete com o ecrã sem ser um ecrã.",motivacao:"Uma data e uma equipa dependem de ti; faltar deixa de ser de graça.",conflitos:"O jogo é onde se aprende a perder — e a perder sem partir tudo.",regras:"Sem regras não há jogo; aprendem-nas em campo, não em conversa.",participacao:"Todos entram na jogada, não só os do costume.",competencias:"Cooperar, esperar a vez, estratégia — tudo num jogo.",fechados:"Ninguém recusa um jogo; é a porta de entrada mais larga."},
 socioemocional:{emocional:"Pôr nome ao que se sente e parar antes de explodir é o que falta — e o que ninguém lhes ensinou.",competencias:"Discordar sem ser à bruta e esperar pela vez de falar é trabalhar com os outros — é o treino que a roda faz.",conflitos:"Falar antes de explodir resolve metade das chatices.",participacao:"Com a vez de falar a girar, os calados também entram — a conversa deixa de ser só dos do costume.",motivacao:"São eles a conduzir a roda e a escolher do que se fala; o adulto está calado. Deixa de ser tudo decidido por cima.",escolar:"Quem se regula melhor aprende melhor.",familias:"O que aparece na roda muitas vezes vem de casa.",fechados:"Não lhes pede para fazer nada de novo — só para falar do que já os chateia. Para quem diz «não» a toda a atividade nova, é a porta mais baixa que há.",diversidade:"Cada roda parte de outro vídeo, outra notícia, outro caso — nunca é a mesma conversa."},
 imagem:{transicao:"Cortar cabelo ou fazer unhas é uma competência que dá trabalho a sério.",fechados:"Traz os mais velhos que fogem de tudo o resto.",motivacao:"Ver-se diferente ao espelho é motivação imediata.",participacao:"Cada um cuida do outro; ninguém fica de fora.",competencias:"Método, higiene, paciência, cuidar do outro.",diversidade:"É trabalho com as mãos, que já não se faz em lado nenhum.",emocional:"Com as mãos ocupadas, fala-se do que custa.",telemovel:"As mãos estão nos outros, não no ecrã."},
 maisvelhos:{transicao:"É a ponte para os que já não cabem nas atividades de crianças.",motivacao:"São eles a decidir as regras e o programa — o espaço é mesmo deles, não é o adulto a mandar.",fechados:"Começa por perguntar-lhes, não por propor-lhes.",competencias:"Decidir, organizar, gerir um espaço próprio.",comunidade:"Um grupo de mais velhos com voz atrai outros de fora.",diversidade:"Cria uma faixa que o espaço não tinha — deixa de ser tudo para os mais novos."},
 consolatorneio:{consola:"Não tira a consola: usa-a como isco, e põe-lhe regras à volta.",regras:"As regras são escritas por eles e aplicadas em direto — quem não cumpre, não joga.",participacao:"Inscrições e turnos: toda a gente joga, não só os do costume.",motivacao:"O formato, as equipas e o calendário são decididos por eles — não é uma coisa que lhes dão feita.",conflitos:"Um árbitro e uma regra escrita resolvem o que os gritos não resolvem.",fechados:"Não é uma coisa nova — é a coisa de que já gostam, feita de outra maneira.",telemovel:"Enquanto jogam ou esperam a vez, o telemóvel fica na mesa.",competencias:"Esperar, cumprir horário, aceitar o resultado."},
 criadores:{consola:"Deixam de jogar e passam a fazer vídeos sobre jogar. É a mesma coisa de que gostam, do outro lado da câmara.",telemovel:"Passam de consumidores a produtores. O telemóvel deixa de ser fuga e passa a ser ferramenta.",digital:"Filmar, editar, publicar — é literalmente a competência que lhes falta.",participacao:"Filmar, entrevistar, editar, publicar — há função para quem normalmente fica de fora, não é só quem fala mais alto a aparecer.",transicao:"No fim têm portefólio. Portefólio é candidatura.",motivacao:"Decidem eles o que se filma e o que se publica — a linha é deles, não do adulto.",fechados:"Começa naquilo que já fazem — não lhes pede que gostem de outra coisa.",competencias:"Uma reportagem faz-se a vários: quem filma, quem entrevista, quem edita. Ninguém a faz sozinho.",diversidade:"Cada vídeo é sobre outra coisa e com outra gente — não é a mesma atividade repetida."},
 cinema:{competencias:"O debate depois do filme é treino de escuta e de argumentação.",motivacao:"Escolhem eles o próximo filme e o tema. Deixam de ser só espectadores do que os adultos programam.",fechados:"Ninguém recusa ver um filme. É a porta de entrada mais larga que existe.",diversidade:"Cada sessão é um tema diferente. Nunca é a mesma coisa.",conflitos:"Falar de um conflito no ecrã é mais fácil do que falar do conflito da sala.",emocional:"Um sentimento difícil visto numa personagem fala-se melhor do que o próprio. O ecrã dá a distância que a sala não dá."},
 torneio:{emocional:"Ganhar sem gozar e perder sem virar costas. Aprende-se em campo, não em conversa.",energia:"Correr atrás de uma bola gasta o que não se gasta sentado.",telemovel:"Ninguém joga à bola a olhar para o telemóvel. Sai do bolso quando o jogo é melhor do que ele.",motivacao:"Uma data marcada e uma equipa dependem de ti. Faltar deixa de ser de graça.",comunidade:"Junta polos que nunca se falam.",conflitos:"Equipas mistas de propósito: obriga a jogar com quem não jogarias.",regras:"Sem regras não há jogo. Aprende-se em campo, não em conversa.",participacao:"Todos jogam. É a regra do torneio.",fechados:"Desporto é a coisa que menos gente recusa.",competencias:"Equipas mistas obrigam a passar, cobrir e contar com quem não escolherias. É trabalhar com os outros, à força do jogo."},
 radio:{digital:"Gravar, editar, publicar. Competências que dão trabalho a sério.",comunidade:"Obriga-os a sair e a entrevistar quem vive ali.",participacao:"Há papéis para todos — quem pergunta, quem grava, quem edita —, não é só um a falar.",motivacao:"São eles a escolher quem entrevistar e o que perguntar; o adulto está calado. A pauta é deles.",telemovel:"O telemóvel passa a ser microfone.",familias:"As famílias entrevistadas passam a ter uma razão para entrar.",competencias:"Fazer uma pergunta e esperar pela resposta é uma competência rara.",transicao:"Gravar, editar e conduzir uma entrevista é competência que se mostra — e que se põe num currículo.",diversidade:"Cada programa é outro tema e outro convidado — nunca é a mesma coisa."},
 estudo:{escolar:"Ataca a coisa diretamente, em vez de esperar que a escola resolva.",competencias:"Explicar a alguém é a melhor forma de aprender.",motivacao:"Notas a subir é a motivação mais concreta que existe.",participacao:"Os mais velhos passam a ter um papel, não só um lugar."},
 horta:{energia:"Cavar, regar, carregar. É trabalho de corpo, ao ar livre.",telemovel:"Mãos na terra. Ninguém pega no telemóvel com as mãos assim — e ninguém teve de o pedir.",espaco:"Recupera metros quadrados que estão a apodrecer.",motivacao:"Uma planta que morre se ninguém regar é a responsabilidade mais clara que há.",regras:"Quem rega em que dia — por escrito. Não há como discutir.",comunidade:"Uma horta atrai vizinhos que nunca entrariam.",fechados:"Ninguém acha que vai gostar. Todos gostam.",competencias:"Uma horta partilhada só dá se a rega e as tarefas forem divididas — dependes de quem rega no dia em que não vais.",diversidade:"Mexer na terra não é o costume nestes espaços. Para quem só conhece consola e sofá, já é sair da caixa."},
 mural:{espaco:"Transforma uma parede morta na cara do espaço.",participacao:"A parede é grande e pinta-se a muitas mãos — entra a marca de cada um, não só a dos do costume.",competencias:"Escrever para ser lido por estranhos é diferente de escrever para o professor.",motivacao:"A ideia do que se pinta é decidida por eles, não pelo adulto.",comunidade:"Quem passa à porta lê. É a montra do espaço.",diversidade:"Pintar uma parede inteira não é o costume nestes espaços — é das coisas mais fora da caixa que ali se fazem."},
 cozinha:{energia:"Ninguém cozinha sentado — anda-se de um lado para o outro a sessão inteira.",telemovel:"Não se cozinha com um telemóvel na mão. As mãos estão sujas, e isso resolve o problema sem uma única regra.",conflitos:"Dividir tarefas num tacho é gerir um conflito de meia em meia hora — cortar, medir, mexer, e quem faz o quê.",emocional:"Ninguém sai de uma cozinha zangado. Ter as mãos ocupadas e uma tarefa concreta baixa a fervura sem obrigar ninguém a falar do que sente.",diversidade:"Cozinha-se sempre uma coisa diferente.",participacao:"Cada um tem uma tarefa: cortar, medir, mexer. Ninguém fica de fora.",fechados:"Ninguém recusa comida.",competencias:"Matemática, organização, divisão de tarefas — tudo à volta de um tacho.",regras:"Uma receita faz-se por ordem, e a sessão só acaba com a cozinha limpa. Seguir passos e arrumar no fim é o próprio treino de regras.",transicao:"Cozinhar a sério é um ofício com saída — restauração, catering. Para quem não sabe o que quer a seguir, é uma porta concreta."},
 forum:{emocional:"Vê-se o próprio conflito de fora, em cena, sem estar lá dentro a ferver.",energia:"Entra-se em cena, levanta-se, discute-se de pé. Não é teatro de plateia.",telemovel:"Quem está em cena não está no ecrã. E quem está na plateia também não, porque a qualquer momento pode ser chamado.",conflitos:"Encena-se o conflito real e o público entra em cena para o mudar.",competencias:"Pôr-se no lugar do outro, literalmente.",participacao:"O público não assiste: interrompe e substitui.",regras:"Testam-se regras em cena, sem consequências reais.",diversidade:"É teatro. Não se parece com nada do que lá se faz.",motivacao:"Ver o próprio problema no palco é difícil de ignorar.",fechados:"Ninguém acha que vai gostar de fazer teatro. Entram para ver os outros e acabam em cena antes de dar por isso."},
 danca:{energia:"Uma hora de corpo a mexer. Quem não pára sentado, aqui não tem de parar.",telemovel:"O corpo ocupado é a única coisa que compete com o ecrã sem ser um ecrã.",motivacao:"Uma data de apresentação marcada muda tudo. Faltar tem custo.",diversidade:"Traz uma linguagem que a escola não tem.",participacao:"Todos entram na coreografia — ou simplifica-se até que entrem.",fechados:"É a atividade que mais gente diz que não vai fazer. E depois faz.",regras:"Ensaio à hora marcada. Quem falta, sabe o que perde.",competencias:"Corpo, memória, sincronia com os outros.",transicao:"Descobrir aqui que se leva jeito para dançar ou tocar pode ser o princípio de um caminho — há quem viva disso."},
 mostra:{energia:"Montar, carregar, mostrar. Passa-se o dia a pé.",comunidade:"É o dia em que o bairro entra e vê o que lá se faz.",familias:"As famílias vêm porque os filhos estão a mostrar alguma coisa.",espaco:"Obriga a arrumar e a olhar para o espaço com olhos de fora.",participacao:"Cada um mostra o seu. Ninguém vem só assistir.",diversidade:"Junta tudo o que se fez o ano todo, num sítio só.",motivacao:"Ter público muda a forma como se trabalha nas semanas antes.",competencias:"Preparar a mostra é dividir tarefas e depender uns dos outros durante semanas — quem falha, falha à frente de toda a gente."},
 tabuleiro:{emocional:"Esperar pela vez e perder à frente dos outros — em pequeno formato, todas as semanas.",conflitos:"Perder é a origem de metade dos conflitos. Aqui treina-se a perder.",competencias:"Turnos, regras, esperar pela vez. É tudo o que falta.",participacao:"Num jogo de turnos joga toda a gente por igual — a vez chega a quem normalmente fica de fora.",regras:"Um jogo é um sistema de regras. Não há como discutir com elas.",fechados:"Senta-se um a jogar sozinho e ao fim de dez minutos há quatro.",telemovel:"É a única coisa que consegue competir com o ecrã sem ser um ecrã."},
 reparar:{telemovel:"Duas mãos num motor não seguram um telemóvel. O ecrã perde por falta de mãos.",espaco:"O que está partido passa a ser reparado em vez de deitado fora.",diversidade:"Trabalho com as mãos, que já não se faz em lado nenhum.",transicao:"É uma competência técnica que dá trabalho a sério.",fechados:"Trazem uma coisa partida deles. Já entraram sem dar por isso.",competencias:"Paciência, método, e aceitar que à primeira não sai.",comunidade:"O bairro traz o que está partido. E fica a conversar."},
 foto:{digital:"Editar, legendar, expor — competências reais.",transicao:"Editar fotografias e montar uma exposição é uma competência que se mostra — e mostra-se a quem contrata.",comunidade:"Obriga-os a olhar para o bairro e a falar com quem lá está.",motivacao:"Escolhem eles o que vale a pena fotografar e como veem o bairro. Deixa de ser o adulto a dizer o que interessa.",participacao:"Cada um dispara o seu olhar; na exposição estão as fotos de todos, não só as dos do costume.",telemovel:"A câmara que já têm no bolso passa a ter uma função.",espaco:"A exposição transforma a entrada do espaço.",diversidade:"Cada roteiro é um tema novo.",fechados:"Já andam a tirar fotos no telemóvel o dia todo. Não lhes pede uma coisa nova — pede a mesma, com outro olhar."},
 carreira:{transicao:"É o que o programa promete e quase nunca faz: preparar a saída.",digital:"CV, email, candidatura online. Nada disto se aprende sozinho.",competencias:"Simular uma entrevista a sério, com feedback, muda tudo.",escolar:"Perceber para que serve a escola é a única coisa que faz voltar lá.",motivacao:"Um contrato possível é a motivação mais forte que existe."}
};

const META_FREQ=[
 {id:'mensal',n:"Uma vez por mês",mes:1},
 {id:'quinzenal',n:"De quinze em quinze dias",mes:2},
 {id:'semanal',n:"Uma vez por semana",mes:4},
 {id:'bissemanal',n:"Duas vezes por semana",mes:8},
 {id:'trissemanal',n:"Três vezes por semana",mes:12},
 {id:'diario',n:"Todos os dias",mes:20}
];
const META_GRUPO=[
 {id:'micro',n:"Um grupo muito pequeno — 2 a 5",min:2,max:5},
 {id:'pequeno',n:"Um grupo pequeno — 6 a 10",min:6,max:10},
 {id:'grande',n:"Um grupo grande — 11 a 20",min:11,max:20},
 {id:'muitos',n:"Mais de 20",min:21,max:35},
 {id:'todos',n:"O espaço todo, e quem quiser entrar",min:15,max:40}
];
const META_DUR=[
 {id:'2sem',n:"Duas semanas",meses:0.5},
 {id:'1mes',n:"Um mês",meses:1},
 {id:'verao',n:"Até ao verão — três meses",meses:3},
 {id:'6meses',n:"Seis meses",meses:6},
 {id:'ano',n:"O ano letivo todo",meses:9},
 {id:'sozinho',n:"Não acaba — fica a funcionar sem mim",meses:12}
];

const INDICADORES=[
 {id:'frequencia',tipo:'conta',n:"Quantos aparecem, e se continuam a aparecer ao longo dos meses",d:"Diz-te se o projeto agarrou, ou se encheu ao início e foi definhando."},
 {id:'novos',tipo:'conta',n:"Quantas caras novas, que nunca vinham",d:"Diz-te se chegaste a quem não chegavas."},
 {id:'envolvimento',tipo:'conta',n:"Quanto parte deles — propostas, iniciativa, virem ter contigo",d:"Diz-te se se envolveram, ou se só apareceram e assistiram."},
 {id:'autonomia',tipo:'vê',n:"Se a sessão acontece nos dias em que tu faltas",d:"Diz-te se o projeto é deles ou se é o teu horário."},
 {id:'competencias',tipo:'vê',n:"O que cada um sabe fazer agora e não sabia antes",d:"Uma competência técnica concreta, vista ao início e ao fim."},
 {id:'pessoais',tipo:'conta',n:"Se as chatices se resolvem com menos gritos — conflitos a menos",d:"Diz-te se estão a aprender a estar com os outros."},
 {id:'ecra',tipo:'conta',n:"Quantos telemóveis à vista aos 10 minutos e aos 40",d:"A diferença entre os dois números diz-te se largaram o ecrã."},
 {id:'escola',tipo:'conta',n:"As faltas e as notas de três deles, no início e no fim",d:"O dado mais difícil de arranjar e o mais forte de todos."},
 {id:'palavradeles',tipo:'ouve',n:"O que eles próprios dizem que mudou, nas palavras deles",d:"Qualitativo: as respostas em bruto, sem as arrumar. É avaliação a sério."},
 {id:'equipa',tipo:'ouve',n:"O que as famílias e a equipa do espaço notaram de diferente",d:"Qualitativo, e o mais fácil de recolher — quem está à volta repara."}
];

const NEEDS={
 energia:{n:"Têm energia a mais",d:"Sobra-lhes corpo e vontade e não há onde os gastar. Precisam de se mexer e de se envolver — quando há atividade a sério, a energia tem para onde ir."},
 emocional:{n:"Explodem ou fecham-se",d:"Não sabem o que fazer ao que sentem: ou rebentam, ou desaparecem, ou não conseguem dizer o que se passa. É com eles próprios."},
 telemovel:{n:"Isolam-se cada um no seu telemóvel",d:"Estão na mesma sala, cada um no seu ecrã, sem falar uns com os outros. É fuga e isolamento, não é falta de jeito."},
 consola:{n:"A consola engole o espaço",d:"A PlayStation está sempre ocupada pelos mesmos, e o resto do espaço fica vazio à volta dela."},
 regras:{n:"Não cumprem regras nem horários",d:"Entram, saem, não arrumam, não avisam."},
 fechados:{n:"Dizem «não» a tudo o que é novo",d:"Querem estar sempre a fazer o mesmo. A tudo o que não conhecem, a resposta é «não» antes de experimentar."},
 conflitos:{n:"Discutem por tudo",d:"Zangam-se aos gritos e resolve-se à força."},
 motivacao:{n:"Não os deixam decidir nada",d:"Quase tudo o que se faz no espaço é decidido por adultos. São informados, não envolvidos — e sentem-no."},
 diversidade:{n:"É sempre a mesma coisa",d:"As atividades não mudam nem saem do costume — é sempre o mesmo (consola, sofá, ping-pong), e quase tudo para a mesma idade. Falta coisa fora da caixa."},
 competencias:{n:"Não sabem estar com os outros",d:"Respeitar, esperar a vez, dividir uma tarefa, falar com um adulto, pedir ajuda sem ser à bruta. É a competência social que mais falta aos mais novos."},
 familias:{n:"As famílias estão de fora",d:"Deixam os miúdos à porta e ficam-se por aí — pouco envolvidas, pouco interessadas no que se passa lá dentro. Não há ponte entre a casa e o espaço."},
 escolar:{n:"A escola corre-lhes mal",d:"Faltas, chumbos, participações. Ou simplesmente detestam a escola e dizem-no."},
 participacao:{n:"Mandam sempre os mesmos",d:"Há um grupo que decide tudo, e o resto vai atrás ou fica de fora. É entre eles, não é dos adultos."},
 transicao:{n:"Não sabem o que querem a seguir",d:"Não têm um objetivo — ou têm um plano que não bate certo com nada do que fazem agora."},
 digital:{n:"Não usam a tecnologia para nada útil",d:"Vivem no TikTok e nas redes, mas não sabem fazer um CV, mandar um email com anexo, nem preencher um formulário online. Sabem consumir, não sabem resolver."},
 espaco:{n:"O espaço não chega para o que é preciso",d:"Degradado ou mal aproveitado: não há zona exterior, não há sala fechada, não há onde fazer metade das coisas."},
 comunidade:{n:"O bairro não sabe que existem",d:"Ninguém lá fora conhece o espaço, e não se faz trabalho com ninguém da comunidade."},
 rh:{n:"Falta gente com formação na equipa",d:"Não há quem faça o acompanhamento mais fino."}
};

const TRUNFOS=[
 {id:'percurso',n:"És do bairro",d:"Cresceste aqui. Acreditam em ti mais depressa do que em quem vem de fora.",b:{alcance:8,sust:4},dm:['D6','D1']},
 {id:'academico',n:"Percurso formativo",d:"Curso ou formação na área. Sabes preparar uma sessão e explicar porque a fizeste assim.",b:{qualidade:10},dm:['D6']},
 {id:'profissional',n:"Hábitos de trabalho",d:"Cumpres horários, avisas quando faltas, entregas no prazo. Fazes isso sem ninguém andar atrás de ti.",b:{sust:7,qualidade:5},dm:['D3','D6']},
 {id:'cuidar',n:"Já cuidei de alguém",d:"Irmãos, avós, filhos. Aguentas quem está mal sem entrar em pânico nem fugir.",b:{qualidade:8,aprend:3},dm:['D2','D6']},
 {id:'digital',n:"Competências digitais",d:"Cartazes, edição, redes, Excel. Fazes tu, e depressa.",b:{alcance:10},dm:['D5']},
 {id:'lider',n:"Comunicação e liderança",d:"Pões um grupo a ouvir-te sem levantar a voz. Serve para tudo o que se faz com mais de cinco pessoas.",b:{qualidade:6,alcance:5},dm:['D1']},
 {id:'escuta',n:"Escuta",d:"As pessoas contam-te coisas. Serve para perceber o que se passa antes de rebentar.",b:{qualidade:9,aprend:3},dm:['D4','D1']},
 {id:'paciencia',n:"Paciência",d:"Repetes vinte vezes sem te chatear. Serve para o que demora meses a dar fruto.",b:{qualidade:8,aprend:4},dm:['D2']},
 {id:'desporto',n:"Desporto",d:"Jogas, treinas, organizas. O corpo é o teu material.",b:{alcance:7,aprend:4},dm:['D6','D3']},
 {id:'arte',n:"Desenho, pintura ou escrita",d:"Sabes fazer com as mãos e com as palavras: um cartaz, um texto, um mural.",b:{qualidade:6,aprend:5},dm:['D6']},
 {id:'musicaarte',n:"Música ou dança",d:"Tocas, cantas ou danças. Consegues pôr um grupo a fazer o mesmo.",b:{qualidade:6,alcance:5},dm:['D6']},
 {id:'gaming',n:"Percebes de jogos e consolas",d:"Falas a língua deles. Vale mais do que parece.",b:{alcance:8,qualidade:3},dm:['D1','D6']},
 {id:'organizado',n:"Organização",d:"Cumpres prazos e não perdes papéis. Serve para tudo o que tem inscrições, turnos ou datas.",b:{sust:11},dm:['D3']},
 {id:'redes',n:"Conheces os recursos da comunidade",d:"Sabes que associações, lojas e serviços existem aqui, e a quem pedir uma sala, uma carrinha ou material.",b:{sust:8,alcance:5},dm:['D1']},
 {id:'linguas',n:"Falas outra língua",d:"Crioulo, inglês, ou outra. Traduzes numa reunião, explicas a uma família, e podes ensiná-la a quem quiser.",b:{alcance:6,sust:5},dm:['D1','D6']},
 {id:'criatividade',n:"Criatividade",d:"Arranjas maneira com o que há. Quando o plano falha, tens outro em cinco minutos.",b:{qualidade:6,aprend:5},dm:['D6']},
 {id:'humor',n:"Humor",d:"Desarmas uma discussão com uma piada. Serve para segurar um grupo difícil.",b:{alcance:5,qualidade:5},dm:['D2','D1']},
 {id:'cozinha',n:"Cozinha",d:"Ninguém sai de uma cozinha zangado. É uma ferramenta a sério.",b:{alcance:6,qualidade:4},dm:['D6','D1']},
 {id:'maos',n:"Trabalho manual",d:"Pintas, arranjas, montas. Fazes com o que há.",b:{qualidade:6,sust:5},dm:['D3','D6']}
];
const LIMITES=[
 {id:'timidez',n:"Timidez",d:"Falar para um grupo gela-me. Adultos ou miúdos, é igual.",b:{alcance:-9},dm:['D1']},
 {id:'experiencia',n:"Inexperiência",d:"É a primeira vez. Não sei sequer o que não sei.",b:{qualidade:-9},dm:['D6']},
 {id:'autoridade',n:"Não me imponho ao grupo",d:"Digo para pararem e continuam. Quando é preciso exigir, acabo por ceder.",b:{qualidade:-6,alcance:-4},dm:['D1','D6']},
 {id:'escrita',n:"Custa-me escrever e relatar",d:"Faço bem, mas não sei contar por escrito o que fiz.",b:{sust:-9},dm:['D5']},
 {id:'frustracao',n:"Desanimo depressa",d:"Começo a cem por hora. Ao segundo mês já não me apetece, e nota-se.",b:{aprend:-6,qualidade:-4},dm:['D2']},
 {id:'calma',n:"Perco a calma",d:"Quando me chateiam a sério, levanto a voz. Já aconteceu.",b:{qualidade:-8,alcance:-3},dm:['D2','D6']},
 {id:'foco',n:"Deixo coisas a meio",d:"Tenho cinco coisas abertas ao mesmo tempo e não fecho nenhuma.",b:{sust:-9,qualidade:-3},dm:['D3']},
 {id:'atraso',n:"Desorganização",d:"Chego atrasado, esqueço-me do que combinei, entrego em cima da hora. Nunca é grave — mas é comum.",b:{sust:-6,qualidade:-4},dm:['D3']},
 {id:'pedir',n:"Faço tudo sozinho para não pedir",d:"Prefiro fazer sozinho, mesmo que saia pior, a ter de pedir ajuda. Quando precisares de parceiros, não vais bater à porta.",b:{alcance:-5,sust:-5},dm:['D4','D1']},
 {id:'dizernao',n:"Digo que sim a tudo",d:"Aceito tudo o que me pedem. Ao fim de um mês faço o trabalho dos outros e o meu projeto está parado.",b:{qualidade:-6,sust:-4},dm:['D1','D4']},
 {id:'conflito',n:"Engulo o que penso",d:"Tenho opinião, mas se sei que vai dar discussão, guardo-a. Depois fico a remoer.",b:{qualidade:-8,aprend:-3},dm:['D6','D2']},
 {id:'levo',n:"Não consigo desligar",d:"Levo os problemas deles para casa e fico a pensar naquilo à noite. Não sei separar o trabalho da minha vida.",b:{aprend:-4,sust:-6},dm:['D2','D4']},

 {id:'comparo',n:"Quero tudo perfeito",d:"Perco tempo em pormenores que ninguém nota. E às vezes nem começo, com medo de não ficar bem.",b:{qualidade:-5,alcance:-5},dm:['D4']},
 {id:'improviso',n:"Falta-me imaginação quando o plano falha",d:"Se o plano falha, fico sem chão. Preciso que corra como pensei.",b:{qualidade:-7,aprend:-3},dm:['D2','D6']},
 {id:'digitalbaixo',n:"Custa-me o que é digital",d:"Excel, cartazes, editar um vídeo. Tudo me custa o dobro.",b:{alcance:-7,sust:-3},dm:['D5']},
 {id:'amigo',n:"Sou demasiado amigo deles",d:"Dou-me tão bem com eles que depois não consigo exigir nada nem dizer que não. Fico sem lugar de onde falar.",b:{qualidade:-7,sust:-4},dm:['D1']}
];

const PROJETOS=[
 {id:'consolatorneio',n:"Torneio de consola",d:"Inscrições, equipas e calendário. Usa a consola como isco para pôr a jogar em conjunto quem só joga sozinho.",tags:['consola','conflitos','regras'],tags2:['telemovel','participacao','competencias','fechados','motivacao'],
  passos:[["Escrever as regras do torneio com eles",'preparacao'],["Arranjar comandos, cabos e um ecrã",'materiais'],["Pedir emprestado material a quem tenha",'parceiros'],["Afixar o quadro de jogos à entrada",'divulgacao'],["Marcar os resultados jogo a jogo",'registo'],["Preparar o calendário e os turnos",'preparacao']]},
 {id:'criadores',n:"De consumidores a criadores",d:"Filmam e editam coisas do espaço: uma reportagem, um tutorial, a apresentação de um projeto deles. Fica publicado numa conta do espaço.",tags:['telemovel', 'digital', 'transicao', 'consola'],tags2:['participacao', 'motivacao', 'fechados', 'competencias', 'diversidade'],
  passos:[["Aprender e ensinar a filmar e editar com o que já têm",'preparacao'],["Decidir com eles o que vai ser publicado",'preparacao'],["Arranjar tripé, luz e um computador",'materiais'],["Lançar a conta e publicar o primeiro vídeo",'divulgacao'],["Trazer alguém que trabalhe nisto a sério",'parceiros'],["Guardar tudo o que produziram — é portefólio",'registo']]},
 {id:'cinema',n:"Cinema com debate",d:"Sessões seguidas de conversa sobre temas que ninguém aborda.",tags:['fechados', 'diversidade', 'conflitos'],tags2:['competencias', 'motivacao', 'emocional'],
  passos:[["Escolher os filmes e preparar as perguntas do debate",'preparacao'],["Pedir projetor e sala emprestados",'parceiros'],["Fazer cartazes e passar a palavra",'divulgacao'],["Comprar pipocas e tratar da sala",'materiais'],["Deixar que sejam eles a escolher o próximo filme",'preparacao'],["Fotografar cada sessão e registar quem veio",'registo']]},
 {id:'torneio',n:"Torneio desportivo entre polos",d:"Desporto entre equipamentos, com equipas mistas de propósito.",tags:['energia','motivacao', 'comunidade', 'conflitos'],tags2:['emocional','telemovel','regras', 'participacao', 'fechados', 'competencias'],
  passos:[["Combinar datas com os outros equipamentos",'parceiros'],["Formar as equipas — misturadas de propósito",'preparacao'],["Arranjar coletes, bolas e um apito",'materiais'],["Fazer o cartaz e as inscrições",'divulgacao'],["Escrever as regras com eles, antes de jogar",'preparacao'],["Registar resultados, fotos e presenças",'registo']]},
 {id:'radio',n:"Rádio ou podcast do bairro",d:"Os miúdos entrevistam quem vive no bairro e gravam. Obriga a preparar perguntas e a ouvir a resposta até ao fim.",tags:['digital','comunidade','participacao','telemovel'],tags2:['competencias','familias','transicao','motivacao','diversidade'],
  passos:[["Preparar as perguntas e ensinar a ouvir",'preparacao'],["Arranjar um microfone e um sítio silencioso",'materiais'],["Escolher com eles quem vai ser entrevistado",'preparacao'],["Publicar e divulgar o primeiro episódio",'divulgacao'],["Pedir à junta ou à biblioteca para acolher a gravação",'parceiros'],["Guardar os episódios e contar quem ouviu",'registo']]},
 {id:'estudo',n:"Apoio ao estudo entre pares",d:"Os mais velhos explicam aos mais novos. Turnos fixos.",tags:['escolar', 'competencias', 'participacao'],tags2:['motivacao'],
  passos:[["Identificar quem precisa e quem pode ajudar",'preparacao'],["Montar a escala de turnos fixos",'preparacao'],["Falar com a escola para saber as dificuldades reais",'parceiros'],["Arranjar mesas, cadernos e um computador",'materiais'],["Avisar as famílias que isto existe",'divulgacao'],["Registar presenças e notas antes e depois",'registo']]},
 {id:'horta',n:"Horta ou espaço exterior",d:"Recuperar um pedaço de terreno e mantê-lo. O que se planta morre se ninguém voltar, e isso obriga a uma rotina.",tags:['espaco', 'regras', 'comunidade'],tags2:['energia','telemovel','motivacao', 'fechados', 'competencias', 'diversidade'],
  passos:[["Limpar o terreno e ver o que dá para aproveitar",'preparacao'],["Arranjar terra, sementes e ferramentas",'materiais'],["Pedir apoio a uma associação ou à junta",'parceiros'],["Definir quem rega em que dia — por escrito",'preparacao'],["Convidar as famílias para o primeiro dia",'divulgacao'],["Fotografar de mês a mês, para se ver a diferença",'registo']]},
 {id:'jornal',n:"Jornal de parede",d:"Um jornal feito por eles e afixado à entrada: o que se passou no mês, entrevistas, o que querem mudar. Sai todos os meses.",tags:['participacao','motivacao','digital'],tags2:['competencias','comunidade','escolar','diversidade'],
  passos:[["Decidir com eles o que entra em cada número",'preparacao'],["Arranjar papel, tinta e um sítio para afixar",'materiais'],["Combinar com a escola ou a junta para distribuir",'parceiros'],["Afixar à entrada e avisar que já saiu",'divulgacao'],["Guardar um exemplar de cada número",'registo'],["Escrever e rever os textos com eles",'preparacao']]},
 {id:'artes',n:"Oficina de artes manuais",d:"Trabalhar com as mãos: barro, madeira, costura, colagem. Sai uma coisa feita por eles ao fim de cada sessão.",tags:['diversidade','emocional','telemovel'],tags2:['competencias','fechados','participacao','energia','motivacao','transicao'],
  passos:[["Escolher com eles o que se vai fazer",'preparacao'],["Arranjar materiais e ferramentas",'materiais'],["Pedir sobras a uma loja ou oficina do bairro",'parceiros'],["Expor à entrada o que foi feito",'divulgacao'],["Fotografar cada peça e quem a fez",'registo'],["Preparar cada sessão com o material contado",'preparacao']]},
 {id:'mural',n:"Mural pintado por eles",d:"Uma parede grande pintada por eles, com uma ideia decidida em conjunto. Fica lá durante anos.",tags:['espaco', 'participacao', 'comunidade'],tags2:['competencias', 'motivacao', 'diversidade'],
  passos:[["Decidir com eles o que vai lá estar",'preparacao'],["Arranjar tintas, papel e pincéis",'materiais'],["Pedir autorização a quem é dono da parede",'parceiros'],["Fazer a inauguração e chamar gente",'divulgacao'],["Definir quem atualiza e com que frequência",'preparacao'],["Fotografar cada versão do mural",'registo']]},
 {id:'cozinha',n:"Oficina de cozinha",d:"Cozinhar juntos, do início à limpeza: dividir tarefas, esperar pela vez, comer o que fizeram. Sem famílias, sem público.",tags:['competencias','conflitos','telemovel'],tags2:['energia','participacao','fechados','diversidade','emocional','regras','transicao'],
  passos:[["Combinar o que se cozinha com eles",'preparacao'],["Arranjar cozinha, tachos e ingredientes",'materiais'],["Combinar com uma instituição que tenha cozinha",'parceiros'],["Afixar o menu da semana à entrada",'divulgacao'],["Escrever as receitas que saíram dali",'preparacao'],["Fotografar os pratos e contar quem veio",'registo']]},
 {id:'jantar',n:"Jantar comunitário",d:"Eles cozinham e recebem à mesa as famílias e quem vive no bairro. Cada um traz um prato de casa e a história dele.",tags:['familias','comunidade','diversidade'],tags2:['competencias','fechados','participacao','conflitos','motivacao'],
  passos:[["Convidar as famílias, uma a uma, cara a cara",'preparacao'],["Arranjar mesas, loiça e ingredientes",'materiais'],["Combinar com uma instituição que tenha cozinha",'parceiros'],["Fazer o convite e afixá-lo à entrada",'divulgacao'],["Recolher as receitas e as histórias por escrito",'preparacao'],["Fotografar a mesa e contar quem veio",'registo']]},
 {id:'forum',n:"Teatro-fórum sobre conflitos",d:"Encena-se um conflito que aconteceu mesmo ali, e quem está a ver entra em cena para o mudar. Vem do Teatro do Oprimido.",tags:['conflitos', 'competencias', 'participacao'],tags2:['emocional','energia','telemovel','regras', 'diversidade', 'motivacao', 'fechados'],
  passos:[["Recolher com eles conflitos reais do espaço",'preparacao'],["Ensaiar as cenas — sem final decidido",'preparacao'],["Arranjar um sítio com público e cadeiras",'parceiros'],["Improvisar cenário e adereços",'materiais'],["Convidar outras turmas ou outros polos",'divulgacao'],["Registar o que o público propôs mudar",'registo']]},
 {id:'danca',n:"Grupo de dança ou música",d:"Ensaios fixos e uma apresentação com data marcada.",tags:['energia','motivacao', 'diversidade', 'fechados'],tags2:['telemovel','competencias', 'regras', 'participacao', 'transicao'],
  passos:[["Marcar os ensaios e preparar a coreografia",'preparacao'],["Arranjar som, espelho e um espaço livre",'materiais'],["Marcar a apresentação com uma data a sério",'preparacao'],["Fazer o cartaz e encher a sala",'divulgacao'],["Pedir palco a uma escola ou junta",'parceiros'],["Filmar os ensaios e a apresentação",'registo']]},
 {id:'mostra',n:"Mostra de bairro",d:"Um dia em que o espaço abre à rua. São eles que decidem o que mostrar, e preparam-no durante semanas.",tags:['comunidade','participacao','espaco'],tags2:['energia','motivacao','diversidade','familias','competencias'],
  passos:[["Decidir o que vai ser mostrado, e por quem",'preparacao'],["Convidar parceiros, escolas e associações",'parceiros'],["Arranjar mesas, cadeiras e som",'materiais'],["Fazer cartazes e passar de porta em porta",'divulgacao'],["Ensaiar o dia todo, hora a hora",'preparacao'],["Contar quantos vieram e fotografar tudo",'registo']]},
 {id:'tabuleiro',n:"Clube de jogos de tabuleiro",d:"Jogos de mesa a sério: regras, esperar a vez, e perder sem virar a mesa.",tags:['telemovel', 'conflitos', 'regras'],tags2:['emocional','competencias', 'fechados', 'participacao'],
  passos:[["Aprender os jogos antes de os ensinar",'preparacao'],["Arranjar jogos — pedidos, doados ou feitos",'materiais'],["Escrever com eles as regras do clube",'preparacao'],["Pôr um aviso à entrada e convidar os do costume",'divulgacao'],["Pedir jogos emprestados à biblioteca",'parceiros'],["Registar quem vem e o que mudou nos conflitos",'registo']]},
 {id:'reparar',n:"Oficina de reparação",d:"Bicicletas, móveis, o que estiver partido. Repara-se em vez de deitar fora.",tags:['espaco', 'diversidade', 'transicao'],tags2:['telemovel','competencias', 'fechados', 'comunidade'],
  passos:[["Aprender a reparar antes de abrir a oficina",'preparacao'],["Juntar ferramentas e um sítio com bancada",'materiais'],["Encontrar quem saiba e queira ensinar",'parceiros'],["Divulgar: «traz o que está partido»",'divulgacao'],["Fazer uma lista do que já foi reparado",'registo'],["Ensinar um deles a orientar a oficina sozinho",'preparacao']]},
 {id:'foto',n:"Roteiro fotográfico do bairro",d:"Fotografam o bairro como o veem, e faz-se uma exposição na entrada. Serve para olharem de outra maneira para o sítio onde vivem.",tags:['telemovel', 'digital', 'comunidade'],tags2:['participacao', 'espaco', 'diversidade', 'transicao', 'motivacao', 'fechados'],
  passos:[["Preparar o tema e ensinar a fotografar com o telemóvel",'preparacao'],["Escolher com eles o que vale a pena fotografar",'preparacao'],["Imprimir as fotos e montar a exposição",'materiais'],["Pedir uma parede a alguém do bairro",'parceiros'],["Fazer a inauguração e convidar os retratados",'divulgacao'],["Guardar o arquivo e as legendas escritas por eles",'registo']]},
 {id:'carreira',n:"Sessões de emprego e direitos",d:"CV, entrevistas, contratos, o que é um recibo. Coisas que ninguém ensina.",tags:['transicao', 'escolar', 'digital'],tags2:['competencias', 'motivacao'],
  passos:[["Preparar as sessões: CV, entrevista, contrato",'preparacao'],["Trazer alguém do IEFP ou de uma empresa",'parceiros'],["Arranjar computadores para fazerem o CV ali",'materiais'],["Divulgar entre os que estão parados",'divulgacao'],["Simular entrevistas a sério, com feedback",'preparacao'],["Registar quantos ficaram com CV feito",'registo']]},
  {id:'jogosativos',n:"Jogos de movimento e cooperação",d:"Estafetas, jogos de equipa, desafios de confiança. Gasta energia e obriga a trabalhar com quem calhar, não só com os amigos.",tags:['energia','telemovel','conflitos'],tags2:['emocional','motivacao','regras','participacao','competencias','fechados'],
  passos:[["Aprender e saber explicar de cor 3-4 jogos",'preparacao'],["Preparar materiais simples (coletes, cordas, garrafas)",'materiais'],["Definir as regras e um debriefing final com eles",'preparacao'],["Marcar e afixar os dias dos jogos",'divulgacao'],["Pedir apoio a um técnico nas primeiras sessões",'parceiros'],["Registar quem veio e o que mudou nos conflitos",'registo']]},
 {id:'socioemocional',n:"Rodas de conversa e debate",d:"Conversas curtas a partir de um vídeo, uma notícia ou um caso. Falam do que os chateia e treinam discordar sem ser à bruta.",tags:['emocional','competencias','conflitos'],tags2:['participacao','motivacao','escolar','familias','fechados','diversidade'],
  passos:[["Escolher com eles os temas de que se vai falar",'preparacao'],["Arranjar vídeos, notícias e casos para abrir a conversa",'materiais'],["Combinar as regras do debate: falar à vez, não gozar",'preparacao'],["Avisar que aquela meia hora não se interrompe",'divulgacao'],["Convidar alguém de fora para um debate",'parceiros'],["Apontar os temas que saíram e o que ficou por falar",'registo']]},
 {id:'imagem',n:"Oficina de imagem",d:"Aprender a cortar cabelo, pintar unhas, cuidar da pele. Trabalha-se dois a dois, com as mãos ocupadas — e é aí que aparecem as conversas a sério.",tags:['transicao','fechados','motivacao'],tags2:['participacao','competencias','diversidade','emocional','telemovel'],
  passos:[["Aprender o básico ou preparar com quem saiba",'preparacao'],["Arranjar tesouras, kit de unhas, espelho, toalhas",'materiais'],["Combinar com um cabeleireiro/profissional do bairro",'parceiros'],["Marcar os dias e convidar sobretudo os mais velhos",'divulgacao'],["Definir higiene e regras de segurança com eles",'preparacao'],["Registar quem participou e o que aprendeu a fazer",'registo']]},
 {id:'maisvelhos',n:"Grupo dos mais velhos",d:"Um horário só para eles, com regras e programa decididos por eles. Para quem já acha que aquilo é para crianças e deixou de aparecer.",tags:['transicao','motivacao'],tags2:['fechados','competencias','comunidade','diversidade'],
  passos:[["Falar um a um com os mais velhos para saber o que querem",'preparacao'],["Deixá-los definir as regras e o nome do clube",'preparacao'],["Arranjar um espaço/horário só para eles",'parceiros'],["Divulgar entre os que já não aparecem",'divulgacao'],["Arranjar o material do que eles decidirem fazer",'materiais'],["Registar o que decidiram e a adesão",'registo']]},
 {id:'musica',n:"Estúdio no telemóvel — beats e temas",d:"Fazer música com o que já têm no bolso: beats, letras, gravação e capa. Hoje faz-se num telemóvel e com ferramentas gratuitas — não é preciso estúdio nem dinheiro.",tags:['digital','telemovel','motivacao'],tags2:['fechados','participacao','transicao','competencias','emocional','diversidade','energia'],
  passos:[["Ouvir o que eles já ouvem e o que já andam a fazer no telemóvel",'preparacao'],["Arranjar auscultadores, um telemóvel decente e as apps gratuitas",'materiais'],["Combinar as regras da letra: o que se pode dizer e o que não",'preparacao'],["Mostrar o primeiro tema a quem ainda não vem",'divulgacao'],["Pedir a alguém que produza a sério para ouvir e dar notas",'parceiros'],["Registar os temas feitos e quem participou em cada um",'registo']]}
];

const EV_PROJ={
 musica:{k:"Semana 5",h:"A letra nomeia alguém do bairro",dim:"D5",p:"O tema está quase pronto, e é bom. Só que a letra ameaça e insulta uma pessoa concreta do bairro, com nome. Eles querem publicar hoje.",swot:"Conteúdo produzido pelos participantes com risco de exposição e de conflito real.",c:[
  {t:"Proibir o tema e apagar a gravação, antes que se espalhe.",e:{alcance:-10,qualidade:-3},o:"Acabou o risco — e acabou a confiança. Deixaram de te mostrar o que escrevem."},
  {t:"Publicar. A letra é deles, não sou eu que os censuro.",e:{qualidade:-12,sust:-6},o:"Publicou-se. A resposta veio do bairro nessa noite, e não foi com uma letra."},
  {t:"Reescrever com ele a parte que aponta a alguém. Vai achar que é censura.",e:{qualidade:11,aprend:10,alcance:5},o:"O que ele queria dizer continuou lá. O nome é que saiu. Ficou melhor tema do que era."},
  {t:"Levar ao grupo. A regra fica escrita por eles, mas perdes a sessão.",reqT:'escuta',e:{qualidade:12,sust:9,aprend:8},fail:{qualidade:-4},o:"Discutiram e escreveram a regra deles. Passou a haver linha vermelha — posta por eles, não por ti.",of:"A conversa fugiu-te das mãos e virou discussão sobre quem tem razão no bairro."}]},
 jogosativos:{k:"Semana 4",h:"Uma equipa começa a perder e o jogo descamba",dim:"D6",p:"A meio do «{P}», a equipa que está a perder começa aos empurrões e a acusar de batota. Está a descarrilar à tua frente.",swot:"Jogos competitivos sem gestão da derrota descambam em conflito.",c:[
  {t:"Acabar o jogo ali e mudar de atividade, antes que piore.",e:{qualidade:-6,alcance:-4},o:"Acabou a chatice — e acabou a única oportunidade de aprenderem a perder."},
  {t:"Criar com eles um ritual de fim. Ao início vão gozar com aquilo.",e:{qualidade:11,aprend:10,alcance:6},o:"Ridículo nas primeiras vezes; à quarta, faziam-no sozinhos — e começou a acontecer fora do jogo."},
  {t:"Entrar em campo e equilibrar as equipas com o teu jogo.",reqT:'desporto',e:{alcance:12,qualidade:9},fail:{qualidade:-7,alcance:-5},o:"Equilibraste de dentro e ninguém teve tempo para se chatear.",of:"Entraste e fizeste má figura; passaram o resto do tempo a imitar-te."}]},
 socioemocional:{k:"Semana 3",h:"Alguém abre uma coisa séria na roda",dim:"D6",p:"Na roda do «{P}», um miúdo conta à frente de todos uma coisa grave que se passa em casa. Fez-se silêncio e olham todos para ti.",swot:"Revelação de situação sensível em contexto de grupo.",c:[
  {t:"Mudar de assunto depressa para não o expor.",e:{qualidade:-3,aprend:3},o:"Protegeste-o do grupo — e ele percebeu que aquilo era para calar."},
  {t:"Acabar a roda com calma e falar hoje com ele e com o técnico.",e:{qualidade:12,sust:8},o:"Fizeste o correto, pela ordem correta. Ficou acompanhado e a roda continuou segura."},
  {t:"Deixar o grupo todo comentar o caso. Melhor às claras.",e:{qualidade:-12,sust:-6},o:"Virou espetáculo. Ele não voltou à roda."}]},
 imagem:{k:"Semana 6",h:"Um corte de cabelo correu mal",dim:"D2",p:"No «{P}», deixaste um deles cortar o cabelo a outro. Não ficou bem, e o que levou o corte está furioso à frente de todos.",swot:"Erro visível e irreversível num serviço de imagem entre pares.",c:[
  {t:"Rir e desvalorizar. Se eu levar aquilo a sério, é pior.",e:{qualidade:-8,alcance:-6},o:"Ele não achou piada e não voltou. E ninguém mais se deixou cortar."},
  {t:"Assumir que faz parte, e treinar primeiro em cabeça de treino.",e:{qualidade:10,aprend:11,sust:6},o:"Passou a haver treino antes do real. Os erros deixaram de ir para a cabeça de ninguém."},
  {t:"Trazer um cabeleireiro do bairro. Custa dinheiro e semanas a marcar.",reqE:{k:'parceiros',min:3},e:{qualidade:12,sust:9,alcance:6},fail:{qualidade:-5},o:"Veio, ensinou o básico, e a oficina passou a ter mão de quem sabe.",of:"Não tinhas ninguém combinado; ficou a promessa e o corte mal feito."}]},
 maisvelhos:{k:"Semana 5",h:"Testam se o espaço é mesmo deles",dim:"D1",p:"Deste-lhes o «{P}» e um espaço só deles. Na terceira semana fazem exatamente o que sabem que te chateia — só para ver se o espaço é mesmo deles ou se mandas tu.",swot:"Teste de limites quando se dá autonomia a um grupo de mais velhos.",c:[
  {t:"Retirar-lhes a autonomia. Afinal quem manda ali sou eu.",e:{alcance:-12,aprend:-4},o:"Provaste que o espaço nunca foi deles. Foram-se embora, desta vez de vez."},
  {t:"Devolver-lhes o problema. Vão demorar semanas a decidir alguma coisa.",e:{qualidade:11,sust:10,alcance:7},o:"Escreveram as regras deles. A partir daí defendiam o espaço melhor do que tu."},
  {t:"Deixar correr, para não perder a adesão que já custou.",e:{qualidade:-8,sust:-6},o:"Sem limites, o espaço deixou de ser seguro e os mais calmos saíram."}]},
 consolatorneio:{k:"Final do torneio",h:"O campeão fez batota",dim:"D6",p:"Ganhou a final e toda a gente viu que fez batota. Ele nega. A sala está à espera do que vais fazer.",swot:"Quebra de regras por quem devia dar o exemplo, à frente do grupo.",c:[
  {t:"Anular a vitória e dar o prémio ao segundo. É o justo.",e:{qualidade:6,alcance:-9},o:"Fez-se justiça. Ele não voltou — e era um dos que mais precisavam de lá estar."},
  {t:"Repetir a final com árbitro escolhido por eles. Quem ganhou vai achar mal.",e:{qualidade:11,alcance:8,aprend:9},o:"Perdeu a repetição. Mas ficou, e as regras passaram a valer alguma coisa porque foram aplicadas em direto."},
  {t:"Deixar andar. Não vale a pena estragar a festa.",e:{qualidade:-12,sust:-6},o:"Estragou-se na mesma. Na semana seguinte fizeram todos batota."}]},
 criadores:{k:"Semana 5",h:"Publicaram o que não deviam",dim:"D5",p:"Foi publicado um vídeo com a cara de um miúdo cuja mãe nunca autorizou nada. Já tem 300 visualizações.",swot:"Publicação de imagem de menor sem consentimento.",c:[
  {t:"Apagar aquilo depressa, e não dizer nada a ninguém.",e:{qualidade:-9,sust:-11},o:"A mãe soube na mesma, por outra pessoa. Agora, além do vídeo, há o facto de teres escondido."},
  {t:"Apagar e ligar à mãe hoje. A mãe pode não gostar nada da chamada.",e:{qualidade:12,sust:10,aprend:10},o:"A mãe agradeceu a chamada. E o grupo passou a pedir autorização sem ninguém mandar."},
  {t:"Deixar. Já está online, tirar agora só chama mais atenção.",e:{qualidade:-14,sust:-14},o:"Chegou à coordenação. E a partir daí deixou de ser um problema teu — passou a ser um problema sobre ti."}]},
 cinema:{k:"Terceira sessão",h:"O filme abriu uma ferida",dim:"D6",p:"A meio do debate, uma miúda contou, à frente de todos, uma coisa que se passa em casa dela. Fez-se silêncio.",swot:"Revelação de situação familiar sensível em contexto de grupo.",c:[
  {t:"Mudar de assunto depressa para não a expor mais.",e:{qualidade:-4,aprend:3},o:"Protegeste-a do grupo. E ela percebeu que o assunto era para calar."},
  {t:"Fechar a sessão e falar hoje com ela e com o técnico. Ela pediu segredo.",e:{qualidade:12,sust:9},o:"Fizeste o correto, pela ordem correta. Ficou registado e ela foi acompanhada."},
  {t:"Continuar o debate como se fosse mais um contributo.",e:{qualidade:-11,sust:-8},o:"Ela não voltou. E tu ficaste a saber uma coisa que não fizeste nada com."}]},
 torneio:{k:"Véspera do torneio",h:"Uma equipa recusa jogar com a outra",dim:"D1",p:"Os do bairro de cima não jogam com os do bairro de baixo. Ponto final, dizem eles.",swot:"Divisão territorial entre participantes a comprometer a atividade.",c:[
  {t:"Fazer o torneio só com quem quer. Obrigar não leva a nada.",e:{alcance:-11,qualidade:3},o:"Jogou-se. E a divisão que existia à entrada continuou a existir à saída."},
  {t:"Misturar as equipas à força. Juntos, acabam por se entender.",e:{alcance:-6,qualidade:-5},o:"Jogaram. Sem se passarem a bola uns aos outros nem uma vez."},
  {t:"Deixá-los escolher capitães e fazer o sorteio das equipas à frente de todos.",e:{alcance:10,qualidade:9,aprend:8},o:"Saíram equipas mistas por sorteio, à vista de todos. Ninguém pôde reclamar — e no fim trocaram números de telemóvel."},
  {t:"Entrar em campo e jogar num dos lados. Deixas de ver o resto do grupo.",reqT:'desporto',e:{alcance:12,qualidade:10,aprend:7},fail:{qualidade:-8,alcance:-5},
   o:"Jogaste. Levaste uma entrada dura e levantaste-te a rir. A partir daí eram eles a chamar-te.",of:"Entraste em campo e fizeste má figura. Passaram o mês a imitar-te."}]},
 radio:{k:"Dia da gravação",h:"O convidado não apareceu",dim:"D2",p:"Estava tudo montado. Eles prepararam perguntas a semana toda. O entrevistado não veio nem atende.",swot:"Dependência de convidados externos sem plano B.",c:[
  {t:"Cancelar e remarcar. Sem condições, não vale a pena.",e:{alcance:-8,qualidade:2},o:"Remarcaste. Metade não voltou a preparar perguntas — o entusiasmo não se remarca."},
  {t:"Entrevistar quem estiver ali. Não é nada do que estava combinado.",e:{alcance:11,qualidade:10,aprend:10},o:"Foi o melhor episódio do ano. E perceberam que a história do bairro está em quem lá está todos os dias."},
  {t:"Gravar na mesma, só eles a falar. Ninguém vai reparar.",e:{qualidade:-4,alcance:3},o:"Saiu confuso. Mas saiu — e isso já é mais do que nada."}]},
 estudo:{k:"Semana 6",h:"Os tutores desistiram",dim:"D1",p:"Os mais velhos que davam apoio aos mais novos deixaram de vir. Sem aviso.",swot:"Voluntariado juvenil sem contrapartida nem reconhecimento.",c:[
  {t:"Fazer eu o apoio ao estudo todo. É mais rápido assim.",e:{qualidade:5,alcance:-9,sust:-8},o:"Aguentaste. Voltou a ser um adulto a ensinar miúdos — que era exatamente o que querias evitar."},
  {t:"Dar-lhes um certificado ou horas em troca. Tens de o negociar lá em cima.",e:{sust:12,alcance:8,qualidade:6},o:"Queriam que aquilo contasse para alguma coisa. Contou. Voltaram todos, e trouxeram mais um."},
  {t:"Acabar com o apoio ao estudo. Ninguém liga àquilo.",e:{alcance:-13,aprend:-6},o:"Acabou. E os mais novos ficaram sem a única ajuda que tinham."}]},
 horta:{k:"Semana 8",h:"Arrancaram tudo de noite",dim:"D2",p:"Chegaste de manhã e estava tudo destruído. Não foi a chuva.",swot:"Vandalismo sobre o resultado do trabalho dos participantes.",c:[
  {t:"Desistir. Não vale a pena replantar para isto acontecer outra vez.",e:{alcance:-13,aprend:-8},o:"Aprenderam que quando se destrói o que eles fazem, o adulto desiste. É uma lição — a errada."},
  {t:"Replantar com eles e levar à assembleia. Perde-se um mês de trabalho.",e:{qualidade:10,alcance:9,sust:8,aprend:9},o:"Replantaram. E foram eles a montar turnos de vigilância — nunca mais foi tocado."},
  {t:"Pôr uma câmara e apresentar queixa. Assim é que não dá.",e:{sust:4,alcance:-6},o:"Nunca se soube quem foi. E o espaço passou a ter uma câmara a olhar para as pessoas."}]},
 mural:{k:"Semana 7",h:"Pintaram um insulto por cima",dim:"D6",p:"Alguém escreveu um insulto a tinta por cima do mural. É contra um dos miúdos, e ele já viu.",swot:"Agressão simbólica sobre o trabalho e sobre um participante.",c:[
  {t:"Apagar de noite, sozinho, antes que mais alguém veja.",e:{qualidade:3,aprend:-5},o:"Ficou limpo. E o miúdo continuou a saber que alguém, ali, escreveu aquilo sobre ele."},
  {t:"Falar com o grupo e repintar com eles. Fica lá à vista mais uns dias.",badL:'conflito',e:{qualidade:12,alcance:8,aprend:10},fail:{qualidade:-8,alcance:-5},
   o:"Foi a conversa mais difícil e mais útil do projeto. Repintaram todos, incluindo quem escreveu.",of:"Fugir do conflito é o teu limite. Adiaste a conversa três vezes e no fim apagaste sozinho."},
  {t:"Pedir ao técnico que conduza a conversa e ficar ao lado.",e:{qualidade:6,aprend:4},o:"Não foste tu a conduzir. Mas não se apagou às escondidas, a conversa aconteceu, e tu estavas na sala."},
  {t:"Chamar a polícia. Isto já ultrapassa o que me compete.",e:{qualidade:-8,alcance:-10},o:"Ninguém foi identificado. E o espaço passou a ser um sítio onde se chama a polícia."}]},
 cozinha:{k:"Primeiro jantar",h:"Só apareceu uma família",dim:"D2",p:"Convidaste doze. Veio uma — a mãe e dois filhos — e trouxe comida para todos.",swot:"Baixa adesão inicial das famílias.",c:[
  {t:"Cancelar. Com uma família só, aquilo não faz sentido.",e:{alcance:-12,sust:-9},o:"A mãe que veio, com a comida na mão, foi a única pessoa que confiou em ti. E foi mandada para casa."},
  {t:"Fazer o jantar com essa família e pedir-lhe que traga outra da próxima.",e:{alcance:11,sust:10,qualidade:8},o:"Da segunda vez vieram quatro famílias. Da terceira, nove. Foi ela a convidar — e a ela, acreditam."},
  {t:"Cozinhar com ela. Ficas preso à cozinha e o grupo fica sozinho.",reqT:'cozinha',e:{alcance:13,qualidade:11,sust:7},fail:{qualidade:-7},
   o:"O cheiro chegou ao corredor. Entraram sete pessoas que não tinham sido convidadas.",of:"Queimaste o arroz à frente da única pessoa que confiou em ti."},
  {t:"Cozinhar eu para todos, e insistir no convite à mesma.",e:{qualidade:-4,alcance:2},o:"Vieram comer. Não vieram cozinhar — e o projeto era sobre cozinharem eles."}]},
 forum:{k:"Dia da apresentação",h:"A cena é sobre um técnico do espaço",dim:"D1",p:"A cena que prepararam retrata, sem margem para dúvidas, um técnico que está na plateia.",swot:"Conflito interno exposto publicamente pelos participantes.",c:[
  {t:"Cortar a cena antes de começar, para não haver problemas.",e:{qualidade:-6,alcance:-9,aprend:-4},o:"Perceberam. O teatro-fórum servia para falar de tudo — menos do que interessava."},
  {t:"Avisar o técnico e convidá-lo a entrar em cena. Pode dizer que não.",badL:'timidez',e:{qualidade:13,sust:9,aprend:10},fail:{qualidade:-5,sust:-6},
   o:"Ele entrou em cena. Mudou o final. Foi a coisa mais corajosa que aconteceu naquele espaço em anos.",of:"Não conseguiste ter essa conversa com ele. A cena aconteceu à mesma, e ele soube ali, à frente de todos."},
  {t:"Avisar o técnico a sós e deixar a cena acontecer à mesma.",e:{qualidade:6,aprend:4},o:"Não o convidaste a entrar em cena à frente de todos. Mas ninguém foi apanhado desprevenido, e a relação aguentou."},
  {t:"Deixar correr sem avisar ninguém. Se calhar não é nada.",e:{alcance:6,sust:-12},o:"Foi forte. E foi a última vez que aquele técnico te deixou usar a sala."}]},
 danca:{k:"Uma semana antes",h:"Metade não sabe a coreografia",dim:"D2",p:"A apresentação é daqui a sete dias. Metade do grupo não decorou nada e já se nota quem é.",swot:"Preparação desigual perante um compromisso com data marcada.",c:[
  {t:"Cortar quem não sabe. É a apresentação deles, não um ensaio.",e:{qualidade:7,alcance:-13},o:"Correu bem no palco. E metade do grupo ficou na plateia a ver os outros — nunca mais voltou."},
  {t:"Simplificar a coreografia para todos entrarem. Quem já a sabia perde.",e:{qualidade:-3,alcance:12,aprend:8},o:"Ficou mais simples e entraram todos. Ninguém na plateia notou a diferença. Eles notaram."},
  {t:"Adiar a apresentação até estarem mesmo preparados.",e:{sust:-9,alcance:-5},o:"Adiaste. E adiaste outra vez. Nunca aconteceu."}]},
 mostra:{k:"Dia da mostra",h:"Está a chover",dim:"D2",p:"Chove desde as sete da manhã e não pára. Metade do que estava preparado contava com o exterior, e vem gente daqui a duas horas.",swot:"Dependência de condições exteriores sem plano alternativo.",c:[
  {t:"Cancelar e remarcar para quando estiver tudo pronto.",e:{alcance:-12,sust:-6},o:"Remarcaste. Vieram menos de metade — a segunda vez nunca tem a energia da primeira."},
  {t:"Passar tudo para dentro e fazer na mesma. Vai ficar muito apertado.",e:{alcance:9,qualidade:-4,aprend:9},o:"Ficou apertado, barulhento e caótico. E foi a melhor coisa que o espaço fez naquele ano."},
  {t:"Fazer à chuva. Um bocado de água nunca matou ninguém.",e:{alcance:-6,qualidade:-8},o:"Vieram quatro pessoas. Molharam-se. Molhaste-te."}]},
 tabuleiro:{k:"Semana 4",h:"Ninguém aguenta perder",dim:"D6",p:"Todos os jogos acabam da mesma maneira: alguém perde, o tabuleiro vai ao chão, e acabou a tarde.",swot:"Incapacidade de gerir a frustração da derrota em contexto de grupo.",c:[
  {t:"Tirar os jogos competitivos e pôr só jogos cooperativos.",e:{qualidade:5,aprend:-4},o:"Deixou de haver tabuleiros no chão. E deixou de haver a única oportunidade que tinham de aprender a perder."},
  {t:"Um ritual fixo no fim de cada jogo. Rouba cinco minutos a cada sessão.",e:{qualidade:12,aprend:11,alcance:6},o:"Foi ridículo nas primeiras três semanas. À quarta, faziam-no sozinhos. E começou a acontecer fora do clube."},
  {t:"Continuar, e ir apanhando as peças do chão pelo caminho.",e:{qualidade:-9,aprend:-3},o:"Continuaste a apanhar peças até ao fim do ano."}]},
 reparar:{k:"Semana 9",h:"Trouxeram uma bicicleta roubada",dim:"D6",p:"Chegou uma bicicleta para reparar. Toda a gente no bairro sabe de quem ela é — e não é de quem a trouxe.",swot:"Envolvimento do projeto em situação ilícita.",c:[
  {t:"Reparar aquilo e não perguntar de onde veio. Nem quero saber.",e:{qualidade:-13,sust:-11},o:"O dono passou à porta e viu a bicicleta dele lá dentro. A oficina passou a ser o sítio onde se arranjam bicicletas roubadas."},
  {t:"Ir com ele devolver a bicicleta. Perdes a tarde e ele passa um mau bocado.",badL:'conflito',e:{qualidade:13,sust:10,aprend:11},fail:{qualidade:-6,sust:-5},
   o:"Foi o pior quarto de hora da vida dele. E foi a única coisa que fizeste naquele ano que ele nunca vai esquecer.",of:"Fugir do conflito é o teu limite. Disseste que ias, adiaste, e no fim deixaste a bicicleta a um canto até desaparecer."},
  {t:"Levar o caso ao técnico e decidirem juntos. Não se repara nada hoje.",e:{qualidade:5,sust:5},o:"Não resolveste tu. Mas a bicicleta não voltou para a rua reparada, o miúdo não foi posto fora, e a decisão foi tomada por quem tinha de a tomar."},
  {t:"Expulsar o miúdo da oficina. Assim os outros percebem.",e:{qualidade:2,alcance:-12},o:"Saiu. Com a bicicleta. E a oficina ficou limpa de consciência e vazia de propósito."}]},
 foto:{k:"Dia da exposição",h:"Fotografaram pessoas sem pedir",dim:"D5",p:"A exposição está montada. Há duas pessoas do bairro a reclamar que a cara delas está ali sem terem autorizado.",swot:"Exposição de imagem de terceiros sem consentimento.",c:[
  {t:"Tirar a exposição toda, antes que aquilo se agrave.",e:{alcance:-11,aprend:4},o:"Acabou. E eles nunca perceberam onde estava a linha — só que ela existia e que a passaram."},
  {t:"Pedir autorização foto a foto e voltar a expor. Fecha duas semanas.",e:{qualidade:12,sust:9,aprend:11},o:"Demorou duas semanas. Voltaram com mais fotos do que tinham — porque as pessoas, depois de lhes perguntarem, quiseram aparecer."},
  {t:"Manter tudo como está. É espaço público, e é legal.",e:{qualidade:-9,sust:-10},o:"É legal. E o bairro passou a olhar de lado para o espaço — que é uma coisa que não se resolve com a lei."}]},
 carreira:{k:"Semana 10",h:"Arranjaram trabalho — e é ilegal",dim:"D5",p:"Dois deles começaram a trabalhar. Sem contrato, sem descontos, doze horas por dia, pagos à semana em dinheiro.",swot:"Inserção laboral em condições ilegais.",c:[
  {t:"Não te meteres. Estão a trabalhar, é o que interessa.",e:{qualidade:-11,aprend:-7},o:"Um deles magoou-se ao terceiro mês. Não tinha seguro, não tinha nada, e não tinha a quem se queixar."},
  {t:"Explicar-lhes os direitos e deixá-los decidir. Podem decidir mal.",e:{qualidade:13,aprend:11,sust:6},o:"Um saiu. O outro ficou, mas exigiu contrato — e conseguiu. Era exatamente para isto que as sessões existiam."},
  {t:"Denunciar a empresa. Isto não pode ficar assim.",e:{qualidade:4,alcance:-9},o:"Ficaram sem trabalho e furiosos contigo. Tinhas razão, e não serviu de nada — porque decidiste por eles."}]},
 jornal:{k:"3.º número",h:"Querem publicar um texto que ataca alguém",dim:"D5",p:"O «{P}» está a resultar — tanto que trouxeram um texto que, sem dizer o nome, deixa toda a gente a saber de quem fala, e não é a bem. Querem que saia hoje.",swot:"Responsabilidade editorial sobre conteúdo que expõe uma pessoa.",c:[
  {t:"Proibir o texto e explicar que ali não se ataca ninguém.",e:{qualidade:3,alcance:-8},o:"Não saiu — e ficaram a achar que o jornal é teu, não deles. O texto seguinte não to mostraram."},
  {t:"Publicar. O jornal é deles, não sou eu que corto.",e:{qualidade:-11,sust:-6},o:"Saiu. A pessoa visada soube nesse dia, e o jornal passou a ser o sítio onde se ajustam contas."},
  {t:"Reescrever com eles o que fica e o que sai, e porquê.",e:{qualidade:12,aprend:11,alcance:5},o:"O que eles queriam dizer continuou lá; o ataque saiu. Aprenderam a diferença entre denunciar um problema e queimar uma pessoa — que é meio jornalismo."}]},
 artes:{k:"Semana 5",h:"Um deles estraga a peça de outro",dim:"D6",p:"No «{P}», um miúdo desfez de propósito o trabalho que outro tinha levado três sessões a fazer. O que perdeu a peça está a chorar de raiva à frente de todos.",swot:"Dano intencional sobre o trabalho de um participante.",c:[
  {t:"Mandar o que estragou para fora e continuar.",e:{qualidade:-6,alcance:-7},o:"Saiu. E o grupo aprendeu que aqui, quando há um problema, alguém desaparece — não se resolve."},
  {t:"Pôr os dois a refazer a peça juntos.",e:{qualidade:12,aprend:11,alcance:6},o:"Custou, e resmungaram. Mas refizeram-na a quatro mãos, e o que a estragou foi quem mais a defendeu no fim. As mãos ocupadas dizem o que a conversa não diz."},
  {t:"Substituir o material e fazer de conta que não foi nada.",e:{qualidade:-8,sust:-5},o:"Voltou a acontecer duas semanas depois. O que não se nomeia, repete-se."}]},
 jantar:{k:"Véspera",h:"Uma família não tem como trazer nada",dim:"D1",p:"Cada família ia trazer um prato. Uma mãe veio dizer-te, envergonhada, que este mês não dá para comprar os ingredientes. Ninguém mais sabe.",swot:"Desigualdade económica exposta num evento de partilha.",c:[
  {t:"Dizer-lhe que não faz mal e comprar tu os ingredientes, sem ninguém saber.",e:{qualidade:10,sust:8,alcance:5},o:"Veio, cozinhou, sentou-se à mesa como as outras. Ninguém soube — e é isso que faz a diferença entre ajudar e expor."},
  {t:"Pedir ao grupo que faça uma vaquinha para ela.",e:{qualidade:-6,alcance:-4},o:"Juntou-se o dinheiro. E a família soube que se juntou por causa dela. Não voltou."},
  {t:"Dizer que quem não traz prato ajuda a servir a mesa.",e:{qualidade:9,aprend:8,sust:4},o:"Deste-lhe um lugar sem ser o da falta. Serviu a mesa toda, e no fim era ela a receber os agradecimentos. Dignidade não custa dinheiro."}]},
 custom:{k:"Semana 6",h:"A tua ideia não está a pegar",dim:"D2",p:"Passaram seis semanas. O «{P}» não está a resultar como imaginaste, e já se nota.",swot:"Projeto próprio sem tração ao fim de seis semanas.",c:[
  {t:"Insistir na mesma. Ainda é cedo para desistir disto.",e:{qualidade:-5,aprend:3},o:"Às vezes é mesmo cedo. E às vezes insistir é só não querer olhar para o que está à frente."},
  {t:"Perguntar o que está a falhar e mudar. Deitas fora o que preparaste.",e:{qualidade:10,alcance:9,aprend:11},o:"Disseram-te. Era uma coisa simples e óbvia que tu não tinhas visto porque estavas de dentro."},
  {t:"Trocar de projeto. Assim não vale a pena insistir.",e:{sust:-9,aprend:5},o:"Começaste outra coisa. Aprendeste a desistir depressa — que é uma competência com dois gumes."}]}
};

const EV_DIAG={
 energia:{k:"Semana 3",h:"A energia rebentou a meio",dim:"D6",p:"O «{P}» ia a meio e a energia que tinhas para canalizar virou-se contra ti: correria, gritaria, dois ao chão a fingir luta. A sala fugiu-te em dez segundos.",swot:"Energia do grupo sem estrutura descarrila a atividade.",c:[
  {t:"Mandar toda a gente sentar e ficar em silêncio.",e:{qualidade:-6,alcance:-8},o:"Sentaram-se dois minutos. Depois rebentou outra vez — sentar não gasta energia, só a adia."},
  {t:"Transformar a correria num jogo com turnos. Perdes o que planeaste.",e:{qualidade:11,alcance:9,aprend:9},o:"A mesma energia, agora com uma baliza. Pararam de se atropelar porque passou a haver um objetivo."},
  {t:"Cinco minutos a correr a sério antes de começar. Rouba tempo à sessão.",reqT:'desporto',e:{qualidade:10,alcance:8},fail:{qualidade:-6,alcance:-5},o:"Voltaram cansados e disponíveis. É contra-intuitivo e resulta.",of:"Puseste-os a correr e não os soubeste travar. Ficou pior do que estava."}]},
 emocional:{k:"Semana 4",h:"Um deles explodiu por nada",dim:"D2",p:"No «{P}», um miúdo perdeu um jogo e explodiu — atirou as coisas, chorou de raiva, saiu porta fora. Não foi o jogo; foi tudo o que ele não sabe dizer de outra maneira.",swot:"Falta de regulação emocional exposta em contexto de grupo.",c:[
  {t:"Mandá-lo para a rua acalmar-se sozinho. Comigo não fala.",e:{qualidade:-7,aprend:-3},o:"Acalmou sozinho — e aprendeu que quando sente demais, fica sozinho. Foi a lição errada."},
  {t:"Ir ter com ele sem plateia. O grupo fica sem ti uns minutos.",reqT:'escuta',e:{qualidade:12,aprend:11,sust:5},fail:{qualidade:-5},o:"«Estás com raiva porque perdeste, e tudo bem ter raiva.» Foi a primeira vez que alguém lhe disse isso. Voltou.",of:"Foste, mas não soubeste o que dizer. Ficaram os dois calados e ele mais envergonhado."},
  {t:"Deixá-lo sair, mas ir atrás no fim da sessão para falar com ele a sós.",e:{qualidade:6,aprend:5},o:"Não o apanhaste no momento, mas não o deixaste ir para casa com aquilo. Já é muito."},
  {t:"Fazer de conta que não foi nada e continuar o jogo.",e:{qualidade:-9,sust:-5},o:"O grupo aprendeu que aquilo se ignora. E ele explodiu outra vez na semana seguinte."}]},
 consola:{k:"Semana 4",h:"A consola contra o teu projeto",dim:"D6",p:"O «{P}» começa às 17h. Às 17h05 há quatro deles ainda agarrados à consola, e não se mexem.",swot:"Concorrência direta da consola com a atividade proposta.",c:[
  {t:"Desligar a consola. Sem ela, olham uns para os outros.",e:{qualidade:4,alcance:-12,aprend:-3},o:"Vieram. Zangados, de braços cruzados, a estragar o ambiente. Ganhaste a batalha e perdeste-os."},
  {t:"Integrar a consola: que ela seja o prémio no fim, ou a ferramenta do meio.",e:{alcance:12,qualidade:7,aprend:9},o:"Passou a haver uma razão para desligar — a consola voltava no fim, e agora era deles ganhá-la."},
  {t:"Sentar-me a jogar com eles e ganhar. Alguns vão achar que te armas.",reqT:'gaming',e:{alcance:14,qualidade:9,aprend:8},fail:{alcance:-10,qualidade:-6},
   o:"Ganhaste-lhes. A partir daí ouviram-te — porque paraste de ser o adulto que manda desligar.",of:"Perdeste em três minutos e eles riram-se. Ficaste sem consola e sem autoridade."},
  {t:"Começar sem eles. Quem chega tarde que se governe.",e:{alcance:-8,qualidade:3},o:"Os que vieram tiveram uma boa sessão. Os outros ficaram onde estavam — e eram esses que precisavam."}]},
 telemovel:{k:"Semana 4",h:"Filmaram uma discussão",dim:"D5",p:"Dois miúdos discutiram. Um terceiro filmou e já está online. Toda a gente viu.",swot:"Uso do telemóvel para expor e amplificar conflitos.",c:[
  {t:"Proibir telemóveis no espaço. Regra é regra, e pronto.",e:{qualidade:5,alcance:-11},o:"Deixaram de filmar. E deixaram de vir alguns — a proibição foi mais rápida do que a conversa."},
  {t:"Fazer disso o tema. Quem publicou fica apontado à frente de todos.",e:{qualidade:11,aprend:10,alcance:4},o:"O vídeo foi apagado por quem o publicou. Não porque mandaste — porque percebeu."},
  {t:"Falar só com os três envolvidos.",e:{qualidade:6,alcance:-2},o:"Resolveste o caso. Não resolveste o hábito — e o hábito volta na semana seguinte."}]},
 regras:{k:"Semana 5",h:"Partiram uma coisa e ninguém assume",dim:"D6",p:"Alguém partiu material do «{P}». Ninguém sabe de nada, e estavam lá dez.",swot:"Ausência de regras assumidas e de responsabilização pelo espaço.",c:[
  {t:"Castigar o grupo todo até alguém confessar quem foi.",e:{qualidade:-8,alcance:-9},o:"Ninguém confessou. Aprenderam que o justo e o injusto vêm da mesma pessoa: tu."},
  {t:"Construir com eles as regras e as consequências. Leva a sessão inteira.",e:{qualidade:10,sust:9,aprend:8},o:"Levou duas sessões e valeu cada minuto. As regras passaram a ser deles."},
  {t:"Substituir o material e não dizer nada a ninguém.",e:{sust:-9,qualidade:-4},o:"Partiu-se outra coisa três semanas depois."}]},
 fechados:{k:"Semana 2",h:"Disseram que não a tudo",dim:"D2",p:"Apresentaste o «{P}». A resposta foi um coro de «não me apetece» — sem sequer te ouvirem até ao fim.",swot:"Resistência inicial a qualquer proposta nova.",c:[
  {t:"Fazer na mesma, sozinho, à frente deles.",e:{alcance:7,qualidade:4,aprend:8},o:"Ao terceiro dia havia dois a espreitar. Ao quinto eram quatro. Não convenceste — mostraste."},
  {t:"Desarmá-los a rir, à minha custa. Pode colar e passar a ser a piada.",reqT:'humor',e:{alcance:13,qualidade:6,aprend:6},fail:{alcance:-9,qualidade:-5},
   o:"Riram-se de ti. E ficaram. É a coisa mais subestimada deste trabalho: quem se ri contigo, entra.",of:"Tentaste a piada e não teve graça nenhuma. O silêncio ficou pior do que estava."},
  {t:"Perguntar-lhes o que é que eles queriam fazer.",e:{alcance:10,qualidade:5,sust:5},o:"Deram uma ideia. Era pior do que a tua — e resultou melhor, porque era deles."},
  {t:"Insistir e explicar melhor porque é bom para eles.",e:{alcance:-9,aprend:-4},o:"Quanto mais explicaste, menos ouviram. Ninguém entra numa coisa por argumento."}]},
 conflitos:{k:"Semana 5",h:"A discussão passou a agressão",dim:"D6",p:"Uma discussão do costume passou a empurrões. Um deles ficou com o lábio a sangrar.",swot:"Escalada de conflito com agressão física.",c:[
  {t:"Separar, tratar do ferimento e registar. A sessão acaba ali.",badL:'conflito',e:{qualidade:11,sust:6},fail:{qualidade:-9},
   o:"Fizeste o que era preciso, pela ordem certa.",of:"Fugir do conflito é o teu limite. Chamaste um adulto e saíste da sala — e eles perceberam."},
  {t:"Expulsar os dois uma semana. Tem de haver um limite.",e:{qualidade:3,alcance:-11},o:"Voltaram piores, e agora com uma razão para te odiarem."},
  {t:"Separar e tratar do ferimento, e pedir a um colega que fale com eles.",e:{qualidade:4,sust:2},o:"Fizeste a parte que sabias fazer e não deixaste a outra por fazer — passaste-a a quem a fazia melhor."},
  {t:"Fingir que não foi nada para não fazer disto um caso.",e:{qualidade:-14,sust:-8},o:"Foi um caso. Só que agora és tu quem sabia e não fez nada."}]},
 escolar:{k:"Semana 9",h:"Um deles chumbou",dim:"D4",p:"Chumbou. Continua a vir, mas senta-se ao fundo e não fala com ninguém — nem com quem falava antes.",swot:"Insucesso escolar de participantes, sem articulação com a escola.",c:[
  {t:"Falar com ele em privado, sem falar de notas.",e:{qualidade:10,aprend:7},o:"Não falou do chumbo. Falou de tudo o resto — que era, afinal, a causa."},
  {t:"Falar com a escola e com quem o acompanha, para não ficar só entre nós.",reqE:{k:'preparacao',min:3},e:{qualidade:8,alcance:7,sust:5},fail:{qualidade:-6},
   o:"Passou a haver apoio ao estudo. Foi o primeiro a inscrever-se.",of:"Não tinhas preparação nenhuma para montar aquilo. Ficou em promessa."},
  {t:"Não mexer naquilo. Não é da minha conta o que eles fazem.",e:{qualidade:-8,aprend:-6},o:"Deixou de vir um mês depois. E ninguém foi atrás."}]},
 transicao:{k:"Semana 11",h:"Fez 18 anos",dim:"D4",p:"Um dos mais velhos fez 18. Já não pode estar no espaço. Não estuda, não trabalha, e vai simplesmente deixar de aparecer.",swot:"Saída sem encaminhamento de participantes que atingem o limite de idade.",c:[
  {t:"Mapear com ele opções concretas antes de sair. Pode não dar em nada.",e:{qualidade:12,sust:8,aprend:9},o:"Saiu com três contactos e uma candidatura entregue. É exatamente isto que o programa é."},
  {t:"Deixá-lo continuar a vir na mesma, informalmente.",e:{alcance:4,sust:-9},o:"Ficou — e no imediato até parece bem, porque não o perdeste de vista. Só que ficou parado, fora das regras, dependente de ti, e o problema apenas mudou de data. Um ano depois estava na mesma cadeira, com 19 anos, e agora era tarde."},
  {t:"Despedir-me e desejar-lhe boa sorte. Cada um sabe de si.",e:{sust:-6,aprend:-5},o:"Nunca mais se soube dele. E o programa existe precisamente para que isso não aconteça."}]},
 participacao:{k:"Semana 7",h:"As raparigas deixaram de aparecer",dim:"D1",p:"O «{P}» encheu. Só que olhaste à volta e são só rapazes. Elas vieram duas vezes e desistiram.",swot:"Participação desigual por género, com abandono silencioso.",c:[
  {t:"Perguntar-lhes diretamente porque deixaram de vir.",e:{qualidade:10,alcance:8,aprend:8},o:"Disseram-te. A razão era óbvia e ninguém tinha perguntado — foi isso que te ficou."},
  {t:"Sentar-me ao lado e esperar. Pode não dizer nada em vinte minutos.",reqT:'escuta',e:{qualidade:14,alcance:9,aprend:10},fail:{qualidade:-6,alcance:-7},
   o:"Ao fim de vinte minutos contaram-te tudo, sem tu perguntares. É para isto que serve saber ouvir.",of:"Sentaste-te ao lado e ficaram os dois calados. Foram-se embora."},
  {t:"Criar uma sessão só para elas.",e:{alcance:8,qualidade:4,sust:-3},o:"Voltaram. Mas o espaço continuou dividido — o problema mudou de sítio em vez de se resolver."},
  {t:"Assumir que não estão interessadas, e não insistir mais.",e:{alcance:-12,qualidade:-6},o:"É a explicação mais confortável. É quase sempre a errada."}]},
 familias:{k:"Semana 8",h:"Uma mãe veio queixar-se",dim:"D1",p:"Veio à porta, alto e bom som, dizer que o «{P}» é uma perda de tempo e que o filho devia era estar a estudar.",swot:"Desconfiança das famílias quanto ao valor da intervenção.",c:[
  {t:"Convidá-la a entrar e a ver.",badL:'timidez',e:{qualidade:9,sust:11,alcance:6},fail:{sust:-4,aprend:6},
   o:"Ficou. Voltou na semana seguinte, e trouxe outra mãe.",of:"Convidaste, mas não conseguiste explicar-lhe nada. Ficou cinco minutos e foi-se embora."},
  {t:"Falar-lhe na língua dela. Os outros deixam de perceber a conversa.",reqT:'linguas',e:{qualidade:12,sust:13,alcance:8},fail:{sust:-5},
   o:"Mudou tudo. Ela nunca tinha falado com ninguém daquele sítio na língua em que pensa.",of:"Tentaste e não te safaste. Ficou pior do que se tivesses falado português."},
  {t:"Explicar-lhe à porta e pedir desculpa. Não dá para mais.",e:{sust:-3,qualidade:-2},o:"Acalmou. Não mudou de ideias — e vai voltar a queixar-se."},
  {t:"Remeter para a coordenação. Não é a mim que compete.",e:{sust:4,alcance:-5},o:"Foi resolvido acima de ti. E acima de ti é onde ficaste."}]},
 motivacao:{k:"Semana 6",h:"Ficaram três",dim:"D2",p:"Começaram doze no «{P}». Esta semana apareceram três — e olham para ti à espera de que desistas.",swot:"Quebra de participação a meio do ciclo.",c:[
  {t:"Fazer a sessão com os três, tão bem como faria com doze.",e:{qualidade:11,aprend:9,alcance:-4},o:"Os três contaram aos outros. Na semana seguinte eram sete, e vinham por vontade própria."},
  {t:"Cancelar e repensar tudo com calma, sem prazo à frente.",e:{qualidade:3,alcance:-10},o:"Repensaste. E os três que apareceram aprenderam que também tu desistes."},
  {t:"Perguntar aos que faltaram o que se passou. Nem todos vão querer falar.",e:{alcance:9,qualidade:5,aprend:6},o:"Metade tinha um motivo prático que se resolvia numa mensagem. Ninguém tinha perguntado."}]},
 competencias:{k:"Semana 7",h:"Ninguém se ouve",dim:"D6",p:"Tentaste pô-los a decidir uma coisa em conjunto. Foi só gritos. Ninguém espera pela vez.",swot:"Défice de competências de comunicação e escuta no grupo.",c:[
  {t:"Impor a minha decisão, para aquilo acabar de vez.",e:{qualidade:-7,alcance:-4},o:"Acabou. E aprenderam que decidir em grupo não resulta — o contrário do que precisavas."},
  {t:"Parar tudo e ensinar como se decide: regras de palavra, tempo, votação.",e:{qualidade:12,aprend:10},o:"Demorou uma sessão inteira. Foi a sessão mais útil do ano."},
  {t:"Repetir vinte vezes sem levantar a voz. O resto do grupo fica à espera.",reqT:'paciencia',e:{qualidade:13,aprend:11,sust:5},fail:{qualidade:-9,aprend:-4},
   o:"À vigésima, calaram-se sozinhos. Não porque gritaste — porque não gritaste.",of:"À sétima já estavas a gritar. E a partir daí eles sabiam onde é o teu limite."},
  {t:"Deixá-los resolver sozinhos. Também têm de aprender.",e:{qualidade:-5,aprend:4},o:"Ganharam os mais altos. Como sempre."}]},
 diversidade:{k:"Semana 6",h:"«Isto é sempre igual»",dim:"D2",p:"Ouviste um deles dizer, alto: «isto é sempre a mesma coisa». E tinha razão.",swot:"Repetição da oferta e desgaste do interesse.",c:[
  {t:"Pedir-lhes que proponham a próxima. Podem propor o que não sabes fazer.",e:{alcance:10,qualidade:5,sust:6},o:"Propuseram. Tiveste de dizer que não a duas — mas a terceira era boa, e foi feita por eles."},
  {t:"Mudar tudo e trazer uma coisa de fora, a ver se pega.",e:{alcance:7,qualidade:-4,sust:-4},o:"Encheu na primeira semana. Na terceira estava outra vez vazio."},
  {t:"Explicar que a repetição faz parte, e seguir na mesma.",e:{alcance:-8,qualidade:-3},o:"Tinhas razão em teoria. Na prática, foram-se embora."}]},
 espaco:{k:"Semana 5",h:"Tiraram-te a sala",dim:"D3",p:"A sala onde fazias o «{P}» foi dada a outra coisa. Ficaste sem sítio a meio do projeto.",swot:"Instabilidade no acesso ao espaço físico.",c:[
  {t:"Reclamar por escrito. Fica registado e alguém vai ficar mal contigo.",badL:'escrita',e:{sust:9,qualidade:3},fail:{sust:-5,aprend:6},
   o:"Devolveram a sala, e ficou escrito que era tua às terças.",of:"Ficaste furioso e não escreveste nada. A sala continuou de outros."},
  {t:"Fazer na rua.",e:{alcance:9,qualidade:-6,aprend:7},o:"Correu. Apanharam chuva duas vezes, e passou a haver mais gente a ver do que a fazer."},
  {t:"Suspender até haver sala. Sem espaço não se faz nada.",e:{alcance:-13,sust:-5},o:"Nunca mais houve sala. Havia sempre uma coisa mais urgente."}]},
 digital:{k:"Semana 8",h:"Não sabem fazer um CV",dim:"D5",p:"Pediste-lhes que escrevessem o que sabem fazer. Ficou tudo em branco. Não é falta de vontade — não sabem.",swot:"Défice de literacia digital e administrativa básica.",c:[
  {t:"Fazer o CV com cada um, um a um.",reqE:{k:'preparacao',min:3},e:{qualidade:11,sust:6},fail:{qualidade:-4,aprend:6},
   o:"Saíram todos com um CV. Três candidataram-se a alguma coisa nessa semana.",of:"Sem preparação, fizeste dois e cansaste-te. Os outros ficaram à espera."},
  {t:"Trazer alguém de fora para uma sessão. Depende da agenda de outro.",e:{alcance:6,sust:8,qualidade:5},o:"Veio, foi boa, foi única. Ninguém ficou a saber fazer sozinho."},
  {t:"Dar-lhes um modelo e deixá-los copiar. Poupa tempo a todos.",e:{qualidade:-5,aprend:2},o:"Ficaram todos com o mesmo CV. Literalmente o mesmo."}]},
 comunidade:{k:"Semana 9",h:"Ninguém do bairro sabe que existes",dim:"D5",p:"Falaste com o comerciante da esquina. Não fazia ideia do que é o espaço nem do que lá se faz.",swot:"Invisibilidade do equipamento junto da comunidade envolvente.",c:[
  {t:"Bater às portas uma a uma. Leva tardes e muitas não se abrem.",badL:'timidez',e:{sust:12,alcance:9},fail:{sust:2,aprend:7},
   o:"Ao fim de duas semanas tinhas três apoios e uma parede para expor.",of:"Bater a portas de desconhecidos é o que mais te custa. Foste a duas e desististe."},
  {t:"Pôr cartazes e convites em todas as lojas e cafés da rua.",e:{alcance:11,sust:6,qualidade:-3},o:"Vieram muitos. E ficaram a saber — mas só quem já passava à porta."},
  {t:"Não é a minha função. Quem lá está que trate disso.",e:{sust:-9},o:"Não é, de facto. Mas era a tua oportunidade."}]},
 rh:{k:"Semana 10",h:"És o único",dim:"D3",p:"A técnica do espaço entrou de baixa. Ficaste sozinho com o grupo todo e com o «{P}» a meio.",swot:"Fragilidade da equipa técnica, sem substituição prevista.",c:[
  {t:"Assumir tudo eu e aguentar. Foi o que me pediram.",e:{qualidade:-9,sust:-6,aprend:8},o:"Aguentaste seis semanas. Chegaste ao fim exausto, e ninguém percebeu que estiveste sozinho."},
  {t:"Avisar a coordenação por escrito. Fica escrito que não conseguiste.",badL:'escrita',e:{sust:12,qualidade:5},fail:{sust:-6,aprend:6},
   o:"Mandaram reforço em dez dias. Ficou registado que foste tu a levantar o problema.",of:"Disseste de passagem, num corredor. Ninguém registou nada e nada mudou."},
  {t:"Reduzir o projeto ao que uma pessoa sozinha consegue.",e:{qualidade:7,alcance:-9},o:"Sensato. Ninguém te agradeceu, e também ninguém se magoou."}]}
};

const EV_LOCAL={
 comum:{k:"Terceira semana · a sala comum",h:"Estás a trabalhar no meio da passagem",dim:"D2",
  p:"Escolheste a sala comum. Tem a vantagem de já lá estarem todos — e a desvantagem de estarem todos. A meio do «{P}», entram seis miúdos aos gritos, atravessam o grupo e sentam-se ao lado a ver vídeos com o som alto.",
  swot:"Trabalhar num espaço partilhado sem controlo sobre quem entra.",c:[
  {t:"Mandá-los calar. Estou a trabalhar, não é hora disso.",e:{qualidade:-6,alcance:-9},o:"Calaram-se cinco minutos. Depois voltaram, e trouxeram mais. Numa sala comum não há autoridade que chegue."},
  {t:"Convidá-los a entrar no que estamos a fazer. Podem desmontar aquilo.",e:{alcance:13,qualidade:6,aprend:7},o:"Quatro entraram. Dois foram-se embora. Numa sala comum, a interrupção é o recrutamento."},
  {t:"Mudar o grupo para um canto e continuar.",e:{qualidade:7,alcance:-4},o:"Resolveu-se o barulho e perdeu-se a visibilidade. Ninguém mais viu o que estavas a fazer."},
  {t:"Aproveitar e pedir espaço fixo à coordenação.",reqE:{k:'parceiros',min:3},e:{sust:12,qualidade:9},fail:{qualidade:-5,aprend:6},
   o:"Deram-te a sala das quintas. Trabalhaste três semanas na passagem para provar que precisavas dela — e resultou.",of:"Pediste sem ter falado com ninguém antes. Disseram que não há salas. E não há mesmo — para quem não trata disso antes."}]},
 sala:{k:"Terceira semana · a sala fechada",h:"Precisam da sala para outra coisa",dim:"D2",
  p:"Conseguiste a sala fechada — a mais difícil de arranjar. E hoje chegas e está lá uma reunião. Ninguém te avisou. Os miúdos estão à porta, à tua espera.",
  swot:"Dependência de um espaço que não é meu e me pode ser retirado sem aviso.",c:[
  {t:"Desmarcar. Fica para a semana, que hoje não está fácil.",e:{alcance:-11,sust:-6},o:"Desmarcaste uma. Na semana seguinte apareceram menos três — quem falha uma vez, ensina que se pode falhar."},
  {t:"Fazer na mesma, no corredor.",e:{qualidade:-5,alcance:8,aprend:6},o:"Correu mal e correu. Eles viram que não desististe, e isso vale mais do que a sessão que se perdeu."},
  {t:"Negociar um horário fixo, por escrito. Vais ter de ceder alguma coisa.",reqE:{k:'parceiros',min:3},e:{sust:14,qualidade:8},fail:{sust:-7,aprend:5},
   o:"Ficou escrito. A sala é tua às quintas, e agora está no mapa da parede — que é onde as coisas existem mesmo.",of:"Foste pedir a quem não decide. Mandaram-te falar com outra pessoa, que não estava. Ficou tudo igual."}]},
 campo:{k:"Terceira semana · o campo",h:"Chove há duas semanas",dim:"D2",
  p:"O «{P}» é lá fora. E chove. Chove desde que começaste, e a previsão diz mais dez dias. Não tens plano B porque o campo era o plano.",
  swot:"Atividade totalmente dependente das condições meteorológicas, sem alternativa prevista.",c:[
  {t:"Suspender até aquilo melhorar por si. Às vezes passa.",e:{alcance:-13,sust:-8},o:"Duas semanas paradas. Quando voltou o sol, voltaram três dos nove. Um projeto que pára, morre."},
  {t:"Passar para dentro e adaptar. Metade do que pensaste não vai caber.",reqE:{k:'preparacao',min:3},e:{qualidade:10,alcance:9,aprend:8},fail:{qualidade:-8,alcance:-6},
   o:"Metade da atividade fazia-se dentro. Só não sabias porque nunca tinhas tido de pensar nisso.",of:"Tentaste improvisar dentro e não resultou. Faltavam-te as horas de preparação para ter uma alternativa pronta."},
  {t:"Fazer à chuva. Quem quiser, vem.",e:{alcance:-6,qualidade:5,aprend:9},o:"Vieram três. Molharam-se e riram-se. Foram esses três que ficaram até ao fim do projeto."}]},
 informatica:{k:"Terceira semana · a sala de computadores",h:"A net foi abaixo",dim:"D5",
  p:"Meia hora antes da sessão do «{P}», a net vai abaixo em todo o edifício. Os miúdos estão a chegar. Metade deles só vem por causa dos computadores.",
  swot:"Dependência total de uma infraestrutura que não controlo.",c:[
  {t:"Cancelar. Sem internet não há sessão nenhuma para dar.",e:{alcance:-12,sust:-7},o:"Foram-se embora. E ficou provado o que eles já diziam: que só vinham pela net."},
  {t:"Dizer-lhes a verdade e decidir com eles o que fazer com a hora.",e:{qualidade:5,aprend:4},o:"Não era o que estava planeado e eles perceberam isso. Mas foram eles a escolher o que fazer com o tempo, e a hora não se perdeu."},
  {t:"Fazer sem net o que se puder fazer sem net.",reqE:{k:'preparacao',min:3},e:{qualidade:11,aprend:10,alcance:6},fail:{qualidade:-7,alcance:-5},
   o:"Fizeste em papel o que ias fazer no ecrã. Correu bem — e ficaste a saber que a atividade não precisava do computador tanto como pensavas.",of:"Não tinhas nada preparado que não precisasse de net. Ficaram todos a olhar uns para os outros."},
  {t:"Usar a avaria e mostrar como se resolve. Perdes a sessão planeada.",reqT:'digital',e:{qualidade:9,aprend:12,sust:6},fail:{qualidade:-5},
   o:"Passaste a sessão a ensiná-los a diagnosticar uma rede. Foi a sessão de que mais gostaram.",of:"Mexeste no router e pioraste. Chamaram o técnico e ficaste com má fama."}]},
 cozinha:{k:"Terceira semana · a cozinha",h:"Não te deixam usar a cozinha sem um adulto responsável",dim:"D1",
  p:"Regras da instituição: menores na cozinha só com um funcionário presente. E o funcionário está sozinho para trinta miúdos, não pode estar contigo.",
  swot:"Regra de segurança que inviabiliza a atividade tal como foi planeada.",c:[
  {t:"Fazer na mesma, quando não estiver lá ninguém a ver.",e:{qualidade:-14,sust:-12},o:"Correu bem. E se tivesse corrido mal — com uma criança e uma placa quente — não havia projeto nenhum a seguir. Não se faz."},
  {t:"Desistir da cozinha e mudar de sítio. Ali não dá.",e:{qualidade:-6,alcance:-4,aprend:7},o:"Mudaste. Perdeu-se o que a cozinha tinha de bom. Mas ficou de pé."},
  {t:"Ir falar com quem manda e pedir o adulto responsável para a próxima.",e:{sust:6,qualidade:4},o:"Hoje não deu. Mas foste pelo canal certo, e para a semana já há quem fique responsável."},
  {t:"Fazer a vigilância dele noutro dia. Ficas com duas horas a mais.",reqE:{k:'parceiros',min:3},e:{sust:13,qualidade:11,alcance:7},fail:{sust:-6,aprend:6},
   o:"Trocaste horas com ele. Passou a haver cozinha às quartas — e passaste a ter um aliado dentro da equipa.",of:"Ofereceste-te e ele disse que não podia trocar. Não tinhas relação nenhuma com ele para pedir aquilo."},
  {t:"Fazer receitas que não precisem de lume.",reqT:'cozinha',e:{qualidade:10,alcance:9,aprend:8},fail:{qualidade:-6},
   o:"Gelado de limão, saladas, batidos. Nem lume nem faca — e a cozinha abriu-se toda.",of:"Não te lembraste de nada que se fizesse sem lume. Ficou tudo em águas de bacalhau."}]},
 entrada:{k:"Terceira semana · a entrada",h:"Ninguém pára",dim:"D1",
  p:"Escolheste a entrada porque toda a gente passa. E é verdade: passa toda a gente. E não pára ninguém. Estás ali há três semanas e o «{P}» ainda não teve uma sessão a sério.",
  swot:"Espaço de grande passagem e nenhuma permanência.",c:[
  {t:"Aguentar. Mais dia menos dia aquilo pára por si.",e:{alcance:-10,qualidade:-6},o:"Não parou. Um sítio de passagem é um sítio de passagem, e três semanas chegaram para o provar."},
  {t:"Mudar para um sítio onde se possa ficar.",e:{alcance:8,qualidade:9,aprend:8},o:"Mudaste. E percebeste uma coisa que não estava escrita em lado nenhum: a entrada serve para MOSTRAR, não para FAZER."},
  {t:"Ir buscá-los um a um à passagem. Quem já chegou fica sem ninguém.",reqT:'humor',e:{alcance:13,qualidade:7,aprend:6},fail:{alcance:-8},
   o:"Paraste sete pessoas pelo braço, com uma piada cada. Quatro ficaram. Não foi o sítio — foste tu.",of:"Paraste pessoas que não queriam ser paradas. Começaram a desviar-se de ti no corredor."}]},
 fora:{k:"Terceira semana · fora do equipamento",h:"Metade não pode ir",dim:"D2",
  p:"O «{P}» é fora. E fora significa transporte, autorizações e famílias. Chega o dia e cinco dos nove não têm autorização assinada.",
  swot:"Atividade fora do equipamento com dependência de autorizações e transporte.",c:[
  {t:"Ir só com os que têm autorização. Os outros que esperem.",e:{alcance:-9,qualidade:5},o:"Foram quatro. Os cinco que ficaram viram os outros sair — e essa imagem ficou-lhes."},
  {t:"Adiar e tratar das autorizações uma a uma. Perde-se a data marcada.",reqE:{k:'divulgacao',min:3},e:{alcance:12,sust:10,qualidade:6},fail:{alcance:-7,aprend:6},
   o:"Ligaste a nove famílias. Foram os nove. E as famílias passaram a saber quem tu és — o que vale mais do que a saída.",of:"Não tinhas contactos, não tinhas circular, não tinhas nada. As autorizações não apareceram sozinhas."},
  {t:"Trazer o de fora para dentro.",e:{qualidade:8,alcance:7,aprend:9},o:"Em vez de os levares lá, trouxeste a pessoa cá. Foram os nove — porque não havia nada para assinar."}]}
};

function metaBucket(){
 if(G3.mFreq==='evento')return 'unico';
 if(G3.mFreq==='diario'||G3.mFreq==='trissemanal')return 'intenso';
 if(G3.mFreq==='mensal'||G3.mFreq==='quinzenal')return 'raro';
 return 'regular';
}
const EV_META={
 unico:{k:"Véspera · o dia é amanhã",h:"Uma vez só. E é amanhã.",dim:"D2",
  p:"Prometeste UM evento. Um. Não há segunda oportunidade, não há semana seguinte para corrigir. E na véspera do «{P}» falha-te a pessoa que ia trazer metade do material.",
  swot:"Meta de sessão única: qualquer falha é irrecuperável.",c:[
  {t:"Adiar duas semanas, até aquilo estar mais assente.",e:{alcance:-12,qualidade:-5},o:"Adiaste. Metade dos que iam já tinha outra coisa marcada. Um evento adiado é meio evento."},
  {t:"Fazer com metade do material. Vai notar-se, e alguém vai reparar.",reqE:{k:'preparacao',min:3},e:{qualidade:9,alcance:8,aprend:9},fail:{qualidade:-9,alcance:-7},
   o:"Cortaste o que não era essencial e ninguém deu por nada. Só quem prepara a sério sabe o que é dispensável.",of:"Cortaste ao calhas. Notou-se, e notou-se muito."},
  {t:"Pedir emprestado a quem tem.",reqE:{k:'parceiros',min:3},e:{qualidade:11,sust:8,alcance:6},fail:{qualidade:-8},
   o:"Uma chamada. Estava resolvido em duas horas. É para isto que servem os parceiros.",of:"Ligaste a pessoas que não te conhecem de lado nenhum. Ninguém empresta nada a um desconhecido na véspera."}]},
 raro:{k:"Segundo mês · a meta espaçada",h:"Entre uma sessão e a seguinte, esqueceram-se de ti",dim:"D1",
  p:"Combinaste sessões {F}. Entre uma e a outra passa tanto tempo que na segunda apareceu metade do grupo, e ninguém se lembrava do que se tinha feito na primeira.",
  swot:"Frequência baixa: o grupo não cria hábito nem memória entre sessões.",c:[
  {t:"Manter tudo. Foi aquilo que combinei com eles.",e:{alcance:-11,sust:-7},o:"Manteve-se a meta e perdeu-se o grupo. Cumprir uma meta má é cumprir mal."},
  {t:"Deixar-lhes uma coisa combinada de uma vez para a outra.",e:{alcance:12,qualidade:8,aprend:7},o:"Passaste a semanal. Foi mais trabalho e foi a decisão certa — a memória de um grupo dura menos de duas semanas."},
  {t:"Deixar-lhes uma tarefa entre sessões. Tens de a acompanhar fora.",reqE:{k:'preparacao',min:3},e:{sust:13,alcance:9,qualidade:6},fail:{sust:-5,aprend:6},
   o:"Entre sessões passaram a ter uma coisa para fazer. E a segunda sessão começou onde a primeira acabou.",of:"Criaste o grupo e não registaste nada. Ninguém soube o que era para fazer."}]},
 regular:{k:"Sexta semana · a meta regular",h:"Faltaste uma semana e o grupo desfez-se",dim:"D3",
  p:"{F}, sempre à mesma hora. Correu bem cinco semanas. Na sexta ficaste doente, não foste e não avisaste ninguém — apareceram, esperaram, foram-se embora. Na semana a seguir vieram três dos nove.",
  swot:"Regularidade quebrada sem aviso: o hábito desfaz-se mais depressa do que se cria.",c:[
  {t:"Recomeçar do zero e ir buscar os que faltam.",e:{alcance:11,qualidade:7,aprend:8},o:"Foste a casa de quatro deles. Voltaram sete. Uma falta perdoa-se — o que não se perdoa é o silêncio."},
  {t:"Continuar com os três que ficaram. Já é alguma coisa.",e:{alcance:-9,qualidade:6},o:"Ficaram três e ficaram bem. Mas eram nove."},
  {t:"Preparar alguém para dar a sessão quando faltares. Vai fazê-la à maneira dele.",reqE:{k:'parceiros',min:3},e:{sust:14,alcance:9,qualidade:6},fail:{sust:-6,aprend:7},
   o:"Passou a haver sessão mesmo sem ti. É a definição de um projeto que sobrevive.",of:"Não havia ninguém a quem pedir. Nunca tinhas envolvido ninguém — e agora era tarde."}]},
 intenso:{k:"Quarta semana · a meta intensa",h:"Não aguentas o ritmo que prometeste",dim:"D2",
  p:"Prometeste todos os dias — ou quase. São {S} sessões. Estás na quarta semana, dormiste mal, faltaste a duas, e a preparação de cada sessão está a ser feita no autocarro a caminho.",
  swot:"Meta demasiado ambiciosa para os recursos disponíveis.",c:[
  {t:"Aguentar até ao fim. Prometi, e prometido é devido.",e:{qualidade:-11,aprend:-5},o:"Aguentaste mais três semanas. As sessões passaram a ser más, e eles perceberam antes de ti."},
  {t:"Baixar a meta e dizer porquê a eles e à gestora. Fica registado.",e:{qualidade:12,aprend:13,sust:7},o:"Baixaste para duas por semana. Perdeste a meta e ganhaste o projeto. Rever uma meta não é falhar — é a única coisa que a torna verdadeira."},
  {t:"Dividir com outra pessoa. Metade das sessões são dela.",reqE:{k:'parceiros',min:3},e:{sust:13,qualidade:9,alcance:6},fail:{sust:-7,qualidade:-5},
   o:"Passaram a ser dois. As sessões voltaram a ser boas — e agora há alguém que sabe fazer aquilo além de ti.",of:"Não havia ninguém disponível. Continuas sozinho com uma meta que não cabe numa pessoa."}]}
};

const EV_OPORT=[
{k:"Semana 10",h:"Convidam-te a apresentar",dim:"D1",p:"A CMC quer o «{P}» num encontro com outras entidades. Dez minutos, sala cheia.",swot:"Visibilidade institucional junto de decisores e de outras entidades do concelho.",c:[
 {t:"Aceitar e apresentar.",badL:'timidez',e:{sust:14,alcance:9},fail:{sust:4,aprend:8},
  o:"Correu bem. Apareceram dois parceiros novos e um convite.",of:"Foste, gaguejaste, encurtaste para três minutos. Ninguém te ligou depois — mas foste."},
 {t:"Levar um dos miúdos a apresentar contigo. Se ele bloquear, é contigo.",e:{sust:11,alcance:11,aprend:10},o:"Foi ele que falou. Foi a melhor coisa que aconteceu ao projeto e à tua avaliação."},
 {t:"Declinar. Não tenho como garantir aquilo agora.",e:{sust:-10,aprend:-5},o:"O projeto ficou invisível para quem decide se ele continua."}]},
{k:"Semana 12",h:"Sai um trabalho a sério",dim:"D4",p:"Chamam-te para um contrato a tempo inteiro, noutra área. Começa já.",swot:"Oportunidade de transição para emprego — o objetivo declarado do programa.",c:[
 {t:"Aceitar e sair.",e:{sust:-8,aprend:10},o:"É esse o objetivo do programa — e tu cumpriste-o. Mas o projeto ficou sem dono."},
 {t:"Deixar o projeto entregue a alguém. Não vai ser feito como tu farias.",reqE:{k:'registo',min:3},e:{sust:16,aprend:12},fail:{sust:-6,aprend:6},
  o:"Tinhas tudo registado. Passaste a pasta e o projeto continuou sem ti. Isso chama-se sustentabilidade.",of:"Ninguém percebia como aquilo funcionava sem ti. Morreu em três semanas."},
 {t:"Recusar e ficar.",e:{qualidade:6,sust:4,aprend:-8},o:"O projeto agradece. E tu? Fica a pergunta — e é a mesma do jogo das cartas."}]},
{k:"Semana 5",h:"Oferecem-te material",dim:"D1",p:"Uma associação soube do «{P}» e oferece material que sobrou de outro programa.",swot:"Rede local disposta a ceder recursos sem custo.",c:[
 {t:"Aceitar tudo e arrumar num canto.",e:{qualidade:4,sust:-3},o:"Ficaste com material a mais e um canto a menos. Metade nunca vai ser usada."},
 {t:"Aceitar só o que serve e explicar porquê. Quem ofereceu vai achar mal.",e:{qualidade:11,sust:9},o:"Foi a primeira vez que alguém lhes recusou metade. Ficaram a respeitar-te — e a lembrar-se de ti."},
 {t:"Recusar. Não quero ficar a dever favores a ninguém.",e:{qualidade:-6,sust:-8},o:"A oferta foi para outro sítio. E o favor que não quiseste dever era, afinal, uma parceria."}]},
{k:"Semana 7",h:"Um miúdo quer ajudar-te",dim:"D1",p:"Um dos mais velhos pede para te ajudar a organizar o «{P}». Não é preciso. Mas ele quer.",swot:"Emergência de liderança entre os participantes, com potencial de continuidade.",c:[
 {t:"Dizer que sim e dar-lhe uma tarefa a sério. Se ele falhar, é contigo.",e:{alcance:9,sust:10,aprend:8},o:"Passou a haver duas pessoas a segurar o projeto. E uma delas fica cá quando tu saíres."},
 {t:"Dizer que sim, mas mantê-lo a fazer recados na mesma.",e:{alcance:3,aprend:-4},o:"Percebeu. Desistiu ao fim de três semanas — e não voltou a oferecer-se para nada."},
 {t:"Dizer que não. O projeto é meu, e a responsabilidade também.",e:{sust:-9,aprend:-6},o:"É teu, sim. E vai acabar contigo."}]},
{k:"Semana 11",h:"Outro espaço quer copiar-te",dim:"D5",p:"Uma ludoteca vizinha ouviu falar do «{P}» e quer fazer igual. Pedem-te para explicares como se faz.",swot:"Interesse de outros equipamentos em replicar o modelo.",c:[
 {t:"Partilhar tudo o que tens escrito. Fica à vista o que correu mal.",reqE:{k:'registo',min:3},e:{sust:15,aprend:8},fail:{sust:2,aprend:6},
  o:"Deste-lhes o manual. O projeto passou a existir em dois sítios — e isso conta na avaliação.",of:"Explicaste de cabeça, mas não tinhas nada escrito para dar. Ficou pela boa vontade."},
 {t:"Ir lá montar com eles.",e:{alcance:10,sust:8,qualidade:-5},o:"Cresceu. O teu tempo é que encolheu."},
 {t:"Guardar para mim. Não vale a pena fazer disto um caso.",e:{sust:-8,aprend:-6},o:"O projeto ficou único. E sozinho."}]}
];
const EV_BOSS_POOL=[
 {k:"Tfinal",h:"A avaliação do projeto saiu melhor do que devia",dim:"D4",p:"Saiu a avaliação do «{P}» feita pelo local. Está tudo em «bom» e «muito bom» — e tu sabes que houve semanas em que aquilo não fez metade do que devia.",swot:"Avaliação externa acima do desempenho real.",c:[
  {t:"Aceitar a nota. Quem a pôs é que sabe o que viu de mim.",e:{aprend:-9,qualidade:-3},o:"Ficou a nota alta. E ficou também a certeza, só tua, de que ela não valia nada — o que torna a próxima igualmente vazia."},
  {t:"Dizer que a acho alta, mas sem entrar por aí adentro.",e:{aprend:4,qualidade:-3},o:"Baixaram-na sem perceber porquê. Ficou a parecer falsa modéstia, em vez da leitura honesta que era."},
  {t:"Dizer em que semanas não estive bem. A nota desce e fica registada.",e:{aprend:13,qualidade:9,sust:5},o:"Quase ninguém faz isto, e notou-se. A conversa a seguir foi a primeira conversa a sério que tiveste sobre o teu trabalho."}]},
 {k:"Tfinal",h:"Pedem-te contas do que correu mal",dim:"D1",p:"A gestora pergunta porque é que o «{P}» ficou aquém do combinado. Metade das sessões não se fizeram — e não foi só por tua causa.",swot:"Avaliação de pares: dar feedback sobre quem trabalha ao teu lado.",c:[
  {t:"Dizer que correu tudo bem. Não vale a pena levantar poeira.",e:{qualidade:-8,sust:-5},o:"Ele continuou a faltar. E quando aquilo rebentou, tinha ficado escrito que tu não viste nada — o que também te ficou mal a ti."},
  {t:"Explicar que a culpa foi de quem faltou, e não minha.",e:{qualidade:-5,aprend:3},o:"Foi honesto e foi injusto. Um relatório só com o pior não é um retrato, é uma queixa."},
  {t:"Mostrar o que se fez e o que não se fez, e o que eu mudava.",e:{qualidade:12,aprend:9,sust:6},o:"Foi difícil de dizer e foi ouvido. É assim que se avalia alguém — com as duas metades, e com exemplos."}]},

{k:"Fim do ciclo · avaliação final",h:"Avaliar o projeto",dim:"D4",boss:true,
 p:"Chegou a altura de avaliar o «{P}». Pedem-te que mostres o que aconteceu: as {S} sessões que prometeste, {L}, e quem lá esteve.",
 swot:"Avaliação final com exigência de evidências documentais.",c:[
 {t:"Levar os registos, as fotos e os números que fui juntando.",reqE:{k:'registo',min:4},e:{sust:14,qualidade:8,aprend:6},fail:{sust:-8,aprend:8},
  o:"Tinhas tudo. A avaliação deixou de ser uma opinião sobre ti e passou a ser um retrato do que fizeste.",of:"Fizeste imenso e não conseguiste provar quase nada. É a parte mais injusta — e a mais evitável. Bastavam quatro fichas em Registo."},
 {t:"Contar de cabeça, que eu sei bem o que aconteceu lá.",e:{qualidade:-6,aprend:4},o:"Foi honesto. Mas quem avalia não estava lá, e quem não estava só vê o que está escrito."},
 {t:"Pedir aos miúdos que digam eles o que mudou para eles.",e:{qualidade:10,alcance:6,sust:4},o:"Foi a evidência mais forte que podias ter. E a única que ninguém pode contestar."}]},
{k:"Fim do ciclo · avaliação final",h:"A avaliação do projeto não bate certo",dim:"D4",boss:true,
 p:"O local avaliou o «{P}». Nos números está quase tudo em «suficiente», e um «insuficiente». Nos comentários escritos dizem que correu bem e que querem repetir. As duas coisas não podem estar certas, e a reunião é amanhã.",
 swot:"Discrepância entre a avaliação numérica e os comentários qualitativos da entidade.",c:[
 {t:"Aceitar os números. Quem lá está todos os dias é que sabe.",e:{aprend:-8,qualidade:-4},o:"Ficou nos papéis uma avaliação que nem quem a fez sabe justificar. E é essa que fica no processo do projeto."},
 {t:"Levar os registos e pedir que expliquem o «insuficiente».",reqE:{k:'registo',min:3},e:{sust:12,aprend:10,qualidade:6},fail:{aprend:6,sust:-5},
  o:"Não tinham como justificar. Corrigiram — e a partir daí passaram a avaliar com mais cuidado.",of:"Foste sem nada nas mãos. Ficou a tua palavra contra a deles, e a deles está escrita."},
 {t:"Propor avaliar outra vez daqui a um mês, com critérios escritos.",e:{sust:9,aprend:11,qualidade:5},o:"Aceitaram. E ao exigires critérios escritos, ficou uma forma de avaliar que serve para todos os projetos a seguir."}]},
{k:"Fim do ciclo · avaliação final",h:"A tua auto-avaliação não bate certo",dim:"D4",boss:true,
 p:"Puseste-te muito acima — ou muito abaixo — do que o local pôs. E agora, à frente da gestora, com o «{P}» em cima da mesa e {G} pessoas no grupo, tens de explicar a diferença.",
 swot:"Divergência entre auto-avaliação e heteroavaliação em sede de avaliação final.",c:[
 {t:"Defender a minha nota. Eu sei o trabalho que dei ali.",e:{aprend:-9,qualidade:-5},o:"Defendeste. Não ouviste. E a diferença entre o que achas de ti e o que os outros veem ficou exatamente igual."},
 {t:"Pedir um exemplo concreto para cada uma das dimensões.",e:{aprend:13,qualidade:9,sust:5},o:"Deram. Alguns doeram e tinham razão. Outros não se aguentavam de pé e caíram. Foi a conversa mais útil do ano."},
 {t:"Baixar a minha nota, para não parecer que me acho muito.",e:{aprend:-7,qualidade:-4},o:"Não é humildade — é fuga. E ninguém ficou a saber o que tu realmente achas."}]}
];
const EV_BOSS=EV_BOSS_POOL[0];
const COMPETENCIAS=[];

/* ================= JOGO 4 — Como te vês ================= */
let G4={};
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
function g4Reset(){
  const qs=[];
  Object.keys(DIMS).forEach(k=>shuffle([...G4_POOL[k]]).slice(0,2).forEach(it=>qs.push({k,t:it.t,rev:!!it.rev,freq:!!it.freq})));
  G4={step:0,qs:shuffle(qs),ans:{}};
  g4Draw();
}
function g4Draw(){
  const b=document.getElementById('g4-body');
  if(G4.step===0){
    b.innerHTML=`<div class="g4-intro">
      <p style="max-width:60ch;font-size:17px;color:var(--chalk)">Isto <b>não é o PIA</b> e não é um teste. São <b>afirmações sobre o teu dia a dia</b> — umas de concordância, outras de frequência. Para cada uma, diz o que é <b>mesmo verdade sobre ti</b>, não o que fica bem.</p>
      <p style="max-width:60ch;font-size:17px;color:var(--chalk);margin-top:14px"><b>Atenção: nem sempre concordar é "melhor".</b> Algumas afirmações estão ao contrário de propósito, e não te digo quais. Por isso não há resposta óbvia para escolher — só há a tua.</p>
      <p style="max-width:60ch;font-size:17px;color:var(--chalk);margin-top:14px">No fim tens um retrato de <b>como te vês</b>. As avaliações do EDUCA+ têm sempre uma parte de auto-avaliação; isto serve para a treinares com mais verdade.</p>
      <p class="hint" style="max-width:60ch;margin-top:14px">Não tem nota nem certo nem errado.</p>
      <button class="btn btn-yellow" style="margin-top:26px" onclick="G4.step=1;g4Draw();window.scrollTo(0,0)">Começar</button></div>`;
    return;
  }
  if(G4.step===1){
    const f=Object.keys(G4.ans).length;
    const total=G4.qs.length;
    b.innerHTML=`<div class="aviso"><b>Diz o que é verdade sobre ti</b> — não o que soa bem. Nem sempre concordar conta a favor. Para desmarcar, clica outra vez na mesma.</div>
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
  const b=document.getElementById('g4-body');
  const byDim={}; Object.keys(DIMS).forEach(k=>byDim[k]=[]);
  G4.qs.forEach((A,i)=>{ if(G4.ans[i]!==undefined) byDim[A.k].push(g4Val(A,G4.ans[i])); });
  const D={}; Object.keys(DIMS).forEach(k=>{const a=byDim[k]; D[k]=a.length?a.reduce((x,y)=>x+y,0)/a.length:5;});
  const ord=Object.keys(DIMS).map(k=>[k,D[k]]).sort((a,b)=>b[1]-a[1]);
  const alta=ord[0], baixa=ord[ord.length-1];
  const BANDAS=[[2,'1-2'],[4,'3-4'],[5,'5'],[7,'6-7'],[9,'8-9'],[10,'10']];
  const bandaCap=v=>banda(v)==='10'?'8-9':banda(v);
  const dimsDez=Object.keys(DIMS).filter(k=>banda(D[k])==='10');
  b.innerHTML=`<span class="eyebrow">O teu retrato · como te vês hoje</span>
    <p class="hint" style="max-width:62ch;margin:8px 0 20px">Isto é a <b>tua</b> leitura de ti. Numa avaliação a sério, ao lado desta fica a de quem trabalha contigo.</p>
    <div class="g4-dims">${Object.keys(DIMS).map(k=>{const v=D[k];
      return `<div class="g4-dim">
        <div class="g4-dim-top"><span class="g4-id" style="color:${DIMS[k].c}">${k}</span><b>${DIMS[k].n}</b><span class="g4-band">${bandaCap(v)}</span></div>
        <div class="g4-ladder">${BANDAS.map(([bv,bn])=>{
          const dez=bn==='10';
          const on=!dez && bandaCap(bv)===bandaCap(v);
          return `<div class="rung ${on?'on':''}" style="${on?`background:${DIMS[k].c}`:dez?'background:rgba(226,87,76,.10)':''}"><i style="${dez?'color:var(--afasta);text-decoration:line-through;opacity:.8':''}">${bn}</i></div>`;}).join('')}</div>
      </div>`;}).join('')}</div>
    <div class="g4-read">
      <p>Onde te deste a nota <b>mais alta</b>: ${DIMS[alta[0]].n}. Onde te deste a <b>mais baixa</b>: ${DIMS[baixa[0]].n} — é por aí que costuma valer a pena começar a trabalhar.</p>
      <p style="margin-top:12px"><b>Repara: nem sequer houve um 10 para escolher — e o degrau 10 está riscado.</b> É de propósito: neste retrato ninguém é 10. Não é castigo — é que o 10 é o ponto cego, o sítio onde já te achas feito e por isso deixas de ver o que te falta. O topo aqui é 9, e mesmo esse é raro.${dimsDez.length?` Puseste-te no máximo em <b>${dimsDez.map(k=>DIMS[k].n).join('</b>, <b>')}</b> — é aí que vale a pena começar a rever.`:''}</p>
      <p style="margin-top:12px">E é <b>normal</b> que, com o tempo, te dês notas mais <b>baixas</b> em algumas coisas. Não é piorares — é perceberes melhor o que o trabalho exige.</p>
    </div>
    <div class="g4-rev">
      <span class="eyebrow">As doze afirmações — e quanto valeu cada resposta</span>
      <p class="hint" style="margin:8px 0 18px;max-width:66ch">O número à frente de cada resposta é o que ela conta (1 a 9 — nunca 10). As marcadas com <b>↺</b> estavam ao contrário de propósito: aí, concordar contava a <b>menos</b>.</p>
      ${G4.qs.map((A,i)=>{const labels=A.freq?G4_SCALE.freq:G4_SCALE.agree; const meu=G4.ans[i];
        return `<div class="revq">
          <div class="revq-top"><span class="g4-id" style="color:${DIMS[A.k].c}">${A.k}${A.rev?' ↺':''}</span><b>${A.t}</b></div>
          ${labels.map((lab,idx)=>`<div class="revl ${idx===meu?'meu':''}"><span class="revn">${g4Val(A,idx)}</span><span>${lab}</span>${idx===meu?'<em>a tua</em>':''}</div>`).join('')}
          ${A.rev?`<p class="hint" style="margin-top:6px;opacity:.7">↺ ao contrário — repara como o número desce à medida que concordas mais.</p>`:''}
        </div>`;}).join('')}
    </div>
    <div style="margin-top:26px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-solid" onclick="g4PDF()">Guardar PDF</button>
      <button class="btn btn-yellow" onclick="g4Reset();window.scrollTo(0,0)">Outra vez, com outras situações</button>
      <button class="btn" onclick="go('home')">Menu</button></div>`;
  window.scrollTo(0,0);
}

