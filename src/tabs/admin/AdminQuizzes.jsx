import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, arrayRemove, deleteField, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, Btn, INP } from "../../theme.jsx";
import { JEEP_LIST } from "../../data.js";
import Agendador from "./Agendador.jsx";

const JEEP_8 = JEEP_LIST.filter(j => !["teresa","ricardo","demo"].includes(j.username));

// Letras das opções (A, B, C, ...). O número de opções é livre, até 8.
const LETRAS = ["A","B","C","D","E","F","G","H"];
const MAX_OPCOES = LETRAS.length;
const OPCOES_VAZIAS = () => [{ text:"", reveal:"" }, { text:"", reveal:"" }, { text:"", reveal:"" }];

// Prepara as opções para gravar: deita fora as vazias e volta a numerar as
// letras. Devolve também a letra da resposta certa já remapeada.
function prepararOpcoes(opts = [], correctIdx = -1) {
  const validas = opts.filter(o => (o?.text || "").trim());
  const escolhida = correctIdx >= 0 ? opts[correctIdx] : null;
  const iCerta = escolhida ? validas.indexOf(escolhida) : -1;
  return {
    opts: validas.map((o, i) => ({ id: LETRAS[i], text: o.text.trim(), reveal: (o.reveal || "").trim() })),
    correct: iCerta >= 0 ? LETRAS[iCerta] : null,
  };
}

// mock = contadores por opção (A:0, B:0, ...), agora conforme as opções que existem.
function mockDeOpcoes(opts = []) {
  const m = {};
  opts.forEach(o => { m[o.id] = 0; });
  return m;
}

// Lista de opções editável (usada em criar, agendar e editar).
function EditorOpcoes({ opts, correctIdx, onOpts, onCorrect }) {
  const setOpt = (i, campo, val) => onOpts(opts.map((o, ix) => ix === i ? { ...o, [campo]: val } : o));
  const juntar  = () => onOpts([...opts, { text:"", reveal:"" }]);
  const remover = (i) => {
    onOpts(opts.filter((_, ix) => ix !== i));
    if (onCorrect) {
      if (correctIdx === i) onCorrect(-1);
      else if (correctIdx > i) onCorrect(correctIdx - 1);
    }
  };
  return (
    <>
      {opts.map((o, i) => (
        <div key={i} style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 12, marginBottom: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
            <label style={{ fontSize: 10, color: "#94a3b8" }}>OPÇÃO {LETRAS[i]}</label>
            {opts.length > 2 && (
              <button type="button" onClick={() => remover(i)} title="Apagar esta opção"
                style={{ background:"none", border:"none", color:"#fb7185", fontSize:14, cursor:"pointer" }}>✕</button>
            )}
          </div>
          <input style={{ ...INP, marginBottom: 5 }} placeholder={`Texto da opção ${LETRAS[i]}`}
            value={o.text || ""} onChange={e => setOpt(i, "text", e.target.value)} />
          <input style={{ ...INP, fontSize: 12, color: CYN }} placeholder="Explicação após responder (Reveal)"
            value={o.reveal || ""} onChange={e => setOpt(i, "reveal", e.target.value)} />
          {onCorrect && (
            <button type="button" onClick={() => onCorrect(correctIdx === i ? -1 : i)}
              style={{ marginTop: 4, fontSize: 11, fontWeight: 800, cursor: "pointer", borderRadius: 8, padding: "5px 10px",
                background: correctIdx === i ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.04)",
                border: correctIdx === i ? "1px solid #4ade80" : "1px solid rgba(255,255,255,0.1)",
                color: correctIdx === i ? "#4ade80" : "#94a3b8" }}>
              {correctIdx === i ? "✓ Resposta certa" : "Marcar como certa"}
            </button>
          )}
        </div>
      ))}
      {opts.length < MAX_OPCOES && (
        <button type="button" onClick={juntar} style={{
          background:"transparent", border:`1px dashed ${CYN}`, color:CYN,
          padding:"7px 12px", borderRadius:10, fontSize:11, fontWeight:800,
          cursor:"pointer", width:"100%", marginBottom:12 }}>+ Opção</button>
      )}
    </>
  );
}

