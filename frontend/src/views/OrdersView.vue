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
import ProductList from "../components/products/ProductList.vue";
import ProductForm from "../components/products/ProductForm.vue";
import ProductView from "../components/products/ProductView.vue";
import FilterModal from "../components/products/FilterModal.vue";
import ConfirmModal from "../components/layout/ConfirmModal.vue";
import * as api from "../api/product.api.js";

export default {
    name: "DashboardView",
    components: { Sidebar, Navbar, ProductList, ProductForm, ProductView, FilterModal, ConfirmModal },
    data() {
        return {
        products: [],
        filtered: [],
        search: "",
        currentPage: 1,
        perPage: 5,
        showForm: false,
        editingProduct: null,
        overlayVisible: false,
        viewingProduct: null,
        showFilterModal: false,
        currentFilter: { field: "", value: "" },
        filterFields: [
            { label: "Products", value: "nombre" },
            { label: "Buying Price", value: "price" },
            { label: "Quantity", value: "quantity" },
            { label: "Threshold Value", value: "threshold_value" },
            { label: "Expiry Date", value: "expiry_date" },
            { label: "Availability", value: "availability" }
        ],
        stats: { categories: 0, totalUnits: 0, revenue: 0, topSelling: 0, cost: 0, ordered: 0, not_in_stock: 0 },
        sidebarOpen: true,
        // delete confirmation
        confirmModalVisible: false,
        productToDelete: null,
        confirmMessage: ""
        };
    },
    computed: {
        totalPages() {
        const total = this.filtered.length;
        return Math.max(1, Math.ceil(total / this.perPage));
        },
        pagedProducts() {
        const start = (this.currentPage - 1) * this.perPage;
        return this.filtered.slice(start, start + this.perPage);
        }
    },
    methods: {
        toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
        },
        // handler que recibe la búsqueda desde el Navbar
        handleSearch(term) {
          this.search = term;
          this.currentPage = 1;
          this.applyFilters();
        },
        // navegación desde el Navbar o Sidebar
        onNavigate(key) {
          const map = {
            home: "/",
            products: "/products",
            suppliers: "/suppliers",
            admins: "/admins",
            orders: "/orders"
          };
          const path = map[key] || "/";

          if (this.$router) {
            this.$router.push(path).catch(() => {});
          } else {
            console.warn("Router no disponible, navegar a:", path);
          }
        },

        overlayClicked() {
        this.showForm = false;
        this.showFilterModal = false;
        this.viewingProduct = null;
        this.overlayVisible = false;
        // also hide confirm modal if outside clicked
        this.confirmModalVisible = false;
        this.productToDelete = null;
        },
        async load() {
        this.products = await api.getProducts();
        this.applyFilters();
        this.computeStats();
        },
        applyFilters() {
        const s = this.search.trim().toLowerCase();
        if (!s) {
            this.filtered = [...this.products];
        } else {
            this.filtered = this.products.filter((p) => {
            return ["nombre", "category", "expiry_date", "availability"].some((k) =>
                (p[k] || "").toString().toLowerCase().includes(s)
            );
            });
        }
        if (this.currentFilter && this.currentFilter.field && this.currentFilter.value !== "") {
            const { field, value } = this.currentFilter;
            this.filtered = this.filtered.filter((product) => {
            const dataValue = product[field];
            if (typeof dataValue === "string") {
                return dataValue.toLowerCase().includes(value.toLowerCase());
            } else {
                return dataValue == value;
            }
            });
        }
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
        },
        onSearch() {
        this.currentPage = 1;
        this.applyFilters();
        },
        openAdd() {
        this.editingProduct = null;
        this.showForm = true;
        this.overlayVisible = true;
        },
        openEdit(product) {
        this.editingProduct = product;
        this.showForm = true;
        this.overlayVisible = true;
        },
        closeForm() {
        this.showForm = false;
        this.overlayVisible = false;
        },
        async onSaved() {
        await this.load();
        this.closeForm();
        },
        viewProduct(product) {
        this.viewingProduct = product;
        this.overlayVisible = true;
        },
        onViewClose() {
        this.viewingProduct = null;
        this.overlayVisible = false;
        },

        // NEW: request to delete -> open confirm modal
        requestDelete(product) {
        this.productToDelete = product;
        this.confirmMessage = `Delete "<strong>${product.nombre}</strong>"?`;
        this.confirmModalVisible = true;
        this.overlayVisible = true;
        },

        // NEW: user confirmed delete
        async onConfirmDelete() {
        if (!this.productToDelete || !this.productToDelete.id) {
            this.confirmModalVisible = false;
            this.overlayVisible = false;
            this.productToDelete = null;
            return;
        }
        try {
            await api.deleteProduct(this.productToDelete.id);
            // reload products
            await this.load();
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete product. See console for details.");
        } finally {
            this.confirmModalVisible = false;
            this.overlayVisible = false;
            this.productToDelete = null;
        }
        },

        // NEW: user cancelled delete
        onCancelDelete() {
        this.confirmModalVisible = false;
        this.overlayVisible = false;
        this.productToDelete = null;
        },

        prevPage() {
        if (this.currentPage > 1) this.currentPage--;
        },
        nextPage() {
        if (this.currentPage < this.totalPages) this.currentPage++;
        },
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
        async downloadAll() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const headers = ["Product Name", "Price", "Quantity", "Threshold Value", "Expiry Date", "Availability"];
        const body = this.products.map((p) => [p.nombre, p.price, p.quantity, p.threshold_value, p.expiry_date, p.availability]);
        doc.autoTable({ head: [headers], body, margin: { top: 20 } });
        doc.save("all_products.pdf");
        },
        computeStats() {
        const set = new Set();
        let totalUnits = 0;
        let revenue = 0;
        let cost = 0;
        const sorted = [...this.products].sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
        const top_number = Math.min(Math.floor(this.products.length / 2), sorted.length ? sorted[0].quantity : 0);
        const notInStock = this.products.filter((p) => (p.quantity || 0) === 0).length;
        const lowStockOrdered = this.products.filter((p) => (p.quantity === 0 || p.quantity <= p.threshold_value) && (p.on_the_way || 0) > 0).length;
        this.products.forEach((p) => {
            if (p.category) set.add(p.category);
            totalUnits += p.quantity || 0;
            revenue += (p.quantity || 0) * (p.price || 0);
        });
        const topSlice = sorted.slice(0, Math.max(0, top_number));
        topSlice.forEach((p) => (cost += (p.quantity || 0) * (p.price || 0)));
        this.stats = { categories: set.size, totalUnits, revenue: Math.round(revenue), topSelling: top_number, cost: Math.round(cost), ordered: lowStockOrdered, not_in_stock: notInStock };
        }
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