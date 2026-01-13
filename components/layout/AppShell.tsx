"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppSidebar } from "@/components/layout/AppSidebar"

const PUBLIC_ROUTES = new Set<string>(["/"])

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const isPublicRoute = PUBLIC_ROUTES.has(pathname ?? "")

  useEffect(() => {
    if (!isPublicRoute && !isAuthenticated) {
      router.push("/")
    }
  }, [isPublicRoute, isAuthenticated, router])

  if (isPublicRoute) {
    return <>{children}</>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
