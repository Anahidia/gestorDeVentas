"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/vendedor")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Sistema de Ventas</CardTitle>
          <CardDescription className="text-muted-foreground">
            Gestión completa de productos, ventas y encargos
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={() => router.push("/login")} size="lg" className="w-full bg-primary hover:bg-primary/90">
            Iniciar Sesión
          </Button>
          <Button
            onClick={() => router.push("/register")}
            variant="outline"
            size="lg"
            className="w-full border-border hover:bg-muted"
          >
            Registrarse
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
