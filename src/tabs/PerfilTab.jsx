import React, { useState } from 'react';
import { doc, setDoc, collection, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { db } from "../firebase.js";
import { CARD, SL, CYN, PNK, INP, Btn, SubTabs, RadarChart, BG } from "../theme.jsx";
import {
  upd, nowLabel, nowFull, RODA_DIMS, ALL_MEDALS, DEF_RODA, DEF_CAP
} from "../data.js";

export default function PerfilTab({ user, data }) {
  const [subTab, setSubTab] = useState("roda");
  
  const uData = data.userData || {};
  const roda = uData.roda || DEF_RODA;
  const rodaSaves = uData.rodaSaves || [];
  const cap = uData.cap || DEF_CAP;
  const history = data.history || [];
  const userMedals = data.medals || [];

  // Função para formatar o Timestamp (Milissegundos) para Dia/Mês e Horas
  function formatarDataHora(ts, dataAntiga) {
    if (!ts) return dataAntiga; // Para ações velhas que não tinham Timestamp
    const d = new Date(ts);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes} às ${hora}:${min}`;
  }

  // ── FUNÇÕES DA RODA DA VIDA ──
  async function saveRoda(share) {
    try {
      const ts = nowFull();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = uData.lastActiveDay === today ? (uData.dayStreak || 1) : (uData.lastActiveDay === yesterday ? (uData.dayStreak || 0) + 1 : 1);
      const streakUpdate = uData.lastActiveDay !== today ? { dayStreak: newStreak, lastActiveDay: today } : {};
      const newSaves = [...rodaSaves, { label: nowLabel(), savedAt: ts, scores: { ...roda } }];
      const newH = [...history, {
        date: ts,
        action: `Atualizou Roda da Vida (${share ? "Enviado à Admin" : "Privado"})`,
        ts: Date.now(),
        xp: 20
      }];

      await setDoc(doc(db, "userData", user.username), {
        roda, rodaSaves: newSaves, rodaShared: share, rodaSavedAt: ts,
        history: newH,
        weekXp: (uData.weekXp || 0) + 20,
        ...streakUpdate
      }, { merge: true });

      alert(share ? "Roda enviada para a Teresa! 🌸" : "Roda guardada no teu histórico.");
    } catch (e) { alert("Erro ao guardar a roda."); }
  }

  const updateRoda = (id, val) => {
    const newRoda = { ...roda, [id]: val };
    setDoc(doc(db, "userData", user.username), { roda: newRoda }, { merge: true });
  };

  // ── CÁPSULA DO TEMPO ──
  async function sealCapsule() {
    if (!cap.text?.trim()) return alert("Escreve primeiro a tua mensagem!");
    const lockedDate = new Date();
    lockedDate.setMonth(lockedDate.getMonth() + 3);
    const dateStr = lockedDate.toLocaleDateString("pt-PT");

    const ts = nowFull();
    const newCap = { ...cap, locked: true, lockedDate: dateStr, sealedAt: ts };
    const newH = [...history, {
      date: ts,
      action: "Selou uma Cápsula do Tempo 🔒",
      ts: Date.now(),
      xp: 15
    }];

    await setDoc(doc(db, "userData", user.username), { 
      cap: newCap, 
      history: newH,
      weekXp: (uData.weekXp || 0) + 15
    }, { merge: true });
    
    alert("Cápsula selada! Só a poderás abrir em " + dateStr);
  }

  // ── EXPORTAÇÃO DE DADOS ──
  function doExport() {
    const exportData = {
      utilizador: user.realName,
      dataExportacao: new Date().toISOString(),
      percurso: uData.pia || {},
      atividades: uData.piaActs || [],
      autoavaliacao: uData.dScores || {},
      rodaDaVida: roda,
      historicoRodas: rodaSaves,
      medalhas: userMedals,
      historicoAcoes: history
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jeep_dados_${user.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── FUNÇÃO DE LIMPEZA MÁGICA (INTELIGENTE) SÓ PARA A TERESA ──
  async function limparTudoDev() {
    if (window.confirm("🚨 MODO DEV: Queres reverter o estado das avaliações e APAGAR as tarefas/agenda para testar do zero?\n\n(O teu Histórico e XP serão mantidos para testares a acumulação!)")) {
      
      // 1. Repor as flags para a Home voltar a mostrar os pedidos pendentes
      await setDoc(doc(db, "userData", user.username), {
        autoSaved: false,
        sSaved: false,
        answered: false,
        piaSaved: false,
        completedMissions: [],
      }, { merge: true });

      // 2. Apagar TODAS as Tarefas (To-Do List) deste utilizador
      const todosSnap = await getDocs(collection(db, "todos", user.username, "items"));
      todosSnap.forEach(async (d) => {
        await deleteDoc(d.ref);
      });

      // 3. Apagar TODOS os Eventos da Agenda deste utilizador
      const evtsSnap = await getDocs(query(collection(db, "events"), where("userId", "==", user.username)));
      evtsSnap.forEach(async (d) => {
        await deleteDoc(d.ref);
      });

      alert("Limpeza efetuada com sucesso! A página vai recarregar.");
      window.location.reload();
    }
  }

  return (
    <div style={{ padding: "18px 16px" }}>
      <SubTabs 
        options={[["roda","🌸 Roda"],["hist","📜 Hist."],["cap","💌 Cápsula"],["info","📤 Info"]]} 
        active={subTab} onChange={setSubTab} color={PNK} 
      />

      {/* ── SECCÃO RODA DA VIDA ── */}
      {subTab === "roda" && (
        <div>
          <div style={CARD}>
            <div style={SL}>A Minha Roda Atual</div>
            <RadarChart scores={roda} color={PNK} prev={rodaSaves.length > 0 ? rodaSaves[rodaSaves.length - 1].scores : null} />
            <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", marginTop: 10 }}>
              A linha tracejada representa a tua última avaliação.
            </div>
          </div>

          {RODA_DIMS.map(dim => (
            <div key={dim.id} style={CARD}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontWeight: 900, fontSize: 14 }}>{dim.icon} {dim.label}</span>
                <span style={{ fontWeight: 900, color: PNK, fontSize: 20 }}>{roda[dim.id]}</span>
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 15 }}>{dim.desc}</div>
              <input type="range" min="1" max="10" value={roda[dim.id]} 
                onChange={(e) => updateRoda(dim.id, Number(e.target.value))} 
                style={{ width: "100%", accentColor: PNK }} 
              />
            </div>
          ))}

          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="dark" onClick={() => saveRoda(false)}>💾 Guardar Privado</Btn>
            <Btn color={PNK} onClick={() => saveRoda(true)}>🚀 Enviar à Teresa</Btn>
          </div>
        </div>
      )}

      {/* ── SECCÃO HISTÓRICO E MEDALHAS ── */}
      {subTab === "hist" && (
        <div>
          {/* Medalhas */}
          <div style={CARD}>
            <div style={SL}>🏅 Medalhas Conquistadas</div>
            {userMedals.length === 0 ? (
              <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "10px" }}>
                Ainda não tens medalhas. Continua a participar!
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {userMedals.map(mId => {
                  const m = ALL_MEDALS.find(x => x.id === mId);
                  return m ? (
                    <div key={mId} style={{ background: "rgba(255,255,255,0.05)", padding: "12px", borderRadius: 16, textAlign: "center", border: `1px solid ${CYN}20` }}>
                      <div style={{ fontSize: 24, marginBottom: 5 }}>{m.icon}</div>
                      <div style={{ fontSize: 10, fontWeight: 900, color: CYN }}>{m.label.toUpperCase()}</div>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Logs com Data e Hora */}
          <div style={CARD}>
            <div style={SL}>📜 Registo de Atividades</div>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 12 }}>Sem registos.</div>
            ) : (
              history.slice().reverse().map((h, i) => (
                <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{h.action}</div>
                  <div style={{ fontSize: 10, color: CYN, fontWeight: 800, marginLeft: 10 }}>
                    {formatarDataHora(h.ts, h.date)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── CÁPSULA DO TEMPO ── */}
      {subTab === "cap" && (
        <div style={CARD}>
          <div style={SL}>💌 Cápsula do Tempo</div>
          <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6, marginBottom: 20 }}>
            Escreve uma mensagem para ti próprio/a daqui a 3 meses. Descreve como te sentes hoje, o que esperas do futuro e o que queres ter alcançado.
          </div>
          
          {!cap.locked ? (
            <div>
              <textarea 
                value={cap.text || ""} 
                onChange={(e) => setDoc(doc(db, "userData", user.username), { cap: { ...cap, text: e.target.value } }, { merge: true })}
                style={INP} rows={8} placeholder="Querido eu do futuro..." 
              />
              <Btn color="#a855f7" onClick={sealCapsule}>🔒 Selar Mensagem</Btn>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div style={{ fontSize: 50, marginBottom: 15 }}>🔒</div>
              <div style={{ fontWeight: 900, color: "#a855f7", fontSize: 16 }}>CÁPSULA SELADA E SEGURA</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
                Poderás ler esta mensagem em:<br/>
                <strong style={{ color: "#fff", fontSize: 18 }}>{cap.lockedDate}</strong>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── INFO / EXPORTAÇÃO ── */}
      {subTab === "info" && (
        <>
          <div style={CARD}>
            <div style={SL}>Gestão de Dados</div>
            <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6, marginBottom: 20 }}>
              De acordo com o RGPD, tens o direito de descarregar todos os teus dados guardados nesta plataforma. O ficheiro JSON inclui o teu PIA, avaliações, histórico e tarefas.
            </div>
            <Btn variant="dark" onClick={doExport}>⬇️ DESCARREGAR RELATÓRIO</Btn>
          </div>

          {/* ⚠️ PAINEL DE TESTES DA TERESA ⚠️ */}
          {user.username === "teresa" && (
            <div style={{ ...CARD, background: "rgba(244, 63, 94, 0.1)", border: "2px dashed #f43f5e", marginTop: 20 }}>
              <div style={{ ...SL, color: "#f43f5e" }}>🔧 Ferramentas de Teste</div>
              <p style={{ fontSize: "12px", color: "#cbd5e1", marginTop: 0, marginBottom: "15px" }}>
                Como és a conta de testes, podes limpar o teu progresso para veres as "Ações Pendentes" novamente na Home.
              </p>
              <button 
                onClick={limparTudoDev}
                style={{ width: "100%", padding: "12px", background: "#f43f5e", color: "white", fontWeight: "900", border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "13px" }}
              >
                ↻ APAGAR TAREFAS / AGENDA (Manter Histórico)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
