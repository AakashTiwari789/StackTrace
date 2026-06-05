# StackTrace

StackTrace is a small full-stack coding platform prototype with a Next.js frontend and an Express + MongoDB API backend. This repository contains a client (Next.js App Router) and a server (Express, Mongoose). The project focuses on authentication, email verification, session management, and an initial problem/problemset scaffold.

## Highlights

- Email & OTP verification flows
- JWT-based auth with refresh tokens and session revocation
- Google OAuth sign-in (Passport)
- Per-device active session management and logout-from-all-devices
- Public user profiles and editable authenticated profiles
- Next.js UI scaffolding for problems, leaderboards, and public pages
- Monaco Editor integration for code editing (placeholder for now)
- Resizeable two-column layout for problem-solving interface

## Tech Stack

- Client: Next.js (App Router), React, Tailwind CSS
- Server: Node.js, Express, MongoDB (Mongoose), Redis (token revocation), Passport (Google OAuth)
- Email: Nodemailer with Gmail OAuth

## Quick Start (local)

Prerequisites: Node.js 18+, MongoDB, Redis

1) Start the API

```bash
cd server
npm install
cp .env.sample .env
# Edit server/.env with your MongoDB, Redis and email credentials
npm run dev
```

2) Start the client

```bash
cd client
npm install
cp .env.sample .env
# Set NEXT_PUBLIC_API_BASE_URL to your API base, e.g. http://localhost:5000/api/v1
npm run dev
```

By default the client runs at `http://localhost:3000` and the server at the port in `server/.env` (commonly `5000`).

## Environment variables

Refer to `server/.env` and `client/.env.sample` for the full list. Important server vars include `MONGODB_URI`, `REDIS_*`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, and Gmail OAuth credentials (`EMAIL_CLIENT_ID`, `EMAIL_CLIENT_SECRET`, `EMAIL_REFRESH_TOKEN`, `EMAIL_USER`).

## Project layout

```
client/    # Next.js frontend
server/    # Express API and business logic
```

Key backend folders:

- `controllers/` — route handlers
- `models/` — Mongoose models
- `routes/` — Express routes
- `services/` — auxiliary services (mail, auth)
- `utils/` — helpers and API response/error wrappers

Key frontend folders:

- `src/app/` — Next.js app routes and layouts
- `src/components/` — shared React components
- `src/services/` — client-side API wrappers

## Notes for contributors

- The repo is intended as a starting point; many UI pages are scaffolded placeholders.
- If running locally, ensure your `FRONTEND_URL` and OAuth callback URLs match your dev hosts.
- Email sending uses Gmail OAuth — set those credentials or stub the mail service for local testing.

## Scripts

- Client: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`
- Server: `npm run dev`, `npm run start`

## License

ISC — see [server/package.json](server/package.json) for license metadata.

---
If you want, I can also add a short development checklist or polish the `client/.env.sample` and `server/.env.sample` files. 
