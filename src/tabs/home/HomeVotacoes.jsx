import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, addDoc, increment, arrayUnion } from "firebase/firestore";
import { db, notifyAdmin } from "../../firebase.js";
import { CARD, SL, CYN } from "../../theme.jsx";
import { nowFull } from "../../data.js";

export default function HomeVotacoes({ user }) {
  const [polls, setPolls] = useState([]);
  const [fechados, setFechados] = useState(new Set());   // votações "fechadas" com OK (só vista-resumo)
  const [outroTexto, setOutroTexto] = useState({});
  const isDemo = user.isDemo || false;
  // Votação a fingir para a conta demo (voto local, não vai à base de dados).
  const [demoVotes, setDemoVotes] = useState({ "Praia 🏖️": ["Nilton", "Carina"], "Parque 🌳": ["Erick"], "Café no centro ☕": ["Marisa", "Bruno"] });
  const demoPoll = { id: "demo_poll", title: "Onde fazemos o próximo convívio da equipa?", type: "opcao", options: ["Praia 🏖️", "Parque 🌳", "Café no centro ☕"], votes: demoVotes, active: true, ts: 9e15, demo: true };

  useEffect(() => {
    return onSnapshot(collection(db, "polls"), snap => {
      const ativas = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => {
          if (!p.active) return false;
          if (isDemo ? p.demo !== true : p.demo) return false;
          if (p.targetUsers && p.targetUsers.length > 0 && !p.targetUsers.includes(user.username)) return false;
          return true;
        });
      setPolls(ativas.sort((a, b) => b.ts - a.ts));
    });
  }, []);

  async function votar(pollId, opcao) {
    // Votação a fingir (demo): muda só o estado local, não escreve nada.
    if (pollId === "demo_poll") {
      setDemoVotes(prev => {
        const nv = { ...prev };
        const arr = nv[opcao] || [];
        nv[opcao] = arr.includes(user.realName) ? arr.filter(n => n !== user.realName) : [...arr, user.realName];
        return nv;
      });
      return;
    }
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;
    const nome = user.realName;
    const multi = poll.multipla || poll.type === "data";   // Doodle é sempre múltiplo

    // A conta "teresa" (user) vota em MODO DE TESTE: escreve em votesTeste, que
    // só ela vê — não conta na votação real nem aparece aos jovens.
    if (user.username === "teresa") {
      const vt = { ...(poll.votesTeste || {}) };
      const jaTem = (vt[opcao] || []).includes(nome);
      if (!multi) Object.keys(vt).forEach(k => { vt[k] = (vt[k] || []).filter(n => n !== nome); });
      vt[opcao] = jaTem ? (vt[opcao] || []).filter(n => n !== nome) : [...(vt[opcao] || []), nome];
      await updateDoc(doc(db, "polls", pollId), { votesTeste: vt });
      return;
    }

    const jaTem = (poll.votes[opcao] || []).includes(nome);
    let novosVotos = { ...poll.votes };
    if (!multi) {
      // Só uma opção: tira o voto do utilizador de todas antes de marcar a nova.
      Object.keys(novosVotos).forEach(k => { novosVotos[k] = (novosVotos[k] || []).filter(n => n !== nome); });
    }
    if (jaTem) {
      novosVotos[opcao] = (novosVotos[opcao] || []).filter(n => n !== nome);
    } else {
      novosVotos[opcao] = [...(novosVotos[opcao] || []), nome];
    }
    const aVotar = !jaTem;
    await updateDoc(doc(db, "polls", pollId), { votes: novosVotos });
    if (aVotar) {
      await updateDoc(doc(db, "userData", user.username), {
        weekXp: increment(5),
        history: arrayUnion({ date: nowFull(), action: `Votou em "${poll.title}"`, ts: Date.now(), xp: 5 }),
      });
      await notifyAdmin({
        tipo: "VOTO", jovem: user.username,
        texto: `${user.realName} votou em "${poll.title}" → ${opcao}`,
        ts: Date.now(), lida: false,
      });
    }
  }

  // Opção «Outros»: o jovem escreve uma opção nova e vota nela.
  async function submeterOutro(pollId) {
    const poll = polls.find(p => p.id === pollId);
    const t = (outroTexto[pollId] || "").trim();
    if (!poll || !t) return;
    const nome = user.realName;
    const multi = poll.multipla || poll.type === "data";

    // Conta "teresa" (user): a opção «Outros» também é só de teste (outrosTeste),
    // não vai para a votação real nem aparece aos jovens.
    if (user.username === "teresa") {
      const ot = poll.outrosTeste || [];
      const novasOutros = ot.includes(t) ? ot : [...ot, t];
      const vt = { ...(poll.votesTeste || {}) };
      if (!multi) Object.keys(vt).forEach(k => { vt[k] = (vt[k] || []).filter(n => n !== nome); });
      if (!(vt[t] || []).includes(nome)) vt[t] = [...(vt[t] || []), nome];
      await updateDoc(doc(db, "polls", pollId), { outrosTeste: novasOutros, votesTeste: vt });
      setOutroTexto(prev => ({ ...prev, [pollId]: "" }));
      return;
    }

    const novasOptions = poll.options.includes(t) ? poll.options : [...poll.options, t];
    let novosVotos = { ...poll.votes };
    if (!multi) Object.keys(novosVotos).forEach(k => { novosVotos[k] = (novosVotos[k] || []).filter(n => n !== nome); });
    if (!(novosVotos[t] || []).includes(nome)) novosVotos[t] = [...(novosVotos[t] || []), nome];
    await updateDoc(doc(db, "polls", pollId), { options: novasOptions, votes: novosVotos });
    setOutroTexto(prev => ({ ...prev, [pollId]: "" }));
    await updateDoc(doc(db, "userData", user.username), {
      weekXp: increment(5),
      history: arrayUnion({ date: nowFull(), action: `Votou em "${poll.title}"`, ts: Date.now(), xp: 5 }),
    });
    await notifyAdmin({ tipo: "VOTO", jovem: user.username, texto: `${nome} escreveu "${t}" em "${poll.title}"`, ts: Date.now(), lida: false });
  }

  const pollsToShow = isDemo ? [demoPoll, ...polls] : polls;
  if (pollsToShow.length === 0) return null;

  return (
    <>
      {pollsToShow.map(poll => {
        // A conta "teresa" (user) vê as opções reais + as suas de teste; a seleção
        // dela vem de votesTeste. Os jovens só veem as opções e votos reais.
        const testeUser = user.username === "teresa";
        const opcoesRender = testeUser
          ? [...(poll.options || []), ...((poll.outrosTeste || []).filter(o => !(poll.options || []).includes(o)))]
          : (poll.options || []);
        const escolhi = (op) => testeUser
          ? ((poll.votesTeste || {})[op] || []).includes(user.realName)
          : ((poll.votes[op] || []).includes(user.realName));
        const votasMinhas = opcoesRender.filter(op => escolhi(op));
        const hasVoted = votasMinhas.length > 0;
        const aEditar = !fechados.has(poll.id);   // aberto (a escolher) vs fechado (resumo)
        const abrir  = () => setFechados(prev => { const n = new Set(prev); n.delete(poll.id); return n; });
        const fechar = () => setFechados(prev => { const n = new Set(prev); n.add(poll.id); return n; });

        return (
          <div key={poll.id} style={{ ...CARD, border: `1.5px solid ${CYN}`, marginBottom:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <div style={SL}>🗳️ {poll.title}</div>
              {!aEditar && (
                <button onClick={abrir} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:CYN, fontWeight:800, flexShrink:0 }}>
                  ✏️ Alterar
                </button>
              )}
            </div>

            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>
              {aEditar
                ? (poll.type === "data" ? "✅ Escolhe as datas/horas em que podes (podes marcar várias):"
                   : poll.multipla ? "✅ Escolhe as opções que quiseres e carrega em OK:"
                   : "Escolhe a tua opção e carrega em OK:")
                : "Resumo — vês todas as opções e quem votou. Carrega em «Alterar» para mudar."}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {opcoesRender.map(op => {
                const votos = (poll.votes || {})[op] || [];
                const voteiNesta = escolhi(op);
                return (
                  <div key={op}>
                    <div onClick={aEditar ? () => votar(poll.id, op) : undefined} style={{
                      background: voteiNesta ? `${CYN}20` : "rgba(255,255,255,0.05)",
                      border: voteiNesta ? `1.5px solid ${CYN}` : "1.5px solid rgba(255,255,255,0.1)",
                      padding: "12px 16px",
                      borderRadius: votos.length > 0 ? "14px 14px 0 0" : 14,
                      display: "flex", justifyContent: "space-between", alignItems: "center", gap:10,
                      cursor: aEditar ? "pointer" : "default", transition: "0.2s"
                    }}>
                      <div style={{ display:"flex", alignItems: (aEditar && poll.descricoes && poll.descricoes[op]) ? "flex-start" : "center", gap:12, minWidth:0 }}>
                        <div style={{ width:20, height:20, minWidth:20, flexShrink:0, marginTop: (aEditar && poll.descricoes && poll.descricoes[op]) ? 1 : 0, borderRadius:"50%", border:`2px solid ${voteiNesta ? CYN : "#64748b"}`, display:"flex", alignItems:"center", justifyContent:"center", background: voteiNesta ? CYN : "transparent" }}>
                          {voteiNesta && <span style={{ color:"#000", fontSize:12, fontWeight:900 }}>✓</span>}
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", minWidth:0 }}>
                          <span style={{ fontSize:14, fontWeight: voteiNesta ? 800 : 600, color: voteiNesta ? "#fff" : "#cbd5e1" }}>{op}</span>
                          {aEditar && poll.descricoes && poll.descricoes[op] && (
                            <span style={{ fontSize:12, color:"#94a3b8", marginTop:3, lineHeight:1.4 }}>{poll.descricoes[op]}</span>
                          )}
                        </div>
                      </div>
                      {votos.length > 0 && <span style={{ fontSize:12, fontWeight:800, color:CYN, flexShrink:0 }}>{votos.length} 🙋</span>}
                    </div>
                    {votos.length > 0 && (
                      <div style={{ background: voteiNesta ? `${CYN}10` : "rgba(255,255,255,0.03)", border: voteiNesta ? `1.5px solid ${CYN}` : "1.5px solid rgba(255,255,255,0.1)", borderTop:"none", padding:"6px 16px", borderRadius:"0 0 14px 14px", fontSize:12, color:"#94a3b8" }}>
                        🙋 {votos.join(", ")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {aEditar && poll.permiteOutros && poll.id !== "demo_poll" && (
              <div style={{ display:"flex", gap:8, marginTop:10 }}>
                <input value={outroTexto[poll.id] || ""} onChange={e => setOutroTexto(prev => ({ ...prev, [poll.id]: e.target.value }))}
                  onKeyDown={e => { if (e.key === "Enter") submeterOutro(poll.id); }}
                  placeholder="✍️ Outros — escreve a tua opção…"
                  style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1.5px solid rgba(255,255,255,0.12)", borderRadius:12, padding:"11px 14px", color:"#e2e8f0", fontSize:13, outline:"none" }} />
                <button onClick={() => submeterOutro(poll.id)} style={{
                  background:`${CYN}20`, border:`1.5px solid ${CYN}55`, color:CYN, borderRadius:12,
                  padding:"0 16px", fontSize:13, fontWeight:900, cursor:"pointer", whiteSpace:"nowrap" }}>
                  Adicionar
                </button>
              </div>
            )}

            {aEditar && (
              <button onClick={fechar} disabled={!hasVoted} style={{
                width:"100%", marginTop:14, padding:"12px", borderRadius:12, fontSize:14, fontWeight:900,
                border:"none", cursor: hasVoted ? "pointer" : "not-allowed",
                background: hasVoted ? CYN : "rgba(255,255,255,0.06)", color: hasVoted ? "#071529" : "#64748b" }}>
                {hasVoted ? "OK ✓" : "Escolhe pelo menos uma opção"}
              </button>
            )}
          </div>
        );
      })}
    </>
  );
}
