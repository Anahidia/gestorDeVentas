"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/lib/toast-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, ShoppingCart, Package2, Search, Filter, Trash2, CheckCircle2, DollarSign, Clock, Tag, Loader2 } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function VendedorPage() {
  const toast = useToast()
  const { user, refreshProfile } = useAuth()
  const [loadingShift, setLoadingShift] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingSale, setSubmittingSale] = useState(false)
  const [submittingOrder, setSubmittingOrder] = useState(false)

  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [orderForm, setOrderForm] = useState({
    cantidad: "1",
    talle: "",
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
      setLoading(true)
      const data = await api.getProducts(filters)
      setProducts(data)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: any, talle?: string) => {
    const key = `${product.id}-${talle || "sin-talle"}`
    const existingIndex = cart.findIndex((item) => item.key === key)

    if (existingIndex > -1) {
      const newCart = [...cart]
      newCart[existingIndex].cantidad += 1
      setCart(newCart)
    } else {
      setCart([...cart, { key, producto: product, talle, cantidad: 1 }])
    }
    toast.info(`Agregado: ${product.nombre} ${talle ? `(${talle})` : ""}`)
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
    if (cart.length === 0) return

    setSubmittingSale(true)
    try {
      const items = cart.map((item) => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        talle: item.talle,
      }))

      await api.createSale({ items })
      toast.success("¡Venta registrada y comprobante generado con éxito!", "Venta Exitosa")
      setCart([])
      loadProducts()
    } catch (error: any) {
      toast.error(error.message || "Error al realizar la venta", "Error en Venta")
    } finally {
      setSubmittingSale(false)
    }
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    setSubmittingOrder(true)
    try {
      await api.createOrder({
        productoId: selectedProduct.id,
        cantidad: Number.parseInt(orderForm.cantidad),
        talle: orderForm.talle || undefined,
        clienteNombre: orderForm.clienteNombre,
        clienteTelefono: orderForm.clienteTelefono,
        notas: orderForm.notas,
      })

      toast.success("¡Encargo reservado exitosamente!", "Encargo Guardado")
      setIsOrderDialogOpen(false)
      setSelectedProduct(null)
      setOrderForm({ cantidad: "1", talle: "", clienteNombre: "", clienteTelefono: "", notas: "" })
    } catch (error: any) {
      toast.error(error.message || "Error al crear el encargo", "Error en Encargo")
    } finally {
      setSubmittingOrder(false)
    }
  }

  const handleClockIn = async () => {
    if (!user?.id) return
    setLoadingShift(true)
    try {
      await api.toggleUserShift(user.id)
      await refreshProfile()
      toast.success("¡Entrada laboral (fichaje) registrada correctamente!", "Fichaje Registrado")
    } catch (err: any) {
      toast.error(err.message || "Error al fichar entrada", "Error")
    } finally {
      setLoadingShift(false)
    }
  }

  const total = cart.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0)

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-100 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-200 to-cyan-400 bg-clip-text text-transparent">
          Punto de Venta (P.O.S.)
        </h1>
        <p className="text-xs text-blue-300/70">Selecciona productos, gestiona el carrito o crea encargos de clientes</p>
      </div>

      {/* Fichaje Laboral Top Banner */}
      {!user?.inShift && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 px-5 backdrop-blur-xl shadow-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                👋 ¡Hola {user?.nombre}! Tienes pendiente marcar tu Fichaje Laboral
              </h4>
              <p className="text-xs text-emerald-200/70">
                Registra tu horario de entrada de hoy para notificar a administración
              </p>
            </div>
          </div>
          <Button
            onClick={handleClockIn}
            disabled={loadingShift}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 hover:brightness-110"
          >
            {loadingShift ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Clock className="h-4 w-4 mr-2" />}
            Fichar Entrada Ahora
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Products Grid & Search */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Search Bar & Filters Header */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400" />
              <Input
                placeholder="Buscar por nombre de producto..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="h-10 border-blue-500/20 bg-violet-950/40 pl-10 text-xs text-white placeholder:text-blue-300/40 rounded-xl"
              />
            </div>

            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className={`gap-2 text-xs font-semibold rounded-xl border ${
                showFilters || filters.categoryId || filters.talle
                  ? "border-cyan-500/40 bg-cyan-950/40 text-cyan-200"
                  : "border-blue-500/20 bg-violet-950/30 text-blue-200/80 hover:bg-violet-900/30"
              }`}
            >
              <Filter className="h-4 w-4" /> Filtros
            </Button>
          </div>

          {/* Filter Bar */}
          {showFilters && (
            <div className="grid gap-3 sm:grid-cols-2 rounded-2xl border border-blue-500/20 bg-violet-950/30 p-4 shadow-xl backdrop-blur-xl">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-blue-200/80">Filtrar por Categoría</Label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(val) => setFilters({ ...filters, categoryId: val === "all" ? "" : val })}
                >
                  <SelectTrigger className="h-9 text-xs border-blue-500/20 bg-violet-950/60 text-white">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent className="bg-violet-950 border-violet-800 text-white">
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-xs text-blue-200/80">Filtrar por Talle</Label>
                <Input
                  placeholder="Ej. S, M, L, XL"
                  value={filters.talle}
                  onChange={(e) => setFilters({ ...filters, talle: e.target.value })}
                  className="h-9 text-xs border-blue-500/20 bg-violet-950/60 text-white placeholder:text-blue-300/30 rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="flex h-64 items-center justify-center text-blue-300">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
                <p className="text-xs font-medium">Cargando catálogo de productos...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {products.length === 0 ? (
                <p className="text-xs text-blue-300/60 col-span-full">No se encontraron productos.</p>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-blue-500/20 bg-violet-950/30 p-4 shadow-xl backdrop-blur-xl transition-all hover:border-blue-500/40 flex flex-col justify-between"
                  >
                    <div>
                      {product.imagenUrl && (
                        <div className="relative h-36 w-full mb-3 rounded-xl overflow-hidden border border-blue-500/20">
                          <Image src={product.imagenUrl} alt={product.nombre} fill className="object-cover" unoptimized />
                        </div>
                      )}

                      <h3 className="text-sm font-bold text-white">{product.nombre}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-black text-cyan-300">${Number(product.precio).toFixed(2)}</span>
                        <span className="text-xs text-blue-200/70">Stock: <strong className="text-white">{product.stock}</strong></span>
                      </div>

                      {/* Optional Sizes Badges */}
                      {product.talles && product.talles.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {product.talles.map((t: any) => (
                            <button
                              key={t.id}
                              onClick={() => addToCart(product, t.talle)}
                              className="text-[11px] font-semibold bg-blue-950/40 text-blue-200 border border-blue-700/40 hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded-lg transition-colors"
                            >
                              + {t.talle} ({t.stock})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-blue-500/10">
                      {(!product.talles || product.talles.length === 0) && (
                        <Button
                          onClick={() => addToCart(product)}
                          size="sm"
                          className="flex-1 text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:brightness-110 rounded-xl"
                        >
                          <ShoppingCart className="h-3.5 w-3.5 mr-1" /> Vender
                        </Button>
                      )}

                      <Button
                        onClick={() => {
                          setSelectedProduct(product)
                          setOrderForm({ ...orderForm, talle: product.talles?.[0]?.talle || "" })
                          setIsOrderDialogOpen(true)
                        }}
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-xs font-semibold text-violet-300 border border-violet-500/30 bg-violet-950/30 hover:bg-violet-900/40 rounded-xl"
                      >
                        <Package2 className="h-3.5 w-3.5 mr-1" /> Encargar
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Column: Active Cart / Ticket */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-cyan-500/30 bg-violet-950/40 p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-blue-500/10 pb-3">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-cyan-400" /> Carrito de Venta
              </h2>
              <span className="text-xs font-semibold text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-700/40">
                {cart.length} ítems
              </span>
            </div>

            {cart.length === 0 ? (
              <p className="text-xs text-blue-300/60 py-8 text-center">
                El carrito está vacío. Haz clic en "Vender" o en un talle para agregar productos.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-2 rounded-xl bg-violet-900/20 p-3 border border-blue-800/20 text-xs"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-white">
                          {item.producto.nombre}
                          {item.talle && <span className="text-cyan-300 font-mono"> ({item.talle})</span>}
                        </p>
                        <p className="text-[11px] text-blue-200/60">${Number(item.producto.precio).toFixed(2)} c/u</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => updateQuantity(item.key, Number.parseInt(e.target.value) || 1)}
                          className="h-7 w-14 text-xs bg-violet-950 text-white border-blue-500/30 text-center font-bold"
                        />
                        <button
                          onClick={() => removeFromCart(item.key)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-blue-500/20 pt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-lg font-black">
                    <span className="text-white">Total a Cobrar:</span>
                    <span className="text-cyan-300">${total.toFixed(2)}</span>
                  </div>

                  <Button
                    onClick={handleCreateSale}
                    disabled={submittingSale}
                    className="h-11 w-full font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 hover:brightness-110 rounded-xl"
                  >
                    {submittingSale ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Registrando Venta...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" /> Completar Venta
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Creation Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="border-blue-500/20 bg-[#0d071b] text-slate-100 max-w-md backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-400 bg-clip-text text-transparent">
              Crear Encargo para Cliente
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateOrder} className="flex flex-col gap-4 mt-2">
            <p className="text-xs text-blue-300/80 font-semibold">
              Producto: <strong className="text-white">{selectedProduct?.nombre}</strong>
            </p>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-blue-200">Cantidad *</Label>
              <Input
                type="number"
                min="1"
                value={orderForm.cantidad}
                onChange={(e) => setOrderForm({ ...orderForm, cantidad: e.target.value })}
                required
                className="border-blue-500/20 bg-violet-950/40 text-xs text-white"
              />
            </div>

            {selectedProduct?.talles && selectedProduct.talles.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-blue-200">Talle (Opcional)</Label>
                <Select
                  value={orderForm.talle}
                  onValueChange={(val) => setOrderForm({ ...orderForm, talle: val })}
                >
                  <SelectTrigger className="border-blue-500/20 bg-violet-950/40 text-xs text-white">
                    <SelectValue placeholder="Seleccionar talle" />
                  </SelectTrigger>
                  <SelectContent className="bg-violet-950 border-violet-800 text-white">
                    {selectedProduct.talles.map((t: any) => (
                      <SelectItem key={t.id} value={t.talle}>
                        {t.talle} (Stock disponible: {t.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-blue-200">Nombre del Cliente *</Label>
              <Input
                placeholder="Ej. María López"
                value={orderForm.clienteNombre}
                onChange={(e) => setOrderForm({ ...orderForm, clienteNombre: e.target.value })}
                required
                className="border-blue-500/20 bg-violet-950/40 text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-blue-200">Teléfono del Cliente</Label>
              <Input
                placeholder="+54 9 ..."
                value={orderForm.clienteTelefono}
                onChange={(e) => setOrderForm({ ...orderForm, clienteTelefono: e.target.value })}
                className="border-blue-500/20 bg-violet-950/40 text-xs text-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-blue-200">Notas / Seña</Label>
              <Input
                placeholder="Ej. Dejó $500 de seña, retira el viernes"
                value={orderForm.notas}
                onChange={(e) => setOrderForm({ ...orderForm, notas: e.target.value })}
                className="border-blue-500/20 bg-violet-950/40 text-xs text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={submittingOrder}
              className="mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white rounded-xl"
            >
              {submittingOrder ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Guardando Encargo...
                </>
              ) : (
                "Reservar Encargo"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
