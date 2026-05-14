from __future__ import annotations

import base64
import json
from collections.abc import AsyncIterator
from typing import Any

from fastapi import Depends, FastAPI, File, Form, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse

from .config import Settings, get_settings
from .label_pipeline import extract_label_payload
from .ollama_client import OllamaStreamingClient
from .rag_store import SectorKnowledgeBase
from .schemas import HealthResponse, RagReloadResponse, TextStreamRequest
from .security import enforce_localhost
from .voice_pipeline import WhisperTranscriber, XttsEngine, pop_complete_sentences, pop_early_chunks


def ndjson_line(payload: dict[str, Any]) -> bytes:
    return (json.dumps(payload, ensure_ascii=False) + "\n").encode("utf-8")


settings = get_settings()
rag = SectorKnowledgeBase(settings.rag_data_path)
rag.reload()
ollama_client = OllamaStreamingClient(
    base_url=settings.ollama_base_url,
    model=settings.ollama_model,
    default_temperature=settings.ollama_temperature,
)
xtts = XttsEngine(
    model_path=settings.piper_model_path,
    config_path=settings.piper_config_path,
    language=settings.tts_language,
    use_cuda=settings.piper_use_cuda,
)
whisper = WhisperTranscriber(
    model_size=settings.whisper_model_size,
    preferred_device=settings.whisper_device,
    compute_type=settings.whisper_compute_type,
)


