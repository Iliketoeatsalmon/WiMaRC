/**
 * Data Download Page (ดาวน์โหลดข้อมูล)
 * Hierarchical CSV export interface
 * 1) Select station 2) Select data category 3) Select sensors 4) Export
 */

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getAllStations } from "@/services/stationsService"
import { getSensorReadings, getDailyAggregates } from "@/services/sensorService"
import { getPermittedStations } from "@/utils/permissions"
import { exportSensorDataToCSV, exportDailyDataToCSV } from "@/services/exportService"
import { getSensorDisplayName } from "@/utils/chartUtils"
import type { Station, TimeRange } from "@/types"
import { StationSelector } from "@/components/dashboard/StationSelector"
import { TimeRangeSelector } from "@/components/TimeRangeSelector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FileDown } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

type DataCategory = "timeseries" | "daily"

export default function DownloadPage() {
  const { user } = useAuth()
  const [allStations, setAllStations] = useState<Station[]>([])
  const [permittedStations, setPermittedStations] = useState<Station[]>([])
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [category, setCategory] = useState<DataCategory>("timeseries")
  const [timeRange, setTimeRange] = useState<TimeRange>(7)
  const [availableSensors, setAvailableSensors] = useState<string[]>([])
  const [selectedSensors, setSelectedSensors] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)

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
        "windDirection",
        "rainfall",
        "atmosphericPressure",
      ]
      setAvailableSensors(sensors)
      setSelectedSensors(sensors) // Select all by default
    } else {
      const sensors = ["soilMoisture1", "soilMoisture2"]
      setAvailableSensors(sensors)
      setSelectedSensors(sensors)
    }
  }, [selectedStationId, allStations])

  // Handle sensor selection toggle
  const toggleSensor = (sensor: string) => {
    setSelectedSensors((prev) => (prev.includes(sensor) ? prev.filter((s) => s !== sensor) : [...prev, sensor]))
  }

  // Select all sensors
  const selectAllSensors = () => {
    setSelectedSensors(availableSensors)
  }

  // Deselect all sensors
  const deselectAllSensors = () => {
    setSelectedSensors([])
  }

  // Handle export
  const handleExport = async () => {
    if (!selectedStation || !selectedStationId || selectedSensors.length === 0) return

    setIsExporting(true)

    try {
      if (category === "timeseries") {
        const readings = await getSensorReadings(selectedStationId, timeRange)
        exportSensorDataToCSV(selectedStation.name, readings, selectedSensors, timeRange)
      } else {
        const aggregates = await getDailyAggregates(selectedStationId, timeRange)
        exportDailyDataToCSV(selectedStation.name, aggregates, timeRange)
      }
    } catch (error) {
      console.error("Export error:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">ดาวน์โหลดข้อมูล</h1>
        <p className="text-muted-foreground">ส่งออกข้อมูลเป็นไฟล์ CSV</p>
      </div>

      {/* Step 1: Select station */}
      <Card>
        <CardHeader>
          <CardTitle>ขั้นตอนที่ 1: เลือกสถานี</CardTitle>
        </CardHeader>
        <CardContent>
          <StationSelector
            stations={permittedStations}
            selectedStationId={selectedStationId}
            onStationChange={setSelectedStationId}
          />
        </CardContent>
      </Card>

      {/* Step 2: Select data category */}
      <Card>
        <CardHeader>
          <CardTitle>ขั้นตอนที่ 2: เลือกประเภทข้อมูล</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={category} onValueChange={(value) => setCategory(value as DataCategory)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="timeseries" id="timeseries" />
              <Label htmlFor="timeseries" className="cursor-pointer font-normal">
                ข้อมูลรายเวลา (Time-series data)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily" className="cursor-pointer font-normal">
                ข้อมูลสรุปรายวัน (Daily summary)
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Step 3: Select sensors (only for timeseries) */}
      {category === "timeseries" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ขั้นตอนที่ 3: เลือกเซ็นเซอร์</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllSensors}>
                  เลือกทั้งหมด
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllSensors}>
                  ยกเลิกทั้งหมด
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {availableSensors.map((sensor) => (
                <div key={sensor} className="flex items-center space-x-2">
                  <Checkbox
                    id={`download-${sensor}`}
                    checked={selectedSensors.includes(sensor)}
                    onCheckedChange={() => toggleSensor(sensor)}
                  />
                  <Label htmlFor={`download-${sensor}`} className="cursor-pointer text-sm font-normal">
                    {getSensorDisplayName(sensor)}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Select time range */}
      <Card>
        <CardHeader>
          <CardTitle>ขั้นตอนที่ {category === "timeseries" ? "4" : "3"}: เลือกช่วงเวลา</CardTitle>
        </CardHeader>
        <CardContent>
          <TimeRangeSelector selectedRange={timeRange} onRangeChange={setTimeRange} />
        </CardContent>
      </Card>

      {/* Summary and export */}
      <Card>
        <CardHeader>
          <CardTitle>สรุปและดาวน์โหลด</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="mb-2 font-medium">ข้อมูลที่เลือก:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• สถานี: {selectedStation?.name || "-"}</li>
              <li>• ประเภท: {category === "timeseries" ? "ข้อมูลรายเวลา" : "ข้อมูลสรุปรายวัน"}</li>
              {category === "timeseries" && <li>• จำนวนเซ็นเซอร์: {selectedSensors.length} รายการ</li>}
              <li>• ช่วงเวลา: {timeRange} วันย้อนหลัง</li>
            </ul>
          </div>

          {selectedSensors.length === 0 && category === "timeseries" && (
            <Alert>
              <AlertDescription>กรุณาเลือกเซ็นเซอร์อย่างน้อย 1 รายการ</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleExport}
            disabled={isExporting || !selectedStationId || (category === "timeseries" && selectedSensors.length === 0)}
            className="w-full"
            size="lg"
          >
            {isExporting ? (
              <>กำลังสร้างไฟล์...</>
            ) : (
              <>
                <FileDown className="mr-2 h-5 w-5" />
                ดาวน์โหลด CSV
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
