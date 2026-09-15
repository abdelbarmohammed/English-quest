# English Quest

A gamified English-learning platform built for Moroccan classrooms. Students progress through units via a journey map — each unit has a **Learn** phase, a **Practice** phase, and a **Dungeon** boss fight that must be beaten to unlock the next unit.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (App Router), React, Tailwind CSS |
| Backend | Django 5, Django REST Framework, PostgreSQL |
| Admin/teacher panel | Django admin (permission-scoped per school) |
| Hosting (target) | Render/Railway (backend + DB), Vercel (frontend) |

## Key design decisions

- **Content is data, not code.** Lessons, questions, and boss configs live in the database. Teachers add content through Django admin — no developer required.
- **Game templates are reusable engines.** Five templates (shooter, runner, catch-the-sound, defend-the-line, speed-quiz) each accept a question set as input. A dungeon floor = template + question set + visual skin.
- **No student passwords.** Students join via class code + nickname + 4-digit PIN.
- **Students are always nickname-only** in all student-facing and leaderboard views. Real names are only visible to teachers and admins.
- **Multi-tenant from day one.** Schema: `School → Subject → Unit → Lesson/ExerciseSet/Boss` and `School → SchoolClass → Student → Progress`.
- **Manual monetization toggle.** A `paid_until` date on `SchoolClass` (or `School`) is set by hand after payment — no Stripe integration in MVP.
- **Morocco-only soft geofence** via IP/country middleware (not a hard security boundary).
- **First-party usage events** logged against `Student`/`SchoolClass` tables — device, time spent, lesson/boss completions.

## Repository layout

```
backend/          Django project (config/ settings, core/ app)
frontend/         Next.js app
design-reference/ Stitch design exports (visual source of truth per screen)
ARCHITECTURE.md   Data model, stack rationale
DESIGN_SYSTEM.md  Color tokens, typography, component specs
MVP_SCOPE.md      What's in / out of scope for launch
START_HERE.md     Step-by-step local setup guide (start here)
```

## Quick start

See **[START_HERE.md](START_HERE.md)** for the full setup walkthrough.

**TL;DR:**

```bash
# Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
DATABASE_URL=postgresql://<user>@localhost:5432/english_quest python manage.py migrate
DATABASE_URL=postgresql://<user>@localhost:5432/english_quest python manage.py loadcontent
DATABASE_URL=postgresql://<user>@localhost:5432/english_quest python manage.py runserver

# Frontend (new terminal tab)
cd frontend
npm install
npm run dev
```

App: http://localhost:3000  
Admin: http://localhost:8000/admin/

### Demo credentials

| Role | Credentials |
|------|-------------|
| Student | Class code `TEST01` · Nickname `TestHero` · PIN `1234` |
| Admin | http://localhost:8000/admin/ · `admin` / `changeme123` |

## API

All endpoints are under `http://localhost:8000/api/`. Authenticated requests require `X-Device-Token: <token>` (returned by the join endpoint).

## Out of scope for MVP

Speaking assessment, social feed, teacher marketplace, adaptive CEFR engine, multi-subject content-authoring UI, school billing dashboard. See [MVP_SCOPE.md](MVP_SCOPE.md) for the full list.
