/**
 * User Management Page (Admin Only)
 *
 * Dedicated page for managing system users.
 * Features:
 * - View all users
 * - Create new users
 * - Edit existing users
 * - Assign station access permissions
 * - View user-station relationships
 * - Delete users
 * - CSV export
 *
 * Only accessible to administrators.
 */

"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { UserForm } from "@/components/admin/user-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { User } from "@/types"
import { mockUsers, mockStations } from "@/lib/mock-data"
import { convertToCSV, downloadCSV } from "@/lib/utils/export"
import { Plus, Search, Download, Edit, Trash2, UsersIcon } from "lucide-react"

export default function UserManagementPage() {
  const { user: currentUser, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const [users, setUsers] = useState<User[]>(mockUsers)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setMounted(true)
    if (!isLoading && !currentUser) {
      router.push("/login")
    }
    // Redirect non-admin users
    if (!isLoading && currentUser && currentUser.role !== "admin") {
      router.push("/dashboard")
    }
  }, [currentUser, isLoading, router])

  // Filter users
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Create new user
  const handleCreateUser = (newUser: Partial<User>) => {
    const user: User = {
      id: `user-${Date.now()}`,
      username: newUser.username!,
      email: newUser.email!,
      name: newUser.name!,
      role: newUser.role!,
      permittedStations: newUser.permittedStations || [],
      createdAt: new Date().toISOString(),
    }

    setUsers([...users, user])
    setIsCreateDialogOpen(false)
  }

  // Edit user
  const handleEditUser = (updatedUser: Partial<User>) => {
    if (!editingUser) return

    setUsers(
      users.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              ...updatedUser,
            }
          : user,
      ),
    )

    setIsEditDialogOpen(false)
    setEditingUser(null)
  }

  // Delete user
  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      alert("You cannot delete your own account")
      return
    }

    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((user) => user.id !== userId))
    }
  }

  // Export to CSV
  const handleExport = () => {
    const exportData = users.map((user) => ({
      Name: user.name,
      Username: user.username,
      Email: user.email,
      Role: user.role,
      "Permitted Stations": user.permittedStations.length,
      "Created At": user.createdAt,
    }))

    const csv = convertToCSV(exportData)
    downloadCSV(csv, `users_${new Date().toISOString().split("T")[0]}.csv`)
  }

  if (!mounted || isLoading || !currentUser || currentUser.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const adminCount = users.filter((u) => u.role === "admin").length
  const userCount = users.filter((u) => u.role === "user").length

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <UsersIcon className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold text-balance">User Management</h1>
            </div>
            <p className="text-muted-foreground">Manage system users and their station access permissions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Administrators</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{adminCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Regular Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{userCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Permitted Stations</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role === "admin" ? "Admin" : "User"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.role === "admin" ? (
                          <span className="text-sm text-muted-foreground">All stations</span>
                        ) : (
                          <span className="text-sm">{user.permittedStations.length} stations</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.id === currentUser.id}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No users found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create User Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Add a new user and assign station permissions</DialogDescription>
            </DialogHeader>
            <UserForm
              stations={mockStations}
              onSubmit={handleCreateUser}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user information and station permissions</DialogDescription>
            </DialogHeader>
            {editingUser && (
              <UserForm
                stations={mockStations}
                onSubmit={handleEditUser}
                onCancel={() => {
                  setIsEditDialogOpen(false)
                  setEditingUser(null)
                }}
                initialData={editingUser}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
