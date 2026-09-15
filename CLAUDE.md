# English Quest — Project Brief

Read this file first, then `ARCHITECTURE.md`, `DESIGN_SYSTEM.md`, and `MVP_SCOPE.md` before writing code.

## What this is
A gamified learning platform, launching as an English-learning app for a Moroccan
teacher's own classes, architected from day one to generalize to multiple subjects
and multiple schools (private schools have already expressed interest).

Core loop per unit: **Learn** (read the lesson) → **Practice** (exercise sets) →
**Dungeon** (game-based boss fight that tests mastery before unlocking the next unit).

## Non-negotiables
- **Content is data, not code.** Lessons, questions, and boss configs live in the
  database. A teacher must be able to add a new unit through Django admin without
  a developer touching code.
- **Game templates are reusable, content-agnostic engines.** Do NOT build a unique
  game per floor. Build the 5 templates in `DESIGN_SYSTEM.md` / `MVP_SCOPE.md` once,
  each taking a question set as a prop/input. A floor = template + question set +
  visual skin.
- **Students never see real names.** Students are known to each other and on
  leaderboards only by nickname. Teachers/admins can see real names. Never leak
  `real_name` into any student-facing or leaderboard API response.
- **No student accounts with passwords.** Students join via class code + nickname +
  4-digit PIN (re-entry proof, not real security). Teachers/admins use normal
  Django auth (email + password).
- **Multi-tenant from the start:** `School → Subject → Unit → Lesson/ExerciseSet/Boss`,
  and `School → SchoolClass → Student → Progress`. Building English for one teacher
  should require zero schema changes when a second school/subject shows up later.
- **Monetization is a manual toggle, not a payment integration.** A `SchoolClass` (or
  `School`) has a `paid_until` date an admin sets by hand after being paid outside
  the app. Do not build Stripe/CMI integration for the MVP.
- **Morocco-only access** is a soft geofence (IP/country check in middleware), not a
  security boundary. Don't over-engineer it.
- **Track usage as first-party events**, not just page-view analytics: which device,
  time spent, which class/student used the app most. This must be queryable against
  our own `Student`/`SchoolClass` tables, so log our own `UsageEvent` model rather
  than relying on a third-party analytics tool alone.

## Stack
- Backend: Django + Django REST Framework + PostgreSQL
- Frontend: Next.js (React), Tailwind
- Hosting: Render/Railway (backend+DB), Vercel (frontend) — no Docker/self-hosting for MVP
- Admin/teacher panel: Django admin, permission-scoped by school/role — do not build a
  custom admin UI for the MVP

## Design reference
Real Stitch export lives at `design-reference/stitch_english_quest_gamified_pwa/`,
one subfolder per screen (component code + assets). Treat this as the visual source
of truth alongside `DESIGN_SYSTEM.md`'s tokens — when building a screen, open the
matching subfolder first and extract colors/spacing/type/component structure from
it. Do not copy the exported code wholesale into the Next.js app; it won't match our
component/file conventions, but it's the ground truth for what the design should
look like.

Folder → screen mapping:
- `home_journey_map` → Home / Journey Map
- `join_class` → Join Class
- `lesson_learn_mode` → Lesson (Learn)
- `vocabulary_quest_shooter` → Template A (Correct-choice shooter)
- `grammar_quest_runner` → Template B (Two-lane runner)
- `listening_quest_catch_the_sound` → Template C (Catch the sound)
- `boss_battle_defend_the_line` → Template D (Defend the line)
- `boss_battle_speed_quiz` → Template E (Speed quiz)
- `quest_complete_victory` → Victory screen
- `maghreb_quest` → contains `STITCH_BRAND_SYSTEM.md`, the full generated brand/token
  reference (rename it from its exported `CLAUDE.md` if not already done — real
  values now folded into `DESIGN_SYSTEM.md`)

## Build order (see MVP_SCOPE.md for full detail)
1. Frontend-only prototype of Template A (shooter) with mock data — validate the game
   is actually fun before building any backend.
2. Django models + DRF endpoints (see ARCHITECTURE.md).
3. Wire join-code auth, Learn/Practice screens, then the remaining templates.
4. Teacher content entry via Django admin, using one real textbook unit as test data.

## Out of scope for MVP — do not build unless explicitly asked
Speaking assessment/recording, social feed, teacher marketplace, multi-subject
content-authoring UI, school billing/licensing UI, adaptive CEFR level-check engine
(a fixed-form simplified version is fine if requested). See `MVP_SCOPE.md`.
