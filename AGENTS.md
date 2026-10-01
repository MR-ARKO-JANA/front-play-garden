# Project Guidelines

- Keep Medergency onboarding frontend-only with React state and mock responses, so a backend can be connected later without changing the interface.
- Patient/doctor portals use a mock store (src/lib/medergency/store.tsx) as the single service layer; swap its actions for API calls later without changing pages.
