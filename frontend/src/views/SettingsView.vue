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
              <button class="btn-white" @click="loadSettings" :disabled="isLoading">
                <i class="fa-solid fa-rotate-right"></i> Reload
              </button>
              <button class="btn-blue" @click="saveStoreSettings" :disabled="isLoading">
                {{ isLoading ? 'Saving...' : 'Save Settings' }}
              </button>
            </div>
          </div>

          <hr class="divider" />

          <div class="settings-grid">
            
            <div class="settings-column">
              <h4 class="column-title">General Information</h4>
              <div class="form-group">
                <label class="blue-label">Store Name</label>
                <input type="text" v-model="store.name" class="input-field" placeholder="Ex: Mercadito" />
              </div>
              <div class="form-group">
                <label class="blue-label">Description</label>
                <textarea v-model="store.description" class="input-field" rows="4" placeholder="Slogan or description..."></textarea>
              </div>
              <div class="form-group">
                <label class="blue-label">Currency</label>
                <select v-model="store.currency" class="input-field">
                  <option value="MXN">MXN ($)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>

            <div class="settings-column">
              <h4 class="column-title">Contact & Location</h4>
              <div class="form-group">
                <label class="blue-label">Address</label>
                <input type="text" v-model="store.address" class="input-field" placeholder="Main St 123" />
              </div>
              <div class="form-group">
                <label class="blue-label">Phone</label>
                <input type="text" v-model="store.phone" class="input-field" placeholder="+52..." />
              </div>
              <div class="form-group">
                <label class="blue-label">Email</label>
                <input type="email" v-model="store.email" class="input-field" placeholder="contact@store.com" />
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
                  <p class="small-text">Upload your image</p>
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
import Sidebar from "../components/layout/Sidebar.vue";
import Navbar from "../components/layout/Navbar.vue";
// Importamos la nueva API de settings
import * as api from "../api/settings.api.js";

export default {
  name: "SettingsView",
  components: { Sidebar, Navbar },
  data() {
    return {
      sidebarOpen: true,
      isLoading: false,
      logoPreview: null,
      
      // Objeto principal de datos
      store: {
        name: "",
        description: "",
        currency: "MXN",
        address: "",
        phone: "",
        email: ""
      }
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
    
    onNavigate(key) {
      const map = {
        home: "/", products: "/products", inventory: "/inventory",
        suppliers: "/suppliers", orders: "/orders", stores: "/stores",
        manage: "/settings"
      };
      const path = map[key] || "/";
      if (this.$router) this.$router.push(path).catch(() => {});
    },
    
    handleLogoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Validar tamaño (opcional, pero recomendado porque Firestore aguanta 1MB por documento)
      if (file.size > 1048576) { // 1MB
        alert("La imagen es muy pesada. Intenta con una menor a 1MB.");
        return;
      }

      const reader = new FileReader();
      
      // Cuando termine de leer el archivo...
      reader.onload = (e) => {
        // e.target.result contiene la cadena "data:image/png;base64,....."
        this.logoPreview = e.target.result; // Para mostrarla ahorita
        this.store.logoUrl = e.target.result; // Para guardarla en la BD
      };

      // Leemos el archivo como URL de datos (Base64)
      reader.readAsDataURL(file);
    },

    // --- CARGAR DATOS ---
    async loadSettings() {
      this.isLoading = true;
      try {
        const data = await api.getSettings();
        // Si data existe, mezclamos con el objeto store
        if (data) {
          // Usamos spread para asignar solo lo que venga, manteniendo defaults si algo falta
          this.store = { ...this.store, ...data };
        }
      } catch (error) {
        console.error("Error cargando settings:", error);
      } finally {
        this.isLoading = false;
      }
    },

    // --- GUARDAR DATOS ---
    async saveStoreSettings() {
      this.isLoading = true;
      try {
        await api.saveSettings(this.store);
        alert("Settings saved successfully!");
      } catch (error) {
        console.error("Error guardando settings:", error);
        alert("Failed to save settings.");
      } finally {
        this.isLoading = false;
      }
    }
  },
  mounted() {
    // Cargar datos al iniciar la página
    this.loadSettings();

    if (window.innerWidth < 900) this.sidebarOpen = false;
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 900) this.sidebarOpen = true;
    });
  }
};
</script>

<style scoped>
/* ESTILOS (Mismos que antes) */
#dashboard-wrapper { display: flex; width: 100%; min-height: 100vh; }
.main-area { width: 100%; min-height: 100vh; background-color: #f4f5f7; transition: margin-left 0.3s; display: flex; flex-direction: column; }
.main-area:not(.sidebar-collapsed) { margin-left: 260px; }
.sidebar-collapsed .main-area { margin-left: 80px; }
.content { padding: 20px; flex-grow: 1; }

.card { background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.card-header-area { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
.page-title { margin: 0; font-size: 1.5rem; color: #333; font-weight: bold; }
.page-subtitle { margin: 5px 0 0 0; color: #888; font-size: 0.9rem; }
.divider { border: 0; border-top: 1px solid #eee; margin-bottom: 25px; }

.settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; }
.column-title { margin: 0 0 20px 0; color: #333; font-weight: 600; border-bottom: 2px solid #f4f5f7; padding-bottom: 10px; }
.form-group { margin-bottom: 20px; }
.blue-label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.9rem; color: #2196f3; }
.input-field { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; color: #555; }
.input-field:focus { border-color: #2196f3; outline: none; }

.header-actions { display: flex; gap: 10px; }
.btn-blue { background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.btn-white { background: white; border: 1px solid #ddd; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.btn-blue:disabled, .btn-white:disabled { opacity: 0.6; cursor: not-allowed; }

.logo-uploader-box { display: flex; flex-direction: column; align-items: center; border: 2px dashed #eee; padding: 20px; border-radius: 8px; }
.logo-preview { width: 80px; height: 80px; border-radius: 50%; background: #eee center/cover; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; color: #aaa; }
input[type="file"] { display: none; }
.custom-file-upload { border: 1px solid #ddd; padding: 6px 12px; cursor: pointer; border-radius: 4px; font-size: 0.9rem; background: white; }
.small-text { font-size: 0.75rem; color: #999; margin-top: 5px; }
</style>