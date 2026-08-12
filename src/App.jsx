import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, fetchSignInMethodsForEmail } from "firebase/auth";
import { doc, setDoc, onSnapshot, arrayUnion } from "firebase/firestore";
import { auth, db } from "./firebase.js";
import { AppIcon, BG, CYN } from "./theme.jsx";
import { ALLOWED_USERNAMES, BLOCKED_USERNAMES, USERS, nowLabel, GDPR_TEXT } from "./data.js";
import TeresaAdmin from "./TeresaAdmin.jsx";
import JovensApp from "./JovensApp.jsx";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [emManutencao, setEmManutencao] = useState(false);

  useEffect(() => {
    return onSnapshot(doc(db, "config", "features"), s => {
      setEmManutencao(s.exists() ? !!s.data().emManutencao : false);
    });
  }, []);
  const [uIn, setUIn] = useState("");
  const [pIn, setPIn] = useState("");
  const [lErr, setLErr] = useState("");
  const [regUser, setRegUser] = useState("");
  const [regPw, setRegPw] = useState("");
  const [regPw2, setRegPw2] = useState("");
  const [gdprOk, setGdprOk] = useState(false);
  const [regErr, setRegErr] = useState("");
  const [novoUser, setNovoUser] = useState("");
  const [novoErr, setNovoErr] = useState("");
  const [showGdpr, setShowGdpr] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) { setLoading(false); setScreen("login"); return; }
      const email = fbUser.email || "";
      const uname = email.replace("@jeep.app", "");
      // Conta bloqueada: fecha a sessão automaticamente (mesmo que já estivesse
      // logado no aparelho dele) e não deixa voltar a entrar.
      if (BLOCKED_USERNAMES.includes(uname)) {
        signOut(auth);
        setUser(null); setScreen("login"); setLoading(false);
        setLErr("Este acesso está desativado. Fala com a Teresa.");
        return;
      }
      if (uname === "admin") {
        setUser({ username:"admin", realName:"Teresa (GO)", color:"#22d3ee", isAdmin:true });
        setScreen("app");
      } else {
        const f = USERS.find(u => u.username === uname);
        if (f) {
          setUser(f); setScreen("app");
          const nowIso = new Date().toISOString();
          // Regista a última entrada e ACRESCENTA ao histórico de entradas
          // (uma por sessão do navegador) para a Teresa ver tudo no admin.
          // Não dá XP — é só registo. Escreve no próprio doc users (permitido).
          const registarEntrada = !sessionStorage.getItem("jeep_entrada_registada");
          if (registarEntrada) sessionStorage.setItem("jeep_entrada_registada", "1");
          setDoc(doc(db, "users", uname), {
            lastLogin: nowIso,
            ...(registarEntrada ? { logins: arrayUnion({ ts: Date.now(), iso: nowIso }) } : {}),
          }, { merge:true }).catch(() => {});
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
    if (BLOCKED_USERNAMES.includes(u)) { setLErr("Este acesso está desativado. Fala com a Teresa."); return; }
    if (u !== "admin" && u !== "demo" && !ALLOWED_USERNAMES.includes(u)) { setLErr("Username não autorizado."); return; }
    if (!pIn) { setLErr("Introduz a tua password."); return; }
    try {
      await signInWithEmailAndPassword(auth, u + "@jeep.app", pIn);
    } catch(e) {
      // O Firebase devolve "invalid-credential" tanto para password errada como
      // para conta inexistente — não dá para distinguir. Por isso mostramos um
      // erro claro e encaminhamos para "Criar conta" quem ainda não tem conta,
      // em vez de saltar automaticamente para o registo (que confundia).
      if (e.code === "auth/user-not-found" || e.code === "auth/invalid-credential"
          || e.code === "auth/invalid-email" || e.code === "auth/wrong-password") {
        setLErr("Username ou password incorretos. Se é a tua primeira vez aqui, usa \"Criar conta\" em baixo. 👇");
        return;
      }
      if (e.code === "auth/too-many-requests") { setLErr("Demasiadas tentativas. Espera um pouco e tenta de novo."); return; }
      setLErr("Não foi possível entrar. Verifica a ligação e tenta de novo.");
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

  // Fluxo "novo utilizador": valida o nome contra a lista autorizada e, se
  // estiver, segue direto para a criação de password + RGPD (sem passwords à toa).
  async function irParaRegisto() {
    const u = novoUser.toLowerCase().trim();
    setNovoErr("");
    if (!u) { setNovoErr("Escreve o teu nome de utilizador."); return; }
    if (BLOCKED_USERNAMES.includes(u)) { setNovoErr("Este acesso está desativado. Fala com a Teresa."); return; }
    if (u === "admin" || !ALLOWED_USERNAMES.includes(u)) {
      setNovoErr("Esse nome não está autorizado. Pede à Teresa para te adicionar."); return;
    }
    // Já existe conta com este nome? → não deixar "criar" de novo; mandar ao login.
    try {
      const metodos = await fetchSignInMethodsForEmail(auth, u + "@jeep.app");
      if (metodos && metodos.length > 0) {
        setScreen("login"); setUIn(u); setPIn("");
        setLErr("Já tens conta! Entra com a tua password. (Esqueceste-te? Fala com a Teresa.)");
        setNovoUser(""); setNovoErr("");
        return;
      }
    } catch (e) { /* se a verificação falhar, seguimos — o passo de criar conta trata do resto */ }
    setRegUser(u); setRegPw(""); setRegPw2(""); setRegErr(""); setGdprOk(false);
    setScreen("register");
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

  if (screen === "novo") {
    return (
      <div style={{ minHeight:"100vh", background:BG, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif", padding:16, boxSizing: "border-box" }}>
        <div style={{ background:"rgba(30, 41, 59, 0.7)", borderRadius:24, padding:"36px 30px", width:"100%", maxWidth:320, border:"1px solid rgba(34, 211, 238, 0.2)", backdropFilter:"blur(10px)", boxSizing:"border-box" }}>
          <div style={{ textAlign:"center", marginBottom:22 }}>
            <AppIcon size={52}/>
            <div style={{ fontSize:19, fontWeight:900, color:"white", marginTop:10 }}>Primeira vez aqui? 👋</div>
            <div style={{ fontSize:12, color:"#94a3b8", marginTop:6, lineHeight:1.5 }}>Escreve o teu nome de utilizador (o que a Teresa te deu). A seguir crias a tua password.</div>
          </div>
          <input value={novoUser} autoFocus onChange={e=>setNovoUser(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")irParaRegisto();}} placeholder="O teu nome de utilizador" style={{ width:"100%", padding:"12px 14px", borderRadius:12, background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:14, marginBottom:10, outline:"none", boxSizing:"border-box" }}/>
          {novoErr && <div style={{ color:"#fb7185", fontSize:12, marginBottom:10 }}>{novoErr}</div>}
          <button onClick={irParaRegisto} style={{ width:"100%", padding:"14px", background:CYN, color:"#0f172a", border:"none", borderRadius:14, fontSize:15, fontWeight:800, cursor:"pointer", boxSizing:"border-box" }}>Continuar →</button>
          <button onClick={()=>{setScreen("login");setNovoErr("");setNovoUser("");}} style={{ width:"100%", marginTop:10, background:"transparent", color:"#94a3b8", border:"none", fontSize:13, cursor:"pointer", boxSizing:"border-box" }}>← Já tenho conta</button>
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
          <div style={{ display:"flex", alignItems:"center", gap:10, margin:"16px 0 12px" }}>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.1)" }}/>
            <span style={{ fontSize:11, color:"#64748b", fontWeight:700 }}>ou</span>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.1)" }}/>
          </div>
          <button onClick={()=>{setScreen("novo");setLErr("");setNovoUser("");setNovoErr("");}} style={{ width:"100%", padding:"13px", background:"transparent", color:CYN, border:`1.5px solid ${CYN}55`, borderRadius:14, fontSize:14, fontWeight:800, cursor:"pointer", boxSizing:"border-box" }}>✨ Primeira vez aqui? Criar conta</button>
        </div>
      </div>
    );
  }

  if (user?.isAdmin) return <TeresaAdmin user={user} onLogout={doLogout} />;

  if (emManutencao && user?.username !== "teresa") return (
    <div style={{ minHeight:"100vh", background:BG, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:300 }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🔧</div>
        <div style={{ fontSize:20, fontWeight:900, color:"white", marginBottom:8 }}>App em manutenção</div>
        <div style={{ fontSize:14, color:"#64748b", lineHeight:1.6, marginBottom:24 }}>Estamos a preparar novidades. Voltamos já!</div>
        {user && <button onClick={doLogout} style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", color:"#64748b", padding:"8px 20px", borderRadius:20, fontSize:12, cursor:"pointer" }}>Sair</button>}
      </div>
    </div>
  );

  return <JovensApp user={user} onLogout={doLogout} />;
}
