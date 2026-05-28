# Decisions

## Navigation IA

Sidebar and hub layout: [`NAVIGATION_IA.md`](./NAVIGATION_IA.md). Operation automation target: [`OPERATION_AUTOMATION_TARGET.md`](./OPERATION_AUTOMATION_TARGET.md).

## UI first

UI language must be locked before backend engine or integration work starts.

## Product style

The product must be calm, premium, corporate, focused, and operational.

Avoid demo dashboard feeling.

Avoid excessive KPI, counter, radar, and analysis blocks on main work screens.

## Dashboard

Dashboard is not a KPI showcase.

It should show next work and fast direction.

## Quick Operation

Quick Operation is the main operation screen.

No duplicate top and bottom actions.

Right panel order:
1. Cari Ozeti
2. Islem Ozeti
3. Uyari / Onay

## Approvals

Approvals should look like an operation desk, not a card showcase.

## Settings

Settings should be a clean form and tabs center.

Rule language must be user-facing:
- Evet
- Hayir
- Kosullu
- Onay gerekir
- Otomatik kapali

## WhatsApp

Conversation list should stay simple.

Use WhatsApp green and neutral colors.

## Stock

Stock detail must open only from the Detay button.

Row click only selects row or updates side panel.

## Warehouse

Warehouse module name: Depo Hazirlik.

Flow:
Depo Hazirlik -> Urun Teslimi -> Arsiv / PDF.

Prep slip must include print action.

## AI and approvals

AI suggests, summarizes, and warns.

AI does not directly mutate business data.

**Sidebar:** `Yapay Zeka` (`/ai`) is the system second-brain entry (Final operator hub). Dashboard AI column remains dashboard-only.

Financial documents, prices, payment links, invoices, statements, returns, and risky actions require approval.
