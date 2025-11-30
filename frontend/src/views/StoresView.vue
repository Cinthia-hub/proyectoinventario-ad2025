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
            <h3 v-if="!viewingStore">Administrar Tiendas</h3>
            <div v-if="!viewingStore" class="table-actions">
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

            <!-- When viewingStore is set, show a small breadcrumb/return action on the header -->
          </div>

          <!-- Lista / Tabla (visible only when not viewing a single store) -->
          <div v-if="!viewingStore">
            <store-list
              :stores="pagedStores"
              :page="currentPage"
              :total-pages="totalPages"
              @next="nextPage"
              @prev="prevPage"
              @select="viewStore"
              @edit="openEdit"
              @delete="requestDelete"
            />
          </div>

          <!-- Vista detallada (reemplaza la tabla, inline) -->
          <div v-else>
            <store-view
              :store="viewingStore"
              @close="onViewClose"
              @edit="openEditFromView"
              @delete="requestDeleteFromView"
            />
          </div>
        </section>
      </div>

      <!-- Formulario modal (create / edit) -->
      <store-form
        v-if="showForm"
        :store="editingStore"
        @close="closeForm"
        @saved="onSaved"
      />

      <!-- Filter modal -->
      <filter-modal
        v-if="showFilterModal"
        :fields="filterFields"
        :initial="currentFilter"
        @apply="applyFilter"
        @clear="clearFilter"
        @close="() => { showFilterModal = false; overlayVisible = false }"
      />

      <!-- Confirm delete modal -->
      <confirm-modal
        :visible="confirmModalVisible"
        title="Delete store"
        :message="confirmMessage"
        @confirm="onConfirmDelete"
        @cancel="onCancelDelete"
      />

      <!-- overlay (dim) used only for modals (form/filter/confirm) -->
      <div :class="{ 'overlay-hidden': !overlayVisible }" class="overlay-dim"></div>
    </div>
  </div>
</template>

<script>
import Sidebar from "./../components/layout/Sidebar.vue";
import Navbar from "./../components/layout/Navbar.vue";
import StoreList from "./../components/store/StoreList.vue";
import StoreForm from "./../components/store/StoreForm.vue";
import StoreView from "./../components/store/StoreView.vue";
import FilterModal from "./../components/store/FilterModal.vue";
import ConfirmModal from "./../components/layout/ConfirmModal.vue";
import * as api from "./../api/stores.api.js";

