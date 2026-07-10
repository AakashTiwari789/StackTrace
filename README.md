# StackTrace

A full-stack competitive coding platform built for practicing data structures and algorithms, submitting solutions against real test cases, and getting instant feedback — all with a modern, responsive interface.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![License](https://img.shields.io/badge/License-ISC-blue)

---

## Overview

StackTrace is an online judge platform where users can browse coding problems, write solutions in an integrated code editor, and receive real-time verdicts. It supports multiple programming languages, features a queue-based submission pipeline with Judge0, and delivers results over WebSockets.

---

## Features

### Core

- **Problem Solving** — Browse problems by difficulty and tags, read markdown statements with math/LaTeX support, and submit solutions
- **Real-time Code Evaluation** — BullMQ job queue → Judge0 batch execution → Socket.IO live verdict delivery
- **Monaco Code Editor** — Full-featured editor with syntax highlighting and multi-language support
- **Multi-language Support** — C++, Python, JavaScript, and Java

### Authentication & Security

- **JWT Auth** — Access + refresh tokens in httpOnly secure cookies with automatic rotation
- **Google OAuth** — One-click sign-in via Passport.js
- **Email Verification** — Dual approach with verification links and 6-digit OTP
- **Session Management** — Per-device session tracking with device/IP info, selective logout, and logout-from-all-devices
- **Token Revocation** — Redis-backed immediate revocation of access and refresh tokens

### User Experience

- **Public Profiles** — View any user's profile by username with solve statistics
- **Profile Customization** — Photo upload via ImageKit, editable profile information
- **Problem Notes** — Private per-user notes on each problem
- **Dark Mode** — System-aware theme toggle
- **Resizable Panels** — Split-pane problem view with adjustable editor/description ratio

### Admin

- **Problem Management** — Full CRUD with markdown editor, test case management, difficulty/tag assignment
- **Publish Control** — Toggle problem visibility and premium status
- **Editorial System** — Attach editorials with optional premium gating and video links

### Planned / Scaffolded

- Contests
- Leaderboard
- Premium subscriptions

---

## Tech Stack

| Layer          | Technology                                                              |
| -------------- | ----------------------------------------------------------------------- |
| Frontend       | Next.js 16 (App Router), React 19, Tailwind CSS 4                       |
| Code Editor    | Monaco Editor                                                           |
| Backend        | Node.js, Express 5                                                      |
| Database       | MongoDB (Mongoose 9)                                                    |
| Cache & Queue  | Redis, BullMQ                                                           |
| Code Execution | Judge0 API                                                              |
| Auth           | JWT, Passport.js (Google OAuth 2.0), bcrypt                             |
| Real-time      | Socket.IO                                                               |
| Email          | Nodemailer (Gmail OAuth2)                                               |
| File Storage   | ImageKit                                                                |
| Markdown       | react-markdown, remark-gfm, remark-math, rehype-katex, rehype-highlight |

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas)
- **Redis** (local or cloud — required for auth, sessions, and job queue)
- **Judge0** instance (self-hosted or cloud API)

### 1. Clone the repository

```bash
git clone https://github.com/AakashTiwari789/stacktrace.git
cd stacktrace
```

### 2. Set up the server

```bash
cd server
npm install
cp .env.sample .env
```

Edit `server/.env` with your credentials

Start the server:

```bash
npm run dev
```

### 3. Set up the client

```bash
cd client
npm install
cp .env.sample .env
```

Start the client:

```bash
npm run dev
```

### 4. Start the submission worker (separate terminal)

```bash
cd server
npm run worker
```

The app will be available at `http://localhost:3000` with the API at `http://localhost:5000`.

---

## API Routes

| Method | Endpoint                   | Description               |
| ------ | -------------------------- | ------------------------- |
| GET    | `/api/v1/health`         | Health check              |
| POST   | `/api/v1/auth/register`  | Register a new user       |
| POST   | `/api/v1/auth/login`     | Login with email/password |
| POST   | `/api/v1/auth/logout`    | Logout current session    |
| GET    | `/api/v1/auth/google`    | Google OAuth initiation   |
| GET    | `/api/v1/user/me`        | Get current user profile  |
| GET    | `/api/v1/user/:username` | Get public profile        |
| GET    | `/api/v1/problem`        | List problems             |
| GET    | `/api/v1/problem/:slug`  | Get problem details       |
| POST   | `/api/v1/submit`         | Submit a solution         |

---

## Scripts

### Client

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Create production build  |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

### Server

| Command            | Description                            |
| ------------------ | -------------------------------------- |
| `npm run dev`    | Start with nodemon (hot reload)        |
| `npm run start`  | Start production server                |
| `npm run worker` | Start the submission processing worker |

---

## Architecture

```
                ┌─────────────────────────────┐
                │         Client              │
                │  Next.js (App Router)       │
                │  Monaco Editor  Socket.io-c │
                └────────────┬────────────▲───┘
                    HTTPS    │            │ WS (verdict)
                             ▼            │
                ┌─────────────────────────────┐
                │       Express API           │
                │  Auth · Problems · Submit   │
                │  Passport (Google OAuth)    │
                └──┬──────┬───────┬───────────┘
                   │      │       │
          ┌────────▼─┐ ┌──▼────┐ ┌▼──────────────┐
          │ MongoDB  │ │ Redis │ │  Socket.io    │
          │ Users    │ │ Token │ │  (httpServer) │
          │ Problems │ │ Revoc.│ │  Room-based   │
          │ Sessions │ │ BullMQ│ │  emit on done │
          │ Submiss. │ │ Queue │ └───────────────┘
          └──────────┘ └──┬────┘
                          │ job
                ┌─────────▼───────────┐
                │   BullMQ Worker     │
                │  (submission.worker)│
                │  runs in-process    │
                │ via server.js import│
                └─────────┬───────────┘
                          │ batch submit
                ┌─────────▼───────────┐
                │      Judge0         │
                │  (public CE or      │
                │   self-hosted)      │
                │  poll until done    │
                └─────────────────────┘
```

**Flow:**
1. User submit code → POST `/api/v1/submit/:problemId/submit`
2. API create `Submission` doc (Pending), enqueue BullMQ job
3. Return `202 + submissionId` → client join Socket room `submission:<id>`
4. Worker fetch test cases + metadata from MongoDB, batch-POST to Judge0
5. Worker poll Judge0 until all statuses > 2
6. Worker update Submission doc in MongoDB
7. `submissionQueueEvents.on('completed')` fire → `io.to(room).emit('submissionResult')`
8. Client receive verdict via WebSocket

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
