# Architecture Documentation — AURA Restaurant OS

## 1. Architectural Philosophy & Clean Architecture

AURA is engineered as a cloud-native, SaaS-grade **Restaurant Operating System** that strictly enforces separation of concerns:

```
[ HTTP Requests / WebSockets ]
            │
    [ Middleware Layer ]
   (Tenant, Audit, Error)
            │
      [ Router Layer ]
   (FastAPI Route Handlers)
            │
     [ Service Layer ]
 (Business Rules, Costing, AI)
            │
   [ Repository Layer ]
 (TenantRepository Generic Data Access)
            │
      [ Driver Layer ]
   (Async Motor / MongoDB / Redis)
```

### 1.1 Tenant Isolation Protocol
Tenant isolation is enforced through `TenantContext` backed by Python's `contextvars.ContextVar`. 
- Every request passing through `TenantMiddleware` extracts the tenant identifier from JWT claims or headers (`X-Tenant-ID`, `X-Branch-ID`).
- All queries executed through `TenantRepository` automatically inject `tenant_id` and filter out `is_deleted: True`.
- Cross-tenant data leakage is cryptographically and logically impossible.

---

## 2. Adaptive Complexity Engine

The platform adapts itself dynamically based on:
1. **Business Profile Template** (`Juice Center`, `Bakery`, `Cafe`, `Restaurant`, `Food Truck`, `Catering`, `Custom`)
2. **Operational Scale** (`Solo`, `Micro`, `Small`, `Enterprise`)
3. **UI Mode**:
   - `Simple Mode`: Strips away floor plans, KDS and procurement. Focuses purely on 2-tap touch sales, orders, and Khata ledger.
   - `Standard Mode`: Integrates POS, kitchen display, inventory, and end-of-day closing.
   - `Advanced Mode`: Unlocks multi-branch management, recipe costing matrices, AI copilot, and SaaS administration.

---

## 3. Real-Time Operations Architecture (WebSockets)

A centralized `ConnectionManager` routes real-time events across scoped rooms:
- `branch:{branch_id}:pos` — Broadcasts order state changes and payment completions.
- `branch:{branch_id}:kds` — Transmits instant ticket dispatches and item bumps.
- `branch:{branch_id}:tables` — Synchronizes live table availability and seating timers.
