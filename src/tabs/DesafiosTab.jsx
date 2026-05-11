import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase.js";
import { CARD, SL, CYN, PNK, INP, Btn, SubTabs, RadarChart } from "../theme.jsx";
import { 
  upd, scoreLabel, getDimDesc, nowLabel, 
  DIMS, RODA_DIMS, SURVEY_CATS, QUIZZES, SEMOJIS, MOODS, COMPL 
} from "../data.js";

export default function DesafiosTab({ user, data }) {
  const [subTab, setSubTab] = useState("pergunta");
  
  // Estados Locais para inputs
  const [aTxt, setATxt] = useState("");
  const [cmode, setCmode] = useState("texto");
  const [selMood, setSelMood] = useState(null);
  const [p3, setP3] = useState(["", "", ""]);
  const [cidx, setCidx] = useState(0);
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Estados para Áudio
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  // ── LÓGICA DE ÁUDIO REAL ──
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(blob));
        setMediaFile(new File([blob], `audio_${Date.now()}.webm`, { type: 'audio/webm' }));
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Erro ao aceder ao microfone: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      mediaRecorder.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  // ── SUBMETER RESPOSTA À PERGUNTA ──
  async function submitAnswer() {
    setIsUploading(true);
    let finalMedia = null;
    let answerType = cmode;

    try {
      if (mediaFile) {
        const r = ref(storage, `respostas/${user.username}/${Date.now()}_${mediaFile.name}`);
        await uploadBytes(r, mediaFile);
        finalMedia = await getDownloadURL(r);
      }

      const payload = {
        answered: true,
        answerType: answerType,
        answerDate: nowLabel(),
        answerText: cmode === "3p" ? p3.join(", ") : (cmode === "mood" ? MOODS[selMood] : aTxt),
        answerMedia: finalMedia
      };

      await setDoc(doc(db, "userData", user.username), payload, { merge: true });
      await addHistory("Respondeu à Pergunta da Semana (" + answerType + ")");
      alert("Enviado com sucesso! Ganhaste 20 XP!");
    } catch (e) {
      alert("Erro ao enviar: " + e.message);
    }
    setIsUploading(false);
  }

  // ── AJUDANTES ──
  async function addHistory(action) {
    const newH = [...(data.history || []), { date: nowLabel(), action, ts: Date.now() }];
    await setDoc(doc(db, "userData", user.username), { history: newH, weekXp: (data.userData?.weekXp || 0) + 20 }, { merge: true });
  }

  const uData = data.userData || {};

  return (
    <div style={{ padding: "18px 16px" }}>
      <SubTabs 
        options={[["pergunta","💬 Pergunta"],["auto","📊 Auto"],["satisf","😊 Satis."],["roda","🌸 Roda"],["quiz","🎯 Quiz"]]} 
        active={subTab} onChange={setSubTab} color={CYN}
      />

      {/* ── SECCÃO PERGUNTA ── */}
      {subTab === "pergunta" && (
        <div style={CARD}>
          <div style={SL}>Pergunta da Semana</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, lineHeight: 1.5, color: "#fff", padding: "15px", background: "rgba(34, 211, 238, 0.1)", borderRadius: 16, borderLeft: `4px solid ${CYN}` }}>
            {data.activeQuestion || "A carregar pergunta..."}
          </div>

          {uData.answered ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
              <div style={{ fontWeight: 900, color: CYN }}>RESPOSTA ENTREGUE</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 5 }}>A Teresa já pode ver a tua reflexão.</div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 15 }}>
                {["texto", "audio", "foto", "video", "mood", "3p", "completar"].map(m => (
                  <button key={m} onClick={() => setCmode(m)} style={{ padding: "8px 12px", borderRadius: 20, border: cmode === m ? `1px solid ${CYN}` : "1px solid rgba(255,255,255,0.1)", background: cmode === m ? `${CYN}20` : "transparent", color: cmode === m ? CYN : "#94a3b8", fontSize: 10, fontWeight: 900 }}>{m.toUpperCase()}</button>
                ))}
              </div>

              {cmode === "texto" && <textarea value={aTxt} onChange={e => setATxt(e.target.value)} style={INP} rows={4} placeholder="Escreve aqui..." />}
              
              {cmode === "audio" && (
                <div style={{ textAlign: "center", padding: "20px", border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 20, marginBottom: 15 }}>
                  {!isRecording ? (
                    <button onClick={startRecording} style={{ width: 60, height: 60, borderRadius: 30, background: "#ef4444", border: "none", color: "white", fontSize: 24, cursor: "pointer" }}>🎤</button>
                  ) : (
                    <button onClick={stopRecording} style={{ width: 60, height: 60, borderRadius: 30, background: CYN, border: "none", color: "#070b14", fontSize: 24, cursor: "pointer" }}>⏹️</button>
                  )}
                  <div style={{ marginTop: 10, fontSize: 12, fontWeight: 800, color: isRecording ? "#ef4444" : CYN }}>
                    {isRecording ? "A GRAVAR..." : audioURL ? "ÁUDIO PRONTO ✓" : "CLICA PARA GRAVAR"}
                  </div>
                </div>
              )}

              {["foto", "video"].includes(cmode) && (
                <div style={{ marginBottom: 15 }}>
                  <input type="file" accept={cmode === "foto" ? "image/*" : "video/*"} onChange={e => setMediaFile(e.target.files[0])} style={{ color: "white", fontSize: 12 }} />
                </div>
              )}

              {cmode === "mood" && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  {MOODS.map((m, i) => (
                    <button key={i} onClick={() => setSelMood(i)} style={{ fontSize: 32, background: "none", border: "none", opacity: selMood === i ? 1 : 0.2, cursor: "pointer", transition: "0.2s" }}>{m}</button>
                  ))}
                </div>
              )}

              <Btn onClick={submitAnswer} disabled={isUploading}>{isUploading ? "A ENVIAR..." : "SUBMETER RESPOSTA"}</Btn>
            </div>
          )}
        </div>
      )}

      {/* ── SECÇÃO AUTOAVALIAÇÃO ── */}
      {subTab === "auto" && (
        <div>
          {DIMS.map(dim => {
            const val = uData.dScores?.[dim.id] || 5;
            return (
              <div key={dim.id} style={CARD}>
                <div style={{ fontWeight: 900, fontSize: 14, color: CYN }}>{dim.label}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", margin: "8px 0 15px", lineHeight: 1.4 }}>{dim.desc}</div>
                <input type="range" min="1" max="10" value={val} 
                  onChange={async (e) => {
                    const nS = { ...(uData.dScores || {}), [dim.id]: Number(e.target.value) };
                    await setDoc(doc(db, "userData", user.username), { dScores: nS }, { merge: true });
                  }} 
                  style={{ width: "100%", accentColor: scoreLabel(val)[1] }} 
                />
                <div style={{ textAlign: "center", margin: "10px 0", padding: "8px", background: "rgba(0,0,0,0.2)", borderRadius: 10 }}>
                  <span style={{ fontWeight: 900, color: scoreLabel(val)[1] }}>{val} - {scoreLabel(val)[0]}</span>
                </div>
                <div style={{ fontSize: 11, fontStyle: "italic", color: "#cbd5e1" }}>{getDimDesc(dim, val)}</div>
              </div>
            );
          })}
          <Btn onClick={() => alert("Guardado automaticamente!")}>FINALIZAR AUTOAVALIAÇÃO</Btn>
        </div>
      )}

      {/* ── SECÇÃO QUIZ ── */}
      {subTab === "quiz" && (
        <div style={CARD}>
          <div style={SL}>Dilemas do Dia a Dia</div>
          {QUIZZES.map((q, idx) => {
            const hasAns = uData.qAnswers?.[q.id];
            return (
              <div key={q.id} style={{ marginBottom: 30, borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 20 }}>
                <div style={{ background: CYN, color: "#070b14", display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 9, fontWeight: 900, marginBottom: 8 }}>{q.badge}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 15 }}>{q.scenario}</div>
                
                {!hasAns ? (
                  q.opts.map(opt => (
                    <button key={opt.id} 
                      onClick={async () => {
                        const nA = { ...(uData.qAnswers || {}), [q.id]: opt.id };
                        await setDoc(doc(db, "userData", user.username), { qAnswers: nA }, { merge: true });
                      }}
                      style={{ width: "100%", textAlign: "left", padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", marginBottom: 8, cursor: "pointer" }}
                    >
                      <strong style={{ color: CYN, marginRight: 10 }}>{opt.id}</strong> {opt.text}
                    </button>
                  ))
                ) : (
                  <div style={{ background: "rgba(34, 211, 238, 0.1)", padding: "15px", borderRadius: 12, borderLeft: `4px solid ${CYN}` }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: CYN, marginBottom: 5 }}>A TUA ESCOLHA: {hasAns}</div>
                    <div style={{ fontSize: 13 }}>{q.opts.find(o => o.id === hasAns)?.reveal}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Rodas e Satisfação seguem a mesma lógica de ligação ao 'data' e 'userData' */}
    </div>
  );
}
