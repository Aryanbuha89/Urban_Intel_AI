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


def compute_cleanup_needed(row: pd.Series) -> int:
    if row["recent_storm_or_flood"] == 1:
        return 1
    if row["roads_needing_repair"] > 30:
        return 1
    if row["sewer_system_health"] < 75.0:
        return 1
    if row["water_supply_level"] < 40.0:
        return 1
    if row["emergency_response_time"] > 18.0:
        return 1
    if row["pending_maintenance_tasks"] > 40:
        return 1

    return 0


def train_public_services_model() -> RandomForestClassifier:
    df = load_or_create_dataset()
    df["cleanup_needed"] = df.apply(compute_cleanup_needed, axis=1)
    feature_columns = [
        "roads_needing_repair",
        "water_supply_level",
        "sewer_system_health",
        "emergency_response_time",
        "pending_maintenance_tasks",
        "recent_storm_or_flood",
    ]
    X = df[feature_columns]
    y = df["cleanup_needed"]

    # Use stratified split only when both classes have at least 2 samples.
    class_counts = y.value_counts()
    stratify_arg = y if class_counts.min() >= 2 and len(class_counts) > 1 else None

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=stratify_arg,
    )
    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    print(f"Public services model accuracy: {acc:.3f}")
    print(f"Public services model F1: {f1:.3f}")
    os.makedirs("ml/models", exist_ok=True)
    model_path = "ml/models/public_services_random_forest.joblib"
    joblib.dump(model, model_path)
    print(f"Saved public services model to {model_path}")
    return model


if __name__ == "__main__":
    train_public_services_model()
