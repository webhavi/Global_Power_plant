import pandas as pd
import numpy as np
from pathlib import Path

np.random.seed(42)

FUEL_TYPES = ["Biomass", "Coal", "Gas", "Hydro", "Nuclear", "Oil", "Solar", "Wind", "Geothermal", "Waste"]
COUNTRIES = [
    "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria",
    "Bangladesh", "Belgium", "Brazil", "Bulgaria", "Canada", "Chile",
    "China", "Colombia", "Croatia", "Czech Republic", "Denmark", "Egypt",
    "Finland", "France", "Germany", "Ghana", "Greece", "Hungary",
    "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
    "Italy", "Japan", "Kenya", "Malaysia", "Mexico", "Morocco",
    "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru",
    "Philippines", "Poland", "Portugal", "Romania", "Russia", "Saudi Arabia",
    "South Africa", "South Korea", "Spain", "Sweden", "Switzerland",
    "Taiwan", "Thailand", "Turkey", "Ukraine", "United Arab Emirates",
    "United Kingdom", "United States of America", "Vietnam", "Zimbabwe"
]

FUEL_CAPACITY_RANGES = {
    "Biomass": (5, 100),
    "Coal": (100, 2000),
    "Gas": (50, 1500),
    "Hydro": (10, 2000),
    "Nuclear": (500, 3000),
    "Oil": (10, 500),
    "Solar": (1, 100),
    "Wind": (5, 200),
    "Geothermal": (10, 150),
    "Waste": (5, 50),
}

year_weights = {}
for y in range(1960, 2021):
    if y < 1980:
        year_weights[y] = 1
    elif y < 2000:
        year_weights[y] = 3
    elif y < 2010:
        year_weights[y] = 5
    else:
        year_weights[y] = 8

years = list(year_weights.keys())
weights = list(year_weights.values())
total_w = sum(weights)
probs = [w / total_w for w in weights]

records = []
for i in range(5000):
    fuel = np.random.choice(FUEL_TYPES, p=[0.05, 0.15, 0.2, 0.2, 0.02, 0.08, 0.15, 0.1, 0.03, 0.02])
    country = np.random.choice(COUNTRIES)
    lat = np.random.uniform(-70, 75)
    lng = np.random.uniform(-180, 180)
    year = float(np.random.choice(years, p=probs)) if np.random.random() > 0.3 else np.nan
    cap_range = FUEL_CAPACITY_RANGES[fuel]
    capacity = np.random.lognormal(
        mean=np.log((cap_range[0] + cap_range[1]) / 3),
        sigma=0.8
    )
    capacity = max(cap_range[0], min(cap_range[1], capacity))

    records.append({
        "country": country[:3].upper(),
        "country_long": country,
        "name": f"{country} Power Plant {i+1}",
        "gppd_idnr": f"PP{i+1:06d}",
        "capacity_mw": round(capacity, 2),
        "latitude": round(lat, 4),
        "longitude": round(lng, 4),
        "primary_fuel": fuel,
        "other_fuel1": np.nan,
        "other_fuel2": np.nan,
        "other_fuel3": np.nan,
        "commissioning_year": year,
        "owner": f"Energy Corp {np.random.randint(1, 100)}",
        "source": "Synthetic Data",
        "url": "",
        "geolocation_source": "Various",
        "wepp_id": "",
        "year_of_capacity_data": 2019.0,
        "generation_gwh_2013": round(capacity * np.random.uniform(3, 8), 2) if np.random.random() > 0.5 else np.nan,
        "generation_gwh_2014": round(capacity * np.random.uniform(3, 8), 2) if np.random.random() > 0.5 else np.nan,
        "generation_gwh_2015": round(capacity * np.random.uniform(3, 8), 2) if np.random.random() > 0.5 else np.nan,
        "generation_gwh_2016": round(capacity * np.random.uniform(3, 8), 2) if np.random.random() > 0.5 else np.nan,
        "generation_gwh_2017": round(capacity * np.random.uniform(3, 8), 2) if np.random.random() > 0.5 else np.nan,
        "generation_gwh_2018": round(capacity * np.random.uniform(3, 8), 2) if np.random.random() > 0.5 else np.nan,
        "generation_gwh_2019": round(capacity * np.random.uniform(3, 8), 2) if np.random.random() > 0.5 else np.nan,
        "generation_data_source": "",
        "estimated_generation_gwh_2013": round(capacity * np.random.uniform(2, 6), 2),
        "estimated_generation_gwh_2014": round(capacity * np.random.uniform(2, 6), 2),
        "estimated_generation_gwh_2015": round(capacity * np.random.uniform(2, 6), 2),
        "estimated_generation_gwh_2016": round(capacity * np.random.uniform(2, 6), 2),
        "estimated_generation_gwh_2017": round(capacity * np.random.uniform(2, 6), 2),
    })

df = pd.DataFrame(records)
output_path = Path(__file__).parent / "data" / "global_power_plant_database.csv"
df.to_csv(output_path, index=False)
print(f"Generated {len(df)} records -> {output_path}")
