/**
 * SIM Card Form Component
 *
 * Form for creating and editing SIM card records.
 * Used by administrators to manage SIM cards associated with stations.
 */

"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SimCard, Station } from "@/types"

interface SimFormProps {
  stations: Station[]
  onSubmit: (sim: Partial<SimCard>) => void
  onCancel: () => void
  initialData?: SimCard
}

const providers = ["AIS", "DTAC", "TRUE", "NT Mobile"]

export function SimForm({ stations, onSubmit, onCancel, initialData }: SimFormProps) {
  const [formData, setFormData] = useState({
    simNumber: initialData?.simNumber || "",
    provider: initialData?.provider || "AIS",
    associatedStation: initialData?.associatedStation || "none",
    status: initialData?.status || "active",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.simNumber || !formData.provider) {
      alert("Please fill in all required fields")
      return
    }

    onSubmit({
      ...formData,
      associatedStation: formData.associatedStation === "none" ? undefined : formData.associatedStation,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* SIM Number */}
      <div className="space-y-2">
        <Label htmlFor="simNumber">
          SIM Number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="simNumber"
          placeholder="e.g., 0812345678"
          value={formData.simNumber}
          onChange={(e) => setFormData({ ...formData, simNumber: e.target.value })}
          required
        />
      </div>

      {/* Provider */}
      <div className="space-y-2">
        <Label htmlFor="provider">
          Provider <span className="text-destructive">*</span>
        </Label>
        <Select value={formData.provider} onValueChange={(value) => setFormData({ ...formData, provider: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider} value={provider}>
                {provider}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Associated Station */}
      <div className="space-y-2">
        <Label htmlFor="station">Associated Station</Label>
        <Select
          value={formData.associatedStation}
          onValueChange={(value) => setFormData({ ...formData, associatedStation: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select station (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {stations.map((station) => (
              <SelectItem key={station.id} value={station.id}>
                {station.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Form actions */}
      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update SIM" : "Create SIM"}</Button>
      </div>
    </form>
  )
}
