# MVP Scope — Target: launch by beginning of September

## In scope for MVP
- One complete subject/textbook (English), one full unit end-to-end: Learn →
  Practice → Dungeon boss.
- Join-code student auth (nickname + PIN, no email/password for students).
- Template A (correct-choice shooter) fully built and content-driven.
- At least one more template (recommend Template E, speed quiz — simplest to build)
  so the "different floors feel different" promise is real, not just Template A everywhere.
- Teacher/admin content entry via Django admin (add lessons, questions, bosses).
- Basic leaderboard — nickname only, never real names.
- Browser-native TTS (Web Speech API) for read-aloud. No paid neural voice service.
- Morocco-only soft geofence (IP/country check in middleware).
- First-party `UsageEvent` logging (device, duration, per-student/class) — even a
  minimal version (session start/end + lesson/boss completion events) is enough
  for MVP; a fuller analytics view can come later.

## Defer past MVP — each of these is its own project
- **Speaking assessment / audio recording of students.** Real consent and data-handling
  pipeline for minors' voice data; do not attempt inside the MVP timeline.
- **Social feed.** Even a teacher-curated, pre-moderated version needs a working
  moderation queue built and tested before it ships — treat as a separate milestone.
- **Teacher marketplace** (connecting outside tutors to students). Highest-liability
  item in the whole project — adults transacting with access to minors. Do not build
  without a written safeguarding policy in place first, independent of the tech.
- **Adaptive CEFR level-check engine.** If a placement test is wanted for MVP, ship a
  simplified fixed-form version (fixed question set, simple pass/fail or band score),
  not the full adaptive ability-scored engine.
- **Multi-subject content-authoring UI** beyond Django admin.
- **School billing/licensing dashboard.** Manual `paid_until` toggle is sufficient
  until a paying school actually asks for self-serve billing.
- Templates B, C, D beyond MVP's chosen two — build once the core loop (A + one more)
  is validated as fun and the data model is proven with real content.

## Build order
1. **Frontend-only prototype, Template A, mock/hardcoded questions.** No backend yet.
   Goal: validate the game is actually fun before investing in the data layer. This
   is the single highest-risk unknown in the project — resolve it first.
2. Django models (see `ARCHITECTURE.md`) + DRF endpoints.
3. Wire real join-code auth, Learn + Practice screens against the API.
4. Wire Template A to real question data from the API; add second template.
5. Load one real textbook unit as content via Django admin (this is also the real
   test of "can the teacher use this without a developer").
6. Usage event logging + basic leaderboard.
7. Geofence middleware.

## Explicit non-negotiables carried from CLAUDE.md
- Content lives in the database, not hardcoded in components.
- Game templates are reusable and content-agnostic — never build a bespoke game per floor.
- Students are nickname-only everywhere except teacher/admin-facing views.
- No student passwords; no payment integration in the MVP.
