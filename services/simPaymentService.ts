import type { SimPayment, SimPaymentStatus } from "@/types"
import { mockSimPayments } from "@/data/mockSimPayments"

// Service for managing SIM card payment tracking
export class SimPaymentService {
  // In-memory storage (replace with database in production)
  private static payments: SimPayment[] = [...mockSimPayments]

  // Get all payment records, optionally filtered
  static getPayments(filters?: {
    stationId?: string
    status?: SimPaymentStatus
    startDate?: Date
    endDate?: Date
  }): SimPayment[] {
    let filtered = [...this.payments]

    if (filters?.stationId) {
      filtered = filtered.filter((p) => p.stationId === filters.stationId)
    }

    if (filters?.status) {
      filtered = filtered.filter((p) => p.status === filters.status)
    }

    if (filters?.startDate) {
      filtered = filtered.filter((p) => new Date(p.dueDate) >= filters.startDate!)
    }

    if (filters?.endDate) {
      filtered = filtered.filter((p) => new Date(p.dueDate) <= filters.endDate!)
    }

    // Sort by due date descending
    return filtered.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
  }

  // Get payment by ID
  static getPaymentById(id: string): SimPayment | undefined {
    return this.payments.find((p) => p.id === id)
  }

  // Create new payment record
  static createPayment(data: Omit<SimPayment, "id">): SimPayment {
    const newPayment: SimPayment = {
      ...data,
      id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    this.payments.push(newPayment)
    return newPayment
  }

  // Update payment record
  static updatePayment(id: string, data: Partial<SimPayment>): SimPayment | null {
    const index = this.payments.findIndex((p) => p.id === id)
    if (index === -1) return null

    this.payments[index] = {
      ...this.payments[index],
      ...data,
    }
    return this.payments[index]
  }

  // Mark payment as paid
  static markAsPaid(id: string, paymentDate: Date, notes?: string): SimPayment | null {
    return this.updatePayment(id, {
      status: "paid",
      paidDate: paymentDate,
      notes: notes || this.payments.find((p) => p.id === id)?.notes,
    })
  }

  // Get upcoming payments (due within next 30 days)
  static getUpcomingPayments(stationId?: string): SimPayment[] {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    return this.getPayments({
      stationId,
      status: "pending",
    }).filter((p) => {
      const dueDate = new Date(p.dueDate)
      return dueDate >= now && dueDate <= thirtyDaysFromNow
    })
  }

  // Get overdue payments
  static getOverduePayments(stationId?: string): SimPayment[] {
    const now = new Date()

    return this.getPayments({
      stationId,
      status: "pending",
    }).filter((p) => new Date(p.dueDate) < now)
  }

  // Calculate total amounts
  static getTotalAmounts(payments: SimPayment[]) {
    return payments.reduce(
      (acc, payment) => {
        acc.total += payment.amount
        if (payment.status === "paid") {
          acc.paid += payment.amount
        } else {
          acc.pending += payment.amount
        }
        return acc
      },
      { total: 0, paid: 0, pending: 0 },
    )
  }
}
