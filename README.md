# Urban Intel AI 🌆🤖
**Advanced Smart City Management Dashboard with Recursive AI Intelligence**

**Urban Intel AI** is a next-generation administrative platform designed for smart city governance. Unlike traditional dashboards that only *display* data, this system *understands* the causal relationships between urban sectors. It uses a cascading AI model to predict how a crisis in one area (e.g., severe weather) triggers risks in others (e.g., traffic congestion, energy grid instability, and public health).

---

## 🚀 Key Features

### 🧠 1. Evidence of "Cascading Intelligence"
The core innovation of this system is its ability to model chain reactions. It doesn't just treat "Rain" and "Traffic" as separate numbers; it understands that `Rain > 50mm` **causes** `Traffic Efficiency` to drop, which **causes** `Pollution` to rise.

#### **Core Logic Snippet (TypeScript)**
*This snippet proves the system understands cause-and-effect:*
```typescript
// src/lib/mockData.ts
// This function transforms raw ML outputs into actionable insights
export const generateAllPredictionsFromBackend = (data: CityData, outputs: BackendInputs) => {
  // 1. Water Shortage Prediction
  const waterLevel = Math.round(outputs.waterShortageLevel);
  const waterSupply = {
    status: waterLevel >= 80 ? 'critical' : 'normal',
    reason: `Model-predicted shortage at ${waterLevel}% due to low rainfall`,
    confidence: 90,
  };
  // 2. Traffic Prediction (Context-Aware)
  const trafficLevel = Math.round(outputs.trafficCongestionLevel);
  const traffic = {
    congestionLevel: trafficLevel,
    // Real-time weather context is injected into the explanation
    weatherImpact: `Heavy rainfall (${data.weather.currentRainfall}mm) impacting routes.`,
    confidence: 85,
  };
  return { waterSupply, traffic, ... }; // Returns holistic city view
};
```

### 🧪 2. "What-If" Scenario Simulation Engine
Judges can interactively test the model's robustness. Change the rainfall, increase the population density, or cut the energy budget, and watch the system recalculate risks in real-time.

#### **Simulation Engine Snippet (TypeScript)**
*Demonstrates interactive scenario planning:*
```typescript
// src/pages/Admin.tsx
const runWhatIfPrediction = async () => {
  // 1. Construct the Scenario Payload from User Inputs
  const payload = {
    weather: {
      currentRainfall: Number(whatIfForm.weather.currentRainfall), // User-defined rain
      recentStormOrFlood: Boolean(whatIfForm.weather.recentStormOrFlood),
    },
    transportation: {
      totalBuses: Number(whatIfForm.transportation.totalBuses),    // User-defined transit
    },
    // ... other sectors
  };
  // 2. Send to Python/FastAPI Backend for Real-time Inference
  const response = await fetch(`${API_URL}/predict-all`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  // 3. Update UI with New Predicted Risks
  const result = await response.json();
  return {
    trafficCongestionLevel: result.trafficCongestionLevel, // See how traffic changes on the fly!
    ...
  };
};
```

### 🕸️ 3. Backend Model Orchestration
The system runs multiple specialized ML models in parallel and then runs a second-layer "meta-model" to calculate dependent risks.

#### **Orchestrator Snippet (Python Example)**
*Demonstrates multi-model serving:*
```python
# ml/api_server.py
@app.post("/predict-all")
def predict_all(input_data: CityData):
    # 1. Run independent models in parallel
    traffic_risk = traffic_model.predict(input_data.transportation)
    water_risk = water_model.predict(input_data.weather)
    
    # 2. Run dependent models (Cascading Logic)
    # Health risk depends on Water Quality + Traffic Pollution
    health_risk = health_model.predict({
        "aqi": input_data.weather.aqi,
        "traffic_congestion": traffic_risk,
        "water_quality": water_risk
    })
    
    return {
        "traffic_congestion_level": traffic_risk,
        "health_status": health_risk,
        # ...
    }
```

---

## 🛠️ Complete Tech Stack

### Frontend & UI
*   **Framework**: React 18 (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, shadcn/ui
*   **Icons**: Lucide React
*   **Animations**: Framer Motion
*   **Data Visualization**: Recharts

### Backend & Data
*   **Authentication**: Supabase Auth
*   **Database**: PostgreSQL (via Supabase)
*   **Row Level Security (RLS)**: Enabled for Admin-only access
*   **Reporting**: jsPDF (Client-side PDF generation)

### Testing & Quality
*   **Logic Testing**: Vitest
*   **Linting**: ESLint
*   **Query Management**: TanStack Query

---

## 📦 All Dependencies

### Production Dependencies
| Package | Purpose |
| :--- | :--- |
| **@supabase/supabase-js** | Authentication & Database connection |
| **recharts** | Interactive charts and graphs |
| **framer-motion** | Smooth UI transitions and animations |
| **jspdf** | Generating downloadable PDF reports |
| **lucide-react** | Modern icon set |
| **react-hook-form** | Form validation and handling |
| **zod** | Schema validation |
| **radix-ui/react-*** | Accessible UI primitives (Dialogs, Tabs, etc.) |
| **clsx, tailwind-merge** | CSS class utility management |
| **date-fns** | Date formatting and manipulation |
| **sonner** | Toast notifications |

### Development Dependencies
| Package | Purpose |
| :--- | :--- |
| **typescript** | Static typing |
| **vite** | Build tool and dev server |
| **tailwindcss** | Utility-first CSS framework |
| **eslint** | Code linting |
| **vitest** | Unit testing |

---

## ⚙️ Setup & Installation

Follow these steps to deploy the project locally on your machine.

### 1. clone the Repository
```bash
git clone <YOUR_GIT_URL>
cd Urban_Intel_AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory. You can use the example below:

**`.env` Example**
```env
# Supabase Configuration (Required for Auth & DB)
VITE_SUPABASE_URL=https://iwcwsrqjhihkcoahnclm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Y3dzcnFqaGloa2NvYWhuY2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NzEyNzYsImV4cCI6MjA4NDI0NzI3Nn0.UaeUNg5Yw4Jwgj5-U-5xt4e72H6Gm96bBTruVvwG-yw


# Backend API (Optional - defaults to mock mode if disconnected)
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Database Setup (Supabase)
Run the provided `supabase_schema.sql` in your Supabase project to generate:
1.  **Profiles Table**: Stores admin user roles.
2.  **Prediction Logs**: Archives every AI prediction run.
3.  **Reports Table**: Stores metadata for generated PDFs.
4.  **Decisions Table**: Logs all "Approved & Published" policies.

### 5. Run the Application
```bash
npm run dev
```
The application will launch at `http://localhost:8080`.

---

## 🏆 Hackathon Judges Note
This project was built to demonstrate **practical AI application** in governance. It moves beyond simple data viewing to provide *prescriptive* and *predictive* capabilities, solving real-world complexity through interconnected models.

**Developed by [Hell Boys Team]**
