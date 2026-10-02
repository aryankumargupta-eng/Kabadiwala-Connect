# Architecture Decisions

This document records important technical and product decisions for Kabadiwala Connect. Future changes should preserve these decisions unless a new ADR explicitly supersedes the relevant one.

## ADR-001

**Decision:** Use React, TypeScript, and Vite for the frontend.

**Reason:** The project is a responsive field-oriented web application that benefits from a fast development server, typed UI code, and a clear component model.

**Implication:** New screens should be implemented as React components and should follow the existing client structure.

## ADR-002

**Decision:** Use Express as the Node.js application server.

**Reason:** Express already serves the production frontend assets and provides a stable host for the API layer.

**Implication:** Do not replace the server with another framework without a documented migration decision.

## ADR-003

**Decision:** Use tRPC for frontend-backend communication.

**Reason:** tRPC provides type-safe procedures shared between the React client and the server router, reducing mismatched request and response shapes.

**Implication:** New application API operations should be added as tRPC procedures rather than ad hoc fetch endpoints.

## ADR-004

**Decision:** Use Zod for API boundary validation.

**Reason:** All client-controlled input must be checked at runtime before business logic or persistence is executed.

**Implication:** Every new query or mutation that accepts input must define or reuse a Zod schema.

## ADR-005

**Decision:** Use MySQL with Drizzle ORM for persistence.

**Reason:** The project already uses a relational data model for material lots, handovers, recovery zones, and traceability records. Drizzle provides typed database access and migration tooling.

**Implication:** Database operations belong in server-side data-access functions and must not be implemented in React components.

## ADR-006

**Decision:** Keep server routes, authentication context, cookies, and infrastructure helpers under `server/_core/`.

**Reason:** Cross-cutting server concerns need a predictable location separate from domain procedures and database functions.

**Implication:** Authentication and request-context behavior must not be duplicated inside individual UI screens.

## ADR-007

**Decision:** Enforce authorization on the server.

**Reason:** UI role switches and hidden buttons are not security controls. Administrative actions, such as ingestion, must be protected independently of the client.

**Implication:** Every protected procedure must verify the authenticated user and required role server-side.

## ADR-008

**Decision:** Store material lots and handovers as separate traceability domains.

**Reason:** A material lot represents collected material, while a handover represents a later transfer and confirmation event. Separating them preserves lifecycle history and auditability.

**Implication:** Do not overwrite lot information to represent a handover. Create a related handover record with its own reference and status.

## ADR-009

**Decision:** Use explicit status values for lot, payment, and transaction lifecycles.

**Reason:** Status transitions are central to the collector-recycler workflow and must be predictable for reporting and compliance.

**Implication:** Use the existing status enums and expand them deliberately through a documented decision; do not introduce arbitrary status strings.

## ADR-010

**Decision:** Treat AI image classification and market valuation as advisory.

**Reason:** Image quality, material mixtures, local price volatility, and model uncertainty can make automated estimates incorrect.

**Implication:** The UI must present AI results as suggestions with confidence or explanation. A human collector, recycler, or authenticator must be able to review or override the suggestion.

## ADR-011

**Decision:** Keep the first AI estimator local and lightweight for the prototype.

**Reason:** The field pilot needs immediate feedback without requiring a remote model service or exposing images to an external provider.

**Implication:** The current estimator may use local image features and market-rate rules. A production ML model requires a separate evaluation, privacy, hosting, and monitoring decision.

## ADR-012

**Decision:** Use photo references rather than storing raw image binaries in domain records.

**Reason:** Large media files should be handled by storage infrastructure while business records retain stable references and metadata.

**Implication:** Lot and handover records should store a `photoReference` or equivalent storage identifier.

## ADR-013

**Decision:** Support offline-aware collector workflows.

**Reason:** Collectors may work in areas with intermittent connectivity, so basic capture and draft behavior should remain usable when the network drops.

**Implication:** The UI must clearly distinguish local/offline drafts from server-confirmed records. Offline actions must not be presented as permanently persisted until synchronization succeeds.

## ADR-014

**Decision:** Normalize municipal and satellite recovery-zone data into one shared domain shape.

**Reason:** Different ingestion sources should be queryable through one application model while retaining provenance, confidence, and verification status.

**Implication:** Source-specific adapters belong in `server/ingestion/`; source-specific formats must not leak into frontend components.

## ADR-015

**Decision:** Keep translations centralized in the i18n layer.

**Reason:** The product supports English, Hindi, and Marathi, and duplicated strings would make language consistency difficult.

**Implication:** New user-facing strings should be added to the translation structure when they are part of a reusable workflow.

## ADR-016

**Decision:** Use the existing green and saffron design language as the product visual foundation.

**Reason:** Green communicates recycling, trust, and completion, while saffron highlights pricing, safety, and attention.

**Implication:** New screens must follow `PRD/DESIGN.md` and reuse existing CSS tokens and component patterns.

## ADR-017

**Decision:** Keep business logic separate from presentation.

**Reason:** Pricing calculations, status transitions, ingestion normalization, and persistence rules must be testable without rendering the UI.

**Implication:** React components should coordinate user interaction and display state; server services or shared pure functions should own domain behavior.

## ADR-018

**Decision:** Use one deployable Node.js process for the current project.

**Reason:** Express can serve the built frontend and tRPC API together, keeping deployment simple for the field pilot.

**Implication:** The production build must continue to produce frontend assets and a server bundle that can run together. A future split deployment requires a new ADR.

## ADR-019

**Decision:** Preserve evidence and confirmation data for handover records.

**Reason:** The core product value is a more formal, traceable recycling chain. Photos, weights, location, handover codes, timestamps, and confirmation statuses support that goal.

**Implication:** New handover features should add evidence or status metadata rather than reducing the record to a final amount alone.

## ADR-020

**Decision:** Review architecture changes against `ARCHITECTURE.md`, `DESIGN.md`, and this document.

**Reason:** These documents define how the application is structured, how it should look, and which technical choices are intentional.

**Implication:** Before changing a framework, persistence layer, API style, status model, or visual foundation, update or supersede the relevant ADR instead of silently changing direction.
