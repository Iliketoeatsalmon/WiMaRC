/**
 * User Form Component
 *
 * Form for creating and editing user accounts.
 * Includes station permission assignment.
 * Used by administrators only.
 */

"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { User, Station, UserRole } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UserFormProps {
  stations: Station[]
  onSubmit: (user: Partial<User>) => void
  onCancel: () => void
  initialData?: User
}

export function UserForm({ stations, onSubmit, onCancel, initialData }: UserFormProps) {
  const [formData, setFormData] = useState({
    username: initialData?.username || "",
    email: initialData?.email || "",
    name: initialData?.name || "",
    role: initialData?.role || ("user" as UserRole),
    permittedStations: initialData?.permittedStations || [],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username || !formData.email || !formData.name) {
      alert("Please fill in all required fields")
      return
    }

    onSubmit(formData)
  }

  const toggleStation = (stationId: string) => {
    setFormData({
      ...formData,
      permittedStations: formData.permittedStations.includes(stationId)
        ? formData.permittedStations.filter((id) => id !== stationId)
        : [...formData.permittedStations, stationId],
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username">
          Username <span className="text-destructive">*</span>
        </Label>
        <Input
          id="username"
          placeholder="johndoe"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
          disabled={!!initialData}
        />
        {initialData && <p className="text-xs text-muted-foreground">Username cannot be changed</p>}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Admins have access to all stations and management features</p>
      </div>

      {/* Station Permissions (only for non-admin users) */}
      {formData.role === "user" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Station Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Select stations this user can access</p>
              {stations.map((station) => (
                <div key={station.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={station.id}
                    checked={formData.permittedStations.includes(station.id)}
                    onCheckedChange={() => toggleStation(station.id)}
                  />
                  <label
                    htmlFor={station.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {station.name}
                  </label>
                </div>
              ))}
              {formData.permittedStations.length === 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Warning: User will not have access to any stations
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form actions */}
      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update User" : "Create User"}</Button>
      </div>
    </form>
  )
}
