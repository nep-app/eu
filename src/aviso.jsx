import React, { useEffect, useState } from 'react';

// Substitui o alert() do browser: aparece no topo, não bloqueia a página e
// desaparece sozinho. Pode ser chamado de qualquer sítio, dentro ou fora de
// componentes — tal como o alert() era.
let proximoId = 1;
let avisos = [];
const ouvintes = new Set();

function emitir() { ouvintes.forEach(fn => fn([...avisos])); }

function tirar(id) {
  avisos = avisos.filter(a => a.id !== id);
  emitir();
}

export function aviso(texto, tipo) {
  const msg = String(texto ?? "").trim();
  if (!msg) return undefined;
  const t = tipo || (/^(erro|⚠️|falhou|não foi possível|nao foi possivel)/i.test(msg) ? "erro" : "ok");
  const id = proximoId++;
  avisos = [...avisos, { id, texto: msg, tipo: t }];
  emitir();
  setTimeout(() => tirar(id), t === "erro" ? 7000 : 3800);
  return undefined;   // mantém o padrão `return alert(...)` que já existia
}

const CORES = {
  ok:   { fundo: "rgba(16,40,66,0.97)", borda: "#32C7FF", texto: "#ffffff" },
  erro: { fundo: "rgba(60,16,30,0.97)", borda: "#f43f5e", texto: "#ffe4e9" },
};

export default function Avisos() {
  const [lista, setLista] = useState([]);
  useEffect(() => {
    ouvintes.add(setLista);
    return () => { ouvintes.delete(setLista); };
  }, []);
  if (lista.length === 0) return null;
  return (
    <div style={{
      position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)",
      zIndex: 99999, display: "flex", flexDirection: "column", gap: 8,
      width: "min(440px, calc(100vw - 24px))", pointerEvents: "none",
    }}>
      {lista.map(a => {
        const c = CORES[a.tipo] || CORES.ok;
        return (
          <div key={a.id} onClick={() => tirar(a.id)} style={{
            pointerEvents: "auto", cursor: "pointer",
            background: c.fundo, border: `1.5px solid ${c.borda}`, color: c.texto,
            borderRadius: 14, padding: "12px 16px", fontSize: 13, fontWeight: 700,
            lineHeight: 1.45, whiteSpace: "pre-wrap", wordBreak: "break-word",
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)", backdropFilter: "blur(8px)",
            animation: "fadeUp 0.22s ease",
          }}>
            {a.texto}
          </div>
        );
      })}
    </div>
  );
}
