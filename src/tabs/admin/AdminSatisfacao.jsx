import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase.js";
import { CARD, SL, CYN, PNK } from "../../theme.jsx";
import { SURVEY_CATS, scoreLabel } from "../../data.js";

export default function AdminSatisfacao() {
  const [respostas, setRespostas] = useState([]);
  const [stats, setStats] = useState({});

  // 1. Ouvir a coleção de satisfação em tempo real
  useEffect(() => {
    const q = query(collection(db, "satisfacao"), orderBy("ts", "desc"));
    return onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => d.data());
      setRespostas(docs);
      calcularEstatisticas(docs);
    });
  }, []);

  // 2. Lógica para calcular médias e reunir comentários
  function calcularEstatisticas(lista) {
    const s = {};
    
    // Inicializar estrutura para cada categoria do data.js
    SURVEY_CATS.forEach(cat => {
      s[cat.id] = { totalScore: 0, count: 0, comments: [], allChips: [] };
    });

    lista.forEach(resp => {
      resp.respostas.forEach(r => {
        if (s[r.catId]) {
          s[r.catId].totalScore += r.score;
          s[r.catId].count += 1;
          if (r.comment) s[r.catId].comments.push(r.comment);
          if (r.chips) s[r.catId].allChips.push(...r.chips);
        }
      });
    });

    setStats(s);
  }

  return (
    <div style={{ paddingBottom: 50 }}>
      <div style={SL}>Resultados de Satisfação (Anónimos)</div>
      
      {respostas.length === 0 ? (
        <div style={CARD}>Ainda não existem respostas submetidas.</div>
      ) : (
        SURVEY_CATS.map(cat => {
          const data = stats[cat.id] || { totalScore: 0, count: 0, comments: [], allChips: [] };
          const media = data.count > 0 ? (data.totalScore / data.count).toFixed(1) : 0;
          const [label, color] = scoreLabel(parseFloat(media));

          return (
            <div key={cat.id} style={CARD}>
              {/* CABEÇALHO DA CATEGORIA */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{cat.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{cat.label}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{data.count} respostas</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: color }}>{media}</div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8" }}>{label.toUpperCase()}</div>
                </div>
              </div>

              {/* BARRA DE PROGRESSO VISUAL */}
              <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, marginBottom: 20 }}>
                <div style={{ width: `${media * 10}%`, height: "100%", background: color, borderRadius: 3, transition: "0.5s" }} />
              </div>

              {/* CHIPS MAIS VOTADAS */}
              {data.allChips.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 15 }}>
                  {[...new Set(data.allChips)].map((chip, i) => (
                    <span key={i} style={{ fontSize: 10, background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 8, color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {chip}
                    </span>
                  ))}
                </div>
              )}

              {/* COMENTÁRIOS ADICIONAIS */}
              {data.comments.length > 0 && (
                <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: color, marginBottom: 8, opacity: 0.8 }}>COMENTÁRIOS:</div>
                  {data.comments.map((txt, i) => (
                    <div key={i} style={{ fontSize: 12, color: "#fff", fontStyle: "italic", marginBottom: 8, paddingLeft: 10, borderLeft: `2px solid ${color}` }}>
                      "{txt}"
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
      
      <div style={{ textAlign: "center", fontSize: 11, color: "#475569", marginTop: 10 }}>
        Total de formulários entregues: {respostas.length}
      </div>
    </div>
  );
}
