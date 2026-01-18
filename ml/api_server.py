from __future__ import annotations

import os
from typing import Literal

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re

from ml.weather_data_pipeline import fetch_openweather_sample


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


class WeatherIn(BaseModel):
    currentTemperature: float
    humidity: float
    windSpeed: float
    currentRainfall: float
    rainfallLast12Months: list[float]
    recentStormOrFlood: bool
    aqi: float


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
    publicCleanupNeeded: float
    healthStatus: float


class LlmRecommendationsIn(BaseModel):
    waterShortageLevel: float
    trafficCongestionLevel: float
    foodPriceChangePercent: float
    energyPriceChangePercent: float
    publicCleanupNeeded: float
    healthStatus: float


class LlmRecommendationsOut(BaseModel):
    recommendations: str


app = FastAPI()

origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
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
                "recent_storm_or_flood": recent_storm_flag,
            }
        ]
    )
    public_feature_order = [
        "roads_needing_repair",
        "water_supply_level",
        "sewer_system_health",
        "emergency_response_time",
        "pending_maintenance_tasks",
        "recent_storm_or_flood",
    ]
    public_features = public_features[public_feature_order]
    if public_model is not None:
        public_proba = public_model.predict_proba(public_features)[0]
        classes = list(public_model.classes_)
        if 1 in classes:
            idx = classes.index(1)
            public_cleanup_needed = float(public_proba[idx] * 100.0)
        else:
            public_cleanup_needed = float(public_proba.max() * 100.0)
    else:
        public_cleanup_needed = 0.0

    health_features = pd.DataFrame(
        [
            {
                "temperature_c": w.currentTemperature,
                "rainfall_mm": w.currentRainfall,
                "aqi": w.aqi,
                "recent_storm_or_flood": recent_storm_flag,
                "sewer_system_health": p.sewerSystemHealth,
                "emergency_response_time": p.emergencyResponseTime,
            }
        ]
    )
    if health_model is not None:
        health_class = int(health_model.predict(health_features)[0])
        if health_class <= 0:
            health_status_pred = 0.0
        elif health_class == 1:
            health_status_pred = 33.0
        elif health_class == 2:
            health_status_pred = 66.0
        else:
            health_status_pred = 100.0
    else:
        health_status_pred = 0.0

    return ModelOutputs(
        waterShortageLevel=water_shortage_level,
        trafficCongestionLevel=traffic_congestion_level,
        foodPriceChangePercent=food_price_change_percent,
        energyPriceChangePercent=energy_price_change_percent,
        publicCleanupNeeded=public_cleanup_needed,
        healthStatus=health_status_pred,
    )








def _build_llm_prompt(inputs: LlmRecommendationsIn) -> list[dict[str, str]]:
    # 1. Identify critical risks
    critical_contexts = []
    if inputs.healthStatus > 50:
         critical_contexts.append(f"Air Quality is HAZARDOUS")
    if inputs.waterShortageLevel > 50:
        critical_contexts.append(f"Water Shortage is SEVERE")
    if inputs.publicCleanupNeeded > 50:
         critical_contexts.append(f"Sanitation is POOR")
    if inputs.trafficCongestionLevel > 50:
        critical_contexts.append(f"Traffic is CRITICAL")
    
    # Fallback
    if not critical_contexts:
        critical_contexts.append("Conditions are stable")

    context_str = ", ".join(critical_contexts)

    system_msg = (
        "You are an Emergency Broadcast System. Issue EXACTLY 3 urgent public advisories based on the provided status.\n"
        "Prioritize risks: Health > Water > Food > Traffic.\n"
        "Do not output more than 5 lines.\n\n"
        "Example Input: Status: Air Quality is HAZARDOUS, Water Shortage is SEVERE, Food Price Increase is SEVERE, Traffic is CRITICAL\n"
        "Example Output:\n"
        "- HEALTH EMERGENCY: Air quality is toxic; schools closed and N95 masks mandatory.\n"
        "- WATER RATIONING: Supply cut to 2 hours daily; water tanker schedule activated.\n"
        "- FOOD PRICE INCREASE: Food prices have surged by 20%; rationing implemented.\n"
        "- TRAVEL ADVISORY: Downtown gridlocked due to smog visibility; avoid travel.\n\n"
        "Example Input: Status: Conditions are stable\n"
        "Example Output:\n"
        "- MONITORING: City systems functioning within normal parameters.\n"
        "- ADVISORY: Continue standard conservation practices.\n"
        "- TRAFFIC: Normal flow reported on main arteries."
    )
    user_msg = (
        f"Status: {context_str}\n"
        "Output 3 bullet points now:"
    )
    return [
        {"role": "system", "content": system_msg},
        {"role": "user", "content": user_msg}
    ]


