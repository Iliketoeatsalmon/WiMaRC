import os
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import uuid4

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .db import Base, SessionLocal, engine, get_db
from .models import PlotActivity, SensorReading, SimPayment, Station, StationImage, User, WeatherForecast
from .schemas import (
    AuthLogin,
    PlotActivityCreate,
    PlotActivityOut,
    PlotActivityUpdate,
    SensorReadingCreate,
    SensorReadingOut,
    SimPaymentCreate,
    SimPaymentOut,
    SimPaymentUpdate,
    StationCreate,
    StationImageOut,
    StationOut,
    StationUpdate,
    UserCreate,
    UserOut,
    UserUpdate,
    WeatherForecastOut,
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


@app.post("/auth/login", response_model=UserOut)
def login(payload: AuthLogin, db: Session = Depends(get_db)) -> User:
    user = (
        db.query(User)
        .filter(User.username == payload.username, User.password == payload.password, User.is_enabled.is_(True))
        .first()
    )
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user


@app.get("/stations", response_model=List[StationOut])
def list_stations(
    owner_id: Optional[str] = None,
    db: Session = Depends(get_db),
) -> List[Station]:
    query = db.query(Station)
    if owner_id:
        query = query.filter(Station.owner_id == owner_id)
    return query.order_by(Station.id).all()


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


@app.get("/stations/{station_id}/images/latest", response_model=StationImageOut)
def get_latest_station_image(station_id: str, db: Session = Depends(get_db)) -> StationImage:
    image = (
        db.query(StationImage)
        .filter(StationImage.station_id == station_id)
        .order_by(StationImage.timestamp.desc())
        .first()
    )
    if not image:
        raise HTTPException(status_code=404, detail="Station image not found")
    return image


@app.get("/stations/{station_id}/forecast", response_model=List[WeatherForecastOut])
def get_station_forecast(station_id: str, db: Session = Depends(get_db)) -> List[WeatherForecast]:
    return (
        db.query(WeatherForecast)
        .filter(WeatherForecast.station_id == station_id)
        .order_by(WeatherForecast.forecast_date.asc())
        .all()
    )


@app.get("/stations/{station_id}/readings", response_model=List[SensorReadingOut])
def list_readings(
    station_id: str,
    limit: int = Query(100, ge=1, le=1000),
    days: Optional[int] = Query(None, ge=1, le=365),
    db: Session = Depends(get_db),
) -> List[SensorReading]:
    query = db.query(SensorReading).filter(SensorReading.station_id == station_id)
    if days:
        start_date = datetime.utcnow() - timedelta(days=days)
        query = query.filter(SensorReading.timestamp >= start_date)
    return query.order_by(SensorReading.timestamp.desc()).limit(limit).all()


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


@app.put("/activities/{activity_id}", response_model=PlotActivityOut)
def update_activity(
    activity_id: str, payload: PlotActivityUpdate, db: Session = Depends(get_db)
) -> PlotActivity:
    activity = db.query(PlotActivity).filter(PlotActivity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(activity, key, value)

    db.commit()
    db.refresh(activity)
    return activity


@app.delete("/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(activity_id: str, db: Session = Depends(get_db)) -> None:
    activity = db.query(PlotActivity).filter(PlotActivity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(activity)
    db.commit()


@app.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db)) -> List[User]:
    return db.query(User).order_by(User.username).all()


@app.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: str, db: Session = Depends(get_db)) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    user_id = payload.id or f"user-{uuid4().hex[:8]}"
    if db.query(User).filter(User.id == user_id).first():
        raise HTTPException(status_code=409, detail="User already exists")

    user = User(
        id=user_id,
        username=payload.username,
        password=payload.password,
        role=payload.role,
        full_name=payload.full_name,
        email=payload.email,
        is_enabled=payload.is_enabled,
        permitted_station_ids=payload.permitted_station_ids,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.put("/users/{user_id}", response_model=UserOut)
def update_user(user_id: str, payload: UserUpdate, db: Session = Depends(get_db)) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: str, db: Session = Depends(get_db)) -> None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()


@app.get("/sim-payments", response_model=List[SimPaymentOut])
def list_sim_payments(
    station_id: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
) -> List[SimPayment]:
    query = db.query(SimPayment)
    if station_id:
        query = query.filter(SimPayment.station_id == station_id)
    if status_filter:
        query = query.filter(SimPayment.status == status_filter)
    return query.order_by(SimPayment.due_date.desc()).all()


@app.post("/sim-payments", response_model=SimPaymentOut, status_code=status.HTTP_201_CREATED)
def create_sim_payment(payload: SimPaymentCreate, db: Session = Depends(get_db)) -> SimPayment:
    payment = SimPayment(
        id=payload.id or f"sim-{uuid4().hex[:10]}",
        station_id=payload.station_id,
        station_name=payload.station_name,
        sim_number=payload.sim_number,
        provider=payload.provider,
        amount=payload.amount,
        due_date=payload.due_date,
        status=payload.status,
        paid_date=payload.paid_date,
        notes=payload.notes,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


@app.put("/sim-payments/{payment_id}", response_model=SimPaymentOut)
def update_sim_payment(
    payment_id: str, payload: SimPaymentUpdate, db: Session = Depends(get_db)
) -> SimPayment:
    payment = db.query(SimPayment).filter(SimPayment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(payment, key, value)

    db.commit()
    db.refresh(payment)
    return payment


@app.delete("/sim-payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sim_payment(payment_id: str, db: Session = Depends(get_db)) -> None:
    payment = db.query(SimPayment).filter(SimPayment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    db.delete(payment)
    db.commit()
