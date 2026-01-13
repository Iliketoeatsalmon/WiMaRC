/**
 * Admin System Status Page (สถานะการทำงานของระบบ)
 * Admin-only page showing all stations' operational status
 * Includes filtering, search, and navigation to station details
 */

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { getAllStations, getStationStatusSummary } from "@/services/stationsService"
import { canAccessAdminPages } from "@/utils/permissions"
import type { Station } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { formatThaiDateTime, getTimeDifference } from "@/utils/dateUtils"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Server, Activity, AlertCircle } from "lucide-react"
import { getAllUsers } from "@/services/userService"
import type { User } from "@/types"

export default function SystemStatusPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stations, setStations] = useState<Station[]>([])
  const [filteredStations, setFilteredStations] = useState<Station[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [summary, setSummary] = useState({ total: 0, online: 0, offline: 0 })
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [ownerFilter, setOwnerFilter] = useState<string>("all")

  // Check admin permission
  useEffect(() => {
    if (!canAccessAdminPages(user)) {
      router.push("/dashboard")
    }
  }, [user, router])

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      const [stationsData, summaryData, usersData] = await Promise.all([
        getAllStations(),
        getStationStatusSummary(),
        getAllUsers(),
      ])

      setStations(stationsData)
      setFilteredStations(stationsData)
      setSummary(summaryData)
      setUsers(usersData)
      setIsLoading(false)
    }

    loadData()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...stations]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (station) =>
          station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          station.area.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((station) => station.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((station) => station.type === typeFilter)
    }

    // Owner filter
    if (ownerFilter !== "all") {
      filtered = filtered.filter((station) => station.ownerId === ownerFilter)
    }

    setFilteredStations(filtered)
  }, [searchQuery, statusFilter, typeFilter, ownerFilter, stations])

  // Navigate to station dashboard
  const handleStationClick = (stationId: string) => {
    router.push(`/dashboard?station=${stationId}`)
  }

  // Get owner name
  const getOwnerName = (ownerId: string) => {
    const owner = users.find((u) => u.id === ownerId)
    return owner?.fullName || "ไม่ทราบ"
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
      <div>
        <h1 className="text-3xl font-bold">สถานะการทำงานของระบบ</h1>
        <p className="text-muted-foreground">ตรวจสอบสถานะการทำงานของสถานีทั้งหมด</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">สถานีทั้งหมด</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground">จำนวนสถานีในระบบ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ออนไลน์</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{summary.online}</div>
            <p className="text-xs text-muted-foreground">สถานีที่ทำงานปกติ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ออฟไลน์</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summary.offline}</div>
            <p className="text-xs text-muted-foreground">สถานีที่ไม่ตอบสนอง</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>ค้นหาและกรอง</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>ค้นหา</Label>
              <Input placeholder="ชื่อสถานี..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>

            {/* Status filter */}
            <div className="space-y-2">
              <Label>สถานะ</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="online">ออนไลน์</SelectItem>
                  <SelectItem value="offline">ออฟไลน์</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type filter */}
            <div className="space-y-2">
              <Label>ประเภท</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="weather">สถานีอากาศ</SelectItem>
                  <SelectItem value="soil">สถานีดิน</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Owner filter */}
            <div className="space-y-2">
              <Label>เจ้าของ</Label>
              <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">พบ {filteredStations.length} สถานี</div>
        </CardContent>
      </Card>

      {/* Stations table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการสถานี</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStations.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">ไม่พบสถานีที่ตรงกับเงื่อนไข</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">ชื่อสถานี</th>
                    <th className="p-3 text-left">ประเภท</th>
                    <th className="p-3 text-left">เจ้าของ</th>
                    <th className="p-3 text-left">สถานะ</th>
                    <th className="p-3 text-left">อัปเดตล่าสุด</th>
                    <th className="p-3 text-left">เวลาที่ผ่านมา</th>
                    <th className="p-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStations.map((station) => (
                    <tr key={station.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{station.name}</p>
                          <p className="text-xs text-muted-foreground">{station.area}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{station.type === "weather" ? "อากาศ" : "ดิน"}</Badge>
                      </td>
                      <td className="p-3">{getOwnerName(station.ownerId)}</td>
                      <td className="p-3">
                        <StatusBadge status={station.status} />
                      </td>
                      <td className="p-3 text-xs">{formatThaiDateTime(station.lastDataTime)}</td>
                      <td className="p-3 text-xs text-muted-foreground">{getTimeDifference(station.lastDataTime)}</td>
                      <td className="p-3 text-center">
                        <Button variant="ghost" size="sm" onClick={() => handleStationClick(station.id)}>
                          ดูรายละเอียด
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert for offline stations */}
      {summary.offline > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>มีสถานีออฟไลน์ {summary.offline} สถานี กรุณาตรวจสอบการเชื่อมต่อและสถานะของอุปกรณ์</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
