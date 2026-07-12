import React, { useMemo } from "react";

const WIDTH = 1000;
const HEIGHT = 220;
const AMPLITUDE = 55;
const CENTER_Y = HEIGHT / 2;

export default function Hero({ totalModules, completedCount, onExplore }) {
  const nodes = useMemo(() => {
    if (totalModules === 0) return [];
    const margin = 40;
    const cycles = Math.max(1.4, Math.min(4, totalModules / 6));
    const curveY = (x) => CENTER_Y + AMPLITUDE * Math.sin((x / WIDTH) * Math.PI * 2 * cycles);
    return Array.from({ length: totalModules }, (_, i) => {
      const x = totalModules === 1 ? WIDTH / 2 : margin + (i * (WIDTH - margin * 2)) / (totalModules - 1);
      return { x, y: curveY(x), index: i + 1 };
    });
  }, [totalModules]);

  const pathD = useMemo(() => {
    if (nodes.length < 2) return "";
    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const curr = nodes[i];
      const midX = (prev.x + curr.x) / 2;
      d += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [nodes]);

  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">Documentación · Curso de Big Data</p>
        <h1>
          Un pipeline de datos,
          <br />
          documentado paso a paso.
        </h1>
        <p className="hero-lede">
          Cada módulo es un nodo procesado: su documentación, evidencias y trabajos
          entregados durante el curso.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={onExplore}>
            Explorar los módulos
          </button>
          {totalModules > 0 && (
            <span className="hero-stat">
              <strong>{completedCount}</strong> / {totalModules} módulos con evidencia cargada
            </span>
          )}
        </div>
      </div>

      {totalModules > 0 && (
        <div className="hero-pipeline" role="img" aria-label="Línea de tiempo de los módulos del curso">
          <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
            {pathD && <path d={pathD} fill="none" stroke="var(--border)" strokeWidth="2" />}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
                strokeDasharray="6 10"
                className="pipeline-flow"
              />
            )}
            {nodes.map((n) => (
              <g key={n.index} className="pipeline-node">
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.index <= completedCount ? 7 : 5}
                  className={n.index <= completedCount ? "node-done" : "node-pending"}
                />
              </g>
            ))}
          </svg>
        </div>
      )}
    </section>
  );
}
