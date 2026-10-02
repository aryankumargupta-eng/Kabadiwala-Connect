# Security Requirements

## 1. Purpose

Security is part of the Kabadiwala Connect architecture, not a final deployment step. These requirements apply during feature development, testing, review, and production release.

The product handles:

- user and role information
- collector and recycler interactions
- material photos
- lot and handover records
- location and GPS information
- market prices and offers
- authentication and session data

## 2. Authentication

- Private routes and mutations must require an authenticated session.
- Authentication must be verified server-side.
- Client-side role visibility must never be treated as authorization.
- Session cookies must use secure production settings.
- Cookies should use `HttpOnly`, `Secure` in production, and an appropriate `SameSite` policy.
- Logout must invalidate or clear the active session.
- Expired, malformed, or revoked sessions must fail safely.
- Authentication errors must not reveal whether a sensitive account exists unless explicitly required.
- Session identifiers and authentication tokens must never be logged.

## 3. Authorization

- Users can access only resources they are permitted to access.
- Collector actions must be scoped to the authenticated collector and permitted lots.
- Recycler actions must be scoped to permitted incoming lots and offers.
- Authenticator and administrator actions must be explicitly role-protected.
- Recovery-zone ingestion must remain administrator-only.
- Every protected tRPC procedure must verify authorization inside the server procedure.
- Authorization checks must happen before database reads or writes that expose protected data.
- Object IDs supplied by the client must not be trusted without ownership or permission checks.

## 4. Secrets and Configuration

- Never expose database URLs, passwords, signing keys, storage credentials, or private API keys to client-side code.
- Do not commit secrets to source control.
- Store secrets in environment variables or an approved secret manager.
- Do not place secrets in public assets, JSON fixtures, screenshots, logs, or documentation.
- Client bundles must be reviewed to ensure server-only environment variables are not included.
- Use separate credentials for development, staging, and production.
- Rotate credentials when compromise is suspected.
- Keep production configuration out of demo data and local fixtures.

## 5. Database Security

- Use parameterized, ORM-generated queries or safe query builders.
- Do not concatenate user input into SQL.
- Validate and constrain all database-bound input.
- Enforce ownership and role checks before querying sensitive records.
- Use least-privilege database credentials.
- Keep schema migrations reviewed and reproducible.
- Do not expose raw database errors to users.
- Do not return more fields than the requesting workflow needs.
- Preserve referential integrity between lots, offers, and handovers.
- Use transactions where multiple related records must change together.
- Backups must be protected and access-controlled.
- Production data must not be copied into unapproved local or demo environments.

## 6. Input Validation

- Validate every tRPC query and mutation at the API boundary.
- Use Zod schemas or shared validation schemas for request input.
- Validate strings for length, format, and allowed values.
- Validate numeric values for type, range, and precision.
- Validate dates and identifiers before persistence.
- Reject unknown or unexpected fields where practical.
- Normalize user input consistently before storage.
- Treat all client input as untrusted, including values from authenticated users.
- Validate authorization context separately from payload validation.

## 7. API Security

- Validate request body, query parameters, path parameters, and procedure input.
- Apply authentication and authorization checks to protected procedures.
- Return safe, typed errors without stack traces or secrets.
- Rate-limit sensitive or expensive operations where required.
- Prevent duplicate submissions for lot creation, offers, and handovers.
- Use bounded request and response sizes.
- Avoid exposing internal file paths, database structure, or infrastructure details.
- Configure appropriate CORS behavior if the frontend and API are deployed separately.
- Use HTTPS in production.
- Monitor abnormal request patterns and repeated failures.

## 8. File Upload Security

Validate all uploaded images and files for:

- MIME type
- actual file signature where possible
- maximum file size
- filename length
- filename characters
- image dimensions
- supported image formats

Additional rules:

- Do not trust the filename extension or client-provided MIME type alone.
- Generate server-side storage names; do not use user filenames as storage paths.
- Store uploads outside executable web-server paths.
- Prevent path traversal and directory traversal.
- Re-encode or sanitize images before public serving where appropriate.
- Scan uploaded files for malware in production where the threat model requires it.
- Reject unsupported file types with a clear error.
- Avoid storing raw image data directly in domain database rows.
- Store a controlled storage reference and metadata.
- Restrict access to private evidence according to the lot and user permissions.

## 9. Location and Privacy

- Treat collection location and GPS data as sensitive operational information.
- Collect only the precision needed for the product workflow.
- Do not expose exact collector locations to unauthorized users.
- Protect location data in API responses, logs, exports, and screenshots.
- Explain location usage to users where required.
- Retain location data only for the required traceability period.
- Remove or anonymize personal/location data in test fixtures.

