# Kabadiwala Connect Architecture

## 1. Purpose

This document defines **how Kabadiwala Connect works**: its application layers, technology choices, request flow, folder structure, data boundaries, and architectural rules.

Kabadiwala Connect is a field-oriented recycling platform connecting collectors, recyclers, and authenticators. The architecture prioritizes:

- traceable material lots
- transparent pricing
- typed communication between frontend and backend
- offline-friendly collector workflows
- auditable handover records
- separation between UI, business logic, and persistence

## 2. Technology Stack

### Frontend

- React 19
- TypeScript
- Vite
- React Query through `@trpc/react-query`
- React Router-style client-side view state
- Lucide React for icons

### Styling

- CSS in `client/src/index.css`
- Reusable UI primitives in `client/src/components/ui/`
- Responsive layouts for desktop and mobile field usage

### Backend

- Node.js
- Express
- HTTP server
- tRPC procedures exposed through `/api/trpc`
- Zod schemas for runtime input validation

### Database

- MySQL
- Drizzle ORM
- Drizzle Kit for schema generation and migrations
- Database schema and persistence helpers under `drizzle/` and `server/`

### Authentication

- Server-side session context
- Session cookie helpers
- Authentication procedures under `server/_core/`
- Role-aware behavior for collector, recycler, and administrator workflows

### Storage

- Object/file storage helpers under `server/storage.ts`
- Uploaded photo references are stored with lot and handover records rather than embedding image data directly in business records

### Deployment

- Vite builds the frontend
- The production server is bundled with esbuild
- Express serves the built frontend and API from one deployable Node.js process
- Runtime configuration is supplied through environment variables such as `DATABASE_URL`, `PORT`, and authentication/storage configuration

## 3. High-Level Architecture

```text
Collector / Recycler / Authenticator
                |
                v
        React + TypeScript UI
                |
                v
        tRPC React Query client
                |
                v
          Express / tRPC API
                |
        +-------+--------+
        |                |
        v                v
  Domain procedures   Auth/session context
        |
        v
  Database services / ingestion services
        |
        +------------------+
        |                  |
        v                  v
   Drizzle ORM       File/object storage
        |
        v
      MySQL
```

## 4. How the Application Works

### 4.1 Collector Lot Creation

1. The collector opens the lot creation screen.
2. The UI captures a material photo, category, approximate weight, and location.
3. The client may provide an AI-assisted material suggestion and indicative value.
4. The frontend submits validated lot data through a typed tRPC mutation.
5. The server validates the request with Zod.
6. The database service stores the material lot and its traceability metadata.
7. The collector can continue to recycler matching and handover confirmation.

### 4.2 Recycler Offer Flow

1. A recycler views incoming material lots.
2. The recycler reviews category, weight, location, and suggested value.
3. The recycler submits an offer through the API.
4. The collector accepts or renegotiates the offer.
5. The accepted offer becomes the commercial basis for the handover record.

### 4.3 Handover Flow

1. The collector reviews the lot and final handover details.
2. The collector accepts the terms and creates a receipt.
3. The server records the handover reference, lot ID, recycler code, evidence references, location, and payment status.
4. The authenticator can review and validate the transaction.
5. The collector receives confirmation that the lot was created and that an authenticator will contact them.

### 4.4 Recovery Zone Flow

1. The UI requests recovery-zone data through tRPC.
2. The server reads normalized recovery-zone records from the database.
3. Municipal and satellite ingestion adapters normalize external/fixture data.
4. Administrator-only ingestion procedures upsert normalized records.
5. The map and list views display the resulting zones with provenance and verification status.

## 5. Frontend Architecture

The frontend is a React application organized around user-facing views and reusable components.

### Responsibilities

- render collector and recycler workflows
- manage local form state and view state
- provide responsive field-friendly screens
- call backend procedures through the typed tRPC client
- display loading, success, validation, and error states
- support language selection and offline-aware UI messaging

The frontend must not directly access the database or contain SQL, Drizzle queries, or server credentials.

## 6. Backend Architecture

The backend is an Express application with tRPC mounted at `/api/trpc`.

### Request path

```text
HTTP request
    |
    v
Express
    |
    v
tRPC adapter
    |
    v
Zod input validation
    |
    v
Router procedure
    |
    v
Database / storage / ingestion service
    |
    v
Typed response to React Query
```

### Backend responsibilities

- validate all API inputs
- build request context and identify the current user
- enforce role and authorization checks
- execute business operations
- persist material lots and handovers
- normalize ingestion data
- return typed errors and responses

## 7. Data and Domain Boundaries

### Material lots

Represent collected materials and include:

- lot identifier
- collector identifier
- category and subcategory
- photo reference
- approximate weight
- collection location
- estimated value
- quoted price
- lifecycle status

### Handovers

Represent the final transfer event and include:

- handover reference
- lot identifier
- recycler code
- evidence references
- recorded weight
- GPS/location information
- handover code
- payment status
- transaction status

### Recovery zones

Represent mapped waste hotspots and include:

- source/provenance
- coordinates
- waste type
- confidence
- verification status
- last reported time
- external reference

