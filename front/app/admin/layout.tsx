"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AdminNav } from "@/components/admin-nav"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/login")
    }
  }, [user, loading, isAdmin, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090714] text-violet-300">
        <div className="text-lg font-medium animate-pulse">Cargando Panel de Administración...</div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#090714] text-slate-100 font-sans selection:bg-violet-600 selection:text-white">
      <AdminNav />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
    </div>
  )
}