LOCAL_LLM_MODEL_ID = os.getenv("LOCAL_LLM_MODEL_ID", "TinyLlama/TinyLlama-1.1B-Chat-v1.0")

_local_llm_model = None
_local_llm_tokenizer = None
_local_llm_error: str | None = None


def _ensure_local_llm_loaded() -> bool:
    global _local_llm_model, _local_llm_tokenizer, _local_llm_error
    print("DEBUG: _ensure_local_llm_loaded called.")
    if _local_llm_model is not None and _local_llm_tokenizer is not None:
        return True
    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
    except Exception as exc:
        print(f"DEBUG: Import failed: {exc}")
        _local_llm_error = str(exc)
        return False
    model_id = LOCAL_LLM_MODEL_ID
    print(f"DEBUG: Loading model {model_id}...")
    try:
        tokenizer = AutoTokenizer.from_pretrained(model_id)
        if torch.cuda.is_available():
            print("DEBUG: CUDA available, loading to CUDA explicitly")
            model = AutoModelForCausalLM.from_pretrained(
                model_id,
                torch_dtype=torch.float16,
            ).to("cuda")
        else:
            print("DEBUG: Loading on CPU")
            model = AutoModelForCausalLM.from_pretrained(model_id)
    except Exception as exc:
        print(f"DEBUG: Model fail to load: {exc}")
        import traceback
        traceback.print_exc()
        _local_llm_error = str(exc)
        return False
    _local_llm_model = model
    _local_llm_tokenizer = tokenizer
    print("DEBUG: Model loaded successfully.")
    return True


def _call_local_llm(messages: list[dict[str, str]] | str) -> str:
    import torch

    if not _ensure_local_llm_loaded():
        raise RuntimeError("Local LLM is not available")
    assert _local_llm_model is not None
    assert _local_llm_tokenizer is not None
    tokenizer = _local_llm_tokenizer
    model = _local_llm_model
    
    if isinstance(messages, str):
        prompt = messages
    else:
        prompt = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=1024)
    if torch.cuda.is_available():
        inputs = {k: v.to(model.device) for k, v in inputs.items()}
    output_ids = model.generate(
        **inputs,
        max_new_tokens=256,
        temperature=0.7,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id,
    )
    generated_ids = output_ids[0][inputs["input_ids"].shape[1] :]
    text = tokenizer.decode(generated_ids, skip_special_tokens=True)
    return text.strip()





def _is_valid_llm_recommendations(text: str) -> bool:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    bullet_lines = [
        line
        for line in lines
        if line.startswith(("-", "•")) or re.match(r"^\d+\.", line)
    ]
    if len(bullet_lines) < 2:
        print(f"DEBUG: Validation failed - Not enough bullets. Found {len(bullet_lines)}.")
        return False
    meta_keywords = ["bullet", "bullets", "line", "lines", "format", "example", "instruction"]
    for line in bullet_lines:
        if any(k in line.lower() for k in meta_keywords):
             print(f"DEBUG: Validation failed - Meta keyword found in line: {line}")
             return False
    return True


