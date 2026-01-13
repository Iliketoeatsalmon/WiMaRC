/**
 * Status Badge Component
 * Displays online/offline status with Thai labels and colors
 */

import { Badge } from "@/components/ui/badge"
import type { StationStatus } from "@/types"
import { Circle } from "lucide-react"

interface StatusBadgeProps {
  status: StationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isOnline = status === "online"

  return (
    <Badge variant={isOnline ? "default" : "secondary"} className="gap-1.5">
      <Circle className={`h-2 w-2 fill-current ${isOnline ? "animate-pulse" : ""}`} />
      {isOnline ? "ออนไลน์" : "ออฟไลน์"}
    </Badge>
  )
}
