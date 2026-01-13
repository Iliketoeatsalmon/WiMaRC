/**
 * Stations service
 * Handles all station-related data operations
 * In production, replace with real API calls
 */

import type { Station, StationImage } from "@/types"
import { mockStations } from "@/data/mockStations"
import { mockStationImages } from "@/data/mockImages"

/**
 * Get all stations
 */
export async function getAllStations(): Promise<Station[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockStations
}

/**
 * Get station by ID
 */
export async function getStationById(stationId: string): Promise<Station | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return mockStations.find((s) => s.id === stationId) || null
}

/**
 * Get stations by owner
 */
export async function getStationsByOwner(userId: string): Promise<Station[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockStations.filter((s) => s.ownerId === userId)
}

/**
 * Get latest image for a station
 */
export async function getStationLatestImage(stationId: string): Promise<StationImage | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return mockStationImages.find((img) => img.stationId === stationId) || null
}

/**
 * Get station status summary for admin
 */
export async function getStationStatusSummary() {
  const stations = await getAllStations()
  return {
    total: stations.length,
    online: stations.filter((s) => s.status === "online").length,
    offline: stations.filter((s) => s.status === "offline").length,
  }
}

export class StationsService {
  static async getStationsByUser(user: any): Promise<Station[]> {
    if (user.role === "Admin") {
      return getAllStations()
    }
    const allStations = await getAllStations()
    return allStations.filter((s) => user.permittedStationIds.includes(s.id))
  }
}
