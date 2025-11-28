<template>
  <div id="dashboard-wrapper">
    <Sidebar :collapsed="!sidebarOpen" @navigate="onNavigate" />
    <div class="main-area" :class="{ 'sidebar-collapsed': !sidebarOpen }">
      <!-- Navbar existente -->
      <Navbar
        :sidebar-open="sidebarOpen"
        :placeholder="'Buscar proveedor...'"
        @toggle-sidebar="toggleSidebar"
        @search="handleSearch"
        @navigate="onNavigate"
      />

      <div class="content">
        <!-- Header / acciones -->
        <section class="card table-card">
          <div class="table-header">
            <h3 v-if="!viewingSupplier">Proveedores</h3>
            <div v-if="!viewingSupplier" class="table-actions">
              <button class="btn-blue" @click="openAdd">Add Supplier</button>
              <button class="btn-white" @click="openFilterModal"><i class="fas fa-filter"></i> Filters</button>
              <button class="btn-white" @click="downloadAll">Download all</button>
            </div>
          </div>

          <!-- Lista / tabla -->
          <supplier-list
            v-if="!viewingSupplier"
            :suppliers="pagedSuppliers"
            :page="currentPage"
            :total-pages="totalPages"
            @next="nextPage"
            @prev="prevPage"
            @select="viewSupplier"
            @edit="openEdit"
            @delete="requestDelete"
          />

          <!-- Vista detallada -->
          <supplier-view
            v-if="viewingSupplier"
            :supplier="viewingSupplier"
            @close="onViewClose"
            @edit="openEdit"
            @delete="requestDelete"
          />
        </section>
      </div>

      <!-- Modal / Form centro -->
      <supplier-form
        v-if="showForm"
        :supplier="editingSupplier"
        @close="closeForm"
        @saved="onSaved"
      />

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
        title="Delete supplier"
        :message="confirmMessage"
        @confirm="onConfirmDelete"
        @cancel="onCancelDelete"
      />

      <div id="" :class="{ 'overlay-hidden': !overlayVisible }" @click="overlayClicked"></div>
    </div>
  </div>
</template>

<script>
import Sidebar from "./../components/layout/Sidebar.vue";
import Navbar from "./../components/layout/Navbar.vue";
import SupplierList from "./../components/suppliers/SupplierList.vue";
import SupplierForm from "./../components/suppliers/SupplierForm.vue";
import SupplierView from "./../components/suppliers/SupplierView.vue";
import FilterModal from "./../components/suppliers/FilterModal.vue";
import ConfirmModal from "./../components/layout/ConfirmModal.vue";
import * as api from "./../api/suppliers.api.js";

