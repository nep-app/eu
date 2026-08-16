import React, { useState, useRef } from 'react';
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase.js";
import { CARD, SL, INP, PNK, Btn } from "../theme.jsx";
import { nowFull, DEF_CAP } from "../data.js";

const DEF_CAP2 = { text:"", locked:false, revealed:false, lockedDate:"" };

// Cápsulas do Tempo — extraídas do Perfil. Lê/escreve os mesmos campos (cap, cap2)
// em userData, por isso os dados mantêm-se todos.
export default function Capsulas({ user, data }) {
  const uData = data.userData || {};
  const isDemo = user.username === "demo";
  // Na demo, a 1ª cápsula está desbloqueada (a 2ª fica bloqueada, como exemplo).
  const cap  = isDemo ? { ...(uData.cap || DEF_CAP), unlocked: true } : (uData.cap || DEF_CAP);
  const cap2 = uData.cap2 || DEF_CAP2;
  const history = data.history || [];
  const light = user.username === "teresa";
  const thm = { card:CARD, sl:SL, text:"#f1f5f9", muted:"#94a3b8", sub:"#64748b", inp:INP };

  async function sealCapsule(slot) {
    const isSlot2 = slot === 2;
    const capData = isSlot2 ? cap2 : cap;
    if (!capData.text?.trim()) return alert("Escreve primeiro a tua mensagem!");
    const ts = nowFull();
    const newCap = { ...capData, locked: true, sealedAt: ts, ...(isSlot2 ? {} : { lockedDate: "31/12/2026" }) };
    const newH = [...history, { date: ts, action: `Selou Cápsula ${isSlot2 ? "Final" : "de Dezembro"} 🔒`, ts: Date.now(), xp: 15 }];
    await setDoc(doc(db, "userData", user.username), {
      [isSlot2 ? "cap2" : "cap"]: newCap,
      history: newH,
      weekXp: (uData.weekXp || 0) + 15
    }, { merge: true });
    alert(isSlot2 ? "Cápsula entregue à Teresa! 🔐" : "Cápsula selada! Abre em Dezembro 2026 🔒");
  }

  function CapsuleWidget({ slot, capData, title, targetLabel, desc }) {
    const isSlot2  = slot === 2;
    const accent   = isSlot2 ? "#a855f7" : PNK;
    const fieldKey = isSlot2 ? "cap2" : "cap";
    const [mediaTab, setMediaTab]   = useState("texto");
    const [uploading, setUploading] = useState(false);
    const [recording, setRecording] = useState(false);
    const mrRef     = useRef(null);
    const chunksRef = useRef([]);

    async function uploadBlob(blob, ext) {
      const storageRef = ref(storage, `capsulas/${user.username}_slot${slot}_${Date.now()}.${ext}`);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    }

    async function handleFile(e) {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      try {
        const ext = file.name.split('.').pop();
        const url = await uploadBlob(file, ext);
        const mtype = file.type.startsWith("video") ? "video" : file.type.startsWith("audio") ? "audio" : "image";
        await setDoc(doc(db, "userData", user.username), {
          [fieldKey]: { ...capData, mediaUrl: url, mediaType: mtype }
        }, { merge: true });
      } catch(e) { alert("Erro ao carregar: " + e.message); }
      setUploading(false);
    }

    async function startAudio() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setUploading(true);
        const url = await uploadBlob(blob, "webm");
        await setDoc(doc(db, "userData", user.username), {
          [fieldKey]: { ...capData, mediaUrl: url, mediaType: "audio" }
        }, { merge: true });
        setUploading(false);
        setRecording(false);
      };
      mrRef.current = mr;
      mr.start();
      setRecording(true);
    }

    function stopAudio() { mrRef.current?.stop(); }

    function saveText(txt) {
      setDoc(doc(db, "userData", user.username), { [fieldKey]: { ...capData, text: txt } }, { merge: true });
    }

    const isSealed   = capData.locked;
    const isRevealed = capData.revealed;
    const isUnlocked = capData.unlocked;

    if (!isUnlocked && !isSealed && !isRevealed) return (
      <div style={{ ...thm.card, borderTop:`2px solid ${accent}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <span style={{ fontSize:24 }}>💌</span>
          <div>
            <div style={{ fontSize:13, fontWeight:900, color:thm.text }}>{title}</div>
            <div style={{ fontSize:10, color:accent, fontWeight:800 }}>A Teresa vai abrir quando for altura</div>
          </div>
        </div>
        <div style={{ textAlign:"center", padding:"28px 0" }}>
          <div style={{ fontSize:48 }}>🔐</div>
          <div style={{ fontWeight:900, color:accent, fontSize:13, marginTop:12, letterSpacing:0.5 }}>AINDA NÃO DISPONÍVEL</div>
          <div style={{ fontSize:12, color:thm.muted, marginTop:8, lineHeight:1.6 }}>
            Esta cápsula será aberta pela Teresa<br/>no momento certo do programa.
          </div>
        </div>
      </div>
    );

    if (isSlot2 && isSealed && !isRevealed) return (
      <div style={{ ...thm.card, borderTop:`2px solid ${accent}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <span style={{ fontSize:24 }}>💌</span>
          <div>
            <div style={{ fontSize:13, fontWeight:900, color:thm.text }}>{title}</div>
            <div style={{ fontSize:10, color:accent, fontWeight:800 }}>A Teresa irá revelar no final do programa</div>
          </div>
        </div>
        <div style={{ textAlign:"center", padding:"24px 0" }}>
          <div style={{ fontSize:44 }}>🔐</div>
          <div style={{ fontWeight:900, color:accent, fontSize:14, marginTop:10 }}>CÁPSULA ENTREGUE</div>
          <div style={{ fontSize:12, color:thm.muted, marginTop:8, lineHeight:1.5 }}>
            A tua mensagem está guardada em segurança.<br/>A Teresa irá revelá-la no final do programa.
          </div>
          {capData.sealedAt && <div style={{ fontSize:10, color:thm.sub, marginTop:8 }}>Selada a {capData.sealedAt}</div>}
        </div>
      </div>
    );

    if (!isSlot2 && isSealed) return (
      <div style={{ ...thm.card, borderTop:`2px solid ${accent}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <span style={{ fontSize:24 }}>📦</span>
          <div>
            <div style={{ fontSize:13, fontWeight:900, color:thm.text }}>{title}</div>
            <div style={{ fontSize:10, color:accent, fontWeight:800 }}>Abre em {capData.lockedDate}</div>
          </div>
        </div>
        <div style={{ textAlign:"center", padding:"20px 0" }}>
          <div style={{ fontSize:40 }}>🔒</div>
          <div style={{ fontWeight:900, color:accent, fontSize:14, marginTop:10 }}>CÁPSULA SELADA</div>
          <div style={{ fontSize:12, color:thm.muted, marginTop:8 }}>
            Poderás ler a tua mensagem em:<br/>
            <strong style={{ color: light ? "#1e293b" : "#fff", fontSize:16 }}>{capData.lockedDate}</strong>
          </div>
          {capData.sealedAt && <div style={{ fontSize:10, color:thm.sub, marginTop:6 }}>Selada a {capData.sealedAt}</div>}
        </div>
      </div>
    );

    if (isSlot2 && isRevealed) return (
      <div style={{ ...thm.card, borderTop:`2px solid ${accent}` }}>
        <div style={{ fontSize:24, marginBottom:6 }}>💌</div>
        <div style={{ fontWeight:900, color:accent, marginBottom:12 }}>A TUA CÁPSULA FINAL</div>
        {capData.text && <div style={{ fontSize:14, color:thm.text, lineHeight:1.7, whiteSpace:"pre-wrap", marginBottom:12 }}>{capData.text}</div>}
        {capData.mediaUrl && capData.mediaType === "image" && <img src={capData.mediaUrl} alt="" style={{ width:"100%", borderRadius:14, marginBottom:12 }}/>}
        {capData.mediaUrl && capData.mediaType === "audio" && <audio controls src={capData.mediaUrl} style={{ width:"100%", marginBottom:12 }}/>}
        {capData.mediaUrl && capData.mediaType === "video" && <video controls src={capData.mediaUrl} style={{ width:"100%", borderRadius:14, marginBottom:12 }}/>}
      </div>
    );

    // Write state (not sealed)
    return (
      <div style={{ ...thm.card, borderTop:`2px solid ${accent}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <span style={{ fontSize:24 }}>{isSlot2 ? "💌" : "📦"}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:900, color:thm.text }}>{title}</div>
            <div style={{ fontSize:10, color:accent, fontWeight:800 }}>{isSlot2 ? "Aberta pela Teresa no final do programa" : `Abre em ${targetLabel}`}</div>
          </div>
        </div>
        <div style={{ fontSize:12, color:thm.muted, lineHeight:1.6, marginBottom:16 }}>{desc}</div>

        <div style={{ display:"flex", gap:6, marginBottom:16 }}>
          {[["texto","✏️ Texto"],["foto","📸 Foto"],["audio","🎙 Áudio"],["video","🎬 Vídeo"]].map(([t,l]) => (
            <button key={t} onClick={() => setMediaTab(t)} style={{
              flex:1, padding:"8px 4px", borderRadius:10, border:"none", cursor:"pointer", fontSize:11, fontWeight:800,
              background: mediaTab === t ? `${accent}18` : light ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)",
              color: mediaTab === t ? accent : thm.sub,
              boxShadow: mediaTab === t ? `0 0 0 1px ${accent}30` : "none",
            }}>{l}</button>
          ))}
        </div>

        {mediaTab === "texto" && (
          <>
            <div style={{ fontSize:11, color:thm.sub, marginBottom:8, lineHeight:1.5 }}>
              Sugestões: Como te sentes agora? Quais são os teus maiores medos? O que queres que seja diferente {isSlot2 ? "no final do programa" : "em Dezembro"}?
            </div>
            <textarea value={capData.text || ""} onChange={e => saveText(e.target.value)}
              style={{ ...thm.inp, fontSize:13, resize:"none", marginBottom:12 }} rows={5}
              placeholder="Olá, eu do futuro. Hoje é..." />
          </>
        )}

        {mediaTab === "foto" && (
          <div style={{ marginBottom:16 }}>
            <input type="file" id={`cap-foto-${slot}`} accept="image/*" onChange={handleFile} style={{ display:"none" }} />
            {capData.mediaUrl && capData.mediaType === "image"
              ? <img src={capData.mediaUrl} alt="" style={{ width:"100%", borderRadius:12, marginBottom:10 }}/>
              : null}
            <label htmlFor={`cap-foto-${slot}`} style={{
              display:"block", textAlign:"center", padding:"20px", borderRadius:14,
              border:`2px dashed ${accent}40`, cursor:"pointer", color:accent, fontWeight:800, fontSize:13,
            }}>
              {uploading ? "A carregar..." : capData.mediaUrl && capData.mediaType==="image" ? "📸 Substituir foto" : "📸 Escolher foto"}
            </label>
          </div>
        )}

        {mediaTab === "audio" && (
          <div style={{ marginBottom:16, textAlign:"center" }}>
            {capData.mediaUrl && capData.mediaType === "audio" && (
              <audio controls src={capData.mediaUrl} style={{ width:"100%", marginBottom:12 }}/>
            )}
            {!recording
              ? <button onClick={startAudio} style={{ background:accent, color:"#fff", border:"none", borderRadius:30, padding:"14px 30px", fontWeight:900, cursor:"pointer", fontSize:13 }}>
                  🎙 Gravar Áudio
                </button>
              : <button onClick={stopAudio} style={{ background:"#f43f5e", color:"#fff", border:"none", borderRadius:30, padding:"14px 30px", fontWeight:900, cursor:"pointer", fontSize:13, animation:"fire-pulse 1s infinite" }}>
                  ⏹ Parar Gravação
                </button>
            }
            {uploading && <div style={{ fontSize:12, color:thm.sub, marginTop:10 }}>A guardar...</div>}
          </div>
        )}

        {mediaTab === "video" && (
          <div style={{ marginBottom:16 }}>
            <input type="file" id={`cap-video-${slot}`} accept="video/*" onChange={handleFile} style={{ display:"none" }} />
            {capData.mediaUrl && capData.mediaType === "video"
              ? <video controls src={capData.mediaUrl} style={{ width:"100%", borderRadius:12, marginBottom:10 }}/>
              : null}
            <label htmlFor={`cap-video-${slot}`} style={{
              display:"block", textAlign:"center", padding:"20px", borderRadius:14,
              border:`2px dashed ${accent}40`, cursor:"pointer", color:accent, fontWeight:800, fontSize:13,
            }}>
              {uploading ? "A carregar..." : capData.mediaUrl && capData.mediaType==="video" ? "🎬 Substituir vídeo" : "🎬 Escolher vídeo"}
            </label>
          </div>
        )}

        <Btn color={accent} onClick={() => sealCapsule(slot)}
          disabled={!capData.text?.trim() && !capData.mediaUrl}>
          🔒 Trancar a cápsula
        </Btn>
      </div>
    );
  }

  return (
    <div>
      <div style={{ ...thm.card, marginBottom:20 }}>
        <div style={{ fontSize:24, marginBottom:10 }}>⏳</div>
        <div style={{ fontSize:15, fontWeight:900, color:thm.text, marginBottom:8 }}>Cápsulas do Tempo</div>
        <div style={{ fontSize:12, color:thm.muted, lineHeight:1.6 }}>
          Deixa mensagens para ti mesmo/a que ficam trancadas. Só tu as consegues abrir nas datas certas — e o impacto de veres de onde partiste é brutal.
        </div>
      </div>

      <CapsuleWidget
        slot={1}
        capData={cap}
        title="Cápsula de Meio-Caminho"
        targetLabel="Dezembro 2026"
        desc="Uma mensagem para ti próprio/a quando chegar ao meio do programa. Vai ficar trancada — só tu consegues abrir."
      />

      <CapsuleWidget
        slot={2}
        capData={cap2}
        title="Cápsula Final"
        targetLabel="Final do Programa (Jul 2027)"
        desc="A tua carta mais especial — para leres no último dia do programa. O impacto de veres de onde partiste é brutal."
      />
    </div>
  );
}
