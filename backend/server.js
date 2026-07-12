const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const { pool, initSchema } = require("./db.js");
const { uploadBuffer, deleteAsset } = require("./cloudinary.js");

const app = express();
const PORT = process.env.PORT || 4000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

const VIEWER_DIST = path.join(__dirname, "..", "frontend-viewer", "dist");

app.use(cors());
app.use(express.json());

// Archivos en memoria: de aquí se suben directo a Cloudinary, nunca tocan el disco
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// ---------- Autenticación simple para escritura ----------
function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) {
    return res.status(500).json({
      error:
        "El servidor no tiene configurada la variable ADMIN_TOKEN. Defínela en las variables de entorno.",
    });
  }
  const token = req.header("x-admin-token");
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Token de administrador inválido." });
  }
  next();
}

// ---------- Helpers de datos ----------
function mapWork(row) {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    url: row.url,
    addedAt: row.added_at,
  };
}

function mapModule(row, works) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    createdAt: row.created_at,
    works: works.map(mapWork),
  };
}

async function getAllModulesWithWorks() {
  const modulesResult = await pool.query("SELECT * FROM modules ORDER BY id ASC");
  const worksResult = await pool.query("SELECT * FROM works ORDER BY id ASC");

  const worksByModule = {};
  worksResult.rows.forEach((w) => {
    if (!worksByModule[w.module_id]) worksByModule[w.module_id] = [];
    worksByModule[w.module_id].push(w);
  });

  return modulesResult.rows.map((m) => mapModule(m, worksByModule[m.id] || []));
}

async function getModuleWithWorks(id) {
  const modResult = await pool.query("SELECT * FROM modules WHERE id = $1", [id]);
  if (modResult.rows.length === 0) return null;
  const worksResult = await pool.query("SELECT * FROM works WHERE module_id = $1 ORDER BY id ASC", [id]);
  return mapModule(modResult.rows[0], worksResult.rows);
}

// ---------- Rutas API ----------
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/modules", async (req, res) => {
  try {
    res.json(await getAllModulesWithWorks());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al leer los módulos." });
  }
});

app.get("/api/modules/:id", async (req, res) => {
  try {
    const mod = await getModuleWithWorks(Number(req.params.id));
    if (!mod) return res.status(404).json({ error: "Módulo no encontrado" });
    res.json(mod);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al leer el módulo." });
  }
});

// Crear un módulo nuevo (sin límite de cantidad)
app.post("/api/modules", requireAdmin, async (req, res) => {
  const { title, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "El módulo necesita un título." });
  }
  try {
    const result = await pool.query(
      "INSERT INTO modules (title, description) VALUES ($1, $2) RETURNING *",
      [title.trim(), (description || "").trim()]
    );
    res.status(201).json(mapModule(result.rows[0], []));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al crear el módulo." });
  }
});

// Editar título / descripción de un módulo
app.put("/api/modules/:id", requireAdmin, async (req, res) => {
  const { title, description } = req.body;
  try {
    const existing = await pool.query("SELECT * FROM modules WHERE id = $1", [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Módulo no encontrado" });

    const newTitle = title !== undefined ? title : existing.rows[0].title;
    const newDescription = description !== undefined ? description : existing.rows[0].description;

    const result = await pool.query(
      "UPDATE modules SET title = $1, description = $2 WHERE id = $3 RETURNING *",
      [newTitle, newDescription, req.params.id]
    );
    const mod = await getModuleWithWorks(Number(req.params.id));
    res.json(mod);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al actualizar el módulo." });
  }
});

// Eliminar un módulo completo (y sus archivos en Cloudinary)
app.delete("/api/modules/:id", requireAdmin, async (req, res) => {
  try {
    const worksResult = await pool.query(
      "SELECT * FROM works WHERE module_id = $1 AND type = 'file'",
      [req.params.id]
    );
    await Promise.all(
      worksResult.rows.filter((w) => w.public_id).map((w) => deleteAsset(w.public_id))
    );

    const deleted = await pool.query("DELETE FROM modules WHERE id = $1 RETURNING id", [req.params.id]);
    if (deleted.rows.length === 0) return res.status(404).json({ error: "Módulo no encontrado" });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al eliminar el módulo." });
  }
});

// Agregar un trabajo: archivo (sube a Cloudinary) o enlace externo
app.post("/api/modules/:id/works", requireAdmin, upload.single("file"), async (req, res) => {
  try {
    const moduleId = Number(req.params.id);
    const modCheck = await pool.query("SELECT id FROM modules WHERE id = $1", [moduleId]);
    if (modCheck.rows.length === 0) return res.status(404).json({ error: "Módulo no encontrado" });

    let inserted;

    if (req.file) {
      const uploaded = await uploadBuffer(req.file.buffer, req.file.originalname);
      const displayName = req.body.displayName || req.file.originalname;
      inserted = await pool.query(
        "INSERT INTO works (module_id, type, name, url, public_id) VALUES ($1, 'file', $2, $3, $4) RETURNING *",
        [moduleId, displayName, uploaded.secure_url, uploaded.public_id]
      );
    } else if (req.body.type === "link" && req.body.url) {
      let url = req.body.url.trim();
      if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
      const displayName = req.body.displayName || url;
      inserted = await pool.query(
        "INSERT INTO works (module_id, type, name, url) VALUES ($1, 'link', $2, $3) RETURNING *",
        [moduleId, displayName, url]
      );
    } else {
      return res.status(400).json({ error: "Debes adjuntar un archivo o proporcionar un enlace válido." });
    }

    res.status(201).json(mapWork(inserted.rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al agregar el trabajo." });
  }
});

// Eliminar un trabajo de un módulo
app.delete("/api/modules/:id/works/:workId", requireAdmin, async (req, res) => {
  try {
    const workResult = await pool.query("SELECT * FROM works WHERE id = $1 AND module_id = $2", [
      req.params.workId,
      req.params.id,
    ]);
    if (workResult.rows.length === 0) return res.status(404).json({ error: "Trabajo no encontrado" });

    const work = workResult.rows[0];
    if (work.type === "file" && work.public_id) {
      await deleteAsset(work.public_id);
    }

    await pool.query("DELETE FROM works WHERE id = $1", [req.params.workId]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error al eliminar el trabajo." });
  }
});

// ---------- Servir el frontend-viewer ya compilado (build único en Render) ----------
if (fs.existsSync(VIEWER_DIST)) {
  app.use(express.static(VIEWER_DIST));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(VIEWER_DIST, "index.html"));
  });
}

initSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("No se pudo inicializar la base de datos:", err);
    process.exit(1);
  });
