import React, { useState, useRef, useEffect } from 'react';
import { doc, setDoc, collection, addDoc, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, registarPushNotifications } from "../firebase.js";
import { CARD, SL, CYN, PNK, INP, Btn, SubTabs, RadarChart, BG, TXT_MUT } from "../theme.jsx";
import {
  upd, nowLabel, nowFull, RODA_DIMS, ALL_MEDALS, DEF_RODA, DEF_CAP, getWeekKey
} from "../data.js";

const DEF_CAP2 = { text:"", locked:false, revealed:false, lockedDate:"" };

export default function PerfilTab({ user, data, features = {} }) {
  const [subTab, setSubTab] = useState("hist");
  const [ativandoPush, setAtivandoPush] = useState(false);
  // "on" = ativo neste aparelho | "off" = por ativar | "blocked" = bloqueado
  // nas definições | "unsupported" = browser/aparelho não suporta
  const [pushStatus, setPushStatus] = useState("off");

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPushStatus("unsupported");
    } else if (Notification.permission === "granted") {
      setPushStatus("on");
    } else if (Notification.permission === "denied") {
      setPushStatus("blocked");
    } else {
      setPushStatus("off");
    }
  }, []);

  const PUSH_ERROS = {
    "sem-vapid-key":           "Configuração em falta — fala com quem geriu a app.",
    "sem-service-worker":      "Este browser não suporta notificações push.",
    "sem-notification-api":    "Este browser não suporta notificações push.",
    "permissao-denied":        "Bloqueaste as notificações para esta app. Vai às definições do browser/telemóvel e permite notificações para este site.",
    "permissao-default":       "Não confirmaste o pedido de permissão. Tenta novamente.",
    "messaging-nao-suportado": "Este browser não suporta notificações push.",
    "sem-token":               "Não foi possível gerar o registo. Tenta fechar e reabrir a app.",
  };

  async function ativarPush() {
    setAtivandoPush(true);
    const res = await registarPushNotifications(user.username);
    setAtivandoPush(false);
    if (res.ok) {
      setPushStatus("on");
      alert("✓ Notificações push ativadas com sucesso!");
    } else {
      if (res.reason === "permissao-denied") setPushStatus("blocked");
      alert("Não foi possível ativar: " + (PUSH_ERROS[res.reason] || res.reason));
    }
  }

  const uData = data.userData || {};
  const roda = uData.roda || DEF_RODA;
  const rodaSaves = uData.rodaSaves || [];
  const history    = data.history || [];
  const medalDoc    = data.medals || {};
  const weekKey     = getWeekKey();
  const weekMedals  = (medalDoc.weekKey === weekKey ? medalDoc.week : []) || [];
  const userMedals  = [...new Set([...(medalDoc.allTime || []), ...(uData.streakMedals || [])])];

  // ── LIGHT THEME (só para teresa) ──
  const light = user.username === "teresa";
  // Cards mantêm-se escuros; só o wrapper muda de cor
  const thm = {
    card:    CARD,
    sl:      SL,
    text:    "#f1f5f9",
    muted:   "#94a3b8",
    sub:     "#64748b",
    divider: "1px solid rgba(255,255,255,0.05)",
    rowBg:   "rgba(0,0,0,0.18)",
    inp:     INP,
    medal:   { background:`${CYN}10`, border:`1px solid ${CYN}30` },
  };

  function formatarDataHora(ts, dataAntiga) {
    if (!ts) return dataAntiga;
    const d = new Date(ts);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes} às ${hora}:${min}`;
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
        roda: {}, rodaSaves: [], rodaShared: false,
      }, { merge: true });
      const todosSnap = await getDocs(collection(db, "todos", user.username, "items"));
      todosSnap.forEach(async (d) => { await deleteDoc(d.ref); });
      const evtsSnap = await getDocs(query(collection(db, "events"), where("userId", "==", user.username)));
      evtsSnap.forEach(async (d) => { await deleteDoc(d.ref); });
      alert("Limpeza efetuada com sucesso! A página vai recarregar.");
      window.location.reload();
    }
  }


  return (
    <div style={{
      padding: "18px 16px",
      background: "transparent",
      minHeight: "100vh",
    }}>

      {/* ── MEDALHAS ── */}
      {userMedals.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, textTransform:"uppercase", color: light ? "#64748b" : "#7a90b0", marginBottom:10 }}>
            🏅 {userMedals.length} Medalha{userMedals.length !== 1 ? "s" : ""} no total
          </div>
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
            {userMedals.map(mId => {
              const m = ALL_MEDALS.find(x => x.id === mId);
              const isThisWeek = weekMedals.includes(mId);
              return m ? (
                <div key={mId} style={{
                  flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center",
                  gap:4, padding:"12px 14px", borderRadius:16,
                  background: isThisWeek ? `${CYN}18` : "rgba(255,255,255,0.05)",
                  border: isThisWeek ? `1px solid ${CYN}40` : "1px solid rgba(255,255,255,0.10)",
                  minWidth:70,
                }}>
                  <span style={{ fontSize:24 }}>{m.icon}</span>
                  <span style={{ fontSize:9, fontWeight:900, color: isThisWeek ? CYN : "#5a7a9a", textAlign:"center", lineHeight:1.2 }}>{m.label.toUpperCase()}</span>
                  {isThisWeek && <span style={{ fontSize:8, color:CYN, fontWeight:700 }}>esta semana</span>}
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      <SubTabs
        options={[["hist","📜 Hist."],["info","ℹ️ Info"],["config","⚙️ Config"]]}
        active={subTab} onChange={setSubTab} color={PNK}
        wrapStyle={light ? { background:"rgba(18,14,38,0.80)", border:"1px solid rgba(139,92,246,0.20)" } : {}}
        inactiveColor={light ? "#c4b8f3" : TXT_MUT}
      />

      {/* ── HISTÓRICO ── */}
      {subTab === "hist" && (() => {
        const readNotifs = (data.myNotifs || []).map(n => ({
          _isNotif: true,
          action: n.text || "",
          ts: n.ts || 0,
          date: n.date || "",
          id: n.id,
        }));
        const allEntries = [
          ...history.map(h => ({ ...h, _isNotif: false })),
          ...readNotifs,
        ].sort((a, b) => (b.ts || 0) - (a.ts || 0));
        return (
          <div style={thm.card}>
            <div style={thm.sl}>📜 Registo de Atividades</div>
            {allEntries.length === 0 ? (
              <div style={{ textAlign:"center", color:thm.muted, fontSize:12 }}>Sem registos.</div>
            ) : (
              allEntries.map((h, i) => (
                <div key={h._isNotif ? `n-${h.id}` : i} style={{ padding:"12px 0", borderBottom: thm.divider, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:13, fontWeight:700, flex:1, color: h._isNotif ? "#94a3b8" : thm.text, opacity: h._isNotif ? 0.75 : 1 }}>
                    {h.action}
                  </div>
                  <div style={{ fontSize:10, color: h._isNotif ? "#475569" : CYN, fontWeight:800, marginLeft:10, flexShrink:0 }}>
                    {formatarDataHora(h.ts, h.date)}
                  </div>
                </div>
              ))
            )}
          </div>
        );
      })()}

      {/* ── INFO ── */}
      {subTab === "info" && (
        <div style={thm.card}>
          <div style={thm.sl}>Como Usar a App</div>
          <div style={{ fontSize:12, color:thm.muted, lineHeight:1.6, marginBottom:16 }}>
            O JEEP EDUCA+ acompanha o teu percurso no programa. Aqui está um resumo rápido de cada área:
          </div>
          {[
            { icon:"🏠", title:"Início", desc:"O teu painel principal. Aqui tens tudo de um relance: as Ações Pendentes (desafios que a Teresa lançou e ainda não completaste), as tuas tarefas, notificações recebidas, eventos próximos e muito mais." },
            { icon:"🏆", title:"Desafios", desc:"A Teresa lança desafios ao longo do programa. Quando há algo novo aparece em Ações Pendentes:\n• Pergunta da Semana — uma reflexão pessoal\n• Autoavaliação — avalias as tuas competências\n• Satisfação — como está a correr o programa\n• Dilemas — situações para pensares e decidires" },
            { icon:"🚀", title:"PIA + — Plano Individual e Recursos", desc:"O teu plano pessoal de desenvolvimento (PIA) e, na mesma aba, os teus Recursos. Usa as secções no topo:\n• PIA — o teu plano de ação\n• Jogos — os jogos do Arcade EDUCA+\n• Roda — a Roda da Vida (avalias áreas da tua vida e envias à Teresa)\n• Cápsula — mensagens que trancas para o futuro\n• Guias, Sites e Documentos — materiais úteis" },
            { icon:"💬", title:"Fórum", desc:"Espaço de conversa com o grupo. Podes publicar em diferentes canais temáticos, reagir com emojis às mensagens dos outros e responder em thread. É o espaço coletivo do programa." },
            { icon:"✅", title:"Tarefas", desc:'A tua lista pessoal. Crias as tuas próprias tarefas e podes marcar "Partilhar com a Teresa" para ela acompanhar. A Teresa também pode sugerir-te tarefas (aceitas ou recusas) ou adicioná-las diretamente à tua lista.' },
            { icon:"📅", title:"Eventos e Agenda", desc:"Podes criar os teus próprios eventos e escolher partilhá-los com a Teresa. Ela também pode agendar eventos no teu calendário diretamente, ou propor datas — nesse caso aparece em Ações Pendentes para tu aceitares ou recusares." },
            { icon:"👤", title:"Perfil", desc:"Tem três sub-secções:\n• Histórico — registo de tudo o que fizeste e XP ganho\n• Info — este guia\n• Configurações — notificações push e exportação dos teus dados" },
            { icon:"📱", title:"Falar com a Teresa", desc:"No Início, em baixo, podes enviar uma mensagem diretamente à Teresa — dúvidas, sugestões ou desabafos. Podes enviá-la de forma anónima se preferires. Ela pode também ser contactada por WhatsApp ou email." },
            { icon:"🔔", title:"Notificações", desc:"Quando a Teresa reage ou responde a algo que enviaste (resposta à tua pergunta, feedback ao PIA, etc.), recebes uma notificação no Início. Aparece também quando ela te propõe tarefas ou eventos." },
            { icon:"⭐", title:"Destaques da Semana", desc:"No Início aparece sempre uma caixa com os 3 jovens mais ativos da semana — determinados pelo XP ganho. A ordem em que aparecem é aleatória e muda a cada vez que abres a app. Só a Teresa sabe a classificação real. Ganhas XP ao completar desafios, tarefas, missões e outras ações." },
          ].map(item => (
            <div key={item.title} style={{ display:"flex", gap:12, padding:"12px 0", borderBottom: thm.divider }}>
              <div style={{ fontSize:22, flexShrink:0, width:28, textAlign:"center" }}>{item.icon}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:900, color:thm.text, marginBottom:3 }}>{item.title}</div>
                <div style={{ fontSize:12, color:thm.muted, lineHeight:1.5, whiteSpace:"pre-line" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CONFIGURAÇÕES ── */}
      {subTab === "config" && (
        <>
          <div style={thm.card}>
            <div style={thm.sl}>🔔 Notificações Push</div>

            {pushStatus === "on" ? (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12,
                  fontSize:14, fontWeight:800, color:"#4ade80" }}>
                  <span style={{ fontSize:18 }}>✓</span> Notificações ativas neste aparelho
                </div>
                <div style={{ fontSize:12, color:thm.muted, lineHeight:1.6, marginBottom:16 }}>
                  Recebes avisos aqui mesmo com a app fechada. Se mudaste de telemóvel/browser, carrega em baixo para ativar também nesse aparelho.
                </div>
                <Btn variant="dark" onClick={ativarPush} disabled={ativandoPush}>
                  {ativandoPush ? "A ativar..." : "Reativar neste aparelho"}
                </Btn>
              </>
            ) : pushStatus === "blocked" ? (
              <div style={{ fontSize:13, color:"#f87171", lineHeight:1.6 }}>
                🚫 As notificações estão <b>bloqueadas</b> para esta app. Para ativar, vai às definições do browser/telemóvel, permite notificações para este site, e volta aqui.
              </div>
            ) : pushStatus === "unsupported" ? (
              <div style={{ fontSize:13, color:thm.muted, lineHeight:1.6 }}>
                Este browser/aparelho não suporta notificações push. No iPhone, tens de <b>instalar a app no ecrã principal</b> primeiro (Partilhar → "Adicionar ao ecrã principal") e abri-la por aí.
              </div>
            ) : (
              <>
                <div style={{ fontSize:13, color:thm.muted, lineHeight:1.6, marginBottom:20 }}>
                  Ativa para receberes avisos no telemóvel mesmo com a app fechada (mensagens, feedback da Teresa, etc.).
                </div>
                <Btn variant="dark" onClick={ativarPush} disabled={ativandoPush}>
                  {ativandoPush ? "A ativar..." : "🔔 ATIVAR NOTIFICAÇÕES PUSH"}
                </Btn>
              </>
            )}
          </div>

          <div style={thm.card}>
            <div style={thm.sl}>Gestão de Dados</div>
            <div style={{ fontSize:13, color:thm.muted, lineHeight:1.6, marginBottom:20 }}>
              De acordo com o RGPD, tens o direito de descarregar todos os teus dados guardados nesta plataforma.
            </div>
            <Btn variant="dark" onClick={doExport}>⬇️ DESCARREGAR RELATÓRIO</Btn>
          </div>

          {user.username === "teresa" && (
            <div style={{ ...thm.card, background: light ? "rgba(80,10,30,0.80)" : "rgba(244,63,94,0.1)", border:"2px dashed #f43f5e", marginTop:20 }}>
              <div style={{ ...thm.sl, color:"#f43f5e" }}>🔧 Ferramentas de Teste</div>
              <p style={{ fontSize:"12px", color: light ? "#fca5a5" : "#cbd5e1", marginTop:0, marginBottom:"15px" }}>
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
