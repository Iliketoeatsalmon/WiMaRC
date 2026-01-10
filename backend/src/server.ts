import express from "express"
import cors from "cors"
import { nanoid } from "nanoid"
import { initDb, pool } from "./db"
import {
  generateMockWeatherData,
  generateMockSoilData,
  mockWeatherForecast,
  type WeatherData,
  type SoilData,
} from "./data"

const app = express()
app.use(cors())
app.use(express.json({ limit: "2mb" }))

const parseJson = <T>(value: unknown, fallback: T): T => {
  if (value === null || value === undefined) return fallback
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }
  if (typeof value === "object") return value as T
  return fallback
}

const toIso = (value: unknown): string => {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "string") return value
  return ""
}

const toDateOnly = (value: unknown): string => {
  if (value instanceof Date) return value.toISOString().split("T")[0]
  if (typeof value === "string") return value
  return ""
}

const mapUser = (row: any) => ({
  id: row.id,
  username: row.username,
  email: row.email,
  role: row.role,
  name: row.name,
  permittedStations: parseJson<string[]>(row.permitted_stations, []),
  createdAt: toIso(row.created_at),
})

const mapStation = (row: any) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  location: parseJson(row.location, null),
  status: row.status,
  lastDataReceived: toIso(row.last_data_received),
  simCardId: row.sim_card_id ?? undefined,
  imageUrl: row.image_url ?? undefined,
})

const mapSim = (row: any) => ({
  id: row.id,
  simNumber: row.sim_number,
  provider: row.provider,
  associatedStation: row.associated_station ?? undefined,
  status: row.status,
  lastCommunication: row.last_communication ? toIso(row.last_communication) : undefined,
})

const mapActivity = (row: any) => ({
  id: row.id,
  date: toDateOnly(row.date),
  activityType: row.activity_type,
  description: row.description,
  stationId: row.station_id,
  createdBy: row.created_by,
  createdByName: row.created_by_name,
  images: parseJson<string[]>(row.images, []),
  createdAt: toIso(row.created_at),
})

const asyncHandler = (fn: (req: express.Request, res: express.Response) => Promise<void> | void) => {
  return (req: express.Request, res: express.Response) => {
    Promise.resolve(fn(req, res)).catch((error) => {
      console.error(error)
      res.status(500).json({ message: "internal server error" })
    })
  }
}

const allowedRanges = new Set([3, 7, 15, 30])
const resolveRange = (value: any): number => {
  const parsed = Number(value)
  if (allowedRanges.has(parsed)) return parsed
  return 7
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" })
})

app.post(
  "/api/auth/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body || {}
    if (!username || !password) {
      res.status(400).json({ message: "username and password required" })
      return
    }

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username])
    const user = result.rows[0]
    if (!user || user.password !== password) {
      res.status(401).json({ message: "invalid credentials" })
      return
    }

    res.json({
      token: `demo-${nanoid(12)}`,
      user: mapUser(user),
    })
  })
)

app.get(
  "/api/users",
  asyncHandler(async (_req, res) => {
    const result = await pool.query("SELECT * FROM users ORDER BY created_at DESC")
    res.json(result.rows.map(mapUser))
  })
)

app.post(
  "/api/users",
  asyncHandler(async (req, res) => {
    const { username, email, role, name, permittedStations, password } = req.body || {}
    if (!username || !email || !role || !name) {
      res.status(400).json({ message: "missing required fields" })
      return
    }

    const id = nanoid()
    const createdAt = new Date().toISOString()
    const stations = Array.isArray(permittedStations) ? permittedStations : []
    const secret = password || username

    try {
      await pool.query(
        "INSERT INTO users (id, username, email, role, name, permitted_stations, created_at, password) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)",
        [id, username, email, role, name, JSON.stringify(stations), createdAt, secret]
      )
    } catch (error: any) {
      if (error.code === "23505") {
        res.status(409).json({ message: "username already exists" })
        return
      }
      res.status(400).json({ message: error.message })
      return
    }

    const created = await pool.query("SELECT * FROM users WHERE id = $1", [id])
    res.status(201).json(mapUser(created.rows[0]))
  })
)

app.put(
  "/api/users/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const existing = await pool.query("SELECT * FROM users WHERE id = $1", [id])
    const user = existing.rows[0]
    if (!user) {
      res.status(404).json({ message: "user not found" })
      return
    }

    const { username, email, role, name, permittedStations, password } = req.body || {}
    const updated = {
      username: username ?? user.username,
      email: email ?? user.email,
      role: role ?? user.role,
      name: name ?? user.name,
      permittedStations: JSON.stringify(
        Array.isArray(permittedStations) ? permittedStations : parseJson(user.permitted_stations, [])
      ),
      password: password ?? user.password,
    }

    await pool.query(
      "UPDATE users SET username = $1, email = $2, role = $3, name = $4, permitted_stations = $5::jsonb, password = $6 WHERE id = $7",
      [updated.username, updated.email, updated.role, updated.name, updated.permittedStations, updated.password, id]
    )

    const saved = await pool.query("SELECT * FROM users WHERE id = $1", [id])
    res.json(mapUser(saved.rows[0]))
  })
)

app.delete(
  "/api/users/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const info = await pool.query("DELETE FROM users WHERE id = $1", [id])
    if (info.rowCount === 0) {
      res.status(404).json({ message: "user not found" })
      return
    }
    res.status(204).send()
  })
)

