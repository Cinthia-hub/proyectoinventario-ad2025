<template>
  <header class="topbar">
    <div class="topbar-left">
      <button class="menu-btn" @click="onToggle" aria-label="Toggle menu">
        <i class="fa-solid fa-bars"></i>
      </button>

      <div class="search-wrapper">
        <i class="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          class="search-input"
          v-model="term"
          @input="onSearch"
          :placeholder="placeholder"
        />
      </div>
    </div>

    <div class="topbar-right">
      <button class="icon-btn" title="Notifications">
        <i class="fa-regular fa-bell"></i>
      </button>
      <button class="icon-btn" title="Profile">
        <i class="fa-solid fa-user"></i>
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: "Navbar",
  props: {
    sidebarOpen: { type: Boolean, default: true },
    placeholder: { type: String, default: "Search product, supplier, order" }
  },
  emits: ["toggle-sidebar", "search", "navigate"],
  data() {
    return {
      term: ""
    };
  },
  methods: {
    onToggle() {
      this.$emit("toggle-sidebar");
    },
    onSearch() {
      // emitimos el término de búsqueda al padre (añade debounce si quieres)
      this.$emit("search", this.term);
    },
    go(routeKey) {
      this.$emit("navigate", routeKey);
    },
    goHome() {
      this.$emit("navigate", "home");
    }
  }
};
</script>

<style scoped>
.topbar {
  height: 64px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 99;
}

.topbar-left,
.topbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-wrapper { position: relative; display: flex; align-items: center; }
.search-input { padding: 8px 50px 8px 35px; border: 1px solid #ddd; border-radius: 4px; width: 350px; }
.search-icon { position: absolute; left: 15px; color: #888; }

.menu-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; }
.icon-btn { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #555; }
</style>