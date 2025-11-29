<template>
    <div id="dashboard-wrapper">
        <Sidebar :collapsed="!sidebarOpen" @navigate="onNavigate" />
        <div class="main-area" :class="{ 'sidebar-collapsed': !sidebarOpen }">
            <Navbar
              :sidebar-open="sidebarOpen"
              :placeholder="'Buscar producto, proveedor, orden...'"
              @toggle-sidebar="toggleSidebar"
              @search="handleSearch"
              @navigate="onNavigate"
            />

            <div class="content">
                <section class="card stats-card">
                    <h3 class="card-title">Overall Inventory</h3>
                    <div class="stats-grid">
                        <div class="stat">
                            <h6 class="stat-title txt-blue">Categories</h6>
                            <div class="stat-value">{{ stats.categories }}</div>
                            <div class="stat-sub">Last 7 days</div>
                        </div>
                        <div class="stat">
                            <h6 class="stat-title txt-orange">Total Products</h6>
                            <div class="stat-value">{{ stats.totalUnits }}</div>
                            <div class="stat-sub">Revenue ₹{{ stats.revenue }}</div>
                        </div>
                        <div class="stat">
                            <h6 class="stat-title txt-purple">Top Selling</h6>
                            <div class="stat-value">{{ stats.topSelling }}</div>
                            <div class="stat-sub">Cost ₹{{ stats.cost }}</div>
                        </div>
                        <div class="stat">
                            <h6 class="stat-title txt-lightred">Low Stocks</h6>
                            <div class="stat-value">{{ stats.ordered }}</div>
                            <div class="stat-sub">Not in stock {{ stats.not_in_stock }}</div>
                        </div>
                    </div>
                </section>

                <section class="card chart-card">
                    <div class="chart-header">
                        <h3>Product Sales Analytics</h3>
                        <div class="select-wrapper">
                            <label for="chart-product">Ver ventas de: </label>
                            <select id="chart-product" v-model="selectedProductId" @change="updateChart">
                                <option :value="null" disabled>Selecciona un producto</option>
                                <option v-for="prod in products" :key="prod.id" :value="prod.id">
                                    {{ prod.nombre }}
                                </option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="chart-container" v-if="selectedProductId">
                        <Bar :data="chartData" :options="chartOptions" />
                    </div>
                    <div v-else class="no-chart">
                        <p>Selecciona un producto arriba para ver su gráfica de ventas.</p>
                    </div>
                </section>
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

// Importaciones para la Gráfica (Chart.js)
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

// Registrar componentes de Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
    name: "DashboardView",
    components: { Sidebar, Navbar, ProductList, ProductForm, ProductView, FilterModal, ConfirmModal, Bar },
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
        confirmMessage: "",
        
        // --- DATOS NUEVOS PARA LA GRÁFICA ---
        selectedProductId: null,
        chartData: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [ { data: [] } ]
        },
        chartOptions: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Ventas de la semana' }
            }
        }
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
        handleSearch(term) {
          this.search = term;
          this.currentPage = 1;
          this.applyFilters();
        },
        onNavigate(key) {
          const map = {
            home: "/",
            products: "/inventory",
            inventory: "/inventory",
            suppliers: "/suppliers",
            admins: "/admin",
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

        requestDelete(product) {
        this.productToDelete = product;
        this.confirmMessage = `Delete "<strong>${product.nombre}</strong>"?`;
        this.confirmModalVisible = true;
        this.overlayVisible = true;
        },

        async onConfirmDelete() {
        if (!this.productToDelete || !this.productToDelete.id) {
            this.confirmModalVisible = false;
            this.overlayVisible = false;
            this.productToDelete = null;
            return;
        }
        try {
            await api.deleteProduct(this.productToDelete.id);
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
            revenue += (p.quantity || 0) * (p.price || 0); // Asumiendo Precio de Venta
            // Para 'Cost' usualmente se necesita 'Buying Price', usaremos price * 0.7 como ejemplo si no existe buying_price
            let buyingPrice = p.buying_price || (p.price * 0.7); 
            cost += (p.quantity || 0) * buyingPrice;
        });
        
        this.stats = { 
            categories: set.size, 
            totalUnits, 
            revenue: Math.round(revenue), 
            topSelling: top_number, 
            cost: Math.round(cost), 
            ordered: lowStockOrdered, 
            not_in_stock: notInStock 
        };
        },
        
        // --- LOGICA PARA ACTUALIZAR GRÁFICA ---
        updateChart() {
            if (!this.selectedProductId) return;
            
            const product = this.products.find(p => p.id === this.selectedProductId);
            if(product) {
                // Generamos datos simulados basados en el ID para que varíe un poco, 
                // ya que normalmente necesitarías una tabla de "Ventas Históricas".
                // Aquí solo simulamos para mostrar la funcionalidad visual.
                const base = product.quantity > 0 ? Math.floor(product.quantity / 5) : 5;
                const dataSimulada = Array.from({length: 7}, () => Math.floor(Math.random() * base) + 1);

                this.chartData = {
                    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                    datasets: [
                        {
                            label: `Ventas de ${product.nombre}`,
                            backgroundColor: '#2196f3',
                            data: dataSimulada
                        }
                    ]
                };
            }
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
/* ESTILOS PREVIOS (MANTENIDOS) */
#dashboard-wrapper {
    display: flex;
    width: 100%;
    min-height: 100vh;
    position: relative;
}
.main-area {
    width: 100%;
    min-height: 100vh;
    background-color: #f4f5f7;
    transition: margin-left 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
}
.main-area:not(.sidebar-collapsed) { margin-left: 260px; }
.sidebar-collapsed .main-area { margin-left: 80px; }
.topbar {
    height: 64px; background-color: #ffffff; display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px; border-bottom: 1px solid #e0e0e0; position: sticky; top: 0; z-index: 99;
}
.topbar-left, .topbar-right { display: flex; align-items: center; gap: 15px; }
.content { padding: 20px; flex-grow: 1; }

.card {
    background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }

/* UTILIDADES TEXTO/BOTONES */
.menu-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; }
.search-wrapper { position: relative; display: flex; align-items: center; }
.search-input { padding: 8px 35px 8px 10px; border: 1px solid #ddd; border-radius: 4px; width: 250px; }
.search-icon { position: absolute; right: 10px; color: #888; }
.icon-btn { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #555; }

.txt-blue { color: #2196f3; }
.txt-orange { color: #ff9800; }
.txt-purple { color: #9c27b0; }
.txt-lightred { color: #f44336; }
.stat-value { font-size: 1.5rem; font-weight: bold; margin: 5px 0; }
.stat-sub { font-size: 0.8rem; color: #888; }
.btn-blue { background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.btn-white { background: white; border: 1px solid #ddd; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 8px; }

#overlay {
    position: fixed; top:0; left:0; width:100%; height:100%;
    background: rgba(0,0,0,0.5); z-index: 1000;
}
.overlay-hidden { display: none; }

/* NUEVOS ESTILOS PARA EL DASHBOARD Y GRÁFICA */
.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.select-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
}
.select-wrapper select {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    outline: none;
}
.chart-container {
    position: relative;
    height: 300px; /* Altura fija para que la gráfica no crezca infinitamente */
    width: 100%;
}
.no-chart {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
    background-color: #f9f9f9;
    border-radius: 8px;
    border: 2px dashed #ddd;
}
</style>