from fastapi import APIRouter, Depends
from app.schemas.common import APIResponse
from app.schemas.ai import AIQueryRequest, AIQueryResponse
from app.services.ai_service import AIService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Operations Copilot"])
ai_service = AIService()

@router.post("/query", response_model=APIResponse[AIQueryResponse])
async def query_ai(req: AIQueryRequest, current_user: dict = Depends(get_current_user)):
    res = await ai_service.query_assistant(req)
    return APIResponse(data=res, message="AI Copilot response generated")
