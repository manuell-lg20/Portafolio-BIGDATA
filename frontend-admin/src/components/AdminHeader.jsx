import React from "react";
import { getBaseUrl } from "../api.js";

export default function AdminHeader({ onDisconnect }) {
  return (
    <header className="admin-header">
      <div className="admin-header-inner">
        <div className="brand">
          <span className="brand-mark">BD</span>
          <span className="brand-text">Administración de módulos</span>
        </div>
        <div className="admin-header-right">
          <span className="connected-to">Conectado a: {getBaseUrl()}</span>
          <button className="btn-ghost" onClick={onDisconnect}>
            Cambiar conexión
          </button>
        </div>
      </div>
    </header>
  );
}
