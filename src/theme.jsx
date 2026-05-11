import React from 'react';

// ── CORES BASE (PALETA NÉON SPACE) ──
export const BG = "#070b14"; 
export const PNK = "#f472b6"; 
export const CYN = "#22d3ee"; 

// ── ESTILO DOS CARTÕES (GLASSMORPHISM) ──
export const CARD = { 
  background: "rgba(15, 23, 42, 0.8)", 
  borderRadius: 24, 
  padding: "20px", 
  marginBottom: 16, 
  backdropFilter: "blur(15px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
  color: "white",
  width: "100%",
  boxSizing: "border-box", // CRÍTICO: Impede que a largura ultrapasse o ecrã
  position: "relative",
  overflow: "hidden"
};

// ── ESTILO DOS TÍTULOS (SECTION LABELS) ──
export const SL = { 
  fontSize: 11, 
  fontWeight: 900, 
  letterSpacing: 2.5, 
  textTransform: "uppercase", 
  color: CYN, 
  marginBottom: 14,
  textShadow: "0 0 12px rgba(34, 211, 238, 0.4)",
  display: "block"
};

// ── ESTILO DOS CAMPOS DE TEXTO E INPUTS ──
export const INP = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 16,
  background: "rgba(0, 0, 0, 0.4)",
  border: "1.5px solid rgba(255, 255, 255, 0.15)",
  color: "white",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box", // CRÍTICO: Garante que o padding não empurra a borda
  fontFamily: "inherit",
  transition: "all 0.2s ease",
  marginBottom: "12px"
};

// ── CONFIGURAÇÃO DE PRIORIDADES ──
export const PS = {
  urgent:  { dot: "#f43f5e", bg: "rgba(244, 63, 94, 0.15)", badge: "URGENTE",   bc: "#fb7185", bl: "#f43f5e" },
  pending: { dot: "#fbbf24", bg: "rgba(251, 191, 36, 0.15)", badge: "PENDENTE",  bc: "#fcd34d", bl: "#fbbf24" },
  new:     { dot: CYN,       bg: "rgba(34, 211, 238, 0.15)", badge: "NOVO",      bc: CYN,       bl: CYN },
};

// ── LOGOTIPO DA APP (AJUSTADO PARA O TEU FICHEIRO) ──
export function AppIcon({ size = 64 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
      <img 
        src="/logo.png.png" 
        alt="JEEP EDUCA+" 
        style={{ width: size, height: "auto", objectFit: "contain", maxWidth: "100%" }}
        onError={(e) => {
          // Se o logo.png.png não carregar, mostra o foguetão ciano
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `<span style="font-size: ${size/2}px; filter: drop-shadow(0 0 10px ${CYN})">🚀</span>`;
        }}
      />
    </div>
  );
}

// ── MENU DE ABAS (SUBTABS SEM SCROLL FEIO) ──
export function SubTabs({ options, active, onChange, color = CYN }) {
  return (
    <div style={{ 
      display:"flex", 
      flexWrap: "wrap", // Permite que os botões saltem de linha se não couberem
      gap:6, 
      marginBottom:20, 
      padding:6, 
      background:"rgba(0,0,0,0.5)", 
      borderRadius:20, 
      border:"1px solid rgba(255,255,255,0.1)"
    }}>
      {options.map(opt => {
        let isA = active === opt[0];
        return (
          <button key={opt[0]} onClick={() => onChange(opt[0])}
            style={{ 
              flex: "1 1 auto",
              padding:"10px 14px", 
              borderRadius:15, 
              border:"none", 
              background:isA ? color : "transparent",
              fontSize:10, 
              fontWeight:900, 
              cursor:"pointer", 
              color:isA ? "#070b14" : "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              whiteSpace: "nowrap",
              transition: "all 0.2s"
            }}>
            {opt[1]}
          </button>
        );
      })}
    </div>
  );
}

// ── BOTÕES GLOBAIS ──
export function Btn({ children, onClick, variant, color = CYN, disabled }) {
  let base = { 
    width:"100%", padding:"16px", fontSize:13, fontWeight:900, 
    cursor:"pointer", border:"none", borderRadius:20, 
    textTransform:"uppercase", letterSpacing:1.5, 
    transition:"all 0.2s", opacity: disabled ? 0.6 : 1,
    display: "flex", justifyContent: "center", alignItems: "center"
  };
  
  if (variant === "success") 
    return <button disabled={disabled} onClick={onClick} style={{ ...base, background:`linear-gradient(135deg, ${CYN}, #0ea5e9)`, color:"#070b14", boxShadow: `0 4px 20px ${CYN}50` }}>{children}</button>;
  
  if (variant === "dark")    
    return <button disabled={disabled} onClick={onClick} style={{ ...base, background:"rgba(255,255,255,0.08)", color:"white", border:"1px solid rgba(255,255,255,0.15)" }}>{children}</button>;
  
  return <button disabled={disabled} onClick={onClick} style={{ ...base, background:color, color:"#070b14", boxShadow: `0 4px 20px ${color}40` }}>{children}</button>;
}

// ── GRÁFICO DA RODA DA VIDA (RADAR CHART) ──
export function RadarChart({ scores, color, prev }) {
  let NR=7, CX=150, CY=150, RR=100;
  let IDS = ["familia","amigos","dinheiro","trabalho","cresc","saude","lazer"];
  let LBL = ["🏠","👥","💰","💼","🌱","❤️","🎉"];
  
  let ang = i => (i/NR)*2*Math.PI - Math.PI/2;
  let pt = (i,f) => [CX+f*RR*Math.cos(ang(i)), CY+f*RR*Math.sin(ang(i))];
  
  let polyStr = fracs => fracs.map((f,i) => { 
    let c=pt(i,f); return c[0].toFixed(1)+","+c[1].toFixed(1); 
  }).join(" ");
  
  let fracs = IDS.map(id => (scores[id]||0)/10);
  let pF = prev ? IDS.map(id => (prev[id]||0)/10) : null;

  return (
    <svg viewBox="0 0 300 300" style={{ width:"100%", maxWidth:260, display:"block", margin:"0 auto" }}>
      {/* Círculos concêntricos de fundo */}
      {[0.2,0.4,0.6,0.8,1.0].map(f => (
        <polygon key={f} points={polyStr(Array(NR).fill(f))} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      ))}
      {/* Gráfico da avaliação anterior (tracejado) */}
      {pF && <polygon points={polyStr(pF)} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="4,3"/>}
      {/* Gráfico da avaliação atual */}
      <polygon points={polyStr(fracs)} fill={color+"30"} stroke={color} strokeWidth="3"/>
      {/* Ícones e pontos */}
      {IDS.map((_,i) => {
        let c=pt(i,fracs[i]);
        let a=ang(i), lx=CX+(RR+25)*Math.cos(a), ly=CY+(RR+25)*Math.sin(a);
        return (
          <g key={i}>
            <circle cx={c[0]} cy={c[1]} r="4.5" fill={color} stroke={BG} strokeWidth="1.5"/>
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="16">{LBL[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}
