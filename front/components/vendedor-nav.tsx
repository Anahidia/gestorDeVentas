"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ClipboardList, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

export function VendedorNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const navItems = [
    { href: "/vendedor", label: "Nueva Venta", icon: ShoppingCart },
    { href: "/vendedor/encargos", label: "Mis Encargos", icon: ClipboardList },
  ]

  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-blue-500/20 bg-violet-950/40 px-6 backdrop-blur-xl shadow-lg">
      <div className="flex items-center gap-8">
        <Link href="/vendedor" className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-200 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
          P.O.S. Vendedor
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
                    "gap-2 text-xs font-medium text-blue-200/70 hover:bg-blue-900/30 hover:text-white rounded-xl transition-all",
                    isActive && "bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-md shadow-blue-900/40"
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
        <span className="text-xs font-medium text-cyan-300/80 bg-cyan-950/40 px-3 py-1.5 rounded-xl border border-cyan-800/30">
          {user?.nombre} {user?.departamento ? `(${user.departamento})` : ""}
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
