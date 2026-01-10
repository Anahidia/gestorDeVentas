"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function VentasPage() {
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSales = async () => {
      try {
        const data = await api.getSales()
        setSales(data)
      } catch (error) {
        console.error("Error loading sales:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSales()
  }, [])

  if (loading) {
    return <div className="text-muted-foreground">Cargando ventas...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Ventas</h1>
        <p className="text-muted-foreground">Historial completo de ventas</p>
      </div>

      <div className="flex flex-col gap-4">
        {sales.map((sale) => (
          <Card key={sale.id} className="border-border bg-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-foreground">Venta #{sale.id.slice(0, 8)}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(sale.createdAt), "PPP 'a las' p", { locale: es })}
                  </p>
                  <p className="text-sm text-muted-foreground">Vendedor: {sale.vendedor.nombre}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-2xl font-bold text-primary">${sale.total}</span>
                  <Badge variant={sale.status === "completada" ? "default" : "destructive"}>{sale.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-foreground">Productos:</p>
                {sale.items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {item.producto.nombre} x{item.cantidad}
                    </span>
                    <span>${item.subtotal}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
