import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, PNK, INP, Btn } from "../../theme.jsx";

export default function AdminVotacoes() {
  const [polls, setPolls] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("texto"); // "texto" ou "data"
  const [opcoes, setOpcoes] = useState(["", ""]);

  // Ouvir as votações da base de dados
  useEffect(() => {
    return onSnapshot(collection(db, "polls"), snap => {
      setPolls(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.ts - a.ts));
    });
  }, []);

  async function criarVotacao() {
    if (!titulo.trim()) return alert("Dá um título à votação!");
    const opcoesValidas = opcoes.filter(o => o.trim() !== "");
    if (opcoesValidas.length < 2) return alert("Precisas de pelo menos 2 opções!");

    // Preparar o objeto de votos (começam todos a zeros)
    let votosIniciais = {};
    opcoesValidas.forEach(op => votosIniciais[op] = []);

    await addDoc(collection(db, "polls"), {
      title: titulo,
      type: tipo,
      options: opcoesValidas,
      votes: votosIniciais,
      active: true,
      ts: Date.now()
    });

    setTitulo(""); setOpcoes(["", ""]);
    alert("Votação lançada com sucesso! 🚀");
  }

  async function apagarVotacao(id) {
    if (window.confirm("Queres apagar esta votação definitivamente?")) {
      await deleteDoc(doc(db, "polls", id));
    }
  }

  async function fecharVotacao(id, estadoAtual) {
    await updateDoc(doc(db, "polls", id), { active: !estadoAtual });
  }

  return (
    <div>
      <div style={CARD}>
        <div style={SL}>Criar Nova Votação / Doodle</div>
        
        <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Que dia fazemos o acampamento?" style={INP} />
        
        <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
          <select value={tipo} onChange={e => setTipo(e.target.value)} style={{ ...INP, marginBottom: 0, flex: 1 }}>
            <option value="texto">Opções Normais (Atividades, Comida...)</option>
            <option value="data">Datas / Horários (Estilo Doodle)</option>
          </select>
        </div>

        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8, fontWeight: 800 }}>OPÇÕES DE ESCOLHA:</div>
        {opcoes.map((op, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input 
              type={tipo === "data" ? "date" : "text"} 
              value={op} 
              onChange={e => {
                const novas = [...opcoes];
                novas[idx] = e.target.value;
                setOpcoes(novas);
              }} 
              placeholder={`Opção ${idx + 1}`} 
              style={{ ...INP, marginBottom: 0, flex: 1 }} 
            />
            {idx >= 2 && (
              <button onClick={() => setOpcoes(opcoes.filter((_, i) => i !== idx))} style={{ background: "none", border: "none", color: "#fb7185", cursor: "pointer", fontWeight: 900 }}>✕</button>
            )}
          </div>
        ))}
        
        <button onClick={() => setOpcoes([...opcoes, ""])} style={{ background: "transparent", border: `1px dashed ${CYN}`, color: CYN, padding: "8px 12px", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer", width: "100%", marginBottom: 15 }}>
          + ADICIONAR OPÇÃO
        </button>

        <Btn onClick={criarVotacao}>LANÇAR VOTAÇÃO 🗳️</Btn>
      </div>

      <div style={{ ...SL, marginTop: 30, marginBottom: 15 }}>Resultados das Votações</div>
      {polls.map(poll => (
        <div key={poll.id} style={{ ...CARD, borderLeft: poll.active ? `4px solid ${CYN}` : "4px solid #64748b", opacity: poll.active ? 1 : 0.6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 900 }}>{poll.title}</div>
              <div style={{ fontSize: 11, color: poll.active ? CYN : "#94a3b8", fontWeight: 800, marginTop: 4 }}>
                {poll.active ? "🟢 A DECORRER" : "🔴 ENCERRADA"} • {poll.type === "data" ? "Doodle de Datas" : "Escolha Múltipla"}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => fecharVotacao(poll.id, poll.active)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 12 }}>{poll.active ? "Fechar" : "Reabrir"}</button>
              <button onClick={() => apagarVotacao(poll.id)} style={{ background: "none", border: "none", color: "#fb7185", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {poll.options.map(op => {
              const votos = poll.votes[op] || [];
              return (
                <div key={op} style={{ background: "rgba(0,0,0,0.3)", padding: "10px 14px", borderRadius: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 13, color: "#e2e8f0" }}>
                    <span>{op}</span>
                    <span style={{ color: CYN }}>{votos.length} votos</span>
                  </div>
                  {votos.length > 0 && (
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
                      🙋‍♂️ {votos.join(", ")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
