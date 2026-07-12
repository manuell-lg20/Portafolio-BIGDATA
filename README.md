# Portafolio · Curso de Big Data

Ahora el proyecto tiene **tres piezas separadas**:

```
portfolio-bigdata/
├── backend/            → API (Express). Guarda los módulos en Neon (Postgres)
│                          y los archivos en Cloudinary — ambos persistentes.
├── frontend-viewer/     → Solo lectura. Esto es lo único que despliegas en Render.
└── frontend-admin/      → Panel privado para crear módulos y subir trabajos.
                            Lo corres en tu computadora, apuntando al backend.
```

- **`frontend-admin`** te da libertad total: crea tantos módulos como quieras (no hay
  límite de 16), y a cada uno le puedes agregar trabajos como **archivo subido** o
  como **enlace** (a un Google Doc, un repo, un video, lo que sea).
- **`frontend-viewer`** solo muestra lo que ya publicaste, en la barra lateral +
  panel de detalle. No tiene ningún control de edición.
- Ambos frontends hablan con el **mismo backend**, así que todo lo que crees desde
  el admin aparece automáticamente en el viewer.

---

## 1. Correrlo en tu computadora

### Requisitos
- Node.js 18 o superior (https://nodejs.org)
- Git

### 1.1 Backend

```bash
cd backend
npm install
```

Necesitas 4 variables de entorno (puedes ponerlas en un archivo `.env` en `backend/`,
o exportarlas en tu terminal):

```bash
export ADMIN_TOKEN="mi-clave-secreta"
export DATABASE_URL="postgresql://usuario:password@ep-xxxx.neon.tech/neondb?sslmode=require"
export CLOUDINARY_CLOUD_NAME="tu-cloud-name"
export CLOUDINARY_API_KEY="tu-api-key"
export CLOUDINARY_API_SECRET="tu-api-secret"
npm start
```

En Windows (PowerShell), usa `$env:NOMBRE="valor"` para cada una.

La primera vez que arranca, el backend crea automáticamente las tablas que necesita
en tu base de datos de Neon (no hay que correr ninguna migración a mano).

### 1.2 Admin (en otra terminal)

```bash
cd frontend-admin
npm install
npm run dev
```

Abre `http://localhost:5174`. La primera vez te pedirá:
- **URL del backend**: `http://localhost:4000`
- **Token de administrador**: el mismo valor de `ADMIN_TOKEN`

Desde ahí ya puedes:
- Crear módulos nuevos (título + descripción), sin límite de cantidad.
- Editar el título/descripción de cualquier módulo.
- Agregar trabajos: pestaña **"Subir archivo"** o pestaña **"Agregar enlace"**.
- Eliminar trabajos o módulos completos.

### 1.3 Viewer (en otra terminal)

```bash
cd frontend-viewer
npm install
npm run dev
```

Abre `http://localhost:5173`. Ahí ves exactamente lo que verá el público: la barra
lateral con los módulos que hayas creado y, a la derecha, sus trabajos.

---

## 2. Subir el proyecto a GitHub

```bash
cd portfolio-bigdata
git init
git add .
git commit -m "Portafolio con backend, viewer y admin separados"
```

Crea el repositorio en https://github.com/new (sin agregar README, ya tienes uno) y:

```bash
git branch -M main
git remote add origin https://github.com/TU-USUARIO/portafolio-bigdata.git
git push -u origin main
```

---

## 3. Desplegar en Render (solo backend + viewer)

El admin **no se despliega** — vive únicamente en tu computadora, apuntando al
backend ya desplegado. Solo creas **un** Web Service en Render:

1. Entra a https://dashboard.render.com → **New +** → **Web Service**.
2. Conecta tu repositorio de GitHub.
3. Configura:

| Campo | Valor |
|---|---|
| **Name** | `portafolio-bigdata` |
| **Branch** | `main` |
| **Root Directory** | vacío (raíz del repo) |
| **Runtime** | Node |
| **Build Command** | `npm install --prefix frontend-viewer && npm run build --prefix frontend-viewer && npm install --prefix backend` |
| **Start Command** | `node backend/server.js` |
| **Instance Type** | Free (o el que necesites) |

4. En **Environment**, agrega estas 5 variables:

| Key | Value |
|---|---|
| `ADMIN_TOKEN` | tu clave secreta (la misma que usarás luego en el admin local) |
| `DATABASE_URL` | tu connection string de Neon (`postgresql://...`) |
| `CLOUDINARY_CLOUD_NAME` | de tu dashboard de Cloudinary |
| `CLOUDINARY_API_KEY` | de tu dashboard de Cloudinary |
| `CLOUDINARY_API_SECRET` | de tu dashboard de Cloudinary |

5. Clic en **Create Web Service**. Cuando termine, tendrás una URL como
   `https://portafolio-bigdata.onrender.com` — esa es la que compartes.

### 3.1 Usar el admin contra el backend ya desplegado

Una vez desplegado, corre el admin en tu computadora (`cd frontend-admin && npm run dev`)
y en la pantalla de conexión pon:
- **URL del backend**: `https://portafolio-bigdata.onrender.com` (tu URL real de Render)
- **Token**: el mismo `ADMIN_TOKEN` que configuraste en Render

Así puedes agregar o editar módulos y trabajos directamente sobre el sitio en vivo,
sin necesidad de volver a desplegar nada.

### 3.2 Actualizaciones de código

Solo hace falta redeploy en Render si cambias el **código** (backend o viewer):

```bash
git add .
git commit -m "Ajustes de diseño"
git push
```

Si solo agregas contenido (módulos/trabajos) desde el admin, **no** necesitas hacer
push ni redeploy — se guarda directamente en el backend en producción.

---

## 4. Por qué ya no se pierden los módulos ni los archivos

Antes, los módulos y los archivos vivían en el disco del propio contenedor de
Render. En el plan gratuito ese disco **no es persistente**: cuando el servicio
se queda inactivo un rato y luego recibe una visita nueva, Render lo revive con
un contenedor limpio, y todo lo que estaba en disco se perdía.

Ahora:
- Los **módulos y sus datos** (título, descripción, qué trabajos tiene) se
  guardan en **Neon** (Postgres), que es una base de datos real y persistente:
  no depende de que el contenedor de Render siga vivo.
- Los **archivos subidos** se guardan en **Cloudinary**, un servicio de
  almacenamiento aparte, así que tampoco dependen del disco de Render.

Resultado: el servicio de Render se puede dormir y despertar todas las veces que
quiera — los datos siguen intactos porque ya no están ahí, están en Neon y
Cloudinary. Los planes gratuitos de ambos son generosos para un portafolio de
curso (Neon: varios GB; Cloudinary: 25GB), así que no deberías tener que pagar
nada.

---

## 5. Resumen de la API (por si quieres explorarla)

| Método | Ruta | Qué hace | Requiere token |
|---|---|---|---|
| GET | `/api/modules` | Lista todos los módulos | No |
| GET | `/api/modules/:id` | Detalle de un módulo | No |
| POST | `/api/modules` | Crea un módulo (`title`, `description`) | Sí |
| PUT | `/api/modules/:id` | Edita título/descripción | Sí |
| DELETE | `/api/modules/:id` | Elimina el módulo y sus trabajos | Sí |
| POST | `/api/modules/:id/works` | Agrega un trabajo (archivo `file` o `type=link` + `url`) | Sí |
| DELETE | `/api/modules/:id/works/:workId` | Elimina un trabajo | Sí |

El token se envía en el header `x-admin-token`.
