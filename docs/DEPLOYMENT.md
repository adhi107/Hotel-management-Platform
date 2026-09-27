# Production Deployment Guide — AURA Restaurant OS

## 1. Production Docker Stack

Run the full stack with single command:
```bash
docker-compose -f docker-compose.yml up -d
```

### Stack Components:
1. **Frontend (Nginx)**: Port `3000` (Reverse proxies `/api/` and `/ws/` to backend)
2. **Backend (FastAPI)**: Port `8000`
3. **Database (MongoDB 7.0)**: Port `27017`
4. **Cache (Redis 7.2)**: Port `6379`

---

## 2. Health Monitoring & Probes
- Liveness Probe: `GET /health`
- Readiness Probe: `GET /readiness`
- Observability Metrics: Prometheus-ready telemetry headers (`X-Process-Time`)
