import React from "react";

export default function Footer() {
  return (
    <footer id="acerca" className="site-footer">
      <div className="site-footer-inner">
        <p>
          Portafolio de documentación · Curso de Big Data · {new Date().getFullYear()}
        </p>
        <p className="footer-muted">Evidencias de trabajos de VMLG.</p>
      </div>
    </footer>
  );
}
