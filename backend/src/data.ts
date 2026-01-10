export type UserRole = "user" | "admin"
export type StationType = "weather" | "soil"
export type StationStatus = "online" | "offline"

export interface UserSeed {
  id: string
  username: string
  email: string
  role: UserRole
  name: string
  permittedStations: string[]
  createdAt: string
  password: string
}

export interface StationSeed {
  id: string
  name: string
  type: StationType
  location: {
    lat: number
    lng: number
    address: string
  }
  status: StationStatus
  lastDataReceived: string
  simCardId?: string
  imageUrl?: string
}

export interface PlotActivitySeed {
  id: string
  date: string
  activityType: string
  description: string
  stationId: string
  createdBy: string
  createdByName: string
  images: string[]
  createdAt: string
}

export interface SimCardSeed {
  id: string
  simNumber: string
  provider: string
  associatedStation?: string
  status: "active" | "inactive"
  lastCommunication?: string
}

export interface WeatherForecast {
  date: string
  temperatureMin: number
  temperatureMax: number
  rainProbability: number
  rainfallForecast: number
}

export interface WeatherData {
  stationId: string
  timestamp: string
  airTemperature: number
  relativeHumidity: number
  lightIntensity: number
  windDirection: number
  windSpeed: number
  rainfall: number
  atmosphericPressure: number
  vpd?: number
}

export interface SoilData {
  stationId: string
  timestamp: string
  soilMoisture1: number
  soilMoisture2: number
}

const nowIso = () => new Date().toISOString()

export const seedUsers = (): UserSeed[] => [
  {
    id: "1",
    username: "user1",
    email: "user1@example.com",
    role: "user",
    name: "John Farmer",
    permittedStations: ["weather-1", "soil-1"],
    createdAt: nowIso(),
    password: "user1",
  },
  {
    id: "2",
    username: "admin",
    email: "admin@example.com",
    role: "admin",
    name: "Admin User",
    permittedStations: [],
    createdAt: nowIso(),
    password: "admin",
  },
]

export const seedStations = (): StationSeed[] => [
  {
    id: "weather-1",
    name: "Weather Station 1 - North Field",
    type: "weather",
    location: {
      lat: 13.7563,
      lng: 100.5018,
      address: "North Field, Agricultural Area A",
    },
    status: "online",
    lastDataReceived: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    simCardId: "sim-1",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "weather-2",
    name: "Weather Station 2 - South Field",
    type: "weather",
    location: {
      lat: 13.7463,
      lng: 100.5118,
      address: "South Field, Agricultural Area B",
    },
    status: "online",
    lastDataReceived: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    simCardId: "sim-2",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "soil-1",
    name: "Soil Station 1 - East Plot",
    type: "soil",
    location: {
      lat: 13.7663,
      lng: 100.4918,
      address: "East Plot, Agricultural Area A",
    },
    status: "online",
    lastDataReceived: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    simCardId: "sim-3",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "soil-2",
    name: "Soil Station 2 - West Plot",
    type: "soil",
    location: {
      lat: 13.7363,
      lng: 100.5218,
      address: "West Plot, Agricultural Area C",
    },
    status: "offline",
    lastDataReceived: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    simCardId: "sim-4",
    imageUrl: "/placeholder.svg?height=200&width=300",
  },
]

export const seedActivities = (): PlotActivitySeed[] => [
  {
    id: "1",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    activityType: "Irrigation",
    description: "Watered the field for 2 hours using drip irrigation system",
    stationId: "weather-1",
    createdBy: "1",
    createdByName: "John Farmer",
    images: ["/placeholder.svg?height=150&width=200"],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    activityType: "Fertilization",
    description: "Applied NPK fertilizer at recommended rates",
    stationId: "soil-1",
    createdBy: "1",
    createdByName: "John Farmer",
    images: ["/placeholder.svg?height=150&width=200", "/placeholder.svg?height=150&width=200"],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const seedSimCards = (): SimCardSeed[] => [
  {
    id: "sim-1",
    simNumber: "0812345678",
    provider: "AIS",
    associatedStation: "weather-1",
    status: "active",
    lastCommunication: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "sim-2",
    simNumber: "0823456789",
    provider: "DTAC",
    associatedStation: "weather-2",
    status: "active",
    lastCommunication: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "sim-3",
    simNumber: "0834567890",
    provider: "TRUE",
    associatedStation: "soil-1",
    status: "active",
    lastCommunication: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: "sim-4",
    simNumber: "0845678901",
    provider: "AIS",
    associatedStation: "soil-2",
    status: "inactive",
    lastCommunication: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  },
]

export function calculateVPD(temperature: number, humidity: number): number {
  const saturationVaporPressure = 0.6107 * Math.pow(10, (7.5 * temperature) / (237.3 + temperature))
  const vpd = ((100 - humidity) / 100) * saturationVaporPressure
  return Math.round(vpd * 100) / 100
}

export function generateMockWeatherData(stationId: string, days = 7): WeatherData[] {
  const data: WeatherData[] = []
  const now = new Date()

  for (let i = 0; i < days * 24; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
    const temp = 25 + Math.sin((i / 12) * Math.PI) * 5 + (Math.random() - 0.5) * 2
    const humidity = 60 + Math.sin((i / 12) * Math.PI) * 15 + (Math.random() - 0.5) * 5

    data.push({
      stationId,
      timestamp: timestamp.toISOString(),
      airTemperature: Math.round(temp * 10) / 10,
      relativeHumidity: Math.round(humidity * 10) / 10,
      lightIntensity: Math.max(0, 50000 + Math.sin((i / 12) * Math.PI) * 40000 + (Math.random() - 0.5) * 5000),
      windDirection: Math.floor(Math.random() * 360),
      windSpeed: Math.random() * 10,
      rainfall: Math.random() > 0.9 ? Math.random() * 5 : 0,
      atmosphericPressure: 1013 + (Math.random() - 0.5) * 10,
      vpd: calculateVPD(temp, humidity),
    })
  }

  return data.reverse()
}

export function generateMockSoilData(stationId: string, days = 7): SoilData[] {
  const data: SoilData[] = []
  const now = new Date()

  for (let i = 0; i < days * 24; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)

    data.push({
      stationId,
      timestamp: timestamp.toISOString(),
      soilMoisture1: Math.round((50 + Math.sin((i / 24) * Math.PI) * 20 + (Math.random() - 0.5) * 5) * 10) / 10,
      soilMoisture2: Math.round((55 + Math.sin((i / 24) * Math.PI) * 15 + (Math.random() - 0.5) * 5) * 10) / 10,
    })
  }

  return data.reverse()
}

export const mockWeatherForecast = (): WeatherForecast[] => [
  {
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    temperatureMin: 22,
    temperatureMax: 32,
    rainProbability: 20,
    rainfallForecast: 0,
  },
  {
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    temperatureMin: 23,
    temperatureMax: 33,
    rainProbability: 40,
    rainfallForecast: 2,
  },
  {
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    temperatureMin: 21,
    temperatureMax: 30,
    rainProbability: 70,
    rainfallForecast: 8,
  },
  {
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    temperatureMin: 20,
    temperatureMax: 28,
    rainProbability: 60,
    rainfallForecast: 5,
  },
  {
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    temperatureMin: 22,
    temperatureMax: 31,
    rainProbability: 30,
    rainfallForecast: 1,
  },
]
