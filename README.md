# Sistema de Inventario y Punto de Venta (POS)

Aplicación Fullstack para la gestión de productos, proveedores y movimientos de inventario. Permite registrar entradas y salidas, generar reportes de stock, administrar categorías y controlar las ventas en un entorno intuitivo.

## Características

### Backend (Node.js + Express)
- ✅ API REST completa
- ✅ Autenticación con JWT
- ✅ Base de datos SQLite con Sequelize ORM
- ✅ Gestión de usuarios con roles
- ✅ CRUD de productos, categorías y proveedores
- ✅ Control de movimientos de inventario (entradas/salidas)
- ✅ Sistema de ventas (POS)
- ✅ Reportes de stock y ventas

### Frontend (React + Vite)
- ✅ Interfaz moderna y responsiva
- ✅ Autenticación de usuarios
- ✅ Dashboard con estadísticas
- ✅ Gestión de productos con categorías y proveedores
- ✅ Registro de movimientos de inventario
- ✅ Punto de Venta (POS) intuitivo
- ✅ Visualización de ventas y reportes

## Estructura del Proyecto

```
proyectoinventario-ad2025/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Configuración de BD
│   │   ├── models/         # Modelos Sequelize
│   │   ├── routes/         # Rutas de la API
│   │   ├── middleware/     # Middleware (auth)
│   │   └── index.js        # Servidor principal
│   ├── .env                # Variables de entorno
│   └── package.json
│
└── frontend/               # Frontend React
    ├── src/
    │   ├── components/     # Componentes React
    │   ├── pages/          # Páginas de la aplicación
    │   ├── context/        # Context API (Auth)
    │   ├── services/       # Servicios API
    │   └── main.jsx        # Punto de entrada
    ├── index.html
    └── package.json
```

## Instalación y Configuración

### Requisitos Previos
- Node.js (v14 o superior)
- npm o yarn

### Backend

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (opcional):
El archivo `.env` ya está configurado con valores predeterminados. Puedes modificarlo si lo necesitas:
```
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
DB_PATH=./database.sqlite
```

4. Iniciar el servidor:
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

### Frontend

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Uso

### Primer Usuario

Al iniciar la aplicación por primera vez, necesitarás registrar un usuario:

1. Abre `http://localhost:5173/register`
2. Completa el formulario de registro
3. Inicia sesión con tus credenciales

### Funcionalidades Principales

#### 1. Dashboard
- Visualiza estadísticas generales
- Total de productos
- Productos con stock bajo
- Total de ventas e ingresos

#### 2. Productos
- Crear, editar y eliminar productos
- Asignar categorías y proveedores
- Control de stock y precio
- Alertas de stock bajo

#### 3. Categorías
- Gestionar categorías de productos
- Organizar el inventario

#### 4. Proveedores
- Administrar información de proveedores
- Contactos, teléfonos, emails y direcciones

#### 5. Movimientos de Inventario
- Registrar entradas de mercancía
- Registrar salidas de inventario
- Historial completo de movimientos
- Control automático de stock

#### 6. Punto de Venta (POS)
- Interfaz intuitiva para ventas
- Búsqueda rápida de productos
- Carrito de compras
- Múltiples métodos de pago
- Actualización automática de inventario

#### 7. Ventas
- Historial de ventas
- Detalles de cada transacción
- Reportes de ingresos

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Productos
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener un producto
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto
- `GET /api/products/reports/low-stock` - Productos con stock bajo

### Categorías
- `GET /api/categories` - Obtener todas las categorías
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar categoría

### Proveedores
- `GET /api/suppliers` - Obtener todos los proveedores
- `POST /api/suppliers` - Crear proveedor
- `PUT /api/suppliers/:id` - Actualizar proveedor
- `DELETE /api/suppliers/:id` - Eliminar proveedor

### Inventario
- `GET /api/inventory` - Obtener movimientos
- `POST /api/inventory` - Crear movimiento
- `GET /api/inventory/product/:productId` - Movimientos por producto

### Ventas
- `GET /api/sales` - Obtener todas las ventas
- `GET /api/sales/:id` - Obtener una venta
- `POST /api/sales` - Crear venta
- `GET /api/sales/reports/summary` - Reporte de ventas

## Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **Sequelize** - ORM para base de datos
- **SQLite** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas

### Frontend
- **React** - Biblioteca de UI
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **Vite** - Build tool y dev server
- **CSS3** - Estilos

## Seguridad

- Autenticación mediante JWT
- Contraseñas encriptadas con bcrypt
- Rutas protegidas en backend y frontend
- Validación de datos en ambos lados

## Licencia

ISC