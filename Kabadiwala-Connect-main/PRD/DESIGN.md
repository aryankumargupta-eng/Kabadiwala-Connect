# Kabadiwala Connect Design System

## 1. Purpose

This document defines how Kabadiwala Connect should look and feel across collector, recycler, authenticator, and data-management workflows.

The visual system should communicate:

- trust
- environmental responsibility
- clarity
- practical field usability
- transparent pricing
- formal, traceable handovers

New screens should extend this system rather than introduce unrelated colors, typography, card styles, or interaction patterns.

## 2. Design Direction

### Style

- Modern
- Minimal
- Professional
- Calm and trustworthy
- Field-friendly
- Data-aware without feeling technical

The interface uses a light paper-like canvas, deep recycling greens, warm saffron highlights, compact information hierarchy, and generous but practical spacing.

## 3. Typography

### Primary UI font

`Plus Jakarta Sans`

Use for:

- body copy
- labels
- navigation
- form controls
- helper text

### Display and emphasis font

`Space Grotesk`

Use for:

- page titles
- major numbers
- quoted values
- brand emphasis
- prominent modal headings

### Typography rules

- Use sentence case for normal user-facing content.
- Use uppercase only for compact eyebrow labels and metadata.
- Keep body text readable at small field-device sizes.
- Use font weight to communicate hierarchy before adding additional colors.
- Avoid introducing another font family without a strong product reason.

## 4. Color System

### Core colors

| Token | Value | Usage |
|---|---|---|
| `--paper` | `#F4F7F4` | Application background |
| `--white` | `#FFFFFF` | Cards, panels, inputs |
| `--ink` | `#132019` | Primary text and headings |
| `--ink-soft` | `#34423A` | Secondary text |
| `--muted` | `#76837B` | Supporting text, metadata, placeholders |
| `--line` | `#DCE4DD` | Borders and separators |

### Brand colors

| Token | Value | Usage |
|---|---|---|
| `--green` | `#176B45` | Primary actions, verified states, links |
| `--green-deep` | `#0D422C` | Sidebar, hero surfaces, strong brand areas |
| `--green-soft` | `#E2F0E7` | Selected states, positive surfaces |
| Saffron | `#E89B22` | Attention, pricing, safety, highlights |
| Saffron soft | `#FFF2D8` | Warning and price-notice backgrounds |
| Rose soft | `#F8E5DF` | Risk or material-alert surfaces |
| Blue soft | `#E3EFF5` | Informational surfaces |
| Violet soft | `#ECE5F5` | Secondary data/analytics surfaces |

### Color rules

- Green means verified, active, complete, or primary.
- Saffron means attention, pricing, pending action, or safety guidance.
- Red/rose should be reserved for risk, destructive actions, or errors.
- Color must not be the only way to communicate status; pair it with text or an icon.
- Maintain readable contrast for text and controls.

## 5. Layout and Spacing

### Layout principles

- Use a clear desktop sidebar and responsive mobile navigation.
- Keep primary content centered with a readable maximum width.
- Use grid layouts for dashboards and two-column layouts for detail workflows.
- Collapse multi-column layouts on narrow screens.
- Keep primary actions visible and easy to reach on mobile.

### Spacing scale

Use a consistent spacing rhythm based on multiples of approximately 4px:

```text
4px   compact icon/text gap
8px   control padding and metadata spacing
12px  small card padding and row gaps
16px  standard component gap
20px  panel padding
24px  modal and section spacing
32px  major section separation
40px+ page-level breathing room
```

Do not use arbitrary spacing when an existing scale value is appropriate.

## 6. Surfaces, Cards, and Borders

### Cards

- Background: `#FFFFFF`
- Border: `1px solid var(--line)`
- Border radius: normally `10px` to `16px`
- Use `12px` as the default radius for general cards.
- Use larger radii only for hero surfaces and major modal containers.

### Panels

Panels should have:

- clear heading and supporting description
- consistent internal padding
- one primary purpose
- visible empty, loading, or error treatment when relevant

### Shadows

Use subtle green-tinted shadows:

- standard card shadow: `0 8px 22px rgba(31, 65, 46, 0.08)`
- major surface shadow: `0 18px 44px rgba(31, 65, 46, 0.08)`

Avoid heavy black shadows or decorative shadows that reduce the calm visual tone.

## 7. Buttons and Actions

### Primary button

Use for the main action on a screen:

- green background
- white text
- rounded corners
- compact horizontal padding
- visible hover and disabled states

Examples:

- Create new lot
- Confirm handover
- Send offer
- Save zone

### Secondary button

Use for an important alternative action:

- white background
- green text
- subtle border

### Ghost/text button

Use for low-emphasis navigation or utility actions:

- transparent background
- muted or green text
- no visual weight beyond the label and icon

### Destructive button

Use only for irreversible or high-risk actions:

