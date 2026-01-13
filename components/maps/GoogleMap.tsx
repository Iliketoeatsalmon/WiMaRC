"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { Station } from "@/types"

type MapStation = Pick<Station, "id" | "name" | "latitude" | "longitude">

interface GoogleMapProps {
  stations: MapStation[]
  selectedStationId?: string | null
  onMarkerClick?: (stationId: string) => void
  className?: string
}

declare global {
  interface Window {
    google?: any
  }
}

let googleMapsScriptPromise: Promise<void> | null = null

const loadGoogleMapsScript = (apiKey: string) => {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.google?.maps) return Promise.resolve()

  if (!googleMapsScriptPromise) {
    googleMapsScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.getElementById("google-maps-script")
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve())
        existingScript.addEventListener("error", () => reject(new Error("Failed to load Google Maps")))
        return
      }

      const script = document.createElement("script")
      script.id = "google-maps-script"
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load Google Maps"))
      document.head.appendChild(script)
    })
  }

  return googleMapsScriptPromise
}

export function GoogleMap({ stations, selectedStationId, onMarkerClick, className }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [apiKeyMissing, setApiKeyMissing] = useState(false)

  const mapCenter = useMemo(() => {
    if (stations.length === 0) return { lat: 13.736717, lng: 100.523186 }
    const total = stations.reduce(
      (acc, station) => ({
        lat: acc.lat + station.latitude,
        lng: acc.lng + station.longitude,
      }),
      { lat: 0, lng: 0 },
    )
    return {
      lat: total.lat / stations.length,
      lng: total.lng / stations.length,
    }
  }, [stations])

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setApiKeyMissing(true)
      return
    }

    let isCancelled = false

    const initializeMap = async () => {
      try {
        await loadGoogleMapsScript(apiKey)
      } catch (error) {
        console.error("Google Maps load failed:", error)
        return
      }

      if (isCancelled || !mapRef.current) return

      const google = window.google

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: mapCenter,
          zoom: 10,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          clickableIcons: false,
        })
      } else {
        mapInstanceRef.current.setCenter(mapCenter)
      }

      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []

      const bounds = new google.maps.LatLngBounds()

      stations.forEach((station) => {
        const position = { lat: station.latitude, lng: station.longitude }
        const isSelected = station.id === selectedStationId

        const marker = new google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: station.name,
          icon: isSelected
            ? {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#2563eb",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }
            : undefined,
        })

        marker.addListener("click", () => onMarkerClick?.(station.id))
        markersRef.current.push(marker)
        bounds.extend(position)
      })

      if (stations.length === 1) {
        mapInstanceRef.current.setZoom(14)
      } else if (stations.length > 1) {
        mapInstanceRef.current.fitBounds(bounds, 64)
      }
    }

    initializeMap()

    return () => {
      isCancelled = true
    }
  }, [stations, selectedStationId, mapCenter, onMarkerClick])

  if (stations.length === 0) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
        ไม่มีสถานีสำหรับแสดงบนแผนที่
      </div>
    )
  }

  if (apiKeyMissing) {
    const fallback = stations[0]
    const src = `https://maps.google.com/maps?q=${fallback.latitude},${fallback.longitude}&z=13&output=embed`

    return (
      <div className={className}>
        <div className="h-[500px] overflow-hidden rounded-lg border">
          <iframe
            title="Google Map Preview"
            src={src}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          ตั้งค่า `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` เพื่อแสดงหมุดหลายจุดและโหมดดูทั้งหมด
        </p>
      </div>
    )
  }

  return <div ref={mapRef} className={`h-[500px] w-full rounded-lg border ${className || ""}`} />
}
