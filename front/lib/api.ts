const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

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

    const headers = new Headers(options.headers)
    headers.set("Content-Type", "application/json")
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Error desconocido" }))
      throw new Error(error.message || "Error en la petición")
    }

    return response.json()
  }

  // Auth
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

  // Products
  async getProducts() {
    return this.request("/products")
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

  // Sales
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

  // Orders
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

  // Users
  async getUsers() {
    return this.request("/users")
  }
}

export const api = new ApiClient()
