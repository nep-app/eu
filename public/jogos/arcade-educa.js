function go(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));
  document.getElementById(id).classList.add('on');window.scrollTo(0,0);
  if(id!=='g2')g2Stop(); if(id==='g3')g3Reset(); if(id==='g1')g1Reset(); if(id==='g4')g4Reset();
}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

/* ================= JOGO 1 ================= */
const CARDS=[
{t:"Estudar para um teste mesmo sem vontade.",k:'a',f:"Alguma coisa te fez responder isto. O que é que estudar sem vontade já te custou?",d:"Depende de quê — do teste, da vontade, ou de para que serve o curso?",a:"Aparecer sem vontade é metade do trabalho feito. Mas não ignores a falta de vontade quando ela for constante: também é informação."},
{t:"Escolher um curso porque os outros dizem que é bom para mim.",k:'?',f:"Mesmo quando quem diz te conhece melhor do que tu te conheces? Às vezes vemo-nos mal de dentro.",d:"Depende de quem diz. Quem te deu o conselho conhece-te — ou só conhece o mercado?",a:"Então onde acaba o conselho e começa a tua decisão? Quem vai à aula todos os dias és tu."},
{t:"Gastar 40€ numa noite quando faltam 60€ para a inscrição do curso.",k:'f',f:"Sim. E não é sobre não saíres — é sobre a ordem das coisas. O que é que costuma vir primeiro, para ti?",d:"Depende de quantas vezes por mês — ou de há quanto tempo andas a adiar a inscrição?",a:"Descansar faz falta, a sério. Mas isto é descanso, ou é adiar a inscrição mais uma vez? Responde só para ti."},
{t:"Pedir ajuda quando não percebo.",k:'a',f:"Alguém já te fez sentir mal por perguntares? Costuma ser daí que vem esta resposta.",d:"Depende de a quem pedes — ou de quantas vezes já pediste a mesma coisa?",a:"É das melhores coisas que podes fazer. Uma pergunta só: tentas primeiro, ou pedes logo?"},
{t:"Passar o dia nas redes sociais.",k:'f',f:"Sim — o dia inteiro tira o tempo a tudo o resto. Quanto tempo é que gostavas de lá passar, se pudesses escolher?",d:"Depende do que fazes lá, ou de quanto tempo? Só uma das duas perguntas é sobre ti.",a:"Pode dar contactos, aprendizagem ou descanso. Qual dos três é, no teu caso? Ninguém está a ouvir."},
{t:"Faltar sem avisar.",k:'f',f:"Sim. Avisar é o mínimo e é fácil. Mas já aconteceu — o que é que costuma estar por trás quando não consegues mandar a mensagem?",d:"O motivo da falta pode depender. Mas avisar depende de quê?",a:"Às vezes desaparecer é a única forma que se conhece de dizer que não se aguenta. Se for isso, há maneiras melhores — e há quem esteja lá para as ouvir."},
{t:"Inscrever-me num curso de que gosto, mesmo sendo difícil.",k:'a',f:"Difícil demais existe mesmo. Como é que distingues \'difícil\' de \'impossível para mim, agora\'?",d:"Depende do quão difícil — ou do que tens de largar para o fazer?",a:"Boa. E se for difícil ao ponto de chumbares, o que é que te ajudaria a aguentar? Vale a pena pensar nisso antes, não depois."},
{t:"Desistir no primeiro obstáculo.",k:'f',f:"Sim. O primeiro obstáculo aparece sempre — é o único que aparece de certeza. O que é que te costuma fazer parar?",d:"Depende do obstáculo. Diz-me um que te fizesse parar sem culpa nenhuma. Esses existem.",a:"Há um caso em que parar cedo é sensato: quando percebes que estavas no caminho errado. É isso — ou é o costume?"},
{t:"Ir à procura de formações em vez de esperar que apareçam.",k:'a',f:"É cansaço, ou é não saber onde procurar? Resolvem-se as duas — mas de maneiras diferentes.",d:"Depende de quê? Procurar sem saber o que se quer também é andar às voltas.",a:"Boa. Um cuidado só: inscrever-se é fácil, acabar é que é o trabalho. Quantas é que já começaste?"},
{t:"Seguir o grupo mesmo sabendo que estão errados.",k:'f',f:"Sim. E é fácil dizer isso sentado aqui — o difícil é na altura, com eles à tua frente. O que é que te ajudaria a aguentar?",d:"Depende do preço de sair do grupo. Qual é o teu preço — e quem paga se ficares?",a:"O grupo dá-te alguma coisa importante, e isso é real. Mas as consequências vêm sozinhas para ti. Compensa?"},
{t:"Dizer \'não\' a algo que não quero fazer.",k:'?',f:"Dizer sim a tudo deixa-te sem tempo para o que é teu. Também sabes isso.",d:"Depende, sim. Onde é que está a fronteira entre protegeres-te e fechares portas?",a:"E dizer não a tudo o que dá trabalho? Metade do que sabes começou por ser um \'não me apetece\'."},
{t:"Cumprir prazos.",k:'a',f:"Isso é raro. O que é que te levou a responder assim?",d:"Depende de quê — da qualidade do que entregas, ou de quem definiu o prazo?",a:"Concordo. Uma nuance: entregar a horas uma coisa má não conta. Já te aconteceu?"},
{t:"Deixar tudo para a última hora.",k:'f',f:"Sim. Às vezes sai bem — o problema é o custo de descobrir as vezes em que sai mal. Isso já te custou o quê?",d:"Depende do trabalho — ou de já teres experimentado o contrário alguma vez?",a:"Há quem funcione com pressão em cima. Mas é mesmo isso, ou é o que se diz para não mudar nada?"},
{t:"Assumir um erro em vez de culpar outro.",k:'a',f:"Já assumiste um erro e pagaste caro? Acontece — e não invalida o resto.",d:"Depende de quem está a ouvir. Nem todos os sítios são seguros para admitir erros. Este é?",a:"Sim. E o inverso também existe: assumir erros que não são teus para manter a paz. Cuidado com esse."},
{t:"Faltar a uma entrevista de emprego.",k:'f',f:"Sim. E mesmo quando já percebeste que não queres aquilo, duas linhas a avisar chegam — e mantêm a porta aberta.",d:"O emprego pode depender. Avisar não. O que é que te trava à porta?",a:"Não te vou pedir que defendas isto. Mas responde: o que é que te faria mesmo não aparecer? É aí que está a conversa."},
{t:"Trocar um jantar com amigos para pagar o que falta da carta.",k:'?',f:"Então a carta espera. Há quanto tempo é que ela já está à espera?",d:"Depende de quantos jantares. Um é disciplina. Todos é isolamento — e o nome muda.",a:"E se trocares todos os jantares durante um ano? Quando tirares a carta, tens a quem contar?"},
{t:"Resolver um conflito a falar calmamente.",k:'a',f:"Já falaste calmamente e não resultou de todo? Acontece, e é uma informação útil.",d:"Depende do outro. Nem toda a gente quer falar. O que fazes nesse caso?",a:"É o teu trabalho. Uma coisa só: calma não é engolir. Sabes onde está a linha?"},
{t:"Definir um objetivo para os próximos 5 anos.",k:'?',f:"Cinco anos é muito, sim. Mas nenhum plano é pior do que um plano errado?",d:"Depende de quanto controlo tens sobre os próximos cinco anos. Quanto é que tens, mesmo?",a:"E se o objetivo te prender? Um plano velho a que se obedece é uma prisão com data marcada."},
{t:"Aceitar um trabalho temporário que não é o que sonho fazer.",k:'?',f:"Paga contas e dá experiência. Recusar por princípio é um luxo. Tens esse luxo?",d:"Depende do prazo. Qual é o teu limite antes de reavaliares — seis meses, dois anos?",a:"E se ficares lá cinco anos? \'Temporário\' é o nome, não é a garantia."},
{t:"Investir tempo a aprender uma competência nova.",k:'a',f:"Tempo tirado de onde? É a pergunta a sério — e talvez a tua resposta venha daí.",d:"Depende de qual competência — ou de para que serve?",a:"Sim. Só não deixes que aprender coisas novas seja a forma de nunca acabar as antigas."},
{t:"Desistir de um sonho por medo de falhar.",k:'f',f:"Sim. O medo de falhar é informação, não é uma ordem. Do que é que ele te está a proteger?",d:"Depende do sonho — e de quem o sonhou primeiro. Foste tu, ou foi a tua família?",a:"Há uma coisa parecida que não é medo: perceber que o sonho já não é teu. É isso — ou é medo com outro nome?"},
{t:"Ficar no mesmo projeto porque é seguro, mesmo com uma oportunidade melhor lá fora.",k:'?',f:"O EDUCA+ existe para te lançar, não para te guardar. Mas a segurança não vale nada?",d:"Depende do que te prende: o projeto, ou o medo do que vem a seguir? Não é a mesma coisa.",a:"Diz o nome do que te prende. Se for a equipa, é uma resposta. Se for o medo, é outra."},
{t:"Pedir uma oportunidade sem ter a certeza de que a mereço.",k:'?',f:"Quem decide se mereces és tu — ou é quem está do outro lado da mesa?",d:"Depende. Quantas vezes é que já decidiste por eles, e disseste não antes de te perguntarem?",a:"Pedir é quase sempre bom. Só não dispenses a preparação: pedir sem nada preparado também fecha portas."},
{t:"Deixar de ir às sessões porque arranjei trabalho.",k:'?',f:"Espera. O objetivo deste programa é exatamente esse — que arranjes trabalho.",d:"Depende. O trabalho é o fim ou é um passo? E as sessões dão-te o quê que o trabalho não dá?",a:"Mas avisa. Sair bem é uma coisa; desaparecer é outra — e uma delas fecha a porta de volta."},
{t:"Contar a quem me acompanha uma coisa de que tenho vergonha.",k:'?',f:"Nem tudo tem de ser dito, é verdade. Mas o que é que te custa a ti guardar isso sozinho?",d:"Depende da confiança. Já a testaste — ou estás a decidir por essa pessoa antes de tentar?",a:"Boa. E podes perguntar o que fica escrito e o que fica só na sala. Tens esse direito."},
{t:"Fazer horas a mais sem receber, porque estão a contar comigo.",k:'?',f:"Uma vez, no arranque, pode abrir portas. Há diferença entre disponibilidade e hábito.",d:"Depende de quantas vezes. Uma vez é disponibilidade. Sempre é abuso — e o nome muda a meio.",a:"Onde é que isto acaba? Quem nunca diz não passa a ser quem fica sempre. E o teu tempo vale dinheiro."},
{t:"Recusar um trabalho porque paga pouco.",k:'?',f:"Então aceitas qualquer coisa? O teu tempo vale um número. Sabes qual é?",d:"Depende de quão pouco — e do que ganhas além do dinheiro. Aprendes lá alguma coisa?",a:"E se pagar mal mas for a única porta aberta? Recusar por princípio custa meses parado."},
{t:"Fazer sozinho para não ter de pedir.",k:'f',f:"Sim. Ainda assim, há coisas que fazes mesmo melhor sozinho. O problema é quando é sempre — e é sempre?",d:"Depende do quê? De quem terias de pedir?",a:"Percebo. Mas faz a conta uma vez: o que é que perdes de cada vez que não pedes?"},
{t:"Aceitar ser colocado num equipamento longe de casa.",k:'?',f:"É uma hora de transporte por dia, e isso pesa. Mas quantas oportunidades é que já recusaste por causa da distância?",d:"Depende de quão longe, e do que ganhas por ir. O programa avalia a tua Autonomia — e chegar onde é preciso faz parte dela.",a:"E se a viagem te consumir a energia toda? Aceitar tudo também é uma forma de não escolher nada."},
{t:"Faltar a uma supervisão porque não me apetece falar.",k:'f',f:"Sim. E é normal não apetecer — a supervisão existe precisamente para os dias em que não apetece.",d:"Há dias assim, e são legítimos. Mas é o dia, ou é o costume a começar?",a:"Descansar é preciso. Só que a supervisão é o sítio onde se diz que se está cansado. Faltar a esse é ficar sozinho com isso."},
{t:"Chegar sempre a horas mesmo quando ninguém repara.",k:'a',f:"Explica-me. O que é que a pontualidade já te tirou?",d:"Depende de quem repara? Então a pontualidade é para os outros, e não para ti?",a:"Sim. Só não confundas: estar a horas é a porta de entrada, não é a competência."},
{t:"Aceitar uma crítica sem responder logo a defender-me.",k:'a',f:"Já levaste com críticas injustas e é por isso. Mas repara: estás a defender-te de todas para não levares com essa.",d:"Depende de quem critica, ou de como o faz? Só uma dessas coisas está fora do teu controlo.",a:"Custa e é raro. Uma nuance: ouvir não é engolir. Podes ouvir até ao fim e depois discordar — isso continua a contar."},
{t:"Dizer à coordenadora que discordo de uma decisão dela.",k:'?',f:"Nunca discordar em voz alta faz de ti fácil de gerir e invisível. Qual das duas te serve mais?",d:"Depende do quê — da decisão, ou do risco que sentes que corres? Diz o nome ao que te trava.",a:"Depende de como. Discordar à frente de todos e discordar a sós são coisas diferentes, com resultados diferentes."},
{t:"Ir trabalhar doente para não faltar.",k:'f',f:"Sim. E ainda assim vais lá. O que é que te acontece na cabeça quando pensas em ligar a dizer que não vais?",d:"Depende de quão doente. Onde é que puseste a linha da última vez?",a:"Estás a dizer que vale a pena. Vale para quem? Com miúdos, doente também é contagiar."},
{t:"Pedir mais horas ou melhores condições quando acho que mereço.",k:'?',f:"Se nunca pedes, ninguém te oferece. O que é que costuma acontecer na tua cabeça a meio da frase?",d:"Depende de teres com que sustentar o pedido. Tens? Isso não é desculpa — é preparação.",a:"Pedir é meio caminho. A outra metade é saber o que fazes se disserem que não."},
{t:"Deixar o telemóvel de lado durante a sessão com os miúdos.",k:'a',f:"Explica. O que é que perdes se o telemóvel ficar no bolso durante uma hora?",d:"Depende de para que o usas? Se é para o trabalho, é uma coisa. Se é para responder a mensagens, é outra.",a:"Sim. E vale mais do que parece: eles reparam em quem está mesmo ali. É a coisa mais barata que podes fazer."},
{t:"Contar a um colega uma coisa que um miúdo me disse em segredo.",k:'f',f:"Sim. E a exceção existe: se houver risco, tens de contar — mas ao técnico de referência, não ao colega do lado.",d:"Depende do quê? Da gravidade, ou de quem é o colega? Só uma dessas justifica.",a:"Percebo o alívio de partilhar. Mas se ele souber, não te conta mais nada — e a próxima coisa pode ser das graves."},
{t:"Ficar depois da hora a acabar uma coisa que ninguém pediu.",k:'?',f:"Às vezes é isso que faz a diferença entre estar e trabalhar. Quantas vezes é que isso te aconteceu este mês?",d:"Depende da frequência. Uma vez é dedicação. Todas as semanas é o horário mal feito — e o teu tempo a pagar.",a:"E quem é que sabe que ficaste? Se ninguém souber, não é dedicação, é hábito. Diz a alguém."},
{t:"Emprestar dinheiro a um amigo quando não me sobra.",k:'?',f:"Então também sabes o que é precisar. O que é que te faz dizer que não?",d:"Depende de quanto, ou de quem? Uma dessas perguntas é sobre o teu limite, a outra é sobre a relação.",a:"E se não devolverem? Empresta só o que consegues perder sem ficar zangado — o resto perde-se duas vezes."},
{t:"Guardar o contrato e os recibos num sítio onde os encontro.",k:'a',f:"Chateia, sim. Mas no dia em que precisares de provar o que ganhaste, aquele papel é a única coisa que fala por ti.",d:"Depende de quê? De precisares deles? Só descobres que precisas no dia em que já não os tens.",a:"Boa. E vê se percebes o que está lá escrito — quantas horas, quanto por hora, quem te paga. Isso é teu."},
{t:"Aceitar que um miúdo goste mais de outro monitor do que de mim.",k:'a',f:"Custa. Mas se te custa muito, pergunta-te para que é que estás ali: para eles gostarem de ti, ou para eles ficarem melhor?",d:"Depende do porquê. Se é feitio, deixa andar. Se é porque o outro faz alguma coisa que tu não fazes, vale a pena ver o quê.",a:"Isso é maturidade a sério. E às vezes o teu trabalho é exatamente esse: ligá-lo a quem lhe faz melhor do que tu."},
{t:"Publicar fotos dos miúdos nas minhas redes.",k:'f',f:"Sim. E não é só a autorização: é que a foto fica online mais tempo do que a infância deles.",d:"Depende da autorização — mas depende também de para quê. Para mostrar o trabalho, ou para mostrar que estás lá?",a:"Mesmo com autorização dos pais: a cara é deles, e vai ficar lá quando tiverem trinta anos. Pergunta a eles."},
{t:"Perguntar o que não percebi numa reunião com pessoas mais velhas.",k:'a',f:"O medo de parecer burro cala mais gente do que a falta de vontade. O que é que achas que aconteceria mesmo?",d:"Depende de quem está na sala? Então há salas onde não podes perguntar — e isso é sobre a sala, não sobre ti.",a:"Sim. E metade da sala não percebeu também. Perguntar em voz alta é fazer-lhes um favor."},
{t:"Trabalhar bem com alguém de quem não gosto.",k:'a',f:"É difícil e cansa. Mas se só trabalhas com quem gostas, vais trabalhar sozinho mais cedo ou mais tarde.",d:"Depende do quanto não gostas — ou de ele saber que não gostas? Só uma dessas te complica o trabalho.",a:"Sim, e é uma competência a sério. Só não confundas trabalhar bem com fingir que está tudo bem."},
{t:"Dizer que sei fazer uma coisa que nunca fiz, para não perder a oportunidade.",k:'f',f:"Sim. E a versão que resulta é parecida: «nunca fiz, mas aprendo depressa — dá-me dois dias.» Já experimentaste?",d:"Depende de conseguires aprender a tempo. E consegues? Responde a sério, que a resposta tem consequências.",a:"Percebo a tentação. Mas o dia em que se descobre custa mais do que a oportunidade valia."},
{t:"Levar os problemas de casa para dentro do espaço.",k:'f',f:"Sim, mas há um limite nisso: quem carrega tudo sozinho rebenta. Não é levar para os miúdos — é dizer a alguém da equipa.",d:"Depende de para quem os levas. Para os miúdos, não. Para a supervisão, é exatamente para isso que ela existe.",a:"Cuidado. Eles não têm de segurar o que é teu — e reparam mais do que pensas."},
{t:"Comparar o meu percurso com o de quem começou comigo.",k:'?',f:"Nunca comparar também tira referências. O que é que te dá saber que alguém já lá chegou?",d:"Depende do que fazes com a comparação: se te faz mexer, serve. Se te faz parar, come-te.",a:"E se estiveres a comparar coisas diferentes? Ninguém sabe o que o outro largou pelo caminho."},
{t:"Candidatar-me a uma coisa em que provavelmente não entro.",k:'a',f:"Poupas o desgosto e poupas a hipótese. Quantas é que já não pediste por teres decidido por eles?",d:"Depende do trabalho que dá candidatar. Se der duas horas, o que é que perdes mesmo?",a:"Boa. E prepara-a a sério — candidatar-se por candidatar ensina pouco e fecha a porta na mesma."},
{t:"Escrever o que aconteceu numa sessão, mesmo quando não aconteceu nada de especial.",k:'a',f:"Parece perda de tempo até ao dia em que te perguntam o que aconteceu há três semanas.",d:"Depende de quê? De haver alguma coisa a contar? O «nada de especial» de hoje é o padrão que se vê daqui a dois meses.",a:"Sim. Duas linhas chegam. O que não se escreve, desaparece — e o teu trabalho com ele."},
{t:"Ir a uma entrevista mal preparado porque não tinha esperança.",k:'f',f:"Sim. E repara no que fizeste: decidiste o resultado antes de eles decidirem, e depois cumpriste-o.",d:"Depende de quanto tempo tinhas. Mas meia hora a ver o que a entidade faz, tinhas.",a:"Estás a proteger-te da desilusão. Percebo — mas o preço é nunca saberes se davas."},
{t:"Aceitar ajuda de alguém mais novo do que eu.",k:'a',f:"O que é que te custa aí? Se for o que os outros pensam, isso passa. Se for o que tu pensas, dá mais trabalho.",d:"Depende do quê — de ele saber mesmo, ou de como o oferece?",a:"Sim. Nos jogos, no digital, nas redes — há miúdos de quinze que te ensinam em dez minutos o que levarias um mês."},
{t:"Bloquear alguém em vez de resolver a conversa.",k:'?',f:"Há casos em que bloquear é a única resposta certa, e não tens de justificar esses a ninguém.",d:"Depende de quem. De alguém que te faz mal, bloqueia. De um colega com quem tens de trabalhar, adia o problema.",a:"E se for alguém com quem vais ter de estar na mesma sala? Aí só mudaste o sítio da conversa."},
{t:"Dizer a um miúdo que não sei a resposta.",k:'a',f:"Achas que perdes autoridade. Testa: eles percebem quando inventas, e é aí que a perdes de verdade.",d:"Depende da pergunta? Então há perguntas em que finges saber. Quais?",a:"Sim — e melhora se acrescentares «vou descobrir». Depois descobre mesmo, senão é pior do que ter inventado."},
{t:"Pedir para mudar de equipamento porque não me dou com a equipa.",k:'?',f:"Aguentar tem limite. Se já tentaste falar e não mudou nada, pedir não é fraqueza.",d:"Depende de já teres tentado resolver. Tentaste? Mudar sem tentar leva o problema contigo.",a:"E se o problema for teu? Muda-se de sítio, não se muda de feitio — vale a pena saber qual dos dois é."},
{t:"Ficar amigo dos miúdos nas redes sociais.",k:'?',f:"É a forma mais fácil de chegar a eles, e sabes disso. O que é que te preocupa?",d:"Depende do que lá pões e do que vês. A tua vida privada fica a um clique da relação de trabalho.",a:"E quando vires uma coisa que preferias não ter visto? Aí já não dá para não saber."},
{t:"Aceitar que este trabalho pode não ser para sempre.",k:'a',f:"Custa. Mas o programa existe para te lançar, e isso implica que um dia acaba.",d:"Depende de teres para onde ir a seguir. E é essa a pergunta que vale a pena responder já, não no último mês.",a:"Sim. E é agora, com contrato, que se prepara o depois. Não é quando ele acabar."},
{t:"Ficar calado numa reunião para não dizer asneira.",k:'?',f:"Ficar calado também é uma escolha, e tem consequências: quem nunca fala não é chamado a decidir.",d:"Depende de teres alguma coisa a dizer. Tens, e calas? Ou não tinhas mesmo?",a:"E se a asneira for o que faltava dizer? A sala mais silenciosa costuma ser a que tem mais gente a pensar o mesmo."},
{t:"Aceitar um elogio sem dizer «não foi nada».",k:'a',f:"Explica: o que é que te acontece quando alguém te elogia à frente dos outros?",d:"Depende de o mereceres? Isso decides tu depois. Na altura, «obrigado» chega.",a:"Sim, e é mais difícil do que parece. Quem nunca aceita elogios acaba a acreditar que não os teve."},
{t:"Faltar a uma formação porque é ao sábado.",k:'?',f:"Os sábados são teus, e isso é legítimo. Mas quantas foram este ano?",d:"Depende de quantas já foram — e do que te dão. Nem todas valem o sábado, e algumas valem o mês.",a:"Vai a todas e não te sobra vida. Não vais a nenhuma e ficas onde estás. Onde é que puseste a linha?"}
];
const LADO={f:'Afasta-me',d:'Depende',a:'Aproxima-me'};
let g1i=0,g1Deck=[],g1Log=[],g1T0=0,g1Cnt={f:0,d:0,a:0};
function g1Reset(){
  g1i=0;g1Log=[];g1Cnt={f:0,d:0,a:0};g1Deck=shuffle([...CARDS]).slice(0,12);
  document.getElementById('g1-intro').style.display='';
  document.getElementById('g1-play').style.display='none';
  document.getElementById('g1-end').style.display='none';
  ['f','d','a'].forEach(k=>{document.getElementById('g1-ch'+k).innerHTML='';document.getElementById('g1-c'+k).textContent='0';});
  document.getElementById('g1-fb').innerHTML='';
}
function g1Start(){document.getElementById('g1-intro').style.display='none';document.getElementById('g1-play').style.display='';g1Render();}
function g1Render(){
  const c=g1Deck[g1i];
  document.getElementById('g1-idx').textContent=`CARTA ${String(g1i+1).padStart(2,'0')} / ${g1Deck.length}`;
  document.getElementById('g1-txt').textContent=c.t;
  document.getElementById('g1-bar').style.width=(g1i/g1Deck.length*100)+'%';
  document.getElementById('g1-fb').innerHTML='';
  document.getElementById('g1-sw').style.display='';
  const card=document.getElementById('g1-card');card.classList.remove('fly-l','fly-r','fly-d');
  g1T0=Date.now();
}
function g1Answer(side){
  if(document.getElementById('g1-sw').style.display==='none')return;
  const c=g1Deck[g1i],dt=(Date.now()-g1T0)/1000;
  g1Log.push({c,side,hes:dt>10});
  const short=c.t.length>34?c.t.slice(0,32)+'…':c.t;
  g1Cnt[side]++;
  document.getElementById('g1-ch'+side).insertAdjacentHTML('beforeend',`<div class="chip">${short}</div>`);
  document.getElementById('g1-c'+side).textContent=g1Cnt[side];
  document.getElementById('g1-card').classList.add(side==='f'?'fly-l':side==='a'?'fly-r':'fly-d');
  document.getElementById('g1-sw').style.display='none';
  const last=g1i>=g1Deck.length-1;
  document.getElementById('g1-fb').innerHTML=`<div class="reply ${side==='d'?'dep':''}">
    <span class="tag">Puseste em "${LADO[side]}"</span><p>${c[side]}</p>
    <div class="next"><span class="kb">espaço ou enter</span>
    <button class="btn" onclick="g1Adv()">${last?'Ver o guião':'Próxima carta'} →</button></div></div>`;
}
function g1Adv(){g1i++;if(g1i>=g1Deck.length)g1End();else g1Render();}
function g1End(){
  document.getElementById('g1-play').style.display='none';
  const end=document.getElementById('g1-end');end.style.display='';
  const itens=[];
  g1Log.forEach(l=>{
    const tags=[];let p=null;
    if(l.side==='d'){tags.push(['tp-dep','pôs em Depende']);p=l.c.d;}
    if(l.c.k!=='?'&&l.side!=='d'&&l.side!==l.c.k){tags.push(['tp-con','respondeu ao contrário do que o programa defende']);p=p||l.c[l.side];}
    if(l.c.k==='?'&&l.side!=='d'){tags.push(['tp-dep','carta sem resposta certa']);p=p||l.c[l.side];}
    if(l.hes){tags.push(['tp-hes','demorou +10s a decidir']);p=p||l.c[l.side];}
    if(tags.length)itens.push({t:l.c.t,lado:LADO[l.side],q:p,tags});
  });
  try{ if(window.parent!==window) window.parent.postMessage({type:'educa:cartas',afasta:g1Cnt.f,depende:g1Cnt.d,aproxima:g1Cnt.a,guiao:itens},'*'); }catch(e){}
  end.innerHTML=`<div class="center" style="padding:14px 0 6px">
    <span class="eyebrow">Fim do baralho</span>
    <h2 class="display" style="font-size:clamp(28px,5.2vw,46px);margin-top:12px;line-height:1.15">
      <span style="color:var(--afasta)">${g1Cnt.f} afastam</span> · <span style="color:var(--depende)">${g1Cnt.d} dependem</span> · <span style="color:var(--aproxima)">${g1Cnt.a} aproximam</span></h2>
    <p class="hint" style="margin:16px auto 0;max-width:54ch">Não há pontuação.</p></div>
    <div class="guiao"><h3>Guião de conversa</h3>
    <p class="sub">${itens.length===0?'Respondeste sem demoras e sempre no sentido esperado, e não puseste nada em Depende. Isso, por si só, é o tema da sessão: ninguém acha tudo óbvio.':`${itens.length} carta${itens.length>1?'s':''} para levar à supervisão. Só entram no guião as cartas que dão conversa — as outras ficam de fora.`}</p>
    <div class="legenda">
      <span class="eyebrow" style="color:#8b8499">O que significam as etiquetas</span>
      <dl>
        <dt><span class="tagpill tp-dep">pôs em Depende</span></dt>
        <dd>Não quis escolher um lado. Vale a pena perguntar do que é que depende — a resposta é quase sempre mais interessante do que a carta.</dd>
        <dt><span class="tagpill tp-dep">carta sem resposta certa</span></dt>
        <dd>É uma das cartas que o jogo marcou como genuinamente discutível (ex.: <em>deixar de ir às sessões porque arranjei trabalho</em>). Entra no guião mesmo quando a pessoa respondeu com convicção — precisamente porque não há resposta certa.</dd>
        <dt><span class="tagpill tp-con">respondeu ao contrário do que o programa defende</span></dt>
        <dd>Ex.: pôs <em>faltar sem avisar</em> em Aproxima-me. Não quer dizer que esteja errada. Quer dizer que há aqui uma razão que ainda não conhecemos — e é isso que se pergunta.</dd>
        <dt><span class="tagpill tp-hes">demorou +10s a decidir</span></dt>
        <dd><b>Cuidado com esta.</b> O jogo só sabe que a pessoa levou mais de 10 segundos a carregar no botão. Pode ser hesitação a sério — ou pode ter estado só a ler devagar, ou distraída. Use como pista para uma pergunta, nunca como facto.</dd>
      </dl>
    </div>
    <ol>${itens.map(i=>`<li><strong>${i.t}</strong><span class="resp">respondeu <b>${i.lado}</b></span>${i.tags.map(t=>`<span class="tagpill ${t[0]}">${t[1]}</span>`).join('')}<span class="perg">${i.q}</span></li>`).join('')}</ol></div>
    <div class="center" style="margin-top:28px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-yellow" onclick="g1Reset();g1Start()">Jogar outra vez</button>
      <button class="btn" onclick="go('home')">Menu</button></div>`;
}

