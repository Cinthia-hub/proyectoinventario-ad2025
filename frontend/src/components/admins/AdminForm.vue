<template>
  <article class="addform">
    <form class="supplier-form" @submit.prevent="submit">
      <h2>{{ user && user.id ? 'Editar administrador' : 'Nuevo administrador' }}</h2>

      <div class="form-grid">
        <div class="fields-col">
          <div class="form-row">
            <label class="row-label">Nombre</label>
            <input v-model="form.nombre" placeholder="Nombre completo" required />
          </div>

          <div class="form-row">
            <label class="row-label">Username</label>
            <input v-model="form.username" placeholder="username" required />
          </div>

          <div class="form-row">
            <label class="row-label">Password</label>
            <input v-model="form.password" type="password" :required="!user" placeholder="Contraseña" />
            <small v-if="user" style="color:#666;font-size:12px">Dejar en blanco para no cambiar la contraseña</small>
          </div>

          <div class="form-row">
            <label class="row-label">Rol</label>
            <select v-model="form.rol" required>
              <option value="admin">admin</option>
              <option value="empleado">empleado</option>
            </select>
          </div>

          <div class="form-row">
            <label class="row-label">Dirección</label>
            <input v-model="form.direccion" placeholder="Dirección" required />
          </div>

          <div class="form-row">
            <label class="row-label">Email</label>
            <input v-model="form.email" type="email" placeholder="correo@ejemplo.com" required />
          </div>

          <div class="form-row">
            <label class="row-label">Teléfono</label>
            <input v-model="form.telefono" placeholder="Teléfono" required />
          </div>

          <!-- FOTO (URL) -->
          <div class="form-row">
            <label class="row-label">Foto (URL)</label>
            <input v-model="form.photo_url" placeholder="https://ejemplo.com/imagen.jpg" required />
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
              <button type="button" class="btn-white" @click="close">Descartar</button>
              <button type="submit" class="btn-blue">{{ user && user.id ? 'Actualizar' : 'Crear' }}</button>
            </div>
          </div>
        </div>
      </div>
    </form>
  </article>
</template>

<script>
import * as api from "./../../api/admins.api.js";

export default {
  props: { user: { default: null } },
  data() {
    return {
      form: {
        nombre: "",
        password: "",
        username: "",
        rol: "admin",
        direccion: "",
        email: "",
        telefono: "",
        photo_url: ""
      },
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
        // Construimos payload con los campos esperados por el backend
        const payload = { ...this.form };
        // Si password vacío, eliminamos para no sobrescribirlo
        if (!payload.password) delete payload.password;

        if (this.user && this.user.id) {
          // enviar (id, payload) porque la API espera PUT /api/users/:id
          await api.updateUser(this.user.id, payload);
        } else {
          await api.addUser(payload);
        }
        this.$emit("saved");
      } catch (err) {
        console.error("Save admin error", err);
        alert("Error guardando admin. Revisa la consola.");
      }
    },
    close() {
      this.$emit("close");
    },
    onImgError(e) {
      const img = e.target;
      if (img.dataset.failed) return;
      img.dataset.failed = "true";
      img.src = this.placeholder;
    }
  },
  mounted() {
    if (this.user) {
      this.form = {
        nombre: this.user.nombre || "",
        password: "",
        username: this.user.username || "",
        rol: this.user.rol || "admin",
        direccion: this.user.direccion || "",
        email: this.user.email || "",
        telefono: this.user.telefono || "",
        photo_url: this.user.photo_url || ""
      };
    }
  },
  watch: {
    user(newVal) {
      if (newVal) {
        this.form = {
          nombre: newVal.nombre || "",
          password: "",
          username: newVal.username || "",
          rol: newVal.rol || "admin",
          direccion: newVal.direccion || "",
          email: newVal.email || "",
          telefono: newVal.telefono || "",
          photo_url: newVal.photo_url || ""
        };
      } else {
        this.form = { nombre: "", password: "", username: "", rol: "admin", direccion: "", email: "", telefono: "", photo_url: "" };
      }
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
.form-row input, .form-row textarea, .form-row select { flex:1; padding:9px 12px; border-radius:6px; border:1px solid #d6d6d6; font-size:13px; }

.img-preview-wrap { display:flex; align-items:center; }
.img-preview { width:160px; height:120px; object-fit:cover; border-radius:6px; border:1px solid #e6e6e6; }

.buttons-row { margin-top:12px; }
.buttons-right { display:flex; gap:0.5rem; justify-content:flex-end; margin-top:8px; }

.btn-blue { padding:8px 14px; color:white; background:rgb(51,87,249); border:none; border-radius:6px; }
.btn-white { padding:8px 14px; background:white; border:1px solid #dcdcdc; border-radius:6px; }
</style>