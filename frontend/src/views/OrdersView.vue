<template>
  <div id="dashboard-wrapper">
    <Sidebar :collapsed="!sidebarOpen" @navigate="onNavigate" />
    <div class="main-area" :class="{ 'sidebar-collapsed': !sidebarOpen }">
      <!-- Navbar -->
      <Navbar
        :sidebar-open="sidebarOpen"
        :placeholder="'Search folio, admin, supplier, store, product...'"
        @toggle-sidebar="toggleSidebar"
        @search="handleSearch"
        @navigate="onNavigate"
      />

      <div class="content">
        <section class="card table-card">
          <div class="table-header">
            <h3 v-if="!viewingOrder">Orders</h3>
            <div v-if="!viewingOrder" class="table-actions">
              <button class="btn-blue" @click="openAdd"><i class="fa-solid fa-plus"></i> New Order</button>
              <button class="btn-white" @click="openFilterModal"><i class="fa-solid fa-filter"></i> Filters</button>
              <button class="btn-white" @click="downloadAll"><i class="fa-solid fa-download"></i> Download all</button>
            </div>
          </div>

          <!-- List / Table -->
          <order-list
            v-if="!viewingOrder"
            :orders="pagedOrders"
            :page="currentPage"
            :total-pages="totalPages"
            @next="nextPage"
            @prev="prevPage"
            @select="viewOrder"
            @edit="openEdit"
            @delete="requestDelete"
          />

          <!-- Detailed view -->
          <order-view
            v-if="viewingOrder"
            :order="viewingOrder"
            @close="onViewClose"
            @edit="onEditFromView"
            @delete="onDeleteFromView"
          />
        </section>
      </div>

      <!-- Modal / Form -->
      <order-form
        v-if="showForm"
        :order="editingOrder"
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
        title="Delete order"
        :message="confirmMessage"
        @confirm="onConfirmDelete"
        @cancel="onCancelDelete"
      />

      <div id="" :class="{ 'overlay-hidden': !overlayVisible }" @click="overlayClicked"></div>
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/layout/Sidebar.vue";
import Navbar from "../components/layout/Navbar.vue";
import OrderList from "../components/orders/OrderList.vue";
import OrderForm from "../components/orders/OrderForm.vue";
import OrderView from "../components/orders/OrderView.vue";
import FilterModal from "../components/orders/FilterModal.vue";
import ConfirmModal from "../components/layout/ConfirmModal.vue";
import * as api from "../api/orders.api.js";

