/**
 * Plot Activity service
 * Handles CRUD operations for agricultural activities
 */

import type { PlotActivity } from "@/types"
import { apiRequest, ApiError } from "@/services/apiClient"
import { formatDateOnly, mapPlotActivity } from "@/services/apiMappers"

/**
 * Get all activities
 */
export async function getAllActivities(): Promise<PlotActivity[]> {
  const activities = await apiRequest<any[]>("/activities")
  return activities.map(mapPlotActivity).sort((a, b) => b.date.getTime() - a.date.getTime())
}

/**
 * Get activities by station ID
 */
export async function getActivitiesByStation(stationId: string): Promise<PlotActivity[]> {
  const activities = await apiRequest<any[]>("/activities", {
    query: { station_id: stationId },
  })
  return activities.map(mapPlotActivity).sort((a, b) => b.date.getTime() - a.date.getTime())
}

/**
 * Get activity by ID
 */
export async function getActivityById(activityId: string): Promise<PlotActivity | null> {
  const activities = await getAllActivities()
  return activities.find((activity) => activity.id === activityId) || null
}

/**
 * Create new activity
 */
export async function createActivity(activity: Omit<PlotActivity, "id" | "createdAt">): Promise<PlotActivity> {
  const payload = {
    station_id: activity.stationId,
    date: formatDateOnly(activity.date),
    activity_type: activity.activityType,
    description: activity.description,
    created_by: activity.createdBy,
    created_by_name: activity.createdByName,
    images: activity.images,
  }

  const created = await apiRequest<any>("/activities", {
    method: "POST",
    body: payload,
  })

  return mapPlotActivity(created)
}

/**
 * Update existing activity
 */
export async function updateActivity(
  activityId: string,
  updates: Partial<Omit<PlotActivity, "id" | "createdAt" | "createdBy">>,
): Promise<PlotActivity | null> {
  const payload: Record<string, unknown> = {}

  if (updates.stationId !== undefined) payload.station_id = updates.stationId
  if (updates.date !== undefined) payload.date = formatDateOnly(updates.date)
  if (updates.activityType !== undefined) payload.activity_type = updates.activityType
  if (updates.description !== undefined) payload.description = updates.description
  if (updates.createdByName !== undefined) payload.created_by_name = updates.createdByName
  if (updates.images !== undefined) payload.images = updates.images

  try {
    const updated = await apiRequest<any>(`/activities/${activityId}`, {
      method: "PUT",
      body: payload,
    })

    return mapPlotActivity(updated)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null
    }
    throw error
  }
}

/**
 * Delete activity
 */
export async function deleteActivity(activityId: string): Promise<boolean> {
  try {
    await apiRequest<void>(`/activities/${activityId}`, {
      method: "DELETE",
    })
    return true
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return false
    }
    throw error
  }
}

/**
 * Get activity types (for dropdown)
 */
export function getActivityTypes(): string[] {
  return ["รดน้ำ", "ใส่ปุ๋ย", "ตัดแต่งกิ่ง", "ป้องกันโรค", "ป้องกันแมลง", "เก็บเกี่ยว", "อื่นๆ"]
}
