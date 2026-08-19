"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, ClipboardList, BarChart3, LogOut, FolderOpen, Key, Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, business, logout } = useAuth()
  const [copied, setCopied] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleCopyCode = () => {
    if (business?.inviteCode) {
      navigator.clipboard.writeText(business.inviteCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/products", label: "Productos", icon: Package },
    { href: "/admin/categorias", label: "Categorías", icon: FolderOpen },
    { href: "/admin/ventas", label: "Ventas", icon: ShoppingCart },
    { href: "/admin/encargos", label: "Encargos", icon: ClipboardList },
  ]

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-violet-500/20 bg-violet-950/40 px-6 backdrop-blur-xl shadow-lg">
      <div className="flex items-center gap-8">
        <Link href="/admin" className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-200 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
          {business?.nombre || "Admin Panel"}
        </Link>
        <div className="flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "gap-2 text-xs font-medium text-violet-200/70 hover:bg-violet-900/30 hover:text-white rounded-xl transition-all",
                    isActive && "bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-md shadow-violet-900/40"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {business?.inviteCode && (
          <button
            type="button"
            onClick={handleCopyCode}
            title="Haz clic para copiar el código de invitación de empleados"
            className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-3 py-1.5 text-xs font-mono font-medium text-cyan-300 transition-all hover:bg-cyan-900/40 hover:shadow-md hover:shadow-cyan-900/20"
          >
            <Key className="h-3.5 w-3.5 text-cyan-400" />
            <span>Código Empleados: <strong className="text-white">{business.inviteCode}</strong></span>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-cyan-400" />}
          </button>
        )}
        <span className="text-xs font-medium text-violet-300/80 bg-violet-900/20 px-3 py-1.5 rounded-xl border border-violet-800/30">
          {user?.nombre}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="gap-2 text-xs text-red-300/80 hover:bg-red-950/40 hover:text-red-200 rounded-xl"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>
    </nav>
  )
}
