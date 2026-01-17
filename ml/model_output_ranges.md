# Model Output Ranges

This document summarizes practical input and output ranges for the six ML models used by the Urban Intel AI What If interface. The goal is to give judges and developers a clear reference for valid input ranges and how to interpret model outputs.

All ranges below reflect the synthetic data generators and the current UI constraints.

## 1. Water Shortage Model

**Inputs (from weather and public services):**
- Rainfall last 12 months (mm total): 0–3000
- Current rainfall (mm): 0–200
- Recent storm or flood: 0 (no) or 1 (yes)
- Water supply level (%): 20–100

**Output:**
- `waterShortageLevel`: 0–100 (% shortage risk)
  - 0–25: Low shortage risk
  - 25–50: Moderate shortage risk
  - 50–75: High shortage risk
  - 75–100: Critical shortage risk

## 2. Traffic Congestion Model

**Inputs (from weather, transportation, public services):**
- Wind speed (km/h): 0–60
- Current rainfall (mm): 0–200
- Recent storm or flood: 0 or 1
- Air Quality Index (AQI): 0–500
- Buses operating: 120–280
- Average vehicles per hour: 3000–9000
- Peak hour multiplier: 1.2–2.2
- Congested routes flags (west/south/east/north/central): 0 or 1
- Roads needing repair: 5–50

**Output:**
- `trafficCongestionLevel`: 0–100 (% congestion level)
  - 0–25: Free flow
  - 25–50: Moderate congestion
  - 50–75: Heavy congestion
  - 75–100: Severe gridlock

## 3. Food Price Model

**Inputs (from weather, agriculture, public services):**
- Current rainfall (mm): 0–200
- Rainfall last 12 months (mm total): 0–3000
- Crop yield last year (% of normal): 50–110
- Current stock level (% of reserves): 20–100
- Supply chain efficiency (%): 50–100
- Import dependency (%): 5–40
- Recent storm or flood: 0 or 1

**Output:**
- `foodPriceChangePercent`: typically around −30 to +30 (% change in food prices)
  - < −10: Significant price decrease
  - −10 to 10: Stable prices
  - 10 to 20: Noticeable increase
  - > 20: Strong price surge

## 4. Energy Price Model

**Inputs (from energy and weather):**
- Current usage (MW): 600–1300
- Average usage last year (MW): 700–1100
- Peak demand (MW): 900–1500
- Grid stability (%): 75–100
- Renewable percentage (%): 10–40
- Recent storm or flood: 0 or 1

**Output:**
- `energyPriceChangePercent`: typically around −20 to +20 (% change in tariffs)
  - < −5: Tariff relief
  - −5 to 5: Stable tariffs
  - 5 to 15: Moderate increase
  - > 15: Strong increase

## 5. Public Cleanup Model

**Inputs (from weather and public services):**
- Recent storm or flood: 0 or 1
- Roads needing repair: 5–50
- Water supply level (%): 20–100
- Sewer system health (%): 60–100
- Emergency response time (minutes): 5–25
- Pending maintenance tasks: 10–70

**Output:**
- `publicCleanupNeeded` (risk percentage): 0–100 (% likelihood that major cleanup is needed)
  - 0–25: Low cleanup risk
  - 25–50: Moderate cleanup risk
  - 50–75: High cleanup risk
  - 75–100: Critical cleanup risk

## 6. Health Status Model

**Inputs (from weather and public services):**
- Current temperature (°C): −10 to 50
- Current rainfall (mm): 0–200
- Air Quality Index (AQI): 0–500
- Recent storm or flood: 0 or 1
- Sewer system health (%): 60–100
- Emergency response time (minutes): 5–25

**Output:**
- `healthStatus` (risk percentage): 0–100 (% risk of critical population health impact)
  - 0–25: Low health risk
  - 25–50: Moderate health risk
  - 50–75: High health risk
  - 75–100: Critical health risk

