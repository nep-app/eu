import React, { useState, useEffect, useMemo } from 'react';
import { doc, getDoc, setDoc, addDoc, collection, onSnapshot, query, orderBy, updateDoc, arrayUnion, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, PNK, INP, PRP } from "../../theme.jsx";
import { ALLOWED_USERNAMES, JEEP_LIST, DIMS, nowLabel, nowFull, getWeekKey, buildAutoavEntry } from "../../data.js";
import AdminQuizzes from './AdminQuizzes.jsx';
import Agendador from './Agendador.jsx';
import AdminVotacoes from './AdminVotacoes.jsx';
import AdminMissoes from './AdminMissoes.jsx';
import AdminAgenda from './AdminAgenda.jsx';
import AdminTarefas from './AdminTarefas.jsx';

const SUBTABS = [
  ["pergunta",   "💬 Pergunta"],
  ["autoav",     "📊 Autoavaliação"],
  ["dilemas",    "🧠 Dilemas"],
  ["votacoes",   "🗳️ Votações"],
  ["missoes",  "🎯 Missões"],
  ["agenda",   "📅 Agenda"],
  ["tarefas",  "✅ Tarefas"],
];

const JEEP_8 = JEEP_LIST.filter(j => !["teresa","ricardo","demo"].includes(j.username));
// Lista para as RESPOSTAS (inclui a teresa, que também responde como teste).
const JEEP_RESP = JEEP_LIST.filter(j => !["ricardo","demo"].includes(j.username));

const MODOS = [
  { id:"texto",     label:"Texto",       icon:"📝" },
  { id:"audio",     label:"Áudio",       icon:"🎤" },
  { id:"3palavras", label:"3 Palavras",  icon:"🔢" },
  { id:"semana",    label:"Rating(1-5)", icon:"⭐" },
  { id:"imagem",    label:"Imagem",      icon:"📸" },
  { id:"mood",      label:"Emoji/Mood",  icon:"🎭" },
];

