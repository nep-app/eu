import React, { useState } from 'react';
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, INP, CYN, GRN, TXT_MUT } from "../../theme.jsx";
import { JEEP_LIST, ALLOWED_USERNAMES, EVT_COLORS, EVT_ICONS, nowFull } from "../../data.js";

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function fmtDatePt(str) {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${parseInt(d)} ${MESES[parseInt(m)-1]} ${y}`;
}

export default function AdminAgenda({ events = [] }) {
  const hoje = toDateStr(new Date());
  const [titulo,    setTitulo]    = useState("");
  const [data,      setData]      = useState(hoje);
  const [hora,      setHora]      = useState("");
  const [dest,      setDest]      = useState("all");
  const [tipo,      setTipo]      = useState("group");
  const [modo,      setModo]      = useState("forcar"); // "propor" | "forcar"
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editData,  setEditData]  = useState("");
  const [editHora,  setEditHora]  = useState("");

  const TIPOS = [
    { id:"group",    label:"Grupo",    icon:"👥" },
    { id:"visit",    label:"Visita",   icon:"🏢" },
    { id:"formacao", label:"Formação", icon:"🎓" },
    { id:"personal", label:"Pessoal",  icon:"📌" },
  ];

  // Eventos criados pela admin têm sempre o campo "accepted" (true ou false).
  // Eventos criados pelo próprio jovem na agenda pessoal têm "shared" mas não "accepted".
  // Só mostrar: eventos da admin + eventos que o jovem explicitamente partilhou.
  const visiveis = events.filter(e =>
    e.accepted !== undefined ||   // criado pela admin (forçado ou proposta)
    e.shared === true             // criado pelo jovem mas partilhado voluntariamente
  );
  const sorted   = [...visiveis].sort((a, b) => a.date.localeCompare(b.date) || (a.time||"").localeCompare(b.time||""));
  const futuros  = sorted.filter(e => e.date >= hoje);
  const passados = sorted.filter(e => e.date <  hoje);

  async function criarEvento() {
    if (!titulo.trim()) return alert("Preenche o título.");
    const isForcar = modo === "forcar";
    await addDoc(collection(db, "events"), {
      title: titulo, date: data, time: hora,
      userId: dest, type: tipo, ts: Date.now(),
      accepted: isForcar ? true : false,
    });
    const dataFmt = fmtDatePt(data);
    const notifText = isForcar
      ? `📅 Novo evento agendado: "${titulo}" — ${dataFmt}${hora ? ` às ${hora}` : ""}`
      : `📅 A Teresa propôs um evento: "${titulo}" — ${dataFmt}. Vai ao Início para aceitar ou recusar!`;
    const targets = dest === "all" ? ALLOWED_USERNAMES : [dest];
    for (const u of targets) {
      await addDoc(collection(db, "notifications", u, "items"), {
        from:"teresa", text:notifText, date:nowFull(), read:false, ts:Date.now(), tipo: "proposta"
      });
    }
    setTitulo(""); setHora(""); setShowForm(false);
    alert(isForcar ? "Evento criado!" : "Proposta de evento enviada!");
  }

  async function remover(id) {
    if (window.confirm("Remover este evento?")) await deleteDoc(doc(db, "events", id));
  }

  async function guardarEdicao(id) {
    if (!editTitulo.trim()) return;
    await updateDoc(doc(db, "events", id), { title: editTitulo, date: editData, time: editHora });
    setEditId(null);
  }

  function EventRow({ ev }) {
    const cor   = EVT_COLORS[ev.type] || CYN;
    const icone = EVT_ICONS[ev.type]  || "📌";
    const jeep  = JEEP_LIST.find(j => j.username === ev.userId);
    return (
      <div style={{ padding:"11px 14px", borderRadius:14, background:"rgba(0,0,0,0.18)",
        borderLeft:`3px solid ${ev.accepted === false ? "#f59e0b" : cor}`, marginBottom:6 }}>
        {editId === ev.id ? (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <input value={editTitulo} onChange={e => setEditTitulo(e.target.value)}
              placeholder="Título do evento..." style={{ ...INP, marginBottom:0 }} />
            <div style={{ display:"flex", gap:8 }}>
              <input type="date" value={editData} onChange={e => setEditData(e.target.value)}
                style={{ ...INP, flex:1, marginBottom:0 }} />
              <input type="time" value={editHora} onChange={e => setEditHora(e.target.value)}
                style={{ ...INP, flex:1, marginBottom:0 }} />
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button onClick={() => guardarEdicao(ev.id)} style={{ background:"rgba(50,199,255,0.15)", border:"1px solid rgba(50,199,255,0.3)", color:CYN, borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:800, cursor:"pointer" }}>✓ Guardar</button>
              <button onClick={() => setEditId(null)} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", color:"#64748b", borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer" }}>✕ Cancelar</button>
              <div style={{ flex:1 }} />
              <button onClick={() => remover(ev.id)} style={{
                background:"rgba(244,63,94,0.12)", border:"none", color:"#f43f5e",
                borderRadius:6, padding:"4px 8px", cursor:"pointer", fontSize:11, fontWeight:900,
              }}>✕</button>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:16, flexShrink:0 }}>{ev.accepted === false ? "⏳" : icone}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:800, color:"#f1f5f9" }}>
                {ev.title}
                {ev.accepted === false && (
                  <span style={{ fontSize:9, background:"rgba(245,158,11,0.2)", color:"#f59e0b", padding:"2px 6px", borderRadius:4, marginLeft:6, fontWeight:900 }}>PROPOSTA</span>
                )}
                {ev.shared && ev.accepted !== false && (
                  <span style={{ fontSize:9, background:"rgba(50,199,255,0.15)", color:"#38bdf8", padding:"2px 6px", borderRadius:4, marginLeft:6, fontWeight:900 }}>PARTILHADO</span>
                )}
              </div>
              <div style={{ fontSize:11, color: ev.accepted === false ? "#f59e0b" : cor, fontWeight:700, marginTop:2 }}>
                {fmtDatePt(ev.date)}{ev.time ? ` · ${ev.time}` : ""}
                {" · "}
                <span style={{ color: jeep ? jeep.color : TXT_MUT }}>
                  {ev.userId === "all" ? "Todos" : jeep?.name || ev.userId}
                </span>
              </div>
              {ev.votantes?.length > 0 && (
                <div style={{ fontSize:10, color:"#64748b", marginTop:2 }}>
                  👥 {ev.votantes.join(", ")}
                </div>
              )}
            </div>
            <button onClick={() => { setEditId(ev.id); setEditTitulo(ev.title); setEditData(ev.date); setEditHora(ev.time || ""); }} style={{ background:"none", border:"none", color:"#64748b", fontSize:13, cursor:"pointer", padding:"2px 4px" }}>✏️</button>
            <button onClick={() => remover(ev.id)} style={{
              background:"rgba(244,63,94,0.12)", border:"none", color:"#f43f5e",
              borderRadius:6, padding:"4px 8px", cursor:"pointer", fontSize:11, fontWeight:900,
            }}>✕</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* CRIAR EVENTO */}
      <div style={CARD}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: showForm ? 14 : 0 }}>
          <div style={SL}>📅 Criar Evento</div>
          <button onClick={() => setShowForm(!showForm)} style={{
            background: showForm ? "rgba(50,199,255,0.12)" : "rgba(255,255,255,0.06)",
            border: `1px solid ${showForm ? CYN+"40" : "rgba(255,255,255,0.1)"}`,
            color: showForm ? CYN : TXT_MUT,
            borderRadius:20, padding:"5px 14px", fontSize:11, fontWeight:800, cursor:"pointer",
          }}>{showForm ? "✕ Cancelar" : "+ Novo"}</button>
        </div>

        {showForm && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>

            {/* Modo propor / forçar */}
            <div style={{ display:"flex", gap:8 }}>
              {[
                { id:"forcar", label:"📅 Forçar", desc:"Entra no calendário" },
                { id:"propor", label:"📩 Propor",  desc:"Jovem aceita ou recusa" },
              ].map(m => (
                <button key={m.id} onClick={() => setModo(m.id)} style={{
                  flex:1, padding:"9px 6px", borderRadius:11, cursor:"pointer",
                  border: modo === m.id ? `1.5px solid ${m.id === "forcar" ? GRN : CYN}` : "1.5px solid rgba(255,255,255,0.08)",
                  background: modo === m.id ? `${m.id === "forcar" ? GRN : CYN}15` : "rgba(255,255,255,0.03)",
                  color: modo === m.id ? (m.id === "forcar" ? GRN : CYN) : "#64748b",
                  fontWeight:800, fontSize:11, textAlign:"center",
                }}>
                  <div>{m.label}</div>
                  <div style={{ fontSize:9, fontWeight:600, marginTop:2, opacity:0.75 }}>{m.desc}</div>
                </button>
              ))}
            </div>

            <input value={titulo} onChange={e => setTitulo(e.target.value)}
              placeholder="Título do evento..." style={{ ...INP, marginBottom:0 }} />
            <div style={{ display:"flex", gap:8 }}>
              <input type="date" value={data} onChange={e => setData(e.target.value)}
                style={{ ...INP, flex:1, marginBottom:0 }} />
              <input type="time" value={hora} onChange={e => setHora(e.target.value)}
                style={{ ...INP, flex:1, marginBottom:0 }} />
            </div>

            {/* Tipo de evento */}
            <div>
              <div style={{ fontSize:10, color:TXT_MUT, fontWeight:800, marginBottom:6, textTransform:"uppercase", letterSpacing:0.8 }}>Tipo</div>
              <div style={{ display:"flex", gap:6 }}>
                {TIPOS.map(t => {
                  const cor = EVT_COLORS[t.id];
                  return (
                    <button key={t.id} onClick={() => setTipo(t.id)} style={{
                      flex:1, padding:"8px 4px", borderRadius:10, cursor:"pointer",
                      border: tipo === t.id ? `1.5px solid ${cor}` : "1.5px solid rgba(255,255,255,0.08)",
                      background: tipo === t.id ? `${cor}18` : "rgba(255,255,255,0.03)",
                      color: tipo === t.id ? cor : "#64748b",
                      fontWeight:800, fontSize:11, textAlign:"center",
                    }}>
                      <div style={{ fontSize:16, marginBottom:2 }}>{t.icon}</div>
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Destinatário */}
            <div>
              <div style={{ fontSize:10, color:TXT_MUT, fontWeight:800, marginBottom:6, textTransform:"uppercase", letterSpacing:0.8 }}>Para quem</div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {[{ name:"Todos", username:"all", color:CYN }, ...JEEP_LIST].map(j => (
                  <button key={j.username} onClick={() => setDest(j.username)} style={{
                    padding:"6px 14px", borderRadius:20, fontSize:11, fontWeight:700, cursor:"pointer",
                    border: dest === j.username ? `1px solid ${j.color}` : "1px solid rgba(255,255,255,0.1)",
                    background: dest === j.username ? `${j.color}20` : "rgba(255,255,255,0.04)",
                    color: dest === j.username ? j.color : "#94a3b8",
                  }}>{j.name}</button>
                ))}
              </div>
            </div>

            <button onClick={criarEvento} style={{
              background: modo === "forcar" ? GRN : CYN, border:"none", borderRadius:12, padding:"11px",
              fontWeight:900, cursor:"pointer", color:"#071529", fontSize:13,
            }}>
              {modo === "forcar" ? "AGENDAR" : "ENVIAR PROPOSTA"}
            </button>
          </div>
        )}
      </div>

      {/* PRÓXIMOS EVENTOS */}
      <div style={CARD}>
        <div style={SL}>📋 Próximos ({futuros.length})</div>
        {futuros.length === 0
          ? <div style={{ textAlign:"center", color:"#475569", fontSize:12, padding:"12px 0" }}>Sem eventos futuros.</div>
          : futuros.map(ev => <EventRow key={ev.id} ev={ev} />)
        }
      </div>

      {passados.length > 0 && (
        <div style={CARD}>
          <div style={SL}>🗓 Passados ({passados.length})</div>
          {passados.slice().reverse().map(ev => <EventRow key={ev.id} ev={ev} />)}
        </div>
      )}
    </div>
  );
}
