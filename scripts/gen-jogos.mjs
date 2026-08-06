// Gera como-te-ves.html a partir de arcade-educa.html (fonte única).
// Assim o ficheiro autónomo do "Como te vês" está sempre igual ao original.
import fs from 'node:fs';
const src = 'public/jogos/arcade-educa.html';
const out = 'public/jogos/como-te-ves.html';
let s = fs.readFileSync(src, 'utf8');
s = s.replace('<title>Arcade EDUCA+</title>', '<title>Como te vês · EDUCA+</title>');
const oldIIFE = `(function(){
  var p=new URLSearchParams(location.search).get('jogo');
  var map={'1':'g1','2':'g2','3':'g3','4':'g4'};
  if(map[p]){document.body.classList.add('solo');go(map[p]);}
})();`;
const newIIFE = `/* Ficheiro autonomo: abre sempre e so o jogo "Como te ves" (jogo 4). */
(function(){document.body.classList.add('solo');go('g4');})();`;
if (!s.includes(oldIIFE)) { console.error('IIFE nao encontrado em arcade-educa.html'); process.exit(1); }
s = s.replace(oldIIFE, newIIFE);
fs.writeFileSync(out, s);
console.log('como-te-ves.html gerado a partir de arcade-educa.html');
