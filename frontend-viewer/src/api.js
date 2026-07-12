// El viewer solo lee datos, nunca escribe.
// En producción, backend y viewer se sirven desde el mismo origen.
// En desarrollo, Vite hace proxy de /api hacia http://localhost:4000 (ver vite.config.js).

export async function fetchModules() {
  const res = await fetch("/api/modules");
  if (!res.ok) throw new Error("No se pudieron cargar los módulos");
  return res.json();
}
