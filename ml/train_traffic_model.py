import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

from ml.generate_transportation_data import build_transportation_dataset
from ml.weather_data_pipeline import build_weather_dataset


def load_or_create_dataset() -> pd.DataFrame:
    weather_path = "ml/data/weather_data.csv"
    transport_path = "ml/data/transportation_data.csv"
    if not os.path.exists(weather_path):
        build_weather_dataset(output_path=weather_path)
    if not os.path.exists(transport_path):
        build_transportation_dataset(output_path=transport_path)
    weather = pd.read_csv(weather_path)
    transport = pd.read_csv(transport_path)
    df = pd.merge(weather, transport, on="sample_id", how="inner")
    return df


def compute_congestion_label(row: pd.Series) -> float:
    congestion = 40.0
    buses_ratio = row["buses_operating"] / max(row["total_buses"], 1)
    if buses_ratio > 0.8:
        congestion += 20.0
    harsh_weather = False
    if row["temperature_c"] > 40.0 or row["rainfall_mm"] > 30.0 or row["wind_speed_kmh"] > 20.0:
        harsh_weather = True
    if harsh_weather:
        congestion += 25.0
    return max(0.0, min(100.0, congestion))


def train_traffic_model() -> RandomForestRegressor:
    df = load_or_create_dataset()
    df["congestion_level"] = df.apply(compute_congestion_label, axis=1)
    feature_columns = [
        "temperature_c",
        "humidity",
        "wind_speed_kmh",
        "rainfall_mm",
        "rainfall_last_12_months_mm",
        "recent_storm_or_flood",
        "aqi",
        "buses_operating",
        "total_buses",
        "avg_vehicles_per_hour",
        "peak_hour_multiplier",
        "congested_west",
        "congested_south",
        "congested_east",
        "congested_north",
        "congested_central",
    ]
    X = df[feature_columns]
    y = df["congestion_level"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(
        n_estimators=200,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"Traffic model MAE: {mae:.2f}")
    print(f"Traffic model R2: {r2:.3f}")
    os.makedirs("ml/models", exist_ok=True)
    model_path = "ml/models/traffic_random_forest.joblib"
    joblib.dump(model, model_path)
    print(f"Saved traffic model to {model_path}")
    return model


if __name__ == "__main__":
    train_traffic_model()

