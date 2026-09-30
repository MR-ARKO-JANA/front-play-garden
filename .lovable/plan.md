# Medergency frontend implementation

## Scope
Build a frontend-only, mobile-first doctor onboarding application at `/`, matching the supplied Medergency reference and using local state for all interactions.

## Experience
- Implement all 14 screens in the specified order, from welcome through the doctor dashboard.
- Keep the onboarding interface centered at a phone-like maximum width on larger screens and full-width on mobile.
- Add working forward/back navigation, step progress, required-field feedback, OTP entry, password visibility, dropdowns, dates, file selection, declaration validation, mock verification progress, and dashboard navigation.
- Use the supplied brand colors, compact Inter typography, restrained gradients, subtle borders, shadows, and reusable healthcare-focused controls.

## Visual assets
- Recreate the Medergency mark as a clean CSS/text brand lockup rather than embedding the uploaded reference image.
- Use an original, locally generated female doctor portrait for the welcome and sample profile areas.

## Technical details
- Keep all data and verification behavior in React state; no account, database, or network integration.
- Define semantic OKLCH tokens and shared visual utilities in the global design system.
- Add route-specific title, description, Open Graph, and Twitter metadata.
- Preserve the existing TanStack application structure and split the experience into focused reusable frontend components.
- Verify the complete flow and key mobile/desktop layouts in the running preview, with no build or console errors.
