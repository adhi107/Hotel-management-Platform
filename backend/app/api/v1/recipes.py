from fastapi import APIRouter, Depends
from typing import List
from app.schemas.common import APIResponse
from app.schemas.inventory import RecipeCreateRequest
from app.services.recipe_service import RecipeService
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/recipes", tags=["Recipes & Food Costing"])
recipe_service = RecipeService()

@router.get("", response_model=APIResponse[List[dict]])
async def list_recipes(current_user: dict = Depends(get_current_user)):
    recipes = await recipe_service.list_recipes()
    return APIResponse(data=recipes, message="Recipes listed")

@router.post("", response_model=APIResponse[dict])
async def create_or_update_recipe(req: RecipeCreateRequest, current_user: dict = Depends(get_current_user)):
    recipe = await recipe_service.create_or_update_recipe(req)
    return APIResponse(data=recipe, message="Recipe and food costing updated")
