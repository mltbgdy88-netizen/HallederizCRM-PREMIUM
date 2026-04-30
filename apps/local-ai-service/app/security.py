from __future__ import annotations

from fastapi import HTTPException, Request, status

from .config import Settings


def enforce_localhost(request: Request, settings: Settings) -> None:
    if settings.allow_remote_clients:
        return

    host = request.client.host if request.client else None
    if not host:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Client host not detected.")

    normalized = host.lower().strip()
    if normalized not in settings.allowed_client_hosts:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only localhost clients are allowed for this service.",
        )

