from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
class RegisterRequest(BaseModel): email: EmailStr; password: str = Field(min_length=12); consent_version: str
class LoginRequest(BaseModel): email: EmailStr; password: str
class TokenResponse(BaseModel): access_token: str; token_type: str = "bearer"
class TripStart(BaseModel): client_trip_id: str = Field(min_length=8, max_length=64)
class TelemetrySample(BaseModel):
    client_event_id: str; occurred_at: datetime; latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180); speed_mps: float | None = Field(default=None, ge=0, le=100)
    accuracy_m: float | None = Field(default=None, ge=0, le=1000); acceleration_g: float | None = Field(default=None, ge=0, le=15)
    event_type: str = "sample"; payload: dict = Field(default_factory=dict)
class TelemetryBatch(BaseModel): samples: list[TelemetrySample] = Field(min_length=1, max_length=500)
