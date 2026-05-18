# StackTrace

StackTrace is a full-stack coding platform built with a Next.js client and an Express/MongoDB API server. The current app focuses on authentication, email verification, profile management, session control, and a set of scaffolded product pages for the coding platform experience.

## Current Features

- Local account registration and login with JWT cookies.
- Google OAuth login flow.
- Auth state bootstrap on the client through `/auth/me`.
- Email verification through either a one-time password or a verification link.
- Active session tracking with per-device logout and logout-from-all-devices support.
- Public user profiles by username.
- Logged-in profile editing with avatar upload.
- Dark/light theme toggle in the site header.
- Responsive navigation for authenticated and public users.
- Public content pages for features, developers, contact, privacy, terms, and subscribe.
- Problem routing scaffold, including a redirect from `/problems` to `/problemset` and a dynamic problem page route.
- Protected dashboard-style pages for verification, sessions, and admin access.

## Tech Stack

- Client: Next.js App Router, React, Tailwind CSS
- Server: Node.js, Express, MongoDB with Mongoose, Redis, JWT, Passport Google OAuth
- Email: Nodemailer with Gmail OAuth credentials
- File upload: Multer on the API, external storage upload service for profile photos

## Monorepo Structure

```
client/   # Next.js frontend
server/   # Express API
```

## Prerequisites

- Node.js 18+ recommended
- MongoDB instance
- Redis instance for token/session revocation support
- Gmail OAuth credentials for email sending and Google sign-in
- A frontend URL and server URL configured in environment variables

## Setup

### 1) Client

```bash
cd client
npm install
cp .env.sample .env
```

Set `client/.env`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

Start the client:

```bash
npm run dev
```

The client runs on http://localhost:3000 by default.

### 2) Server

```bash
cd server
npm install
cp .env.sample .env
```

Edit `server/.env` with the variables below, then start the server:

```bash
npm run dev
```

The API listens on the configured `PORT` value. The code defaults to 3000 if `PORT` is not set, but the client expects the API at the base URL above.

## Environment Variables

### Client (`client/.env`)

- `NEXT_PUBLIC_API_BASE_URL` - Base URL for the API, for example `http://localhost:5000/api/v1`

### Server (`server/.env`)

- `PORT` - API port
- `SERVER_URL` - Public server URL used for OAuth callback URLs
- `FRONTEND_URL` - Frontend URL used for redirects after OAuth and email verification
- `MONGODB_URI` - MongoDB connection string
- `REDIS_PASS` - Redis password if required by your Redis setup
- `ALLOWED_ORIGINS` - Comma-separated list of allowed client origins
- `ACCESS_TOKEN_SECRET` - JWT access token secret
- `ACCESS_TOKEN_EXPIRY` - Access token expiry, for example `10m`
- `ACCESS_TOKEN_EXPIRY_MS` - Access token expiry in milliseconds
- `REFRESH_TOKEN_SECRET` - JWT refresh token secret
- `REFRESH_TOKEN_EXPIRY` - Refresh token expiry, for example `7d`
- `REFRESH_TOKEN_EXPIRY_MS` - Refresh token expiry in milliseconds
- `EMAIL_CLIENT_ID` - Gmail OAuth client ID used by mail sending and Google OAuth
- `EMAIL_CLIENT_SECRET` - Gmail OAuth client secret used by mail sending and Google OAuth
- `EMAIL_REFRESH_TOKEN` - Gmail OAuth refresh token for Nodemailer
- `EMAIL_USER` - Gmail address used as the sender

## Scripts

### Client

- `npm run dev` - Start the Next.js dev server
- `npm run build` - Build for production
- `npm run start` - Run the production build
- `npm run lint` - Run linting

### Server

- `npm run dev` - Start the API with nodemon
- `npm run start` - Start the API

## Current UI Routes

### Public

- `/` - Landing page
- `/account/login` - Login and registration
- `/account/forgot-password` - Placeholder forgot-password screen
- `/features` - Features page scaffold
- `/developers` - Developers page scaffold
- `/contact` - Contact page scaffold
- `/privacy` - Privacy page scaffold
- `/terms` - Terms page scaffold
- `/subscribe` - Subscribe page scaffold
- `/problemset` - Problem set page scaffold
- `/problems` - Redirects to `/problemset`
- `/problems/[problem]` - Dynamic problem page scaffold
- `/leaderboard` - Leaderboard page scaffold
- `/profile/[username]` - Public profile page
- `/verify-email/[link]` - Email verification link handler

### Protected

- `/verify` - OTP and link verification controls
- `/sessions` - Active session management
- `/admin` - Admin placeholder page

## API Overview

Base URL: `/api/v1`

### Health

- `GET /health` - Health check

### Auth

- `POST /auth/register` - Register and create a session
- `POST /auth/login` - Login with username or email
- `POST /auth/logout` - Logout current session
- `GET /auth/me` - Fetch the authenticated user
- `POST /auth/send-verification-link` - Send an email verification link
- `GET /auth/verify-email/:link` - Verify a user through a link
- `POST /auth/send-otp` - Send a verification OTP
- `POST /auth/verify-otp` - Verify the OTP
- `GET /auth/google` - Start Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback

### User

- `GET /user/get-user/:id` - Fetch a user by MongoDB ID
- `GET /user/:username` - Fetch a user by username
- `POST /user/sessions` - List active sessions for the authenticated user
- `POST /user/logout-all-devices` - Revoke all active sessions for the authenticated user
- `POST /user/logout-device` - Revoke a specific session
- `PUT /user/update-photo` - Upload and update the authenticated user's profile photo

## Authentication & Verification

### OTP Verification Flow

OTP values are hashed with SHA-256 before being stored. Each OTP is tied to a single user, expires after 5 minutes, and can only be used once.

### Email Verification Flow

Two verification methods are supported:

1. Verification link: a unique link sent to the user’s email and valid for 5 minutes.
2. OTP: a 6-digit code sent to the user’s email and valid for 5 minutes.

Both verification methods require an authenticated user who is not already verified.

## Notes

- Several route pages are currently scaffolded with placeholder UI, but the auth, verification, profile, and session features are implemented end to end.
- The public header and footer already expose the main navigation entry points for the current app.

## License

ISC (see [server/package.json](server/package.json))
