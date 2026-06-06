<div align="center">

```
 ███╗   ██╗███████╗██╗   ██╗██████╗  █████╗ ██╗     ██████╗ ██████╗ ██╗██╗   ██╗███████╗
████╗  ██║██╔════╝██║   ██║██╔══██╗██╔══██╗██║     ██╔══██╗██╔══██╗██║██║   ██║██╔════╝
██╔██╗ ██║█████╗  ██║   ██║██████╔╝███████║██║     ██║  ██║██████╔╝██║██║   ██║█████╗  
██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██╔══██║██║     ██║  ██║██╔══██╗██║╚██╗ ██╔╝██╔══╝  
██║ ╚████║███████╗╚██████╔╝██║  ██║██║  ██║███████╗██████╔╝██║  ██║██║ ╚████╔╝███████╗
╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚══════╝
```

# neuraldrive — Nigeria EV Charging Intelligence Platform

**A cloud-native, AI-powered platform that provides real-time visibility into Nigeria's electric vehicle charging infrastructure — built for drivers, fleet operators, investors, and policymakers.**

[![Build Status](https://img.shields.io/github/actions/workflow/status/Emmy1223/neuraldrive/deploy.yml?branch=main&style=flat-square&color=00E5FF&label=build)](https://github.com/Emmy1223/neuraldrive/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-B2FF59.svg?style=flat-square)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-96.9%25-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-FF6D00?style=flat-square)](https://lovable.dev)

*Submitted to the One-with-AI Hackathon · Problem Statement 01 · June 2026*

</div>

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Live Demo](#live-demo)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Cloud Infrastructure](#cloud-infrastructure)
- [AI & Forecasting](#ai--forecasting)
- [Team](#team)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

neuraldrive is Nigeria's first unified EV charging intelligence layer. It aggregates charging station data from multiple operators across Lagos, Abuja, and Port Harcourt into a single cloud-native platform — giving every stakeholder in the EV ecosystem the visibility they need to make informed decisions.

The platform answers questions that currently have no answers in the Nigerian EV space:

- Where are the charging stations?
- Which ones are functional right now?
- How long will I wait?
- Where is demand unmet?
- Where should the next station be built?

---

## The Problem

Nigeria's EV ecosystem is growing — but it is flying blind.

**For EV Drivers:**
- No single source of truth for charging station locations
- No real-time availability data
- No wait time estimates
- No way to plan a journey around charging needs

**For Fleet Operators & Charging Station Owners:**
- No network-wide visibility
- No demand forecasting to plan staffing and capacity
- No utilisation analytics to identify underperforming assets

**For Investors & Policymakers:**
- No demand heatmaps to identify where infrastructure is needed
- No data to justify capital allocation decisions
- No forecasting tools to model future infrastructure requirements

The result: inefficient infrastructure, poor EV adoption, and billions in misallocated investment.

---

## Our Solution

neuraldrive provides a **three-layer intelligence platform**:

### Layer 1 — Driver Interface
A real-time map showing every charging station in the network with live availability status, connector types, wait time estimates, and one-tap navigation.

### Layer 2 — Operator Dashboard
A network analytics dashboard showing utilisation rates, peak demand periods, revenue estimates, and station performance comparisons across the entire fleet.

### Layer 3 — Investment Intelligence
An AI-powered demand forecasting and gap analysis tool that identifies underserved zones, predicts where demand will emerge, and helps policymakers and investors make data-driven infrastructure decisions.

---

## Live Demo

> Deployment in progress — link will be updated here upon completion.

| Environment | URL | Status |
|---|---|---|
| Production | `https://neuraldrive.vercel.app` | 🔄 Deploying |
| Staging | `https://neuraldrive-staging.vercel.app` | 🔄 Deploying |

---

## Features

### Real-Time Charging Map
- Interactive map centred on Nigerian cities (Lagos, Abuja, Port Harcourt)
- Live station markers colour-coded by status: green (available), amber (busy), red (offline)
- Station detail popup: operator name, connector types (AC/DC/CCS/CHAdeMO), slots available, estimated wait time
- Search by address or area with automatic map pan and zoom
- Filter by connector type, operator, and availability

### Driver Dashboard
- Stations sorted by distance from the user's current GPS location
- Battery level input — system filters stations by minimum charge speed required
- Estimated wait time with visual indicator
- One-tap navigation button (opens Google Maps / Apple Maps with destination pre-filled)
- Favourite stations — save frequently visited locations

### Network Analytics (Operators)
- Total sessions today, this week, this month
- Average wait time across the network
- Busiest station and peak hour identification
- Utilisation bar chart: sessions per station per day (last 7 days)
- Demand heatmap overlay on the main map
- Revenue estimation based on session count and average kWh consumed
- Hourly demand trend line chart

### Investment Intelligence (Investors & Policymakers)
- Demand gap analysis: zones where demand-per-station exceeds 1.5x the network average
- Underserved area markers — GeoJSON overlay highlighting where new stations are needed most
- 7-day demand forecast per station powered by time-series AI model
- Population density correlation layer
- Commercial activity index overlay
- Exportable reports (CSV / PDF) stored on AWS S3

### Real-Time Updates
- Live station status updates pushed via WebSocket — no page refresh needed
- Station markers update colour in real time as availability changes
- Network-wide event feed showing recent activity

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│                                                                     │
│   React + TypeScript (Vite)  ←→  Mapbox GL JS  ←→  Recharts        │
│   TanStack Router  ←→  TanStack Query  ←→  Tailwind CSS             │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTPS / WebSocket
┌───────────────────────────▼─────────────────────────────────────────┐
│                          API LAYER                                  │
│                                                                     │
│   Node.js + Express REST API  ←→  Socket.io (real-time)             │
│   JWT Authentication  ←→  Redis Cache (30s TTL)                     │
└──────────┬────────────────────────────────┬────────────────────────-┘
           │                                │
┌──────────▼──────────┐          ┌──────────▼──────────┐
│    DATA LAYER       │          │    CLOUD LAYER       │
│                     │          │                      │
│  PostgreSQL (RDS)   │          │  AWS S3 (reports)    │
│  Prisma ORM         │          │  AWS Lambda          │
│  Redis (ElastiCache)│          │  (demand forecaster) │
│                     │          │  AWS CloudWatch      │
└─────────────────────┘          │  (monitoring)        │
                                 │  AWS IAM (security)  │
                                 └──────────────────────┘
                                          │
                                 ┌────────▼────────┐
                                 │   AI LAYER      │
                                 │                 │
                                 │  Python FastAPI │
                                 │  Prophet Model  │
                                 │  Scikit-learn   │
                                 │  Pandas/NumPy   │
                                 └─────────────────┘
```

---

## Tech Stack

### Frontend
| Tool | Version | Purpose |
|---|---|---|
| React | 18.x | UI component framework |
| TypeScript | 5.x | Type-safe JavaScript |
| Vite | 7.x | Build tool and dev server |
| TanStack Router | Latest | File-based routing with SSR support |
| TanStack Query | Latest | Server state management and caching |
| Tailwind CSS | 3.x | Utility-first CSS framework |
| Mapbox GL JS | 3.x | Interactive map rendering |
| Recharts | 2.x | Chart and graph components |
| Framer Motion | 11.x | UI animations and transitions |
| Axios | 1.x | HTTP client for API requests |
| Lucide React | Latest | Icon library |
| shadcn/ui | Latest | Accessible UI component library |
| Lovable | Latest | AI-powered frontend scaffolding |

### Backend
| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20.x LTS | JavaScript runtime |
| Express | 4.x | REST API framework |
| Prisma | 5.x | ORM and database migrations |
| PostgreSQL | 15.x | Primary relational database |
| Redis | 7.x | In-memory cache for real-time data |
| Socket.io | 4.x | WebSocket server for live updates |
| JSON Web Token | 9.x | Authentication and authorization |
| bcryptjs | 2.x | Password hashing |
| Faker.js | 8.x | Mock data generation for demo |
| Zod | 3.x | Request validation and schema parsing |
| Cors | 2.x | Cross-origin resource sharing |
| Dotenv | 16.x | Environment variable management |

### Cloud Infrastructure (AWS)
| Service | Purpose |
|---|---|
| AWS S3 | Static asset storage and analytics report downloads |
| AWS CloudFront | CDN for frontend delivery with HTTPS |
| AWS Lambda | Serverless demand forecasting job (runs hourly) |
| AWS API Gateway | HTTP endpoint for Lambda forecast function |
| AWS RDS (PostgreSQL) | Managed production database with automated backups |
| AWS ElastiCache (Redis) | Managed Redis for production caching |
| AWS CloudWatch | Logs, metrics, dashboards, and alerting |
| AWS IAM | Identity and access management, least-privilege roles |
| AWS Amplify | Alternative SSR-compatible hosting |
| GitHub Actions | CI/CD pipeline — auto build and deploy on push to main |

### AI & Data Science
| Tool | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Core language for data and ML work |
| FastAPI | 0.110.x | Serve ML model as REST endpoint |
| Prophet (Meta) | 1.1.x | Time-series demand forecasting |
| Scikit-learn | 1.4.x | Random Forest classifier for busy/not-busy prediction |
| Pandas | 2.x | Data manipulation and aggregation |
| NumPy | 1.x | Numerical operations |
| Matplotlib | 3.x | Model validation charts |
| Joblib | 1.x | Model serialisation and loading |
| Google Colab | N/A | Cloud notebook for model development |
| Jupyter Notebook | 7.x | Local model prototyping |

### Developer Tools
| Tool | Purpose |
|---|---|
| Git | Version control |
| GitHub | Remote repository and collaboration |
| Postman | API testing and documentation |
| Thunder Client | In-editor API testing (VS Code extension) |
| ESLint | Code linting and quality enforcement |
| Prettier | Code formatting |
| VS Code | Primary code editor |
| Bun | Fast JavaScript package manager (Lovable default) |
| npm | Fallback package manager |
| UptimeRobot | Free uptime monitoring for frontend and backend URLs |

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js 20.x or higher — https://nodejs.org
- npm 9.x or higher (comes with Node.js)
- Git — https://git-scm.com
- PostgreSQL 15.x (local) or a Supabase account — https://supabase.com
- Redis (local) or an Upstash account — https://upstash.com
- AWS CLI v2 — https://aws.amazon.com/cli
- Python 3.11+ (for AI module only) — https://python.org

### Clone the Repository

```bash
git clone https://github.com/Emmy1223/neuraldrive.git
cd neuraldrive
```

### Frontend Setup

```bash
# Navigate to the frontend directory
cd NeuralDrive

# Install dependencies
npm install --legacy-peer-deps

# Copy environment variables
cp .env.example .env

# Fill in your environment variables (see Environment Variables section)
# Then start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev --name init

# Seed mock data (generates 50 stations + 10,000 sessions)
node seed.js

# Start the development server
npm run dev
```

The API will be available at `http://localhost:3001`

### AI Module Setup

```bash
# Navigate to AI directory
cd ai

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train the forecasting model
python train.py

# Start the FastAPI server
uvicorn main:app --reload --port 8000
```

The forecast API will be available at `http://localhost:8000`

---

## Environment Variables

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:3001
VITE_MAPBOX_TOKEN=your_mapbox_public_token
VITE_SOCKET_URL=http://localhost:3001
```

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/neuraldrive
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key
PORT=3001
NODE_ENV=development
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=neuraldrive-platform
AI_FORECAST_URL=http://localhost:8000
```

---

## Project Structure

```
neuraldrive/
│
├── NeuralDrive/                  # Frontend application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── map/              # Mapbox map components
│   │   │   ├── dashboard/        # Analytics dashboard components
│   │   │   ├── ui/               # shadcn/ui base components
│   │   │   └── shared/           # Shared layout components
│   │   ├── routes/               # TanStack Router file-based routes
│   │   │   ├── index.tsx         # Home / map view
│   │   │   ├── dashboard.tsx     # Operator analytics dashboard
│   │   │   ├── insights.tsx      # Investment intelligence view
│   │   │   └── station.$id.tsx   # Individual station detail page
│   │   ├── lib/                  # Utility functions and helpers
│   │   ├── hooks/                # Custom React hooks
│   │   ├── types/                # TypeScript type definitions
│   │   └── api/                  # Axios API client functions
│   ├── public/                   # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                      # Express REST API
│   ├── src/
│   │   ├── routes/               # API route handlers
│   │   │   ├── stations.js       # GET /api/stations, GET /api/stations/:id
│   │   │   ├── sessions.js       # POST /api/sessions
│   │   │   └── analytics.js     # GET /api/analytics/*
│   │   ├── middleware/           # Auth, error handling, rate limiting
│   │   ├── services/             # Business logic layer
│   │   └── utils/                # Helper functions
│   ├── prisma/
│   │   ├── schema.prisma         # Database models
│   │   └── migrations/           # Migration history
│   ├── seed.js                   # Mock data generator
│   └── package.json
│
├── ai/                           # Python AI/ML module
│   ├── train.py                  # Model training script
│   ├── main.py                   # FastAPI server
│   ├── model.pkl                 # Serialised trained model
│   ├── data/                     # Training data exports
│   └── requirements.txt
│
├── infrastructure/               # Cloud infrastructure config
│   ├── terraform/                # IaC (optional)
│   └── lambda/                   # AWS Lambda forecast job
│
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions CI/CD pipeline
│
└── README.md
```

---

## API Reference

### Stations

#### Get All Stations
```
GET /api/stations
```
Returns all charging stations with current availability status.

**Response:**
```json
[
  {
    "id": "clx1234abcd",
    "name": "Lekki Phase 1 Charging Hub",
    "operator": "GridLink Nigeria",
    "lat": 6.4281,
    "lng": 3.4219,
    "status": "available",
    "slotsTotal": 8,
    "slotsAvailable": 5,
    "connectorTypes": ["AC Type 2", "DC CCS", "CHAdeMO"],
    "estimatedWaitMinutes": 0,
    "powerKw": 150
  }
]
```

#### Get Single Station
```
GET /api/stations/:id
```
Returns station detail with last 10 charging sessions.

#### Update Station Status (Operator only)
```
PATCH /api/stations/:id/status
Authorization: Bearer <token>
```

### Sessions

#### Log a Charging Session
```
POST /api/sessions
Authorization: Bearer <token>
```
```json
{
  "stationId": "clx1234abcd",
  "energyKwh": 45.2,
  "durationMinutes": 38
}
```

### Analytics

#### Demand Heatmap Data
```
GET /api/analytics/heatmap
```
Returns lat/lng + weight values for Mapbox heatmap layer.

#### Hourly Demand Trends
```
GET /api/analytics/demand?period=7d
```
Returns hourly session counts grouped by station for the last N days.

#### Network KPIs
```
GET /api/analytics/kpis
```
Returns total sessions today, avg wait time, busiest station, revenue estimate.

### Forecasting (AI Module)

#### Predict Station Demand
```
GET /forecast?stationId=clx1234abcd&hoursAhead=24
```
```json
{
  "stationId": "clx1234abcd",
  "predictions": [
    { "hour": "2026-06-07T08:00:00Z", "predictedSessions": 12, "confidence": 0.87 },
    { "hour": "2026-06-07T09:00:00Z", "predictedSessions": 18, "confidence": 0.84 }
  ]
}
```

---

## Cloud Infrastructure

### AWS Services Used

**S3 Bucket (`neuraldrive-platform`)**
- Stores exported analytics reports (CSV and PDF)
- Static website hosting for frontend (fallback)
- Pre-signed URLs generated by the backend for secure downloads
- Lifecycle policy: auto-delete reports older than 90 days

**CloudFront Distribution**
- CDN layer in front of S3
- HTTPS enforcement with redirect from HTTP
- Custom error page routing to `index.html` for SPA navigation
- Edge caching for static assets (JS, CSS, images)

**Lambda Function (`demand-forecaster`)**
- Node.js 20.x runtime
- Triggered every hour by CloudWatch Events rule
- Queries session data, runs statistical demand forecast
- Caches results in Redis with 1-hour TTL
- Exposed via API Gateway as `GET /forecast`

**CloudWatch**
- Custom dashboard: API response time, Lambda invocations, DB connections, error rate
- Alarm: fires if API 5xx error rate exceeds 5% — notifies team via SNS email
- Log groups for backend API and Lambda function

**IAM**
- Separate IAM user `ev-deployer` for CI/CD with scoped S3 + CloudFront permissions only
- No root account credentials used anywhere in the pipeline
- GitHub Actions secrets store all credentials — never committed to the repository

### CI/CD Pipeline (GitHub Actions)

Every push to `main` triggers:

1. **Install** — `npm install --legacy-peer-deps`
2. **Lint** — `npm run lint`
3. **Build** — `npm run build`
4. **Deploy Frontend** — `aws s3 sync ./dist s3://neuraldrive-platform --delete`
5. **Invalidate CDN** — `aws cloudfront create-invalidation --paths "/*"`
6. **Redeploy Backend** — triggers Railway webhook

---

## AI & Forecasting

### Demand Forecasting Model

The platform uses **Meta's Prophet** library for time-series forecasting of charging demand at each station.

**Training Data:**
- Historical session records (timestamp, station ID, duration, energy consumed)
- Engineered features: hour of day, day of week, is_weekend, public holiday flag, station zone

**Model:**
- Prophet decomposes demand into trend + weekly seasonality + daily seasonality
- Separate model trained per station zone (Lagos Island, Lagos Mainland, Abuja, Port Harcourt)
- 7-day forecast horizon with hourly granularity
- Mean Absolute Percentage Error (MAPE) on test set: ~12%

**Demand Gap Analysis:**
- Stations clustered into geographic zones using KMeans (k=8)
- Zones where demand-per-station exceeds 1.5x network average are flagged as underserved
- Results exported as GeoJSON and rendered as a separate map layer
- Directly answers the policymaker question: "where should we build next?"

**Binary Classifier (Scikit-learn Random Forest):**
- Predicts: "will this station be busy in the next hour?" (binary)
- Features: current hour, day of week, current utilisation rate, nearby station load
- Used to power the amber/red pre-warning on station markers before they actually fill up

---

## Team

| Name | Role | GitHub |
|---|---|---|
| Emmanuel Faleti | Cloud & Infrastructure Engineer | (https://github.com/Emmy1223) |
| Anointed Kehinde | Frontend Developer | — 

## Roadmap

### Hackathon MVP (Current)
- [x] Project scaffolded and exported from Lovable
- [x] Pushed to GitHub repository
- [x] AWS credentials configured and verified
- [x] S3 bucket created with public access policy
- [x] Static website hosting enabled
- [ ] Frontend deployed to Vercel / AWS Amplify
- [ ] Backend API deployed to Railway
- [ ] Mock data seeded (50 stations, 10,000 sessions)
- [ ] Real-time Socket.io station updates live
- [ ] AI forecast endpoint deployed

### Post-Hackathon
- [ ] Integrate real operator APIs (GridLink, Mojec, etc.)
- [ ] Mobile app (React Native)
- [ ] Operator onboarding portal
- [ ] Payment integration for session booking
- [ ] Multi-language support (Yoruba, Hausa, Igbo)
- [ ] Offline-capable PWA for low-connectivity areas
- [ ] National EV infrastructure report — automated monthly PDF

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request against `main`

Please ensure your code passes linting (`npm run lint`) before submitting a PR.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built for the **One-with-AI Hackathon** · June 2026 · Nigeria

*Powering the future of electric mobility in Africa, one data point at a time.*

</div>
