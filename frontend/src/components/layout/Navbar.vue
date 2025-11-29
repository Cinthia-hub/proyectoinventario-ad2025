<template>
  <header class="topbar">
    
    <div class="topbar-left">
      <button class="menu-btn" @click="onToggle" aria-label="Toggle menu">
        <i class="fa-solid fa-bars"></i>
      </button>
    </div>

    <div class="topbar-right">
      
      <div class="notifications-wrapper" ref="notifContainer">
        <button class="icon-btn" title="Notificaciones" @click="toggleNotif">
          <i class="fa-regular fa-bell"></i>
          <span class="badge" v-if="notices.length > 0"></span>
        </button>

        <div class="notif-dropdown" v-if="showNotif">
          <div class="notif-header">
            <h4>Avisos</h4>
            <button class="mark-read" @click="showNotif = false">Cerrar</button>
          </div>
          <ul class="notif-list">
            <li v-for="(notice, index) in notices" :key="index" class="notif-item">
              <div class="notif-icon" :class="notice.type">
                <i :class="notice.icon"></i>
              </div>
              <div class="notif-content">
                <strong>{{ notice.title }}</strong>
                <small>{{ notice.desc }}</small>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="user-profile-section">
        <span class="user-name-text">
            {{ authStore.user?.nombre || authStore.user?.username }}
        </span>
        <button class="profile-btn" title="Profile">
            <img :src="userPhoto" alt="Perfil" class="profile-img" />
        </button>
      </div>
    </div>

  </header>
</template>

<script>
import { useAuthStore } from '../../store/auth.store';
import { computed, ref, onMounted, onUnmounted } from 'vue';

export default {
  name: "Navbar",
  props: { sidebarOpen: { type: Boolean, default: true } },
  emits: ["toggle-sidebar"],
  
  setup() {
    const authStore = useAuthStore();
    const showNotif = ref(false);
    const notifContainer = ref(null);

    // DATOS DE LOS AVISOS (Movidos aquí desde el Dashboard)
    const notices = ref([
      { title: 'Revisar Caducidad', desc: '3 productos vencen pronto', type: 'warning', icon: 'fa-solid fa-triangle-exclamation' },
      { title: 'Pedido en camino', desc: 'Aurrera llega mañana', type: 'info', icon: 'fa-solid fa-truck' },
      { title: 'Corte de caja', desc: 'Recuerda hacer el corte hoy', type: 'success', icon: 'fa-solid fa-cash-register' }
    ]);

    const userPhoto = computed(() => {
      const user = authStore.user;
      if (user?.photo_url) return user.photo_url;
      const name = user?.nombre || user?.username || 'User';
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&bold=true`;
    });

    const toggleNotif = () => { showNotif.value = !showNotif.value; };

    // Cerrar si clic fuera
    const handleClickOutside = (e) => {
      if (notifContainer.value && !notifContainer.value.contains(e.target)) {
        showNotif.value = false;
      }
    };

    onMounted(() => { document.addEventListener('click', handleClickOutside); });
    onUnmounted(() => { document.removeEventListener('click', handleClickOutside); });

    return { authStore, userPhoto, showNotif, toggleNotif, notices, notifContainer };
  },

  methods: {
    onToggle() { this.$emit("toggle-sidebar"); }
  }
};
</script>

<style scoped>
.topbar {
  height: 64px; background-color: #ffffff; display: flex; align-items: center; justify-content: space-between;
  padding: 0 20px; border-bottom: 1px solid #e0e0e0; position: sticky; top: 0; z-index: 99;
}
.topbar-left, .topbar-right { display: flex; align-items: center; gap: 20px; }

/* Botones y Perfil */
.menu-btn { background: none; border: none; font-size: 1.4rem; cursor: pointer; color: #333; display: flex; align-items: center; padding: 5px; border-radius: 4px; transition: background 0.2s; }
.menu-btn:hover { background-color: #f5f5f5; }
.icon-btn { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #555; position: relative; }
.user-profile-section { display: flex; align-items: center; gap: 12px; margin-left: 10px; }
.user-name-text { font-size: 0.9rem; font-weight: 600; color: #555; display: none; }
@media (min-width: 768px) { .user-name-text { display: block; } }
.profile-btn { border: none; background: transparent; padding: 0; cursor: pointer; border-radius: 50%; display: flex; }
.profile-img { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid #e0e0e0; }

/* --- ESTILOS DE NOTIFICACIONES --- */
.notifications-wrapper { position: relative; }
.badge { position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background-color: #ef4444; border-radius: 50%; border: 2px solid white; }

.notif-dropdown {
  position: absolute; top: 40px; right: -10px; width: 300px;
  background: white; border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;
  overflow: hidden; animation: fadeIn 0.2s ease;
}

.notif-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
.notif-header h4 { margin: 0; font-size: 0.95rem; color: #334155; }
.mark-read { border: none; background: none; color: #3b82f6; font-size: 0.8rem; cursor: pointer; font-weight: 600; }

.notif-list { list-style: none; padding: 0; margin: 0; max-height: 300px; overflow-y: auto; }
.notif-item { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: background 0.2s; }
.notif-item:hover { background-color: #f8fafc; }
.notif-item:last-child { border-bottom: none; }

.notif-icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.notif-icon.warning { background: #fff7ed; color: #f97316; }
.notif-icon.info { background: #eff6ff; color: #3b82f6; }
.notif-icon.success { background: #f0fdf4; color: #16a34a; }

.notif-content { display: flex; flex-direction: column; }
.notif-content strong { font-size: 0.9rem; color: #334155; }
.notif-content small { font-size: 0.8rem; color: #64748b; }

@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
</style>