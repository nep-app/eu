import React, { useState } from 'react';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, Btn, PRP, RadarChart } from "../../theme.jsx";
import { JEEP_LIST, ALL_MEDALS, upd, nowLabel, fmtDate, PIA_FIELDS, SWOT_Q } from "../../data.js";

export default function AdminUsers({ amMedals, setAmMedals, allShared }) {
  const [userSelecionado, setUserSelecionado] = useState(null);

  // ── 1. LÓGICA DE ATRIBUIÇÃO DE MEDALHAS ──
  async function toggleAMedal(username, mid) {
    const cur = amMedals[username] || [];
    const isAdding = !cur.includes(mid);
    
    const next = isAdding ? [...cur, mid] : cur.filter(m => m !== mid);
    
    // Atualiza o estado local e a coleção de medalhas
    setAmMedals(p => upd(p, username, next)); 
    await setDoc(doc(db, "medals", username), { list: next });

    // Se estiver a dar a medalha, dá bónus de XP e regista no histórico
    if (isAdding) {
      const userRef = doc(db, "userData", username);
      const userSnap = await getDoc(userRef);
      const uData = userSnap.exists() ? userSnap.data() : {};
      
      const newHistory = [
        ...(uData.history || []), 
        { date: nowLabel(), action: `Conquistaste uma nova Medalha! 🏅`, ts: Date.now(), xp: 50 }
      ];
      await setDoc(userRef, { history: newHistory, weekXp: (uData.weekXp || 0) + 50 }, { merge: true });
    }
  }

  // ── 2. COMPONENTE DO MODAL (DOSSIER) ──
  function DossierModal({ username, onClose }) {
    const uData = allShared[username] || {};
    const medals = amMedals[username] || [];
    const jeep = JEEP_LIST.find(j => j.username === username);

    return (
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(7,11,20,0.95)", zIndex: 999, padding: "20px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: jeep.color }} />
            <h2 style={{ margin: 0, fontSize: 22 }}>Dossier: {jeep.name}</h2>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "10px 20px", borderRadius: 12, fontWeight: 900 }}>FECHAR ✕</button>
        </div>

        {/* SECÇÃO 1: MEDALHAS (Gestão Direta no Dossier) */}
        <div style={CARD}>
          <div style={SL}>Gestão de Mérito</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {ALL_MEDALS.map(m => {
              const has = medals.includes(m.id);
              return (
                <div key={m.id} onClick={() => toggleAMedal(username, m.id)} style={{ 
                  flex: "1 0 30%", minWidth: 80, padding: "12px 5px", borderRadius: 16, textAlign: "center",
                  background: has ? CYN : "rgba(255,255,255,0.05)", 
                  cursor: "pointer", transition: "0.2s", border: has ? `2px solid ${CYN}` : "2px solid transparent"
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{m.icon}</div>
                  <div style={{ fontSize: 9, fontWeight: 900, color: has ? "#000" : "#94a3b8" }}>{m.label.toUpperCase()}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 15 }}>
          
          {/* SECÇÃO 2: RODA DA VIDA (RADAR) */}
          <div style={CARD}>
            <div style={SL}>Bem-estar (Roda da Vida)</div>
            {uData.rodaScores ? (
              <RadarChart scores={uData.rodaScores} color={CYN} />
            ) : (
              <div style={{ textAlign: "center", color: "#475569", padding: 20 }}>Ainda não realizou a Roda da Vida.</div>
            )}
          </div>

          {/* SECÇÃO 3: PIA (PROJETO) */}
          <div style={CARD}>
            <div style={SL}>Plano Individual (PIA)</div>
            {uData.pia ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {PIA_FIELDS.map(f => (
                  <div key={f.key} style={{ background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 900, color: CYN }}>{f.title}</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>{uData.pia[f.key] || "---"}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "#475569" }}>PIA por preencher.</div>
            )}
          </div>

          {/* SECÇÃO 4: HISTÓRICO DE ATIVIDADE */}
          <div style={CARD}>
            <div style={SL}>Linha do Tempo (Histórico)</div>
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {uData.history && uData.history.length > 0 ? (
                uData.history.sort((a,b) => b.ts - a.ts).map((h, i) => (
                  <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 13 }}>{h.action}</div>
                    <div style={{ fontSize: 10, color: CYN, fontWeight: 800 }}>{h.date}</div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: "center", color: "#475569" }}>Sem atividade registada.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── 3. RENDERIZAÇÃO DA LISTA DE UTILIZADORES ──
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
      {JEEP_LIST.map(j => {
        const medals = amMedals[j.username] || [];
        const uData = allShared[j.username] || {};
        
        return (
          <div key={j.username} style={{ ...CARD, textAlign: "center" }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: j.color, margin: "0 auto 10px auto" }} />
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{j.name}</div>
            <div style={{ fontSize: 10, color: CYN, fontWeight: 900, marginBottom: 15 }}>{uData.weekXp || 0} XP ACUMULADO</div>
            
            {/* Resumo rápido de medalhas */}
            <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 15 }}>
              {ALL_MEDALS.map(m => (
                <span key={m.id} style={{ opacity: medals.includes(m.id) ? 1 : 0.1, fontSize: 14 }}>{m.icon}</span>
              ))}
            </div>

            <button 
              onClick={() => setUserSelecionado(j.username)}
              style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${CYN}40`, color: CYN, borderRadius: 12, padding: "8px", fontSize: 11, fontWeight: 900, cursor: "pointer" }}
            >
              VER DOSSIER
            </button>
          </div>
        );
      })}

      {/* RENDERIZA O MODAL SE HOUVER UM USER SELECIONADO */}
      {userSelecionado && (
        <DossierModal 
          username={userSelecionado} 
          onClose={() => setUserSelecionado(null)} 
        />
      )}
    </div>
  );
}
