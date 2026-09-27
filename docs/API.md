# API Specification — AURA Restaurant OS

## Base URL
`/api/v1`

## Standard Envelope Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "meta": {}
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Dish not found",
    "details": {}
  }
}
```

---

## Core Endpoint Catalog

### Authentication
- `POST /api/v1/auth/register` — Register tenant and initial owner
- `POST /api/v1/auth/login` — Authenticate and receive JWT access + refresh token
- `POST /api/v1/auth/refresh` — Rotate refresh token
- `GET /api/v1/auth/me` — Retrieve active session user context

### POS & Quick Sale
- `POST /api/v1/pos/quick-sale` — 1-Tap fast checkout for juice/tea/food stall
- `POST /api/v1/pos/orders` — Create dine-in/takeaway/delivery order
- `POST /api/v1/pos/orders/{order_id}/pay` — Process multi-tender settlement

### Kitchen Display System
- `GET /api/v1/kitchen/tickets?station={station}` — Retrieve active kitchen tickets
- `PATCH /api/v1/kitchen/tickets/{order_id}/status` — Bump ticket status (preparing/ready/completed)
- `PATCH /api/v1/kitchen/tickets/{order_id}/items/{item_id}/status` — Bump individual item

### CRM & Indian Khata (Credit Ledger)
- `GET /api/v1/crm/customers` — List CRM customer profiles
- `GET /api/v1/crm/khata` — Retrieve active credit accounts
- `POST /api/v1/crm/khata/entry` — Record payment received or credit tab

### One-Tap Day Close
- `GET /api/v1/day-close/summary` — Calculate shift totals & expected cash
- `POST /api/v1/day-close/close` — Execute daily reconciliation and lock day

### AI Operations Copilot
- `POST /api/v1/ai/query` — Natural language operational query grounded in tenant telemetry
