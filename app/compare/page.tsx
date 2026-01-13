/**
 * Station Comparison Page (เปรียบเทียบ 2 สถานี)
 * Compare sensor data between two stations
 * Includes comparative charts, map, and two CSV export buttons
 */

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getAllStations } from "@/services/stationsService"
import { getSensorReadings, getDailyAggregates } from "@/services/sensorService"
import { getPermittedStations } from "@/utils/permissions"
import { exportSensorDataToCSV, exportDailyDataToCSV } from "@/services/exportService"
import type { Station, SensorReading, DailyAggregate, TimeRange } from "@/types"
import { StationSelector } from "@/components/dashboard/StationSelector"
import { TimeRangeSelector } from "@/components/TimeRangeSelector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Download, MapPin } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function ComparePage() {
  const { user } = useAuth()
  const [allStations, setAllStations] = useState<Station[]>([])
  const [permittedStations, setPermittedStations] = useState<Station[]>([])
  const [station1Id, setStation1Id] = useState<string | null>(null)
  const [station2Id, setStation2Id] = useState<string | null>(null)
  const [station1, setStation1] = useState<Station | null>(null)
  const [station2, setStation2] = useState<Station | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>(7)
  const [readings1, setReadings1] = useState<SensorReading[]>([])
  const [readings2, setReadings2] = useState<SensorReading[]>([])
  const [dailyData1, setDailyData1] = useState<DailyAggregate[]>([])
  const [dailyData2, setDailyData2] = useState<DailyAggregate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Load stations on mount
  useEffect(() => {
    const loadStations = async () => {
      const stations = await getAllStations()
      setAllStations(stations)
      const permitted = getPermittedStations(user, stations)
      setPermittedStations(permitted)

      // Auto-select first two stations if available
      if (permitted.length >= 1) {
        setStation1Id(permitted[0].id)
      }
      if (permitted.length >= 2) {
        setStation2Id(permitted[1].id)
      }

      setIsLoading(false)
    }

    loadStations()
  }, [user])

  // Update station objects when IDs change
  useEffect(() => {
    if (station1Id) {
      setStation1(allStations.find((s) => s.id === station1Id) || null)
    }
    if (station2Id) {
      setStation2(allStations.find((s) => s.id === station2Id) || null)
    }
  }, [station1Id, station2Id, allStations])

  // Load comparison data when stations or time range changes
  useEffect(() => {
    if (!station1Id || !station2Id || station1Id === station2Id) return

    const loadData = async () => {
      setIsLoadingData(true)

      // Load time-series data
      const [data1, data2] = await Promise.all([
        getSensorReadings(station1Id, timeRange),
        getSensorReadings(station2Id, timeRange),
      ])
      setReadings1(data1)
      setReadings2(data2)

      // Load daily aggregates
      const [daily1, daily2] = await Promise.all([
        getDailyAggregates(station1Id, timeRange),
        getDailyAggregates(station2Id, timeRange),
      ])
      setDailyData1(daily1)
      setDailyData2(daily2)

      setIsLoadingData(false)
    }

    loadData()
  }, [station1Id, station2Id, timeRange])

  // Handle CSV exports
  const handleExportTimeSeries = () => {
    if (!station1 || !station2) return

    // Export both stations' data
    const sensors1 =
      station1.type === "weather" ? ["airTemperature", "relativeHumidity", "vpd"] : ["soilMoisture1", "soilMoisture2"]
    const sensors2 =
      station2.type === "weather" ? ["airTemperature", "relativeHumidity", "vpd"] : ["soilMoisture1", "soilMoisture2"]

    exportSensorDataToCSV(`${station1.name}_vs_${station2.name}`, readings1, sensors1, timeRange)
  }

  const handleExportDaily = () => {
    if (!station1 || !station2) return
    exportDailyDataToCSV(`${station1.name}_vs_${station2.name}`, dailyData1, timeRange)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  const canCompare = station1Id && station2Id && station1Id !== station2Id
  const bothWeather = station1?.type === "weather" && station2?.type === "weather"
  const bothSoil = station1?.type === "soil" && station2?.type === "soil"

  // Merge data for comparison charts
  const mergedData = readings1
    .map((r1, idx) => {
      const r2 = readings2[idx]
      if (!r2) return null

      return {
        time: new Date(r1.timestamp).toLocaleString("th-TH", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
        }),
        station1_temp: r1.airTemperature,
        station2_temp: r2.airTemperature,
        station1_humidity: r1.relativeHumidity,
        station2_humidity: r2.relativeHumidity,
        station1_vpd: r1.vpd,
        station2_vpd: r2.vpd,
        station1_soil1: r1.soilMoisture1,
        station2_soil1: r2.soilMoisture1,
      }
    })
    .filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">เปรียบเทียบ 2 สถานี</h1>
        <p className="text-muted-foreground">เปรียบเทียบข้อมูลระหว่างสถานี</p>
      </div>

      {/* Station selection */}
      <div className="grid gap-6 md:grid-cols-3">
        <StationSelector
          stations={permittedStations}
          selectedStationId={station1Id}
          onStationChange={setStation1Id}
          label="สถานีที่ 1"
        />
        <StationSelector
          stations={permittedStations}
          selectedStationId={station2Id}
          onStationChange={setStation2Id}
          label="สถานีที่ 2"
        />
        <TimeRangeSelector selectedRange={timeRange} onRangeChange={setTimeRange} />
      </div>

      {/* Warning if same station selected */}
      {station1Id === station2Id && station1Id && (
        <Alert>
          <AlertDescription>กรุณาเลือกสถานีที่แตกต่างกัน 2 สถานี</AlertDescription>
        </Alert>
      )}

      {/* Warning if different types */}
      {canCompare && !bothWeather && !bothSoil && (
        <Alert>
          <AlertDescription>สถานีทั้งสองมีประเภทต่างกัน (อากาศ vs ดิน) การเปรียบเทียบอาจมีข้อจำกัด</AlertDescription>
        </Alert>
      )}

      {canCompare && (
        <>
          {/* Station comparison info */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>สถานีที่ 1</CardTitle>
                  <Badge>{station1?.type === "weather" ? "อากาศ" : "ดิน"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">{station1?.name}</p>
                <p className="text-muted-foreground">{station1?.area}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {station1?.latitude.toFixed(4)}, {station1?.longitude.toFixed(4)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>สถานีที่ 2</CardTitle>
                  <Badge>{station2?.type === "weather" ? "อากาศ" : "ดิน"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">{station2?.name}</p>
                <p className="text-muted-foreground">{station2?.area}</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {station2?.latitude.toFixed(4)}, {station2?.longitude.toFixed(4)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparison charts */}
          {isLoadingData ? (
            <Skeleton className="h-96" />
          ) : (
            <div className="space-y-6">
              {bothWeather && (
                <>
                  {/* Temperature comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle>เปรียบเทียบอุณหภูมิ</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={mergedData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="station1_temp"
                            name={`${station1?.name} (°C)`}
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="station2_temp"
                            name={`${station2?.name} (°C)`}
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Humidity comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle>เปรียบเทียบความชื้น</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={mergedData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="station1_humidity"
                            name={`${station1?.name} (%)`}
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="station2_humidity"
                            name={`${station2?.name} (%)`}
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* VPD comparison */}
                  <Card>
                    <CardHeader>
                      <CardTitle>เปรียบเทียบ VPD</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={mergedData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="station1_vpd"
                            name={`${station1?.name} (kPa)`}
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="station2_vpd"
                            name={`${station2?.name} (kPa)`}
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}

              {bothSoil && (
                <Card>
                  <CardHeader>
                    <CardTitle>เปรียบเทียบความชื้นดิน</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={mergedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="station1_soil1"
                          name={`${station1?.name} (%)`}
                          stroke="#84cc16"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="station2_soil1"
                          name={`${station2?.name} (%)`}
                          stroke="#22c55e"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Export buttons */}
          <Card>
            <CardHeader>
              <CardTitle>ดาวน์โหลดข้อมูลเปรียบเทียบ</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button onClick={handleExportTimeSeries} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                ดาวน์โหลด CSV (รายเวลา)
              </Button>
              <Button onClick={handleExportDaily} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                ดาวน์โหลด CSV (สรุปรายวัน)
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
