import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { db, storage } from "../firebase.js";
import { CARD, SL, CYN, PNK, INP, Btn, SubTabs, RadarChart } from "../theme.jsx";
import { upd, scoreLabel, getDimDesc, nowLabel, DIMS, RODA_DIMS, SURVEY_CATS, QUIZZES, SEMOJIS } from "../data.js";

export default function DesafiosTab({ user, dScores, setDScores, dNotas, setDNotas, autoSaved, setAutoSaved, sRatings, setSRatings, sChips, setSChips, sMudaria, setSMudaria, sSaved, setSSaved, roda, setRoda, rodaSaves, activeQ, activeQMode, answered, setAnswered, qIdx, setQIdx, qAnswers, addHistoryLog, addXp }) {
  const [subTab, setSubTab] = useState("pergunta");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const startRec = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    let chunks = [];
    mr.ondataavailable = e => chunks.push(e.data);
    mr.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      await uploadMedia(blob, "audio");
    };
    mr.start(); setMediaRecorder(mr); setIsRecording(true);
  };

  const uploadMedia = async (file, type) => {
    setIsUploading(true);
    const fileRef = ref(storage, `respostas/${user.username}_${Date.now()}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    await setDoc(doc(db, "userData", user.username), { answered: true, answerMedia: url, answerType: type }, { merge: true });
    setAnswered(true); addHistoryLog("Respondeu com Áudio/Foto"); addXp(20);
    setIsUploading(false);
  };

  return (
    <div style={{ padding:"18px 16px" }}>
      <SubTabs options={[["pergunta","💬 Pergunta"],["auto","📊 Auto"],["satisf","😊 Satis."],["roda","🌸 Roda"],["quiz","🎯 Quiz"]]} active={subTab} onChange={setSubTab} color={CYN}/>

      {subTab === "pergunta" && (
        <div style={CARD}>
          <div style={SL}>Pergunta da Semana</div>
          <div style={{ fontSize:15, fontWeight:800, marginBottom:16, padding:14, background:"rgba(0,0,0,0.3)", borderRadius:16, borderLeft:`4px solid ${CYN}` }}>{activeQ}</div>
          {!answered ? (
            <div>
              <div style={{display:"flex", gap:10, justifyContent:"center", marginBottom:15}}>
                {activeQMode.includes("audio") && <button onClick={isRecording ? () => mediaRecorder.stop() : startRec} style={{ padding:"15px", borderRadius:"50%", background:isRecording?CYN:"#ef4444", border:"none", fontSize:20 }}>{isRecording ? "⏹️" : "🎤"}</button>}
              </div>
              <textarea style={INP} rows={4} placeholder="Ou escreve aqui..." onBlur={async (e) => {
                 if(e.target.value.trim()) {
                   await setDoc(doc(db, "userData", user.username), { answered:true, answerText: e.target.value, answerType: "texto" }, { merge:true });
                   setAnswered(true); addXp(20);
                 }
              }}/>
            </div>
          ) : <div style={{textAlign:"center", color:CYN, fontWeight:900}}>✅ RESPOSTA ENVIADA!</div>}
        </div>
      )}

      {subTab === "auto" && (
        <div>
          {DIMS.map(dim => (
            <div key={dim.id} style={CARD}>
              <div style={{fontWeight:900, marginBottom:8}}>{dim.label}</div>
              <div style={{fontSize:12, color:"#94a3b8", marginBottom:10}}>{dim.desc}</div>
              <input type="range" min="1" max="10" value={dScores[dim.id]} onChange={e => setDScores(upd(dScores, dim.id, Number(e.target.value)))} style={{width:"100%", accentColor:CYN}} />
              <div style={{textAlign:"center", color:CYN, fontWeight:900, marginTop:10}}>{dScores[dim.id]} - {scoreLabel(dScores[dim.id])[0]}</div>
            </div>
          ))}
          <Btn onClick={async () => {
             await setDoc(doc(db, "userData", user.username), { dScores, dNotas, autoSaved: true }, { merge: true });
             setAutoSaved(true); addHistoryLog("Autoavaliação submetida"); addXp(15);
          }}>Enviar à Teresa</Btn>
        </div>
      )}
      
      {/* Aqui continuariam os outros (Satisfação, Roda, Quiz) seguindo a mesma lógica... */}
    </div>
  );
}
