/**
 * SIM Management Page (Admin Only)
 *
 * Dedicated page for managing SIM cards used in stations.
 * Features:
 * - View all SIM cards
 * - Create new SIM records
 * - Edit existing SIM records
 * - Associate SIMs with stations
 * - Track SIM status and last communication
 * - CSV export
 *
 * Only accessible to administrators.
 */

"use client"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { SimForm } from "@/components/admin/sim-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { SimCard } from "@/types"
import { mockSimCards, mockStations } from "@/lib/mock-data"
import { getTimeDifference } from "@/lib/utils/date"
import { convertToCSV, downloadCSV } from "@/lib/utils/export"
import { Plus, Search, Download, Edit, Trash2, PieChartIcon as SimCardIcon } from "lucide-react"

export default function SimManagementPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const [simCards, setSimCards] = useState<SimCard[]>(mockSimCards)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSim, setEditingSim] = useState<SimCard | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setMounted(true)
    if (!isLoading && !user) {
      router.push("/login")
    }
    // Redirect non-admin users
    if (!isLoading && user && user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  // Filter SIM cards
  const filteredSimCards = simCards.filter(
    (sim) =>
      sim.simNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.provider.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Create new SIM
  const handleCreateSim = (newSim: Partial<SimCard>) => {
    const sim: SimCard = {
      id: `sim-${Date.now()}`,
      simNumber: newSim.simNumber!,
      provider: newSim.provider!,
      associatedStation: newSim.associatedStation || undefined,
      status: newSim.status as "active" | "inactive",
      lastCommunication: new Date().toISOString(),
    }

    setSimCards([...simCards, sim])
    setIsCreateDialogOpen(false)
  }

  // Edit SIM
  const handleEditSim = (updatedSim: Partial<SimCard>) => {
    if (!editingSim) return

    setSimCards(
      simCards.map((sim) =>
        sim.id === editingSim.id
          ? {
              ...sim,
              ...updatedSim,
            }
          : sim,
      ),
    )

    setIsEditDialogOpen(false)
    setEditingSim(null)
  }

  // Delete SIM
  const handleDeleteSim = (simId: string) => {
    if (confirm("Are you sure you want to delete this SIM card?")) {
      setSimCards(simCards.filter((sim) => sim.id !== simId))
    }
  }

  // Export to CSV
  const handleExport = () => {
    const exportData = simCards.map((sim) => ({
      "SIM Number": sim.simNumber,
      Provider: sim.provider,
      "Associated Station": mockStations.find((s) => s.id === sim.associatedStation)?.name || "None",
      Status: sim.status,
      "Last Communication": sim.lastCommunication || "Never",
    }))

    const csv = convertToCSV(exportData)
    downloadCSV(csv, `sim_cards_${new Date().toISOString().split("T")[0]}.csv`)
  }

  if (!mounted || isLoading || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  const activeCount = simCards.filter((s) => s.status === "active").length
  const inactiveCount = simCards.filter((s) => s.status === "inactive").length

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <SimCardIcon className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold text-balance">SIM Management</h1>
            </div>
            <p className="text-muted-foreground">Manage SIM cards used in monitoring stations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add SIM
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total SIM Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{simCards.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{activeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{inactiveCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search SIM cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* SIM Cards Table */}
        <Card>
          <CardHeader>
            <CardTitle>SIM Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SIM Number</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Associated Station</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Communication</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSimCards.map((sim) => {
                    const station = mockStations.find((s) => s.id === sim.associatedStation)

                    return (
                      <TableRow key={sim.id}>
                        <TableCell className="font-medium">{sim.simNumber}</TableCell>
                        <TableCell>{sim.provider}</TableCell>
                        <TableCell>
                          {station ? station.name : <span className="text-muted-foreground">None</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={sim.status === "active" ? "default" : "secondary"}>{sim.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {sim.lastCommunication ? (
                            <span className="text-sm">{getTimeDifference(sim.lastCommunication)}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingSim(sim)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSim(sim.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredSimCards.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No SIM cards found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create SIM Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New SIM Card</DialogTitle>
              <DialogDescription>Create a new SIM card record for station monitoring</DialogDescription>
            </DialogHeader>
            <SimForm stations={mockStations} onSubmit={handleCreateSim} onCancel={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        {/* Edit SIM Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit SIM Card</DialogTitle>
              <DialogDescription>Update SIM card information</DialogDescription>
            </DialogHeader>
            {editingSim && (
              <SimForm
                stations={mockStations}
                onSubmit={handleEditSim}
                onCancel={() => {
                  setIsEditDialogOpen(false)
                  setEditingSim(null)
                }}
                initialData={editingSim}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
