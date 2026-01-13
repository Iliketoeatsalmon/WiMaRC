/**
 * Main Dashboard Page (ดูข้อมูลสภาวะแวดล้อม)
 * Primary landing page after login
 * Displays real-time sensor data, charts, and station information
 */

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getAllStations } from "@/services/stationsService"
import { getLatestSensorReading, getWeatherForecast } from "@/services/sensorService"
import { getStationLatestImage } from "@/services/stationsService"
import { getPermittedStations } from "@/utils/permissions"
import type { Station, SensorReading, WeatherForecast, StationImage } from "@/types"
import { StationSelector } from "@/components/dashboard/StationSelector"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { formatThaiDateTime, getTimeDifference } from "@/utils/dateUtils"
import { Thermometer, Droplets, Sun, Wind, CloudRain, Gauge, Activity, ImageIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { user } = useAuth()
  const [allStations, setAllStations] = useState<Station[]>([])
  const [permittedStations, setPermittedStations] = useState<Station[]>([])
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [latestReading, setLatestReading] = useState<SensorReading | null>(null)
  const [forecast, setForecast] = useState<WeatherForecast[]>([])
  const [stationImage, setStationImage] = useState<StationImage | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load stations on mount
  useEffect(() => {
    const loadStations = async () => {
      const stations = await getAllStations()
      setAllStations(stations)
      const permitted = getPermittedStations(user, stations)
      setPermittedStations(permitted)

      // Auto-select first permitted station
      if (permitted.length > 0) {
        setSelectedStationId(permitted[0].id)
      }

      setIsLoading(false)
    }

    loadStations()
  }, [user])

  // Load station data when selection changes
  useEffect(() => {
    if (!selectedStationId) return

    const loadStationData = async () => {
      const station = allStations.find((s) => s.id === selectedStationId)
      setSelectedStation(station || null)

      // Load latest sensor reading
      const reading = await getLatestSensorReading(selectedStationId)
      setLatestReading(reading)

      // Load weather forecast if weather station
      if (station?.type === "weather") {
        const forecastData = await getWeatherForecast(selectedStationId)
        setForecast(forecastData)
      } else {
        setForecast([])
      }

      // Load latest station image
      const image = await getStationLatestImage(selectedStationId)
      setStationImage(image)
    }

    loadStationData()
  }, [selectedStationId, allStations])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (permittedStations.length === 0) {
    return (
      <Alert>
        <AlertDescription>คุณไม่มีสิทธิ์เข้าถึงสถานีใดๆ กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์การเข้าถึง</AlertDescription>
      </Alert>
    )
  }

  const isWeatherStation = selectedStation?.type === "weather"

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">ดูข้อมูลสภาวะแวดล้อม</h1>
        <p className="text-muted-foreground">ข้อมูลจากเซ็นเซอร์และพยากรณ์อากาศแบบเรียลไทม์</p>
      </div>

      {/* Station selector */}
      <div className="max-w-md">
        <StationSelector
          stations={permittedStations}
          selectedStationId={selectedStationId}
          onStationChange={setSelectedStationId}
        />
      </div>

      {selectedStation && (
        <>
          {/* Station info and status */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedStation.name}</CardTitle>
                  <CardDescription>
                    {selectedStation.area} • {isWeatherStation ? "สถานีตรวจวัดอากาศ" : "สถานีตรวจวัดความชื้นดิน"}
                  </CardDescription>
                </div>
                <StatusBadge status={selectedStation.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>อัปเดตล่าสุด: {formatThaiDateTime(selectedStation.lastDataTime)}</p>
                <p>({getTimeDifference(selectedStation.lastDataTime)})</p>
              </div>
            </CardContent>
          </Card>

          {/* Sensor readings */}
          {latestReading && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">ข้อมูลจากเซ็นเซอร์</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isWeatherStation ? (
                  <>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">อุณหภูมิอากาศ</CardTitle>
                        <Thermometer className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{latestReading.airTemperature?.toFixed(1)} °C</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">ความชื้นสัมพัทธ์</CardTitle>
                        <Droplets className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{latestReading.relativeHumidity?.toFixed(1)} %</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">VPD สำหรับทุเรียน</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{latestReading.vpd?.toFixed(2)} kPa</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">ความเข้มแสง</CardTitle>
                        <Sun className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{latestReading.lightIntensity?.toLocaleString()} lux</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">ความเร็วลม</CardTitle>
                        <Wind className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{latestReading.windSpeed?.toFixed(1)} m/s</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">ปริมาณน้ำฝน</CardTitle>
                        <CloudRain className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{latestReading.rainfall?.toFixed(1)} mm</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">ความกดอากาศ</CardTitle>
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{latestReading.atmosphericPressure?.toFixed(1)} hPa</div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">ความชื้นดิน 1</CardTitle>
                        <Droplets className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{latestReading.soilMoisture1?.toFixed(1)} %</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">ความชื้นดิน 2</CardTitle>
                        <Droplets className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{latestReading.soilMoisture2?.toFixed(1)} %</div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Station image */}
          {stationImage && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  <CardTitle>ภาพล่าสุดจากสถานี</CardTitle>
                </div>
                <CardDescription>อัปเดต: {formatThaiDateTime(stationImage.timestamp)}</CardDescription>
              </CardHeader>
              <CardContent>
                <img
                  src={stationImage.imageUrl || "/placeholder.svg"}
                  alt="Station view"
                  className="w-full rounded-lg border"
                />
              </CardContent>
            </Card>
          )}

          {/* Weather forecast - only for weather stations */}
          {isWeatherStation && forecast.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">ข้อมูลพยากรณ์อากาศ</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {forecast.slice(0, 4).map((f, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {new Date(f.forecastDate).toLocaleDateString("th-TH", {
                          month: "short",
                          day: "numeric",
                        })}
                      </CardTitle>
                      <CardDescription>{f.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">อุณหภูมิ:</span>
                        <span className="font-medium">{f.temperature.toFixed(1)} °C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">โอกาสฝน:</span>
                        <span className="font-medium">{f.rainProbability} %</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ปริมาณฝน:</span>
                        <span className="font-medium">{f.rainfall.toFixed(1)} mm</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <Card>
            <CardHeader>
              <CardTitle>ดูข้อมูลเพิ่มเติม</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href="/historical">ดูข้อมูลย้อนหลัง</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/daily">ค่าเฉลี่ยรายวัน</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/download">ดาวน์โหลดข้อมูล</Link>
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
