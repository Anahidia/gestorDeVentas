"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { api } from "@/lib/api"

interface User {
  id: string
  email: string
  nombre: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = api.getToken()
        if (token) {
          const profile = await api.getProfile()
          setUser(profile)
        }
      } catch (error) {
        api.clearToken()
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password)
    setUser(data.user)
  }

  const logout = () => {
    api.clearToken()
    setUser(null)
  }

  const isAdmin = user?.role === "admin"

  return <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
