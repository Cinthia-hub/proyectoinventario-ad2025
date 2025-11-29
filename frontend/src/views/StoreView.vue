<template>
  <div id="dashboard-wrapper">
    <Sidebar :collapsed="!sidebarOpen" @navigate="onNavigate" />
    
    <div class="main-area" :class="{ 'sidebar-collapsed': !sidebarOpen }">
      <Navbar
        :sidebar-open="sidebarOpen"
        :placeholder="'Buscar tienda...'"
        @toggle-sidebar="toggleSidebar"
        @search="handleSearch"
        @navigate="onNavigate"
      />

      <div class="content">
        <section class="card table-card">
          <div class="table-header">
            <h3>Administrar Tiendas</h3>
            <div class="table-actions">
              <button class="btn-blue" @click="openAdd">
                <i class="fa-solid fa-plus"></i> Add Store
              </button>
              
              <button class="btn-white" @click="openFilterModal">
                <i class="fa-solid fa-filter"></i> Filters
              </button>

              <button class="btn-white" @click="downloadAll">
                Download all
              </button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Dirección</th>
                  <th>Teléfono</th>
                  <th>Gerente</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="store in pagedStores" :key="store.id">
                  <td>
                    <div class="name-cell">
                      <div class="avatar">
                        {{ store.name ? store.name.charAt(0).toUpperCase() : 'T' }}
                      </div>
                      <span class="name-text">{{ store.name }}</span>
                    </div>
                  </td>
                  <td>{{ store.address }}</td>
                  <td>{{ store.phone }}</td>
                  <td>{{ store.manager }}</td>
                  <td class="actions-cell">
                    <button class="action-btn edit" @click="openEdit(store)">Edit</button>
                    <button class="action-btn delete" @click="requestDelete(store)">Delete</button>
                  </td>
                </tr>
                <tr v-if="stores.length === 0">
                  <td colspan="5" class="empty-state">
                    No hay tiendas registradas o cargando...
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination-wrapper" v-if="totalPages > 1">
            <button class="page-btn" :disabled="currentPage <= 1" @click="prevPage">Anterior</button>
            <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
            <button class="page-btn" :disabled="currentPage >= totalPages" @click="nextPage">Siguiente</button>
          </div>
        </section>
      </div>

      <div v-if="showForm" class="modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Editar Tienda' : 'Nueva Tienda' }}</h3>
            <button class="close-btn" @click="closeForm">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Nombre de la Tienda</label>
              <input v-model="formStore.name" type="text" class="input-field" placeholder="Ej: Sucursal Centro">
            </div>
            <div class="form-group">
              <label>Dirección</label>
              <input v-model="formStore.address" type="text" class="input-field" placeholder="Calle y número">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Teléfono</label>
                <input v-model="formStore.phone" type="text" class="input-field">
              </div>
              <div class="form-group">
                <label>Gerente</label>
                <input v-model="formStore.manager" type="text" class="input-field">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-white" @click="closeForm">Cancelar</button>
            <button class="btn-blue" @click="saveStore">
              {{ isSaving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="showFilterModal" class="modal-backdrop">
        <div class="modal-card small">
          <div class="modal-header">
            <h3>Filtrar Tiendas</h3>
            <button class="close-btn" @click="closeFilterModal">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Campo</label>
              <select v-model="currentFilter.field" class="input-field">
                <option value="" disabled>Selecciona un campo</option>
                <option v-for="field in filterFields" :key="field.value" :value="field.value">
                  {{ field.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Valor</label>
              <input v-model="currentFilter.value" type="text" class="input-field" placeholder="Escribe para buscar...">
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-white" @click="clearFilter">Limpiar</button>
            <button class="btn-blue" @click="applyFilter">Aplicar</button>
          </div>
        </div>
      </div>

      <div v-if="showDeleteConfirm" class="modal-backdrop">
        <div class="modal-card small">
          <div class="modal-header">
            <h3>Confirmar Borrado</h3>
          </div>
          <div class="modal-body">
            <p>¿Estás seguro de que quieres eliminar <strong>{{ storeToDelete?.name }}</strong>?</p>
            <p class="warning-text">Esta acción no se puede deshacer.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-white" @click="closeDelete">Cancelar</button>
            <button class="btn-red" @click="confirmDelete">Eliminar</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import Sidebar from "../components/layout/Sidebar.vue";
import Navbar from "../components/layout/Navbar.vue";
import * as api from "../api/stores.api.js";

export default {
  name: "StoresView",
  components: { Sidebar, Navbar },
  data() {
    return {
      sidebarOpen: true,
      search: "",
      currentPage: 1,
      perPage: 7,
      isSaving: false,
      
      stores: [],
      
      // Control del Formulario
      showForm: false,
      isEditing: false,
      formStore: { name: "", address: "", phone: "", manager: "" },
      
      // Control del Borrado
      showDeleteConfirm: false,
      storeToDelete: null,

      // --- DATOS NUEVOS PARA FILTROS ---
      showFilterModal: false,
      currentFilter: { field: "", value: "" },
      filterFields: [
        { label: "Nombre", value: "name" },
        { label: "Dirección", value: "address" },
        { label: "Gerente", value: "manager" },
        { label: "Teléfono", value: "phone" }
      ]
    };
  },
  computed: {
    filteredStores() {
      // 1. Búsqueda General (Barra superior)
      let tempStores = this.stores;
      const s = this.search.toLowerCase();
      
      if (s) {
        tempStores = tempStores.filter(store => {
          const name = store.name ? store.name.toLowerCase() : "";
          const manager = store.manager ? store.manager.toLowerCase() : "";
          return name.includes(s) || manager.includes(s);
        });
      }

      // 2. Filtro Específico (Modal)
      if (this.currentFilter.field && this.currentFilter.value) {
        const field = this.currentFilter.field;
        const val = this.currentFilter.value.toLowerCase();
        
        tempStores = tempStores.filter(store => {
          const fieldValue = store[field] ? store[field].toString().toLowerCase() : "";
          return fieldValue.includes(val);
        });
      }

      return tempStores;
    },
    totalPages() {
      return Math.ceil(this.filteredStores.length / this.perPage) || 1;
    },
    pagedStores() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredStores.slice(start, start + this.perPage);
    }
  },
  methods: {
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; },
    handleSearch(term) { this.search = term; this.currentPage = 1; },
    onNavigate(key) {
      const map = { home: "/", products: "/products", inventory: "/inventory", suppliers: "/suppliers", orders: "/orders", stores: "/stores" };
      if (this.$router) this.$router.push(map[key] || "/");
    },

    // --- API ---
    async load() {
      try {
        const data = await api.getStores();
        this.stores = Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Error cargando tiendas:", error);
      }
    },

    async saveStore() {
      this.isSaving = true;
      try {
        if (this.isEditing) {
          await api.updateStore(this.formStore.id, this.formStore);
        } else {
          await api.createStore(this.formStore);
        }
        await this.load();
        this.closeForm();
      } catch (error) {
        console.error("Error al guardar:", error);
        alert("Hubo un error al guardar.");
      } finally {
        this.isSaving = false;
      }
    },

    async confirmDelete() {
      try {
        await api.deleteStore(this.storeToDelete.id);
        await this.load();
        this.closeDelete();
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("No se pudo eliminar la tienda.");
      }
    },

    // --- MODALES FORMULARIO ---
    openAdd() {
      this.isEditing = false;
      this.formStore = { name: "", address: "", phone: "", manager: "" };
      this.showForm = true;
    },
    openEdit(store) {
      this.isEditing = true;
      this.formStore = { ...store }; 
      this.showForm = true;
    },
    closeForm() { this.showForm = false; },
    
    requestDelete(store) {
      this.storeToDelete = store;
      this.showDeleteConfirm = true;
    },
    closeDelete() {
      this.showDeleteConfirm = false;
      this.storeToDelete = null;
    },

    // --- MÉTODOS DE FILTRO Y DESCARGA (NUEVOS) ---
    openFilterModal() {
      this.showFilterModal = true;
    },
    closeFilterModal() {
      this.showFilterModal = false;
    },
    applyFilter() {
      // El filtro ya es reactivo por el computed 'filteredStores', solo cerramos modal
      this.showFilterModal = false;
      this.currentPage = 1; 
    },
    clearFilter() {
      this.currentFilter = { field: "", value: "" };
      this.showFilterModal = false;
      this.currentPage = 1;
    },
    downloadAll() {
      // Generar CSV
      const headers = ["Nombre", "Dirección", "Teléfono", "Gerente"];
      const rows = this.stores.map(s => [
        `"${s.name || ''}"`, 
        `"${s.address || ''}"`, 
        `"${s.phone || ''}"`, 
        `"${s.manager || ''}"`
      ]);
      
      const csvContent = [
        headers.join(","), 
        ...rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "tiendas_reporte.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    // --- PAGINACIÓN ---
    nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; },
    prevPage() { if (this.currentPage > 1) this.currentPage--; }
  },
  mounted() {
    this.load();
    if (window.innerWidth < 900) this.sidebarOpen = false;
    window.addEventListener("resize", () => {
        if (window.innerWidth >= 900) this.sidebarOpen = true;
    });
  }
};
</script>

<style scoped>
/* ESTRUCTURA */
#dashboard-wrapper { display: flex; width: 100%; min-height: 100vh; }
.main-area { width: 100%; min-height: 100vh; background-color: #f4f5f7; display: flex; flex-direction: column; transition: margin-left 0.3s; }
.main-area:not(.sidebar-collapsed) { margin-left: 260px; }
.sidebar-collapsed .main-area { margin-left: 80px; }
.content { padding: 20px; flex-grow: 1; }

/* TARJETA */
.card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
/* Estilo para agrupar botones a la derecha */
.table-actions { display: flex; gap: 10px; }

/* TABLA */
.custom-table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px; color: #333; border-bottom: 1px solid #eee; font-weight: bold; }
td { padding: 12px; border-bottom: 1px solid #f9f9f9; color: #555; vertical-align: middle; }
.empty-state { text-align: center; color: #999; padding: 30px; }

/* Celdas */
.name-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 35px; height: 35px; background: #e0f2fe; color: #0284c7; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.name-text { font-weight: 500; color: #2196f3; }

/* BOTONES */
.btn-blue { background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 500;}
.btn-blue:hover { background: #1976d2; }

.btn-white { background: white; border: 1px solid #ddd; padding: 8px 16px; border-radius: 4px; cursor: pointer; color: #555; display: flex; align-items: center; gap: 8px; font-weight: 500;}
.btn-white:hover { background: #f5f5f5; }

.btn-red { background: #f44336; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.btn-red:hover { background: #d32f2f; }

.action-btn { padding: 5px 10px; border: 1px solid #eee; background: white; border-radius: 4px; cursor: pointer; margin-right: 5px; font-size: 0.8rem; }
.action-btn.edit { color: #2196f3; }
.action-btn.delete { color: #f44336; }
.action-btn:hover { background-color: #f5f5f5; }

/* MODALES */
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-card { background: white; width: 500px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); overflow: hidden; }
.modal-card.small { width: 350px; text-align: center; }
.modal-card.small .modal-body { text-align: left; } /* Para el form de filtro */
.modal-card.small .modal-header { justify-content: space-between; }

.modal-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 20px; }
.modal-footer { padding: 15px 20px; background: #f9f9f9; display: flex; justify-content: flex-end; gap: 10px; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999; }
.warning-text { color: #f44336; font-size: 0.9rem; margin-top: 5px; }

/* FORMULARIOS */
.form-group { margin-bottom: 15px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.9rem; }
.input-field { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
/* Select style fix */
select.input-field { background-color: white; }

/* PAGINACIÓN */
.pagination-wrapper { margin-top: 15px; display: flex; justify-content: flex-end; align-items: center; gap: 10px; }
.page-info { font-size: 0.9rem; color: #666; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>