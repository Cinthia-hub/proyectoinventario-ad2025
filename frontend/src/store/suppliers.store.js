import { defineStore } from "pinia";
import * as api from "../api/suppliers.api";

export const useSuppliersStore = defineStore("suppliers", {
  state: () => ({
    suppliers: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchSuppliers() {
      this.loading = true;
      this.error = null;
      try {
        const data = await api.getSuppliers();
        this.suppliers = Array.isArray(data) ? data : [];
      } catch (err) {
        this.error = err;
        console.error("fetchSuppliers error", err);
      } finally {
        this.loading = false;
      }
    },
    async createSupplier(payload) {
      try {
        await api.createSupplier(payload);
      } catch (err) {
        console.error("createSupplier error", err);
        throw err;
      }
    },
    async updateSupplier(id, payload) {
      try {
        await api.updateSupplier(id, payload);
      } catch (err) {
        console.error("updateSupplier error", err);
        throw err;
      }
    },
    async deleteSupplier(id) {
      try {
        await api.deleteSupplier(id);
      } catch (err) {
        console.error("deleteSupplier error", err);
        throw err;
      }
    }
  }
});