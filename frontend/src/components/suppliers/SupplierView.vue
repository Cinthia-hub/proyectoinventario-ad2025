<template>
  <div class="v-productData">
    <div class="v-productButtons">
      <h2 id="v-product-Name">{{ supplier.name }}</h2>
      <div class="buttons-group">
        <button class="btn btn-outline" @click="$emit('close')">Return</button>
        <button class="btn btn-outline" @click="$emit('edit', supplier)">Edit</button>
        <button class="btn btn-danger" @click="onDelete">Delete</button>
      </div>
    </div>

    <div class="overview">
      <div class="col1">
        <div class="primaryDetails card">
          <h5>Details</h5>

          <div class="row">
            <p class="label">Name</p>
            <p class="value">{{ supplier.name }}</p>
          </div>

          <div class="row">
            <p class="label">Contact</p>
            <p class="value">{{ supplier.contact }}</p>
          </div>

          <div class="row">
            <p class="label">Phone</p>
            <p class="value">{{ supplier.phone }}</p>
          </div>

          <div class="row">
            <p class="label">Email</p>
            <p class="value">{{ supplier.email }}</p>
          </div>

          <div class="row">
            <p class="label">Address</p>
            <p class="value">{{ supplier.address }}</p>
          </div>

          <div class="row">
            <p class="label">Notes</p>
            <p class="value">{{ supplier.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as api from "./../../api/suppliers.api.js";

export default {
  props: { supplier: { type: Object, required: true } },
  methods: {
    async onDelete() {
      if (!confirm(`Delete "${this.supplier.name}"?`)) return;
      await api.deleteSupplier(this.supplier.id);
      this.$emit("delete", this.supplier);
      this.$emit("close");
    }
  }
};
</script>

<style scoped>
.v-productData { max-width: 1100px; margin: 20px auto; padding: 0 20px 40px; font-family: Inter, "Helvetica Neue", Arial, sans-serif; color: #333; }
.v-productButtons { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }
#v-product-Name { margin:0; font-size:20px; font-weight:700; color:#222; }
.buttons-group { display:flex; gap:10px; align-items:center; }
.btn { border:1px solid #d7d7d7; background:#fff; color:#444; padding:8px 12px; border-radius:8px; font-size:0.9rem; cursor:pointer; display:inline-flex; gap:8px; align-items:center; }
.btn-primary { background:#1471ff; color:white; border-color:#1471ff; }
.btn-outline { background:white; color:#444; }
.btn-danger { background:#fff6f6; color:#c0392b; border-color:#f1b0ad; }
.overview { display:grid; grid-template-columns:1fr; gap:20px; align-items:start; }
.card { background:white; border-radius:8px; padding:18px; box-shadow:0 2px 8px rgba(11,22,40,0.03); border:1px solid #f0f0f0; }
.primaryDetails h5 { margin:0 0 14px; font-size:16px; color:#333; font-weight:700; }
.row { display:flex; align-items:center; gap:24px; padding:8px 0; border-bottom:1px dashed #f3f3f3; }
.row:last-of-type { border-bottom:0; }
.label { width:200px; color:#9aa0a6; font-size:0.95rem; }
.value { color:#3b3b3b; font-weight:600; }
@media (max-width:980px) { .overview { grid-template-columns:1fr; } .label { width:140px; } }
</style>