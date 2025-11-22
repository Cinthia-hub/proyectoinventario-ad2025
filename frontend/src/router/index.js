import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import InventoryView from '../views/InventoryView.vue'
import ReportsView from '../views/ReportsView.vue'
import StoreView from '../views/StoreView.vue'
import OrdersView from '../views/OrdersView.vue'
import SuppliersView from '../views/SuppliersView.vue'
import AdminView from '../views/AdminView.vue'

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
            path: '/store',
            name: 'store',
            component: StoreView,
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
            path: '/admin',
            name: 'admin',
            component: AdminView,
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
