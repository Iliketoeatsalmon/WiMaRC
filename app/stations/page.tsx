/**
 * Stations List Page
 *
 * Shows list of all accessible stations with filtering and search.
 * Users see only their permitted stations, Admins see all.
 */

"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { StationCard } from "@/components/dashboard/station-card"
import { mockStations } from "@/lib/mock-data"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export default function StationsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  useEffect(() => {
    setMounted(true)
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (!mounted || isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Filter stations based on user permissions
  let accessibleStations =
    user.role === "admin" ? mockStations : mockStations.filter((station) => user.permittedStations.includes(station.id))

  // Apply filters
  accessibleStations = accessibleStations.filter((station) => {
    const matchesSearch =
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.location.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || station.status === statusFilter
    const matchesType = typeFilter === "all" || station.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">สถานี</h1>
          <p className="text-muted-foreground mt-1">ตรวจสอบและจัดการสถานีเกษตรของคุณ</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหาสถานี..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">สถานะทั้งหมด</SelectItem>
              <SelectItem value="online">ออนไลน์</SelectItem>
              <SelectItem value="offline">ออฟไลน์</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="ประเภท" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ประเภททั้งหมด</SelectItem>
              <SelectItem value="weather">สถานีอากาศ</SelectItem>
              <SelectItem value="soil">สถานีดิน</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Station cards grid */}
        {accessibleStations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accessibleStations.map((station) => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-medium">ไม่พบสถานี</p>
            <p className="text-sm text-muted-foreground mt-1">ลองปรับตัวกรองของคุณ</p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
