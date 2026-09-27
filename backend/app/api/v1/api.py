from fastapi import APIRouter
from app.api.v1 import auth, tenants, menu, pos, kitchen, tables, inventory, recipes, crm, day_close, reports, ai, alerts, seed

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(tenants.router)
api_router.include_router(menu.router)
api_router.include_router(pos.router)
api_router.include_router(kitchen.router)
api_router.include_router(tables.router)
api_router.include_router(inventory.router)
api_router.include_router(recipes.router)
api_router.include_router(crm.router)
api_router.include_router(day_close.router)
api_router.include_router(reports.router)
api_router.include_router(ai.router)
api_router.include_router(alerts.router)
api_router.include_router(seed.router)
