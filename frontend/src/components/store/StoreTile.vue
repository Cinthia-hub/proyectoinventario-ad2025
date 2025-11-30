<template>
  <div class="store-tile" @click="$emit('click', store)">
    <!-- left: cover (50%) -->
    <div class="tile-cover" :style="{ backgroundImage: `url('${store.photo_url || placeholder}')` }" />

    <!-- right: content (50%) -->
    <div class="tile-content">
      <!-- supplier avatar centered in top area -->
      <div class="supplier-wrap">
        <img
          class="supplier-avatar"
          :src="store.manager_photo || store.manager_avatar || placeholder"
          :alt="store.manager || 'Proveedor'"
          @error="onImgError"
        />
      </div>

      <!-- names and tags -->
      <div class="tile-body">
        <h4 class="tile-store-name">{{ store.name || store.nombre || 'Tienda' }}</h4>
        <p class="tile-supplier">
          <i class="fa-solid fa-user-tie"></i>
          <span>{{ store.manager || store.contact || '-' }}</span>
        </p>

        <div class="tile-tags">
          <span v-for="(t, i) in normalizedTags" :key="i" class="tag-pill">{{ t }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "StoreTile",
  props: {
    store: { type: Object, required: true },
    placeholder: { type: String, default: "" }
  },
  computed: {
    normalizedTags() {
      const tags = this.store.tags || this.store.categories || this.store.store_tags || [];
      if (Array.isArray(tags) && tags.length) return tags.slice(0, 3);
      if (typeof tags === "string" && tags.trim()) return tags.split(",").map(s => s.trim()).slice(0, 3);
      const fallbacks = [];
      if (this.store.type) fallbacks.push(this.store.type);
      if (this.store.category) fallbacks.push(this.store.category);
      return fallbacks.slice(0, 3);
    }
  },
  methods: {
    onImgError(e) {
      const img = e.target;
      if (img.dataset.failed) return;
      img.dataset.failed = "true";
      img.src = this.placeholder || "";
    }
  }
};
</script>

<style scoped>
.store-tile {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
  transition: transform .14s ease, box-shadow .14s ease;
  cursor: pointer;
  min-height: 180px;
}
.store-tile:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.09);
}

.tile-cover {
  width: 100%;
  height: 100%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}

/* right content */
.tile-content {
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 8px;
  position: relative;
}

/* supplier avatar circle (overlapping top) */
.supplier-wrap {
  position: absolute;
  left: 18px;
  top: -28px;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.supplier-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 4px solid #fff;
  object-fit: cover;
  box-shadow: 0 6px 18px rgba(10, 20, 40, 0.08);
  background: #fff;
}

/* spacer */
.tile-content::before {
  content: "";
  display: block;
  height: 12px;
}

/* body */
.tile-body {
  margin-top: 24px;
}
.tile-store-name {
  margin: 0 0 6px 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f1724;
}
.tile-supplier {
  margin: 0 0 12px 0;
  color: #64748b;
  display:flex;
  align-items:center;
  gap:8px;
  font-size:0.92rem;
}
.tile-supplier i { color:#64748b; }

.tile-tags { display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
.tag-pill {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding:6px 10px;
  background:#f1f5f9;
  color:#334155;
  border-radius:999px;
  font-size:0.78rem;
  font-weight:600;
  border: 1px solid rgba(20,20,20,0.03);
}

/* responsive: stack on small screens */
@media (max-width: 720px) {
  .store-tile { grid-template-columns: 1fr; min-height: 240px; }
  .supplier-wrap { left: 16px; top: 86px; }
  .tile-body { margin-top: 46px; }
}
</style>