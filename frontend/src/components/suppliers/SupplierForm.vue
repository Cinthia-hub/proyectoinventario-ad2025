<template>
  <article class="addform">
    <form class="supplier-form" @submit.prevent="submit">
      <h2>{{ supplier ? 'Edit Supplier' : 'New Supplier' }}</h2>

      <div class="form-grid">
        <!-- Simple two-column layout similar to Inventory's modal -->
        <div class="fields-col">
          <div class="form-row">
            <label class="row-label">Nombre</label>
            <input v-model="form.name" placeholder="Enter supplier name" required />
          </div>

          <div class="form-row">
            <label class="row-label">Contacto</label>
            <input v-model="form.contact" placeholder="Contact person or company" />
          </div>

          <div class="form-row">
            <label class="row-label">Teléfono</label>
            <input v-model="form.phone" placeholder="Phone number" />
          </div>

          <div class="form-row">
            <label class="row-label">Email</label>
            <input v-model="form.email" type="email" placeholder="supplier@example.com" />
          </div>

          <div class="form-row">
            <label class="row-label">Dirección</label>
            <input v-model="form.address" placeholder="Address" />
          </div>

          <div class="form-row">
            <label class="row-label">Notas</label>
            <textarea v-model="form.notes" rows="3" placeholder="Notes or observations" />
          </div>

          <!-- FOTO (URL) -->
          <div class="form-row">
            <label class="row-label">Foto (URL)</label>
            <input v-model="form.photo_url" placeholder="https://ejemplo.com/imagen.jpg" />
          </div>

          <div class="form-row">
            <label class="row-label">Vista previa</label>
            <div class="img-preview-wrap">
              <img
                :src="form.photo_url || placeholder"
                @error="onImgError"
                alt="preview"
                class="img-preview"
              />
            </div>
          </div>

          <div class="buttonsAdd form-row buttons-row">
            <div></div>
            <div class="buttons-right">
              <button type="button" class="btn-white" @click="close">Discard</button>
              <button type="submit" class="btn-blue">{{ supplier ? 'Update Supplier' : 'Add Supplier' }}</button>
            </div>
          </div>
        </div>
      </div>
    </form>
  </article>
</template>

<script>
import * as api from "./../../api/suppliers.api.js";

export default {
  props: { supplier: { default: null } },
  data() {
    return {
      form: {
        name: "",
        contact: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
        photo_url: ""
      },
      // Data URI SVG placeholder (inline — no petición de red)
      placeholder:
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
          "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='120'><rect width='100%' height='100%' fill='#f4f4f4'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' fill='#9c9c9c' font-family='Arial' font-size='14'>No Image</text></svg>"
        )
    };
  },
  methods: {
    async submit() {
      try {
        if (this.supplier && this.supplier.id) {
          await api.updateSupplier(this.supplier.id, this.form);
        } else {
          await api.addSupplier(this.form);
        }
        this.$emit("saved");
      } catch (err) {
        console.error("Save supplier error", err);
        alert("Error saving supplier. Revisa la consola.");
      }
    },
    close() {
      this.$emit("close");
    },
    onImgError(e) {
      const img = e.target;
      // si ya marcamos como fallida, no intentar de nuevo (evita bucle)
      if (img.dataset.failed) return;
      img.dataset.failed = "true";
      img.src = this.placeholder;
    }
  },
  mounted() {
    if (this.supplier) {
      this.form = { ...this.supplier };
      if (!this.form.photo_url) this.form.photo_url = "";
    }
  },
  watch: {
    supplier(newVal) {
      if (newVal) this.form = { ...newVal };
      else this.form = { name: "", contact: "", phone: "", email: "", address: "", notes: "", photo_url: "" };
    }
  }
};
</script>

<style scoped>
.addform {
  position: fixed;
  left: 50%;
  top: 40px;
  transform: translateX(-50%);
  width: 720px;
  max-width: calc(100% - 40px);
  border-radius: 8px;
  background-color: white;
  z-index: 1200;
  padding: 18px;
  box-shadow: 0 8px 28px rgba(0,0,0,0.08);
}

.supplier-form h2 { margin: 4px 0 12px 0; font-size: 20px; }

.form-grid { display: flex; gap: 18px; align-items: start; }

.fields-col { flex: 1; display:flex; flex-direction:column; gap:10px; }

.form-row { display:flex; align-items:center; gap:12px; }
.row-label { width:120px; font-size:14px; color:#6d6c6c; }
.form-row input, .form-row textarea { flex:1; padding:9px 12px; border-radius:6px; border:1px solid #d6d6d6; font-size:13px; }

.img-preview-wrap { display:flex; align-items:center; }
.img-preview { width:160px; height:120px; object-fit:cover; border-radius:6px; border:1px solid #e6e6e6; }

.buttons-row { margin-top:12px; }
.buttons-right { display:flex; gap:12px; justify-content:flex-end; }

.btn-blue { padding:8px 14px; color:white; background:rgb(51,87,249); border:none; border-radius:6px; }
.btn-white { padding:8px 14px; background:white; border:1px solid #dcdcdc; border-radius:6px; }
</style>