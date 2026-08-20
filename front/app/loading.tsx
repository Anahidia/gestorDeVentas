"use client"

import React from "react"
import { Store, Sparkles, Loader2 } from "lucide-react"

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-[#090714] font-sans text-slate-100 overflow-hidden">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl animate-pulse delay-1000"></div>

      {/* Main Glassmorphic Loading Box */}
      <div className="relative z-10 flex flex-col items-center gap-6 rounded-3xl border border-violet-500/30 bg-[#0a0718]/80 p-8 sm:p-12 shadow-[0_0_60px_rgba(139,92,246,0.3)] backdrop-blur-2xl text-center max-w-sm w-full mx-4">
        {/* Animated Icon Ring */}
        <div className="relative flex items-center justify-center">
          {/* Spinning Gradient Ring */}
          <div className="h-20 w-20 rounded-full border-4 border-transparent border-t-violet-500 border-r-cyan-400 animate-spin"></div>
          
          {/* Center Pulsing Icon */}
          <div className="absolute flex h-14 w-14 items-center justify-center rounded-full bg-violet-950/80 border border-violet-500/40 text-cyan-300 shadow-inner">
            <Store className="h-7 w-7 animate-bounce" />
          </div>
        </div>

        {/* Brand Title */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-violet-200 to-cyan-300 bg-clip-text text-transparent flex items-center gap-2">
            <span>Fullstore</span>
            <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
          </h1>
          <p className="text-xs text-violet-300/70 font-medium">Sistema POS & Control de Inventario</p>
        </div>

        {/* Loading Progress Indicator */}
        <div className="w-full flex flex-col items-center gap-2 mt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-violet-950/80 border border-violet-800/40">
            <div className="h-full w-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 animate-pulse rounded-full"></div>
          </div>
          <span className="text-[11px] font-mono text-cyan-300/80 flex items-center gap-1.5 mt-1">
            <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />
            Cargando sistema...
          </span>
        </div>
      </div>
    </div>
  )
}
