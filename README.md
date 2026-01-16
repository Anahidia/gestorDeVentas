# 🏷️ Los Siete Díaz - Sistema de Ventas y Encargos

Proyecto **fullstack** de gestión de productos, ventas y encargos, con control de stock y estadísticas.  
Backend en **NestJS** + **TypeORM** y frontend en **Next.js** + **TailwindCSS**.

---

## ✨ Características

- 🛒 Carrito de compras y creación de ventas
- 📦 Creación de encargos con datos de cliente
- 📊 Dashboard de estadísticas para administradores
- 🔐 Autenticación y roles con JWT
- ☁️ Integración con **Cloudinary** para imágenes de productos
- 💻 Frontend responsive con componentes reutilizables

---

## 🗂️ Estructura
losSieteDiaz/

├─ back/ # Backend NestJS

├─ front/ # Frontend Next.js

└─ README.md


---

## ⚡ Requisitos

- Node.js >= 18
- PostgreSQL
- Git
- npm o yarn
- Cuenta de Cloudinary (opcional)

---

## 🛠️ Configuración

### Backend

```bash
cd back
cp .env.example .env
npm install
npm run start:dev
```
### Frontend
```bash
cd front
cp .env.example .env.local
npm install
npm run dev
```
## 🚀 Uso
- Abrir frontend en http://localhost:3000

- Iniciar sesión o registrarse

- Agregar productos al carrito o crear encargos
  
- Completar ventas y revisar estadísticas (solo admin)


## 📦 Dependencias principales
**Backend** : NestJS, TypeORM, PostgreSQL, class-validator, JWT.

**Frontend** : Next.js, React, TailwindCSS, Radix UI, Lucide Icons
