/**
 * Daily Averages Page (ดูข้อมูลค่าเฉลี่ยต่อวันย้อนหลัง)
 * Shows daily aggregate statistics (avg, min, max)
 * Includes daily VPD summary and total rainfall
 */

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getAllStations } from "@/services/stationsService"
import { getDailyAggregates } from "@/services/sensorService"
import { getPermittedStations } from "@/utils/permissions"
import { exportDailyDataToCSV } from "@/services/exportService"
import { formatDailyDataForChart } from "@/utils/chartUtils"
import type { Station, DailyAggregate, TimeRange } from "@/types"
import { StationSelector } from "@/components/dashboard/StationSelector"
import { TimeRangeSelector } from "@/components/TimeRangeSelector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatThaiDate } from "@/utils/dateUtils"

export default function DailyAveragesPage() {
  const { user } = useAuth()
  const [allStations, setAllStations] = useState<Station[]>([])
  const [permittedStations, setPermittedStations] = useState<Station[]>([])
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>(7)
  const [aggregates, setAggregates] = useState<DailyAggregate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingData, setIsLoadingData] = useState(false)

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

  // Update station info when selection changes
  useEffect(() => {
    if (!selectedStationId) return
    const station = allStations.find((s) => s.id === selectedStationId)
    setSelectedStation(station || null)
  }, [selectedStationId, allStations])

  // Load daily aggregates when station or time range changes
  useEffect(() => {
    if (!selectedStationId) return

    const loadData = async () => {
      setIsLoadingData(true)
      const data = await getDailyAggregates(selectedStationId, timeRange)
      setAggregates(data)
      setIsLoadingData(false)
    }

    loadData()
  }, [selectedStationId, timeRange])

  // Handle CSV export
  const handleExport = () => {
    if (!selectedStation) return
    exportDailyDataToCSV(selectedStation.name, aggregates, timeRange)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  const isWeatherStation = selectedStation?.type === "weather"
  const chartData = formatDailyDataForChart(aggregates)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">ดูข้อมูลค่าเฉลี่ยต่อวันย้อนหลัง</h1>
        <p className="text-muted-foreground">ข้อมูลสรุปรายวัน (เฉลี่ย, สูงสุด, ต่ำสุด)</p>
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

      {/* Charts */}
      {isLoadingData ? (
        <Skeleton className="h-96" />
      ) : aggregates.length > 0 ? (
        <div className="space-y-6">
          {isWeatherStation && (
            <>
              {/* Temperature chart */}
              <Card>
                <CardHeader>
                  <CardTitle>อุณหภูมิอากาศรายวัน</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="dateLabel" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="avgTemperature" name="เฉลี่ย (°C)" fill="#3b82f6" />
                      <Bar dataKey="maxTemperature" name="สูงสุด (°C)" fill="#ef4444" />
                      <Bar dataKey="minTemperature" name="ต่ำสุด (°C)" fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Humidity chart */}
              <Card>
                <CardHeader>
                  <CardTitle>ความชื้นสัมพัทธ์รายวัน</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="dateLabel" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="avgHumidity" name="เฉลี่ย (%)" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}

          {/* Soil moisture charts for soil stations */}
          {!isWeatherStation && (
            <Card>
              <CardHeader>
                <CardTitle>ความชื้นดินรายวัน</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="dateLabel" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="avgSoilMoisture1" name="เซ็นเซอร์ 1 (%)" fill="#84cc16" />
                    <Bar dataKey="avgSoilMoisture2" name="เซ็นเซอร์ 2 (%)" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">ไม่มีข้อมูลในช่วงเวลาที่เลือก</CardContent>
        </Card>
      )}

      {/* Data table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ตารางข้อมูลรายวัน</CardTitle>
          <Button onClick={handleExport} disabled={aggregates.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            ดาวน์โหลด CSV
          </Button>
        </CardHeader>
        <CardContent>
          {aggregates.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">ไม่มีข้อมูลในช่วงเวลาที่เลือก</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">วันที่</th>
                    {isWeatherStation ? (
                      <>
                        <th className="p-2 text-right">อุณหภูมิเฉลี่ย</th>
                        <th className="p-2 text-right">อุณหภูมิต่ำสุด</th>
                        <th className="p-2 text-right">อุณหภูมิสูงสุด</th>
                        <th className="p-2 text-right">ความชื้นเฉลี่ย</th>
                        <th className="p-2 text-right">VPD เฉลี่ย</th>
                        <th className="p-2 text-right">น้ำฝนรวม</th>
                      </>
                    ) : (
                      <>
                        <th className="p-2 text-right">ความชื้นดิน 1 เฉลี่ย</th>
                        <th className="p-2 text-right">ความชื้นดิน 2 เฉลี่ย</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {aggregates.map((agg, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="p-2">{formatThaiDate(agg.date)}</td>
                      {isWeatherStation ? (
                        <>
                          <td className="p-2 text-right">{agg.avgTemperature?.toFixed(1) || "-"} °C</td>
                          <td className="p-2 text-right">{agg.minTemperature?.toFixed(1) || "-"} °C</td>
                          <td className="p-2 text-right">{agg.maxTemperature?.toFixed(1) || "-"} °C</td>
                          <td className="p-2 text-right">{agg.avgHumidity?.toFixed(1) || "-"} %</td>
                          <td className="p-2 text-right">{agg.avgVpd?.toFixed(2) || "-"} kPa</td>
                          <td className="p-2 text-right">{agg.totalRainfall?.toFixed(1) || "-"} mm</td>
                        </>
                      ) : (
                        <>
                          <td className="p-2 text-right">{agg.avgSoilMoisture1?.toFixed(1) || "-"} %</td>
                          <td className="p-2 text-right">{agg.avgSoilMoisture2?.toFixed(1) || "-"} %</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
