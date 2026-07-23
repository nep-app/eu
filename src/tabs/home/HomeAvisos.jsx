import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase.js";
import { YLW, CYN, Linkify } from "../../theme.jsx";

// Avisos oficiais da Teresa (canal "anuncios" do fórum), mostrados em DESTAQUE
// no topo do Início — impossíveis de não ver. Cada jovem pode dispensar um
// aviso (fica guardado no aparelho), mas avisos NOVOS aparecem sempre.
export default function HomeAvisos({ user, setTab, setForumCanal, previewMode }) {
  const [avisos, setAvisos] = useState([]);
  const chave = "avisosDispensados_" + (user?.username || "x");
  const [dispensados, setDispensados] = useState(() => {
    try { return JSON.parse(localStorage.getItem(chave) || "[]"); } catch { return []; }
  });

  useEffect(() => {
    return onSnapshot(collection(db, "forum", "anuncios", "posts"), snap => {
      setAvisos(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.ts || 0) - (a.ts || 0)));
    });
  }, []);

  function dispensar(id) {
    const novo = [...dispensados, id];
    setDispensados(novo);
    try { localStorage.setItem(chave, JSON.stringify(novo)); } catch {}
  }

  function irAoForum() {
    if (previewMode) return;
    setForumCanal && setForumCanal("anuncios");
    setTab && setTab("forum");
  }

  // Mostra até 3 avisos recentes ainda não dispensados, respeitando o destino
  // (posts de teste com target aparecem só ao próprio; sem target = todos).
  const meu = user?.username;
  // SÓ aparecem os avisos marcados como destaque (a Teresa escolhe quais).
  const visiveis = avisos
    .filter(a => a.destaque === true)
    .filter(a => !a.target || a.target === "all" || a.target === meu)
    .filter(a => !dispensados.includes(a.id))
    .slice(0, 3);
  if (visiveis.length === 0) return null;

  // Tema claro (conta teresa) precisa de texto escuro; jovens usam tema escuro.
  const light = user?.username === "teresa";
  const c = light
    ? { bg: "linear-gradient(150deg, #ffe9b0, #ffd9c2)", border: "1.5px solid #f59e0b",
        barBg: "rgba(180,83,9,0.14)", barBorder: "1px solid rgba(180,83,9,0.25)",
        label: "#b45309", text: "#3f2d0b", date: "#8a6d3b", x: "rgba(0,0,0,0.4)",
        btnBg: "rgba(37,99,235,0.12)", btnBorder: "1px solid rgba(37,99,235,0.4)", btnText: "#2563eb" }
    : { bg: "linear-gradient(150deg, rgba(255,196,61,0.14), rgba(255,79,163,0.10))", border: "1.5px solid rgba(255,196,61,0.55)",
        barBg: "rgba(255,196,61,0.16)", barBorder: "1px solid rgba(255,196,61,0.28)",
        label: YLW, text: "#f8fafc", date: "#94a3b8", x: "rgba(255,255,255,0.45)",
        btnBg: "rgba(50,199,255,0.14)", btnBorder: `1px solid ${CYN}45`, btnText: CYN };

  return (
    <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      {visiveis.map((a, i) => (
        <div key={a.id} style={{
          position: "relative", borderRadius: 18, overflow: "hidden",
          background: c.bg, border: c.border,
          boxShadow: "0 6px 26px rgba(245,158,11,0.18), inset 0 1px 0 rgba(255,255,255,0.10)",
          animation: i === 0 ? "pulse-glow 2.6s ease-in-out infinite" : "none",
        }}>
          {/* barra de topo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "9px 14px", background: c.barBg, borderBottom: c.barBorder }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>📢</span>
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1.5, color: c.label, textTransform: "uppercase" }}>
                Aviso da Teresa
              </span>
            </div>
            <button onClick={() => dispensar(a.id)} title="Dispensar" style={{
              background: "none", border: "none", color: c.x,
              fontSize: 16, cursor: "pointer", lineHeight: 1, padding: 2 }}>✕</button>
          </div>

          {/* corpo */}
          <div style={{ padding: "13px 15px 15px" }}>
            {a.text && (
              <div style={{ fontSize: 14, color: c.text, lineHeight: 1.55, fontWeight: 600, whiteSpace: "pre-wrap" }}>
                <Linkify>{a.text}</Linkify>
              </div>
            )}
            {a.media && (
              <img src={a.media} alt="" style={{ width: "100%", borderRadius: 12, marginTop: 10 }} />
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
              <span style={{ fontSize: 10, color: c.date, fontWeight: 600 }}>{a.time || ""}</span>
              <button onClick={irAoForum} style={{
                background: c.btnBg, border: c.btnBorder, color: c.btnText,
                borderRadius: 20, padding: "5px 14px", fontSize: 11, fontWeight: 900, cursor: "pointer" }}>
                Ver no fórum →
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
