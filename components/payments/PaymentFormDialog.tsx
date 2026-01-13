"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { SimPayment, SimPaymentStatus, Station } from "@/types"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { th } from "date-fns/locale"

interface PaymentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stations: Station[]
  payment?: SimPayment
  onSubmit: (data: Partial<SimPayment>) => void
}

export function PaymentFormDialog({ open, onOpenChange, stations, payment, onSubmit }: PaymentFormDialogProps) {
  const [stationId, setStationId] = useState(payment?.stationId || "")
  const [simNumber, setSimNumber] = useState(payment?.simNumber || "")
  const [provider, setProvider] = useState(payment?.provider || "")
  const [amount, setAmount] = useState(payment?.amount.toString() || "")
  const [dueDate, setDueDate] = useState<Date | undefined>(payment?.dueDate ? new Date(payment.dueDate) : undefined)
  const [status, setStatus] = useState<SimPaymentStatus>(payment?.status || "pending")
  const [paidDate, setPaidDate] = useState<Date | undefined>(payment?.paidDate ? new Date(payment.paidDate) : undefined)
  const [notes, setNotes] = useState(payment?.notes || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!stationId || !simNumber || !provider || !amount || !dueDate) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    onSubmit({
      stationId,
      simNumber,
      provider,
      amount: Number.parseFloat(amount),
      dueDate,
      status,
      paidDate: status === "paid" ? paidDate : undefined,
      notes,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{payment ? "แก้ไขรายการชำระเงิน" : "เพิ่มรายการชำระเงินใหม่"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="station">สถานี *</Label>
              <Select value={stationId} onValueChange={setStationId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสถานี" />
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

            <div className="space-y-2">
              <Label htmlFor="simNumber">หมายเลข SIM *</Label>
              <Input
                id="simNumber"
                value={simNumber}
                onChange={(e) => setSimNumber(e.target.value)}
                placeholder="08X-XXX-XXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">ผู้ให้บริการ *</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกผู้ให้บริการ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AIS">AIS</SelectItem>
                  <SelectItem value="DTAC">DTAC</SelectItem>
                  <SelectItem value="TRUE">TRUE</SelectItem>
                  <SelectItem value="NT">NT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">จำนวนเงิน (บาท) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label>วันครบกำหนด *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "dd MMM yyyy", { locale: th }) : "เลือกวันที่"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">สถานะ *</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as SimPaymentStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">รอชำระ</SelectItem>
                  <SelectItem value="paid">ชำระแล้ว</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {status === "paid" && (
              <div className="space-y-2 col-span-2">
                <Label>วันที่ชำระเงิน</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paidDate ? format(paidDate, "dd MMM yyyy", { locale: th }) : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={paidDate} onSelect={setPaidDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">หมายเหตุ</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เพิ่มหมายเหตุ..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <Button type="submit">{payment ? "บันทึก" : "เพิ่ม"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
