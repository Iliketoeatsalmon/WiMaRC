import os
from datetime import datetime
from typing import List, Optional
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .db import Base, SessionLocal, engine, get_db
from .models import PlotActivity, SensorReading, Station, User
from .schemas import (
    PlotActivityCreate,
    PlotActivityOut,
    SensorReadingCreate,
    SensorReadingOut,
    StationCreate,
    StationOut,
    StationUpdate,
    UserOut,
)
from .seed import seed_data

app = FastAPI(title="WiMaRC API", version="0.1.0")

cors_origins = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins or ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seed_data(session)


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


@app.get("/stations", response_model=List[StationOut])
def list_stations(db: Session = Depends(get_db)) -> List[Station]:
    return db.query(Station).order_by(Station.id).all()


@app.get("/stations/{station_id}", response_model=StationOut)
def get_station(station_id: str, db: Session = Depends(get_db)) -> Station:
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    return station


@app.post("/stations", response_model=StationOut, status_code=status.HTTP_201_CREATED)
def create_station(payload: StationCreate, db: Session = Depends(get_db)) -> Station:
    station_id = payload.id or f"station-{uuid4().hex[:8]}"
    if db.query(Station).filter(Station.id == station_id).first():
        raise HTTPException(status_code=409, detail="Station already exists")

    station = Station(
        id=station_id,
        name=payload.name,
        type=payload.type,
        owner_id=payload.owner_id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        status=payload.status,
        last_data_time=payload.last_data_time,
        area=payload.area,
        description=payload.description,
    )
    db.add(station)
    db.commit()
    db.refresh(station)
    return station


@app.put("/stations/{station_id}", response_model=StationOut)
def update_station(station_id: str, payload: StationUpdate, db: Session = Depends(get_db)) -> Station:
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(station, key, value)

    db.commit()
    db.refresh(station)
    return station


@app.delete("/stations/{station_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_station(station_id: str, db: Session = Depends(get_db)) -> None:
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    db.delete(station)
    db.commit()


@app.get("/stations/{station_id}/readings", response_model=List[SensorReadingOut])
def list_readings(
    station_id: str,
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
) -> List[SensorReading]:
    return (
        db.query(SensorReading)
        .filter(SensorReading.station_id == station_id)
        .order_by(SensorReading.timestamp.desc())
        .limit(limit)
        .all()
    )


@app.post("/stations/{station_id}/readings", response_model=SensorReadingOut, status_code=status.HTTP_201_CREATED)
def create_reading(
    station_id: str, payload: SensorReadingCreate, db: Session = Depends(get_db)
) -> SensorReading:
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    reading = SensorReading(
        id=payload.id or f"reading-{uuid4().hex[:12]}",
        station_id=station_id,
        timestamp=payload.timestamp or datetime.utcnow(),
        air_temperature=payload.air_temperature,
        relative_humidity=payload.relative_humidity,
        light_intensity=payload.light_intensity,
        wind_direction=payload.wind_direction,
        wind_speed=payload.wind_speed,
        rainfall=payload.rainfall,
        atmospheric_pressure=payload.atmospheric_pressure,
        vpd=payload.vpd,
        soil_moisture1=payload.soil_moisture1,
        soil_moisture2=payload.soil_moisture2,
    )

    station.last_data_time = reading.timestamp
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading


@app.get("/activities", response_model=List[PlotActivityOut])
def list_activities(
    station_id: Optional[str] = None, db: Session = Depends(get_db)
) -> List[PlotActivity]:
    query = db.query(PlotActivity)
    if station_id:
        query = query.filter(PlotActivity.station_id == station_id)
    return query.order_by(PlotActivity.date.desc()).all()


@app.post("/activities", response_model=PlotActivityOut, status_code=status.HTTP_201_CREATED)
def create_activity(payload: PlotActivityCreate, db: Session = Depends(get_db)) -> PlotActivity:
    activity = PlotActivity(
        id=payload.id or f"activity-{uuid4().hex[:12]}",
        station_id=payload.station_id,
        date=payload.date,
        activity_type=payload.activity_type,
        description=payload.description,
        created_by=payload.created_by,
        created_by_name=payload.created_by_name,
        images=payload.images,
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@app.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db)) -> List[User]:
    return db.query(User).order_by(User.username).all()
