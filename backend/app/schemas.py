from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class StationBase(BaseModel):
    name: str
    type: str
    owner_id: Optional[str] = None
    latitude: float
    longitude: float
    status: str
    last_data_time: Optional[datetime] = None
    area: str
    description: str


class StationCreate(StationBase):
    id: Optional[str] = None


class StationUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    owner_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: Optional[str] = None
    last_data_time: Optional[datetime] = None
    area: Optional[str] = None
    description: Optional[str] = None


class StationOut(StationBase):
    id: str

    model_config = ConfigDict(from_attributes=True)


class SensorReadingBase(BaseModel):
    timestamp: Optional[datetime] = None
    air_temperature: Optional[float] = None
    relative_humidity: Optional[float] = None
    light_intensity: Optional[float] = None
    wind_direction: Optional[float] = None
    wind_speed: Optional[float] = None
    rainfall: Optional[float] = None
    atmospheric_pressure: Optional[float] = None
    vpd: Optional[float] = None
    soil_moisture1: Optional[float] = None
    soil_moisture2: Optional[float] = None


class SensorReadingCreate(SensorReadingBase):
    id: Optional[str] = None


class SensorReadingOut(SensorReadingBase):
    id: str
    station_id: str

    model_config = ConfigDict(from_attributes=True)


class PlotActivityBase(BaseModel):
    station_id: str
    date: date
    activity_type: str
    description: str
    created_by: str
    created_by_name: str
    images: List[str] = Field(default_factory=list)


class PlotActivityCreate(PlotActivityBase):
    id: Optional[str] = None


class PlotActivityOut(PlotActivityBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserOut(BaseModel):
    id: str
    username: str
    role: str
    full_name: str
    email: str
    is_enabled: bool
    permitted_station_ids: List[str] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
