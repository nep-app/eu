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

// ── RESULTADO MUITO MAIS SIMPLES ────────────────────────────────────
// O resultado do jogo dos monitores tem notas de 1 a 9, barras duplas, caixas
// explicativas e a revisão de todas as perguntas. Para este público é demasiado:
// aqui fica só o essencial — o que correu melhor, o que falta trabalhar, e uma
// palavra por competência. Sem números.
{
  // Âncora exata: quebra de linha + DOIS espaços. Sem a quebra de linha,
  // apanhava por engano o "if(G4_SIMPLES){" indentado com quatro espaços,
  // que é o do ecrã de introdução e não o do resultado.
  const ini = s.indexOf('\n  if(G4_SIMPLES){') + 1;
  const fim = s.indexOf('    return;\n  }', ini);
  if (!s.includes('\n  if(G4_SIMPLES){')) { erros.push('resultado simples: âncora não encontrada'); }
  if (ini < 1 || fim < 0) { erros.push('bloco do resultado simples não encontrado'); }
  else {
    s = s.slice(0, ini) + `  if(G4_SIMPLES){
    const PALAVRA=[[2,'Ainda não lá está','#E2574C'],[4,'Está a meio caminho','#E8894C'],[5,'Está razoável','#E4BE45'],[7,'Está bom','#8FB964'],[9,'Está muito bom','#2E9E7B'],[10,'Está excelente','#2E9E7B']];
    const pal=v=>PALAVRA.find(x=>v<=x[0])||PALAVRA[PALAVRA.length-1];
    const comparar=k=>{const d=dl[k];
      if(d===null)return '';
      if(d>0)return '<div style="font-size:12.5px;color:var(--chalk);margin-top:5px">Achas que a escola te vê <b>melhor</b> do que tu te vês.</div>';
      if(d<0)return '<div style="font-size:12.5px;color:var(--chalk);margin-top:5px">Achas que a escola te vê <b>pior</b> do que tu te vês.</div>';
      return '<div style="font-size:12.5px;color:var(--chalk);margin-top:5px">Vês-te <b>igual</b> ao que achas que a escola vê.</div>';};
    b.innerHTML=\`
      <div style="background:rgba(143,166,255,.1);border:1px solid rgba(143,166,255,.4);border-radius:14px;padding:13px 15px;margin-bottom:18px">
        <p style="margin:0;font-size:14.5px;line-height:1.5"><b style="color:var(--postit)">Isto não é uma nota. 🙂</b> É só para te ajudar a ver onde estás.</p>
      </div>

      <div style="background:rgba(46,158,123,.12);border:1px solid rgba(46,158,123,.45);border-radius:16px;padding:16px;margin-bottom:12px">
        <div style="font-size:12px;font-weight:800;color:#7fd6b3;margin-bottom:6px">💪 O QUE TE SAIU MELHOR</div>
        <b style="font-size:17px;line-height:1.25;display:block;color:\${DIMS[alta[0]].c}">\${DIMS[alta[0]].n}</b>
      </div>

      <div style="background:rgba(255,216,77,.1);border:1px solid rgba(255,216,77,.45);border-radius:16px;padding:16px;margin-bottom:22px">
        <div style="font-size:12px;font-weight:800;color:var(--postit);margin-bottom:6px">🎯 ONDE PODES MELHORAR</div>
        <b style="font-size:17px;line-height:1.25;display:block;color:\${DIMS[baixa[0]].c}">\${DIMS[baixa[0]].n}</b>
        <div style="font-size:13.5px;color:var(--chalk);margin-top:8px;line-height:1.45">É nesta que vale a pena focares-te primeiro.</div>
      </div>

      <span class="eyebrow">As seis, uma a uma</span>
      <div style="margin-top:10px">
      \${Object.keys(DIMS).map(k=>{const v=g4Num(D[k]);const [,txt,cor]=pal(v);
        return \`<div style="background:rgba(247,242,231,.04);border:1px solid rgba(247,242,231,.1);border-radius:14px;padding:14px 15px;margin-bottom:9px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="width:11px;height:11px;border-radius:50%;background:\${DIMS[k].c};flex-shrink:0"></span><b style="font-size:14.5px;line-height:1.25">\${DIMS[k].n}</b></div>
          <div style="height:12px;background:rgba(247,242,231,.07);border-radius:6px;overflow:hidden;margin-bottom:7px"><div style="height:100%;width:\${Math.round(v/9*100)}%;background:\${cor};border-radius:6px"></div></div>
          <div style="font-size:14px;font-weight:800;color:\${cor}">\${txt}</div>
          \${comparar(k)}
        </div>\`;}).join('')}
      </div>

      <div style="background:rgba(143,166,255,.08);border:1px solid rgba(143,166,255,.3);border-radius:14px;padding:13px 15px;margin-top:14px">
        <p style="margin:0;font-size:13.5px;line-height:1.55;color:var(--paper)">Ninguém está no máximo em tudo — nem é suposto. Se estivesses, não havia mais nada para aprender.</p>
      </div>

      <div style="display:grid;gap:9px;margin-top:20px">
        <button class="btn btn-solid" onclick="g4PDF()">Guardar em PDF</button>
        <button class="btn btn-yellow" onclick="g4Reset();window.scrollTo(0,0)">Fazer outra vez</button>
      </div>\`;
    return;
  }
` + s.slice(fim + '    return;\n  }\n'.length);
  }
}

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
