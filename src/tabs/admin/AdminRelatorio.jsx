import React, { useState } from 'react';
import { CARD, SL, CYN, GRN, PNK } from "../../theme.jsx";
import { JEEP_LIST, BLOCKED_USERNAMES, getWeekKey, weekKeyFromTs } from "../../data.js";

const JEEP_8 = JEEP_LIST.filter(j => !["teresa", "ricardo", "demo"].includes(j.username));

// Activity columns
const COLS = [
  { key: "pergunta",   short: "Perg.",   label: "Pergunta Semanal",   bool: true  },
  { key: "satisfacao", short: "Satis.",  label: "Satisfação",         bool: true  },
  { key: "autoAv",     short: "Auto",    label: "Auto-Avaliação",     bool: true  },
  { key: "pia",        short: "PIA",     label: "PIA",                bool: true  },
  { key: "missoes",    short: "Miss.",   label: "Missões",            bool: false },
  { key: "dilemas",    short: "Dil.",    label: "Dilemas",            bool: false },
  { key: "xp",         short: "XP",     label: "XP ganho",           bool: false },
];

// Todas as semanas entre a primeira com registos e a atual — assim as semanas
// sem atividade nenhuma aparecem a zeros em vez de desaparecerem da lista.
function todasAsSemanas(primeiroTs) {
  const chaves = [];
  const vistas = new Set();
  const fim = Date.now();
  for (let t = primeiroTs; t <= fim + 86400000; t += 86400000) {
    const k = weekKeyFromTs(t);
    if (!vistas.has(k)) { vistas.add(k); chaves.push(k); }
  }
  const atual = getWeekKey();
  if (!vistas.has(atual)) chaves.push(atual);
  return chaves;
}

function weekLabel(wkStr) {
  try {
    const [y, w] = wkStr.split("-W").map(Number);
    const jan1 = new Date(y, 0, 1);
    const dow = jan1.getDay();
    const start = new Date(jan1.getTime() + ((w - 1) * 7 - dow) * 86400000);
    const end = new Date(start.getTime() + 6 * 86400000);
    const fmt = d => `${d.getDate()}/${d.getMonth() + 1}`;
    return `${fmt(start)}–${fmt(end)}`;
  } catch { return wkStr; }
}

function buildWeeklyData(allShared) {
  const weeks = {};
  let primeiroTs = Infinity;

  const novo = () => ({ pergunta: 0, satisfacao: 0, autoAv: 0, pia: 0, missoes: 0, dilemas: 0, xp: 0 });

  JEEP_8.forEach(j => {
    const ud = allShared[j.username] || {};
    const history = (ud.history || []).filter(h => h.ts);

    history.forEach(h => {
      const wk = weekKeyFromTs(h.ts);
      if (h.ts < primeiroTs) primeiroTs = h.ts;
      if (!weeks[wk]) weeks[wk] = {};
      if (!weeks[wk][j.username]) weeks[wk][j.username] = novo();
      const e = weeks[wk][j.username];
      const act = (h.action || "").toLowerCase();
      if (act.includes("desafio semanal")) e.pergunta = 1;
      if (act.includes("satisfa")) e.satisfacao = 1;
      if (act.includes("autoavalia")) e.autoAv = 1;
      // Correspondência estreita de propósito: "pia" sozinho apanharia por engano
      // qualquer ação futura com essa sequência de letras (ex.: "copiada").
      if (act.includes("o pia") || act.includes("(pia)") || act.includes("plano individual")) e.pia = 1;
      if (act.includes("cumpriu a missão")) e.missoes++;
      if (act.includes("dilema:")) e.dilemas++;
      if ((h.xp || 0) > 0) e.xp += h.xp;
    });
  });

  // NOTA: a semana atual conta SÓ o que foi feito nesta semana, tal como as
  // anteriores. Antes juntava-se aqui o estado atual (respondeu/entregou,
  // mesmo que tivesse sido há meses) e a semana atual media outra coisa.
  if (primeiroTs === Infinity) primeiroTs = Date.now();
  todasAsSemanas(primeiroTs).forEach(wk => { if (!weeks[wk]) weeks[wk] = {}; });

  return weeks;
}

// Quem conta numa dada semana: os jovens ativos, mais quem já saiu do programa
// mas tem registos nessa semana (para o histórico não se perder nem os totais
// ficarem sobre 9 quando já só há 7 pessoas).
function jovensDaSemana(wkData) {
  return JEEP_8.filter(j =>
    !BLOCKED_USERNAMES.includes(j.username) || !!wkData[j.username]
  );
}

