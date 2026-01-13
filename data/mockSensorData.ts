/**
 * Mock sensor reading data generator
 * Generates realistic time-series sensor data for 30+ days
 */

import type { SensorReading } from "@/types"
import { mockStations } from "@/data/mockStations"

/**
 * Calculate VPD (Vapor Pressure Deficit) for durian cultivation
 * VPD = (1 - RH/100) * SVP
 * SVP = 0.6108 * exp((17.27 * T) / (T + 237.3))
 */
export function calculateVPD(temperature: number, humidity: number): number {
  const svp = 0.6108 * Math.exp((17.27 * temperature) / (temperature + 237.3))
  const vpd = (1 - humidity / 100) * svp
  return Math.round(vpd * 100) / 100 // Round to 2 decimal places
}

/**
 * Generate mock sensor data for a weather station
 * Returns 30 days of hourly data (720 data points)
 */
export function generateWeatherStationData(stationId: string): SensorReading[] {
  const readings: SensorReading[] = []
  const now = new Date()
  const daysToGenerate = 30
  const hoursPerDay = 24

  for (let day = daysToGenerate; day >= 0; day--) {
    for (let hour = 0; hour < hoursPerDay; hour++) {
      const timestamp = new Date(now)
      timestamp.setDate(timestamp.getDate() - day)
      timestamp.setHours(hour, 0, 0, 0)

      // Generate realistic weather patterns
      const baseTemp = 28 + Math.sin(((hour - 6) / 24) * Math.PI * 2) * 5 // Peak at 2pm
      const temp = baseTemp + (Math.random() - 0.5) * 2

      const baseHumidity = 75 - Math.sin(((hour - 6) / 24) * Math.PI * 2) * 20 // Inverse of temp
      const humidity = Math.max(40, Math.min(95, baseHumidity + (Math.random() - 0.5) * 10))

      const vpd = calculateVPD(temp, humidity)

      readings.push({
        stationId,
        timestamp,
        airTemperature: Math.round(temp * 10) / 10,
        relativeHumidity: Math.round(humidity * 10) / 10,
        lightIntensity: Math.max(
          0,
          Math.round(Math.sin(((hour - 6) / 12) * Math.PI) * 50000 + (Math.random() - 0.5) * 5000),
        ),
        windDirection: Math.round(Math.random() * 360),
        windSpeed: Math.round((Math.random() * 3 + 1) * 10) / 10,
        rainfall: Math.random() > 0.95 ? Math.round(Math.random() * 5 * 10) / 10 : 0,
        atmosphericPressure: Math.round((1013 + (Math.random() - 0.5) * 10) * 10) / 10,
        vpd,
      })
    }
  }

  return readings
}

/**
 * Generate mock sensor data for a soil monitoring station
 * Returns 30 days of hourly data (720 data points)
 */
export function generateSoilStationData(stationId: string): SensorReading[] {
  const readings: SensorReading[] = []
  const now = new Date()
  const daysToGenerate = 30
  const hoursPerDay = 24

  let soilMoisture1Base = 55 // Base moisture level
  let soilMoisture2Base = 50

  for (let day = daysToGenerate; day >= 0; day--) {
    for (let hour = 0; hour < hoursPerDay; hour++) {
      const timestamp = new Date(now)
      timestamp.setDate(timestamp.getDate() - day)
      timestamp.setHours(hour, 0, 0, 0)

      // Simulate gradual moisture decrease and occasional watering
      if (Math.random() > 0.97) {
        // Watering event
        soilMoisture1Base += 15
        soilMoisture2Base += 12
      } else {
        // Gradual evaporation
        soilMoisture1Base -= 0.1
        soilMoisture2Base -= 0.08
      }

      // Keep within realistic bounds
      soilMoisture1Base = Math.max(30, Math.min(80, soilMoisture1Base))
      soilMoisture2Base = Math.max(25, Math.min(75, soilMoisture2Base))

      readings.push({
        stationId,
        timestamp,
        soilMoisture1: Math.round((soilMoisture1Base + (Math.random() - 0.5) * 3) * 10) / 10,
        soilMoisture2: Math.round((soilMoisture2Base + (Math.random() - 0.5) * 3) * 10) / 10,
      })
    }
  }

  return readings
}

// Generate and export all mock sensor data
const weatherStations = mockStations.filter((station) => station.type === "weather")
const soilStations = mockStations.filter((station) => station.type === "soil")

export const mockSensorData: SensorReading[] = [
  ...weatherStations.flatMap((station) => generateWeatherStationData(station.id)),
  ...soilStations.flatMap((station) => generateSoilStationData(station.id)),
]