export default {
  name: "OrdersView",
  components: { Sidebar, Navbar, OrderList, OrderForm, OrderView, FilterModal, ConfirmModal },
  data() {
    return {
      orders: [],
      filtered: [],
      search: "",
      currentPage: 1,
      perPage: 7,
      showForm: false,
      editingOrder: null,
      overlayVisible: false,
      viewingOrder: null,
      showFilterModal: false,
      currentFilter: { field: "", value: "" },
      filterFields: [
        { label: "Folio", value: "id" },
        { label: "Admin", value: "admin_name" },
        { label: "Supplier", value: "supplier_name" },
        { label: "Store", value: "store_name" },
        { label: "Product", value: "product_name" }
      ],
      // delete confirmation
      confirmModalVisible: false,
      orderToDelete: null,
      confirmMessage: "",
      sidebarOpen: true
    };
  },
  computed: {
    totalPages() {
      const total = this.filtered.length;
      return Math.max(1, Math.ceil(total / this.perPage));
    },
    pagedOrders() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filtered.slice(start, start + this.perPage);
    }
  },
  methods: {
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; },
    handleSearch(term) { this.search = term; this.currentPage = 1; this.applyFilters(); },
    onNavigate(key) {
      const map = { home: "/", products: "/products", suppliers: "/suppliers", admins: "/users", orders: "/orders" };
      const path = map[key] || "/";
      if (this.$router) this.$router.push(path).catch(()=>{});
    },
    overlayClicked() {
      this.showForm = false;
      this.showFilterModal = false;
      this.viewingOrder = null;
      this.overlayVisible = false;
      this.confirmModalVisible = false;
      this.orderToDelete = null;
    },
    async load() {
      try {
        const data = await api.getOrders();
        this.orders = Array.isArray(data) ? data.map(o => ({ ...o, id: o.id || o.folio || "" })) : [];
      } catch (err) {
        console.error("Error loading orders:", err);
        this.orders = [];
      }
      this.applyFilters();
    },
    applyFilters() {
      const s = this.search.trim().toLowerCase();
      if (!s) this.filtered = [...this.orders];
      else {
        this.filtered = this.orders.filter((p) => {
          return ["id","admin_name","supplier_name","store_name","product_name","order_date","delivery_date"].some((k) =>
            (String(p[k] || "")).toLowerCase().includes(s)
          );
        });
      }
      if (this.currentFilter && this.currentFilter.field && this.currentFilter.value !== "") {
        const { field, value } = this.currentFilter;
        this.filtered = this.filtered.filter((item) => {
          const tv = field === "id" ? item.id : item[field];
          if (typeof tv === "string") return tv.toLowerCase().includes(value.toLowerCase());
          return tv == value;
        });
      }
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    },
    openAdd() {
      this.editingOrder = null;
      this.showForm = true;
      this.overlayVisible = true;
    },
    openEdit(order) {
      this.editingOrder = order;
      this.showForm = true;
      this.overlayVisible = true;
    },
    closeForm() {
      this.showForm = false;
      this.overlayVisible = false;
    },
    async onSaved() {
      await this.load();
      // If viewing that order, update the view with the new data
      if (this.viewingOrder && this.viewingOrder.id) {
        const updated = this.orders.find(o => o.id === this.viewingOrder.id);
        this.viewingOrder = updated || null;
      }
      this.closeForm();
    },
    viewOrder(order) {
      // show OrderView for clicked folio
      const found = this.orders.find(o => o.id === order.id) || order;
      this.viewingOrder = found;
      this.overlayVisible = true;
    },
    onViewClose() {
      this.viewingOrder = null;
      this.overlayVisible = false;
    },
    onEditFromView(order) {
      this.editingOrder = order;
      this.showForm = true;
      this.overlayVisible = true;
    },
    onDeleteFromView(order) {
      this.orderToDelete = order;
      this.confirmMessage = `Delete "<strong>${order.id}</strong>"?`;
      this.confirmModalVisible = true;
      this.overlayVisible = true;
    },
    requestDelete(order) {
      this.orderToDelete = order;
      this.confirmMessage = `Delete "<strong>${order.id}</strong>"?`;
      this.confirmModalVisible = true;
      this.overlayVisible = true;
    },
    async onConfirmDelete() {
      if (!this.orderToDelete || !this.orderToDelete.id) {
        this.confirmModalVisible = false;
        this.overlayVisible = false;
        this.orderToDelete = null;
        return;
      }
      try {
        await api.deleteOrder(this.orderToDelete.id);
        await this.load();
        if (this.viewingOrder && this.viewingOrder.id === this.orderToDelete.id) {
          this.viewingOrder = null;
        }
      } catch (err) {
        console.error("Delete failed", err);
        alert("Failed to delete order. See console.");
      } finally {
        this.confirmModalVisible = false;
        this.overlayVisible = false;
        this.orderToDelete = null;
      }
    },
    onCancelDelete() {
      this.confirmModalVisible = false;
      this.overlayVisible = false;
      this.orderToDelete = null;
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
        ["Folio","Admin","Supplier","Store","Product","Unit","Quantity","Order date","Delivery date","Notes"],
        ...this.orders.map(o => [o.id||'', o.admin_name||'', o.supplier_name||'', o.store_name||'', o.product_name||'', o.product_unit||'', o.quantity||'', o.order_date||'', o.delivery_date||'', o.notes||''])
      ];
      const csv = rows.map(r => r.map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "orders.csv";
      a.click();
      URL.revokeObjectURL(url);
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
/* Keep same styles as SuppliersView for consistency */
#dashboard-wrapper { display: flex; width: 100%; min-height: 100vh; }
.main-area { width: 100%; min-height: 100vh; background-color: #f4f5f7; transition: margin-left 0.3s ease-in-out; display: flex; flex-direction: column; }
.main-area:not(.sidebar-collapsed) { margin-left: 260px; }
.sidebar-collapsed .main-area { margin-left: 80px; }
.content { padding: 20px; flex-grow: 1; }
.card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.table-actions { display:flex; gap:10px; }
.btn-blue { background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
.btn-white { background: white; border: 1px solid #ddd; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 8px; }
.btn-blue:hover { background: #1976d2; }
.btn-white:hover { background: #f5f5f5; }
.overlay-hidden { display: none; }

/* Modal used for OrderView when viewingOrder is set */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1100; display: flex; align-items: center; justify-content: center; }
.modal-card.large { width: 920px; max-width: calc(100% - 40px); border-radius: 8px; background: white; }

/* pagination */
.pagination { display:flex; align-items:center; gap:12px; justify-content:center; margin-top:12px; }
.pagination-btn { padding:8px 12px; border-radius:8px; border:1px solid #e6e6e6; background:white; cursor:pointer; }
.page-info { color:#6d6c6c; font-weight:500; }
</style>