export default {
  name: "StoresView",
  components: { Sidebar, Navbar, StoreList, StoreForm, StoreView, FilterModal, ConfirmModal },
  data() {
    return {
      sidebarOpen: true,
      search: "",
      currentPage: 1,
      perPage: 7,
      isSaving: false,
      stores: [],
      // Form controls
      showForm: false,
      editingStore: null,
      // View controls
      viewingStore: null,
      overlayVisible: false,
      // Delete controls
      showDeleteConfirm: false,
      storeToDelete: null,
      confirmModalVisible: false,
      confirmMessage: "",
      // Filter modal
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
      let tempStores = this.stores || [];
      const s = (this.search || "").trim().toLowerCase();
      if (s) {
        tempStores = tempStores.filter(store => {
          const name = String(store.name || store.nombre || "").toLowerCase();
          const manager = String(store.manager || store.gerente || "").toLowerCase();
          return name.includes(s) || manager.includes(s);
        });
      }
      if (this.currentFilter && this.currentFilter.field && this.currentFilter.value) {
        const { field, value } = this.currentFilter;
        const val = String(value).toLowerCase();
        // handle possible español field names in documents
        tempStores = tempStores.filter(store => {
          const candidate = store[field] || (field === 'name' ? store.nombre : store[field]);
          return String(candidate || "").toLowerCase().includes(val);
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
    // API
    async load() {
      try {
        const data = await api.getStores();
        this.stores = Array.isArray(data)
          ? data.map(d => ({
              id: d.id,
              name: d.name || d.nombre || "",
              address: d.address || d.direccion || "",
              phone: d.phone || "",
              manager: d.manager || d.gerente || "",
              photo_url: d.photo_url || d.url || "",
              notes: d.notes || ""
            }))
          : [];
      } catch (error) {
        console.error("Error cargando tiendas:", error);
        this.stores = [];
      }
    },

    // create/edit handled via child; fallback method retained
    async saveStore() {
      this.isSaving = true;
      try {
        if (this.editingStore && this.editingStore.id) {
          await api.updateStore(this.editingStore.id, this.editingStore);
        } else {
          await api.addStore(this.editingStore || {});
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

    openAdd() {
      this.editingStore = { name: "", address: "", phone: "", manager: "", photo_url: "", notes: "" };
      this.showForm = true;
      this.overlayVisible = true;
    },

    openEdit(store) {
      this.editingStore = { ...store };
      this.showForm = true;
      this.overlayVisible = true;
    },

    openEditFromView(store) {
      this.openEdit(store);
    },

    closeForm() {
      this.showForm = false;
      this.overlayVisible = false;
      this.editingStore = null;
    },

    viewStore(store) {
      // view in place (replace table)
      const found = this.stores.find(s => s.id === store.id) || store;
      this.viewingStore = found;
      // keep overlayVisible false so table is replaced (no dim)
    },

    onViewClose() {
      this.viewingStore = null;
    },

    requestDelete(store) {
      this.storeToDelete = store;
      this.confirmMessage = `Delete "${store.name || store.nombre}"?`;
      this.confirmModalVisible = true;
      this.overlayVisible = true;
    },

    requestDeleteFromView(store) {
      this.requestDelete(store);
    },

    async onConfirmDelete() {
      if (!this.storeToDelete || !this.storeToDelete.id) {
        this.confirmModalVisible = false;
        this.overlayVisible = false;
        this.storeToDelete = null;
        return;
      }
      try {
        await api.deleteStore(this.storeToDelete.id);
        await this.load();
        if (this.viewingStore && this.viewingStore.id === this.storeToDelete.id) {
          this.viewingStore = null;
        }
      } catch (err) {
        console.error("Delete failed", err);
        alert("No se pudo eliminar la tienda.");
      } finally {
        this.confirmModalVisible = false;
        this.overlayVisible = false;
        this.storeToDelete = null;
      }
    },

    onCancelDelete() {
      this.confirmModalVisible = false;
      this.overlayVisible = false;
      this.storeToDelete = null;
    },

    openFilterModal() {
      this.showFilterModal = true;
    },

    applyFilter(payload) {
      this.currentFilter = { field: payload.field, value: payload.value };
      this.showFilterModal = false;
      this.overlayVisible = false;
      this.currentPage = 1;
    },

    clearFilter() {
      this.currentFilter = { field: "", value: "" };
      this.showFilterModal = false;
      this.overlayVisible = false;
      this.currentPage = 1;
    },

    nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; },
    prevPage() { if (this.currentPage > 1) this.currentPage--; },

    onSaved(savedStore) {
      // update in-memory list with result from child
      if (savedStore && savedStore.id) {
        const idx = this.stores.findIndex(s => s.id === savedStore.id);
        if (idx >= 0) this.stores.splice(idx, 1, { ...savedStore });
        else this.stores.unshift({ ...savedStore });
        if (this.viewingStore && this.viewingStore.id === savedStore.id) this.viewingStore = { ...savedStore };
      } else {
        this.load();
      }
      this.closeForm();
    },

    downloadAll() {
      const headers = ["Nombre", "Dirección", "Teléfono", "Gerente", "Photo URL"];
      const rows = this.stores.map(s => [
        s.name || '',
        s.address || '',
        s.phone || '',
        s.manager || '',
        s.photo_url || ''
      ]);
      const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "stores_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  mounted() {
    this.load();
    if (window.innerWidth < 900) this.sidebarOpen = false;
    window.addEventListener("resize", () => { if (window.innerWidth >= 900) this.sidebarOpen = true; });
  }
};
</script>

<style scoped>
/* Mantengo tus estilos originales para que no cambie apariencia */
#dashboard-wrapper { display: flex; width: 100%; min-height: 100vh; }
.main-area { width: 100%; min-height: 100vh; background-color: #f4f5f7; display: flex; flex-direction: column; transition: margin-left 0.3s; }
.main-area:not(.sidebar-collapsed) { margin-left: 260px; }
.sidebar-collapsed .main-area { margin-left: 80px; }
.content { padding: 20px; flex-grow: 1; }
.card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.table-actions { display: flex; gap: 10px; }
.view-header { display:flex; justify-content:space-between; align-items:center; width:100%; }
.view-actions { display:flex; gap:8px; }
.custom-table { width: 100%; border-collapse: collapse; }
th { text-align: left; padding: 12px; color: #333; border-bottom: 1px solid #eee; font-weight: bold; }
td { padding: 12px; border-bottom: 1px solid #f9f9f9; color: #555; vertical-align: middle; }
.empty-state { text-align: center; color: #999; padding: 30px; }
.name-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 35px; height: 35px; background: #e0f2fe; color: #0284c7; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.name-text { font-weight: 500; color: #2196f3; }
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
.modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1200; }
.modal-card { background: white; width: 920px; max-width: calc(100% - 40px); border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); overflow: hidden; padding: 0; }
.modal-card.large { width: 920px; }
.modal-card.small { width: 350px; text-align: center; }
.modal-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
.modal-body { padding: 20px; }
.modal-footer { padding: 15px 20px; background: #f9f9f9; display: flex; justify-content: flex-end; gap: 10px; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999; }
.warning-text { color: #f44336; font-size: 0.9rem; margin-top: 5px; }
.form-group { margin-bottom: 15px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.9rem; }
.input-field { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
select.input-field { background-color: white; }
.pagination-wrapper { margin-top: 15px; display: flex; justify-content: flex-end; align-items: center; gap: 10px; }
.page-info { font-size: 0.9rem; color: #666; }
.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.overlay-hidden { display:none; }
.overlay-dim { position: fixed; inset:0; background: rgba(0,0,0,0.35); z-index: 1100; display:none; }
.overlay-dim:not(.overlay-hidden) { display:block; }
</style>