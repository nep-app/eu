import React, { useState, useContext } from 'react';
import { addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, BLUE, INP, TXT_MUT } from "../../theme.jsx";
import { EVT_COLORS, EVT_ICONS } from "../../data.js";
import { ThemeCtx } from "../../JovensApp.jsx";

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function groupLabel(dateStr) {
  const hoje = toDateStr(new Date());
  const amanha = toDateStr(new Date(Date.now() + 86400000));
  const em7 = toDateStr(new Date(Date.now() + 7*86400000));
  if (dateStr === hoje)   return "Hoje";
  if (dateStr === amanha) return "Amanhã";
  if (dateStr <= em7)     return "Esta semana";
  return "Mais tarde";
}

function fmtDatePtShort(str) {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${parseInt(d)} ${MESES[parseInt(m)-1]}`;
}

export default function HomeAgenda({ user, data }) {
  const light = useContext(ThemeCtx);
  const hoje = toDateStr(new Date());
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaData,   setNovaData]   = useState(hoje);
  const [novaHora,   setNovaHora]   = useState("");
  const [partilhar,  setPartilhar]  = useState(false);
  const [showForm,   setShowForm]   = useState(false);
  const [editId,     setEditId]     = useState(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editData,   setEditData]   = useState("");
  const [editHora,   setEditHora]   = useState("");

  const meusEventos = (data.events || [])
    .filter(ev => ev.userId === user.username || ev.userId === "all")
    .filter(ev => ev.accepted !== false) // propostas ficam em HomeTodo até serem aceites
    .filter(ev => ev.date >= hoje)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time||"").localeCompare(b.time||""));

  // Group by label
  const groups = [];
  const seen = {};
  meusEventos.forEach(ev => {
    const lbl = groupLabel(ev.date);
    if (!seen[lbl]) { seen[lbl] = true; groups.push({ label: lbl, events: [] }); }
    groups[groups.length - 1].events.push(ev);
  });

  async function criarEvento() {
    if (!novoTitulo.trim()) return alert("Preenche o título.");
    await addDoc(collection(db, "events"), {
      title: novoTitulo, date: novaData, time: novaHora,
      userId: user.username, type: "personal",
      shared: partilhar, ts: Date.now()
    });
    if (partilhar) {
      await addDoc(collection(db, "adminNotificacoes"), {
        tipo: "EVENTO_PARTILHADO", jovem: user.username,
        texto: novoTitulo.substring(0, 60), ts: Date.now(), lida: false,
      });
    }
    setNovoTitulo(""); setNovaHora(""); setPartilhar(false); setShowForm(false);
  }

  async function removerEvento(id) {
    if (window.confirm("Remover este evento?")) await deleteDoc(doc(db, "events", id));
  }

  async function guardarEdicao(id) {
    if (!editTitulo.trim()) return;
    await updateDoc(doc(db, "events", id), { title: editTitulo, date: editData, time: editHora });
    setEditId(null);
  }

  return (
    <div style={CARD}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={SL}>📅 Agenda</div>
        <button onClick={() => setShowForm(!showForm)} style={{
          background: showForm ? "rgba(50,199,255,0.12)" : "rgba(255,255,255,0.06)",
          border: showForm ? `1px solid ${CYN}40` : "1px solid rgba(255,255,255,0.1)",
          color: showForm ? CYN : TXT_MUT,
          borderRadius:20, padding:"5px 14px", fontSize:11, fontWeight:800, cursor:"pointer",
        }}>
          {showForm ? "✕ Cancelar" : "+ Adicionar"}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div style={{ background:"rgba(0,0,0,0.18)", borderRadius:14, padding:14, marginBottom:14 }} className="fade-up">
          <input value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)}
            placeholder="Título do evento..."
            style={{ ...INP, marginBottom:8, padding:"10px 14px", fontSize:13 }} />
          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
            <input type="date" value={novaData} onChange={e => setNovaData(e.target.value)}
              style={{ ...INP, flex:1, marginBottom:0, padding:"10px 14px", fontSize:13 }} />
            <input type="time" value={novaHora} onChange={e => setNovaHora(e.target.value)}
              style={{ ...INP, flex:1, marginBottom:0, padding:"10px 14px", fontSize:13 }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:TXT_MUT, cursor:"pointer" }}>
              <input type="checkbox" checked={partilhar} onChange={e=>setPartilhar(e.target.checked)} style={{ accentColor:CYN }} />
              Partilhar com a Teresa
            </label>
            <button onClick={criarEvento} style={{
              background:CYN, border:"none", borderRadius:12, padding:"8px 20px",
              fontWeight:900, cursor:"pointer", color:"#071529", fontSize:12,
            }}>AGENDAR</button>
          </div>
        </div>
      )}

      {/* Lista de eventos agrupada */}
      {groups.length === 0 ? (
        <div style={{ textAlign:"center", color:TXT_MUT, fontSize:12, padding:"16px 0" }}>
          Sem eventos próximos.
        </div>
      ) : (
        groups.map(g => (
          <div key={g.label} style={{ marginBottom:14 }}>
            <div style={{ fontSize:10, fontWeight:900, letterSpacing:1.5, textTransform:"uppercase",
              color: g.label === "Hoje" ? CYN : TXT_MUT, marginBottom:8 }}>
              {g.label}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {g.events.map(ev => {
                const cor = EVT_COLORS[ev.type] || CYN;
                const icone = EVT_ICONS[ev.type] || "📌";
                return (
                  <div key={ev.id} style={{
                    padding:"11px 14px", borderRadius:14, background:"rgba(0,0,0,0.18)",
                    borderLeft:`3px solid ${cor}`,
                  }}>
                    {editId === ev.id ? (
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        <input value={editTitulo} onChange={e => setEditTitulo(e.target.value)}
                          placeholder="Título do evento..."
                          style={{ ...INP, marginBottom:0, padding:"8px 12px", fontSize:13 }} />
                        <div style={{ display:"flex", gap:8 }}>
                          <input type="date" value={editData} onChange={e => setEditData(e.target.value)}
                            style={{ ...INP, flex:1, marginBottom:0, padding:"8px 12px", fontSize:13 }} />
                          <input type="time" value={editHora} onChange={e => setEditHora(e.target.value)}
                            style={{ ...INP, flex:1, marginBottom:0, padding:"8px 12px", fontSize:13 }} />
                        </div>
                        <div style={{ display:"flex", gap:8 }}>
                          <button onClick={() => guardarEdicao(ev.id)} style={{ background:"rgba(50,199,255,0.15)", border:"1px solid rgba(50,199,255,0.3)", color:CYN, borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:800, cursor:"pointer" }}>✓ Guardar</button>
                          <button onClick={() => setEditId(null)} style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", color:"#64748b", borderRadius:8, padding:"6px 12px", fontSize:12, cursor:"pointer" }}>✕ Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <span style={{ fontSize:16, flexShrink:0 }}>{icone}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:800, color:"#f1f5f9" }}>{ev.title}</div>
                          <div style={{ fontSize:11, color:cor, fontWeight:700, marginTop:2 }}>
                            {fmtDatePtShort(ev.date)}{ev.time ? ` · ${ev.time}` : ""}
                            {ev.userId === "all" && <span style={{ color:"#475569" }}> · Geral</span>}
                          </div>
                        </div>
                        {ev.userId === user.username && (
                          <>
                            <button onClick={() => { setEditId(ev.id); setEditTitulo(ev.title); setEditData(ev.date); setEditHora(ev.time || ""); }} style={{ background:"none", border:"none", color:"#64748b", fontSize:13, cursor:"pointer", padding:"2px 4px" }}>✏️</button>
                            <button onClick={() => removerEvento(ev.id)} style={{
                              background:"none", border:"none", color:"#475569", fontSize:13,
                              cursor:"pointer", opacity:0.6, padding:0,
                            }}>✕</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
