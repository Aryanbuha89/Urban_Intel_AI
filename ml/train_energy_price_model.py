import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

from ml.generate_energy_data import build_energy_dataset
from ml.weather_data_pipeline import build_weather_dataset


def load_or_create_dataset() -> pd.DataFrame:
    energy_path = "ml/data/energy_data.csv"
    weather_path = "ml/data/weather_data.csv"
    if not os.path.exists(energy_path):
        build_energy_dataset(output_path=energy_path)
    if not os.path.exists(weather_path):
        build_weather_dataset(output_path=weather_path)
    energy = pd.read_csv(energy_path)
    weather = pd.read_csv(weather_path)
    df = pd.merge(energy, weather, on="sample_id", how="inner")
    return df


def compute_energy_price_change(row: pd.Series) -> float:
    usage_increase = ((row["current_usage_mw"] - row["avg_usage_last_year"]) / row["avg_usage_last_year"]) * 100.0
    demand_stress = row["current_usage_mw"] / row["peak_demand_mw"]
    price_change = 0.0
    if usage_increase > 20.0:
        price_change += 12.0
    elif usage_increase > 10.0:
        price_change += 6.0
    if demand_stress > 0.9:
        price_change += 8.0
    if row["grid_stability"] < 90.0:
        price_change += 5.0
    if row["recent_storm_or_flood"] == 1:
        price_change += 4.0
    return price_change


def train_energy_price_model() -> RandomForestRegressor:
    df = load_or_create_dataset()
    df["price_change_percent"] = df.apply(compute_energy_price_change, axis=1)
    feature_columns = [
        "current_usage_mw",
        "avg_usage_last_year",
        "peak_demand_mw",
        "grid_stability",
        "renewable_percentage",
        "recent_storm_or_flood",
    ]
    X = df[feature_columns]
    y = df["price_change_percent"]
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
    print(f"Energy price model MAE: {mae:.2f}")
    print(f"Energy price model R2: {r2:.3f}")
    os.makedirs("ml/models", exist_ok=True)
    model_path = "ml/models/energy_price_random_forest.joblib"
    joblib.dump(model, model_path)
    print(f"Saved energy price model to {model_path}")
    return model


if __name__ == "__main__":
    train_energy_price_model()
