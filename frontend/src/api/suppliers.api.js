const BASE = "http://localhost:3000/api/suppliers";

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
  // ya tenemos texto y content-type JSON
  return JSON.parse(text);
}

export async function getSuppliers() {
  const res = await fetch(BASE);
  return await parseJsonResponse(res);
}

export async function addSupplier(payload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await parseJsonResponse(res);
}

export async function updateSupplier(id, payload) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await parseJsonResponse(res);
}

export async function deleteSupplier(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (res.status === 204) return true;
  // si no 204, intenta parsear o arrojar error
  return await parseJsonResponse(res);
}