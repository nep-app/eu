import React, { useState, useRef } from 'react';
import { doc, setDoc, collection, addDoc, getDocs, deleteDoc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase.js";
import { CARD, SL, CYN, PNK, INP, Btn, SubTabs, RadarChart, BG, TXT_MUT } from "../theme.jsx";
import {
  upd, nowLabel, nowFull, RODA_DIMS, ALL_MEDALS, DEF_RODA, DEF_CAP, getWeekKey
} from "../data.js";

const DEF_CAP2 = { text:"", locked:false, revealed:false, lockedDate:"" };

export default function PerfilTab({ user, data, features = {} }) {
  const [subTab, setSubTab] = useState("roda");
  const [expandedDim, setExpandedDim] = useState(null);

  const uData = data.userData || {};
  const roda = uData.roda || DEF_RODA;
  const rodaSaves = uData.rodaSaves || [];
  const cap  = uData.cap  || DEF_CAP;
  const cap2 = uData.cap2 || DEF_CAP2;
  const history    = data.history || [];
  const medalDoc    = data.medals || {};
  const weekKey     = getWeekKey();
  const weekMedals  = (medalDoc.weekKey === weekKey ? medalDoc.week : []) || [];
  const userMedals  = medalDoc.allTime || [];

  // ── LIGHT THEME (só para teresa) ──
  const light = user.username === "teresa";
  // Cards mantêm-se escuros; só o wrapper muda de cor
  const thm = {
    card:    CARD,
    sl:      SL,
    text:    "#f1f5f9",
    muted:   "#94a3b8",
    sub:     "#64748b",
    divider: "1px solid rgba(255,255,255,0.05)",
    rowBg:   "rgba(0,0,0,0.18)",
    inp:     INP,
    medal:   { background:`${CYN}10`, border:`1px solid ${CYN}30` },
  };

  function formatarDataHora(ts, dataAntiga) {
    if (!ts) return dataAntiga;
    const d = new Date(ts);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dia}/${mes} às ${hora}:${min}`;
  }

  async function saveRoda(share) {
    try {
      const ts = nowFull();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = uData.lastActiveDay === today ? (uData.dayStreak || 1) : (uData.lastActiveDay === yesterday ? (uData.dayStreak || 0) + 1 : 1);
      const streakUpdate = uData.lastActiveDay !== today ? { dayStreak: newStreak, lastActiveDay: today } : {};
      const newSaves = [...rodaSaves, { label: nowLabel(), savedAt: ts, scores: { ...roda } }];
      const newH = [...history, { date: ts, action: `Atualizou Roda da Vida (${share ? "Enviado à Admin" : "Privado"})`, ts: Date.now(), xp: 20 }];
      await setDoc(doc(db, "userData", user.username), {
        roda, rodaSaves: newSaves, rodaShared: share, rodaSavedAt: ts,
        history: newH, weekXp: (uData.weekXp || 0) + 20, ...streakUpdate
      }, { merge: true });
      if (share) {
        await addDoc(collection(db, "adminNotificacoes"), {
          tipo: "RODA", jovem: user.username, ts: Date.now(), lida: false
        });
      }
      alert(share ? "Roda enviada para a Teresa! 🌸" : "Roda guardada no teu histórico.");
    } catch (e) { alert("Erro ao guardar a roda."); }
  }

  const updateRoda = (id, val) => {
    setDoc(doc(db, "userData", user.username), { roda: { ...roda, [id]: val } }, { merge: true });
  };

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

  function doExport() {
    const exportData = {
      utilizador: user.realName, dataExportacao: new Date().toISOString(),
      percurso: uData.pia || {}, atividades: uData.piaActs || [],
      autoavaliacao: uData.dScores || {}, rodaDaVida: roda,
      historicoRodas: rodaSaves, medalhas: userMedals, historicoAcoes: history
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `jeep_dados_${user.username}.json`;
    a.click(); URL.revokeObjectURL(url);
  }

  async function limparTudoDev() {
    if (window.confirm("🚨 MODO DEV: Queres reverter o estado das avaliações e APAGAR as tarefas/agenda para testar do zero?")) {
      await setDoc(doc(db, "userData", user.username), {
        autoSaved: false, sSaved: false, answered: false, piaSaved: false, completedMissions: [],
        roda: {}, rodaSaves: [], rodaShared: false,
      }, { merge: true });
      const todosSnap = await getDocs(collection(db, "todos", user.username, "items"));
      todosSnap.forEach(async (d) => { await deleteDoc(d.ref); });
      const evtsSnap = await getDocs(query(collection(db, "events"), where("userId", "==", user.username)));
      evtsSnap.forEach(async (d) => { await deleteDoc(d.ref); });
      alert("Limpeza efetuada com sucesso! A página vai recarregar.");
      window.location.reload();
    }
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
    <div style={{
      padding: "18px 16px",
      background: "transparent",
      minHeight: "100vh",
    }}>

      {/* ── MEDALHAS ── */}
      {userMedals.length > 0 && (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:2, textTransform:"uppercase", color: light ? "#64748b" : "#7a90b0", marginBottom:10 }}>
            🏅 {userMedals.length} Medalha{userMedals.length !== 1 ? "s" : ""} no total
          </div>
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
            {userMedals.map(mId => {
              const m = ALL_MEDALS.find(x => x.id === mId);
              const isThisWeek = weekMedals.includes(mId);
              return m ? (
                <div key={mId} style={{
                  flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center",
                  gap:4, padding:"12px 14px", borderRadius:16,
                  background: isThisWeek ? `${CYN}18` : "rgba(255,255,255,0.05)",
                  border: isThisWeek ? `1px solid ${CYN}40` : "1px solid rgba(255,255,255,0.10)",
                  minWidth:70,
                }}>
                  <span style={{ fontSize:24 }}>{m.icon}</span>
                  <span style={{ fontSize:9, fontWeight:900, color: isThisWeek ? CYN : "#5a7a9a", textAlign:"center", lineHeight:1.2 }}>{m.label.toUpperCase()}</span>
                  {isThisWeek && <span style={{ fontSize:8, color:CYN, fontWeight:700 }}>esta semana</span>}
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      <SubTabs
        options={[["roda","🌸 Roda"],["hist","📜 Hist."],["cap","💌 Cápsula"],["info","📤 Info"]]}
        active={subTab} onChange={setSubTab} color={PNK}
        wrapStyle={light ? { background:"rgba(255,255,255,0.55)", border:"1px solid rgba(0,0,0,0.10)" } : {}}
      />

      {/* ── RODA DA VIDA ── */}
      {subTab === "roda" && !features.rodaVida && (
        <div style={{ ...thm.card, textAlign:"center", padding:"48px 20px", marginTop:16 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🔐</div>
          <div style={{ fontWeight:900, fontSize:15, color:thm.sub, marginBottom:8 }}>Roda da Vida</div>
          <div style={{ fontSize:13, color:thm.muted, lineHeight:1.6 }}>
            A Teresa ainda não lançou esta secção.<br/>Fica atento!
          </div>
        </div>
      )}
      {subTab === "roda" && features.rodaVida && (
        <div>
          <div style={thm.card}>
            <div style={thm.sl}>A Minha Roda Atual</div>
            <RadarChart scores={roda} color={PNK} prev={rodaSaves.length > 0 ? rodaSaves[rodaSaves.length - 1].scores : null} />
            <div style={{ fontSize:10, color:thm.muted, textAlign:"center", marginTop:8, lineHeight:1.5 }}>
              De 0 a 10 — quando a roda fica torta, é porque alguma área precisa de atenção.<br/>
              {rodaSaves.length > 0 && <span>Linha tracejada = avaliação anterior ({rodaSaves[rodaSaves.length-1].label}).</span>}
            </div>
          </div>

          {RODA_DIMS.map(dim => {
            const isOpen = expandedDim === dim.id;
            const val = roda[dim.id];
            const dimCard  = light ? { ...CARD, background:"rgba(255,255,255,0.85)", boxShadow:"0 2px 12px rgba(0,0,0,0.08)" } : thm.card;
            const dimText  = light ? "#1e293b" : thm.text;
            const dimSub   = light ? "#64748b" : thm.sub;
            const dimMuted = light ? "#64748b" : thm.muted;
            return (
              <div key={dim.id} style={{ ...dimCard, padding:"16px 18px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:22 }}>{dim.icon}</span>
                    <span style={{ fontWeight:900, fontSize:14, color:dimText }}>{dim.label}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontWeight:900, color:PNK, fontSize:22 }}>{val}</span>
                    <button onClick={() => setExpandedDim(isOpen ? null : dim.id)} style={{
                      background:"none", border:"none", cursor:"pointer",
                      fontSize:10, color:dimSub, fontWeight:700, padding:0,
                    }}>
                      {isOpen ? "▲ fechar" : "▼ o que é isto?"}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="fade-up" style={{ marginTop:14 }}>
                    <div style={{ fontSize:13, color:dimMuted, lineHeight:1.6, marginBottom:14 }}>{dim.desc}</div>
                    <input type="range" min="0" max="10" value={val}
                      onChange={(e) => updateRoda(dim.id, Number(e.target.value))}
                      style={{ width:"100%", accentColor:PNK }}
                    />
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:dimSub, marginTop:4 }}>
                      <span>0 Muito mal</span>
                      <span>10 Óptimo</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <Btn variant="dark" onClick={() => saveRoda(false)}>💾 Guardar Privado</Btn>
            <Btn color={PNK} onClick={() => saveRoda(true)}>🚀 Enviar à Teresa</Btn>
          </div>
        </div>
      )}

      {/* ── HISTÓRICO ── */}
      {subTab === "hist" && (() => {
        const readNotifs = (data.myNotifs || []).filter(n => n.read).map(n => ({
          _isNotif: true,
          action: n.text || "",
          ts: n.ts || 0,
          date: n.date || "",
          id: n.id,
        }));
        const allEntries = [
          ...history.map(h => ({ ...h, _isNotif: false })),
          ...readNotifs,
        ].sort((a, b) => (b.ts || 0) - (a.ts || 0));
        return (
          <div style={thm.card}>
            <div style={thm.sl}>📜 Registo de Atividades</div>
            {allEntries.length === 0 ? (
              <div style={{ textAlign:"center", color:thm.muted, fontSize:12 }}>Sem registos.</div>
            ) : (
              allEntries.map((h, i) => (
                <div key={h._isNotif ? `n-${h.id}` : i} style={{ padding:"12px 0", borderBottom: thm.divider, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ fontSize:13, fontWeight:700, flex:1, color: h._isNotif ? "#94a3b8" : thm.text, opacity: h._isNotif ? 0.75 : 1 }}>
                    {h.action}
                  </div>
                  <div style={{ fontSize:10, color: h._isNotif ? "#475569" : CYN, fontWeight:800, marginLeft:10, flexShrink:0 }}>
                    {formatarDataHora(h.ts, h.date)}
                  </div>
                </div>
              ))
            )}
          </div>
        );
      })()}

      {/* ── DUAS CÁPSULAS ── */}
      {subTab === "cap" && (
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
      )}

      {/* ── INFO ── */}
      {subTab === "info" && (
        <>
          <div style={thm.card}>
            <div style={thm.sl}>Como Usar a App</div>
            <div style={{ fontSize:12, color:thm.muted, lineHeight:1.6, marginBottom:16 }}>
              O JEEP EDUCA+ acompanha o teu percurso no programa. Aqui está um resumo rápido de cada área:
            </div>
            {[
              { icon:"🏠", title:"Início", desc:"O teu painel principal. Aqui tens tudo de um relance: as Ações Pendentes (desafios que a Teresa lançou e ainda não completaste), as tuas tarefas, notificações recebidas, eventos próximos e muito mais." },
              { icon:"🏆", title:"Desafios", desc:"A Teresa lança desafios ao longo do programa. Quando há algo novo aparece em Ações Pendentes:\n• Pergunta da Semana — uma reflexão pessoal\n• Autoavaliação — avalias as tuas competências\n• Satisfação — como está a correr o programa\n• Dilemas — situações para pensares e decidires" },
              { icon:"🚀", title:"PIA — Plano Individual de Ação", desc:"O teu plano pessoal de desenvolvimento. A Teresa vai desbloqueando as secções gradualmente. Preenche cada uma ao teu ritmo e envia quando estiver pronta — só aí fica registada no teu progresso." },
              { icon:"💬", title:"Fórum", desc:"Espaço de conversa com o grupo. Podes publicar em diferentes canais temáticos, reagir com emojis às mensagens dos outros e responder em thread. É o espaço coletivo do programa." },
              { icon:"✅", title:"Tarefas", desc:'A tua lista pessoal. Crias as tuas próprias tarefas e podes marcar "Partilhar com a Teresa" para ela acompanhar. A Teresa também pode sugerir-te tarefas (aceitas ou recusas) ou adicioná-las diretamente à tua lista.' },
              { icon:"📅", title:"Eventos e Agenda", desc:"Podes criar os teus próprios eventos e escolher partilhá-los com a Teresa. Ela também pode agendar eventos no teu calendário diretamente, ou propor datas — nesse caso aparece em Ações Pendentes para tu aceitares ou recusares." },
              { icon:"👤", title:"Perfil", desc:"Tem quatro sub-secções:\n• Roda da Vida — avalia as diferentes áreas da tua vida e envia à Teresa\n• Histórico — registo de tudo o que fizeste e XP ganho\n• Cápsulas — mensagens que trancas para o futuro\n• Info — este guia e exportação dos teus dados" },
              { icon:"📱", title:"Falar com a Teresa", desc:"No Início, em baixo, podes enviar uma mensagem diretamente à Teresa — dúvidas, sugestões ou desabafos. Podes enviá-la de forma anónima se preferires. Ela pode também ser contactada por WhatsApp ou email." },
              { icon:"🔔", title:"Notificações", desc:"Quando a Teresa reage ou responde a algo que enviaste (resposta à tua pergunta, feedback ao PIA, etc.), recebes uma notificação no Início. Aparece também quando ela te propõe tarefas ou eventos." },
              { icon:"⭐", title:"Destaques da Semana", desc:"No Início aparece sempre uma caixa com os 3 jovens mais ativos da semana — determinados pelo XP ganho. A ordem em que aparecem é aleatória e muda a cada vez que abres a app. Só a Teresa sabe a classificação real. Ganhas XP ao completar desafios, tarefas, missões e outras ações." },
            ].map(item => (
              <div key={item.title} style={{ display:"flex", gap:12, padding:"12px 0", borderBottom: thm.divider }}>
                <div style={{ fontSize:22, flexShrink:0, width:28, textAlign:"center" }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:900, color:thm.text, marginBottom:3 }}>{item.title}</div>
                  <div style={{ fontSize:12, color:thm.muted, lineHeight:1.5, whiteSpace:"pre-line" }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={thm.card}>
            <div style={thm.sl}>Gestão de Dados</div>
            <div style={{ fontSize:13, color:thm.muted, lineHeight:1.6, marginBottom:20 }}>
              De acordo com o RGPD, tens o direito de descarregar todos os teus dados guardados nesta plataforma.
            </div>
            <Btn variant="dark" onClick={doExport}>⬇️ DESCARREGAR RELATÓRIO</Btn>
          </div>

          {user.username === "teresa" && (
            <div style={{ ...thm.card, background:"rgba(244,63,94,0.1)", border:"2px dashed #f43f5e", marginTop:20 }}>
              <div style={{ ...thm.sl, color:"#f43f5e" }}>🔧 Ferramentas de Teste</div>
              <p style={{ fontSize:"12px", color:"#cbd5e1", marginTop:0, marginBottom:"15px" }}>
                Como és a conta de testes, podes limpar o teu progresso para veres as "Ações Pendentes" novamente na Home.
              </p>
              <button onClick={limparTudoDev} style={{ width:"100%", padding:"12px", background:"#f43f5e", color:"white", fontWeight:"900", border:"none", borderRadius:"12px", cursor:"pointer", fontSize:"13px" }}>
                ↻ APAGAR TAREFAS / AGENDA (Manter Histórico)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
