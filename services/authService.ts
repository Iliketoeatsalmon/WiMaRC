/**
 * Authentication service
 * Handles user login and session management
 * In production, this would connect to a real backend API
 */

import type { User } from "@/types"
import { mockUsers } from "@/data/mockUsers"

/**
 * Authenticate user with username and password
 * Returns user object if credentials are valid, null otherwise
 */
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Find user with matching credentials
  const user = mockUsers.find((u) => u.username === username && u.password === password && u.isEnabled)

  if (!user) return null

  // Return user without password
  const { password: _, ...userWithoutPassword } = user
  return user
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const user = mockUsers.find((u) => u.id === userId)
  return user || null
}

/**
 * Validate session token
 * In production, this would validate a JWT or session cookie
 */
export async function validateSession(token: string): Promise<User | null> {
  // Mock implementation
  // In production, decode and validate JWT
  return null
}
