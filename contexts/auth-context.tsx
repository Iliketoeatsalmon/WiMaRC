/**
 * Authentication Context
 *
 * Provides authentication state and functions throughout the app.
 * Manages user login, logout, and role-based access control.
 *
 * In production, this would connect to Server 2 for user management.
 */

"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, AuthContextType } from "@/types"
import { mockUsers } from "@/lib/mock-data"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  /**
   * Login function - validates credentials and sets user session
   * In production, this would make an API call to Server 2
   */
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock authentication - in production, validate against Server 2
    // For demo: username=password (e.g., user1/user1, admin/admin)
    const foundUser = mockUsers.find((u) => u.username === username)

    if (foundUser && password === username) {
      setUser(foundUser)
      localStorage.setItem("currentUser", JSON.stringify(foundUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  /**
   * Logout function - clears user session
   */
  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
