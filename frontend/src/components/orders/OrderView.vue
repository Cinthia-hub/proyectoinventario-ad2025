<template>
  <div class="v-productData">
    <div class="v-productButtons">
      <div class="title-and-photo">
        <img :src="order.product_image || fallback" @error="onImgError" class="detail-photo" alt="product photo" />
        <div>
          <h2 id="v-product-Name">{{ order.id }}</h2>
          <div class="small-row">
            <span class="muted">Admin: {{ order.admin_name || '-' }}</span>
          </div>
        </div>
      </div>

      <div class="buttons-group">
        <button class="btn btn-outline" @click="$emit('close')">Return</button>
        <button class="btn btn-outline" @click="$emit('edit', order)">Edit</button>
        <button class="btn btn-primary" @click="download"><i class="fa-solid fa-download"></i> Download</button>
      </div>
    </div>

    <div class="overview">
      <div class="col1">
        <div class="primaryDetails card">
          <h5>Details</h5>

          <div class="row">
            <p class="label">Admin</p>
            <div class="value">
              {{ order.admin_name }}
            </div>
          </div>

          <div class="row">
            <p class="label">Supplier</p>
            <p class="value">
              <img :src="order.supplier_image || fallback" class="mini" @error="onImgError" />
              {{ order.supplier_name }}
            </p>
          </div>

          <div class="row">
            <p class="label">Store</p>
            <div class="value">
              <img :src="order.store_image || fallback" class="mini" @error="onImgError" />
              <div>
                <div>{{ order.store_name }}</div>
                <small class="muted">{{ order.store_address }}</small>
                <small class="muted">Manager: {{ order.store_manager }}</small>
              </div>
            </div>
          </div>

          <div class="row">
            <p class="label">Product</p>
            <p class="value">
              <img :src="order.product_image || fallback" class="mini" @error="onImgError" />
              {{ order.product_name }}
            </p>
          </div>

          <div class="row">
            <p class="label">Unit</p>
            <p class="value">{{ order.product_unit }}</p>
          </div>

          <div class="row">
            <p class="label">Quantity</p>
            <p class="value">{{ order.quantity }}</p>
          </div>

          <div class="row">
            <p class="label">Order date</p>
            <p class="value">{{ order.order_date }}</p>
          </div>

          <div class="row">
            <p class="label">Delivery date</p>
            <p class="value">{{ order.delivery_date }}</p>
          </div>

          <div class="row">
            <p class="label">Notes</p>
            <p class="value">{{ order.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: { order: { type: Object, required: true } },
  data() {
    return {
      fallback:
        "data:image/svg+xml;utf8," +
        encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='160' height='120'><rect width='100%' height='100%' fill='#f4f4f4'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' fill='#9c9c9c' font-family='Arial' font-size='14'>No Image</text></svg>")
    };
  },
  methods: {
    onImgError(e) {
      const img = e.target;
      if (img.dataset.failed) return;
      img.dataset.failed = "true";
      img.src = this.fallback;
    },
    download() {
      try {
        const rows = [
          ["Folio", this.order.id || ""],
          ["Admin", this.order.admin_name || ""],
          ["Supplier", this.order.supplier_name || ""],
          ["Store", `${this.order.store_name || ""} ${this.order.store_address ? " - " + this.order.store_address : ""}` || ""],
          ["Store manager", this.order.store_manager || ""],
          ["Product", this.order.product_name || ""],
          ["Unit", this.order.product_unit || ""],
          ["Quantity", this.order.quantity || ""],
          ["Order date", this.order.order_date || ""],
          ["Delivery date", this.order.delivery_date || ""],
          ["Notes", this.order.notes || ""],
          ["Admin photo", this.order.admin_photo || this.order.admin_image || ""],
          ["Supplier image", this.order.supplier_image || ""],
          ["Store image", this.order.store_image || ""],
          ["Product image", this.order.product_image || ""]
        ];
        const csv = rows.map(r => `"${r[0].replace(/"/g,'""')}","${String(r[1]||'').replace(/"/g,'""')}"`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(this.order.id || "order")}_details.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download failed", err);
        alert("Failed to generate download. See console.");
      }
    },
    requestDelete() {
      this.$emit("delete", this.order);
      this.$emit("close");
    }
  }
};
</script>

<style scoped>
.v-productData { max-width: 1100px; margin: 20px auto; padding: 0 20px 40px; font-family: Inter, "Helvetica Neue", Arial, sans-serif; color: #333; }
.v-productButtons { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }
.title-and-photo { display:flex; align-items:center; gap:14px; }
.detail-photo { width:120px; height:90px; object-fit:cover; border-radius:8px; border:1px solid #eee; }
.small-row { display:flex; align-items:center; gap:8px; margin-top:6px; }
.mini-thumb { width:32px; height:32px; object-fit:cover; border-radius:6px; border:1px solid #eee; }
.buttons-group { display:flex; gap:10px; align-items:center; }
.btn { border:1px solid #d7d7d7; background:#fff; color:#444; padding:8px 12px; border-radius:8px; font-size:0.9rem; cursor:pointer; display:inline-flex; gap:8px; align-items:center; }
.btn i { margin-right:6px; }
.btn-primary { background:#1471ff; color:white; border-color:#1471ff; }
.btn-outline { background:white; color:#444; }
.btn-danger { background:#fff6f6; color:#c0392b; border-color:#f1b0ad; }
.btn-outline:hover { background: #f5f5f5; }
.btn-primary:hover { background: #436495; border-color: #436495; }
.overview { display:grid; grid-template-columns:1fr; gap:20px; align-items:start; }
.card { background:white; border-radius:8px; padding:18px; box-shadow:0 2px 8px rgba(11,22,40,0.03); border:1px solid #f0f0f0; }
.primaryDetails h5 { margin:0 0 14px; font-size:16px; color:#333; font-weight:700; }
.row { display:flex; align-items:center; gap:24px; padding:8px 0; border-bottom:1px dashed #f3f3f3; }
.row:last-of-type { border-bottom:0; }
.label { width:200px; color:#9aa0a6; font-size:0.95rem; }
.value { color:#3b3b3b; font-weight:600; display:flex; align-items:center; gap:10px; }
.mini { width:48px; height:32px; object-fit:cover; border:1px solid #eee; border-radius:6px; }
.muted { color:#666; font-size:0.9rem; }
@media (max-width:980px) { .overview { grid-template-columns:1fr; } .label { width:140px; } .detail-photo { width:96px; height:72px; } }
</style>