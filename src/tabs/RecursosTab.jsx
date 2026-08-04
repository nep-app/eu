import React, { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
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
  { id:"__arcade1", n:1, cat:"jogo", icone:"🎯", titulo:"Jogo 1 · Aproxima ou Afasta?", url:"/eu/jogos/arcade-educa.html?jogo=1", desc:"Decisões do dia a dia: em cada carta escolhes aproxima, afasta ou depende. Sem nota. Funciona offline." },
  { id:"__arcade2", n:2, cat:"jogo", icone:"🗣️", titulo:"Jogo 2 · Tabu EDUCA", url:"/eu/jogos/arcade-educa.html?jogo=2", desc:"Explica a palavra sem dizer as três proibidas. Duas equipas. Funciona offline." },
  { id:"__arcade3", n:3, cat:"jogo", icone:"🏗️", titulo:"Jogo 3 · Construtor de Projeto", url:"/eu/jogos/arcade-educa.html?jogo=3", desc:"Liga uma atividade às necessidades da ludoteca. No fim sai o rascunho do PIA. Funciona offline." },
  { id:"__arcade4", n:4, cat:"jogo", icone:"🪞", titulo:"Jogo 4 · Como te vês", url:"/eu/jogos/arcade-educa.html?jogo=4", desc:"Dezoito afirmações sobre ti, para treinar a auto-avaliação. Funciona offline." },
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

// Secções da aba. A categoria de cada recurso (campo `categoria`, gerido no admin)
// decide onde aparece. Recursos sem categoria caem em "guias".
const SECOES = [
  { id:"pia",     icone:"🚀", label:"PIA" },
  { id:"jogo",    icone:"🎲", label:"Atividades" },
  { id:"guia",    icone:"📘", label:"Guias" },
  { id:"site",    icone:"🌐", label:"Sites" },
  { id:"doc",     icone:"📄", label:"Documentos" },
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
  // e a quem estiver ligado nesse jogo.
  const podeArcadeTudo = isAdmin(user) || (arcadeCfg.users || []).includes(user.username);
  const jogosArcade = ARCADE_JOGOS.filter(j =>
    podeArcadeTudo || (arcadeCfg.jogos?.[j.n] || []).includes(user.username)
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
    const cardStyle = {
      padding:"14px 16px", borderRadius:18, marginBottom:10,
      background: isTeresa ? "rgba(99,102,241,0.10)" : "rgba(99,102,241,0.08)",
      border: isTeresa ? "1px solid rgba(99,102,241,0.40)" : "1px solid rgba(99,102,241,0.20)",
    };
    if (r.sublinks) {
      return (
        <div key={r.id} style={cardStyle}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:12 }}>
            <span style={{ fontSize:26, flexShrink:0 }}>{r.icone || "📄"}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:800, color:roxo }}>{r.titulo}</div>
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
    return (
      <a key={r.id} href={safeUrl} target="_blank" rel="noreferrer" style={{
        ...cardStyle, display:"flex", alignItems:"center", gap:14, textDecoration:"none", transition:"all 0.15s",
      }}>
        <span style={{ fontSize:26, flexShrink:0 }}>{r.icone || "📄"}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:800, color:roxo }}>{r.titulo}</div>
          {r.desc && <div style={{ fontSize:11, color:roxo2, marginTop:2 }}>{r.desc}</div>}
        </div>
        <span style={{ fontSize:14, color:roxo2 }}>→</span>
      </a>
    );
  };

  const voltarStyle = {
    background:"rgba(139,92,246,0.10)", border:"1px solid rgba(139,92,246,0.30)",
    color:"#a78bfa", borderRadius:12, padding:"7px 14px", fontSize:12, fontWeight:800,
    cursor:"pointer", marginBottom:14,
  };

  const renderActivityButton = (icone, titulo, desc, onClick) => (
    <button key={titulo} onClick={onClick} style={{
      width:"100%", textAlign:"left", cursor:"pointer",
      padding:"14px 16px", borderRadius:18, marginBottom:10,
      background: isTeresa ? "rgba(99,102,241,0.10)" : "rgba(99,102,241,0.08)",
      border: isTeresa ? "1px solid rgba(99,102,241,0.40)" : "1px solid rgba(99,102,241,0.20)",
      display:"flex", alignItems:"center", gap:14,
    }}>
      <span style={{ fontSize:26, flexShrink:0 }}>{icone}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:800, color:roxo }}>{titulo}</div>
        <div style={{ fontSize:11, color:roxo2, marginTop:2 }}>{desc}</div>
      </div>
      <span style={{ fontSize:14, color:roxo2 }}>→</span>
    </button>
  );

  return (
    <div style={{ paddingBottom:100 }}>
      {/* ── SUB-NAVEGAÇÃO (PIA · Jogos · Guias · Sites · Documentos) ── */}
      <div style={{ display:"flex", gap:8, padding:"16px 16px 0", overflowX:"auto", justifyContent:"center" }}>
        {SECOES.map(s => {
          const sel = secao === s.id;
          return (
            <button key={s.id} onClick={() => { setSecao(s.id); setAtividade(null); }} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:3, flex:"0 0 auto",
              minWidth:64, padding:"10px 10px", borderRadius:16, cursor:"pointer", transition:"all 0.18s",
              border: sel ? "1px solid rgba(139,92,246,0.60)" : "1px solid rgba(139,92,246,0.30)",
              background: sel ? "rgba(139,92,246,0.18)" : "rgba(139,92,246,0.06)",
              color: sel ? "#a78bfa" : "#a78bfacc",
              boxShadow: sel ? "0 0 0 1px rgba(99,102,241,0.25)" : "none",
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
              {renderActivityButton("🌸", "Roda da Vida", "Avalia as diferentes áreas da tua vida e envia à Teresa.", () => setAtividade("roda"))}
              {renderActivityButton("💌", "Cápsulas do Tempo", "Deixa mensagens trancadas para o teu futuro.", () => setAtividade("capsula"))}
              {listaDa("jogo").map(renderCard)}
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
