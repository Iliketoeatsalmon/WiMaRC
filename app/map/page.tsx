/**
 * Map View Page
 *
 * Google Maps displaying all station locations (TOR 4.5.6.3).
 * Shows markers for each station with:
 * - Station details
 * - Latest station image
 * - Direction link to navigate to station
 *
 * Users see only permitted stations, Admins see all.
 */

"use client"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { StationMap } from "@/components/map/station-map"
import { mockStations } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function MapPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

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

  // Calculate map center (average of all station locations)
  const mapCenter = useMemo(() => {
    if (accessibleStations.length === 0) {
      return { lat: 13.7563, lng: 100.5018 }
    }

    const avgLat = accessibleStations.reduce((sum, s) => sum + s.location.lat, 0) / accessibleStations.length
    const avgLng = accessibleStations.reduce((sum, s) => sum + s.location.lng, 0) / accessibleStations.length

    return { lat: avgLat, lng: avgLng }
  }, [accessibleStations])

  if (!mounted || isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const onlineCount = accessibleStations.filter((s) => s.status === "online").length
  const offlineCount = accessibleStations.filter((s) => s.status === "offline").length

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-balance">Station Map</h1>
          <p className="text-muted-foreground mt-1">View all station locations on an interactive map</p>
        </div>

        {/* Station status summary */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Stations</p>
                  <p className="text-2xl font-bold mt-1">{accessibleStations.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Badge variant="outline">{accessibleStations.length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Online</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{onlineCount}</p>
                </div>
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Offline</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{offlineCount}</p>
                </div>
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map legend */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span>Online Station</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span>Offline Station</span>
              </div>
              <p className="text-muted-foreground ml-auto">Click on markers for station details and directions</p>
            </div>
          </CardContent>
        </Card>

        {/* Google Map */}
        <div className="rounded-lg overflow-hidden border">
          <StationMap stations={accessibleStations} center={mapCenter} zoom={12} />
        </div>

        {/* Station list below map */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Station List</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {accessibleStations.map((station) => (
              <Card key={station.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{station.name}</h3>
                        <Badge variant={station.status === "online" ? "default" : "secondary"}>{station.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{station.location.address}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {station.location.lat.toFixed(4)}, {station.location.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
