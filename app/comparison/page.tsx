/**
 * Station Comparison Page (TOR 4.5.7)
 *
 * Allows selection and comparison of TWO stations side-by-side.
 * Features:
 * - Compare sensor data between stations
 * - Compare VPD values
 * - Daily average/max/min values
 * - Line chart visualization
 * - Time range selector (3, 7, 15, 30 days)
 * - Map showing both station locations
 */

"use client"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimeRangeSelector } from "@/components/stations/time-range-selector"
import { SensorChart } from "@/components/stations/sensor-chart"
import { StationMap } from "@/components/map/station-map"
import type { TimeRange } from "@/types"
import { mockStations, generateMockWeatherData, generateMockSoilData } from "@/lib/mock-data"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeftRight, Info } from "lucide-react"

export default function ComparisonPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const [station1Id, setStation1Id] = useState<string>("")
  const [station2Id, setStation2Id] = useState<string>("")
  const [timeRange, setTimeRange] = useState<TimeRange>(7)

  useEffect(() => {
    setMounted(true)
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Filter stations based on user permissions
  const accessibleStations = useMemo(() => {
    if (!user) return []
    return user.role === "admin"
      ? mockStations
      : mockStations.filter((station) => user.permittedStations.includes(station.id))
  }, [user])

  // Get selected stations
  const station1 = accessibleStations.find((s) => s.id === station1Id)
  const station2 = accessibleStations.find((s) => s.id === station2Id)

  // Generate comparison data
  const comparisonData = useMemo(() => {
    if (!station1 || !station2) return null

    // Check if both stations are the same type
    if (station1.type !== station2.type) return null

    if (station1.type === "weather") {
      const data1 = generateMockWeatherData(station1.id, timeRange)
      const data2 = generateMockWeatherData(station2.id, timeRange)

      // Combine data for comparison
      return {
        type: "weather" as const,
        combined: data1.map((d1, idx) => ({
          timestamp: d1.timestamp,
          station1_temp: d1.airTemperature,
          station2_temp: data2[idx]?.airTemperature || 0,
          station1_humidity: d1.relativeHumidity,
          station2_humidity: data2[idx]?.relativeHumidity || 0,
          station1_vpd: d1.vpd,
          station2_vpd: data2[idx]?.vpd || 0,
          station1_wind: d1.windSpeed,
          station2_wind: data2[idx]?.windSpeed || 0,
          station1_rainfall: d1.rainfall,
          station2_rainfall: data2[idx]?.rainfall || 0,
        })),
      }
    } else {
      const data1 = generateMockSoilData(station1.id, timeRange)
      const data2 = generateMockSoilData(station2.id, timeRange)

      return {
        type: "soil" as const,
        combined: data1.map((d1, idx) => ({
          timestamp: d1.timestamp,
          station1_moisture1: d1.soilMoisture1,
          station2_moisture1: data2[idx]?.soilMoisture1 || 0,
          station1_moisture2: d1.soilMoisture2,
          station2_moisture2: data2[idx]?.soilMoisture2 || 0,
        })),
      }
    }
  }, [station1, station2, timeRange])

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!comparisonData) return null

    const calculateStats = (data: number[]) => {
      const avg = data.reduce((sum, val) => sum + val, 0) / data.length
      const max = Math.max(...data)
      const min = Math.min(...data)
      return { avg, max, min }
    }

    if (comparisonData.type === "weather") {
      const station1Temps = comparisonData.combined.map((d) => d.station1_temp)
      const station2Temps = comparisonData.combined.map((d) => d.station2_temp)

      return {
        station1: {
          temperature: calculateStats(station1Temps),
        },
        station2: {
          temperature: calculateStats(station2Temps),
        },
      }
    }

    return null
  }, [comparisonData])

  if (!mounted || isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const bothSelected = station1 && station2
  const incompatibleTypes = bothSelected && station1.type !== station2.type
  const selectedStations = bothSelected ? [station1, station2] : []

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Page header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-balance">Station Comparison</h1>
          </div>
          <p className="text-muted-foreground">Compare sensor data between two stations</p>
        </div>

        {/* Station selectors */}
        <Card>
          <CardHeader>
            <CardTitle>Select Stations to Compare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Station 1</label>
                <Select value={station1Id} onValueChange={setStation1Id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select first station" />
                  </SelectTrigger>
                  <SelectContent>
                    {accessibleStations.map((station) => (
                      <SelectItem key={station.id} value={station.id} disabled={station.id === station2Id}>
                        {station.name} ({station.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Station 2</label>
                <Select value={station2Id} onValueChange={setStation2Id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select second station" />
                  </SelectTrigger>
                  <SelectContent>
                    {accessibleStations.map((station) => (
                      <SelectItem key={station.id} value={station.id} disabled={station.id === station1Id}>
                        {station.name} ({station.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {incompatibleTypes && (
              <Alert variant="destructive" className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Selected stations must be of the same type (both weather or both soil) to compare data.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Show comparison only if both stations are selected and compatible */}
        {bothSelected && !incompatibleTypes && comparisonData && (
          <>
            {/* Time range selector */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Comparison Data</h2>
              <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />
            </div>

            {/* Station details side by side */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{station1.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Type: </span>
                    <span className="font-medium capitalize">{station1.type} Station</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Location: </span>
                    <span className="font-medium">{station1.location.address}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status: </span>
                    <span className={`font-medium ${station1.status === "online" ? "text-green-600" : "text-red-600"}`}>
                      {station1.status}
                    </span>
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{station2.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Type: </span>
                    <span className="font-medium capitalize">{station2.type} Station</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Location: </span>
                    <span className="font-medium">{station2.location.address}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Status: </span>
                    <span className={`font-medium ${station2.status === "online" ? "text-green-600" : "text-red-600"}`}>
                      {station2.status}
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Statistics comparison */}
            {statistics && comparisonData.type === "weather" && (
              <Card>
                <CardHeader>
                  <CardTitle>Temperature Statistics ({timeRange} days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium mb-3">{station1.name}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Average:</span>
                          <span className="font-medium">{statistics.station1.temperature.avg.toFixed(1)}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Maximum:</span>
                          <span className="font-medium">{statistics.station1.temperature.max.toFixed(1)}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Minimum:</span>
                          <span className="font-medium">{statistics.station1.temperature.min.toFixed(1)}°C</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-3">{station2.name}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Average:</span>
                          <span className="font-medium">{statistics.station2.temperature.avg.toFixed(1)}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Maximum:</span>
                          <span className="font-medium">{statistics.station2.temperature.max.toFixed(1)}°C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Minimum:</span>
                          <span className="font-medium">{statistics.station2.temperature.min.toFixed(1)}°C</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comparison charts */}
            <div className="space-y-4">
              {comparisonData.type === "weather" && (
                <>
                  <SensorChart
                    title="Temperature Comparison"
                    data={comparisonData.combined}
                    dataKeys={[
                      { key: "station1_temp", label: `${station1.name} (°C)`, color: "#ef4444" },
                      { key: "station2_temp", label: `${station2.name} (°C)`, color: "#3b82f6" },
                    ]}
                    xAxisKey="timestamp"
                    yAxisLabel="°C"
                  />
                  <SensorChart
                    title="Humidity Comparison"
                    data={comparisonData.combined}
                    dataKeys={[
                      { key: "station1_humidity", label: `${station1.name} (%)`, color: "#ef4444" },
                      { key: "station2_humidity", label: `${station2.name} (%)`, color: "#3b82f6" },
                    ]}
                    xAxisKey="timestamp"
                    yAxisLabel="%"
                  />
                  <SensorChart
                    title="VPD Comparison"
                    data={comparisonData.combined}
                    dataKeys={[
                      { key: "station1_vpd", label: `${station1.name} (kPa)`, color: "#10b981" },
                      { key: "station2_vpd", label: `${station2.name} (kPa)`, color: "#8b5cf6" },
                    ]}
                    xAxisKey="timestamp"
                    yAxisLabel="kPa"
                  />
                  <SensorChart
                    title="Wind Speed Comparison"
                    data={comparisonData.combined}
                    dataKeys={[
                      { key: "station1_wind", label: `${station1.name} (m/s)`, color: "#6366f1" },
                      { key: "station2_wind", label: `${station2.name} (m/s)`, color: "#f59e0b" },
                    ]}
                    xAxisKey="timestamp"
                    yAxisLabel="m/s"
                  />
                  <SensorChart
                    title="Rainfall Comparison"
                    data={comparisonData.combined}
                    dataKeys={[
                      { key: "station1_rainfall", label: `${station1.name} (mm)`, color: "#06b6d4" },
                      { key: "station2_rainfall", label: `${station2.name} (mm)`, color: "#14b8a6" },
                    ]}
                    xAxisKey="timestamp"
                    yAxisLabel="mm"
                  />
                </>
              )}

              {comparisonData.type === "soil" && (
                <>
                  <SensorChart
                    title="Soil Moisture Sensor 1 Comparison"
                    data={comparisonData.combined}
                    dataKeys={[
                      { key: "station1_moisture1", label: `${station1.name} (%)`, color: "#10b981" },
                      { key: "station2_moisture1", label: `${station2.name} (%)`, color: "#3b82f6" },
                    ]}
                    xAxisKey="timestamp"
                    yAxisLabel="%"
                  />
                  <SensorChart
                    title="Soil Moisture Sensor 2 Comparison"
                    data={comparisonData.combined}
                    dataKeys={[
                      { key: "station1_moisture2", label: `${station1.name} (%)`, color: "#10b981" },
                      { key: "station2_moisture2", label: `${station2.name} (%)`, color: "#3b82f6" },
                    ]}
                    xAxisKey="timestamp"
                    yAxisLabel="%"
                  />
                </>
              )}
            </div>

            {/* Map showing both stations */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Station Locations</h2>
              <div className="rounded-lg overflow-hidden border">
                <StationMap
                  stations={selectedStations}
                  center={{
                    lat: (station1.location.lat + station2.location.lat) / 2,
                    lng: (station1.location.lng + station2.location.lng) / 2,
                  }}
                  zoom={11}
                />
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!bothSelected && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select Two Stations to Compare</p>
                <p className="text-sm mt-1">Choose stations of the same type to view comparison charts and data</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
