import React, { useState, useRef, useEffect } from 'react';
import { doc, setDoc, getDoc, updateDoc, increment, arrayUnion, addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, notifyAdmin } from "../../firebase.js";
import { CARD, SL, CYN, INP, Btn, PNK, Linkify } from "../../theme.jsx";
import { nowFull, fmtDate, isOverdue } from "../../data.js";

export default function PerguntaSemanal({ user, data }) {
  const isTeresa = user?.username === "teresa";
  const [perguntaDB, setPerguntaDB] = useState(null);
  const [activeTab, setActiveTab] = useState("");
  
  const [aTxt, setATxt] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [palavras, setPalavras] = useState(["", "", ""]);
  const [ratingSemana, setRatingSemana] = useState(0);
  const [opcaoSel, setOpcaoSel] = useState(null);   // opção pré-feita selecionada (ainda não enviada)

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const uData = data.userData || {};

  useEffect(() => {
    async function fetchQ() {
      const snap = await getDoc(doc(db, "config", "activeQuestion"));
      if (snap.exists()) {
        const d = snap.data();
        setPerguntaDB(d);
        if (d.modes && d.modes.length > 0) setActiveTab(d.modes[0]);
      }
    }
    fetchQ();
  }, []);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(audioBlob));
        setMediaFile(new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' }));
      };
      mediaRecorder.start(); setIsRecording(true);
    } catch (err) { alert("Microfone não disponível."); }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop(); setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  }

  async function submitAnswer(valorBotao = null) {
    // Calcula já a resposta para validar ANTES de gravar seja o que for.
    let respostaFinal = valorBotao || aTxt;
    if (!valorBotao) {
      if (activeTab === "3palavras") respostaFinal = palavras.filter(p => p.trim()).join(", ");
      if (activeTab === "semana" || activeTab === "rating") respostaFinal = ratingSemana ? `${ratingSemana} ⭐` : "";
    }
    // Salvaguarda: não gravar uma resposta vazia (senão fica "respondido"
    // sem conteúdo e a resposta real perde-se). Exige opção, texto OU media.
    if (!valorBotao && !mediaFile && !(respostaFinal && respostaFinal.trim())) {
      alert("Escolhe uma opção, escreve algo ou grava/anexa antes de submeter. 🙂");
      return;
    }

    setIsUploading(true);
    try {
      let downloadURL = null;
      if (mediaFile) {
        const fileRef = ref(storage, `respostas/${user.username}/${Date.now()}_${mediaFile.name}`);
        await uploadBytes(fileRef, mediaFile);
        downloadURL = await getDownloadURL(fileRef);
      }

      const ts = nowFull();
      const today = new Date().toDateString();
      const ud = data.userData || {};
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = ud.lastActiveDay === yesterday ? (ud.dayStreak || 0) + 1 : (ud.lastActiveDay === today ? (ud.dayStreak || 1) : 1);
      // Archive previous answer before overwriting (in case admin reset without explicit "Repor")
      if (uData.answerText || uData.answerMedia) {
        await updateDoc(doc(db, "userData", user.username), {
          perguntasHistorico: arrayUnion({
            week: uData.answerDate ? uData.answerDate.split(" ")[0] : "anterior",
            answer: uData.answerText || "", type: uData.answerType || "texto",
            media: uData.answerMedia || null,
            ts: Date.now() - 1
          })
        });
      }
      await updateDoc(doc(db, "userData", user.username), {
        answered: true,
        answerType: valorBotao ? "botao" : activeTab,
        answerText: respostaFinal,
        answerMedia: downloadURL,
        answerDate: ts,
        weekXp: increment(20),
        history: arrayUnion({ date: ts, action: "Respondeu ao desafio semanal", ts: Date.now(), xp: 20 }),
        ...(ud.lastActiveDay !== today && { dayStreak: newStreak, lastActiveDay: today })
      });
      await notifyAdmin({
        tipo: "PERGUNTA", jovem: user.username, ts: Date.now(), lida: false,
        texto: (respostaFinal || "").substring(0, 60)
      });
      alert("Resposta entregue! ✨");
    } catch (e) { alert("Erro ao enviar."); }
    setIsUploading(false);
  }

  const getTabLabel = (m) => {
    if (m === "semana" || m === "rating") return "AVALIAÇÃO";
    if (m === "mood") return "MOOD";
    if (m === "3palavras") return "3 PALAVRAS";
    if (m === "imagem") return "FOTO/VÍDEO";
    return m.toUpperCase();
  }

  if (uData.answered) return (
    <div style={CARD}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, textTransform:"uppercase", color: isTeresa ? "#c4b8f3" : "#5a7a9a" }}>Pergunta da Semana</div>
        <div style={{ fontSize:10, fontWeight:800, color:"#4ade80" }}>✅ Respondida</div>
      </div>
      {perguntaDB?.text && (
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 18, padding: "15px", background: "rgba(0,0,0,0.3)", borderRadius: 16, borderLeft: `4px solid ${CYN}` }}>
          <Linkify>{perguntaDB.text}</Linkify>
        </div>
      )}
      <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, textTransform:"uppercase", color:"#5a7a9a", marginBottom:8 }}>A tua resposta</div>
      {uData.answerText && (
        <div style={{ fontSize:14, color:"#e2e8f0", lineHeight:1.6, padding:"14px", background:"rgba(74,222,128,0.06)", border:"1px solid rgba(74,222,128,0.2)", borderRadius:14, whiteSpace:"pre-wrap" }}>
          <Linkify>{uData.answerText}</Linkify>
        </div>
      )}
      {uData.answerMedia && uData.answerType === "audio" && (
        <audio src={uData.answerMedia} controls style={{ width:"100%", marginTop:10 }} />
      )}
      {uData.answerMedia && uData.answerType !== "audio" && (
        <img src={uData.answerMedia} alt="A tua resposta" style={{ width:"100%", borderRadius:14, marginTop:10 }} />
      )}
      <div style={{ fontSize:11, color:"#64748b", marginTop:14, fontStyle:"italic" }}>Já respondeste — não podes alterar. Obrigada! ✨</div>
    </div>
  );

  if (!perguntaDB) return null;

  const modosAtivos = perguntaDB.modes || ["texto"];
  const opcoesBotao = perguntaDB.options || [];

  return (
    <div style={CARD}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, textTransform:"uppercase", color: isTeresa ? "#c4b8f3" : "#5a7a9a" }}>Pergunta da Semana</div>
        {perguntaDB.prazo && <div style={{ fontSize:10, fontWeight:800, color: isOverdue(perguntaDB.prazo) ? "#f43f5e" : "#fbbf24" }}>⏰ Até {fmtDate(perguntaDB.prazo)}</div>}
      </div>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, padding: "15px", background: "rgba(0,0,0,0.3)", borderRadius: 16, borderLeft: `4px solid ${CYN}` }}>
        <Linkify>{perguntaDB.text}</Linkify>
      </div>

      {opcoesBotao.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: modosAtivos.length > 0 ? 14 : 25 }}>
          {opcoesBotao.map((opt, i) => (
            <button key={i} onClick={() => setOpcaoSel(opcaoSel === opt ? null : opt)} style={{ padding: 15, borderRadius: 12, background: opcaoSel === opt ? CYN : "rgba(255,255,255,0.05)", border: `1px solid ${opcaoSel === opt ? CYN : CYN + "40"}`, color: opcaoSel === opt ? "#0f172a" : "#fff", fontWeight: 700, cursor: "pointer", textAlign: "left", lineHeight: 1.4, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ flexShrink:0, width:18, height:18, borderRadius:"50%", border:`2px solid ${opcaoSel === opt ? "#0f172a" : "rgba(255,255,255,0.3)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11 }}>{opcaoSel === opt ? "✓" : ""}</span>
              {opt}
            </button>
          ))}
        </div>
      )}

      {opcoesBotao.length > 0 && modosAtivos.length > 0 && (
        <div style={{ textAlign: "center", fontSize: 11, color: "#64748b", fontWeight: 800, margin: "0 0 14px" }}>— ou responde à tua maneira —</div>
      )}

      {modosAtivos.length > 0 && (
        <div style={{ marginBottom: 25 }}>
          {modosAtivos.length > 1 && (
            <div style={{ display: "flex", gap: 5, marginBottom: 14, overflowX: "auto", paddingBottom: 5 }}>
              {modosAtivos.map(m => (
                <button key={m} onClick={() => setActiveTab(m)} style={{
                  padding: "6px 12px", borderRadius: 10, border: "none", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", cursor: "pointer",
                  background: activeTab === m ? CYN : "rgba(255,255,255,0.05)",
                  color: activeTab === m ? "#000" : "#94a3b8"
                }}>
                  {getTabLabel(m)}
                </button>
              ))}
            </div>
          )}
          <>
            {activeTab === "texto" && <textarea value={aTxt} onChange={e=>setATxt(e.target.value)} style={INP} rows={4} placeholder="Escreve aqui..." />}
            
            {activeTab === "3palavras" && (
              <div style={{ display: "flex", gap: 10 }}>
                {palavras.map((p, i) => (
                  <input key={i} value={p} onChange={e => {
                    const n = [...palavras]; n[i] = e.target.value; setPalavras(n);
                  }} style={{ ...INP, textAlign: "center" }} placeholder={`Palavra ${i+1}`} />
                ))}
              </div>
            )}

            {(activeTab === "semana" || activeTab === "rating") && (
              <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={()=>setRatingSemana(n)} style={{ 
                    width: 45, height: 45, borderRadius: "50%", border: "none", fontSize: 20, cursor: "pointer",
                    background: ratingSemana >= n ? CYN : "rgba(255,255,255,0.05)", 
                    color: ratingSemana >= n ? "#000" : "rgba(255,255,255,0.3)" 
                  }}>⭐</button>
                ))}
              </div>
            )}

            {activeTab === "audio" && (
              <div style={{ textAlign: "center" }}>
                <button onClick={isRecording ? stopRecording : startRecording} style={{ padding: 20, borderRadius: "50%", background: isRecording ? "#f43f5e" : PNK, border: "none", color: "#fff", cursor: "pointer", fontSize: 24 }}>
                  {isRecording ? "⏹️" : "🎤"}
                </button>
                {audioURL && <audio src={audioURL} controls style={{ marginTop: 15, width: "100%" }} />}
              </div>
            )}

            {(activeTab === "imagem") && <input type="file" onChange={e=>setMediaFile(e.target.files[0])} style={INP} />}

            {activeTab === "mood" && (
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 15 }}>
                {["🔥", "❤️", "🚀", "💪", "💡", "🎉", "😴", "🤯"].map(m => (
                  <button key={m} onClick={()=>setATxt(m)} style={{ 
                    width: 50, height: 50, borderRadius: "50%", border: "none", fontSize: 24, cursor: "pointer", transition: "0.2s",
                    background: aTxt === m ? CYN : "rgba(255,255,255,0.05)", 
                    transform: aTxt === m ? "scale(1.1)" : "scale(1)"
                  }}>{m}</button>
                ))}
              </div>
            )}
          </>
        </div>
      )}

      {(opcoesBotao.length > 0 || modosAtivos.length > 0) && (
        <Btn onClick={() => submitAnswer(opcaoSel)} disabled={isUploading || (opcoesBotao.length > 0 && modosAtivos.length === 0 && !opcaoSel)}>
          {isUploading ? "A ENVIAR..." : "SUBMETER RESPOSTA"}
        </Btn>
      )}
    </div>
  );
}
