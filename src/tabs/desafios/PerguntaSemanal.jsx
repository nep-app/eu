import React, { useState, useRef, useEffect } from 'react';
import { doc, setDoc, getDoc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase.js";
import { CARD, SL, CYN, INP, Btn, PNK, PS } from "../../theme.jsx";
import { nowLabel } from "../../data.js";

export default function PerguntaSemanal({ user, data }) {
  const [perguntaDB, setPerguntaDB] = useState(null);
  const [aTxt, setATxt] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  
  const [palavras, setPalavras] = useState(["", "", ""]);
  const [ratingSemana, setRatingSemana] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const uData = data.userData || {};

  // Ir buscar a pergunta e o modo em tempo real (para bater certo com o Admin)
  useEffect(() => {
    async function fetchQ() {
      const snap = await getDoc(doc(db, "config", "activeQuestion"));
      if (snap.exists()) setPerguntaDB(snap.data());
    }
    fetchQ();
  }, []);

  // LÓGICA DE ÁUDIO (A TUA ORIGINAL)
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

  // SUBMETER (A TUA LÓGICA + XP)
  async function submitAnswer(valorBotao = null) {
    setIsUploading(true);
    try {
      let downloadURL = null;
      if (mediaFile) {
        const fileRef = ref(storage, `respostas/${user.username}/${Date.now()}_${mediaFile.name}`);
        await uploadBytes(fileRef, mediaFile);
        downloadURL = await getDownloadURL(fileRef);
      }

      const cmode = perguntaDB?.options?.length > 0 ? "botao" : (perguntaDB?.mode?.[0] || "texto");
      let respostaFinal = valorBotao || aTxt;
      
      if (cmode === "3palavras") respostaFinal = palavras.join(", ");
      if (cmode === "semana") respostaFinal = `Nota da Semana: ${ratingSemana}/5`;

      await updateDoc(doc(db, "userData", user.username), {
        answered: true,
        answerType: cmode,
        answerText: respostaFinal,
        answerMedia: downloadURL,
        answerDate: nowLabel(),
        weekXp: increment(20),
        history: arrayUnion({ date: nowLabel(), action: "Respondeu ao desafio semanal", ts: Date.now(), xp: 20 })
      });

      alert("Resposta entregue! ✨ +20 XP");
    } catch (e) { 
      console.error(e);
      alert("Erro ao enviar."); 
    }
    setIsUploading(false);
  }

  if (uData.answered) return (
    <div style={CARD}>
      <div style={SL}>Desafio Semanal</div>
      <div style={{ textAlign: "center", padding: "20px", color: CYN, fontWeight: 900 }}>
        ✅ CONCLUÍDO! A Teresa já recebeu a tua reflexão.
      </div>
    </div>
  );

  const perguntaAtual = perguntaDB?.text || data.activeQuestion || "O que mais te marcou esta semana?";
  const opcoes = perguntaDB?.options || [];
  const cmode = opcoes.length > 0 ? "botao" : (perguntaDB?.mode?.[0] || "texto");

  return (
    <div style={CARD}>
      <div style={SL}>Pergunta da Semana</div>
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 20, padding: "15px", background: "rgba(0,0,0,0.3)", borderRadius: 16, borderLeft: `4px solid ${CYN}` }}>
        {perguntaAtual}
      </div>

      <div style={{ marginBottom: 20 }}>
        
        {/* NOVO MODO: BOTÕES (Se a Teresa definir opções no Admin) */}
        {cmode === "botao" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {opcoes.map((opt, i) => (
              <button key={i} onClick={() => submitAnswer(opt)} style={{ padding: "15px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: `1px solid ${CYN}40`, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* TEXTO / COMPLETAR */}
        {(cmode === "texto" || cmode === "completar") && (
          <textarea value={aTxt} onChange={e => setATxt(e.target.value)} style={INP} rows={4} placeholder="Escreve aqui..." />
        )}

        {/* 3 PALAVRAS */}
        {cmode === "3palavras" && (
          <div style={{ display: "flex", gap: 10 }}>
            {palavras.map((p, i) => (
              <input key={i} value={p} onChange={e => {
                const newP = [...palavras]; newP[i] = e.target.value; setPalavras(newP);
              }} style={{ ...INP, textAlign: "center" }} placeholder={`Palavra ${i+1}`} />
            ))}
          </div>
        )}

        {/* SEMANA (RATING) */}
        {cmode === "semana" && (
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setRatingSemana(n)} style={{ 
                width: 50, height: 50, borderRadius: "50%", border: "none", fontSize: 20,
                background: ratingSemana === n ? CYN : "rgba(255,255,255,0.05)",
                color: ratingSemana === n ? "#000" : "#fff"
              }}>⭐</button>
            ))}
          </div>
        )}

        {/* ÁUDIO (A TUA ORIGINAL) */}
        {cmode === "audio" && (
          <div style={{ textAlign: "center" }}>
            <button onClick={isRecording ? stopRecording : startRecording} style={{ padding: 20, borderRadius: "50%", background: isRecording ? "#f43f5e" : PNK, border: "none", color: "#fff", cursor: "pointer" }}>
              {isRecording ? "⏹️" : "🎤"}
            </button>
            {audioURL && <audio src={audioURL} controls style={{ marginTop: 15, width: "100%" }} />}
          </div>
        )}

        {/* FOTO / VÍDEO */}
        {(cmode === "imagem" || cmode === "video") && (
          <input type="file" onChange={e => setMediaFile(e.target.files[0])} style={INP} />
        )}

        {/* MOOD */}
        {cmode === "mood" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {["🔥 Focado", "😴 Cansado", "🚀 Motivado", "😐 Normal"].map(m => (
              <button key={m} onClick={() => setATxt(m)} style={{ padding: 10, borderRadius: 12, background: aTxt === m ? PNK : "rgba(255,255,255,0.05)", border: "none", color: "#fff" }}>{m}</button>
            ))}
          </div>
        )}
      </div>

      {cmode !== "botao" && (
        <Btn onClick={() => submitAnswer()} disabled={isUploading}>
          {isUploading ? "A ENVIAR..." : "SUBMETER RESPOSTA"}
        </Btn>
      )}
    </div>
  );
}
