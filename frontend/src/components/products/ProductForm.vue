<template>
  <article class="addform">
    <form class="product-form" @submit.prevent="submit">
      <h2>{{ product ? 'Edit Product' : 'New Product' }}</h2>

      <div class="form-grid">
        <!-- Columna izquierda: imagen y URL -->
        <div class="image-col">
          <div class="image-preview">
            <img :src="form.url || '/logo.png'" alt="product image" />
          </div>
          <label class="image-label">URL Product Image</label>
          <input
            class="image-url"
            v-model="form.url"
            id="urlImage"
            placeholder="Enter product URL"
            required
          />
        </div>

        <!-- Columna derecha: campos -->
        <div class="fields-col">
          <div class="form-row">
            <label class="row-label">Product Name</label>
            <input v-model="form.nombre" placeholder="Enter product name" required />
          </div>

          <div class="form-row">
            <label class="row-label">Category</label>
            <input v-model="form.category" placeholder="Select product category" required />
          </div>

          <div class="form-row">
            <label class="row-label">Buying Price</label>
            <input type="number" v-model.number="form.price" placeholder="Enter buying price" required />
          </div>

          <div class="form-row">
            <label class="row-label">Quantity</label>
            <input type="number" v-model.number="form.quantity" placeholder="Enter product quantity" required />
          </div>

          <div class="form-row">
            <label class="row-label">Unit</label>
            <input v-model="form.unit" placeholder="Enter product unit" required />
          </div>

          <div class="form-row">
            <label class="row-label">Expiry Date</label>
            <input type="date" v-model="form.expiry_date" required />
          </div>

          <div class="form-row">
            <label class="row-label">Threshold Value</label>
            <input type="number" v-model.number="form.threshold_value" placeholder="Enter threshold Value" required />
          </div>

          <div class="buttonsAddProduct form-row buttons-row">
            <div></div>
            <div class="buttons-right">
              <button type="button" class="btn-white" @click="close">Discard</button>
              <button type="submit" class="btn-blue">{{ product ? 'Update Product' : 'Add Product' }}</button>
            </div>
          </div>
        </div>
      </div>
    </form>
  </article>
</template>

<script>
import * as api from "../../api/product.api.js";

export default {
  props: { product: { default: null } },
  data() {
    return {
      form: {
        nombre: "",
        url: "",
        category: "",
        price: 0,
        quantity: 0,
        unit: "",
        expiry_date: "",
        threshold_value: 0,
        availability: "Out of stock",
        sulur_branch: 0,
        singanallur_branch: 0,
        opening_stock: 0,
        on_the_way: 0
      }
    };
  },
  methods: {
    async submit() {
      const q = this.form.quantity || 0;
      const t = this.form.threshold_value || 0;
      if (q > t) this.form.availability = "In-stock";
      else if (q > 0 && q <= t) this.form.availability = "Low stock";
      else this.form.availability = "Out of stock";

      this.form.opening_stock = this.form.opening_stock || q;
      this.form.sulur_branch = Math.floor(Math.random() * (q + 1));
      this.form.singanallur_branch = q - this.form.sulur_branch;
      this.form.on_the_way = Math.floor(Math.random() * 101);

      if (this.product) {
        await api.updateProduct(this.product.id, this.form);
      } else {
        await api.addProduct(this.form);
      }
      this.$emit("saved");
    },
    close() {
      this.$emit("close");
    }
  },
  mounted() {
    if (this.product) {
      this.form = { ...this.product };
    }
  }
};
</script>

<style scoped>
.addform {
  position: fixed;
  left: 20%;
  top: 60px;
  width: 60%;
  max-width: 900px;
  height: auto;
  border-radius: 6px;
  background-color: white;
  z-index: 1200; /* <- AUMENTADO: debe quedar por encima del overlay (overlay z-index ~1000) */
  padding: 18px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
}

.product-form h2 {
  margin: 4px 0 12px 0;
  font-size: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 18px;
  align-items: start;
}

/* Imagen y URL */
.image-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 6px;
}

.image-preview {
  width: 120px;
  height: 120px;
  border: 3px dashed #ccc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #fafafa;
  margin-bottom: 10px;
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-label {
  color: #0a65d8;
  font-size: 13px;
  margin-bottom: 6px;
}

.image-url {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d6d6d6;
  border-radius: 6px;
  font-size: 13px;
}

/* Campos */
.fields-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.row-label {
  width: 150px;
  font-size: 14px;
  color: #6d6c6c;
}

.form-row input,
.form-row select {
  flex: 1;
  padding: 9px 12px;
  border-radius: 6px;
  border: 1px solid #d6d6d6;
  font-size: 13px;
}

/* Buttons row alignment */
.buttons-row {
  margin-top: 12px;
}

.buttons-right {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-blue {
  padding: 8px 14px;
  color: white;
  background: rgb(51, 87, 249);
  border: none;
  border-radius: 6px;
}

.btn-white {
  padding: 8px 14px;
  background: white;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
}
</style>