## 10. AI and Image Analysis

- Treat AI material classification and value estimation as advisory.
- Do not allow AI output to silently finalize a price, payment, or compliance decision.
- Store model version and confidence when AI results are persisted.
- Provide a human review or override path.
- Do not send uploaded images to an external model provider without approved data handling and consent requirements.
- Do not include private image contents in logs or error messages.
- Validate AI output before using it in pricing or workflow decisions.
- Monitor classification errors and harmful misclassification patterns.
- Clearly label estimated values as estimates.

## 11. Payment and Handover Security

- Keep payment status and transaction status as separate validated fields.
- Do not represent a cash acknowledgement as a digital payment.
- Generate handover codes using a secure server-side mechanism in production.
- Do not use predictable, permanent, or reusable verification codes.
- Limit code attempts and add expiration where applicable.
- Do not expose handover codes to unauthorized users.
- Prevent replay of an already completed handover.
- Record the actor, timestamp, lot, agreed amount, and confirmation status.
- Require explicit confirmation before changing a completed transaction.
- Preserve an audit trail for handover status changes.

## 12. Offline and Synchronization Security

- Treat locally queued actions as untrusted until the server validates them.
- Do not trust client timestamps, client roles, or client status transitions.
- Revalidate permissions when an offline action synchronizes.
- Use idempotency keys for retryable lot and handover mutations.
- Prevent duplicate record creation during retries.
- Protect locally cached sensitive data on shared or lost devices where applicable.
- Clear sensitive local state on logout when required by the device threat model.
- Show users whether data is local, pending synchronization, or server-confirmed.

## 13. Logging and Monitoring

- Log security-relevant events such as failed authorization, ingestion attempts, and suspicious upload failures.
- Never log passwords, session tokens, private keys, full payment credentials, or raw private images.
- Avoid logging unnecessary personal data and precise locations.
- Include safe correlation identifiers for troubleshooting.
- Protect logs from unauthorized access and tampering.
- Configure retention periods appropriate to the environment.
- Monitor repeated failed authentication and authorization attempts.
- Alert on unexpected administrative activity.

## 14. Dependency and Supply-Chain Security

- Keep dependencies maintained and review security advisories.
- Use lockfiles and reproducible installs.
- Review new packages before adding them.
- Avoid packages that are unmaintained or unnecessary.
- Run dependency audits as part of release preparation.
- Keep build tooling and runtime dependencies clearly separated.
- Do not execute untrusted package install scripts without review.

## 15. Error Handling

- Fail closed for authentication and authorization errors.
- Show users actionable but non-sensitive error messages.
- Keep detailed diagnostics in protected server logs.
- Do not use broad catches that convert failures into false success.
- Do not silently fall back from a failed persistence operation to a success-shaped UI.
- Ensure failed mutations leave records in a consistent state.
- Add retry behavior only where duplicate side effects are controlled.

## 16. Security Testing Checklist

- [ ] Private procedures reject unauthenticated requests.
- [ ] Role-protected procedures reject insufficient roles.
- [ ] Users cannot read another user’s protected lots or handovers.
- [ ] Users cannot modify records they do not own or manage.
- [ ] Invalid IDs and malformed payloads are rejected.
- [ ] SQL injection-style input is safely handled.
- [ ] Oversized uploads are rejected.
- [ ] Unsupported and spoofed file types are rejected.
- [ ] Path traversal filenames are rejected or replaced with safe generated names.
- [ ] Secrets do not appear in client bundles.
- [ ] Secrets do not appear in logs.
- [ ] Session cookies have production-safe attributes.
- [ ] Handover codes cannot be reused after completion.
- [ ] Retried mutations do not create duplicates.
- [ ] AI output cannot bypass required human confirmation.
- [ ] Recovery-zone ingestion cannot be run by a non-admin.
- [ ] Error responses do not expose stack traces or sensitive infrastructure details.

## 17. Release Gate

The project must not be considered production-ready until:

1. Authentication and server-side authorization are tested.
2. Database access is scoped and validated.
3. Upload validation is implemented server-side.
4. Secrets are removed from client-visible configuration.
5. Handover and retry behavior are idempotent and auditable.
6. AI suggestions are clearly advisory and reviewable.
7. Security-relevant logs and monitoring are configured.
8. Dependency and build checks pass.
9. Known security issues are documented and assigned.
10. A security review has been completed for the target deployment environment.
