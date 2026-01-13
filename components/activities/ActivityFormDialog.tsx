/**
 * Activity Form Dialog Component
 * Modal form for creating/editing plot activities with image upload
 * Supports up to 3 image attachments with counter
 */

"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import type { Station, PlotActivity } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getActivityTypes } from "@/services/activityService"
import { ImagePlus, X } from "lucide-react"

interface ActivityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ActivityFormData) => Promise<void>
  stations: Station[]
  editActivity?: PlotActivity | null
}

export interface ActivityFormData {
  stationId: string
  date: string // ISO date string
  activityType: string
  description: string
  images: string[] // Up to 3 image URLs
}

const MAX_IMAGES = 3

export function ActivityFormDialog({ open, onOpenChange, onSubmit, stations, editActivity }: ActivityFormDialogProps) {
  const activityTypes = useMemo(() => getActivityTypes(), [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [stationId, setStationId] = useState("")
  const [date, setDate] = useState("")
  const [activityType, setActivityType] = useState("")
  const [description, setDescription] = useState("")
  const [images, setImages] = useState<string[]>([])

  // Initialize form when editing
  useEffect(() => {
    if (editActivity) {
      setStationId(editActivity.stationId)
      setDate(new Date(editActivity.date).toISOString().split("T")[0])
      setActivityType(editActivity.activityType)
      setDescription(editActivity.description)
      setImages(editActivity.images)
    } else {
      // Reset form for new activity
      setStationId(stations[0]?.id || "")
      setDate(new Date().toISOString().split("T")[0])
      setActivityType(activityTypes[0])
      setDescription("")
      setImages([])
    }
  }, [editActivity, stations, activityTypes, open])

  // Handle image addition (mock - just add placeholder)
  const handleAddImage = () => {
    if (images.length < MAX_IMAGES) {
      setImages([...images, `/placeholder.svg?height=300&width=400&text=Image ${images.length + 1}`])
    }
  }

  // Handle image removal
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit({
        stationId,
        date,
        activityType,
        description,
        images,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit activity", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editActivity ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}</DialogTitle>
          <DialogDescription>บันทึกกิจกรรมในแปลงเพาะปลูก (สามารถแนบรูปภาพได้สูงสุด 3 รูป)</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Station selector */}
          <div className="space-y-2">
            <Label htmlFor="station">สถานี/แปลง</Label>
            <Select value={stationId} onValueChange={setStationId} required>
              <SelectTrigger id="station">
                <SelectValue placeholder="เลือกสถานี" />
              </SelectTrigger>
              <SelectContent>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={station.id}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">วันที่ทำกิจกรรม</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          {/* Activity type */}
          <div className="space-y-2">
            <Label htmlFor="type">ประเภทกิจกรรม</Label>
            <Select value={activityType} onValueChange={setActivityType} required>
              <SelectTrigger id="type">
                <SelectValue placeholder="เลือกประเภท" />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียด</Label>
            <Textarea
              id="description"
              placeholder="อธิบายกิจกรรมที่ทำ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                รูปภาพ ({images.length}/{MAX_IMAGES})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddImage}
                disabled={images.length >= MAX_IMAGES}
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                เพิ่มรูป
              </Button>
            </div>

            {images.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-3">
                {images.map((imageUrl, idx) => (
                  <div key={idx} className="relative overflow-hidden rounded-lg border">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={`รูป ${idx + 1}`}
                      className="h-32 w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 h-6 w-6"
                      onClick={() => handleRemoveImage(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {images.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                ยังไม่มีรูปภาพ (สามารถเพิ่มได้สูงสุด 3 รูป)
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : editActivity ? "บันทึกการแก้ไข" : "เพิ่มกิจกรรม"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
