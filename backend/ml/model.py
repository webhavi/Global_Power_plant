import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from config import MODEL_PATH, FEATURES

model = None
label_encoders = {}
scaler = None


def load_model():
    global model
    if model is None:
        model = joblib.load(MODEL_PATH)
    return model


def get_label_encoders():
    global label_encoders
    if not label_encoders:
        df = pd.read_csv(Path(__file__).parent.parent / "data" / "global_power_plant_database.csv")
        from sklearn.preprocessing import LabelEncoder
        le_fuel = LabelEncoder()
        le_fuel.fit(df["primary_fuel"].astype(str))
        label_encoders["primary_fuel"] = le_fuel

        le_country = LabelEncoder()
        le_country.fit(df["country_long"].astype(str))
        label_encoders["country_long"] = le_country
    return label_encoders


def get_scaler():
    global scaler
    if scaler is None:
        from sklearn.preprocessing import StandardScaler
        df = pd.read_csv(Path(__file__).parent.parent / "data" / "global_power_plant_database.csv")
        encoders = get_label_encoders()

        df["primary_fuel_encoded"] = encoders["primary_fuel"].transform(df["primary_fuel"].astype(str))
        df["country_long_encoded"] = encoders["country_long"].transform(df["country_long"].astype(str))
        df["commissioning_year"] = df["commissioning_year"].fillna(df["commissioning_year"].mean())

        X = df[["latitude", "longitude", "commissioning_year", "primary_fuel_encoded", "country_long_encoded"]]
        scaler = StandardScaler()
        scaler.fit(X)
    return scaler


def predict_capacity(latitude: float, longitude: float, commissioning_year: float,
                     primary_fuel: str, country: str) -> float:
    m = load_model()
    encoders = get_label_encoders()
    sc = get_scaler()

    try:
        fuel_encoded = encoders["primary_fuel"].transform([primary_fuel])[0]
    except ValueError:
        fuel_encoded = 0

    try:
        country_encoded = encoders["country_long"].transform([country])[0]
    except ValueError:
        country_encoded = 0

    features = np.array([[latitude, longitude, commissioning_year, fuel_encoded, country_encoded]])
    features_scaled = sc.transform(features)
    prediction = m.predict(features_scaled)
    return float(prediction[0])


def get_fuel_types():
    encoders = get_label_encoders()
    return sorted(encoders["primary_fuel"].classes_.tolist())


def get_countries():
    encoders = get_label_encoders()
    return sorted(encoders["country_long"].classes_.tolist())
