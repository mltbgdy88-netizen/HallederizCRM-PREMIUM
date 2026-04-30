from __future__ import annotations

from pydantic import BaseModel, Field


class TextStreamRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    session_id: str | None = Field(default=None, max_length=120)
    temperature: float | None = Field(default=None, ge=0.0, le=1.5)


class RagReloadResponse(BaseModel):
    ok: bool
    documents: int
    source: str


class HealthResponse(BaseModel):
    ok: bool
    model: str
    rag_documents: int
    speaker_ready: bool
    whisper_model: str

