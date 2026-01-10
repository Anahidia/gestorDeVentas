"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CheckCircle, XCircle } from "lucide-react"

export default function EncargosPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrders = async () => {
    try {
      const data = await api.getOrders()
      setOrders(data)
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleComplete = async (id: string) => {
    try {
      await api.completeOrder(id)
      loadOrders()
    } catch (error) {
      console.error("Error completing order:", error)
    }
  }

  const handleCancel = async (id: string) => {
    if (confirm("¿Estás seguro de cancelar este encargo?")) {
      try {
        await api.cancelOrder(id)
        loadOrders()
      } catch (error) {
        console.error("Error canceling order:", error)
      }
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Cargando encargos...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Encargos</h1>
        <p className="text-muted-foreground">Gestión de reservas de productos</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {orders.map((order) => (
          <Card key={order.id} className="border-border bg-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-foreground">{order.producto.nombre}</CardTitle>
                  <p className="text-sm text-muted-foreground">Cantidad: {order.cantidad}</p>
                  <p className="text-sm text-muted-foreground">Vendedor: {order.vendedor.nombre}</p>
                </div>
                <Badge
                  variant={
                    order.status === "activo" ? "default" : order.status === "completado" ? "secondary" : "destructive"
                  }
                >
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {order.clienteNombre && (
                <div>
                  <p className="text-sm font-medium text-foreground">Cliente:</p>
                  <p className="text-sm text-muted-foreground">{order.clienteNombre}</p>
                  {order.clienteTelefono && <p className="text-sm text-muted-foreground">{order.clienteTelefono}</p>}
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">
                  Creado: {format(new Date(order.createdAt), "PPP", { locale: es })}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expira: {format(new Date(order.fechaExpiracion), "PPP", { locale: es })}
                </p>
              </div>
              {order.status === "activo" && (
                <div className="flex gap-2">
                  <Button onClick={() => handleComplete(order.id)} size="sm" className="flex-1 gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Completar
                  </Button>
                  <Button
                    onClick={() => handleCancel(order.id)}
                    variant="destructive"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
