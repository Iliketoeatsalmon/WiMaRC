/**
 * Station Map Page (แผนที่จุดติดตั้งอุปกรณ์)
 * Interactive map showing all permitted station locations
 * Click markers to view station details and navigate to dashboard
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { getAllStations, getStationLatestImage } from "@/services/stationsService"
import { getLatestSensorReading } from "@/services/sensorService"
import { getPermittedStations } from "@/utils/permissions"
import type { Station, SensorReading, StationImage } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { formatThaiDateTime } from "@/utils/dateUtils"
import { MapPin, Navigation, Info, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { GoogleMap } from "@/components/maps/GoogleMap"

export default function MapPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [allStations, setAllStations] = useState<Station[]>([])
  const [permittedStations, setPermittedStations] = useState<Station[]>([])
  const [mapFilter, setMapFilter] = useState<string>("all")
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [selectedReading, setSelectedReading] = useState<SensorReading | null>(null)
  const [selectedImage, setSelectedImage] = useState<StationImage | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load stations on mount
  useEffect(() => {
    const loadData = async () => {
      const stations = await getAllStations()
      setAllStations(stations)
      const permitted = getPermittedStations(user, stations)
      setPermittedStations(permitted)

      setMapFilter("all")
      if (permitted.length > 0) {
        setSelectedStationId(permitted[0].id)
      }

      setIsLoading(false)
    }

    loadData()
  }, [user])

  // Load station details when selected
  useEffect(() => {
    if (!selectedStationId) {
      setSelectedStation(null)
      setSelectedReading(null)
      setSelectedImage(null)
      return
    }

    const station = allStations.find((s) => s.id === selectedStationId)
    if (!station) {
      setSelectedStation(null)
      setSelectedReading(null)
      setSelectedImage(null)
      return
    }

    let isCancelled = false
    setSelectedStation(station)

    const loadDetails = async () => {
      const [reading, image] = await Promise.all([
        getLatestSensorReading(station.id),
        getStationLatestImage(station.id),
      ])

      if (isCancelled) return
      setSelectedReading(reading)
      setSelectedImage(image)
    }

    loadDetails()

    return () => {
      isCancelled = true
    }
  }, [selectedStationId, allStations])

  // Navigate to station dashboard
  const navigateToStation = (stationId: string) => {
    router.push(`/dashboard?station=${stationId}`)
  }

  const handleMapSelectionChange = (value: string) => {
    setMapFilter(value)
    if (value === "all") {
      setSelectedStationId(null)
      return
    }
    setSelectedStationId(value)
  }

  const handleMarkerClick = useCallback((stationId: string) => {
    setSelectedStationId(stationId)
  }, [])

  // Open Google Maps directions
  const openDirections = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank")
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold">แผนที่จุดติดตั้งอุปกรณ์</h1>
        <p className="text-muted-foreground">ตำแหน่งสถานีตรวจวัดทั้งหมด</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map placeholder (left side - 2 columns) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              แผนที่
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-2">
              <Label>พื้นที่จุดติดตั้งสถานที่</Label>
              <Select value={mapFilter} onValueChange={handleMapSelectionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานที่" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">แสดงทั้งหมด</SelectItem>
                  {permittedStations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <GoogleMap
              stations={mapFilter === "all" ? permittedStations : permittedStations.filter((s) => s.id === mapFilter)}
              selectedStationId={selectedStationId}
              onMarkerClick={handleMarkerClick}
            />
          </CardContent>
        </Card>

        {/* Station info panel (right side - 1 column) */}
        <div className="space-y-4">
          {selectedStation ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedStation.name}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">{selectedStation.area}</p>
                    </div>
                    <StatusBadge status={selectedStation.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Badge>{selectedStation.type === "weather" ? "สถานีตรวจวัดอากาศ" : "สถานีตรวจวัดดิน"}</Badge>
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground">อัปเดตล่าสุด:</p>
                    <p>{selectedStation.lastDataTime ? formatThaiDateTime(selectedStation.lastDataTime) : "-"}</p>
                  </div>

                  <div className="text-sm">
                    <p className="text-muted-foreground">พิกัด:</p>
                    <p>
                      {selectedStation.latitude.toFixed(4)}, {selectedStation.longitude.toFixed(4)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button className="w-full" onClick={() => navigateToStation(selectedStation.id)}>
                      <Info className="mr-2 h-4 w-4" />
                      ดูรายละเอียด
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={() => openDirections(selectedStation.latitude, selectedStation.longitude)}
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      นำทาง
                      <ExternalLink className="ml-auto h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Latest sensor data */}
              {selectedReading && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">ข้อมูลล่าสุด</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {selectedStation.type === "weather" ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">อุณหภูมิ:</span>
                          <span className="font-medium">{selectedReading.airTemperature?.toFixed(1)} °C</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ความชื้น:</span>
                          <span className="font-medium">{selectedReading.relativeHumidity?.toFixed(1)} %</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">VPD:</span>
                          <span className="font-medium">{selectedReading.vpd?.toFixed(2)} kPa</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ความชื้นดิน 1:</span>
                          <span className="font-medium">{selectedReading.soilMoisture1?.toFixed(1)} %</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ความชื้นดิน 2:</span>
                          <span className="font-medium">{selectedReading.soilMoisture2?.toFixed(1)} %</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Latest image */}
              {selectedImage && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">ภาพล่าสุด</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img
                      src={selectedImage.imageUrl || "/placeholder.svg"}
                      alt="Station"
                      className="w-full rounded-lg border"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">{formatThaiDateTime(selectedImage.timestamp)}</p>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                เลือกสถานีจากแผนที่เพื่อดูรายละเอียด
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
