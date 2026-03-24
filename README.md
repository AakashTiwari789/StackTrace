# StackTrace

A full-stack web app with a Next.js client and an Express/MongoDB API server. The app focuses on user authentication, sessions, and coding-related pages like problemset, problems, and leaderboard.

## Tech Stack

- Client: Next.js (App Router), React, Tailwind CSS
- Server: Node.js, Express, MongoDB (Mongoose), Redis (optional), JWT
- Email: Nodemailer (Gmail OAuth)

## Monorepo Structure

```
client/   # Next.js frontend
server/   # Express API
```

## Prerequisites

- Node.js 18+ (recommended)
- MongoDB instance
- Redis instance (optional, see server config)
- Gmail OAuth credentials for email sending

## Setup

### 1) Client

```bash
cd client
npm install
cp .env.sample .env
```

Edit `client/.env`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

Start the client:

```bash
npm run dev
```

The client runs on http://localhost:3000.

### 2) Server

```bash
cd server
npm install
cp .env.sample .env
```

Edit `server/.env` using the variables below.

Start the server:

```bash
npm run dev
```

The API runs on http://localhost:5000 by default.

## Environment Variables

### Client (`client/.env`)

- `NEXT_PUBLIC_API_BASE_URL` - Base URL for the API (default: http://localhost:5000/api/v1)

### Server (`server/.env`)

- `PORT` - API port (default: 5000 in sample)
- `MONGODB_URI` - MongoDB connection string
- `REDIS_PASS` - Redis password (optional if Redis disabled)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins
- `ACCESS_TOKEN_SECRET` - JWT access token secret
- `ACCESS_TOKEN_EXPIRY` - Access token expiry (e.g. 10m)
- `REFRESH_TOKEN_SECRET` - JWT refresh token secret
- `REFRESH_TOKEN_EXPIRY` - Refresh token expiry (e.g. 7d)
- `REFRESH_TOKEN_EXPIRY_MS` - Refresh token expiry in ms
- `ACCESS_TOKEN_EXPIRY_MS` - Access token expiry in ms
- `FRONTEND_URL` - Frontend URL (e.g. http://localhost:3000)
- `EMAIL_CLIENT_ID` - Gmail OAuth client id
- `EMAIL_CLIENT_SECRET` - Gmail OAuth client secret
- `EMAIL_REFRESH_TOKEN` - Gmail OAuth refresh token
- `EMAIL_USER` - Gmail address

## Scripts

### Client

- `npm run dev` - Start Next.js dev server
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run lint` - Lint

### Server

- `npm run dev` - Start server with nodemon
- `npm run start` - Start server

## API Overview

Base URL: `/api/v1`

### Health

- `GET /health` - Health check

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/send-verification-link`
- `GET /auth/verify-email/:link`
- `POST /auth/send-otp`
- `POST /auth/verify-otp`

### User

- `GET /user/get-user/:id`
- `GET /user/:username`
- `POST /user/sessions`
- `POST /user/logout-all-devices`
- `POST /user/logout-device`

## Authentication & Verification

### OTP Verification Flow

The OTP (One-Time Password) verification system uses the following secure approach:

- **OTP Storage**: OTP values are never stored in plain text. Instead, SHA256 hashes are stored in the database for security.
- **User Scoping**: OTP records are uniquely linked to each user by `userId`, preventing cross-account collision attacks.
- **Expiration**: OTPs automatically expire after 5 minutes.
- **Single Use**: OTP can only be used once; subsequent attempts with the same OTP are rejected.
- **Verification**: Client sends raw OTP → Server hashes it → Compares hash against stored hash for the authenticated user.

### Email Verification

Two verification methods are supported:

1. **Verification Link**: User receives a unique link that expires after 5 minutes.
2. **OTP**: User receives a 6-digit one-time password that expires after 5 minutes.

Both methods require the user to be authenticated and not already verified.

## License

ISC (see [server/package.json](server/package.json))
