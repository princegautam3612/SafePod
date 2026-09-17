import uuid
from datetime import datetime, timezone
from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from .auth import current_user_id, passwords, token_for
from .core import settings
from .db import Base, engine, get_session
from .models import SafetyEvent, TelemetryEvent, Trip, User, WalletLedger
from .schemas import LoginRequest, RegisterRequest, TelemetryBatch, TokenResponse, TripStart
from .scoring import crash_signal, score_trip

app = FastAPI(title="SafeDrive API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=settings().cors_origins.split(","), allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
Instrumentator().instrument(app).expose(app)
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn: await conn.run_sync(Base.metadata.create_all)
@app.get("/healthz")
async def health(): return {"status": "ok"}
@app.post("/v1/auth/register", response_model=TokenResponse, status_code=201)
async def register(data: RegisterRequest, session: AsyncSession = Depends(get_session)):
    if await session.scalar(select(User).where(User.email == data.email.lower())): raise HTTPException(409, "Email already registered")
    user = User(email=data.email.lower(), password_hash=passwords.hash(data.password), consent_version=data.consent_version, consented_at=datetime.now(timezone.utc)); session.add(user); await session.commit()
    return TokenResponse(access_token=token_for(str(user.id)))
@app.post("/v1/auth/login", response_model=TokenResponse)
async def login(data: LoginRequest, session: AsyncSession = Depends(get_session)):
    user = await session.scalar(select(User).where(User.email == data.email.lower()))
    if not user or not passwords.verify(data.password, user.password_hash): raise HTTPException(401, "Invalid email or password")
    return TokenResponse(access_token=token_for(str(user.id)))
@app.post("/v1/trips", status_code=201)
async def start_trip(data: TripStart, user_id: str = Depends(current_user_id), session: AsyncSession = Depends(get_session)):
    trip = Trip(user_id=uuid.UUID(user_id)); session.add(trip); await session.commit(); return {"id": str(trip.id), "status": trip.status}
@app.post("/v1/trips/{trip_id}/telemetry", status_code=202)
async def ingest(trip_id: uuid.UUID, data: TelemetryBatch, user_id: str = Depends(current_user_id), session: AsyncSession = Depends(get_session)):
    trip = await session.scalar(select(Trip).where(Trip.id == trip_id, Trip.user_id == uuid.UUID(user_id), Trip.status == "active"))
    if not trip: raise HTTPException(404, "Active trip not found")
    accepted = 0
    for sample in data.samples:
        exists = await session.scalar(select(TelemetryEvent.id).where(TelemetryEvent.trip_id == trip_id, TelemetryEvent.client_event_id == sample.client_event_id))
        if exists: continue
        event = TelemetryEvent(trip_id=trip_id, **sample.model_dump()); session.add(event); accepted += 1
        crash, confidence = crash_signal(event)
        if crash: session.add(SafetyEvent(trip_id=trip_id, kind="possible_crash", severity="critical", confidence=confidence, details={"requires_user_confirmation": True}))
    await session.commit(); return {"accepted": accepted}
@app.post("/v1/trips/{trip_id}/finish")
async def finish(trip_id: uuid.UUID, user_id: str = Depends(current_user_id), session: AsyncSession = Depends(get_session)):
    trip = await session.scalar(select(Trip).where(Trip.id == trip_id, Trip.user_id == uuid.UUID(user_id), Trip.status == "active"))
    if not trip: raise HTTPException(404, "Active trip not found")
    events = (await session.scalars(select(TelemetryEvent).where(TelemetryEvent.trip_id == trip_id))).all(); score, explanation = score_trip(events)
    trip.status, trip.ended_at, trip.score, trip.score_explanation = "complete", datetime.now(timezone.utc), score, explanation
    points = max(0, 20 + score - 70); session.add(WalletLedger(user_id=trip.user_id, points=points, reason="Completed safe trip", idempotency_key=f"trip:{trip_id}:reward")); await session.commit()
    return {"id": str(trip.id), "score": score, "score_explanation": explanation, "points_awarded": points}
