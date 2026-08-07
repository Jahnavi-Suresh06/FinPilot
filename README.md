# 🚀 FinPilot — AI-Powered Personal Finance Management System

<p align="center">
  <strong>A production-grade, full-stack personal finance platform with AI-driven insights, built for the Indian market.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/scikit--learn-ML-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white" alt="scikit-learn" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vercel-Frontend-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Railway-Backend-0B0D0E?style=flat-square&logo=railway&logoColor=white" alt="Railway" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Status-Live-success?style=flat-square" alt="Status" />
</p>

<p align="center">
  <a href="#-live-demo">Live Demo</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-installation--setup">Installation</a> •
  <a href="#-api-overview">API</a> •
  <a href="#-screenshots">Screenshots</a>
</p>

<p align="center">
  <a href="https://fin-pilot-ruby.vercel.app">
    <strong>🌐 Live Application</strong>
  </a>
  •
  <a href="https://github.com/Jahnavi-Suresh06/FinPilot">
    <strong>📂 Source Code</strong>
  </a>
</p>
---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Folder Structure](#-project-folder-structure)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [How to Run Locally](#-how-to-run-locally)
- [API Overview](#-api-overview)
- [AI Module Explanation](#-ai-module-explanation)
- [Database Design](#-database-design)
- [Security Features](#-security-features)
- [Deployment Details](#-deployment-details)
- [Screenshots](#-screenshots)
- [Live Demo](#-live-demo)
- [Future Enhancements](#-future-enhancements)
- [Interview Questions & Answers](#-interview-questions--answers)
- [Author](#-author)

---

## 🧭 Project Overview

**FinPilot** is a full-stack, AI-powered personal finance tracker built to feel like a real SaaS product — not a tutorial project. It lets users track income and expenses, set category-based budgets, visualize spending patterns, and receive **machine-learning-driven expense predictions** and **rule-based financial insights**, all wrapped in a clean, responsive, premium interface.

The project was built end-to-end — architecture, database design, authentication, business logic, machine learning, and deployment — with a deliberate focus on **production-grade engineering practices**: clean architecture, input validation on both client and server, ownership-scoped queries to prevent data leakage between users, database-agnostic query design, and a fully deployed, live infrastructure across three separate cloud platforms.

Every monetary value in the app is formatted in **Indian Rupees (₹)** using locale-aware Indian digit grouping (`₹1,25,000.00`), since FinPilot is purpose-built for Indian users.

---

## ✨ Key Features

### 🔐 Authentication
- Secure registration and login with **bcrypt password hashing**
- **JWT-based** stateless authentication with protected API routes
- Persistent sessions (auto-restored on page refresh)
- Change password flow requiring current-password re-verification
- Profile management (name, email updates)

### 📊 Dashboard
- Real-time summary cards — Total Income, Total Expenses, Net Balance
- Interactive **donut chart** — expense breakdown by category
- **6-month income vs. expense trend** bar chart
- Recent transactions widget
- One-click monthly **PDF report** download

### 💸 Transactions (Income & Expense Management)
- Full CRUD for income and expense entries
- Category-linked transactions with date, amount, and notes
- Server-side **pagination** and filtering (type, category, date range)
- One-click **CSV export**

### 🎯 Budget Management
- Set monthly, per-category spending limits
- Live **spend-vs-limit progress bars**, color-coded by proximity to limit
- Month-by-month navigation with automatic year rollover
- Over-budget alerts with exact overage amounts

### 🤖 AI-Powered Features
- **Expense Prediction** — linear regression model trained on a user's real spending history, forecasting next month's expenses with a transparent confidence rating
- **AI Financial Advisor** — rule-based insight engine surfacing budget overruns, spending spikes, category concentration risk, and savings-rate health, ranked by severity

### 📈 Analytics
- Month-over-month **income/expense comparison** with trend indicators
- Multi-line **category spending trend chart** across custom date ranges
- Ranked **Top Categories** table with proportional visual bars

### 📤 Export
- Filtered transaction **CSV export**
- Professionally formatted **PDF monthly reports** (summary + full transaction table)

### 📱 Responsive, Polished UI
- Fully responsive, mobile-first design with a slide-in navigation drawer
- Toast notifications, loading states, and empty/error states across every view
- Accessible keyboard focus states throughout

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19 + TypeScript** | Component-driven, type-safe UI |
| **Vite** | Fast dev server and optimized production builds |
| **Tailwind CSS v4** | Utility-first styling with a custom design system |
| **React Router** | Client-side routing, nested layouts, protected routes |
| **React Hook Form + Zod** | Performant forms with schema-based validation |
| **Axios** | HTTP client with interceptor-based auth token injection |
| **Recharts** | Data visualization (pie, bar, and line charts) |
| **Lucide React** | Icon system (no emoji-based UI) |

### Backend
| Technology | Purpose |
|---|---|
| **Flask** | Application factory pattern, Blueprint-based routing |
| **Flask-SQLAlchemy** | ORM for database modeling and querying |
| **Flask-Migrate (Alembic)** | Version-controlled schema migrations |
| **Flask-JWT-Extended** | Token issuance and route protection |
| **Flask-Bcrypt** | One-way password hashing |
| **Marshmallow** | Request validation and response serialization |
| **Gunicorn** | Production WSGI server |

### Database
| Technology | Purpose |
|---|---|
| **PostgreSQL** (Supabase) | Production relational database |
| **SQLite** | Local development database |

### AI / ML
| Technology | Purpose |
|---|---|
| **scikit-learn** | Linear regression for expense forecasting |
| **pandas / NumPy** | Data shaping and numerical computation |
| **Custom rule-based engine** | Explainable financial insight generation |

### Deployment
| Service | Role |
|---|---|
| **Vercel** | Frontend hosting (static Vite build) |
| **Railway** | Backend hosting (Flask + Gunicorn) |
| **Supabase** | Managed PostgreSQL database |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (Vercel)                      │
│   React + TypeScript + Tailwind CSS                       │
│   Pages → Components → Context → Services (Axios)         │
└───────────────────────┬───────────────────────────────────┘
                         │ HTTPS + JWT Bearer Token
┌───────────────────────▼───────────────────────────────────┐
│                  BACKEND (Railway · Flask)                 │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐│
│  │ Auth Module   │  │ Finance Module │  │ AI/ML Module   ││
│  │ JWT · bcrypt  │  │ CRUD + rules   │  │ sklearn engine ││
│  └───────────────┘  └───────────────┘  └────────────────┘│
│  Marshmallow (validation) · SQLAlchemy (ORM)               │
└───────────────────────┬───────────────────────────────────┘
                         │
┌───────────────────────▼───────────────────────────────────┐
│              DATABASE (Supabase · PostgreSQL)               │
│  Users · Categories · Transactions · Budgets                │
└─────────────────────────────────────────────────────────────┘
```

A classic **3-tier architecture** with a dedicated ML layer: presentation (React), application/business logic (Flask, organized into Blueprints and a standalone `ml/` package), and data (PostgreSQL). The `ml/` package is deliberately framework-agnostic — it takes plain Python data in and returns plain Python data out, making it independently testable without a running server.

---

## 📁 Project Folder Structure

```
finpilot/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI (ui/, layout/, charts, feature-specific)
│   │   ├── pages/             # Route-level views, grouped by feature
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── services/            # Axios API layer (one file per resource)
│   │   ├── schemas/              # Zod validation schemas
│   │   ├── types/                 # Shared TypeScript interfaces
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── routes/                  # Router configuration
│   │   └── utils/                    # Formatters (currency, dates)
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/            # Marshmallow schemas
│   │   ├── routes/              # Flask Blueprints (one per resource)
│   │   ├── ml/                    # Prediction + insight engine (framework-agnostic)
│   │   ├── config.py                # Environment-based configuration
│   │   └── extensions.py             # Centralized extension instances
│   ├── migrations/             # Alembic migration history
│   ├── run.py                    # Application entry point
│   └── requirements.txt
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (for production-parity local testing) or SQLite (default for local dev)
- Git

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # then fill in your values — see Environment Variables below

flask db upgrade        # applies all migrations
python run.py            # starts the Flask dev server on port 5000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local   # then set VITE_API_URL

npm run dev                   # starts the Vite dev server on port 5173
```

---

## 🔑 Environment Variables

**Backend (`backend/.env`)**
```env
SECRET_KEY=your-flask-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
FLASK_ENV=development
DATABASE_URL=postgresql://user:password@host:port/dbname   # omit to use local SQLite
CORS_ORIGINS=http://localhost:5173
```

**Frontend (`frontend/.env.local`)**
```env
VITE_API_URL=http://127.0.0.1:5000/api
```

> ⚠️ Never commit `.env` files. Both are already excluded via `.gitignore`.

---

## ▶️ How to Run Locally

1. Start the backend: `cd backend && python run.py` → runs on `http://127.0.0.1:5000`
2. Start the frontend: `cd frontend && npm run dev` → runs on `http://localhost:5173`
3. Register a new account and start exploring — the app works fully offline against local SQLite with zero external dependencies.

---

## 🔌 API Overview

All endpoints are prefixed with `/api` and (except auth) require an `Authorization: Bearer <token>` header.

| Module | Method | Endpoint | Description |
|---|---|---|---|
| Auth | `POST` | `/auth/register` | Create a new account |
| Auth | `POST` | `/auth/login` | Authenticate, receive JWT |
| Auth | `GET` | `/auth/me` | Get current user |
| Auth | `PUT` | `/auth/profile` | Update name/email |
| Auth | `PUT` | `/auth/password` | Change password |
| Categories | `GET/POST/PUT/DELETE` | `/categories` | Manage categories |
| Transactions | `GET/POST/PUT/DELETE` | `/transactions` | Manage income/expense entries |
| Budgets | `GET/POST/PUT/DELETE` | `/budgets` | Manage category budgets |
| Analytics | `GET` | `/analytics/summary` | Dashboard aggregate data |
| Analytics | `GET` | `/analytics/comparison` | Month-over-month comparison |
| Analytics | `GET` | `/analytics/trends` | Category trends over a date range |
| AI | `GET` | `/ai/predict-expense` | Next-month expense prediction |
| AI | `GET` | `/ai/insights` | Ranked financial insights |
| Export | `GET` | `/export/transactions/csv` | Download transactions as CSV |
| Export | `GET` | `/export/report/pdf` | Download a monthly PDF report |

---

## 🧠 AI Module Explanation

FinPilot's "AI" is deliberately **interpretable and explainable** rather than a black box — a conscious architectural choice for a finance application, where trust and traceability matter more than raw model complexity.

**Expense Prediction** — a simple linear regression model is trained fresh on each request against a user's historical monthly expense totals. It requires a minimum of 3 months of data before returning a prediction, explicitly refusing to fabricate a false-confidence estimate from insufficient data. Output includes the predicted amount, trend direction, monthly rate of change, and a confidence band (low/medium/high) based on data volume.

**AI Financial Advisor** — a rule-based insight engine (not an LLM) that evaluates real budget adherence, month-over-month category spending changes, spending concentration, and overall savings rate. Every insight is directly traceable to a specific number computed from the user's actual data — nothing is hallucinated or generated from a free-text prompt, which matters significantly for trust in a financial context.

---

## 🗄 Database Design

| Table | Purpose | Key Relationships |
|---|---|---|
| `users` | Account records | Parent to all other tables |
| `categories` | Income/expense groupings | Belongs to `users`; has many `transactions`, `budgets` |
| `transactions` | Individual income/expense entries | Belongs to `users` and `categories` |
| `budgets` | Monthly per-category spending limits | Belongs to `users` and `categories`; unique per (category, month, year) |

- Monetary values use `Numeric(12,2)`, never floating point, to avoid rounding errors.
- Foreign keys enforce referential integrity; cascading deletes prevent orphaned records.
- A composite unique constraint prevents duplicate budgets for the same category/month/year.

---

## 🔒 Security Features

- **Password hashing** via bcrypt — plaintext passwords are never stored
- **JWT authentication** with expiring tokens on every protected route
- **Ownership-scoped queries** on every resource (`filter_by(user_id=..., id=...)`) — prevents one user from accessing or modifying another user's data via ID guessing (IDOR protection)
- **Server-side validation** on every write endpoint via Marshmallow, independent of client-side validation — the client is never trusted as the sole line of defense
- **CORS restricted** to known frontend origins in production
- **Environment-based secrets** — no credentials committed to source control

---

## 🚢 Deployment Details

| Layer | Platform | Notes |
|---|---|---|
| Frontend | **Vercel** | Auto-deployed from `main`, static Vite build |
| Backend | **Railway** | Gunicorn-served Flask app, auto-deployed from `main` |
| Database | **Supabase** | Managed PostgreSQL, connected via `DATABASE_URL` |

The backend uses an **application factory pattern** with environment-driven configuration (`DevelopmentConfig` / `ProductionConfig`), and all date-based SQL queries use SQLAlchemy's database-agnostic `func.extract()` rather than SQLite-specific functions, ensuring identical query behavior across local SQLite development and production PostgreSQL.

---

## 📸 Screenshots

| Dashboard | Categories |
|-----------|------------|
| ![](screenshots/dashboard.png) | ![](screenshots/categories.png) |

| Income | Expenses |
|--------|----------|
| ![](screenshots/income.png) | ![](screenshots/expenses.png) |

| Budgets | Analytics |
|---------|-----------|
| ![](screenshots/budgets.png) | ![](screenshots/analytics.png) |

| AI Advisor | Settings |
|------------|----------|
| ![](screenshots/ai-advisor.png) | ![](screenshots/settings.png) |

| Login | Register |
|-------|----------|
| ![](screenshots/login.png) | ![](screenshots/register.png) |


## 🌐 Live Demo

🔗 **Application**

https://fin-pilot-ruby.vercel.app

The application is fully deployed with:

- Frontend: Vercel
- Backend: Railway
- Database: Supabase PostgreSQL

## 🔮 Future Enhancements

- Multi-currency support (currently INR-only by design)
- Custom calendar-based date range picker for Analytics (currently fixed presets)
- Recurring transaction support (subscriptions, rent, salary auto-entry)
- Shared/family budgets across multiple linked accounts
- Push/email notifications for budget threshold breaches
- Optional LLM-generated natural-language summaries layered on top of the existing structured insight engine

---

## 💬 Interview Questions & Answers

**Q1: Why did you use the application factory pattern in Flask?**
It decouples app creation from app configuration, enabling multiple configurations (dev/test/prod) from the same codebase and avoiding circular imports between extensions, models, and routes — critical as the app grew past a handful of routes.

**Q2: Why linear regression instead of a more complex model for expense prediction?**
Interpretability and honesty matter more than sophistication in a finance app. Linear regression lets me show users *why* a prediction looks the way it does (a clear trend line), and it performs reasonably even with very limited historical data — appropriate given a real user may only have a few months of transactions.

**Q3: Why is the AI Advisor rule-based rather than LLM-based?**
Every insight must be traceable to a real, computed number from the user's actual data. An LLM asked to generate financial advice can hallucinate figures — an unacceptable risk in a finance product. The rule-based engine is also free of external API cost/latency/dependency.

**Q4: How do you prevent one user from accessing another user's data?**
Every database query for user-owned resources is scoped by both the resource ID *and* the authenticated user's ID (`filter_by(id=x, user_id=current_user)`), never by ID alone — this closes the IDOR (Insecure Direct Object Reference) vulnerability class entirely.

**Q5: Why Marshmallow validation on the backend if the frontend already validates with Zod?**
Frontend validation is a UX convenience, not a security boundary — it can be bypassed entirely via direct API calls. Backend validation is the actual, non-negotiable line of defense.

**Q6: How did you handle SQLite-to-PostgreSQL portability?**
By replacing SQLite-specific functions like `strftime()` with SQLAlchemy's database-agnostic `func.extract()`, which SQLAlchemy translates into the correct native syntax for whichever database engine is connected — verified locally against SQLite before deploying against PostgreSQL.

**Q7: Why store money as `Numeric` instead of `Float`?**
Floating-point binary representation introduces rounding errors (e.g., `0.1 + 0.2 != 0.3`) that are unacceptable for currency. `Numeric` stores exact decimal values.

**Q8: How does JWT authentication work in this app end-to-end?**
On login, the backend verifies credentials and issues a signed JWT containing the user's ID. The frontend stores it and attaches it via an Axios interceptor to every subsequent request's `Authorization` header. Protected backend routes verify the signature and extract the user ID — no database session state is needed per request.

**Q9: What was the hardest bug you debugged in this project?**
A missing SQLAlchemy relationship on the `Budget` model meant `budget.category` silently serialized as `null` instead of raising an error, only surfacing as a frontend crash once a component actually tried to render it — a good example of why silent `null` serialization can hide a real data-modeling gap.

**Q10: How would you scale this application further?**
Move heavier aggregate queries to materialized views or a caching layer (Redis) for dashboard/analytics endpoints, add pagination to more list endpoints, and consider background job processing (Celery) for PDF generation if reports grow large enough to risk request timeouts.

---

## 👤 Author

Jahnavi Suresh

GitHub:
https://github.com/Jahnavi-Suresh06

LinkedIn:
https://www.linkedin.com/in/jahnavi-suresh-a9b13629b/

---
<p align="center">
  <sub>Built with ❤️ as a full-stack portfolio project demonstrating production-grade engineering practices.</sub>
</p>
