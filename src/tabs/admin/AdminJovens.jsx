import React, { useState } from 'react';
import { CYN } from "../../theme.jsx";
import AdminUsers from './AdminUsers.jsx';
import AdminRelatorio from './AdminRelatorio.jsx';

export default function AdminJovens({ amMedals, setAmMedals, allShared, weekStartTs }) {
  const [sub, setSub] = useState("dossiers");
  return (
    <div>
      <div style={{ display:"flex", gap:4, marginBottom:20, background:"rgba(0,0,0,0.3)", borderRadius:14, padding:4 }}>
        {[["dossiers","👥 Dossiers"],["relatorio","📈 Relatório"]].map(([id,label]) => (
          <button key={id} onClick={() => setSub(id)} style={{
            flex:1, padding:"10px", borderRadius:10, border:"none", cursor:"pointer",
            background: sub === id ? CYN : "transparent",
            color: sub === id ? "#0f172a" : "#94a3b8",
            fontWeight:900, fontSize:12,
          }}>{label}</button>
        ))}
      </div>
      {sub === "dossiers"  && <AdminUsers amMedals={amMedals} setAmMedals={setAmMedals} allShared={allShared} weekStartTs={weekStartTs} />}
      {sub === "relatorio" && <AdminRelatorio allShared={allShared} />}
    </div>
  );
}
