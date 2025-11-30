<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue';
import * as api from './api/settings.api.js';

// Función para actualizar el navegador
const updateBrowserTab = async () => {
  try {
    const settings = await api.getSettings();
    
    if (settings) {
      // 1. Cambiar Título de la pestaña
      if (settings.name) {
        document.title = settings.name; 
      }

      // 2. Cambiar Favicon (Icono)
      if (settings.logoUrl) {
        const link = document.querySelector("link[rel~='icon']");
        if (link) {
          link.href = settings.logoUrl;
        } else {
          const newLink = document.createElement('link');
          newLink.rel = 'icon';
          newLink.href = settings.logoUrl;
          document.head.appendChild(newLink);
        }
      }
    }
  } catch (error) {
    console.error("No se pudo actualizar el branding:", error);
  }
};

onMounted(() => {
  updateBrowserTab();
});
</script>

<style>
/* Estilos globales (fuentes, reset, fondo) */
body {
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
  background-color: #f4f5f7;
}
</style>