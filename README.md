# VerseWeaver

VerseWeaver is organized as a full-stack workspace with separate frontend and backend apps.

## Project Structure

- `frontend/` React + Vite + Tailwind client application
- `backend/` Node + Express API service

## Quick Start

### Install dependencies

```bash
npm install
```

### Run frontend

```bash
npm run dev:frontend
```

### Run backend

```bash
npm run dev:backend
```

### Build frontend

```bash
npm run build
```
# VerseWeaver Monorepo

VerseWeaver is now organized into separate frontend and backend applications.

## Structure

- frontend: React + Vite + Tailwind + Zustand client
- backend: Express API service

## Run Frontend

1. cd frontend
2. npm install
3. npm run dev

## Run Backend

1. cd backend
2. npm install
3. npm run dev

## Health Check

When backend is running, test:

- GET http://localhost:4000/api/health
