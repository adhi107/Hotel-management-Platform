import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

@pytest.mark.asyncio
async def test_auth_and_login():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login with seeded test account
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "owner@aura.io",
            "password": "password123"
        })
        assert login_res.status_code == 200
        res_data = login_res.json()
        assert res_data["success"] is True
        token = res_data["data"]["access_token"]
        assert token is not None

        # 2. Query Me endpoint with Bearer token
        headers = {"Authorization": f"Bearer {token}"}
        me_res = await ac.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["data"]["role"] == "organization_owner"

@pytest.mark.asyncio
async def test_quick_sale_and_pos():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "cashier@aura.io",
            "password": "password123"
        })
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Perform Quick Sale
        qs_res = await ac.post("/api/v1/pos/quick-sale", headers=headers, json={
            "items": [
                {"product_name": "Fresh Alphonso Mango Juice", "unit_price": 120.0, "quantity": 2}
            ],
            "payment_method": "upi",
            "customer_name": "Test Quick Buyer",
            "discount_amount": 0.0
        })
        assert qs_res.status_code == 200
        qs_data = qs_res.json()["data"]
        assert qs_data["status"] == "completed"
        assert qs_data["grand_total"] >= 240.0

@pytest.mark.asyncio
async def test_day_close_summary():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "owner@aura.io",
            "password": "password123"
        })
        token = login_res.json()["data"]["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        summary_res = await ac.get("/api/v1/day-close/summary", headers=headers)
        assert summary_res.status_code == 200
        assert summary_res.json()["success"] is True
        assert "expected_cash" in summary_res.json()["data"]
