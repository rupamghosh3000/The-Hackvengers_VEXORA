# 🚢 ExportPilot AI — From India-ready to Export-ready

> **Intelligent export readiness, compliance, document vault, and shipment execution platform tailored specifically for Indian Micro, Small & Medium Enterprises (MSMEs).**

---

## 📌 Overview

**ExportPilot AI** empowers Indian MSMEs to navigate complex international trade regulations, evaluate export readiness, verify critical shipping documents using AI, estimate landed costs and timelines, coordinate logistics, and track shipments from a single unified platform.

Whether exporting textiles to the EU, spices to Dubai, or engineering goods to the US, ExportPilot AI streamlines statutory compliance (IEC, GST, DGFT, ICEGATE) and simplifies the cross-border journey from factory floor to foreign port.

---

## ✨ Key Features

### 1. 📊 Project Dashboard & Readiness Scoring
- Create and manage export projects with product HS codes, target countries, shipping modes (Sea, Air, Road, Courier), and deal values (INR, USD, EUR).
- **Dynamic Readiness Score (0-100%)**: Automatically calculated based on business verification, destination compliance rules, document completeness, and shipment readiness.

### 2. 📄 AI-Powered Document Vault & OCR Verification
- Centralized vault for mandatory trade documents (IEC Certificate, GST Certificate, Commercial Invoice, Packing List, Certificate of Origin, Test Certificates, ICEGATE Shipping Bills, etc.).
- **Gemini 2.5 AI Analysis**: Extracts key fields (HS codes, invoice values, dates, issuing authorities), evaluates document completeness (0-100%), flags missing fields, and highlights potential compliance risks.
- **Manual Fallback & Inspection**: Seamless manual entry mode when AI inspection is unavailable or manual override is required.

### 3. 🎯 Step-by-Step Compliance Roadmap
- Actionable step-by-step preparation plan tailored to the specific product category and destination country.
- Clear priority tags (High, Medium, Low), required documents, responsible parties, and time/cost estimates for each milestone.

### 4. 💰 Cost & Timeline Estimators
- **Landed Cost Estimator**: Comprehensive breakdown of FOB product cost, packaging, ocean/air freight, marine insurance, documentation fees, destination customs duty, and port handling charges.
- **Timeline Estimator**: Preparation vs. transit days estimator with target delivery tracking and bottleneck identification.

### 5. 🛡️ Risk Radar & Compliance Engine
- Real-time identification of regulatory, documentary, operational, and financial export risks.
- Automated mitigation recommendations and compliance rule matching.

### 6. 🚢 Logistics Hub & Live Tracking
- Multi-carrier shipment booking and live tracking (Container #, Vessel Name, IMO, Seal #, ICEGATE Shipping Bill).
- Interactive milestone tracking from booking confirmation to ICEGATE LEO clearance and final delivery.

### 7. 🤖 AI Export Copilot (Multilingual)
- Conversational trade assistant powered by Gemini AI.
- Multi-lingual support (English, Hindi, Marathi) for querying DGFT policies, RoDTEP schemes, GST refunds, Incoterms (FOB, CIF, DDP), and customs requirements.

### 8. 👥 Multi-Role Portal Access
- **MSME Exporter**: End-to-end export project lifecycle management.
- **Export Consultant**: Verification of statutory compliance, document audits, and advisory services.
- **Logistics Provider**: Rate quotation, shipping documentation review, and freight tracking.
- **Admin**: System management, rule engine configuration, and audit logs.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS v4, Motion (Framer Motion v12), Lucide React |
| **Backend** | Node.js, Express.js, `tsx` (dev runtime), `esbuild` (production bundler) |
| **AI Engine** | `@google/genai` (Google GenAI SDK with Gemini 2.5 Flash) |
| **Database** | In-Memory JSON State Store with pre-seeded trade datasets |

---

## 📁 Repository Structure

```
The-Hackvengers_VEXORA/
├── server/                   # Express backend server & services
│   ├── routes/               # API endpoints (/api/projects, /api/documents, etc.)
│   ├── services/             # Core engines (Gemini AI, Readiness, Rules, Cost, Timeline)
│   └── db.ts                 # Data access layer and pre-seeded mock dataset
├── src/                      # React frontend application
│   ├── components/           # UI Views (Dashboard, DocumentVault, Copilot, Logistics, etc.)
│   ├── context/              # React Context (AuthContext)
│   ├── services/             # Frontend API client
│   ├── types.ts              # TypeScript data interfaces
│   ├── App.tsx               # Main layout and routing
│   └── main.tsx              # React entry point
├── server.ts                 # Express + Vite middleware server entry
├── vite.config.ts            # Vite configuration
├── package.json              # Project dependencies and scripts
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd The-Hackvengers_VEXORA
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to create your `.env` file:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to include your Google Gemini API Key:
   ```env
   GEMINI_API_KEY="your_actual_gemini_api_key"
   APP_URL="http://localhost:3000"
   ```
   *(Note: The platform features graceful fallback mechanisms if `GEMINI_API_KEY` is omitted).*

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Navigate to **[http://localhost:3000](http://localhost:3000)** in your web browser.

---

## 📜 Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express backend server with Vite dev middleware on port 3000 |
| `npm run build` | Builds frontend assets via Vite & bundles server using `esbuild` into `dist/` |
| `npm run start` | Executes the production server from `dist/server.cjs` |
| `npm run lint` | Performs TypeScript type-checking without emitting files (`tsc --noEmit`) |
| `npm run clean` | Cleans up the `dist` build directory |

---

## 🔐 Multi-Role Demo Accounts

You can test different user roles using the built-in role switcher or login modal:

- **MSME Exporter**: `Rajesh Sharma` (Apex Organic Spices Pvt Ltd)
- **Export Consultant**: `Priya Sundaram` (Global Trade Advisors India)
- **Logistics Provider**: `Vikram Malhotra` (Oceanic Express Logistics)
- **System Admin**: `Admin User` (ExportPilot Compliance Team)

---

## 📄 License

This project is developed for hackathon/demonstration purposes under **The Hackvengers (VEXORA)**.
