from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class PredictRequest(BaseModel):
    latitude: float
    longitude: float
    commissioning_year: Optional[float] = 2000
    primary_fuel: str
    country: str


class PredictResponse(BaseModel):
    capacity_mw: float
    latitude: float
    longitude: float
    primary_fuel: str
    country: str


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    is_admin: bool


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    created_at: Optional[str] = None


class PlantResponse(BaseModel):
    id: Optional[int] = None
    name: str
    country_long: str
    capacity_mw: float
    latitude: float
    longitude: float
    primary_fuel: str
    commissioning_year: Optional[float] = None
    owner: Optional[str] = None


class PlantCreate(BaseModel):
    name: str
    country_long: str
    capacity_mw: float
    latitude: float
    longitude: float
    primary_fuel: str
    commissioning_year: Optional[float] = None
    owner: Optional[str] = None


class AnalyticsSummary(BaseModel):
    total_plants: int
    total_capacity_mw: float
    avg_capacity_mw: float
    total_countries: int
    fuel_types: int


class FuelDistribution(BaseModel):
    fuel_type: str
    count: int


class CapacityByFuel(BaseModel):
    fuel_type: str
    avg_capacity: float


class TopCountry(BaseModel):
    country: str
    total_capacity: float
    plant_count: int


class YearlyTrend(BaseModel):
    year: float
    total_capacity: float
    plant_count: int


class MapPoint(BaseModel):
    latitude: float
    longitude: float
    capacity_mw: float
    name: str
    primary_fuel: str
    country: str
