// Gera public/jogos/como-te-ves-situacoes-mediadores.html
// Mesmo formato do passo "Antes de começar: como te vês?" que existe no Jogo 3
// dos monitores: uma situação por competência, seis maneiras de reagir
// baralhadas, nenhuma assinalada como certa. No fim, o mesmo resultado simples
// da versão de frases. Os dois ficheiros bebem do mesmo banco de conteúdo.
import fs from 'node:fs';
import { DIMS } from './mediadores/dados.mjs';
import { SITUACOES } from './mediadores/situacoes.mjs';

const out = 'public/jogos/como-te-ves-situacoes-mediadores.html';
const dims = Object.keys(DIMS).map(id => ({ id, ...DIMS[id], sits: SITUACOES[id] }));

const html = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Como te vês · Situações · EDUCA Mediadores</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  :root{--bg:#071529;--cyn:#32C7FF;--post:#FFD84D;--chalk:#B8C7DA}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:#fff;font-family:Inter,system-ui,sans-serif;
    background-image:linear-gradient(rgba(50,199,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(50,199,255,.04) 1px,transparent 1px);
    background-size:32px 32px;-webkit-font-smoothing:antialiased}
  .wrap{max-width:640px;margin:0 auto;padding:22px 16px 60px}
  .card{background:rgba(255,255,255,.04);border:1px solid rgba(50,199,255,.18);border-radius:20px;padding:20px;margin-bottom:16px}
  .eyebrow{font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#7da3c4}
  h1{font-size:23px;font-weight:900;margin:8px 0 6px;line-height:1.2}
  .lead{font-size:14px;color:var(--chalk);line-height:1.6;margin:0}
  .dim{display:inline-block;font-size:11px;font-weight:800;padding:4px 11px;border-radius:999px;margin-bottom:10px}
  .sit{font-size:17px;font-weight:800;line-height:1.4;margin:0 0 16px}
  .opt{display:block;width:100%;text-align:left;padding:14px 16px;margin-bottom:9px;border-radius:14px;
    background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);color:#fff;
    font-size:14px;line-height:1.45;font-family:inherit;cursor:pointer;transition:all .15s}
  .opt:hover{background:rgba(255,255,255,.09)}
  .opt.on{background:rgba(50,199,255,.16);border-color:var(--cyn)}
  .btn{display:block;width:100%;padding:15px;border:none;border-radius:16px;font-size:15px;font-weight:900;
    cursor:pointer;font-family:inherit;margin-top:10px}
  .btn-main{background:var(--cyn);color:#071529}
  .btn-post{background:var(--post);color:#071529}
  .btn-ghost{background:transparent;color:var(--cyn);border:1.5px solid rgba(50,199,255,.45)}
  .btn[disabled]{opacity:.35;cursor:not-allowed}
  .prog{height:6px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;margin-bottom:18px}
  .prog>div{height:100%;background:var(--cyn);border-radius:3px;transition:width .3s}
  .conta{font-size:11.5px;color:#64748b;text-align:center;margin-top:14px}
  @media print{ body{background:#fff;color:#000;background-image:none}
    .card{border:1px solid #ccc;background:#fff;break-inside:avoid} .lead{color:#444} .btn,.no-print{display:none!important} h1{color:#000} }
</style>
</head>
<body><div class="wrap" id="app"></div>
<script>
const DIMS = ${JSON.stringify(dims, null, 1)};
// Resultado de 1 a 5 — a mesma escala do formulário com que a escola os avalia.
const NIVEIS=[[1,'Ainda não lá está','#E2574C'],[2,'Está a meio caminho','#E8894C'],[3,'Está razoável','#E4BE45'],[4,'Está bom','#8FB964'],[5,'Está muito bom','#2E9E7B']];
// As seis respostas de cada situação (2,4,5,7,9,10) em níveis de 1 a 5.
const nivel=v=>({2:1,4:2,5:3,7:4,9:5,10:5})[v]||3;
const pal=n=>NIVEIS[n-1]||NIVEIS[2];
function baralhar(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

let jogo = null;
function comecar(){
  jogo = { passo: 0, resp: {}, perguntas: DIMS.map(d => {
    const s = d.sits[Math.floor(Math.random()*d.sits.length)];
    return { id: d.id, nome: d.n, cor: d.c, q: s.q, o: baralhar(s.o) };
  }) };
  desenhar();
}

function responder(i, v){ jogo.resp[i] = (jogo.resp[i] === v) ? undefined : v; desenhar(); }

function desenhar(){
  const app = document.getElementById('app');
  if (!jogo) {
    app.innerHTML = \`<div class="card" style="text-align:center">
      <div class="eyebrow">Como te vês · Situações</div>
      <h1>O que é que tu farias?</h1>
      <p class="lead">Seis situações do teu dia a dia na escola. Em cada uma, seis maneiras de reagir.<br><br>
        <b>Escolhe a que mais se parece com o que tu farias mesmo.</b> Não a mais bonita — a verdadeira.</p>
      <p class="lead" style="margin-top:14px;color:#7da3c4">Não há resposta certa, e isto não é um teste. Ninguém vê o que respondes.</p>
      <button class="btn btn-post" onclick="comecar()">Começar →</button>
    </div>\`;
    return;
  }
  if (jogo.passo < 6) {
    const i = jogo.passo, P = jogo.perguntas[i], escolhida = jogo.resp[i];
    app.innerHTML = \`
      <div class="prog"><div style="width:\${Math.round(i/6*100)}%"></div></div>
      <div class="card">
        <span class="dim" style="color:\${P.cor};background:\${P.cor}1f;border:1px solid \${P.cor}66">\${P.nome}</span>
        <p class="sit">\${P.q}</p>
        \${P.o.map(([v,t]) => \`<button class="opt \${escolhida===v?'on':''}" onclick="responder(\${i},\${v})">\${t}</button>\`).join('')}
        <div class="conta">Situação \${i+1} de 6</div>
      </div>
      <button class="btn btn-main" \${escolhida===undefined?'disabled':''} onclick="jogo.passo++;desenhar();window.scrollTo(0,0)">\${i===5?'Ver o meu resultado':'Seguinte →'}</button>
      \${i>0?'<button class="btn btn-ghost" onclick="jogo.passo--;desenhar();window.scrollTo(0,0)">← Voltar</button>':''}\`;
    return;
  }
  // ── Resultado ──
  const vals = jogo.perguntas.map((P,i) => ({ ...P, bruto: jogo.resp[i], v: nivel(jogo.resp[i]) }));
  const ord = [...vals].sort((a,b) => b.bruto - a.bruto);
  const alta = ord[0], baixa = ord[ord.length-1];
  app.innerHTML = \`
    <div class="card" style="background:rgba(143,166,255,.1);border-color:rgba(143,166,255,.4)">
      <p class="lead" style="color:#fff"><b style="color:var(--post)">Isto não é uma nota. 🙂</b> É só para te ajudar a ver onde estás.</p>
    </div>
    <div class="card" style="background:rgba(46,158,123,.12);border-color:rgba(46,158,123,.45)">
      <div style="font-size:12px;font-weight:800;color:#7fd6b3;margin-bottom:6px">💪 O QUE TE SAIU MELHOR</div>
      <b style="font-size:18px;line-height:1.25;display:block;color:\${alta.c}">\${alta.nome}</b>
    </div>
    <div class="card" style="background:rgba(255,216,77,.1);border-color:rgba(255,216,77,.45)">
      <div style="font-size:12px;font-weight:800;color:var(--post);margin-bottom:6px">🎯 ONDE PODES MELHORAR</div>
      <b style="font-size:18px;line-height:1.25;display:block;color:\${baixa.c}">\${baixa.nome}</b>
      <div style="font-size:14px;color:var(--chalk);margin-top:8px">É nesta que vale a pena focares-te primeiro.</div>
    </div>
    <span class="eyebrow">As seis, uma a uma</span>
    <div style="margin-top:10px">
    \${vals.map(P => { const [,txt,cor] = pal(P.v);
      return \`<div class="card" style="padding:15px;margin-bottom:9px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="width:11px;height:11px;border-radius:50%;background:\${P.c};flex-shrink:0"></span><b style="font-size:14.5px;line-height:1.25">\${P.nome}</b></div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
          <div style="flex:1;height:14px;background:rgba(255,255,255,.07);border-radius:7px;overflow:hidden"><div style="height:100%;width:\${P.v*20}%;background:\${cor};border-radius:7px"></div></div>
          <b style="font-size:17px;color:\${cor};white-space:nowrap">\${P.v} em 5</b>
        </div>
        <div style="font-size:14px;font-weight:800;color:\${cor}">\${txt}</div>
        <div style="font-size:12.5px;color:#64748b;margin-top:8px;line-height:1.45">A tua resposta: «\${P.o.find(x=>x[0]===P.bruto)[1]}»</div>
      </div>\`; }).join('')}
    </div>
    <div class="card" style="background:rgba(143,166,255,.08);border-color:rgba(143,166,255,.3)">
      <p class="lead" style="color:#fff">Ninguém faz tudo da melhor maneira — nem é suposto. Se fizesses, não havia nada para aprender.</p>
    </div>
    <div class="no-print">
      <button class="btn btn-main" onclick="window.print()">Guardar em PDF</button>
      <button class="btn btn-post" onclick="comecar();window.scrollTo(0,0)">Fazer outra vez</button>
      <p class="conta">Da próxima vez saem situações diferentes — há oito por competência.</p>
    </div>\`;
}
desenhar();
</script>
</body>
</html>`;

fs.writeFileSync(out, html);
const total = Object.values(SITUACOES).reduce((n, a) => n + a.length, 0);
console.log('como-te-ves-situacoes-mediadores.html gerado (' + total + ' situações)');
