import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split

from ml.generate_public_services_data import build_public_services_dataset
from ml.weather_data_pipeline import build_weather_dataset


def load_or_create_dataset() -> pd.DataFrame:
    weather_path = "ml/data/weather_data.csv"
    public_path = "ml/data/public_services_data.csv"
    if not os.path.exists(weather_path):
        build_weather_dataset(output_path=weather_path)
    if not os.path.exists(public_path):
        build_public_services_dataset(output_path=public_path)
    weather = pd.read_csv(weather_path)
    public = pd.read_csv(public_path)
    df = pd.merge(weather, public, on="sample_id", how="inner")
    return df


def compute_health_status(row: pd.Series) -> int:
    score = 0.0
    temperature = row["temperature_c"]
    rainfall = row["rainfall_mm"]
    aqi = row["aqi"]
    sewer_health = row["sewer_system_health"]
    response_time = row["emergency_response_time"]
    if temperature > 40.0 or temperature < 5.0:
        score += 1.0
    if rainfall > 40.0:
        score += 0.5
    if row["recent_storm_or_flood"] == 1:
        score += 0.5
    if aqi > 300.0:
        score += 2.0
    elif aqi > 200.0:
        score += 1.5
    elif aqi > 100.0:
        score += 1.0
    if sewer_health < 75.0:
        score += 1.0
    if response_time > 20.0:
        score += 1.0
    status = 0
    if score >= 4.0:
        status = 3
    elif score >= 2.5:
        status = 2
    elif score >= 1.0:
        status = 1
    return status


def train_health_model() -> RandomForestClassifier:
    df = load_or_create_dataset()
    df["health_status"] = df.apply(compute_health_status, axis=1)
    feature_columns = [
        "temperature_c",
        "rainfall_mm",
        "aqi",
        "recent_storm_or_flood",
        "sewer_system_health",
        "emergency_response_time",
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
