<template>
  <div class="v-productData">
    <div class="v-productButtons">
      <div class="title-and-photo">
        <img :src="user.photo_url || fallback" @error="onImgError" class="detail-photo" alt="user photo" />
        <h2 id="v-product-Name">{{ user.nombre }}</h2>
      </div>

      <div class="buttons-group">
        <button class="btn btn-outline" @click="$emit('close')">Return</button>
        <button class="btn btn-outline" @click="$emit('edit', user)">Edit</button>
        <button class="btn btn-primary" @click="download"><i class="fa-solid fa-download"></i> Download</button>
      </div>
    </div>

    <div class="overview">
      <div class="col1">
        <div class="primaryDetails card">
          <h5>Details</h5>

          <div class="row">
            <p class="label">Nombre</p>
            <p class="value">{{ user.nombre }}</p>
          </div>

          <div class="row">
            <p class="label">Username</p>
            <p class="value">{{ user.username }}</p>
          </div>

          <div class="row">
            <p class="label">Rol</p>
            <p class="value">{{ user.rol }}</p>
          </div>

          <div class="row">
            <p class="label">Teléfono</p>
            <p class="value">{{ user.telefono }}</p>
          </div>

          <div class="row">
            <p class="label">Email</p>
            <p class="value">{{ user.email }}</p>
          </div>

          <div class="row">
            <p class="label">Dirección</p>
            <p class="value">{{ user.direccion }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as api from "./../../api/admins.api.js";

export default {
  props: { user: { type: Object, required: true } },
  data() {
    return {
      fallback:
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
          "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='120'><rect width='100%' height='100%' fill='#f4f4f4'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' fill='#9c9c9c' font-family='Arial' font-size='14'>No Image</text></svg>"
        )
    };
  },
  methods: {
    async onDelete() {
      if (!confirm(`Delete "${this.user.nombre}"?`)) return;
      await api.deleteUser(this.user.id);
      this.$emit("delete", this.user);
      this.$emit("close");
    },
    onImgError(e) {
      const img = e.target;
      if (img.dataset.failed) return;
      img.dataset.failed = "true";
      img.src = this.fallback;
    },
    download() {
      try {
        const rows = [
          ["Nombre", this.user.nombre || ""],
          ["Username", this.user.username || ""],
          ["Rol", this.user.rol || ""],
          ["Teléfono", this.user.telefono || ""],
          ["Email", this.user.email || ""],
          ["Dirección", this.user.direccion || ""],
          ["Photo URL", this.user.photo_url || ""]
        ];
        const csv = rows.map(r => `"${r[0].replace(/"/g,'""')}","${String(r[1]||'').replace(/"/g,'""')}"`).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${(this.user.nombre || "user").replace(/\s+/g, "_")}_details.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Download admin failed", err);
        alert("Failed to generate download. Revisa la consola.");
      }
    }
  }
};
</script>

<style scoped>
.v-productData { max-width: 1100px; margin: 20px auto; padding: 0 20px 40px; font-family: Inter, "Helvetica Neue", Arial, sans-serif; color: #333; }
.v-productButtons { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }
.title-and-photo { display:flex; align-items:center; gap:14px; }
.detail-photo { width:120px; height:90px; object-fit:cover; border-radius:8px; border:1px solid #eee; }
#v-product-Name { margin:0; font-size:20px; font-weight:700; color:#222; }
.buttons-group { display:flex; gap:10px; align-items:center; }
.btn { border:1px solid #d7d7d7; background:#fff; color:#444; padding:8px 12px; border-radius:8px; font-size:0.9rem; cursor:pointer; display:inline-flex; gap:8px; align-items:center; }
.btn i { margin-right:6px; }
.btn-primary { background:#1471ff; color:white; border-color:#1471ff; }
.btn-outline { background:white; color:#444; }
.btn-danger { background:#fff6f6; color:#c0392b; border-color:#f1b0ad; }
.btn-outline:hover {
  background: #f5f5f5;
}
.btn-primary:hover {
  background: #436495;
  border-color: #436495;
}
.overview { display:grid; grid-template-columns:1fr; gap:20px; align-items:start; }
.card { background:white; border-radius:8px; padding:18px; box-shadow:0 2px 8px rgba(11,22,40,0.03); border:1px solid #f0f0f0; }
.primaryDetails h5 { margin:0 0 14px; font-size:16px; color:#333; font-weight:700; }
.row { display:flex; align-items:center; gap:24px; padding:8px 0; border-bottom:1px dashed #f3f3f3; }
.row:last-of-type { border-bottom:0; }
.label { width:200px; color:#9aa0a6; font-size:0.95rem; }
.value { color:#3b3b3b; font-weight:600; }
@media (max-width:980px) { .overview { grid-template-columns:1fr; } .label { width:140px; } .detail-photo { width:96px; height:72px; } }
</style>