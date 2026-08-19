import React from 'react';
import { CYN } from "../../theme.jsx";

// Lista de sugestões de @menção. Mesmo aspeto da caixa de publicar,
// mas reutilizável nas caixas de comentário (jovens e painel da Teresa).
// `acima` = abre para cima (para não ficar tapada pelo fundo da página).
export default function MencaoLista({ candidatos = [], onEscolher, acima = false }) {
  if (!candidatos.length) return null;
  return (
    <div style={{
      position:"absolute", left:0, right:0, zIndex:60,
      ...(acima ? { bottom:"calc(100% + 6px)" } : { top:"calc(100% + 6px)" }),
      background:"#1e293b", border:"1px solid rgba(255,255,255,0.12)",
      borderRadius:12, overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.5)",
    }}>
      {candidatos.map(j => (
        <div key={j.username} onMouseDown={e => { e.preventDefault(); onEscolher(j.username); }} style={{
          display:"flex", alignItems:"center", gap:10,
          padding:"10px 14px", cursor:"pointer",
          borderBottom:"1px solid rgba(255,255,255,0.05)",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <div style={{ width:28, height:28, borderRadius:10, flexShrink:0,
            background: j.username === "todos" ? "rgba(34,211,238,0.15)" : `linear-gradient(135deg, ${j.color}, ${j.color}66)`,
            border: j.username === "todos" ? `1px solid ${CYN}40` : "none",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize: j.username === "todos" ? 14 : 12, fontWeight:900,
            color: j.username === "todos" ? CYN : "#0f172a" }}>
            {j.username === "todos" ? "👥" : j.name[0]}
          </div>
          <div>
            <div style={{ fontSize:12, fontWeight:800, color:j.color }}>{j.name}</div>
            <div style={{ fontSize:10, color:"#64748b" }}>@{j.username}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
