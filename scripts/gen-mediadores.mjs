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

// Quem os acompanha não é a Teresa — é o técnico de território, ou a supervisão.
trocarTexto('partilhá-lo com a Teresa', 'partilhá-lo com o teu técnico de território', false);

trocarTexto('(o degrau que escolheste)', '(o nível de 1 a 5 que escolheste)', false);

// ── ESCALA DE 1 A 5 ─────────────────────────────────────────────────
// Os monitores são avaliados numa grelha de 1 a 10; os mediadores num
// formulário de 1 a 5. Aqui passa tudo para 1 a 5 — as respostas do próprio E
// o palpite sobre a escola — para as duas metades ficarem comparáveis.
trocarTexto(
  'const G4_BANDAS=[["1-2","Insuficiente"],["3-4","Abaixo do esperado"],["5","Suficiente"],["6-7","Bom"],["8-9","Muito Bom"],["10","Excelente"]];',
  'const G4_BANDAS=[["1","Ainda não lá está"],["2","Está a meio caminho"],["3","Está razoável"],["4","Está bom"],["5","Está muito bom"]];');
trocarTexto(
  'function banda(v){if(v<=2)return"1-2";if(v<=4)return"3-4";if(v<=5)return"5";if(v<=7)return"6-7";if(v<=9)return"8-9";return"10";}',
  '/* média interna (1 a 9) → nível de 1 a 5 */\nfunction banda(v){if(v<=2)return"1";if(v<=4)return"2";if(v<=5)return"3";if(v<=7)return"4";return"5";}');
trocarTexto(
  "function g4Cap(v){const b=banda(Math.round(v));return b==='10'?'8-9':b;}",
  'function g4Cap(v){return banda(Math.round(v));}');
trocarTexto(
  'function g4Num(v){return Math.max(1,Math.min(9,Math.round(v)));}',
  '/* média interna → o número de 1 a 5 que se mostra */\nfunction g4Num(v){return Number(banda(v));}');
trocarTexto(
  "const locMid=b=>({'1-2':1.5,'3-4':3.5,'5':5,'6-7':6.5,'8-9':8.5,'10':9})[b]||5;",
  "const locMid=b=>({'1':1,'2':2,'3':3,'4':4,'5':5})[b]||3;");

// A escada da escola: cinco degraus numerados 1 a 5, sem o degrau trancado.
trocarTexto(
  '${G4_BANDAS.map(([bn,cl],idx)=>idx===5',
  '${G4_BANDAS.map(([bn,cl],idx)=>false');

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
    const CORES=['#E2574C','#E8894C','#E4BE45','#8FB964','#2E9E7B'];
    const pal=n=>[CORES[n-1]||'#E4BE45', (G4_BANDAS[n-1]||['','—'])[1]];
    // O número NÃO foi escolhido por eles: saiu das respostas que deram. E o jogo
    // não tira conclusões sobre a pessoa — só devolve o que está lá e convida a pensar.
    const comparar=(k,meu)=>{const lb=G4.loc[k]; if(!lb) return '';
      const dela=Number(lb), d=dela-meu;
      const frase = d===0
        ? 'Deu o <b>mesmo</b> nas duas.'
        : 'Há aqui uma <b>diferença</b>. Fica para pensares — e para falares sobre isso na supervisão ou com o teu técnico de território.';
      return '<div style="margin-top:9px;padding:10px 12px;border-radius:10px;background:rgba(247,242,231,.05);font-size:13px;line-height:1.5">'
        + frase + '</div>';};
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
      \${Object.keys(DIMS).map(k=>{const v=g4Num(D[k]);const [cor,txt]=pal(v);
        const lb=G4.loc[k]; const dela=lb?Number(lb):null;
        // Duas barras lado a lado, cada uma dita por extenso: o que as respostas
        // deram, e o que ele acha que a escola lhe daria.
        const linha=(rot,n,c)=>\`<div style="margin-bottom:9px">
            <div style="font-size:12.5px;color:var(--chalk);margin-bottom:4px">\${rot}</div>
            <div style="display:flex;align-items:center;gap:10px">
              <div style="flex:1;height:16px;background:rgba(247,242,231,.07);border-radius:8px;overflow:hidden"><div style="height:100%;width:\${n*20}%;background:\${c};border-radius:8px"></div></div>
              <b style="font-size:18px;color:\${c};white-space:nowrap;min-width:60px;text-align:right">\${n} em 5</b>
            </div>
          </div>\`;
        return \`<div style="background:rgba(247,242,231,.04);border:1px solid rgba(247,242,231,.1);border-radius:14px;padding:15px;margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><span style="width:11px;height:11px;border-radius:50%;background:\${DIMS[k].c};flex-shrink:0"></span><b style="font-size:15px;line-height:1.25">\${DIMS[k].n}</b></div>
          \${linha('<b style="color:var(--paper)">As tuas respostas dão</b>', v, cor)}
          \${dela!==null?linha('<b style="color:var(--paper)">Achas que a escola te dava</b>', dela, '#8a8298'):''}
          <div style="font-size:14px;font-weight:800;color:\${cor};margin-top:2px">\${txt}</div>
          \${comparar(k,v)}
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
