# Agent Instructions

Use this file as a short instruction guide for Cursor agents.

## First read

Before UI work, read:

- crm-ui-blueprint.md
- crm-backlog.md
- cursor-screen-prompt.md
- reference-dashboard-v1.png

## Current priority

Implement the homepage/dashboard UI first.

## Scope

For UI tasks:

- work mainly inside apps/web
- use shared UI packages only when useful
- do not touch backend/database/migrations unless explicitly asked

## Dashboard rules

- Right AI assistant column appears only on dashboard.
- AI assistant top panel should look like a video-capable screen.
- Sidebar must reserve a large logo area.
- No AI Assistant item in sidebar.
- No expanding archive submenu in sidebar.

## UX rules

- Show toast feedback for successful actions.
- Disable successful mutation buttons to prevent duplicate actions.
- Row click should open detail modal on table/list pages.
- Use compact tables with at least 20 visible rows where possible.

## Language

Use Turkish for user-facing UI labels.
