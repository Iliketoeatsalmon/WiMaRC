/**
 * Activity Detail Modal Component
 * Displays full activity details including images in a modal dialog
 */

"use client"

import type { PlotActivity } from "@/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatThaiDate, formatThaiDateTime } from "@/utils/dateUtils"
import { Calendar, User, ImageIcon } from "lucide-react"

interface ActivityModalProps {
  activity: PlotActivity | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActivityModal({ activity, open, onOpenChange }: ActivityModalProps) {
  if (!activity) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">รายละเอียดกิจกรรม</DialogTitle>
          <DialogDescription>ข้อมูลกิจกรรมในแปลงเพาะปลูก</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Activity type badge */}
          <div>
            <Badge className="text-base">{activity.activityType}</Badge>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">วันที่ทำกิจกรรม:</span>
            <span>{formatThaiDate(activity.date)}</span>
          </div>

          {/* Created by */}
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">บันทึกโดย:</span>
            <span>{activity.createdByName}</span>
          </div>

          {/* Created at */}
          <div className="text-sm text-muted-foreground">บันทึกเมื่อ: {formatThaiDateTime(activity.createdAt)}</div>

          {/* Description */}
          <div>
            <h4 className="mb-2 font-medium">รายละเอียด:</h4>
            <p className="rounded-lg bg-muted p-3 text-sm leading-relaxed">{activity.description}</p>
          </div>

          {/* Images */}
          {activity.images.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <h4 className="font-medium">รูปภาพ ({activity.images.length}/3)</h4>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {activity.images.map((imageUrl, idx) => (
                  <div key={idx} className="overflow-hidden rounded-lg border">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={`รูปกิจกรรม ${idx + 1}`}
                      className="h-48 w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
