// Gera public/jogos/como-te-ves-mediadores.html a partir do arcade-educa.html.
// O arcade NÃO é alterado: lê-se, troca-se o banco de perguntas e os textos
// pelos dos mediadores, e escreve-se um ficheiro novo. A mecânica do jogo
// (ecrãs, escalas, resultados, PDF) é exatamente a mesma.
import fs from 'node:fs';
import { DIMS, FACETS, PORQUE, POOL, DESC, DESC_ESCOLA } from './mediadores/dados.mjs';

const src = 'public/jogos/arcade-educa.html';
const out = 'public/jogos/como-te-ves-mediadores.html';
let s = fs.readFileSync(src, 'utf8');

const erros = [];
// Troca um bloco "const NOME={ ... \n};" inteiro.
function trocarBloco(nome, valor) {
  const re = new RegExp(`^const ${nome}=\\{[\\s\\S]*?\\n\\};$`, 'm');
  if (!re.test(s)) { erros.push(`bloco ${nome} não encontrado`); return; }
  s = s.replace(re, `const ${nome}=${JSON.stringify(valor, null, 1)};`);
}
function trocarTexto(antes, depois, obrigatorio = true) {
  if (!s.includes(antes)) { if (obrigatorio) erros.push(`texto não encontrado: ${antes.slice(0, 60)}`); return; }
  s = s.split(antes).join(depois);
}

trocarBloco('DIMS', DIMS);
trocarBloco('G4_POOL', POOL);
trocarBloco('G4_FACETS', FACETS);
trocarBloco('G4_PORQUE', PORQUE);
trocarBloco('G4_DESC', DESC);
trocarBloco('G4_DESC_LOCAL', DESC_ESCOLA);

// Para os mediadores o sítio é a ESCOLA, não o "Local".
trocarTexto('o teu <b>Local</b> (o sítio onde trabalhas)', 'a tua <b>Escola</b> (o sítio onde fazes mediação)');
trocarTexto('o teu <b>Local te avalia', 'a tua <b>Escola avalia-te');
trocarTexto('o teu <b>Local</b>', 'a tua <b>Escola</b>');
trocarTexto('teu <b>Local</b>', 'tua <b>Escola</b>', false);
trocarTexto('o teu Local', 'a tua Escola');
trocarTexto('teu Local', 'tua Escola', false);
trocarTexto('do Local', 'da Escola', false);
trocarTexto('o <b>Local</b>', 'a <b>Escola</b>', false);
trocarTexto('o <b>Local te avalia', 'a <b>Escola avalia-te', false);
trocarTexto('o Local te', 'a Escola te', false);
trocarTexto('o Local tem à frente', 'a Escola tem à frente', false);
trocarTexto('>Local<', '>Escola<', false);
trocarTexto('e o Local', 'e a Escola', false);

// Identidade do ficheiro
trocarTexto('<title>Arcade EDUCA+</title>', '<title>Como te vês · EDUCA Mediadores</title>');
trocarTexto("'Autoavaliação · EDUCA+'", "'Autoavaliação · EDUCA Mediadores'");
trocarTexto("paOpen('Como te vês'", "paOpen('Como te vês · Mediadores'", false);

// Ficheiro autónomo: abre sempre e só o "Como te vês".
const oldIIFE = `(function(){
  var p=new URLSearchParams(location.search).get('jogo');
  var map={'1':'g1','2':'g2','3':'g3','4':'g4'};
  if(map[p]){document.body.classList.add('solo');go(map[p]);}
})();`;
if (!s.includes(oldIIFE)) erros.push('IIFE de arranque não encontrado');
s = s.replace(oldIIFE, `/* Versao dos MEDIADORES: abre sempre e so o "Como te ves". */
(function(){document.body.classList.add('solo');go('g4');})();`);

if (erros.length) { console.error('gen-mediadores falhou:\n - ' + erros.join('\n - ')); process.exit(1); }

// Rede de segurança: no "Como te vês" (a única parte que este ficheiro abre)
// não pode ter sobrado nada dos monitores — nem a palavra "Local" à vista.
const jogo = s.slice(s.indexOf('const G4_POOL='));
const sobras = [];
if (/ludoteca/i.test(jogo)) sobras.push('ludoteca');
// "Local" visível = fora dos nomes de função/variável (g4Local, G4_DESC_LOCAL).
const localVisivel = jogo.match(/(?<![\w$_])Local(?![\w$_(])/g);
if (localVisivel) {
  sobras.push(`"Local" ${localVisivel.length}x`);
  const re = /(?<![\w$_])Local(?![\w$_(])/g; let x;
  while ((x = re.exec(jogo))) console.error('   …' + jogo.slice(Math.max(0, x.index - 80), x.index + 30).replace(/\s+/g, ' '));
}
if (sobras.length) { console.error('gen-mediadores: sobrou texto dos monitores → ' + sobras.join(', ')); process.exit(1); }

fs.writeFileSync(out, s);
console.log('como-te-ves-mediadores.html gerado (' + Object.keys(POOL).reduce((n, k) => n + POOL[k].length, 0) + ' frases)');
