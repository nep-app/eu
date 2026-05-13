import React, { useState } from 'react';
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, PNK, CYN, INP } from "../../theme.jsx";
import { fmtDate, EVT_COLORS, EVT_ICONS } from "../../data.js";

export default function HomeAgenda({ user, data }) {
  const [novoEventoTitulo, setNovoEventoTitulo] = useState("");
  const [novoEventoData, setNovoEventoData] = useState("");
  const [partilharEventoCheck, setPartilharEventoCheck] = useState(false);

  const listaEventos = data.events || [];

  async function criarNovoEvento() {
    if (!novoEventoTitulo.trim() || !novoEventoData) return alert("Preenche título e data.");
    try {
      await addDoc(collection(db, "events"), {
        title: novoEventoTitulo, date: novoEventoData, userId: user.username, type: "visit", shared: partilharEventoCheck, ts: Date.now()
      });
      setNovoEventoTitulo(""); setNovoEventoData(""); setPartilharEventoCheck(false);
    } catch (erro) { console.error(erro); }
  }

  async function removerEvento(idEvento) {
    if (window.confirm("Queres remover este evento?")) {
      await deleteDoc(doc(db, "events", idEvento));
    }
  }

  return (
    <div style={CARD}>
      <div style={SL}>📅 A Minha Agenda</div>
      <div style={{ marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "15px" }}>
        <input value={novoEventoTitulo} onChange={e => setNovoEventoTitulo(e.target.value)} style={INP} placeholder="Ex: Visita de acompanhamento..." />
        <input type="date" value={novoEventoData} onChange={e => setNovoEventoData(e.target.value)} style={{ ...INP, marginBottom: 0 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#94a3b8", cursor: "pointer" }}>
            <input type="checkbox" checked={partilharEventoCheck} onChange={e => setPartilharEventoCheck(e.target.checked)} style={{ accentColor: PNK }} />
            Partilhar com Coordenação
          </label>
          <button onClick={criarNovoEvento} style={{ background: PNK, border: "none", borderRadius: 18, padding: "8px 20px", fontWeight: 900, cursor: "pointer", color: "#070b14", marginLeft: "auto" }}>CRIAR</button>
        </div>
      </div>

      {listaEventos.filter(ev => ev.userId === user.username || ev.userId === "all").length === 0 ? (
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "15px 0" }}>A tua agenda pessoal está vazia.</div>
      ) : (
        listaEventos.filter(ev => ev.userId === user.username || ev.userId === "all")
          .sort((a,b) => new Date(a.date) - new Date(b.date))
          .map(evento => (
            <div key={evento.id} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12, background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: 18 }}>
              <div style={{ width: 44, height: 44, background: `${EVT_COLORS[evento.type] || CYN}25`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                {EVT_ICONS[evento.type] || "📌"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
                  {evento.title} {evento.shared && <span style={{ fontSize: 9, background: PNK, color: "#fff", padding: "2px 5px", borderRadius: 4, marginLeft: 8, verticalAlign: "middle" }}>PARTILHADO</span>}
                </div>
                <div style={{ fontSize: 12, color: CYN, fontWeight: 800, marginTop: 2 }}>{fmtDate(evento.date)}</div>
              </div>
              <button onClick={() => removerEvento(evento.id)} style={{ background: "none", border: "none", color: "#f43f5e", fontSize: 18, cursor: "pointer", opacity: 0.6 }}>✕</button>
            </div>
          ))
      )}
    </div>
  );
}
