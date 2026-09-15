# Architecture

## Stack decisions
- **Backend:** Django + Django REST Framework + PostgreSQL.
- **Frontend:** Next.js (App Router), React, Tailwind.
- **Hosting:** Render or Railway for Django+Postgres; Vercel for Next.js.
- **Why Django admin over a custom admin UI:** teachers/admins need a working content
  panel on day one without building bespoke screens. Django admin, scoped by
  permissions per school, satisfies this directly. Revisit only if/when a school
  pays for a nicer dashboard.

## Data model

```
School (tenant)
  - name
  - country (for geofence exceptions if ever needed)
  - paid_until (date, null = inactive) -- manual monetization toggle, can also
    live at SchoolClass level if billing needs to be per-class instead of per-school

Subject
  - school (FK School)
  - name  (e.g. "English", "Math")

Unit
  - subject (FK Subject)
  - title
  - order
  - unlock_requires (FK self, null=True) -- must beat this unit's boss first
  - is_free (bool) -- Unit 1 style free sample

Lesson
  - unit (FK Unit)
  - order
  - title
  - body (text)
  - audio_text (text, blank=True) -- what TTS reads if different from body

ExerciseSet
  - unit (FK Unit)
  - title
  - kind (mcq | fill | speak | write)

Question
  - exercise_set (FK ExerciseSet)
  - prompt
  - audio_prompt (blank=True)
  - correct_answer
  - choices (JSONField, list)
  - tip (text, blank=True) -- shown after answering
  - difficulty (int)
  - template_tag (str) -- which game template this question is eligible for
    (shooter | runner | catch_sound | defend_line | speed_quiz)

Boss
  - unit (OneToOne Unit)
  - name
  - template (str) -- which of the 5 templates this boss fight uses
  - floors (int)
  - hearts (int)
  - seconds_per_question (int)

--- People & progress ---

User (Django auth.User) -- used ONLY for Teacher/Admin/Owner roles, never students

SchoolMembership
  - user (FK User)
  - school (FK School)
  - role (OWNER | ADMIN | TEACHER)

SchoolClass
  - school (FK School)
  - subject (FK Subject)
  - teacher (FK User, role=TEACHER)
  - name
  - join_code (unique, short alphanumeric)
  - paid_until (date, null=True) -- if billing is per-class rather than per-school

Student
  - school_class (FK SchoolClass)
  - nickname (str) -- shown everywhere student-facing, leaderboards, etc.
  - real_name (str) -- NEVER serialized to student-facing or leaderboard endpoints;
    teacher/admin views only
  - pin (4 chars) -- re-entry proof on a new device, not real security
  - device_token (UUID) -- cache pointer client stores locally; source of truth is
    always the server-side Student/Progress rows

Progress
  - student (FK Student)
  - unit (FK Unit)
  - lessons_completed (M2M Lesson)
  - boss_defeated (bool)
  - golden_boss_defeated (bool) -- optional "no mistakes" bonus tier
  - total_xp (int)
  - unique_together: (student, unit)

UsageEvent
  - student (FK Student)
  - event_type (str) -- e.g. "session_start", "lesson_complete", "boss_attempt"
  - device_info (str) -- user agent / rough device class
  - duration_seconds (int, null=True)
  - timestamp (datetime, auto_now_add)
  # Powers: most-active student/class rankings, device breakdown, time-on-task.
  # Query against Student/SchoolClass directly — do not rely solely on a third-party
  # analytics tool for this, since it can't join to our own tables.
```

## Auth flow (students — no passwords)
1. Teacher/admin creates a `SchoolClass` in Django admin → gets a `join_code`.
2. Student opens "Join a Class": enters `join_code`, `nickname`, a 4-digit `pin`.
3. Backend: find-or-create `Student` scoped to that class + nickname. If nickname
   already exists in that class, require the matching PIN to resolve identity
   collisions (two students with the same first name).
4. Server issues a `device_token` (UUID), client caches it locally. All subsequent
   requests send this token; it's a cache pointer, not a session of record — the
   `Student`/`Progress` rows in Postgres are the source of truth.
5. New device: student re-enters `join_code` + `nickname` + `pin` → server resolves
   to the same `Student`, issues a fresh `device_token`. Progress resumes exactly.

Teachers/Admins use standard Django auth (email + password) into Django admin,
scoped by `SchoolMembership.role` and `.school` so a teacher only ever sees their
own school's data.

## API surface (rough)
```
POST /api/classes/join/                 {join_code, nickname, pin} -> {device_token, student_id}
GET  /api/units/                        -> units for student's subject, locked state included
GET  /api/units/<id>/lessons/
GET  /api/units/<id>/exercise-sets/
POST /api/progress/lesson-complete/     {student_id, lesson_id}
POST /api/progress/boss-result/         {student_id, unit_id, xp, hearts_left, won}
GET  /api/progress/<student_id>/        -> full progress, used to resume on any device
POST /api/events/                       {student_id, event_type, device_info, duration}
```

## Game template engine (frontend)
Each of the 5 templates (see `DESIGN_SYSTEM.md`) is ONE shared component taking:
```
{ questions: Question[], bossConfig: {hearts, secondsPerQuestion, floors}, skin: string }
```
A floor/unit boss is defined purely as a template choice + a `Question[]` + a skin —
never as new template code. New units/subjects should require zero new template code,
only new data.

## Explicit non-goals for MVP
Do not build: payment processing, custom admin dashboard UI, speaking/audio
assessment pipeline, social feed/moderation queue, teacher marketplace, adaptive
CEFR level-check engine. See `MVP_SCOPE.md`.
