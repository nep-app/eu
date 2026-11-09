// Gera public/jogos/autoavaliacao-mediadores.html — a Autoavaliação da app,
// mas autónoma (os mediadores não têm conta na app). Usa o MESMO banco de
// conteúdo da versão do "Como te vês", para os dois não divergirem.
import fs from 'node:fs';
import { DIMS, DEFS, DESC } from './mediadores/dados.mjs';

const out = 'public/jogos/autoavaliacao-mediadores.html';
const dims = Object.keys(DIMS).map(id => ({ id, ...DIMS[id], def: DEFS[id], s: DESC[id] }));

const html = `<!DOCTYPE html>
<html lang="pt-PT">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Autoavaliação · EDUCA Mediadores</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
  :root{ --bg:#071529; --cyn:#32C7FF; --txt:#fff; --mut:#B8C7DA; }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--txt);font-family:Inter,system-ui,sans-serif;
    background-image:linear-gradient(rgba(50,199,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(50,199,255,.04) 1px,transparent 1px);
    background-size:32px 32px;-webkit-font-smoothing:antialiased}
  .wrap{max-width:640px;margin:0 auto;padding:22px 16px 60px}
  .card{background:rgba(255,255,255,.04);border:1px solid rgba(50,199,255,.18);border-radius:20px;
    padding:20px;margin-bottom:16px;backdrop-filter:blur(8px)}
  .eyebrow{font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#7da3c4}
  h1{font-size:22px;font-weight:900;margin:8px 0 6px;line-height:1.2}
  .lead{font-size:13.5px;color:var(--mut);line-height:1.6;margin:0}
  .dimid{font-size:9px;font-weight:900;color:#64748b;letter-spacing:1.5}
  .dimlabel{font-weight:900;font-size:15px;margin:4px 0 6px;line-height:1.3}
  .dimdesc{font-size:12px;color:#94a3b8;line-height:1.55;margin-bottom:18px}
  input[type=range]{width:100%;height:28px;background:transparent;cursor:pointer}
  .badge{font-size:10px;font-weight:900;padding:2px 8px;border-radius:6px;text-transform:uppercase}
  .notabox{display:flex;align-items:center;gap:12px;margin:16px 0;padding:14px 18px;border-radius:16px}
  .notanum{font-size:40px;font-weight:900;line-height:1}
  .desctxt{background:rgba(15,23,42,.45);padding:16px;border-radius:16px;font-size:13px;
    color:#e2e8f0;line-height:1.6;margin-bottom:14px}
  textarea{width:100%;border-radius:14px;padding:12px 14px;font-size:12.5px;font-family:inherit;
    background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.12);color:#fff;resize:vertical;outline:none}
  textarea::placeholder{color:rgba(255,255,255,.35)}
  .btn{display:block;width:100%;padding:15px;border:none;border-radius:16px;font-size:14.5px;
    font-weight:900;cursor:pointer;font-family:inherit;margin-top:10px}
  .btn-main{background:var(--cyn);color:#071529}
  .btn-ghost{background:transparent;color:var(--cyn);border:1.5px solid rgba(50,199,255,.45)}
  .hint{font-size:11.5px;color:#64748b;line-height:1.5;text-align:center;margin-top:12px}
  .aviso{background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.1);border-radius:22px;padding:20px;margin-bottom:18px}
  .resumo{font-size:13px;line-height:1.7}
  .resumo .ln{display:flex;justify-content:space-between;gap:12px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.07)}
  .toast{position:fixed;left:50%;transform:translateX(-50%);top:14px;z-index:99;background:rgba(16,40,66,.97);
    border:1.5px solid var(--cyn);color:#fff;border-radius:14px;padding:12px 16px;font-size:13px;font-weight:700;
    box-shadow:0 10px 30px rgba(0,0,0,.45);display:none}
  @media print{
    body{background:#fff;color:#000;background-image:none}
    .card,.aviso{border:1px solid #ccc;background:#fff;break-inside:avoid}
    .dimdesc,.lead,.hint{color:#444}
    .desctxt{background:#f4f4f5;color:#000}
    .dimlabel,.notanum,h1{color:#000}
    textarea{border:1px solid #ccc;color:#000;background:#fff}
    .btn,.no-print{display:none !important}
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="card" style="text-align:center">
    <div class="eyebrow">Autoavaliação · EDUCA Mediadores</div>
    <h1>Como te avalias?</h1>
    <p class="lead">Seis competências. Em cada uma, dá-te uma nota de 1 a 10 e explica porquê.</p>
  </div>

  <div class="aviso">
    <div style="font-size:15px;font-weight:900;margin-bottom:10px">🔒 Isto é teu.</div>
    <div style="font-size:13px;color:#cbd5e1;line-height:1.6;margin-bottom:10px">
      Nada fica guardado em lado nenhum automaticamente. Só sai daqui o que <b>tu</b> enviares no fim.
      Não serve para te avaliarem — serve para perceberes onde estás e para onde queres ir.
    </div>
    <div style="font-size:13px;font-weight:800;line-height:1.6">
      Sê honesto/a. Ninguém é bom em tudo, nem é suposto. Se deres tudo 10, não sobra margem para crescer. 🌱
    </div>
  </div>

  <div id="dims"></div>

  <div class="card no-print">
    <div style="font-size:15px;font-weight:900;margin-bottom:6px">Quando acabares</div>
    <p class="lead" style="margin-bottom:14px">Guarda em PDF (ou imprime) e entrega à Teresa. Também podes copiar o texto e enviá-lo por mensagem.</p>
    <button class="btn btn-main" onclick="guardarPDF()">📄 Guardar em PDF / Imprimir</button>
    <button class="btn btn-ghost" onclick="copiarResumo()">📋 Copiar resumo</button>
    <button class="btn btn-ghost" style="border-color:rgba(244,63,94,.4);color:#f87171" onclick="limpar()">🗑 Começar de novo</button>
    <p class="hint">As tuas respostas ficam guardadas neste telemóvel/computador até as apagares. Se mudares de aparelho, não vão contigo.</p>
  </div>

  <div class="card" id="resumo-print" style="display:none">
    <div class="eyebrow">Resumo</div>
    <div class="resumo" id="resumo-corpo"></div>
  </div>
</div>
<div class="toast" id="toast"></div>

<script>
const DIMS = ${JSON.stringify(dims, null, 1)};
const CHAVE = 'educa-mediadores-autoavaliacao';
let estado = {};
try { estado = JSON.parse(localStorage.getItem(CHAVE) || '{}'); } catch (e) { estado = {}; }

function nivel(v){
  if(v<=2) return ['Insuficiente','#f43f5e','a'];
  if(v<=4) return ['Abaixo do esperado','#fb923c','b'];
  if(v===5) return ['Suficiente','#fbbf24','c'];
  if(v<=7) return ['Bom','#60a5fa','d'];
  if(v<=9) return ['Muito Bom','#a855f7','e'];
  return ['Excelente','#22d3ee','f'];
}
const BANDA={a:'1-2',b:'3-4',c:'5',d:'6-7',e:'8-9',f:'10'};

function guardar(){ try{ localStorage.setItem(CHAVE, JSON.stringify(estado)); }catch(e){} }
function toast(t){ const el=document.getElementById('toast'); el.textContent=t; el.style.display='block';
  clearTimeout(window._tt); window._tt=setTimeout(()=>el.style.display='none',3200); }

function desenhar(){
  document.getElementById('dims').innerHTML = DIMS.map(d => {
    const v = estado['n_'+d.id] || 0;
    const posto = v > 0;
    const [rot, cor, chave] = nivel(posto ? v : 1);
    const texto = d.s[BANDA[chave]];
    return \`<div class="card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">
        <span class="dimid">\${d.id}</span>
        \${posto ? \`<span class="badge" style="color:\${cor};background:\${cor}15;border:1px solid \${cor}40">\${rot}</span>\` : ''}
      </div>
      <div class="dimlabel" style="color:\${d.c}">\${d.n}</div>
      <div class="dimdesc">\${d.def}</div>
      <input type="range" min="1" max="10" value="\${posto ? v : 1}"
        style="accent-color:\${posto ? cor : '#475569'}"
        oninput="poeNota('\${d.id}', this.value)">
      \${posto ? \`
        <div class="notabox" style="background:\${cor}12;border:1px solid \${cor}30">
          <span class="notanum">\${v}</span>
          <div>
            <div style="font-size:13px;font-weight:900;color:\${cor};text-transform:uppercase">\${rot}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:2px">em 10 possíveis</div>
          </div>
        </div>
        <div class="desctxt" style="border-left:4px solid \${cor}">\${texto}</div>\`
      : '<div style="text-align:center;font-size:11px;color:#475569;margin-top:4px;font-weight:700">Arrasta para te avaliares</div>'}
      <textarea rows="2" placeholder="Queres dar um exemplo ou explicar esta nota?"
        oninput="poeNotaTexto('\${d.id}', this.value)">\${(estado['t_'+d.id]||'').replace(/</g,'&lt;')}</textarea>
    </div>\`;
  }).join('');
}

function poeNota(id, v){ estado['n_'+id] = Number(v); guardar(); desenhar(); }
function poeNotaTexto(id, t){ estado['t_'+id] = t; guardar(); }

function porPreencher(){ return DIMS.filter(d => !estado['n_'+d.id]); }

function textoResumo(){
  const linhas = DIMS.map(d => {
    const v = estado['n_'+d.id] || 0;
    const r = v ? nivel(v)[0] : 'por responder';
    const nota = (estado['t_'+d.id]||'').trim();
    return '• ' + d.n + ': ' + (v ? v + '/10 (' + r + ')' : r) + (nota ? '\\n   "' + nota + '"' : '');
  });
  const postas = DIMS.map(d => estado['n_'+d.id]).filter(Boolean);
  const media = postas.length ? (postas.reduce((a,b)=>a+b,0)/postas.length).toFixed(1) : '—';
  return 'AUTOAVALIAÇÃO — EDUCA MEDIADORES\\n' + new Date().toLocaleDateString('pt-PT') +
    '\\n\\n' + linhas.join('\\n') + '\\n\\nMédia: ' + media + '/10';
}

function guardarPDF(){
  const f = porPreencher();
  if (f.length && !confirm('Ainda tens ' + f.length + ' por responder. Queres guardar na mesma?')) return;
  const postas = DIMS.map(d => estado['n_'+d.id]).filter(Boolean);
  const media = postas.length ? (postas.reduce((a,b)=>a+b,0)/postas.length).toFixed(1) : '—';
  document.getElementById('resumo-corpo').innerHTML =
    DIMS.map(d => { const v = estado['n_'+d.id] || 0;
      return '<div class="ln"><span>' + d.n + '</span><b>' + (v ? v + '/10' : '—') + '</b></div>'; }).join('') +
    '<div class="ln" style="border:0"><span><b>Média</b></span><b>' + media + '/10</b></div>';
  document.getElementById('resumo-print').style.display = 'block';
  setTimeout(() => window.print(), 80);
}

async function copiarResumo(){
  const t = textoResumo();
  try { await navigator.clipboard.writeText(t); toast('Resumo copiado! Já podes colar numa mensagem.'); }
  catch (e) { prompt('Copia daqui:', t); }
}

function limpar(){
  if (!confirm('Apagar tudo o que respondeste e começar de novo?')) return;
  estado = {}; guardar(); desenhar(); toast('Apagado. Podes começar de novo.');
}

desenhar();
</script>
</body>
</html>`;

fs.writeFileSync(out, html);
console.log('autoavaliacao-mediadores.html gerado (' + dims.length + ' dimensões)');
