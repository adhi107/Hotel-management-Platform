import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection
from app.core.redis import connect_to_redis, close_redis_connection
from app.middleware.tenant_middleware import TenantMiddleware
from app.middleware.audit_middleware import AuditMiddleware
from app.middleware.error_middleware import ErrorHandlerMiddleware
from app.api.v1.api import api_router
from app.websocket.manager import ws_manager
from app.services.seed_service import SeedService

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("aura.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting AURA Restaurant OS Application Engine...")
    await connect_to_mongo()
    await connect_to_redis()
    
    # Auto-seed default enterprise datasets on startup for seamless first run
    try:
        await SeedService.seed_enterprise_data()
    except Exception as e:
        logger.warning(f"Auto-seeding skipped or failed: {e}")
        
    yield
    
    logger.info("Shutting down AURA Restaurant OS Application Engine...")
    await close_mongo_connection()
    await close_redis_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# Middleware Stack
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(AuditMiddleware)
app.add_middleware(TenantMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# Real-Time WebSocket endpoint
@app.websocket("/ws/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str):
    await ws_manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or client ping
            await websocket.send_text(f'{{"event": "PONG", "data": "{data}"}}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket exception: {e}")
        ws_manager.disconnect(websocket)

# Health & Observability Endpoints
@app.get("/health", tags=["Observability"])
async def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME, "version": settings.VERSION}

@app.get("/readiness", tags=["Observability"])
async def readiness_check():
    return {"status": "ready", "database": "connected", "redis": "connected"}

@app.get("/liveness", tags=["Observability"])
async def liveness_check():
    return {"status": "live"}
