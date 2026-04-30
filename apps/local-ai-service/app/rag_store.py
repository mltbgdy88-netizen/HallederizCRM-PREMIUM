from __future__ import annotations

import json
import math
import re
from dataclasses import dataclass
from pathlib import Path


TOKEN_RE = re.compile(r"[a-zA-Z0-9çğıöşüÇĞİÖŞÜ]{2,}")


@dataclass(frozen=True)
class RagDocument:
    doc_id: str
    title: str
    content: str
    tags: tuple[str, ...]

    @property
    def searchable_text(self) -> str:
        tags = " ".join(self.tags)
        return f"{self.title}\n{self.content}\n{tags}"


def _tokenize(text: str) -> list[str]:
    if not text:
        return []
    return [token.lower() for token in TOKEN_RE.findall(text)]


def _score(query_tokens: list[str], doc: RagDocument) -> float:
    if not query_tokens:
        return 0.0
    doc_tokens = _tokenize(doc.searchable_text)
    if not doc_tokens:
        return 0.0

    query_set = set(query_tokens)
    doc_set = set(doc_tokens)
    overlap = query_set.intersection(doc_set)
    if not overlap:
        return 0.0

    tf = sum(doc_tokens.count(token) for token in overlap)
    density = tf / max(len(doc_tokens), 1)
    return len(overlap) + math.log1p(tf) + density * 8


class SectorKnowledgeBase:
    def __init__(self, source_path: Path) -> None:
        self.source_path = source_path
        self._docs: list[RagDocument] = []

    @property
    def documents(self) -> list[RagDocument]:
        return self._docs

    def reload(self) -> int:
        if not self.source_path.exists():
            self._docs = []
            return 0

        raw = json.loads(self.source_path.read_text(encoding="utf-8"))
        items = raw.get("documents", []) if isinstance(raw, dict) else []

        docs: list[RagDocument] = []
        for index, row in enumerate(items):
            if not isinstance(row, dict):
                continue
            doc_id = str(row.get("id") or f"doc-{index+1}")
            title = str(row.get("title") or f"Belge {index+1}").strip()
            content = str(row.get("content") or "").strip()
            tags_raw = row.get("tags") or []
            tags = tuple(str(tag).strip() for tag in tags_raw if str(tag).strip())
            if not content:
                continue
            docs.append(
                RagDocument(
                    doc_id=doc_id,
                    title=title,
                    content=content,
                    tags=tags,
                )
            )

        self._docs = docs
        return len(docs)

    def build_context(self, query: str, top_k: int, max_chars: int) -> str:
        docs = self._docs
        if not docs:
            return ""

        query_tokens = _tokenize(query)
        ranked = sorted(
            ((doc, _score(query_tokens, doc)) for doc in docs),
            key=lambda item: item[1],
            reverse=True,
        )

        selected = [doc for doc, score in ranked if score > 0][: max(top_k, 1)]
        if not selected:
            selected = docs[:1]

        blocks: list[str] = []
        used = 0
        for doc in selected:
            block = f"[{doc.doc_id}] {doc.title}\n{doc.content}"
            next_len = used + len(block) + (2 if blocks else 0)
            if next_len > max_chars:
                break
            blocks.append(block)
            used = next_len

        return "\n\n".join(blocks)