function PerguntaManager({ allShared, activeQ }) {
  const [activeQEdit, setActiveQEdit] = useState("");
  const [opt1, setOpt1] = useState("");
  const [opt2, setOpt2] = useState("");
  const [opt3, setOpt3] = useState("");
  const [selectedModes, setSelectedModes] = useState(["texto"]);
  const [arquivo, setArquivo] = useState([]);
  const [arquivoOpen, setArquivoOpen] = useState(null);
  const [fbTxts, setFbTxts] = useState({});
  const [fbOpen, setFbOpen] = useState({});
  const [fbPush, setFbPush] = useState({});
  const [pushNovaPergunta, setPushNovaPergunta] = useState(false);
  const [agendados, setAgendados] = useState([]); // TODOS os agendamentos pendentes (qualquer tipo)

  async function cancelarAgendado(id) {
    if (!window.confirm("Cancelar este agendamento? Não será publicado.")) return;
    await deleteDoc(doc(db, "agendados", id));
  }

  async function reporResposta(j) {
    if (!window.confirm(`Repor a resposta de ${j.name} à pergunta da semana?\n\nA resposta atual é apagada e ${j.name} pode responder de novo.`)) return;
    await setDoc(doc(db, "userData", j.username), {
      answered: false, answerText: null, answerType: null, answerMedia: null, answerDate: null,
    }, { merge: true });
    alert(`Resposta de ${j.name} reposta. ✓`);
  }

  // Restaura uma resposta "órfã": existe answerText mas answered ficou a false
  // (ex.: um lembrete antigo repôs o estado). Volta a marcar como respondida.
  async function restaurarResposta(j) {
    await setDoc(doc(db, "userData", j.username), { answered: true }, { merge: true });
    alert(`Resposta de ${j.name} recuperada! ✓`);
  }

  async function enviarFbPergunta(j, resposta) {
    const txt = fbTxts[j.username]?.trim();
    if (!txt) return;
    const contexto = resposta ? ` — sobre: "${resposta.substring(0, 60)}${resposta.length > 60 ? "…" : ""}"` : "";
    await addDoc(collection(db, "notifications", j.username, "items"), {
      from:"teresa", text:`Teresa reagiu à tua resposta à Pergunta da Semana${contexto}: ${txt}`,
      date:nowFull(), read:false, ts:Date.now(), tipo:"auto", push: !!fbPush[j.username]
    });
    setFbTxts(p => ({ ...p, [j.username]: "" }));
    setFbOpen(p => ({ ...p, [j.username]: false }));
    setFbPush(p => ({ ...p, [j.username]: false }));
    alert("Feedback enviado! ✓");
  }

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "perguntasArquivo"), orderBy("archivedAt", "desc")),
      snap => setArquivo(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, "agendados"), snap => {
      setAgendados(snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(a => !a.done)
        .sort((a, b) => (a.publishAt || 0) - (b.publishAt || 0)));
    });
  }, []);

  const TIPO_LABEL = {
    pergunta:"💬 Pergunta", pedido:"📋 Pedido", mensagem:"✉️ Mensagem",
    forum:"🌐 Fórum", dilema:"🧠 Dilema", votacao:"🗳️ Votação", missao:"🎯 Missão",
  };

  const toggleMode = (id) => setSelectedModes(prev =>
    prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
  );

  async function publicar() {
    if (!activeQEdit.trim()) return alert("Escreve a pergunta!");
    if (selectedModes.length === 0 && !opt1.trim()) return alert("Seleciona pelo menos um modo de resposta!");
    const opcoes = [opt1, opt2, opt3].filter(o => o.trim());

    // Archive current question + all answers before overwriting
    if (activeQ) {
      const respostas = {};
      JEEP_8.forEach(j => {
        const d = allShared[j.username] || {};
        respostas[j.username] = {
          name: j.name,
          answered: !!d.answered,
          answerText: d.answerText || null,
          answerType: d.answerType || null,
          answerDate: d.answerDate || null,
        };
      });
      await addDoc(collection(db, "perguntasArquivo"), {
        text: activeQ, archivedAt: Date.now(), date: nowLabel(), respostas
      });
    }

    await setDoc(doc(db, "config", "activeQuestion"), {
      text: activeQEdit.trim(), options: opcoes, modes: selectedModes, date: Date.now()
    });
    for (const u of ALLOWED_USERNAMES) {
      await setDoc(doc(db, "userData", u), { answered: false, answeredAskedAt: Date.now() }, { merge: true });
      await addDoc(collection(db, "notifications", u, "items"), {
        from:"teresa", text:"💬 Nova pergunta da semana!", date:nowLabel(), read:false, tipo:"proposta", push: pushNovaPergunta
      });
    }
    alert("Pergunta publicada!");
    setActiveQEdit(""); setOpt1(""); setOpt2(""); setOpt3(""); setPushNovaPergunta(false);
  }

  // Repõe uma pergunta arquivada (texto + respostas de todos) como a ATUAL.
  // Útil se um agendamento republicou sem querer e apagou as respostas atuais.
  async function reporArquivo(a) {
    const ok = window.confirm(
      "Repor esta pergunta e as respostas de todos como ATUAIS?\n\n" +
      "• A pergunta atual passa a ser esta.\n" +
      "• As respostas guardadas voltam a aparecer em 'Respostas Recebidas'.\n" +
      "• Os modos/opções originais podem não ser recuperados (fica texto livre).\n\n" +
      "Não é enviada nenhuma notificação aos jovens."
    );
    if (!ok) return;
    await setDoc(doc(db, "config", "activeQuestion"), {
      text: a.text, options: a.options || [], modes: a.modes || [], date: Date.now()
    }, { merge: true });
    const respostas = a.respostas || {};
    for (const [u, r] of Object.entries(respostas)) {
      await setDoc(doc(db, "userData", u), {
        answered: !!r.answered,
        answerText: r.answerText ?? null,
        answerType: r.answerType ?? null,
        answerDate: r.answerDate ?? null,
      }, { merge: true });
    }
    alert("Reposto! As respostas voltaram a aparecer.");
  }

  return (
    <div>
      {/* Painel de auditoria: TODOS os agendamentos que ainda vão disparar */}
      <div style={{ ...CARD, border: agendados.length ? "1px solid rgba(123,92,255,0.35)" : CARD.border }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: agendados.length ? 12 : 0 }}>
          <div style={SL}>⏰ Agendamentos por Disparar</div>
          <div style={{ fontSize:10, color: agendados.length ? PRP : "#475569", fontWeight:800 }}>
            {agendados.length} pendente{agendados.length !== 1 ? "s" : ""}
          </div>
        </div>
        {agendados.length === 0 ? (
          <div style={{ fontSize:12, color:"#475569" }}>Nada agendado. Tudo o que aparece na app foi publicado à mão.</div>
        ) : (
          agendados.map(a => {
            const d = new Date(a.publishAt || 0);
            const quando = d.toLocaleDateString("pt-PT", { day:"2-digit", month:"2-digit", year:"2-digit" }) + " às " + (a.slot || d.toLocaleTimeString("pt-PT", { hour:"2-digit", minute:"2-digit" }));
            return (
              <div key={a.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", marginBottom:6,
                background:"rgba(123,92,255,0.08)", border:"1px solid rgba(123,92,255,0.2)", borderRadius:10 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, color:"#e2e8f0", fontWeight:800 }}>{TIPO_LABEL[a.tipo] || a.tipo}</div>
                  <div style={{ fontSize:11, color:PRP, fontWeight:700 }}>{quando}{a.payload?.push ? " · 🔔 push" : ""}</div>
                </div>
                <button onClick={() => cancelarAgendado(a.id)}
                  style={{ background:"none", border:"1px solid #f43f5e", color:"#f43f5e", borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:800, cursor:"pointer", flexShrink:0 }}>
                  Cancelar
                </button>
              </div>
            );
          })
        )}
      </div>

      <div style={CARD}>
        <div style={SL}>Pergunta Atual</div>
        <div style={{ fontSize:14, color:"#e2e8f0", padding:"12px", background:"rgba(0,0,0,0.2)", borderRadius:12, borderLeft:`4px solid ${CYN}` }}>
          {activeQ || <span style={{ color:"#475569" }}>Nenhuma pergunta ativa</span>}
        </div>
      </div>

      <div style={CARD}>
        <div style={SL}>Respostas Recebidas</div>
        {JEEP_RESP.map(j => {
          const d = allShared[j.username] || {};
          return (
            <div key={j.username} style={{ padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                <span style={{ fontSize:13, fontWeight:800, color:j.color, flexShrink:0, minWidth:72 }}>{j.name}:</span>
                {d.answered
                  ? <span style={{ fontSize:13, color:"#e2e8f0", lineHeight:1.5, flex:1 }}>{d.answerText}</span>
                  : d.answerText
                    ? <span style={{ flex:1 }}>
                        <span style={{ fontSize:13, color:"#e2e8f0", lineHeight:1.5, display:"block" }}>{d.answerText}</span>
                        <span style={{ fontSize:10, color:"#fbbf24", fontWeight:700 }}>⚠️ resposta guardada mas marcada como pendente</span>
                      </span>
                    : <span style={{ fontSize:13, color:"#475569", flex:1 }}>Pendente</span>}
                {!d.answered && d.answerText && (
                  <button onClick={() => restaurarResposta(j)} title="Recuperar esta resposta (voltar a marcar como respondida)"
                    style={{ background:"rgba(74,222,128,0.12)", border:"1px solid rgba(74,222,128,0.5)", color:"#4ade80", fontSize:11, fontWeight:800, cursor:"pointer", padding:"2px 8px", borderRadius:8, flexShrink:0 }}>↩️ Recuperar</button>
                )}
                {d.answered && (
                  <button onClick={() => setFbOpen(p => ({ ...p, [j.username]: !p[j.username] }))}
                    style={{ background:"none", border:"none", color: fbOpen[j.username] ? CYN : "#64748b", fontSize:13, cursor:"pointer", padding:"0 4px", flexShrink:0 }}>💬</button>
                )}
                {d.answered && (
                  <button onClick={() => reporResposta(j)} title="Repor resposta (o jovem pode responder de novo)"
                    style={{ background:"none", border:"1px solid rgba(244,63,94,0.4)", color:"#f43f5e", fontSize:11, fontWeight:800, cursor:"pointer", padding:"2px 8px", borderRadius:8, flexShrink:0 }}>↺ Repor</button>
                )}
              </div>
              {d.answered && fbOpen[j.username] && (
                <div style={{ marginTop:8 }}>
                  <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                    <input value={fbTxts[j.username] || ""} onChange={e => setFbTxts(p => ({ ...p, [j.username]: e.target.value }))}
                      placeholder={`Comentar resposta de ${j.name}…`}
                      style={{ ...INP, flex:1, marginBottom:0, fontSize:12, padding:"8px 12px" }} />
                    <button onClick={() => enviarFbPergunta(j, d.answerText)}
                      style={{ background:`${CYN}20`, border:`1px solid ${CYN}40`, color:CYN, borderRadius:10, padding:"0 14px", fontWeight:900, fontSize:12, cursor:"pointer" }}>
                      Enviar
                    </button>
                  </div>
                  <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:11, color:"#94a3b8", cursor:"pointer" }}>
                    <input type="checkbox" checked={!!fbPush[j.username]} onChange={() => setFbPush(p => ({ ...p, [j.username]: !p[j.username] }))}
                      style={{ accentColor:CYN, width:13, height:13 }} />
                    🔔 Enviar também como notificação push
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={CARD}>
        <div style={SL}>Lançar Nova Pergunta</div>
        <input value={activeQEdit} onChange={e => setActiveQEdit(e.target.value)}
          placeholder="A pergunta da semana..." style={INP} />

        <div style={{ marginBottom:15 }}>
          <div style={{ fontSize:11, color:CYN, fontWeight:800, marginBottom:8 }}>MODOS DE RESPOSTA PERMITIDOS:</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {MODOS.map(m => (
              <button key={m.id} onClick={() => toggleMode(m.id)} style={{
                padding:"10px 5px", borderRadius:10, fontSize:11, border:"none", cursor:"pointer",
                background: selectedModes.includes(m.id) ? CYN : "rgba(255,255,255,0.05)",
                color: selectedModes.includes(m.id) ? "#000" : "#fff",
                fontWeight: selectedModes.includes(m.id) ? 900 : 600,
              }}>
                <span style={{ fontSize:16, display:"block", marginBottom:2 }}>{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:15, marginBottom:15 }}>
          <div style={{ fontSize:11, color:PNK, fontWeight:800, marginBottom:8 }}>BOTÕES DE OPÇÃO (podes combinar com os modos acima):</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            <input value={opt1} onChange={e => setOpt1(e.target.value)} placeholder="Opção 1" style={{ ...INP, marginBottom:0, fontSize:11 }} />
            <input value={opt2} onChange={e => setOpt2(e.target.value)} placeholder="Opção 2" style={{ ...INP, marginBottom:0, fontSize:11 }} />
            <input value={opt3} onChange={e => setOpt3(e.target.value)} placeholder="Opção 3" style={{ ...INP, marginBottom:0, fontSize:11 }} />
          </div>
        </div>

        <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#94a3b8", cursor:"pointer", marginBottom:12 }}>
          <input type="checkbox" checked={pushNovaPergunta} onChange={() => setPushNovaPergunta(v => !v)}
            style={{ accentColor:CYN, width:14, height:14 }} />
          🔔 Enviar também como notificação push
        </label>

        <Agendador
          tipo="pergunta"
          rotuloJa="Publicar Desafio Semanal 💬"
          publicarJa={publicar}
          construirPayload={() => {
            if (!activeQEdit.trim()) { alert("Escreve a pergunta!"); return null; }
            if (selectedModes.length === 0 && !opt1.trim()) { alert("Seleciona pelo menos um modo de resposta!"); return null; }
            const opcoes = [opt1, opt2, opt3].filter(o => o.trim());
            return { text: activeQEdit.trim(), options: opcoes, modes: selectedModes, push: pushNovaPergunta };
          }}
          rotuloItem={p => `💬 ${p.text}`}
          onAgendado={() => { setActiveQEdit(""); setOpt1(""); setOpt2(""); setOpt3(""); setPushNovaPergunta(false); }}
        />
      </div>

      {/* Respostas anteriores já guardadas por user (perguntasHistorico) */}
      {JEEP_8.some(j => (allShared[j.username]?.perguntasHistorico || []).length > 0) && (
        <div style={CARD}>
          <div style={SL}>📜 Respostas a Perguntas Anteriores</div>
          <div style={{ fontSize:11, color:"#475569", marginBottom:10 }}>Respostas que os jovens já enviaram a perguntas anteriores (o texto da pergunta não foi guardado nas versões anteriores do sistema).</div>
          {JEEP_8.map(j => {
            const hist = (allShared[j.username]?.perguntasHistorico || []).slice().reverse();
            if (hist.length === 0) return null;
            return (
              <div key={j.username} style={{ marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:800, color:j.color, marginBottom:6 }}>{j.name}</div>
                {hist.map((h) => (
                  <div key={`${h.week}-${h.date}`} style={{ background:"rgba(0,0,0,0.2)", borderRadius:8, padding:"8px 10px", marginBottom:5 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                      <span style={{ fontSize:10, color:"#475569" }}>{h.week || "—"}</span>
                      <span style={{ fontSize:10, color:"#475569" }}>{h.type || "texto"}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#e2e8f0" }}>{h.answer}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {arquivo.length > 0 && (
        <div style={CARD}>
          <div style={SL}>📚 Arquivo de Perguntas Anteriores</div>
          {arquivo.map(a => {
            const nResp = Object.values(a.respostas || {}).filter(r => r.answered && r.answerText).length;
            const quandoArq = a.archivedAt
              ? new Date(a.archivedAt).toLocaleString("pt-PT", { day:"2-digit", month:"2-digit", year:"2-digit", hour:"2-digit", minute:"2-digit" })
              : (a.date || "—");
            return (
            <div key={a.id} style={{ marginBottom:10, borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,0.07)" }}>
              <button onClick={() => setArquivoOpen(arquivoOpen === a.id ? null : a.id)} style={{
                width:"100%", textAlign:"left", background:"rgba(0,0,0,0.25)", border:"none",
                color:"#e2e8f0", padding:"12px 14px", cursor:"pointer",
                display:"flex", justifyContent:"space-between", alignItems:"center",
              }}>
                <span style={{ fontSize:13, fontWeight:700, flex:1, marginRight:10 }}>
                  {a.text}
                  <span style={{ display:"block", fontSize:10, fontWeight:700, color: nResp > 0 ? "#4ade80" : "#f43f5e", marginTop:2 }}>
                    {nResp} resposta{nResp !== 1 ? "s" : ""} guardada{nResp !== 1 ? "s" : ""}
                  </span>
                </span>
                <span style={{ fontSize:10, color:"#475569", flexShrink:0, textAlign:"right" }}>{quandoArq} {arquivoOpen === a.id ? "▲" : "▼"}</span>
              </button>
              {arquivoOpen === a.id && (
                <div style={{ background:"rgba(0,0,0,0.15)", padding:"10px 14px" }}>
                  <button onClick={() => reporArquivo(a)} style={{
                    width:"100%", marginBottom:10, padding:"9px",
                    background:"rgba(74,222,128,0.12)", border:"1px solid rgba(74,222,128,0.4)",
                    color:"#4ade80", borderRadius:10, fontWeight:900, fontSize:12, cursor:"pointer",
                  }}>↩️ Repor esta pergunta e respostas como atuais</button>
                  {JEEP_8.map(j => {
                    const r = (a.respostas || {})[j.username] || {};
                    return (
                      <div key={j.username} style={{ padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", gap:8, alignItems:"flex-start" }}>
                        <span style={{ fontSize:12, fontWeight:800, color:j.color, flexShrink:0, minWidth:70 }}>{j.name}:</span>
                        {r.answered && r.answerText
                          ? <span style={{ fontSize:12, color:"#e2e8f0", lineHeight:1.5 }}>{r.answerText}</span>
                          : <span style={{ fontSize:12, color:"#475569" }}>Sem resposta</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ScoresGrid({ scores, notas }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      {DIMS.map(dim => {
        const val = scores[dim.id];
        if (!val) return null;
        const nota = notas?.[dim.id];
        return (
          <div key={dim.id} style={{ background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"7px 11px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: nota ? 3 : 0 }}>
              <span style={{ fontSize:11, fontWeight:700, color:"#e2e8f0" }}>{dim.label}</span>
              <span style={{ fontSize:13, fontWeight:900, color: val >= 8 ? "#4ade80" : val >= 5 ? "#fbbf24" : "#f87171" }}>{val}/10</span>
            </div>
            {nota && <div style={{ fontSize:10, color:"#94a3b8", fontStyle:"italic" }}>"{nota}"</div>}
          </div>
        );
      })}
    </div>
  );
}

function AutoavAdmin({ allShared }) {
  const [histOpen,  setHistOpen]  = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [fbTxts,    setFbTxts]    = useState({});
  const [fbOpen,    setFbOpen]    = useState({});
  const [fbPush,    setFbPush]    = useState({});

  async function enviarFbAutoav(j) {
    const txt = fbTxts[j.username]?.trim();
    if (!txt) return;
    await addDoc(collection(db, "notifications", j.username, "items"), {
      from:"teresa", text:`Teresa reagiu à tua Autoavaliação: ${txt}`,
      date:nowFull(), read:false, ts:Date.now(), tipo:"auto", push: !!fbPush[j.username]
    });
    setFbTxts(p => ({ ...p, [j.username]: "" }));
    setFbOpen(p => ({ ...p, [j.username]: false }));
    setFbPush(p => ({ ...p, [j.username]: false }));
    alert("Feedback enviado! ✓");
  }

  const rondasAntigas = useMemo(() => {
    const map = {};
    JEEP_8.forEach(j => {
      (allShared[j.username]?.autoAvaliacaoHistorico || []).forEach(entry => {
        // Agrupar por ciclo (do lançamento ao fecho). Entradas antigas sem
        // ciclo caem no agrupamento por semana, como dantes.
        const chave = entry.ciclo != null ? "c" + entry.ciclo : "w:" + entry.week;
        if (!map[chave]) map[chave] = { chave, label: entry.cicloLabel || entry.date || entry.week, users: {}, maxTs: 0 };
        map[chave].users[j.username] = entry;
        const ts = entry.ts || 0;
        if (ts > map[chave].maxTs) { map[chave].maxTs = ts; map[chave].date = entry.date; }
      });
    });
    return Object.values(map).sort((a, b) => b.maxTs - a.maxTs);
  }, [allShared]);

  async function arquivarRondaAtual() {
    if (!window.confirm("Arquivar o estado atual de todas as autoavaliações? Útil para guardar a ronda atual antes de lançares uma nova.")) return;
    setGuardando(true);
    const snap = await getDoc(doc(db, "config", "autoCiclo"));
    const ciclo = snap.exists() ? snap.data() : null;
    await Promise.all(JEEP_8.map(j => {
      const uData = allShared[j.username] || {};
      const { dScores = {} } = uData;
      if (Object.keys(dScores).length === 0) return Promise.resolve();
      return updateDoc(doc(db, "userData", j.username), { autoAvaliacaoHistorico: arrayUnion(buildAutoavEntry(uData, ciclo)) });
    }));
    setGuardando(false);
    alert("Ronda arquivada!");
  }

  return (
    <div>
      {/* Ronda atual */}
      <div style={{ ...CARD, marginBottom:4, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={SL}>Ronda Atual</div>
        <button onClick={arquivarRondaAtual} disabled={guardando} style={{
          background:"rgba(34,211,238,0.1)", border:`1px solid ${CYN}40`, color:CYN,
          borderRadius:10, padding:"6px 12px", fontSize:11, fontWeight:800, cursor:"pointer"
        }}>{guardando ? "A guardar..." : "📥 Arquivar estado atual"}</button>
      </div>
      {JEEP_8.map(j => {
        const uData = allShared[j.username] || {};
        const scores = uData.dScores || {};
        const notas  = uData.dNotas  || {};
        const hasData = Object.keys(scores).length > 0;
        return (
          <div key={j.username} style={{ ...CARD, marginBottom:10, borderLeft: uData.autoSaved ? `4px solid ${CYN}` : "4px solid transparent" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: hasData ? 10 : 0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:j.color }} />
                <span style={{ fontSize:14, fontWeight:800, color:j.color }}>{j.name}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, fontWeight:800, color: uData.autoSaved ? CYN : "#475569" }}>
                  {uData.autoSaved ? `✓ Entregue ${uData.autoDate||""}` : hasData ? "Iniciada (não entregue)" : "Pendente"}
                </span>
                {uData.autoSaved && (
                  <button onClick={() => setFbOpen(p => ({ ...p, [j.username]: !p[j.username] }))}
                    style={{ background:"none", border:"none", color: fbOpen[j.username] ? CYN : "#64748b", fontSize:13, cursor:"pointer", padding:"0 4px" }}>💬</button>
                )}
              </div>
            </div>
            {hasData && <ScoresGrid scores={scores} notas={notas} />}
            {uData.autoSaved && fbOpen[j.username] && (
              <div style={{ marginTop:10 }}>
                <div style={{ display:"flex", gap:8, marginBottom:6 }}>
                  <input value={fbTxts[j.username] || ""} onChange={e => setFbTxts(p => ({ ...p, [j.username]: e.target.value }))}
                    placeholder={`Comentar autoavaliação de ${j.name}…`}
                    style={{ ...INP, flex:1, marginBottom:0, fontSize:12, padding:"8px 12px" }} />
                  <button onClick={() => enviarFbAutoav(j)}
                    style={{ background:`${CYN}20`, border:`1px solid ${CYN}40`, color:CYN, borderRadius:10, padding:"0 14px", fontWeight:900, fontSize:12, cursor:"pointer" }}>
                    Enviar
                  </button>
                </div>
                <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:11, color:"#94a3b8", cursor:"pointer" }}>
                  <input type="checkbox" checked={!!fbPush[j.username]} onChange={() => setFbPush(p => ({ ...p, [j.username]: !p[j.username] }))}
                    style={{ accentColor:CYN, width:13, height:13 }} />
                  🔔 Enviar também como notificação push
                </label>
              </div>
            )}
          </div>
        );
      })}

      {/* Rondas anteriores */}
      {rondasAntigas.length > 0 && (
        <div style={{ ...CARD, marginTop:10 }}>
          <div style={SL}>📚 Rondas Anteriores ({rondasAntigas.length})</div>
          {rondasAntigas.map(ronda => {
            const entregaram = Object.keys(ronda.users).length;
            return (
              <div key={ronda.chave} style={{ marginBottom:8, borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,0.07)" }}>
                <button onClick={() => setHistOpen(histOpen === ronda.chave ? null : ronda.chave)} style={{
                  width:"100%", textAlign:"left", background:"rgba(0,0,0,0.25)", border:"none",
                  color:"#e2e8f0", padding:"12px 14px", cursor:"pointer",
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                }}>
                  <span style={{ fontSize:13, fontWeight:700 }}>Ronda · {ronda.label}</span>
                  <span style={{ fontSize:10, color:"#475569" }}>{ronda.date} · {entregaram}/{JEEP_8.length} entregaram {histOpen === ronda.chave ? "▲" : "▼"}</span>
                </button>
                {histOpen === ronda.chave && (
                  <div style={{ background:"rgba(0,0,0,0.15)", padding:"10px 14px" }}>
                    {JEEP_8.map(j => {
                      const entry = ronda.users[j.username];
                      return (
                        <div key={j.username} style={{ marginBottom:12 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                            <div style={{ width:8, height:8, borderRadius:"50%", background:j.color }} />
                            <span style={{ fontSize:13, fontWeight:800, color:j.color }}>{j.name}</span>
                            {entry ? (
                              <span style={{ fontSize:10, color:"#475569" }}>{entry.date}</span>
                            ) : (
                              <span style={{ fontSize:10, color:"#475569" }}>Não entregou</span>
                            )}
                          </div>
                          {entry && <ScoresGrid scores={entry.scores || {}} notas={entry.notas} />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminPrograma({ allShared, events, missions, activeQ }) {
  const [sub, setSub] = useState("pergunta");
  return (
    <div>
      <div style={{ display:"flex", gap:4, marginBottom:20, overflowX:"auto", background:"rgba(0,0,0,0.3)", borderRadius:14, padding:4 }}>
        {SUBTABS.map(([id, label]) => (
          <button key={id} onClick={() => setSub(id)} style={{
            flexShrink:0, padding:"9px 14px", borderRadius:10, border:"none", cursor:"pointer", whiteSpace:"nowrap",
            background: sub === id ? CYN : "transparent",
            color: sub === id ? "#0f172a" : "#94a3b8",
            fontWeight:900, fontSize:12,
          }}>{label}</button>
        ))}
      </div>
      {sub === "pergunta" && <PerguntaManager allShared={allShared} activeQ={activeQ} />}
      {sub === "autoav"   && <AutoavAdmin allShared={allShared} />}
      {sub === "dilemas"  && <AdminQuizzes allShared={allShared} />}
      {sub === "votacoes" && <AdminVotacoes />}
      {sub === "missoes"  && <AdminMissoes missions={missions} allShared={allShared} />}
      {sub === "agenda"   && <AdminAgenda events={events} />}
      {sub === "tarefas"  && <AdminTarefas />}
    </div>
  );
}