export default function AdminQuizzes({ allShared = {} }) {
  const [quizzes, setQuizzes] = useState([]);
  const [notifRespostas, setNotifRespostas] = useState([]); // fallback para opcaoId/nota quando allShared não tem
  const [erro, setErro] = useState(null);
  const [resetInputs, setResetInputs] = useState({});
  const [expandido, setExpandido] = useState({});
  const NOVO_VAZIO = { title: "", badge: "D1 — Comunicação", scenario: "", prazo: "", opts: OPCOES_VAZIAS(), correctIdx: -1 };
  const [novo, setNovo] = useState(NOVO_VAZIO);
  const [editando, setEditando] = useState({});
  const [editDraft, setEditDraft] = useState({});

  useEffect(() => {
    try {
      const q = query(collection(db, "quizzes"), orderBy("ts", "desc"));
      return onSnapshot(q,
        (snap) => { setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setErro(null); },
        (err) => setErro(err.message)
      );
    } catch (e) { setErro(e.message); }
  }, []);

  useEffect(() => {
    // Carregar notificações antigas (respostas sem quiz.responses)
    const q = query(collection(db, "adminNotificacoes"), orderBy("ts", "desc"));
    return onSnapshot(q, (snap) =>
      setNotifRespostas(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(d => d.tipo === "QUIZ"))
    );
  }, []);

  async function salvarQuiz() {
    const { opts, correct } = prepararOpcoes(novo.opts, novo.correctIdx);
    if (!novo.title || !novo.scenario) return alert("Preenche o título e o cenário!");
    if (opts.length < 2) return alert("Precisas de pelo menos 2 opções!");
    try {
      await addDoc(collection(db, "quizzes"), {
        title: novo.title, badge: novo.badge, scenario: novo.scenario,
        prazo: novo.prazo || null, active: true, ts: Date.now(),
        correct, opts, mock: mockDeOpcoes(opts), responses: {}
      });
      setNovo(NOVO_VAZIO);
      alert("Novo Dilema publicado! 🚀");
    } catch (e) { alert("Erro: " + e.message); }
  }

  // Publica um dilema a partir de um payload (usado no "Publicar já" dos agendados).
  async function publicarDilemaPayload(p) {
    await addDoc(collection(db, "quizzes"), {
      title: p.title, badge: p.badge || "", scenario: p.scenario,
      prazo: p.prazo || null, correct: p.correct || null,
      active: true, ts: Date.now(),
      opts: p.opts || [], mock: mockDeOpcoes(p.opts || []), responses: {},
    });
  }

  function abrirEdicao(quiz) {
    const opts = (quiz.opts || []).map(o => ({ text: o.text || "", reveal: o.reveal || "" }));
    setEditDraft(p => ({
      ...p, [quiz.id]: {
        title: quiz.title, badge: quiz.badge, scenario: quiz.scenario, prazo: quiz.prazo || "",
        opts: opts.length ? opts : OPCOES_VAZIAS(),
        correctIdx: quiz.correct ? (quiz.opts || []).findIndex(o => o.id === quiz.correct) : -1,
      }
    }));
    setEditando(p => ({ ...p, [quiz.id]: true }));
  }

  async function guardarEdicao(quizId) {
    const d = editDraft[quizId];
    if (!d?.title || !d?.scenario) return alert("Título e cenário são obrigatórios.");
    const { opts, correct } = prepararOpcoes(d.opts, d.correctIdx);
    if (opts.length < 2) return alert("Precisas de pelo menos 2 opções!");
    try {
      await updateDoc(doc(db, "quizzes", quizId), {
        title: d.title, badge: d.badge, scenario: d.scenario, prazo: d.prazo || null,
        correct, opts,
      });
      setEditando(p => ({ ...p, [quizId]: false }));
    } catch (e) { alert("Erro: " + e.message); }
  }

  async function apagarQuiz(id) {
    if (window.confirm("Apagar este dilema para sempre?")) await deleteDoc(doc(db, "quizzes", id));
  }

  async function resetarResposta(quizId, jovem) {
    const nome = jovem || resetInputs[quizId]?.trim();
    if (!nome) return alert("Escreve o username primeiro.");
    if (!window.confirm(`Apagar a resposta de "${nome}"?`)) return;
    try {
      await updateDoc(doc(db, "userData", nome), { completedQuizzes: arrayRemove(quizId) });
      // Remover também do quiz.responses se existir
      try { await updateDoc(doc(db, "quizzes", quizId), { [`responses.${nome}`]: deleteField() }); } catch (_) {}
      setResetInputs(p => ({ ...p, [quizId]: "" }));
      alert(`"${nome}" pode voltar a responder.`);
    } catch (e) { alert("Erro: " + e.message); }
  }

  if (erro) return <div style={{ ...CARD, color: "#f43f5e" }}>⚠️ {erro}</div>;

  return (
    <div style={{ paddingBottom: 50 }}>

      {/* FORMULÁRIO */}
      <div style={CARD}>
        <div style={SL}>Criar Novo Dilema</div>

        <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>TÍTULO</label>
        <input style={INP} placeholder="Ex: O Problema do Atraso"
          value={novo.title} onChange={e => setNovo({...novo, title: e.target.value})} />

        <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>CATEGORIA</label>
        <select style={{ ...INP, background: "rgba(0,0,0,0.3)" }}
          value={novo.badge} onChange={e => setNovo({...novo, badge: e.target.value})}>
          <option>D1 — Comunicação</option>
          <option>D2 — Resiliência</option>
          <option>D3 — Proatividade</option>
          <option>D4 — Autoconhecimento</option>
          <option>D5 — Digital e Cidadania</option>
          <option>D6 — Intervenção</option>
        </select>

        <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>CENÁRIO / PERGUNTA</label>
        <textarea style={{ ...INP, height: 80 }} placeholder="Descreve a situação desafiante..."
          value={novo.scenario} onChange={e => setNovo({...novo, scenario: e.target.value})} />

        <EditorOpcoes opts={novo.opts} correctIdx={novo.correctIdx}
          onOpts={opts => setNovo({ ...novo, opts })}
          onCorrect={correctIdx => setNovo({ ...novo, correctIdx })} />

        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 12, lineHeight: 1.4 }}>
          A "resposta certa" é opcional e <b>não é mostrada</b> ao jovem — só faz com que quem lhe acerta ganhe mais XP (nos bastidores).
        </div>

        <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>PRAZO (opcional)</label>
        <input type="date" style={{ ...INP, marginTop: 6 }}
          value={novo.prazo} onChange={e => setNovo({...novo, prazo: e.target.value})} />

        <Agendador
          tipo="dilema"
          rotuloJa="Publicar Dilema 🚩"
          publicarJa={salvarQuiz}
          construirPayload={() => {
            const { opts, correct } = prepararOpcoes(novo.opts, novo.correctIdx);
            if (!novo.title || !novo.scenario) { alert("Preenche o título e o cenário!"); return null; }
            if (opts.length < 2) { alert("Precisas de pelo menos 2 opções!"); return null; }
            return {
              title: novo.title, badge: novo.badge, scenario: novo.scenario, prazo: novo.prazo || null,
              correct, opts,
            };
          }}
          rotuloItem={p => `🧠 ${p.title}`}
          publicarPayload={publicarDilemaPayload}
          onAgendado={() => setNovo(NOVO_VAZIO)}
          editorConteudo={(d, up) => {
            const opts = d.opts && d.opts.length ? d.opts : OPCOES_VAZIAS();
            // Ao mexer nas opções de um agendado, volta-se a numerar as letras
            // (e a "resposta certa" acompanha, se estiver marcada).
            const guardarOpts = (lista) => {
              const iCerta = d.correct ? opts.findIndex(o => o.id === d.correct) : -1;
              const escolhida = iCerta >= 0 ? opts[iCerta] : null;
              const renumeradas = lista.map((o, i) => ({ ...o, id: LETRAS[i] }));
              const novaCerta = escolhida ? renumeradas[lista.indexOf(escolhida)]?.id || null : null;
              up({ opts: renumeradas, correct: novaCerta });
            };
            return (
              <>
                <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>TÍTULO</label>
                <input style={INP} value={d.title || ""} onChange={e => up({ title: e.target.value })} />
                <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>CATEGORIA</label>
                <select style={{ ...INP, background: "rgba(0,0,0,0.3)" }} value={d.badge || "D1 — Comunicação"} onChange={e => up({ badge: e.target.value })}>
                  <option>D1 — Comunicação</option>
                  <option>D2 — Resiliência</option>
                  <option>D3 — Proatividade</option>
                  <option>D4 — Autoconhecimento</option>
                  <option>D5 — Digital e Cidadania</option>
                  <option>D6 — Intervenção</option>
                </select>
                <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>CENÁRIO</label>
                <textarea style={{ ...INP, height: 80 }} value={d.scenario || ""} onChange={e => up({ scenario: e.target.value })} />
                <EditorOpcoes opts={opts} correctIdx={-1} onOpts={guardarOpts} />
                <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>PRAZO (opcional)</label>
                <input type="date" style={{ ...INP, marginTop: 6 }} value={d.prazo || ""} onChange={e => up({ prazo: e.target.value || null })} />
              </>
            );
          }}
        />
      </div>

      {/* LISTA */}
      <div style={SL}>Dilemas ({quizzes.length})</div>
      {quizzes.length === 0 && (
        <div style={{ ...CARD, color: "#475569", textAlign: "center" }}>Ainda não há dilemas criados.</div>
      )}

      {quizzes.map(quiz => {
        // Fonte primária: allShared — quem tem quiz.id em completedQuizzes respondeu de certeza
        const sharedResps = JEEP_8
          .filter(j => (allShared[j.username]?.completedQuizzes || []).includes(quiz.id))
          .map(j => {
            const uData = allShared[j.username] || {};
            const notif = notifRespostas.find(r => r.jovem === j.username && (r.quizId === quiz.id || r.quizTitle === quiz.title));
            return {
              jovem: j.username,
              opcaoId: uData.quizResponses?.[quiz.id] || notif?.opcaoId || null,
              nota: uData.quizNotes?.[quiz.id] || notif?.nota || null,
              ts: notif?.ts || null,
            };
          });

        // Complemento: quiz.responses + adminNotificacoes para respostas fora de JEEP_8
        const docResps = Object.entries(quiz.responses || {}).map(([jovem, d]) => ({ jovem, ...d }));
        const extras = [...docResps, ...notifRespostas.filter(r => r.quizId === quiz.id || r.quizTitle === quiz.title)]
          .filter(r => !sharedResps.find(s => s.jovem === r.jovem));

        // A conta demo nunca conta aqui (respostas a fingir não devem poluir o painel).
        const todasRespostas = [...sharedResps, ...extras].filter(r => r.jovem !== "demo");
        const totalVotos = todasRespostas.length;

        // Contagem por opção
        const votosReais = {};
        todasRespostas.forEach(r => { if (r.opcaoId) votosReais[r.opcaoId] = (votosReais[r.opcaoId] || 0) + 1; });

        return (
          <div key={quiz.id} style={CARD}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setExpandido(p => ({ ...p, [quiz.id]: !p[quiz.id] }))}>
                <div style={{ fontSize: 10, fontWeight: 900, color: CYN }}>{quiz.badge}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{quiz.title}</div>
                {!expandido[quiz.id] && (
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                    {(quiz.scenario || "").substring(0, 80)}{(quiz.scenario || "").length > 80 ? "…" : ""}
                  </div>
                )}
                {quiz.prazo && <div style={{ fontSize: 10, color: "#f59e0b", marginTop: 4 }}>⏰ Prazo: {quiz.prazo}</div>}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 10, flexShrink: 0 }}>
                <button onClick={() => setExpandido(p => ({ ...p, [quiz.id]: !p[quiz.id] }))}
                  style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 16, cursor: "pointer", padding: 4 }}>
                  {expandido[quiz.id] ? "▲" : "▼"}
                </button>
                <button onClick={() => abrirEdicao(quiz)} title="Editar"
                  style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 16, cursor: "pointer", padding: 4 }}>✏️</button>
                <button onClick={() => apagarQuiz(quiz.id)}
                  style={{ background: "none", border: "none", color: "#f43f5e", fontSize: 18, cursor: "pointer", padding: 4 }}>✕</button>
              </div>
            </div>

            {/* Formulário de edição inline */}
            {editando[quiz.id] && (() => {
              const d = editDraft[quiz.id] || {};
              const setD = (patch) => setEditDraft(p => ({ ...p, [quiz.id]: { ...p[quiz.id], ...patch } }));
              return (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>TÍTULO</label>
                  <input style={INP} value={d.title} onChange={e => setD({ title: e.target.value })} />

                  <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>CATEGORIA</label>
                  <select style={{ ...INP, background: "rgba(0,0,0,0.3)" }} value={d.badge} onChange={e => setD({ badge: e.target.value })}>
                    <option>D1 — Comunicação</option>
                    <option>D2 — Resiliência</option>
                    <option>D3 — Proatividade</option>
                    <option>D4 — Autoconhecimento</option>
                    <option>D5 — Digital e Cidadania</option>
                    <option>D6 — Intervenção</option>
                  </select>

                  <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>CENÁRIO</label>
                  <textarea style={{ ...INP, height: 80 }} value={d.scenario} onChange={e => setD({ scenario: e.target.value })} />

                  <EditorOpcoes opts={d.opts || OPCOES_VAZIAS()} correctIdx={d.correctIdx ?? -1}
                    onOpts={opts => setD({ opts })}
                    onCorrect={correctIdx => setD({ correctIdx })} />

                  <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>PRAZO (opcional)</label>
                  <input type="date" style={{ ...INP, marginTop: 6 }} value={d.prazo} onChange={e => setD({ prazo: e.target.value })} />

                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button onClick={() => guardarEdicao(quiz.id)}
                      style={{ flex: 1, padding: "10px", background: "rgba(34,211,238,0.15)", border: "1.5px solid rgba(34,211,238,0.4)", color: CYN, borderRadius: 10, fontWeight: 900, fontSize: 13, cursor: "pointer" }}>
                      Guardar alterações
                    </button>
                    <button onClick={() => setEditando(p => ({ ...p, [quiz.id]: false }))}
                      style={{ padding: "10px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Conteúdo expandido: cenário + opções + reveals */}
            {expandido[quiz.id] && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6, marginBottom: 14 }}>{quiz.scenario}</p>
                {(quiz.opts || []).map(opt => (
                  <div key={opt.id} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ color: CYN, fontWeight: 900, fontSize: 12, flexShrink: 0 }}>{opt.id}</span>
                      <div>
                        <div style={{ fontSize: 13, color: "#f1f5f9" }}>{opt.text}</div>
                        {opt.reveal && <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, fontStyle: "italic" }}>💡 {opt.reveal}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Distribuição de votos */}
            {totalVotos > 0 ? (
              <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                {(quiz.opts || []).map(opt => {
                  const v = votosReais[opt.id] || 0;
                  const pct = totalVotos > 0 ? Math.round((v / totalVotos) * 100) : 0;
                  return (
                    <div key={opt.id} style={{ background: "rgba(50,199,255,0.08)", border: "1px solid rgba(50,199,255,0.15)", borderRadius: 8, padding: "4px 10px", fontSize: 11 }}>
                      <span style={{ color: CYN, fontWeight: 900 }}>{opt.id}</span>
                      <span style={{ color: "#94a3b8", marginLeft: 4 }}>{v} ({pct}%)</span>
                    </div>
                  );
                })}
                <span style={{ fontSize: 10, color: "#64748b" }}>{totalVotos} resposta{totalVotos !== 1 ? "s" : ""}</span>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: "#475569", marginTop: 8, fontStyle: "italic" }}>Sem respostas ainda.</div>
            )}

            {/* Lista de respostas individuais */}
            {todasRespostas.length > 0 && (
              <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 10 }}>
                {todasRespostas.sort((a, b) => (b.ts || 0) - (a.ts || 0)).map((r, i) => (
                  <div key={r.jovem + i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 13, color: "#f1f5f9" }}>
                        <span style={{ fontWeight: 800 }}>{r.jovem}</span>
                        {r.opcaoId
                          ? <span style={{ marginLeft: 8, background: "rgba(50,199,255,0.15)", color: CYN, padding: "2px 9px", borderRadius: 6, fontSize: 12, fontWeight: 900 }}>{r.opcaoId}</span>
                          : <span style={{ marginLeft: 8, color: "#64748b", fontSize: 11 }}>✓ respondeu</span>
                        }
                      </div>
                      <button onClick={() => resetarResposta(quiz.id, r.jovem)}
                        style={{ background: "none", border: "1px solid rgba(244,63,94,0.35)", color: "#f43f5e", fontSize: 10, padding: "2px 8px", borderRadius: 6, cursor: "pointer", fontWeight: 700 }}>
                        reset
                      </button>
                    </div>
                    {/* Nota do jovem */}
                    {r.nota && (
                      <div style={{ marginTop: 6, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 12, color: "#cbd5e1", fontStyle: "italic", lineHeight: 1.5 }}>
                        "{r.nota}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Reset manual por username */}
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <input
                style={{ ...INP, margin: 0, flex: 1, fontSize: 12, padding: "8px 12px" }}
                placeholder="username para resetar..."
                value={resetInputs[quiz.id] || ""}
                onChange={e => setResetInputs(p => ({ ...p, [quiz.id]: e.target.value }))}
              />
              <button
                onClick={() => resetarResposta(quiz.id, null)}
                style={{ background: "rgba(244,63,94,0.10)", border: "1px solid rgba(244,63,94,0.35)", color: "#f43f5e", fontSize: 11, padding: "8px 14px", borderRadius: 10, cursor: "pointer", fontWeight: 800, whiteSpace: "nowrap" }}>
                Reset
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
