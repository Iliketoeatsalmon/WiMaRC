/**
 * Application Sidebar Navigation
 *
 * Main navigation sidebar with role-based menu items.
 * Shows different options based on user role (User vs Admin).
 */

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Satellite,
  Map,
  ArrowLeftRight,
  Sprout,
  CreditCard as SimCard,
  Users,
  LogOut,
  Cloud,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Base navigation items available to all users
  const baseNavItems = [
    { href: "/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
    { href: "/stations", label: "สถานี", icon: Satellite },
    { href: "/map", label: "แผนที่", icon: Map },
    { href: "/comparison", label: "เปรียบเทียบสถานี", icon: ArrowLeftRight },
    { href: "/activities", label: "กิจกรรมแปลง", icon: Sprout },
  ]

  // Admin-only navigation items
  const adminNavItems = [
    { href: "/sim-management", label: "จัดการซิมการ์ด", icon: SimCard },
    { href: "/user-management", label: "จัดการผู้ใช้", icon: Users },
  ]

  // Combine nav items based on user role
  const navItems = user?.role === "admin" ? [...baseNavItems, ...adminNavItems] : baseNavItems

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo and title */}
      <div className="flex h-16 items-center border-b px-6">
        <Cloud className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">AgriMonitor</span>
      </div>

      {/* User info */}
      <div className="border-b px-6 py-4">
        <p className="text-sm font-medium">{user?.name}</p>
        <p className="text-xs text-muted-foreground">{user?.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้"}</p>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout button */}
      <div className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start" onClick={logout}>
          <LogOut className="mr-3 h-5 w-5" />
          ออกจากระบบ
        </Button>
      </div>
    </div>
  )
}
