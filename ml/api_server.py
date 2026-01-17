import os
from typing import Literal

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ml.weather_data_pipeline import fetch_openweather_sample


class WeatherIn(BaseModel):
    currentTemperature: float
    humidity: float
    windSpeed: float
    currentRainfall: float
    rainfallLast12Months: list[float]
    recentStormOrFlood: bool
    aqi: float


class TransportationIn(BaseModel):
    busesOperating: int
    totalBuses: int
    busRoutesCongested: list[str]
    avgVehiclesPerHour: int
    peakHourMultiplier: float


class AgricultureIn(BaseModel):
    cropYieldLastYear: float
    currentStockLevel: float
    supplyChainEfficiency: float
    importDependency: float


class EnergyIn(BaseModel):
    currentUsageMW: float
    avgUsageLastYear: float
    peakDemandMW: float
    gridStability: float
    renewablePercentage: float


class PublicServicesIn(BaseModel):
    roadsNeedingRepair: int
    waterSupplyLevel: float
    sewerSystemHealth: float
    emergencyResponseTime: float
    pendingMaintenanceTasks: int


class CityInput(BaseModel):
    weather: WeatherIn
    transportation: TransportationIn
    agriculture: AgricultureIn
    energy: EnergyIn
    publicServices: PublicServicesIn


class ModelOutputs(BaseModel):
    waterShortageLevel: float
    trafficCongestionLevel: float
    foodPriceChangePercent: float
    energyPriceChangePercent: float
    publicCleanupNeeded: bool
    healthStatus: Literal[0, 1, 2, 3]


app = FastAPI()

origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _load_model(path: str):
    if not os.path.exists(path):
        return None
    return joblib.load(path)


water_model = _load_model("ml/models/water_shortage_random_forest.joblib")
traffic_model = _load_model("ml/models/traffic_random_forest.joblib")
food_model = _load_model("ml/models/food_price_random_forest.joblib")
energy_model = _load_model("ml/models/energy_price_random_forest.joblib")
public_model = _load_model("ml/models/public_services_random_forest.joblib")
health_model = _load_model("ml/models/health_random_forest.joblib")


class WeatherOut(BaseModel):
    currentTemperature: float
    humidity: float
    windSpeed: float
    currentRainfall: float
    rainfallLast12Months: list[float]
    recentStormOrFlood: bool
    aqi: float


@app.get("/current-weather", response_model=WeatherOut)
def current_weather() -> WeatherOut:
    api_key = os.getenv("OPENWEATHER_API_KEY")
    city = os.getenv("OPENWEATHER_CITY", "Delhi,IN")

    fallback_rainfall_12 = [150.0] * 12
    fallback = WeatherOut(
        currentTemperature=30.0,
        humidity=60.0,
        windSpeed=10.0,
        currentRainfall=0.0,
        rainfallLast12Months=fallback_rainfall_12,
        recentStormOrFlood=False,
        aqi=100.0,
    )

    if not api_key:
        return fallback

    try:
        temperature, humidity, wind_speed, rainfall, aqi = fetch_openweather_sample(api_key, city)
        rainfall_last_12 = [50.0] * 12
        recent_storm_or_flood = rainfall > 40.0
        return WeatherOut(
            currentTemperature=temperature,
            humidity=humidity,
            windSpeed=wind_speed,
            currentRainfall=rainfall,
            rainfallLast12Months=rainfall_last_12,
            recentStormOrFlood=recent_storm_or_flood,
            aqi=aqi,
        )
    except Exception:
        return fallback


