from fastapi import APIRouter, Depends, status
from app.schemas.auth import LoginRequest, RegisterRequest, RefreshTokenRequest, TokenResponse
from app.schemas.common import APIResponse
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])
auth_service = AuthService()

@router.post("/register", response_model=APIResponse[TokenResponse])
async def register(req: RegisterRequest):
    res = await auth_service.register(req)
    return APIResponse(data=res, message="Registration successful")

@router.post("/login", response_model=APIResponse[TokenResponse])
async def login(req: LoginRequest):
    res = await auth_service.login(req)
    return APIResponse(data=res, message="Login successful")

@router.post("/refresh", response_model=APIResponse[TokenResponse])
async def refresh_tokens(req: RefreshTokenRequest):
    res = await auth_service.refresh_tokens(req.refresh_token)
    return APIResponse(data=res, message="Token refreshed successfully")

@router.get("/me", response_model=APIResponse[dict])
async def get_me(current_user: dict = Depends(get_current_user)):
    return APIResponse(data=current_user, message="User profile retrieved")
