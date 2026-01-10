"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, ShoppingCart, Package2 } from "lucide-react"
import Image from "next/image"

export default function VendedorPage() {
  const [products, setProducts] = useState<any[]>([])
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

  // Función para cargar productos
  const loadProducts = async () => {
    try {
      const data = await api.getProducts()
      setProducts(data)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const addToCart = (product: any) => {
    const existing = cart.find((item) => item.productoId === product.id)
    if (existing) {
      setCart(
        cart.map((item) =>
          item.productoId === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      )
    } else {
      setCart([...cart, { productoId: product.id, cantidad: 1, producto: product }])
    }
  }

  const removeFromCart = (productoId: string) => {
    setCart(cart.filter((item) => item.productoId !== productoId))
  }

  const updateQuantity = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(productoId)
    } else {
      setCart(
        cart.map((item) => (item.productoId === productoId ? { ...item, cantidad } : item))
      )
    }
  }

  // Crear venta y recargar productos
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
        })),
      })
      setCart([])
      await loadProducts() // 🔄 recargar productos para actualizar stock
      alert("Venta creada exitosamente")
    } catch (error: any) {
      alert(error.message || "Error al crear la venta")
    }
  }

  // Crear encargo y recargar productos
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
      await loadProducts() // 🔄 recargar productos para reflejar cambios en stock si corresponde
      alert("Encargo creado exitosamente")
    } catch (error: any) {
      alert(error.message || "Error al crear el encargo")
    }
  }

  const total = cart.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0)

  if (loading) {
    return <div className="text-muted-foreground">Cargando productos...</div>
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Productos */}
      <div className="lg:col-span-2">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Nueva Venta</h1>
          <p className="text-muted-foreground">Selecciona productos para agregar al carrito</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {products.map((product) => (
            <Card key={product.id} className="border-border bg-card">
              <CardHeader>
                {product.imagenUrl && (
                  <div className="relative mb-4 h-32 w-full overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={product.imagenUrl || "/placeholder.svg"}
                      alt={product.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <CardTitle className="text-foreground">{product.nombre}</CardTitle>
                {product.descripcion && (
                  <p className="text-sm text-muted-foreground">{product.descripcion}</p>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">${product.precio}</span>
                  <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedProduct(product)
                      setIsOrderDialogOpen(true)
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Package2 className="h-4 w-4" />
                    Encargar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Carrito */}
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
                    <div key={item.productoId} className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.producto.nombre}</p>
                        <p className="text-xs text-muted-foreground">${item.producto.precio} c/u</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={item.cantidad}
                          onChange={(e) =>
                            updateQuantity(item.productoId, Number.parseInt(e.target.value))
                          }
                          className="w-16 border-border bg-input"
                        />
                        <Button
                          onClick={() => removeFromCart(item.productoId)}
                          variant="ghost"
                          size="sm"
                          className="flex items-center justify-center text-destructive"
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
                <Button
                  onClick={handleCreateSale}
                  className="w-full flex items-center justify-center bg-primary hover:bg-primary/90"
                >
                  Completar Venta
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Encargo */}
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
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 flex items-center justify-center"
            >
              Crear Encargo
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
