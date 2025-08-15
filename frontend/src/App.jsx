import React from "react";

export default function App() {
  return (
    <div style={{ fontFamily: "sans-serif", padding: 24 }}>
      <h1>Plataforma Analítica Unificada</h1>
      <p>Frontend inicial pronto. Configure o Firebase em <code>src/auth.js</code>.</p>
      <ul>
        <li>Dashboards: P&L, HC, Vagas, SLAs de CV</li>
        <li>ETL: Upload de PR e Inventário de Vagas</li>
        <li>CVs: Upload em lote, score, comparação, análise</li>
      </ul>
    </div>
  );
}
