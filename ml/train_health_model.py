import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score
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


def compute_congestion_level(row: pd.Series) -> float:
    congestion = 40.0
    buses_ratio = row["buses_operating"] / max(row["total_buses"], 1.0)
    if buses_ratio > 0.8:
        congestion += 20.0
    harsh_weather = False
    if row["temperature_c"] > 40.0 or row["rainfall_mm"] > 30.0 or row["wind_speed_kmh"] > 20.0:
        harsh_weather = True
    if harsh_weather:
        congestion += 25.0
    if congestion < 0.0:
        congestion = 0.0
    if congestion > 100.0:
        congestion = 100.0
    return congestion


def compute_health_status(row: pd.Series) -> int:
    congestion_level = row["congestion_level"]
    effective_aqi = row["aqi"]
    if congestion_level > 70.0:
        effective_aqi += 20.0
    if congestion_level > 90.0:
        effective_aqi += 40.0
    status = 0
    if effective_aqi > 300.0:
        status = 3
    elif effective_aqi > 200.0:
        status = 2
    elif effective_aqi > 100.0:
        status = 1
    return status


def train_health_model() -> RandomForestClassifier:
    df = load_or_create_dataset()
    df["congestion_level"] = df.apply(compute_congestion_level, axis=1)
    df["health_status"] = df.apply(compute_health_status, axis=1)
    feature_columns = [
        "temperature_c",
        "humidity",
        "wind_speed_kmh",
        "rainfall_mm",
        "rainfall_last_12_months_mm",
        "aqi",
        "congestion_level",
    ]
    X = df[feature_columns]
    y = df["health_status"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")
    print(f"Health model accuracy: {acc:.3f}")
    print(f"Health model F1: {f1:.3f}")
    os.makedirs("ml/models", exist_ok=True)
    model_path = "ml/models/health_random_forest.joblib"
    joblib.dump(model, model_path)
    print(f"Saved health model to {model_path}")
    return model


if __name__ == "__main__":
    train_health_model()

