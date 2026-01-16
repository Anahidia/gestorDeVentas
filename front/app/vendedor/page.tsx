"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, ShoppingCart, Package2, Search, Filter } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function VendedorPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [orderForm, setOrderForm] = useState({
    cantidad: "1",
    clienteNombre: "",
    clienteTelefono: "",
    notas: "",
  })

  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    talle: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadProducts()
  }, [filters])

  const loadCategories = async () => {
    try {
      const data = await api.getCategories()
      setCategories(data)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const loadProducts = async () => {
    try {
      const data = await api.getProducts(filters)
      setProducts(data)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: any, selectedTalle?: string) => {
    const key = selectedTalle ? `${product.id}-${selectedTalle}` : product.id
    const existing = cart.find((item) => item.key === key)

    if (existing) {
      setCart(cart.map((item) => (item.key === key ? { ...item, cantidad: item.cantidad + 1 } : item)))
    } else {
      setCart([
        ...cart,
        {
          key,
          productoId: product.id,
          cantidad: 1,
          producto: product,
          talle: selectedTalle,
        },
      ])
    }
  }

  const removeFromCart = (key: string) => {
    setCart(cart.filter((item) => item.key !== key))
  }

  const updateQuantity = (key: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(key)
    } else {
      setCart(cart.map((item) => (item.key === key ? { ...item, cantidad } : item)))
    }
  }

  const handleCreateSale = async () => {
    if (cart.length === 0) {
      alert("El carrito está vacío")
      return
    }

    try {
      await api.createSale({
        items: cart.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          talle: item.talle,
        })),
      })
      setCart([])
      alert("Venta creada exitosamente")
      loadProducts()
    } catch (error: any) {
      alert(error.message || "Error al crear la venta")
    }
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createOrder({
        productoId: selectedProduct.id,
        cantidad: Number.parseInt(orderForm.cantidad),
        clienteNombre: orderForm.clienteNombre,
        clienteTelefono: orderForm.clienteTelefono,
        notas: orderForm.notas,
      })
      setIsOrderDialogOpen(false)
      setOrderForm({ cantidad: "1", clienteNombre: "", clienteTelefono: "", notas: "" })
      alert("Encargo creado exitosamente")
    } catch (error: any) {
      alert(error.message || "Error al crear el encargo")
    }
  }

  const total = cart.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0)

  const getAllTalles = () => {
    const tallesSet = new Set<string>()
    products.forEach((product) => {
      product.talles?.forEach((t: any) => tallesSet.add(t.talle))
    })
    return Array.from(tallesSet).sort()
  }

  if (loading) {
    return <div className="text-muted-foreground">Cargando productos...</div>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Nueva Venta</h1>
          <p className="text-muted-foreground">Selecciona productos para agregar al carrito</p>
        </div>

        <div className="mb-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {showFilters && (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Categoría</Label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) => setFilters({ ...filters, categoryId: value === "all" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Talle</Label>
                <Select
                  value={filters.talle}
                  onValueChange={(value) => setFilters({ ...filters, talle: value === "all" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los talles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los talles</SelectItem>
                    {getAllTalles().map((talle) => (
                      <SelectItem key={talle} value={talle}>
                        {talle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addToCart}
              onCreateOrder={() => {
                setSelectedProduct(product)
                setIsOrderDialogOpen(true)
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <Card className="sticky top-6 border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <ShoppingCart className="h-5 w-5" />
              Carrito
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {cart.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">El carrito está vacío</p>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  {cart.map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {item.producto.nombre}
                          {item.talle && <span className="text-primary"> ({item.talle})</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">${item.producto.precio} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={item.cantidad}
                          onChange={(e) => updateQuantity(item.key, Number.parseInt(e.target.value))}
                          className="w-16 border-border bg-input"
                        />
                        <Button
                          onClick={() => removeFromCart(item.key)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span className="text-foreground">Total:</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
                <Button onClick={handleCreateSale} className="w-full bg-primary hover:bg-primary/90">
                  Completar Venta
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">Crear Encargo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOrder} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={orderForm.cantidad}
                onChange={(e) => setOrderForm({ ...orderForm, cantidad: e.target.value })}
                required
                className="border-border bg-input"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="clienteNombre">Nombre del Cliente</Label>
              <Input
                id="clienteNombre"
                value={orderForm.clienteNombre}
                onChange={(e) => setOrderForm({ ...orderForm, clienteNombre: e.target.value })}
                className="border-border bg-input"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="clienteTelefono">Teléfono del Cliente</Label>
              <Input
                id="clienteTelefono"
                value={orderForm.clienteTelefono}
                onChange={(e) => setOrderForm({ ...orderForm, clienteTelefono: e.target.value })}
                className="border-border bg-input"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notas">Notas</Label>
              <Input
                id="notas"
                value={orderForm.notas}
                onChange={(e) => setOrderForm({ ...orderForm, notas: e.target.value })}
                className="border-border bg-input"
              />
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Crear Encargo
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProductCard({
  product,
  onAddToCart,
  onCreateOrder,
}: {
  product: any
  onAddToCart: (product: any, talle?: string) => void
  onCreateOrder: () => void
}) {
  const [selectedTalle, setSelectedTalle] = useState<string>("")
  const hasTalles = product.talles && product.talles.length > 0

  const getAvailableStock = () => {
    if (hasTalles && selectedTalle) {
      const talle = product.talles.find((t: any) => t.talle === selectedTalle)
      return talle?.stock || 0
    }
    return product.stock
  }

  const handleAddToCart = () => {
    if (hasTalles && !selectedTalle) {
      alert("Por favor selecciona un talle")
      return
    }
    onAddToCart(product, selectedTalle)
  }

  const availableStock = getAvailableStock()

  return (
    <Card className="border-border bg-card">
      <CardHeader>
       {product.imagenUrl && (
  <div className="relative mb-4 h-32 w-full overflow-hidden rounded-lg bg-muted">
    {product.imagenUrl.includes("res.cloudinary.com") ? (
      <Image
        src={product.imagenUrl}
        alt={product.nombre}
        fill
        className="object-cover"
      />
    ) : (
      <img
        src={product.imagenUrl}
        alt={product.nombre}
        className="h-full w-full object-cover"
      />
    )}
  </div>
)}

      
        <CardTitle className="text-foreground">{product.nombre}</CardTitle>
        {product.descripcion && <p className="text-sm text-muted-foreground">{product.descripcion}</p>}
        {product.category && <span className="text-xs text-primary">{product.category.nombre}</span>}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">${product.precio}</span>
          <span className="text-sm text-muted-foreground">Stock: {availableStock}</span>
        </div>

        {hasTalles && (
          <div>
            <Label className="text-xs">Seleccionar talle</Label>
            <Select value={selectedTalle} onValueChange={setSelectedTalle}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Elige un talle" />
              </SelectTrigger>
              <SelectContent>
                {product.talles.map((t: any) => (
                  <SelectItem key={t.id} value={t.talle} disabled={t.stock === 0}>
                    {t.talle} - Stock: {t.stock}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleAddToCart} disabled={availableStock === 0} size="sm" className="flex-1 gap-2">
            <Plus className="h-4 w-4" />
            Agregar
          </Button>
          <Button onClick={onCreateOrder} variant="outline" size="sm" className="flex-1 gap-2 bg-transparent">
            <Package2 className="h-4 w-4" />
            Encargar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
