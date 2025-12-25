# MERN Booking Platform (Multi-Dashboard)

Multi-tenant booking platform with five roles (super admin, admin company, hotel, restaurant, activity), JWT auth with access/refresh tokens, role- and permission-based routing, dynamic sidebar, and CRUD modules.

## Stack

- Backend: Node.js, Express, Mongoose, JWT, bcrypt
- Frontend: React, Vite, React Router v6, Redux Toolkit + RTK Query
- DB: MongoDB
- Deployment: Docker & docker-compose

## Quickstart (local)

1. Copy envs:
   - `cp server/.env.example server/.env`
   - `cp client/.env.example client/.env`
2. Install deps:
   - `cd server && npm install`
   - `cd ../client && npm install`
3. Run services (dev):
   - Terminal 1: `cd server && npm run dev`
   - Terminal 2: `cd client && npm run dev`
4. Open client at `http://localhost:5173`.

### Seed demo accounts

- In `server`: `npm run seed`
- Creates roles plus users:
  - super@arkedia.com / Password123! (super_admin)
  - admin@arkedia.com / Password123! (admin)
  - hotel@arkedia.com / Password123! (hotel)
  - restaurant@arkedia.com / Password123! (restaurant)
  - activity@arkedia.com / Password123! (activity)

## Quickstart (docker-compose)

```
docker-compose up --build
```

- API: http://localhost:5000
- Client: http://localhost:5173
- Mongo: localhost:27017

## Auth flow

- `POST /api/auth/login` → returns `{ user, accessToken, refreshToken }`.
- Frontend stores tokens in Redux; requests include `Authorization: Bearer <accessToken>`.
- `POST /api/auth/refresh` to rotate tokens.

## Sidebar

- `GET /api/sidebar` returns menu items filtered by user permissions.

## Key folders

- `server/src` → Express app, middleware, models, controllers, routes.
- `client/src` → React app with dashboards per role, layout, components, store, RTK Query API slices.

## Roles & permissions

- Roles: `super_admin`, `admin`, `hotel`, `restaurant`, `activity`.
- Permissions follow `module:action` (e.g., `users:view`, `bookings:add`). Matrix defined in `server/src/utils/permissions.js`.

## Running tests

- (Placeholder) Add tests as needed; none included yet.

## Postman

- Import `postman/booking-platform.postman_collection.json` for sample requests.
