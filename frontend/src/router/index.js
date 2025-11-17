import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'

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
        component: DashboardView, // <--- Aquí se usa el componente que acabamos de mover
        meta: { requiresAuth: true }
        },
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
