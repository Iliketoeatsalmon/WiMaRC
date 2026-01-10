/**
 * Plot Activity Management Page
 *
 * Full CRUD operations for plot activities:
 * - Create new activities
 * - View activity list with filtering
 * - Edit existing activities
 * - Delete activities
 * - Image upload (max 3 per activity)
 * - CSV export
 *
 * Access control:
 * - Users see only activities for their permitted stations
 * - Admins see all activities
 */

"use client"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { ActivityCard } from "@/components/activities/activity-card"
import { ActivityForm } from "@/components/activities/activity-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import type { PlotActivity } from "@/types"
import { mockStations, mockActivities } from "@/lib/mock-data"
import { convertToCSV, downloadCSV } from "@/lib/utils/export"
import { Plus, Search, Download, Sprout } from "lucide-react"

export default function ActivitiesPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const [activities, setActivities] = useState<PlotActivity[]>(mockActivities)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState<PlotActivity | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [stationFilter, setStationFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  useEffect(() => {
    setMounted(true)
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Filter stations based on user permissions
  const accessibleStations = useMemo(() => {
    if (!user) return []
    return user.role === "admin"
      ? mockStations
      : mockStations.filter((station) => user.permittedStations.includes(station.id))
  }, [user])

  // Filter activities based on permissions and search
  const filteredActivities = useMemo(() => {
    let filtered = activities

    // Permission filter
    if (user?.role !== "admin") {
      const accessibleStationIds = accessibleStations.map((s) => s.id)
      filtered = filtered.filter((activity) => accessibleStationIds.includes(activity.stationId))
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (activity) =>
          activity.activityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Station filter
    if (stationFilter !== "all") {
      filtered = filtered.filter((activity) => activity.stationId === stationFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((activity) => activity.activityType === typeFilter)
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [activities, user, accessibleStations, searchQuery, stationFilter, typeFilter])

  // Get unique activity types for filter
  const activityTypes = Array.from(new Set(activities.map((a) => a.activityType)))

  // Create new activity
  const handleCreateActivity = (newActivity: Partial<PlotActivity>) => {
    const activity: PlotActivity = {
      id: `activity-${Date.now()}`,
      date: newActivity.date!,
      activityType: newActivity.activityType!,
      description: newActivity.description || "",
      stationId: newActivity.stationId!,
      createdBy: user!.id,
      createdByName: user!.name,
      images: newActivity.images || [],
      createdAt: new Date().toISOString(),
    }

    setActivities([...activities, activity])
    setIsCreateDialogOpen(false)
  }

  // Edit activity
  const handleEditActivity = (updatedActivity: Partial<PlotActivity>) => {
    if (!editingActivity) return

    setActivities(
      activities.map((activity) =>
        activity.id === editingActivity.id
          ? {
              ...activity,
              ...updatedActivity,
            }
          : activity,
      ),
    )

    setIsEditDialogOpen(false)
    setEditingActivity(null)
  }

  // Delete activity
  const handleDeleteActivity = (activityId: string) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      setActivities(activities.filter((activity) => activity.id !== activityId))
    }
  }

  // Export to CSV
  const handleExport = () => {
    const exportData = filteredActivities.map((activity) => ({
      Date: activity.date,
      "Activity Type": activity.activityType,
      Description: activity.description,
      Station: accessibleStations.find((s) => s.id === activity.stationId)?.name || activity.stationId,
      "Created By": activity.createdByName,
      "Image Count": activity.images.length,
    }))

    const csv = convertToCSV(exportData)
    downloadCSV(csv, `plot_activities_${new Date().toISOString().split("T")[0]}.csv`)
  }

  if (!mounted || isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Sprout className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold text-balance">Plot Activities</h1>
            </div>
            <p className="text-muted-foreground">Manage and track all farm activities and operations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Activity
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={stationFilter} onValueChange={setStationFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Stations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stations</SelectItem>
              {accessibleStations.map((station) => (
                <SelectItem key={station.id} value={station.id}>
                  {station.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {activityTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Activities grid */}
        {filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredActivities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                stationName={accessibleStations.find((s) => s.id === activity.stationId)?.name}
                onEdit={(activity) => {
                  setEditingActivity(activity)
                  setIsEditDialogOpen(true)
                }}
                onDelete={handleDeleteActivity}
                canEdit={user.role === "admin" || activity.createdBy === user.id}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Sprout className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Activities Found</p>
                <p className="text-sm mt-1">Create your first activity or adjust your filters</p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Activity Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Activity</DialogTitle>
              <DialogDescription>Add a new plot activity with details and images</DialogDescription>
            </DialogHeader>
            <ActivityForm
              stations={accessibleStations}
              onSubmit={handleCreateActivity}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Activity Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Activity</DialogTitle>
              <DialogDescription>Update activity details and images</DialogDescription>
            </DialogHeader>
            {editingActivity && (
              <ActivityForm
                stations={accessibleStations}
                onSubmit={handleEditActivity}
                onCancel={() => {
                  setIsEditDialogOpen(false)
                  setEditingActivity(null)
                }}
                initialData={editingActivity}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
