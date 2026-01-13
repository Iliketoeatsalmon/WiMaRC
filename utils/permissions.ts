/**
 * Permission utility functions for role-based access control (RBAC)
 * Handles station access permissions for Admin, User, and Guest roles
 */

import type { User, Station, UserRole } from "@/types"

/**
 * Check if a user can access a specific station
 * Admin: can access all stations
 * User/Guest: can only access explicitly permitted stations
 */
export function canAccessStation(user: User | null, station: Station): boolean {
  if (!user) return false

  // Admin can access all stations
  if (user.role === "Admin") return true

  // User and Guest need explicit permission
  return user.permittedStationIds.includes(station.id)
}

/**
 * Filter stations based on user permissions
 * Returns only stations the user is allowed to access
 */
export function getPermittedStations(user: User | null, allStations: Station[]): Station[] {
  if (!user) return []

  // Admin can see all stations
  if (user.role === "Admin") return allStations

  // Filter by permitted station IDs
  return allStations.filter((station) => user.permittedStationIds.includes(station.id))
}

/**
 * Check if user can edit/create data
 * Guest: read-only
 * User: can edit within their permitted stations
 * Admin: can edit all
 */
export function canEditData(user: User | null): boolean {
  if (!user) return false
  return user.role !== "Guest"
}

/**
 * Check if user can delete data
 * Same rules as canEditData
 */
export function canDeleteData(user: User | null): boolean {
  return canEditData(user)
}

/**
 * Check if user is Admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === "Admin"
}

/**
 * Check if user can access admin pages
 */
export function canAccessAdminPages(user: User | null): boolean {
  return isAdmin(user)
}

/**
 * Check if user can access SIM payment page
 * Guest: no access
 * User: can see SIMs for their permitted stations
 * Admin: can see all SIMs
 */
export function canAccessSimPayments(user: User | null): boolean {
  if (!user) return false
  return user.role !== "Guest"
}

/**
 * Check if user can manage other users
 * Only Admin can manage users
 */
export function canManageUsers(user: User | null): boolean {
  return isAdmin(user)
}

/**
 * Check if user can edit/create activities
 * Guest: read-only
 * User: can edit activities
 * Admin: can edit all activities
 */
export function canEditActivities(user: User | null): boolean {
  return canEditData(user)
}

/**
 * Get display name for user role in Thai
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case "Admin":
      return "ผู้ดูแลระบบ"
    case "User":
      return "ผู้ใช้งาน"
    case "Guest":
      return "ผู้เยี่ยมชม"
  }
}
