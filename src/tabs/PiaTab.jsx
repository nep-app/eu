import React, { useState } from 'react';
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { 
  CARD, SL, INP, Btn, CYN, PNK, BG, ProgressBar 
} from "../theme.jsx";
import { nowLabel } from "../data.js";

export default function PiaTab({ user, data, setTab }) {
  const uData = data.userData || {};

  // ── ESTADOS DO PIA (O MEU PROJETO) ──
  const [pia, setPia] = useState(uData.pia || { 
    natureza: "", fundamento: "", objetivos: "", 
    metas: "", localizacao: "", atividades: "", 
    recursos: "", avaliacao: "" 
  });

  // ── ESTADOS DO RAIO-X (SWOT) ──
  const [swot, setSwot] = useState(uData.swotPia || { 
    forcas: "", fraquezas: "", 
    oportunidades: "", riscos: "" 
  });

  const [isLoading, setIsLoading] = useState(false);

  // Calcula o progresso de preenchimento (PIA + SWOT)
  const calcProgresso = () => {
    const totalCampos = Object.keys(pia).length + Object.keys(swot).length;
    const preenchidos = 
      Object.values(pia).filter(v => v.trim() !== "").length +
      Object.values(swot).filter(v => v.trim() !== "").length;
    return Math.round((preenchidos / totalCampos) * 100);
  };

  const progresso = calcProgresso();

  // ── FUNÇÃO: GUARDAR COMO RASCUNHO PRIVADO ──
  async function guardarRascunho() {
    setIsLoading(true);
    try {
      await setDoc(doc(db, "userData", user.username), { 
        pia, 
        swotPia: swot 
      }, { merge: true });
      alert("Rascunho guardado! A Teresa ainda não consegue ver.");
    } catch (e) {
      alert("Erro ao guardar: " + e.message);
    }
    setIsLoading(false);
  }

  // ── FUNÇÃO: PARTILHAR COM A TERESA (SUBMETER) ──
  async function submeterTeresa() {
    setIsLoading(true);
    try {
      await setDoc(doc(db, "userData", user.username), { 
        pia, 
        swotPia: swot, 
        piaShared: true, 
        swotShared: true, 
        piaSaved: true,
        weekXp: (uData.weekXp || 0) + 15, // Recompensa por partilhar
        history: [...(data.history || []), { date: nowLabel(), action: "Partilhou o PIA e o Raio-X com a Teresa", ts: Date.now() }]
      }, { merge: true });
      alert("PIA partilhado com a Teresa com sucesso! Ganhaste 15 XP.");
    } catch (e) {
      alert("Erro ao submeter: " + e.message);
    }
    setIsLoading(false);
  }

  return (
    <div style={{ padding: "18px 16px", paddingBottom: "100px" }}>
      
      {/* ── HEADER E PROGRESSO ── */}
      <div style={{ ...CARD, marginBottom: "20px" }}>
        <div style={{ fontSize: "16px", fontWeight: "900", color: CYN, marginBottom: "5px" }}>
          PLANO INDIVIDUAL DE AÇÃO
        </div>
        <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.5" }}>
          Desenha o teu projeto passo a passo e faz o Raio-X (SWOT) das tuas ideias. 
          Podes guardar e voltar mais tarde antes de enviares à Teresa.
        </div>
        <div style={{ marginTop: "15px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontWeight: "900", color: CYN }}>
            <span>PROGRESSO</span>
            <span>{progresso}%</span>
          </div>
          <ProgressBar progress={progresso} color={progresso === 100 ? "#22c55e" : PNK} />
        </div>
      </div>

      {/* ── BLOCO 1: O MEU PROJETO (PIA) ── */}
      <div style={CARD}>
        <div style={SL}>1. Desenho do Projeto</div>
        
        <label style={{ fontSize: "12px", fontWeight: "700", color: "#cbd5e1", marginBottom: "4px", display: "block" }}>O que queres fazer? (Natureza)</label>
        <textarea value={pia.natureza} onChange={e => setPia({...pia, natureza: e.target.value})} style={INP} rows={2} placeholder="Ex: Organizar sessões de cinema..." />
        
        <label style={{ fontSize: "12px", fontWeight: "700", color: "#cbd5e1", marginBottom: "4px", display: "block" }}>Porquê? (Fundamento)</label>
        <textarea value={pia.fundamento} onChange={e => setPia({...pia, fundamento: e.target.value})} style={INP} rows={2} placeholder="Qual a origem e fundamento da ideia..." />

        <label style={{ fontSize: "12px", fontWeight: "700", color: "#cbd5e1", marginBottom: "4px", display: "block" }}>Para quê? (Objetivos)</label>
        <textarea value={pia.objetivos} onChange={e => setPia({...pia, objetivos: e.target.value})} style={INP} rows={2} placeholder="Quais os teus objetivos reais..." />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#cbd5e1", marginBottom: "4px", display: "block" }}>Quanto? (Metas)</label>
            <input value={pia.metas} onChange={e => setPia({...pia, metas: e.target.value})} style={INP} placeholder="Métricas..." />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#cbd5e1", marginBottom: "4px", display: "block" }}>Onde? (Localização)</label>
            <input value={pia.localizacao} onChange={e => setPia({...pia, localizacao: e.target.value})} style={INP} placeholder="Onde vai ser..." />
          </div>
        </div>

        <label style={{ fontSize: "12px", fontWeight: "700", color: "#cbd5e1", marginBottom: "4px", display: "block" }}>Como e quando? (Atividades e Calendário)</label>
        <textarea value={pia.atividades} onChange={e => setPia({...pia, atividades: e.target.value})} style={INP} rows={2} placeholder="Ações necessárias..." />

        <label style={{ fontSize: "12px", fontWeight: "700", color: "#cbd5e1", marginBottom: "4px", display: "block" }}>Com o quê? (Recursos)</label>
        <textarea value={pia.recursos} onChange={e => setPia({...pia, recursos: e.target.value})} style={INP} rows={2} placeholder="Humanos, materiais, financeiros..." />

        <label style={{ fontSize: "12px", fontWeight: "700", color: "#cbd5e1", marginBottom: "4px", display: "block" }}>Como vais avaliar? (Avaliação)</label>
        <textarea value={pia.avaliacao} onChange={e => setPia({...pia, avaliacao: e.target.value})} style={{ ...INP, marginBottom: 0 }} rows={2} placeholder="Como saberás se correu bem?" />
      </div>

      {/* ── BLOCO 2: ANÁLISE SWOT (EM GRELHA 2x2 - COMO NA IMAGEM) ── */}
      <div style={CARD}>
        <div style={SL}>2. Raio-X do Projeto (SWOT)</div>
        <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "15px" }}>
          Mapeia as tuas Forças e Fraquezas (internas) e as Oportunidades e Riscos (externos).
        </div>

        {/* Grelha 2x2 (Quadrado) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          
          {/* QUADRANTE 1: FORÇAS (Verde/Ciano) */}
          <div style={{ background: "rgba(34, 197, 94, 0.05)", border: "1px solid rgba(34, 197, 94, 0.2)", borderRadius: "16px", padding: "12px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "11px", fontWeight: "900", color: "#4ade80", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "1px" }}>
              💪 Forças
            </div>
            <textarea 
              value={swot.forcas} 
              onChange={e => setSwot({...swot, forcas: e.target.value})} 
              style={{ ...INP, flex: 1, minHeight: "80px", background: "rgba(0,0,0,0.2)", border: "none", fontSize: "12px", padding: "10px" }} 
              placeholder="No que sou bom? O que tenho a meu favor?" 
            />
          </div>

          {/* QUADRANTE 2: FRAQUEZAS (Laranja/Amarelo) */}
          <div style={{ background: "rgba(251, 191, 36, 0.05)", border: "1px solid rgba(251, 191, 36, 0.2)", borderRadius: "16px", padding: "12px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "11px", fontWeight: "900", color: "#fbbf24", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "1px" }}>
              ⚠️ Fraquezas
            </div>
            <textarea 
              value={swot.fraquezas} 
              onChange={e => setSwot({...swot, fraquezas: e.target.value})} 
              style={{ ...INP, flex: 1, minHeight: "80px", background: "rgba(0,0,0,0.2)", border: "none", fontSize: "12px", padding: "10px" }} 
              placeholder="Onde preciso de ajuda? O que me falta?" 
            />
          </div>

          {/* QUADRANTE 3: OPORTUNIDADES (Ciano/Azul) */}
          <div style={{ background: "rgba(34, 211, 238, 0.05)", border: "1px solid rgba(34, 211, 238, 0.2)", borderRadius: "16px", padding: "12px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "11px", fontWeight: "900", color: CYN, textTransform: "uppercase", marginBottom: "8px", letterSpacing: "1px" }}>
              🌟 Oportunidades
            </div>
            <textarea 
              value={swot.oportunidades} 
              onChange={e => setSwot({...swot, oportunidades: e.target.value})} 
              style={{ ...INP, flex: 1, minHeight: "80px", background: "rgba(0,0,0,0.2)", border: "none", fontSize: "12px", padding: "10px" }} 
              placeholder="Quem me pode apoiar? O que há lá fora?" 
            />
          </div>

          {/* QUADRANTE 4: RISCOS (Rosa/Vermelho) */}
          <div style={{ background: "rgba(244, 63, 94, 0.05)", border: "1px solid rgba(244, 63, 94, 0.2)", borderRadius: "16px", padding: "12px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "11px", fontWeight: "900", color: "#fb7185", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "1px" }}>
              🚨 Riscos
            </div>
            <textarea 
              value={swot.riscos} 
              onChange={e => setSwot({...swot, riscos: e.target.value})} 
              style={{ ...INP, flex: 1, minHeight: "80px", background: "rgba(0,0,0,0.2)", border: "none", fontSize: "12px", padding: "10px" }} 
              placeholder="O que pode correr mal? Obstáculos?" 
            />
          </div>

        </div>
      </div>

      {/* ── BOTÕES DE AÇÃO (USANDO AS VARIANTES DO THEME) ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        
        {/* Botão de Guardar (Escuro/Discreto) */}
        <Btn 
          variant="dark" 
          onClick={guardarRascunho} 
          disabled={isLoading}
        >
          {isLoading ? "A guardar..." : "GUARDAR RASCUNHO"}
        </Btn>

        {/* Botão de Enviar (Ciano Brilhante) */}
        <Btn 
          variant="success" 
          onClick={submeterTeresa} 
          disabled={isLoading || progresso < 100}
          style={{ opacity: progresso < 100 ? 0.4 : 1 }}
        >
          {isLoading ? "A enviar..." : "ENVIAR À TERESA"}
        </Btn>

        {progresso < 100 && (
          <div style={{ textAlign: "center", fontSize: "10px", color: "#fbbf24", fontWeight: "700" }}>
            *Preenche todos os campos do PIA e SWOT para poderes enviar.
          </div>
        )}
      </div>

    </div>
  );
}        piaActs, 
        piaSaved: true, 
        piaShared: share,
        history: newH,
        weekXp: (uData.weekXp || 0) + (uData.piaSaved ? 0 : 10) // Ganha 10 XP na primeira vez que guarda
      }, { merge: true });
      
      alert(share ? "Enviado com sucesso para a Teresa! 🚀" : "Guardado apenas para ti. ✨");
    } catch (e) { alert("Erro ao guardar."); }
  }

  async function saveSwot(share) {
    try {
      await setDoc(doc(db, "userData", user.username), { 
        swotPia, 
        swotSaved: true, 
        swotShared: share 
      }, { merge: true });
      alert(share ? "Raio-X enviado para a Admin! 🔍" : "Raio-X guardado em privado.");
    } catch (e) { alert("Erro ao guardar."); }
  }

  // Helpers para atualizar estados locais via funções do pai ou diretas
  const updatePia = (key, val) => {
    const newPia = { ...pia, [key]: val };
    setDoc(doc(db, "userData", user.username), { pia: newPia }, { merge: true });
  };

  const updateAct = (idx, field, val) => {
    const newActs = [...piaActs];
    newActs[idx] = { ...newActs[idx], [field]: val };
    setDoc(doc(db, "userData", user.username), { piaActs: newActs }, { merge: true });
  };

  const updateSwot = (id, val) => {
    const newSwot = { ...swotPia, [id]: val };
    setDoc(doc(db, "userData", user.username), { swotPia: newSwot }, { merge: true });
  };

  return (
    <div style={{ padding: "18px 16px" }}>
      <SubTabs 
        options={[["planeamento", "📋 Planeamento"], ["swot", "🔍 Raio-X"]]} 
        active={subTab} onChange={setSubTab} color={CYN} 
      />

      {subTab === "planeamento" && (
        <div>
          {/* TERMÓMETRO */}
          <div style={CARD}>
            <div style={SL}>Termómetro do Projeto</div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 99, height: 14, marginBottom: 8, overflow: "hidden" }}>
              <div style={{ 
                background: `linear-gradient(90deg, ${CYN}, #0ea5e9)`, 
                height: "100%", 
                width: `${progPia}%`, 
                borderRadius: 99, 
                boxShadow: `0 0 15px ${CYN}60`,
                transition: "width 0.5s ease-out"
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 800 }}>
              <span style={{ color: "#94a3b8" }}>ESTADO DO PIA</span>
              <span style={{ color: CYN }}>{progPia}% CONCLUÍDO</span>
            </div>
          </div>

          {/* CAMPOS ESTRUTURAIS */}
          {PIA_FIELDS.map(f => (
            <div key={f.key} style={CARD}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 0.5 }}>{f.title}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{f.hint}</div>
                </div>
              </div>
              <textarea 
                value={pia[f.key] || ""} 
                onChange={(e) => updatePia(f.key, e.target.value)}
                style={INP} rows={3} placeholder={f.ph} 
              />
            </div>
          ))}

          {/* ATIVIDADES DETALHADAS */}
          <div style={SL}>📅 Atividades Específicas</div>
          {piaActs.map((act, i) => (
            <div key={i} style={{ ...CARD, borderLeft: `4px solid ${CYN}` }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: CYN, marginBottom: 12 }}>PROPOSTA #{i + 1}</div>
              
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>O QUE VOU FAZER?</div>
                <input value={act.oQue || ""} onChange={(e) => updateAct(i, "oQue", e.target.value)} style={INP} placeholder="Ex: Torneio de Matraquilhos" />
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>QUANDO?</div>
                <input value={act.quando || ""} onChange={(e) => updateAct(i, "quando", e.target.value)} style={INP} placeholder="Ex: Terça-feira às 15h" />
              </div>

              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>PARA QUÊ? (OBJETIVO)</div>
                <input value={act.obj || ""} onChange={(e) => updateAct(i, "obj", e.target.value)} style={INP} placeholder="Ex: Trabalhar a paciência e fair-play" />
              </div>
            </div>
          ))}

          {/* BOTÕES DUPLOS */}
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <Btn variant="dark" onClick={() => savePia(false)}>💾 Guardar Privado</Btn>
            <Btn onClick={() => savePia(true)}>🚀 Enviar à Teresa</Btn>
          </div>
        </div>
      )}

      {subTab === "swot" && (
        <div>
          <div style={{ ...CARD, background: "rgba(34, 211, 238, 0.05)", border: `1px solid ${CYN}40` }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: CYN, marginBottom: 5 }}>Raio-X do Projeto (SWOT)</div>
            <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.5 }}>
              Identifica os pontos fortes e os riscos do teu plano de ação no local.
            </div>
          </div>

          {SWOT_Q.map(q => (
            <div key={q.id} style={{ ...CARD, borderLeft: `4px solid ${q.color}` }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: q.color, marginBottom: 4 }}>{q.label}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>{q.sub}</div>
              <textarea 
                value={swotPia[q.id] || ""} 
                onChange={(e) => updateSwot(q.id, e.target.value)}
                style={INP} rows={3} placeholder={q.ph} 
              />
            </div>
          ))}

          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="dark" onClick={() => saveSwot(false)}>💾 Guardar Privado</Btn>
            <Btn onClick={() => saveSwot(true)}>🔗 Enviar à Teresa</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
