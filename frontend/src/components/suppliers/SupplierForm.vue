<template>
  <div class="modal-backdrop">
    <div class="modal">
      <header class="modal-header">
        <h3>{{ local.id ? 'Editar proveedor' : 'Nuevo proveedor' }}</h3>
      </header>

      <form @submit.prevent="submit">
        <div class="form-row">
          <label>Nombre</label>
          <input v-model="local.name" required />
        </div>

        <div class="form-row">
          <label>Email</label>
          <input v-model="local.email" type="email" />
        </div>

        <div class="form-row">
          <label>Teléfono</label>
          <input v-model="local.phone" />
        </div>

        <div class="form-row">
          <label>Dirección</label>
          <input v-model="local.address" />
        </div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn">Cancelar</button>
          <button type="submit" class="btn btn-primary">{{ local.id ? 'Guardar' : 'Crear' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "SupplierForm",
  props: { initial: { type: Object, default: null } },
  data() {
    return {
      local: { id: null, name: "", email: "", phone: "", address: "" }
    };
  },
  watch: {
    initial: {
      immediate: true,
      handler(v) {
        if (v) this.local = { id: v.id || null, name: v.name || "", email: v.email || "", phone: v.phone || "", address: v.address || "" };
        else this.local = { id: null, name: "", email: "", phone: "", address: "" };
      }
    }
  },
  methods: {
    submit() {
      if (!this.local.name.trim()) {
        alert("El nombre es obligatorio.");
        return;
      }
      this.$emit("save", { ...this.local });
    }
  }
};
</script>

<style scoped>
.modal-backdrop { position: fixed; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.4); }
.modal { width:420px; background:#fff; padding:16px; border-radius:6px; box-shadow:0 8px 20px rgba(0,0,0,0.15); }
.form-row { display:flex; flex-direction:column; margin-bottom:8px; }
.form-row label { font-size:0.85em; margin-bottom:4px; }
.form-row input { padding:8px; border:1px solid #ddd; border-radius:4px; }
.modal-actions { display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }
.btn { padding:6px 10px; cursor:pointer; }
.btn-primary { background:#2d8cf0; color:white; border:none; border-radius:4px; }
</style>