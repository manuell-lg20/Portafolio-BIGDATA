import React, { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ModuleDetail from "./components/ModuleDetail.jsx";
import Footer from "./components/Footer.jsx";
import { fetchModules } from "./api.js";
import "./App.css";

export default function App() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchModules();
        setModules(data);
        if (data.length > 0) setActiveId(data[0].id);
      } catch (e) {
        setLoadError("No se pudo conectar con el servidor. Intenta recargar la página.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function scrollToExplorer() {
    document.getElementById("modulos")?.scrollIntoView({ behavior: "smooth" });
  }

  const completedCount = modules.filter((m) => m.works.length > 0).length;
  const activeModule = modules.find((m) => m.id === activeId) || null;

  return (
    <div id="top">
      <Header />

      <main>
        <Hero totalModules={modules.length} completedCount={completedCount} onExplore={scrollToExplorer} />

        {loading && <p className="state-message">Cargando módulos…</p>}
        {loadError && <p className="state-message state-error">{loadError}</p>}

        {!loading && !loadError && modules.length === 0 && (
          <p className="state-message">Todavía no se ha publicado ningún módulo.</p>
        )}

        {!loading && !loadError && modules.length > 0 && (
          <section id="modulos" className="explorer">
            <div className="section-heading">
              <p className="eyebrow">El pipeline, módulo a módulo</p>
              <h2>Módulos del curso</h2>
            </div>

            <div className="explorer-layout">
              <Sidebar modules={modules} activeId={activeId} onSelect={setActiveId} />
              <div className="explorer-content">
                {activeModule && <ModuleDetail mod={activeModule} />}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
