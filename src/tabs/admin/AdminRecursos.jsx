import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, INP, PNK } from "../../theme.jsx";
import { nowFull, ALLOWED_USERNAMES } from "../../data.js";

export default function AdminRecursos() {
  const [recursos, setRecursos] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [icone, setIcone] = useState("📄");
  const [url, setUrl] = useState("");
  const [desc, setDesc] = useState("");
  const [notificar, setNotificar] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [editando, setEditando] = useState(null);
  const [editDraft, setEditDraft] = useState({});

  useEffect(() => {
    return onSnapshot(collection(db, "recursos"), snap =>
      setRecursos(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.ts || 0) - (a.ts || 0)))
    );
  }, []);

  async function adicionarRecurso() {
    if (!titulo.trim() || !url.trim()) return alert("Título e URL são obrigatórios.");
    setEnviando(true);
    try {
      await addDoc(collection(db, "recursos"), {
        titulo: titulo.trim(), icone: icone.trim() || "📄",
        url: url.trim(), desc: desc.trim(), ts: Date.now(), addedAt: nowFull()
      });
      if (notificar) {
        const preview = titulo.trim().substring(0, 60);
        await Promise.all(ALLOWED_USERNAMES.map(u =>
          addDoc(collection(db, "notifications", u, "items"), {
            from:"teresa", text:`📚 Novo recurso disponível: ${preview}`, date:nowFull(), read:false, tipo:"recurso", ts:Date.now()
          })
        ));
      }
      setTitulo(""); setUrl(""); setDesc(""); setIcone("📄");
      alert("Recurso adicionado!" + (notificar ? " Todos os jovens foram notificados." : ""));
    } catch (e) { alert("Erro: " + e.message); }
    setEnviando(false);
  }

  function abrirEdicao(r) {
    setEditDraft({ titulo: r.titulo, icone: r.icone || "📄", url: r.url, desc: r.desc || "" });
    setEditando(r.id);
  }

  async function guardarEdicao(id) {
    if (!editDraft.titulo?.trim() || !editDraft.url?.trim()) return alert("Título e URL são obrigatórios.");
    try {
      await updateDoc(doc(db, "recursos", id), {
        titulo: editDraft.titulo.trim(),
        icone: editDraft.icone.trim() || "📄",
        url: editDraft.url.trim(),
        desc: editDraft.desc.trim(),
      });
      setEditando(null);
    } catch (e) { alert("Erro: " + e.message); }
  }

  async function eliminarRecurso(id) {
    if (!window.confirm("Eliminar este recurso?")) return;
    await deleteDoc(doc(db, "recursos", id));
  }

  return (
    <div>
      {/* ADICIONAR */}
      <div style={{ ...CARD, border:`1.5px solid ${CYN}30` }}>
        <div style={SL}>📚 Adicionar Recurso</div>
        <div style={{ display:"flex", gap:8, marginBottom:0 }}>
          <input value={icone} onChange={e => setIcone(e.target.value)}
            placeholder="📄" maxLength={4}
            style={{ ...INP, width:60, flex:"none", textAlign:"center", fontSize:20, padding:"10px 8px" }} />
          <input value={titulo} onChange={e => setTitulo(e.target.value)}
            placeholder="Título do recurso" style={{ ...INP, flex:1 }} />
        </div>
        <input value={url} onChange={e => setUrl(e.target.value)}
          placeholder="URL (https://... ou nome-do-ficheiro.html)"
          style={{ ...INP }} />
        <input value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="Descrição curta (opcional)" style={{ ...INP }} />

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:4 }}>
          <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#94a3b8", cursor:"pointer" }}>
            <input type="checkbox" checked={notificar} onChange={() => setNotificar(!notificar)}
              style={{ accentColor:CYN, width:15, height:15 }} />
            Notificar todos os jovens
          </label>
          <button onClick={adicionarRecurso} disabled={enviando} style={{
            background:`${CYN}20`, border:`1.5px solid ${CYN}40`, color:CYN,
            borderRadius:12, padding:"10px 20px", fontWeight:900, fontSize:13, cursor:"pointer"
          }}>
            {enviando ? "A adicionar..." : "Adicionar"}
          </button>
        </div>
      </div>

      {/* LISTA */}
      {recursos.length === 0 ? (
        <div style={{ textAlign:"center", padding:"30px 20px", color:"#475569", fontSize:13 }}>
          Ainda não há recursos. Adiciona o primeiro acima.
        </div>
      ) : (
        recursos.map(r => (
          <div key={r.id} style={CARD}>
            {editando === r.id ? (
              <div>
                <div style={{ display:"flex", gap:8, marginBottom:0 }}>
                  <input value={editDraft.icone} onChange={e => setEditDraft(p => ({ ...p, icone: e.target.value }))}
                    maxLength={4} style={{ ...INP, width:60, flex:"none", textAlign:"center", fontSize:20, padding:"10px 8px" }} />
                  <input value={editDraft.titulo} onChange={e => setEditDraft(p => ({ ...p, titulo: e.target.value }))}
                    placeholder="Título" style={{ ...INP, flex:1 }} />
                </div>
                <input value={editDraft.url} onChange={e => setEditDraft(p => ({ ...p, url: e.target.value }))}
                  placeholder="URL" style={INP} />
                <input value={editDraft.desc} onChange={e => setEditDraft(p => ({ ...p, desc: e.target.value }))}
                  placeholder="Descrição (opcional)" style={INP} />
                <div style={{ display:"flex", gap:8, marginTop:4 }}>
                  <button onClick={() => guardarEdicao(r.id)} style={{
                    flex:1, padding:"10px", background:`${CYN}20`, border:`1.5px solid ${CYN}40`,
                    color:CYN, borderRadius:10, fontWeight:900, fontSize:13, cursor:"pointer"
                  }}>Guardar</button>
                  <button onClick={() => setEditando(null)} style={{
                    padding:"10px 16px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
                    color:"#94a3b8", borderRadius:10, fontSize:13, cursor:"pointer"
                  }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                <span style={{ fontSize:24, flexShrink:0 }}>{r.icone || "📄"}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:"#f1f5f9", marginBottom:2 }}>{r.titulo}</div>
                  {r.desc && <div style={{ fontSize:12, color:"#94a3b8", marginBottom:4 }}>{r.desc}</div>}
                  <div style={{ fontSize:11, color:`${CYN}90`, wordBreak:"break-all" }}>{r.url}</div>
                  <div style={{ fontSize:10, color:"#475569", marginTop:4 }}>{r.addedAt}</div>
                </div>
                <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                  <button onClick={() => abrirEdicao(r)} style={{
                    background:"rgba(255,255,255,0.06)", border:"none", color:"#94a3b8",
                    borderRadius:10, padding:"6px 10px", cursor:"pointer", fontSize:12
                  }}>✏️</button>
                  <button onClick={() => eliminarRecurso(r.id)} style={{
                    background:"rgba(244,63,94,0.10)", border:"none", color:PNK,
                    borderRadius:10, padding:"6px 10px", cursor:"pointer", fontSize:12
                  }}>🗑️</button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
