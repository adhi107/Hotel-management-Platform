# Database Schema & Indexing — AURA Restaurant OS

## 1. MongoDB Document Collections

| Collection | Model Class | Key Indexes |
| :--- | :--- | :--- |
| `tenants` | `Tenant` | `id (unique)`, `slug (unique)`, `owner_email` |
| `branches` | `Branch` | `tenant_id, id`, `tenant_id, is_active` |
| `users` | `User` | `email (unique)`, `tenant_id, role`, `is_active` |
| `categories` | `Category` | `tenant_id, sort_order`, `tenant_id, is_active` |
| `products` | `Product` | `tenant_id, category_id`, `tenant_id, is_available` |
| `orders` | `Order` | `tenant_id, branch_id, status`, `tenant_id, created_at` |
| `ingredients` | `Ingredient` | `tenant_id, category`, `tenant_id, current_stock` |
| `recipes` | `Recipe` | `tenant_id, product_id (unique)` |
| `customer_khata` | `CustomerKhata` | `tenant_id, customer_id`, `tenant_id, customer_phone` |
| `day_close` | `DayClose` | `tenant_id, branch_id, business_date` |
| `alerts` | `Alert` | `tenant_id, is_resolved, severity` |
| `audit_logs` | `AuditLog` | `tenant_id, timestamp`, `user_id` |

---

## 2. Universal Base Document Fields
Every collection document inherits from `TenantDocument`:
```json
{
  "id": "uuid-v4-string",
  "tenant_id": "tenant-uuid-string",
  "organization_id": "org-uuid-string",
  "branch_id": "branch-uuid-string",
  "created_at": "ISO-8601-UTC",
  "updated_at": "ISO-8601-UTC",
  "created_by": "user-uuid-string",
  "updated_by": "user-uuid-string",
  "is_deleted": false
}
```
