<template>
  <div id="dashboard-wrapper">
    <Sidebar :collapsed="!sidebarOpen" @navigate="onNavigate" />
    
    <div class="main-area" :class="{ 'sidebar-collapsed': !sidebarOpen }">
      <Navbar
        :sidebar-open="sidebarOpen"
        :placeholder="'...'"
        @toggle-sidebar="toggleSidebar"
        @search="handleSearch"
        @navigate="onNavigate"
      />

      <div class="content">
        
        <div class="welcome-header">
          <div>
            <h1>¡Hola, {{ getUserName }}! 👋</h1>
            <p class="subtitle">
              <template v-if="settings">
                Aquí está el resumen de <strong>{{ settings.name || 'Mercadito' }}</strong> — {{ settings.description || '' }}
              </template>
              <template v-else>
                Aquí está el resumen de <strong>Mercadito</strong> para hoy.
              </template>
            </p>
            <p class="muted-contact" v-if="settings">
              <small v-if="settings.email"><i class="fa-solid fa-envelope"></i> {{ settings.email }}</small>
              <small v-if="settings.phone" style="margin-left:10px;"><i class="fa-solid fa-phone"></i> {{ settings.phone }}</small>
              <small v-if="settings.address" style="margin-left:10px;"><i class="fa-solid fa-location-dot"></i> {{ settings.address }}</small>
            </p>
          </div>
          <div class="date-pill">
            <i class="fa-regular fa-calendar"></i> {{ currentDate }}
          </div>
        </div>

        <div class="quick-actions-grid">
          <button class="action-card blue" @click="$router.push('/inventory')">
            <div class="icon-circle"><i class="fa-solid fa-box"></i></div>
            <div class="action-text">
              <span>Agregar Producto</span>
              <small>Inventario</small>
            </div>
          </button>
          <button class="action-card green" @click="$router.push('/stores')">
            <div class="icon-circle"><i class="fa-solid fa-cash-register"></i></div>
            <div class="action-text">
              <span>Nueva Tienda</span>
              <small>Compras</small>
            </div>
          </button>
          <button class="action-card orange" @click="$router.push('/suppliers')">
            <div class="icon-circle"><i class="fa-solid fa-truck-ramp-box"></i></div>
            <div class="action-text">
              <span>Agregar Proveedor</span>
              <small>Suministro</small>
            </div>
          </button>
          <button class="action-card purple" @click="$router.push('/users')">
            <div class="icon-circle"><i class="fa-solid fa-file-invoice-dollar"></i></div>
            <div class="action-text">
              <span>Nuevo Administrador</span>
              <small>Gestión</small>
            </div>
          </button>
        </div>

        <section class="section-container" v-if="firstOrders.length">
          <div class="section-header">
            <h3><i class="fa-solid fa-file-invoice"></i> Últimas órdenes</h3>
            <button class="btn-link" @click="$router.push('/orders')">Ver todas <i class="fa-solid fa-arrow-right"></i></button>
          </div>

          <div class="orders-grid">
            <div v-for="o in firstOrders" :key="o.id || o.folio" class="order-card" @click="openOrder(o)" style="cursor:pointer;">
              <div class="order-thumb">
                <img :src="o.store_image || placeholderAvatar" @error="(e)=>e.target.src = placeholderAvatar" />
              </div>
              <div class="order-details">
                <div class="order-info">
                  <div class="order-middle">
                    <div class="line store-line">{{ o.store_name || o.store?.name || '-' }}</div>
                    <div class="line">{{ o.supplier_name || '-' }}</div>
                  </div>
                  <div class="order-bottom">
                    <span class="badge small">{{ o.delivery_date || '-' }}</span>
                  </div>
                </div>
                <div class="order-admin-avatar">
                  <img :src="o.supplier_image || placeholderAvatar" @error="(e)=>e.target.src = placeholderAvatar" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="dashboard-grid-bottom">
          
          <div class="left-col">
             
             <section class="card stats-panel">
                <h3>Resumen del Mes</h3>
                <div class="stats-list-horizontal">
                    <div class="mini-stat">
                        <div class="stat-icon-small bg-blue"><i class="fa-solid fa-layer-group"></i></div>
                        <div><span>Categorías</span><strong>{{ stats.categories }}</strong></div>
                    </div>
                    <div class="mini-stat">
                        <div class="stat-icon-small bg-orange"><i class="fa-solid fa-box"></i></div>
                        <div><span>Productos</span><strong>{{ stats.totalUnits }}</strong></div>
                    </div>
                    <div class="mini-stat">
                        <div class="stat-icon-small bg-green"><i class="fa-solid fa-dollar-sign"></i></div>
                        <div><span>Valor</span><strong>${{ stats.revenue }}</strong></div>
                    </div>
                    <div class="mini-stat">
                        <div class="stat-icon-small bg-red"><i class="fa-solid fa-triangle-exclamation"></i></div>
                        <div><span>Bajo Stock</span><strong class="text-danger">{{ stats.ordered }}</strong></div>
                    </div>
                </div>
             </section>

             <section class="card chart-panel">
                <div class="card-header-simple">
                    <h3>Popularidad</h3>
                    <select v-model="selectedProductId" @change="updateChart" class="chart-select">
                        <option :value="null" disabled>Seleccionar producto</option>
                        <option v-for="prod in products" :key="prod.id" :value="prod.id">{{ prod.nombre }}</option>
                    </select>
                </div>
                <div class="chart-container" v-if="selectedProductId">
                    <Bar :data="chartData" :options="chartOptions" />
                </div>
                <div v-else class="no-chart-state">
                    <i class="fa-solid fa-chart-area"></i>
                    <p>Elige un producto para analizar</p>
                </div>
             </section>
          </div>

          <aside class="right-col">
            <div class="card store-profile-card">
               <div class="store-header-bg"></div>
               <div class="store-logo-wrapper">
                  <i class="fa-solid fa-shop"></i>
               </div>
               <div class="store-info-center">
                  <h2>Mercadito Central</h2>
                  <span class="status-badge online">● Abierto</span>
                  
                  <div class="store-details-list">
                     <p><i class="fa-solid fa-location-dot"></i> Centro, Irapuato</p>
                     <p><i class="fa-solid fa-phone"></i> 462-123-0000</p>
                     <p><i class="fa-solid fa-envelope"></i> contacto@mercadito.com</p>
                  </div>

                  <div class="social-buttons">
                     <button class="social-btn fb"><a href="https://www.facebook.com/WalmartMexico/?locale=es_LA"><i class="fa-brands fa-facebook-f"></i></a></button>
                     <button class="social-btn ig"><a href="https://www.instagram.com/walmartmexico/"><i class="fa-brands fa-instagram"></i></a></button>
                     <button class="social-btn wa"><a href="https://www.threads.com/@walmartmexico?xmt=AQF0Ck_x9wA4L3bEOXpwRWF95lsnAFg6MGzY-Khye5lP2fk"><i class="fa-brands fa-whatsapp"></i></a></button>
                  </div>
               </div>
            </div>

          </aside>

        </div>

      </div>

      <product-form v-if="showForm" :product="editingProduct" @close="closeForm" @saved="onSaved" />
      <div id="overlay" :class="{ 'overlay-hidden': !overlayVisible }" @click="overlayClicked"></div>
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/layout/Sidebar.vue";
import Navbar from "../components/layout/Navbar.vue";
import ProductForm from "../components/products/ProductForm.vue";
import * as api from "../api/product.api.js";
import * as ordersApi from "../api/orders.api.js";
import * as storesApi from "../api/stores.api.js";
import { useAuthStore } from '../store/auth.store';
import StoreTile from "../components/store/StoreTile.vue";

