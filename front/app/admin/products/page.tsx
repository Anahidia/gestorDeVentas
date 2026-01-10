"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"

export default function ProductosPage() {
  const [products, setProducts] = useState<any[]>([])
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
  })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let imagenUrl: string | undefined
      const token = localStorage.getItem("token")

      // 📤 SUBIR IMAGEN A CLOUDINARY
      if (imageFile) {
        const formDataImage = new FormData()
        formDataImage.append("file", imageFile)

        const response = await fetch("http://localhost:3001/products/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataImage,
        })

        if (!response.ok) {
          throw new Error("Error subiendo imagen")
        }

        const result = await response.json()
        imagenUrl = result.url // ✅ URL de Cloudinary
      }

      const data: any = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: Number(formData.precio),
        stock: Number(formData.stock),
      }

      if (imagenUrl) {
        data.imagenUrl = imagenUrl
      }

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, data)
      } else {
        await api.createProduct(data)
      }

      setIsDialogOpen(false)
      setEditingProduct(null)
      setImageFile(null)
      setImagePreview("")
      setFormData({ nombre: "", descripcion: "", precio: "", stock: "" })
      loadProducts()
    } catch (error) {
      console.error("Error saving product:", error)
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
    })
    setImagePreview(product.imagenUrl || "")
    setImageFile(null)
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
                setFormData({ nombre: "", descripcion: "", precio: "", stock: "" })
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <Label>Nombre</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Descripción</Label>
                <Input
                  value={formData.descripcion}
                  onChange={(e) =>
                    setFormData({ ...formData, descripcion: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Precio</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) =>
                      setFormData({ ...formData, precio: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Imagen</Label>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <div className="relative mt-2 h-32 w-full">
                    <Image
                      src={imagePreview}
                      alt="preview"
                      fill
                      className="object-cover rounded"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              <Button type="submit">
                {editingProduct ? "Actualizar" : "Crear"}
              </Button>
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
                    src={product.imagenUrl}
                    alt={product.nombre}
                    fill
                    className="object-cover rounded"
                    unoptimized
                  />
                </div>
              )}
              <CardTitle>{product.nombre}</CardTitle>
              {product.descripcion && (
                <p className="text-sm text-muted-foreground">
                  {product.descripcion}
                </p>
              )}
            </CardHeader>

            <CardContent>
              <div className="flex justify-between mb-2">
                <span className="font-bold">
                  ${Number(product.precio).toFixed(2)}
                </span>
                <span>Stock: {product.stock}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleEdit(product)}
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
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
