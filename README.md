# PomoTask

A full-stack productivity app combining **Pomodoro time tracking**, **task management**, **goal planning**, and a **calendar** view — built with React Native (Expo) on the frontend and Django REST Framework + MongoDB on the backend.

---

## Screenshots

### Login
![Login Screen](screenshots/login.png)

### Tasks
![Tasks Screen](screenshots/tasks.png)

### Pomodoro Timer
![Pomodoro Timer](screenshots/pomodoro.png)

### Calendar
![Calendar Screen](screenshots/calendar.png)

### Goals
![Goals Screen](screenshots/goals.png)

---

## Features

### Task Management
- Create, edit, and complete tasks with a quick-add bar at the bottom
- Filter tasks by **My Day**, **Important**, **Planned**, and **History**
- Tag tasks and pin tags to the home sidebar for quick filtering
- Per-task metadata: due date, planned date, time range, time estimate, tags
- Mark tasks as important (starred) or part of My Day (lightbulb)

### Pomodoro Timer
- Per-task overall time tracker (hours:minutes:seconds stopwatch)
- Built-in Pomodoro cycle: 4 focus sessions → long break (auto-advance)
- Configurable focus / short break / long break durations via settings modal
- Progress bar and cycle indicators
- Timer state synced to the backend so it persists across sessions
- Audio alert when a session ends

### Calendar
- FullCalendar integration with **Day**, **Week**, **Month**, and **List** views
- Tasks and activities rendered as colour-coded events
- **Drag-and-drop** to reschedule tasks (snaps to 15-minute intervals)
- Click or drag an empty slot to create a task; **Shift + drag** to log an activity
- Live "now" indicator

### Goals
- **Yearly goals** — set objectives for the year; browse across multiple years
- **Monthly goals** — break yearly goals into monthly milestones; browse by month
- Animated progress bars on the dashboard show monthly goal completion
- Full CRUD with inline edit/delete

### Analytics Dashboard
- Pie chart: **Planned vs Unplanned** tasks
- Pie chart: **Today's Progress** (Todo vs Done)
- Monthly goals progress list with animated bars

---

## Tech Stack

### Frontend
| Library | Purpose |
|---|---|
| React Native 0.81 + Expo 54 | Cross-platform mobile & web app |
| Expo Router 6 | File-based routing |
| React Native Paper | Material Design UI components |
| FullCalendar 6 | Interactive calendar (web) |
| react-native-chart-kit | Pie charts |
| Lucide React Native | Icon set |
| Axios | HTTP client |
| dayjs | Date manipulation |

### Backend
| Library | Purpose |
|---|---|
| Django 4.1 | Web framework |
| Django REST Framework 3.15 | REST API |
| MongoDB + djongo / mongoengine | Database |
| PyJWT | Authentication |
| APScheduler | Background job scheduling |
| Google API Python Client | Google Calendar integration |
| Docker | Containerised deployment |

---

## Project Structure

```
Pomotask/
├── react-native/          # Expo React Native frontend
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx      # Tasks screen
│   │   │   ├── dashboard.tsx  # Analytics dashboard
│   │   │   ├── goals.tsx      # Goals screen
│   │   │   └── calendar.tsx   # Calendar screen
│   │   ├── pomodoro.tsx       # Pomodoro timer
│   │   └── login.tsx          # Login screen
│   ├── components/            # Reusable UI components
│   ├── src/                   # API clients, contexts, utilities
│   └── assets/                # Images, sounds
│
├── django/                # Django REST backend
│   ├── Task/              # Task app (CRUD, timer, tags)
│   ├── Goal/              # Goal app (yearly & monthly)
│   ├── General/           # Dashboard & analytics
│   ├── PomoTask/          # Project settings
│   ├── Dockerfile
│   └── requirements.txt
│
└── screenshots/           # App screenshots (add yours here)
```

---

## Getting Started

### Backend

```bash
cd django

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate # macOS/Linux

pip install -r requirements.txt

# Configure environment variables (see .env.example)
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd react-native
npm install

npm run web       # Run in browser
npm run android   # Run on Android
npm run ios       # Run on iOS (macOS only)
```

### Everything with Docker Compose

A single [`docker-compose.yml`](docker-compose.yml) at the repo root builds and runs
MongoDB, the Django backend, and the React Native web frontend together:

```bash
cp .env.example .env                          # Mongo root credentials
cp django/.env.example django/.env            # fill in real values
cp react-native/.env.example react-native/.env

docker compose up -d --build
```

| Service | Container | Host Port |
|---|---|---|
| MongoDB | `pomotask_mongo` | internal only (not published) |
| Django backend | `pomotask_django` | **4310** |
| React Native web | `pomotask_react_native` | **4392** |

