# proyectoinventario-ad2025

🛒 Sistema de Inventario y Punto de Venta (POS)

Aplicación Fullstack para la gestión de productos, proveedores y movimientos de inventario. Permite registrar entradas y salidas, generar reportes de stock, administrar categorías y controlar ventas en un entorno intuitivo. Incluye autenticación con JWT, API REST, base de datos estructurada y una interfaz moderna y responsiva.

Requisitos
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