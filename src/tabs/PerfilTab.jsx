import React, { useState } from 'react';
import { doc, setDoc, collection, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../firebase.js";
import { CARD, SL, CYN, PNK, INP, Btn, SubTabs, RadarChart, BG } from "../theme.jsx";
import {
  upd, nowLabel, nowFull, RODA_DIMS, ALL_MEDALS, DEF_RODA, DEF_CAP
} from "../data.js";

const DEF_CAP2 = { text:"", locked:false, revealed:false, lockedDate:"" };

export default function PerfilTab({ user, data }) {
  const [subTab, setSubTab] = useState("roda");
  const [expandedDim, setExpandedDim] = useState(null);

  const uData = data.userData || {};
  const roda = uData.roda || DEF_RODA;
  const rodaSaves = uData.rodaSaves || [];
  const cap  = uData.cap  || DEF_CAP;
  const cap2 = uData.cap2 || DEF_CAP2;
  const history = data.history || [];
  const userMedals = data.medals || [];

  function formatarDataHora(ts, dataAntiga) {
    if (!ts) return dataAntiga;
    const d = new Date(ts);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes} às ${hora}:${min}`;
  }

  async function saveRoda(share) {
    try {
      const ts = nowFull();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = uData.lastActiveDay === today ? (uData.dayStreak || 1) : (uData.lastActiveDay === yesterday ? (uData.dayStreak || 0) + 1 : 1);
      const streakUpdate = uData.lastActiveDay !== today ? { dayStreak: newStreak, lastActiveDay: today } : {};
      const newSaves = [...rodaSaves, { label: nowLabel(), savedAt: ts, scores: { ...roda } }];
      const newH = [...history, { date: ts, action: `Atualizou Roda da Vida (${share ? "Enviado à Admin" : "Privado"})`, ts: Date.now(), xp: 20 }];
      await setDoc(doc(db, "userData", user.username), {
        roda, rodaSaves: newSaves, rodaShared: share, rodaSavedAt: ts,
        history: newH, weekXp: (uData.weekXp || 0) + 20, ...streakUpdate
      }, { merge: true });
      alert(share ? "Roda enviada para a Teresa! 🌸" : "Roda guardada no teu histórico.");
    } catch (e) { alert("Erro ao guardar a roda."); }
  }

  const updateRoda = (id, val) => {
    setDoc(doc(db, "userData", user.username), { roda: { ...roda, [id]: val } }, { merge: true });
  };

  async function sealCapsule(slot) {
    const isSlot2 = slot === 2;
    const capData = isSlot2 ? cap2 : cap;
    if (!capData.text?.trim()) return alert("Escreve primeiro a tua mensagem!");
    const targetDate = isSlot2 ? "31/07/2027" : "31/12/2026";
    const ts = nowFull();
    const newCap = { ...capData, locked: true, lockedDate: targetDate, sealedAt: ts };
    const newH = [...history, { date: ts, action: `Selou Cápsula ${isSlot2 ? "Final" : "de Dezembro"} 🔒`, ts: Date.now(), xp: 15 }];
    await setDoc(doc(db, "userData", user.username), {
      [isSlot2 ? "cap2" : "cap"]: newCap,
      history: newH,
      weekXp: (uData.weekXp || 0) + 15
    }, { merge: true });
    alert("Cápsula selada! Só a poderás abrir em " + targetDate);
  }

  function doExport() {
    const exportData = {
      utilizador: user.realName, dataExportacao: new Date().toISOString(),
      percurso: uData.pia || {}, atividades: uData.piaActs || [],
      autoavaliacao: uData.dScores || {}, rodaDaVida: roda,
      historicoRodas: rodaSaves, medalhas: userMedals, historicoAcoes: history
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `jeep_dados_${user.username}.json`;
    a.click(); URL.revokeObjectURL(url);
  }

  async function limparTudoDev() {
    if (window.confirm("🚨 MODO DEV: Queres reverter o estado das avaliações e APAGAR as tarefas/agenda para testar do zero?")) {
      await setDoc(doc(db, "userData", user.username), {
        autoSaved: false, sSaved: false, answered: false, piaSaved: false, completedMissions: [],
      }, { merge: true });
      const todosSnap = await getDocs(collection(db, "todos", user.username, "items"));
      todosSnap.forEach(async (d) => { await deleteDoc(d.ref); });
      const evtsSnap = await getDocs(query(collection(db, "events"), where("userId", "==", user.username)));
      evtsSnap.forEach(async (d) => { await deleteDoc(d.ref); });
      alert("Limpeza efetuada com sucesso! A página vai recarregar.");
      window.location.reload();
    }
  }

  function CapsuleWidget({ slot, capData, title, targetLabel, desc }) {
    const isLocked = capData.locked;
    const fieldKey = slot === 2 ? "cap2" : "cap";
    return (
      <div style={{ ...CARD, borderTop: `2px solid ${slot === 1 ? PNK : "#a855f7"}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <span style={{ fontSize:24 }}>{slot === 1 ? "📦" : "💌"}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:900, color:"#f1f5f9" }}>{title}</div>
            <div style={{ fontSize:10, color: slot === 1 ? PNK : "#a855f7", fontWeight:800 }}>Abre em {targetLabel}</div>
          </div>
        </div>
        <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.6, marginBottom:16 }}>{desc}</div>
        {!isLocked ? (
          <div>
            <textarea
              value={capData.text || ""}
              onChange={(e) => setDoc(doc(db, "userData", user.username), { [fieldKey]: { ...capData, text: e.target.value } }, { merge: true })}
              style={{ ...INP, fontSize:13, resize:"none" }} rows={5}
              placeholder="Olá, eu do futuro. Hoje é..."
            />
            <div style={{ fontSize:11, color:"#64748b", marginBottom:14, lineHeight:1.5 }}>
              Sugestões: Como te sentes agora? Quais são os teus maiores medos? O que queres que seja diferente {slot === 1 ? "em Dezembro" : "no final do programa"}?
            </div>
            <Btn color={slot === 1 ? PNK : "#a855f7"} onClick={() => sealCapsule(slot)}>
              🔒 Trancar a cápsula
            </Btn>
          </div>
        ) : (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:40, marginBottom:10 }}>🔒</div>
            <div style={{ fontWeight:900, color: slot === 1 ? PNK : "#a855f7", fontSize:14 }}>CÁPSULA SELADA</div>
            <div style={{ fontSize:12, color:"#94a3b8", marginTop:8 }}>
              Poderás ler esta mensagem em:<br/>
              <strong style={{ color:"#fff", fontSize:16 }}>{capData.lockedDate}</strong>
            </div>
            {capData.sealedAt && (
              <div style={{ fontSize:10, color:"#475569", marginTop:6 }}>Selada a {capData.sealedAt}</div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "18px 16px" }}>

      {/* ── MEDALHAS (visíveis sempre, acima dos tabs) ── */}
      {userMedals.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, textTransform:"uppercase", color:"#7a90b0", marginBottom:10 }}>
            🏅 {userMedals.length} Medalha{userMedals.length !== 1 ? "s" : ""}
          </div>
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
            {userMedals.map(mId => {
              const m = ALL_MEDALS.find(x => x.id === mId);
              return m ? (
                <div key={mId} style={{
                  flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center",
                  gap:4, padding:"12px 14px", borderRadius:16,
                  background:`${CYN}10`, border:`1px solid ${CYN}30`,
                  minWidth:70,
                }}>
                  <span style={{ fontSize:24 }}>{m.icon}</span>
                  <span style={{ fontSize:9, fontWeight:900, color:CYN, textAlign:"center", lineHeight:1.2 }}>{m.label.toUpperCase()}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      <SubTabs
        options={[["roda","🌸 Roda"],["hist","📜 Hist."],["cap","💌 Cápsula"],["info","📤 Info"]]}
        active={subTab} onChange={setSubTab} color={PNK}
      />

      {/* ── RODA DA VIDA ── */}
      {subTab === "roda" && (
        <div>
          <div style={CARD}>
            <div style={SL}>A Minha Roda Atual</div>
            <RadarChart scores={roda} color={PNK} prev={rodaSaves.length > 0 ? rodaSaves[rodaSaves.length - 1].scores : null} />
            <div style={{ fontSize:10, color:"#94a3b8", textAlign:"center", marginTop:8, lineHeight:1.5 }}>
              De 0 a 10 — quando a roda fica torta, é porque alguma área precisa de atenção.<br/>
              {rodaSaves.length > 0 && <span>Linha tracejada = avaliação anterior ({rodaSaves[rodaSaves.length-1].label}).</span>}
            </div>
          </div>

          {RODA_DIMS.map(dim => {
            const isOpen = expandedDim === dim.id;
            const val = roda[dim.id];
            return (
              <div key={dim.id} style={{ ...CARD, padding:"16px 18px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:22 }}>{dim.icon}</span>
                    <span style={{ fontWeight:900, fontSize:14 }}>{dim.label}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontWeight:900, color:PNK, fontSize:22 }}>{val}</span>
                    <button onClick={() => setExpandedDim(isOpen ? null : dim.id)} style={{
                      background:"none", border:"none", cursor:"pointer",
                      fontSize:10, color:"#64748b", fontWeight:700, padding:0,
                    }}>
                      {isOpen ? "▲ fechar" : "▼ o que é isto?"}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="fade-up" style={{ marginTop:14 }}>
                    <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.6, marginBottom:14 }}>{dim.desc}</div>
                    <input type="range" min="0" max="10" value={val}
                      onChange={(e) => updateRoda(dim.id, Number(e.target.value))}
                      style={{ width:"100%", accentColor:PNK }}
                    />
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#475569", marginTop:4 }}>
                      <span>0 Muito mal</span>
                      <span>10 Óptimo</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <Btn variant="dark" onClick={() => saveRoda(false)}>💾 Guardar Privado</Btn>
            <Btn color={PNK} onClick={() => saveRoda(true)}>🚀 Enviar à Teresa</Btn>
          </div>
        </div>
      )}

      {/* ── HISTÓRICO ── */}
      {subTab === "hist" && (
        <div style={CARD}>
          <div style={SL}>📜 Registo de Atividades</div>
          {history.length === 0 ? (
            <div style={{ textAlign:"center", color:"#94a3b8", fontSize:12 }}>Sem registos.</div>
          ) : (
            history.slice().reverse().map((h, i) => (
              <div key={i} style={{ padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:13, fontWeight:700, flex:1 }}>{h.action}</div>
                <div style={{ fontSize:10, color:CYN, fontWeight:800, marginLeft:10, flexShrink:0 }}>
                  {formatarDataHora(h.ts, h.date)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── DUAS CÁPSULAS ── */}
      {subTab === "cap" && (
        <div>
          <div style={{ ...CARD, background:"rgba(0,0,0,0.2)", marginBottom:20 }}>
            <div style={{ fontSize:24, marginBottom:10 }}>⏳</div>
            <div style={{ fontSize:15, fontWeight:900, color:"#f1f5f9", marginBottom:8 }}>Cápsulas do Tempo</div>
            <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.6 }}>
              Deixa mensagens para ti mesmo/a que ficam trancadas. Só tu as consegues abrir nas datas certas — e o impacto de veres de onde partiste é brutal.
            </div>
          </div>

          <CapsuleWidget
            slot={1}
            capData={cap}
            title="Cápsula de Meio-Caminho"
            targetLabel="Dezembro 2026"
            desc="Uma mensagem para ti próprio/a quando chegar ao meio do programa. Vai ficar trancada — só tu consegues abrir."
          />

          <CapsuleWidget
            slot={2}
            capData={cap2}
            title="Cápsula Final"
            targetLabel="Final do Programa (Jul 2027)"
            desc="A tua carta mais especial — para leres no último dia do programa. O impacto de veres de onde partiste é brutal."
          />
        </div>
      )}

      {/* ── INFO ── */}
      {subTab === "info" && (
        <>
          <div style={CARD}>
            <div style={SL}>Gestão de Dados</div>
            <div style={{ fontSize:13, color:"#cbd5e1", lineHeight:1.6, marginBottom:20 }}>
              De acordo com o RGPD, tens o direito de descarregar todos os teus dados guardados nesta plataforma.
            </div>
            <Btn variant="dark" onClick={doExport}>⬇️ DESCARREGAR RELATÓRIO</Btn>
          </div>

          {user.username === "teresa" && (
            <div style={{ ...CARD, background:"rgba(244,63,94,0.1)", border:"2px dashed #f43f5e", marginTop:20 }}>
              <div style={{ ...SL, color:"#f43f5e" }}>🔧 Ferramentas de Teste</div>
              <p style={{ fontSize:"12px", color:"#cbd5e1", marginTop:0, marginBottom:"15px" }}>
                Como és a conta de testes, podes limpar o teu progresso para veres as "Ações Pendentes" novamente na Home.
              </p>
              <button onClick={limparTudoDev} style={{ width:"100%", padding:"12px", background:"#f43f5e", color:"white", fontWeight:"900", border:"none", borderRadius:"12px", cursor:"pointer", fontSize:"13px" }}>
                ↻ APAGAR TAREFAS / AGENDA (Manter Histórico)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
