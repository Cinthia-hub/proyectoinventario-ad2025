import axios from "axios";

export async function getSuppliers() {
  const res = await axios.get("/api/suppliers");
  return res.data;
}

export async function createSupplier(payload) {
  const res = await axios.post("/api/suppliers", payload);
  return res.data;
}

export async function updateSupplier(id, payload) {
  const res = await axios.put(`/api/suppliers/${id}`, payload);
  return res.data;
}

export async function deleteSupplier(id) {
  const res = await axios.delete(`/api/suppliers/${id}`);
  return res.data;
}