/**
 * Mock station image data
 * Simulates latest camera images from stations
 */

import type { StationImage } from "@/types"
import { mockStations } from "@/data/mockStations"

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000)

export const mockStationImages: StationImage[] = mockStations.map((station, index) => ({
  stationId: station.id,
  imageUrl: "/placeholder.svg?height=480&width=640",
  timestamp: minutesAgo(5 + index * 3),
}))
