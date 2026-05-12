import React from 'react';

// ── CORES BASE (SOFT DARK MODE) ──
// Em vez de preto absoluto, usamos um azul-acinzentado escuro e macio.
export const BG  = "#1e293b"; 
export const PRP = "#a855f7"; // Roxo do teu logo (para títulos e botões principais)
export const CYN = "#38bdf8"; // Azul/Ciano (para destaques)
export const PNK = "#f472b6"; // Rosa (mantido aqui para não crashar a Teresa)
export const TXT_MAIN = "#f8fafc"; 
export const TXT_MUT = "#94a3b8"; 

// ── CORREÇÃO GLOBAL DO BROWSER ──
if (typeof document !== 'undefined') {
  document.body.style.backgroundColor = BG;
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.fontFamily = "system-ui, -apple-system, sans-serif";
  document.body.style.color = TXT_MAIN;
  document.documentElement.style.backgroundColor = BG;
}

// ── O VISUAL GLASSMORPHISM (ELEGANT & SOFT) ──
export const CARD = {
  background: "rgba(30, 41, 59, 0.7)", // Transparência suave no mesmo tom do fundo
  borderRadius: 24,
  padding: "20px",
  marginBottom: 16,
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.08)", // Borda fina e clara
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)", // Sombra reduzida, menos pesada
  color: TXT_MAIN,
  width: "100%",
  boxSizing: "border-box",
  position: "relative",
  overflow: "hidden"
};

// ── TÍTULOS DE SECÇÃO ──
export const SL = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 2,
  textTransform: "uppercase",
  color: PRP, // Roxo elegante
  marginBottom: 12,
  textShadow: "0 0 10px rgba(168, 85, 247, 0.2)", // Brilho muito reduzido
  display: "block"
};

// ── CAMPOS DE TEXTO (INPUTS) ──
export const INP = {
  width: "100%",
  padding: "14px",
  borderRadius: 14,
  background: "rgba(15, 23, 42, 0.4)", // Fundo do input ligeiramente mais escuro que o cartão
  border: "1px solid rgba(255, 255, 255, 0.1)",
  color: TXT_MAIN,
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "all 0.2s ease",
  marginBottom: "12px",
  display: "block"
};

// ── CONFIGURAÇÃO DE STATUS ──
export const PS = {
  urgent:  { dot: "#f43f5e", bg: "rgba(244, 63, 94, 0.15)", badge: "URGENTE",   bc: "#fb7185", bl: "rgba(244, 63, 94, 0.3)" },
  pending: { dot: "#fbbf24", bg: "rgba(251, 191, 36, 0.15)", badge: "PENDENTE",  bc: "#fcd34d", bl: "rgba(251, 191, 36, 0.3)" },
  new:     { dot: PRP,       bg: "rgba(168, 85, 247, 0.15)", badge: "NOVO",     bc: PRP,       bl: "rgba(168, 85, 247, 0.3)" },
};

// ── COMPONENTE DO LOGOTIPO ──
export function AppIcon({ size = 70 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "10px 0", width: "100%" }}>
      <img 
        src="/logo.png" 
        alt="JEEP EDUCA+" 
        style={{ width: size, height: "auto", objectFit: "contain", display: "block" }}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
}

// ── MENU DE ABAS (SUBTABS) ──
export function SubTabs({ options, active, onChange, color = PRP }) {
  return (
    <div style={{ 
      display:"flex", gap:4, marginBottom:16, padding:4, 
      background:"rgba(15, 23, 42, 0.4)", borderRadius:16, 
      overflowX:"auto", border:"1px solid rgba(255,255,255,0.05)" 
    }}>
      {options.map(opt => {
        let isA = active === opt[0];
        return (
          <button key={opt[0]} onClick={() => onChange(opt[0])}
            style={{ 
              flex:1, padding:"10px 4px", borderRadius:12, border:"none", 
              background:isA ? "rgba(255,255,255,0.1)" : "transparent",
              fontSize:11, fontWeight:800, cursor:"pointer", 
              color:isA ? color : TXT_MUT,
              boxShadow:isA ? "0 2px 8px rgba(0,0,0,0.2)" : "none", 
              whiteSpace:"nowrap", minWidth:50, transition: "0.2s"
            }}>
            {opt[1]}
          </button>
        );
      })}
    </div>
  );
}

