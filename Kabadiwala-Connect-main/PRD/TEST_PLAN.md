# Test Plan

## 1. Purpose

This document defines what “working” means for Kabadiwala Connect. It is the verification checklist for the collector, recycler, authenticator, API, persistence, AI-assisted estimation, and responsive field workflows.

Tests should verify both:

- the visible user experience
- the server-side behavior and stored result

## 2. Test Environments

### Required environments

- Local development environment
- Configured MySQL database
- Browser with network available
- Browser with network disabled or throttled
- Desktop viewport
- Mobile viewport

### Recommended browsers

- Chromium-based browser
- Firefox
- Safari or WebKit-compatible browser when available

## 3. Build and Static Validation

- [ ] `npm run check` completes without TypeScript errors.
- [ ] `npm run build` completes successfully.
- [ ] No new lint or formatting errors are introduced.
- [ ] Production server starts from the generated build.
- [ ] Frontend assets load from the production server.
- [ ] `/api/trpc` responds to valid requests.
- [ ] Invalid API input returns a typed validation error.

## 4. Authentication and Authorization

### Authentication

- [ ] A user can sign up when signup is enabled for the environment.
- [ ] A user can log in with valid credentials.
- [ ] Invalid credentials show a clear error.
- [ ] Empty or malformed authentication input is rejected.
- [ ] A logged-out user cannot access protected application workflows.
- [ ] Logging out clears the session.
- [ ] Refreshing the application preserves a valid authenticated session.
- [ ] Expired or invalid sessions fail safely.

### Authorization

- [ ] Collector features are available to a collector role.
- [ ] Recycler features are available to a recycler role.
- [ ] Administrator-only ingestion cannot be triggered by a non-admin user.
- [ ] Server-side authorization still blocks requests when client controls are bypassed.
- [ ] Changing the visible client role does not grant server permissions.

## 5. Collector Lot Creation

- [ ] Collector can open the create-lot flow from the dashboard.
- [ ] A lot ID is displayed for the draft.
- [ ] Collector can upload a valid image.
- [ ] Image preview appears after upload.
- [ ] Unsupported or invalid files show an error.
- [ ] Collector can replace the uploaded image.
- [ ] Collector can select a material category.
- [ ] Category selection updates the relevant subcategory and rate.
- [ ] Collector can enter an approximate weight.
- [ ] Weight rejects zero, negative, or invalid values.
- [ ] Collector can view or select the collection location.
- [ ] Required fields prevent incomplete submission.
- [ ] Draft state does not disappear during normal step navigation.
- [ ] Successful lot creation returns a server-confirmed result.
- [ ] Failed lot creation shows an actionable error.

## 6. AI Image Analysis and Valuation

- [ ] Image analysis starts after a valid image is selected.
- [ ] The UI shows an analysis/loading state when analysis is running.
- [ ] A material category suggestion is displayed when analysis completes.
- [ ] An estimated value is calculated from category, weight, and market rate.
- [ ] Confidence or advisory language is shown with the suggestion.
- [ ] The user can review and override the AI category.
- [ ] AI failure does not prevent manual lot creation.
- [ ] Poor-quality or unsupported images produce a safe fallback.
- [ ] AI output is clearly presented as an estimate, not a guaranteed price.
- [ ] The estimated value is not recorded as a final quote without confirmation.
- [ ] The selected model or estimator version can be identified when persisted.

## 7. Price Discovery

- [ ] Collector can open the price board.
- [ ] Material categories display current configured rates.
- [ ] Local range and indicative values are understandable.
- [ ] Price trends render without layout errors.
- [ ] Refreshing the price board updates the visible timestamp or state.
- [ ] Price refresh failure shows an error rather than a false success.
- [ ] Offline mode warns that rates may change after reconnection.

## 8. Recycler Offers and Negotiation

- [ ] Recycler can view incoming lots.
- [ ] Incoming lot displays material, weight, location, and lot ID.
- [ ] Recycler can enter a valid offer amount.
- [ ] Empty, non-numeric, and non-positive offers are rejected.
- [ ] A valid offer is sent and receives visible confirmation.
- [ ] Collector receives or can view the incoming offer.
- [ ] Collector can accept an offer.
- [ ] Collector can submit a renegotiated amount.
- [ ] Invalid counter-offers are rejected.
- [ ] Offer state is persisted and remains correct after refresh.
- [ ] Offer records are associated with the correct lot and participants.
- [ ] Chat messages are sent to the intended lot context.

## 9. Handover and Receipt

- [ ] Collector can open the handover confirmation modal.
- [ ] Lot, material, weight, and quoted value are displayed correctly.
- [ ] Authenticator follow-up message is visible and understandable.
- [ ] Terms checkbox is unchecked by default.
- [ ] Receipt/create button is disabled while terms are unchecked.
- [ ] Selecting the terms checkbox enables the receipt/create button.
- [ ] Unchecking the terms checkbox disables the button again.
- [ ] Clicking the enabled button submits exactly once.
- [ ] Duplicate submissions are prevented while the request is pending.
- [ ] A successful handover creates a server-backed reference.
- [ ] A failed handover does not show a success state.
- [ ] Success state confirms the lot was created.
- [ ] Success state explains that an authenticator will contact the user.
- [ ] Handover status is stored with the correct lot ID and recycler code.
- [ ] Handover evidence references are preserved.
- [ ] Receipt/reference can be found from the activity ledger.

## 10. Payment and Transaction Status

- [ ] Initial payment status is represented as pending where applicable.
- [ ] Transaction status uses an allowed lifecycle value.
- [ ] Cash payment acknowledgement does not imply an online payment occurred.
- [ ] Completed status is only shown after the required confirmation.
- [ ] Payment status and transaction status are not confused in the UI.
- [ ] Final amount and agreed amount remain traceable.
- [ ] A failed confirmation does not incorrectly mark a transaction as completed.

