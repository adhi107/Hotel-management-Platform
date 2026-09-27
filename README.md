# AURA Restaurant OS — Universal Food & Beverage Business Operating System

> **One Operating System for Every Food Business.** From small juice centers, tea stalls, bakeries, and food trucks to fine-dining restaurants, cloud kitchens, and multi-branch enterprise chains.

Built with **FastAPI**, **Pydantic v2**, **Motor (Async MongoDB)**, **Redis**, **WebSockets**, **React 18+**, **TypeScript**, **Vite**, **Tailwind CSS**, and **CRED-inspired dark luxury aesthetics**.

---

## 🌟 Key Highlights & Core Capabilities

### 1. Universal Business Support & Adaptive UI Engine
- **Predefined Business Templates**: Juice Center, Tea Shop, Food Stall, Bakery, Cafe, Restaurant, Cloud Kitchen, Food Truck, Catering, Custom.
- **Dynamic Complexity Modes**:
  - **Simple Mode**: 2-Tap fast sales, Cash/UPI/Khata checkout, zero clutter.
  - **Standard Mode**: Full POS, KDS, Stock, Tables, Day Close.
  - **Advanced Mode**: Multi-branch ERP, Recipe Food Costing, BI Analytics, AI Copilot.

### 2. High-Speed POS & Dedicated Quick Sale
- **Quick Sale**: Large visual touch tiles (Mango Juice, Cold Brew, Podi Dosa, Sourdough Pizzas, Burgers).
- **Restaurant Full POS**: Dine-in, Takeaway, Delivery, visual table mapping, split-billing, multi-tender payments (`UPI`, `Cash`, `Card`, `Khata`), hold & resume, keyboard shortcuts (`F1`-`F4`, `Ctrl+K`, `Esc`).

### 3. Customer CRM & Traditional Khata (Credit Ledger)
- Customer profiles, loyalty tiers (`Bronze`, `Silver`, `Gold`, `Platinum`), visit frequency, and favorite dishes.
- Indian food business **Khata Credit Ledger**: track customer tabs, record payments, view outstanding credit, due date reminders.

### 4. One-Tap Day Close (EOD Reconciliation)
- Shift revenue breakdown (Cash, UPI, Card, Khata).
- Physical till reconciliation, opening cash float buffer, and automatic discrepancy detection.

### 5. Multi-Station Kitchen Display System (KDS)
- Stations: `Main Kitchen`, `Grill & Tandoor`, `Bar & Juices`, `Bakery & Oven`.
- Real-time WebSockets ticket arrival, item-level bumping, and SLA countdowns.

### 6. Interactive Visual Floor Plan
- Real-time table states: `Available` (Emerald), `Occupied` (Amber), `Billing` (Blue), `Reserved` (Violet), `Cleaning` (Rose).

### 7. Recipe & Food Costing Engine
- Ingredient linkage, automated Food Cost %, Gross Margin %, and dish classification into **Stars**, **Workhorses**, **Puzzles**, and **Dogs**.

### 8. Context-Aware AI Operations Copilot
- Natural language queries grounded in tenant telemetry (e.g., *"What are our best-selling dishes?"*, *"Which ingredients are low on stock?"*).

### 9. Multi-Tenant Isolation & Granular RBAC
- Complete hierarchical context (`Tenant → Organization → Brand → Branch → Floor → Table → Staff`).
- `TenantContext` isolation at database query layer.

---

## 🚀 Quick Start Guide

### 1. Run with Docker Compose
```bash
docker-compose up --build
```
- Frontend UI: `http://localhost:3000`
- FastAPI OpenAPI Docs: `http://localhost:8000/api/v1/docs`

### 2. Run Locally for Development

#### Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Pre-Seeded Demo Test Accounts

| Role | Email | Password | Preloaded Workspace |
| :--- | :--- | :--- | :--- |
| **Organization Owner** | `owner@aura.io` | `password123` | Full Enterprise Flagship & Multi-Branch |
| **POS Cashier** | `cashier@aura.io` | `password123` | Quick Sale, POS Checkout & Bills |
| **Head Chef** | `chef@aura.io` | `password123` | Multi-Station KDS & Kitchen Tickets |
| **Super Admin** | `admin@aura.io` | `password123` | SaaS Administration Console |

---

## 🧪 Automated Test Suite

Run backend test verification:
```bash
cd backend
pytest -v
```

Build frontend verification:
```bash
cd frontend
npm run build
```

---

## 📁 Repository Structure
```
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Modular API routers
│   │   ├── core/            # Config, security, database, tenant context, permissions
│   │   ├── middleware/      # TenantMiddleware, AuditMiddleware, ErrorMiddleware
│   │   ├── models/          # ODM Document models
│   │   ├── schemas/         # Pydantic v2 schemas
│   │   ├── repositories/    # Generic TenantRepository
│   │   ├── services/        # Business logic services
│   │   ├── websocket/       # Real-time WebSocket connection manager
│   │   └── main.py          # FastAPI application factory
│   ├── tests/               # Pytest suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # AppShell, TopBar, Sidebar, MobileBottomNav, CommandPalette
│   │   ├── features/        # Feature modules (POS, KDS, Tables, Khata, Day Close, AI)
│   │   ├── stores/          # Zustand state stores
│   │   ├── services/        # Axios API client
│   │   └── types/           # TypeScript interfaces
│   ├── index.html
│   └── package.json
├── docker-compose.yml
├── nginx.conf
└── README.md
```
