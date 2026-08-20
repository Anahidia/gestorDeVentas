"use client"

import React, { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/lib/toast-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, Calculator, CheckCircle2, AlertTriangle, Loader2, Landmark, ShoppingBag, RotateCcw, Clock } from "lucide-react"

interface CierreCajaModalProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function CierreCajaModal({ trigger, onSuccess }: CierreCajaModalProps) {
  const toast = useToast()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [summary, setSummary] = useState<any>(null)

  const [fondoInicial, setFondoInicial] = useState<string>("0")
  const [efectivoReal, setEfectivoReal] = useState<string>("")
  const [notas, setNotas] = useState("")

  const loadSummary = async () => {
    setLoadingSummary(true)
    try {
      const data = await api.getCashCloseoutsCurrentSummary()
      setSummary(data)
    } catch (err: any) {
      toast.error(err.message || "Error al obtener resumen de caja", "Error")
    } finally {
      setLoadingSummary(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadSummary()
      setFondoInicial("0")
      setEfectivoReal("")
      setNotas("")
    }
  }, [open])

  const numFondo = Number(fondoInicial) || 0
  const numReal = Number(efectivoReal) || 0
  const numVentasEfectivo = summary?.totalVentasEfectivo || 0
  const numDevoluciones = summary?.totalDevoluciones || 0

  const efectivoEsperado = numFondo + numVentasEfectivo - numDevoluciones
  const diferencia = numReal - efectivoEsperado

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (efectivoReal === "") {
      toast.error("Por favor ingresa el monto total de efectivo contado en caja", "Falta información")
      return
    }

    setSubmitting(true)
    try {
      await api.createCashCloseout({
        fondoInicial: numFondo,
        efectivoReal: numReal,
        notas,
      })

      if (diferencia === 0) {
        toast.success("¡Cierre de caja registrado exitosamente! La caja cuadra perfectamente.", "Cierre de Caja OK")
      } else if (diferencia > 0) {
        toast.info(`Cierre registrado. Hay un SOBRANTE de +$${diferencia.toFixed(2)}`, "Arqueo de Caja")
      } else {
        toast.warning(`Cierre registrado. Se detectó un FALTANTE de -$${Math.abs(diferencia).toFixed(2)}`, "Atención Faltante")
      }

      setOpen(false)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      toast.error(err.message || "Error al procesar cierre de caja", "Error")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-white shadow-lg shadow-emerald-600/30 hover:brightness-110 rounded-full px-4 text-xs flex items-center gap-1.5"
          >
            <Landmark className="h-3.5 w-3.5" />
            Cierre de Caja
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="border-emerald-500/30 bg-[#0d071b] text-slate-100 max-w-lg backdrop-blur-2xl max-h-[90vh] overflow-y-auto pr-3 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold bg-gradient-to-r from-white via-emerald-200 to-cyan-300 bg-clip-text text-transparent flex items-center gap-2">
            <Landmark className="h-5 w-5 text-emerald-400" />
            Cierre & Arqueo de Caja de Turno
          </DialogTitle>
        </DialogHeader>

        {loadingSummary ? (
          <div className="flex h-48 items-center justify-center text-emerald-300">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
              <span className="text-xs">Calculando resumen de ventas del turno...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-1">
            {/* Operator Info */}
            <div className="flex items-center justify-between text-xs text-emerald-200/80 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20">
              <span className="font-semibold">Operador: <strong className="text-white">{user?.nombre}</strong></span>
              <span className="font-mono text-[11px] text-cyan-300">
                {summary?.desde ? `Ventas desde: ${new Date(summary.desde).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs` : "Turno Actual"}
              </span>
            </div>

            {/* Shift Sales Summary Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-violet-500/20 bg-violet-950/30 p-2.5 flex flex-col justify-center">
                <span className="text-[10px] uppercase font-bold text-violet-300/70 flex items-center justify-center gap-1">
                  <DollarSign className="h-3 w-3 text-emerald-400" /> Ventas Efectivo
                </span>
                <span className="text-sm font-extrabold text-emerald-400 mt-1">
                  +${numVentasEfectivo.toFixed(2)}
                </span>
                <span className="text-[9px] text-violet-300/50">{summary?.totalVentas || 0} ventas</span>
              </div>

              <div className="rounded-xl border border-violet-500/20 bg-violet-950/30 p-2.5 flex flex-col justify-center">
                <span className="text-[10px] uppercase font-bold text-violet-300/70 flex items-center justify-center gap-1">
                  <RotateCcw className="h-3 w-3 text-amber-400" /> Devoluciones
                </span>
                <span className="text-sm font-extrabold text-amber-300 mt-1">
                  -${numDevoluciones.toFixed(2)}
                </span>
                <span className="text-[9px] text-violet-300/50">{summary?.totalDevolucionesCant || 0} devolv.</span>
              </div>

              <div className="rounded-xl border border-violet-500/20 bg-violet-950/30 p-2.5 flex flex-col justify-center">
                <span className="text-[10px] uppercase font-bold text-violet-300/70 flex items-center justify-center gap-1">
                  <ShoppingBag className="h-3 w-3 text-cyan-400" /> Artículos
                </span>
                <span className="text-sm font-extrabold text-cyan-300 mt-1">
                  {summary?.totalArticulosVendidos || 0} u.
                </span>
                <span className="text-[9px] text-violet-300/50">Stock procesado</span>
              </div>
            </div>

            {/* Inputs: Fondo Inicial + Efectivo Real Contado */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-emerald-200">Fondo Inicial de Caja *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={fondoInicial ?? ""}
                  onChange={(e) => setFondoInicial(e.target.value)}
                  placeholder="0.00"
                  className="border-emerald-500/30 bg-emerald-950/20 text-xs text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-emerald-200 font-bold">Efectivo Real Contado *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={efectivoReal ?? ""}
                  onChange={(e) => setEfectivoReal(e.target.value)}
                  placeholder="Monto contado en caja"
                  required
                  className="border-emerald-500/40 bg-emerald-950/40 text-xs text-white font-bold"
                />
              </div>
            </div>

            {/* Balance Reconciliation Card (Cuadre de Caja) */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-violet-200">
                <span>Efectivo Esperado (Fondo + Ventas - Dev.):</span>
                <span className="font-mono font-bold text-white">${efectivoEsperado.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-violet-200">
                <span>Efectivo Contado por el Empleado:</span>
                <span className="font-mono font-bold text-emerald-300">${numReal.toFixed(2)}</span>
              </div>

              <div className="border-t border-emerald-500/20 pt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Calculator className="h-4 w-4 text-cyan-400" /> Diferencia / Cuadre:
                </span>

                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full flex items-center gap-1 ${
                    diferencia === 0
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : diferencia > 0
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  }`}
                >
                  {diferencia === 0 ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Caja Cuadrada ($0.00)
                    </>
                  ) : diferencia > 0 ? (
                    <>Sobrante: +${diferencia.toFixed(2)}</>
                  ) : (
                    <>
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-400" /> Faltante: -${Math.abs(diferencia).toFixed(2)}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Optional Notes */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-emerald-200">Observaciones o Notas del Cierre</Label>
              <Input
                value={notas ?? ""}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej. Se dejaron $5,000 para el próximo turno..."
                className="border-emerald-500/20 bg-emerald-950/20 text-xs text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="mt-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 font-extrabold text-white rounded-xl py-2.5 shadow-lg shadow-emerald-600/30 hover:brightness-110"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Guardando Cierre de Caja...
                </>
              ) : (
                "Confirmar & Registrar Cierre de Caja"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
