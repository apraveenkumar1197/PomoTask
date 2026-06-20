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

### Analytics Dashboard
![Dashboard Screen](screenshots/dashboard.png)

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

Or with Docker:

```bash
cd django
docker.bat        # Windows helper script
# or: docker build -t pomotask-api . && docker run -p 8000:8000 pomotask-api
```

### Frontend

```bash
cd react-native
npm install

npm run web       # Run in browser
npm run android   # Run on Android
npm run ios       # Run on iOS (macOS only)
```

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
`django/docker.bat` + manual `react-native` build workflow. One pipeline run builds
both Docker images and (re)starts both containers:

| Service | Image / Container | Host Port | Container Port |
|---|---|---|---|
| Django backend | `pomotask-django` | **4310** | 8000 |
| React Native (Expo web, served via Nginx) | `pomotask-react-native` | **4392** | 80 |

### Prerequisites on the Jenkins agent
- Docker installed, with the Jenkins service/user allowed to run `docker` commands
  (e.g. added to the `docker` group on Linux)
- Network access to pull the base images (`python:3.10-slim`, `node:20-alpine`,
  `nginx:stable-alpine`) and to reach this Git repository

### Credentials to configure in Jenkins

Both Dockerfiles `COPY` the entire build context, so each app's `.env` file must
exist on disk **before** `docker build` runs (it gets baked into the image — for
the frontend, the `EXPO_PUBLIC_*` vars are inlined into the static web bundle at
build time). Create these under **Manage Jenkins → Credentials**:

| Credential ID | Type | Contents |
|---|---|---|
| `pomotask-django-env` | Secret file | Full contents of `django/.env` — see `django/.env.example` for the keys: `ALLOWED_HOSTS`, `SECRET_KEY`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `AUTH_USERNAME`, `AUTH_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRY_MINUTES`, `MONGO_CONTAINER_ID`, `MONGO_ADMIN_USER`, `MONGO_ADMIN_PASSWORD`, `BACKUP_EMAIL`, `GMAIL_APP_PASSWORD` |
| `pomotask-react-native-env` | Secret file | Full contents of `react-native/.env` — see `react-native/.env.example` for the keys: `EXPO_PUBLIC_API_BASE_URL_MS1`, `EXPO_PUBLIC_API_BASE_URL_MS2` |

If the Jenkins job pulls this repository over SSH/HTTPS with restricted access, also
add a **Username with password** or **SSH key** credential and select it in the job's
*Pipeline → SCM* configuration (this is separate from the two secret files above and
isn't referenced inside the `Jenkinsfile` itself).

### Setting up the pipeline job
1. In Jenkins, create a new **Pipeline** job (or a **Multibranch Pipeline** if you
   want every branch built automatically).
2. Under **Pipeline**, set *Definition* to **Pipeline script from SCM**, choose **Git**,
   point it at this repository, and set the script path to `Jenkinsfile`.
3. Add the two **Secret file** credentials listed above (`pomotask-django-env`,
   `pomotask-react-native-env`) before the first run.
4. Run the job. On success it will:
   - write `django/.env` and `react-native/.env` from the secret file credentials
   - `docker build` the `pomotask-django` and `pomotask-react-native` images
   - remove any previous containers with the same names and start fresh ones,
     publishing the backend on port **4310** and the frontend on port **4392**
   - prune dangling images left over from the previous build
5. (Optional) Add a webhook or polling trigger on the job to redeploy automatically
   on every push to `master`.

### Notes
- The pipeline assumes a Linux Jenkins agent (`sh` steps). If your agent is Windows,
  replace the `sh` blocks in `Jenkinsfile` with `bat` equivalents.
- MongoDB itself is not managed by this pipeline — `DB_HOST` / `MONGO_*` values in
  `django/.env` should point at your existing Mongo instance/container.
- `docker run --restart unless-stopped` is used so both containers survive an agent
  reboot without needing the pipeline to run again.
