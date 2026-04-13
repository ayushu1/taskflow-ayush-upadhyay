# TaskFlow

A modern, production-ready task management application built with React, TypeScript, and Material UI.

## Overview

TaskFlow is a frontend-only task management application designed as a take-home assignment for a Frontend Engineer role. It demonstrates clean architecture, responsive design, and modern React patterns without requiring a backend server.

The application uses Mock Service Worker (MSW) to simulate a full REST API, allowing the app to function realistically while remaining frontend-only.

## Architecture Decisions

### Tech Stack

- **React 19** with TypeScript - Modern React with strict typing
- **Vite** - Fast development and optimized builds
- **React Router v7** - Client-side routing with protected routes
- **TanStack Query** - Server state management with caching, optimistic updates, and error handling
- **Material UI v6** - Consistent, accessible component library with responsive design
- **React Hook Form + Zod** - Type-safe form handling with validation
- **MSW (Mock Service Worker)** - Realistic API mocking that intercepts network requests

### Why These Choices?

1. **TanStack Query**: Handles loading states, error handling, caching, and background refetching automatically. The optimistic update pattern for task status changes provides snappy UX with proper rollback on failure.

2. **MSW over mock functions**: MSW intercepts actual HTTP requests at the network level, preserving realistic API boundaries. This makes the code indistinguishable from a real API integration.

3. **MUI**: Provides production-ready, accessible components with excellent responsive behavior out of the box. The design is clean and familiar to users.

4. **Feature-based structure**: Code is organized by domain (auth, projects, tasks) rather than type, making it easier to locate related code and understand boundaries.

### State Management

- **Server state**: TanStack Query manages all API data with automatic caching and synchronization
- **Client state**: React Context handles auth state persistence across the app
- **No global state library needed**: The combination of TanStack Query and React Context is sufficient for this application's needs

## Running Locally

Assuming Docker is installed, these are the exact steps from clone to running app:

```bash
git clone https://github.com/ayushu1/taskflow-ayush-upadhyay.git
cd taskflow
cp .env.example .env
docker compose up --build
```

The app will be available at `http://localhost:5173`.

### Optional: Run Without Docker (Local Dev)

Prerequisites:
- Node.js 20+
- npm

Install and run:

```bash
npm install
npm run dev
```

Build and preview production bundle:

```bash
npm run build
npm run preview
```

## Running Migrations

This is a frontend-only application. No backend or database migrations are required.

The application uses MSW (Mock Service Worker) to intercept API requests in the browser. All data is stored in-memory and resets on page refresh (except for the seeded user account).

## Test Credentials

Use these credentials to sign in with the pre-seeded account:

- **Email**: `test@example.com`
- **Password**: `password123`

You can also create a new account through the registration page.

## API Reference

The app uses an MSW mock API at `http://localhost:4000` with the same contract as the assignment.

### Authentication

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/auth/register` | Create new account |
| POST | `/auth/login` | Sign in |

Example:
```json
// POST /auth/login
{ "email": "test@example.com", "password": "password123" }

// 200
{
  "token": "token_xxx",
  "user": { "id": "user-001-test-seed", "name": "Test User", "email": "test@example.com" }
}
```

### Projects

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/projects` | List all projects |
| POST | `/projects` | Create project |
| GET | `/projects/:id` | Get project details |
| PATCH | `/projects/:id` | Update project |
| DELETE | `/projects/:id`    | Delete project        |

Example:
```json
// POST /projects
{ "name": "New Project", "description": "Optional description" }

// 201
{
  "id": "uuid",
  "name": "New Project",
  "description": "Optional description",
  "owner_id": "user-001-test-seed",
  "created_at": "2026-04-09T10:00:00Z",
  "updated_at": "2026-04-09T10:00:00Z",
  "status": "active"
}
```

### Tasks

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/projects/:id/tasks` | List tasks (supports `?status=` and `?assignee=`) |
| POST | `/projects/:id/tasks` | Create task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

Example:
```json
// PATCH /tasks/:id
{ "status": "done", "priority": "low", "assignee_id": "user-001-test-seed", "due_date": "2026-04-20" }

// 200
{
  "id": "task-001",
  "title": "Design homepage",
  "description": "...",
  "status": "done",
  "priority": "low",
  "assignee_id": "user-001-test-seed",
  "project_id": "proj-001",
  "due_date": "2026-04-20",
  "created_at": "...",
  "updated_at": "..."
}
```

### Error Responses

- `400 { "error": "validation failed", "fields": { ... } }` - Validation errors
- `401 { "error": "unauthorized" }` - Missing or invalid token
- `403 { "error": "forbidden" }` - Insufficient permissions
- `404 { "error": "not found" }` - Resource not found

Note: This is frontend-only; Docker runs a static nginx container and MSW mocks all backend endpoints in the browser.
