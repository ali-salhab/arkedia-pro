# Arkedia — Booking Platform (Copilot Instructions)

- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions
- [x] Compile the Project — No errors found.
- [x] Create and Run Task — VS Code task "Start Dev Servers" created and running.
- [x] Launch the Project — Client running on http://localhost:5173 (or 5174 if port busy), server on port 5001.
- [x] Ensure Documentation is Complete — README.md created, copilot-instructions.md updated.

## Project Summary

Full-stack MERN booking platform. Multi-role dashboards for hotel/restaurant/activity management, a per-hotel channel manager (backed by MongoDB), a super-admin CMS, Cloudinary image uploads, and Socket.io notifications.

## Architecture

- **Client**: React 18 + Vite + Tailwind CSS + Redux Toolkit (RTK Query), port 5173
- **Server**: Express + Mongoose, port 5001
- **DB**: MongoDB `booking_platform` (local: `mongodb://127.0.0.1:27017/booking_platform`)
- **Auth**: JWT via httpOnly cookies
- **Image storage**: Cloudinary (`POST /api/upload`)

## Key Conventions

- All channel manager pages use `useChannelSection(sectionName, default)` — data saved to `ChannelManagerConfig` in MongoDB per hotel
- Super-admin CMS pages use `useAppSetting(key, default)` — data saved to `AppSettings` in MongoDB
- Hotel/Restaurant/Activity wizard publishes upload gallery images to Cloudinary, storing URLs in `gallery: [String]` field on each model
- `crudFactory.js` auto-scopes queries by `adminId` for hotel-role users
- RTK Query store is at `client/src/store/services/api.js`

## Dev Launch

Use VS Code task **"Start Dev Servers"** or run manually:
```bash
# API (port 5001)
cd server && npm run dev
# Client (port 5173)
cd client && npm run dev
```
  - User is provided with clear instructions to debug/launch the project

Before starting a new task in the above plan, update progress in the plan.
-->

- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.
