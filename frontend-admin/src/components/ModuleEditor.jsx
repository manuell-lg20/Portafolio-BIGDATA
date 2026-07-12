import React, { useEffect, useState } from "react";
import { updateModule, deleteModule, addFileWork, addLinkWork, deleteWork } from "../api.js";

export default function ModuleEditor({ mod, onModuleUpdated, onModuleDeleted }) {
  const [title, setTitle] = useState(mod.title);
  const [description, setDescription] = useState(mod.description);
  const [savingText, setSavingText] = useState(false);
  const [textError, setTextError] = useState("");

  const [workTab, setWorkTab] = useState("file"); // "file" | "link"
  const [file, setFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [savingWork, setSavingWork] = useState(false);
  const [workError, setWorkError] = useState("");

  useEffect(() => {
    setTitle(mod.title);
    setDescription(mod.description);
    setFile(null);
    setLinkUrl("");
    setDisplayName("");
    setWorkError("");
    setTextError("");
  }, [mod.id]);

  async function handleSaveText() {
    setSavingText(true);
    setTextError("");
    try {
      const updated = await updateModule(mod.id, { title, description });
      onModuleUpdated(updated);
    } catch (e) {
      setTextError(e.message);
    } finally {
      setSavingText(false);
    }
  }

  async function handleDeleteModule() {
    if (!window.confirm(`¿Eliminar el módulo "${mod.title}"? Esto también borra sus trabajos.`)) return;
    try {
      await deleteModule(mod.id);
      onModuleDeleted(mod.id);
    } catch (e) {
      setTextError(e.message);
    }
  }

  async function handleAddWork(e) {
    e.preventDefault();
    setWorkError("");
    setSavingWork(true);
    try {
      if (workTab === "file") {
        if (!file) {
          setWorkError("Selecciona un archivo primero.");
          setSavingWork(false);
          return;
        }
        await addFileWork(mod.id, file, displayName);
      } else {
        if (!linkUrl.trim()) {
          setWorkError("Ingresa un enlace.");
          setSavingWork(false);
          return;
        }
        await addLinkWork(mod.id, linkUrl, displayName);
      }
      setFile(null);
      setLinkUrl("");
      setDisplayName("");
      onModuleUpdated(null, mod.id);
    } catch (e) {
      setWorkError(e.message);
    } finally {
      setSavingWork(false);
    }
  }

  async function handleDeleteWork(workId) {
    try {
      await deleteWork(mod.id, workId);
      onModuleUpdated(null, mod.id);
    } catch (e) {
      setWorkError(e.message);
    }
  }

  return (
    <article className="detail-panel">
      <div className="detail-panel-top">
        <span className="module-tag">Editando módulo</span>
        <button className="btn-link-danger" onClick={handleDeleteModule}>
          Eliminar módulo
        </button>
      </div>

      <label className="field-label">Título</label>
      <input className="text-input" value={title} onChange={(e) => setTitle(e.target.value)} />

      <label className="field-label">Descripción</label>
      <textarea
        className="text-input"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button className="btn-secondary" onClick={handleSaveText} disabled={savingText}>
        {savingText ? "Guardando…" : "Guardar cambios"}
      </button>
      {textError && <p className="form-error">{textError}</p>}

      <h4 className="files-heading">Trabajos y evidencias</h4>
      {mod.works.length === 0 ? (
        <p className="empty-state">Todavía no hay trabajos en este módulo.</p>
      ) : (
        <ul className="files-list">
          {mod.works.map((w) => (
            <li key={w.id}>
              <a href={w.url} target="_blank" rel="noreferrer">
                {w.type === "link" ? "🔗 " : "📄 "}
                {w.name}
              </a>
              <button className="btn-link-danger" onClick={() => handleDeleteWork(w.id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="upload-form" onSubmit={handleAddWork}>
        <div className="tabs">
          <button
            type="button"
            className={`tab ${workTab === "file" ? "tab-active" : ""}`}
            onClick={() => setWorkTab("file")}
          >
            Subir archivo
          </button>
          <button
            type="button"
            className={`tab ${workTab === "link" ? "tab-active" : ""}`}
            onClick={() => setWorkTab("link")}
          >
            Agregar enlace
          </button>
        </div>

        <input
          type="text"
          placeholder="Nombre a mostrar (opcional)"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="text-input"
        />

        {workTab === "file" ? (
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="file-input" />
        ) : (
          <input
            type="text"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="text-input"
          />
        )}

        <button className="btn-primary" type="submit" disabled={savingWork}>
          {savingWork ? "Guardando…" : workTab === "file" ? "Subir archivo" : "Agregar enlace"}
        </button>

        {workError && <p className="form-error">{workError}</p>}
      </form>
    </article>
  );
}
