const BASE = "http://localhost:3000/api/stores";

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}: ${res.statusText}`);
      err.status = res.status;
      err.body = data || text;
      throw err;
    }
    return data;
  } catch (err) {
    if (!res.ok) {
      const error = new Error(`HTTP ${res.status}: ${res.statusText}`);
      error.status = res.status;
      error.body = text;
      throw error;
    }
    throw err;
  }
}

export async function getStores() {
  return await fetchJson(BASE);
}

export async function getStore(id) {
  return await fetchJson(`${BASE}/${id}`);
}

export async function addStore(payload) {
  return await fetchJson(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function updateStore(id, payload) {
  return await fetchJson(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function deleteStore(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  return res.status === 204 || res.ok;
}