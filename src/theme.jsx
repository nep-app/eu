import React from 'react';

// ── CORES BASE (DARK MODE NÉON) ──
export const BG = "#070b14"; // Fundo mega escuro (Deep Space)
export const PNK = "#f472b6"; // Rosa Néon
export const CYN = "#22d3ee"; // Ciano Néon

export const CARD = { 
  background: "rgba(15, 23, 42, 0.6)", 
  borderRadius: 24, 
  padding: "20px", 
  marginBottom: 16, 
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(34, 211, 238, 0.15)", // Borda ciano muito suave
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
  color: "white"
};

export const SL = { 
  fontSize: 11, 
  fontWeight: 900, 
  letterSpacing: 2, 
  textTransform: "uppercase", 
  color: CYN, 
  marginBottom: 12,
  textShadow: "0 0 10px rgba(34, 211, 238, 0.4)"
};

export const PS = {
  urgent:  { dot: "#f43f5e", bg: "rgba(244, 63, 94, 0.1)", badge: "URGENTE",   bc: "#fb7185", bl: "rgba(244, 63, 94, 0.3)" },
  pending: { dot: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)", badge: "PENDENTE",  bc: "#fcd34d", bl: "rgba(251, 191, 36, 0.3)" },
  new:     { dot: CYN,       bg: "rgba(34, 211, 238, 0.1)", badge: "NOVO",      bc: CYN,       bl: "rgba(34, 211, 238, 0.3)" },
};

export function AppIcon({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <defs>
        <linearGradient id="ig1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0f172a"/><stop offset="100%" stopColor="#070b14"/></linearGradient>
        <linearGradient id="ig2" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor={PNK}/><stop offset="100%" stopColor={CYN}/></linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#ig1)" stroke={CYN} strokeWidth="1" strokeOpacity="0.3"/>
      <circle cx="32" cy="32" r="22" fill={CYN} opacity="0.1"/>
      <line x1="32" y1="50" x2="32" y2="28" stroke="url(#ig2)" strokeWidth="3" strokeLinecap="round"/>
      <path d="M32 31 Q43 24 46 13 Q35 15 32 31" fill="url(#ig2)"/>
      <path d="M32 38 Q21 31 19 20 Q29 23 32 38" fill={CYN} opacity="0.8"/>
      <line x1="25" y1="50" x2="39" y2="50" stroke={CYN} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

export function SubTabs({ options, active, onChange, color }) {
  return (
    <div style={{ display:"flex", gap:4, marginBottom:16, padding:4, background:"rgba(0,0,0,0.3)", borderRadius:16, overflowX:"auto", border:"1px solid rgba(255,255,255,0.05)" }}>
      {options.map(opt => {
        let isA = active === opt[0];
        return (
          <button key={opt[0]} onClick={() => onChange(opt[0])}
            style={{ flex:1, padding:"8px 4px", borderRadius:12, border:"none", background:isA ? "rgba(255,255,255,0.1)" : "transparent",
              fontSize:10, fontWeight:700, cursor:"pointer", color:isA ? color : "#64748b",
              boxShadow:isA ? "0 2px 8px rgba(0,0,0,0.2)" : "none", whiteSpace:"nowrap", minWidth:50 }}>
            {opt[1]}
          </button>
        );
      })}
    </div>
  );
}

export function Btn({ children, onClick, variant, color = CYN }) {
  let base = { width:"100%", padding:"14px", fontSize:14, fontWeight:800, cursor:"pointer", border:"none", borderRadius:14, textTransform:"uppercase", letterSpacing:1 };
  if (variant === "success") return <button onClick={onClick} style={{ ...base, background:`linear-gradient(135deg, ${CYN}, #0ea5e9)`, color:"#0f172a", boxShadow:`0 4px 14px rgba(34,211,238,0.4)` }}>{children}</button>;
  if (variant === "dark")    return <button onClick={onClick} style={{ ...base, background:"rgba(255,255,255,0.05)", color:"white", border:"1px solid rgba(255,255,255,0.1)" }}>{children}</button>;
  if (variant === "ghost")   return <button onClick={onClick} style={{ ...base, background:"transparent", color:"#94a3b8", border:"1px solid rgba(255,255,255,0.1)" }}>{children}</button>;
  return <button onClick={onClick} style={{ ...base, background:`linear-gradient(135deg, ${color}, ${color}cc)`, color:"#0f172a", boxShadow:`0 4px 14px ${color}40` }}>{children}</button>;
}

export function RadarChart({ scores, color, prev }) {
  let NR=7, CX=150, CY=150, RR=100;
  let IDS = ["familia","amigos","dinheiro","trabalho","cresc","saude","lazer"];
  let LBL = ["🏠 Família","👥 Amigos","💰 Dinheiro","💼 Trabalho","🌱 Crescimento","❤️ Saúde","🎉 Lazer"];
  let ang = i => (i/NR)*2*Math.PI - Math.PI/2;
  let pt = (i,f) => [CX+f*RR*Math.cos(ang(i)), CY+f*RR*Math.sin(ang(i))];
  let polyStr = fracs => fracs.map((f,i) => { let c=pt(i,f); return c[0].toFixed(1)+","+c[1].toFixed(1); }).join(" ");
  let fracs = IDS.map(id => (scores[id]||0)/10);
  let pF = prev ? IDS.map(id => (prev[id]||0)/10) : null;
  
  return (
    <svg viewBox="0 0 300 300" style={{ width:"100%", maxWidth:270, display:"block", margin:"0 auto" }}>
      {[0.2,0.4,0.6,0.8,1.0].map(f => <polygon key={f} points={polyStr(Array(NR).fill(f))} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>)}
      {IDS.map((_,i) => { let c=pt(i,1); return <line key={i} x1={CX} y1={CY} x2={c[0].toFixed(1)} y2={c[1].toFixed(1)} stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>; })}
      {pF && <polygon points={polyStr(pF)} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="4,3"/>}
      <polygon points={polyStr(fracs)} fill={color+"30"} stroke={color} strokeWidth="2.5" strokeLinejoin="round" filter="drop-shadow(0 0 4px rgba(34, 211, 238, 0.5))"/>
      {IDS.map((_,i) => { let c=pt(i,fracs[i]); return <circle key={i} cx={c[0].toFixed(1)} cy={c[1].toFixed(1)} r="5" fill={color} stroke="#0f172a" strokeWidth="2"/>; })}
      {LBL.map((lb,i) => {
        let a=ang(i), lx=CX+(RR+26)*Math.cos(a), ly=CY+(RR+26)*Math.sin(a);
        let anchor=Math.cos(a)>0.2?"start":Math.cos(a)<-0.2?"end":"middle";
        let baseline=Math.sin(a)>0.3?"hanging":Math.sin(a)<-0.3?"auto":"middle";
        return <text key={i} x={lx.toFixed(1)} y={ly.toFixed(1)} textAnchor={anchor} dominantBaseline={baseline} fontSize="10" fill="#cbd5e1" fontWeight="700">{lb}</text>;
      })}
    </svg>
  );
}
