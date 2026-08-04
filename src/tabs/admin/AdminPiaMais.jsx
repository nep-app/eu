import React, { useState } from 'react';
import { CYN } from "../../theme.jsx";
import AdminPia from './AdminPia.jsx';
import AdminMural from './AdminMural.jsx';

// Aba "PIA +" do admin: junta o PIA e a gestão de Recursos (que antes estava
// dentro do Fórum), a espelhar a organização da app dos jovens.
export default function AdminPiaMais({ allShared }) {
  const [sub, setSub] = useState("pia");
  return (
    <div>
      <div style={{ display:"flex", gap:0, marginBottom:16, background:"rgba(0,0,0,0.3)", borderRadius:14, padding:4 }}>
        {[["pia","📋 PIA"],["recursos","📚 Recursos"]].map(([id,label]) => (
          <button key={id} onClick={() => setSub(id)} style={{
            flex:1, padding:"9px", borderRadius:10, border:"none", cursor:"pointer",
            background: sub===id ? `${CYN}20` : "transparent",
            color: sub===id ? CYN : "#94a3b8", fontWeight:800, fontSize:13,
            boxShadow: sub===id ? `0 0 0 1px ${CYN}35` : "none",
          }}>{label}</button>
        ))}
      </div>

      {sub === "pia"      && <AdminPia allShared={allShared} />}
      {sub === "recursos" && <AdminMural only="recursos" />}
    </div>
  );
}
