import React, { useState } from 'react';
import { 
  doc, 
  setDoc, 
  addDoc, 
  collection, 
  deleteDoc, 
  updateDoc 
} from "firebase/firestore";
import { db } from "../firebase.js";
import { 
  CARD, 
  SL, 
  CYN, 
  PNK, 
  INP, 
  Btn, 
  PS, 
  AppIcon 
} from "../theme.jsx";
import { 
  nowLabel, 
  fmtDate, 
  isOverdue, 
  getWeekKey, 
  EVT_COLORS, 
  EVT_ICONS 
} from "../data.js";

export default function HomeTab({ user, data, setTab }) {
  // ── ESTADOS PARA GESTÃO DE TAREFAS (TO-DO) ──
  const [novaTarefaTexto, setNovaTarefaTexto] = useState("");
  const [novaTarefaData, setNovaTarefaData] = useState("");

  // ── ESTADOS PARA GESTÃO DE EVENTOS (AGENDA) ──
  const [novoEventoTitulo, setNovoEventoTitulo] = useState("");
  const [novoEventoData, setNovoEventoData] = useState("");

  // ── ESTADOS PARA COMUNICAÇÃO COM A TERESA ──
  const [mensagemTexto, setMensagemTexto] = useState("");
  const [mensagemAnonima, setMensagemAnonima] = useState(false);
  const [mensagemEnviadaSucesso, setMensagemEnviadaSucesso] = useState(false);

  // ── EXTRAÇÃO DE DADOS DO ESTADO GLOBAL (FIREBASE) ──
  const dadosUtilizador = data.userData || {};
  const notificacoesAdmin = data.myNotifs || [];
  const listaTarefas = data.todos || [];
  const listaEventos = data.events || [];
  const rankingDados = data.leaderboard || {};
  const listaMissoes = data.missions || [];
  const missoesConcluidas = data.completedMissions || [];
  // ── FILTRAGEM DE TAREFAS (O SEGREDO) ──
  const tarefasSugestao = listaTarefas.filter(t => t.addedBy === "teresa" && t.accepted === false);
  const minhasTarefas = listaTarefas.filter(t => t.addedBy !== "teresa" || t.accepted === true);

  // ── LÓGICA DO TOP 3 SECRETO (MOTIVAÇÃO SEM PRESSÃO) ──
  // 1. Filtramos os 3 com mais XP
  // 2. Ordenamos esses 3 por ordem alfabética para esconder quem é o 1º
  const destaquesXp = Object.entries(rankingDados)
    .map(([username, detalhes]) => ({ username, ...detalhes }))
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .slice(0, 3)
    .sort((a, b) => a.name.localeCompare(b.name));

  // ── LÓGICA DE ITENS PENDENTES (AÇÕES RÁPIDAS) ──
  let acoesPendentes = [];
  if (!dadosUtilizador.answered) {
    acoesPendentes.push({ status: "urgent", icon: "💬", title: "Pergunta da semana", sub: "A Teresa aguarda a tua reflexão", go: () => setTab("desafios") });
  }
  if (!dadosUtilizador.autoSaved) {
    acoesPendentes.push({ status: "pending", icon: "📊", title: "Autoavaliação mensal", sub: "Avalia as tuas competências", go: () => setTab("desafios") });
  }
  if (!dadosUtilizador.sSaved) {
    acoesPendentes.push({ status: "new", icon: "😊", title: "Satisfação", sub: "Diz-nos como corre o programa", go: () => setTab("desafios") });
  }
  if (!dadosUtilizador.piaSaved) {
    acoesPendentes.push({ status: "pending", icon: "🚀", title: "Plano Individual (PIA)", sub: "Desenha o teu projeto", go: () => setTab("pia") });
  }

  // ── FUNÇÕES: GESTÃO DE TAREFAS (TO-DO) ──
  async function criarNovaTarefa() {
    if (!novaTarefaTexto.trim()) return;
    try {
      const colecaoRef = collection(db, "todos", user.username, "items");
      await addDoc(colecaoRef, {
        text: novaTarefaTexto,
        due: novaTarefaData,
        done: false,
        ts: Date.now()
      });
      setNovaTarefaTexto(""); 
      setNovaTarefaData("");
    } catch (erro) {
      console.error("Erro ao criar tarefa:", erro);
    }
  }

  async function alternarEstadoTarefa(tarefa) {
    try {
      const tarefaRef = doc(db, "todos", user.username, "items", tarefa.id);
      await updateDoc(tarefaRef, { done: !tarefa.done });
      
      if (!tarefa.done) {
        const historicoAtual = data.history || [];
        const entradaHistorico = { 
          date: nowLabel(), 
          action: `Concluiu a tarefa: ${tarefa.text}`, 
          ts: Date.now() 
        };
        await setDoc(doc(db, "userData", user.username), { 
          history: [...historicoAtual, entradaHistorico], 
          weekXp: (dadosUtilizador.weekXp || 0) + 5 
        }, { merge: true });
      }
    } catch (erro) {
      console.error("Erro ao atualizar tarefa:", erro);
    }
  }

  async function removerTarefa(idTarefa) {
    if (window.confirm("Queres mesmo apagar esta tarefa?")) {
      try {
        const tarefaRef = doc(db, "todos", user.username, "items", idTarefa);
        await deleteDoc(tarefaRef);
      } catch (erro) {
        console.error("Erro ao remover tarefa:", erro);
      }
    }
  }

  // ── FUNÇÕES: GESTÃO DE AGENDA (EVENTOS) ──
  async function criarNovoEvento() {
    if (!novoEventoTitulo.trim() || !novoEventoData) {
      alert("Por favor, preenche o título e a data do evento.");
      return;
    }
    try {
      const eventosRef = collection(db, "events");
      await addDoc(eventosRef, {
        title: novoEventoTitulo,
        date: novoEventoData,
        userId: user.username,
        type: "visit",
        ts: Date.now()
      });
      setNovoEventoTitulo(""); 
      setNovoEventoData("");
    } catch (erro) {
      console.error("Erro ao criar evento:", erro);
    }
  }

  async function removerEvento(idEvento) {
    if (window.confirm("Queres remover este evento da tua agenda?")) {
      try {
        const eventoRef = doc(db, "events", idEvento);
        await deleteDoc(eventoRef);
      } catch (erro) {
        console.error("Erro ao remover evento:", erro);
      }
    }
  }

  // ── FUNÇÕES: MISSÕES E MENSAGENS ──
  async function enviarMensagemTeresa() {
    if (!mensagemTexto.trim()) return;
    try {
      const msgsRef = collection(db, "messages");
      await addDoc(msgsRef, { 
        text: mensagemTexto, 
        anon: mensagemAnonima, 
        from: mensagemAnonima ? "Anónimo" : user.username, 
        hiddenUser: user.username, 
        date: nowLabel(), 
        adminReply: "" 
      });
      setMensagemTexto(""); 
      setMensagemEnviadaSucesso(true);
      setTimeout(() => setMensagemEnviadaSucesso(false), 3000);
    } catch (erro) {
      console.error("Erro ao enviar mensagem:", erro);
    }
  }

  async function concluirMissaoSemanal(missao) {
    if (missoesConcluidas.includes(missao.id)) return;
    try {
      const historicoAtual = data.history || [];
      const entradaHistorico = { 
        date: nowLabel(), 
        action: `Cumpriu a missão: ${missao.text}`, 
        ts: Date.now() 
      };
      await setDoc(doc(db, "userData", user.username), { 
        completedMissions: [...missoesConcluidas, missao.id], 
        history: [...historicoAtual, entradaHistorico],
        weekXp: (dadosUtilizador.weekXp || 0) + (missao.xp || 10)
      }, { merge: true });
      alert(`Parabéns! Ganhaste +${missao.xp || 10} XP ✨`);
    } catch (erro) {
      console.error("Erro ao concluir missão:", erro);
    }
  }

  return (
    <div style={{ padding: "18px 16px", paddingBottom: "100px" }}>
      
      {/* ── LOGOTIPO CENTRAL ── */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "30px", marginTop: "10px" }}>
        <AppIcon size={100} />
      </div>

      {/* ── SECÇÃO: AVISOS DA TERESA ── */}
      {notificacoesAdmin.length > 0 && (
        <div style={{ ...CARD, background: "rgba(244, 114, 182, 0.15)", border: `1.5px solid ${PNK}` }}>
          <div style={SL}>Mensagens da Coordenação</div>
          {notificacoesAdmin.map(notif => (
            <div key={notif.id} style={{ display: "flex", gap: 12, padding: "14px", background: "rgba(0,0,0,0.4)", borderRadius: 18, marginBottom: 10 }}>
              <div style={{ flex: 1, fontSize: 13, lineHeight: 1.5, color: "#fff" }}>{notif.text}</div>
              <button 
                onClick={() => deleteDoc(doc(db, "notifications", user.username, "items", notif.id))} 
                style={{ background: "none", border: "none", color: PNK, fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
{/* ── TAREFAS SUGERIDAS PELA TERESA ── */}
      {tarefasSugestao.length > 0 && (
        <div style={{ ...CARD, background: "rgba(34, 211, 238, 0.1)", border: `1.5px solid ${CYN}` }}>
          <div style={SL}>📩 Sugestões da Coordenação</div>
          {tarefasSugestao.map(t => (
            <div key={t.id} style={{ background: "rgba(0,0,0,0.3)", padding: 15, borderRadius: 18, marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 5 }}>{t.text}</div>
              <div style={{ fontSize: 11, color: CYN, fontWeight: 800, marginBottom: 12 }}>Prazo sugerido: {fmtDate(t.due)}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => aceitarTarefa(t.id)} style={{ flex: 1, background: CYN, color: "#070b14", border: "none", padding: "8px", borderRadius: 10, fontWeight: 900, fontSize: 11, cursor: "pointer" }}>ACEITAR</button>
                <button onClick={() => recusarTarefa(t.id)} style={{ flex: 1, background: "rgba(244, 63, 94, 0.2)", color: "#f43f5e", border: "none", padding: "8px", borderRadius: 10, fontWeight: 900, fontSize: 11, cursor: "pointer" }}>RECUSAR</button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* ── SECÇÃO: TAREFAS (COM ADIÇÃO E REMOÇÃO) ── */}
      <div style={CARD}>
        <div style={SL}>✅ A Minha To-Do List</div>
        
        {/* Formulário de Adição */}
        <div style={{ marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "15px" }}>
          <input 
            value={novaTarefaTexto} 
            onChange={e => setNovaTarefaTexto(e.target.value)} 
            style={INP} 
            placeholder="O que precisas de fazer hoje?" 
          />
          <div style={{ display: "flex", gap: 10 }}>
            <input 
              type="date" 
              value={novaTarefaData} 
              onChange={e => setNovaTarefaData(e.target.value)} 
              style={{ ...INP, flex: 1, marginBottom: 0 }} 
            />
            <button 
              onClick={criarNovaTarefa} 
              style={{ background: CYN, border: "none", borderRadius: 18, padding: "0 25px", fontWeight: 900, cursor: "pointer", color: "#070b14" }}
            >
              ADICIONAR
            </button>
          </div>
        </div>

        {/* Listagem de Tarefas */}
        {listaTarefas.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "15px 0" }}>
            Não tens tarefas pendentes. Relaxa ou cria uma nova!
          </div>
        ) : (
         minhasTarefas.sort((a,b) => b.ts - a.ts).map(tarefa => (
            <div key={tarefa.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div 
                onClick={() => alternarEstadoTarefa(tarefa)} 
                style={{ 
                  width: 26, height: 26, borderRadius: 9, border: `2.5px solid ${tarefa.done ? "#4ade80" : CYN}`, 
                  background: tarefa.done ? "#4ade80" : "transparent", cursor: "pointer", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                {tarefa.done && <span style={{ color: "#070b14", fontWeight: 900, fontSize: 16 }}>✓</span>}
              </div>
              <div style={{ flex: 1, opacity: tarefa.done ? 0.4 : 1, textDecoration: tarefa.done ? "line-through" : "none" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{tarefa.text}</div>
                {tarefa.due && (
                  <div style={{ fontSize: 11, color: isOverdue(tarefa.due) ? "#f43f5e" : "#94a3b8", marginTop: 2, fontWeight: 800 }}>
                    LIMITE: {fmtDate(tarefa.due)}
                  </div>
                )}
              </div>
              <button 
                onClick={() => removerTarefa(tarefa.id)} 
                style={{ background: "none", border: "none", color: "#f43f5e", fontSize: 20, cursor: "pointer", padding: "5px" }}
              >
                <button onClick={() => partilharTarefa(tarefa.id, tarefa.shared)} style={{ background: "none", border: "none", color: tarefa.shared ? CYN : "#475569", fontSize: 18, cursor: "pointer" }}>
              {tarefa.shared ? "👁️" : "🙈"}
            </button>
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── SECÇÃO: AGENDA (COM ADIÇÃO E REMOÇÃO) ── */}
      <div style={CARD}>
        <div style={SL}>📅 A Minha Agenda</div>
        
        {/* Formulário de Adição de Evento */}
        <div style={{ marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "15px" }}>
          <input 
            value={novoEventoTitulo} 
            onChange={e => setNovoEventoTitulo(e.target.value)} 
            style={INP} 
            placeholder="Ex: Visita de acompanhamento..." 
          />
          <div style={{ display: "flex", gap: 10 }}>
            <input 
              type="date" 
              value={novoEventoData} 
              onChange={e => setNovoEventoData(e.target.value)} 
              style={{ ...INP, flex: 1, marginBottom: 0 }} 
            />
            <button 
              onClick={criarNovoEvento} 
              style={{ background: PNK, border: "none", borderRadius: 18, padding: "0 25px", fontWeight: 900, cursor: "pointer", color: "#070b14" }}
            >
              CRIAR
            </button>
          </div>
        </div>

        {/* Listagem de Eventos */}
        {listaEventos.filter(ev => ev.userId === user.username || ev.userId === "all").length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "15px 0" }}>
            A tua agenda pessoal está vazia.
          </div>
        ) : (
          listaEventos.filter(ev => ev.userId === user.username || ev.userId === "all")
            .sort((a,b) => new Date(a.date) - new Date(b.date))
            .map(evento => (
              <div key={evento.id} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12, background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: 18 }}>
                <div style={{ 
                  width: 44, height: 44, background: `${EVT_COLORS[evento.type] || CYN}25`, 
                  borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 
                }}>
                  {EVT_ICONS[evento.type] || "📌"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{evento.title}</div>
                  <div style={{ fontSize: 12, color: CYN, fontWeight: 800, marginTop: 2 }}>{fmtDate(evento.date)}</div>
                </div>
                <button 
                  onClick={() => removerEvento(evento.id)} 
                  style={{ background: "none", border: "none", color: "#f43f5e", fontSize: 18, cursor: "pointer", opacity: 0.6 }}
                >
                  {evento.userId === user.username && (
              <button onClick={() => partilharEvento(evento.id, evento.shared)} style={{ background: "none", border: "none", color: evento.shared ? CYN : "#475569", fontSize: 18, cursor: "pointer" }}>
                {evento.shared ? "👁️" : "🙈"}
              </button>
            )}
                  ✕
                </button>
              </div>
            ))
        )}
      </div>

      {/* ── SECÇÃO: AÇÕES PRIORITÁRIAS ── */}
      {acoesPendentes.length > 0 && (
        <div style={CARD}>
          <div style={SL}>Ações de Acompanhamento</div>
          {acoesPendentes.map((item, index) => (
            <div key={index} onClick={item.go} style={{ 
              display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 22, 
              background: PS[item.status].bg, marginBottom: 12, border: `1.5px solid ${PS[item.status].bl}`, cursor: "pointer" 
            }}>
              <span style={{ fontSize: 24 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{item.title}</div>
                <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 2 }}>{item.sub}</div>
              </div>
              <div style={{ fontSize: 10, fontWeight: 900, color: PS[item.status].bc, background: "rgba(0,0,0,0.25)", padding: "4px 12px", borderRadius: 12 }}>
                {PS[item.status].badge}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── SECÇÃO: MISSÕES SEMANAIS ── */}
      {listaMissoes.filter(mis => mis.week === getWeekKey()).length > 0 && (
        <div style={CARD}>
          <div style={SL}>🎯 Missões de Campo</div>
          {listaMissoes.filter(mis => mis.week === getWeekKey()).map(missao => {
            const concluida = missoesConcluidas.includes(missao.id);
            return (
              <div key={missao.id} onClick={() => !concluida && concluirMissaoSemanal(missao)} style={{ 
                display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 20, 
                background: concluida ? "rgba(34, 211, 238, 0.12)" : "rgba(0,0,0,0.3)", marginBottom: 10, 
                opacity: concluida ? 0.6 : 1, cursor: concluida ? "default" : "pointer",
                border: concluida ? `1px solid ${CYN}40` : "1px solid rgba(255,255,255,0.06)"
              }}>
                <div style={{ 
                  width: 24, height: 24, borderRadius: 8, 
                  background: concluida ? CYN : "rgba(255,255,255,0.1)", 
                  display: "flex", alignItems: "center", justifyContent: "center" 
                }}>
                  {concluida && <span style={{ color: "#070b14", fontWeight: 900, fontSize: 14 }}>✓</span>}
                </div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: concluida ? "#94a3b8" : "#fff", textDecoration: concluida ? "line-through" : "none" }}>
                  {missao.text}
                </div>
                <div style={{ fontSize: 12, fontWeight: 900, color: CYN }}>+{missao.xp} XP</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SECÇÃO: TOP 3 SECRETO (DESTAQUES) ── */}
      <div style={CARD}>
        <div style={SL}>⭐ Destaques da Semana</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: "10px" }}>
          {destaquesXp.length === 0 ? (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>A calcular participação da equipa...</div>
          ) : (
            destaquesXp.map((jovem) => (
              <div key={jovem.username} style={{ 
                padding: "12px 22px", background: "rgba(34, 211, 238, 0.1)", borderRadius: 28, 
                border: `2px solid ${jovem.color}`, fontSize: 13, fontWeight: 900, color: jovem.color,
                display: "flex", alignItems: "center", gap: 10, boxShadow: `0 0 20px ${jovem.color}30`
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: jovem.color }} />
                {jovem.name.toUpperCase()}
              </div>
            ))
          )}
        </div>
        <div style={{ marginTop: 20, fontSize: 11, color: "#64748b", textAlign: "center", fontStyle: "italic", lineHeight: 1.4 }}>
          Estes são os 3 jovens com maior participação esta semana.<br/>A listagem é apresentada por ordem alfabética.
        </div>
      </div>

      {/* ── SECÇÃO: CONTACTO COM A COORDENAÇÃO ── */}
      <div style={CARD}>
        <div style={SL}>📱 Falar com a Teresa</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <a href="https://wa.me/351916025666" target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: "none" }}>
            <Btn color="#22c55e" style={{ fontSize: 11 }}>WHATSAPP</Btn>
          </a>
          <a href="mailto:teresa.castro@cm-cascais.pt" style={{ flex: 1, textDecoration: "none" }}>
            <Btn color={CYN} style={{ fontSize: 11 }}>EMAIL</Btn>
          </a>
        </div>
        
        {mensagemEnviadaSucesso ? (
          <div style={{ textAlign: "center", padding: "20px", color: CYN, fontWeight: 900, background: "rgba(34, 211, 238, 0.1)", borderRadius: 18, border: `1px solid ${CYN}30` }}>
            ✓ MENSAGEM ENTREGUE COM SUCESSO!
          </div>
        ) : (
          <div style={{ background: "rgba(0,0,0,0.2)", padding: "18px", borderRadius: 22 }}>
            <textarea 
              value={mensagemTexto} 
              onChange={e => setMensagemTexto(e.target.value)} 
              style={{ ...INP, background: "rgba(0,0,0,0.4)" }} 
              rows={3} 
              placeholder="Escreve aqui a tua dúvida ou sugestão para a Teresa..." 
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input 
                  type="checkbox" 
                  checked={mensagemAnonima} 
                  onChange={() => setMensagemAnonima(!mensagemAnonima)} 
                  style={{ width: 20, height: 20, accentColor: PNK }} 
                />
                <span style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>Enviar como Anónimo</span>
              </label>
              <button 
                onClick={enviarMensagemTeresa} 
                style={{ 
                  background: PNK, color: "#070b14", border: "none", 
                  padding: "12px 28px", borderRadius: 16, fontWeight: 900, cursor: "pointer" 
                }}
              >
                ENVIAR
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
