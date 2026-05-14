import React, { useState } from 'react';
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { CARD, SL, INP, Btn, CYN, PNK, SubTabs } from "../theme.jsx";
import { nowFull, PIA_FIELDS } from "../data.js";

export default function PiaTab({ user, data }) {
  // ── ESTADOS DE NAVEGAÇÃO ──
  const [subTab, setSubTab] = useState("planeamento");

  const uData = data.userData || {};

  // ── ESTADOS DOS DADOS DO PIA ──
  const [pia, setPia] = useState(uData.pia || {});
  const [piaActs, setPiaActs] = useState(uData.piaActs || [
    { oQue: "", quando: "", obj: "" },
    { oQue: "", quando: "", obj: "" }
  ]);
  const [swotPia, setSwotPia] = useState(uData.swotPia || {
    f: "", a: "", o: "", r: ""
  });

  // ── CÁLCULO DO TERMÓMETRO DO PIA ──
  const fields = PIA_FIELDS || []; 
  const totalPia = fields.length + (piaActs.length * 3);
  
  let filledPia = fields.filter(f => pia[f.key] && pia[f.key].trim() !== "").length;
  piaActs.forEach(act => {
    if (act.oQue?.trim()) filledPia++;
    if (act.quando?.trim()) filledPia++;
    if (act.obj?.trim()) filledPia++;
  });
  
  const progPia = totalPia > 0 ? Math.round((filledPia / totalPia) * 100) : 0;

  // ── HELPERS: ATUALIZAR ESTADOS LOCAIS E FIREBASE TEMPORÁRIO ──
  const updatePia = (key, val) => {
    const newPia = { ...pia, [key]: val };
    setPia(newPia);
    setDoc(doc(db, "userData", user.username), { pia: newPia }, { merge: true });
  };

  const updateAct = (idx, field, val) => {
    const newActs = [...piaActs];
    newActs[idx] = { ...newActs[idx], [field]: val };
    setPiaActs(newActs);
    setDoc(doc(db, "userData", user.username), { piaActs: newActs }, { merge: true });
  };

  const updateSwot = (id, val) => {
    const newSwot = { ...swotPia, [id]: val };
    setSwotPia(newSwot);
    setDoc(doc(db, "userData", user.username), { swotPia: newSwot }, { merge: true });
  };

  // ── FUNÇÕES DE GUARDAR E ENVIAR ──
  async function savePia(share) {
    try {
      const ts = nowFull();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = uData.lastActiveDay === today ? (uData.dayStreak || 1) : (uData.lastActiveDay === yesterday ? (uData.dayStreak || 0) + 1 : 1);
      const streakUpdate = uData.lastActiveDay !== today ? { dayStreak: newStreak, lastActiveDay: today } : {};
      const newH = [...(data.history || [])];
      if (share) newH.push({ date: ts, action: "Enviou o Plano (PIA) à Teresa", ts: Date.now() });
      else newH.push({ date: ts, action: "Guardou o PIA (privado)", ts: Date.now() });

      await setDoc(doc(db, "userData", user.username), {
        pia, piaActs, piaSaved: true, piaShared: share, piaSavedAt: ts,
        history: newH,
        weekXp: (uData.weekXp || 0) + (uData.piaSaved ? 0 : 10),
        ...streakUpdate
      }, { merge: true });

      alert(share ? "Enviado com sucesso para a Teresa! 🚀" : "Guardado em modo privado. ✨");
    } catch (e) {
      alert("Erro ao guardar o PIA.");
    }
  }

async function saveSwot(share) {
    try {
      const ts = nowFull();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = uData.lastActiveDay === today ? (uData.dayStreak || 1) : (uData.lastActiveDay === yesterday ? (uData.dayStreak || 0) + 1 : 1);
      const streakUpdate = uData.lastActiveDay !== today ? { dayStreak: newStreak, lastActiveDay: today } : {};
      const newH = [...(data.history || [])];
      if (share) newH.push({ date: ts, action: "Enviou o Raio-X do projeto à Teresa", ts: Date.now(), xp: 15 });
      else newH.push({ date: ts, action: "Guardou o Raio-X (privado)", ts: Date.now() });

      await setDoc(doc(db, "userData", user.username), {
        swotPia, swotSaved: true, swotShared: share, swotSavedAt: ts,
        history: newH,
        weekXp: (uData.weekXp || 0) + (uData.swotSaved ? 0 : 15),
        ...streakUpdate
      }, { merge: true });

      alert(share ? "Raio-X enviado para a Teresa! 🔍" : "Raio-X guardado em modo privado.");
    } catch (e) {
      alert("Erro ao guardar o SWOT.");
    }
  }

  return (
    <div style={{ padding: "18px 16px", paddingBottom: "100px" }}>
      
      {/* ── NAVEGAÇÃO DE SUB-ABAS ── */}
      <SubTabs 
        options={[["planeamento", "📋 Planeamento"], ["swot", "🔍 Raio-X"]]} 
        active={subTab} 
        onChange={setSubTab} 
        color={CYN} 
      />

      {/* =========================================
          ABA 1: PLANEAMENTO DO PROJETO (PIA) 
      ========================================= */}
      {subTab === "planeamento" && (
        <div>
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

          {fields.map(f => (
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

          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <Btn variant="dark" onClick={() => savePia(false)}>💾 Guardar Privado</Btn>
            <Btn variant="success" onClick={() => savePia(true)}>🚀 Enviar à Teresa</Btn>
          </div>
        </div>
      )}

      {/* =========================================
          ABA 2: RAIO-X DO PROJETO (SWOT 2X2) 
      ========================================= */}
      {subTab === "swot" && (
        <div>
          <div style={{ ...CARD, background: "rgba(34, 211, 238, 0.05)", border: `1px solid ${CYN}40` }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: CYN, marginBottom: 5 }}>Raio-X do Projeto</div>
            <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.5 }}>
              Mapeia as Forças e Fraquezas (internas) e as Oportunidades e Riscos (externos) do teu plano no local de ação.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            
            <div style={{ ...CARD, marginBottom: 0, padding: "12px", borderLeft: "4px solid #4ade80" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#4ade80", marginBottom: 4 }}>💪 FORÇAS</div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8 }}>O que corre bem?</div>
              <textarea 
                value={swotPia.f || ""} 
                onChange={(e) => updateSwot("f", e.target.value)}
                style={{ ...INP, background: "rgba(0,0,0,0.15)", border: "none", fontSize: "12px", minHeight: "80px", marginBottom: 0 }} 
                placeholder="Ex: Sou criativo..." 
              />
            </div>

            <div style={{ ...CARD, marginBottom: 0, padding: "12px", borderLeft: "4px solid #fbbf24" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#fbbf24", marginBottom: 4 }}>⚠️ FRAQUEZAS</div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8 }}>Onde preciso ajuda?</div>
              <textarea 
                value={swotPia.a || ""} 
                onChange={(e) => updateSwot("a", e.target.value)}
                style={{ ...INP, background: "rgba(0,0,0,0.15)", border: "none", fontSize: "12px", minHeight: "80px", marginBottom: 0 }} 
                placeholder="Ex: Falta material..." 
              />
            </div>

            <div style={{ ...CARD, marginBottom: 0, padding: "12px", borderLeft: `4px solid ${CYN}` }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: CYN, marginBottom: 4 }}>🌟 OPORTUN.</div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8 }}>O que há lá fora?</div>
              <textarea 
                value={swotPia.o || ""} 
                onChange={(e) => updateSwot("o", e.target.value)}
                style={{ ...INP, background: "rgba(0,0,0,0.15)", border: "none", fontSize: "12px", minHeight: "80px", marginBottom: 0 }} 
                placeholder="Ex: Espaço grande..." 
              />
            </div>

            <div style={{ ...CARD, marginBottom: 0, padding: "12px", borderLeft: "4px solid #f43f5e" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#f43f5e", marginBottom: 4 }}>🚨 RISCOS</div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8 }}>O que pode falhar?</div>
              <textarea 
                value={swotPia.r || ""} 
                onChange={(e) => updateSwot("r", e.target.value)}
                style={{ ...INP, background: "rgba(0,0,0,0.15)", border: "none", fontSize: "12px", minHeight: "80px", marginBottom: 0 }} 
                placeholder="Ex: Mau tempo..." 
              />
            </div>

          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="dark" onClick={() => saveSwot(false)}>💾 Guardar Privado</Btn>
            <Btn variant="success" onClick={() => saveSwot(true)}>🔗 Enviar à Teresa</Btn>
          </div>
        </div>
      )}
    </div>
  );
}
