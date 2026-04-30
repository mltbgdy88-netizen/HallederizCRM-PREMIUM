from __future__ import annotations

import io
import os
import re
from pathlib import Path
from tempfile import NamedTemporaryFile
from threading import Lock

import numpy as np
import soundfile as sf
import torch
from faster_whisper import WhisperModel
from piper_onnx import Piper


SENTENCE_BREAK_CHARS = {".", "!", "?"}
MARKDOWN_RE = re.compile(r"[*_`#>\[\]]")
EARLY_SPLIT_RE = re.compile(r"[,;:]")


def normalize_answer_text(text: str) -> str:
    cleaned = text.strip()
    cleaned = MARKDOWN_RE.sub("", cleaned)
    cleaned = cleaned.replace("\r", " ").replace("\n", " ")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def pop_complete_sentences(buffer: str) -> tuple[list[str], str]:
    completed: list[str] = []
    start = 0
    for index, char in enumerate(buffer):
        if char in SENTENCE_BREAK_CHARS:
            segment = buffer[start : index + 1].strip()
            if segment:
                completed.append(segment)
            start = index + 1

    remaining = buffer[start:].lstrip() if start < len(buffer) else ""
    return completed, remaining


def pop_early_chunks(buffer: str, min_chunk_chars: int = 42) -> tuple[list[str], str]:
    normalized = normalize_answer_text(buffer)
    if len(normalized) < min_chunk_chars:
        return [], buffer

    # Prefer punctuation boundaries first to start speaking early.
    for match in EARLY_SPLIT_RE.finditer(normalized):
        if match.start() + 1 < min_chunk_chars:
            continue
        left = normalized[: match.start() + 1].strip()
        right = normalized[match.start() + 1 :].strip()
        if left:
            return [left], right

    # fallback: split by words when punctuation does not arrive quickly
    words = normalized.split(" ")
    if len(words) < 8:
        return [], buffer
    left_words = words[:8]
    right_words = words[8:]
    left = " ".join(left_words).strip()
    right = " ".join(right_words).strip()
    if not left:
        return [], buffer
    return [left], right


class XttsEngine:
    def __init__(self, model_path: Path, config_path: Path, language: str, use_cuda: bool) -> None:
        self.model_path = model_path
        self.config_path = config_path
        self.language = language
        self.use_cuda = use_cuda
        self._model: Piper | None = None
        self._load_lock = Lock()

    def speaker_ready(self) -> bool:
        return (
            self.model_path.exists()
            and self.model_path.is_file()
            and self.config_path.exists()
            and self.config_path.is_file()
        )

    def _load(self) -> Piper:
        if self._model is not None:
            return self._model

        with self._load_lock:
            if self._model is not None:
                return self._model

            model = Piper(str(self.model_path), str(self.config_path))
            self._model = model
            return model

    def synthesize_wav_bytes(self, text: str) -> bytes:
        clean_text = normalize_answer_text(text)
        if not clean_text:
            return b""

        if not self.speaker_ready():
            raise FileNotFoundError(
                f"Piper voice files not found: {self.model_path} and/or {self.config_path}."
            )

        buffer = io.BytesIO()
        model = self._load()
        samples, sample_rate = model.create(clean_text)
        sf.write(buffer, np.asarray(samples, dtype=np.float32), sample_rate, format="WAV")
        return buffer.getvalue()


class WhisperTranscriber:
    def __init__(self, model_size: str, preferred_device: str, compute_type: str) -> None:
        self.model_size = model_size
        self.preferred_device = preferred_device
        self.compute_type = compute_type
        self._model: WhisperModel | None = None
        self._load_lock = Lock()

    def _resolve_device(self) -> tuple[str, str]:
        if self.preferred_device == "cpu":
            return "cpu", "int8"

        if self.preferred_device == "cuda" and torch.cuda.is_available():
            return "cuda", self.compute_type

        if self.preferred_device == "auto":
            if torch.cuda.is_available():
                return "cuda", self.compute_type
            return "cpu", "int8"

        return "cpu", "int8"

    def _load(self) -> WhisperModel:
        if self._model is not None:
            return self._model

        with self._load_lock:
            if self._model is not None:
                return self._model
            device, compute_type = self._resolve_device()
            self._model = WhisperModel(
                self.model_size,
                device=device,
                compute_type=compute_type,
            )
            return self._model

    def transcribe_bytes(self, audio_bytes: bytes, suffix: str = ".webm") -> str:
        if not audio_bytes:
            return ""

        model = self._load()
        temp_path: str | None = None
        try:
            with NamedTemporaryFile(delete=False, suffix=suffix) as handle:
                handle.write(audio_bytes)
                temp_path = handle.name

            segments, _info = model.transcribe(
                temp_path,
                language="tr",
                vad_filter=True,
                beam_size=1,
                best_of=1,
                temperature=0.0,
            )
            parts = [segment.text.strip() for segment in segments if segment.text.strip()]
            return " ".join(parts).strip()
        finally:
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)

