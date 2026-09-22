from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes.auth import router as auth_router
from app.api.v1.routes.dashboard import router as dashboard_router
from app.api.v1.routes.users import router as users_router
from app.core.config import settings
from app.db.init_db import init_db

app = FastAPI(
    title="AI-Powered Land Transaction Verification System",
    version="0.1.0",
    description=(
        "Academic decision-support system for land transaction verification and fraud risk analysis. "
        "AI output is advisory and requires human review."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(dashboard_router)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "service": "land-verification-backend"}


@app.get("/")
def root() -> dict:
    return {
        "message": "AI-Powered Land Transaction Verification and Fraud Risk Detection System",
        "status": "initialized",
        "note": "This prototype uses synthetic/demo data for academic development and testing.",
    }
