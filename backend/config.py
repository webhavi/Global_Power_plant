import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent

MODEL_PATH = BACKEND_DIR.parent / "random_forest_regressor_model.joblib"
DATA_PATH = BACKEND_DIR / "data" / "global_power_plant_database.csv"
DB_PATH = BACKEND_DIR / "data" / "app.db"

SECRET_KEY = os.getenv("SECRET_KEY", "global-power-plant-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

FUEL_TYPES = [
    "Biomass", "Coal", "Gas", "Geothermal", "Hydro", "Nuclear",
    "Oil", "Petcoke", "Solar", "Storage", "Waste", "Wave and Tidal", "Wind"
]

FEATURES = ["latitude", "longitude", "commissioning_year", "primary_fuel_encoded", "country_long_encoded"]
