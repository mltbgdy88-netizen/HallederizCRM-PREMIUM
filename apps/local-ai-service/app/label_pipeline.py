from __future__ import annotations

import io
from dataclasses import dataclass, field
from typing import Any


@dataclass
class LabelCandidate:
    value: str
    confidence: float
    source: str


@dataclass
class LabelExtractionResult:
    raw_text: str = ""
    warnings: list[str] = field(default_factory=list)
    barcode_candidates: list[LabelCandidate] = field(default_factory=list)
    ocr_confidence: float | None = None


def _clamp_conf(value: float) -> float:
    if value < 0:
        return 0.0
    if value > 1:
        return 1.0
    return value


def _merge_text(lines: list[str]) -> str:
    cleaned = [line.strip() for line in lines if line and line.strip()]
    return "\n".join(cleaned).strip()


def _load_image(image_bytes: bytes, warnings: list[str]):
    try:
        from PIL import Image  # type: ignore
    except Exception:
        warnings.append("Pillow kutuphanesi yuklu degil, gorsel okunamadi.")
        return None

    try:
        return Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        warnings.append("Gorsel dosyasi acilamadi.")
        return None


def _extract_barcode_candidates(image: Any, warnings: list[str]) -> list[LabelCandidate]:
    if image is None:
        return []

    try:
        import zxingcpp  # type: ignore
    except Exception:
        warnings.append("zxing-cpp bulunamadi, barkod decode atlandi.")
        return []

    try:
        decoded = zxingcpp.read_barcodes(image)
    except Exception:
        warnings.append("Barkod decode calisirken hata olustu.")
        return []

    candidates: list[LabelCandidate] = []
    seen: set[str] = set()
    for item in decoded:
        raw_value = str(getattr(item, "text", "") or "").strip()
        if not raw_value or raw_value in seen:
            continue
        seen.add(raw_value)
        source = "barcode"
        fmt = getattr(item, "format", None)
        if fmt is not None:
            source = f"barcode:{str(fmt)}"
        candidates.append(
            LabelCandidate(
                value=raw_value,
                confidence=0.96,
                source=source,
            )
        )
    return candidates


def _ocr_with_rapidocr(image: Any, warnings: list[str]) -> tuple[str, float | None]:
    if image is None:
        return "", None

    try:
        import numpy as np  # type: ignore
        from rapidocr_onnxruntime import RapidOCR  # type: ignore
    except Exception:
        warnings.append("RapidOCR bulunamadi, OCR denemesi atlandi.")
        return "", None

    try:
        engine = RapidOCR()
        result, _ = engine(np.asarray(image))
    except Exception:
        warnings.append("RapidOCR calisirken hata olustu.")
        return "", None

    if not result:
        return "", None

    lines: list[str] = []
    scores: list[float] = []
    for item in result:
        if not isinstance(item, (list, tuple)) or len(item) < 3:
            continue
        text = str(item[1] or "").strip()
        if text:
            lines.append(text)
        try:
            score = float(item[2])
            scores.append(_clamp_conf(score))
        except Exception:
            continue

    merged = _merge_text(lines)
    conf = sum(scores) / len(scores) if scores else None
    return merged, conf


def _ocr_with_tesseract(image: Any, warnings: list[str]) -> tuple[str, float | None]:
    if image is None:
        return "", None

    try:
        import pytesseract  # type: ignore
    except Exception:
        warnings.append("pytesseract bulunamadi, ikincil OCR atlandi.")
        return "", None

    try:
        pytesseract.get_tesseract_version()
    except Exception:
        warnings.append("Tesseract binary bulunamadi, ikincil OCR atlandi.")
        return "", None

    try:
        text = str(pytesseract.image_to_string(image, lang="eng+tur") or "").strip()
    except Exception:
        warnings.append("Tesseract OCR calisirken hata olustu.")
        return "", None

    if not text:
        return "", None

    conf_value: float | None = None
    try:
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        scores: list[float] = []
        for raw in data.get("conf", []):
            try:
                value = float(raw)
            except Exception:
                continue
            if value >= 0:
                scores.append(_clamp_conf(value / 100.0))
        if scores:
            conf_value = sum(scores) / len(scores)
    except Exception:
        conf_value = None

    return text, conf_value


def extract_label_payload(image_bytes: bytes) -> LabelExtractionResult:
    warnings: list[str] = []
    image = _load_image(image_bytes, warnings)

    barcode_candidates = _extract_barcode_candidates(image, warnings)

    rapid_text, rapid_conf = _ocr_with_rapidocr(image, warnings)
    tess_text, tess_conf = _ocr_with_tesseract(image, warnings)

    raw_text = rapid_text.strip() or tess_text.strip()
    ocr_conf = rapid_conf if rapid_text.strip() else tess_conf

    return LabelExtractionResult(
        raw_text=raw_text,
        warnings=warnings,
        barcode_candidates=barcode_candidates,
        ocr_confidence=ocr_conf,
    )