// Chart.js
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: "DashboardView",
  components: { Sidebar, Navbar, ProductForm, Bar, StoreTile },
  
  setup() {
    const authStore = useAuthStore();
    return { authStore };
  },

  data() {
    return {
      products: [],
      sidebarOpen: true,

      // Modal
      showForm: false,
      editingProduct: null,
      overlayVisible: false,

      // Stats
      stats: { categories: 0, totalUnits: 0, revenue: 0, topSelling: 0, cost: 0, ordered: 0, not_in_stock: 0 },

      // Chart
      selectedProductId: null,
      chartData: { labels: [], datasets: [] },
      chartOptions: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },

      currentDate: new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),

      // orders (+ derived lists)
      orders: [],
      derivedStores: [],
      derivedEmployees: [],

      // placeholder avatar
      placeholderAvatar:
        "data:image/svg+xml;utf8," +
        encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%' height='100%' fill='#f4f4f4'/><text x='50%' y='50%' dy='.35em' text-anchor='middle' fill='#9c9c9c' font-family='Arial' font-size='14'>No Image</text></svg>"),

      // settings doc from firebase (single record)
      settings: null
    };
  },
  
  computed: {
    getUserName() {
      return this.authStore.user?.nombre || this.authStore.user?.username || 'Usuario';
    },
    // first 4 orders (if exist)
    firstOrders() {
      return (this.orders || []).slice(0, 4);
    }
  },

  methods: {
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; },
    
    async load() {
      try {
        // productos
        this.products = await api.getProducts();

        // 1) settings (single doc) — ajusta la ruta si tu backend la expone distinto
        try {
          const sRes = await fetch('/api/settings');
          if (sRes.ok) {
            const sd = await sRes.json();
            this.settings = Array.isArray(sd) ? (sd[0] || null) : (sd || null);
          } else {
            console.warn('No se pudo obtener settings:', sRes.status);
            this.settings = null;
          }
        } catch (err) {
          console.warn('Error al pedir settings:', err);
          this.settings = null;
        }

        // 2) órdenes
        try {
          const rawOrders = await ordersApi.getOrders();
          // normalizamos nombres de campos comunes para evitar undefined
          this.orders = (rawOrders || []).map(o => ({
            ...o,
            store_image: o.store_image || o.store_photo || (o.store && (o.store.photo_url || o.store.url)) || o.photo_url || o.store_photo_url || '',
            admin_photo: o.admin_photo || o.admin_image || (o.admin && (o.admin.photo_url || o.admin.url)) || '',
            // opcional: normalizar nombres para mostrar
            store_name: o.store_name || (o.store && (o.store.name || o.store.nombre)) || '',
            admin_name: o.admin_name || (o.admin && (o.admin.nombre || o.admin.username)) || ''
          }));
        } catch (err) {
          console.warn('No se pudo cargar orders:', err);
          this.orders = [];
        }

        // 3) derive stores/admins with images (unique)
        const storeMap = new Map();
        const adminMap = new Map();

        (this.orders || []).forEach(o => {
          const storeId = o.storeId || o.store_id || (o.store && o.store.id) || o.store?.id;
          const storePhoto = o.store_image;
          const storeName = o.store_name || o.store?.name || o.store?.nombre;

          if (storeId && storePhoto) {
            if (!storeMap.has(storeId)) {
              storeMap.set(storeId, {
                id: storeId,
                name: storeName || 'Tienda',
                photo_url: storePhoto,
                address: o.store_address || (o.store && (o.store.address || o.store.direccion)) || ''
              });
            }
          }

          const adminId = o.adminId || o.admin_id || (o.admin && o.admin.id) || o.admin?.id;
          const adminPhoto = o.admin_photo;
          const adminName = o.admin_name || o.admin?.nombre || o.admin?.username;

          if (adminId && adminPhoto) {
            if (!adminMap.has(adminId)) {
              adminMap.set(adminId, {
                id: adminId,
                name: adminName || 'Empleado',
                photo_url: adminPhoto
              });
            }
          }
        });

        this.derivedStores = Array.from(storeMap.values());
        this.derivedEmployees = Array.from(adminMap.values());

        // recompute stats (tu función existente)
        this.computeStats();
      } catch (e) {
        console.error('Error cargando dashboard:', e);
      }
    },

    computeStats() {
      const set = new Set();
      let totalUnits = 0;
      let revenue = 0;
      this.products.forEach(p => {
        if (p.category) set.add(p.category);
        totalUnits += Number(p.quantity) || 0;
        revenue += (Number(p.quantity) || 0) * (Number(p.price) || 0);
      });
      
      this.stats = { 
        categories: set.size, 
        totalUnits, 
        revenue: Math.round(revenue), 
        ordered: this.products.filter(p => p.quantity < 5).length, 
        not_in_stock: this.products.filter(p => p.quantity == 0).length 
      };
    },

    updateChart() {
      if (!this.selectedProductId) return;
      const product = this.products.find(p => p.id === this.selectedProductId);
      if(product) {
        this.chartData = {
          labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
          datasets: [{
            label: 'Ventas',
            backgroundColor: '#4f46e5',
            borderRadius: 6,
            data: Array.from({length: 7}, () => Math.floor(Math.random() * 10) + 1)
          }]
        };
      }
    },

    handleSearch(term) { console.log(term); },
    onNavigate(path) { this.$router.push(path); },
    
    openAdd() { this.editingProduct = null; this.showForm = true; this.overlayVisible = true; },
    closeForm() { this.showForm = false; this.overlayVisible = false; },
    async onSaved() { await this.load(); this.closeForm(); },
    overlayClicked() { this.closeForm(); },

    goToStore(id) {
      // navigate to stores view with query param so StoresView can open that store if desired
      if (!id) return;
      this.$router.push({ path: '/stores', query: { id } }).catch(()=>{});
    },

    goToAdmin(id) {
      if (!id) return;
      // navigate to users/admins page (or adapt to your routing)
      this.$router.push({ path: '/users', query: { id } }).catch(()=>{});
    }
  },
  mounted() {
    this.load();
    if (window.innerWidth < 900) this.sidebarOpen = false;
  },
  openOrder(order) {
    if (!order) return;
    this.$router.push({ path: '/orders', query: { id: order.id || order.folio } }).catch(()=>{});
  },
};
</script>

