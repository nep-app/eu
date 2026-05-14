import React, { useState } from 'react';
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, BLUE, INP, TXT_MUT } from "../../theme.jsx";
import { fmtDate, EVT_COLORS, EVT_ICONS } from "../../data.js";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const DIAS_SEMANA = ["S","T","Q","Q","S","S","D"];

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function HomeAgenda({ user, data }) {
  const hoje = new Date();
  const hojeStr = toDateStr(hoje);

  const [viewMonth, setViewMonth]   = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(hojeStr);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaHora, setNovaHora]     = useState("");
  const [partilhar, setPartilhar]   = useState(false);
  const [showForm, setShowForm]     = useState(false);

  const listaEventos = data.events || [];
  const meusEventos  = listaEventos.filter(ev => ev.userId === user.username || ev.userId === "all");

  const eventsByDate = {};
  meusEventos.forEach(ev => {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  });

  const yr = viewMonth.getFullYear();
  const mo = viewMonth.getMonth();

  function getGridDays() {
    const first = new Date(yr, mo, 1);
    const last  = new Date(yr, mo + 1, 0);
    const startDow = (first.getDay() + 6) % 7; // Mon=0 … Sun=6
    const days = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(yr, mo, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }

  const gridDays = getGridDays();

  async function criarEvento() {
    if (!novoTitulo.trim()) return alert("Preenche o título.");
    await addDoc(collection(db, "events"), {
      title: novoTitulo, date: selectedDate, time: novaHora,
      userId: user.username, type: "personal",
      shared: partilhar, ts: Date.now()
    });
    setNovoTitulo(""); setNovaHora(""); setPartilhar(false); setShowForm(false);
  }

  async function removerEvento(id) {
    if (window.confirm("Remover este evento?")) await deleteDoc(doc(db, "events", id));
  }

  const eventosSelected = (eventsByDate[selectedDate] || [])
    .sort((a, b) => (a.time||"24:00").localeCompare(b.time||"24:00"));

  const selectedLabel = selectedDate === hojeStr
    ? "Hoje"
    : fmtDate(selectedDate);

  return (
    <div style={CARD}>
      <div style={SL}>📅 A Minha Agenda</div>

      {/* ── CABEÇALHO DO MÊS ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <button onClick={() => setViewMonth(new Date(yr, mo-1, 1))} style={{
          background:"none", border:"none", color:TXT_MUT, fontSize:20, cursor:"pointer", padding:"0 8px", lineHeight:1
        }}>‹</button>
        <span style={{ fontWeight:900, fontSize:14, color:"#f1f5f9" }}>{MESES[mo]} {yr}</span>
        <button onClick={() => setViewMonth(new Date(yr, mo+1, 1))} style={{
          background:"none", border:"none", color:TXT_MUT, fontSize:20, cursor:"pointer", padding:"0 8px", lineHeight:1
        }}>›</button>
      </div>

      {/* ── CABEÇALHO DIAS DA SEMANA ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:6 }}>
        {DIAS_SEMANA.map((d,i) => (
          <div key={i} style={{ textAlign:"center", fontSize:9, fontWeight:800, color:"#475569", padding:"2px 0" }}>{d}</div>
        ))}
      </div>

      {/* ── GRELHA DIAS ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:18 }}>
        {gridDays.map((day, i) => {
          if (!day) return <div key={i} />;
          const ds = toDateStr(day);
          const isToday    = ds === hojeStr;
          const isSelected = ds === selectedDate;
          const evts = eventsByDate[ds] || [];
          return (
            <button key={i} onClick={() => setSelectedDate(ds)} style={{
              display:"flex", flexDirection:"column", alignItems:"center", gap:3,
              padding:"7px 2px", borderRadius:10, border:"none", cursor:"pointer",
              background: isSelected ? CYN : isToday ? `${CYN}22` : "transparent",
              color: isSelected ? "#0f172a" : isToday ? CYN : "#cbd5e1",
              fontWeight: isToday || isSelected ? 900 : 500,
              fontSize:13, transition:"all 0.15s",
            }}>
              {day.getDate()}
              {evts.length > 0 && (
                <div style={{ display:"flex", gap:2, justifyContent:"center" }}>
                  {evts.slice(0,3).map((ev,j) => (
                    <span key={j} style={{
                      width:4, height:4, borderRadius:"50%",
                      background: isSelected ? "rgba(0,0,0,0.4)" : (EVT_COLORS[ev.type] || CYN),
                      display:"block",
                    }}/>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ── DIA SELECIONADO ── */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <span style={{ fontSize:12, fontWeight:900, color: selectedDate === hojeStr ? CYN : "#f1f5f9" }}>
            {selectedLabel}
          </span>
          <button onClick={() => setShowForm(!showForm)} style={{
            background: showForm ? "rgba(50,199,255,0.12)" : "rgba(255,255,255,0.06)",
            border: showForm ? `1px solid ${CYN}40` : "1px solid rgba(255,255,255,0.1)",
            color: showForm ? CYN : TXT_MUT,
            borderRadius:20, padding:"5px 14px", fontSize:11, fontWeight:800, cursor:"pointer",
          }}>
            {showForm ? "✕ Cancelar" : "+ Adicionar"}
          </button>
        </div>

        {/* Formulário rápido */}
        {showForm && (
          <div style={{ background:"rgba(0,0,0,0.15)", borderRadius:14, padding:14, marginBottom:14 }} className="fade-up">
            <input value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)}
              placeholder="Título do evento..."
              style={{ ...INP, marginBottom:8, padding:"10px 14px", fontSize:13 }} />
            <input type="time" value={novaHora} onChange={e => setNovaHora(e.target.value)}
              style={{ ...INP, marginBottom:10, padding:"10px 14px", fontSize:13 }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:TXT_MUT, cursor:"pointer" }}>
                <input type="checkbox" checked={partilhar} onChange={e=>setPartilhar(e.target.checked)} style={{ accentColor:CYN }} />
                Partilhar com a Teresa
              </label>
              <button onClick={criarEvento} style={{
                background:CYN, border:"none", borderRadius:12, padding:"8px 20px",
                fontWeight:900, cursor:"pointer", color:"#0f172a", fontSize:12,
              }}>AGENDAR</button>
            </div>
          </div>
        )}

        {/* Eventos do dia selecionado */}
        {eventosSelected.length === 0 ? (
          <div style={{ textAlign:"center", color:"#475569", fontSize:12, padding:"16px 0" }}>
            Sem eventos {selectedDate === hojeStr ? "hoje" : "neste dia"}.
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {eventosSelected.map(ev => {
              const cor = EVT_COLORS[ev.type] || CYN;
              const icone = EVT_ICONS[ev.type] || "📌";
              return (
                <div key={ev.id} style={{
                  display:"flex", alignItems:"center", gap:12, padding:"11px 14px",
                  borderRadius:14, background:"rgba(0,0,0,0.15)",
                  borderLeft:`3px solid ${cor}`,
                }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{icone}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:800, color:"#f1f5f9" }}>{ev.title}</div>
                    <div style={{ fontSize:11, color:cor, fontWeight:700, marginTop:2 }}>
                      {ev.time ? `🕒 ${ev.time}` : "O dia todo"}
                      {ev.userId === "all" && <span style={{ color:"#475569" }}> · Evento geral</span>}
                    </div>
                  </div>
                  {ev.userId === user.username && (
                    <button onClick={() => removerEvento(ev.id)} style={{
                      background:"none", border:"none", color:"#475569", fontSize:14,
                      cursor:"pointer", opacity:0.6, padding:0,
                    }}>✕</button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
