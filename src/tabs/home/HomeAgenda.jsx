import React, { useState } from 'react';
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, PNK, CYN, INP } from "../../theme.jsx";
import { fmtDate, EVT_COLORS, EVT_ICONS } from "../../data.js";

export default function HomeAgenda({ user, data }) {
  const [novoEventoTitulo, setNovoEventoTitulo] = useState("");
  const [novoEventoData, setNovoEventoData] = useState("");
  const [novoEventoHora, setNovoEventoHora] = useState(""); // NOVO: Campo de Hora
  const [partilharEventoCheck, setPartilharEventoCheck] = useState(false);

  const listaEventos = data.events || [];

  async function criarNovoEvento() {
    if (!novoEventoTitulo.trim() || !novoEventoData) return alert("Preenche o título e a data.");
    try {
      await addDoc(collection(db, "events"), {
        title: novoEventoTitulo, 
        date: novoEventoData, 
        time: novoEventoHora, // Guarda a hora
        userId: user.username, 
        type: "personal", // Define o ícone como pessoal
        shared: partilharEventoCheck, 
        ts: Date.now()
      });
      setNovoEventoTitulo(""); setNovoEventoData(""); setNovoEventoHora(""); setPartilharEventoCheck(false);
    } catch (erro) { console.error(erro); }
  }

  async function removerEvento(idEvento) {
    if (window.confirm("Queres remover este evento da tua agenda?")) {
      await deleteDoc(doc(db, "events", idEvento));
    }
  }

  // ── 1. FILTRAR E AGRUPAR EVENTOS POR DIA ──
  const meusEventos = listaEventos.filter(ev => ev.userId === user.username || ev.userId === "all");
  
  const eventosPorDia = {};
  meusEventos.forEach(ev => {
    if (!eventosPorDia[ev.date]) eventosPorDia[ev.date] = [];
    eventosPorDia[ev.date].push(ev);
  });

  // Ordenar as datas cronologicamente
  const datasOrdenadas = Object.keys(eventosPorDia).sort((a, b) => new Date(a) - new Date(b));

  // Função para saber qual é o dia de "Hoje" localmente (para dar destaque)
  const hoje = new Date();
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}-${String(hoje.getDate()).padStart(2,'0')}`;

  return (
    <div style={{ ...CARD, padding: "20px 15px" }}>
      <div style={SL}>📅 A Minha Agenda</div>
      
      {/* PAINEL DE CRIAÇÃO (Mais compacto e com Horas) */}
      <div style={{ marginBottom: "25px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "20px" }}>
        <input value={novoEventoTitulo} onChange={e => setNovoEventoTitulo(e.target.value)} style={INP} placeholder="Ex: Reunião com a equipa..." />
        
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <input type="date" value={novoEventoData} onChange={e => setNovoEventoData(e.target.value)} style={{ ...INP, marginBottom: 0, flex: 2 }} />
          <input type="time" value={novoEventoHora} onChange={e => setNovoEventoHora(e.target.value)} style={{ ...INP, marginBottom: 0, flex: 1 }} />
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 15 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8", cursor: "pointer" }}>
            <input type="checkbox" checked={partilharEventoCheck} onChange={e => setPartilharEventoCheck(e.target.checked)} style={{ accentColor: PNK }} />
            Partilhar com a Teresa
          </label>
          <button onClick={criarNovoEvento} style={{ background: PNK, border: "none", borderRadius: 18, padding: "8px 20px", fontWeight: 900, cursor: "pointer", color: "#070b14", marginLeft: "auto" }}>AGENDAR</button>
        </div>
      </div>

      {/* TIMELINE DE EVENTOS AGRUPADOS */}
      {datasOrdenadas.length === 0 ? (
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "20px 0" }}>A tua agenda pessoal está vazia.</div>
      ) : (
        datasOrdenadas.map(dataStr => {
          // Ordenar eventos dentro do mesmo dia pela Hora
          const eventosDoDia = eventosPorDia[dataStr].sort((a,b) => (a.time || "24:00").localeCompare(b.time || "24:00"));
          const isToday = dataStr === hojeStr;

          return (
            <div key={dataStr} style={{ marginBottom: 25 }}>
              
              {/* CABEÇALHO DO DIA */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15 }}>
                <div style={{ 
                  background: isToday ? PNK : "rgba(255,255,255,0.05)", 
                  color: isToday ? "#000" : "#fff", 
                  padding: "6px 14px", borderRadius: 14, fontWeight: 900, fontSize: 12,
                  boxShadow: isToday ? `0 0 10px ${PNK}40` : "none"
                }}>
                  {isToday ? "HOJE" : fmtDate(dataStr).toUpperCase()}
                </div>
                <div style={{ flex: 1, height: 1, background: isToday ? `${PNK}50` : "rgba(255,255,255,0.05)" }} />
              </div>

              {/* LISTA DE EVENTOS COM LINHA VERTICAL (TIMELINE) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
                {/* A linha que une as bolas */}
                <div style={{ position: "absolute", left: 21, top: 10, bottom: 10, width: 2, background: "rgba(255,255,255,0.05)", zIndex: 0 }} />
                
                {eventosDoDia.map(evento => {
                  const corBase = EVT_COLORS[evento.type] || PNK;
                  const icone = EVT_ICONS[evento.type] || "📌";

                  return (
                    <div key={evento.id} style={{ display: "flex", alignItems: "flex-start", gap: 15, position: "relative", zIndex: 1 }}>
                      
                      {/* BOLA DO ÍCONE */}
                      <div style={{ 
                        width: 44, height: 44, background: `${corBase}20`, borderRadius: "50%", 
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, 
                        border: `2px solid ${corBase}`, flexShrink: 0 
                      }}>
                        {icone}
                      </div>
                      
                      {/* CARTÃO DO EVENTO */}
                      <div style={{ flex: 1, background: "rgba(0,0,0,0.2)", padding: "12px 16px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                              {evento.title} {evento.shared && <span style={{ fontSize: 9, background: PNK, color: "#fff", padding: "2px 5px", borderRadius: 4, marginLeft: 6, verticalAlign: "middle" }}>PARTILHADO</span>}
                            </div>
                            <div style={{ fontSize: 12, color: corBase, fontWeight: 800, marginTop: 4 }}>
                               {evento.time ? `🕒 ${evento.time}` : "🕒 O dia todo"} 
                               {evento.userId === "all" && <span style={{ color: "#94a3b8" }}> • 🏢 Geral</span>}
                            </div>
                          </div>
                          
                          {/* BOTÃO APAGAR (Só para os eventos criados pelo próprio jovem) */}
                          {evento.userId === user.username && (
                            <button onClick={() => removerEvento(evento.id)} style={{ background: "none", border: "none", color: "#f43f5e", fontSize: 16, cursor: "pointer", opacity: 0.5, padding: "0 0 0 10px" }}>✕</button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
