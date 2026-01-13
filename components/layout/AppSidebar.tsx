/**
 * Application Sidebar Navigation
 * Role-based navigation menu with Thai labels
 * Hides admin pages from non-admin users
 */

"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  History,
  Calendar,
  Download,
  Activity,
  Map,
  GitCompare,
  Settings,
  Users,
  CreditCard,
} from "lucide-react"
import { canAccessAdminPages, canAccessSimPayments } from "@/utils/permissions"

/**
 * Navigation link item type
 */
interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
  requiresSimAccess?: boolean
}

/**
 * Navigation menu items
 */
const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "ดูข้อมูลสภาวะแวดล้อม",
    icon: LayoutDashboard,
  },
  {
    href: "/historical",
    label: "ดูข้อมูลย้อนหลัง",
    icon: History,
  },
  {
    href: "/daily",
    label: "ค่าเฉลี่ยรายวัน",
    icon: Calendar,
  },
  {
    href: "/download",
    label: "ดาวน์โหลดข้อมูล",
    icon: Download,
  },
  {
    href: "/activities",
    label: "กิจกรรมแปลงเพาะปลูก",
    icon: Activity,
  },
  {
    href: "/map",
    label: "แผนที่จุดติดตั้ง",
    icon: Map,
  },
  {
    href: "/compare",
    label: "เปรียบเทียบ 2 สถานี",
    icon: GitCompare,
  },
  {
    href: "/admin/system-status",
    label: "สถานะการทำงานของระบบ",
    icon: Settings,
    adminOnly: true,
  },
  {
    href: "/admin/users",
    label: "จัดการผู้ใช้งาน",
    icon: Users,
    adminOnly: true,
  },
  {
    href: "/sim-payment",
    label: "จัดการซิม",
    icon: CreditCard,
    requiresSimAccess: true,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Filter nav items based on user permissions
  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly && !canAccessAdminPages(user)) return false
    if (item.requiresSimAccess && !canAccessSimPayments(user)) return false
    return true
  })

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r bg-muted/30">
      <nav className="space-y-1 p-4">
        {visibleNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
