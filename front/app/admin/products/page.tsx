"use client"

import React, { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/lib/toast-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProductosPage() {
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
    if (newTalle.talle && newTalle.stock) {
      setTalles([...talles, { talle: newTalle.talle, stock: Number(newTalle.stock) }])
      setNewTalle({ talle: "", stock: "" })
    }
  }

  const handleRemoveTalle = (index: number) => {
    setTalles(talles.filter((_, i) => i !== index))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const form = new FormData()
      form.append("nombre", formData.nombre)
      form.append("descripcion", formData.descripcion)
      form.append("precio", formData.precio)
      form.append("stock", formData.stock)

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
    setFormData({
      nombre: product.nombre || "",
      descripcion: product.descripcion || "",
      precio: product.precio ? String(product.precio) : "",
      stock: product.stock ? String(product.stock) : "",
      categoryId: product.categoryId || product.category?.id || "0",
    })
    setTalles(
      product.talles
        ? product.talles.map((t: any) => ({ talle: t.talle, stock: t.stock }))
        : []
    )
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
      <div className="flex h-96 items-center justify-center text-violet-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <p className="text-sm font-medium">Cargando catálogo de productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-100 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-200 to-blue-400 bg-clip-text text-transparent">
            Gestión de Productos
          </h1>
          <p className="text-xs text-violet-300/70">Crea, edita y administra tu catálogo de inventario</p>
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
              className="bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white shadow-lg shadow-violet-600/30 hover:brightness-110 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>

          <DialogContent className="border-violet-500/20 bg-[#0d071b] text-slate-100 max-w-lg backdrop-blur-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white via-violet-200 to-blue-400 bg-clip-text text-transparent">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-violet-200">Nombre del Producto *</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ej. Remera Estampada"
                  className="border-violet-500/20 bg-violet-950/40 text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-violet-200">Descripción</Label>
                <Input
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Detalles del producto..."
                  className="border-violet-500/20 bg-violet-950/40 text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-violet-200">Categoría</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger className="border-violet-500/20 bg-violet-950/40 text-xs text-white">
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
                  <Label className="text-xs text-violet-200">Precio *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    required
                    className="border-violet-500/20 bg-violet-950/40 text-xs text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-violet-200">Stock General *</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    className="border-violet-500/20 bg-violet-950/40 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-violet-500/20 bg-violet-900/10 p-3">
                <Label className="text-xs text-violet-200 font-semibold">Talles (opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej: S, M, L"
                    value={newTalle.talle}
                    onChange={(e) => setNewTalle({ ...newTalle, talle: e.target.value })}
                    className="border-violet-500/20 bg-violet-950/40 text-xs text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Stock"
                    value={newTalle.stock}
                    onChange={(e) => setNewTalle({ ...newTalle, stock: e.target.value })}
                    className="w-24 border-violet-500/20 bg-violet-950/40 text-xs text-white"
                  />
                  <Button type="button" onClick={handleAddTalle} size="sm" className="bg-violet-700 hover:bg-violet-600">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {talles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {talles.map((t, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1.5 rounded-lg bg-violet-950 border border-violet-700 px-2 py-1 text-xs text-violet-200"
                      >
                        {t.talle}: {t.stock}
                        <button type="button" onClick={() => handleRemoveTalle(index)} className="text-red-400 hover:text-red-300">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-violet-200">Imagen del Producto (Cloudinary)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="border-violet-500/20 bg-violet-950/40 text-xs text-violet-300 cursor-pointer"
                />
                {imagePreview && (
                  <div className="relative mt-2 h-36 w-full rounded-xl overflow-hidden border border-violet-500/30">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white rounded-xl"
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
            className="rounded-2xl border border-violet-500/20 bg-violet-950/30 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-violet-500/40 flex flex-col justify-between"
          >
            <div>
              {product.imagenUrl && (
                <div className="relative h-44 w-full mb-4 rounded-xl overflow-hidden border border-violet-500/20">
                  <Image src={product.imagenUrl} alt={product.nombre} fill className="object-cover" unoptimized />
                </div>
              )}

              <h3 className="text-base font-extrabold text-white">{product.nombre}</h3>
              {product.descripcion && <p className="text-xs text-violet-300/70 mt-1 line-clamp-2">{product.descripcion}</p>}
              {product.category && (
                <span className="inline-block text-[11px] font-semibold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded-lg border border-cyan-800/30 mt-2">
                  {product.category.nombre}
                </span>
              )}

              <div className="flex items-center justify-between mt-4 border-t border-violet-500/10 pt-3">
                <span className="text-xl font-black text-white">${Number(product.precio).toFixed(2)}</span>
                <span className="text-xs text-violet-300/80 font-medium">
                  Stock Total: <strong className="text-white">{product.stock}</strong>
                </span>
              </div>

              {product.talles && product.talles.length > 0 && (
                <div className="mt-3 text-xs">
                  <span className="text-violet-300/60 font-semibold">Talles:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.talles.map((t: any) => (
                      <span key={t.id} className="bg-violet-900/30 text-violet-200 border border-violet-800/30 px-2 py-0.5 rounded-lg text-[11px]">
                        {t.talle}: {t.stock}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-5 pt-3 border-t border-violet-500/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(product)}
                className="flex-1 text-xs text-violet-200 bg-violet-900/20 hover:bg-violet-900/40 rounded-xl border border-violet-700/30"
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
