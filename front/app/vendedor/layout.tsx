import type React from "react"
import { VendedorNav } from "@/components/vendedor-nav"
import { ProtectedRoute } from "@/components/protected-route"

export default function VendedorLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="vendedor">
      <div className="min-h-screen bg-[#090714] text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
        <VendedorNav />
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
