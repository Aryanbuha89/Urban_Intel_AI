# Urban Intel AI 🌆🤖

**Advanced Smart City Management Dashboard with Recursive AI Intelligence**

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Aryanbuha89/Hell_Boys)

**Urban Intel AI** is a next-generation administrative platform designed for smart city governance. Unlike traditional dashboards that only *display* data, this system *understands* the causal relationships between urban sectors. It uses a **Cascading AI Model** to predict how a crisis in one area (e.g., severe weather) triggers risks in others (e.g., traffic congestion, energy grid instability, and public health).

> **New Feature:** We have integrated **Mistral AI 7B** to function as a "Policy Generative Engine", taking inputs from 6 specialized base models to generate human-readable, strategic policy recommendations.

---

## 🚀 Key Features

### 🧠 1. Evidence of "Cascading Intelligence"
The core innovation is the modeling of chain reactions.
*   **Logic:** `Rain > 50mm` → `Traffic Efficiency Drops` → `Pollution Rises` → `Health Risk Increases`.
*   **Implementation:** Parallel specialized ML models run in parallel, and their outputs are fed into a meta-model logic layer.

### 🤖 2. Mistral AI 7B Policy Engine
We use an LLM (Mistral 7B) to synthesize complex numerical predictions into actionable government directives.
*   **Input:** Predictions from Weather, Water, Traffic, Food, Energy, and Health models.
*   **Output:** Strategic policy text (e.g., *"Deploy flood barriers in Sector 4 and reroute heavy traffic via Highway 9 to prevent gridlock."*)

### 🧪 3. "What-If" Scenario Simulation Engine
Judges can interactively test the model's robustness.
*   *Action:* Manually change rainfall data or cut the energy budget in the Admin Panel.
*   *Result:* Watch the **Traffic Congestion** and **Health Risk** predictions update in real-time.

### 4. Government-Standard Reporting
Generates professional PDF reports with "Official" styling, automatically stripping invalid characters and formatting data for high-level decision making.

### 5. Multi-Layer Architecture
*   **Layer 1 (Data Ingestion):** OpenWeather API & Mock Municipal Sensors.
*   **Layer 2 (Base Models):** 6 ML Models (Python/Scikit-Learn).
*   **Layer 3 (Generative AI):** Mistral 7B for textual recommendations.
*   **Layer 4 (Frontend):** React Dashboard for visualization.

---

## 🛠️ Complete Tech Stack

### Frontend & UI
*   **Framework**: React 18 (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, shadcn/ui
*   **Icons**: Lucide React
*   **Animations**: Framer Motion
*   **Data Visualization**: Recharts

### Backend & AI
*   **Authentication**: Supabase Auth
*   **Database**: Supabase (PostgreSQL, Row Level Security)
*   **Core Logic**: Python (FastAPI) (for ML Layer)
*   **ML Libraries**: Scikit-Learn, XGBoost, Pandas
*   **LLM**: Mistral AI 7B (via API)

### Quality Assurance
*   **Testing**: Vitest
*   **Linting**: ESLint
*   **Validation**: Zod (Frontend), Pydantic (Backend)

---

## ⚙️ Setup & Installation

Follow these steps to deploy the project locally on your machine.

### 1. Clone the Repository
```bash
git clone <https://github.com/Aryanbuha89/Hell_Boys>
cd Urban_Intel_AI
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Setup Python Backend (For ML Models)
*Ensure you have Python 3.9+ installed.*

```bash
cd ml
pip install -r requirements.txt
python api_server.py
```
*The backend API will run on `http://localhost:8000`*

### 4. Environment Configuration
Create a `.env` file in the root directory.

**`.env` Example**
```env
# Supabase Configuration (Required for Auth & DB)
VITE_SUPABASE_URL=https://iwcwsrqjhihkcoahnclm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Y3dzcnFqaGloa2NvYWhuY2xtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NzEyNzYsImV4cCI6MjA4NDI0NzI3Nn0.UaeUNg5Yw4Jwgj5-U-5xt4e72H6Gm96bBTruVvwG-yw

# Backend API (Connects React to Python ML Server)
VITE_API_BASE_URL=http://localhost:8000

# Optional: Mistral API Key (If running LLM features)
MISTRAL_API_KEY=your-mistral-key
```

### 5. Database Setup (Supabase)
Run the provided `supabase_schema.sql` in your Supabase project (SQL Editor) to create:
*   `profiles`, `prediction_logs`, `reports`, `decisions` tables.
*   Triggers and Row Level Security (RLS) policies.

### 6. Run the Frontend
```bash
npm run dev
```
The application will launch at `http://localhost:8080`.

---

## 🔐 Test Login Credentials

To test the **Admin Portal** features (Database logging, Reports):

1.  **Sign Up**: You can sign up a new user directly via the Supabase Dashboard -> Authentication -> Users.
2.  **Default Role**: The system automatically assigns the 'admin' role to new users via a database trigger.
3.  **Demo Access**:
    *   **Email**: `hack1throne@gmail.com`
    *   **Password**: `Krushit@123`

---

## 🛡️ Security & Privacy

*   **No Secrets in Repo**: All API keys and secrets are managed via `.env` files and are excluded from version control via `.gitignore`.
*   **RLS Policies**: Supabase Row Level Security is enabled to ensure only authorized Admins can publish directives.

---

## 🐛 Basic Error Handling

*   **API Failures**: If the Python backend is offline, the frontend falls back to a sophisticated "Simulation Mode" using local algorithms to ensure the demo never crashes.
*   **Form Validation**: All inputs in the "What-If" simulator are validated (e.g., Rainfall cannot be negative).
*   **Auth State**: Users are gracefully redirected to the public view if their session expires.

---

## 🏆 Hackathon Judges Note
This project was built to demonstrate **practical AI application** in governance. It moves beyond simple data viewing to provide *prescriptive* and *predictive* capabilities, utilizing a novel combination of **Classic ML (Random Forest)** for numerical accuracy and **GenAI (Mistral 7B)** for strategic communication.

**Developed by [Hell Boys Team]**
