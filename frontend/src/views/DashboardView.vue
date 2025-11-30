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
            <p class="subtitle">Aquí está el resumen de <strong>Mercadito</strong> para hoy.</p>
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
          <button class="action-card green">
            <div class="icon-circle"><i class="fa-solid fa-cash-register"></i></div>
            <div class="action-text">
              <span>Nueva Venta</span>
              <small>Terminal POS</small>
            </div>
          </button>
          <button class="action-card orange" @click="$router.push('/suppliers')">
            <div class="icon-circle"><i class="fa-solid fa-truck-ramp-box"></i></div>
            <div class="action-text">
              <span>Nuevo Proveedor</span>
              <small>Gestión</small>
            </div>
          </button>
          <button class="action-card purple">
            <div class="icon-circle"><i class="fa-solid fa-file-invoice-dollar"></i></div>
            <div class="action-text">
              <span>Ver Reportes</span>
              <small>Finanzas</small>
            </div>
          </button>
        </div>

        <section class="section-container">
            <div class="section-header">
                <h3><i class="fa-solid fa-store"></i> Tiendas y Proveedores</h3>
                <button class="btn-link" @click="$router.push('/suppliers')">
                    Ver todos <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
          <div class="suppliers-grid">
            
            <div class="store-card">
                <div class="store-cover" style="background-image: url('https://thelogisticsworld.com/wp-content/uploads/2023/02/nueva-tienda-de-bodega-aurrera-1.jpg');"></div>
                <div class="store-body">
                <img src="https://i.pravatar.cc/150?u=Consuelo" class="store-avatar" alt="Consuelo">
                <div class="store-info">
                    <h4>Bodega Aurrera</h4>
                    <p class="contact-name"><i class="fa-solid fa-user-tag"></i> Consuelo Dubal</p>
                    <div class="store-tags">
                    <span class="tag">Abarrotes</span>
                    <span class="tag">Despensa</span>
                    </div>
                </div>
                </div>
            </div>

            <div class="store-card">
                <div class="store-cover" style="background-image: url('https://dnclcgcvl4f14.cloudfront.net/siila-cm/prd/1280w/7910-1686932784704.jpg');"></div>
                <div class="store-body">
                <img src="https://i.pravatar.cc/150?u=Paco" class="store-avatar" alt="Paco">
                <div class="store-info">
                    <h4>La Comer</h4>
                    <p class="contact-name"><i class="fa-solid fa-user-tag"></i> Don Paco Hdez</p>
                    <div class="store-tags">
                    <span class="tag">Frescos</span>
                    <span class="tag">Gourmet</span>
                    </div>
                </div>
                </div>
            </div>

            <div class="store-card">
                <div class="store-cover" style="background-image: url('https://i0.wp.com/estadoluz.com/wp-content/uploads/2024/07/Banner-Estado-Luz-1200-x-700-px-2024-07-04T160746.149.png?fit=1200%2C700&ssl=1');">
                <span class="cover-title">EL REMATE</span>
                </div>
                <div class="store-body">
                <img src="https://i.pravatar.cc/150?u=Miguel" class="store-avatar" alt="Miguel">
                <div class="store-info">
                    <h4>El Remate</h4>
                    <p class="contact-name"><i class="fa-solid fa-user-tag"></i> Miguel</p>
                    <div class="store-tags">
                    <span class="tag">Ofertas</span>
                    <span class="tag">Varios</span>
                    </div>
                </div>
                </div>
            </div>

            <div class="store-card">
                <div class="store-cover" style="background-image: url('https://retailers.mx/revista/wp-content/uploads/2022/06/Sorian-Hiper-Tapachula-scaled.jpg');"></div>
                <div class="store-body">
                <img src="https://i.pravatar.cc/150?u=Chema" class="store-avatar" alt="Chema">
                <div class="store-info">
                    <h4>Soriana</h4>
                    <p class="contact-name"><i class="fa-solid fa-user-tag"></i> Doña Chema</p>
                    <div class="store-tags">
                    <span class="tag">General</span>
                    </div>
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
                     <button class="social-btn fb"><i class="fa-brands fa-facebook-f"></i></button>
                     <button class="social-btn ig"><i class="fa-brands fa-instagram"></i></button>
                     <button class="social-btn wa"><i class="fa-brands fa-whatsapp"></i></button>
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
import { useAuthStore } from '../store/auth.store';

// Chart.js
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: "DashboardView",
  components: { Sidebar, Navbar, ProductForm, Bar },
  
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
      
      currentDate: new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    };
  },
  
  computed: {
    getUserName() {
      return this.authStore.user?.nombre || this.authStore.user?.username || 'Usuario';
    }
  },

  methods: {
    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; },
    
    async load() {
      try {
        this.products = await api.getProducts();
        this.computeStats();
      } catch (e) { console.error("Error cargando productos", e); }
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
    overlayClicked() { this.closeForm(); }
  },
  mounted() {
    this.load();
    if (window.innerWidth < 900) this.sidebarOpen = false;
  }
};
</script>