- rose/red treatment
- explicit action wording
- confirmation required when the action can delete or invalidate records

### Button rules

- Buttons must use action verbs.
- Every button needs a visible disabled state when its action is unavailable.
- Do not use multiple visually equal primary buttons for competing actions.
- Icons should support the label, not replace a necessary label.
- Full-width buttons are appropriate for modal confirmation and mobile actions.

## 8. Forms and Inputs

- Use visible labels for every form field.
- Place helper text below the relevant field.
- Show validation close to the field that needs correction.
- Use input types and constraints appropriate to the value.
- Preserve entered values when validation fails.
- Do not rely on placeholder text as the only label.
- Use clear focus rings for keyboard and accessibility support.
- Keep location, weight, price, and category inputs easy to scan.

## 9. Status and Feedback

### Status language

Use explicit labels such as:

- Draft
- Pending
- Matched
- Handover pending
- Completed
- Cancelled
- Verified
- Unverified

### Feedback patterns

- Toasts: short confirmations for completed lightweight actions.
- Inline messages: validation, warnings, and contextual guidance.
- Modal confirmations: important handover or destructive decisions.
- Progress indicators: AI analysis, ingestion, upload, or synchronization.

Feedback should explain what happened and, where possible, what the user can do next.

## 10. Loading, Empty, and Error States

### Loading states

- Use skeletons or restrained spinners for data retrieval.
- Keep the surrounding layout stable while content loads.
- Disable duplicate submissions while a mutation is running.
- Use progress language for image analysis and uploads.

### Empty states

Every list, table, and dashboard panel should have a useful empty state containing:

- a concise explanation
- an appropriate icon or illustration
- a next action when one exists

### Error states

- Explain the problem in plain language.
- Preserve user-entered information whenever safe.
- Provide retry or recovery actions.
- Never show a successful state when persistence or synchronization failed.
- Do not silently catch and discard errors.

## 11. Responsive and Field UX

- Support narrow mobile screens from approximately 320px upward.
- Prefer single-column forms on mobile.
- Keep tap targets comfortably large.
- Avoid hover-only interactions.
- Keep critical actions near the bottom or within immediate reach.
- Ensure tables have a usable mobile representation.
- Make offline mode visible and understandable.
- Keep long descriptions readable without forcing horizontal scrolling.

## 12. Accessibility

- Use semantic headings in hierarchical order.
- Use native buttons, inputs, labels, and checkboxes where possible.
- Provide accessible names for icon-only controls.
- Preserve visible keyboard focus.
- Do not communicate state with color alone.
- Ensure modal dialogs have a clear title and close action.
- Support screen-reader-friendly status updates for important mutations.
- Maintain sufficient contrast for body text, controls, and status indicators.

## 13. Iconography and Illustration

- Use Lucide React icons consistently.
- Match icon size to the surrounding text hierarchy.
- Use icons to reinforce concepts such as recycling, location, safety, payment, verification, and connectivity.
- Avoid mixing unrelated icon families.
- Illustrations should remain simple, geometric, and environmentally themed.

## 14. Component Consistency

Before creating a new component, check whether an existing component or primitive can be reused.

Common reusable patterns include:

- `primary-button`, `secondary-button`, and `ghost-button`
- cards and section panels
- modal backdrops and modal headers
- badges, status labels, and eyebrow labels
- summary grids
- toast notifications
- skeleton/loading states

Feature-specific components may extend these patterns, but should not redefine the global visual language.

## 15. UX Requirements

- Mobile responsive
- Offline-aware messaging
- Loading states
- Empty states
- Error states
- Accessible forms
- Visible validation
- Clear confirmation before important handover actions
- Human-readable AI suggestions with confidence
- Human verification before an AI estimate becomes a final value
- Consistent terminology across collector and recycler experiences
- Support for English, Hindi, and Marathi where translations exist

## 16. Design Rules for AI-Generated Screens

1. Reuse the existing design tokens before adding new colors.
2. Use `Plus Jakarta Sans` for interface text and `Space Grotesk` for display emphasis.
3. Use `12px` as the default card radius unless the component is a hero or modal.
4. Keep one clear primary action per surface.
5. Include loading, empty, and error states for data-dependent screens.
6. Keep forms labeled, keyboard-accessible, and mobile-friendly.
7. Preserve the green/saffron visual relationship: green for trust and completion, saffron for attention and value.
8. Do not introduce a new component pattern when an existing pattern can be reused.
9. Keep AI results advisory and show confidence or verification status.
10. Review every new screen at mobile and desktop widths before considering it complete.

## 17. Design Summary

Kabadiwala Connect should feel like a dependable field tool: clear enough for a collector working quickly, structured enough for a recycler reviewing offers, and trustworthy enough for an authenticator reviewing records. The visual system combines calm green surfaces, clear data hierarchy, compact controls, transparent statuses, and responsive layouts to support that goal.
