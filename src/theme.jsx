import React from 'react';

// ── DEFINIÇÕES DE CORES NÉON SPACE ──
export const BG = "#070b14"; 
export const PNK = "#f472b6"; 
export const CYN = "#22d3ee"; 
export const DRK = "#0f172a";

// ── CORREÇÃO GLOBAL DE FUNDO E FONTE ──
// Isto garante que o PC não mostra branco à volta e a letra é a padrão do sistema
if (typeof document !== 'undefined') {
  document.body.style.backgroundColor = BG;
  document.body.style.margin = "0";
  document.body.style.fontFamily = "system-ui, -apple-system, sans-serif";
  document.body.style.color = "white";
}

// ── ESTILO DOS CARTÕES (GLASSMORPHISM) ──
export const CARD = { 
  background: "rgba(15, 23, 42, 0.8)", 
  borderRadius: "28px", 
  padding: "22px", 
  marginBottom: "18px", 
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 12px 45px rgba(0, 0, 0, 0.6)",
  color: "white",
  width: "100%",
  boxSizing: "border-box", // Impede que o padding "empurre" a caixa para fora
  position: "relative",
  overflow: "hidden"
};

// ── TÍTULOS DE SECÇÃO (SUB-LABELS) ──
export const SL = { 
  fontSize: "11px", 
  fontWeight: "900", 
  letterSpacing: "2.5px", 
  textTransform: "uppercase", 
  color: CYN, 
  marginBottom: "16px",
  textShadow: "0 0 15px rgba(34, 211, 238, 0.4)",
  display: "block"
};

// ── CAMPOS DE ENTRADA (INPUTS E TEXTAREAS) ──
export const INP = {
  width: "100%",
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(0, 0, 0, 0.4)",
  border: "1.5px solid rgba(255, 255, 255, 0.12)",
  color: "white",
  fontSize: "16px", // Tamanho ideal para leitura e mobile
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "all 0.25s ease",
  marginBottom: "12px",
  display: "block"
};

// ── CONFIGURAÇÃO DE ESTADOS E PRIORIDADES ──
export const PS = {
  urgent:  { dot: "#f43f5e", bg: "rgba(244, 63, 94, 0.18)", badge: "URGENTE",   bc: "#fb7185", bl: "#f43f5e" },
  pending: { dot: "#fbbf24", bg: "rgba(251, 191, 36, 0.18)", badge: "PENDENTE",  bc: "#fcd34d", bl: "#fbbf24" },
  new:     { dot: CYN,       bg: "rgba(34, 211, 238, 0.18)", badge: "NOVO",      bc: CYN,       bl: CYN },
};

// ── COMPONENTE DO LOGOTIPO (USA O TEU LOGO.PNG.PNG) ──
export function AppIcon({ size = 64 }) {
  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      width: "100%",
      padding: "10px 0"
    }}>
      <img 
        src="/logo.png.png" 
        alt="JEEP EDUCA+" 
        style={{ 
          width: size, 
          height: "auto", 
          maxHeight: size * 1.5,
          objectFit: "contain", 
          maxWidth: "100%",
          filter: "drop-shadow(0 0 10px rgba(34, 211, 238, 0.2))"
        }}
        onError={(e) => {
          // Fallback caso o logo falhe
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `<span style="font-size: 32px">🚀</span>`;
        }}
      />
    </div>
  );
}

