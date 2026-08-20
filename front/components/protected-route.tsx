"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2, ShieldAlert } from "lucide-react"

import GlobalLoading from "@/app/loading"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "vendedor"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, business, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirigir a login si no hay sesión activa
        router.push("/login")
        return
      }

      const userRole = user.role?.toLowerCase()

      if (requiredRole === "admin" && userRole !== "admin") {
        // Si no es admin intentando ingresar a /admin, redirigir al panel de vendedor
        router.push("/vendedor")
        return
      }

      if (requiredRole === "vendedor" && userRole !== "vendedor" && userRole !== "admin") {
        router.push("/login")
        return
      }
    }
  }, [user, loading, requiredRole, router])

  if (loading || !user) {
    return <GlobalLoading />
  }

  const userRole = user.role?.toLowerCase()
  if (requiredRole === "admin" && userRole !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090714] text-rose-300 p-4">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-8 shadow-2xl backdrop-blur-xl text-center max-w-md">
          <ShieldAlert className="h-10 w-10 text-rose-400" />
          <h2 className="text-lg font-extrabold text-white">Acceso Restringido</h2>
          <p className="text-xs text-rose-200/70">
            Tu cuenta está registrada como Vendedor en <strong>{business?.nombre || "tu comercio"}</strong>. Solo el dueño/administrador puede acceder a esta sección.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
