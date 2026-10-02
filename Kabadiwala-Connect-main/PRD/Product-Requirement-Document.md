# Product Requirement Document (PRD)

## 1. Product Overview
Kabadiwala Connect is a digital waste collection and recycling marketplace designed to formalize the workflow between collectors, recyclers, and verification/authentication actors. The platform helps collectors create traceable material lots, compare local rates, negotiate recycling offers, and complete handovers with proof and verification.

## 2. Problem Statement
Waste collection in informal markets often suffers from:
- lack of transparency in pricing
- inconsistent material valuation
- weak traceability across collection and handover
- poor communication between collectors and recyclers
- unclear verification and payment acknowledgement
- limited digital records for compliance and auditing

The project aims to bring structure, visibility, and trust into the waste collection process using a mobile-first digital workflow.

## 3. Product Goals
- Create a formal, mobile-friendly chain of custody for e-waste and recyclable material.
- Enable collectors to document material lots with images and metadata.
- Support rate discovery and transparent pricing.
- Help recyclers assess and offer value for incoming lots.
- Ensure final handover includes proof, verification, and traceability.
- Provide a usable local/offline-first experience in low-connectivity field conditions.

## 4. Target Users
### 4.1 Collector
- Collects scrap and e-waste from households, shops, or collection points
- Wants faster pricing and traceable documentation
- Needs a simple way to record material, weight, and handover details

### 4.2 Recycler
- Buys recyclable material or e-waste
- Wants verified incoming lots and transparent offers
- Needs a clear and efficient intake workflow

### 4.3 Authenticator / Verifier
- Verifies the material lot and handover conditions
- Confirms legitimacy and traceability before final acknowledgment
- Helps reduce fraud and ensure trust in the chain

## 5. Core User Flows
### 5.1 Collector Flow
1. Open the app.
2. Create a material lot.
3. Upload or capture a photo of the waste.
4. Enter material type, category, and estimated weight.
5. Review suggested pricing and market range.
6. Choose a recycler or accepted route.
7. Confirm handover details.
8. Generate a handover code / receipt proof.
9. Wait for authenticator follow-up.

### 5.2 Recycler Flow
1. View incoming lots.
2. Evaluate material and pricing.
3. Send an offer or negotiate.
4. Receive and confirm collector acceptance.
5. finalize handover with proof of payment / confirmation.

### 5.3 Verification / Authenticator Flow
1. Review collected material details.
2. Validate the lot, weight, and authenticity.
3. Confirm handover or request further validation.
4. Notify the collector and recycler when confirmation is complete.

## 6. Functional Requirements
### 6.1 Lot Creation
- Users can create a lot with basic details.
- A photo can be uploaded for evidence.
- Material categories can be selected.
- Estimated weight can be recorded.
- A lot ID is generated for traceability.

### 6.2 AI-Assisted Material Recognition
- Uploaded images should be analyzed to infer probable material category.
- Estimated market value can be suggested based on material type, weight, and region.
- Confidence score should be shown for classification suggestions.

### 6.3 Price Discovery
- The app should display price ranges by material category.
- Local market pricing should be available visually.
- Users should be able to compare recycler offers against local medians.

### 6.4 Negotiation and Offers
- Recyclers can send offers against lots.
- Collectors can accept or renegotiate offers.
- Offer communications should be traceable.

### 6.5 Handover and Proof
- Final handover requires confirmation.
- A handover code or reference ID should be generated.
- Lot details should be stored as proof of transaction.
- The app should support offline-first record saving.

### 6.6 Transaction Record
- All lots and transactions should be stored in a ledger or activity view.
- Paid and pending statuses should be visible.
- Final transaction record should include material, weight, amount, and verification info.

## 7. Non-Functional Requirements
- Mobile-first and responsive interface
- Offline-capable behavior for field usage
- Simple and intuitive UI for non-technical users
- Secure storage of transaction data
- Fast local experience for form interactions
- Clear status states and system feedback

## 8. User Experience Requirements
- The app should feel trustworthy and transparent.
- The user should understand the exact stage of the transaction.
- Verification and confirmation should be obvious and not ambiguous.
- The interface should support local language usage (Hindi / Marathi / English) where possible.

## 9. Business / Product Success Metrics
- Number of lots created per month
- Number of handovers confirmed successfully
- Average price transparency or rate comparison usage
- Share of verified and traceable transactions
- Recycler acceptance rate for lots
- Collector engagement and return usage

## 10. Risks and Constraints
- Network instability in field areas
- Inconsistent image quality leading to classification errors
- Price volatility in local markets
- Security and trust concerns around transaction records
- Need for a realistic auth/verifier workflow in production

## 11. Proposed Future Roadmap
### Phase 1: MVP
- Collector lot creation
- Recycler offers and negotiation
- Handover proof and receipt generation
- Basic AI suggestion for material identification

### Phase 2: Scale
- Advanced material classification
- Stronger price model with historical local prices
- Better route optimization and recycler matching
- Enhanced verification workflows

### Phase 3: Expansion
- Multi-region support
- Integration with municipal or government waste agencies
- Analytics dashboard and supply-chain intelligence
- Automated compliance documentation

## 12. Assumptions
- This is a field-oriented, mobile-first product for waste collection.
- The app may initially use heuristics and rule-based AI before moving to a deeper ML model.
- The product is intended for a local market pilot before scaling to broader operations.

## 13. Open Questions
- What exact categories of e-waste will be prioritized in the first release?
- Should the app support direct digital payment in the future or remain cash-based with digital acknowledgement?
- What regulation or compliance requirements are expected from municipal or formal-sector partners?
- How will authenticators be onboarded into the workflow in production?

## 14. Summary
Kabadiwala Connect is designed to bring trust, traceability, and fair value to informal recycling operations. It combines digital lot creation, transparent pricing, recycler negotiation, and proof-based handover to create a more formal and dependable waste exchange system.
