# Kabadiwala Connect

Kabadiwala Connect is a field-focused e-waste collection workspace with database-backed authentication, recovery-zone data, and collector/recycler workflows.

## Project setup

### Requirements

- Node.js 20.19+ or 22.12+
- npm
- A local SQLite database (created automatically)
- A Twilio Verify service for real SMS OTP login/signup

### Install

```bash
npm install --legacy-peer-deps --package-lock=false
```

## Quick local setup

The project uses libSQL, with a local SQLite database by default during development. **Docker, MySQL, XAMPP, and port 3306 are not required.**

```bash
npm install --legacy-peer-deps --package-lock=false
npm run db:push
npm run dev
```

`npm run dev` does not automatically push schema changes. The SQLite file is created automatically at `data/kabadiwala.db`.

## Database setup

1. Copy `.env.example` to `.env.local` if needed.
2. Keep `DATABASE_URL=file:./data/kabadiwala.db`.
3. Apply the Drizzle schema:

```bash
npm run db:push
```

The SQLite schema is defined in `drizzle/schema.ts` and applied with Drizzle Kit. No server-side database installation is required.

## Environment variables

`.env.example` contains placeholders only. Never commit `.env.local` or real credentials.

Required for database-backed authentication:

```env
DATABASE_URL=file:./data/kabadiwala.db
```

For Vercel, use a persistent hosted libSQL database (such as Turso) instead of the local `file:` URL. Set `DATABASE_URL` to the database's `libsql://` URL and set `DATABASE_AUTH_TOKEN` to its auth token in the Vercel project's Environment Variables for each deployment environment that needs the database. Set the same values in your local shell before running `npm run db:push` to create/update the hosted database tables. Do not commit the token. Local SQLite files are not persistent across Vercel function instances.

Required for real mobile OTP:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
```

Optional project integrations are also listed in `.env.example`.

Environment files are excluded by `.gitignore`.

## SMS/OTP provider setup

The mobile flow uses Twilio Verify v2. Create a Verify Service in Twilio and place its credentials in server-side environment variables.

The application:

- Never stores OTP codes in the database.
- Never logs OTP codes or provider response bodies.
- Keeps Twilio credentials on the server only.
- Applies application-level resend and verification rate limits.
- Relies on Twilio Verify for OTP delivery and verification/expiry.
- Accepts E.164-style phone numbers; the UI provides a country-code selector and a separate mobile-number field.

For production SMS, configure Twilio's current Verify requirements, sender settings, recipient consent, and regional compliance before enabling real traffic.

## Running the project

Development:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Vercel serves the API through `api/index.ts`; it does not use a `start` script.

Validation commands:

```bash
npm run typecheck
npm run lint
npm run tests
```

`lint` uses Prettier's check mode because this project does not include an ESLint configuration.

## Authentication flow

### Login

Users choose one of two simple methods:

1. **Email & Password**
   - Email
   - Password
   - Remember Me
   - Forgot Password placeholder
   - Sign In

2. **Mobile OTP**
   - Country code
   - Mobile number
   - Send OTP
   - OTP field
   - Verify OTP
   - Resend OTP with cooldown

### Demo accounts

Use these demo-only credentials on the login screen to preview each workspace without creating an account:

| Workspace | Email | Password |
| --- | --- | --- |
| Collector | `collector.demo@kabadiwala.local` | `Collector@123` |
| Recycler | `recycler.demo@kabadiwala.local` | `Recycler@123` |

Demo accounts are client-side previews and do not create a server session. Database-backed features and protected API actions require a real account. For a persistent Vercel account, configure the hosted database described above and sign up from the app.

### Signup

Signup collects:

- Full name
- Mobile number
- Email
- Password
- Confirm password

Signup can be completed with the password method or with mobile OTP verification. OTP signup verifies the mobile number before the account is created.

### Sessions

- Passwords use Node.js `scrypt` with a random salt.
- Session tokens are generated with cryptographically secure random bytes.
- Only a SHA-256 token hash is stored in the database.
- The browser receives the opaque session token only in an `HttpOnly` cookie.
- Cookies use `SameSite=Lax`; production cookies are `Secure`.
- Sessions expire after 24 hours by default or 30 days with Remember Me.
- Logout deletes the server-side session and clears the cookie.
- Protected tRPC procedures require a valid session.

## Supported languages

The authentication interface currently supports:

- English
- Hindi (हिंदी)

The application keeps its translation architecture centralized in `client/src/i18n.tsx`, so additional languages can be added without hard-coding translated strings inside authentication components.

The selected authentication language is remembered in `localStorage` as `app_language`. This preference contains no credential or session information and does not affect authentication security.

## Troubleshooting

### Login says "Invalid email or password"

Confirm the account exists and use the exact email address used during signup. Passwords are case-sensitive.

### OTP is not arriving

Check that Twilio Verify is configured and that the number is entered with the correct country code. Also check the Twilio Verify service status and SMS compliance requirements.

### OTP requests are blocked

The application limits repeated OTP sends and verification attempts. Wait for the server-side window to expire or request a new OTP after the cooldown.

### Database errors

Local development defaults to `file:./data/kabadiwala.db`. In production, `DATABASE_URL` must be set to a persistent libSQL database URL; missing production configuration is reported as an error rather than falling back to an in-memory or local database.

```bash
npm run db:push
```

If the database file is locked, stop any second development server and retry. The `data/` directory is local-only and should not be committed.

### Protected pages redirect to login

The application checks the server session through `auth.me`. If the session expired or was logged out, sign in again.

### Language resets

The login page reads `app_language` from browser storage. If browser storage is cleared, the interface falls back to English.

## Project documentation

Additional requirements, architecture, design decisions, security notes, and test plans are in `PRD/`.
