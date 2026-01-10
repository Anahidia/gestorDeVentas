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
    <nav className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-8">
        <Link href="/vendedor" className="text-xl font-bold text-primary">
          Panel Vendedor
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
        <span className="text-sm text-muted-foreground">{user?.nombre}</span>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 hover:bg-muted">
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>
    </nav>
  )
}
