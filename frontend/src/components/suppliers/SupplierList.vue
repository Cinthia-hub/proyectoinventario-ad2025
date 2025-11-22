<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Teléfono</th>
          <th>Dirección</th>
          <th style="width:140px">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="5">Cargando...</td>
        </tr>
        <tr v-else-if="suppliers.length === 0">
          <td colspan="5">No hay proveedores</td>
        </tr>
        <tr v-for="s in suppliers" :key="s.id">
          <td>{{ s.name }}</td>
          <td>{{ s.email }}</td>
          <td>{{ s.phone }}</td>
          <td>{{ s.address }}</td>
          <td>
            <button class="btn-sm" @click="$emit('select', s)">Ver</button>
            <button class="btn-sm" @click="$emit('edit', s)">Editar</button>
            <button class="btn-sm btn-danger" @click="$emit('delete', s)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination" v-if="totalPages && totalPages > 1">
      <button :disabled="page === 1" @click="$emit('prev')">Anterior</button>
      <span>Página {{ page }} / {{ totalPages }}</span>
      <button :disabled="page === totalPages" @click="$emit('next')">Siguiente</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "SupplierList",
  props: {
    suppliers: { type: Array, default: () => [] },
    page: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 },
    loading: { type: Boolean, default: false }
  }
};
</script>

<style scoped>
.table { width:100%; border-collapse:collapse; margin-top:8px; }
.table th, .table td { border:1px solid #ddd; padding:8px; text-align:left; }
.btn-sm { padding:4px 8px; margin-left:4px; font-size:0.9em; cursor:pointer; }
.btn-danger { background:#e55353; color:white; border:none; border-radius:4px; }
.pagination { margin-top:12px; display:flex; gap:12px; align-items:center; }
</style>