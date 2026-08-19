"use client"

import React, { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/lib/toast-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Plus, Pencil, Trash2, X, Loader2, Sparkles, CheckCircle2, Calendar, Package } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dropzone } from "@/components/ui/dropzone"

export default function VendedorProductosPage() {
  const toast = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoryId: "",
  })

  const [talles, setTalles] = useState<{ talle: string; stock: number }[]>([])
  const [newTalle, setNewTalle] = useState({ talle: "", stock: "" })

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

  const loadCategories = async () => {
    try {
      const data = await api.getCategories()
      setCategories(data)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const handleAddTalle = () => {
    if (newTalle.talle.trim() && newTalle.stock !== "") {
      const normalizedTalle = newTalle.talle.trim().toUpperCase()
      const newStock = Math.max(0, Number(newTalle.stock) || 0)

      const existingIndex = talles.findIndex(
        (t) => t.talle.trim().toUpperCase() === normalizedTalle
      )

      let updatedTalles = []
      if (existingIndex > -1) {
        updatedTalles = [...talles]
        updatedTalles[existingIndex] = { talle: normalizedTalle, stock: newStock }
        toast.info(`Stock de talle ${normalizedTalle} actualizado a ${newStock}`, "Talle Actualizado")
      } else {
        updatedTalles = [...talles, { talle: normalizedTalle, stock: newStock }]
        toast.info(`Talle ${normalizedTalle} añadido (${newStock} unidades)`, "Talle Agregado")
      }

      setTalles(updatedTalles)

      const totalStock = updatedTalles.reduce((sum, t) => sum + t.stock, 0)
      setFormData((prev) => ({ ...prev, stock: String(totalStock) }))

      setNewTalle({ talle: "", stock: "" })
    }
  }

  const handleRemoveTalle = (index: number) => {
    const updatedTalles = talles.filter((_, i) => i !== index)
    setTalles(updatedTalles)

    if (updatedTalles.length > 0) {
      const totalStock = updatedTalles.reduce((sum, t) => sum + t.stock, 0)
      setFormData((prev) => ({ ...prev, stock: String(totalStock) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const calculatedStock =
        talles.length > 0
          ? talles.reduce((sum, t) => sum + t.stock, 0)
          : Number(formData.stock) || 0

      const form = new FormData()
      form.append("nombre", formData.nombre)
      form.append("descripcion", formData.descripcion)
      form.append("precio", formData.precio)
      form.append("stock", String(calculatedStock))

      if (formData.categoryId && formData.categoryId !== "0") {
        form.append("categoryId", formData.categoryId)
      }

      if (talles.length > 0) {
        form.append("talles", JSON.stringify(talles))
      }

      if (imageFile) {
        form.append("image", imageFile)
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, form)
        toast.success("Producto actualizado correctamente", "Producto Actualizado")
      } else {
        await api.createProduct(form)
        toast.success("Nuevo producto añadido al inventario", "Producto Creado")
      }

      setIsDialogOpen(false)
      setEditingProduct(null)
      setImageFile(null)
      setImagePreview("")
      setFormData({ nombre: "", descripcion: "", precio: "", stock: "", categoryId: "" })
      setTalles([])
      loadProducts()
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el producto", "Error")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    const productTalles = product.talles
      ? product.talles.map((t: any) => ({ talle: t.talle, stock: t.stock }))
      : []

    const calculatedStock =
      productTalles.length > 0
        ? productTalles.reduce((sum: number, t: any) => sum + t.stock, 0)
        : product.stock

    setFormData({
      nombre: product.nombre || "",
      descripcion: product.descripcion || "",
      precio: product.precio ? String(product.precio) : "",
      stock: String(calculatedStock || 0),
      categoryId: product.categoryId || product.category?.id || "0",
    })
    setTalles(productTalles)
    setImageFile(null)
    setImagePreview(product.imagenUrl || "")
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await api.deleteProduct(id)
      toast.success("Producto eliminado del inventario", "Eliminado")
      loadProducts()
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el producto", "Error")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-blue-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-sm font-medium">Cargando catálogo de productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-100 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-200 to-cyan-400 bg-clip-text text-transparent">
            Cargar & Gestionar Productos
          </h1>
          <p className="text-xs text-blue-300/70">Añade mercadería al inventario del negocio</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingProduct(null)
                setFormData({ nombre: "", descripcion: "", precio: "", stock: "", categoryId: "" })
                setTalles([])
                setImageFile(null)
                setImagePreview("")
              }}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold text-white shadow-lg shadow-blue-600/30 hover:brightness-110 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>

          <DialogContent className="border-blue-500/20 bg-[#0d071b] text-slate-100 max-w-lg backdrop-blur-2xl max-h-[85vh] overflow-y-auto pr-3">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white via-blue-200 to-cyan-400 bg-clip-text text-transparent">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-blue-200">Nombre del Producto *</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ej. Remera Estampada"
                  className="border-blue-500/20 bg-violet-950/40 text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-blue-200">Descripción</Label>
                <Input
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalles del producto..."
                  className="border-blue-500/20 bg-violet-950/40 text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-blue-200">Categoría</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger className="border-blue-500/20 bg-violet-950/40 text-xs text-white">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent className="bg-violet-950 border-violet-800 text-white">
                    <SelectItem value="0">Sin categoría</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-blue-200">Precio *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    required
                    className="border-blue-500/20 bg-violet-950/40 text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-blue-200 flex items-center justify-between">
                    <span>Stock General *</span>
                    {talles.length > 0 && (
                      <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-700/40">
                        Auto por talles
                      </span>
                    )}
                  </Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    disabled={talles.length > 0}
                    readOnly={talles.length > 0}
                    className={`border-blue-500/20 text-xs text-white ${
                      talles.length > 0
                        ? "bg-cyan-950/20 border-cyan-500/30 text-cyan-200 font-bold"
                        : "bg-violet-950/40"
                    }`}
                  />
                </div>
              </div>

              {/* Talles Section */}
              <div className="flex flex-col gap-2 rounded-xl border border-blue-500/20 bg-violet-900/10 p-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-blue-200 font-semibold">Talles y Cantidades</Label>
                  {talles.length > 0 && (
                    <span className="text-[11px] text-cyan-300 font-semibold">
                      Total por talles: {talles.reduce((sum, t) => sum + t.stock, 0)} u.
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Ej: 4, S, M, L"
                    value={newTalle.talle}
                    onChange={(e) => setNewTalle({ ...newTalle, talle: e.target.value })}
                    className="border-blue-500/20 bg-violet-950/40 text-xs text-white"
                  />
                  <Input
                    type="number"
                    min="0"
                    placeholder="Cantidad"
                    value={newTalle.stock}
                    onChange={(e) => setNewTalle({ ...newTalle, stock: e.target.value })}
                    className="w-24 border-blue-500/20 bg-violet-950/40 text-xs text-white"
                  />
                  <Button
                    type="button"
                    onClick={handleAddTalle}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:brightness-110 font-semibold text-xs"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Cargar
                  </Button>
                </div>

                {talles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {talles.map((t, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1.5 rounded-lg bg-violet-950/80 border border-cyan-500/40 px-2.5 py-1 text-xs font-bold text-white shadow-md"
                      >
                        <span className="text-cyan-300 font-mono">{t.talle}:</span>
                        <span>{t.stock} u.</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTalle(index)}
                          className="text-rose-400 hover:text-rose-300 ml-1"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Cloudinary Dropzone Component */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-blue-200 font-semibold">Imagen del Producto (Cloudinary)</Label>
                <Dropzone
                  onFileSelect={(file) => {
                    setImageFile(file)
                    if (file) {
                      setImagePreview(URL.createObjectURL(file))
                    } else {
                      setImagePreview("")
                    }
                  }}
                  currentImage={imagePreview}
                  label={formData.nombre || "Imagen del Producto"}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold text-white rounded-xl"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Guardando...
                  </>
                ) : editingProduct ? (
                  "Guardar Cambios"
                ) : (
                  "Crear Producto"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-2xl border border-blue-500/20 bg-violet-950/30 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-blue-500/40 flex flex-col justify-between"
          >
            <div>
              {product.imagenUrl && (
                <div className="relative h-44 w-full mb-4 rounded-xl overflow-hidden border border-blue-500/20">
                  <Image src={product.imagenUrl} alt={product.nombre} fill className="object-cover" unoptimized />
                </div>
              )}

              <h3 className="text-base font-extrabold text-white">{product.nombre}</h3>
              {product.descripcion && <p className="text-xs text-blue-300/70 mt-1 line-clamp-2">{product.descripcion}</p>}
              {product.category && (
                <span className="inline-block text-[11px] font-semibold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-800/30 mt-2">
                  {product.category.nombre}
                </span>
              )}

              <div className="flex items-center justify-between mt-4 border-t border-blue-500/10 pt-3">
                <span className="text-xl font-black text-white">${Number(product.precio).toFixed(2)}</span>
                <span className="text-xs text-blue-300/80 font-medium">
                  Stock Total: <strong className="text-white">{product.stock}</strong>
                </span>
              </div>

              {product.talles && product.talles.length > 0 && (
                <div className="mt-3 text-xs">
                  <span className="text-blue-300/60 font-semibold">Talles:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.talles.map((t: any) => (
                      <span key={t.id} className="bg-violet-900/30 text-blue-200 border border-blue-800/30 px-2 py-0.5 rounded-lg text-[11px]">
                        {t.talle}: {t.stock}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Creation Date & Time */}
              <div className="mt-3 pt-2 border-t border-blue-500/10 flex items-center justify-between text-[11px] text-blue-300/60 font-medium">
                <span className="flex items-center gap-1.5 font-mono">
                  <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                  Cargado: {product.createdAt ? format(new Date(product.createdAt), "dd/MM/yyyy 'a las' HH:mm 'hs'", { locale: es }) : "Fecha no disp."}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-5 pt-3 border-t border-blue-500/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(product)}
                className="flex-1 text-xs text-blue-200 bg-blue-900/20 hover:bg-blue-900/40 rounded-xl border border-blue-700/30"
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" /> Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(product.id)}
                disabled={deletingId === product.id}
                className="flex-1 text-xs text-rose-300 bg-rose-950/20 hover:bg-rose-900/30 rounded-xl border border-rose-800/30"
              >
                {deletingId === product.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
                Eliminar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
