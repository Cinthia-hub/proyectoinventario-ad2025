<template>
    <div id="dashboard-wrapper">
        <Sidebar :collapsed="!sidebarOpen" @navigate="onNavigate" />
        <div class="main-area" :class="{ 'sidebar-collapsed': !sidebarOpen }">
            <!-- Usamos el nuevo Navbar -->
            <Navbar
              :sidebar-open="sidebarOpen"
              :placeholder="'Buscar producto, proveedor, orden...'"
              @toggle-sidebar="toggleSidebar"
              @search="handleSearch"
              @navigate="onNavigate"
            />

            <div class="content">
                <!-- Aquí va el contenido -->
            </div>

            <product-form v-if="showForm" :product="editingProduct" @close="closeForm" @saved="onSaved" />
            <product-view v-if="viewingProduct" :product="viewingProduct" @close="onViewClose" @edit="openEdit" @delete="requestDelete" />

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
                title="Delete product"
                :message="confirmMessage"
                @confirm="onConfirmDelete"
                @cancel="onCancelDelete"
            />

            <div id="overlay" :class="{ 'overlay-hidden': !overlayVisible }" @click="overlayClicked"></div>
        </div>
    </div>
</template>

<script>
import Sidebar from "../components/layout/Sidebar.vue";
import Navbar from "../components/layout/Navbar.vue";
import SupplierList from "../components/suppliers/SupplierList.vue";
import SupplierForm from "../components/suppliers/SupplierForm.vue";
import ConfirmModal from "../components/layout/ConfirmModal.vue";
import SupplierView from "../components/suppliers/SupplierView.vue";
import { useSuppliersStore } from "../store/suppliers.store";

export default {
  name: "SuppliersView",
  components: { Sidebar, Navbar, SupplierList, SupplierForm, ConfirmModal, SupplierView },
  data() {
    return {
      search: "",
      currentPage: 1,
      perPage: 8,
      sidebarOpen: true,
      showForm: false,
      editingSupplier: null,
      overlayVisible: false,
      viewingSupplier: null,
      confirmModalVisible: false,
      supplierToDelete: null,
      confirmMessage: "",
      store: null // inicializamos aquí para evitar 'store undefined' en render
    };
  },
  computed: {
    suppliers() {
      // guard defensivo: si store aún no está inicializada devolvemos array vacío
      return (this.store && Array.isArray(this.store.suppliers)) ? this.store.suppliers : [];
    },
    loading() {
      return this.store ? this.store.loading : false;
    },
    filtered() {
      const q = (this.search || "").trim().toLowerCase();
      if (!q) return this.suppliers;
      return this.suppliers.filter((s) =>
        ["name", "email", "phone", "address"].some((k) => (s[k] || "").toString().toLowerCase().includes(q))
      );
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filtered.length / this.perPage));
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
    },
    onNavigate(key) {
      // Ajusta el mapeo según tus rutas reales. Aquí incluyo /inventory por compatibilidad.
      const map = { home: "/", products: "/inventory", inventory: "/inventory", suppliers: "/suppliers", admins: "/admins", orders: "/orders" };
      const path = map[key] || "/";
      if (this.$router) this.$router.push(path).catch(() => {});
    },

    overlayClicked() {
      this.showForm = false;
      this.viewingSupplier = null;
      this.overlayVisible = false;
      this.confirmModalVisible = false;
      this.supplierToDelete = null;
    },

    async load() {
      if (!this.store) return;
      await this.store.fetchSuppliers();
    },

    openAdd() {
      this.editingSupplier = null;
      this.showForm = true;
      this.overlayVisible = true;
    },

    openEdit(supplier) {
      this.editingSupplier = { ...supplier };
      this.showForm = true;
      this.overlayVisible = true;
    },

    closeForm() {
      this.showForm = false;
      this.overlayVisible = false;
      this.editingSupplier = null;
    },

    async onSaved(payload) {
      try {
        if (!this.store) return;
        if (payload.id) {
          await this.store.updateSupplier(payload.id, payload);
        } else {
          await this.store.createSupplier(payload);
        }
        await this.load();
        this.closeForm();
      } catch (err) {
        console.error("Guardar supplier:", err);
        alert("Error al guardar proveedor");
      }
    },

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
      this.confirmMessage = `Delete "${supplier.name}"?`;
      this.confirmModalVisible = true;
      this.overlayVisible = true;
    },

    async onConfirmDelete() {
      if (!this.supplierToDelete || !this.store) return;
      try {
        await this.store.deleteSupplier(this.supplierToDelete.id);
        await this.load();
      } catch (err) {
        console.error("Error al eliminar supplier", err);
        alert("No fue posible eliminar el proveedor");
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

    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },

    async downloadAll() {
      const rows = [["Name", "Email", "Phone", "Address"], ...this.suppliers.map(s => [s.name, s.email, s.phone, s.address])];
      const csv = rows.map(r => r.map(c => `"${(c||'').toString().replace(/"/g,'""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "suppliers.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
  },
  created() {
    // Inicializamos la store aquí para que esté disponible antes del primer render
    this.store = useSuppliersStore();
    // arrancamos la carga
    this.load();
  },
  mounted() {
    if (window.innerWidth < 900) this.sidebarOpen = false;
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 900) this.sidebarOpen = true;
    });
  }
};
</script>


<style scoped>
/* mantén tus estilos existentes (los que ya tenías) */
#dashboard-wrapper {
    display: flex;
    width: 100%;
    min-height: 100vh;
    position: relative;
}

/* 2. ÁREA PRINCIPAL (Donde va el contenido) */
.main-area {
    width: 100%;
    min-height: 100vh;
    background-color: #f4f5f7;
    transition: margin-left 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
}

/* 3. LÓGICA DEL SIDEBAR (El truco para que no se encime) */
/* Cuando la sidebar está ABIERTA (estado normal), empujamos el contenido 260px */
.main-area:not(.sidebar-collapsed) {
    margin-left: 260px; 
}

/* Cuando la sidebar está CERRADA (chiquita), empujamos solo 80px */
.sidebar-collapsed .main-area {
    margin-left: 80px;
}

/* 4. TOPBAR */
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
    z-index: 99; /* Para que pase por encima del contenido al scrollear */
}

.topbar-left, .topbar-right {
    display: flex;
    align-items: center;
    gap: 15px;
}

/* 5. ESTILOS DE CONTENIDO Y TARJETAS */
.content {
    padding: 20px;
    flex-grow: 1; /* Ocupa el espacio restante */
}

.card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

/* Utilidades de texto y botones */
.menu-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; }
.search-wrapper { position: relative; display: flex; align-items: center; }
.search-input { padding: 8px 35px 8px 10px; border: 1px solid #ddd; border-radius: 4px; width: 250px; }
.search-icon { position: absolute; right: 10px; color: #888; }
.icon-btn { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #555; }

/* Colores para estadísticas */
.txt-blue { color: #2196f3; }
.txt-orange { color: #ff9800; }
.txt-purple { color: #9c27b0; }
.txt-lightred { color: #f44336; }
.stat-value { font-size: 1.5rem; font-weight: bold; margin: 5px 0; }
.stat-sub { font-size: 0.8rem; color: #888; }
.btn-blue { background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.btn-white { background: white; border: 1px solid #ddd; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 8px; }

/* Capa oscura para modales */
#overlay {
    position: fixed; top:0; left:0; width:100%; height:100%;
    background: rgba(0,0,0,0.5); z-index: 1000;
}
.overlay-hidden { display: none; }
</style>