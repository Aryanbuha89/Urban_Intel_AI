# Urban Intel AI 🌆🤖

**Advanced Smart City Management Dashboard with Recursive AI Intelligence**

[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](PASTE_YOUR_GITHUB_REPOSITORY_LINK_HERE)

> **Submission for Hackathon 2026** | **Team:** Hell Boys

---

## 📖 Project Overview

**Urban Intel AI** is a next-generation administrative platform designed for smart city governance. Unlike traditional dashboards that only *display* data, this system *understands* the causal relationships between urban sectors. It uses a cascading AI model to predict how a crisis in one area (e.g., severe weather) triggers risks in others (e.g., traffic congestion, energy grid instability, and public health).

---

## 🚀 Features

### 1. Evidence of "Cascading Intelligence"
The core innovation of this system is its ability to model chain reactions. It doesn't just treat "Rain" and "Traffic" as separate numbers; it understands that `Rain > 50mm` **causes** `Traffic Efficiency` to drop, which **causes** `Pollution` to rise.

### 2. "What-If" Scenario Simulation Engine
Judges can interactively test the model's robustness. Change the rainfall, increase the population density, or cut the energy budget, and watch the system recalculate risks in real-time.

### 3. Backend Model Orchestration
The system runs multiple specialized ML models in parallel and then runs a second-layer "meta-model" to calculate dependent risks.

### 4. Government-Standard Reporting
Generates professional PDF reports with "Official" styling, automatically stripping invalid characters and formatting data for high-level decision making.

### 5. Secure Admin Portal
Integrated with Supabase Authentication to ensure only authorized officials can access sensitive city data and approve policy changes.

---

## 🛠️ Tech Stack

*   **Frontend**: React 18 (Vite), TypeScript, Tailwind CSS, shadcn/ui
*   **Data Visualization**: Recharts, Framer Motion
*   **Backend & Auth**: Supabase (PostgreSQL, Row Level Security)
*   **PDF Generation**: jsPDF
*   **State Management**: React Context API
*   **Testing**: Vitest, ESLint

---

## ⚙️ Setup & Installation

Follow these steps to deploy the project locally on your machine.

### 1. Clone the Repository
```bash
git clone <PASTE_YOUR_GITHUB_REPOSITORY_LINK_HERE>
cd Urban_Intel_AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory.

**`.env` Example**
```env
# Supabase Configuration (Required for Auth & DB)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Backend API (Optional - defaults to mock mode if disconnected)
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Database Setup (Supabase)
Run the provided `supabase_schema.sql` in your Supabase project (SQL Editor) to create:
*   `profiles`, `prediction_logs`, `reports`, `decisions` tables.
*   Triggers and Row Level Security (RLS) policies.

### 5. Run Locally
```bash
npm run dev
```
The application will launch at `http://localhost:8080`.

---

## 🧪 Test Login Credentials

To test the **Admin Portal** features (Database logging, Reports):

1.  **Sign Up**: You can sign up a new user directly via the Supabase Dashboard -> Authentication -> Users.
2.  **Default Role**: The system automatically assigns the 'admin' role to new users via a database trigger.
3.  **Demo Access**:
    *   **Email**: `hack1throne@gmail.com`
    *   **Password**: `Krushit@123`

---

## ⚠️ Basic Error Handling

*   **Authentication Errors**: Invalid login attempts display a specific error toast notification.
*   **Network Issues**: If Supabase is unreachable, the app gracefully falls back to local mock data mode for demonstration.
*   **Form Validation**: All "What-If" inputs are validated (e.g., Rainfall cannot be negative) using Zod schemas.

---

## 🔒 Security Confirmation

*   **No Hardcoded Secrets**: All API keys and direct database credentials are stored in environment variables (`.env`), which is added to `.gitignore`.
*   **Row Level Security**: Database access is restricted to authenticated users with the 'admin' role.

---

## 👥 Contributors

**Developed by [Hell Boys Team]**
