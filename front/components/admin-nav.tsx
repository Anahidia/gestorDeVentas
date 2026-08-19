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
    <nav className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-8">
        <Link href="/admin" className="text-xl font-bold text-primary flex items-center gap-2">
          {business?.nombre || "Admin Panel"}
        </Link>
        <div className="flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button variant="ghost" className={cn("gap-2 hover:bg-muted", isActive && "bg-muted text-primary")}>
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
            className="flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-950/40 px-3 py-1.5 text-xs font-mono font-medium text-violet-300 transition-all hover:bg-violet-900/40"
          >
            <Key className="h-3.5 w-3.5 text-violet-400" />
            <span>Código Empleados: <strong className="text-white">{business.inviteCode}</strong></span>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-violet-400" />}
          </button>
        )}
        <span className="text-sm text-muted-foreground">{user?.nombre}</span>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 hover:bg-muted">
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>
    </nav>
  )
}
