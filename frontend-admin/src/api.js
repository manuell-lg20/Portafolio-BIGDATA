function getConfig() {
  return {
    baseUrl: (localStorage.getItem("backend_url") || "").replace(/\/+$/, ""),
    token: localStorage.getItem("admin_token") || "",
  };
}

export function saveConfig(baseUrl, token) {
  localStorage.setItem("backend_url", baseUrl.replace(/\/+$/, ""));
  localStorage.setItem("admin_token", token);
}

export function clearConfig() {
  localStorage.removeItem("backend_url");
  localStorage.removeItem("admin_token");
}

export function hasConfig() {
  const { baseUrl, token } = getConfig();
  return Boolean(baseUrl && token);
}

export function getBaseUrl() {
  return getConfig().baseUrl;
}

async function handle(res) {
  if (!res.ok) {
    let message = `Error ${res.status}`;
    try {
      const body = await res.json();
      message = body.error || message;
    } catch (_) {}
    throw new Error(message);
  }
  return res.json();
}

export async function testConnection(baseUrl) {
  const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/api/health`);
  if (!res.ok) throw new Error("El servidor respondió con un error.");
  return res.json();
}

export async function fetchModules() {
  const { baseUrl } = getConfig();
  const res = await fetch(`${baseUrl}/api/modules`);
  return handle(res);
}

export async function createModule({ title, description }) {
  const { baseUrl, token } = getConfig();
  const res = await fetch(`${baseUrl}/api/modules`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-token": token },
    body: JSON.stringify({ title, description }),
  });
  return handle(res);
}

export async function updateModule(id, { title, description }) {
  const { baseUrl, token } = getConfig();
  const res = await fetch(`${baseUrl}/api/modules/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-admin-token": token },
    body: JSON.stringify({ title, description }),
  });
  return handle(res);
}

export async function deleteModule(id) {
  const { baseUrl, token } = getConfig();
  const res = await fetch(`${baseUrl}/api/modules/${id}`, {
    method: "DELETE",
    headers: { "x-admin-token": token },
  });
  return handle(res);
}

export async function addFileWork(moduleId, file, displayName) {
  const { baseUrl, token } = getConfig();
  const formData = new FormData();
  formData.append("file", file);
  if (displayName) formData.append("displayName", displayName);

  const res = await fetch(`${baseUrl}/api/modules/${moduleId}/works`, {
    method: "POST",
    headers: { "x-admin-token": token },
    body: formData,
  });
  return handle(res);
}

export async function addLinkWork(moduleId, url, displayName) {
  const { baseUrl, token } = getConfig();
  const formData = new FormData();
  formData.append("type", "link");
  formData.append("url", url);
  if (displayName) formData.append("displayName", displayName);

  const res = await fetch(`${baseUrl}/api/modules/${moduleId}/works`, {
    method: "POST",
    headers: { "x-admin-token": token },
    body: formData,
  });
  return handle(res);
}

export async function deleteWork(moduleId, workId) {
  const { baseUrl, token } = getConfig();
  const res = await fetch(`${baseUrl}/api/modules/${moduleId}/works/${workId}`, {
    method: "DELETE",
    headers: { "x-admin-token": token },
  });
  return handle(res);
}
