/**
 * Station Selector Component
 * Dropdown to select a station from permitted stations
 * Filters stations based on user permissions
 */

"use client"
import type { Station } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface StationSelectorProps {
  stations: Station[]
  selectedStationId: string | null
  onStationChange: (stationId: string) => void
  label?: string
  filterByType?: "weather" | "soil"
}

export function StationSelector({
  stations,
  selectedStationId,
  onStationChange,
  label = "เลือกสถานี",
  filterByType,
}: StationSelectorProps) {
  // Filter stations by type if specified
  const filteredStations = filterByType ? stations.filter((s) => s.type === filterByType) : stations

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={selectedStationId || undefined} onValueChange={onStationChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="กรุณาเลือกสถานี" />
        </SelectTrigger>
        <SelectContent>
          {filteredStations.length === 0 ? (
            <div className="p-2 text-center text-sm text-muted-foreground">ไม่มีสถานีที่สามารถเข้าถึงได้</div>
          ) : (
            filteredStations.map((station) => (
              <SelectItem key={station.id} value={station.id}>
                {station.name} ({station.area})
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
