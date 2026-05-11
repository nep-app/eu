import React from 'react';

/**
 * ── PALETA DE CORES NÉON SPACE ──
 * Estas cores são extraídas diretamente da identidade visual do logo JEEP.
 */
export const BG  = "#070b14"; // Azul Marinho Profundo (Deep Space)
export const PNK = "#f472b6"; // Rosa Vibrante (Néon)
export const CYN = "#22d3ee"; // Ciano Elétrico (Néon)
export const DRK = "#0f172a"; // Navy Slate (para fundos secundários)

/**
 * ── CONFIGURAÇÃO GLOBAL DO AMBIENTE ──
 * Garante que o fundo branco do browser desaparece no PC e Mobile.
 */
if (typeof document !== 'undefined') {
  document.body.style.backgroundColor = BG;
  document.body.style.margin = "0";
  document.body.style.padding = "0";
  document.body.style.fontFamily = "system-ui, -apple-system, sans-serif";
  document.body.style.color = "white";
  // Força o fundo escuro na raiz da página (evita flashes brancos)
  document.documentElement.style.backgroundColor = BG;
}

/**
 * ── ESTILO DOS CARTÕES (GLASSMORPHISM) ──
 * Bordas finas, transparência e desfoque de fundo (blur).
 */
export const CARD = {
  background: "rgba(15, 23, 42, 0.6)", 
  borderRadius: 24,
  padding: "20px",
  marginBottom: 16,
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(34, 211, 238, 0.15)", // Brilho ciano suave
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
  color: "white",
  width: "100%",
  boxSizing: "border-box",
  position: "relative",
  overflow: "hidden"
};

/**
 * ── TÍTULOS DE SECÇÃO (SECTION LABELS) ──
 */
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

/**
 * ── CAMPOS DE TEXTO (INPUTS) ──
 */
export const INP = {
  width: "100%",
  padding: "14px",
  borderRadius: 14,
  background: "rgba(0, 0, 0, 0.3)",
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

/**
 * ── CONFIGURAÇÃO DE STATUS E PRIORIDADES ──
 */
export const PS = {
  urgent:  { dot: "#f43f5e", bg: "rgba(244, 63, 94, 0.1)", badge: "URGENTE",   bc: "#fb7185", bl: "rgba(244, 63, 94, 0.3)" },
  pending: { dot: "#fbbf24", bg: "rgba(251, 191, 36, 0.1)", badge: "PENDENTE",  bc: "#fcd34d", bl: "rgba(251, 191, 36, 0.3)" },
  new:     { dot: CYN,       bg: "rgba(34, 211, 238, 0.1)", badge: "NOVO",      bc: CYN,       bl: "rgba(34, 211, 238, 0.3)" },
};

/**
 * ── LOGOTIPO (COMPONENTE ROBUSTO) ──
 * Procura o ficheiro logo.png na pasta public.
 */
export function AppIcon({ size = 64 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "10px 0", width: "100%" }}>
      <img 
        src="/logo.png" 
        alt="JEEP EDUCA+" 
        style={{ width: size, height: "auto", objectFit: "contain" }}
        onError={(e) => {
          // Se o logo não carregar, avisa-nos mas não quebra a App
          e.target.style.display = 'none';
          e.target.parentElement.innerHTML = `<span style="color:${CYN}; font-size:10px; font-weight:900;">ERRO: LOGO.PNG EM FALTA</span>`;
        }}
      />
    </div>
  );
}

/**
 * ── MENU DE ABAS (SUBTABS) ──
 */
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
              flex:1, padding:"8px 12px", borderRadius:12, border:"none", 
              background:isA ? "rgba(255,255,255,0.1)" : "transparent",
              fontSize:10, fontWeight:700, cursor:"pointer", color:isA ? color : "#64748b",
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

/**
 * ── BOTÕES GERAIS COM VARIANTES ──
 */
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

  // Botão Néon Sucesso (Enviar)
  if (variant === "success") return (
    <button disabled={disabled} onClick={onClick} style={{ 
      ...base, 
      background:`linear-gradient(135deg, ${CYN}, #0ea5e9)`, 
      color:BG, 
      boxShadow:`0 4px 14px rgba(34,211,238,0.4)` 
    }}>
      {children}
    </button>
  );

  // Botão Dark (Guardar Privado)
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

  // Botão Padrão
  return (
    <button disabled={disabled} onClick={onClick} style={{ 
      ...base, 
      background:`linear-gradient(135deg, ${color}, ${color}cc)`, 
      color:BG, 
      boxShadow:`0 4px 14px ${color}40` 
    }}>
      {children}
    </button>
  );
}

/**
 * ── TERMÓMETRO (BARRA DE PROGRESSO) ──
 */
export function ProgressBar({ progress, color = CYN }) {
  return (
    <div style={{ 
      width: "100%", height: 8, background: "rgba(0,0,0,0.3)", 
      borderRadius: 10, marginTop: 8, overflow: "hidden" 
    }}>
      <div style={{ 
        width: `${progress}%`, height: "100%", background: color, 
        boxShadow: `0 0 10px ${color}`, transition: "width 0.5s ease-out" 
      }} />
    </div>
  );
}

/**
 * ── RODA DA VIDA (RADAR CHART INTEGRAL) ──
 */
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
      {/* Grelha de Fundo */}
      {[0.2, 0.4, 0.6, 0.8, 1.0].map(f => (
        <polygon key={f} points={polyStr(Array(NR).fill(f))} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
      ))}
      
      {/* Eixos */}
      {IDS.map((_,i) => { 
        const c = pt(i, 1); 
        return <line key={i} x1={CX} y1={CY} x2={c[0]} y2={c[1]} stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>; 
      })}

      {/* HistóricoAnterior */}
      {pF && <polygon points={polyStr(pF)} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="4,3"/>}
      
      {/* Gráfico Atual */}
      <polygon 
        points={polyStr(fracs)} 
        fill={color+"30"} 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinejoin="round" 
        filter="drop-shadow(0 0 4px rgba(34, 211, 238, 0.5))"
      />
      
      {/* Pontos de Valor */}
      {IDS.map((_,i) => { 
        const c = pt(i, fracs[i]); 
        return <circle key={i} cx={c[0]} cy={c[1]} r="5" fill={color} stroke={BG} strokeWidth="2"/>; 
      })}
      
      {/* Legendas e Ícones */}
      {LBL.map((lb,i) => {
        const a = ang(i);
        const lx = CX + (RR + 26) * Math.cos(a);
        const ly = CY + (RR + 26) * Math.sin(a);
        const anchor = Math.cos(a) > 0.2 ? "start" : Math.cos(a) < -0.2 ? "end" : "middle";
        const baseline = Math.sin(a) > 0.3 ? "hanging" : Math.sin(a) < -0.3 ? "auto" : "middle";
        return (
          <text key={i} x={lx} y={ly} textAnchor={anchor} dominantBaseline={baseline} fontSize="10" fill="#cbd5e1" fontWeight="700">
            {lb}
          </text>
        );
      })}
    </svg>
  );
}
