import os

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

from ml.generate_agriculture_data import build_agriculture_dataset
from ml.generate_public_services_data import build_public_services_dataset
from ml.weather_data_pipeline import build_weather_dataset


def load_or_create_dataset() -> pd.DataFrame:
    weather_path = "ml/data/weather_data.csv"
    agriculture_path = "ml/data/agriculture_data.csv"
    public_path = "ml/data/public_services_data.csv"
    if not os.path.exists(weather_path):
        build_weather_dataset(output_path=weather_path)
    if not os.path.exists(agriculture_path):
        build_agriculture_dataset(output_path=agriculture_path)
    if not os.path.exists(public_path):
        build_public_services_dataset(output_path=public_path)
    weather = pd.read_csv(weather_path)
    agriculture = pd.read_csv(agriculture_path)
    public = pd.read_csv(public_path)
    df = pd.merge(weather, agriculture, on="sample_id", how="inner")
    df = pd.merge(df, public, on="sample_id", how="inner")
    return df


def compute_water_status(row: pd.Series) -> str:
    total_rainfall = row["rainfall_last_12_months_mm"]
    avg_expected = 1500.0
    rainfall_percentage = (total_rainfall / avg_expected) * 100.0
    water_level = row["water_supply_level"]
    if rainfall_percentage < 50.0 or water_level < 30.0:
        return "critical"
    if rainfall_percentage < 70.0 or water_level < 50.0:
        return "shortage"
    if rainfall_percentage > 130.0:
        return "abundant"
    return "normal"


def compute_food_price_change(row: pd.Series) -> float:
    total_rainfall = row["rainfall_last_12_months_mm"]
    is_low_rainfall = total_rainfall < 1050.0
    price_change = 0.0
    if is_low_rainfall:
        price_change += 15.0
    if row["current_stock_level"] < 50.0:
        price_change += 10.0
    if row["supply_chain_efficiency"] < 70.0:
        price_change += 8.0
    water_status = compute_water_status(row)
    if water_status in {"critical", "shortage"}:
        price_change += 5.0
    return price_change


def train_food_price_model() -> RandomForestRegressor:
    df = load_or_create_dataset()
    df["price_change_percent"] = df.apply(compute_food_price_change, axis=1)
    feature_columns = [
        "rainfall_last_12_months_mm",
        "crop_yield_last_year",
        "current_stock_level",
        "supply_chain_efficiency",
        "import_dependency",
        "water_supply_level",
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
    print(f"Food price model MAE: {mae:.2f}")
    print(f"Food price model R2: {r2:.3f}")
    os.makedirs("ml/models", exist_ok=True)
    model_path = "ml/models/food_price_random_forest.joblib"
    joblib.dump(model, model_path)
    print(f"Saved food price model to {model_path}")
    return model


if __name__ == "__main__":
    train_food_price_model()

