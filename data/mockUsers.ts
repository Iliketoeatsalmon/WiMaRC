/**
 * Mock user data for development and demo
 * Contains example users for each role: Admin, User, Guest
 */

import type { User } from "@/types"

export const mockUsers: User[] = [
  {
    id: "user-001",
    username: "admin",
    password: "admin123",
    role: "Admin",
    fullName: "ผู้ดูแลระบบ",
    email: "admin@wimarc.example",
    isEnabled: true,
    permittedStationIds: [], // Admin has access to all stations
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "user-002",
    username: "user1",
    password: "user123",
    role: "User",
    fullName: "สมชาย ใจดี",
    email: "somchai@example.com",
    isEnabled: true,
    permittedStationIds: ["station-019", "station-022"], // One coordinate with two stations
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "user-003",
    username: "user2",
    password: "user123",
    role: "User",
    fullName: "สมหญิง รักสวน",
    email: "somying@example.com",
    isEnabled: true,
    permittedStationIds: ["station-012", "station-027"], // One coordinate with two stations
    createdAt: new Date("2024-02-15"),
  },
  {
    id: "user-004",
    username: "guest1",
    password: "guest123",
    role: "Guest",
    fullName: "ผู้เยี่ยมชม 1",
    email: "guest1@example.com",
    isEnabled: true,
    permittedStationIds: ["station-019", "station-022"], // Read-only access to one coordinate
    createdAt: new Date("2024-03-01"),
  },
]
