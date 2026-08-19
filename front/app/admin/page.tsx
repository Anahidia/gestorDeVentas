"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { useToast } from "@/lib/toast-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart3,
  Users,
  ShoppingCart,
  RotateCcw,
  Package,
  TrendingUp,
  Clock,
  Key,
  Copy,
  Check,
  DollarSign,
  AlertTriangle,
  UserCheck,
  Loader2,
} from "lucide-react"

export default function AdminDashboard() {
  const toast = useToast()
  const { business } = useAuth()
  const [activeTab, setActiveTab] = useState<"overview" | "employees" | "sales">("overview")
  const [stats, setStats] = useState<any>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState(false)
  const [editingCodeUser, setEditingCodeUser] = useState<string | null>(null)
  const [newEmpCode, setNewEmpCode] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [salesStats, ordersStats, productsData, salesList] = await Promise.all([
        api.getSalesStats(),
        api.getOrdersStats(),
        api.getProducts(),
        api.getSales(),
      ])

      let empData: any[] = []
      if (business?.id) {
        empData = await api.getUsersByBusiness(business.id)
      } else {
        empData = await api.getUsers()
      }

      setStats({
        sales: salesStats,
        orders: ordersStats,
        totalProducts: productsData.length,
        lowStock: productsData.filter((p: any) => p.stock < 10).length,
      })

      setEmployees(empData)
      setSales(salesList)
    } catch (error: any) {
      console.error("Error loading admin data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [business?.id])

  const handleCopyInviteCode = () => {
    if (business?.inviteCode) {
      navigator.clipboard.writeText(business.inviteCode)
      setCopiedCode(true)
      toast.success("¡Código de empleados copiado al portapapeles!", "Copiado")
      setTimeout(() => setCopiedCode(false), 2000)
    }
  }

  const handleToggleShift = async (userId: string) => {
    setProcessingId(`shift-${userId}`)
    try {
      await api.toggleUserShift(userId)
      toast.success("Estado de turno actualizado correctamente", "Fichaje Registrado")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Error al cambiar estado de turno", "Error")
    } finally {
      setProcessingId(null)
    }
  }

  const handleDepartmentChange = async (userId: string, departamento: string) => {
    setProcessingId(`dept-${userId}`)
    try {
      await api.updateUserDepartment(userId, departamento)
      toast.success(`Departamento asignado: ${departamento}`, "Área Actualizada")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar departamento", "Error")
    } finally {
      setProcessingId(null)
    }
  }

  const handleSaveEmpCode = async (userId: string) => {
    setProcessingId(`code-${userId}`)
    try {
      await api.updateEmployeeCode(userId, newEmpCode)
      toast.success("Código de empleado asignado exitosamente", "Código Guardado")
      setEditingCodeUser(null)
      setNewEmpCode("")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar código de empleado", "Error")
    } finally {
      setProcessingId(null)
    }
  }

  const handleRefundSale = async (saleId: string) => {
    setProcessingId(`refund-${saleId}`)
    try {
      await api.refundSale(saleId)
      toast.success("Devolución procesada exitosamente y stock reembolsado", "Devolución Exitosa")
      loadData()
    } catch (err: any) {
      toast.error(err.message || "Error al procesar devolución", "Error de Devolución")
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-violet-300">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          <p className="text-sm font-medium">Cargando datos del panel...</p>
        </div>
      </div>
    )
  }

  const inShiftCount = employees.filter((e) => e.inShift).length

  return (
    <div className="flex flex-col gap-8 pb-12 font-sans text-slate-100">
      {/* Dashboard Top Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-200 to-blue-400 bg-clip-text text-transparent">
            Panel de Control & Gestión
          </h1>
          <p className="text-xs text-violet-300/70">
            {business ? `Local: ${business.nombre}` : "Gestión centralizada de tu comercio"}
          </p>
        </div>

        {/* Business Code Header Card */}
        {business?.inviteCode && (
          <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-950/30 p-3 px-4 shadow-lg backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-400">
              <Key className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-cyan-300">
                Código de Empleados
              </span>
              <span className="text-sm font-mono font-bold text-white tracking-widest">
                {business.inviteCode}
              </span>
            </div>
            <Button
              onClick={handleCopyInviteCode}
              size="sm"
              variant="ghost"
              className="ml-2 h-8 px-2 text-xs text-cyan-300 hover:bg-cyan-900/50"
            >
              {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Ventas Netas */}
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-violet-950/30 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-violet-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-300/80">Ingresos Netos</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white">
            ${(stats?.sales?.totalIngresosNetos || stats?.sales?.totalIngresos || 0).toFixed(2)}
          </div>
          <p className="mt-1 text-xs text-violet-300/60">
            {stats?.sales?.totalVentas || 0} ventas completadas
          </p>
        </div>

        {/* Metric 2: Devoluciones */}
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-violet-950/30 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-violet-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-300/80">Devoluciones</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <RotateCcw className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-300">
            {stats?.sales?.totalDevoluciones || 0}
          </div>
          <p className="mt-1 text-xs text-amber-300/60">
            -${(stats?.sales?.totalDevuelto || 0).toFixed(2)} reembolsados
          </p>
        </div>

        {/* Metric 3: Personal en Turno */}
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-violet-950/30 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-violet-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-300/80">Personal en Turno</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-blue-300">
            {inShiftCount} / {employees.length}
          </div>
          <p className="mt-1 text-xs text-blue-300/60">
            Empleados trabajando ahora
          </p>
        </div>

        {/* Metric 4: Encargos Activos */}
        <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-violet-950/30 p-5 shadow-xl backdrop-blur-xl transition-all hover:border-violet-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-300/80">Encargos Activos</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-violet-200">
            {stats?.orders?.activos || 0}
          </div>
          <p className="mt-1 text-xs text-violet-300/60">
            {stats?.orders?.completados || 0} completados
          </p>
        </div>
      </div>

      {/* Main Content Tabs Navigation */}
      <div className="flex border-b border-violet-500/20 gap-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold transition-all border-b-2 ${
            activeTab === "overview"
              ? "border-violet-400 text-violet-200 bg-violet-900/20 rounded-t-xl"
              : "border-transparent text-violet-300/60 hover:text-white"
          }`}
        >
          <BarChart3 className="h-4 w-4" /> Métricas & Resumen
        </button>
        <button
          onClick={() => setActiveTab("employees")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold transition-all border-b-2 ${
            activeTab === "employees"
              ? "border-blue-400 text-blue-200 bg-blue-900/20 rounded-t-xl"
              : "border-transparent text-violet-300/60 hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" /> Gestión de Empleados & Turnos ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab("sales")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold transition-all border-b-2 ${
            activeTab === "sales"
              ? "border-emerald-400 text-emerald-200 bg-emerald-900/20 rounded-t-xl"
              : "border-transparent text-violet-300/60 hover:text-white"
          }`}
        >
          <ShoppingCart className="h-4 w-4" /> Registro de Ventas & Devoluciones
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Box 1: Financial breakdown */}
          <div className="rounded-2xl border border-violet-500/20 bg-violet-950/30 p-6 shadow-xl backdrop-blur-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" /> Desglose Financiero
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-xl bg-violet-900/20 p-3 border border-violet-800/30">
                <span className="text-xs text-violet-300">Ventas Brutas:</span>
                <span className="text-sm font-bold text-white">
                  ${(stats?.sales?.totalIngresosBrutos || stats?.sales?.totalIngresos || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-amber-950/20 p-3 border border-amber-800/30">
                <span className="text-xs text-amber-300">Total Reembolsado (Devoluciones):</span>
                <span className="text-sm font-bold text-amber-300">
                  -${(stats?.sales?.totalDevuelto || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-emerald-950/30 p-3 border border-emerald-500/30">
                <span className="text-xs font-bold text-emerald-300">Ventas Netas:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  ${(stats?.sales?.totalIngresosNetos || stats?.sales?.totalIngresos || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-violet-900/20 p-3 border border-violet-800/30">
                <span className="text-xs text-violet-300">Promedio por Transacción:</span>
                <span className="text-sm font-bold text-violet-200">
                  ${(stats?.sales?.promedioVenta || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Box 2: Inventory Status */}
          <div className="rounded-2xl border border-violet-500/20 bg-violet-950/30 p-6 shadow-xl backdrop-blur-xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-violet-400" /> Estado del Inventario
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-xl bg-violet-900/20 p-3 border border-violet-800/30">
                <span className="text-xs text-violet-300">Total de Productos Registrados:</span>
                <span className="text-sm font-bold text-white">{stats?.totalProducts || 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-rose-950/30 p-3 border border-rose-800/30">
                <span className="text-xs text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-rose-400" /> Productos con Stock Bajo (&lt; 10):
                </span>
                <span className="text-sm font-bold text-rose-300">{stats?.lowStock || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EMPLOYEE & SHIFT MANAGEMENT */}
      {activeTab === "employees" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-blue-500/20 bg-blue-950/20 p-5 backdrop-blur-xl">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" /> Control de Empleados & Fichaje de Turnos
              </h2>
              <p className="text-xs text-blue-200/70">
                Gestiona el horario de entrada, departamentos y códigos únicos de tus empleados
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {employees.length === 0 ? (
              <p className="text-xs text-violet-300/60 col-span-full">No hay empleados registrados aún.</p>
            ) : (
              employees.map((emp) => (
                <div
                  key={emp.id}
                  className="rounded-2xl border border-violet-500/20 bg-violet-950/30 p-5 shadow-xl backdrop-blur-xl flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        {emp.nombre}
                        {emp.role === "admin" && (
                          <span className="text-[10px] font-mono bg-violet-600/40 text-violet-200 px-2 py-0.5 rounded-full border border-violet-500/30">
                            Dueño/Admin
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-violet-300/70">{emp.email}</p>
                      {emp.telefono && <p className="text-xs text-violet-300/50">Tel: {emp.telefono}</p>}
                    </div>

                    {/* Shift Status Badge */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                        emp.inShift
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse"
                          : "bg-slate-800/40 text-slate-400 border border-slate-700/40"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${emp.inShift ? "bg-emerald-400" : "bg-slate-500"}`} />
                      {emp.inShift ? "En Turno" : "Fuera de Turno"}
                    </span>
                  </div>

                  {/* Employee Code & Department */}
                  <div className="flex flex-col gap-2 rounded-xl bg-violet-900/20 p-3 border border-violet-800/30 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-violet-300/70 font-medium">Código Único:</span>
                      {editingCodeUser === emp.id ? (
                        <div className="flex gap-1 items-center">
                          <Input
                            size={1}
                            className="h-6 w-24 text-xs bg-violet-950 text-white font-mono border-violet-500/40"
                            placeholder="EMP-001"
                            value={newEmpCode}
                            onChange={(e) => setNewEmpCode(e.target.value)}
                          />
                          <Button
                            onClick={() => handleSaveEmpCode(emp.id)}
                            disabled={processingId === `code-${emp.id}`}
                            size="sm"
                            className="h-6 px-2 text-[10px] bg-emerald-600"
                          >
                            {processingId === `code-${emp.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : "OK"}
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingCodeUser(emp.id)
                            setNewEmpCode(emp.codigoEmpleado || "")
                          }}
                          className="font-mono font-bold text-cyan-300 hover:underline"
                        >
                          {emp.codigoEmpleado || "+ Asignar Código"}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-violet-300/70 font-medium">Área / Departamento:</span>
                      <Select
                        value={emp.departamento || "Ventas"}
                        onValueChange={(val) => handleDepartmentChange(emp.id, val)}
                        disabled={processingId === `dept-${emp.id}`}
                      >
                        <SelectTrigger className="h-7 w-32 text-xs bg-violet-950/60 border-violet-500/20 text-white">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent className="bg-violet-950 border-violet-800 text-white">
                          <SelectItem value="Caja">Caja</SelectItem>
                          <SelectItem value="Ventas">Ventas</SelectItem>
                          <SelectItem value="Atención al Cliente">Atención Cliente</SelectItem>
                          <SelectItem value="Depósito">Depósito / Stock</SelectItem>
                          <SelectItem value="Gerencia">Gerencia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {emp.inShift && emp.lastCheckIn && (
                      <div className="mt-1 text-[11px] text-emerald-300/80 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Llegada: {new Date(emp.lastCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs
                      </div>
                    )}
                  </div>

                  {/* Shift Toggle Button */}
                  <Button
                    onClick={() => handleToggleShift(emp.id)}
                    disabled={processingId === `shift-${emp.id}`}
                    variant="ghost"
                    size="sm"
                    className={`w-full text-xs font-semibold rounded-xl border ${
                      emp.inShift
                        ? "border-rose-500/30 bg-rose-950/20 text-rose-300 hover:bg-rose-900/30"
                        : "border-emerald-500/30 bg-emerald-950/20 text-emerald-300 hover:bg-emerald-900/30"
                    }`}
                  >
                    {processingId === `shift-${emp.id}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : emp.inShift ? (
                      "Marcar Salida de Turno"
                    ) : (
                      "Marcar Entrada (Fichaje)"
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SALES & REFUNDS */}
      {activeTab === "sales" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 backdrop-blur-xl">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-emerald-400" /> Historial de Ventas & Devoluciones
              </h2>
              <p className="text-xs text-emerald-200/70">
                Procesa devoluciones de venta con reembolso automático e inmediato de stock
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {sales.length === 0 ? (
              <p className="text-xs text-violet-300/60">No se han registrado ventas todavía.</p>
            ) : (
              sales.map((sale) => (
                <div
                  key={sale.id}
                  className="rounded-2xl border border-violet-500/20 bg-violet-950/30 p-4 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white">${Number(sale.total).toFixed(2)}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
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

                    <p className="text-xs text-violet-300/60">
                      Vendedor: <strong className="text-violet-200">{sale.vendedor?.nombre || "N/A"}</strong> | Fecha: {new Date(sale.createdAt).toLocaleString()}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-1">
                      {sale.items?.map((item: any) => (
                        <span key={item.id} className="text-[11px] bg-violet-900/30 text-violet-300 px-2 py-0.5 rounded-lg border border-violet-800/30">
                          {item.producto?.nombre || "Producto"} x{item.cantidad} {item.talle ? `(${item.talle})` : ""}
                        </span>
                      ))}
                    </div>
                  </div>

                  {sale.status === "completada" && (
                    <Button
                      onClick={() => handleRefundSale(sale.id)}
                      disabled={processingId === `refund-${sale.id}`}
                      size="sm"
                      variant="ghost"
                      className="text-xs font-semibold text-amber-300 border border-amber-500/30 bg-amber-950/20 hover:bg-amber-900/40 rounded-xl flex items-center gap-1.5"
                    >
                      {processingId === `refund-${sale.id}` ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Procesando...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-3.5 w-3.5" /> Procesar Devolución
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