app.get(
  "/api/permissions",
  asyncHandler(async (_req, res) => {
    const users = await pool.query("SELECT id, role, permitted_stations FROM users")
    const stations = await pool.query("SELECT id FROM stations")
    const allStationIds = stations.rows.map((row) => row.id)

    const permissions = users.rows.flatMap((user) => {
      const permitted = parseJson<string[]>(user.permitted_stations, [])
      if (user.role === "admin" && permitted.length === 0) {
        return allStationIds.map((stationId) => ({ userId: user.id, stationId }))
      }
      return permitted.map((stationId) => ({ userId: user.id, stationId }))
    })

    res.json(permissions)
  })
)

app.get(
  "/api/stations",
  asyncHandler(async (_req, res) => {
    const result = await pool.query("SELECT * FROM stations")
    res.json(result.rows.map(mapStation))
  })
)

app.get(
  "/api/stations/:id/images",
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const result = await pool.query("SELECT * FROM stations WHERE id = $1", [id])
    const station = result.rows[0]
    if (!station) {
      res.status(404).json({ message: "station not found" })
      return
    }

    const images = station.image_url
      ? [{ url: station.image_url, capturedAt: toIso(station.last_data_received) }]
      : []
    res.json({ stationId: id, images })
  })
)

app.get(
  "/api/stations/:id/weather-data",
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const result = await pool.query("SELECT id FROM stations WHERE id = $1", [id])
    if (result.rowCount === 0) {
      res.status(404).json({ message: "station not found" })
      return
    }

    const days = resolveRange(req.query.range)
    const data: WeatherData[] = generateMockWeatherData(id, days)
    res.json(data)
  })
)

app.get(
  "/api/stations/:id/soil-data",
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const result = await pool.query("SELECT id FROM stations WHERE id = $1", [id])
    if (result.rowCount === 0) {
      res.status(404).json({ message: "station not found" })
      return
    }

    const days = resolveRange(req.query.range)
    const data: SoilData[] = generateMockSoilData(id, days)
    res.json(data)
  })
)

app.get(
  "/api/weather-forecast",
  asyncHandler(async (_req, res) => {
    res.json(mockWeatherForecast())
  })
)

app.get(
  "/api/sim-cards",
  asyncHandler(async (_req, res) => {
    const result = await pool.query("SELECT * FROM sim_cards")
    res.json(result.rows.map(mapSim))
  })
)

app.put(
  "/api/sim-cards/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const existing = await pool.query("SELECT * FROM sim_cards WHERE id = $1", [id])
    const sim = existing.rows[0]
    if (!sim) {
      res.status(404).json({ message: "sim card not found" })
      return
    }

    const { simNumber, provider, associatedStation, status, lastCommunication } = req.body || {}
    await pool.query(
      "UPDATE sim_cards SET sim_number = $1, provider = $2, associated_station = $3, status = $4, last_communication = $5 WHERE id = $6",
      [
        simNumber ?? sim.sim_number,
        provider ?? sim.provider,
        associatedStation ?? sim.associated_station,
        status ?? sim.status,
        lastCommunication ?? sim.last_communication,
        id,
      ]
    )

    const updated = await pool.query("SELECT * FROM sim_cards WHERE id = $1", [id])
    res.json(mapSim(updated.rows[0]))
  })
)

app.get(
  "/api/activities",
  asyncHandler(async (req, res) => {
    const stationId = req.query.stationId as string | undefined
    const result = stationId
      ? await pool.query("SELECT * FROM activities WHERE station_id = $1 ORDER BY date DESC", [stationId])
      : await pool.query("SELECT * FROM activities ORDER BY date DESC")

    res.json(result.rows.map(mapActivity))
  })
)

app.post(
  "/api/activities",
  asyncHandler(async (req, res) => {
    const { date, activityType, description, stationId, createdBy, createdByName, images } = req.body || {}
    if (!date || !activityType || !description || !stationId || !createdBy || !createdByName) {
      res.status(400).json({ message: "missing required fields" })
      return
    }

    const id = nanoid()
    const createdAt = new Date().toISOString()
    const imageList = Array.isArray(images) ? images : []

    await pool.query(
      "INSERT INTO activities (id, date, activity_type, description, station_id, created_by, created_by_name, images, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)",
      [id, date, activityType, description, stationId, createdBy, createdByName, JSON.stringify(imageList), createdAt]
    )

    const saved = await pool.query("SELECT * FROM activities WHERE id = $1", [id])
    res.status(201).json(mapActivity(saved.rows[0]))
  })
)

app.put(
  "/api/activities/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const existing = await pool.query("SELECT * FROM activities WHERE id = $1", [id])
    const activity = existing.rows[0]
    if (!activity) {
      res.status(404).json({ message: "activity not found" })
      return
    }

    const { date, activityType, description, stationId, createdBy, createdByName, images } = req.body || {}
    const imageList = Array.isArray(images) ? images : parseJson(activity.images, [])

    await pool.query(
      "UPDATE activities SET date = $1, activity_type = $2, description = $3, station_id = $4, created_by = $5, created_by_name = $6, images = $7::jsonb WHERE id = $8",
      [
        date ?? activity.date,
        activityType ?? activity.activity_type,
        description ?? activity.description,
        stationId ?? activity.station_id,
        createdBy ?? activity.created_by,
        createdByName ?? activity.created_by_name,
        JSON.stringify(imageList),
        id,
      ]
    )

    const saved = await pool.query("SELECT * FROM activities WHERE id = $1", [id])
    res.json(mapActivity(saved.rows[0]))
  })
)

app.delete(
  "/api/activities/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const info = await pool.query("DELETE FROM activities WHERE id = $1", [id])
    if (info.rowCount === 0) {
      res.status(404).json({ message: "activity not found" })
      return
    }
    res.status(204).send()
  })
)

const port = Number(process.env.PORT) || 4000

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend listening on http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.error("Failed to initialize database", error)
    process.exit(1)
  })
