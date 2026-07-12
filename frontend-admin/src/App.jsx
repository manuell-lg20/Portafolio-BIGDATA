import React, { useEffect, useState } from "react";
import ConnectScreen from "./components/ConnectScreen.jsx";
import AdminHeader from "./components/AdminHeader.jsx";
import ModuleList from "./components/ModuleList.jsx";
import ModuleEditor from "./components/ModuleEditor.jsx";
import { hasConfig, clearConfig, fetchModules } from "./api.js";
import "./App.css";

export default function App() {
  const [connected, setConnected] = useState(hasConfig());
  const [modules, setModules] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (connected) loadModules();
  }, [connected]);

  async function loadModules(preserveActiveId) {
    setLoading(true);
    try {
      const data = await fetchModules();
      setModules(data);
      setLoadError("");
      if (!preserveActiveId && data.length > 0) {
        setActiveId((prev) => prev ?? data[0].id);
      }
    } catch (e) {
      setLoadError("No se pudo conectar con el backend. Verifica la URL y el token.");
    } finally {
      setLoading(false);
    }
  }

  function handleDisconnect() {
    clearConfig();
    setConnected(false);
    setModules([]);
    setActiveId(null);
  }

  function handleModuleCreated(mod) {
    setModules((prev) => [...prev, mod]);
    setActiveId(mod.id);
  }

  function handleModuleDeleted(id) {
    setModules((prev) => {
      const next = prev.filter((m) => m.id !== id);
      setActiveId(next.length > 0 ? next[0].id : null);
      return next;
    });
  }

  async function handleModuleUpdated(updatedModule, moduleIdToReload) {
    if (updatedModule) {
      setModules((prev) => prev.map((m) => (m.id === updatedModule.id ? updatedModule : m)));
      return;
    }
    await loadModules(true);
    if (moduleIdToReload) setActiveId(moduleIdToReload);
  }

  if (!connected) {
    return <ConnectScreen onConnected={() => setConnected(true)} />;
  }

  const activeModule = modules.find((m) => m.id === activeId) || null;

  return (
    <div>
      <AdminHeader onDisconnect={handleDisconnect} />
      <main className="admin-main">
        {loading && <p className="state-message">Cargando módulos…</p>}
        {loadError && <p className="state-message state-error">{loadError}</p>}

        {!loading && !loadError && (
          <div className="explorer-layout">
            <ModuleList
              modules={modules}
              activeId={activeId}
              onSelect={setActiveId}
              onCreated={handleModuleCreated}
            />
            <div className="explorer-content">
              {activeModule ? (
                <ModuleEditor
                  mod={activeModule}
                  onModuleUpdated={handleModuleUpdated}
                  onModuleDeleted={handleModuleDeleted}
                />
              ) : (
                <p className="empty-state">Crea o selecciona un módulo para editarlo.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