app = FastAPI(
    title="HALLEDERIZCRM Local AI Backend",
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _enforce(request: Request) -> None:
    enforce_localhost(request, settings)


async def _stream_text_and_audio(
    message: str,
    temperature: float | None,
    include_tokens: bool = True,
) -> AsyncIterator[bytes]:
    rag_context = rag.build_context(
        query=message,
        top_k=settings.rag_top_k,
        max_chars=settings.max_context_chars,
    )
    answer_buffer = ""
    sentence_buffer = ""

    # initial metadata event
    yield ndjson_line(
        {
            "type": "meta",
            "model": settings.ollama_model,
            "speakerReady": xtts.speaker_ready(),
            "ragContextUsed": bool(rag_context.strip()),
        }
    )

    async for token in ollama_client.stream_chat(
        user_message=message,
        rag_context=rag_context,
        temperature=temperature,
    ):
        answer_buffer += token
        sentence_buffer += token
        if include_tokens:
            yield ndjson_line({"type": "token", "text": token})

        completed, remaining = pop_complete_sentences(sentence_buffer)
        sentence_buffer = remaining
        if not completed:
            early_chunks, early_remaining = pop_early_chunks(sentence_buffer)
            if early_chunks:
                completed.extend(early_chunks)
                sentence_buffer = early_remaining
        for sentence in completed:
            if not xtts.speaker_ready():
                yield ndjson_line(
                    {
                        "type": "warning",
                        "code": "speaker_missing",
                        "message": f"Piper ses modeli yok: {settings.piper_model_path}",
                    }
                )
                continue

            try:
                wav_bytes = xtts.synthesize_wav_bytes(sentence)
                if wav_bytes:
                    payload = base64.b64encode(wav_bytes).decode("ascii")
                    yield ndjson_line(
                        {
                            "type": "audio",
                            "format": "wav",
                            "text": sentence,
                            "audioBase64": payload,
                        }
                    )
            except Exception as exc:
                yield ndjson_line({"type": "error", "message": f"Piper synthesis failed: {exc}"})

    tail = sentence_buffer.strip()
    if tail:
        try:
            if xtts.speaker_ready():
                wav_bytes = xtts.synthesize_wav_bytes(tail)
                if wav_bytes:
                    payload = base64.b64encode(wav_bytes).decode("ascii")
                    yield ndjson_line({"type": "audio", "format": "wav", "text": tail, "audioBase64": payload})
        except Exception as exc:
            yield ndjson_line({"type": "error", "message": f"Piper synthesis failed: {exc}"})

    yield ndjson_line({"type": "done", "text": answer_buffer.strip()})


async def _stream_text_only(
    message: str,
    temperature: float | None,
) -> AsyncIterator[bytes]:
    rag_context = rag.build_context(
        query=message,
        top_k=settings.rag_top_k,
        max_chars=settings.max_context_chars,
    )
    answer_buffer = ""

    yield ndjson_line(
        {
            "type": "meta",
            "model": settings.ollama_model,
            "speakerReady": xtts.speaker_ready(),
            "ragContextUsed": bool(rag_context.strip()),
            "audioEnabled": False,
        }
    )

    async for token in ollama_client.stream_chat(
        user_message=message,
        rag_context=rag_context,
        temperature=temperature,
    ):
        answer_buffer += token
        yield ndjson_line({"type": "token", "text": token})

    yield ndjson_line({"type": "done", "text": answer_buffer.strip()})


async def _stream_tts_only(message: str) -> AsyncIterator[bytes]:
    sentence_buffer = message.strip()
    if not sentence_buffer:
        yield ndjson_line({"type": "done", "text": ""})
        return

    completed, remaining = pop_complete_sentences(sentence_buffer)
    if remaining.strip():
        completed.append(remaining.strip())

    for sentence in completed:
        if not xtts.speaker_ready():
            yield ndjson_line(
                {
                    "type": "warning",
                    "code": "speaker_missing",
                    "message": f"Piper ses modeli yok: {settings.piper_model_path}",
                }
            )
            continue

        try:
            wav_bytes = xtts.synthesize_wav_bytes(sentence)
            if wav_bytes:
                payload = base64.b64encode(wav_bytes).decode("ascii")
                yield ndjson_line(
                    {
                        "type": "audio",
                        "format": "wav",
                        "text": sentence,
                        "audioBase64": payload,
                    }
                )
        except Exception as exc:
            yield ndjson_line({"type": "error", "message": f"Piper synthesis failed: {exc}"})

    yield ndjson_line({"type": "done", "text": message.strip()})


async def _probe_ollama_models() -> tuple[bool, bool, bool, str | None]:
    try:
        payload = await ollama_client.client.list()
        models = payload.get("models", []) if isinstance(payload, dict) else []
        names: list[str] = []
        for model in models:
            if isinstance(model, dict):
                name = model.get("name")
                if isinstance(name, str) and name.strip():
                    names.append(name.strip())
        primary_ready = settings.ollama_model in names
        fallback_ready = settings.ollama_fallback_model in names
        return True, primary_ready, fallback_ready, None
    except Exception as exc:
        return False, False, False, str(exc)


@app.get("/health", response_model=HealthResponse)
async def health(request: Request, _guard: None = Depends(_enforce)) -> HealthResponse:
    del request
    ollama_ok, model_ready, fallback_ready, ollama_reason = await _probe_ollama_models()
    return HealthResponse(
        ok=ollama_ok,
        model=settings.ollama_model,
        fallback_model=settings.ollama_fallback_model,
        rag_documents=len(rag.documents),
        speaker_ready=xtts.speaker_ready(),
        whisper_model=settings.whisper_model_size,
        ollama_ok=ollama_ok,
        model_ready=model_ready,
        fallback_ready=fallback_ready,
        ollama_reason=ollama_reason,
    )


@app.post("/api/v1/rag/reload", response_model=RagReloadResponse)
async def reload_rag(request: Request, _guard: None = Depends(_enforce)) -> RagReloadResponse:
    del request
    count = rag.reload()
    return RagReloadResponse(ok=True, documents=count, source=str(settings.rag_data_path))


@app.post("/api/v1/chat/text-stream")
async def chat_text_stream(
    payload: TextStreamRequest,
    request: Request,
    _guard: None = Depends(_enforce),
) -> StreamingResponse:
    del request
    generator = _stream_text_only(payload.message, payload.temperature)
    return StreamingResponse(generator, media_type="application/x-ndjson")


@app.post("/api/v1/tts/stream")
async def tts_stream(
    payload: TextStreamRequest,
    request: Request,
    _guard: None = Depends(_enforce),
) -> StreamingResponse:
    del request
    return StreamingResponse(_stream_tts_only(payload.message), media_type="application/x-ndjson")


@app.post("/api/v1/chat/voice-stream", response_model=None)
async def chat_voice_stream(
    request: Request,
    audio: UploadFile = File(...),
    transcript_only: bool = Form(default=False),
    temperature: float | None = None,
    _guard: None = Depends(_enforce),
) -> StreamingResponse | JSONResponse:
    del request
    data = await audio.read()
    suffix = ".webm"
    filename = audio.filename or ""
    if "." in filename:
        suffix = "." + filename.rsplit(".", 1)[-1].lower()

    transcript = whisper.transcribe_bytes(data, suffix=suffix)
    if not transcript:
        return JSONResponse(status_code=400, content={"ok": False, "error": "No speech detected."})

    async def generator() -> AsyncIterator[bytes]:
        yield ndjson_line({"type": "transcript", "text": transcript})
        if transcript_only:
            yield ndjson_line({"type": "done", "text": transcript})
            return
        async for chunk in _stream_text_and_audio(transcript, temperature, include_tokens=True):
            yield chunk

    return StreamingResponse(generator(), media_type="application/x-ndjson")


@app.post("/api/v1/label/extract")
async def label_extract(
    request: Request,
    image: UploadFile = File(...),
    raw_text_hint: str = Form(default=""),
    _guard: None = Depends(_enforce),
) -> JSONResponse:
    del request
    raw_bytes = await image.read()
    if not raw_bytes:
        return JSONResponse(status_code=400, content={"ok": False, "error": "empty_image"})

    extracted = extract_label_payload(raw_bytes)
    merged_text = "\n".join(
        part.strip()
        for part in [extracted.raw_text, raw_text_hint]
        if isinstance(part, str) and part.strip()
    ).strip()

    return JSONResponse(
        {
            "ok": True,
            "mode": "local_pipeline",
            "rawText": merged_text,
            "ocrConfidence": extracted.ocr_confidence,
            "barcodeCandidates": [
                {
                    "value": item.value,
                    "confidence": item.confidence,
                    "source": item.source,
                }
                for item in extracted.barcode_candidates
            ],
            "warnings": extracted.warnings,
        }
    )
