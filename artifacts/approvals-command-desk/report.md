# Approvals Command Desk Screenshot QA

- Date: 2026-05-22
- Base: http://localhost:3000
- Route: `/onaylar`

## Files

- `approvals-1366x768.png`
- `approvals-1920x1080.png`
- `approvals-mobile.png`

## Checks

| Check | Result |
|-------|--------|
| Policy band visible | Pass |
| Three-column desktop | Pass |
| Technical leakage | Pass (none observed) |
| Horizontal overflow | Pass (browser QA) |

## Known gaps

- Decision panel action buttons pinned to bottom after layout fix; re-verify after deploy.
- Mobile stack at ≤860px — confirm with hard refresh at 390×844.
