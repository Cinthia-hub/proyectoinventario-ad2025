<template>
  <div>
    <table class="products">
      <thead>
        <tr>
          <th>Store</th>
          <th>Address</th>
          <th>Phone</th>
          <th>Manager</th>
          <th class="col-actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in stores" :key="s && s.id">
          <td>
            <div class="name-cell">
              <img :src="(s && (s.photo_url || s.url)) || placeholder" @error="onImgError" class="thumb" />
              <a href="#" @click.prevent="onSelect(s)" class="product-link">{{ (s && (s.name || s.nombre)) || '-' }}</a>
            </div>
          </td>
          <td>{{ (s && (s.address || s.direccion)) || '-' }}</td>
          <td>{{ (s && s.phone) || '-' }}</td>
          <td>{{ (s && (s.manager || s.gerente)) || '-' }}</td>
          <td class="actions-cell">
            <button class="action-edit" @click="onEdit(s)" title="Edit store">Edit</button>
            <button class="action-delete" @click="onDelete(s)" title="Delete store">Delete</button>
          </td>
        </tr>

        <tr v-if="(!stores) || stores.length === 0">
          <td colspan="5" class="no-results">No stores to show</td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button class="pagination-btn" :class="{ disabled: !hasPrev }" :disabled="!hasPrev" @click="$emit('prev')">Previous</button>
      <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
      <button class="pagination-btn" :class="{ disabled: !hasNext }" :disabled="!hasNext" @click="$emit('next')">Next</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "StoreList",
  props: {
    stores: { type: Array, default: () => [] },
    page: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 }
  },
  methods: {
    onImgError(e) {
      const img = e.target;
      if (img.dataset.failed) return;
      img.dataset.failed = "true";
      img.src = this.placeholder;
    },
    onSelect(s) {
      // defensivo: no emitir si no hay id
      if (!s) return;
      this.$emit('select', s);
    },
    onEdit(s) {
      if (!s) return;
      this.$emit('edit', s);
    },
    onDelete(s) {
      if (!s) return;
      this.$emit('delete', s);
    }
  },
  data() {
    return {
      placeholder:
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
          "<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='100%' height='100%' fill='#f4f4f4'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' fill='#9c9c9c' font-family='Arial' font-size='10'>No</text></svg>"
        )
    };
  },
  computed: {
    hasPrev() { return this.page > 1; },
    hasNext() { return this.page < this.totalPages; }
  }
};
</script>

<style scoped>
/* (puedes mantener tus estilos) */
.products { width:100%; border-collapse:collapse; background:white; border-radius:6px; overflow:hidden; }
.products thead { background:#fafafa; border-bottom:1px solid #eee; }
.products th, .products td { text-align:left; padding:12px 16px; font-size:14px; border-bottom:1px solid #f1f1f1; vertical-align:middle; }
.col-actions { width:160px; text-align:right; }
.actions-cell { display:flex; gap:12px; justify-content:flex-end; align-items:center; }
.action-edit, .action-delete { padding:6px 10px; border-radius:6px; border:1px solid #d0d0d0; background:#fff; font-size:13px; cursor:pointer; }
.action-edit { color:#1766d1; border-color: rgba(23,102,209,0.16); background: rgba(47,108,242,0.06); }
.action-delete { color:#b03a3a; border-color: rgba(176,58,58,0.18); background: rgba(176,58,58,0.04); }

.name-cell { display:flex; align-items:center; gap:12px; }
.thumb { width:48px; height:48px; object-fit:cover; border-radius:6px; border:1px solid #eee; }
.product-link { color:#1f7bff; text-decoration:none; font-weight:500; }
.product-link:hover { color:#1766d1; }
.pagination { display:flex; align-items:center; gap:12px; padding:12px 6px 0 6px; justify-content:center; }
.pagination-btn { padding:8px 12px; border-radius:8px; border:1px solid #e6e6e6; background:white; cursor:pointer; }
.pagination-btn.disabled, .pagination-btn[disabled] { opacity:0.55; cursor:not-allowed; background:#fafafa; color:#9c9c9c; border-color:#f0f0f0; pointer-events:none; }
.page-info { color:#6d6c6c; font-weight:500; }
.no-results { padding:24px; text-align:center; color:#888; }
</style>