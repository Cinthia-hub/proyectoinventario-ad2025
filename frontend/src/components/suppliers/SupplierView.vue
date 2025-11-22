<template>
  <div class="modal-backdrop">
    <div class="modal">
      <header class="modal-header">
        <h3>Proveedor: {{ supplier.name }}</h3>
      </header>

      <div class="details">
        <p><strong>Email:</strong> {{ supplier.email }}</p>
        <p><strong>Teléfono:</strong> {{ supplier.phone }}</p>
        <p><strong>Dirección:</strong> {{ supplier.address }}</p>
      </div>

      <div class="modal-actions">
        <button class="btn" @click="$emit('close')">Cerrar</button>
        <button class="btn" @click="$emit('edit', supplier)">Editar</button>
        <button class="btn btn-danger" @click="$emit('delete', supplier)">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SupplierView",
  props: { supplier: { type: Object, required: true } }
};
</script>

<style scoped>
.modal-backdrop { position: fixed; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.4); }
.modal { width:420px; background:#fff; padding:16px; border-radius:6px; box-shadow:0 8px 20px rgba(0,0,0,0.15); }
.details p { margin:6px 0; }
.modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }
.btn { padding:6px 10px; cursor:pointer; }
.btn-danger { background:#e55353; color:white; border:none; border-radius:4px; }
</style>