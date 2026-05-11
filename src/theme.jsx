import React from 'react';

// ── DEFINIÇÕES DE CORES NÉON SPACE ──
// Mantemos o Navy, o Rosa e o Ciano conforme o teu logo. O branco desaparece.
export const BG = "#070b14"; // Deep Space escuro
export const PNK = "#f472b6"; // Rosa Néon do teu logo
export const CYN = "#22d3ee"; // Ciano Néon do teu logo

// ── CORREÇÃO GLOBAL DE FUNDO E TIPOGRAFIA ──
// Isto garante que o PC não mostra branco à volta da app.
if (typeof document !== 'undefined') {
  document.body.style.backgroundColor = BG;
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.fontFamily = "sans-serif";
  document.body.style.color = "white";
  document.documentElement.style.backgroundColor = BG;
}

// ── O VISUAL CLEAN QUE TU ADORAS (GLASSMORPHISM) ──
export const CARD = {
  background: "rgba(15, 23, 42, 0.6)", // Azul marinho transparente original
  borderRadius: 24,
  padding: "20px",
  marginBottom: 16,
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(34, 211, 238, 0.15)", // Brilho ciano na borda suave
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
  color: "white",
  width: "100%",
  boxSizing: "border-box",
  position: "relative",
  overflow: "hidden"
};

// ── TÍTULOS DE SECÇÃO (SECTION LABELS) ──
export const SL = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: CYN,
  marginBottom: 12,
  textShadow: "0 0 10px rgba(34, 211, 238, 0.4)",
  display: "block"
};

// ── INPUTS (ESCURECIDOS E DISCRETOS) ──
export const INP = {
  width: "100%",
  padding: "14px",
  borderRadius: 14,
  background: "rgba(0, 0, 0, 0.3)", // Fundo preto transparente discreto
  border: "1px solid rgba(255, 255, 255, 0.1)",
  color: "white",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "all 0.2s ease",
  marginBottom: "12px",
  display: "block"
};

// ── CONFIGURAÇÃO DE PRIORIDADES E STATUS ──
export const PS = {
  urgent:  { dot: "#f43f5e", bg: "rgba(244, 63, 94, 0.1)", badge: "URGENTE",   bc: "#fb7185", bl: "rgba(244, 63, 94, 0.3)" },
  pending: { dot: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)", badge: "PENDENTE",  bc: "#fcd34d", bl: "rgba(251, 191, 36, 0.3)" },
  new:     { dot: CYN,       bg: "rgba(34, 211, 238, 0.1)", badge: "NOVO",      bc: CYN,       bl: "rgba(34, 211, 238, 0.3)" },
};

// ── COMPONENTE DO LOGOTIPO (ROBUSTO E CORRETO) ──
export function AppIcon({ size = 64 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "10px 0", width: "100%" }}>
      <img 
        src="/logo.png" 
        alt="JEEP EDUCA+" 
        style={{ width: size, height: "auto", objectFit: "contain" }}
        onError={(e) => {
          // Fallback caso o nome seja apenas logo.png
          if (!e.target.src.includes("logo.png")) e.target.src = "/logo.png";
        }}
      />
    </div>
  );
}

// ── MENU DE ABAS (SUBTABS ORIGINAL) ──
export function SubTabs({ options, active, onChange, color = CYN }) {
  return (
    <div style={{ 
      display:"flex", gap:4, marginBottom:16, padding:4, 
      background:"rgba(0,0,0,0.3)", borderRadius:16, 
      overflowX:"auto", border:"1px solid rgba(255,255,255,0.05)" 
    }}>
      {options.map(opt => {
        let isA = active === opt[0];
        return (
          <button key={opt[0]} onClick={() => onChange(opt[0])}
            style={{ 
              flex:1, padding:"8px 4px", borderRadius:12, border:"none", 
              background:isA ? "rgba(255,255,255,0.1)" : "transparent",
              fontSize:10, fontWeight:700, cursor:"pointer", color:isA ? color : "#64748b",
              boxShadow:isA ? "0 2px 8px rgba(0,0,0,0.2)" : "none", whiteSpace:"nowrap", minWidth:50,
              transition: "0.2s"
            }}>
            {opt[1]}
          </button>
        );
      })}
    </div>
  );
}

