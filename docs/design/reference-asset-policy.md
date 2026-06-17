# Reference Asset Policy (AUDIT-FIX-2)

This document defines the repository policy for HallederizCRM-PREMIUM UI reference assets, export artifacts, duplicate/derived files, and safe cleanup strategy.

## Scope

- docs/design/reference/**
- docs/design/export/**
- docs/design/export/*.zip

## Current inventory

### docs/design/reference/**

Purpose:
- Canonical UI reference source for approved and draft design screenshots.
- Used by code agents, UI QA, and implementation prompts as the source of truth.

Policy:
- This folder is the canonical design reference location.
- UI rules, checklists, and implementation prompts must reference this folder rather than export folders.

Category:
- Canonical approved reference and draft reference pool.

### docs/design/export/HallederizCRM-Referans-Gorseller/**

Purpose:
- Packaged/exported copy of the reference images, grouped for distribution.

Observed source statement:
- The export README states that the source is docs/design/reference/.

Policy:
- This folder is a derived export artifact.
- It must not be treated as the canonical source of truth.

Category:
- Derived export artifact.

### docs/design/export/HallederizCRM-Referans-Gorseller.zip

Purpose:
- ZIP package of the exported reference image set.

Policy:
- ZIP exports should not be kept as permanent repository content.
- If a packaged reference set is needed, prefer release assets, object storage, or a separate design-assets repository.

Category:
- Derived export artifact.

## Policy decisions

### 1. Canonical source

The canonical source is:

docs/design/reference/

Rules:
- Approved UI references live here.
- Draft UI references may live here when clearly marked.
- Code agents and QA reports should link to this folder.
- Export folders must not become a second source of truth.

### 2. Export folder status

docs/design/export/ is not a permanent source of truth.

Default decision:
- Do not keep export artifacts in the repository permanently.

Temporary exception:
- Export artifacts may stay temporarily when a distribution package is required and no external storage/release asset exists yet.
- Temporary exports must clearly state their source and derived status.

### 3. ZIP storage recommendation

Recommended locations for ZIP packages:
- GitHub/GitLab release asset
- Object storage such as S3, MinIO, or Azure Blob
- Separate design-assets repository, optionally with Git LFS

If a ZIP remains in the repository temporarily:
- Define ownership.
- Define an expiration or cleanup date.
- Document that it is derived from docs/design/reference/.

## Classification guide

Canonical approved reference:
- Location: docs/design/reference/*.png
- Used for UI fidelity and design QA.

Draft reference:
- Location: docs/design/reference/ when clearly marked as draft.
- Must not be treated as approved until reviewed.

Export artifact:
- Location: docs/design/export/**
- Must be derived from docs/design/reference/.

Duplicate or derived image:
- Same image copied under another name or directory.
- Prefer manifest/link/reference instead of physical duplication.

Unknown asset:
- Image or ZIP with unclear source or unclear purpose.
- Do not promote into docs/design/reference/ until source and purpose are verified.

## Safe cleanup strategy

This document is policy-only. It does not delete or move assets.

A future cleanup PR may remove export artifacts only after these checks:

1. Confirm docs/design/reference/ contains the canonical required screenshots.
2. Confirm docs/design/export/** is derived from docs/design/reference/.
3. Confirm no active docs, prompts, or scripts depend on export paths as canonical input.
4. Move ZIP packages to release assets, object storage, or a design-assets repository if distribution is still needed.
5. Keep docs/design/reference/** intact.
6. Run the standard gates after cleanup.

## Guardrails for future cleanup PRs

Do not delete:
- docs/design/reference/**
- approved reference screenshots
- README or catalog documents that define design source of truth

Allowed in a separate cleanup PR:
- Remove derived export folders after verification
- Remove ZIP packages after external storage/release asset is available
- Update docs to point to docs/design/reference/

Not allowed:
- Delete canonical reference images without product/design approval
- Mix export cleanup with UI code changes
- Mix asset cleanup with route, backend, API, database, dependency, or workflow changes

## Final decision

- Canonical source: docs/design/reference/
- Export folders: derived artifacts
- ZIP packages: should live outside the repository when possible
- Cleanup should be done in a separate, small, reviewable PR
