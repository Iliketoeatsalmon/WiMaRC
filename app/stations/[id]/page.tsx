/**
 * Station Detail Page
 *
 * Detailed view of a single station showing:
 * - Real-time sensor data
 * - Historical data charts with time range selection
 * - Latest station image
 * - Weather forecast (for weather stations)
 * - Daily statistics
 * - CSV export functionality
 */

"use client"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, useParams } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TimeRangeSelector } from "@/components/stations/time-range-selector"
import { SensorChart } from "@/components/stations/sensor-chart"
import { ForecastCard } from "@/components/dashboard/forecast-card"
import type { TimeRange, WeatherData, SoilData } from "@/types"
import { mockStations, generateMockWeatherData, generateMockSoilData, mockWeatherForecast } from "@/lib/mock-data"
import { formatDateTime } from "@/lib/utils/date"
import { convertToCSV, downloadCSV } from "@/lib/utils/export"
import { Download, MapPin, Satellite } from "lucide-react"
import Image from "next/image"

export default function StationDetailPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const stationId = params.id as string

  const [mounted, setMounted] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>(7)

  useEffect(() => {
    setMounted(true)
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Find the station
  const station = mockStations.find((s) => s.id === stationId)

  // Check if user has access to this station
  const hasAccess = useMemo(() => {
    if (!user || !station) return false
    if (user.role === "admin") return true
    return user.permittedStations.includes(station.id)
  }, [user, station])

  // Generate data based on time range
  const data = useMemo(() => {
    if (!station) return null

    if (station.type === "weather") {
      return generateMockWeatherData(station.id, timeRange)
    } else {
      return generateMockSoilData(station.id, timeRange)
    }
  }, [station, timeRange])

  if (!mounted || authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!station) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">ไม่พบสถานี</h2>
            <p className="text-muted-foreground mt-2">ไม่มีสถานีที่ท่านต้องการ</p>
            <Button onClick={() => router.push("/stations")} className="mt-4">
              กลับไปหน้าสถานี
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!hasAccess) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">ไม่มีสิทธิ์เข้าถึง</h2>
            <p className="text-muted-foreground mt-2">คุณไม่มีสิทธิ์ดูสถานีนี้</p>
            <Button onClick={() => router.push("/dashboard")} className="mt-4">
              กลับไปหน้าแดชบอร์ด
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const isOnline = station.status === "online"
  const latestData = data && data.length > 0 ? data[data.length - 1] : null

  // Export function
  const handleExport = () => {
    if (!data) return
    const csv = convertToCSV(data)
    downloadCSV(csv, `${station.id}_data_${timeRange}days.csv`)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Station header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Satellite className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-3xl font-bold text-balance">{station.name}</h1>
              <Badge variant={isOnline ? "default" : "secondary"}>{isOnline ? "ออนไลน์" : "ออฟไลน์"}</Badge>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{station.location.address}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">อัปเดตล่าสุด: {formatDateTime(station.lastDataReceived)}</p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            ส่งออก CSV
          </Button>
        </div>

        {/* Time range selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">ข้อมูลย้อนหลัง</h2>
          <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />
        </div>

        {/* Station image */}
        <Card>
          <CardHeader>
            <CardTitle>ภาพถ่ายสถานีล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 w-full overflow-hidden rounded-lg bg-muted">
              <Image src={station.imageUrl || "/placeholder.svg"} alt={station.name} fill className="object-cover" />
            </div>
          </CardContent>
        </Card>

        {/* Display weather station data */}
        {station.type === "weather" && data && (
          <>
            {/* Current readings */}
            {latestData && (
              <Card>
                <CardHeader>
                  <CardTitle>ค่าปัจจุบัน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">อุณหภูมิ</p>
                      <p className="text-2xl font-bold">{(latestData as WeatherData).airTemperature.toFixed(1)}°C</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ความชื้น</p>
                      <p className="text-2xl font-bold">{(latestData as WeatherData).relativeHumidity.toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ความเร็วลม</p>
                      <p className="text-2xl font-bold">{(latestData as WeatherData).windSpeed.toFixed(1)} m/s</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">VPD</p>
                      <p className="text-2xl font-bold">{(latestData as WeatherData).vpd?.toFixed(2)} kPa</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Weather charts */}
            <div className="grid grid-cols-1 gap-4">
              <SensorChart
                title="อุณหภูมิและความชื้น"
                data={data}
                dataKeys={[
                  { key: "airTemperature", label: "อุณหภูมิ (°C)", color: "#ef4444" },
                  { key: "relativeHumidity", label: "ความชื้น (%)", color: "#3b82f6" },
                ]}
                xAxisKey="timestamp"
              />
              <SensorChart
                title="VPD (ความขาดแคลนความดันไอน้ำ)"
                data={data}
                dataKeys={[{ key: "vpd", label: "VPD (kPa)", color: "#10b981" }]}
                xAxisKey="timestamp"
                yAxisLabel="kPa"
              />
              <SensorChart
                title="ความเร็วลม"
                data={data}
                dataKeys={[{ key: "windSpeed", label: "ความเร็วลม (m/s)", color: "#6366f1" }]}
                xAxisKey="timestamp"
                yAxisLabel="m/s"
              />
              <SensorChart
                title="ความกดอากาศ"
                data={data}
                dataKeys={[{ key: "atmosphericPressure", label: "ความกดอากาศ (hPa)", color: "#8b5cf6" }]}
                xAxisKey="timestamp"
                yAxisLabel="hPa"
              />
              <SensorChart
                title="ปริมาณฝน"
                data={data}
                dataKeys={[{ key: "rainfall", label: "ปริมาณฝน (mm)", color: "#06b6d4" }]}
                xAxisKey="timestamp"
                yAxisLabel="mm"
              />
              <SensorChart
                title="ความเข้มแสง"
                data={data}
                dataKeys={[{ key: "lightIntensity", label: "ความเข้มแสง (lux)", color: "#f59e0b" }]}
                xAxisKey="timestamp"
                yAxisLabel="lux"
              />
            </div>

            {/* Weather forecast */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">พยากรณ์อากาศ</h2>
              <ForecastCard forecasts={mockWeatherForecast} />
            </div>
          </>
        )}

        {/* Display soil station data */}
        {station.type === "soil" && data && (
          <>
            {/* Current readings */}
            {latestData && (
              <Card>
                <CardHeader>
                  <CardTitle>ความชื้นในดินปัจจุบัน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">เซ็นเซอร์ 1 (แท่งโลหะ)</p>
                      <p className="text-2xl font-bold">{(latestData as SoilData).soilMoisture1.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">เซ็นเซอร์ 2 (แท่งโลหะ)</p>
                      <p className="text-2xl font-bold">{(latestData as SoilData).soilMoisture2.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Soil charts */}
            <SensorChart
              title="ระดับความชื้นในดิน"
              data={data}
              dataKeys={[
                { key: "soilMoisture1", label: "เซ็นเซอร์ 1 (%)", color: "#10b981" },
                { key: "soilMoisture2", label: "เซ็นเซอร์ 2 (%)", color: "#3b82f6" },
              ]}
              xAxisKey="timestamp"
              yAxisLabel="%"
            />
          </>
        )}
      </div>
    </AppLayout>
  )
}
