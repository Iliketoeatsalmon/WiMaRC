"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { SimPaymentService } from "@/services/simPaymentService"
import { StationsService } from "@/services/stationsService"
import type { SimPayment, Station } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PaymentFormDialog } from "@/components/payments/PaymentFormDialog"
import { Plus, Search, Download, CreditCard, AlertTriangle, CheckCircle2, Clock } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"
import { canEditActivities } from "@/utils/permissions"
import { exportToCSV } from "@/services/exportService"

export default function PaymentsPage() {
  const { user } = useAuth()
  const [payments, setPayments] = useState<SimPayment[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [selectedStation, setSelectedStation] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState<SimPayment | undefined>()

  useEffect(() => {
    if (user) {
      const userStations = StationsService.getStationsByUser(user)
      setStations(userStations)
      loadPayments()
    }
  }, [user, selectedStation, selectedStatus])

  const loadPayments = () => {
    const filters: any = {}

    if (selectedStation !== "all") {
      filters.stationId = selectedStation
    }

    if (selectedStatus !== "all") {
      filters.status = selectedStatus
    }

    const data = SimPaymentService.getPayments(filters)
    setPayments(data)
  }

  const handleSubmit = (data: Partial<SimPayment>) => {
    if (editingPayment) {
      SimPaymentService.updatePayment(editingPayment.id, data)
    } else {
      SimPaymentService.createPayment(data as Omit<SimPayment, "id">)
    }
    loadPayments()
    setEditingPayment(undefined)
  }

  const handleMarkPaid = (payment: SimPayment) => {
    SimPaymentService.markAsPaid(payment.id, new Date())
    loadPayments()
  }

  const handleExport = () => {
    const exportData = filteredPayments.map((p) => {
      const station = stations.find((s) => s.id === p.stationId)
      return {
        สถานี: station?.name || p.stationId,
        "หมายเลข SIM": p.simNumber,
        ผู้ให้บริการ: p.provider,
        จำนวนเงิน: p.amount,
        วันครบกำหนด: format(new Date(p.dueDate), "dd/MM/yyyy", { locale: th }),
        สถานะ: p.status === "paid" ? "ชำระแล้ว" : "รอชำระ",
        วันที่ชำระ: p.paidDate ? format(new Date(p.paidDate), "dd/MM/yyyy", { locale: th }) : "-",
        หมายเหตุ: p.notes || "-",
      }
    })
    exportToCSV(exportData, "sim-payments")
  }

  const filteredPayments = payments.filter((payment) => {
    const station = stations.find((s) => s.id === payment.stationId)
    const searchLower = searchTerm.toLowerCase()

    return (
      station?.name.toLowerCase().includes(searchLower) ||
      payment.simNumber.toLowerCase().includes(searchLower) ||
      payment.provider.toLowerCase().includes(searchLower)
    )
  })

  const amounts = SimPaymentService.getTotalAmounts(filteredPayments)
  const overduePayments = SimPaymentService.getOverduePayments(selectedStation !== "all" ? selectedStation : undefined)
  const upcomingPayments = SimPaymentService.getUpcomingPayments(
    selectedStation !== "all" ? selectedStation : undefined,
  )

  const getStatusBadge = (payment: SimPayment) => {
    if (payment.status === "paid") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          ชำระแล้ว
        </Badge>
      )
    }

    const dueDate = new Date(payment.dueDate)
    const now = new Date()

    if (dueDate < now) {
      return <Badge variant="destructive">เกินกำหนด</Badge>
    }

    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        รอชำระ
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ยอดรวมทั้งหมด</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{amounts.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredPayments.length} รายการ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ชำระแล้ว</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">฿{amounts.paid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.filter((p) => p.status === "paid").length} รายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">รอชำระ</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">฿{amounts.pending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPayments.filter((p) => p.status === "pending").length} รายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">เกินกำหนด</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overduePayments.length}</div>
            <p className="text-xs text-muted-foreground">ต้องชำระด่วน</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>การชำระค่า SIM Card</CardTitle>
              <CardDescription>จัดการและติดตามการชำระค่าบริการ SIM Card ของทุกสถานี</CardDescription>
            </div>
            <div className="flex gap-2">
              {canEditActivities(user) && (
                <Button
                  onClick={() => {
                    setEditingPayment(undefined)
                    setShowForm(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  เพิ่มรายการชำระเงิน
                </Button>
              )}
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                ส่งออก CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาสถานี, หมายเลข SIM, ผู้ให้บริการ..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedStation} onValueChange={setSelectedStation}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">สถานีทั้งหมด</SelectItem>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={station.id}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                <SelectItem value="pending">รอชำระ</SelectItem>
                <SelectItem value="paid">ชำระแล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Overdue Alert */}
          {overduePayments.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">มีรายการเกินกำหนดชำระ {overduePayments.length} รายการ</h4>
                  <p className="text-sm text-red-700 mt-1">กรุณาตรวจสอบและดำเนินการชำระเงินโดยเร็วที่สุด</p>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Alert */}
          {upcomingPayments.length > 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900">
                    มีรายการที่ใกล้ครบกำหนดชำระ {upcomingPayments.length} รายการ
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">ภายใน 30 วันข้างหน้า</p>
                </div>
              </div>
            </div>
          )}

          {/* Payments Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>สถานี</TableHead>
                  <TableHead>หมายเลข SIM</TableHead>
                  <TableHead>ผู้ให้บริการ</TableHead>
                  <TableHead className="text-right">จำนวนเงิน</TableHead>
                  <TableHead>วันครบกำหนด</TableHead>
                  <TableHead>วันที่ชำระ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>หมายเหตุ</TableHead>
                  {canEditActivities(user) && <TableHead className="text-right">จัดการ</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      ไม่พบข้อมูลรายการชำระเงิน
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => {
                    const station = stations.find((s) => s.id === payment.stationId)
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{station?.name}</TableCell>
                        <TableCell>{payment.simNumber}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.provider}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">฿{payment.amount.toLocaleString()}</TableCell>
                        <TableCell>{format(new Date(payment.dueDate), "dd MMM yyyy", { locale: th })}</TableCell>
                        <TableCell>
                          {payment.paidDate ? format(new Date(payment.paidDate), "dd MMM yyyy", { locale: th }) : "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(payment)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{payment.notes || "-"}</TableCell>
                        {canEditActivities(user) && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {payment.status === "pending" && (
                                <Button size="sm" variant="outline" onClick={() => handleMarkPaid(payment)}>
                                  ชำระแล้ว
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingPayment(payment)
                                  setShowForm(true)
                                }}
                              >
                                แก้ไข
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form Dialog */}
      <PaymentFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        stations={stations}
        payment={editingPayment}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
