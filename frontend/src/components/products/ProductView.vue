<template>
  <div class="v-productData">
    <div class="v-productButtons">
      <h2 id="v-product-Name">{{ product.nombre }}</h2>
      <div class="buttons-group">
        <button class="btn btn-outline" @click="$emit('close')">
          <i class="fa-solid fa-rotate-left"></i> Return
        </button>
        <button class="btn btn-outline" @click="$emit('edit', product)">
          <i class="fa-solid fa-pencil"></i> Edit
        </button>
        <button class="btn btn-danger" @click="onDelete">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
        <button class="btn btn-primary" @click="download">
          <i class="fa-solid fa-download"></i> Download
        </button>
      </div>
    </div>

    <div class="overview">
      <div class="col1">
        <div class="primaryDetails card">
          <h5>Primary Details</h5>

          <div class="row">
            <p class="label">Product Name</p>
            <p class="value">{{ product.nombre }}</p>
          </div>

          <div class="row">
            <p class="label">Product ID</p>
            <p class="value">{{ product.id }}</p>
          </div>

          <div class="row">
            <p class="label">Product category</p>
            <p class="value">{{ product.category }}</p>
          </div>

          <div class="row">
            <p class="label">Expiry Date</p>
            <p class="value">{{ product.expiry_date }}</p>
          </div>

          <div class="row">
            <p class="label">Unit</p>
            <p class="value">{{ product.unit }}</p>
          </div>

          <div class="row">
            <p class="label">Threshold Value</p>
            <p class="value">{{ product.threshold_value }}</p>
          </div>
        </div>
      </div>

      <div class="col2">
        <div class="v-productImage">
          <div class="img-box">
            <img :src="product.url || '/placeholder-image.png'" alt="product image" />
          </div>
        </div>

        <div class="stats card">
          <div class="stat-row">
            <p class="stat-label">Buying Price</p>
            <p class="stat-value">{{ product.price ?? 0 }}</p>
          </div>
          <div class="stat-row">
            <p class="stat-label">Quantity</p>
            <p class="stat-value">{{ product.quantity ?? 0 }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as api from "../../api/product.api";

export default {
  props: { product: { type: Object, required: true } },
  methods: {
    async onDelete() {
      if (!confirm(`Delete "${this.product.nombre}"?`)) return;
      await api.deleteProduct(this.product.id);
      this.$emit("delete", this.product);
      this.$emit("close");
    },
    download() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.text("Product Details", 20, 20);
      const tableColumn = ["Detail", "Value"];
      const tableRows = [
        ["Product Name", this.product.nombre],
        ["Product ID", this.product.id],
        ["Product Category", this.product.category],
        ["Expiry Date", this.product.expiry_date],
        ["Threshold Value", this.product.threshold_value],
        ["Buying Price", this.product.price],
        ["Quantity", this.product.quantity],
        ["Unit", this.product.unit],
       ];

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        theme: "grid",
        margin: { top: 40, left: 20 }
      });
      doc.save(`${this.product.nombre}_details.pdf`);
    }
  }
};
</script>

<style scoped>
.v-productData {
  max-width: 1100px;
  margin: 20px auto;
  padding: 0 20px 40px;
  font-family: Inter, "Helvetica Neue", Arial, sans-serif;
  color: #333;
}

/* Header with title + buttons */
.v-productButtons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
#v-product-Name {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #222;
}

/* Buttons */
.buttons-group {
  display: flex;
  gap: 10px;
  align-items: center;
}
.btn {
  border: 1px solid #d7d7d7;
  background: #fff;
  color: #444;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  align-items: center;
}
.btn i { opacity: 0.9; font-size: 0.95rem; }

/* variants */
.btn-primary {
  background: #1471ff;
  color: white;
  border-color: #1471ff;
}
.btn-outline {
  background: white;
  color: #444;
}
.btn-danger {
  background: #fff6f6;
  color: #c0392b;
  border-color: #f1b0ad;
}

/* tabs */
.tabs {
  display: flex;
  gap: 18px;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
  margin-bottom: 18px;
}
.tab {
  background: transparent;
  border: none;
  padding: 8px 6px;
  cursor: pointer;
  color: #666;
  font-weight: 500;
}
.tab.active {
  color: #1471ff;
  border-bottom: 3px solid #1471ff;
  padding-bottom: 9px;
}

/* Overview grid: two columns */
.overview {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 20px;
  align-items: start;
}

/* Left column card */
.card {
  background: white;
  border-radius: 8px;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(11, 22, 40, 0.03);
  border: 1px solid #f0f0f0;
}

/* Primary details inside left column */
.primaryDetails h5 {
  margin: 0 0 14px;
  font-size: 16px;
  color: #333;
  font-weight: 700;
}
.row {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 8px 0;
  border-bottom: 1px dashed #f3f3f3;
}
.row:last-of-type { border-bottom: 0; }
.label {
  width: 220px;
  color: #9aa0a6;
  font-size: 0.95rem;
}
.value {
  color: #3b3b3b;
  font-weight: 600;
}

/* small separator for sections */
.section-sep {
  margin: 14px 0;
  border: none;
  border-top: 1px solid #f4f4f4;
}

/* locations table */
.locations {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  font-size: 0.95rem;
}
.locations thead th {
  text-align: left;
  font-weight: 700;
  color: #666;
  background: #fafafa;
  padding: 8px;
  border-bottom: 1px solid #eee;
}
.locations td {
  padding: 10px 8px;
  border-bottom: 1px solid #f7f7f7;
  color: #444;
}
.locations .right { text-align: right; }

/* Right column: image + stats */
.v-productImage {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
.img-box {
  width: 140px;
  height: 140px;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background: #fff;
}
.img-box img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* stats box inside right column */
.stats {
  padding: 14px;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 6px;
  border-bottom: 1px solid #f4f4f4;
  align-items: center;
}
.stat-row:last-child { border-bottom: 0; }
.stat-label {
  color: #8f98a0;
}
.stat-value {
  color: #333;
  font-weight: 700;
}

/* muted text fallback */
.muted {
  color: #999;
  padding: 12px 6px;
}

/* responsive */
@media (max-width: 980px) {
  .overview { grid-template-columns: 1fr; }
  .label { width: 140px; }
  .v-productData { padding: 0 14px 30px; }
  .img-box { margin: 0 auto; }
  .buttons-group { flex-wrap: wrap; gap: 8px; }
}
</style>