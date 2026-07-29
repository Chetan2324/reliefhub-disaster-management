# ReliefHub Disaster Management Platform

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Tooling-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-API%20Pattern-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Data%20Layer%20Pattern-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![OpenAI API](https://img.shields.io/badge/OpenAI-Ready-412991?style=for-the-badge&logo=openai&logoColor=white)

ReliefHub is a full-stack disaster-response operations platform that helps teams coordinate incident declaration, camps, inventory, transport, donations, volunteer activity, and citizen-facing emergency requests from a single command center.

---

## Features

- Role-based authentication with Laravel Sanctum
- Dashboard analytics for operational overview
- REST APIs for disasters, warehouses, inventory, camps, citizens, transport, distributions, volunteers, donations, and emergency requests
- Citizen portal routes for SOS, alerts, aid, and camp details
- Tactical UI built with React + Tailwind + Framer Motion
- Deployment-ready setup for Render (backend) and Vercel (frontend)

## Tech Stack

### Current implementation
- **Frontend:** React 19, Vite, Redux Toolkit, Axios, Tailwind CSS v4, Framer Motion, Recharts
- **Backend:** Laravel 12 (PHP 8.2), Sanctum, Eloquent ORM
- **Database:** SQLite (default demo mode), MySQL-compatible configuration via Laravel

### Ecosystem badges included for roadmap/portability
- **Node.js / Express / MongoDB / OpenAI API** are included as compatibility/roadmap indicators and are not core runtime dependencies in the current codebase.

## Architecture Overview

```text
frontend (React SPA)  --->  backend (Laravel REST API)  --->  relational database
          |                       |
          |                       +-- auth:sanctum + role middleware
          +-- axios interceptor + token storage
```

- Frontend calls `/api/v1/*` endpoints.
- Backend validates requests through dedicated Form Request classes.
- API responses are normalized through `ApiResponse` trait.

## Folder Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Http/Requests/
│   │   ├── Http/Resources/
│   │   ├── Models/
│   │   ├── Repositories/
│   │   └── Services/
│   ├── database/
│   ├── routes/
│   └── render-build.sh
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── store/
│   └── vercel.json
├── .github/
└── render.yaml
```

## Screenshots

> Add screenshots in `docs/screenshots/` and update links below.

- Dashboard: `docs/screenshots/dashboard.png`
- Distributions Workflow: `docs/screenshots/distributions.png`
- Citizen Portal: `docs/screenshots/citizen-portal.png`

## Installation

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 20+
- npm 10+

### 1) Clone
```bash
git clone https://github.com/Chetan2324/reliefhub-disaster-management.git
cd reliefhub-disaster-management
```

### 2) Backend setup
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

### 3) Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and expects backend at `http://localhost:8000/api/v1` by default.

## Environment Variables

Use:
- `backend/.env.example` for backend Laravel variables
- `./.env.example` for cross-project reference values

Key variables:

### Backend
- `APP_ENV`, `APP_DEBUG`, `APP_URL`
- `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `SESSION_DRIVER`, `CACHE_STORE`, `QUEUE_CONNECTION`

### Frontend
- `VITE_API_BASE_URL`
- `VITE_APP_NAME`

## Running Locally

- Start backend: `cd backend && php artisan serve`
- Start frontend: `cd frontend && npm run dev`
- Optional API smoke checks: `cd backend && php artisan test`

## Build Instructions

- Frontend production build:
  ```bash
  cd frontend
  npm run build
  ```
- Backend optimization (production):
  ```bash
  cd backend
  php artisan optimize
  ```

## Deployment

### Vercel (Frontend)
1. Import the `frontend` directory as project root.
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Configure env var: `VITE_API_BASE_URL=https://<your-backend-domain>/api/v1`
5. `frontend/vercel.json` already includes SPA rewrites.

### Render (Backend)
1. Use `render.yaml` or create a Web Service with rootDir `backend`.
2. Build script: `backend/render-build.sh`
3. Set required environment variables (`APP_KEY`, DB config if not SQLite).
4. Ensure migrations run on deploy.

## API Endpoints

Base URL: `/api/v1`

### Auth
- `POST /register`
- `POST /login`
- `POST /password/forgot`
- `POST /password/reset`
- `POST /logout` (auth)
- `GET /me` (auth)

### Dashboard
- `GET /dashboard/summary` (auth)
- `GET /dashboard/charts` (auth)

### Resources (auth)
- `/disasters`
- `/warehouses`
- `/inventory-items`
- `/material-receipts`
- `/dispatches`
- `/transport-vehicles`
- `/movement-trackings`
- `/camps`
- `/citizens`
- `/distributions` (+ `/distributions/stats`, `/distributions/{id}/verify`, `/distributions/{id}/deliver`)
- `/emergency-requests`
- `/volunteers`
- `/donations`

## Future Improvements

- Add CI workflows for frontend lint/build and backend tests
- Add API contract docs (OpenAPI/Swagger)
- Add real-time emergency updates (WebSockets)
- Add comprehensive test coverage for API workflows and UI state transitions
- Add production observability (error tracking + metrics)

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening PRs.

## License

This project is licensed under the [MIT License](./LICENSE).

## Author

- GitHub: [@Chetan2324](https://github.com/Chetan2324)
- LinkedIn: [Your LinkedIn Profile](https://www.linkedin.com/in/your-profile)
