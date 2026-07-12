import React, { useState } from "react";
import { createModule } from "../api.js";

export default function ModuleList({ modules, activeId, onSelect, onCreated }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("El módulo necesita un título.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const mod = await createModule({ title, description });
      setTitle("");
      setDescription("");
      setShowForm(false);
      onCreated(mod);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="module-list-panel">
      <div className="module-list-header">
        <p className="sidebar-heading">Módulos ({modules.length})</p>
        <button className="btn-link" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancelar" : "+ Nuevo módulo"}
        </button>
      </div>

      {showForm && (
        <form className="create-form" onSubmit={handleCreate}>
          <input
            className="text-input"
            placeholder="Título del módulo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          <textarea
            className="text-input"
            placeholder="Descripción (opcional)"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Creando…" : "Crear módulo"}
          </button>
          {error && <p className="form-error">{error}</p>}
        </form>
      )}

      <ul className="sidebar-list">
        {modules.length === 0 && !showForm && (
          <p className="empty-state">Aún no has creado ningún módulo. Usa “+ Nuevo módulo”.</p>
        )}
        {modules.map((mod, i) => (
          <li key={mod.id}>
            <button
              className={`sidebar-item ${mod.id === activeId ? "sidebar-item-active" : ""}`}
              onClick={() => onSelect(mod.id)}
            >
              <span className="sidebar-week">{String(i + 1).padStart(2, "0")}</span>
              <span className="sidebar-title">{mod.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
