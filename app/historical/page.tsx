/**
 * Historical Data Page (ดูข้อมูลย้อนหลังของชุดอุปกรณ์)
 * Time-series data visualization with line charts and data tables
 * Supports 3/7/15/30 day time ranges as per TOR requirements
 */

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getAllStations } from "@/services/stationsService"
import { getSensorReadings } from "@/services/sensorService"
import { getPermittedStations } from "@/utils/permissions"
import { exportSensorDataToCSV } from "@/services/exportService"
import { formatSensorDataForChart, getSensorDisplayName } from "@/utils/chartUtils"
import type { Station, SensorReading, TimeRange } from "@/types"
import { StationSelector } from "@/components/dashboard/StationSelector"
import { TimeRangeSelector } from "@/components/TimeRangeSelector"
import { SensorChart } from "@/components/charts/SensorChart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function HistoricalDataPage() {
  const { user } = useAuth()
  const [allStations, setAllStations] = useState<Station[]>([])
  const [permittedStations, setPermittedStations] = useState<Station[]>([])
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>(7)
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Available sensors based on station type
  const [availableSensors, setAvailableSensors] = useState<string[]>([])
  const [selectedSensors, setSelectedSensors] = useState<string[]>([])

  // Load stations on mount
  useEffect(() => {
    const loadStations = async () => {
      const stations = await getAllStations()
      setAllStations(stations)
      const permitted = getPermittedStations(user, stations)
      setPermittedStations(permitted)

      if (permitted.length > 0) {
        setSelectedStationId(permitted[0].id)
      }

      setIsLoading(false)
    }

    loadStations()
  }, [user])

  // Update available sensors when station changes
  useEffect(() => {
    if (!selectedStationId) return

    const station = allStations.find((s) => s.id === selectedStationId)
    setSelectedStation(station || null)

    if (station?.type === "weather") {
      const sensors = [
        "airTemperature",
        "relativeHumidity",
        "vpd",
        "lightIntensity",
        "windSpeed",
        "rainfall",
        "atmosphericPressure",
      ]
      setAvailableSensors(sensors)
      setSelectedSensors(["airTemperature", "relativeHumidity", "vpd"])
    } else {
      const sensors = ["soilMoisture1", "soilMoisture2"]
      setAvailableSensors(sensors)
      setSelectedSensors(sensors)
    }
  }, [selectedStationId, allStations])

  // Load sensor data when station or time range changes
  useEffect(() => {
    if (!selectedStationId) return

    const loadData = async () => {
      setIsLoadingData(true)
      const data = await getSensorReadings(selectedStationId, timeRange)
      setReadings(data)
      setIsLoadingData(false)
    }

    loadData()
  }, [selectedStationId, timeRange])

  // Handle sensor selection toggle
  const toggleSensor = (sensor: string) => {
    setSelectedSensors((prev) => (prev.includes(sensor) ? prev.filter((s) => s !== sensor) : [...prev, sensor]))
  }

  // Handle CSV export
  const handleExport = () => {
    if (!selectedStation) return
    exportSensorDataToCSV(selectedStation.name, readings, selectedSensors, timeRange)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  const chartData = formatSensorDataForChart(readings, selectedSensors)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">ดูข้อมูลย้อนหลังของชุดอุปกรณ์</h1>
        <p className="text-muted-foreground">แสดงกราฟและตารางข้อมูลย้อนหลัง</p>
      </div>

      {/* Controls */}
      <div className="grid gap-6 md:grid-cols-2">
        <StationSelector
          stations={permittedStations}
          selectedStationId={selectedStationId}
          onStationChange={setSelectedStationId}
        />
        <TimeRangeSelector selectedRange={timeRange} onRangeChange={setTimeRange} />
      </div>

      {/* Sensor selection */}
      <Card>
        <CardHeader>
          <CardTitle>เลือกเซ็นเซอร์ที่ต้องการแสดง</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {availableSensors.map((sensor) => (
              <div key={sensor} className="flex items-center space-x-2">
                <Checkbox
                  id={sensor}
                  checked={selectedSensors.includes(sensor)}
                  onCheckedChange={() => toggleSensor(sensor)}
                />
                <Label htmlFor={sensor} className="cursor-pointer text-sm font-normal">
                  {getSensorDisplayName(sensor)}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {isLoadingData ? (
        <Skeleton className="h-96" />
      ) : (
        <SensorChart data={chartData} sensorKeys={selectedSensors} title="กราฟข้อมูลย้อนหลัง" height={400} />
      )}

      {/* Data table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ตารางข้อมูล</CardTitle>
          <Button onClick={handleExport} disabled={readings.length === 0 || selectedSensors.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            ดาวน์โหลด CSV
          </Button>
        </CardHeader>
        <CardContent>
          {readings.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">ไม่มีข้อมูลในช่วงเวลาที่เลือก</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">วันที่และเวลา</th>
                    {selectedSensors.map((sensor) => (
                      <th key={sensor} className="p-2 text-right">
                        {getSensorDisplayName(sensor)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {readings.slice(0, 100).map((reading, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        {new Date(reading.timestamp).toLocaleString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      {selectedSensors.map((sensor) => (
                        <td key={sensor} className="p-2 text-right">
                          {reading[sensor as keyof SensorReading]?.toFixed(1) || "-"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {readings.length > 100 && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  แสดง 100 รายการแรก จากทั้งหมด {readings.length} รายการ (ดาวน์โหลด CSV เพื่อดูข้อมูลทั้งหมด)
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
