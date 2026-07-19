from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
from models.db_models import User
import pandas as pd
from pathlib import Path
from config import DATA_PATH

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

df_cache = None


def get_dataframe():
    global df_cache
    if df_cache is None:
        df_cache = pd.read_csv(DATA_PATH)
    return df_cache


@router.get("/summary")
def get_summary(current_user: User = Depends(get_current_user)):
    df = get_dataframe()
    return {
        "total_plants": int(len(df)),
        "total_capacity_mw": round(float(df["capacity_mw"].sum()), 2),
        "avg_capacity_mw": round(float(df["capacity_mw"].mean()), 2),
        "total_countries": int(df["country_long"].nunique()),
        "fuel_types": int(df["primary_fuel"].nunique())
    }


@router.get("/fuel-distribution")
def get_fuel_distribution(current_user: User = Depends(get_current_user)):
    df = get_dataframe()
    counts = df["primary_fuel"].value_counts()
    return [{"fuel_type": k, "count": int(v)} for k, v in counts.items()]


@router.get("/capacity-by-fuel")
def get_capacity_by_fuel(current_user: User = Depends(get_current_user)):
    df = get_dataframe()
    avg = df.groupby("primary_fuel")["capacity_mw"].mean().sort_values(ascending=False)
    return [{"fuel_type": k, "avg_capacity": round(float(v), 2)} for k, v in avg.items()]


@router.get("/top-countries")
def get_top_countries(current_user: User = Depends(get_current_user)):
    df = get_dataframe()
    grouped = df.groupby("country_long").agg(
        total_capacity=("capacity_mw", "sum"),
        plant_count=("capacity_mw", "count")
    ).sort_values("total_capacity", ascending=False).head(20)
    return [
        {"country": k, "total_capacity": round(float(v["total_capacity"]), 2), "plant_count": int(v["plant_count"])}
        for k, v in grouped.iterrows()
    ]


@router.get("/yearly-trend")
def get_yearly_trend(current_user: User = Depends(get_current_user)):
    df = get_dataframe()
    df_filtered = df.dropna(subset=["commissioning_year"])
    grouped = df_filtered.groupby("commissioning_year").agg(
        total_capacity=("capacity_mw", "sum"),
        plant_count=("capacity_mw", "count")
    ).sort_index()
    return [
        {"year": float(k), "total_capacity": round(float(v["total_capacity"]), 2), "plant_count": int(v["plant_count"])}
        for k, v in grouped.iterrows()
    ]


@router.get("/map-data")
def get_map_data(current_user: User = Depends(get_current_user)):
    df = get_dataframe()
    df_filtered = df.dropna(subset=["latitude", "longitude"])
    sample = df_filtered.sample(min(5000, len(df_filtered)), random_state=42)
    return [
        {
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "capacity_mw": float(row["capacity_mw"]),
            "name": str(row["name"]),
            "primary_fuel": str(row["primary_fuel"]),
            "country": str(row["country_long"])
        }
        for _, row in sample.iterrows()
    ]


@router.get("/all-map-data")
def get_all_map_data(current_user: User = Depends(get_current_user)):
    df = get_dataframe()
    df_filtered = df.dropna(subset=["latitude", "longitude"])
    return [
        {
            "latitude": float(row["latitude"]),
            "longitude": float(row["longitude"]),
            "capacity_mw": float(row["capacity_mw"]),
            "name": str(row["name"]),
            "primary_fuel": str(row["primary_fuel"]),
            "country": str(row["country_long"])
        }
        for _, row in df_filtered.iterrows()
    ]
