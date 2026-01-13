/**
 * Plot Activity Management Page (กิจกรรมแปลงเพาะปลูก)
 * CRUD operations for agricultural activities
 * Supports image attachments (max 3 per activity)
 * Role-based permissions: Admin (all), User (permitted stations), Guest (read-only)
 */

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getAllStations } from "@/services/stationsService"
import {
  getAllActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityTypes,
} from "@/services/activityService"
import { exportActivitiesToCSV } from "@/services/exportService"
import { getPermittedStations, canEditData } from "@/utils/permissions"
import type { Station, PlotActivity } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ActivityModal } from "@/components/activities/ActivityModal"
import { ActivityFormDialog, type ActivityFormData } from "@/components/activities/ActivityFormDialog"
import { formatThaiDate } from "@/utils/dateUtils"
import { Plus, MoreVertical, Eye, Edit, Trash2, Download, ImageIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

export default function ActivitiesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [allStations, setAllStations] = useState<Station[]>([])
  const [permittedStations, setPermittedStations] = useState<Station[]>([])
  const [activities, setActivities] = useState<PlotActivity[]>([])
  const [filteredActivities, setFilteredActivities] = useState<PlotActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStationFilter, setSelectedStationFilter] = useState<string>("all")
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all")

  // Modals
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewActivity, setViewActivity] = useState<PlotActivity | null>(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editActivity, setEditActivity] = useState<PlotActivity | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null)

  const canEdit = canEditData(user)
  const activityTypes = getActivityTypes()

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      const stations = await getAllStations()
      setAllStations(stations)
      const permitted = getPermittedStations(user, stations)
      setPermittedStations(permitted)

      const allActivities = await getAllActivities()
      // Filter activities to only show those from permitted stations
      const permittedActivities = allActivities.filter((activity) =>
        permitted.some((station) => station.id === activity.stationId),
      )
      setActivities(permittedActivities)
      setFilteredActivities(permittedActivities)

      setIsLoading(false)
    }

    loadData()
  }, [user])

  // Apply filters
  useEffect(() => {
    let filtered = [...activities]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (activity) =>
          activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.activityType.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Station filter
    if (selectedStationFilter !== "all") {
      filtered = filtered.filter((activity) => activity.stationId === selectedStationFilter)
    }

    // Type filter
    if (selectedTypeFilter !== "all") {
      filtered = filtered.filter((activity) => activity.activityType === selectedTypeFilter)
    }

    setFilteredActivities(filtered)
  }, [searchQuery, selectedStationFilter, selectedTypeFilter, activities])

  // Handle view activity
  const handleViewActivity = (activity: PlotActivity) => {
    setViewActivity(activity)
    setViewModalOpen(true)
  }

  // Handle create new activity
  const handleCreateActivity = () => {
    setEditActivity(null)
    setFormModalOpen(true)
  }

  // Handle edit activity
  const handleEditActivity = (activity: PlotActivity) => {
    setEditActivity(activity)
    setFormModalOpen(true)
  }

  // Handle form submit (create or update)
  const handleFormSubmit = async (data: ActivityFormData) => {
    try {
      if (editActivity) {
        // Update existing activity
        await updateActivity(editActivity.id, {
          stationId: data.stationId,
          date: new Date(data.date),
          activityType: data.activityType,
          description: data.description,
          images: data.images,
        })

        toast({
          title: "บันทึกสำเร็จ",
          description: "แก้ไขกิจกรรมเรียบร้อยแล้ว",
        })
      } else {
        // Create new activity
        await createActivity({
          stationId: data.stationId,
          date: new Date(data.date),
          activityType: data.activityType,
          description: data.description,
          createdBy: user!.id,
          createdByName: user!.fullName,
          images: data.images,
        })

        toast({
          title: "บันทึกสำเร็จ",
          description: "เพิ่มกิจกรรมใหม่เรียบร้อยแล้ว",
        })
      }

      // Reload activities
      const allActivities = await getAllActivities()
      const permittedActivities = allActivities.filter((activity) =>
        permittedStations.some((station) => station.id === activity.stationId),
      )
      setActivities(permittedActivities)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกกิจกรรมได้",
      })
    }
  }

  // Handle delete activity
  const handleDeleteActivity = (activityId: string) => {
    setDeleteActivityId(activityId)
    setDeleteDialogOpen(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteActivityId) return

    try {
      await deleteActivity(deleteActivityId)

      toast({
        title: "ลบสำเร็จ",
        description: "ลบกิจกรรมเรียบร้อยแล้ว",
      })

      // Reload activities
      const allActivities = await getAllActivities()
      const permittedActivities = allActivities.filter((activity) =>
        permittedStations.some((station) => station.id === activity.stationId),
      )
      setActivities(permittedActivities)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบกิจกรรมได้",
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeleteActivityId(null)
    }
  }

  // Handle CSV export
  const handleExport = () => {
    exportActivitiesToCSV(filteredActivities)
    toast({
      title: "ดาวน์โหลดสำเร็จ",
      description: "ส่งออกข้อมูลเป็น CSV เรียบร้อยแล้ว",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">กิจกรรมแปลงเพาะปลูก</h1>
          <p className="text-muted-foreground">บันทึกและจัดการกิจกรรมในแปลง</p>
        </div>
        {canEdit && (
          <Button onClick={handleCreateActivity}>
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มกิจกรรม
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>ค้นหาและกรอง</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="space-y-2">
              <Label>ค้นหา</Label>
              <Input
                placeholder="ค้นหาตามรายละเอียด..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Station filter */}
            <div className="space-y-2">
              <Label>สถานี</Label>
              <Select value={selectedStationFilter} onValueChange={setSelectedStationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {permittedStations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type filter */}
            <div className="space-y-2">
              <Label>ประเภทกิจกรรม</Label>
              <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {activityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>พบ {filteredActivities.length} รายการ</span>
            <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredActivities.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              ดาวน์โหลด CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activities list */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {activities.length === 0 ? "ยังไม่มีกิจกรรมที่บันทึก" : "ไม่พบกิจกรรมที่ตรงกับเงื่อนไขที่เลือก"}
            </CardContent>
          </Card>
        ) : (
          filteredActivities.map((activity) => {
            const station = allStations.find((s) => s.id === activity.stationId)

            return (
              <Card key={activity.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge>{activity.activityType}</Badge>
                        {activity.images.length > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <ImageIcon className="h-3 w-3" />
                            {activity.images.length}/3
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-medium">{station?.name || "ไม่ทราบสถานี"}</h3>

                      <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>วันที่: {formatThaiDate(activity.date)}</span>
                        <span>บันทึกโดย: {activity.createdByName}</span>
                      </div>
                    </div>

                    {/* Actions menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewActivity(activity)}>
                          <Eye className="mr-2 h-4 w-4" />
                          ดูรายละเอียด
                        </DropdownMenuItem>
                        {canEdit && (
                          <>
                            <DropdownMenuItem onClick={() => handleEditActivity(activity)}>
                              <Edit className="mr-2 h-4 w-4" />
                              แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteActivity(activity.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              ลบ
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* View Modal */}
      <ActivityModal activity={viewActivity} open={viewModalOpen} onOpenChange={setViewModalOpen} />

      {/* Form Modal */}
      <ActivityFormDialog
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSubmit={handleFormSubmit}
        stations={permittedStations}
        editActivity={editActivity}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>คุณแน่ใจหรือไม่ที่จะลบกิจกรรมนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              ลบ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
