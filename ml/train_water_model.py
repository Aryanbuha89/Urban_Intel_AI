import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
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


def compute_water_shortage_level(row: pd.Series) -> float:
    total_rainfall = row["rainfall_last_12_months_mm"]
    avg_expected = 1500.0
    rainfall_percentage = (total_rainfall / avg_expected) * 100.0
    water_level = row["water_supply_level"]
    if rainfall_percentage < 50.0 or water_level < 30.0:
        return 85.0
    if rainfall_percentage < 70.0 or water_level < 50.0:
        return 60.0
    if rainfall_percentage > 130.0:
        return 0.0
    return 15.0


def train_water_model() -> RandomForestRegressor:
    df = load_or_create_dataset()
    df["shortage_level"] = df.apply(compute_water_shortage_level, axis=1)
    feature_columns = [
        "rainfall_last_12_months_mm",
        "water_supply_level",
        "roads_needing_repair",
        "sewer_system_health",
        "emergency_response_time",
        "pending_maintenance_tasks",
    ]
    X = df[feature_columns]
    y = df["shortage_level"]
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
    print(f"Water model MAE: {mae:.2f}")
    print(f"Water model R2: {r2:.3f}")
    os.makedirs("ml/models", exist_ok=True)
    model_path = "ml/models/water_shortage_random_forest.joblib"
    joblib.dump(model, model_path)
    print(f"Saved water model to {model_path}")
    return model


if __name__ == "__main__":
    train_water_model()

