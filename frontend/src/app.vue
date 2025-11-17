<template>
  <div id="app">
    <Sidebar :collapsed="!sidebarOpen" @navigate="onNavigate" />

    <div class="main-area" :class="{ 'sidebar-collapsed': !sidebarOpen }">
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-btn" @click="toggleSidebar" aria-label="Toggle menu">
            <i class="fa-solid fa-bars"></i>
          </button>

          <div class="search-wrapper">
            <input
              class="search-input"
              v-model="search"
              @input="onSearch"
              placeholder="Search product, supplier, order"
            />
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
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

      <div class="content">
        <!-- Overall Inventory (kept same as before) -->
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

        <!-- Products -->
        <section class="card table-card">
          <div class="table-header">
            <h3>Products</h3>
            <div class="table-actions">
              <button class="btn-blue" @click="openAdd">Add Product</button>
              <button class="btn-white" @click="openFilterModal"><i class="fa-solid fa-filter"></i> Filters</button>
              <button class="btn-white" @click="downloadAll">Download all</button>
            </div>
          </div>

          <product-list
            :products="pagedProducts"
            :page="currentPage"
            :total-pages="totalPages"
            @next="nextPage"
            @prev="prevPage"
            @select="viewProduct"
            @edit="openEdit"
            @delete="requestDelete"   
          />
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
import Sidebar from "./components/layout/Sidebar.vue";
import ProductList from "./components/products/ProductList.vue";
import ProductForm from "./components/products/ProductForm.vue";
import ProductView from "./components/products/ProductView.vue";
import FilterModal from "./components/products/FilterModal.vue";
import ConfirmModal from "./components/layout/ConfirmModal.vue";
import * as api from "./api/product.api.js";

export default {
  name: "App",
  components: { Sidebar, ProductList, ProductForm, ProductView, FilterModal, ConfirmModal },
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
/* (pequeños estilos de topbar ya están en global; mantener lo que tenías) */
.topbar { height: 64px; display:flex; align-items:center; justify-content:space-between; padding:12px 20px; background:#fafafa; border-bottom:1px solid #eee; position:sticky; top:0; z-index:50; }
/* ... puedes mantener el resto de estilos que ya tenías ... */
</style>