## 8. Folder Structure

```text
kabadiwala-connect/
├── client/
│   ├── public/
│   └── src/
│       ├── _core/
│       │   └── hooks/              # Client auth and framework hooks
│       ├── components/
│       │   ├── ui/                 # Reusable UI primitives
│       │   └── ...                 # Feature-independent components
│       ├── contexts/               # React context providers
│       ├── hooks/                  # Reusable client hooks
│       ├── lib/
│       │   ├── trpc.ts             # Typed tRPC client
│       │   └── utils.ts            # Client utilities
│       ├── pages/                  # Page-level screens
│       ├── App.tsx                 # Main application shell and workflows
│       ├── i18n.tsx                # Language and translation support
│       ├── index.css               # Global and feature styling
│       └── main.tsx                # Browser entry point
├── server/
│   ├── _core/                      # Server runtime, auth, cookies, context
│   ├── ingestion/                  # Municipal and satellite adapters
│   │   └── fixtures/               # Local ingestion fixtures
│   ├── db.ts                       # Database access functions
│   ├── routers.ts                  # tRPC API and domain procedures
│   ├── seedRecoveryZones.ts        # Development/demo seed data
│   ├── storage.ts                  # File/object storage helpers
│   └── index.ts                    # Express server entry point
├── shared/
│   ├── const.ts                    # Shared constants
│   └── recoveryZones.ts             # Shared recovery-zone schemas/types
├── drizzle/
│   ├── schema.ts                   # Database schema
│   └── migrations/                 # Generated database migrations
├── PRD/
│   ├── README.md
│   ├── Product-Requirement-Document.md
│   └── ARCHITECTURE.md
├── dist/                           # Build output
├── package.json                    # Scripts and dependencies
├── vite.config.ts                  # Frontend build configuration
├── drizzle.config.ts               # Database tooling configuration
└── tsconfig.json                   # TypeScript configuration
```

## 9. Architectural Rules

1. **UI components must not contain database logic.** React components may call typed client procedures, but they must not import Drizzle, database drivers, or server credentials.
2. **Database operations belong in server data-access functions.** Queries and mutations should remain in `server/db.ts` or an appropriately scoped server service.
3. **API input must be validated at the boundary.** Every mutation and query that accepts input must use a Zod schema or an existing shared schema.
4. **Authorization must be checked server-side.** Client role switches and UI visibility are not security controls.
5. **Business logic should remain separate from presentation.** Pricing, status transitions, ingestion normalization, and handover rules belong in server/domain services or shared pure functions.
6. **Reusable UI belongs in components.** Common buttons, dialogs, cards, and controls should use existing primitives in `client/src/components/`.
7. **Feature-specific screens belong in pages or feature-level modules.** Do not place unrelated domain workflows into shared UI primitives.
8. **External data must be normalized before persistence.** Municipal and satellite records must be converted to the shared recovery-zone shape before database writes.
9. **Evidence references should be stored, not raw files in domain rows.** Photos and other large artifacts should use storage references.
10. **Status transitions must be explicit.** Lot, payment, and transaction status values must use the defined enums and should not be replaced with arbitrary strings.
11. **Errors must be visible and actionable.** Do not silently swallow API, storage, validation, or persistence failures.
12. **Offline behavior must be explicit.** Locally saved actions should be marked as pending/syncing and must not appear as successfully persisted until the server confirms them.
13. **Translations should remain centralized.** User-facing language strings belong in the i18n layer rather than being duplicated across unrelated components.
14. **Secrets must remain server-side.** Database URLs, storage credentials, signing keys, and private API credentials must never be bundled into the client.
15. **Tests should follow domain boundaries.** Server persistence, ingestion, auth, and recovery-zone behavior should be tested independently from UI rendering.

## 10. Build and Runtime Model

### Development

```text
Vite dev server
        +
Node/Express API
        |
        v
Local MySQL / configured database
```

### Production

```text
npm run build
    |
    +--> Vite frontend build
    |
    +--> esbuild server bundle
    |
    v
Node.js + Express
    |
    +--> Serves frontend assets
    +--> Serves /api/trpc
    +--> Connects to MySQL and storage
```

## 11. Security and Reliability Considerations

- Validate all user-controlled input before processing.
- Keep authorization decisions in server procedures.
- Use secure, appropriately scoped session cookies.
- Avoid exposing database identifiers or credentials unnecessarily.
- Preserve evidence references and timestamps for traceability.
- Keep ingestion sources and confidence values visible to reviewers.
- Treat AI classification and market valuation as recommendations requiring human verification.
- Do not represent an estimate as a confirmed market price until a recycler or authorized verifier accepts it.

## 12. Architecture Summary

Kabadiwala Connect uses a typed React/Vite frontend, an Express/tRPC backend, Zod validation, Drizzle persistence, and MySQL storage. The frontend owns presentation and interaction state. The backend owns authorization, validation, business operations, ingestion, and persistence. This separation allows the project to evolve from a field-pilot prototype into a reliable recycling-chain platform without coupling UI code to infrastructure.
