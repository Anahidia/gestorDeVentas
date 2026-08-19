"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react"

export default function CategoriasPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [formData, setFormData] = useState({ nombre: "" })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await api.getCategories()
      setCategories(data)
    } catch (error) {
      console.error("Error loading categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, formData)
      } else {
        await api.createCategory(formData)
      }
      setIsDialogOpen(false)
      setFormData({ nombre: "" })
      setEditingCategory(null)
      loadCategories()
    } catch (error: any) {
      alert(error.message || "Error al guardar la categoría")
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setFormData({ nombre: category.nombre })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return
    try {
      await api.deleteCategory(id)
      loadCategories()
    } catch (error: any) {
      alert(error.message || "Error al eliminar la categoría")
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-violet-300">
        <div className="flex flex-col items-center gap-3">
          <FolderOpen className="h-8 w-8 animate-bounce text-violet-400" />
          <p className="text-sm font-medium">Cargando categorías...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-100 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-200 to-blue-400 bg-clip-text text-transparent">
            Categorías de Productos
          </h1>
          <p className="text-xs text-violet-300/70">Organiza tu catálogo por secciones y departamentos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingCategory(null)
                setFormData({ nombre: "" })
              }}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white shadow-lg shadow-violet-600/30 hover:brightness-110 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="border-violet-500/20 bg-[#0d071b] text-slate-100 max-w-md backdrop-blur-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-white via-violet-200 to-blue-400 bg-clip-text text-transparent">
                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre" className="text-xs text-violet-200">Nombre de la Categoría *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  placeholder="Ej. Indumentaria, Calzado, Accesorios"
                  className="border-violet-500/20 bg-violet-950/40 text-xs text-white"
                />
              </div>
              <Button type="submit" className="mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white rounded-xl">
                {editingCategory ? "Actualizar" : "Crear"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-2xl border border-violet-500/20 bg-violet-950/30 p-5 shadow-xl backdrop-blur-xl flex items-center justify-between transition-all hover:border-violet-500/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-900/30 text-violet-300 border border-violet-700/30">
                <FolderOpen className="h-5 w-5" />
              </div>
              <span className="text-base font-bold text-white">{category.nombre}</span>
            </div>

            <div className="flex gap-1">
              <Button
                onClick={() => handleEdit(category)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-violet-300 hover:bg-violet-900/40 rounded-lg"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                onClick={() => handleDelete(category.id)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-rose-400 hover:bg-rose-950/40 rounded-lg"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
