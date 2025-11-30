import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import InventoryView from '../views/InventoryView.vue'
import ReportsView from '../views/ReportsView.vue'
import StoresView from '../views/StoresView.vue'
import OrdersView from '../views/OrdersView.vue'
import SuppliersView from '../views/SuppliersView.vue'
import AdminsView from '../views/AdminsView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'login',
            component: LoginView,
            meta: { guest: true }
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: DashboardView,
            meta: { requiresAuth: true }
        },
        {
            path: '/inventory',
            name: 'inventory',
            component: InventoryView,
            meta: { requiresAuth: true }
        },
        {
            path: '/reports',
            name: 'reports',
            component: ReportsView,
            meta: { requiresAuth: true }
        },
        {
            path: '/stores',
            name: 'stores',
            component: StoresView,
            meta: { requiresAuth: true }
        },
        {
            path: '/orders',
            name: 'orders',
            component: OrdersView,
            meta: { requiresAuth: true }
        },
        {
            path: '/suppliers',
            name: 'suppliers',
            component: SuppliersView,
            meta: { requiresAuth: true }
        },
        {
            path: '/users',
            name: 'users',
            component: AdminsView,
            meta: { requiresAuth: true }
        },
        {
            path: '/settings',  // La URL que aparecerá en el navegador
            name: 'Settings',
            component: SettingsView,
            meta: { requiresAuth: true }
        }
    ]
})

// --- GUARDIA DE NAVEGACIÓN (PROTECCIÓN) ---
router.beforeEach((to, from, next) => {
    // Leemos el token directamente del localStorage
    const token = localStorage.getItem('token')

    if (to.meta.requiresAuth && !token) {
        // Si requiere auth y NO hay token -> Login
        next('/')
    } else if (to.path === '/' && token) {
        // Si intenta ir al Login y YA tiene token -> Dashboard
        next('/dashboard')
    } else {
        // Continuar normal
        next()
    }
})

export default router
