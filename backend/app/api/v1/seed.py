from fastapi import APIRouter
from app.schemas.common import APIResponse
from app.services.seed_service import SeedService

router = APIRouter(prefix="/seed", tags=["Seed & Demo Data"])

@router.post("/generate", response_model=APIResponse[dict])
async def seed_data():
    res = await SeedService.seed_enterprise_data()
    return APIResponse(data=res, message="Enterprise seed generator completed")