def _build_rule_based_recommendations(inputs: LlmRecommendationsIn) -> str:
    print("DEBUG: Using RULE-BASED fallback recommendations.")
    items: list[str] = []
    if inputs.waterShortageLevel >= 70:
        items.append(
            f"WATER EMERGENCY: With shortage risk near {inputs.waterShortageLevel:.0f}%, enforce rationing, prioritize hospitals and vulnerable settlements, and deploy leak-fixing crews within 24 hours."
        )
    elif inputs.waterShortageLevel >= 40:
        items.append(
            f"WATER CONSERVATION: With shortage risk around {inputs.waterShortageLevel:.0f}%, launch citywide conservation campaign, restrict non-essential use, and fast-track supply network inspections."
        )
    if inputs.trafficCongestionLevel >= 70:
        items.append(
            f"TRAFFIC MANAGEMENT: With congestion near {inputs.trafficCongestionLevel:.0f}%, activate dynamic signal plans, divert heavy vehicles outside peak hours, and deploy traffic marshals at hotspots."
        )
    elif inputs.trafficCongestionLevel >= 40:
        items.append(
            f"MOBILITY OPTIMIZATION: With congestion around {inputs.trafficCongestionLevel:.0f}%, promote staggered office timings, increase bus frequency on congested corridors, and improve last-mile options."
        )
    if inputs.publicCleanupNeeded >= 60:
        items.append(
            f"CITY CLEANUP DRIVE: With cleanup risk near {inputs.publicCleanupNeeded:.0f}%, schedule intensive cleanup and repair in high-risk wards, coordinate sanitation, roads, and drainage teams with a clear 7–14 day timeline."
        )
    if inputs.healthStatus <= 40:
        items.append(
            f"PUBLIC HEALTH ALERT: With health risk index near {inputs.healthStatus:.0f}, scale up clinic capacity, issue air and water quality advisories, and mobilize outreach in high-risk neighborhoods."
        )
    if inputs.energyPriceChangePercent >= 10 or inputs.energyPriceChangePercent <= -5:
        if inputs.energyPriceChangePercent >= 10:
            items.append(
                f"ENERGY STABILITY PLAN: With tariffs rising about {inputs.energyPriceChangePercent:.1f}%, announce time-of-day tariffs, incentivize large consumers to shift loads off-peak, and expand demand response programs."
            )
        else:
            items.append(
                f"ENERGY STABILITY PLAN: With tariffs falling about {abs(inputs.energyPriceChangePercent):.1f}%, lock in lower bulk procurements while protecting low-income households from volatility."
            )
    if inputs.foodPriceChangePercent >= 8:
        items.append(
            f"FOOD PRICE CONTAINMENT: With staple prices rising about {inputs.foodPriceChangePercent:.1f}%, release buffer stocks, support wholesale markets, and expand targeted subsidies for low-income households."
        )
    elif inputs.foodPriceChangePercent <= -5:
        items.append(
            f"FOOD MARKET STABILIZATION: With prices dropping about {abs(inputs.foodPriceChangePercent):.1f}%, stabilize farmer incomes through procurement and storage while keeping retail prices predictable."
        )
    if not items:
        items = [
            "COORDINATION CELL: Maintain an integrated command center linking water, transport, health, and disaster management for rapid decisions.",
            "DATA-DRIVEN MONITORING: Track key indicators daily and trigger predefined playbooks when thresholds are crossed.",
            "COMMUNITY OUTREACH: Use multilingual alerts and ward-level meetings to keep residents informed and engaged in resilience actions.",
        ]
    lines = []

    for text in items[:3]:
        lines.append(f"- {text}")
    return "\n".join(lines)



def _clean_llm_output(text: str) -> str:
    lines = text.splitlines()
    cleaned_lines = []
    for line in lines:
        l = line.strip()
        if not l:
            continue
        # STOP processing if we see prompt artifacts
        if "example input" in l.lower() or "example output" in l.lower():
            break
            
        # Remove lines that look like meta-commentary
        if l.lower().startswith(("example:", "note:", "here are", "sure", "output:", "status:")):
            continue
        # Remove lines that are just "Water Conservation:" without content
        if l.endswith(":") and len(l.split()) < 5:
            continue
            
        cleaned_lines.append(line)
        
        # STRICTLY LIMIT to 3 lines
        if len(cleaned_lines) >= 3:
            break
            
    return "\n".join(cleaned_lines)


@app.post("/llm-recommendations", response_model=LlmRecommendationsOut)
def llm_recommendations(inputs: LlmRecommendationsIn) -> LlmRecommendationsOut:
    print("DEBUG: Received LLM recommendation request.")
    prompt = _build_llm_prompt(inputs)
    try:
        text = _call_local_llm(prompt)
        print("DEBUG: Raw LLM Output start ---")
        print(text)
        print("DEBUG: Raw LLM Output end ---")
        
        # Clean the output first
        text = _clean_llm_output(text)
        print("DEBUG: Cleaned LLM Output start ---")
        print(text)
        print("DEBUG: Cleaned LLM Output end ---")

        if not isinstance(text, str) or not text.strip():
             print("DEBUG: Validation failed - Empty or non-string output.")
             text = _build_rule_based_recommendations(inputs)
        elif not _is_valid_llm_recommendations(text):
             print("DEBUG: Validation failed - _is_valid_llm_recommendations returned False.")
             text = _build_rule_based_recommendations(inputs)
        else:
             print("DEBUG: Output is VALID.")

    except Exception as e:
        print(f"DEBUG: Exception during LLM generation: {e}")
        import traceback
        traceback.print_exc()
        text = _build_rule_based_recommendations(inputs)
    return LlmRecommendationsOut(recommendations=text)


