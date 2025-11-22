<template>
  <aside :class="['app-sidebar', { collapsed }]" role="navigation" aria-label="Main navigation">
    <div class="sidebar-top">
      <img class="sidebar-logo" src="../../assets/logo.png" alt="Mecadito Logo" />
      <span class="brand">Mecadito</span>
    </div>

    <nav class="sidebar-menu" aria-label="Primary">
      <ul>
        <li :class="['menu-item', { active: isActive('/dashboard') }]">
          <a href="#" class="menu-link" @click.prevent="navigateTo('/dashboard', 'home')">
            <i class="fa-solid fa-house"></i>
            <span>Dashboard</span>
          </a>
        </li>

        <li :class="['menu-item', { active: isActive('/admin') }]">
          <a href="#" class="menu-link" @click.prevent="navigateTo('/admin', 'admins')">
            <i class="fa-regular fa-user"></i>
            <span>Administrators</span>
          </a>
        </li>

        <li :class="['menu-item', { active: isActive('/inventory') }]">
          <a href="#" class="menu-link" @click.prevent="navigateTo('/inventory', 'products')">
            <i class="fa-solid fa-cart-shopping"></i>
            <span>Inventory</span>
          </a>
        </li>

        <li :class="['menu-item', { active: isActive('/suppliers') }]">
          <a href="#" class="menu-link" @click.prevent="navigateTo('/suppliers', 'suppliers')">
            <i class="fa-solid fa-people-carry-box"></i>
            <span>Suppliers</span>
          </a>
        </li>

        <li :class="['menu-item', { active: isActive('/orders') }]">
          <a href="#" class="menu-link" @click.prevent="navigateTo('/orders', 'orders')">
            <i class="fa-solid fa-box-open"></i>
            <span>Orders</span>
          </a>
        </li>

        <li :class="['menu-item', { active: isActive('/store') }]">
          <a href="#" class="menu-link" @click.prevent="navigateTo('/store')">
            <i class="fa-solid fa-store"></i>
            <span>Manage Store</span>
          </a>
        </li>

        <li :class="['menu-item', { active: isActive('/reports') }]">
          <a href="#" class="menu-link" @click.prevent="navigateTo('/reports')">
            <i class="fa-solid fa-square-poll-vertical"></i>
            <span>Reports</span>
          </a>
        </li>
      </ul>
    </nav>

    <div class="sidebar-bottom" aria-label="Secondary">
      <ul>
        <li :class="['menu-item', { active: isActive('/settings') }]">
          <a href="#" class="menu-link" @click.prevent="navigateTo('/settings')">
            <i class="fa-solid fa-gear"></i>
            <span>Settings</span>
          </a>
        </li>
        <li class="menu-item">
          <a href="#" class="menu-link" @click.prevent="handleLogout">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            <span>Log Out</span>
          </a>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { useAuthStore } from '../../store/auth.store';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['navigate', 'logout']);

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// navega programáticamente y emite el evento 'navigate' para que el padre (si lo escucha) pueda reaccionar
const navigateTo = (path, key = null) => {
  if (key) emit('navigate', key);
  router.push(path).catch(() => {});
};

// --- FUNCIÓN PARA SALIR ---
const handleLogout = () => {
  // llama a la acción de la store (debe existir logout en authStore)
  authStore.logout();
  emit('logout');
  // redirige a la raíz (login)
  router.push('/').catch(() => {});
};

// comprueba si la ruta actual coincide (o es subruta) del path pasado
const isActive = (path) => {
  const current = route.path || '';
  if (!path) return false;
  return current === path || current.startsWith(path + '/') || current.startsWith(path);
};
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 200px;
  height: 100vh;
  padding: 24px 16px;
  box-sizing: border-box;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.04);
  z-index: 100;
  transition: transform 220ms ease, opacity 220ms ease;
}

.app-sidebar.collapsed {
  transform: translateX(-108%);
  opacity: 0;
  pointer-events: none;
}

.sidebar-top {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f6f6f6;
}

.sidebar-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.brand {
  font-weight: 700;
  font-size: 16px;
  color: #1f7bff;
  letter-spacing: 0.2px;
}

.sidebar-menu {
  margin-top: 18px;
  flex: 1;
  overflow: auto;
}

.sidebar-menu ul{
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item { margin: 10px 0; }

.menu-link {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6d6c6c;
  text-decoration: none;
  padding: 8px 6px;
  border-radius: 8px;
  transition: background .12s, color .12s;
}

/* icon general */
.menu-link i {
  width: 22px;
  text-align: center;
  font-size: 16px;
  color: #7a7a7a;
}

/* active / hover */
.menu-item.active .menu-link,
.menu-link:hover {
  background: rgba(51, 119, 249, 0.06);
  color: #1471ff;
}

.menu-item.active .menu-link i,
.menu-link:hover i {
  color: #1471ff;
}

/* ---- Puntos en la sección inferior: ahora posicionados absolutamente ---- */
.sidebar-bottom {
  margin-top: 10px;
  padding-top: 12px;
  border-top: 1px solid #f6f6f6;
}

.sidebar-bottom ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
/* mobile: ocultar sidebar (si gestionas colapso con JS, opcional) */
@media (max-width: 800px) {
  .app-sidebar { display: none; }
}
</style>