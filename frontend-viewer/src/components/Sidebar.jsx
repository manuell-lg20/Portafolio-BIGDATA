import React from "react";

export default function Sidebar({ modules, activeId, onSelect }) {
  return (
    <nav className="sidebar" aria-label="Lista de módulos">
      <p className="sidebar-heading">Módulos</p>
      <ul className="sidebar-list">
        {modules.map((mod, i) => {
          const hasWorks = mod.works.length > 0;
          const isActive = mod.id === activeId;
          return (
            <li key={mod.id}>
              <button
                className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
                onClick={() => onSelect(mod.id)}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="sidebar-week">{String(i + 1).padStart(2, "0")}</span>
                <span className="sidebar-item-text">
                  <span className="sidebar-title">{mod.title}</span>
                  <span className={`sidebar-dot ${hasWorks ? "dot-done" : "dot-pending"}`} aria-hidden="true" />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