// ── MENU DE ABAS (SUBTABS COM WRAP) ──
export function SubTabs({ options, active, onChange, color = CYN }) {
  return (
    <div style={{ 
      display: "flex", 
      flexWrap: "wrap", // Essencial para evitar o scroll lateral
      gap: "8px", 
      marginBottom: "22px", 
      padding: "6px", 
      background: "rgba(0,0,0,0.5)", 
      borderRadius: "22px", 
      border: "1px solid rgba(255,255,255,0.08)"
    }}>
      {options.map(opt => {
        let isA = active === opt[0];
        return (
          <button key={opt[0]} onClick={() => onChange(opt[0])}
            style={{ 
              flex: "1 1 auto",
              padding: "12px 16px", 
              borderRadius: "16px", 
              border: "none", 
              background: isA ? color : "transparent",
              fontSize: "11px", 
              fontWeight: "900", 
              cursor: "pointer", 
              color: isA ? "#070b14" : "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              whiteSpace: "nowrap",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            }}>
            {opt[1]}
          </button>
        );
      })}
    </div>
  );
}

// ── BOTÕES GERAIS COM VARIANTES ──
export function Btn({ children, onClick, variant, color = CYN, disabled, style }) {
  const base = { 
    width: "100%", 
    padding: "18px", 
    fontSize: "13px", 
    fontWeight: "900", 
    cursor: "pointer", 
    border: "none", 
    borderRadius: "22px", 
    textTransform: "uppercase", 
    letterSpacing: "1.8px", 
    transition: "all 0.3s ease", 
    opacity: disabled ? 0.5 : 1,
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center",
    ...style 
  };
  
  if (variant === "success") {
    return (
      <button disabled={disabled} onClick={onClick} style={{ 
        ...base, 
        background: `linear-gradient(135deg, ${CYN}, #0ea5e9)`, 
        color: "#070b14", 
        boxShadow: `0 6px 20px ${CYN}40` 
      }}>
        {children}
      </button>
    );
  }
  
  if (variant === "dark") {
    return (
      <button disabled={disabled} onClick={onClick} style={{ 
        ...base, 
        background: "rgba(255, 255, 255, 0.08)", 
        color: "white", 
        border: "1.5px solid rgba(255, 255, 255, 0.15)" 
      }}>
        {children}
      </button>
    );
  }
  
  return (
    <button disabled={disabled} onClick={onClick} style={{ 
      ...base, 
      background: color, 
      color: "#070b14", 
      boxShadow: `0 6px 20px ${color}30` 
    }}>
      {children}
    </button>
  );
}

// ── GRÁFICO DE RADAR PARA A RODA DA VIDA ──
export function RadarChart({ scores, color, prev }) {
  const NR = 7; 
  const CX = 150; 
  const CY = 150; 
  const RR = 105;
  const IDS = ["familia","amigos","dinheiro","trabalho","cresc","saude","lazer"];
  const LBL = ["🏠","👥","💰","💼","🌱","❤️","🎉"];
  
  const ang = i => (i/NR)*2*Math.PI - Math.PI/2;
  const pt = (i,f) => [CX+f*RR*Math.cos(ang(i)), CY+f*RR*Math.sin(ang(i))];
  
  const polyStr = fracs => fracs.map((f,i) => { 
    let c = pt(i,f); return c[0].toFixed(1)+","+c[1].toFixed(1); 
  }).join(" ");
  
  const fracs = IDS.map(id => (scores[id]||0)/10);
  const pF = prev ? IDS.map(id => (prev[id]||0)/10) : null;

  return (
    <svg viewBox="0 0 300 300" style={{ width: "100%", maxWidth: "270px", display: "block", margin: "0 auto" }}>
      {/* Grelha Circular de Fundo */}
      {[0.2, 0.4, 0.6, 0.8, 1.0].map(f => (
        <polygon key={f} points={polyStr(Array(NR).fill(f))} fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1"/>
      ))}
      
      {/* Histórico (Linha Tracejada) */}
      {pF && (
        <polygon points={polyStr(pF)} fill="none" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="2" strokeDasharray="5,4"/>
      )}
      
      {/* Área Atual Preenchida */}
      <polygon points={polyStr(fracs)} fill={color+"35"} stroke={color} strokeWidth="3.5" strokeLinejoin="round"/>
      
      {/* Eixos e Ícones */}
      {IDS.map((_, i) => {
        const c = pt(i, fracs[i]);
        const a = ang(i);
        const lx = CX + (RR + 28) * Math.cos(a);
        const ly = CY + (RR + 28) * Math.sin(a);
        return (
          <g key={i}>
            <line x1={CX} y1={CY} x2={pt(i, 1)[0]} y2={pt(i, 1)[1]} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <circle cx={c[0]} cy={c[1]} r="5" fill={color} stroke={BG} strokeWidth="2"/>
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="18" style={{ filter: "drop-shadow(0 0 5px rgba(0,0,0,0.5))" }}>
              {LBL[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
