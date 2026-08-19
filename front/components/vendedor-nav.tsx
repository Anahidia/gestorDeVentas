"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { api } from "@/lib/api"
import { useToast } from "@/lib/toast-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ClipboardList, LogOut, Store, Clock, Loader2, LogIn, LogOut as ShiftOut, Package } from "lucide-react"
import { cn } from "@/lib/utils"

export function VendedorNav() {
  const pathname = usePathname()
  const router = useRouter()
  const toast = useToast()
  const { user, logout, refreshProfile } = useAuth()
  const [loadingShift, setLoadingShift] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleToggleShift = async () => {
    if (!user?.id) return
    setLoadingShift(true)
    const currentlyInShift = Boolean(user.inShift)
    try {
      await api.toggleUserShift(user.id)
      await refreshProfile()
      if (currentlyInShift) {
        toast.success("Salida de turno registrada correctamente", "Fichaje Laboral")
      } else {
        toast.success("¡Entrada laboral (fichaje) registrada correctamente!", "Fichaje Registrado")
      }
    } catch (err: any) {
      toast.error(err.message || "Error al registrar fichaje laboral", "Error")
    } finally {
      setLoadingShift(false)
    }
  }

  const navItems = [
    { href: "/vendedor", label: "Nueva Venta", icon: ShoppingCart },
    { href: "/vendedor/products", label: "Cargar Productos", icon: Package },
    { href: "/vendedor/encargos", label: "Mis Encargos", icon: ClipboardList },
  ]

  return (
    <header className="sticky top-3 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all">
      <nav className="flex h-14 items-center justify-between rounded-full border border-blue-500/20 bg-[#0a0718]/60 p-2 px-5 backdrop-blur-2xl shadow-2xl shadow-violet-950/40">
        {/* Left: Brand Title */}
        <Link href="/vendedor" className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-200 to-cyan-300 bg-clip-text text-transparent flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
            <Store className="h-3.5 w-3.5" />
          </div>
          <span>P.O.S. Vendedor</span>
        </Link>

        {/* Center: Subtle Liquid Dock */}
        <div className="flex items-center rounded-full border border-blue-500/15 bg-violet-950/40 p-1 backdrop-blur-xl">
          <div className="flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-medium transition-all duration-300 cursor-pointer select-none",
                      isActive
                        ? "bg-gradient-to-r from-blue-600/90 to-cyan-500/90 text-white font-semibold shadow-[0_0_15px_rgba(59,130,246,0.35)] scale-[1.02]"
                        : "text-blue-200/60 hover:text-white hover:bg-blue-900/20"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right: Shift Clock-In/Out, User & Exit */}
        <div className="flex items-center gap-2.5">
          {/* Fichaje Laboral Dynamic Toggle Button */}
          {user && (
            <button
              onClick={handleToggleShift}
              disabled={loadingShift}
              title={user.inShift ? "Haz clic para registrar tu Salida de Turno" : "Haz clic para registrar tu Entrada de Turno"}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-extrabold transition-all shadow-lg ${
                user.inShift
                  ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-rose-600/30 hover:brightness-110"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-600/30 hover:brightness-110 animate-pulse"
              }`}
            >
              {loadingShift ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : user.inShift ? (
                <ShiftOut className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              <span>{user.inShift ? "Fichar Salida" : "Fichar Entrada"}</span>
            </button>
          )}

          <span className="text-[11px] font-medium text-cyan-300/80 bg-cyan-950/30 px-2.5 py-1 rounded-full border border-cyan-800/30">
            {user?.nombre} {user?.departamento ? `(${user.departamento})` : ""}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-7 px-2.5 text-xs text-rose-300/80 hover:bg-rose-950/30 hover:text-rose-200 rounded-full"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </nav>
    </header>
  )
}
