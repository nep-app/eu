import React, { useState, useRef } from 'react';
import { doc, setDoc, collection, addDoc, increment } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase.js";
import { CARD, SL, CYN, PNK, INP, Btn, SubTabs } from "../theme.jsx";
import { 
  upd, scoreLabel, getDimDesc, nowLabel, 
  DIMS, SURVEY_CATS, QUIZZES, SEMOJIS, MOODS 
} from "../data.js";

export default function DesafiosTab({ user, data }) {
  const [subTab, setSubTab] = useState("pergunta");
  
  // Estados para a Pergunta da Semana
  const [aTxt, setATxt] = useState("");
  const [cmode, setCmode] = useState("texto");
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Estados para submissões e Trincos de Segurança contra Spam de XP
  const [isSubmittingAuto, setIsSubmittingAuto] = useState(false);
  const [isSubmittingSatisf, setIsSubmittingSatisf] = useState(false);
  const [localAutoSaved, setLocalAutoSaved] = useState(false);
  const [localSatisfSaved, setLocalSatisfSaved] = useState(false);
  
  // Estados específicos para Áudio
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Dados do utilizador vindos do estado global
  const uData = data.userData || {};

  // ── LÓGICA DE GRAVAÇÃO DE ÁUDIO ──
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setMediaFile(new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' }));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Não foi possível aceder ao microfone. Verifica as permissões.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  }

  // ── SUBMISSÃO DA PERGUNTA SEMANAL ──
  async function submitAnswer() {
    if (!aTxt && !mediaFile && cmode !== "mood") {
      return alert("Por favor, escreve algo ou grava um áudio antes de enviar.");
    }

    setIsUploading(true);
    try {
      let downloadURL = null;
      if (mediaFile) {
        const fileRef = ref(storage, `respostas/${user.username}/${Date.now()}_${mediaFile.name}`);
        await uploadBytes(fileRef, mediaFile);
        downloadURL = await getDownloadURL(fileRef);
      }

      const payload = {
        answered: true,
        answerType: cmode,
        answerText: aTxt,
        answerMedia: downloadURL,
        answerDate: nowLabel()
      };

      await setDoc(doc(db, "userData", user.username), payload, { merge: true });
      
     const newHistory = [...(data.history || []), { 
  date: nowLabel(), 
  action: `Respondeu à pergunta (${cmode})`, 
  ts: Date.now(),
  xp: 20 // FALTA ISTO AQUI!
}];
      
      await setDoc(doc(db, "userData", user.username), { 
        history: newHistory,
        weekXp: (uData.weekXp || 0) + 20 
      }, { merge: true });

      alert("Resposta enviada com sucesso! +20 XP ✨");
    } catch (e) {
      alert("Erro ao enviar resposta. Tenta novamente.");
    }
    setIsUploading(false);
  }

  // ── SUBMISSÃO DA AUTOAVALIAÇÃO ──
async function submitAutoAvaliacao() {
    // 1. TRINCO DE SEGURANÇA: Se já enviou ou está a enviar, pára tudo!
    if (uData.autoSaved || localAutoSaved || isSubmittingAuto) return; 
    
    setIsSubmittingAuto(true);
    setLocalAutoSaved(true); // Bloqueio visual instantâneo

    try {
      const date = nowLabel();
      const newAction = { date, action: `Concluiu a Autoavaliação de Competências`, ts: Date.now() };
     const newHistory = [...(data.history || []), { 
  date: nowLabel(), 
  action: `Concluiu a Autoavaliação de Competências`, 
  ts: Date.now(),
  xp: 30 // FALTA ISTO AQUI!
}];
      
      // 2. ATUALIZAÇÃO SEGURA: Usamos "increment" para nunca falhar o XP
      await setDoc(doc(db, "userData", user.username), { 
        autoSaved: true, 
        autoDate: date,
        history: newHistory,
        weekXp: increment(30) // 💥 O TRUQUE MÁGICO: Soma 30 ao que quer que lá esteja
      }, { merge: true });

      // 3. NOTIFICAÇÃO ADMIN
      // Nota: Se isto der erro de permissão, o XP já foi gravado acima!
      try {
        await addDoc(collection(db, "adminNotificacoes"), {
          tipo: "AUTOAVALIACAO",
          jovem: user.username,
          data: date,
          ts: Date.now(),
          lida: false
        });
      } catch (e) { console.warn("Notificação não enviada, mas XP gravado."); }

      alert("✅ Autoavaliação enviada! +30 XP ganhos.");

    } catch (e) {
      alert("Erro ao gravar: " + e.message);
      setLocalAutoSaved(false); // Se falhou a sério, deixa tentar de novo
    }
    setIsSubmittingAuto(false);
  }

  // ── SUBMISSÃO DA SATISFAÇÃO ──
  async function submitSatisfacao() {
    if (uData.sSaved || localSatisfSaved || isSubmittingSatisf) return;
    
    setIsSubmittingSatisf(true);
    try {
      setLocalSatisfSaved(true); // Bloqueio instantâneo

      await setDoc(doc(db, "userData", user.username), { 
        sSaved: true,
        sDate: nowLabel()
      }, { merge: true });

      await addDoc(collection(db, "adminNotificacoes"), {
        tipo: "SATISFACAO_ANONIMA",
        jovem: "Anónimo", 
        data: nowLabel(),
        ts: Date.now(),
        lida: false
      });
    } catch (e) {
      console.error(e);
      setLocalSatisfSaved(false);
    }
    setIsSubmittingSatisf(false);
  }


  return (
    <div style={{ padding: "18px 16px" }}>
      <SubTabs 
        options={[["pergunta","💬 Pergunta"],["auto","📊 Auto"],["satisf","😊 Satis."],["quiz","🎯 Quiz"]]} 
        active={subTab} onChange={setSubTab} color={CYN}
      />

      {/* ── 1. PERGUNTA DA SEMANA ── */}
      {subTab === "pergunta" && (
        <div style={CARD}>
          <div style={SL}>Desafio Semanal</div>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, padding: "15px", background: "rgba(0,0,0,0.3)", borderRadius: 16, borderLeft: `4px solid ${CYN}`, lineHeight: 1.5 }}>
            {data.activeQuestion || "O que mais te marcou no teu local de trabalho esta semana?"}
          </div>

          {uData.answered ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🚀</div>
              <div style={{ fontWeight: 900, color: CYN, fontSize: 16 }}>RESPOSTA ENTREGUE!</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 5 }}>Obrigado pela tua partilha.</div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 15 }}>
                {["texto", "audio", "foto"].map(m => (
                  <button key={m} onClick={() => { setCmode(m); setAudioURL(null); }} style={{ padding: "8px 12px", borderRadius: 20, border: cmode === m ? `1.5px solid ${CYN}` : "1px solid rgba(255,255,255,0.1)", background: cmode === m ? `${CYN}20` : "transparent", color: cmode === m ? CYN : "#94a3b8", fontSize: 10, fontWeight: 900 }}>
                    {m.toUpperCase()}
                  </button>
                ))}
              </div>

              {cmode === "texto" && (
                <textarea value={aTxt} onChange={e => setATxt(e.target.value)} style={INP} rows={4} placeholder="Escreve a tua reflexão..." />
              )}

              {cmode === "audio" && (
                <div style={{ textAlign: "center", padding: "20px", border: "2px dashed rgba(255,255,255,0.1)", borderRadius: 24, marginBottom: 15, background: "rgba(0,0,0,0.2)" }}>
                  {!isRecording ? (
                    <button onClick={startRecording} style={{ width: 64, height: 64, borderRadius: 32, background: "#ef4444", border: "none", color: "white", fontSize: 24, cursor: "pointer", boxShadow: "0 0 15px rgba(239, 68, 68, 0.4)" }}>🎤</button>
                  ) : (
                    <button onClick={stopRecording} style={{ width: 64, height: 64, borderRadius: 32, background: CYN, border: "none", color: "#070b14", fontSize: 24, cursor: "pointer" }}>⏹️</button>
                  )}
                  
                  <div style={{ marginTop: 12, fontSize: 12, fontWeight: 800, color: isRecording ? "#ef4444" : CYN }}>
                    {isRecording ? "A GRAVAR ÁUDIO..." : "CLICA PARA GRAVAR"}
                  </div>

                  {audioURL && (
                    <div style={{ marginTop: 20, padding: "10px", background: "rgba(255,255,255,0.05)", borderRadius: 16 }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8, fontWeight: 800 }}>OUVE A TUA GRAVAÇÃO:</div>
                      <audio src={audioURL} controls style={{ width: "100%", height: 36 }} />
                      <div style={{ fontSize: 10, color: CYN, marginTop: 8 }}>Podes gravar novamente se não gostares.</div>
                    </div>
                  )}
                </div>
              )}

              {cmode === "foto" && (
                <div style={{ marginBottom: 15 }}>
                  <input type="file" accept="image/*" onChange={e => setMediaFile(e.target.files[0])} style={{ color: "white", fontSize: 12 }} />
                </div>
              )}

              <Btn onClick={submitAnswer} disabled={isUploading}>
                {isUploading ? "A ENVIAR..." : "SUBMETER DESAFIO"}
              </Btn>
            </div>
          )}
        </div>
      )}

      {/* ── 2. AUTOAVALIAÇÃO ── */}
      {subTab === "auto" && (
        <div>
          {uData.autoSaved || localAutoSaved ? (
            <div style={{ ...CARD, textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
              <div style={{ fontWeight: 900, color: CYN, fontSize: 18 }}>AVALIAÇÃO ENTREGUE!</div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 10, lineHeight: 1.5 }}>
                Obrigado pelo teu preenchimento.<br/>Recebeste +30 XP. Só poderás voltar a preencher no próximo ciclo.
              </div>
            </div>
          ) : (
            <>
              <div style={{ ...CARD, background: "rgba(34, 211, 238, 0.05)", border: `1px solid ${CYN}30` }}>
                <div style={{ fontSize: 14, fontWeight: 900, color: CYN }}>Autoavaliação de Competências</div>
                <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 4 }}>Escolhe o nível que melhor descreve o teu desempenho este mês.</div>
              </div>

              {DIMS.map(dim => {
                const val = uData.dScores?.[dim.id] || 5;
                const status = scoreLabel(val);
                return (
                  <div key={dim.id} style={CARD}>
                    <div style={{ fontWeight: 900, fontSize: 14, color: "#fff", marginBottom: 6 }}>{dim.label}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 15, lineHeight: 1.4 }}>{dim.desc}</div>
                    
                    <input type="range" min="1" max="10" value={val} 
                      onChange={async (e) => {
                        const nS = { ...(uData.dScores || {}), [dim.id]: Number(e.target.value) };
                        await setDoc(doc(db, "userData", user.username), { dScores: nS }, { merge: true });
                      }} 
                      style={{ width: "100%", accentColor: status[1], height: 6, borderRadius: 3 }} 
                    />

                    <div style={{ display: "flex", justifyContent: "center", margin: "15px 0" }}>
                      <div style={{ background: `${status[1]}20`, padding: "8px 16px", borderRadius: 12, border: `1px solid ${status[1]}50` }}>
                        <span style={{ fontWeight: 900, color: status[1], fontSize: 18 }}>{val} — {status[0]}</span>
                      </div>
                    </div>

                    <div style={{ background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: 12, fontSize: 12, color: "#e2e8f0", fontStyle: "italic", borderLeft: `3px solid ${status[1]}` }}>
                      {getDimDesc(dim, val)}
                    </div>

                    <textarea 
                      value={uData.dNotas?.[dim.id] || ""} 
                      onChange={async (e) => {
                        const nN = { ...(uData.dNotas || {}), [dim.id]: e.target.value };
                        await setDoc(doc(db, "userData", user.username), { dNotas: nN }, { merge: true });
                      }}
                      style={{ ...INP, marginTop: 15, fontSize: 12 }} 
                      placeholder="Queres acrescentar alguma observação sobre esta competência?" 
                      rows={2}
                    />
                  </div>
                );
              })}

              <Btn onClick={submitAutoAvaliacao} disabled={isSubmittingAuto || localAutoSaved} variant="success">
                {isSubmittingAuto ? "A GRAVAR..." : "FINALIZAR E ENVIAR"}
              </Btn>
            </>
          )}
        </div>
      )}

      {/* ── 3. SATISFAÇÃO ── */}
      {subTab === "satisf" && (
        <div>
          {uData.sSaved || localSatisfSaved ? (
            <div style={{ ...CARD, textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>💖</div>
              <div style={{ fontWeight: 900, color: PNK, fontSize: 18 }}>FEEDBACK ENVIADO!</div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 10 }}>A tua opinião anónima foi registada com sucesso. Obrigado!</div>
            </div>
          ) : (
            <>
              {SURVEY_CATS.map(cat => (
                <div key={cat.id} style={CARD}>
                  <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 12 }}>{cat.q}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    {[1, 2, 3, 4, 5].map(n => {
                      const isSel = uData.sRatings?.[cat.id] === n;
                      return (
                        <button key={n} 
                          onClick={async () => {
                            const nR = { ...(uData.sRatings || {}), [cat.id]: n };
                            await setDoc(doc(db, "userData", user.username), { sRatings: nR }, { merge: true });
                          }}
                          style={{ fontSize: 30, opacity: isSel ? 1 : 0.2, background: "none", border: "none", cursor: "pointer", transform: isSel ? "scale(1.2)" : "scale(1)", transition: "0.2s" }}
                        >
                          {SEMOJIS[n]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div style={CARD}>
                <div style={SL}>Mensagem Anónima</div>
                <textarea 
                  value={uData.sMudaria || ""} 
                  onChange={async (e) => {
                    await setDoc(doc(db, "userData", user.username), { sMudaria: e.target.value }, { merge: true });
                  }}
                  style={INP} rows={3} placeholder="O que melhorarias no programa JEEP?" 
                />
                <Btn color={PNK} onClick={submitSatisfacao} disabled={isSubmittingSatisf || localSatisfSaved}>
                  {isSubmittingSatisf ? "A ENVIAR..." : "SUBMETER AVALIAÇÃO"}
                </Btn>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── 4. QUIZ DE CENÁRIOS ── */}
      {subTab === "quiz" && (
        <div style={CARD}>
          <div style={SL}>Cenários JEEP</div>
          {QUIZZES.map((q) => {
            const hasAns = uData.qAnswers?.[q.id];
            return (
              <div key={q.id} style={{ marginBottom: 32, borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ background: CYN, color: "#070b14", padding: "2px 8px", borderRadius: 6, fontSize: 9, fontWeight: 900 }}>{q.badge}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: CYN }}>{q.title}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.6, marginBottom: 18, color: "#cbd5e1" }}>{q.scenario}</div>
                
                {!hasAns ? (
                  q.opts.map(opt => (
                    <button key={opt.id} 
                      onClick={async () => {
                        const nA = { ...(uData.qAnswers || {}), [q.id]: opt.id };
                        await setDoc(doc(db, "userData", user.username), { qAnswers: nA }, { merge: true });
                        // Dá XP apenas no primeiro quiz
                        await setDoc(doc(db, "userData", user.username), { weekXp: (uData.weekXp || 0) + 15 }, { merge: true });
                      }}
                      style={{ width: "100%", textAlign: "left", padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", color: "#fff", marginBottom: 10, cursor: "pointer", fontSize: 13, display: "flex", gap: 12 }}
                    >
                      <strong style={{ color: CYN }}>{opt.id}</strong> {opt.text}
                    </button>
                  ))
                ) : (
                  <div style={{ background: "rgba(34, 211, 238, 0.1)", padding: "18px", borderRadius: 20, borderLeft: `4px solid ${CYN}` }}>
                    <div style={{ fontSize: 11, fontWeight: 900, color: CYN, marginBottom: 6, letterSpacing: 1 }}>A TUA ESCOLHA: {hasAns}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.5, color: "#fff" }}>{q.opts.find(o => o.id === hasAns)?.reveal}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
