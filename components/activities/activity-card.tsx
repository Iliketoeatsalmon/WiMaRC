/**
 * Activity Card Component
 *
 * Displays a single plot activity with details and actions.
 * Shows activity information, images, and edit/delete buttons.
 */

"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PlotActivity } from "@/types"
import { formatDate } from "@/lib/utils/date"
import { Edit, Trash2, MapPin, User } from "lucide-react"
import Image from "next/image"

interface ActivityCardProps {
  activity: PlotActivity
  stationName?: string
  onEdit?: (activity: PlotActivity) => void
  onDelete?: (activityId: string) => void
  canEdit?: boolean
}

export function ActivityCard({ activity, stationName, onEdit, onDelete, canEdit = false }: ActivityCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-base">{activity.activityType}</CardTitle>
              <Badge variant="outline">{formatDate(activity.date)}</Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              {stationName && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{stationName}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{activity.createdByName}</span>
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => onEdit?.(activity)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete?.(activity.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Description */}
        {activity.description && <p className="text-sm text-foreground">{activity.description}</p>}

        {/* Images */}
        {activity.images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {activity.images.map((img, index) => (
              <div key={index} className="relative h-24 w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={img || "/placeholder.svg"}
                  alt={`Activity image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
