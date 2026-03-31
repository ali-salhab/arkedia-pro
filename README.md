# Arkedia — Booking Platform

A full-stack MERN booking platform with multi-role dashboards, hotel/restaurant/activity management, a channel manager, and a super-admin CMS.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Redux Toolkit (RTK Query) |
| Backend | Node.js, Express, MongoDB (Mongoose) |
| Auth | JWT (httpOnly cookies) |
| Image Upload | Cloudinary |
| Real-time | Socket.io |
| Containerization | Docker / Docker Compose |

## Project Structure

```
arkedia/
├── client/          # Vite + React frontend
├── server/          # Express API
├── docker-compose.yml
└── render.yaml      # Render.com deployment config
```

## Prerequisites

- Node.js ≥ 18
- MongoDB running locally on `mongodb://127.0.0.1:27017/booking_platform`
- (Optional) Cloudinary account — set env vars below

## Environment Variables

Create `server/.env`:

```env
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/booking_platform
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5001
```

## Getting Started

### Install dependencies

```bash
# Server
cd server && npm install

# Client
cd client && npm install
```

### Seed the database

```bash
cd server && npm run seed
```

### Run in development

```bash
# Terminal 1 – API server (port 5001)
cd server && npm run dev

# Terminal 2 – Vite dev server (port 5173)
cd client && npm run dev
```

Or use the VS Code task **"Start Dev Servers"** which starts both simultaneously.

### Run with Docker

```bash
docker-compose up --build
```

## Roles

| Role | Access |
|---|---|
| `super_admin` | Full platform access, CMS, manual bookings |
| `admin` / `hotel` | Hotel management, channel manager, bookings |
| `restaurant_admin` | Restaurant management |
| `activity_admin` | Activity management |

## API Routes

| Prefix | Description |
|---|---|
| `POST /api/auth/login` | Login, returns JWT cookie |
| `GET/POST /api/hotels` | Hotel CRUD |
| `GET/POST /api/restaurants` | Restaurant CRUD |
| `GET/POST /api/activities` | Activity CRUD |
| `GET/POST /api/bookings` | Booking management |
| `GET/PUT /api/channel-config` | Channel manager config (per hotel) |
| `GET/PUT /api/app-settings/:key` | Global CMS settings (super_admin) |
| `POST /api/upload` | Cloudinary image upload |
| `GET /api/finance` | Finance records |
| `GET /api/data` | Analytics / dashboard metrics |

## Deployment

Configured for [Render.com](https://render.com) via `render.yaml`. Run `prepare-deploy.sh` (Linux/Mac) or `prepare-deploy.bat` (Windows) before pushing.
