"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store, User, Mail, Lock, Phone, MapPin, KeyRound, Sparkles, Building2, UserCheck, ArrowRight, Image as ImageIcon } from "lucide-react"
import { Dropzone } from "@/components/ui/dropzone"

export default function RegisterPage() {
  const [tab, setTab] = useState<"admin" | "employee">("admin")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { registerAdmin, registerEmployee } = useAuth()
  const router = useRouter()

  // Admin Form State
  const [adminForm, setAdminForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    password: "",
    nombreNegocio: "",
    direccionNegocio: "",
    telefonoNegocio: "",
    logoUrl: "",
  })

  // Employee Form State
  const [employeeForm, setEmployeeForm] = useState({
    inviteCode: "",
    nombre: "",
    email: "",
    telefono: "",
    password: "",
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await registerAdmin({ ...adminForm, logoFile })
      router.push("/admin")
    } catch (err: any) {
      setError(err.message || "Error al registrar el negocio")
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await registerEmployee(employeeForm)
      router.push("/vendedor")
    } catch (err: any) {
      setError(err.message || "Error al registrarse como empleado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#090714] overflow-hidden p-4 py-8 font-sans text-slate-100">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl animate-pulse delay-1000"></div>

      {/* Main Glass Container */}
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-violet-500/20 bg-violet-950/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all">
        {/* Header */}
        <div className="mb-6 text-center flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-blue-500 shadow-lg shadow-violet-600/30">
            <Store className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-violet-200 to-blue-400 bg-clip-text text-transparent">
            Registro en Los Siete Díaz
          </h1>
          <p className="mt-1 text-xs text-violet-300/70">
            Crea tu comercio o únete al equipo con tu código de invitación
          </p>
        </div>

        {/* Tab Selector */}
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-violet-950/60 p-1.5 border border-violet-800/30">
          <button
            type="button"
            onClick={() => { setTab("admin"); setError(""); }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
              tab === "admin"
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-900/40"
                : "text-violet-300/70 hover:text-white hover:bg-violet-900/20"
            }`}
          >
            <Building2 className="h-4 w-4" /> Registrar mi Negocio (Dueño)
          </button>
          <button
            type="button"
            onClick={() => { setTab("employee"); setError(""); }}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
              tab === "employee"
                ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-900/40"
                : "text-violet-300/70 hover:text-white hover:bg-violet-900/20"
            }`}
          >
            <UserCheck className="h-4 w-4" /> Unirme como Empleado
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-center text-xs font-medium text-red-300">
            {error}
          </div>
        )}

        {/* TAB 1: ADMIN REGISTRATION */}
        {tab === "admin" ? (
          <form onSubmit={handleAdminSubmit} className="flex flex-col gap-4">
            <div className="rounded-xl border border-violet-500/20 bg-violet-900/10 p-4 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-violet-400" /> Datos del Comercio / Local
              </span>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nombreNegocio" className="text-xs text-violet-200">Nombre del Negocio *</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-violet-400" />
                    <Input
                      id="nombreNegocio"
                      placeholder="Ej. Tienda Central"
                      value={adminForm.nombreNegocio}
                      onChange={(e) => setAdminForm({ ...adminForm, nombreNegocio: e.target.value })}
                      required
                      className="h-10 border-violet-500/20 bg-violet-950/40 pl-9 text-xs text-white placeholder:text-violet-400/40"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="telefonoNegocio" className="text-xs text-violet-200">Teléfono Comercio</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-violet-400" />
                    <Input
                      id="telefonoNegocio"
                      placeholder="+54 9 11 1234-5678"
                      value={adminForm.telefonoNegocio}
                      onChange={(e) => setAdminForm({ ...adminForm, telefonoNegocio: e.target.value })}
                      className="h-10 border-violet-500/20 bg-violet-950/40 pl-9 text-xs text-white placeholder:text-violet-400/40"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="direccionNegocio" className="text-xs text-violet-200">Dirección</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-violet-400" />
                  <Input
                    id="direccionNegocio"
                    placeholder="Av. Principal 123, Ciudad"
                    value={adminForm.direccionNegocio}
                    onChange={(e) => setAdminForm({ ...adminForm, direccionNegocio: e.target.value })}
                    className="h-10 border-violet-500/20 bg-violet-950/40 pl-9 text-xs text-white placeholder:text-violet-400/40"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-violet-200 font-semibold">Logo del Comercio (Opcional)</Label>
                <Dropzone
                  onFileSelect={(file) => {
                    setLogoFile(file)
                    if (file) {
                      setAdminForm({ ...adminForm, logoUrl: URL.createObjectURL(file) })
                    } else {
                      setAdminForm({ ...adminForm, logoUrl: "" })
                    }
                  }}
                  currentImage={adminForm.logoUrl}
                  label={adminForm.nombreNegocio || "Logo del Comercio"}
                />
              </div>
            </div>

            <div className="rounded-xl border border-violet-500/20 bg-violet-900/10 p-4 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                <User className="h-4 w-4 text-violet-400" /> Datos del Administrador (Dueño)
              </span>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="adminNombre" className="text-xs text-violet-200">Tu Nombre Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-violet-400" />
                    <Input
                      id="adminNombre"
                      placeholder="Juan Pérez"
                      value={adminForm.nombre}
                      onChange={(e) => setAdminForm({ ...adminForm, nombre: e.target.value })}
                      required
                      className="h-10 border-violet-500/20 bg-violet-950/40 pl-9 text-xs text-white placeholder:text-violet-400/40"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="adminTelefono" className="text-xs text-violet-200">Tu Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-violet-400" />
                    <Input
                      id="adminTelefono"
                      placeholder="+54 9 ..."
                      value={adminForm.telefono}
                      onChange={(e) => setAdminForm({ ...adminForm, telefono: e.target.value })}
                      className="h-10 border-violet-500/20 bg-violet-950/40 pl-9 text-xs text-white placeholder:text-violet-400/40"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="adminEmail" className="text-xs text-violet-200">Correo Electrónico (Gmail) *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-violet-400" />
                    <Input
                      id="adminEmail"
                      type="email"
                      placeholder="admin@gmail.com"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      required
                      className="h-10 border-violet-500/20 bg-violet-950/40 pl-9 text-xs text-white placeholder:text-violet-400/40"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="adminPassword" className="text-xs text-violet-200">Contraseña de Inicio *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-violet-400" />
                    <Input
                      id="adminPassword"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      required
                      minLength={6}
                      className="h-10 border-violet-500/20 bg-violet-950/40 pl-9 text-xs text-white placeholder:text-violet-400/40"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white shadow-lg shadow-violet-600/30 hover:brightness-110"
            >
              {loading ? "Creando Comercio..." : "Registrar Comercio & Administrador"}
            </Button>
          </form>
        ) : (
          /* TAB 2: EMPLOYEE REGISTRATION */
          <form onSubmit={handleEmployeeSubmit} className="flex flex-col gap-4">
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-cyan-400" /> Código de Invitación del Negocio
              </span>
              <p className="text-xs text-cyan-200/70">
                Ingresa el código alfanumérico provisto por tu Administrador (ej. L7D-4K8P)
              </p>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400" />
                <Input
                  id="inviteCode"
                  placeholder="Código de Invitación (ej. L7D-XXXX)"
                  value={employeeForm.inviteCode}
                  onChange={(e) => setEmployeeForm({ ...employeeForm, inviteCode: e.target.value.toUpperCase() })}
                  required
                  className="h-11 border-cyan-500/30 bg-violet-950/60 pl-10 text-sm font-mono tracking-widest text-cyan-200 placeholder:text-cyan-400/30 uppercase"
                />
              </div>
            </div>

            <div className="rounded-xl border border-violet-500/20 bg-violet-900/10 p-4 flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                <User className="h-4 w-4 text-violet-400" /> Datos Personales del Empleado
              </span>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="empNombre" className="text-xs text-violet-200">Nombre Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-violet-400" />
                    <Input
                      id="empNombre"
                      placeholder="Tu Nombre"
                      value={employeeForm.nombre}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, nombre: e.target.value })}
                      required
                      className="h-10 border-violet-500/20 bg-violet-950/40 pl-9 text-xs text-white placeholder:text-violet-400/40"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="empTelefono" className="text-xs text-violet-200">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-violet-400" />
                    <Input
                      id="empTelefono"
                      placeholder="+54 9 ..."
                      value={employeeForm.telefono}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, telefono: e.target.value })}
                      className="h-10 border-violet-500/20 bg-violet-950/40 pl-9 text-xs text-white placeholder:text-violet-400/40"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="empEmail" className="text-xs text-violet-200">Correo Electrónico (Gmail) *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-violet-400" />
                    <Input
                      id="empEmail"
                      type="email"
                      placeholder="empleado@gmail.com"
                      value={employeeForm.email}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                      required
                      className="h-10 border-violet-500/20 bg-violet-950/40 pl-9 text-xs text-white placeholder:text-violet-400/40"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="empPassword" className="text-xs text-violet-200">Contraseña de Inicio *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-violet-400" />
                    <Input
                      id="empPassword"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={employeeForm.password}
                      onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                      required
                      minLength={6}
                      className="h-10 border-violet-500/20 bg-violet-950/40 pl-9 text-xs text-white placeholder:text-violet-400/40"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold text-white shadow-lg shadow-blue-600/30 hover:brightness-110"
            >
              {loading ? "Verificando Código..." : "Ingresar como Empleado"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center border-t border-violet-500/10 pt-4">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-xs text-violet-300/80 hover:text-cyan-300 transition-colors font-medium hover:underline"
          >
            ¿Ya tienes una cuenta registrado? Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}
