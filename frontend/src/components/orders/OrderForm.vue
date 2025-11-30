<template>
  <article class="addform">
    <form class="supplier-form" @submit.prevent="submit">
      <h2>{{ order && order.id ? 'Edit Order' : 'New Order' }}</h2>

      <div class="form-grid">
        <div class="fields-col">
          <div class="form-row">
            <label class="row-label">Folio</label>
            <input :value="order ? (order.id || '') : '---'" disabled />
          </div>

          <div class="form-row">
            <label class="row-label">Admin</label>
            <input :value="adminName" disabled />
          </div>

          <div class="form-row">
            <label class="row-label">Supplier</label>
            <select v-model="form.supplierId" @change="onSupplierChange" required>
              <option value="">-- select --</option>
              <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>

          <div class="form-row">
            <label class="row-label">Store</label>
            <select v-model="form.storeId" @change="onStoreChange" required>
              <option value="">-- select --</option>
              <option v-for="st in stores" :key="st.id" :value="st.id">{{ st.name }}</option>
            </select>
          </div>

          <div class="form-row">
            <label class="row-label">Product</label>
            <select v-model="form.productId" @change="onProductChange" required>
              <option value="">-- select --</option>
              <option v-for="p in products" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
          </div>

          <div class="form-row">
            <label class="row-label">Unit</label>
            <input v-model="form.product_unit" disabled />
          </div>

          <div class="form-row">
            <label class="row-label">Quantity</label>
            <input v-model.number="form.quantity" type="number" min="1" required />
          </div>

          <div class="form-row">
            <label class="row-label">Order date</label>
            <input v-model="form.order_date" type="date" required />
          </div>

          <div class="form-row">
            <label class="row-label">Delivery date</label>
            <input v-model="form.delivery_date" type="date" />
          </div>

          <div class="form-row">
            <label class="row-label">Notes</label>
            <textarea v-model="form.notes" placeholder="Optional notes"></textarea>
          </div>

          <div class="buttonsAdd form-row buttons-row">
            <div></div>
            <div class="buttons-right">
              <button type="button" class="btn-white" @click="close">Discard</button>
              <button type="submit" class="btn-blue">{{ order && order.id ? 'Update' : 'Create' }}</button>
            </div>
          </div>
        </div>

        <!-- right column: previews -->
        <div class="preview-col">
          <div class="preview-block">
            <label>Supplier image</label>
            <img :src="form.supplier_image || placeholder" @error="onImgError" class="img-preview"/>
            <div class="preview-caption">{{ form.supplier_name || '' }}</div>
          </div>

          <div class="preview-block">
            <label>Store image</label>
            <img :src="form.store_image || placeholder" @error="onImgError" class="img-preview"/>
            <div class="preview-caption">{{ form.store_name || '' }}</div>
            <div class="preview-caption small">{{ form.store_address || '' }}</div>
            <div class="preview-caption small">Manager: {{ form.store_manager || '' }}</div>
          </div>

          <div class="preview-block">
            <label>Product image</label>
            <img :src="form.product_image || placeholder" @error="onImgError" class="img-preview"/>
            <div class="preview-caption">{{ form.product_name || '' }}</div>
            <div class="preview-caption small">Unit: {{ form.product_unit || '' }}</div>
          </div>
        </div>
      </div>
    </form>
  </article>
</template>

<script>
import * as api from "./../../api/orders.api.js";
import { useAuthStore } from "../../store/auth.store";