// ── BOTÕES GERAIS COM VARIANTES ──
export function Btn({ children, onClick, variant, color = PRP, disabled }) {
  const base = { 
    width: "100%", 
    padding: "14px", 
    fontSize: 13, 
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

  // Botão Sucesso (Enviar à Teresa)
  if (variant === "success") return (
    <button disabled={disabled} onClick={onClick} style={{ 
      ...base, 
      background:`linear-gradient(135deg, ${PRP}, ${CYN})`, 
      color:"#ffffff", 
      boxShadow:`0 4px 15px rgba(168, 85, 247, 0.3)` 
    }}>
      {children}
    </button>
  );

  // Botão Dark (Guardar Privado) -> Discreto mas visível
  if (variant === "dark") return (
    <button disabled={disabled} onClick={onClick} style={{ 
      ...base, 
      background:"rgba(255,255,255,0.05)", 
      color:TXT_MAIN, 
      border:"1px solid rgba(255,255,255,0.15)" 
    }}>
      {children}
    </button>
  );

  // Botão Padrão
  return (
    <button disabled={disabled} onClick={onClick} style={{ 
      ...base, 
      background: color, 
      color:"#ffffff", 
      boxShadow:`0 4px 14px ${color}40` 
    }}>
      {children}
    </button>
  );
}

// ── TERMÓMETRO (BARRA DE PROGRESSO) ──
export function ProgressBar({ progress, color = PRP }) {
  return (
    <div style={{ 
      width: "100%", height: 8, background: "rgba(0,0,0,0.3)", 
      borderRadius: 10, marginTop: 8, overflow: "hidden" 
    }}>
      <div style={{ 
        width: `${progress}%`, height: "100%", background: color, 
        transition: "width 0.5s ease-out" 
      }} />
    </div>
  );
}

// ── RODA DA VIDA (RADAR CHART) ──
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
    let c = pt(i,f); return c[0].toFixed(1)+","+c[1].toFixed(1); 
  }).join(" ");
  
  const fracs = IDS.map(id => (scores[id]||0)/10);
  const pF = prev ? IDS.map(id => (prev[id]||0)/10) : null;

  return (
    <svg viewBox="0 0 300 300" style={{ width: "100%", maxWidth: 270, display: "block", margin: "0 auto" }}>
      {[0.2, 0.4, 0.6, 0.8, 1.0].map(f => (
        <polygon key={f} points={polyStr(Array(NR).fill(f))} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      ))}
      
      {IDS.map((_,i) => { 
        const c = pt(i, 1); 
        return <line key={i} x1={CX} y1={CY} x2={c[0]} y2={c[1]} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>; 
      })}

      {pF && <polygon points={polyStr(pF)} fill="none" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="1.5" strokeDasharray="4,3"/>}
      
      <polygon 
        points={polyStr(fracs)} 
        fill={color+"30"} 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinejoin="round" 
      />
      
      {IDS.map((_,i) => { 
        const c = pt(i, fracs[i]); 
        return <circle key={i} cx={c[0]} cy={c[1]} r="5" fill={color} stroke={BG} strokeWidth="2"/>; 
      })}
      
      {LBL.map((lb,i) => {
        const a = ang(i);
        const lx = CX + (RR + 26) * Math.cos(a);
        const ly = CY + (RR + 26) * Math.sin(a);
        const anchor = Math.cos(a) > 0.2 ? "start" : Math.cos(a) < -0.2 ? "end" : "middle";
        const baseline = Math.sin(a) > 0.3 ? "hanging" : Math.sin(a) < -0.3 ? "auto" : "middle";
        return (
          <text key={i} x={lx} y={ly} textAnchor={anchor} dominantBaseline={baseline} fontSize="10" fill={TXT_MUT} fontWeight="800">
            {lb}
          </text>
        );
      })}
    </svg>
  );
}