// ── BOTÕES (VARIÁVEIS NÉON PARA ENVIO E GUARDAR) ──
export function Btn({ children, onClick, variant, color = CYN, disabled }) {
  const base = { 
    width: "100%", 
    padding: "14px", 
    fontSize: 14, 
    fontWeight: 800, 
    cursor: "pointer", 
    border: "none", 
    borderRadius: 14, 
    textTransform: "uppercase", 
    letterSpacing: 1,
    transition: "all 0.2s",
    opacity: disabled ? 0.6 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  };
  
  // Botão para Enviar à Teresa (Ciano Néon)
  if (variant === "success") return (
    <button disabled={disabled} onClick={onClick} style={{ 
      ...base, 
      background:`linear-gradient(135deg, ${CYN}, #0ea5e9)`, 
      color:"#0f172a", 
      boxShadow:`0 4px 14px rgba(34,211,238,0.4)` 
    }}>
      {children}
    </button>
  );
  
  // Botão para Guardar Privado (Escuro)
  if (variant === "dark") return (
    <button disabled={disabled} onClick={onClick} style={{ 
      ...base, 
      background:"rgba(255,255,255,0.05)", 
      color:"white", 
      border:"1px solid rgba(255,255,255,0.1)" 
    }}>
      {children}
    </button>
  );
  
  // Botão Padrão (Ciano ou Dinâmico)
  return (
    <button disabled={disabled} onClick={onClick} style={{ 
      ...base, 
      background:`linear-gradient(135deg, ${color}, ${color}cc)`, 
      color:"#0f172a", 
      boxShadow:`0 4px 14px ${color}40` 
    }}>
      {children}
    </button>
  );
}

// ── COMPONENTE DE BARRA DE PROGRESSO (TERMÓMETRO) ──
export function ProgressBar({ progress, color = CYN }) {
  return (
    <div style={{ width: "100%", height: 8, background: "rgba(0,0,0,0.3)", borderRadius: 10, marginTop: 8, overflow: "hidden" }}>
      <div style={{ width: `${progress}%`, height: "100%", background: color, boxShadow: `0 0 10px ${color}`, transition: "width 0.5s ease-out" }} />
    </div>
  );
}

// ── RODA DA VIDA (RADAR CHART INTEGRAL) ──
export function RadarChart({ scores, color, prev }) {
  const NR = 7; 
  const CX = 150; 
  const CY = 150; 
  const RR = 100;
  const IDS = ["familia","amigos","dinheiro","trabalho","cresc","saude","lazer"];
  const LBL = ["🏠 Família","👥 Amigos","💰 Dinheiro","💼 Trabalho","🌱 Crescimento","❤️ Saúde","🎉 Lazer"];
  
  const ang = i => (i/NR)*2*Math.PI - Math.PI/2;
  const pt = (i,f) => [CX+f*RR*Math.cos(ang(i)), CY+f*RR*Math.sin(ang(i))];
  
  const polyStr = fracs => fracs.map((f,i) => { 
    let c = pt(i,f); 
    return c[0].toFixed(1)+","+c[1].toFixed(1); 
  }).join(" ");
  
  const fracs = IDS.map(id => (scores[id]||0)/10);
  const pF = prev ? IDS.map(id => (prev[id]||0)/10) : null;

  return (
    <svg viewBox="0 0 300 300" style={{ width: "100%", maxWidth: 270, display: "block", margin: "0 auto" }}>
      {/* Círculos concêntricos */}
      {[0.2, 0.4, 0.6, 0.8, 1.0].map(f => (
        <polygon key={f} points={polyStr(Array(NR).fill(f))} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      ))}
      
      {/* Eixos */}
      {IDS.map((_,i) => { 
        const c = pt(i, 1); 
        return <line key={i} x1={CX} y1={CY} x2={c[0].toFixed(1)} y2={c[1].toFixed(1)} stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>; 
      })}

      {/* Histórico Anterior (Tracejado) */}
      {pF && (
        <polygon points={polyStr(pF)} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="4,3"/>
      )}
      
      {/* Gráfico Atual */}
      <polygon 
        points={polyStr(fracs)} 
        fill={color+"30"} 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinejoin="round" 
        filter="drop-shadow(0 0 4px rgba(34, 211, 238, 0.5))"
      />
      
      {/* Pontos */}
      {IDS.map((_,i) => { 
        const c = pt(i, fracs[i]); 
        return <circle key={i} cx={c[0].toFixed(1)} cy={c[1].toFixed(1)} r="5" fill={color} stroke="#0f172a" strokeWidth="2"/>; 
      })}
      
      {/* Legendas */}
      {LBL.map((lb,i) => {
        const a = ang(i);
        const lx = CX + (RR + 26) * Math.cos(a);
        const ly = CY + (RR + 26) * Math.sin(a);
        const anchor = Math.cos(a) > 0.2 ? "start" : Math.cos(a) < -0.2 ? "end" : "middle";
        const baseline = Math.sin(a) > 0.3 ? "hanging" : Math.sin(a) < -0.3 ? "auto" : "middle";
        return (
          <text key={i} x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor={anchor} dominantBaseline={baseline} fontSize="10" fill="#cbd5e1" fontWeight="700">
            {lb}
          </text>
        );
      })}
    </svg>
  );
}
