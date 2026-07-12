import React from "react";

export default function Footer() {
  return (
    <footer id="acerca" className="site-footer">
      <div className="site-footer-inner">
        <p>
          Portafolio de documentación · Curso de Big Data · {new Date().getFullYear()}
        </p>
        <p className="footer-muted">Construido con React, Express y desplegado en Render.</p>
      </div>
    </footer>
  );
}
