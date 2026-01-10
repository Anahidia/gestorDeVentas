// Tipos compartidos para el frontend

export interface User {
  id: string
  nombre: string
  email: string
  role: "admin" | "vendedor"
  createdAt: string
}

export interface Product {
  id: string
  nombre: string
  descripcion?: string
  precio: number
  stock: number
  stockReservado: number
  imagenUrl?: string
  createdAt: string
  updatedAt: string
}

export interface Sale {
  id: string
  vendedor: User
  vendedorId: string
  total: number
  status: "completada" | "cancelada"
  items: SaleItem[]
  createdAt: string
  updatedAt: string
}

export interface SaleItem {
  id: string
  producto: Product
  productoId: string
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface Order {
  id: string
  vendedor: User
  vendedorId: string
  producto: Product
  productoId: string
  cantidad: number
  clienteNombre?: string
  clienteTelefono?: string
  notas?: string
  status: "activo" | "completado" | "cancelado" | "expirado"
  fechaExpiracion: string
  createdAt: string
  updatedAt: string
}

export interface SalesStats {
  totalVentas: number
  ventasHoy: number
  ventasSemana: number
  ventasMes: number
  productoMasVendido?: {
    producto: Product
    totalVendido: number
  }
}

export interface CreateSaleDto {
  items: {
    productoId: string
    cantidad: number
  }[]
}

export interface CreateOrderDto {
  productoId: string
  cantidad: number
  clienteNombre?: string
  clienteTelefono?: string
  notas?: string
}

export interface CreateProductDto {
  nombre: string
  descripcion?: string
  precio: number
  stock: number
  imagenUrl?: string
}

export interface UpdateProductDto {
  nombre?: string
  descripcion?: string
  precio?: number
  stock?: number
  imagenUrl?: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  nombre: string
  email: string
  password: string
  role?: "admin" | "vendedor"
}

export interface AuthResponse {
  access_token: string
  user: User
}
