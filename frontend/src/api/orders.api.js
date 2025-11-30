const BASE = "http://localhost:3000/api/orders";

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

export async function getOrders() {
  return await fetchJson(BASE);
}

export async function addOrder(payload) {
  return await fetchJson(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function updateOrder(id, payload) {
  return await fetchJson(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

export async function deleteOrder(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  return res.status === 204;
}

export async function getProductsMeta() {
  return await fetchJson(`${BASE}/meta/products`);
}

export async function getSuppliersMeta() {
  return await fetchJson(`${BASE}/meta/suppliers`);
}

export async function getStoresMeta() {
  return await fetchJson(`${BASE}/meta/stores`);
}