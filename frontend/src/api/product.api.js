const BASE = "http://localhost:3000/api/products";

export async function getProducts() {
  const res = await fetch(BASE);
  return await res.json();
}

export async function addProduct(payload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

export async function updateProduct(id, payload) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await res.json();
}

export async function deleteProduct(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE"
  });
  return res.status === 204;
}