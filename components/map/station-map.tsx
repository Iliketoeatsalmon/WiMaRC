/**
 * Station Map Component
 *
 * Google Maps integration showing station locations with markers.
 * Each marker displays station info and latest image when clicked.
 * Includes direction link to navigate to station location.
 */

"use client"
import { useState, useCallback } from "react"
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api"
import type { Station } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface StationMapProps {
  stations: Station[]
  center?: { lat: number; lng: number }
  zoom?: number
}

const mapContainerStyle = {
  width: "100%",
  height: "600px",
}

const defaultCenter = {
  lat: 13.7563,
  lng: 100.5018,
}

export function StationMap({ stations, center = defaultCenter, zoom = 12 }: StationMapProps) {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)

  const handleMarkerClick = useCallback((station: Station) => {
    setSelectedStation(station)
  }, [])

  const handleCloseInfo = useCallback(() => {
    setSelectedStation(null)
  }, [])

  // Get Google Maps direction URL
  const getDirectionUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
  }

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE"}>
      <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={zoom}>
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={{ lat: station.location.lat, lng: station.location.lng }}
            onClick={() => handleMarkerClick(station)}
            icon={{
              url:
                station.status === "online"
                  ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                  : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
          />
        ))}

        {selectedStation && (
          <InfoWindow
            position={{ lat: selectedStation.location.lat, lng: selectedStation.location.lng }}
            onCloseClick={handleCloseInfo}
          >
            <div className="p-2 min-w-[250px]">
              {/* Station name and status */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{selectedStation.name}</h3>
                <Badge variant={selectedStation.status === "online" ? "default" : "secondary"} className="ml-2">
                  {selectedStation.status}
                </Badge>
              </div>

              {/* Station image */}
              <div className="relative h-32 w-full overflow-hidden rounded-md mb-2">
                <Image
                  src={selectedStation.imageUrl || "/placeholder.svg"}
                  alt={selectedStation.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Station details */}
              <div className="space-y-1 text-xs mb-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{selectedStation.location.address}</span>
                </div>
                <p>
                  <span className="text-muted-foreground">Type: </span>
                  <span className="font-medium capitalize">{selectedStation.type} Station</span>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Link href={`/stations/${selectedStation.id}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full text-xs bg-transparent">
                    View Details
                  </Button>
                </Link>
                <a
                  href={getDirectionUrl(selectedStation.location.lat, selectedStation.location.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button size="sm" variant="default" className="w-full text-xs">
                    <Navigation className="h-3 w-3 mr-1" />
                    Directions
                  </Button>
                </a>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  )
}
