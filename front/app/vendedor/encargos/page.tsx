"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/lib/toast-context"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CheckCircle, XCircle, Clock, Package2, Loader2 } from "lucide-react"

export default function MisEncargosPage() {
  const toast = useToast()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await api.getMyOrders()
      setOrders(data)
    } catch (error: any) {
      console.error("Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleComplete = async (id: string) => {
    setProcessingId(`complete-${id}`)
    try {
      await api.completeOrder(id)
      toast.success("Encargo completado correctamente", "Encargo Listo")
      loadOrders()
    } catch (error: any) {
      toast.error(error.message || "Error al completar el encargo", "Error")
    } finally {
      setProcessingId(null)
    }
  }

  const handleCancel = async (id: string) => {
    setProcessingId(`cancel-${id}`)
    try {
      await api.cancelOrder(id)
      toast.success("Encargo cancelado y stock liberado", "Encargo Cancelado")
      loadOrders()
    } catch (error: any) {
      toast.error(error.message || "Error al cancelar el encargo", "Error")
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-blue-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-sm font-medium">Cargando mis encargos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-100 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-200 to-cyan-400 bg-clip-text text-transparent">
          Mis Encargos & Reservas
        </h1>
        <p className="text-xs text-blue-300/70">Gestiona las reservas de productos encargados por tus clientes</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {orders.length === 0 ? (
          <p className="text-xs text-blue-300/60 col-span-full">No tienes encargos registrados.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-blue-500/20 bg-violet-950/30 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-blue-500/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Package2 className="h-4 w-4 text-cyan-400" /> {order.producto?.nombre}
                    </h3>
                    <p className="text-xs text-blue-200/70 mt-1 font-medium">
                      Cantidad: <strong className="text-white">{order.cantidad}</strong> {order.talle ? `| Talle: ${order.talle}` : ""}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      order.status === "activo"
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                        : order.status === "completado"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-2 rounded-xl bg-violet-900/20 p-3 border border-blue-800/30 text-xs">
                  {order.clienteNombre && (
                    <div>
                      <span className="text-blue-200/60 font-semibold">Cliente:</span>
                      <p className="font-bold text-white">{order.clienteNombre} {order.clienteTelefono ? `(${order.clienteTelefono})` : ""}</p>
                    </div>
                  )}

                  {/* Financial Breakdown for Order */}
                  <div className="grid grid-cols-3 gap-2 bg-violet-950/60 p-2 rounded-lg text-center my-1 border border-violet-800/20">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-blue-200/60">Precio Total</span>
                      <span className="font-bold text-white">${Number(order.precioTotal || (order.producto?.precio * order.cantidad) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-emerald-300">Seña Pagada</span>
                      <span className="font-bold text-emerald-400">
                        {Number(order.sena) > 0 ? `+$${Number(order.sena).toFixed(2)}` : "Sin Seña"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-cyan-300">Restante</span>
                      <span className="font-extrabold text-cyan-300">
                        ${Number(order.montoRestante ?? (order.producto?.precio * order.cantidad - (order.sena || 0))).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {order.notas && (
                    <div>
                      <span className="text-blue-200/60 font-semibold">Notas:</span>
                      <p className="text-blue-200">{order.notas}</p>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] text-blue-200/60 border-t border-blue-500/10 pt-2 mt-1">
                    <span>Creado: {order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy", { locale: es }) : "N/A"}</span>
                    <span className="font-bold text-amber-300">Retiro Máx: {order.fechaExpiracion ? format(new Date(order.fechaExpiracion), "dd/MM/yyyy", { locale: es }) : "N/A"}</span>
                  </div>
                </div>
              </div>

              {order.status === "activo" && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-blue-500/10">
                  <Button
                    onClick={() => handleComplete(order.id)}
                    disabled={processingId === `complete-${order.id}`}
                    size="sm"
                    className="flex-1 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 rounded-xl"
                  >
                    {processingId === `complete-${order.id}` ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Cobrar Restante (${Number(order.montoRestante ?? (order.producto?.precio * order.cantidad - (order.sena || 0))).toFixed(2)}) & Entregar
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleCancel(order.id)}
                    disabled={processingId === `cancel-${order.id}`}
                    size="sm"
                    variant="ghost"
                    className="flex-1 text-xs font-semibold text-rose-300 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-800/30 rounded-xl"
                  >
                    {processingId === `cancel-${order.id}` ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Cancelar
                      </>
                    )}
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
