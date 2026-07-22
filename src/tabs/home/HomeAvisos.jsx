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
  const visiveis = avisos
    .filter(a => !a.target || a.target === "all" || a.target === meu)
    .filter(a => !dispensados.includes(a.id))
    .slice(0, 3);
  if (visiveis.length === 0) return null;

  return (
    <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      {visiveis.map((a, i) => (
        <div key={a.id} style={{
          position: "relative", borderRadius: 18, overflow: "hidden",
          background: "linear-gradient(150deg, rgba(255,196,61,0.14), rgba(255,79,163,0.10))",
          border: "1.5px solid rgba(255,196,61,0.55)",
          boxShadow: "0 6px 26px rgba(255,196,61,0.14), inset 0 1px 0 rgba(255,255,255,0.06)",
          animation: i === 0 ? "pulse-glow 2.6s ease-in-out infinite" : "none",
        }}>
          {/* barra de topo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "9px 14px", background: "rgba(255,196,61,0.16)", borderBottom: "1px solid rgba(255,196,61,0.28)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>📢</span>
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1.5, color: YLW, textTransform: "uppercase" }}>
                Aviso da Teresa
              </span>
            </div>
            <button onClick={() => dispensar(a.id)} title="Dispensar" style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.45)",
              fontSize: 16, cursor: "pointer", lineHeight: 1, padding: 2 }}>✕</button>
          </div>

          {/* corpo */}
          <div style={{ padding: "13px 15px 15px" }}>
            {a.text && (
              <div style={{ fontSize: 14, color: "#f8fafc", lineHeight: 1.55, fontWeight: 600, whiteSpace: "pre-wrap" }}>
                <Linkify>{a.text}</Linkify>
              </div>
            )}
            {a.media && (
              <img src={a.media} alt="" style={{ width: "100%", borderRadius: 12, marginTop: 10 }} />
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
              <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{a.time || ""}</span>
              <button onClick={irAoForum} style={{
                background: "rgba(50,199,255,0.14)", border: `1px solid ${CYN}45`, color: CYN,
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
