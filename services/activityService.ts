/**
 * Plot Activity service
 * Handles CRUD operations for agricultural activities
 * In production, replace with real API calls
 */

import type { PlotActivity } from "@/types"
import { mockActivities } from "@/data/mockActivities"

// In-memory storage for demo (would be database in production)
const activities: PlotActivity[] = [...mockActivities]

/**
 * Get all activities
 */
export async function getAllActivities(): Promise<PlotActivity[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return [...activities].sort((a, b) => b.date.getTime() - a.date.getTime())
}

/**
 * Get activities by station ID
 */
export async function getActivitiesByStation(stationId: string): Promise<PlotActivity[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return activities.filter((a) => a.stationId === stationId).sort((a, b) => b.date.getTime() - a.date.getTime())
}

/**
 * Get activity by ID
 */
export async function getActivityById(activityId: string): Promise<PlotActivity | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return activities.find((a) => a.id === activityId) || null
}

/**
 * Create new activity
 */
export async function createActivity(activity: Omit<PlotActivity, "id" | "createdAt">): Promise<PlotActivity> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const newActivity: PlotActivity = {
    ...activity,
    id: `activity-${Date.now()}`,
    createdAt: new Date(),
  }

  activities.push(newActivity)
  return newActivity
}

/**
 * Update existing activity
 */
export async function updateActivity(
  activityId: string,
  updates: Partial<Omit<PlotActivity, "id" | "createdAt" | "createdBy">>,
): Promise<PlotActivity | null> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const index = activities.findIndex((a) => a.id === activityId)
  if (index === -1) return null

  activities[index] = {
    ...activities[index],
    ...updates,
  }

  return activities[index]
}

/**
 * Delete activity
 */
export async function deleteActivity(activityId: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const index = activities.findIndex((a) => a.id === activityId)
  if (index === -1) return false

  activities.splice(index, 1)
  return true
}

/**
 * Get activity types (for dropdown)
 */
export function getActivityTypes(): string[] {
  return ["รดน้ำ", "ใส่ปุ๋ย", "ตัดแต่งกิ่ง", "ป้องกันโรค", "ป้องกันแมลง", "เก็บเกี่ยว", "อื่นๆ"]
}