@app.post("/predict-all", response_model=ModelOutputs)
def predict_all(city: CityInput) -> ModelOutputs:
    w = city.weather
    t = city.transportation
    a = city.agriculture
    e = city.energy
    p = city.publicServices

    rainfall_last_12 = float(sum(w.rainfallLast12Months))
    recent_storm_flag = 1 if w.recentStormOrFlood else 0

    congested_routes = set(t.busRoutesCongested)
    congested_west = 1 if "west" in congested_routes else 0
    congested_south = 1 if "south" in congested_routes else 0
    congested_east = 1 if "east" in congested_routes else 0
    congested_north = 1 if "north" in congested_routes else 0
    congested_central = 1 if "central" in congested_routes else 0

    water_features = pd.DataFrame(
        [
            {
                "rainfall_last_12_months_mm": rainfall_last_12,
                "rainfall_mm": w.currentRainfall,
                "recent_storm_or_flood": recent_storm_flag,
                "water_supply_level": p.waterSupplyLevel,
            }
        ]
    )
    if water_model is not None:
        water_shortage_level = float(water_model.predict(water_features)[0])
    else:
        water_shortage_level = 15.0

    traffic_features = pd.DataFrame(
        [
            {
                "wind_speed_kmh": w.windSpeed,
                "rainfall_mm": w.currentRainfall,
                "recent_storm_or_flood": recent_storm_flag,
                "aqi": w.aqi,
                "buses_operating": t.busesOperating,
                "avg_vehicles_per_hour": t.avgVehiclesPerHour,
                "peak_hour_multiplier": t.peakHourMultiplier,
                "congested_west": congested_west,
                "congested_south": congested_south,
                "congested_east": congested_east,
                "congested_north": congested_north,
                "congested_central": congested_central,
                "roads_needing_repair": p.roadsNeedingRepair,
            }
        ]
    )
    if traffic_model is not None:
        traffic_congestion_level = float(traffic_model.predict(traffic_features)[0])
    else:
        traffic_congestion_level = 40.0

    food_features = pd.DataFrame(
        [
            {
                "rainfall_mm": w.currentRainfall,
                "rainfall_last_12_months_mm": rainfall_last_12,
                "crop_yield_last_year": a.cropYieldLastYear,
                "current_stock_level": a.currentStockLevel,
                "supply_chain_efficiency": a.supplyChainEfficiency,
                "import_dependency": a.importDependency,
                "recent_storm_or_flood": recent_storm_flag,
            }
        ]
    )
    if food_model is not None:
        food_price_change_percent = float(food_model.predict(food_features)[0])
    else:
        food_price_change_percent = 0.0

    energy_features = pd.DataFrame(
        [
            {
                "current_usage_mw": e.currentUsageMW,
                "avg_usage_last_year": e.avgUsageLastYear,
                "peak_demand_mw": e.peakDemandMW,
                "grid_stability": e.gridStability,
                "renewable_percentage": e.renewablePercentage,
                "recent_storm_or_flood": recent_storm_flag,
            }
        ]
    )
    if energy_model is not None:
        energy_price_change_percent = float(energy_model.predict(energy_features)[0])
    else:
        energy_price_change_percent = 0.0

    public_features = pd.DataFrame(
        [
            {
                "roads_needing_repair": p.roadsNeedingRepair,
                "water_supply_level": p.waterSupplyLevel,
                "sewer_system_health": p.sewerSystemHealth,
                "emergency_response_time": p.emergencyResponseTime,
                "pending_maintenance_tasks": p.pendingMaintenanceTasks,
                "rainfall_mm": w.currentRainfall,
                "rainfall_last_12_months_mm": rainfall_last_12,
                "aqi": w.aqi,
            }
        ]
    )
    if public_model is not None:
        public_cleanup_needed_pred = public_model.predict(public_features)[0]
        public_cleanup_needed = bool(int(public_cleanup_needed_pred))
    else:
        public_cleanup_needed = False

    health_features = pd.DataFrame(
        [
            {
                "temperature_c": w.currentTemperature,
                "humidity": w.humidity,
                "wind_speed_kmh": w.windSpeed,
                "rainfall_mm": w.currentRainfall,
                "rainfall_last_12_months_mm": rainfall_last_12,
                "aqi": w.aqi,
                "congestion_level": traffic_congestion_level,
            }
        ]
    )
    if health_model is not None:
        health_status_pred = int(health_model.predict(health_features)[0])
    else:
        health_status_pred = 0
    if health_status_pred < 0:
        health_status_pred = 0
    if health_status_pred > 3:
        health_status_pred = 3

    return ModelOutputs(
        waterShortageLevel=water_shortage_level,
        trafficCongestionLevel=traffic_congestion_level,
        foodPriceChangePercent=food_price_change_percent,
        energyPriceChangePercent=energy_price_change_percent,
        publicCleanupNeeded=public_cleanup_needed,
        healthStatus=health_status_pred,
    )
