import React from "react";

function WorkIcon({ type }) {
  if (type === "link") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
        <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

export default function ModuleDetail({ mod }) {
  return (
    <article className="detail-panel">
      <h2 className="detail-title">{mod.title}</h2>
      {mod.description && <p className="detail-desc">{mod.description}</p>}

      <h4 className="files-heading">Trabajos y evidencias</h4>
      {mod.works.length === 0 ? (
        <p className="empty-state">Todavía no hay trabajos cargados para este módulo.</p>
      ) : (
        <ul className="files-list">
          {mod.works.map((w) => (
            <li key={w.id}>
              <a href={w.url} target="_blank" rel="noreferrer" className="work-link">
                <span className="work-icon">
                  <WorkIcon type={w.type} />
                </span>
                {w.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
