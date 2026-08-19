"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/lib/toast-context"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ShoppingCart, RotateCcw, Loader2 } from "lucide-react"

export default function VentasPage() {
  const toast = useToast()
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refundingId, setRefundingId] = useState<string | null>(null)

  const loadSales = async () => {
    try {
      setLoading(true)
      const data = await api.getSales()
      setSales(data)
    } catch (error: any) {
      console.error("Error loading sales:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSales()
  }, [])

  const handleRefund = async (saleId: string) => {
    setRefundingId(saleId)
    try {
      await api.refundSale(saleId)
      toast.success("¡Devolución procesada exitosamente y stock reembolsado!", "Devolución Guardada")
      loadSales()
    } catch (error: any) {
      toast.error(error.message || "Error al procesar devolución", "Error")
    } finally {
      setRefundingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-violet-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <p className="text-sm font-medium">Cargando historial de ventas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-100 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-200 to-blue-400 bg-clip-text text-transparent">
          Historial de Ventas & Devoluciones
        </h1>
        <p className="text-xs text-violet-300/70">Registro completo de transacciones y devoluciones</p>
      </div>

      <div className="flex flex-col gap-4">
        {sales.length === 0 ? (
          <p className="text-xs text-violet-300/60">No hay ventas registradas.</p>
        ) : (
          sales.map((sale) => (
            <div
              key={sale.id}
              className="rounded-2xl border border-violet-500/20 bg-violet-950/30 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-violet-500/40"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-violet-500/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Venta #{sale.id.slice(0, 8)}
                  </h3>
                  <p className="text-xs text-violet-300/60 mt-0.5">
                    {format(new Date(sale.createdAt), "PPP 'a las' p", { locale: es })}
                  </p>
                  <p className="text-xs text-violet-300/80 font-medium">Vendedor: {sale.vendedor?.nombre || "N/A"}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-2xl font-black text-white">${Number(sale.total).toFixed(2)}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      sale.status === "completada"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : sale.status === "devuelta"
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    }`}
                  >
                    {sale.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <span className="text-xs font-semibold text-violet-300/80">Detalle de Productos:</span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {sale.items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl bg-violet-900/20 p-2.5 px-3 border border-violet-800/30 text-xs"
                    >
                      <span className="text-violet-200">
                        {item.producto?.nombre} <strong className="text-violet-400">x{item.cantidad}</strong> {item.talle ? `(${item.talle})` : ""}
                      </span>
                      <span className="font-bold text-white">${Number(item.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {sale.status === "completada" && (
                <div className="mt-4 flex justify-end pt-2 border-t border-violet-500/10">
                  <Button
                    onClick={() => handleRefund(sale.id)}
                    disabled={refundingId === sale.id}
                    size="sm"
                    variant="ghost"
                    className="text-xs font-semibold text-amber-300 border border-amber-500/30 bg-amber-950/20 hover:bg-amber-900/40 rounded-xl flex items-center gap-1.5"
                  >
                    {refundingId === sale.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Procesando Devolución...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" /> Procesar Devolución
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
