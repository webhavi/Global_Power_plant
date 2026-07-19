from fastapi import APIRouter, Depends, HTTPException
from models.schemas import PredictRequest, PredictResponse
from ml.model import predict_capacity, get_fuel_types, get_countries
from auth import get_current_user
from database import get_db
from sqlalchemy.orm import Session
from models.db_models import User, Prediction

router = APIRouter(prefix="/api/predict", tags=["predict"])


@router.post("", response_model=PredictResponse)
def predict(request: PredictRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    capacity = predict_capacity(
        latitude=request.latitude,
        longitude=request.longitude,
        commissioning_year=request.commissioning_year or 2000,
        primary_fuel=request.primary_fuel,
        country=request.country
    )

    prediction = Prediction(
        user_id=current_user.id,
        latitude=request.latitude,
        longitude=request.longitude,
        commissioning_year=request.commissioning_year,
        primary_fuel=request.primary_fuel,
        country=request.country,
        predicted_capacity_mw=capacity
    )
    db.add(prediction)
    db.commit()

    return PredictResponse(
        capacity_mw=round(capacity, 2),
        latitude=request.latitude,
        longitude=request.longitude,
        primary_fuel=request.primary_fuel,
        country=request.country
    )


@router.get("/meta")
def get_metadata():
    return {
        "fuel_types": get_fuel_types(),
        "countries": get_countries()
    }
