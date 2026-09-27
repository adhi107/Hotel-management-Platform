import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone, timedelta
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from app.core.exceptions import UnauthorizedException, BadRequestException, NotFoundException
from app.core.database import get_collection
from app.models.auth import User, Role, SessionRecord, AuditLog
from app.models.tenant import Tenant, Branch, Organization, BUSINESS_TEMPLATES
from app.schemas.auth import LoginRequest, RegisterRequest

class AuthService:
    def __init__(self):
        self.users_col = get_collection("users")
        self.roles_col = get_collection("roles")
        self.tenants_col = get_collection("tenants")
        self.branches_col = get_collection("branches")
        self.orgs_col = get_collection("organizations")
        self.sessions_col = get_collection("sessions")

    async def register(self, req: RegisterRequest) -> Dict[str, Any]:
        existing_user = await self.users_col.find_one({"email": req.email, "is_deleted": {"$ne": True}})
        if existing_user:
            raise BadRequestException("User with this email already exists")

        tenant_id = str(uuid.uuid4())
        org_id = str(uuid.uuid4())
        branch_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())

        # Select business template configuration
        template = BUSINESS_TEMPLATES.get(req.business_type, BUSINESS_TEMPLATES["Restaurant"])
        ui_mode = template.get("ui_mode", "standard")

        tenant_doc = {
            "_id": tenant_id,
            "id": tenant_id,
            "name": req.business_name,
            "slug": req.business_name.lower().replace(" ", "-"),
            "owner_email": req.email,
            "phone": req.phone,
            "business_type": req.business_type,
            "business_size": req.business_size,
            "ui_mode": ui_mode,
            "plan": "enterprise",
            "is_active": True,
            "features": template.get("features", {}),
            "config": {
                "restaurant_name": req.business_name,
                "tagline": "Modern Gastronomy & Hospitality",
                "primary_color": "#3B82F6",
                "secondary_color": "#8B5CF6",
                "accent_color": "#10B981",
                "dark_mode": True,
                "currency": "INR",
                "currency_symbol": "₹",
                "decimal_precision": 2,
                "tax_percent": 5.0
            },
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await self.tenants_col.insert_one(tenant_doc)

        org_doc = {
            "_id": org_id,
            "id": org_id,
            "tenant_id": tenant_id,
            "name": req.business_name,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await self.orgs_col.insert_one(org_doc)

        branch_doc = {
            "_id": branch_id,
            "id": branch_id,
            "tenant_id": tenant_id,
            "organization_id": org_id,
            "name": f"{req.business_name} - Main Branch",
            "code": "MAIN-01",
            "address": f"100 Commercial Hub, {req.city}",
            "city": req.city,
            "state": req.state,
            "pincode": "500081",
            "phone": req.phone or "9876543210",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await self.branches_col.insert_one(branch_doc)

        user_doc = {
            "_id": user_id,
            "id": user_id,
            "tenant_id": tenant_id,
            "organization_id": org_id,
            "branch_id": branch_id,
            "email": req.email,
            "hashed_password": get_password_hash(req.password),
            "full_name": req.owner_name,
            "phone": req.phone,
            "role": "organization_owner",
            "assigned_branch_ids": [branch_id],
            "is_active": True,
            "is_super_admin": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await self.users_col.insert_one(user_doc)

        # Generate tokens
        access_token = create_access_token(
            subject=user_id,
            tenant_id=tenant_id,
            org_id=org_id,
            branch_id=branch_id,
            role="organization_owner",
            permissions=["*:*:*:*"]
        )
        refresh_token = create_refresh_token(subject=user_id, tenant_id=tenant_id)

        user_doc.pop("hashed_password", None)
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user_doc,
            "tenant": tenant_doc,
            "branches": [branch_doc]
        }

    async def login(self, req: LoginRequest) -> Dict[str, Any]:
        user = await self.users_col.find_one({"email": req.email, "is_deleted": {"$ne": True}})
        if not user:
            raise UnauthorizedException("Invalid email or password")
        
        if not verify_password(req.password, user.get("hashed_password", "")):
            raise UnauthorizedException("Invalid email or password")
        
        if not user.get("is_active", True):
            raise UnauthorizedException("User account is deactivated")

        tenant_id = req.tenant_id or user.get("tenant_id")
        tenant = await self.tenants_col.find_one({"id": tenant_id}) if tenant_id else None
        
        branches = []
        if tenant_id:
            cursor = self.branches_col.find({"tenant_id": tenant_id, "is_deleted": {"$ne": True}})
            branches = await cursor.to_list(100)

        active_branch_id = req.branch_id or (branches[0]["id"] if branches else user.get("branch_id"))
        
        # Permissions calculation
        role_name = user.get("role", "waiter")
        permissions = ["*:*:*:*"] if user.get("is_super_admin") or role_name == "organization_owner" else []
        if not permissions:
            role_doc = await self.roles_col.find_one({"name": role_name})
            if role_doc:
                permissions = role_doc.get("permissions", [])
            else:
                from app.core.permissions import DEFAULT_ROLE_PERMISSIONS
                permissions = DEFAULT_ROLE_PERMISSIONS.get(role_name, ["pos:*:*:branch"])

        access_token = create_access_token(
            subject=user["id"],
            tenant_id=tenant_id,
            org_id=user.get("organization_id"),
            branch_id=active_branch_id,
            role=role_name,
            permissions=permissions
        )
        refresh_token = create_refresh_token(subject=user["id"], tenant_id=tenant_id)

        # Update last login
        await self.users_col.update_one(
            {"id": user["id"]},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )

        user_clean = dict(user)
        user_clean.pop("hashed_password", None)
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user_clean,
            "tenant": tenant,
            "branches": branches
        }

    async def refresh_tokens(self, refresh_token: str) -> Dict[str, Any]:
        try:
            payload = decode_token(refresh_token, is_refresh=True)
            user_id = payload.get("sub")
            tenant_id = payload.get("tenant_id")
            
            user = await self.users_col.find_one({"id": user_id, "is_deleted": {"$ne": True}})
            if not user or not user.get("is_active", True):
                raise UnauthorizedException("Invalid refresh token")
            
            tenant = await self.tenants_col.find_one({"id": tenant_id})
            branches = await self.branches_col.find({"tenant_id": tenant_id}).to_list(100)
            
            role_name = user.get("role", "waiter")
            permissions = ["*:*:*:*"] if user.get("is_super_admin") or role_name == "organization_owner" else ["pos:*:*:branch"]
            
            new_access_token = create_access_token(
                subject=user_id,
                tenant_id=tenant_id,
                org_id=user.get("organization_id"),
                branch_id=user.get("branch_id"),
                role=role_name,
                permissions=permissions
            )
            new_refresh_token = create_refresh_token(subject=user_id, tenant_id=tenant_id)

            user_clean = dict(user)
            user_clean.pop("hashed_password", None)
            return {
                "access_token": new_access_token,
                "refresh_token": new_refresh_token,
                "token_type": "bearer",
                "user": user_clean,
                "tenant": tenant,
                "branches": branches
            }
        except Exception as e:
            raise UnauthorizedException(f"Token refresh failed: {str(e)}")
