"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store, Lock, Mail, TrendingUp, DollarSign, Sparkles, ShoppingBag, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas. Por favor verifica tus datos.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#090714] overflow-hidden p-4 font-sans text-slate-100">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-indigo-900/10 blur-3xl pointer-events-none"></div>

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-violet-500/20 bg-violet-950/30 p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-violet-500/30 hover:shadow-violet-900/20">
        {/* Header Badge & Title */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-blue-500 shadow-lg shadow-violet-600/30">
            <Store className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-200 to-blue-400 bg-clip-text text-transparent">
            Los Siete Díaz
          </h1>
          <p className="mt-1.5 text-xs text-violet-300/70 flex items-center gap-1 font-medium">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Sistema de Gestión de Ventas & Comercio
          </p>
        </div>

        {/* Feature Pill Row */}
        <div className="mb-6 flex justify-around rounded-xl bg-violet-900/20 p-2 border border-violet-800/20 text-[11px] text-violet-300 font-medium">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Estadísticas
          </span>
          <span className="flex items-center gap-1">
            <ShoppingBag className="h-3.5 w-3.5 text-violet-400" /> Inventario
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-3.5 w-3.5 text-blue-400" /> P.O.S. Ventas
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-violet-200/80">
              Correo Electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
              <Input
                id="email"
                type="email"
                placeholder="usuario@negocio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-violet-500/20 bg-violet-950/40 pl-10 text-white placeholder:text-violet-400/40 focus:border-violet-400 focus:ring-violet-400/20 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-violet-200/80">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 border-violet-500/20 bg-violet-950/40 pl-10 text-white placeholder:text-violet-400/40 focus:border-violet-400 focus:ring-violet-400/20 rounded-xl text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-center text-xs font-medium text-red-300">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="group relative mt-2 h-11 w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 font-semibold text-white shadow-lg shadow-violet-600/30 transition-all hover:shadow-violet-600/50 hover:brightness-110 active:scale-[0.99]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                "Iniciando Sesión..."
              ) : (
                <>
                  Ingresar al Sistema <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </span>
          </Button>

          <div className="mt-4 text-center border-t border-violet-500/10 pt-4">
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="text-xs text-violet-300/80 hover:text-cyan-300 transition-colors font-medium hover:underline"
            >
              ¿No tienes cuenta? Registra tu comercio o únete como empleado
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
