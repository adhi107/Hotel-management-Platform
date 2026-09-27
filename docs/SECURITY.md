# Security & RBAC Specification — AURA Restaurant OS

## 1. Password Hashing & Security Policies
- **Bcrypt / Argon2** hashing with salt rounds.
- **JWT Cryptography**: Dual-token architecture with `HS256` signing:
  - Short-lived Access Tokens (24 hours).
  - Long-lived Refresh Tokens (30 days) with token rotation.

---

## 2. Granular RBAC Permission Format
Permissions follow the granular 4-tuple notation:
`{module}:{resource}:{action}:{scope}`

### Example Scopes
- `branch`: Constrained strictly to active branch context.
- `organization`: Access across all branches under the brand.
- `all`: Super Admin platform-wide scope.

### Role Permission Mapping
- `organization_owner`: `*:*:*:*`
- `branch_manager`: `dashboard:*:view:branch`, `pos:*:*:branch`, `orders:*:*:branch`, `kitchen:*:*:branch`, `inventory:*:*:branch`
- `cashier`: `pos:*:*:branch`, `orders:*:*:branch`, `crm:*:*:branch`
- `chef`: `kitchen:*:*:branch`, `orders:*:view:branch`
