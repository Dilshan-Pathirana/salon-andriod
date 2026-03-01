# Deployment Guide — Hair Salon App (Firebase)

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Local Development (Emulators)](#local-development-emulators)
4. [Deploy to Production](#deploy-to-production)
5. [Mobile App](#mobile-app)
6. [Seed Data](#seed-data)
7. [Architecture Overview](#architecture-overview)

---

## Prerequisites

- **Node.js** >= 18, npm >= 9
- **Firebase CLI**: `npm install -g firebase-tools`
- **Expo CLI**: `npm install -g expo-cli` (or use `npx expo`)
- A **Google account** for Firebase Console
- (Optional) **Expo Go** app on your phone for testing

---

## Firebase Project Setup

### 1. Create a Firebase Project

1. Go to <https://console.firebase.google.com>
2. Click **Add project** → name it (e.g. `salon-app`) → continue
3. **Enable Blaze plan** (pay-as-you-go) — required for Cloud Functions.
   The free tier allowance is very generous and a salon app will stay well within it:
   - Firestore: 1 GiB storage, 50K reads/day
   - Cloud Functions: 2M invocations/month
   - Auth: no cost for email/password
4. Enable the following services in the Firebase console:
   - **Authentication** → Sign-in method → **Email/Password** → Enable
   - **Firestore Database** → Create database → Start in **production mode**
   - **Cloud Functions** (available after Blaze plan)

### 2. Get Your Firebase Config

1. In Firebase Console → Project Settings → General → **Your apps** → click the Web icon (`</>`)
2. Register a web app (name: `salon-mobile`)
3. Copy the `firebaseConfig` object

### 3. Set Mobile Environment Variables

Create `mobile/.env` from `mobile/.env.example` and fill values from Firebase Console:

```bash
cp mobile/.env.example mobile/.env
```

Required variables:
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

### 4. Register Android App (optional but recommended)

1. Firebase Console → Project Settings → **Your apps** → Add Android app
2. Package name for this project: `com.salon.app`
3. Download `google-services.json`
4. Place it at `mobile/android/app/google-services.json` after running `npx expo prebuild`

> This project uses Firebase JS SDK, so Auth/Firestore/Functions work without native Gradle setup.
> `google-services.json` is required when adding native Firebase Android services.

### 5. Update `.firebaserc`

Open `.firebaserc` and replace `your-salon-project-id` with your actual Firebase project ID.

---

## Local Development (Emulators)

Firebase provides local emulators for Firestore, Auth, Functions, and Storage.

### 1. Install dependencies

```bash
# Cloud Functions
cd functions
npm install
cd ..

# Mobile app
cd mobile
npm install
cd ..
```

### 2. Start emulators

```bash
firebase emulators:start
```

This starts:
| Service    | Port  |
|------------|-------|
| Auth       | 9099  |
| Functions  | 5001  |
| Firestore  | 8080  |
| Storage    | 9199  |
| Emulator UI| 4000  |

### 3. Connect mobile app to emulators

Set emulator host in `mobile/.env`:

```bash
EXPO_PUBLIC_FIREBASE_EMULATOR_HOST=192.168.8.184
```

Replace `192.168.8.184` with your machine's local IP address.

### 4. Start Expo

```bash
cd mobile
npx expo start
```

Scan the QR code with Expo Go on your phone.

---

## Deploy to Production

### 1. Deploy Firestore rules, indexes, and Cloud Functions

```bash
# From the project root
firebase deploy
```

Or deploy individually:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only functions
```

### 2. Seed the database

After deploying Functions, run the seed script:

```bash
cd functions
npx ts-node src/seed.ts
```

> **Note:** You need `GOOGLE_APPLICATION_CREDENTIALS` set to a service account key file,
> or be logged in via `firebase login` and use the admin SDK with default credentials.

Alternative: Use the Firebase Functions shell:
```bash
firebase functions:shell
> require('./lib/seed').seedDatabase()
```

### 3. Deploy via GitHub Actions (recommended)

Two workflows are included:

- `.github/workflows/android-build.yml` (Expo/EAS Android build)
- `.github/workflows/firebase-deploy.yml` (Firestore rules/indexes + Functions deploy)

Add these repository secrets:

- `EXPO_TOKEN` for EAS build access
- `FIREBASE_TOKEN` from `firebase login:ci`

---

## Mobile App

### Development

```bash
cd mobile
npx expo start
```

### Production Build (EAS)

```bash
npx eas build --platform android --profile production
npx eas build --platform ios --profile production
```

Make sure the `firebaseConfig` in `mobile/src/config/firebase.ts` points to your **production** Firebase project.

For this repo, Firebase config is loaded from `mobile/.env` (`EXPO_PUBLIC_FIREBASE_*`).

### One-time Android credentials bootstrap for CI

GitHub Actions uses non-interactive mode, so Android keystore must exist on Expo first.

Run once locally (interactive):

```bash
cd mobile
npx eas login
npx eas build --platform android --profile production
```

When prompted, allow EAS to generate and store Android keystore credentials.
After this first successful build, CI `--non-interactive` builds work.

---

## Seed Data

The seed script (`functions/src/seed.ts`) creates:

| Data            | Count |
|-----------------|-------|
| Admin user      | 1     |
| Client user     | 1     |
| Services        | 8     |
| Gallery items   | 4     |
| Business info   | 12    |

**Default credentials:**
| Role   | Phone        | Password      |
|--------|-------------|---------------|
| Admin  | 0712345678  | admin12345    |
| Client | 0771234567  | client12345   |

> Phone numbers are mapped to emails internally: `0712345678@salon.app`

---

## Architecture Overview

```
┌──────────────────────────────────────────────┐
│                  Mobile App                   │
│         (React Native / Expo Go)             │
├──────────────────────────────────────────────┤
│  Firebase JS SDK (v10)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │   Auth   │ │ Firestore│ │  Functions   │ │
│  │ (login)  │ │ (reads,  │ │ (writes via  │ │
│  │          │ │ realtime)│ │ httpsCallable)│ │
│  └──────────┘ └──────────┘ └──────────────┘ │
└──────────┬──────────┬──────────┬─────────────┘
           │          │          │
    ┌──────▼──────────▼──────────▼────────┐
    │          Firebase Backend            │
    │  ┌────────────┐ ┌────────────────┐  │
    │  │  Auth       │ │  Firestore DB  │  │
    │  │  (email/pw) │ │  (NoSQL)       │  │
    │  └────────────┘ └────────────────┘  │
    │  ┌──────────────────────────────┐   │
    │  │  Cloud Functions (v1)         │   │
    │  │  14 callable functions        │   │
    │  │  All writes & business logic  │   │
    │  └──────────────────────────────┘   │
    └─────────────────────────────────────┘
```

### Firestore Collections

| Collection       | Doc ID            | Purpose                    |
|-----------------|-------------------|----------------------------|
| `users`         | Firebase Auth UID | User profiles              |
| `services`      | auto-ID           | Salon services             |
| `schedules`     | `YYYY-MM-DD`      | Daily schedule config      |
| `appointments`  | auto-ID           | All appointments           |
| `sessions`      | `YYYY-MM-DD`      | Daily session status       |
| `reviews`       | auto-ID           | Client reviews             |
| `gallery`       | auto-ID           | Gallery items              |
| `businessInfo`  | key name          | Key-value business info    |
| `slotLocks`     | `date_timeSlot`   | Concurrency: slot booking  |
| `userDayLocks`  | `userId_date`     | Concurrency: one per day   |
| `queueCounters` | `YYYY-MM-DD`      | Queue position counter     |

### Cloud Functions

| Function                  | Auth      | Purpose                              |
|--------------------------|-----------|--------------------------------------|
| `registerUser`           | Public    | Create Auth user + Firestore profile |
| `updateProfile`          | User      | Update own profile / password        |
| `adminManageUser`        | Admin     | Create, delete, activate, deactivate |
| `bookAppointment`        | User      | Book with transaction + locks        |
| `cancelAppointment`      | User/Admin| Cancel own or any (admin)            |
| `adminUpdateAppointment` | Admin     | Complete, in-service, no-show, delete|
| `reorderQueue`           | Admin     | Reorder queue positions              |
| `manageSession`          | Admin     | Open / close daily session           |
| `upsertSchedule`         | Admin     | Create/update daily schedule         |
| `adminManageService`     | Admin     | CRUD salon services                  |
| `createReview`           | User      | Review a completed appointment       |
| `adminManageReview`      | Admin     | Delete, toggle visibility            |
| `adminManageGallery`     | Admin     | CRUD gallery items                   |
| `adminManageBusinessInfo`| Admin     | Upsert, bulk upsert, delete          |

---

## Troubleshooting

### "Missing or insufficient permissions" on Firestore
- Ensure `firestore.rules` is deployed: `firebase deploy --only firestore:rules`
- Check the user is authenticated before making queries

### Cloud Functions returning "unauthenticated"
- The Firebase JS SDK automatically sends the ID token with callable functions
- Ensure the user is logged in (`auth.currentUser !== null`)

### Indexes error
- Firebase will show a URL in the error message to create the missing index
- Or deploy all indexes: `firebase deploy --only firestore:indexes`

### Emulator: functions not found
- Make sure functions are compiled: `cd functions && npm run build`
- Restart emulators after changes

### Mobile: Firebase not initializing
- Verify `firebaseConfig` values in `mobile/src/config/firebase.ts`
- Check that `@react-native-async-storage/async-storage` is installed
