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

  const loadPayments = async () => {
    const filters: { stationId?: string } = {}

    if (selectedStation !== "all") {
      filters.stationId = selectedStation
    }

    const data = await SimPaymentService.getPayments(Object.keys(filters).length ? filters : undefined)
    setPayments(data)
  }

  useEffect(() => {
    if (!user) return

    let isCancelled = false

    const loadData = async () => {
      const userStations = await StationsService.getStationsByUser(user)
      if (isCancelled) return
      setStations(userStations)

      const filters: { stationId?: string } = {}
      if (selectedStation !== "all") {
        filters.stationId = selectedStation
      }

      const data = await SimPaymentService.getPayments(Object.keys(filters).length ? filters : undefined)
      if (isCancelled) return
      setPayments(data)
    }

    loadData()

    return () => {
      isCancelled = true
    }
  }, [user, selectedStation])

  const handleSubmit = async (data: Partial<SimPayment>) => {
    if (editingPayment) {
      await SimPaymentService.updatePayment(editingPayment.id, data)
    } else {
      await SimPaymentService.createPayment(data as Omit<SimPayment, "id">)
    }
    await loadPayments()
    setEditingPayment(undefined)
  }

  const handleMarkPaid = async (payment: SimPayment) => {
    await SimPaymentService.markAsPaid(payment.id, new Date())
    await loadPayments()
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
    if (selectedStatus !== "all" && payment.status !== selectedStatus) {
      return false
    }

    const station = stations.find((s) => s.id === payment.stationId)
    const searchLower = searchTerm.toLowerCase()
    const stationName = station?.name?.toLowerCase() || ""

    return (
      stationName.includes(searchLower) ||
      payment.simNumber.toLowerCase().includes(searchLower) ||
      payment.provider.toLowerCase().includes(searchLower)
    )
  })

  const amounts = SimPaymentService.getTotalAmounts(filteredPayments)
  const overduePayments = SimPaymentService.getOverduePayments(payments)
  const upcomingPayments = SimPaymentService.getUpcomingPayments(payments)

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
                <SelectItem value="all">ทุกสถานี</SelectItem>
                {stations.map((station) => (
                  <SelectItem key={station.id} value={station.id}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                <SelectItem value="pending">รอชำระ</SelectItem>
                <SelectItem value="paid">ชำระแล้ว</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>สถานี</TableHead>
                <TableHead>หมายเลข SIM</TableHead>
                <TableHead>ผู้ให้บริการ</TableHead>
                <TableHead className="text-right">จำนวนเงิน</TableHead>
                <TableHead>วันครบกำหนด</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right">การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => {
                const station = stations.find((s) => s.id === payment.stationId)
                return (
                  <TableRow key={payment.id}>
                    <TableCell>{station?.name || payment.stationId}</TableCell>
                    <TableCell>{payment.simNumber}</TableCell>
                    <TableCell>{payment.provider}</TableCell>
                    <TableCell className="text-right">฿{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>{format(new Date(payment.dueDate), "dd/MM/yyyy", { locale: th })}</TableCell>
                    <TableCell>{getStatusBadge(payment)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {canEditActivities(user) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingPayment(payment)
                              setShowForm(true)
                            }}
                          >
                            แก้ไข
                          </Button>
                        )}
                        {payment.status === "pending" && canEditActivities(user) && (
                          <Button variant="outline" size="sm" onClick={() => handleMarkPaid(payment)}>
                            ชำระแล้ว
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredPayments.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">ไม่มีรายการชำระเงิน</div>
          )}
        </CardContent>
      </Card>

      <PaymentFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        stations={stations}
        payment={editingPayment}
        onSubmit={handleSubmit}
      />

      {upcomingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">รายการใกล้ครบกำหนด (30 วัน)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingPayments.map((payment) => {
                const station = stations.find((s) => s.id === payment.stationId)
                return (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium">{station?.name || payment.stationId}</p>
                      <p className="text-sm text-muted-foreground">
                        ครบกำหนด {format(new Date(payment.dueDate), "dd/MM/yyyy", { locale: th })}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                      ฿{payment.amount.toLocaleString()}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
