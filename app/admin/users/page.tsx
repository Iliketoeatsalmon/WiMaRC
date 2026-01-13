/**
 * Admin User Management Page (จัดการผู้ใช้งานระบบ)
 * Admin-only page for CRUD operations on users
 * Manage roles, permissions, and station access
 */

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { canAccessAdminPages, getRoleDisplayName } from "@/utils/permissions"
import { getAllUsers, createUser, updateUser, deleteUser, toggleUserStatus } from "@/services/userService"
import { getAllStations } from "@/services/stationsService"
import type { User, Station } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserFormDialog, type UserFormData } from "@/components/admin/UserFormDialog"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, MoreVertical, Edit, Trash2, UserCheck, UserX } from "lucide-react"
import { formatThaiDate } from "@/utils/dateUtils"

export default function UsersManagementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Search
  const [searchQuery, setSearchQuery] = useState("")

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

  // Check admin permission
  useEffect(() => {
    if (!canAccessAdminPages(user)) {
      router.push("/dashboard")
    }
  }, [user, router])

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      const [usersData, stationsData] = await Promise.all([getAllUsers(), getAllStations()])

      setUsers(usersData)
      setFilteredUsers(usersData)
      setStations(stationsData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  // Apply search filter
  useEffect(() => {
    let filtered = [...users]

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredUsers(filtered)
  }, [searchQuery, users])

  // Handle create new user
  const handleCreateUser = () => {
    setEditUser(null)
    setFormModalOpen(true)
  }

  // Handle edit user
  const handleEditUser = (user: User) => {
    setEditUser(user)
    setFormModalOpen(true)
  }

  // Handle form submit
  const handleFormSubmit = async (data: UserFormData) => {
    try {
      if (editUser) {
        // Update existing user
        const updates: any = {
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          permittedStationIds: data.permittedStationIds,
        }
        if (data.password) {
          updates.password = data.password
        }

        await updateUser(editUser.id, updates)

        toast({
          title: "บันทึกสำเร็จ",
          description: "แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว",
        })
      } else {
        // Create new user
        await createUser({
          username: data.username,
          password: data.password,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          isEnabled: true,
          permittedStationIds: data.permittedStationIds,
        })

        toast({
          title: "บันทึกสำเร็จ",
          description: "เพิ่มผู้ใช้ใหม่เรียบร้อยแล้ว",
        })
      }

      // Reload users
      const usersData = await getAllUsers()
      setUsers(usersData)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลผู้ใช้ได้",
      })
    }
  }

  // Handle toggle user status
  const handleToggleStatus = async (userId: string) => {
    try {
      await toggleUserStatus(userId)

      toast({
        title: "อัปเดตสำเร็จ",
        description: "เปลี่ยนสถานะผู้ใช้เรียบร้อยแล้ว",
      })

      // Reload users
      const usersData = await getAllUsers()
      setUsers(usersData)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเปลี่ยนสถานะได้",
      })
    }
  }

  // Handle delete user
  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId)
    setDeleteDialogOpen(true)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteUserId) return

    try {
      await deleteUser(deleteUserId)

      toast({
        title: "ลบสำเร็จ",
        description: "ลบผู้ใช้เรียบร้อยแล้ว",
      })

      // Reload users
      const usersData = await getAllUsers()
      setUsers(usersData)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบผู้ใช้ได้",
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeleteUserId(null)
    }
  }

  // Get station names for user
  const getUserStations = (user: User) => {
    if (user.role === "Admin") return "ทั้งหมด"
    if (user.permittedStationIds.length === 0) return "ไม่มี"

    const stationNames = user.permittedStationIds
      .map((id) => {
        const station = stations.find((s) => s.id === id)
        return station?.name
      })
      .filter(Boolean)

    return stationNames.slice(0, 2).join(", ") + (stationNames.length > 2 ? ` และอีก ${stationNames.length - 2}` : "")
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!canAccessAdminPages(user)) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">จัดการผู้ใช้งานระบบ</h1>
          <p className="text-muted-foreground">เพิ่ม แก้ไข และจัดการสิทธิ์ผู้ใช้</p>
        </div>
        <Button onClick={handleCreateUser}>
          <Plus className="mr-2 h-4 w-4" />
          เพิ่มผู้ใช้
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>ค้นหาผู้ใช้</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>ค้นหา</Label>
            <Input
              placeholder="ชื่อ, ชื่อผู้ใช้, หรืออีเมล..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">พบ {filteredUsers.length} ผู้ใช้</div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการผู้ใช้</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">ไม่พบผู้ใช้</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">ชื่อผู้ใช้</th>
                    <th className="p-3 text-left">ข้อมูล</th>
                    <th className="p-3 text-left">บทบาท</th>
                    <th className="p-3 text-left">สถานีที่เข้าถึง</th>
                    <th className="p-3 text-left">สถานะ</th>
                    <th className="p-3 text-left">สร้างเมื่อ</th>
                    <th className="p-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <p className="font-medium">{user.username}</p>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={user.role === "Admin" ? "default" : user.role === "User" ? "secondary" : "outline"}
                        >
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs">{getUserStations(user)}</td>
                      <td className="p-3">
                        <Badge variant={user.isEnabled ? "default" : "secondary"}>
                          {user.isEnabled ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs">{formatThaiDate(user.createdAt)}</td>
                      <td className="p-3 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                              {user.isEnabled ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  ปิดใช้งาน
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  เปิดใช้งาน
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              ลบ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      <UserFormDialog
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        onSubmit={handleFormSubmit}
        stations={stations}
        editUser={editUser}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
            <AlertDialogDescription>คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้</AlertDialogDescription>
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
