# proyectoinventario-ad2025

🛒 Sistema de Inventario y Punto de Venta (POS)

Aplicación Fullstack para la gestión de productos, proveedores y movimientos de inventario. Permite registrar entradas y salidas, generar reportes de stock, administrar categorías y controlar ventas en un entorno intuitivo. Incluye autenticación con JWT, API REST, base de datos estructurada y una interfaz moderna y responsiva.

---

## Contenido

- 🧾 Descripción
- ⚙️ Tecnologías
- 🔧 Requisitos
- 🚀 Inicio rápido (local)
  - Backend
  - Frontend
- 🔐 Variables de entorno importantes
- 🗄️ Datos y export/import (Firestore)
- 🧪 Tests y lint (si aplica)
- 🐛 Solución de problemas comunes
- 🤝 Cómo contribuir
- 📄 Licencia

---

## Descripción

Esta app está pensada para pequeños comercios que necesitan llevar control del inventario, órdenes y proveedores. Tiene:
- Panel administrativo (Vue 3 + Vite)
- API REST (Node.js)
- Autenticación y permisos
- Reportes y exportes (CSV / SQL de ejemplo)
- Integraciones para usar Firestore como origen de datos

---

## Tecnologías

- Frontend: Vue 3, Vite, vue-chartjs / Chart.js
- Backend: Node.js (Express / Koa o similar) — carpeta `backend`
- Base de datos: Firestore (Cloud Firestore) o la que esté configurada en `backend`
- Utilidades: firebase-admin (para scripts), herramientas de build habituales (npm/yarn)

---

## Inicio rápido (local)

Clonar repo:
```bash
git clone https://github.com/Cinthia-hub/proyectoinventario-ad2025.git
cd proyectoinventario-ad2025
```

---

## Requisitos
- Node.js (>=16) y npm

Backend (API)
- Carpeta: `backend`
- Puerto por defecto: `http://localhost:3000`

Comandos:
```bash
cd backend
npm install
npm start        # o `npm run dev` si prefieres nodemon
```

Frontend (Vue 3 + Vite)
- Carpeta: `frontend`
- Puerto por defecto: `http://localhost:5173`

Comandos:
```bash
cd frontend
npm install
npm run dev
```

Si Vite no procesa archivos .vue (error al inicio), instala el plugin Vue y crea vite.config.mjs:
```bash
cd frontend
npm install -D @vitejs/plugin-vue
npm install chart.js@^4 vue-chartjs@^5
```
Crea `frontend/vite.config.mjs` (si no existe) con:
```javascript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: { port: 5173 }
});
```