<template>
  <div id="dashboard-wrapper">
    <Sidebar :collapsed="!sidebarOpen" @navigate="onNavigate" />
    
    <div class="main-area" :class="{ 'sidebar-collapsed': !sidebarOpen }">
      <Navbar
        :sidebar-open="sidebarOpen"
        :placeholder="'Buscar configuración...'"
        @toggle-sidebar="toggleSidebar"
        @search="handleSearch"
        @navigate="onNavigate"
      />

      <div class="content">
        <section class="card main-card">
          
          <div class="card-header-area">
            <div>
              <h2 class="page-title">Manage Store</h2>
              <p class="page-subtitle">Configure your store details and branding</p>
            </div>
            <div class="header-actions">
              <button class="btn-white" @click="resetChanges">Discard</button>
              <button class="btn-blue" @click="saveStoreSettings">Save Settings</button>
            </div>
          </div>

          <hr class="divider" />

          <div class="settings-grid">
            
            <div class="settings-column">
              <h4 class="column-title">General Information</h4>
              <div class="form-group">
                <label class="blue-label">Store Name</label>
                <input type="text" v-model="store.name" class="input-field" />
              </div>
              <div class="form-group">
                <label class="blue-label">Description</label>
                <textarea v-model="store.description" class="input-field" rows="4"></textarea>
              </div>
              <div class="form-group">
                <label class="blue-label">Currency</label>
                <select v-model="store.currency" class="input-field">
                  <option value="MXN">MXN ($)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <div class="settings-column">
              <h4 class="column-title">Contact & Location</h4>
              <div class="form-group">
                <label class="blue-label">Address</label>
                <input type="text" v-model="store.address" class="input-field" />
              </div>
              <div class="form-group">
                <label class="blue-label">Phone</label>
                <input type="text" v-model="store.phone" class="input-field" />
              </div>
              <div class="form-group">
                <label class="blue-label">Email</label>
                <input type="email" v-model="store.email" class="input-field" />
              </div>
            </div>

            <div class="settings-column">
              <h4 class="column-title">Branding</h4>
              <div class="form-group">
                <label class="blue-label">Store Logo</label>
                <div class="logo-uploader-box">
                  <div class="logo-preview" :style="logoStyle">
                    <span v-if="!logoPreview">No Logo</span>
                  </div>
                  <label class="custom-file-upload">
                     <i class="fa-solid fa-cloud-arrow-up"></i> Upload
                     <input type="file" @change="handleLogoUpload" accept="image/*" />
                  </label>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
// Asegúrate de que la ruta sea correcta según tu estructura de carpetas
import Sidebar from "../components/layout/Sidebar.vue";
import Navbar from "../components/layout/Navbar.vue";

export default {
  name: "SettingsView",
  components: { Sidebar, Navbar },
  data() {
    return {
      sidebarOpen: true,
      logoPreview: null,
      store: {
        name: "Mecadito",
        description: "Your favorite local inventory system.",
        currency: "MXN",
        address: "Av. Tecnológico s/n",
        phone: "464 123 4567",
        email: "admin@mecadito.com"
      },
      originalStore: {}
    };
  },
  computed: {
    logoStyle() {
      return this.logoPreview ? { backgroundImage: `url(${this.logoPreview})` } : {};
    }
  },
  methods: {
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; },
    handleSearch(term) { console.log("Searching...", term); },
    
    // AQUÍ ES DONDE CONECTAMOS CON EL ROUTER
    onNavigate(key) {
      const map = {
        home: "/",
        products: "/products", // o /inventory
        inventory: "/inventory",
        suppliers: "/suppliers",
        orders: "/orders",
        manage: "/settings"  // <--- ESTA ES LA CLAVE PARA TU NUEVA VISTA
      };
      const path = map[key] || "/";
      if (this.$router) this.$router.push(path).catch(() => {});
    },
    
    handleLogoUpload(event) {
      const file = event.target.files[0];
      if (file) this.logoPreview = URL.createObjectURL(file);
    },
    saveStoreSettings() {
      alert("Settings saved!");
      this.originalStore = JSON.parse(JSON.stringify(this.store));
    },
    resetChanges() {
      this.store = JSON.parse(JSON.stringify(this.originalStore));
      this.logoPreview = null;
    }
  },
  mounted() {
    this.originalStore = JSON.parse(JSON.stringify(this.store));
    if (window.innerWidth < 900) this.sidebarOpen = false;
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 900) this.sidebarOpen = true;
    });
  }
};
</script>

<style scoped>
/* ESTILOS ESTRUCTURALES (Iguales al resto de la app) */
#dashboard-wrapper { display: flex; width: 100%; min-height: 100vh; }
.main-area { width: 100%; min-height: 100vh; background-color: #f4f5f7; transition: margin-left 0.3s; display: flex; flex-direction: column; }
.main-area:not(.sidebar-collapsed) { margin-left: 260px; }
.sidebar-collapsed .main-area { margin-left: 80px; }
.content { padding: 20px; flex-grow: 1; }

/* TARJETA BLANCA */
.card {
  background: white; border-radius: 8px; padding: 30px; 
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.card-header-area { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
.page-title { margin: 0; font-size: 1.5rem; color: #333; font-weight: bold; }
.page-subtitle { margin: 5px 0 0 0; color: #888; font-size: 0.9rem; }
.divider { border: 0; border-top: 1px solid #eee; margin-bottom: 25px; }

/* GRID Y FORMULARIOS */
.settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; }
.column-title { margin: 0 0 20px 0; color: #333; font-weight: 600; border-bottom: 2px solid #f4f5f7; padding-bottom: 10px; }
.form-group { margin-bottom: 20px; }
.blue-label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; color: #2196f3; }
.input-field { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; color: #555; }
.input-field:focus { border-color: #2196f3; outline: none; }

/* BOTONES Y UPLOAD */
.header-actions { display: flex; gap: 10px; }
.btn-blue { background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.btn-white { background: white; border: 1px solid #ddd; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.logo-uploader-box { display: flex; flex-direction: column; align-items: center; border: 2px dashed #eee; padding: 20px; border-radius: 8px; }
.logo-preview { width: 80px; height: 80px; border-radius: 50%; background: #eee center/cover; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; color: #aaa; }
input[type="file"] { display: none; }
.custom-file-upload { border: 1px solid #ddd; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-size: 0.9rem; background: white; }
</style>