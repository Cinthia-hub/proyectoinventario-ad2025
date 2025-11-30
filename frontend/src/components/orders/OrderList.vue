<template>
  <div>
    <table class="products">
      <thead>
        <tr>
          <th>Folio</th>
          <th>Admin</th>
          <th>Supplier</th>
          <th>Store</th>
          <th>Product</th>
          <th>Quantity</th>
          <th>Order date</th>
          <th>Delivery date</th>
          <th class="col-actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in orders" :key="o.id">
          <td>
            <div class="folio-cell">
              <a href="#" @click.prevent="$emit('select', o)" class="product-link">{{ o.id }}</a>
            </div>
          </td>

          <td>
            <div class="name-cell">
              <span class="name-text">{{ o.admin_name || '-' }}</span>
            </div>
          </td>

          <td>
            <div class="name-cell">
              <img :src="o.supplier_image || fallback" @error="onImgError" class="thumb" />
              <span class="name-text">{{ o.supplier_name || '-' }}</span>
            </div>
          </td>

          <td>
            <div class="name-cell">
              <img :src="o.store_image || fallback" @error="onImgError" class="thumb" />
              <span class="name-text">{{ o.store_name || '-' }}</span>
            </div>
          </td>

          <td>
            <div class="name-cell">
              <img :src="o.product_image || fallback" @error="onImgError" class="thumb" />
              <span class="name-text">{{ o.product_name || '-' }}</span>
            </div>
          </td>

          <td>{{ o.quantity || '-' }}</td>
          <td>{{ o.order_date || '-' }}</td>
          <td>{{ o.delivery_date || '-' }}</td>
          <td class="actions-cell">
            <button class="action-edit" @click="$emit('edit', o)">Edit</button>
            <button class="action-delete" @click="$emit('delete', o)">Delete</button>
          </td>
        </tr>

        <tr v-if="orders.length === 0">
          <td colspan="9" class="no-results">No orders to show</td>
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
  props: {
    orders: { type: Array, default: () => [] },
    page: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 }
  },
  data() {
    return {
      fallback:
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
          "<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><rect width='100%' height='100%' fill='#f4f4f4'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' fill='#9c9c9c' font-family='Arial' font-size='10'>No</text></svg>"
        )
    };
  },
  computed: {
    hasPrev() { return this.page > 1; },
    hasNext() { return this.page < this.totalPages; }
  },
  methods: {
    onImgError(e) {
      const img = e.target;
      if (img.dataset.failed) return;
      img.dataset.failed = "true";
      img.src = this.fallback;
    }
  }
};
</script>

<style scoped>
.products { width:100%; border-collapse:collapse; background:white; border-radius:6px; overflow:hidden; }
.products thead { background:#fafafa; border-bottom:1px solid #eee; }
.products th, .products td { text-align:left; padding:12px 16px; font-size:14px; border-bottom:1px solid #f1f1f1; vertical-align:middle; }
.col-actions { width:160px; text-align:right; }
.actions-cell { display:flex; gap:12px; justify-content:flex-end; align-items:center; }
.action-edit, .action-delete { padding:6px 10px; border-radius:6px; border:1px solid #d0d0d0; background:#fff; font-size:13px; cursor:pointer; }
.action-edit { color:#1766d1; border-color: rgba(23,102,209,0.16); background: rgba(47,108,242,0.06); }
.action-delete { color:#b03a3a; border-color: rgba(176,58,58,0.18); background: rgba(176,58,58,0.04); }

.name-cell { display:flex; align-items:center; gap:12px; }
.thumb { width:40px; height:40px; object-fit:cover; border-radius:6px; border:1px solid #eee; }
.name-text { font-weight:500; color:#333; }

.folio-cell .product-link { color:#1f7bff; text-decoration:none; font-weight:600; }
.folio-cell .product-link:hover { color:#1766d1; text-decoration:underline; }

.pagination { display:flex; align-items:center; gap:12px; padding:12px 6px 0 6px; justify-content:center; }
.pagination-btn { padding:8px 12px; border-radius:8px; border:1px solid #e6e6e6; background:white; cursor:pointer; }
.pagination-btn.disabled, .pagination-btn[disabled] { opacity:0.55; cursor:not-allowed; background:#fafafa; color:#9c9c9c; border-color:#f0f0f0; pointer-events:none; }
.page-info { color:#6d6c6c; font-weight:500; }
.no-results { padding:24px; text-align:center; color:#888; }
</style>