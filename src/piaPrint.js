import { PIA_SECTIONS } from "./data.js";

export function openPiaPrint(piaData, piaUnlocked, userName) {
  const today = new Date().toLocaleDateString("pt-PT", { day:"2-digit", month:"long", year:"numeric" });
  const sections = PIA_SECTIONS.filter(s => piaUnlocked[s.id]);

  function esc(str) {
    return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>");
  }

  const swotMeta = [
    { key:"swotF",    label:"💪 Pontos Fortes",  color:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0" },
    { key:"swotFraq", label:"⚠️ Pontos Fracos",  color:"#ea580c", bg:"#fff7ed", border:"#fed7aa" },
    { key:"swotOp",   label:"🌟 Oportunidades",  color:"#0284c7", bg:"#f0f9ff", border:"#bae6fd" },
    { key:"swotR",    label:"🚨 Ameaças",         color:"#dc2626", bg:"#fef2f2", border:"#fecaca" },
  ];

  const sectionsHtml = sections.map(sec => {
    const sd = piaData[sec.id] || {};

    if (sec.id === "s3b") {
      return `
        <div class="section">
          <div class="stitle">${sec.icon} ${sec.title}</div>
          <div class="swot">
            ${swotMeta.map(q => `
              <div class="swot-q" style="background:${q.bg};border:1px solid ${q.border}">
                <div class="swot-label" style="color:${q.color}">${q.label}</div>
                <div class="fval">${esc(sd[q.key]) || '<span class="empty">—</span>'}</div>
              </div>`).join("")}
          </div>
        </div>`;
    }

    const fieldsHtml = sec.fields.map(f => {
      if (f.type === "activities") {
        const list = sd[f.key] || [];
        const rows = list.length
          ? list.map((a,i) => `
              <div class="listitem">
                <strong>${i+1}. ${esc(a.titulo || "Atividade")}</strong>
                ${a.data ? `<span class="detail">📅 ${esc(a.data)}${a.hora ? " às "+esc(a.hora) : ""}</span>` : ""}
                ${a.local ? `<span class="detail">📍 ${esc(a.local)}</span>` : ""}
                ${a.descricao ? `<p class="listtext">${esc(a.descricao)}</p>` : ""}
                ${a.recursos ? `<p class="listmeta">Recursos: ${esc(a.recursos)}</p>` : ""}
              </div>`).join("")
          : '<span class="empty">Sem atividades registadas</span>';
        return `<div class="field"><div class="flabel">${f.label}</div>${rows}</div>`;
      }
      if (f.type === "revisoes") {
        const list = sd[f.key] || [];
        const rows = list.length
          ? list.map((r,i) => `
              <div class="listitem">
                <strong>Revisão ${i+1}${r.data ? " — "+esc(r.data) : ""}</strong>
                ${r.notas ? `<p class="listtext">${esc(r.notas)}</p>` : ""}
                ${r.ajustes ? `<p class="listmeta"><em>Ajustes: ${esc(r.ajustes)}</em></p>` : ""}
              </div>`).join("")
          : '<span class="empty">Sem revisões registadas</span>';
        return `<div class="field"><div class="flabel">${f.label}</div>${rows}</div>`;
      }
      if (f.type === "swot") return "";
      const val = esc(sd[f.key]);
      return `
        <div class="field">
          <div class="flabel">${f.label}</div>
          <div class="fval">${val || '<span class="empty">—</span>'}</div>
        </div>`;
    }).join("");

    return `
      <div class="section">
        <div class="stitle">${sec.icon} ${sec.title}</div>
        ${fieldsHtml}
      </div>`;
  }).join("") || '<div class="empty" style="text-align:center;padding:40px">Sem secções preenchidas ainda.</div>';

  const html = `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PIA — ${esc(userName)}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,700;0,9..40,900;1,9..40,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',system-ui,sans-serif;background:#f8fafc;color:#1e293b;padding:40px 24px;max-width:800px;margin:0 auto}
@media print{body{background:#fff;padding:20px}.no-print{display:none!important}.section{page-break-inside:avoid}}
.print-btn{position:fixed;top:20px;right:20px;background:#1e293b;color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;box-shadow:0 4px 12px rgba(0,0,0,0.2)}
.header{margin-bottom:36px;padding-bottom:20px;border-bottom:2px solid #e2e8f0}
.badge{display:inline-flex;align-items:center;gap:6px;background:#1e293b;color:#e2e8f0;padding:4px 14px;border-radius:20px;font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:14px}
.hname{font-size:28px;font-weight:900;color:#0f172a;margin-bottom:4px}
.hmeta{font-size:12px;color:#64748b;display:flex;gap:16px}
.section{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:22px;margin-bottom:16px}
.stitle{font-size:15px;font-weight:900;color:#0f172a;margin-bottom:16px;display:flex;align-items:center;gap:6px}
.field{margin-bottom:14px}
.field:last-child{margin-bottom:0}
.flabel{font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px}
.fval{font-size:13px;color:#334155;line-height:1.7}
.empty{color:#cbd5e1;font-style:italic;font-size:12px}
.swot{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.swot-q{border-radius:10px;padding:12px}
.swot-label{font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px}
.listitem{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;margin-bottom:6px;font-size:13px}
.listitem strong{color:#0f172a}
.detail{font-size:11px;color:#64748b;margin-left:8px}
.listtext{margin-top:4px;font-size:12px;color:#475569;line-height:1.5}
.listmeta{margin-top:3px;font-size:11px;color:#64748b}
footer{text-align:center;font-size:11px;color:#94a3b8;margin-top:36px;padding-top:16px;border-top:1px solid #e2e8f0}
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">🖨 Guardar como PDF</button>
<div class="header">
  <div class="badge">📋 Plano Individual de Ação</div>
  <div class="hname">${esc(userName)}</div>
  <div class="hmeta"><span>JEEP EDUCA+</span><span>Gerado a ${today}</span></div>
</div>
${sectionsHtml}
<footer>JEEP EDUCA+ · Câmara Municipal de Cascais · ${new Date().getFullYear()}</footer>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) { alert("Permite pop-ups para descarregar o PDF."); return; }
  w.document.write(html);
  w.document.close();
}
