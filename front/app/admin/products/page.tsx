"use client"

import  React from "react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, X } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProductosPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

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

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    const token = localStorage.getItem("token")
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
      form.append("image", imageFile) // 🔴 ESTE NOMBRE ES CLAVE
    }

    if (editingProduct) {
      await fetch(`http://localhost:3001/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      })
    } else {
      await fetch("http://localhost:3001/products", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      })
    }

    setIsDialogOpen(false)
    setEditingProduct(null)
    setImageFile(null)
    setImagePreview("")
    setFormData({ nombre: "", descripcion: "", precio: "", stock: "", categoryId: "" })
    setTalles([])
    loadProducts()
  } catch (error) {
    console.error(error)
    alert("Error al guardar el producto")
  }
}


  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setFormData({
      nombre: product.nombre,
      descripcion: product.descripcion || "",
      precio: Number(product.precio).toFixed(2),
      stock: product.stock.toString(),
      categoryId: product.categoryId || "",
    })
    setImagePreview(product.imagenUrl || "")
    setImageFile(null)
    setTalles(product.talles || [])
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      await api.deleteProduct(id)
      loadProducts()
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Cargando productos...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Gestiona el inventario</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingProduct(null)
                setImageFile(null)
                setImagePreview("")
                setFormData({ nombre: "", descripcion: "", precio: "", stock: "", categoryId: "" })
                setTalles([])
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Descripción</Label>
                <Input
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              <div>
                <Label>Categoría</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
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
                <div>
                  <Label>Precio</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Talles (opcional)</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Ej: S, M, L, XL"
                    value={newTalle.talle}
                    onChange={(e) => setNewTalle({ ...newTalle, talle: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Stock"
                    value={newTalle.stock}
                    onChange={(e) => setNewTalle({ ...newTalle, stock: e.target.value })}
                    className="w-24"
                  />
                  <Button type="button" onClick={handleAddTalle} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {talles.length > 0 && (
                  <div className="space-y-2">
                    {talles.map((t, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <span>
                          Talle: <strong>{t.talle}</strong> - Stock: {t.stock}
                        </span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveTalle(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Imagen</Label>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <div className="relative mt-2 h-32 w-full">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="preview"
                      fill
                      className="object-cover rounded"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              <Button type="submit">{editingProduct ? "Actualizar" : "Crear"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              {product.imagenUrl && (
                <div className="relative h-48 w-full mb-2">
                  <Image
                    src={product.imagenUrl || "/placeholder.svg"}
                    alt={product.nombre}
                    fill
                    className="object-cover rounded"
                    unoptimized
                  />
                </div>
              )}
              <CardTitle>{product.nombre}</CardTitle>
              {product.descripcion && <p className="text-sm text-muted-foreground">{product.descripcion}</p>}
              {product.category && <span className="text-xs text-primary">Categoría: {product.category.nombre}</span>}
            </CardHeader>

            <CardContent>
              <div className="flex justify-between mb-2">
                <span className="font-bold">${Number(product.precio).toFixed(2)}</span>
                <span>Stock: {product.stock}</span>
              </div>

              {product.talles && product.talles.length > 0 && (
                <div className="mb-3 text-sm">
                  <strong>Talles disponibles:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.talles.map((t: any) => (
                      <span key={t.id} className="bg-muted px-2 py-1 rounded text-xs">
                        {t.talle}: {t.stock}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>

                <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)} className="text-white">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
