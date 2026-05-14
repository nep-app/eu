import React from 'react';
import logoImg from './logo.png';

// ── PALETA ───────────────────────────────────────────────────────────────────
export const BG      = "#1b2f4e";   // navy médio — claramente mais claro que preto
export const PRP     = "#a78bfa";
export const CYN     = "#38bdf8";
export const PNK     = "#f472b6";
export const GRN     = "#4ade80";
export const TXT_MAIN = "#f1f5f9";
export const TXT_MUT  = "#7a90b0";  // ligeiramente mais claro para melhor legibilidade

// ── INJECÇÃO DE CSS GLOBAL ────────────────────────────────────────────────────
if (typeof document !== 'undefined') {
  document.body.style.backgroundColor = BG;
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";
  document.body.style.color = TXT_MAIN;
  document.documentElement.style.backgroundColor = BG;
  document.documentElement.style.background = BG;

  const style = document.createElement('style');
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');

    *::-webkit-scrollbar { display: none; }
    * { -ms-overflow-style: none; scrollbar-width: none; box-sizing: border-box; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 8px rgba(56,189,248,0.3); }
      50%       { box-shadow: 0 0 20px rgba(56,189,248,0.6); }
    }
    @keyframes fire-pulse {
      0%, 100% { transform: scale(1); }
      50%       { transform: scale(1.12); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    .fade-up { animation: fadeUp 0.35s ease both; }

    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator {
      filter: invert(0.5);
      cursor: pointer;
    }

    button:active { transform: scale(0.97); }

    .card-hover:hover {
      border-color: rgba(56,189,248,0.2) !important;
      transform: translateY(-1px);
      transition: all 0.2s ease;
    }
  `;
  document.head.appendChild(style);
}

// ── CARTÕES ───────────────────────────────────────────────────────────────────
export const CARD = {
  background: "rgba(255, 255, 255, 0.075)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: "20px",
  padding: "20px",
  margin: "0 0 16px 0",
  border: "1px solid rgba(255,255,255,0.13)",
  boxShadow: "0 4px 28px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.10)",
  color: TXT_MAIN,
  width: "100%",
  position: "relative",
  overflow: "hidden",
};

// Cartão com cor accent no topo
export function AccentCard({ color = CYN, children, style: extraStyle = {} }) {
  return (
    <div style={{ ...CARD, borderTop: `2px solid ${color}`, ...extraStyle }}>
      {children}
    </div>
  );
}

// ── LABELS DE SECÇÃO ──────────────────────────────────────────────────────────
export const SL = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 2.5,
  textTransform: "uppercase",
  color: TXT_MUT,
  marginBottom: 14,
  display: "block",
};

// ── INPUTS ────────────────────────────────────────────────────────────────────
export const INP = {
  width: "100%",
  padding: "13px 16px",
  borderRadius: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: TXT_MAIN,
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
  margin: "0 0 12px 0",
  display: "block",
};

// ── STATUS CONFIGS ─────────────────────────────────────────────────────────────
export const PS = {
  urgent:  { dot:"#f43f5e", bg:"rgba(244,63,94,0.08)",  badge:"URGENTE",  bc:"#f43f5e", bl:"rgba(244,63,94,0.25)" },
  pending: { dot:"#fbbf24", bg:"rgba(251,191,36,0.08)", badge:"PENDENTE", bc:"#fbbf24", bl:"rgba(251,191,36,0.25)" },
  new:     { dot:PRP,       bg:"rgba(167,139,250,0.08)", badge:"NOVO",    bc:PRP,       bl:"rgba(167,139,250,0.25)" },
};

// ── LOGO ─────────────────────────────────────────────────────────────────────
export function AppIcon({ size = 70 }) {
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:"10px 0", width:"100%" }}>
      <img src={logoImg} alt="JEEP EDUCA+" style={{ width:size, height:"auto", objectFit:"contain", display:"block", margin:"0 auto" }}/>
    </div>
  );
}

// ── SUB-TABS ─────────────────────────────────────────────────────────────────
export function SubTabs({ options, active, onChange, color = PRP }) {
  return (
    <div style={{ display:"flex", gap:4, marginBottom:18, padding:4, background:"rgba(255,255,255,0.03)", borderRadius:16, overflowX:"auto", border:"1px solid rgba(255,255,255,0.05)" }}>
      {options.map(opt => {
        const isA = active === opt[0];
        return (
          <button key={opt[0]} onClick={() => onChange(opt[0])} style={{
            flex:1, padding:"10px 6px", borderRadius:12, border:"none",
            background: isA ? `${color}18` : "transparent",
            fontSize:11, fontWeight:800, cursor:"pointer",
            color: isA ? color : TXT_MUT,
            boxShadow: isA ? `0 0 0 1px ${color}30` : "none",
            whiteSpace:"nowrap", minWidth:50, transition:"all 0.2s",
          }}>
            {opt[1]}
          </button>
        );
      })}
    </div>
  );
}

// ── BOTÕES ────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant, color = PRP, disabled, style: extraStyle = {} }) {
  const base = {
    width:"100%", padding:"14px 20px", fontSize:13, fontWeight:800,
    cursor: disabled ? "not-allowed" : "pointer", border:"none", borderRadius:14,
    textTransform:"uppercase", letterSpacing:1.2, transition:"all 0.2s",
    opacity: disabled ? 0.5 : 1, display:"flex", alignItems:"center",
    justifyContent:"center", gap:"8px", margin:"0",
    ...extraStyle,
  };

  if (variant === "ghost") return (
    <button disabled={disabled} onClick={onClick} style={{ ...base, background:"transparent", color:TXT_MUT, border:"1px solid rgba(255,255,255,0.08)" }}>
      {children}
    </button>
  );

  if (variant === "dark") return (
    <button disabled={disabled} onClick={onClick} style={{ ...base, background:"rgba(255,255,255,0.06)", color:TXT_MAIN, border:"1px solid rgba(255,255,255,0.1)" }}>
      {children}
    </button>
  );

  if (variant === "success") return (
    <button disabled={disabled} onClick={onClick} style={{ ...base, background:`linear-gradient(135deg, ${PRP} 0%, ${CYN} 100%)`, color:"#fff", boxShadow:`0 4px 20px rgba(167,139,250,0.35)` }}>
      {children}
    </button>
  );

  return (
    <button disabled={disabled} onClick={onClick} style={{ ...base, background:`linear-gradient(135deg, ${color}, ${color}cc)`, color:"#fff", boxShadow:`0 4px 16px ${color}35` }}>
      {children}
    </button>
  );
}

// ── BADGE ─────────────────────────────────────────────────────────────────────
export function Badge({ children, color = PRP }) {
  return (
    <span style={{ fontSize:9, fontWeight:900, background:`${color}20`, color, border:`1px solid ${color}40`, padding:"2px 7px", borderRadius:6, letterSpacing:1, textTransform:"uppercase", verticalAlign:"middle" }}>
      {children}
    </span>
  );
}

// ── PROGRESS BAR ─────────────────────────────────────────────────────────────
export function ProgressBar({ progress, color = PRP, label }) {
  return (
    <div>
      {label && (
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:11, color:TXT_MUT, fontWeight:700 }}>{label}</span>
          <span style={{ fontSize:11, color, fontWeight:800 }}>{progress}%</span>
        </div>
      )}
      <div style={{ width:"100%", height:6, background:"rgba(255,255,255,0.06)", borderRadius:10, overflow:"hidden" }}>
        <div style={{ width:`${progress}%`, height:"100%", background:`linear-gradient(90deg, ${color}, ${color}99)`, borderRadius:10, transition:"width 0.6s ease-out" }}/>
      </div>
    </div>
  );
}

// ── RADAR CHART ───────────────────────────────────────────────────────────────
export function RadarChart({ scores, color, prev }) {
  const NR = 7;
  const CX = 150; const CY = 150; const RR = 100;
  const IDS = ["familia","amigos","dinheiro","trabalho","cresc","saude","lazer"];
  const LBL = ["🏠 Família","👥 Amigos","💰 Dinheiro","💼 Trabalho","🌱 Crescimento","❤️ Saúde","🎉 Lazer"];
  const ang = i => (i/NR)*2*Math.PI - Math.PI/2;
  const pt  = (i,f) => [CX+f*RR*Math.cos(ang(i)), CY+f*RR*Math.sin(ang(i))];
  const polyStr = fracs => fracs.map((f,i) => { const c = pt(i,f); return c[0].toFixed(1)+","+c[1].toFixed(1); }).join(" ");
  const fracs = IDS.map(id => (scores[id]||0)/10);
  const pF = prev ? IDS.map(id => (prev[id]||0)/10) : null;
  return (
    <svg viewBox="0 0 300 300" style={{ width:"100%", maxWidth:270, display:"block", margin:"0 auto" }}>
      {[0.2,0.4,0.6,0.8,1.0].map(f => (
        <polygon key={f} points={polyStr(Array(NR).fill(f))} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
      ))}
      {IDS.map((_,i) => { const c = pt(i,1); return <line key={i} x1={CX} y1={CY} x2={c[0]} y2={c[1]} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>; })}
      {pF && <polygon points={polyStr(pF)} fill="none" stroke={`${color}40`} strokeWidth="1.5" strokeDasharray="4,3"/>}
      <polygon points={polyStr(fracs)} fill={`${color}18`} stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
      {IDS.map((_,i) => { const c = pt(i,fracs[i]); return <circle key={i} cx={c[0]} cy={c[1]} r="5" fill={color} stroke={BG} strokeWidth="2"/>; })}
      {LBL.map((lb,i) => {
        const a = ang(i); const lx = CX+(RR+28)*Math.cos(a); const ly = CY+(RR+28)*Math.sin(a);
        const anchor = Math.cos(a) > 0.2 ? "start" : Math.cos(a) < -0.2 ? "end" : "middle";
        const baseline = Math.sin(a) > 0.3 ? "hanging" : Math.sin(a) < -0.3 ? "auto" : "middle";
        return <text key={i} x={lx} y={ly} textAnchor={anchor} dominantBaseline={baseline} fontSize="10" fill={TXT_MUT} fontWeight="700">{lb}</text>;
      })}
    </svg>
  );
}