## 11. Activity Ledger

- [ ] Collector can open the activity/ledger view.
- [ ] Confirmed transactions appear in the ledger.
- [ ] Material, lot ID, weight, date, amount, and status are shown.
- [ ] Paid and pending statuses are visually distinguishable and text-labelled.
- [ ] Search filters by material or lot ID.
- [ ] Status filtering works for all supported statuses.
- [ ] Date filters work for valid date ranges.
- [ ] Empty search/filter results show a useful empty state.
- [ ] Ledger data remains correct after page refresh.

## 12. Recovery Zones

- [ ] Recovery-zone list loads successfully.
- [ ] Recovery-zone map loads successfully.
- [ ] Filters return matching zones.
- [ ] Selecting a zone updates the detail panel or popup.
- [ ] Manual zone creation validates required fields.
- [ ] Municipal source records retain municipal provenance.
- [ ] Satellite source records retain satellite provenance.
- [ ] Unverified satellite records are visibly marked.
- [ ] Administrator can run ingestion.
- [ ] Non-admin users cannot run ingestion.
- [ ] Ingestion errors are visible and do not report false success.
- [ ] Ingestion is idempotent for the same external reference.

## 13. Offline and Synchronization Behavior

- [ ] Offline mode is visibly indicated.
- [ ] Core draft capture remains usable when the network is unavailable.
- [ ] A local draft is not presented as server-confirmed.
- [ ] User receives a clear synchronization message after reconnection.
- [ ] Failed synchronization can be retried.
- [ ] Duplicate retry does not create duplicate lots or handovers.
- [ ] Price caution is shown when offline.
- [ ] Network failures do not erase entered form data.

## 14. Localization

- [ ] User can switch between English, Hindi, and Marathi where translations exist.
- [ ] Navigation labels update correctly.
- [ ] Main workflow labels update correctly.
- [ ] Text does not overflow or break layouts in translated languages.
- [ ] Missing translation keys have a safe fallback.
- [ ] Numbers, currency, and dates remain understandable after language changes.

## 15. Responsive Testing

Test all primary flows at:

- [ ] 320px
- [ ] 375px
- [ ] 414px
- [ ] 768px
- [ ] 1024px
- [ ] 1440px

### Responsive checks

- [ ] Sidebar collapses or is replaced by mobile navigation.
- [ ] Create-lot form remains usable without horizontal scrolling.
- [ ] Handover modal fits the viewport and can scroll when necessary.
- [ ] Buttons remain visible and tappable.
- [ ] Tables and ledger rows remain readable.
- [ ] Recycler offer cards stack correctly.
- [ ] Recovery-zone map and list remain usable.
- [ ] Chat panel fits narrow screens.
- [ ] Text does not overlap icons or controls.
- [ ] Orientation changes do not lose form data.

## 16. Accessibility Testing

- [ ] All interactive controls are reachable by keyboard.
- [ ] Visible focus states are present.
- [ ] Icon-only buttons have accessible names.
- [ ] Form inputs have associated labels.
- [ ] Modal dialogs have an accessible title.
- [ ] Checkbox confirmation has a readable label.
- [ ] Disabled buttons communicate their disabled state.
- [ ] Errors are associated with the relevant field or action.
- [ ] Status is not communicated through color alone.
- [ ] Text and controls meet reasonable contrast requirements.
- [ ] Screen readers can identify navigation, headings, forms, and dialogs.

## 17. Error and Recovery Testing

- [ ] API unavailable.
- [ ] Database unavailable.
- [ ] Storage upload fails.
- [ ] Image decoding fails.
- [ ] Invalid form input.
- [ ] Session expires during a mutation.
- [ ] Duplicate submission.
- [ ] Ingestion source returns malformed data.
- [ ] Empty database response.
- [ ] Network disconnect during handover.

For each case:

- [ ] The error is logged appropriately.
- [ ] The user sees a clear message.
- [ ] The UI does not show a success state.
- [ ] Entered data is preserved where safe.
- [ ] A retry or recovery path is available where appropriate.

## 18. Data Integrity and Security

- [ ] User input is validated on the server.
- [ ] Unauthorized procedures are rejected server-side.
- [ ] Database records contain the correct lot and participant references.
- [ ] Handover references are unique enough for the configured environment.
- [ ] Photo references do not expose private storage credentials.
- [ ] Secrets are not present in client bundles.
- [ ] SQL/database errors are not exposed as sensitive raw details.
- [ ] AI estimates cannot silently overwrite user-confirmed values.
- [ ] Audit-relevant evidence is not discarded during status transitions.

## 19. Test Evidence

For a release or judge demonstration, collect:

- [ ] successful build output
- [ ] type-check output
- [ ] server test output
- [ ] screenshots at mobile and desktop widths
- [ ] collector flow recording or screenshots
- [ ] recycler offer flow recording or screenshots
- [ ] handover/receipt confirmation evidence
- [ ] recovery-zone map and ingestion evidence
- [ ] AI image-analysis example with advisory value
- [ ] known limitations and unresolved issues

## 20. Definition of Done

A feature is working when:

1. The primary user flow succeeds with valid input.
2. Invalid input is rejected with understandable feedback.
3. Loading, empty, and error states are handled.
4. Server-side validation and authorization are present.
5. Persistence is confirmed where persistence is required.
6. The feature works at mobile and desktop breakpoints.
7. Keyboard and basic accessibility checks pass.
8. No existing workflow is regressed.
9. Relevant tests or manual evidence are recorded.
10. Documentation is updated when behavior, architecture, or design changes.
