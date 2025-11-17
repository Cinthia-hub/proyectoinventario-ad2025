<template>
  <div>
    <table class="products">
      <thead>
        <tr>
          <th>Products</th>
          <th>Buying Price</th>
          <th>Quantity</th>
          <th>Threshold Value</th>
          <th>Expiry Date</th>
          <th>Availability</th>
          <th class="col-actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in products" :key="p.id">
          <td><a href="#" @click.prevent="$emit('select', p)" class="product-link">{{ p.nombre }}</a></td>
          <td>{{ p.price }}</td>
          <td>{{ p.quantity }} Packets</td>
          <td>{{ p.threshold_value }} Packets</td>
          <td>{{ p.expiry_date }}</td>
          <td :class="availabilityClass(p)">{{ p.availability }}</td>
          <td class="actions-cell">
            <button class="action-edit" @click="$emit('edit', p)" title="Edit product">Edit</button>
            <button class="action-delete" @click="$emit('delete', p)" title="Delete product">Delete</button>
          </td>
        </tr>

        <tr v-if="products.length === 0">
          <td colspan="7" class="no-results">No products to show</td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button
        class="pagination-btn"
        :class="{ disabled: !hasPrev }"
        :disabled="!hasPrev"
        @click="$emit('prev')"
        aria-disabled="!hasPrev"
      >
        Previous
      </button>

      <span class="page-info">Page {{ page }} of {{ totalPages }}</span>

      <button
        class="pagination-btn"
        :class="{ disabled: !hasNext }"
        :disabled="!hasNext"
        @click="$emit('next')"
        aria-disabled="!hasNext"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    products: { type: Array, default: () => [] },
    page: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 }
  },
  computed: {
    hasPrev() {
      return this.page > 1;
    },
    hasNext() {
      return this.page < this.totalPages;
    }
  },
  methods: {
    availabilityClass(p) {
      if (p.availability === "In-stock") return "txt-green";
      if (p.availability === "Low stock") return "txt-yellow";
      return "txt-red";
    }
  }
};
</script>

<style scoped>
.products {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 6px;
  overflow: hidden;
}

.products thead {
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.products th,
.products td {
  text-align: left;
  padding: 12px 16px;
  font-size: 14px;
  border-bottom: 1px solid #f1f1f1;
}

.col-actions { width: 160px; text-align: right; }

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
}

/* Action buttons: Edit / Delete */
.action-edit,
.action-delete {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #d0d0d0;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  line-height: 1;
  transition: background .12s, border-color .12s, color .12s;
}

/* Edit: subtle blue outline */
.action-edit {
  color: #1766d1;
  border-color: rgba(23,102,209,0.16);
  background: rgba(47,108,242,0.06);
}
.action-edit:hover {
  background: rgba(47,108,242,0.12);
}

/* Delete: red outline */
.action-delete {
  color: #b03a3a;
  border-color: rgba(176,58,58,0.18);
  background: rgba(176,58,58,0.04);
}
.action-delete:hover {
  background: rgba(176,58,58,0.10);
}

/* Make buttons smaller on very small screens */
@media (max-width: 520px) {
  .action-edit, .action-delete { padding: 5px 8px; font-size: 12px; }
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 6px 0 6px;
}

.pagination-btn {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e6e6e6;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: background .12s, color .12s, border-color .12s;
}

/* disabled state */
.pagination-btn.disabled,
.pagination-btn[disabled] {
  opacity: 0.55;
  cursor: not-allowed;
  background: #fafafa;
  color: #9c9c9c;
  border-color: #f0f0f0;
  pointer-events: none;
}

/* hover */
.pagination-btn:not(.disabled):hover {
  background: #f6f8ff;
  border-color: rgba(47,108,242,0.18);
}

.page-info {
  color: #6d6c6c;
  font-weight: 500;
}

/* no-results row */
.no-results {
  padding: 24px;
  text-align: center;
  color: #888;
}
</style>