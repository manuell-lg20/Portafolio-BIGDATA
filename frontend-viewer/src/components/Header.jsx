import React from "react";

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <a href="#top" className="brand">
          <span className="brand-mark">BD</span>
          <span className="brand-text">Portafolio · Big Data-Levano Guerra</span>
        </a>
        <nav className="site-nav">
          <a href="#modulos">Módulos</a>
          <a href="#acerca">Acerca de</a>
        </nav>
      </div>
    </header>
  );
}
