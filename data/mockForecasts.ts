/**
 * Mock weather forecast data
 * Simulates external weather forecast API data for each station area
 */

import type { WeatherForecast } from "@/types"
import { mockStations } from "@/data/mockStations"

/**
 * Generate 7-day weather forecast for a station
 */
function generateForecast(stationId: string): WeatherForecast[] {
  const forecasts: WeatherForecast[] = []
  const now = new Date()

  for (let day = 0; day < 7; day++) {
    const forecastDate = new Date(now)
    forecastDate.setDate(forecastDate.getDate() + day)
    forecastDate.setHours(12, 0, 0, 0) // Noon forecast

    const temp = 28 + Math.random() * 6 // 28-34°C
    const rainProb = Math.round(Math.random() * 60) // 0-60%
    const rainfall = rainProb > 30 ? Math.round(Math.random() * 20 * 10) / 10 : 0

    let description = "ท้องฟ้าแจ่มใส"
    if (rainProb > 50) description = "ฝนตกหนัก"
    else if (rainProb > 30) description = "ฝนตกเล็กน้อย"
    else if (rainProb > 10) description = "มีเมฆบางส่วน"

    forecasts.push({
      stationId,
      forecastDate,
      temperature: Math.round(temp * 10) / 10,
      rainProbability: rainProb,
      rainfall,
      description,
    })
  }

  return forecasts
}

const weatherStations = mockStations.filter((station) => station.type === "weather")

export const mockForecasts: WeatherForecast[] = weatherStations.flatMap((station) => generateForecast(station.id))
