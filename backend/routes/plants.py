from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models.db_models import User, Prediction
from models.schemas import PlantResponse, PlantCreate
from auth import get_current_user, require_admin
import pandas as pd
from pathlib import Path
from config import DATA_PATH

router = APIRouter(prefix="/api/plants", tags=["plants"])

df_cache = None


def get_dataframe():
    global df_cache
    if df_cache is None:
        df_cache = pd.read_csv(DATA_PATH)
    return df_cache


@router.get("", response_model=dict)
def list_plants(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str = Query("", description="Search by name"),
    fuel_type: str = Query("", description="Filter by fuel type"),
    country: str = Query("", description="Filter by country"),
    sort_by: str = Query("name", description="Sort column"),
    sort_dir: str = Query("asc", description="Sort direction"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    df = get_dataframe()

    if search:
        df = df[df["name"].str.contains(search, case=False, na=False)]
    if fuel_type:
        df = df[df["primary_fuel"] == fuel_type]
    if country:
        df = df[df["country_long"] == country]

    valid_sorts = ["name", "capacity_mw", "primary_fuel", "country_long", "latitude", "longitude", "commissioning_year"]
    if sort_by in valid_sorts:
        ascending = sort_dir == "asc"
        df = df.sort_values(sort_by, ascending=ascending, na_position="last")

    total = len(df)
    start = (page - 1) * page_size
    end = start + page_size
    page_data = df.iloc[start:end]

    plants = []
    for _, row in page_data.iterrows():
        plants.append({
            "id": int(row.name),
            "name": str(row.get("name", "")),
            "country_long": str(row.get("country_long", "")),
            "capacity_mw": float(row.get("capacity_mw", 0)),
            "latitude": float(row.get("latitude", 0)),
            "longitude": float(row.get("longitude", 0)),
            "primary_fuel": str(row.get("primary_fuel", "")),
            "commissioning_year": float(row["commissioning_year"]) if pd.notna(row.get("commissioning_year")) else None,
            "owner": str(row.get("owner", "")) if pd.notna(row.get("owner")) else None
        })

    return {
        "plants": plants,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


@router.get("/metadata")
def get_plant_metadata():
    df = get_dataframe()
    return {
        "fuel_types": sorted(df["primary_fuel"].dropna().unique().tolist()),
        "countries": sorted(df["country_long"].dropna().unique().tolist()),
        "total_plants": len(df)
    }
