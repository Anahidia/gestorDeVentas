"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CheckCircle, XCircle, Clock, Package2 } from "lucide-react"

export default function EncargosPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrders = async () => {
    try {
      setLoading(true)
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
    } catch (error: any) {
      alert(error.message || "Error al completar encargo")
    }
  }

  const handleCancel = async (id: string) => {
    if (confirm("¿Estás seguro de cancelar este encargo?")) {
      try {
        await api.cancelOrder(id)
        loadOrders()
      } catch (error: any) {
        alert(error.message || "Error al cancelar encargo")
      }
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-violet-300">
        <div className="flex flex-col items-center gap-3">
          <Clock className="h-8 w-8 animate-bounce text-violet-400" />
          <p className="text-sm font-medium">Cargando encargos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-100 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-200 to-blue-400 bg-clip-text text-transparent">
          Gestión de Encargos & Reservas
        </h1>
        <p className="text-xs text-violet-300/70">Control de stock apartado por clientes</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {orders.length === 0 ? (
          <p className="text-xs text-violet-300/60 col-span-full">No hay encargos registrados.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-violet-500/20 bg-violet-950/30 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-violet-500/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Package2 className="h-4 w-4 text-violet-400" /> {order.producto?.nombre}
                    </h3>
                    <p className="text-xs text-violet-300/70 mt-1 font-medium">
                      Cantidad: <strong className="text-white">{order.cantidad}</strong> {order.talle ? `| Talle: ${order.talle}` : ""}
                    </p>
                    <p className="text-xs text-violet-300/50">Vendedor: {order.vendedor?.nombre}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      order.status === "activo"
                        ? "bg-violet-500/20 text-violet-300 border-violet-500/30"
                        : order.status === "completado"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-2 rounded-xl bg-violet-900/20 p-3 border border-violet-800/30 text-xs">
                  {order.clienteNombre && (
                    <div>
                      <span className="text-violet-300/60 font-semibold">Cliente:</span>
                      <p className="font-bold text-white">{order.clienteNombre} {order.clienteTelefono ? `(${order.clienteTelefono})` : ""}</p>
                    </div>
                  )}
                  {order.notas && (
                    <div>
                      <span className="text-violet-300/60 font-semibold">Notas:</span>
                      <p className="text-violet-200">{order.notas}</p>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] text-violet-300/60 border-t border-violet-500/10 pt-2 mt-1">
                    <span>Creado: {format(new Date(order.createdAt), "PPP", { locale: es })}</span>
                    <span>Expira: {format(new Date(order.fechaExpiracion), "PPP", { locale: es })}</span>
                  </div>
                </div>
              </div>

              {order.status === "activo" && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-violet-500/10">
                  <Button
                    onClick={() => handleComplete(order.id)}
                    size="sm"
                    className="flex-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 rounded-xl"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Completar
                  </Button>
                  <Button
                    onClick={() => handleCancel(order.id)}
                    size="sm"
                    variant="ghost"
                    className="flex-1 text-xs font-semibold text-rose-300 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-800/30 rounded-xl"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Cancelar
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
