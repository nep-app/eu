import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase.js";
import { CARD, SL, CYN, PNK, GRN, INP, Btn } from "../../theme.jsx";
import { JEEP_LIST, nowFull } from "../../data.js";
import Agendador from "./Agendador.jsx";

const JEEP_8 = JEEP_LIST.filter(j => !["ricardo","demo"].includes(j.username));

function parseFmtData(str) {
  const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const [datePart, timePart] = str.split(" · ");
  const parts = datePart.trim().split(" ");
  const day = parseInt(parts[0]);
  const month = MESES.indexOf(parts[1]) + 1;
  if (!month) return null;
  const now = new Date();
  let year = now.getFullYear();
  const testDate = new Date(year, month - 1, day);
  if (testDate < now) year++;
  return {
    date: `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
    time: timePart || "",
  };
}

function fmtOpcaoData(date, time) {
  if (!date) return "";
  const [y, m, d] = date.split("-");
  const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const base = `${parseInt(d)} ${MESES[parseInt(m)-1]}`;
  return time ? `${base} · ${time}` : base;
}

function hasVotes(poll) {
  return poll.options.some(op => (poll.votes[op] || []).length > 0);
}

export default function AdminVotacoes() {
  const [polls, setPolls] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("texto");
  const [opcoes, setOpcoes] = useState(["", ""]);
  const [opcoesDesc, setOpcoesDesc] = useState(["", ""]);   // descrição de cada opção (opcional)
  const [opcoesDatas, setOpcoesDatas] = useState([{date:"",time:""},{date:"",time:""}]);
  const [targetUsers, setTargetUsers] = useState(JEEP_8.map(j => j.username));
  const [saving, setSaving] = useState(false);
  const [pushVotacao, setPushVotacao] = useState(false);
  const [multipla, setMultipla] = useState(false);       // deixar escolher várias opções
  const [permiteOutros, setPermiteOutros] = useState(false); // opção «Outros» (escrita livre)
  const [editId, setEditId] = useState(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editOpcoes, setEditOpcoes] = useState([]);
  const [editOpcoesDesc, setEditOpcoesDesc] = useState([]);
  const [editTargetUsers, setEditTargetUsers] = useState([]);
  const [editMultipla, setEditMultipla] = useState(false);
  const [editPermiteOutros, setEditPermiteOutros] = useState(false);
  // Imagem/flyer opcional da votação (fica logo no Storage ao escolher, para o
  // agendamento também poder levar o link).
  const [imagemUrl,    setImagemUrl]    = useState("");
  const [aCarregarImg, setACarregarImg] = useState(false);
  const [editImagem,   setEditImagem]   = useState("");

  useEffect(() => {
    return onSnapshot(collection(db, "polls"), snap => {
      setPolls(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.ts - a.ts));
    });
  }, []);

  // Carrega a imagem para o Storage e devolve o link. Usada na criação e na edição.
  async function carregarImagem(file) {
    const fileRef = ref(storage, `votacoes/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  }

  async function escolherImagem(e, destino = "nova") {
    const f = (e.target.files || [])[0];
    e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) return alert("Escolhe uma imagem (jpg, png...).");
    setACarregarImg(true);
    try {
      const url = await carregarImagem(f);
      if (destino === "edit") setEditImagem(url); else setImagemUrl(url);
    } catch (err) {
      alert("Não foi possível carregar a imagem: " + err.message);
    }
    setACarregarImg(false);
  }

  async function criarVotacao() {
    if (!titulo.trim()) return alert("Dá um título à votação!");

    let opcoesFinais;
    const descricoes = {};
    if (tipo === "data") {
      opcoesFinais = opcoesDatas
        .filter(o => o.date.trim())
        .map(o => fmtOpcaoData(o.date, o.time));
    } else {
      opcoesFinais = [];
      opcoes.forEach((t, i) => {
        const tt = t.trim();
        if (!tt) return;
        opcoesFinais.push(tt);
        const dd = (opcoesDesc[i] || "").trim();
        if (dd) descricoes[tt] = dd;
      });
    }

    if (opcoesFinais.length < 2) return alert("Precisas de pelo menos 2 opções!");

    const votosIniciais = {};
    opcoesFinais.forEach(op => { votosIniciais[op] = []; });

    setSaving(true);
    try {
      await addDoc(collection(db, "polls"), {
        title: titulo, type: tipo,
        options: opcoesFinais, votes: votosIniciais, descricoes,
        active: true, ts: Date.now(),
        demo: false,
        multipla: tipo === "data" ? true : multipla,          // Doodle é sempre múltiplo
        permiteOutros: tipo === "texto" ? permiteOutros : false,
        targetUsers: targetUsers.length === JEEP_8.length ? [] : targetUsers,
        ...(imagemUrl ? { imagem: imagemUrl } : {}),
      });
      // Avisar os jovens da nova votação (com push opcional).
      const notifTargets = targetUsers.length ? targetUsers : JEEP_8.map(j => j.username);
      await Promise.all(notifTargets.map(u =>
        addDoc(collection(db, "notifications", u, "items"), {
          from:"teresa", text:`🗳️ Nova votação: ${titulo.trim()}`, date:nowFull(), read:false, ts:Date.now(), push:pushVotacao,
        })
      ));
      setTitulo("");
      setOpcoes(["", ""]); setOpcoesDesc(["", ""]);
      setOpcoesDatas([{date:"",time:""},{date:"",time:""}]);
      setTargetUsers(JEEP_8.map(j => j.username));
      setPushVotacao(false); setMultipla(false); setPermiteOutros(false);
      setImagemUrl("");
    } catch(e) {
      alert("Erro ao criar votação: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  // Publica uma votação a partir de um payload (usado no "Publicar já" dos agendados).
  async function publicarVotacaoPayload(p) {
    const votes = {};
    (p.options || []).forEach(op => { votes[op] = []; });
    await addDoc(collection(db, "polls"), {
      title: p.title, type: p.type || "texto",
      options: p.options || [], votes, descricoes: p.descricoes || {},
      active: true, ts: Date.now(), demo: false,
      multipla: p.type === "data" ? true : !!p.multipla,
      permiteOutros: p.type === "data" ? false : !!p.permiteOutros,
      targetUsers: p.targetUsers || [],
      ...(p.imagem ? { imagem: p.imagem } : {}),
    });
    const notifTargets = (p.targetUsers && p.targetUsers.length) ? p.targetUsers : JEEP_8.map(j => j.username);
    await Promise.all(notifTargets.map(u =>
      addDoc(collection(db, "notifications", u, "items"), {
        from: "teresa", text: `🗳️ Nova votação: ${p.title}`, date: nowFull(), read: false, ts: Date.now(), push: !!p.push,
      })
    ));
  }

  function abrirEdicao(poll) {
    setEditId(poll.id);
    setEditTitulo(poll.title);
    setEditOpcoes([...poll.options]);
    setEditOpcoesDesc((poll.options || []).map(op => (poll.descricoes || {})[op] || ""));
    setEditTargetUsers(poll.targetUsers?.length > 0 ? poll.targetUsers : JEEP_8.map(j => j.username));
    setEditMultipla(!!poll.multipla);
    setEditPermiteOutros(!!poll.permiteOutros);
    setEditImagem(poll.imagem || "");
  }

  async function guardarEdicao(poll) {
    // Mantém a posição de cada opção: assim, mudar o título/descrição (ex.: dividir
    // um texto em título + descrição) NÃO perde os votos atuais (remapeados por índice).
    const finais = []; const descricoes = {}; const novosVotos = {}; const novosVotosTeste = {};
    editOpcoes.forEach((t, i) => {
      const tt = t.trim();
      if (!tt) return;
      finais.push(tt);
      const dd = (editOpcoesDesc[i] || "").trim();
      if (dd) descricoes[tt] = dd;
      const antigo = poll.options?.[i];               // opção que estava nesta posição
      novosVotos[tt] = (poll.votes || {})[antigo] || [];
      if ((poll.votesTeste || {})[antigo]) novosVotosTeste[tt] = poll.votesTeste[antigo];
    });
    if (!editTitulo.trim() || finais.length < 2) return alert("Título e pelo menos 2 opções são obrigatórios.");
    await updateDoc(doc(db, "polls", poll.id), {
      title: editTitulo,
      options: finais,
      votes: novosVotos,
      votesTeste: novosVotosTeste,
      descricoes,
      multipla: poll.type === "data" ? true : editMultipla,
      permiteOutros: poll.type === "data" ? false : editPermiteOutros,
      targetUsers: editTargetUsers.length === JEEP_8.length ? [] : editTargetUsers,
      imagem: editImagem || "",
    });
    setEditId(null);
  }

  // Apaga uma opção da votação (e os votos dessa opção). Útil p/ tirar opções
  // de teste que a conta teresa-user tenha deixado, ou opções indesejadas.
  async function apagarOpcao(poll, op) {
    if (!window.confirm(`Apagar a opção "${op}" desta votação?`)) return;
    const novasOptions = (poll.options || []).filter(o => o !== op);
    const novosVotos = { ...(poll.votes || {}) };
    delete novosVotos[op];
    await updateDoc(doc(db, "polls", poll.id), { options: novasOptions, votes: novosVotos });
  }

  async function apagarVotacao(id) {
    if (window.confirm("Apagar esta votação definitivamente?"))
      await deleteDoc(doc(db, "polls", id));
  }

  // Apaga as notificações do resultado desta votação que já foram para os
  // jovens (por pollId ou, para as antigas sem pollId, pelo título).
  async function apagarNotificacoesResultado(poll) {
    if (!window.confirm(`Apagar as notificações do resultado de "${poll.title}" da app de todos os jovens?`)) return;
    const targets = poll.targetUsers?.length > 0 ? poll.targetUsers : JEEP_8.map(j => j.username);
    let apagadas = 0;
    await Promise.all(targets.map(async u => {
      const snap = await getDocs(collection(db, "notifications", u, "items"));
      await Promise.all(snap.docs.map(async d => {
        const n = d.data();
        const match = n.from === "sistema" &&
          (n.pollId === poll.id || (n.text && poll.title && n.text.includes(poll.title)));
        if (match) { await deleteDoc(doc(db, "notifications", u, "items", d.id)); apagadas++; }
      }));
    }));
    alert(`${apagadas} notificação(ões) do resultado apagada(s).`);
  }

  async function fecharVotacao(id, estadoAtual) {
    await updateDoc(doc(db, "polls", id), { active: !estadoAtual });

    if (estadoAtual) {
      const poll = polls.find(p => p.id === id);
      if (!poll) return;

      const vencedora = poll.options.reduce((best, op) =>
        (poll.votes[op]||[]).length > (poll.votes[best]||[]).length ? op : best
      , poll.options[0]);

      const empate = poll.options.filter(op =>
        (poll.votes[op]||[]).length === (poll.votes[vencedora]||[]).length &&
        (poll.votes[vencedora]||[]).length > 0
      ).length > 1;

      const totalVotos = poll.options.reduce((s, op) => s + (poll.votes[op]||[]).length, 0);

      let texto;
      if (totalVotos === 0) {
        texto = `🗳️ A votação "${poll.title}" foi encerrada sem votos.`;
      } else if (empate) {
        texto = `🗳️ A votação "${poll.title}" encerrou em empate! Aguarda decisão da Teresa.`;
      } else {
        texto = `🗳️ Está escolhido! "${poll.title}" → ${vencedora}`;
      }

      const targets = poll.targetUsers?.length > 0
        ? poll.targetUsers
        : JEEP_8.map(j => j.username);

      // Escolher se os jovens recebem a notificação do resultado.
      const notificar = window.confirm(
        `Votação "${poll.title}" fechada.\n\nEnviar a notificação do resultado aos jovens?\n\nOK = enviar   ·   Cancelar = NÃO enviar`
      );

      // Notificação para todos os destinatários (só se escolheste enviar).
      const isDoodleResult = poll.type === "data" && !empate && totalVotos > 0;
      if (notificar) {
        await Promise.all(targets.map(u =>
          addDoc(collection(db, "notifications", u, "items"), {
            from: "sistema", text: texto, read: false, ts: Date.now(), pollId: poll.id,
            date: new Date().toLocaleString("pt-PT", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }),
            ...(isDoodleResult ? { tipo: "doodle_resultado" } : {})
          })
        ));
      }

      // Para Doodle com vencedor claro, criar UM único evento de grupo
      if (poll.type === "data" && !empate && totalVotos > 0) {
        const parsed = parseFmtData(vencedora);
        if (parsed) {
          const hasSpecificTargets = poll.targetUsers?.length > 0;
          const votantes = poll.votes[vencedora] || [];
          await addDoc(collection(db, "events"), {
            title: poll.title, date: parsed.date, time: parsed.time,
            userId: hasSpecificTargets ? "group" : "all",
            ...(hasSpecificTargets ? { targetUsers: poll.targetUsers } : {}),
            votantes,
            type: "group", shared: false,
            accepted: true, ts: Date.now(), fromPoll: poll.id,
          });
        }
      }
    }
  }

  return (
    <div>
      <div style={CARD}>
        <div style={SL}>Criar Nova Votação / Doodle</div>

        <input value={titulo} onChange={e => setTitulo(e.target.value)}
          placeholder="Ex: Que dia fazemos o acampamento?" style={INP} />

        {/* Tipo */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {[
            { id:"texto", label:"🗳️ Opções", desc:"Atividades, preferências..." },
            { id:"data",  label:"📅 Doodle", desc:"Escolha de datas/horas" },
          ].map(t => (
            <button key={t.id} onClick={() => setTipo(t.id)} style={{
              flex:1, padding:"9px 6px", borderRadius:11, cursor:"pointer",
              border: tipo === t.id ? `1.5px solid ${CYN}` : "1.5px solid rgba(255,255,255,0.08)",
              background: tipo === t.id ? `${CYN}15` : "rgba(255,255,255,0.03)",
              color: tipo === t.id ? CYN : "#64748b",
              fontWeight:800, fontSize:11, textAlign:"center",
            }}>
              <div>{t.label}</div>
              <div style={{ fontSize:9, fontWeight:600, marginTop:2, opacity:0.7 }}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* Opções texto */}
        {tipo === "texto" && (
          <>
            <div style={{ fontSize:11, color:"#94a3b8", marginBottom:8, fontWeight:800 }}>OPÇÕES: <span style={{ color:"#64748b", fontWeight:600 }}>(a descrição é opcional)</span></div>
            {opcoes.map((op, idx) => (
              <div key={idx} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"flex-start" }}>
                <div style={{ flex:1 }}>
                  <input value={op} onChange={e => {
                    const n = [...opcoes]; n[idx] = e.target.value; setOpcoes(n);
                  }} placeholder={`Título da opção ${idx+1}`} style={{ ...INP, marginBottom:6 }} />
                  <input value={opcoesDesc[idx] || ""} onChange={e => {
                    const n = [...opcoesDesc]; n[idx] = e.target.value; setOpcoesDesc(n);
                  }} placeholder="Descrição (opcional)" style={{ ...INP, marginBottom:0, fontSize:12, color:"#cbd5e1" }} />
                </div>
                {idx >= 2 && (
                  <button onClick={() => { setOpcoes(opcoes.filter((_,i) => i !== idx)); setOpcoesDesc(opcoesDesc.filter((_,i) => i !== idx)); }}
                    style={{ background:"none", border:"none", color:"#fb7185", cursor:"pointer", fontWeight:900, fontSize:16, marginTop:8 }}>✕</button>
                )}
              </div>
            ))}
            <button onClick={() => { setOpcoes([...opcoes, ""]); setOpcoesDesc([...opcoesDesc, ""]); }} style={{
              background:"transparent", border:`1px dashed ${CYN}`, color:CYN,
              padding:"8px 12px", borderRadius:12, fontSize:12, fontWeight:800,
              cursor:"pointer", width:"100%", marginBottom:15
            }}>+ ADICIONAR OPÇÃO</button>
          </>
        )}

        {/* Opções doodle (data + hora opcional) */}
        {tipo === "data" && (
          <>
            <div style={{ fontSize:11, color:"#94a3b8", marginBottom:8, fontWeight:800 }}>DATAS / HORÁRIOS:</div>
            {opcoesDatas.map((op, idx) => (
              <div key={idx} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"center" }}>
                <input type="date" value={op.date} onChange={e => {
                  const n = [...opcoesDatas]; n[idx] = {...n[idx], date:e.target.value}; setOpcoesDatas(n);
                }} style={{ ...INP, marginBottom:0, flex:2 }} />
                <input type="time" value={op.time} onChange={e => {
                  const n = [...opcoesDatas]; n[idx] = {...n[idx], time:e.target.value}; setOpcoesDatas(n);
                }} style={{ ...INP, marginBottom:0, flex:1 }} placeholder="hora (opcional)" />
                {idx >= 2 && (
                  <button onClick={() => setOpcoesDatas(opcoesDatas.filter((_,i) => i !== idx))}
                    style={{ background:"none", border:"none", color:"#fb7185", cursor:"pointer", fontWeight:900, fontSize:16 }}>✕</button>
                )}
              </div>
            ))}
            <div style={{ fontSize:10, color:"#475569", marginBottom:10 }}>A hora é opcional — deixa em branco se for dia inteiro.</div>
            <button onClick={() => setOpcoesDatas([...opcoesDatas, {date:"",time:""}])} style={{
              background:"transparent", border:`1px dashed ${CYN}`, color:CYN,
              padding:"8px 12px", borderRadius:12, fontSize:12, fontWeight:800,
              cursor:"pointer", width:"100%", marginBottom:15
            }}>+ ADICIONAR DATA</button>
          </>
        )}

        {/* Target users */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, color:"#94a3b8", fontWeight:800, marginBottom:8 }}>
            VISÍVEL PARA:
            <button onClick={() => setTargetUsers(
              targetUsers.length === JEEP_8.length ? [] : JEEP_8.map(j => j.username)
            )} style={{ background:"none", border:"none", color:CYN, cursor:"pointer", fontSize:11, fontWeight:800, marginLeft:10 }}>
              {targetUsers.length === JEEP_8.length ? "Desselecionar todos" : "Selecionar todos"}
            </button>
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {JEEP_8.map(j => {
              const sel = targetUsers.includes(j.username);
              return (
                <button key={j.username} onClick={() => setTargetUsers(
                  sel ? targetUsers.filter(u => u !== j.username) : [...targetUsers, j.username]
                )} style={{
                  padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:800, cursor:"pointer",
                  border: sel ? `1.5px solid ${CYN}` : "1.5px solid rgba(255,255,255,0.1)",
                  background: sel ? `${CYN}20` : "rgba(255,255,255,0.03)",
                  color: sel ? CYN : "#64748b",
                }}>{j.name}</button>
              );
            })}
          </div>
          {targetUsers.length === 0 && (
            <div style={{ fontSize:11, color:"#f43f5e", marginTop:6 }}>Nenhum jovem selecionado — a votação não será visível para ninguém.</div>
          )}
        </div>

        {tipo === "texto" && (
          <>
            <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#94a3b8", cursor:"pointer", marginBottom:10 }}>
              <input type="checkbox" checked={multipla} onChange={() => setMultipla(v => !v)}
                style={{ accentColor:CYN, width:14, height:14 }} />
              ✅ Deixar escolher <b style={{ color:"#cbd5e1" }}>&nbsp;várias opções</b>&nbsp; (senão, só uma)
            </label>
            <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#94a3b8", cursor:"pointer", marginBottom:10 }}>
              <input type="checkbox" checked={permiteOutros} onChange={() => setPermiteOutros(v => !v)}
                style={{ accentColor:CYN, width:14, height:14 }} />
              ✍️ Incluir opção <b style={{ color:"#cbd5e1" }}>&nbsp;«Outros»</b>&nbsp; (eles escrevem à vontade)
            </label>
          </>
        )}

        {/* Imagem/flyer opcional */}
        <div style={{ marginBottom:12 }}>
          <input type="file" id="votacao-img" accept="image/*" onChange={e => escolherImagem(e, "nova")} style={{ display:"none" }} />
          {imagemUrl ? (
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <img src={imagemUrl} alt="" style={{ width:64, height:64, objectFit:"cover", borderRadius:10, border:`1px solid ${CYN}40` }} />
              <label htmlFor="votacao-img" style={{ fontSize:12, fontWeight:800, color:CYN, cursor:"pointer" }}>Trocar</label>
              <button onClick={() => setImagemUrl("")}
                style={{ background:"none", border:"none", color:"#f87171", fontSize:12, fontWeight:800, cursor:"pointer" }}>✕ Tirar</button>
            </div>
          ) : (
            <label htmlFor="votacao-img" style={{ display:"inline-flex", alignItems:"center", gap:6, cursor: aCarregarImg ? "wait" : "pointer",
              fontSize:12, fontWeight:800, color:"#94a3b8", padding:"8px 12px", borderRadius:10,
              border:"1px dashed rgba(255,255,255,0.18)" }}>
              {aCarregarImg ? "A carregar..." : "🖼️ Anexar imagem / flyer (opcional)"}
            </label>
          )}
        </div>

        <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#94a3b8", cursor:"pointer", marginBottom:12 }}>
          <input type="checkbox" checked={pushVotacao} onChange={() => setPushVotacao(v => !v)}
            style={{ accentColor:CYN, width:14, height:14 }} />
          🔔 Enviar também como notificação push
        </label>

        <Agendador
          tipo="votacao"
          rotuloJa={saving ? "A criar..." : "LANÇAR VOTAÇÃO 🗳️"}
          publicarJa={criarVotacao}
          construirPayload={() => {
            if (!titulo.trim()) { alert("Dá um título à votação!"); return null; }
            const descricoes = {};
            const opcoesFinais = tipo === "data"
              ? opcoesDatas.filter(o => o.date.trim()).map(o => fmtOpcaoData(o.date, o.time))
              : (() => { const f = []; opcoes.forEach((t, i) => { const tt = t.trim(); if (tt) { f.push(tt); const dd = (opcoesDesc[i]||"").trim(); if (dd) descricoes[tt] = dd; } }); return f; })();
            if (opcoesFinais.length < 2) { alert("Precisas de pelo menos 2 opções!"); return null; }
            return {
              title: titulo, type: tipo, options: opcoesFinais, descricoes,
              multipla: tipo === "data" ? true : multipla,
              permiteOutros: tipo === "texto" ? permiteOutros : false,
              targetUsers: targetUsers.length === JEEP_8.length ? [] : targetUsers,
              push: pushVotacao,
              ...(imagemUrl ? { imagem: imagemUrl } : {}),
            };
          }}
          rotuloItem={p => `🗳️ ${p.title}`}
          publicarPayload={publicarVotacaoPayload}
          onAgendado={() => {
            setTitulo(""); setOpcoes(["", ""]); setOpcoesDesc(["", ""]);
            setOpcoesDatas([{date:"",time:""},{date:"",time:""}]);
            setTargetUsers(JEEP_8.map(j => j.username)); setPushVotacao(false); setMultipla(false); setPermiteOutros(false);
            setImagemUrl("");
          }}
          editorConteudo={(d, up) => {
            const opts = d.options || [];
            const setOpt = (i, val) => up({ options: opts.map((o, ix) => ix === i ? val : o) });
            const alvosSel = (d.targetUsers && d.targetUsers.length) ? d.targetUsers : JEEP_8.map(j => j.username);
            const toggleAlvo = (u) => {
              const nv = alvosSel.includes(u) ? alvosSel.filter(x => x !== u) : [...alvosSel, u];
              up({ targetUsers: nv.length === JEEP_8.length ? [] : nv });
            };
            return (
              <>
                <label style={{ fontSize: 11, color: CYN, fontWeight: 800 }}>TÍTULO</label>
                <input style={INP} value={d.title || ""} onChange={e => up({ title: e.target.value })} />
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 800, marginBottom: 8 }}>OPÇÕES:</div>
                {opts.map((op, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input style={{ ...INP, marginBottom: 0, flex: 1 }} value={op} onChange={e => setOpt(i, e.target.value)} placeholder={`Opção ${i + 1}`} />
                    {opts.length > 2 && (
                      <button type="button" onClick={() => up({ options: opts.filter((_, ix) => ix !== i) })}
                        style={{ background: "none", border: "none", color: "#fb7185", cursor: "pointer", fontSize: 16 }}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => up({ options: [...opts, ""] })} style={{
                  background: "transparent", border: `1px dashed ${CYN}`, color: CYN, padding: "6px 12px",
                  borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: "pointer", width: "100%", marginBottom: 12 }}>+ Opção</button>
                {d.type !== "data" && (
                  <>
                    <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#94a3b8", cursor: "pointer", marginBottom: 8 }}>
                      <input type="checkbox" checked={!!d.multipla} onChange={() => up({ multipla: !d.multipla })} style={{ accentColor: CYN, width: 14, height: 14 }} />
                      ✅ Deixar escolher várias opções
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#94a3b8", cursor: "pointer", marginBottom: 10 }}>
                      <input type="checkbox" checked={!!d.permiteOutros} onChange={() => up({ permiteOutros: !d.permiteOutros })} style={{ accentColor: CYN, width: 14, height: 14 }} />
                      ✍️ Incluir opção «Outros»
                    </label>
                  </>
                )}
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 800, marginBottom: 8 }}>VISÍVEL PARA:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {JEEP_8.map(j => {
                    const sel = alvosSel.includes(j.username);
                    return (
                      <button key={j.username} type="button" onClick={() => toggleAlvo(j.username)} style={{
                        padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 800, cursor: "pointer",
                        border: sel ? `1.5px solid ${CYN}` : "1.5px solid rgba(255,255,255,0.1)",
                        background: sel ? `${CYN}20` : "rgba(255,255,255,0.03)", color: sel ? CYN : "#64748b" }}>{j.name}</button>
                    );
                  })}
                </div>
              </>
            );
          }}
        />
      </div>

      {/* LISTA DE VOTAÇÕES */}
      {polls.length > 0 && (
        <>
          <div style={{ ...SL, marginTop:24, marginBottom:12 }}>Votações ({polls.length})</div>
          {polls.map(poll => (
            <div key={poll.id} style={{ ...CARD, borderLeft: poll.active ? `4px solid ${CYN}` : "4px solid #334155", opacity: poll.active ? 1 : 0.6 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:900 }}>{poll.title}</div>
                  <div style={{ fontSize:11, color: poll.active ? CYN : "#64748b", fontWeight:800, marginTop:3 }}>
                    {poll.active ? "🟢 A DECORRER" : "🔴 ENCERRADA"} · {poll.type === "data" ? "Doodle" : (poll.multipla ? "Várias opções" : "Uma opção")}{poll.permiteOutros ? " · com «Outros»" : ""}
                  </div>
                  {poll.targetUsers && poll.targetUsers.length > 0 && (
                    <div style={{ fontSize:10, color:"#64748b", marginTop:3 }}>
                      👥 {poll.targetUsers.map(u => JEEP_8.find(j => j.username === u)?.name || u).join(", ")}
                    </div>
                  )}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  {editId !== poll.id && (
                    <button onClick={() => abrirEdicao(poll)} style={{
                      background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
                      color:"#94a3b8", borderRadius:8, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:700,
                    }}>✏️ Editar</button>
                  )}
                  <button onClick={() => fecharVotacao(poll.id, poll.active)} style={{
                    background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
                    color:"#fff", borderRadius:8, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:700,
                  }}>{poll.active ? "Fechar" : "Reabrir"}</button>
                  <button onClick={() => apagarNotificacoesResultado(poll)} title="Apagar as notificações do resultado da app dos jovens" style={{
                    background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.3)",
                    color:"#fbbf24", borderRadius:8, padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:700,
                  }}>🔕 Limpar notif.</button>
                  <button onClick={() => apagarVotacao(poll.id)} style={{
                    background:"rgba(244,63,94,0.1)", border:"none", color:"#f43f5e",
                    borderRadius:8, padding:"4px 8px", fontSize:14, cursor:"pointer",
                  }}>✕</button>
                </div>
              </div>
              {editId === poll.id && (
                <div style={{ background:"rgba(0,0,0,0.25)", borderRadius:14, padding:14, marginBottom:14 }}>
                  <input value={editTitulo} onChange={e => setEditTitulo(e.target.value)}
                    style={{ ...INP, marginBottom:10 }} placeholder="Título" />
                  <div style={{ fontSize:11, color:"#94a3b8", fontWeight:800, marginBottom:8 }}>OPÇÕES: <span style={{ color:"#64748b", fontWeight:600 }}>(título + descrição opcional)</span></div>
                  {hasVotes(poll) && (
                    <div style={{ fontSize:10, color:"#f59e0b", marginBottom:8, lineHeight:1.4 }}>
                      ⚠️ Esta votação já tem votos. Editar títulos/descrições <b>mantém os votos</b>. Evita reordenar ou remover opções já votadas.
                    </div>
                  )}
                  {editOpcoes.map((op, idx) => (
                    <div key={idx} style={{ display:"flex", gap:8, marginBottom:8, alignItems:"flex-start" }}>
                      <div style={{ flex:1 }}>
                        <input value={op} onChange={e => { const n=[...editOpcoes]; n[idx]=e.target.value; setEditOpcoes(n); }}
                          placeholder={`Título da opção ${idx+1}`} style={{ ...INP, marginBottom:6 }} />
                        <input value={editOpcoesDesc[idx] || ""} onChange={e => { const n=[...editOpcoesDesc]; n[idx]=e.target.value; setEditOpcoesDesc(n); }}
                          placeholder="Descrição (opcional)" style={{ ...INP, marginBottom:0, fontSize:12, color:"#cbd5e1" }} />
                      </div>
                      {idx >= 2 && (
                        <button onClick={() => { setEditOpcoes(editOpcoes.filter((_,i) => i!==idx)); setEditOpcoesDesc(editOpcoesDesc.filter((_,i) => i!==idx)); }}
                          style={{ background:"none", border:"none", color:"#fb7185", cursor:"pointer", fontSize:16, marginTop:8 }}>✕</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => { setEditOpcoes([...editOpcoes,""]); setEditOpcoesDesc([...editOpcoesDesc,""]); }} style={{
                    background:"transparent", border:`1px dashed ${CYN}`, color:CYN,
                    padding:"6px 12px", borderRadius:10, fontSize:11, fontWeight:800,
                    cursor:"pointer", width:"100%", marginBottom:12,
                  }}>+ Opção</button>
                  {poll.type !== "data" && (
                    <>
                      <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#94a3b8", cursor:"pointer", marginBottom:8 }}>
                        <input type="checkbox" checked={editMultipla} onChange={() => setEditMultipla(v => !v)} style={{ accentColor:CYN, width:14, height:14 }} />
                        ✅ Deixar escolher várias opções
                      </label>
                      <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#94a3b8", cursor:"pointer", marginBottom:10 }}>
                        <input type="checkbox" checked={editPermiteOutros} onChange={() => setEditPermiteOutros(v => !v)} style={{ accentColor:CYN, width:14, height:14 }} />
                        ✍️ Incluir opção «Outros»
                      </label>
                    </>
                  )}
                  {/* Imagem/flyer da votação */}
                  <div style={{ fontSize:11, color:"#94a3b8", fontWeight:800, marginBottom:8 }}>IMAGEM / FLYER:</div>
                  <div style={{ marginBottom:12 }}>
                    <input type="file" id={`votacao-img-edit-${poll.id}`} accept="image/*"
                      onChange={e => escolherImagem(e, "edit")} style={{ display:"none" }} />
                    {editImagem ? (
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <img src={editImagem} alt="" style={{ width:64, height:64, objectFit:"cover", borderRadius:10, border:`1px solid ${CYN}40` }} />
                        <label htmlFor={`votacao-img-edit-${poll.id}`} style={{ fontSize:12, fontWeight:800, color:CYN, cursor:"pointer" }}>Trocar</label>
                        <button onClick={() => setEditImagem("")}
                          style={{ background:"none", border:"none", color:"#f87171", fontSize:12, fontWeight:800, cursor:"pointer" }}>✕ Tirar</button>
                      </div>
                    ) : (
                      <label htmlFor={`votacao-img-edit-${poll.id}`} style={{ display:"inline-flex", alignItems:"center", gap:6,
                        cursor: aCarregarImg ? "wait" : "pointer", fontSize:12, fontWeight:800, color:"#94a3b8",
                        padding:"8px 12px", borderRadius:10, border:"1px dashed rgba(255,255,255,0.18)" }}>
                        {aCarregarImg ? "A carregar..." : "🖼️ Anexar imagem / flyer"}
                      </label>
                    )}
                  </div>

                  <div style={{ fontSize:11, color:"#94a3b8", fontWeight:800, marginBottom:8 }}>VISÍVEL PARA:</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                    {JEEP_8.map(j => {
                      const sel = editTargetUsers.includes(j.username);
                      return (
                        <button key={j.username} onClick={() => setEditTargetUsers(
                          sel ? editTargetUsers.filter(u => u !== j.username) : [...editTargetUsers, j.username]
                        )} style={{
                          padding:"5px 12px", borderRadius:20, fontSize:11, fontWeight:800, cursor:"pointer",
                          border: sel ? `1.5px solid ${CYN}` : "1.5px solid rgba(255,255,255,0.1)",
                          background: sel ? `${CYN}20` : "rgba(255,255,255,0.03)",
                          color: sel ? CYN : "#64748b",
                        }}>{j.name}</button>
                      );
                    })}
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => guardarEdicao(poll)} style={{
                      flex:1, padding:"10px", background:CYN, border:"none", borderRadius:10,
                      fontWeight:900, fontSize:12, cursor:"pointer", color:"#071529",
                    }}>✓ Guardar</button>
                    <button onClick={() => setEditId(null)} style={{
                      padding:"10px 16px", background:"rgba(255,255,255,0.07)", border:"none",
                      borderRadius:10, color:"#64748b", cursor:"pointer", fontSize:12,
                    }}>Cancelar</button>
                  </div>
                </div>
              )}

              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {poll.options.map(op => {
                  const votos = poll.votes[op] || [];
                  const pct = poll.options.reduce((s,o) => s + (poll.votes[o]||[]).length, 0);
                  const barW = pct > 0 ? Math.round((votos.length/pct)*100) : 0;
                  return (
                    <div key={op} style={{ background:"rgba(0,0,0,0.25)", padding:"10px 14px", borderRadius:12 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", fontWeight:800, fontSize:13, marginBottom:6, gap:8 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <span style={{ color:"#e2e8f0" }}>{op}</span>
                          {(poll.descricoes || {})[op] && <div style={{ fontSize:11, color:"#94a3b8", fontWeight:600, marginTop:2, lineHeight:1.4 }}>{poll.descricoes[op]}</div>}
                        </div>
                        <span style={{ color:CYN, flexShrink:0 }}>{votos.length} {votos.length === 1 ? "voto" : "votos"}</span>
                        <button onClick={() => apagarOpcao(poll, op)} title="Apagar esta opção"
                          style={{ background:"none", border:"none", color:"#fb7185", cursor:"pointer", fontSize:13, flexShrink:0, padding:"0 2px" }}>✕</button>
                      </div>
                      {pct > 0 && (
                        <div style={{ height:4, background:"rgba(255,255,255,0.07)", borderRadius:4, marginBottom:6 }}>
                          <div style={{ height:4, width:`${barW}%`, background:CYN, borderRadius:4, transition:"width 0.4s" }} />
                        </div>
                      )}
                      {votos.length > 0 && (
                        <div style={{ fontSize:11, color:"#64748b" }}>🙋 {votos.join(", ")}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {polls.length === 0 && (
        <div style={{ textAlign:"center", color:"#475569", fontSize:13, padding:"30px 0" }}>
          Ainda não há votações criadas.
        </div>
      )}
    </div>
  );
}
