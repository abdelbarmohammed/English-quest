# English Quest — Getting Started

Welcome! This guide walks you through running the project on your computer, step by step.
No prior programming experience is assumed.

---

## Test credentials (start here if the app is already running)

If someone has already set the app up and you just want to try it, use these:

### Student app — http://localhost:3000

| Field | Value |
|-------|-------|
| Class code | `TEST01` |
| Nickname | `TestHero` |
| PIN | `1234` |

You can also join as a new student: use `TEST01` as the class code, pick any nickname, and choose any 4-digit PIN.

### Teacher / admin panel — http://localhost:8000/admin/

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `changeme123` |

> Change this password before sharing access with anyone outside the team.

### API base URL

All API calls go to `http://localhost:8000/api/`. Authenticated requests require the header `X-Device-Token: <token>` (obtained from the join endpoint).

---

## What you can test

Start at http://localhost:3000/join, enter the student credentials above, and navigate naturally — the journey map links to everything. Or jump directly:

| Screen | URL |
|--------|-----|
| Join screen | http://localhost:3000/join |
| Journey map (home) | http://localhost:3000/home |
| Leaderboard | http://localhost:3000/leaderboard |
| Blocked page (geofence) | http://localhost:3000/blocked |
| Admin panel | http://localhost:8000/admin/ |

Unit, lesson, and boss pages are reached by clicking through the journey map — the IDs in the URL change each time the database is re-seeded, so don't hardcode them.

---

## What you need to install first

Before anything else, install these tools (one-time setup):

| Tool | What it does | Download |
|------|-------------|---------|
| **Node.js** (v20+) | Runs the website front-end | https://nodejs.org — choose "LTS" |
| **Python** (v3.12+) | Runs the back-end server | https://python.org/downloads |
| **PostgreSQL** (v14+) | The database | https://postgresql.org/download |

After installing, open a terminal (Windows: `PowerShell`) and verify:

```
node --version    # should print v20.x.x or higher
python3 --version # should print 3.12.x or higher
psql --version    # should print 14.x or higher
```

---

## One-time database setup

Open `psql` (the PostgreSQL command-line tool):

```bash
psql postgres
```

Then run these two commands inside psql:

```sql
CREATE DATABASE english_quest;
\q
```

That creates the empty database the app will use.

---

## Setting up the back-end (Django)

Open a terminal and navigate to the `backend` folder:

```bash
cd /path/to/Abdeljalil/backend
```

Create a Python virtual environment (keeps dependencies isolated):

```bash
python3 -m venv venv
source venv/bin/activate        # Mac / Linux
# venv\Scripts\activate         # Windows
```

Install the required packages:

```bash
pip install -r requirements.txt
```

Set up the database tables:

```bash
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/english_quest python manage.py migrate
```

Replace `YOUR_USERNAME` with your computer login name (the one you see in the terminal prompt).

Load the demo content (lessons, questions, boss):

```bash
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/english_quest python manage.py loadcontent
```

Create an admin account so you can log into the teacher dashboard:

```bash
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/english_quest python manage.py createsuperuser
```

It will ask for a username, email, and password — choose anything you like.

> The shared team admin account is already set up: **username `admin`, password `changeme123`** (see top of this file). You only need to run `createsuperuser` if you want your own personal admin account.

---

## Running the back-end server

Every time you want to use the app, start the back-end first:

```bash
cd /path/to/Abdeljalil/backend
source venv/bin/activate
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/english_quest python manage.py runserver
```

Leave this terminal open. The server is running at **http://localhost:8000**.

To see the teacher / admin panel, open http://localhost:8000/admin/ in your browser and log in with the admin account you just created.

---

## Setting up the front-end (Next.js)

Open a **new** terminal tab and navigate to the `frontend` folder:

```bash
cd /path/to/Abdeljalil/frontend
npm install
npm run dev
```

Leave this terminal open too. The website is now running at **http://localhost:3000**.

---

## Trying the app

1. Open http://localhost:3000 in your browser.
2. On the join screen, enter:
   - **Class code:** `TEST01`
   - **Nickname:** `TestHero` (or pick any name)
   - **PIN:** `1234` (or any 4 digits for a new student)
3. You'll land on the journey map. Click a unit to start learning.

---

## Quick cheat sheet

| What | Command |
|------|---------|
| Start back-end | `DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/english_quest python manage.py runserver` |
| Start front-end | `npm run dev` (inside `frontend/`) |
| Open the app | http://localhost:3000 |
| Open admin panel | http://localhost:8000/admin/ |
| Re-seed demo data | `python manage.py loadcontent` |
| Wipe and re-seed | `python manage.py loadcontent --clear` |

---

## Troubleshooting

**"Module not found" or "No module named django"**
You forgot to activate the virtual environment. Run `source venv/bin/activate` first.

**"could not connect to server" (database error)**
PostgreSQL is not running. On Mac, open the `PostgreSQL` app in Applications and click Start, or run `brew services start postgresql`.

**Port 3000 or 8000 already in use**
Another process is using that port. Either stop that process or add `--port 3001` (front-end) or `runserver 8001` (back-end).

**"relation does not exist" (database error)**
Run `python manage.py migrate` to create the tables.

---

## Recent improvements (last updated 2026-08-08)

- All emoji replaced with Material Symbols icons throughout the app
- Admin panel upgraded to Django 5.2.17 (fixes Python 3.14 compatibility)
- HUD prompt text no longer overflows over hearts in the game view
- Comprehensive visual polish pass: entrance animations, dynamic timer bar, boss floating idle animation, victory overlay with staggered animations, XP counter slam effect, glow ring burst on correct answers, staggered journey-map node fade-in
