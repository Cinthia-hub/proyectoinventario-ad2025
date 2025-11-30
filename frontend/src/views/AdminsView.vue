<template>
  <div id="dashboard-wrapper">
    <Sidebar :collapsed="!sidebarOpen" @navigate="onNavigate" />
    <div class="main-area" :class="{ 'sidebar-collapsed': !sidebarOpen }">
      <Navbar
        :sidebar-open="sidebarOpen"
        :placeholder="'Buscar administrador...'"
        @toggle-sidebar="toggleSidebar"
        @search="handleSearch"
        @navigate="onNavigate"
      />

      <div class="content">
        <section class="card table-card">
          <div class="table-header">
            <h3 v-if="!viewingUser">Administradores</h3>
            <div v-if="!viewingUser" class="table-actions">
              <!-- Solo mostrar acciones si es admin -->
              <button v-if="isAdmin" class="btn-blue" @click="openAdd">Nuevo admin</button>
              <button v-if="isAdmin" class="btn-white" @click="openFilterModal"><i class="fas fa-filter"></i> Filters</button>
              <button v-if="isAdmin" class="btn-white" @click="downloadAll">Download all</button>
            </div>
          </div>

          <admin-list
            v-if="!viewingUser"
            :users="pagedUsers"
            :page="currentPage"
            :total-pages="totalPages"
            @next="nextPage"
            @prev="prevPage"
            @select="viewUser"
            @edit="openEdit"
            @delete="requestDelete"
          />

          <admin-view
            v-if="viewingUser"
            :user="viewingUser"
            @close="onViewClose"
            @edit="openEdit"
            @delete="requestDelete"
          />
        </section>
      </div>

      <admin-form
        v-if="showForm"
        :user="editingUser"
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

      <confirm-modal
        :visible="confirmModalVisible"
        title="Eliminar administrador"
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
import AdminView from "../components/admins/AdminView.vue";
import AdminList from "../components/admins/AdminList.vue";
import AdminForm from "../components/admins/AdminForm.vue";
import FilterModal from "../components/admins/FilterModal.vue";
import ConfirmModal from "../components/layout/ConfirmModal.vue";
import * as api from "../api/admins.api.js";
import { useAuthStore } from '../store/auth.store';

export default {
  name: "AdminsView",
  components: { Sidebar, Navbar, AdminView, AdminList, AdminForm, FilterModal, ConfirmModal },
  data() {
    return {
      users: [],
      filtered: [],
      search: "",
      currentPage: 1,
      perPage: 6,
      showForm: false,
      editingUser: null,
      overlayVisible: false,
      viewingUser: null,
      showFilterModal: false,
      currentFilter: { field: "", value: "" },
      filterFields: [
        { label: "Nombre", value: "nombre" },
        { label: "Username", value: "username" },
        { label: "Teléfono", value: "telefono" },
        { label: "Email", value: "email" }
      ],
      confirmModalVisible: false,
      userToDelete: null,
      confirmMessage: "",
      sidebarOpen: true,
      authStore: useAuthStore() // <-- store
    };
  },
  computed: {
    totalPages() {
      const total = this.filtered.length;
      return Math.max(1, Math.ceil(total / this.perPage));
    },
    pagedUsers() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filtered.slice(start, start + this.perPage);
    },
    // Helper para saber si el usuario es admin (soporta 'role' o 'rol')
    isAdmin() {
      const u = this.authStore.user;
      return u && (u.role === 'admin' || u.rol === 'admin');
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
      const map = { home: "/", products: "/products", suppliers: "/suppliers", admins: "/users", orders: "/orders" };
      const path = map[key] || "/";
      if (this.$router) this.$router.push(path).catch(()=>{});
    },
    overlayClicked() {
      this.showForm = false;
      this.showFilterModal = false;
      this.viewingUser = null;
      this.overlayVisible = false;
      this.confirmModalVisible = false;
      this.userToDelete = null;
    },
    async load() {
      try {
        const data = await api.getUsers();
        this.users = Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("Load users error", err);
        this.users = [];
      }
      this.applyFilters();
    },
    applyFilters() {
      const s = this.search.trim().toLowerCase();
      if (!s) this.filtered = [...this.users];
      else {
        this.filtered = this.users.filter((p) => {
          return ["nombre", "username", "telefono", "email"].some((k) =>
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
      this.editingUser = null;
      this.showForm = true;
      this.overlayVisible = true;
    },
    openEdit(user) {
      this.editingUser = user;
      this.showForm = true;
      this.overlayVisible = true;
    },
    closeForm() {
      this.showForm = false;
      this.overlayVisible = false;
    },
    async onSaved() {
      await this.load();
      if (this.viewingUser && this.viewingUser.id) {
        const updated = this.users.find(u => u.id === this.viewingUser.id);
        this.viewingUser = updated || null;
      }
      this.closeForm();
    },
    viewUser(user) {
      this.viewingUser = user;
      this.overlayVisible = true;
    },
    onViewClose() {
      this.viewingUser = null;
      this.overlayVisible = false;
    },
    requestDelete(user) {
      this.userToDelete = user;
      this.confirmMessage = `Eliminar "<strong>${user.nombre}</strong>"?`;
      this.confirmModalVisible = true;
      this.overlayVisible = true;
    },
    async onConfirmDelete() {
      if (!this.userToDelete || !this.userToDelete.id) {
        this.confirmModalVisible = false;
        this.overlayVisible = false;
        this.userToDelete = null;
        return;
      }
      try {
        await api.deleteUser(this.userToDelete.id);
        await this.load();
      } catch (err) {
        console.error("Delete failed", err);
        alert(err?.message || err?.bodyText || 'Failed to delete admin. See console for details.');
      } finally {
        this.confirmModalVisible = false;
        this.overlayVisible = false;
        this.userToDelete = null;
      }
    },
    onCancelDelete() {
      this.confirmModalVisible = false;
      this.overlayVisible = false;
      this.userToDelete = null;
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
        ["Nombre","Username","Rol","Teléfono","Email","Dirección","PhotoURL"],
        ...this.users.map(u => [u.nombre, u.username||'', u.rol||u.role||'', u.telefono||'', u.email||'', u.direccion||'', u.photo_url||''])
      ];
      const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "admins.csv"; a.click(); URL.revokeObjectURL(url);
    }
  },
  mounted() {
    // Redirigir si no es admin (evita que empleados vean la vista even si navegan manualmente)
    if (!this.isAdmin) {
      this.$router.push('/dashboard').catch(()=>{});
      return;
    }

    this.load();
    if (window.innerWidth < 900) this.sidebarOpen = false;
    window.addEventListener("resize", () => { if (window.innerWidth >= 900) this.sidebarOpen = true; });
  }
};
</script>

<style scoped>
/* estilos sin cambios */
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
.btn-blue:hover { background: #529edb; }
.btn-white:hover { background: #f5f5f5; }
</style>