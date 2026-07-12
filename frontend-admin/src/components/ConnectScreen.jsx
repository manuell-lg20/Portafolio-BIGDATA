import React, { useState } from "react";
import { saveConfig, testConnection } from "../api.js";

export default function ConnectScreen({ onConnected }) {
  const [baseUrl, setBaseUrl] = useState("http://localhost:4000");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!baseUrl.trim() || !token.trim()) {
      setError("Completa la URL del backend y el token de administrador.");
      return;
    }
    setChecking(true);
    try {
      await testConnection(baseUrl);
      saveConfig(baseUrl, token);
      onConnected();
    } catch (e) {
      setError("No se pudo conectar con esa URL. Verifica que el backend esté corriendo y sea accesible.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="connect-screen">
      <form className="connect-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Panel de administración</p>
        <h1>Conéctate a tu backend</h1>
        <p className="connect-lede">
          Indica la URL de tu API (local o ya desplegada en Render) y el token de
          administrador que configuraste ahí como variable de entorno <code>ADMIN_TOKEN</code>.
        </p>

        <label className="field-label">URL del backend</label>
        <input
          className="text-input"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://tu-backend.onrender.com"
        />

        <label className="field-label">Token de administrador</label>
        <input
          className="text-input"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="El mismo valor de ADMIN_TOKEN"
        />

        <button className="btn-primary" type="submit" disabled={checking}>
          {checking ? "Conectando…" : "Conectar"}
        </button>

        {error && <p className="form-error">{error}</p>}
      </form>
    </div>
  );
}
