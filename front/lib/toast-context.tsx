"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react"

export type ToastType = "success" | "error" | "info" | "warning"

export interface ToastMessage {
  id: string
  title?: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (options: { message: string; type?: ToastType; title?: string }) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ message, type = "info", title }: { message: string; type?: ToastType; title?: string }) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: ToastMessage = { id, message, type, title }

      setToasts((prev) => [...prev, newToast])

      setTimeout(() => {
        removeToast(id)
      }, 4000)
    },
    [removeToast]
  )

  const success = useCallback((message: string, title?: string) => toast({ message, type: "success", title }), [toast])
  const error = useCallback((message: string, title?: string) => toast({ message, type: "error", title }), [toast])
  const info = useCallback((message: string, title?: string) => toast({ message, type: "info", title }), [toast])
  const warning = useCallback((message: string, title?: string) => toast({ message, type: "warning", title }), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}

      {/* Floating Toast Stack */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none">
        {toasts.map((t) => {
          const isSuccess = t.type === "success"
          const isError = t.type === "error"
          const isWarning = t.type === "warning"

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
                isSuccess
                  ? "border-emerald-500/40 bg-emerald-950/80 text-emerald-100 shadow-emerald-950/50"
                  : isError
                  ? "border-rose-500/40 bg-rose-950/80 text-rose-100 shadow-rose-950/50"
                  : isWarning
                  ? "border-amber-500/40 bg-amber-950/80 text-amber-100 shadow-amber-950/50"
                  : "border-cyan-500/40 bg-violet-950/80 text-cyan-100 shadow-violet-950/50"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                {isError && <XCircle className="h-5 w-5 text-rose-400" />}
                {isWarning && <AlertCircle className="h-5 w-5 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="h-5 w-5 text-cyan-400" />}
              </div>

              <div className="flex-1">
                {t.title && <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5">{t.title}</h4>}
                <p className="text-xs font-medium leading-relaxed">{t.message}</p>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
