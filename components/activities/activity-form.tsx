/**
 * Activity Form Component
 *
 * Form for creating and editing plot activities.
 * Supports:
 * - Activity details (date, type, description)
 * - Station/plot selection
 * - Image uploads (max 3 images per activity per day)
 * - Image preview before upload
 */

"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { PlotActivity, Station } from "@/types"
import { X, Upload } from "lucide-react"
import Image from "next/image"

interface ActivityFormProps {
  stations: Station[]
  onSubmit: (activity: Partial<PlotActivity>) => void
  onCancel: () => void
  initialData?: PlotActivity
}

// Common activity types
const activityTypes = [
  "Irrigation",
  "Fertilization",
  "Planting",
  "Harvesting",
  "Pest Control",
  "Weeding",
  "Soil Testing",
  "Maintenance",
  "Other",
]

export function ActivityForm({ stations, onSubmit, onCancel, initialData }: ActivityFormProps) {
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split("T")[0],
    activityType: initialData?.activityType || "",
    description: initialData?.description || "",
    stationId: initialData?.stationId || "",
  })

  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Check if adding these files would exceed the limit
    if (images.length + files.length > 3) {
      alert("Maximum 3 images per activity")
      return
    }

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages((prev) => [...prev, e.target.result as string])
        }
      }
      reader.readAsDataURL(file)
    })

    setImageFiles((prev) => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.stationId || !formData.activityType) {
      alert("Please fill in all required fields")
      return
    }

    onSubmit({
      ...formData,
      images,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">
          Date <span className="text-destructive">*</span>
        </Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      {/* Activity Type */}
      <div className="space-y-2">
        <Label htmlFor="activityType">
          Activity Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.activityType}
          onValueChange={(value) => setFormData({ ...formData, activityType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select activity type" />
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

      {/* Station/Plot */}
      <div className="space-y-2">
        <Label htmlFor="station">
          Station/Plot <span className="text-destructive">*</span>
        </Label>
        <Select value={formData.stationId} onValueChange={(value) => setFormData({ ...formData, stationId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select station" />
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

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the activity..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label>Images (Max 3)</Label>
        <div className="space-y-3">
          {/* Image previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <div className="relative h-24 w-full overflow-hidden rounded-lg border bg-muted">
                    <Image src={img || "/placeholder.svg"} alt={`Preview ${index + 1}`} fill className="object-cover" />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          {images.length < 3 && (
            <div>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 hover:border-muted-foreground/50 transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload images ({images.length}/3)</span>
                </div>
              </Label>
            </div>
          )}
        </div>
      </div>

      {/* Form actions */}
      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update Activity" : "Create Activity"}</Button>
      </div>
    </form>
  )
}
