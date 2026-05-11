import React from 'react';

export const BG = "#070b14"; 
export const PNK = "#f472b6"; 
export const CYN = "#22d3ee"; 

export const CARD = { 
  background: "rgba(15, 23, 42, 0.75)", 
  borderRadius: 24, 
  padding: "20px", 
  marginBottom: 16, 
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
  color: "white",
  width: "100%",
  boxSizing: "border-box" // Fundamental para nada fugir
};

export const SL = { 
  fontSize: 11, 
  fontWeight: 900, 
  letterSpacing: 2, 
  textTransform: "uppercase", 
  color: CYN, 
  marginBottom: 12,
  textShadow: "0 0 10px rgba(34, 211, 238, 0.3)"
};

// Design das caixas de texto (Inputs e Textareas)
export const INP = {
  width: "100%",
  padding: "14px",
  borderRadius: 14,
  background: "rgba(0, 0, 0, 0.3)",
  border: "1.5px solid rgba(255, 255, 255, 0.1)",
  color: "white",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
  marginBottom: "10px"
};

export const PS = {
  urgent:  { dot: "#f43f5e", bg: "rgba(244, 63, 94, 0.1)", badge: "URGENTE",   bc: "#fb7185", bl: "#f43f5e" },
  pending: { dot: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)", badge: "PENDENTE",  bc: "#fcd34d", bl: "#fbbf24" },
  new:     { dot: CYN,       bg: "rgba(34, 211, 238, 0.1)", badge: "NOVO",      bc: CYN,       bl: CYN },
};

export function AppIcon({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <defs>
        <linearGradient id="ig1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0f172a"/><stop offset="100%" stopColor="#070b14"/></linearGradient>
        <linearGradient id="ig2" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor={PNK}/><stop offset="100%" stopColor={CYN}/></linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#ig1)" stroke={CYN} strokeWidth="1" strokeOpacity="0.3"/>
      <line x1="32" y1="50" x2="32" y2="28" stroke="url(#ig2)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M32 31 Q43 24 46 13 Q35 15 32 31" fill="url(#ig2)"/>
      <path d="M32 38 Q21 31 19 20 Q29 23 32 38" fill={CYN} opacity="0.8"/>
    </svg>
  );
}

// Menu de abas que não faz scroll (Grelha organizada)
export function SubTabs({ options, active, onChange, color = CYN }) {
  return (
    <div style={{ 
      display:"grid", 
      gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
      gap:6, 
      marginBottom:18, 
      padding:4, 
      background:"rgba(0,0,0,0.4)", 
      borderRadius:18, 
      border:"1px solid rgba(255,255,255,0.05)"
    }}>
      {options.map(opt => {
        let isA = active === opt[0];
        return (
          <button key={opt[0]} onClick={() => onChange(opt[0])}
            style={{ 
              padding:"10px 8px", 
              borderRadius:14, 
              border:"none", 
              background:isA ? color : "transparent",
              fontSize:10, 
              fontWeight:900, 
              cursor:"pointer", 
              color:isA ? "#0f172a" : "#94a3b8",
              textTransform: "uppercase",
              whiteSpace: "nowrap"
            }}>
            {opt[1]}
          </button>
        );
      })}
    </div>
  );
}

export function Btn({ children, onClick, variant, color = CYN, disabled }) {
  let base = { width:"100%", padding:"15px", fontSize:13, fontWeight:900, cursor:"pointer", border:"none", borderRadius:18, textTransform:"uppercase", letterSpacing:1.5, transition:"all 0.2s", opacity: disabled ? 0.5 : 1 };
  if (variant === "success") return <button disabled={disabled} onClick={onClick} style={{ ...base, background:`linear-gradient(135deg, ${CYN}, #0ea5e9)`, color:"#0f172a" }}>{children}</button>;
  if (variant === "dark")    return <button disabled={disabled} onClick={onClick} style={{ ...base, background:"rgba(255,255,255,0.06)", color:"white", border:"1px solid rgba(255,255,255,0.1)" }}>{children}</button>;
  return <button disabled={disabled} onClick={onClick} style={{ ...base, background:color, color:"#0f172a", boxShadow: `0 4px 15px ${color}30` }}>{children}</button>;
}

export function RadarChart({ scores, color, prev }) {
  let NR=7, CX=150, CY=150, RR=100;
  let IDS = ["familia","amigos","dinheiro","trabalho","cresc","saude","lazer"];
  let LBL = ["🏠","👥","💰","💼","🌱","❤️","🎉"];
  let ang = i => (i/NR)*2*Math.PI - Math.PI/2;
  let pt = (i,f) => [CX+f*RR*Math.cos(ang(i)), CY+f*RR*Math.sin(ang(i))];
  let polyStr = fracs => fracs.map((f,i) => { let c=pt(i,f); return c[0].toFixed(1)+","+c[1].toFixed(1); }).join(" ");
  let fracs = IDS.map(id => (scores[id]||0)/10);
  let pF = prev ? IDS.map(id => (prev[id]||0)/10) : null;
  return (
    <svg viewBox="0 0 300 300" style={{ width:"100%", maxWidth:250, display:"block", margin:"0 auto" }}>
      {[0.2,0.4,0.6,0.8,1.0].map(f => <polygon key={f} points={polyStr(Array(NR).fill(f))} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>)}
      {pF && <polygon points={polyStr(pF)} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="4,3"/>}
      <polygon points={polyStr(fracs)} fill={color+"30"} stroke={color} strokeWidth="2.5"/>
      {IDS.map((_,i) => {
        let c=pt(i,fracs[i]);
        let a=ang(i), lx=CX+(RR+25)*Math.cos(a), ly=CY+(RR+25)*Math.sin(a);
        return (
          <g key={i}>
            <circle cx={c[0]} cy={c[1]} r="4" fill={color}/>
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="14">{LBL[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}
