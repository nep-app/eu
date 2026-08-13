import React, { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase.js";
import { TXT_MUT } from "../theme.jsx";
import { getWeekKey, nowLabel } from "../data.js";
import { ThemeCtx } from "../JovensApp.jsx";
import PiaTab from "./PiaTab.jsx";
import RodaVida from "./RodaVida.jsx";
import Capsulas from "./Capsulas.jsx";

const isAdmin = (u) => u?.username === "admin";

// Arcade EDUCA+ — quatro jogos, escondidos por defeito. Cada jogo abre-se
// sozinho (?jogo=N) e liga-se individualmente no admin (config/arcade.jogos[N]);
// a lista antiga config/arcade.users dá acesso aos quatro (retrocompatível).
const ARCADE_JOGOS = [
  { id:"__arcade4", n:4, cat:"jogo", icone:"🪞", titulo:"JOGO: Como te vês? Como achas que te vêem?", url:"/eu/jogos/como-te-ves.html", desc:"Dezoito afirmações sobre ti, para treinar a auto-avaliação. Funciona offline." },
  { id:"__arcade1", n:1, cat:"jogo", icone:"🎯", titulo:"Jogo 1 · Aproxima ou Afasta?", url:"/eu/jogos/arcade-educa.html?jogo=1", desc:"Decisões do dia a dia: em cada carta escolhes aproxima, afasta ou depende. Sem nota. Funciona offline." },
  { id:"__arcade2", n:2, cat:"jogo", icone:"🗣️", titulo:"Jogo 2 · Tabu EDUCA", url:"/eu/jogos/arcade-educa.html?jogo=2", desc:"Explica a palavra sem dizer as três proibidas. Duas equipas. Funciona offline." },
  { id:"__arcade3", n:3, cat:"jogo", icone:"🏗️", titulo:"Jogo 3 · Construtor de Projeto", url:"/eu/jogos/arcade-educa.html?jogo=3", desc:"Liga uma atividade às necessidades da ludoteca. No fim sai o rascunho do PIA. Funciona offline." },
];

const RECURSOS_FIXOS = [
  { id:"__bem-estar", cat:"guia", icone:"📱", titulo:"Guia Bem-estar Digital", url:"/eu/bem-estar-digital.html", desc:"Conceitos, hábitos e ferramentas para uma relação saudável com o digital" },
  {
    id:"__fdr", cat:"guia", icone:"⚽",
    titulo:"Manual de Treino de Competências",
    desc:"Ferramenta da Associação CAIS para desenvolver valores e competências pessoais e sociais com crianças e jovens",
    sublinks: [
      { label:"🎯 Resumo de Dinâmicas", url:"/eu/resumo-dinamicas-fdr.html", desc:"Seleção de dinâmicas do manual, preparada pela Teresa, para usar no dia-a-dia e para dinamizar com crianças e jovens nos vossos espaços" },
      { label:"📖 Manual Completo", url:"https://drive.google.com/file/d/1T-2eomdfBOgYXnsCAZHkEuV4PBq9N8zq/view?usp=sharing", desc:"Manual original da Associação CAIS com todas as dinâmicas, energizers e indicações de debriefing para 20 competências pessoais e sociais" },
    ],
  },
];

// Dimensões do jogo "Como te vês" — só para mostrar o histórico guardado (código + nome curto + cor).
const CTV_DIMS = [
  ["D1", "Comunicação",     "#E2574C"],
  ["D2", "Resiliência",     "#F0932B"],
  ["D3", "Autonomia",       "#FFD84D"],
  ["D4", "Autoconhecim.",   "#B79CE8"],
  ["D5", "Digital/Cidad.",  "#4A6CF0"],
  ["D6", "Intervenção",     "#2E9E7B"],
];

// Secções da aba. A categoria de cada recurso (campo `categoria`, gerido no admin)
// decide onde aparece. Recursos sem categoria caem em "guias".
const SECOES = [
  { id:"pia",     icone:"🚀", label:"PIA" },
  { id:"jogo",    icone:"🎲", label:"Atividades" },
  { id:"guia",    icone:"📘", label:"Guias" },
  { id:"site",    icone:"🌐", label:"Sites" },
  { id:"doc",     icone:"📄", label:"Docs" },
];

const VAZIO = {
  jogo: "Ainda não há jogos disponíveis para ti.",
  guia: "Ainda não há guias disponíveis.",
  site: "Ainda não há sites ou links disponíveis.",
  doc:  "Ainda não há documentos disponíveis.",
};

export default function RecursosTab({ user, data = {}, features = {} }) {
  const light = useContext(ThemeCtx);
  const isTeresa = user?.username === "teresa";
  const [secao, setSecao] = useState("pia");
  const [atividade, setAtividade] = useState(null); // dentro de "Atividades": null|"roda"|"capsula"
  const [recursosDb, setRecursosDb] = useState([]);
  const [arcadeCfg, setArcadeCfg] = useState({ users: [], jogos: {} });
  const [jogoUrl, setJogoUrl] = useState(null);   // jogo "Como te vês" aberto dentro da app (iframe)
  const [ctvHist, setCtvHist] = useState([]);      // respostas guardadas do jogo, ao longo do tempo
  const [verHist, setVerHist] = useState(false);
  const [guardadoAviso, setGuardadoAviso] = useState(false);

  // Recursos carregados no admin (coleção "recursos"), filtrados por destinatário.
  useEffect(() => {
    return onSnapshot(collection(db, "recursos"), snap => {
      const fromDb = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(r => !r.target || r.target === "all" || r.target === user.username || isAdmin(user))
        .sort((a, b) => (b.ts || 0) - (a.ts || 0));
      setRecursosDb(fromDb);
    });
  }, [user.username]);

  // Configuração do Arcade (escondido por defeito).
  useEffect(() => {
    return onSnapshot(doc(db, "config", "arcade"), s => {
      const d = s.exists() ? s.data() : {};
      setArcadeCfg({ users: d.users || [], jogos: d.jogos || {} });
    });
  }, []);

  // Histórico das respostas guardadas do jogo "Como te vês".
  useEffect(() => {
    return onSnapshot(doc(db, "userData", user.username), s => {
      setCtvHist(s.exists() ? (s.data().ctvHist || []) : []);
    });
  }, [user.username]);

  // Ouve o jogo (dentro do iframe) a pedir para guardar as respostas.
  useEffect(() => {
    async function onMsg(e) {
      if (e.origin !== window.location.origin) return;         // só o jogo, mesma origem
      if (!e.data || e.data.type !== "ctv-save") return;
      const entry = {
        ts: e.data.ts || Date.now(),
        date: nowLabel(),
        tu: e.data.tu || {},
        loc: e.data.loc || {},
      };
      try {
        await setDoc(doc(db, "userData", user.username), { ctvHist: arrayUnion(entry) }, { merge: true });
        setGuardadoAviso(true);
        setTimeout(() => setGuardadoAviso(false), 3500);
      } catch (_) {}
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [user.username]);

  // XP por visitar os recursos (jogos/guias/sites/docs — não o PIA):
  // 20 na 1ª vez de sempre, depois 10 uma vez por semana.
  useEffect(() => {
    if (!["jogo","guia","site","doc"].includes(secao)) return;
    const uData = data.userData || {};
    const semana = getWeekKey();
    const ts = Date.now();
    const hist = data.history || [];
    if (!uData.recursosVisitados) {
      setDoc(doc(db, "userData", user.username), { recursosVisitados:true, recursosXpWeek:semana, history:[...hist, { date:nowLabel(), action:"Visitou os recursos", ts, xp:20 }], weekXp:(uData.weekXp||0)+20 }, { merge:true });
    } else if (uData.recursosXpWeek !== semana) {
      setDoc(doc(db, "userData", user.username), { recursosXpWeek:semana, history:[...hist, { date:nowLabel(), action:"Voltou a visitar os recursos", ts, xp:10 }], weekXp:(uData.weekXp||0)+10 }, { merge:true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secao]);

  // Cada jogo do Arcade aparece a admin/teresa, a quem tem acesso total antigo,
  // e a quem estiver ligado nesse jogo. A conta "demo" vê sempre o jogo 4
  // ("Como te vês"), para demonstração.
  const isDemo = user.username === "demo";
  const podeArcadeTudo = isAdmin(user) || (arcadeCfg.users || []).includes(user.username);
  const jogosArcade = ARCADE_JOGOS.filter(j =>
    podeArcadeTudo || (isDemo && j.n === 4) || (arcadeCfg.jogos?.[j.n] || []).includes(user.username)
  );

  // Categoria de um recurso da BD (por defeito "guia" se ainda não foi categorizado).
  const catOf = (r) => r.categoria || "guia";

  // Junta recursos fixos + BD por secção.
  const listaDa = (cat) => {
    if (cat === "jogo")  return [...jogosArcade, ...recursosDb.filter(r => catOf(r) === "jogo")];
    if (cat === "guia")  return [...recursosDb.filter(r => catOf(r) === "guia"), ...RECURSOS_FIXOS];
    return recursosDb.filter(r => catOf(r) === cat);
  };

  const roxo = isTeresa ? "#6d28d9" : "#a5b4fc";
  const roxo2 = isTeresa ? "#7c3aed" : "#818cf8";

  const renderCard = (r) => {
    // Cor de acento por cartão: o jogo "Como te vês" destaca-se a roxo, o resto azul.
    const cor = r.id === "__arcade4" ? "#7B5CFF" : "#2196F3";
    const cardStyle = {
      padding:"14px 16px", borderRadius:18, marginBottom:10,
      background: `${cor}26`,
      border: `1px solid ${cor}66`,
      borderLeft: `6px solid ${cor}`,
    };
    const bolha = (icone) => (
      <span style={{ width:46, height:46, borderRadius:13, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, background:`${cor}44`, border:`1px solid ${cor}` }}>{icone || "📄"}</span>
    );
    if (r.sublinks) {
      return (
        <div key={r.id} style={cardStyle}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:12 }}>
            {bolha(r.icone)}
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:800, color:cor }}>{r.titulo}</div>
              {r.desc && <div style={{ fontSize:11, color:roxo2, marginTop:2 }}>{r.desc}</div>}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {r.sublinks.map((sl, i) => {
              const slUrl = /^(https?:\/\/|\/)/.test(sl.url) ? sl.url : "#";
              const isPdf = sl.url.endsWith(".pdf");
              return (
                <div key={i} onClick={() => window.open(slUrl, "_blank")} style={{
                  display:"flex", flexDirection:"column", gap:2, padding:"10px 14px", borderRadius:12,
                  background: isTeresa ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.10)",
                  border: isTeresa ? "1px solid rgba(99,102,241,0.35)" : "1px solid rgba(99,102,241,0.18)",
                  cursor:"pointer", transition:"all 0.15s",
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:12, fontWeight:800, color: isTeresa ? "#5b21b6" : "#a5b4fc" }}>{sl.label}</span>
                    <span style={{ fontSize:12, color:roxo2 }}>{isPdf ? "⬇️" : "→"}</span>
                  </div>
                  {sl.desc && <div style={{ fontSize:10, color:roxo2, lineHeight:1.4 }}>{sl.desc}</div>}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    const safeUrl = /^(https?:\/\/|\/)/.test(r.url) ? r.url : "#";
    // O jogo "Como te vês" (n:4) abre DENTRO da app (iframe), para poder guardar
    // as respostas na conta do jovem. Os outros continuam a abrir em separador novo.
    if (r.n === 4) {
      return (
        <button key={r.id} onClick={() => setJogoUrl(r.url)} style={{
          ...cardStyle, width:"100%", textAlign:"left", cursor:"pointer",
          display:"flex", alignItems:"center", gap:14,
        }}>
          {bolha(r.icone)}
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:800, color:cor }}>{r.titulo}</div>
            {r.desc && <div style={{ fontSize:11, color:roxo2, marginTop:2 }}>{r.desc}</div>}
          </div>
          <span style={{ fontSize:16, color:cor }}>→</span>
        </button>
      );
    }
    return (
      <a key={r.id} href={safeUrl} target="_blank" rel="noreferrer" style={{
        ...cardStyle, display:"flex", alignItems:"center", gap:14, textDecoration:"none", transition:"all 0.15s",
      }}>
        {bolha(r.icone)}
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:800, color:cor }}>{r.titulo}</div>
          {r.desc && <div style={{ fontSize:11, color:roxo2, marginTop:2 }}>{r.desc}</div>}
        </div>
        <span style={{ fontSize:16, color:cor }}>→</span>
      </a>
    );
  };

  const voltarStyle = {
    background:"rgba(139,92,246,0.10)", border:"1px solid rgba(139,92,246,0.30)",
    color:"#a78bfa", borderRadius:12, padding:"7px 14px", fontSize:12, fontWeight:800,
    cursor:"pointer", marginBottom:14,
  };

  const renderActivityButton = (icone, titulo, desc, onClick, cor = "#2196F3") => (
    <button key={titulo} onClick={onClick} style={{
      width:"100%", textAlign:"left", cursor:"pointer",
      padding:"14px 16px", borderRadius:18, marginBottom:10,
      background: `${cor}26`,
      border: `1px solid ${cor}66`,
      borderLeft: `6px solid ${cor}`,
      display:"flex", alignItems:"center", gap:14,
    }}>
      <span style={{ width:46, height:46, borderRadius:13, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, background:`${cor}44`, border:`1px solid ${cor}` }}>{icone}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:800, color:cor }}>{titulo}</div>
        <div style={{ fontSize:11, color:roxo2, marginTop:2 }}>{desc}</div>
      </div>
      <span style={{ fontSize:16, color:cor }}>→</span>
    </button>
  );

  return (
    <div style={{ paddingBottom:100 }}>
      {/* ── JOGO "Como te vês" aberto dentro da app (para guardar as respostas) ── */}
      {jogoUrl && (
        <div style={{ position:"fixed", inset:0, zIndex:1000, background:"#181428", display:"flex", flexDirection:"column" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", background:"#0f0d1e", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize:12, fontWeight:800, color:"#a9beff", letterSpacing:0.4 }}>🪞 Como te vês?</span>
            <button onClick={() => setJogoUrl(null)} style={{
              background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff",
              borderRadius:10, padding:"6px 14px", fontSize:13, fontWeight:800, cursor:"pointer",
            }}>✕ Fechar</button>
          </div>
          <iframe src={jogoUrl} title="Como te vês" style={{ flex:1, width:"100%", border:"none" }} />
        </div>
      )}

      {/* Aviso de "guardado" */}
      {guardadoAviso && (
        <div style={{ position:"fixed", left:"50%", bottom:24, transform:"translateX(-50%)", zIndex:1100,
          background:"#2E9E7B", color:"#fff", padding:"10px 18px", borderRadius:14, fontSize:13, fontWeight:800,
          boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
          ✓ Respostas guardadas!
        </div>
      )}

      {/* ── SUB-NAVEGAÇÃO (PIA · Jogos · Guias · Sites · Documentos) ── */}
      <div style={{ display:"flex", gap:6, padding:"16px 12px 0", justifyContent:"center" }}>
        {SECOES.map(s => {
          const sel = secao === s.id;
          return (
            <button key={s.id} onClick={() => { setSecao(s.id); setAtividade(null); }} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:3, flex:"1 1 0", minWidth:0,
              padding:"11px 4px", borderRadius:16, cursor:"pointer", transition:"all 0.18s",
              border: sel ? "1px solid rgba(124,92,255,0.80)" : "1px solid rgba(124,92,255,0.22)",
              background: sel ? "linear-gradient(135deg, #7B5CFF, #2196F3)" : "rgba(124,92,255,0.08)",
              color: sel ? "#fff" : "#b9a8f5",
              boxShadow: sel ? "0 5px 16px rgba(124,92,255,0.40)" : "none",
              transform: sel ? "translateY(-1px)" : "none",
            }}>
              <span style={{ fontSize:19 }}>{s.icone}</span>
              <span style={{ fontSize:9, fontWeight:900, letterSpacing:0.3, textTransform:"uppercase" }}>{s.label}</span>
            </button>
          );
        })}
      </div>

      {secao === "pia" ? (
        <PiaTab user={user} data={data} />
      ) : secao === "jogo" ? (
        <div style={{ padding:"16px 16px 0" }}>
          {atividade === "roda" ? (
            <>
              <button onClick={() => setAtividade(null)} style={voltarStyle}>← Atividades</button>
              <RodaVida user={user} data={data} features={features} />
            </>
          ) : atividade === "capsula" ? (
            <>
              <button onClick={() => setAtividade(null)} style={voltarStyle}>← Atividades</button>
              <Capsulas user={user} data={data} />
            </>
          ) : (
            <>
              <div style={{ fontSize:10, fontWeight:900, letterSpacing:2, color: isTeresa ? "#4a3f80" : "#6366f1", textTransform:"uppercase", marginBottom:12 }}>
                🎲 Atividades
              </div>
              {listaDa("jogo").map(renderCard)}

              {/* Histórico das respostas guardadas do "Como te vês" (junto ao jogo) */}
              {(jogosArcade.some(j => j.n === 4) || ctvHist.length > 0) && (
                <div style={{ marginBottom:10 }}>
                  <button onClick={() => setVerHist(v => !v)} style={{
                    width:"100%", textAlign:"left", cursor:"pointer",
                    padding:"14px 16px", borderRadius:18,
                    background: "#7B5CFF26",
                    border: "1px solid #7B5CFF66",
                    borderLeft: "6px solid #7B5CFF",
                    display:"flex", alignItems:"center", gap:14,
                  }}>
                    <span style={{ width:46, height:46, borderRadius:13, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, background:"#7B5CFF44", border:"1px solid #7B5CFF" }}>📊</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:800, color:"#7B5CFF" }}>Respostas guardadas do jogo «Como te vês?» ({ctvHist.length})</div>
                      <div style={{ fontSize:11, color:roxo2, marginTop:2 }}>As respostas que guardaste deste jogo, para veres como mudaram ao longo do tempo.</div>
                    </div>
                    <span style={{ fontSize:16, color:"#7B5CFF" }}>{verHist ? "▲" : "▼"}</span>
                  </button>

                  {verHist && (
                    ctvHist.length === 0 ? (
                      <div style={{ padding:"14px 16px", fontSize:12, color: light ? "#6b5fa8" : TXT_MUT, lineHeight:1.5 }}>
                        Ainda não guardaste nenhuma. Joga o "Como te vês?" e, no fim, carrega em <b>💾 Guardar as minhas respostas</b>.
                      </div>
                    ) : (
                      <div style={{ marginTop:8, overflowX:"auto", borderRadius:14, border:"1px solid rgba(99,102,241,0.20)" }}>
                        <table style={{ borderCollapse:"collapse", width:"100%", fontSize:12, whiteSpace:"nowrap" }}>
                          <thead>
                            <tr>
                              <th style={{ textAlign:"left", padding:"8px 10px", color: light ? "#6b5fa8" : TXT_MUT, fontSize:10, fontWeight:800 }}>Data</th>
                              {CTV_DIMS.map(([code,, cor]) => (
                                <th key={code} title="" style={{ padding:"8px 8px", color:cor, fontSize:11, fontWeight:900 }}>{code}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {[...ctvHist].sort((a,b) => (b.ts||0)-(a.ts||0)).map((h, i) => (
                              <tr key={h.ts || i} style={{ borderTop:"1px solid rgba(99,102,241,0.12)" }}>
                                <td style={{ padding:"8px 10px", color: light ? "#4a3f80" : "#e2e8f0", fontWeight:700 }}>{h.date}</td>
                                {CTV_DIMS.map(([code,, cor]) => (
                                  <td key={code} style={{ padding:"7px 8px", textAlign:"center" }}>
                                    <div style={{ color:cor, fontWeight:800 }}>{h.tu?.[code] ?? "—"}</div>
                                    <div style={{ fontSize:9.5, color: light ? "#8b7fb8" : "#8a8298", marginTop:2, fontWeight:700 }}>{h.loc?.[code] ?? "—"}</div>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )
                  )}

                  {verHist && ctvHist.length > 0 && (
                    <div style={{ padding:"10px 4px 0", fontSize:10, color: light ? "#6b5fa8" : TXT_MUT }}>
                      <div style={{ marginBottom:6 }}>Em cada dimensão: <b>em cima</b> a tua nota, <b>em baixo</b> o palpite do Local.</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 12px" }}>
                        {CTV_DIMS.map(([code, nome, cor]) => (
                          <span key={code}><b style={{ color:cor }}>{code}</b> {nome}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {renderActivityButton("🌸", "Roda da Vida", "Avalia as diferentes áreas da tua vida e envia à Teresa.", () => setAtividade("roda"), "#FF4FA3")}
              {renderActivityButton("💌", "Cápsulas do Tempo", "Deixa mensagens trancadas para o teu futuro.", () => setAtividade("capsula"), "#F0932B")}
            </>
          )}
        </div>
      ) : (
        <div style={{ padding:"16px 16px 0" }}>
          <div style={{ fontSize:10, fontWeight:900, letterSpacing:2, color: isTeresa ? "#4a3f80" : "#6366f1", textTransform:"uppercase", marginBottom:12 }}>
            {SECOES.find(s => s.id === secao)?.icone} {SECOES.find(s => s.id === secao)?.label}
          </div>
          {(() => {
            const lista = listaDa(secao);
            if (lista.length === 0) return (
              <div style={{ textAlign:"center", padding:"30px 20px", color: light ? "#6b5fa8" : TXT_MUT, fontSize:13 }}>
                {VAZIO[secao]}
              </div>
            );
            return lista.map(renderCard);
          })()}
        </div>
      )}
    </div>
  );
}
