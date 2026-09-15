# Testing Guide

## Running the backend locally

```bash
cd backend
DATABASE_URL=postgresql://mohammed@localhost:5432/english_quest python manage.py runserver
```

Replace `mohammed` with your local Postgres role if different.

## Seeding demo content

```bash
cd backend
DATABASE_URL=postgresql://mohammed@localhost:5432/english_quest python manage.py loadcontent
# To wipe and re-seed from scratch:
DATABASE_URL=postgresql://mohammed@localhost:5432/english_quest python manage.py loadcontent --clear
```

## Fixed test credentials

### Django admin (teacher / superuser)

| Field    | Value            |
|----------|------------------|
| URL      | http://localhost:8000/admin/ |
| Username | `admin`          |
| Password | `changeme123`    |

> Change this password before deploying to any shared environment.

### Student join (class code flow)

| Field      | Value             |
|------------|-------------------|
| Class code | `TEST01`          |
| Nickname   | `TestHero`        |
| PIN        | `1234`            |

Joining again with the same nickname + PIN returns a new `device_token` for the same student (re-join from a new device).

### Quick API smoke test

```bash
# Join as TestHero
curl -X POST http://localhost:8000/api/classes/join/ \
  -H "Content-Type: application/json" \
  -d '{"join_code":"TEST01","nickname":"TestHero","pin":"1234"}'
# Expected: {"device_token":"...","student_id":...,"nickname":"TestHero",...}

# Join as a new student (any unused nickname + 4-digit PIN)
curl -X POST http://localhost:8000/api/classes/join/ \
  -H "Content-Type: application/json" \
  -d '{"join_code":"TEST01","nickname":"NewPlayer","pin":"5678"}'
```

## Running the frontend locally

```bash
cd frontend
npm run dev
```

Open http://localhost:3000. On the join screen, enter class code `TEST01`, nickname `TestHero`, PIN `1234`.

## Demo content

- **School:** Demo School
- **Subject:** English
- **Unit:** The Passive Voice (lessons + questions + boss)
- **Boss:** Grammar Golem (speed_quiz template, 3 hearts, 10 s/question)
- **Lessons:** "What is the Passive Voice?", "Forming the Passive Voice"
- **Questions:** 10 speed-quiz + 6 shooter
