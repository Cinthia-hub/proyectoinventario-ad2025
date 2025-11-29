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

export async function getUsers() {
  const res = await fetch(BASE);
  return await parseJsonResponse(res);
}

export async function addUser(payload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await parseJsonResponse(res);
}

export async function updateUser(id, payload) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await parseJsonResponse(res);
}

export async function deleteUser(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (res.status === 204) return true;
  return await parseJsonResponse(res);
}