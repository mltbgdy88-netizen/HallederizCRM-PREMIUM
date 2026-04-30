from __future__ import annotations

from collections.abc import AsyncIterator

import ollama


SYSTEM_PROMPT = """Sen HallederizCRM icin yerel calisan bir asistan modelisin.
- Cevaplari kisa, net ve operasyon odakli ver.
- Kullanici sorusu disina cikma.
- Finansal veya operasyonel risk varsa "onay gerekir" ifadesini belirt.
- Sadece Turkce cevap ver.
"""


class OllamaStreamingClient:
    def __init__(self, base_url: str, model: str, default_temperature: float) -> None:
        self.base_url = base_url
        self.model = model
        self.default_temperature = default_temperature
        self.client = ollama.AsyncClient(host=base_url)

    async def stream_chat(
        self,
        user_message: str,
        rag_context: str = "",
        temperature: float | None = None,
    ) -> AsyncIterator[str]:
        effective_temp = self.default_temperature if temperature is None else temperature

        user_payload = user_message.strip()
        if rag_context.strip():
            user_payload = (
                f"Baglam:\n{rag_context.strip()}\n\n"
                f"Kullanici Sorusu:\n{user_message.strip()}\n\n"
                "Yanitta baglami kullan ama gereksiz detay verme."
            )

        stream = await self.client.chat(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_payload},
            ],
            stream=True,
            options={"temperature": effective_temp},
        )

        async for chunk in stream:
            message = chunk.get("message", {})
            token = message.get("content", "")
            if token:
                yield token

