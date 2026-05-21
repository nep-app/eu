import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase.js";
import { AppIcon, BG, CYN } from "./theme.jsx";
import { ALLOWED_USERNAMES, USERS, nowLabel, GDPR_TEXT } from "./data.js";
import TeresaAdmin from "./TeresaAdmin.jsx";
import JovensApp from "./JovensApp.jsx";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [uIn, setUIn] = useState("");
  const [pIn, setPIn] = useState("");
  const [lErr, setLErr] = useState("");
  const [regUser, setRegUser] = useState("");
  const [regPw, setRegPw] = useState("");
  const [regPw2, setRegPw2] = useState("");
  const [gdprOk, setGdprOk] = useState(false);
  const [regErr, setRegErr] = useState("");
  const [showGdpr, setShowGdpr] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) { setLoading(false); setScreen("login"); return; }
      const email = fbUser.email || "";
      const uname = email.replace("@jeep.app", "");
      if (uname === "admin") {
        setUser({ username:"admin", realName:"Teresa (GO)", color:"#22d3ee", isAdmin:true });
        setScreen("app");
      } else {
        const f = USERS.find(u => u.username === uname);
        if (f) {
          setUser(f); setScreen("app");
          setDoc(doc(db, "users", uname), { lastLogin: new Date().toISOString() }, { merge:true });
        } else {
          signOut(auth);
        }
      }
      loading && setLoading(false);
    });
    return unsub;
  }, []);

  async function doLogin() {
    const u = uIn.toLowerCase().trim();
    setLErr("");
    if (!u) { setLErr("Introduz o teu username."); return; }
    if (u !== "admin" && u !== "demo" && !ALLOWED_USERNAMES.includes(u)) { setLErr("Username não autorizado."); return; }
    try {
      await signInWithEmailAndPassword(auth, u + "@jeep.app", pIn);
    } catch(e) {
      if (e.code === "auth/user-not-found" || e.code === "auth/invalid-credential" || e.code === "auth/invalid-email") {
        if (u === "admin") { setLErr("Conta admin não criada."); return; }
        setRegUser(u); setScreen("register"); return;
      }
      setLErr("Password incorreta.");
    }
  }

  async function doRegister() {
    if (regPw.trim().length < 4) { setRegErr("Mínimo 4 caracteres."); return; }
    if (regPw !== regPw2) { setRegErr("As passwords não coincidem."); return; }
    if (!gdprOk) { setRegErr("Tens de aceitar a política de privacidade."); return; }
    try {
      await createUserWithEmailAndPassword(auth, regUser + "@jeep.app", regPw);
      await setDoc(doc(db, "users", regUser), { gdpr:true, gdprDate:nowLabel() });
    } catch(e) {
      if (e.code === "auth/email-already-in-use") {
        setScreen("login");
        setUIn(regUser);
        setLErr("Conta já existe — introduz a tua password.");
        return;
      }
      setRegErr("Erro: " + e.message);
    }
  }

  async function doLogout() {
    await signOut(auth);
    setUser(null); setScreen("login"); setUIn(""); setPIn("");
  }

  if (loading) return <div style={{ minHeight:"100vh", background:BG, display:"flex", alignItems:"center", justifyContent:"center" }}><AppIcon size={64}/></div>;

  if (screen === "register") {
    const regUserInfo = USERS.find(u => u.username === regUser);
    return (
      <div style={{ minHeight:"100vh", background:BG, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif", padding:16, boxSizing: "border-box" }}>
        <div style={{ background:"rgba(30, 41, 59, 0.7)", borderRadius:24, padding:"36px 30px", width:"100%", maxWidth:320, border:"1px solid rgba(34, 211, 238, 0.2)", backdropFilter:"blur(10px)", boxSizing:"border-box" }}>
          <div style={{ textAlign:"center", marginBottom:22 }}>
            <AppIcon size={52}/>
            <div style={{ fontSize:19, fontWeight:900, color:"white", marginTop:10 }}>Criar Conta</div>
            <div style={{ fontSize:12, color:"#94a3b8", marginTop:4 }}>Bem-vindo/a, <strong style={{ color:regUserInfo?regUserInfo.color:"white" }}>{regUser}</strong>!</div>
          </div>
          <input type="password" value={regPw} onChange={e=>setRegPw(e.target.value)} placeholder="Nova Password" style={{ width:"100%", padding:"12px", borderRadius:12, marginBottom:10, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", boxSizing:"border-box", outline:"none" }}/>
          <input type="password" value={regPw2} onChange={e=>setRegPw2(e.target.value)} placeholder="Confirmar Password" style={{ width:"100%", padding:"12px", borderRadius:12, marginBottom:14, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", boxSizing:"border-box", outline:"none" }}/>
          
          <div style={{ padding:14, background:"rgba(0,0,0,0.2)", borderRadius:12, marginBottom:14, border:"1px solid rgba(255,255,255,0.05)", boxSizing:"border-box" }}>
            <div onClick={()=>setShowGdpr(!showGdpr)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", color:"white", fontSize:12, fontWeight:700 }}>
              📋 Política (RGPD) <span style={{fontSize:10, color:"#94a3b8"}}>{showGdpr?"▲":"▼"}</span>
            </div>
            {showGdpr && <div style={{ fontSize:11, color:"#94a3b8", marginTop:10, maxHeight:120, overflowY:"auto" }}>{GDPR_TEXT}</div>}
            <div onClick={()=>setGdprOk(!gdprOk)} style={{ display:"flex", alignItems:"center", gap:10, marginTop:12, cursor:"pointer" }}>
              <div style={{ width:22, height:22, borderRadius:6, background:gdprOk?CYN:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{gdprOk && <span style={{color:"#0f172a", fontWeight:900}}>✓</span>}</div>
              <div style={{ fontSize:12, color:"#cbd5e1" }}>Li e aceito a política</div>
            </div>
          </div>
          {regErr && <div style={{ color:"#fb7185", fontSize:12, marginBottom:10 }}>{regErr}</div>}
          <button onClick={doRegister} style={{ width:"100%", padding:"14px", background:CYN, color:"#0f172a", border:"none", borderRadius:14, fontSize:15, fontWeight:800, cursor:"pointer", boxSizing:"border-box" }}>Criar Conta →</button>
          <button onClick={()=>{setScreen("login");setRegErr("");}} style={{ width:"100%", marginTop:10, background:"transparent", color:"#94a3b8", border:"none", fontSize:13, cursor:"pointer", boxSizing:"border-box" }}>← Voltar</button>
        </div>
      </div>
    );
  }

  if (screen === "login") {
    return (
      <div style={{ minHeight:"100vh", background:BG, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif", padding:16, boxSizing: "border-box" }}>
        <div style={{ background:"rgba(30, 41, 59, 0.7)", borderRadius:24, padding:"40px 34px", width:"100%", maxWidth:320, border:"1px solid rgba(34, 211, 238, 0.2)", backdropFilter:"blur(10px)", boxSizing:"border-box" }}>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <AppIcon size={68}/>
            <div style={{ fontSize:22, fontWeight:900, color:"white", marginTop:12, letterSpacing:1 }}>JEEP</div>
            <div style={{ fontSize:12, color:CYN, marginTop:3, fontWeight:700 }}>EDUCA+</div>
          </div>
          <input value={uIn} onChange={e=>setUIn(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")doLogin();}} placeholder="Username" style={{ width:"100%", padding:"12px 14px", borderRadius:12, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:14, marginBottom:10, outline:"none", boxSizing:"border-box" }}/>
          <input value={pIn} type="password" onChange={e=>setPIn(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")doLogin();}} placeholder="Password" style={{ width:"100%", padding:"12px 14px", borderRadius:12, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:14, marginBottom:10, outline:"none", boxSizing:"border-box" }}/>
          {lErr && <div style={{ color:"#fb7185", fontSize:12, marginBottom:8 }}>{lErr}</div>}
          <button onClick={doLogin} style={{ width:"100%", padding:"14px", background:`linear-gradient(135deg, ${CYN}, #0ea5e9)`, color:"#0f172a", border:"none", borderRadius:14, fontSize:15, fontWeight:800, cursor:"pointer", textTransform:"uppercase", letterSpacing:1, boxSizing:"border-box" }}>Entrar →</button>
        </div>
      </div>
    );
  }

  if (user?.isAdmin) return <TeresaAdmin user={user} onLogout={doLogout} />;
  return <JovensApp user={user} onLogout={doLogout} />;
}
