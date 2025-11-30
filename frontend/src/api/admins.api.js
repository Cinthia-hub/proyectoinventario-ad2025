const BASE = "http://localhost:3000/api/users";

async function parseJsonResponse(res) {
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText}`);
    err.status = res.status;
    err.bodyText = text;
    throw err;
  }
  if (!ct.includes("application/json")) {
    const err = new Error("Invalid JSON response from server");
    err.status = res.status;
    err.bodyText = text;
    throw err;
  }
  return JSON.parse(text);
}

function authHeaders() {
  const token = localStorage.getItem('token');
  const h = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

export async function getUsers() {
  const res = await fetch(BASE, { headers: authHeaders() });
  return await parseJsonResponse(res);
}

export async function addUser(payload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  return await parseJsonResponse(res);
}

export async function updateUser(id, payload) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });
  return await parseJsonResponse(res);
}

export async function deleteUser(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE", headers: authHeaders() });
  if (res.status === 204) return true;
  return await parseJsonResponse(res);
}