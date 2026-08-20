# 🛍️ Fullstore — Sistema Integral de Ventas (P.O.S.), Inventario & Fichaje Laboral

Sistema **Fullstack de Alto Rendimiento** para la gestión comercial de tiendas físicas y comercio minorista. Incluye Punto de Venta (P.O.S.), control de inventario por talles, auditoría de carga de productos, gestión de encargos, fichaje de personal en tiempo real y panel de control analítico.

---

## 🌟 Características Principales

### 🛒 Punto de Venta (P.O.S. Vendedor)
- **Selección Rápida de Productos & Talles**: Agregado instantáneo al carrito según disponibilidad real.
- **Procesamiento de Ventas**: Confirmación con botones interactivos y spinners de carga.
- **Gestión de Encargos**: Creación y seguimiento de pedidos personalizados de clientes.

### 📦 Manejo & Control de Inventario
- **Subida Directa a Cloudinary**: Carga de fotografías mediante el componente interactivo `Dropzone` (drag & drop o archivo local).
- **Gestión de Talles & Auto-Stock**: Upsert inteligente de talles (reemplazo automático al actualizar) y suma en tiempo real del stock total.
- **Auditoría de Carga**: Registro exacto de la fecha, hora (`dd/MM/yyyy a las HH:mm hs`) y la persona responsable (`creadoPor`) que dio de alta el producto.

### ⏱️ Fichaje Laboral & Asistencia de Personal
- **Check-in / Check-out Interactivo**: Botón dinámico en la barra superior (`🟢 Fichar Entrada` / `🔴 Fichar Salida`).
- **Control de Turnos en Tiempo Real**: Panel para administradores con estado del personal (`En Turno` vs `Fuera de Turno`), hora de llegada, área asignada y códigos únicos de empleado (`codigoEmpleado`).

### 📊 Dashboard Analítico & Gestión de Ventas (Admin)
- **Métricas Financieras**: Cálculo automático de Ingresos Brutos, Reembolsos y Ventas Netas.
- **Devoluciones de Venta**: Procesamiento de reembolsos con restitución automática de stock al inventario.
- **Código de Invitación de Comercio**: Generación de códigos únicos para el registro rápido de empleados.

---

## 🎨 Diseño & Experiencia de Usuario (UI/UX)
- **Estética Dark Glassmorphic**: Gradientes violeta (`#090714`), cian y azul neon con efecto `backdrop-blur-xl`.
- **Navbar Flotante (Liquid Dock)**: Cápsula de navegación flotante adaptativa con indicadores de turno.
- **Notificaciones Toast Custom**: Sistema de alertas emergentes sin diálogos nativos del navegador.
- **Scrollbar Personalizado**: Barra de desplazamiento delgada de 6px con gradiente neón.

---

## 🛠️ Arquitectura Tech Stack

| Capa | Tecnología / Librerías |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons, Date-fns |
| **Backend** | NestJS 10, TypeORM 0.3, Express, Multer (Memory Storage), Class-Validator |
| **Base de Datos** | PostgreSQL |
| **Almacenamiento Cloud** | Cloudinary API (Media Management) |
| **Autenticación** | JWT (JSON Web Tokens) & Passwords Hasheados con bcrypt |

---

## 🗂️ Estructura del Proyecto

```bash
losSieteDiaz/
├── back/                       # API Backend (NestJS + TypeORM)
│   ├── src/
│   │   ├── auth/              # Autenticación, JWT Strategy & Guards
│   │   ├── users/             # Entidades de Usuario, Negocio y Shift
│   │   ├── products/          # Productos, Talles, Cloudinary & Auditoría
│   │   ├── sales/             # Procesamiento de Ventas y Devoluciones
│   │   ├── orders/            # Encargos de Clientes
│   │   └── config/            # Cloudinary & Database Config
│   └── uploads/               # Directorio limpio (uso exclusivo en memoria)
│
├── front/                      # Cliente Web (Next.js App Router)
│   ├── app/
│   │   ├── admin/             # Dashboard Admin & Control de Inventario
│   │   ├── vendedor/          # P.O.S. Vendedor & Carga de Productos
│   │   ├── login/             # Inicio de Sesión
│   │   └── register/          # Registro de Negocio / Empleados
│   ├── components/            # UI System: Dropzone, Navbars, Dialogs
│   └── lib/                   # API Client, Auth Context & Toast Provider
└── README.md
```

---

## 🚀 Guía de Instalación y Ejecución

### 1️⃣ Requisitos Previos
- **Node.js**: `>= 18.x`
- **PostgreSQL**: Instalado y ejecutándose localmente (o base de datos remota).
- **npm** o **yarn**

### 2️⃣ Configurar Backend (`back`)

```bash
cd back
npm install
```

Crea el archivo `.env` en la carpeta `back/` tomando como base la siguiente plantilla:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=admin
DB_NAME=lossietediaz

# JWT & Server
JWT_SECRET=super-secret-jwt-key
PORT=3001
NODE_ENV=development

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

Ejecutar el backend NestJS en modo desarrollo:
```bash
npm run start:dev
```
*El servidor backend iniciará en `http://localhost:3001`.*

---

### 3️⃣ Configurar Frontend (`front`)

```bash
cd ../front
npm install
```

Crea el archivo `.env.local` en la carpeta `front/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Ejecutar la aplicación Next.js:
```bash
npm run dev
```
*La interfaz web estará disponible en `http://localhost:3000`.*

---

## 📡 Endpoints de la API Backend (Resumen REST)

### 🔑 Autenticación & Usuarios (`/auth`, `/users`)
- `POST /auth/register-admin` — Registro de comercio y usuario administrador.
- `POST /auth/register-employee` — Registro de empleado mediante código de negocio.
- `POST /auth/login` — Autenticación y retorno de Bearer Token JWT.
- `PATCH /users/:id/shift` — Marcar/alternar fichaje de turno (Entrada/Salida).
- `PATCH /users/:id/department` — Asignar departamento o área laboral.
- `PATCH /users/:id/code` — Asignar código único de empleado.

### 📦 Productos & Inventario (`/products`)
- `GET /products` — Obtener catálogo de productos con talles, categorías y auditoría (`creadoPor`).
- `POST /products` — Crear nuevo producto con imagen multipart (`FileInterceptor` a Cloudinary/Memory).
- `PATCH /products/:id` — Actualizar datos, talles o foto del producto.
- `DELETE /products/:id` — Eliminar producto del inventario.

### 🛒 Ventas & Devoluciones (`/sales`)
- `POST /sales` — Registrar nueva venta (deduce stock general y por talles).
- `GET /sales` — Obtener historial de ventas del negocio.
- `PATCH /sales/:id/refund` — Procesar devolución de venta con restitución inmediata de stock.

---

## 📄 Licencia & Créditos

Desarrollado para **Los Siete Díaz**. Todos los derechos reservados.
