# Hair Salon Appointment & Live Queue Management System

A mobile application for managing hair salon appointments and live queues, built with **Firebase** (Auth, Firestore, Cloud Functions) and **Expo** (React Native).

## Architecture

```
salon-andriod/
├── functions/          # Firebase Cloud Functions (TypeScript)
│   ├── src/
│   │   ├── index.ts    # 14 callable Cloud Functions
│   │   └── seed.ts     # Firestore data seeder
│   ├── package.json
│   └── tsconfig.json
├── mobile/             # Expo (React Native) + TypeScript
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── config/      # Firebase SDK initialization
│   │   ├── constants/   # Colors, fonts, spacing
│   │   ├── hooks/       # Firestore real-time listeners
│   │   ├── navigation/  # React Navigation (tabs + stack)
│   │   ├── screens/     # All app screens
│   │   ├── services/    # Firestore reads + Cloud Function calls
│   │   ├── store/       # Zustand state management
│   │   ├── types/       # TypeScript interfaces
│   │   └── utils/       # Storage, helpers
│   └── App.tsx
├── firestore.rules       # Security rules
├── firestore.indexes.json # Composite indexes
├── firebase.json         # Firebase project config
├── .firebaserc           # Project alias
├── DEPLOYMENT.md         # Full deployment guide
└── srs.txt               # Software Requirements Specification
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Auth | Firebase Authentication (email/password) |
| Database | Cloud Firestore (NoSQL) |
| Backend | Firebase Cloud Functions (Node 18, TypeScript) |
| Real-time | Firestore `onSnapshot` listeners |
| Mobile | Expo SDK 52, React Native, TypeScript |
| Navigation | React Navigation v6 |
| State | Zustand |
| Persistence | AsyncStorage (auth), SecureStore (user data) |

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
- Transaction-safe booking (Firestore lock documents + transactions)
- Firebase Auth with AsyncStorage persistence
- Firestore real-time listeners for live queue updates
- Role-based access control (ADMIN / CLIENT)
- All writes enforced through Cloud Functions (Admin SDK)

## Firestore Collections

| Collection | Doc ID | Purpose |
|-----------|--------|---------|
| `users` | Firebase UID | User profiles & roles |
| `appointments` | auto-generated | Bookings with queue position |
| `schedules` | `YYYY-MM-DD` | Daily schedule (hours, slot duration) |
| `sessions` | `YYYY-MM-DD` | Salon open/close state |
| `services` | auto-generated | Service catalog |
| `gallery` | auto-generated | Gallery images |
| `reviews` | auto-generated | Client reviews |
| `businessInfo` | key name | Business configuration |
| `slotLocks` | `{date}_{timeSlot}` | Prevent double-booking |
| `userDayLocks` | `{userId}_{date}` | One booking per user per day |
| `queueCounters` | `YYYY-MM-DD` | Auto-incrementing queue position |

## Cloud Functions

| Function | Auth | Description |
|----------|------|-------------|
| `registerUser` | Public | Create account (phone → email mapping) |
| `updateProfile` | User | Edit name, password, profile image |
| `adminManageUser` | Admin | Activate/deactivate/delete users |
| `bookAppointment` | User | Book with slot & day locking |
| `cancelAppointment` | User/Admin | Cancel with lock cleanup |
| `adminUpdateAppointment` | Admin | Complete/in-service/no-show/update/delete |
| `reorderQueue` | Admin | Reorder queue positions |
| `manageSession` | Admin | Open/close daily session |
| `upsertSchedule` | Admin | Create/update daily schedule |
| `adminManageService` | Admin | CRUD for services |
| `createReview` | User | Submit a review |
| `adminManageReview` | Admin | Toggle visibility, delete |
| `adminManageGallery` | Admin | CRUD for gallery items |
| `adminManageBusinessInfo` | Admin | Update business configuration |

## Quick Start

### Prerequisites
- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- Expo CLI: `npm install -g expo-cli`
- Firebase project (free Spark plan works)

### Firebase Setup
```bash
# Login and select project
firebase login
firebase use salon-app-54d7b

# (Optional) add Android app in Firebase Console
# Package name in this repo: com.salon.app
# Download google-services.json only if you prebuild native Android
# and place it at: mobile/android/app/google-services.json

# Deploy Firestore rules & indexes
firebase deploy --only firestore:rules,firestore:indexes

# Deploy Cloud Functions
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions

# Seed initial data (run once)
cd functions
npx ts-node src/seed.ts
cd ..
```

### Mobile
```bash
cd mobile
npm install
cp .env.example .env
# Fill .env with EXPO_PUBLIC_FIREBASE_* values from Firebase Console
npx expo start
```

### Local Development (Emulators)
```bash
# Start all Firebase emulators
firebase emulators:start

# In mobile/.env set EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=<your-local-ip>
# Then start Expo
cd mobile
npx expo start
```

### Default Credentials (after seeding)
- **Admin:** `0712345678` / `admin12345`
- **Client:** `0771234567` / `client12345`

## Firebase Free Tier Limits (Spark Plan)

| Resource | Free Limit |
|----------|-----------|
| Firestore reads | 50,000/day |
| Firestore writes | 20,000/day |
| Firestore storage | 1 GiB |
| Cloud Functions invocations | 125,000/month |
| Cloud Functions compute | 40,000 GB-seconds/month |
| Authentication | 10,000 verifications/month |
| Hosting | 10 GB storage, 360 MB/day transfer |

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full Firebase deployment instructions, emulator setup, and troubleshooting.

## CI/CD (GitHub Actions)

- Android build workflow: `.github/workflows/android-build.yml` (TypeScript check on PRs/pushes, EAS Android build on `main`)
- Firebase deploy workflow: `.github/workflows/firebase-deploy.yml` (deploys Firestore rules/indexes + Cloud Functions on `main`)

Required GitHub secrets:

- `EXPO_TOKEN` (for EAS builds)
- `FIREBASE_TOKEN` (from `firebase login:ci`)

To generate Firebase token locally:

```bash
firebase login:ci
```
