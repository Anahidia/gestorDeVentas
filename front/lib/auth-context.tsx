"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { api } from "./api"

interface Business {
  id: string
  nombre: string
  direccion?: string
  telefono?: string
  logoUrl?: string
  inviteCode?: string
}

interface User {
  id: string
  email: string
  nombre: string
  telefono?: string
  role: string
}

interface AuthContextType {
  user: User | null
  business: Business | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  registerAdmin: (data: any) => Promise<void>
  registerEmployee: (data: any) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = api.getToken()
        if (token) {
          const profile = await api.getProfile()
          setUser(profile)
          const savedBusiness = localStorage.getItem("business")
          if (savedBusiness) {
            setBusiness(JSON.parse(savedBusiness))
          }
        }
      } catch (error) {
        api.clearToken()
        localStorage.removeItem("business")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password)
    setUser(data.user)
    if (data.business) {
      setBusiness(data.business)
    }
  }

  const registerAdmin = async (adminData: any) => {
    const data = await api.registerAdmin(adminData)
    setUser(data.user)
    if (data.business) {
      setBusiness(data.business)
    }
  }

  const registerEmployee = async (employeeData: any) => {
    const data = await api.registerEmployee(employeeData)
    setUser(data.user)
    if (data.business) {
      setBusiness(data.business)
    }
  }

  const logout = () => {
    api.clearToken()
    localStorage.removeItem("business")
    setUser(null)
    setBusiness(null)
  }

  const isAdmin = user?.role === "admin"

  return (
    <AuthContext.Provider
      value={{ user, business, loading, login, registerAdmin, registerEmployee, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
