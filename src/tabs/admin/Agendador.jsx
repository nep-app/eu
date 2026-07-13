import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CYN, PRP, INP } from "../../theme.jsx";

// Timestamp a partir de data (YYYY-MM-DD) + hora ("09:00"), em hora local.
export function publishAtDe(dataStr, slot) {
  const [y, m, d]  = dataStr.split("-").map(Number);
  const [hh, mm]   = slot.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0).getTime();
}

// Controlo reutilizável de agendamento: toggle "agendar para depois" +
// data/hora, botão que alterna entre "publicar já" e "agendar", e a lista
// dos agendados pendentes deste tipo (com cancelar).
//
// props:
//  - tipo: "mensagem" | "pedido" | "forum" | ...
//  - construirPayload: () => payload | null  (devolve null se inválido, mostrando o próprio alerta)
//  - publicarJa: () => void                  (ação imediata, quando não está a agendar)
//  - rotuloJa: string                        (texto do botão quando publica já)
//  - rotuloItem: (payload) => string         (como mostrar cada agendado na lista)
//  - onAgendado?: () => void                 (limpar o formulário após agendar)
export default function Agendador({ tipo, construirPayload, publicarJa, rotuloJa, rotuloItem, onAgendado }) {
  const [agendar, setAgendar] = useState(false);
  const [agData, setAgData]   = useState("");
  const [agSlot, setAgSlot]   = useState("09:00");
  const [pend, setPend]       = useState([]);
  const [editId, setEditId]     = useState(null);   // id do agendamento a reagendar
  const [editData, setEditData] = useState("");
  const [editSlot, setEditSlot] = useState("09:00");

  useEffect(() => {
    return onSnapshot(collection(db, "agendados"), snap => {
      setPend(snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .filter(a => a.tipo === tipo && !a.done)
        .sort((a, b) => (a.publishAt || 0) - (b.publishAt || 0)));
    });
  }, [tipo]);

  async function agendarAgora() {
    const payload = construirPayload();
    if (!payload) return; // construirPayload já mostrou o alerta
    if (!agData) return alert("Escolhe a data para agendar!");
    const publishAt = publishAtDe(agData, agSlot);
    if (publishAt <= Date.now()) return alert("Essa data/hora já passou. Escolhe uma altura no futuro.");
    await addDoc(collection(db, "agendados"), {
      tipo, payload, publishAt, slot: agSlot, dataLabel: agData,
      done: false, criadoEm: Date.now(), criadoPor: "admin",
    });
    alert(`Agendado para ${agData} às ${agSlot}! ⏰`);
    setAgendar(false); setAgData("");
    onAgendado && onAgendado();
  }

  async function cancelar(id) {
    if (!window.confirm("Cancelar este agendamento?")) return;
    await deleteDoc(doc(db, "agendados", id));
  }

  function abrirEdicao(a) {
    setEditId(a.id);
    setEditData(a.dataLabel || "");
    setEditSlot(a.slot || "09:00");
  }

  async function guardarReagendamento(id) {
    if (!editData) return alert("Escolhe a nova data!");
    const publishAt = publishAtDe(editData, editSlot);
    if (publishAt <= Date.now()) return alert("Essa data/hora já passou. Escolhe uma altura no futuro.");
    await updateDoc(doc(db, "agendados", id), {
      publishAt, slot: editSlot, dataLabel: editData,
    });
    setEditId(null);
  }

  return (
    <>
      <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#94a3b8", cursor:"pointer", marginBottom: agendar ? 10 : 12 }}>
        <input type="checkbox" checked={agendar} onChange={() => setAgendar(v => !v)}
          style={{ accentColor:CYN, width:14, height:14 }} />
        ⏰ Agendar para depois (em vez de enviar já)
      </label>
      {agendar && (
        <div style={{ display:"flex", gap:8, marginBottom:12 }}>
          <input type="date" value={agData} onChange={e => setAgData(e.target.value)}
            style={{ ...INP, flex:1, marginBottom:0, fontSize:12, padding:"8px 12px" }} />
          <select value={agSlot} onChange={e => setAgSlot(e.target.value)}
            style={{ padding:"8px 12px", borderRadius:12, background:"rgba(0,0,0,0.3)", color:"white", border:"1px solid rgba(255,255,255,0.1)", fontSize:12 }}>
            <option value="09:00">09:00</option>
            <option value="13:00">13:00</option>
            <option value="18:00">18:00</option>
            <option value="20:00">20:00</option>
          </select>
        </div>
      )}
      <button onClick={agendar ? agendarAgora : publicarJa} style={{
        width:"100%", padding:"13px 20px", fontSize:13, fontWeight:800,
        background: agendar ? PRP : CYN, color: agendar ? "#fff" : "#0f172a",
        border:"none", borderRadius:14, cursor:"pointer",
      }}>{agendar ? "⏰ Agendar" : rotuloJa}</button>

      {pend.length > 0 && (
        <div style={{ marginTop:14, borderTop:"1px solid rgba(255,255,255,0.1)", paddingTop:12 }}>
          <div style={{ fontSize:11, color:PRP, fontWeight:800, marginBottom:8 }}>⏰ AGENDADOS</div>
          {pend.map(a => (
            <div key={a.id} style={{ background:"rgba(123,92,255,0.08)", border:"1px solid rgba(123,92,255,0.2)", borderRadius:10, padding:"8px 12px", marginBottom:6 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, color:"#e2e8f0", fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{rotuloItem ? rotuloItem(a.payload) : ""}</div>
                  <div style={{ fontSize:11, color:PRP, fontWeight:800 }}>{a.dataLabel} às {a.slot}{a.payload?.push ? " · 🔔 push" : ""}</div>
                </div>
                <button onClick={() => editId === a.id ? setEditId(null) : abrirEdicao(a)}
                  style={{ background:"none", border:`1px solid ${CYN}`, color:CYN, borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:800, cursor:"pointer", flexShrink:0 }}>
                  {editId === a.id ? "Fechar" : "Reagendar"}
                </button>
                <button onClick={() => cancelar(a.id)}
                  style={{ background:"none", border:"1px solid #f43f5e", color:"#f43f5e", borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:800, cursor:"pointer", flexShrink:0 }}>
                  Cancelar
                </button>
              </div>
              {editId === a.id && (
                <div style={{ display:"flex", gap:8, marginTop:8 }}>
                  <input type="date" value={editData} onChange={e => setEditData(e.target.value)}
                    style={{ ...INP, flex:1, marginBottom:0, fontSize:12, padding:"8px 12px" }} />
                  <select value={editSlot} onChange={e => setEditSlot(e.target.value)}
                    style={{ padding:"8px 12px", borderRadius:12, background:"rgba(0,0,0,0.3)", color:"white", border:"1px solid rgba(255,255,255,0.1)", fontSize:12 }}>
                    <option value="09:00">09:00</option>
                    <option value="13:00">13:00</option>
                    <option value="18:00">18:00</option>
                    <option value="20:00">20:00</option>
                  </select>
                  <button onClick={() => guardarReagendamento(a.id)}
                    style={{ background:PRP, color:"#fff", border:"none", borderRadius:10, padding:"0 14px", fontSize:12, fontWeight:800, cursor:"pointer" }}>
                    Guardar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
