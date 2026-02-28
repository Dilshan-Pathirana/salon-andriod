# Hair Salon Appointment & Live Queue Management System

A full-stack mobile application for managing hair salon appointments and live queues, featuring real-time updates via Socket.IO.

## Architecture

```
salon-andriod/
├── backend/          # Node.js + Express + TypeScript API
│   ├── prisma/       # Database schema & migrations
│   ├── src/
│   │   ├── config/   # Environment & database config
│   │   ├── middleware/ # Auth, role, validation, error handling
│   │   ├── modules/  # Feature modules (auth, users, schedule, appointments, queue, session)
│   │   ├── socket/   # Socket.IO real-time server
│   │   ├── types/    # TypeScript type definitions
│   │   ├── utils/    # Error classes, response helpers, time utils
│   │   ├── app.ts    # Express app configuration
│   │   └── server.ts # HTTP server + Socket.IO init
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── railway.json
├── mobile/           # Expo (React Native) + TypeScript
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── constants/   # Colors, fonts, spacing, API URLs
│   │   ├── hooks/       # useSocket hook
│   │   ├── navigation/  # React Navigation (tabs + stack)
│   │   ├── screens/     # All app screens
│   │   ├── services/    # API service layer (Axios)
│   │   ├── store/       # Zustand state management
│   │   ├── types/       # TypeScript interfaces
│   │   └── utils/       # Storage, helpers
│   └── App.tsx
├── DEPLOYMENT.md     # Full deployment guide
├── plan.txt          # Implementation plan
└── srs.txt           # Software Requirements Specification
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh with rotation) |
| Real-time | Socket.IO |
| Validation | Zod |
| Mobile | Expo (React Native), TypeScript |
| Navigation | React Navigation v6 |
| State | Zustand |
| HTTP | Axios (auto token refresh) |
| Deployment | Docker, Railway |

## Features

### Client
- **Book Appointment** — Calendar date picker, time slot grid, instant confirmation
- **My Appointments** — View history, cancel upcoming bookings
- **Live Queue** — Real-time queue position with estimated wait times
- **Profile** — Edit name, change password

### Admin
- **Dashboard** — Today's stats, session open/close
- **Queue Management** — Drag-and-drop reorder, call/complete/no-show actions
- **Calendar Management** — Set open/closed/holiday, working hours, slot duration
- **Appointment Management** — Filter by date/status, quick actions, delete
- **User Management** — Create/delete users, role assignment

### System
- Transaction-safe booking (Prisma Serializable isolation)
- JWT with secure refresh token rotation & reuse detection
- Socket.IO real-time queue updates
- Rate limiting (general + auth-specific)
- Role-based access control (ADMIN / CLIENT)

## Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env    # Configure DATABASE_URL, JWT secrets
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx expo start
```

### Default Credentials (after seeding)
- **Admin:** `0712345678` / `admin12345`
- **Client:** `0771234567` / `client12345`

## API Documentation

Import `backend/postman-collection.json` into Postman for a complete API reference with auto-token management.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full Railway deployment instructions, EAS build guide, and environment variable reference.