export default {
  props: { order: { default: null } },
  data() {
    return {
      form: {
        supplierId: "",
        supplier_name: "",
        supplier_image: "",
        storeId: "",
        store_name: "",
        store_image: "",
        store_address: "",
        store_manager: "",
        productId: "",
        product_name: "",
        product_image: "",
        product_unit: "",
        quantity: 1,
        order_date: "",
        delivery_date: "",
        notes: ""
      },
      suppliers: [],
      stores: [],
      products: [],
      placeholder:
        "data:image/svg+xml;utf8," +
        encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='160' height='120'><rect width='100%' height='100%' fill='#f4f4f4'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' fill='#9c9c9c' font-family='Arial' font-size='14'>No Image</text></svg>")
    };
  },
  computed: {
    adminName() {
      const auth = useAuthStore();
      return auth.user && (auth.user.nombre || auth.user.username) ? (auth.user.nombre || auth.user.username) : "unknown";
    }
  },
  methods: {
    async loadMeta() {
      try {
        this.suppliers = await api.getSuppliersMeta();
        this.stores = await api.getStoresMeta();
        this.products = await api.getProductsMeta();
      } catch (err) {
        console.error("Load meta failed", err);
        alert("Failed to load suppliers/stores/products. See console.");
      }
    },
    onSupplierChange() {
      const s = this.suppliers.find(x => x.id === this.form.supplierId) || {};
      this.form.supplier_name = s.name || "";
      this.form.supplier_image = s.photo_url || "";
    },
    onStoreChange() {
      const st = this.stores.find(x => x.id === this.form.storeId) || {};
      this.form.store_name = st.name || "";
      this.form.store_image = st.photo_url || "";
      this.form.store_address = st.address || "";
      this.form.store_manager = st.manager || "";
    },
    onProductChange() {
      const p = this.products.find(x => x.id === this.form.productId) || {};
      this.form.product_name = p.nombre || "";
      this.form.product_image = p.url || "";
      this.form.product_unit = p.unit || "";
    },
    onImgError(e) {
      const img = e.target;
      if (img.dataset.failed) return;
      img.dataset.failed = "true";
      img.src = this.placeholder;
    },
    async submit() {
      try {
        const auth = useAuthStore();
        const payload = {
          adminId: auth.user && auth.user.id ? auth.user.id : null,
          admin_name: auth.user && (auth.user.nombre || auth.user.username) ? (auth.user.nombre || auth.user.username) : "unknown",
          supplierId: this.form.supplierId || null,
          supplier_name: this.form.supplier_name || "",
          supplier_image: this.form.supplier_image || "",
          storeId: this.form.storeId || null,
          store_name: this.form.store_name || "",
          store_image: this.form.store_image || "",
          store_address: this.form.store_address || "",
          store_manager: this.form.store_manager || "",
          productId: this.form.productId || null,
          product_name: this.form.product_name || "",
          product_image: this.form.product_image || "",
          product_unit: this.form.product_unit || "",
          quantity: this.form.quantity || 0,
          order_date: this.form.order_date || "",
          delivery_date: this.form.delivery_date || "",
          notes: this.form.notes || ""
        };

        if (this.order && this.order.id) {
          await api.updateOrder(this.order.id, payload);
        } else {
          await api.addOrder(payload);
        }
        this.$emit("saved");
      } catch (err) {
        console.error("Save order error", err);
        alert("Error saving order. See console.");
      }
    },
    close() { this.$emit("close"); }
  },
  mounted() {
    this.loadMeta();
    if (this.order) this.form = { ...this.form, ...this.order };
  },
  watch: {
    order(newVal) {
      if (newVal) this.form = { ...this.form, ...newVal };
      else {
        this.form = {
          supplierId: "", supplier_name: "", supplier_image: "",
          storeId: "", store_name: "", store_image: "", store_address: "", store_manager: "",
          productId: "", product_name: "", product_image: "", product_unit: "",
          quantity: 1, order_date: "", delivery_date: "", notes: ""
        };
      }
    }
  }
};
</script>

<style scoped>
.addform {
  position: fixed;
  left: 50%;
  top: 5px;
  transform: translateX(-50%);
  width: 920px;
  max-width: calc(100% - 40px);
  border-radius: 8px;
  background-color: white;
  z-index: 1200;
  padding: 18px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.08);
}
.supplier-form h2 { margin: 4px 0 12px 0; font-size: 20px; }
.form-grid { display:flex; gap:18px; align-items:start; }
.fields-col { flex:1; display:flex; flex-direction:column; gap:10px; }
.preview-col { width:300px; display:flex; flex-direction:column; gap:12px; }
.form-row { display:flex; align-items:center; gap:12px; }
.row-label { width:140px; font-size:14px; color:#6d6c6c; }
.form-row input, .form-row textarea, .form-row select { flex:1; padding:9px 12px; border-radius:6px; border:1px solid #d6d6d6; font-size:13px; }
.img-preview { height:120px; object-fit:cover; border-radius:6px; border:1px solid #e6e6e6; }
.preview-block label { font-size:13px; color:#6d6c6c; margin-bottom:6px; display:block; }
.preview-caption { color:#444; font-weight:600; margin-top:6px; }
.preview-caption.small { color:#777; font-weight:400; font-size:12px; margin-top:2px; }
.buttons-row { margin-top:12px; }
.buttons-right { display:flex; gap:12px; justify-content:flex-end; }
.btn-blue { padding:8px 14px; color:white; background:rgb(51,87,249); border:none; border-radius:6px; }
.btn-white { padding:8px 14px; background:white; border:1px solid #dcdcdc; border-radius:6px; }
</style>