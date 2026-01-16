const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
  }

  getToken() {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("token")
    }
    return this.token
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken()

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Error desconocido",
      }))
      throw new Error(error.message || "Error en la petición")
    }

    // Para DELETE o respuestas sin body
    if (response.status === 204) {
      return null
    }

    return response.json()
  }

  // ================= AUTH =================
  async login(email: string, password: string) {
    const data = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    this.setToken(data.access_token)
    return data
  }

  async register(email: string, password: string, nombre: string, role: string) {
    const data = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, nombre, role }),
    })
    this.setToken(data.access_token)
    return data
  }

  async getProfile() {
    return this.request("/auth/profile")
  }

  // ================= PRODUCTS =================
  async getProducts(filters?: { categoryId?: string; search?: string; talle?: string }) {
    const params = new URLSearchParams()
    if (filters?.categoryId) params.append("categoryId", filters.categoryId)
    if (filters?.search) params.append("search", filters.search)
    if (filters?.talle) params.append("talle", filters.talle)

    const queryString = params.toString()
    return this.request(`/products${queryString ? `?${queryString}` : ""}`)
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`)
  }

  async createProduct(data: any) {
    return this.request("/products", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateProduct(id: string, data: any) {
    return this.request(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    })
  }

  async updateStock(id: string, cantidad: number) {
    return this.request(`/products/${id}/stock`, {
      method: "PATCH",
      body: JSON.stringify({ cantidad }),
    })
  }

  // ================= CATEGORIES =================
  async getCategories() {
    return this.request("/categories")
  }

  async getCategory(id: string) {
    return this.request(`/categories/${id}`)
  }

  async createCategory(data: { nombre: string }) {
    return this.request("/categories", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateCategory(id: string, data: { nombre: string }) {
    return this.request(`/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, {
      method: "DELETE",
    })
  }

  // ================= SALES =================
  async getSales() {
    return this.request("/sales")
  }

  async getMySales() {
    return this.request("/sales/my-sales")
  }

  async getSale(id: string) {
    return this.request(`/sales/${id}`)
  }

  async createSale(data: any) {
    return this.request("/sales", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async cancelSale(id: string) {
    return this.request(`/sales/${id}/cancel`, {
      method: "PATCH",
    })
  }

  async getSalesStats() {
    return this.request("/sales/stats")
  }

  // ================= ORDERS =================
  async getOrders() {
    return this.request("/orders")
  }

  async getActiveOrders() {
    return this.request("/orders/active")
  }

  async getMyOrders() {
    return this.request("/orders/my-orders")
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`)
  }

  async createOrder(data: any) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async completeOrder(id: string) {
    return this.request(`/orders/${id}/complete`, {
      method: "PATCH",
    })
  }

  async cancelOrder(id: string) {
    return this.request(`/orders/${id}/cancel`, {
      method: "PATCH",
    })
  }

  async getOrdersStats() {
    return this.request("/orders/stats")
  }

  // ================= USERS =================
  async getUsers() {
    return this.request("/users")
  }
}

export const api = new ApiClient()
