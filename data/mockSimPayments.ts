/**
 * Mock SIM payment records
 * Tracks payment due dates for SIM cards associated with stations
 */

import type { SimPaymentRecord } from "@/types"

/**
 * Calculate payment status based on due date
 */
function calculatePaymentStatus(dueDate: Date): "normal" | "nearDue" | "overdue" {
  const now = new Date()
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilDue < 0) return "overdue"
  if (daysUntilDue <= 7) return "nearDue"
  return "normal"
}

export const mockSimPayments: SimPaymentRecord[] = [
  {
    id: "sim-001",
    simNumber: "089-xxx-1234",
    stationId: "station-001",
    stationName: "ต.นายายอาม อ.นายายอาม จ.จันทบุรี",
    paymentDueDate: new Date("2025-02-01"),
    paymentStatus: calculatePaymentStatus(new Date("2025-02-01")),
  },
  {
    id: "sim-002",
    simNumber: "089-xxx-5678",
    stationId: "station-002",
    stationName: "ต.กระแจะ อ.นายายอาม จ.จันทบุรี",
    paymentDueDate: new Date("2025-01-20"),
    paymentStatus: calculatePaymentStatus(new Date("2025-01-20")),
  },
  {
    id: "sim-003",
    simNumber: "089-xxx-9012",
    stationId: "station-003",
    stationName: "ต.คลองพลู อ.เขาคิชฌกูฏ จ.จันทบุรี",
    paymentDueDate: new Date("2025-01-10"),
    paymentStatus: calculatePaymentStatus(new Date("2025-01-10")),
  },
  {
    id: "sim-004",
    simNumber: "089-xxx-3456",
    stationId: "station-004",
    stationName: "ต.คลองพลู อ.เขาคิชฌกูฏ จ.จันทบุรี",
    paymentDueDate: new Date("2025-01-25"),
    paymentStatus: calculatePaymentStatus(new Date("2025-01-25")),
  },
  {
    id: "sim-005",
    simNumber: "089-xxx-7890",
    stationId: "station-005",
    stationName: "ต.เขาบายศรี อ.ท่าใหม่ จ.จันทบุรี",
    paymentDueDate: new Date("2024-12-30"),
    paymentStatus: calculatePaymentStatus(new Date("2024-12-30")),
  },
]
