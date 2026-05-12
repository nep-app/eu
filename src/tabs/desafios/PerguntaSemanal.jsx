import React, { useState, useRef } from 'react';
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase.js";
import { CARD, SL, CYN, INP, Btn } from "../../theme.jsx";
import { nowLabel } from "../../data.js";

export default function PerguntaSemanal({ user, data }) {
  const [aTxt, setATxt] = useState("");
  const [cmode, setCmode] = useState("texto");
  const [mediaFile, setMediaFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const uData = data.userData || {};

  // Funções de Áudio (startRecording, stopRecording) entram aqui...
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
    } catch (err) { alert("Erro no microfone."); }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop(); setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  }

  async function submitAnswer() {
    if (!aTxt && !mediaFile && cmode !== "mood") return alert("Escreve algo ou grava áudio!");
    setIsUploading(true);
    try {
      let downloadURL = null;
      if (mediaFile) {
        const fileRef = ref(storage, `respostas/${user.username}/${Date.now()}_${mediaFile.name}`);
        await uploadBytes(fileRef, mediaFile);
        downloadURL = await getDownloadURL(fileRef);
      }
      const newHistory = [...(data.history || []), { date: nowLabel(), action: `Respondeu à pergunta (${cmode})`, ts: Date.now(), xp: 20 }];
      await setDoc(doc(db, "userData", user.username), {
        answered: true, answerType: cmode, answerText: aTxt, answerMedia: downloadURL, answerDate: nowLabel(),
        history: newHistory, weekXp: (uData.weekXp || 0) + 20
      }, { merge: true });
      alert("Boa partilha! O teu XP acabou de subir. ✨");
    } catch (e) { alert("Erro ao enviar."); }
    setIsUploading(false);
  }

  return (
    <div style={CARD}>
      <div style={SL}>Desafio Semanal</div>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, padding: "15px", background: "rgba(0,0,0,0.3)", borderRadius: 16, borderLeft: `4px solid ${CYN}`, lineHeight: 1.5 }}>
        {data.activeQuestion || "O que mais te marcou esta semana?"}
      </div>
      {uData.answered ? (
        <div style={{ textAlign: "center", padding: "20px" }}>🚀 RESPOSTA ENTREGUE!</div>
      ) : (
        /* ... Conteúdo do formulário (botões texto/audio/foto, inputs e Btn) ... */
        <div>
           {/* (Código do formulário que estava no original) */}
           <Btn onClick={submitAnswer} disabled={isUploading}>{isUploading ? "A ENVIAR..." : "SUBMETER"}</Btn>
        </div>
      )}
    </div>
  );
}
