from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


def _as_int(name: str, fallback: int) -> int:
    value = os.getenv(name, "").strip()
    if not value:
        return fallback
    try:
        return int(value)
    except ValueError:
        return fallback


def _as_bool(name: str, fallback: bool) -> bool:
    value = os.getenv(name, "").strip().lower()
    if not value:
        return fallback
    return value in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    host: str
    port: int
    ollama_base_url: str
    ollama_model: str
    ollama_temperature: float
    rag_data_path: Path
    rag_top_k: int
    max_context_chars: int
    tts_language: str
    piper_model_path: Path
    piper_config_path: Path
    piper_use_cuda: bool
    whisper_model_size: str
    whisper_device: str
    whisper_compute_type: str
    allow_remote_clients: bool
    allow_origins: list[str]
    allowed_client_hosts: set[str]
    enable_fp16: bool


def get_settings() -> Settings:
    root = Path(__file__).resolve().parents[1]
    default_rag_path = root / "sector_data.json"
    default_piper_model = root / "assets" / "tr_TR-dfki-medium.onnx"
    default_piper_config = root / "assets" / "tr_TR-dfki-medium.onnx.json"

    allow_origins_raw = os.getenv(
        "LOCAL_AI_ALLOW_ORIGINS",
        "http://127.0.0.1:3000,http://localhost:3000,http://127.0.0.1:3100,http://localhost:3100",
    )
    allow_origins = [part.strip() for part in allow_origins_raw.split(",") if part.strip()]

    return Settings(
        host=os.getenv("LOCAL_AI_HOST", "127.0.0.1").strip() or "127.0.0.1",
        port=_as_int("LOCAL_AI_PORT", 8008),
        ollama_base_url=os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").strip(),
        ollama_model=os.getenv("OLLAMA_MODEL", "RefinedNeuro/Turkcell-LLM-7b-v1:latest").strip(),
        ollama_temperature=float(os.getenv("OLLAMA_TEMPERATURE", "0.2") or 0.2),
        rag_data_path=Path(os.getenv("SECTOR_DATA_PATH", str(default_rag_path))).resolve(),
        rag_top_k=_as_int("RAG_TOP_K", 3),
        max_context_chars=_as_int("RAG_MAX_CONTEXT_CHARS", 2200),
        tts_language=os.getenv("TTS_LANGUAGE", "tr").strip() or "tr",
        piper_model_path=Path(os.getenv("PIPER_MODEL_PATH", str(default_piper_model))).resolve(),
        piper_config_path=Path(os.getenv("PIPER_CONFIG_PATH", str(default_piper_config))).resolve(),
        piper_use_cuda=_as_bool("PIPER_USE_CUDA", False),
        whisper_model_size=os.getenv("WHISPER_MODEL_SIZE", "small").strip() or "small",
        whisper_device=os.getenv("WHISPER_DEVICE", "auto").strip() or "auto",
        whisper_compute_type=os.getenv("WHISPER_COMPUTE_TYPE", "float16").strip() or "float16",
        allow_remote_clients=_as_bool("LOCAL_AI_ALLOW_REMOTE", False),
        allow_origins=allow_origins,
        allowed_client_hosts={"127.0.0.1", "::1", "::ffff:127.0.0.1", "localhost"},
        enable_fp16=_as_bool("LOCAL_AI_ENABLE_FP16", True),
    )

