# Project Memory

This document describes the current state of Kabadiwala Connect. It is intentionally temporary and should be updated as implementation progress changes. Permanent technical choices belong in [DECISIONS.md](./DECISIONS.md).

## Current Status

The project is a working recycling marketplace and field-pilot prototype with:

- collector and recycler workspaces
- material-lot creation
- photo upload and local AI-assisted material suggestion
- indicative market-price calculations
- recycler matching and offer workflows
- offer acceptance and renegotiation
- handover confirmation and receipt reference creation
- activity/ledger views
- recovery-zone ingestion and map views
- multilingual UI foundations for English, Hindi, and Marathi
- offline-aware status messaging
- architecture, design, product-requirement, and decision documentation

The project is not yet production-ready. Some workflows remain demo-oriented and require stronger persistence, validation, synchronization, and verification before a real field deployment.

## Completed

- Project frontend and backend setup
- React + TypeScript + Vite client
- Express + tRPC server
- Drizzle ORM configuration
- MySQL database configuration
- Shared TypeScript and Zod validation patterns
- Server request context and session-cookie utilities
- Collector dashboard
- Recycler dashboard
- Collector/recycler role switching
- Material lot creation flow
- Material category and approximate-weight entry
- Photo upload preview
- Local heuristic image analysis for material suggestions
- Indicative value calculation from category rate and weight
- Recycler offer creation
- Collector offer inbox
- Offer acceptance and renegotiation interactions
- Live collector-recycler chat prototype
- Handover confirmation modal
- Terms checkbox gating for receipt creation
- Handover reference and success state
- Activity ledger with paid and pending statuses
- Price board with local-rate presentation
- Recovery-zone list, map, filtering, and reporting flows
- Municipal and satellite recovery-zone ingestion adapters
- Admin protection for recovery-zone ingestion
- Field-data and evidence overview screens
- Offline-mode UI indicators and user messaging
- Voice guide prototype
- English, Hindi, and Marathi translation foundations
- Product requirement documentation
- Architecture documentation
- Design system documentation
- Technical decision documentation

## Current Task

**TASK-013: Stabilize prototype workflows for production-like field testing**

The immediate focus is to make the currently demonstrated workflows reliable and consistent:

1. validate lot and handover persistence end-to-end
2. replace demo-only success behavior with confirmed server responses
3. make AI results clearly advisory and reviewable
4. resolve existing TypeScript errors
5. verify responsive behavior on collector and recycler mobile layouts

## Known Issues and Limitations

- The repository currently has an existing TypeScript error in `client/src/pages/RecoveryZones.tsx`.
- Some collector and recycler data is demo/static data rather than fully persisted domain data.
- The local image estimator is a heuristic prototype, not a trained production computer-vision model.
- AI image analysis does not yet provide a calibrated confidence model or formal evaluation metrics.
- Market prices are indicative and should not be treated as live or guaranteed quotes.
- The receipt/handover flow still contains demo-oriented values and needs complete server-backed lifecycle handling.
- Offline behavior communicates connectivity status but does not yet provide a complete durable queue and retry protocol for every mutation.
- Authentication and role behavior require full end-to-end verification for production deployment.
- Payment confirmation is represented as a traceability status, not as a full payment-gateway integration.
- Recycler matching and offer records require broader persistence and status synchronization.
- Automated coverage is stronger for server/recovery-zone areas than for the full UI workflow.
- The current architecture and design documents describe intended boundaries, but some legacy UI logic remains concentrated in `client/src/App.tsx`.

## Current Data and Workflow Notes

### Collector

- Creates a lot with category, subcategory, weight, location, and photo.
- Receives a local image-based category suggestion.
- Reviews an indicative value.
- Selects or interacts with recycler offers.
- Confirms handover terms through a checkbox.
- Creates a handover/receipt reference.
- Sees an authenticator follow-up message.

### Recycler

- Reviews incoming lots.
- Enters an offer amount.
- Sends offers to collectors.
- Uses chat or renegotiation interactions.
- Reviews incoming and active handover states in the recycler console.

### Recovery zones

- Recovery zones are normalized into one model.
- Municipal and satellite sources are retained as provenance.
- Satellite data is marked unverified until a human verifies it.
- Admin access is required to run ingestion.

## Verification State

### Recently changed

- Payment-sequence content was removed from the handover modal.
- The collector confirmation checkbox now explicitly controls whether the receipt button is enabled.
- Collector copy now states that the lot was created and an authenticator will contact the user.
- Local image analysis was added to suggest material category and estimated value.
- PRD, architecture, design, and technical-decision documents were added under `PRD/`.

### Validation

- `npm run check` can be run using a process-scoped PowerShell execution-policy bypass.
- The current type-check is blocked by an existing error in `client/src/pages/RecoveryZones.tsx`.
- The payment and handover changes should be rechecked after the recovery-zone type error is addressed.
- A full production build and browser smoke test are still recommended after type-check repair.

## Next Steps

### Priority 1: Fix correctness blockers

- Resolve the existing `RecoveryZones.tsx` TypeScript error.
- Run `npm run check`.
- Run the targeted server tests.
- Run the production build.

### Priority 2: Complete persisted workflows

- Persist collector-created lots through the `lots.create` procedure.
- Persist offer creation and response state.
- Persist handover confirmation and update lot lifecycle status.
- Ensure the activity ledger reads confirmed server data.

### Priority 3: Improve AI estimation

- Move image analysis behind a replaceable service boundary.
- Store model version, category suggestion, confidence, and estimated value.
- Add a human override and correction path.
- Define evaluation data and accuracy thresholds before production use.

### Priority 4: Improve field reliability

- Add a durable offline mutation queue.
- Add retry and conflict handling.
- Show clear synchronization state.
- Ensure failed uploads and mutations remain recoverable.

### Priority 5: Improve release readiness

- Add UI tests for collector lot creation and handover confirmation.
- Add recycler offer-flow tests.
- Test mobile breakpoints and keyboard accessibility.
- Review authentication and authorization paths.
- Add deployment environment documentation.

## Update Rules

- Update this file when a major feature is completed, blocked, or changed.
- Move permanent architectural choices to `DECISIONS.md`.
- Keep known issues factual and actionable.
- Remove completed issues from the active list after verification.
- Record the current task and next step so a future contributor can resume quickly.
