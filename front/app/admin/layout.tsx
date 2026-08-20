import type React from "react"
import { AdminNav } from "@/components/admin-nav"
import { ProtectedRoute } from "@/components/protected-route"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-[#090714] text-slate-100 font-sans selection:bg-violet-600 selection:text-white">
        <AdminNav />
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
