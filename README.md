# Urban Intel AI 🌆🤖

**Advanced Smart City Management Dashboard with Recursive AI Intelligence**

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Aryanbuha89/Hell_Boys)

> **Contributor Note:** This repository allows access to [IEEE AUSB](https://github.com/IEEE-Ahmedabad-University-SB-Official).

---

## 📌 Project Overview & Features

**Urban Intel AI** is a next-generation administrative platform designed for smart city governance. It goes beyond simple data visualization by using **Cascading AI Models** to understand how a crisis in one sector (e.g., heavy rainfall) triggers risks in others (e.g., traffic jams, food price hikes).

### Key Features
1.  **Cascading Risk Engine**: Models chain reactions (Weather → Traffic → Supply Chain).
2.  **Crisis Response LLM**: Uses a localized **TinyLlama-1.1B** model to generate specific, actionable advisories (e.g., "Issue Mask Mandate").
3.  **"What-If" Scenario Simulator**: Admin tool to simulate inputs (e.g., "What if rainfall drops by 50%?") and see real-time AI predictions.
4.  **Public Feedback System**: Citizens can vote on directives ("Good/Bad Decision") directly from the public dashboard.
5.  **Automated PDF Reporting**: Generates official government-styled directives with one click.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI |
| **Visualization** | Recharts, Framer Motion |
| **Backend API** | Python (FastAPI) |
| **AI/ML Engine** | TinyLlama-1.1B (LLM), Scikit-Learn (Predictive), Joblib |
| **Database** | Supabase (PostgreSQL, Auth, Real-time) |
| **Tools** | jsPDF (Reporting), Lucide React (Icons) |

---

## 🚀 Setup Steps & How to Run Locally

Follow these commands to set up the project.

### 1. Clone the Repository
```bash
git clone https://github.com/Aryanbuha89/Hell_Boys.git
cd Urban_Intel_AI
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```
*Frontend runs at `http://localhost:8080`*

### 3. Backend Setup (AI Engine)
Open a new terminal.
```bash
cd ml

# Install Python dependencies (Requires Python 3.9+)
pip install -r requirements.txt

# Run the FastAPI server
python api_server.py
```
*Backend runs at `http://localhost:8000`*

---

## 🔐 Environment Variable Examples

Create a `.env` file in the root directory.

```env
# Supabase Configuration (Required for Auth & Feedback)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-semcret-anon-key-here

# Backend API (Connects React to Python ML Server)
VITE_API_BASE_URL=http://localhost:8000

# (Optional) LLM Configuration
# LOCAL_LLM_MODEL_ID=TinyLlama/TinyLlama-1.1B-Chat-v1.0
```

---

## 👤 Test Login Credentials

Use these credentials to access the **Admin Dashboard** features (Simulation, Reports, Decision Publishing).

*   **Email**: `hack1throne@gmail.com`
*   **Password**: `Krushit@123`

*(Note: Users are automatically assigned the 'admin' role upon creation via database trigger)*

---

## 🛡️ Security & Secrets Confirmation

**✅ NO SECRETS IN REPO:**
*   All sensitive API keys (Supabase keys, Model paths) are stored exclusively in `.env` files.
*   The `.env` file is included in `.gitignore` to prevent accidental commits.
*   Row Level Security (RLS) policies are enforced on the Supabase database to protect user data.

---

## 🐛 Basic Error Handling

*   **Backend Connection**: If the Python API (`api_server.py`) is offline, the dashbord enters **Simulation Mode**, using fallback algorithms to ensure the presentation flow is never interrupted.
*   **Input Validation**: The "What-If" simulator prevents invalid numerical inputs (e.g., negative rainfall).
*   **LLM Hallucinations**: The "Crisis Response" output is strictly regex-filtered to remove meta-commentary and ensure only valid advisories are displayed.

---

**Developed by Team Hell Boys**