function buildCSV(weeks) {
  const sortedWks = Object.keys(weeks).sort().reverse();

  // Uma linha por (semana × jovem). Todas as semanas medem o mesmo: o que foi
  // feito NESSA semana (não o estado acumulado).
  const headers = ["Semana", "Datas", "Jovem", ...COLS.map(c => c.label)];
  const rows = [];
  sortedWks.forEach(wk => {
    jovensDaSemana(weeks[wk]).forEach(j => {
      const d = weeks[wk][j.username] || {};
      rows.push([
        wk,
        weekLabel(wk),
        j.name,
        ...COLS.map(c => {
          const v = d[c.key] || 0;
          return c.bool ? (v ? "Sim" : "Não") : v;
        })
      ]);
    });
  });

  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "jeep_relatorio.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

const cellStyle = (val, bool) => ({
  padding: "7px 6px",
  textAlign: "center",
  fontSize: 12,
  fontWeight: bool ? 900 : 700,
  color: bool
    ? (val ? GRN : "rgba(255,255,255,0.18)")
    : (val > 0 ? "#f1f5f9" : "rgba(255,255,255,0.18)"),
  borderBottom: "1px solid rgba(255,255,255,0.04)",
});

export default function AdminRelatorio({ allShared }) {
  const [openWeeks, setOpenWeeks] = useState({ [getWeekKey()]: true });

  const weeks = buildWeeklyData(allShared || {});
  const sortedWks = Object.keys(weeks).sort().reverse();
  const currentWk = getWeekKey();

  function toggleWeek(wk) {
    setOpenWeeks(prev => ({ ...prev, [wk]: !prev[wk] }));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={SL}>📈 Relatório Semanal</div>
        <button onClick={() => buildCSV(weeks)} style={{
          background: `${CYN}18`, color: CYN, border: `1px solid ${CYN}40`,
          borderRadius: 10, padding: "7px 14px", fontSize: 11, fontWeight: 800, cursor: "pointer"
        }}>
          ⬇ CSV
        </button>
      </div>

      <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.5, marginBottom: 14, marginTop: -8 }}>
        Cada linha conta o que foi feito <b>nessa semana</b> — não o estado acumulado.
        Uma semana a zeros quer dizer que não houve atividade nenhuma nesses dias.
      </div>

      {sortedWks.length === 0 && (
        <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0", fontSize: 13 }}>
          Ainda não há dados registados.
        </div>
      )}

      {sortedWks.map(wk => {
        const isOpen = !!openWeeks[wk];
        const isCurrent = wk === currentWk;
        const wkData = weeks[wk];

        // Summary: how many users did each bool activity
        const boolCols = COLS.filter(c => c.bool);
        const jovens = jovensDaSemana(wkData);
        const completed = {};
        boolCols.forEach(c => {
          completed[c.key] = jovens.filter(j => (wkData[j.username] || {})[c.key]).length;
        });
        return (
          <div key={wk} style={{
            ...CARD,
            border: isCurrent ? `1px solid ${CYN}35` : "1px solid rgba(255,255,255,0.07)",
            padding: 0,
            overflow: "hidden",
            marginBottom: 10,
          }}>
            {/* Week header — always visible */}
            <div onClick={() => toggleWeek(wk)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", cursor: "pointer",
              background: isCurrent ? `${CYN}08` : "transparent",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: isCurrent ? CYN : "#94a3b8" }}>
                  {isCurrent ? "🟢 SEMANA ATUAL" : "●"}{"\u00a0"}
                  {wk.replace("-W", " · Sem.\u00a0")}
                </span>
                <span style={{ fontSize: 11, color: "#64748b" }}>({weekLabel(wk)})</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {/* Quick summary chips */}
                {boolCols.map(c => (
                  <span key={c.key} style={{
                    fontSize: 10, fontWeight: 800,
                    color: completed[c.key] === jovens.length ? GRN : completed[c.key] > 0 ? "#fbbf24" : "#475569",
                  }}>
                    {completed[c.key]}/{jovens.length}
                  </span>
                ))}
                <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 4 }}>{isOpen ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* Expanded table */}
            {isOpen && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.25)" }}>
                      <th style={{ padding: "7px 12px", textAlign: "left", fontSize: 11, color: "#64748b", fontWeight: 700, whiteSpace: "nowrap" }}>Jovem</th>
                      {COLS.map(c => (
                        <th key={c.key} style={{ padding: "7px 6px", textAlign: "center", fontSize: 10, color: "#64748b", fontWeight: 700, whiteSpace: "nowrap" }}>
                          {c.short}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jovens.map(j => {
                      const d = wkData[j.username] || {};
                      const anyDone = COLS.some(c => (d[c.key] || 0) > 0);
                      return (
                        <tr key={j.username} style={{ opacity: anyDone ? 1 : 0.45 }}>
                          <td style={{
                            padding: "7px 12px", fontSize: 12, fontWeight: 700,
                            color: j.color, whiteSpace: "nowrap",
                            borderBottom: "1px solid rgba(255,255,255,0.04)"
                          }}>
                            {j.name}
                          </td>
                          {COLS.map(c => {
                            const val = d[c.key] || 0;
                            return (
                              <td key={c.key} style={cellStyle(val, c.bool)}>
                                {c.bool ? (val ? "✓" : "–") : (val || "–")}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                    {/* Totals row */}
                    <tr style={{ background: "rgba(0,0,0,0.20)" }}>
                      <td style={{ padding: "6px 12px", fontSize: 10, color: "#64748b", fontWeight: 800 }}>TOTAL</td>
                      {COLS.map(c => {
                        const total = c.bool
                          ? jovens.filter(j => (wkData[j.username] || {})[c.key]).length
                          : jovens.reduce((s, j) => s + ((wkData[j.username] || {})[c.key] || 0), 0);
                        return (
                          <td key={c.key} style={{
                            padding: "6px 6px", textAlign: "center", fontSize: 11, fontWeight: 900,
                            color: c.bool
                              ? (total === jovens.length ? GRN : total > 0 ? "#fbbf24" : "#475569")
                              : (total > 0 ? CYN : "#475569"),
                          }}>
                            {c.bool ? `${total}/${jovens.length}` : (total || "–")}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
