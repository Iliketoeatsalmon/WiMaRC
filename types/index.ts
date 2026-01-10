/**
 * Type Definitions for Agricultural Monitoring System
 *
 * This file contains all TypeScript interfaces and types used throughout the application.
 * It defines the structure for users, stations, sensors, activities, and SIM cards.
 */

// User roles for role-based access control
export type UserRole = "user" | "admin"

// User interface with authentication and permission data
export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  name: string
  permittedStations: string[] // Array of station IDs the user can access
  createdAt: string
}

// Station types - Weather/Environment or Soil Monitoring
export type StationType = "weather" | "soil"

// Station status - online or offline
export type StationStatus = "online" | "offline"

// Base station interface
export interface Station {
  id: string
  name: string
  type: StationType
  location: {
    lat: number
    lng: number
    address: string
  }
  status: StationStatus
  lastDataReceived: string // ISO timestamp
  simCardId?: string
  imageUrl?: string // Latest captured image
}

// Weather station sensor data (Station 1)
export interface WeatherData {
  stationId: string
  timestamp: string
  airTemperature: number // Celsius
  relativeHumidity: number // Percentage
  lightIntensity: number // Lux
  windDirection: number // Degrees
  windSpeed: number // m/s
  rainfall: number // mm
  atmosphericPressure: number // hPa
  vpd?: number // Vapor Pressure Deficit (calculated)
}

// Soil monitoring sensor data (Station 2)
export interface SoilData {
  stationId: string
  timestamp: string
  soilMoisture1: number // Percentage
  soilMoisture2: number // Percentage
}

// Weather forecast data from external API
export interface WeatherForecast {
  date: string
  temperatureMin: number
  temperatureMax: number
  rainProbability: number // Percentage
  rainfallForecast: number // mm
}

// Time range options for historical data (TOR requirement)
export type TimeRange = 3 | 7 | 15 | 30

// Plot activity for farm management
export interface PlotActivity {
  id: string
  date: string
  activityType: string
  description: string
  stationId: string // Related station/plot
  createdBy: string // User ID
  createdByName: string
  images: string[] // Max 3 images per activity per day
  createdAt: string
}

// SIM card management (Admin only)
export interface SimCard {
  id: string
  simNumber: string
  provider: string
  associatedStation?: string // Station ID
  status: "active" | "inactive"
  lastCommunication?: string // ISO timestamp
}

// Auth context type
export interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}