<style scoped>
/* --- LAYOUT --- */
#dashboard-wrapper { display: flex; width: 100%; min-height: 100vh; position: relative; overflow-x: hidden; font-family: 'Segoe UI', sans-serif; }
.main-area { width: 100%; min-height: 100vh; background-color: #f8fafc; transition: margin-left 0.22s ease; display: flex; flex-direction: column; }
.main-area { margin-left: 200px; }
.main-area.sidebar-collapsed { margin-left: 0 !important; }
.content { padding: 15px 25px; flex-grow: 1; max-width: 100%; box-sizing: border-box; display: flex; flex-direction: column;gap: 15px;}
/* --- HEADER BIENVENIDA --- */
.welcome-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 35px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
.welcome-header h1 { font-size: 1.8rem; color: #1e293b; margin: 0 0 5px 0; font-weight: 700; }
.subtitle { color: #64748b; margin: 0; font-size: 1rem; }
.date-pill { background: #fff; padding: 8px 16px; border-radius: 50px; color: #475569; font-size: 0.9rem; font-weight: 500; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; align-items: center; gap: 8px; }

/* --- ACCESOS RÁPIDOS --- */
.quick-actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 40px; }
.action-card { border: none; background: white; padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 15px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); text-align: left; }
.action-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.action-text span { font-weight: 700; color: #334155; font-size: 1rem; display: block; }
.action-text small { color: #94a3b8; font-size: 0.85rem; }
.icon-circle { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: white; flex-shrink: 0; }

.action-card.blue .icon-circle { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.action-card.green .icon-circle { background: linear-gradient(135deg, #10b981, #059669); }
.action-card.orange .icon-circle { background: linear-gradient(135deg, #f59e0b, #d97706); }
.action-card.purple .icon-circle { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

/* --- SECCIÓN PROVEEDORES --- */
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.section-header h3 { font-size: 1.25rem; color: #1e293b; margin: 0; font-weight: 700; }
.btn-link { background: none; border: none; color: #3b82f6; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; }
.btn-link:hover { text-decoration: underline; }

.suppliers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; margin-bottom: 40px; }
.store-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); transition: transform 0.2s; border: 1px solid #f1f5f9; display: flex; flex-direction: column; }
.store-card:hover { transform: translateY(-5px); box-shadow: 0 15px 25px -5px rgba(0, 0, 0, 0.1); }
.store-cover { height: 100px; background-position: center; background-repeat: no-repeat; background-size: cover; position: relative;}
.cover-title { position: absolute; bottom: 10px; left: 10px; color: white; font-weight: 900; font-size: 1.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }

.store-body { padding: 15px; position: relative; padding-top: 40px; }
.store-avatar { width: 60px; height: 60px; border-radius: 50%; border: 4px solid white; position: absolute; top: -30px; left: 15px; object-fit: cover; background: white; }

.store-info h4 { margin: 0 0 5px 0; font-size: 1.1rem; color: #1e293b; }
.contact-name { color: #64748b; font-size: 0.9rem; margin: 0 0 10px 0; }
.store-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.tag { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }

/* --- GRID INFERIOR --- */
.dashboard-grid-bottom { display: grid; grid-template-columns: 2.2fr 1fr; gap: 20px; align-items: stretch; margin-bottom: 20px; }
@media (max-width: 1100px) { .dashboard-grid-bottom { grid-template-columns: 1fr; } }
.left-col { display: flex; flex-direction: column; gap: 20px; }
.right-col { display: flex; flex-direction: column; height: 100%; }

/* Chart adjustments */
.chart-container { height: 180px; width: 100%; position: relative; }
.no-chart-state { height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; background: #f8fafc; border-radius: 12px; border: 2px dashed #e2e8f0; }
.no-chart-state i { font-size: 2.5rem; margin-bottom: 10px; opacity: 0.5; }

/* Store profile card adjustments */
.store-profile-card { background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; text-align: center; padding-bottom: 20px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
.store-header-bg { height: 50px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); flex-shrink: 0; }
.store-logo-wrapper { width: 60px; height: 60px; background: white; border-radius: 50%; margin: -30px auto 5px auto; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: #3b82f6; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.store-info-center h2 { margin: 0 0 2px 0; font-size: 1.1rem; color: #1e293b; }
.status-badge { font-size: 0.75rem; padding: 2px 10px; border-radius: 20px; font-weight: 600; margin-bottom: 10px; display: inline-block; background: #dcfce7; color: #166534; }
.store-details-list { text-align: left; padding: 0 25px; margin-bottom: auto; }
.store-details-list p { margin: 6px 0; color: #64748b; font-size: 0.85rem; display: flex; align-items: center; gap: 10px; }
.store-details-list i { color: #94a3b8; width: 20px; text-align: center; font-size: 1.1rem; }

/* Social buttons */
.social-buttons { display: flex; justify-content: center; gap: 10px; margin-top: 15px; }
.social-btn { width: 40px; height: 40px; border-radius: 50%; border: none; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; cursor: pointer; transition: transform 0.2s; }
.social-btn:hover { transform: scale(1.1); }
.fb { background: #1877f2; } .ig { background: #e1306c; } .wa { background: #25d366; }

.card { background: white; border-radius: 16px; padding: 25px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }
.card h3 { margin-top: 0; color: #334155; font-size: 1.1rem; margin-bottom: 20px; font-weight: 700; }

.stats-list-horizontal { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
@media (max-width: 1300px) { .stats-list-horizontal { grid-template-columns: repeat(2, 1fr); } }

.mini-stat { background: white; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px; }
.mini-stat div { display: flex; flex-direction: column; }
.mini-stat span { color: #64748b; font-size: 0.8rem; }
.mini-stat strong { color: #1e293b; font-size: 1.1rem; }
.stat-icon-small { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1rem; flex-shrink: 0; }
.bg-blue { background: #3b82f6; } .bg-orange { background: #f59e0b; } .bg-green { background: #10b981; } .bg-red { background: #ef4444; }
.text-danger { color: #ef4444; }

.card-header-simple { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.chart-select { padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 8px; color: #475569; outline: none; font-size: 0.9rem;}

/* Modal Overlay */
#overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); z-index: 1000; }
.overlay-hidden { display: none; }
.fa-brands { color: white; }

/* Orders: diseño de tarjetas */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.order-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #eef2f7;
  box-shadow: 0 6px 18px rgba(12, 20, 30, 0.04);
  transition: transform .14s ease, box-shadow .14s ease;
  cursor: pointer;
  flex-direction: column;
}
.order-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(12, 20, 30, 0.07);
}

/* Thumb imagen de la tienda */
.order-thumb {
  flex: 0 0 84px;
  width: 100%;
  height: 84px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}
.order-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Contenido textual de la orden */
.order-info {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
}
.order-top {
  display:flex;
  justify-content: space-between;
  align-items: center;
}
.order-top strong {
  font-size: 0.96rem;
  color: #102a43;
}
.order-date {
  font-size: 0.8rem;
  color: #7b8794;
}

/* Líneas con detalles */
.order-middle .line {
  font-size: 0.88rem;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Badges y meta */
.badge.small {
  display: inline-block;
  padding: 6px 10px;
  background: #f1f5f9;
  color: #223;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid rgba(30,41,59,0.04);
}

/* Avatar del admin a la derecha */
.order-admin-avatar {
  flex: 0 0 48px;
  display:flex;
  align-items:center;
  justify-content:center;
}
.order-admin-avatar img {
  position: relative;
  bottom: 60px;
  right: 30px;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(12,20,30,0.06);
}

/* Estado responsivo: apilar en móvil */
@media (max-width: 640px) {
  .order-card { flex-direction: column; align-items: stretch; gap: 10px; padding: 10px; }
  .order-thumb { width: 100%; height: 140px; border-radius: 8px; }
  .order-admin-avatar { justify-content: flex-start; }
  .order-top { gap: 8px; }
}

/* pequeño ajuste visual para "no orders" */
.empty-state {
  padding: 18px;
  text-align: center;
  color: #6b7280;
  border-radius: 10px;
  background: #fbfbfd;
  border: 1px dashed #eef2f7;
}

.store-line {
  font-weight: 700;
  color: #214b8f;
}

.order-details{
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row-reverse;
}
</style>