# 🌱 FreshOS – README.md

## AI Decision Intelligence for Fresh Produce

[![Hackathon](https://img.shields.io/badge/Hackathon-MVP-orange)](https://github.com/swiftcoder0/Fruitos)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

---

## 📌 Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Business Model](#business-model)
- [Demo Flow](#demo-flow)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Problem Statement

Fresh fruits and vegetables travel through a fragmented supply chain:

```
Farm → Aggregator → Pack House → Mandi → Warehouse → Cold Storage → Distributor → Retailer → Consumer
```

**The Real Problem:**

> *"Fresh produce is perishable inventory moving through disconnected actors, while nobody continuously knows the condition, remaining commercial life, demand, logistics situation and best next action for each batch."*

- India loses **30-40% of fresh produce** annually – worth **₹1.2 Lakh Crore** ($40B+).
- Waste does **not** happen at one stage – it **accumulates** through:
  - Wrong harvest timing
  - Temperature excursions
  - Rough handling
  - Poor demand visibility
  - Bad routing decisions
  - Inappropriate storage

**Most systems detect problems. FreshOS acts while there is still time to prevent loss.**

---

## 💡 Solution

### What is FreshOS?

FreshOS is an **AI Decision Intelligence Operating Layer** for fresh produce. Every important produce lot becomes a **Digital Batch / Digital Twin** that continuously answers:

1. What produce is this?
2. What is its current condition?
3. How much useful commercial life remains?
4. Where is demand?
5. Where should this batch go?
6. Is transporting/storing it there biologically safe?
7. What revenue and waste can we expect?
8. **What is the best thing to do with this batch RIGHT NOW?**

### Core Philosophy

> *"FreshOS doesn't detect spoiled fruit – it prevents spoilage."*

---

## ✨ Features

### 🌱 Farmer Dashboard
- Register crops with commodity-based theming
- Harvest intelligence (weather + maturity)
- Market comparison (Kanpur beats Delhi)
- Transport matching (trucks by capacity/cost)
- QR code generation for each batch

### 📷 Operator Dashboard
- QR code scanning
- Quality inspection (ripeness, defects, quality index)
- Shelf-life calculation (Q10 model + temperature history)
- Batch timeline view

### 📊 Manager Control Center
- Real-time batch monitoring
- Waste risk detection
- Safety constraints (reject unsafe storage)
- **Decision Engine** – compares 5 actions:
  - HOLD
  - MARKDOWN 10%
  - MARKDOWN 25%
  - TRANSFER
  - RESCUE
- Natural language explanation (template + Gemini)
- "Show Your Work" transparency screen

### 🎨 Commodity-Based Theming
- 🥭 Mango → Amber
- 🥑 Avocado → Green
- 🍅 Tomato → Red
- 🍊 Orange → Orange
- 🍎 Apple → Red
- 🍌 Banana → Yellow
- 🫒 Guava → Lime

---

## 🛠️ Tech Stack

### Backend
| Layer | Technology |
|-------|------------|
| Framework | FastAPI |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | SQLAlchemy |
| Validation | Pydantic v2 |
| ML | PyTorch (mock for MVP) |
| QR Code | `qrcode[pil]` |
| LLM | Google Gemini (optional) |
| Deployment | Render / Railway |

### Frontend
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Charts | Recharts |
| API Client | Axios |
| Deployment | Vercel |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
│   Farmer Dashboard  │  Operator Dashboard  │  Manager UI    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  ROUTERS    │──│   LOGIC     │──│      MODELS         │ │
│  │  (APIs)     │  │  (Rules)    │  │    (Database)       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  DECISION ENGINE                                        ││
│  │  Safety → Economics → Compare → Recommend               ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATA LAYER                               │
│  SQLite / PostgreSQL  │  CSV (mock)  │  Commodity Params   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm / yarn

### 1. Clone the Repository

```bash
git clone https://github.com/swiftcoder0/Fruitos.git
cd Fruitos
```

### 2. Backend Setup

```bash
cd backened
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Run the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the frontend:

```bash
npm run dev
```

### 4. Visit the App

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/crops/` | Register new crop |
| GET | `/crops/{id}` | Get crop details |
| GET | `/markets/` | Compare markets |
| GET | `/transport/options` | Get transport options |
| POST | `/batches/` | Create batch (harvest) |
| GET | `/batches/` | List all batches |
| GET | `/batches/{id}` | Get batch details |
| POST | `/events/temperature` | Log temperature |
| POST | `/events/location` | Log location |
| GET | `/events/batch/{id}` | Get batch timeline |
| POST | `/quality/inspect` | Upload photo for quality |
| GET | `/demand/{id}` | Get demand forecast |
| GET | `/risk/{id}` | Get waste risk |
| GET | `/safety/check/{id}` | Check storage safety |
| GET | `/decisions/{id}` | **Get decision + explanation** |

---

## 💰 Business Model

### Target Customers
| Segment | Description |
|---------|-------------|
| **Farmers** | Small to large farmers |
| **Operators** | Packhouse / aggregation staff |
| **Supply Chain Managers** | Warehouse, cold storage, logistics |
| **Retailers / Buyers** | Supermarkets, mandis |
| **Juice Corners** | Small vendors needing perfect fruit |

### Revenue Model
| Model | Pricing (India) |
|-------|-----------------|
| SaaS Subscription | ₹499 – ₹2,999/month |
| Per-Batch Fee | ₹5-10/batch |
| Premium Insights | ₹5,000 – ₹50,000/year |
| White-label Licensing | ₹2L – ₹10L/year |
| API Access | ₹50,000/month |

### ROI Example

**1,000 kg Mango Batch**

| Metric | Without FreshOS | With FreshOS |
|--------|----------------|--------------|
| Net Value | ₹22,500 | ₹48,920 |
| Waste | 500 kg | 0 kg |
| Risk | High | Safe |

**2.2x return on one batch.**

---

## 🔥 Demo Flow

### 1. Farmer
- Register crop (Mango/Avocado/Tomato)
- View harvest window + weather risk
- Compare markets → Kanpur wins
- Select transport → Confirm harvest
- QR code generated

### 2. Operator
- Scan QR / enter batch ID
- Upload photo → quality analysis
- View ripeness, defects, quality index
- See remaining shelf-life

### 3. Manager
- Control Center → all batches with risk
- Click batch → Decision Engine
- Compare all actions (Hold, Markdown, Transfer, Rescue)
- Cold Store X rejected (unsafe)
- Transfer recommended + explanation
- "Show Your Work" for transparency

---

## 🚀 Deployment

### Backend (Render)
```bash
# Render Web Service
# Build Command: cd backened && pip install -r requirements.txt
# Start Command: cd backened && uvicorn app.main:app --host 0.0.0.0 --port 10000
# Environment: GEMINI_API_KEY=your_key
```

### Frontend (Vercel)
```bash
# Vercel Project
# Root Directory: frontend
# Build Command: npm run build
# Environment: NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Live URLs
- Frontend: `https://fruitos.vercel.app`
- Backend: `https://freshos-backend.onrender.com`
- API Docs: `https://freshos-backend.onrender.com/docs`

---

## 📷 Screenshots

| Page | Preview |
|------|---------|
| Landing | Role selection (Farmer/Operator/Manager) |
| Farmer Dashboard | Crop overview, harvest window, best market |
| Market Comparison | Kanpur vs Delhi vs Lucknow |
| Harvest & QR | QR code generation |
| Quality Inspection | Ripeness, defects, quality index |
| Control Center | All batches with risk indicators |
| **Decision Engine** | **Killer screen – action comparison table** |
| Show Your Work | Provenance of every number |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙏 Acknowledgments

- FastAPI, Next.js, Tailwind CSS
- Google Gemini API
- All hackathon mentors and judges
- Fresh produce farmers who inspired this project

---

## 📬 Contact

- **Team:** (Your name)
- **GitHub:** [swiftcoder0](https://github.com/swiftcoder0)
- **Project Link:** [https://github.com/swiftcoder0/Fruitos](https://github.com/swiftcoder0/Fruitos)

---

## 🌟 Key Differentiator

> *"FreshOS is NOT trying to detect spoiled fruit. FreshOS is trying to TAKE ACTION BEFORE THE FRUIT GETS SPOILED."*

---

**Built with ❤️ for Fresh Produce** 🥭🍅🥑🍊