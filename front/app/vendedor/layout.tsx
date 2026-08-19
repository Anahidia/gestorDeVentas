"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { VendedorNav } from "@/components/vendedor-nav"

export default function VendedorLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090714] text-blue-300">
        <div className="text-lg font-medium animate-pulse">Cargando Panel de Empleado...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#090714] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      <VendedorNav />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
    </div>
  )
}
