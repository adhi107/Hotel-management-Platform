import pytest
from app.services.seed_service import SeedService

@pytest.fixture(autouse=True)
async def initialize_test_database():
    await SeedService.seed_enterprise_data()
