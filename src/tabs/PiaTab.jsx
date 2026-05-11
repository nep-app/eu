import React, { useState } from 'react';
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { CARD, SL, CYN, PNK, INP, Btn, SubTabs } from "../theme.jsx";
import { 
  upd, nowLabel, PIA_FIELDS, SWOT_Q, DEF_PIA, DEF_ACTS, DEF_SWOT 
} from "../data.js";

export default function PiaTab({ user, data }) {
  const [subTab, setSubTab] = useState("planeamento");
  
  // Dados vindos do Firebase (allData.userData)
  const uData = data.userData || {};
  const pia = uData.pia || DEF_PIA;
  const piaActs = uData.piaActs || DEF_ACTS;
  const swotPia = uData.swotPia || DEF_SWOT;

  // ── CÁLCULO DO TERMÓMETRO ──
  const totalFields = Object.keys(pia).length + (piaActs.length * 3); // Campos base + (4 atividades * 3 campos cada)
  const filledFields = 
    Object.values(pia).filter(v => v?.trim().length > 0).length + 
    piaActs.reduce((acc, act) => acc + (act.oQue?.trim() ? 1 : 0) + (act.quando?.trim() ? 1 : 0) + (act.obj?.trim() ? 1 : 0), 0);
  
  const progPia = Math.round((filledFields / totalFields) * 100);

  // ── FUNÇÕES DE GRAVAÇÃO ──
  async function savePia(share) {
    try {
      const newH = [...(data.history || []), { 
        date: nowLabel(), 
        action: `Atualizou PIA (${share ? "Enviado à Admin" : "Privado"})`, 
        ts: Date.now() 
      }];
      
      await setDoc(doc(db, "userData", user.username), { 
        pia, 
        piaActs, 
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
