/**
 * User management service
 * Handles CRUD operations for users (Admin only)
 * In production, replace with real API calls
 */

import type { User } from "@/types"
import { mockUsers } from "@/data/mockUsers"

// In-memory storage for demo (would be database in production)
const users: User[] = [...mockUsers]

/**
 * Get all users (Admin only)
 */
export async function getAllUsers(): Promise<User[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return [...users]
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return users.find((u) => u.id === userId) || null
}

/**
 * Create new user
 */
export async function createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
    createdAt: new Date(),
  }

  users.push(newUser)
  return newUser
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, "id" | "createdAt">>,
): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const index = users.findIndex((u) => u.id === userId)
  if (index === -1) return null

  users[index] = {
    ...users[index],
    ...updates,
  }

  return users[index]
}

/**
 * Delete user
 */
export async function deleteUser(userId: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const index = users.findIndex((u) => u.id === userId)
  if (index === -1) return false

  users.splice(index, 1)
  return true
}

/**
 * Toggle user enabled status
 */
export async function toggleUserStatus(userId: string): Promise<boolean> {
  const user = users.find((u) => u.id === userId)
  if (!user) return false

  user.isEnabled = !user.isEnabled
  return true
}