Mongo data is persisted in the named volume `pomotask_mongo_data` (mapped to
`/data/db`), so it survives `docker compose down` / container recreation — only
`docker compose down -v` removes it. The `django` service's `DB_HOST` is pinned to
`mongo` in `docker-compose.yml` so it always reaches the database over the compose
network, regardless of what `DB_HOST` is set to in `django/.env`.

---

## Adding Screenshots

Place your screenshots in the `screenshots/` folder using these filenames:

| File | Screen |
|---|---|
| `screenshots/login.png` | Login screen |
| `screenshots/tasks.png` | Tasks list |
| `screenshots/pomodoro.png` | Pomodoro timer |
| `screenshots/calendar.png` | Calendar view |
| `screenshots/goals.png` | Goals screen |
| `screenshots/dashboard.png` | Analytics dashboard |

---

## CI/CD Deployment (Jenkins)

The repo root contains a single [`Jenkinsfile`](Jenkinsfile) that replaces the old
`django/docker.bat` + manual `react-native` build workflow. One pipeline run drives
[`docker-compose.yml`](docker-compose.yml) to build both app images and (re)start all
three containers — MongoDB, Django, and the React Native web frontend.

### Prerequisites on the Jenkins agent
- Docker **and** the Docker Compose plugin (`docker compose` CLI) installed, with the
  Jenkins service/user allowed to run `docker` commands (e.g. added to the `docker`
  group on Linux)
- Network access to pull the base images (`mongo:7`, `python:3.10-slim`,
  `node:20-alpine`, `nginx:stable-alpine`) and to reach this Git repository

### Credentials to configure in Jenkins

`docker-compose.yml` reads the root `.env` for Mongo's root credentials, and each
Dockerfile `COPY`s the full build context, so all three `.env` files must exist on
disk **before** `docker compose up --build` runs (for the frontend, the
`EXPO_PUBLIC_*` vars are inlined into the static web bundle at build time). Create
these under **Manage Jenkins → Credentials**:

| Credential ID | Type | Contents |
|---|---|---|
| `pomotask-root-env` | Secret file | Full contents of the root `.env` — see `.env.example` for the keys: `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD`, `MONGO_INITDB_DATABASE`. The username/password must match `DB_USER` / `DB_PASSWORD` below |
| `pomotask-django-env` | Secret file | Full contents of `django/.env` — see `django/.env.example` for the keys: `ALLOWED_HOSTS`, `SECRET_KEY`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `AUTH_USERNAME`, `AUTH_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRY_MINUTES`, `MONGO_CONTAINER_ID`, `MONGO_ADMIN_USER`, `MONGO_ADMIN_PASSWORD`, `BACKUP_EMAIL`, `GMAIL_APP_PASSWORD` |
| `pomotask-react-native-env` | Secret file | Full contents of `react-native/.env` — see `react-native/.env.example` for the keys: `EXPO_PUBLIC_API_BASE_URL_MS1`, `EXPO_PUBLIC_API_BASE_URL_MS2` |

If the Jenkins job pulls this repository over SSH/HTTPS with restricted access, also
add a **Username with password** or **SSH key** credential and select it in the job's
*Pipeline → SCM* configuration (this is separate from the three secret files above and
isn't referenced inside the `Jenkinsfile` itself).

### Setting up the pipeline job
1. In Jenkins, create a new **Pipeline** job (or a **Multibranch Pipeline** if you
   want every branch built automatically).
2. Under **Pipeline**, set *Definition* to **Pipeline script from SCM**, choose **Git**,
   point it at this repository, and set the script path to `Jenkinsfile`.
3. Add the three **Secret file** credentials listed above (`pomotask-root-env`,
   `pomotask-django-env`, `pomotask-react-native-env`) before the first run.
4. Run the job. On success it will:
   - write the root `.env`, `django/.env`, and `react-native/.env` from the secret
     file credentials
   - run `docker compose up -d --build`, which builds the `django` and
     `react-native` images, pulls `mongo:7` if needed, and (re)creates all three
     containers — publishing the backend on port **4310** and the frontend on
     port **4392**
   - prune dangling images left over from the previous build
5. (Optional) Add a webhook or polling trigger on the job to redeploy automatically
   on every push to `master`.

### Notes
- The pipeline assumes a Linux Jenkins agent (`sh` steps). If your agent is Windows,
  replace the `sh` blocks in `Jenkinsfile` with `bat` equivalents.
- MongoDB is now managed by `docker-compose.yml` itself, with its data persisted in
  the named volume `pomotask_mongo_data` — it survives container recreation and
  agent reboots. `MONGO_CONTAINER_ID` in `django/.env` (used only by the unrelated
  `django/db_backup.sh` script) should be set to `pomotask_mongo`.
- All three services use `restart: unless-stopped`, so they come back up after an
  agent reboot without needing the pipeline to run again.