/* ================= JOGO 2 ================= */
const TABU=[
{w:"Ludoteca",b:["Brincar","Jogos","Espaço"]},
{w:"Autorização",b:["Pais","Assinar","Deixar"]},
{w:"Primeiros socorros",b:["Ferida","Sangue","Ajudar"]},
{w:"Formação",b:["Curso","Aprender","Certificado"]},
{w:"Adolescência",b:["Crescer","Idade","Puberdade"]},
{w:"Voluntariado",b:["Ajudar","Sem receber","Tempo"]},
{w:"Acolhimento",b:["Receber","Chegar","Bem-vindo"]},
{w:"Rotina",b:["Todos os dias","Hábito","Repetir"]},
{w:"Regra",b:["Proibido","Cumprir","Norma"]},
{w:"Limite",b:["Até aqui","Travar","Dizer não"]},
{w:"Dinâmica de grupo",b:["Atividade","Jogo","Juntos"]},
{w:"Planeamento",b:["Plano","Organizar","Calendário"]},
{w:"Materiais",b:["Comprar","Coisas","Usar"]},
{w:"Divulgação",b:["Cartaz","Avisar","Espalhar"]},
{w:"Registo",b:["Escrever","Papel","Anotar"]},
{w:"Folha de presenças",b:["Assinar","Faltar","Nome"]},
{w:"Horário",b:["Horas","Entrada","Saída"]},
{w:"Pontualidade",b:["Horas","Atrasar","Chegar"]},
{w:"Assiduidade",b:["Faltar","Presença","Estar"]},
{w:"Improviso",b:["Inventar","Na hora","Sem plano"]},
{w:"Arrumação",b:["Arrumar","Fim","Guardar"]},
{w:"Mediador",b:["Mediar","Conflito","Escola"]},
{w:"Escuta ativa",b:["Ouvir","Atenção","Falar"]},
{w:"Conflito",b:["Zanga","Briga","Discussão"]},
{w:"Bullying",b:["Gozar","Bater","Vítima"]},
{w:"Exclusão",b:["Fora","Deixar","Sozinho"]},
{w:"Inclusão",b:["Dentro","Todos","Incluir"]},
{w:"Pertença",b:["Pertencer","Fazer parte","Grupo"]},
{w:"Respeito",b:["Respeitar","Educação","Tratar"]},
{w:"Empatia",b:["Sentir","Lugar do outro","Compreender"]},
{w:"Confiança",b:["Confiar","Segredo","Acreditar"]},
{w:"Confidencialidade",b:["Segredo","Sigilo","Contar"]},
{w:"Preconceito",b:["Julgar","Antes","Ideia feita"]},
{w:"Discriminação",b:["Diferente","Tratar mal","Racismo"]},
{w:"Diversidade",b:["Diferente","Vários","Culturas"]},
{w:"Cooperação",b:["Ajudar","Juntos","Equipa"]},
{w:"Partilha",b:["Partilhar","Dividir","Dar"]},
{w:"Amizade",b:["Amigo","Confiança","Companhia"]},
{w:"Comunicação não violenta",b:["Comunicar","Violência","Falar"]},
{w:"Feedback",b:["Dizer","Melhorar","Opinião"]},
{w:"Encaminhamento",b:["Encaminhar","Enviar","Serviço"]},
{w:"Supervisão",b:["Supervisor","Sessão","Acompanhar"]},
{w:"Avaliação",b:["Avaliar","Nota","Grelha"]},
{w:"Auto-avaliação",b:["Avaliar","Próprio","Nota"]},
{w:"Meta",b:["Objetivo","Alcançar","Número"]},
{w:"Indicador",b:["Medir","Número","Avaliar"]},
{w:"Diagnóstico",b:["Problema","Necessidade","Perceber"]},
{w:"Necessidade",b:["Precisar","Falta","Preciso"]},
{w:"PIA",b:["Plano","Individual","Ação"]},
{w:"Projeto de vida",b:["Futuro","Objetivos","Plano"]},
{w:"Educação não formal",b:["Escola","Aprender","Brincar"]},
{w:"Parceria",b:["Parceiro","Juntos","Entidade"]},
{w:"Comunidade",b:["Bairro","Pessoas","Vizinhos"]},
{w:"Currículo",b:["CV","Papel","Experiência"]},
{w:"Entrevista",b:["Perguntas","Emprego","Candidato"]},
{w:"Contrato",b:["Assinar","Trabalho","Papel"]},
{w:"Recibo de vencimento",b:["Salário","Papel","Mês"]},
{w:"Estágio",b:["Trabalhar","Aprender","Empresa"]},
{w:"Absentismo",b:["Faltar","Escola","Presença"]},
{w:"Insucesso escolar",b:["Notas","Chumbar","Passar de ano"]},
{w:"Abandono escolar",b:["Sair","Desistir","Estudar"]},
{w:"Autonomia",b:["Sozinho","Depender","Independente"]},
{w:"Responsabilidade",b:["Culpa","Assumir","Dever"]},
{w:"Proatividade",b:["Iniciativa","Antes","Esperar"]},
{w:"Resiliência",b:["Aguentar","Cair","Levantar"]},
{w:"Assertividade",b:["Dizer","Firmeza","Opinião"]},
{w:"Autoconhecimento",b:["Conhecer","Próprio","Saber"]},
{w:"Autoestima",b:["Gostar","Próprio","Valor"]},
{w:"Frustração",b:["Chatear","Não conseguir","Raiva"]},
{w:"Paciência",b:["Esperar","Calma","Tempo"]},
{w:"Motivação",b:["Vontade","Querer","Energia"]},
{w:"Compromisso",b:["Prometer","Cumprir","Responsabilidade"]},
{w:"Desenvolvimento pessoal",b:["Crescer","Melhorar","Evoluir"]},
{w:"Cidadania",b:["Direitos","Cidadão","Votar"]},
{w:"Participação",b:["Participar","Entrar","Decidir"]},
{w:"Pegada digital",b:["Internet","Rasto","Redes"]}];
let g2Deck=[],g2Cur=null,g2Turn=0,g2Sc=[0,0],g2Names=["Equipa A","Equipa B"],g2Time=60,g2Left=60,g2Int=null;
function g2SetTime(s,el){g2Time=s;el.parentNode.querySelectorAll('.pick').forEach(p=>p.classList.remove('on'));el.classList.add('on');}
function g2Start(){
  g2Names=[document.getElementById('g2-n1').value||"Equipa A",document.getElementById('g2-n2').value||"Equipa B"];
  g2Deck=shuffle([...TABU]).slice(0,40);g2Sc=[0,0];g2Turn=0;
  document.getElementById('g2-setup').style.display='none';
  document.getElementById('g2-end').style.display='none';
  document.getElementById('g2-play').style.display='';
  document.getElementById('g2-l0').textContent=g2Names[0];
  document.getElementById('g2-l1').textContent=g2Names[1];
  g2Ready();
}
function g2Board(){
  document.getElementById('g2-s0').textContent=g2Sc[0];document.getElementById('g2-s1').textContent=g2Sc[1];
  document.getElementById('g2-t0').classList.toggle('active',g2Turn===0);
  document.getElementById('g2-t1').classList.toggle('active',g2Turn===1);
  document.getElementById('g2-u0').textContent=g2Turn===0?'A explicar':'';
  document.getElementById('g2-u1').textContent=g2Turn===1?'A explicar':'';
  document.getElementById('g2-left').textContent=g2Deck.length;
}
function g2Ready(){document.getElementById('g2-live').style.display='none';document.getElementById('g2-ready').style.display='';document.getElementById('g2-ready-team').textContent=g2Names[g2Turn];g2Board();}
function g2Round(){
  document.getElementById('g2-ready').style.display='none';document.getElementById('g2-live').style.display='';
  g2Left=g2Time;g2Tick();clearInterval(g2Int);
  g2Int=setInterval(()=>{g2Left--;g2Tick();if(g2Left<=0)g2EndRound();},1000);
  g2Next();
}
function g2Tick(){const t=document.getElementById('g2-timer');t.textContent=Math.max(0,g2Left);t.classList.toggle('low',g2Left<=10);}
function g2Next(){
  if(g2Deck.length===0){g2EndGame();return;}
  g2Cur=g2Deck.pop();
  document.getElementById('g2-word').textContent=g2Cur.w;
  document.getElementById('g2-bans').innerHTML=g2Cur.b.map(x=>`<span>${x}</span>`).join('');
  document.getElementById('g2-left').textContent=g2Deck.length;
}
function g2Score(v){
  g2Sc[g2Turn]+=v;
  if(v===0&&g2Cur)g2Deck.unshift(g2Cur);
  g2Cur=null;g2Board();
  if(g2Deck.length===0){g2Stop();g2EndGame();return;}
  g2Next();
}
function g2EndRound(){
  clearInterval(g2Int);
  if(g2Cur){g2Deck.unshift(g2Cur);g2Cur=null;}
  g2Turn=1-g2Turn;
  if(g2Deck.length===0){g2EndGame();return;}
  g2Ready();
}
function g2Stop(){clearInterval(g2Int);}
function g2EndGame(){
  g2Stop();document.getElementById('g2-play').style.display='none';
  const e=document.getElementById('g2-end');e.style.display='';
  const win=g2Sc[0]===g2Sc[1]?null:(g2Sc[0]>g2Sc[1]?0:1);
  e.innerHTML=`<span class="eyebrow">Baralho esgotado</span>
    <h2 class="display" style="font-size:clamp(32px,7vw,60px);margin:12px 0 6px">${win===null?'Empate.':g2Names[win]+' ganha.'}</h2>
    <p class="mono" style="color:var(--chalk);font-size:17px">${g2Names[0]} ${g2Sc[0]} — ${g2Sc[1]} ${g2Names[1]}</p>
    <div style="margin-top:34px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-yellow" onclick="document.getElementById('g2-end').style.display='none';document.getElementById('g2-setup').style.display='';">Nova partida</button>
      <button class="btn" onclick="go('home')">Menu</button></div>
    <p class="hint" style="margin:30px auto 0;max-width:50ch">Para fechar: qual foi a palavra mais difícil de explicar?</p>`;
}

/* Os jogos 3 (Construtor de Projeto) e 4 (Como te vês) estão em arcade-educa-3.js */

document.addEventListener('keydown',e=>{
  if(!document.getElementById('g1').classList.contains('on'))return;
  if(document.getElementById('g1-play').style.display==='none')return;
  const aberto=document.getElementById('g1-sw').style.display!=='none';
  if(aberto){
    if(e.key==='ArrowLeft'){e.preventDefault();g1Answer('f');}
    if(e.key==='ArrowDown'){e.preventDefault();g1Answer('d');}
    if(e.key==='ArrowRight'){e.preventDefault();g1Answer('a');}
  }else if(e.key===' '||e.key==='Enter'){e.preventDefault();g1Adv();}
});