<style scoped>
/* --- LAYOUT --- */
#dashboard-wrapper { display: flex; width: 100%; min-height: 100vh; position: relative; overflow-x: hidden; font-family: 'Segoe UI', sans-serif; }
.main-area { width: 100%; min-height: 100vh; background-color: #f8fafc; transition: margin-left 0.22s ease; display: flex; flex-direction: column; }
.main-area { margin-left: 200px; }
.main-area.sidebar-collapsed { margin-left: 0 !important; }
.content { padding: 15px 25px; flex-grow: 1; max-width: 100%; /* <--- ESTO ESTÁ BIEN */box-sizing: border-box; display: flex; flex-direction: column;gap: 15px;}
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

/* Agrega background-size: cover para que la foto llene todo el espacio sin deformarse */
.store-cover { height: 100px; background-position: center; background-repeat: no-repeat; background-size: cover; position: relative;}
.cover-title { position: absolute; bottom: 10px; left: 10px; color: white; font-weight: 900; font-size: 1.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }

.store-body { padding: 15px; position: relative; padding-top: 40px; }
.store-avatar { width: 60px; height: 60px; border-radius: 50%; border: 4px solid white; position: absolute; top: -30px; left: 15px; object-fit: cover; background: white; }

.store-info h4 { margin: 0 0 5px 0; font-size: 1.1rem; color: #1e293b; }
.contact-name { color: #64748b; font-size: 0.9rem; margin: 0 0 10px 0; }
.store-tags { display: flex; gap: 8px; flex-wrap: wrap; }
.tag { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }

/* --- GRID INFERIOR (Alineación Perfecta) --- */
.dashboard-grid-bottom { 
  display: grid; 
  grid-template-columns: 2.2fr 1fr; /* Le damos un poco más de espacio a la gráfica */
  gap: 20px; 
  align-items: stretch; /* <--- TRUCO: Esto obliga a que ambas columnas midan lo mismo */
  margin-bottom: 20px;
}

@media (max-width: 1100px) { 
  .dashboard-grid-bottom { grid-template-columns: 1fr; } 
}

/* Columna Izquierda (Stats + Chart) */
.left-col { 
  display: flex; 
  flex-direction: column; 
  gap: 20px; 
}

/* Columna Derecha (Tienda) */
.right-col { 
  display: flex; 
  flex-direction: column; 
  height: 100%; /* Para que llene el hueco */
}

/* 1. Ajuste de altura de la Gráfica (Más chaparrita) */
/* Antes estaba en 220px o 300px */
.chart-container { 
  height: 180px; /* <--- REDUCIR A ESTE VALOR */
  width: 100%; 
  position: relative;
}

.no-chart-state { 
  height: 180px; /* <--- IGUALAR AQUI */
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  color: #94a3b8; 
  background: #f8fafc; 
  border-radius: 12px; 
  border: 2px dashed #e2e8f0; 
}
.no-chart-state i { font-size: 2.5rem; margin-bottom: 10px; opacity: 0.5; }

/* 2. Ajuste de la Tarjeta de Tienda (Para que se estire) */
.store-profile-card { 
  background: white; 
  border-radius: 16px; 
  overflow: hidden; 
  border: 1px solid #e2e8f0; 
  text-align: center; 
  padding-bottom: 20px; 
  
  /* ESTO HACE QUE SE ESTIRE PARA ALCANZAR A LA GRÁFICA */
  height: 100%; 
  display: flex;
  flex-direction: column;
  justify-content: space-between; 
}

/* Estilos internos de la tienda (igual que antes) */
.store-header-bg { 
  height: 50px; /* Antes 70px */
  background: linear-gradient(135deg, #3b82f6, #8b5cf6); 
  flex-shrink: 0; 
}
/* Reducimos el círculo del logo */
.store-logo-wrapper { 
  width: 60px;  /* Antes 80px */
  height: 60px; /* Antes 80px */
  background: white; 
  border-radius: 50%; 
  margin: -30px auto 5px auto; /* Ajustamos el margen negativo */
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 1.8rem; /* Icono más chico */
  color: #3b82f6; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
}
/* Ajustamos márgenes de textos */
.store-info-center h2 { 
  margin: 0 0 2px 0; 
  font-size: 1.1rem; /* Texto un poco más chico */
  color: #1e293b; 
}
.status-badge { 
  font-size: 0.75rem; 
  padding: 2px 10px; 
  border-radius: 20px; 
  font-weight: 600; 
  margin-bottom: 10px; /* Menos espacio abajo */
  display: inline-block; 
  background: #dcfce7; 
  color: #166534; 
}
.store-details-list { text-align: left; padding: 0 25px; margin-bottom: auto; /* Empuja los botones abajo */ }
/* Reducimos espacio entre los datos de contacto */
.store-details-list p { 
  margin: 6px 0; /* Antes 12px */
  color: #64748b; 
  font-size: 0.85rem; 
  display: flex; 
  align-items: center; 
  gap: 10px; 
}
.store-details-list i { color: #94a3b8; width: 20px; text-align: center; font-size: 1.1rem; }

/* Botones sociales un poco más compactos */
.social-buttons { 
  display: flex; 
  justify-content: center; 
  gap: 10px; 
  margin-top: 15px; /* Menos margen arriba */
}
.social-btn { width: 40px; height: 40px; border-radius: 50%; border: none; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; cursor: pointer; transition: transform 0.2s; }
.social-btn:hover { transform: scale(1.1); }
.fb { background: #1877f2; } .ig { background: #e1306c; } .wa { background: #25d366; }

/* Estilos Generales de Cards y Stats (Mantenidos) */
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
</style>