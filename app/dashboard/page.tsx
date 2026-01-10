/**
 * Dashboard Page
 *
 * Main dashboard showing overview of all assigned stations.
 * For Users: shows only permitted stations
 * For Admins: shows all stations
 *
 * Displays:
 * - Station cards with status and images
 * - Current weather summary
 * - Weather forecast
 * - Quick access to station details
 */

"use client"
import { useAuth } from "@/contexts/auth-context"
import { AppLayout } from "@/components/layout/app-layout"
import { StationCard } from "@/components/dashboard/station-card"
import { WeatherSummary } from "@/components/dashboard/weather-summary"
import { ForecastCard } from "@/components/dashboard/forecast-card"
import { mockStations, generateMockWeatherData, mockWeatherForecast } from "@/lib/mock-data"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Handle authentication redirect
  useEffect(() => {
    setMounted(true)
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (!mounted || isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  // Filter stations based on user permissions
  const accessibleStations =
    user.role === "admin" ? mockStations : mockStations.filter((station) => user.permittedStations.includes(station.id))

  // Get latest weather data from first weather station
  const weatherStation = accessibleStations.find((s) => s.type === "weather")
  const latestWeatherData = weatherStation ? generateMockWeatherData(weatherStation.id, 1)[0] : null

  // Count online/offline stations
  const onlineCount = accessibleStations.filter((s) => s.status === "online").length
  const offlineCount = accessibleStations.filter((s) => s.status === "offline").length

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-balance">แดชบอร์ด</h1>
          <p className="text-muted-foreground mt-1">
            ยินดีต้อนรับ, {user.name}. คุณสามารถเข้าถึงได้ {accessibleStations.length} สถานี
          </p>
        </div>

        {/* Station status summary */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-medium text-muted-foreground">สถานีทั้งหมด</p>
            <p className="text-3xl font-bold mt-2">{accessibleStations.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-medium text-muted-foreground">ออนไลน์</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{onlineCount}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-medium text-muted-foreground">ออฟไลน์</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">{offlineCount}</p>
          </div>
        </div>

        {/* Weather summary and forecast */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <WeatherSummary data={latestWeatherData} />
          <ForecastCard forecasts={mockWeatherForecast} />
        </div>

        {/* Station cards */}
        <div>
          <h2 className="text-xl font-semibold mb-4">สถานีของคุณ</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accessibleStations.map((station) => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
