import os
import random
from typing import Optional, Tuple

import pandas as pd
import requests


def _get_env(key: str, default: Optional[str] = None) -> Optional[str]:
    value = os.getenv(key)
    if value is None or value.strip() == "":
        return default
    return value


def fetch_openweather_sample(api_key: str, city: str) -> Tuple[float, float, float, float, float]:
    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {"q": city, "appid": api_key, "units": "metric"}
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    data = response.json()
    temperature = float(data.get("main", {}).get("temp", 25.0))
    humidity = float(data.get("main", {}).get("humidity", 60.0))
    wind_speed = float(data.get("wind", {}).get("speed", 3.0)) * 3.6
    rain_section = data.get("rain", {})
    rainfall = float(rain_section.get("1h") or rain_section.get("3h") or 0.0)
    lat = float(data.get("coord", {}).get("lat", 0.0))
    lon = float(data.get("coord", {}).get("lon", 0.0))
    aqi = fetch_openweather_aqi(api_key, lat, lon)
    return temperature, humidity, wind_speed, rainfall, aqi


def fetch_openweather_aqi(api_key: str, lat: float, lon: float) -> float:
    url = "https://api.openweathermap.org/data/2.5/air_pollution"
    params = {"lat": lat, "lon": lon, "appid": api_key}
    response = requests.get(url, params=params, timeout=10)
    if not response.ok:
        return 100.0
    data = response.json()
    items = data.get("list") or []
    if not items:
        return 100.0
    main = items[0].get("main", {})
    index = int(main.get("aqi", 3))
    mapping = {1: 25.0, 2: 75.0, 3: 125.0, 4: 200.0, 5: 300.0}
    return float(mapping.get(index, 125.0))


def generate_synthetic_weather_rows(
    n_rows: int,
    base_temperature: float = 28.0,
    base_humidity: float = 60.0,
    base_wind_speed: float = 10.0,
    base_rainfall: float = 2.0,
    base_aqi: float = 120.0,
) -> pd.DataFrame:
    rows = []
    for i in range(n_rows):
        temperature = random.gauss(base_temperature, 5.0)
        humidity = max(10.0, min(100.0, random.gauss(base_humidity, 15.0)))
        wind_speed = max(0.0, random.gauss(base_wind_speed, 4.0))
        rainfall = max(0.0, random.gauss(base_rainfall, 10.0))
        aqi = max(20.0, random.gauss(base_aqi, 40.0))
        recent_storm = 1 if rainfall > 40.0 else 0
        total_rainfall_12m = max(400.0, random.gauss(1500.0, 400.0))
        rows.append(
            {
                "sample_id": i,
                "temperature_c": round(temperature, 2),
                "humidity": round(humidity, 2),
                "wind_speed_kmh": round(wind_speed, 2),
                "rainfall_mm": round(rainfall, 2),
                "rainfall_last_12_months_mm": round(total_rainfall_12m, 2),
                "recent_storm_or_flood": recent_storm,
                "aqi": round(aqi, 2),
            }
        )
    return pd.DataFrame(rows)


def build_weather_dataset(n_rows: int = 20000, output_path: str = "ml/data/weather_data.csv") -> pd.DataFrame:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    api_key = _get_env("OPENWEATHER_API_KEY")
    city = _get_env("OPENWEATHER_CITY", "Delhi,IN")
    base_temperature = 28.0
    base_humidity = 60.0
    base_wind_speed = 10.0
    base_rainfall = 2.0
    base_aqi = 120.0
    if api_key:
        try:
            temperature, humidity, wind_speed, rainfall, aqi = fetch_openweather_sample(api_key, city)
            base_temperature = temperature
            base_humidity = humidity
            base_wind_speed = wind_speed
            base_rainfall = rainfall if rainfall > 0.0 else base_rainfall
            base_aqi = aqi
        except Exception:
            pass
    df = generate_synthetic_weather_rows(
        n_rows=n_rows,
        base_temperature=base_temperature,
        base_humidity=base_humidity,
        base_wind_speed=base_wind_speed,
        base_rainfall=base_rainfall,
        base_aqi=base_aqi,
    )
    df.to_csv(output_path, index=False)
    return df


if __name__ == "__main__":
    build_weather_dataset()

