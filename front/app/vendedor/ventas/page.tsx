"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/lib/toast-context"
import { Button } from "@/components/ui/button"
import { VendedorNav } from "@/components/vendedor-nav"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { ShoppingCart, RotateCcw, Search, User, Calendar, Tag, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"

export default function VendedorVentasPage() {
  const toast = useToast()
  const { user } = useAuth()
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  const loadSales = async () => {
    try {
      setLoading(true)
      const data = await api.getSales()
      setSales(data || [])
    } catch (err: any) {
      toast.error(err.message || "Error al cargar historial de ventas", "Error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSales()
  }, [])

  const handleRefund = async (saleId: string) => {
    if (!confirm("¿Estás seguro de procesar la devolución de esta venta? El stock se reincorporará automáticamente.")) {
      return
    }

    setProcessingId(saleId)
    try {
      await api.refundSale(saleId)
      toast.success("Devolución procesada correctamente y stock reincorporado", "Devolución Exitosa")
      await loadSales()
    } catch (err: any) {
      toast.error(err.message || "Error al procesar devolución", "Error")
    } finally {
      setProcessingId(null)
    }
  }

  const filteredSales = sales.filter((s) => {
    const term = search.toLowerCase()
    const vendedorNombre = s.vendedor?.nombre?.toLowerCase() || ""
    const status = s.status?.toLowerCase() || ""
    const itemsNames = s.items?.map((i: any) => i.producto?.nombre?.toLowerCase()).join(" ") || ""
    return vendedorNombre.includes(term) || status.includes(term) || itemsNames.includes(term)
  })

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-100 pb-12">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-cyan-400" /> Historial de Ventas & Devoluciones
            </h1>
            <p className="text-xs text-blue-200/70 mt-1">
              Consulta las ventas realizadas, procesa devoluciones y verifica prendas vendidas.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
            <input
              type="text"
              placeholder="Buscar venta o producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-violet-500/20 bg-violet-950/40 text-xs text-white placeholder:text-violet-400/50 focus:border-cyan-400 outline-none"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-violet-500/20 bg-violet-950/30 p-6 shadow-xl backdrop-blur-xl">
          {loading ? (
            <div className="py-16 text-center text-cyan-300 flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              <span className="text-xs">Cargando ventas registradas...</span>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="py-16 text-center text-violet-300/60 flex flex-col items-center gap-2">
              <ShoppingCart className="h-10 w-10 text-violet-500/30" />
              <span>No hay ventas registradas que coincidan con la búsqueda.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredSales.map((sale) => {
                const isRefunded = sale.status === "devuelta"
                const isCancelled = sale.status === "cancelada"
                const isSena = sale.status === "seña_encargo"
                const isProcessing = processingId === sale.id

                return (
                  <div
                    key={sale.id}
                    className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-xl border transition-all ${
                      isRefunded
                        ? "border-amber-500/30 bg-amber-950/20"
                        : isCancelled
                        ? "border-rose-500/30 bg-rose-950/20"
                        : isSena
                        ? "border-purple-500/30 bg-purple-950/20"
                        : "border-violet-500/20 bg-violet-900/10 hover:border-violet-500/40"
                    }`}
                  >
                    {/* Left: Info */}
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-white">
                          Venta #{sale.id.slice(0, 8)}
                        </span>

                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            isRefunded
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : isCancelled
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : isSena
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          }`}
                        >
                          {isSena ? "Seña de Encargo" : sale.status}
                        </span>

                        <span className="text-xs text-violet-300/70 font-mono flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-cyan-400" />
                          {sale.createdAt ? format(new Date(sale.createdAt), "dd/MM/yyyy 'a las' HH:mm 'hs'", { locale: es }) : "N/A"}
                        </span>
                      </div>

                      {/* Items breakdown */}
                      <div className="flex flex-wrap gap-2 mt-1">
                        {sale.items?.map((item: any) => (
                          <span
                            key={item.id}
                            className="text-xs bg-violet-950/60 border border-violet-800/40 px-2.5 py-1 rounded-lg text-violet-200 flex items-center gap-1.5"
                          >
                            <Tag className="h-3 w-3 text-cyan-400" />
                            <strong>{item.producto?.nombre || "Producto"}</strong>
                            {item.talle && <span className="text-cyan-300 font-bold">(Talle: {item.talle})</span>}
                            <span className="text-emerald-400 font-bold">x{item.cantidad}</span>
                          </span>
                        ))}
                      </div>

                      <div className="text-[11px] text-violet-300/70 flex items-center gap-2 mt-1">
                        <User className="h-3 w-3 text-violet-400" /> Vendedor: <strong className="text-white">{sale.vendedor?.nombre || "Vendedor"}</strong>
                        {sale.notas && <span className="text-violet-300/60 font-mono italic">({sale.notas})</span>}
                      </div>
                    </div>

                    {/* Right: Total & Action */}
                    <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-violet-500/10 pt-3 lg:pt-0">
                      <div className="flex flex-col items-start lg:items-end">
                        <span className="text-[10px] uppercase font-bold text-violet-300/60">
                          {isSena ? "Seña Cobrada" : "Total de Venta"}
                        </span>
                        <span className={`text-xl font-black ${isRefunded ? "text-amber-400 line-through" : isSena ? "text-purple-300" : "text-emerald-400"}`}>
                          ${Number(sale.total).toFixed(2)}
                        </span>
                      </div>

                      {isSena ? (
                        <span className="text-[11px] font-semibold text-purple-300 bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-500/30">
                          🔒 Seña (No Devolución Directa)
                        </span>
                      ) : !isRefunded && !isCancelled && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRefund(sale.id)}
                          disabled={isProcessing}
                          className="border-amber-500/40 bg-amber-950/30 text-amber-300 hover:bg-amber-900/50 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                          )}
                          Procesar Devolución
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
