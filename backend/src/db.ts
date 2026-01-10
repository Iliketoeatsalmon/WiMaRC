import { Pool } from "pg"
import { seedUsers, seedStations, seedActivities, seedSimCards } from "./data"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : undefined,
})

export { pool }

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      permitted_stations JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      location JSONB NOT NULL,
      status TEXT NOT NULL,
      last_data_received TIMESTAMPTZ NOT NULL,
      sim_card_id TEXT,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      date DATE NOT NULL,
      activity_type TEXT NOT NULL,
      description TEXT NOT NULL,
      station_id TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_by_name TEXT NOT NULL,
      images JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sim_cards (
      id TEXT PRIMARY KEY,
      sim_number TEXT NOT NULL,
      provider TEXT NOT NULL,
      associated_station TEXT,
      status TEXT NOT NULL,
      last_communication TIMESTAMPTZ
    );
  `)

  await seedIfEmpty()
}

async function seedIfEmpty() {
  const userCount = await pool.query("SELECT COUNT(1)::int AS count FROM users")
  if (userCount.rows[0]?.count === 0) {
    const users = seedUsers()
    const client = await pool.connect()
    try {
      await client.query("BEGIN")
      for (const user of users) {
        await client.query(
          "INSERT INTO users (id, username, email, role, name, permitted_stations, created_at, password) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8)",
          [
            user.id,
            user.username,
            user.email,
            user.role,
            user.name,
            JSON.stringify(user.permittedStations),
            user.createdAt,
            user.password,
          ]
        )
      }
      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  const stationCount = await pool.query("SELECT COUNT(1)::int AS count FROM stations")
  if (stationCount.rows[0]?.count === 0) {
    const stations = seedStations()
    const client = await pool.connect()
    try {
      await client.query("BEGIN")
      for (const station of stations) {
        await client.query(
          "INSERT INTO stations (id, name, type, location, status, last_data_received, sim_card_id, image_url) VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8)",
          [
            station.id,
            station.name,
            station.type,
            JSON.stringify(station.location),
            station.status,
            station.lastDataReceived,
            station.simCardId ?? null,
            station.imageUrl ?? null,
          ]
        )
      }
      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  const activityCount = await pool.query("SELECT COUNT(1)::int AS count FROM activities")
  if (activityCount.rows[0]?.count === 0) {
    const activities = seedActivities()
    const client = await pool.connect()
    try {
      await client.query("BEGIN")
      for (const activity of activities) {
        await client.query(
          "INSERT INTO activities (id, date, activity_type, description, station_id, created_by, created_by_name, images, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)",
          [
            activity.id,
            activity.date,
            activity.activityType,
            activity.description,
            activity.stationId,
            activity.createdBy,
            activity.createdByName,
            JSON.stringify(activity.images),
            activity.createdAt,
          ]
        )
      }
      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  const simCount = await pool.query("SELECT COUNT(1)::int AS count FROM sim_cards")
  if (simCount.rows[0]?.count === 0) {
    const simCards = seedSimCards()
    const client = await pool.connect()
    try {
      await client.query("BEGIN")
      for (const sim of simCards) {
        await client.query(
          "INSERT INTO sim_cards (id, sim_number, provider, associated_station, status, last_communication) VALUES ($1, $2, $3, $4, $5, $6)",
          [
            sim.id,
            sim.simNumber,
            sim.provider,
            sim.associatedStation ?? null,
            sim.status,
            sim.lastCommunication ?? null,
          ]
        )
      }
      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }
}
