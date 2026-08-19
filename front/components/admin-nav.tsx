"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart, ClipboardList, BarChart3, LogOut, FolderOpen, Key, Check, Copy, Store } from "lucide-react"
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
    <header className="sticky top-3 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all">
      <nav className="flex h-14 items-center justify-between rounded-full border border-violet-500/20 bg-[#0a0718]/60 p-2 px-5 backdrop-blur-2xl shadow-2xl shadow-violet-950/40">
        {/* Left: Store Brand */}
        <Link href="/admin" className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-200 to-cyan-300 bg-clip-text text-transparent flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-900/40 border border-violet-500/30 text-violet-300">
            <Store className="h-3.5 w-3.5" />
          </div>
          <span>{business?.nombre || "Admin Panel"}</span>
        </Link>

        {/* Center: Liquid Meniscus Subtle Floating Dock */}
        <div className="flex items-center rounded-full border border-violet-500/15 bg-violet-950/40 p-1 backdrop-blur-xl">
          <div className="flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-medium transition-all duration-300 cursor-pointer select-none",
                      isActive
                        ? "bg-gradient-to-r from-violet-600/90 to-cyan-500/90 text-white font-semibold shadow-[0_0_15px_rgba(139,92,246,0.35)] scale-[1.02]"
                        : "text-violet-300/60 hover:text-white hover:bg-violet-900/20"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right: Code, User & Logout */}
        <div className="flex items-center gap-2.5">
          {business?.inviteCode && (
            <button
              type="button"
              onClick={handleCopyCode}
              title="Copiar código de empleados"
              className="hidden lg:flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-950/20 px-3 py-1 text-[11px] font-mono text-cyan-300 transition-all hover:bg-cyan-900/30"
            >
              <Key className="h-3 w-3 text-cyan-400" />
              <span>Código: <strong className="text-white">{business.inviteCode}</strong></span>
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-cyan-400" />}
            </button>
          )}

          <span className="text-[11px] font-medium text-violet-200/80 bg-violet-900/20 px-2.5 py-1 rounded-full border border-violet-800/30">
            {user?.nombre}
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