export default {
  name: "SuppliersView",
  components: { Sidebar, Navbar, SupplierList, SupplierForm, SupplierView, FilterModal, ConfirmModal },
  data() {
    return {
      suppliers: [],
      filtered: [],
      search: "",
      currentPage: 1,
      perPage: 7,
      showForm: false,
      editingSupplier: null,
      overlayVisible: false,
      viewingSupplier: null,
      showFilterModal: false,
      currentFilter: { field: "", value: "" },
      filterFields: [
        { label: "Nombre", value: "name" },
        { label: "Contacto", value: "contact" },
        { label: "Teléfono", value: "phone" },
        { label: "Email", value: "email" }
      ],
      // delete confirmation
      confirmModalVisible: false,
      supplierToDelete: null,
      confirmMessage: "",
      // CORRECCIÓN: definir sidebarOpen aquí (evita warn de Vue)
      sidebarOpen: true
    };
  },
  computed: {
    totalPages() {
      const total = this.filtered.length;
      return Math.max(1, Math.ceil(total / this.perPage));
    },
    pagedSuppliers() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filtered.slice(start, start + this.perPage);
    }
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    handleSearch(term) {
      this.search = term;
      this.currentPage = 1;
      this.applyFilters();
    },
    onNavigate(key) {
      const map = { home: "/", products: "/products", suppliers: "/suppliers", admins: "/admins", orders: "/orders" };
      const path = map[key] || "/";
      if (this.$router) this.$router.push(path).catch(()=>{});
    },
    overlayClicked() {
      this.showForm = false;
      this.showFilterModal = false;
      this.viewingSupplier = null;
      this.overlayVisible = false;
      this.confirmModalVisible = false;
      this.supplierToDelete = null;
    },
    async load() {
      try {
        const data = await api.getSuppliers();
        this.suppliers = Array.isArray(data) ? data : [];
      } catch (err) {
        // manejo más robusto: si la respuesta fue HTML o no JSON lo mostramos en consola
        console.error("Load suppliers error", err);
        this.suppliers = [];
      }
      this.applyFilters();
    },
    applyFilters() {
      const s = this.search.trim().toLowerCase();
      if (!s) this.filtered = [...this.suppliers];
      else {
        this.filtered = this.suppliers.filter((p) => {
          return ["name", "contact", "phone", "email"].some((k) =>
            (p[k] || "").toString().toLowerCase().includes(s)
          );
        });
      }
      if (this.currentFilter && this.currentFilter.field && this.currentFilter.value !== "") {
        const { field, value } = this.currentFilter;
        this.filtered = this.filtered.filter((item) =>
          (item[field] || "").toString().toLowerCase().includes(value.toLowerCase())
        );
      }
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    },
    openAdd() {
      this.editingSupplier = null;
      this.showForm = true;
      this.overlayVisible = true;
    },
    openEdit(supplier) {
      this.editingSupplier = supplier;
      this.showForm = true;
      this.overlayVisible = true;
    },
    closeForm() {
      this.showForm = false;
      this.overlayVisible = false;
    },
    // ---------- CAMBIO IMPORTANTE ----------
    // Al guardar (crear/editar) recargamos la lista y, si hay una vista abierta,
    // reasignamos viewingSupplier al objeto recién cargado para que refleje los cambios.
    async onSaved() {
      await this.load();

      // Si el usuario estaba viendo un supplier, actualizamos la vista con la versión recargada
      if (this.viewingSupplier && this.viewingSupplier.id) {
        const updated = this.suppliers.find(s => s.id === this.viewingSupplier.id);
        this.viewingSupplier = updated || null;
      }

      this.closeForm();
    },
    // ---------------------------------------

    viewSupplier(supplier) {
      this.viewingSupplier = supplier;
      this.overlayVisible = true;
    },
    onViewClose() {
      this.viewingSupplier = null;
      this.overlayVisible = false;
    },
    requestDelete(supplier) {
      this.supplierToDelete = supplier;
      this.confirmMessage = `Delete "<strong>${supplier.name}</strong>"?`;
      this.confirmModalVisible = true;
      this.overlayVisible = true;
    },
    async onConfirmDelete() {
      if (!this.supplierToDelete || !this.supplierToDelete.id) {
        this.confirmModalVisible = false;
        this.overlayVisible = false;
        this.supplierToDelete = null;
        return;
      }
      try {
        await api.deleteSupplier(this.supplierToDelete.id);
        await this.load();
      } catch (err) {
        console.error("Delete failed", err);
        alert("Failed to delete supplier. See console for details.");
      } finally {
        this.confirmModalVisible = false;
        this.overlayVisible = false;
        this.supplierToDelete = null;
      }
    },
    onCancelDelete() {
      this.confirmModalVisible = false;
      this.overlayVisible = false;
      this.supplierToDelete = null;
    },
    prevPage() { if (this.currentPage > 1) this.currentPage--; },
    nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; },
    openFilterModal() {
      this.showFilterModal = true;
      this.overlayVisible = true;
    },
    applyFilter(payload) {
      this.currentFilter = { field: payload.field, value: payload.value };
      this.showFilterModal = false;
      this.overlayVisible = false;
      this.currentPage = 1;
      this.applyFilters();
    },
    clearFilter() {
      this.currentFilter = { field: "", value: "" };
      this.showFilterModal = false;
      this.overlayVisible = false;
      this.currentPage = 1;
      this.applyFilters();
    },
    downloadAll() {
      const rows = [
        ["Name","Contact","Phone","Email","Address","Notes","PhotoURL"],
        ...this.suppliers.map(s => [s.name, s.contact||'', s.phone||'', s.email||'', s.address||'', s.notes||'', s.photo_url||''])
      ];
      const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "suppliers.csv"; a.click(); URL.revokeObjectURL(url);
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
/* mantiene tus estilos existentes */
#dashboard-wrapper { display: flex; width: 100%; min-height: 100vh; position: relative; }
.main-area { width: 100%; min-height: 100vh; background-color: #f4f5f7; transition: margin-left 0.3s ease-in-out; display: flex; flex-direction: column; }
.main-area:not(.sidebar-collapsed) { margin-left: 260px; }
.sidebar-collapsed .main-area { margin-left: 80px; }
.topbar { height: 64px; background-color: #ffffff; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; border-bottom: 1px solid #e0e0e0; position: sticky; top: 0; z-index: 99; }
.content { padding: 20px; flex-grow: 1; }
.card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.btn-blue { background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.btn-white { background: white; border: 1px solid #ddd; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 8px; }
.overlay-hidden { display: none; }
.btn-blue:hover {
  background: #529edb;
}
.btn-white:hover {
  background: #f5f5f5;
}
</style>