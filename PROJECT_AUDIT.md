# Project Audit Report — salon-andriod

**Audit Date:** 2025-01-XX  
**Scope:** Full-stack salon booking application (Backend + Web + Mobile)

---

## 1. Project Architecture Map

### Tech Stack

| Layer    | Technology                                                    |
| -------- | ------------------------------------------------------------- |
| Backend  | Node.js, Express 4.18, MongoDB (Mongoose 8.12), JWT, bcryptjs |
| Web      | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Axios |
| Mobile   | React Native (Expo 54), React 19, Axios, AsyncStorage         |

### Directory Structure

```
salon-andriod/
├── backend/           # Express REST API (monolithic app.ts)
│   ├── src/
│   │   ├── app.ts            # ALL routes & middleware (~1400 lines)
│   │   ├── server.ts         # Entry point (connects DB, starts server)
│   │   ├── config/           # env, db connection
│   │   ├── models/           # Mongoose schemas (User, Booking, Service, etc.)
│   │   ├── modules/          # ⚠ DEAD CODE — old Prisma-based modular routes
│   │   ├── middleware/       # ⚠ DEAD CODE — old middleware files
│   │   ├── seed/             # Database seeder
│   │   ├── socket/           # Socket.IO server
│   │   ├── types/            # Shared TypeScript types
│   │   └── utils/            # Helpers (errors, response, time)
│   └── api/index.ts          # Vercel serverless entry
├── web/               # React SPA (admin + public)
│   └── src/
│       ├── pages/            # Route pages (Landing, Admin, Profile, etc.)
│       ├── components/       # Reusable UI components
│       └── lib/              # API client, types, utils
├── mobile/            # Expo React Native app
│   └── app/
│       ├── (tabs)/           # Client screens (appointments, profile, etc.)
│       ├── (admin)/          # Admin screens (dashboard, queue, users, etc.)
│       └── (auth)/           # Login, Register
└── api/               # Vercel proxy route
```

### Authentication Flow
- JWT access tokens (15 min) + refresh tokens (30 days)
- Refresh token rotation with reuse detection (family invalidation)
- Tokens stored in localStorage (web) / AsyncStorage (mobile)

### Timezone
- IST (UTC+5:30) — Sri Lanka locale used throughout

---

## 2. Issues Found & Status

### CRITICAL — Fixed ✅

| # | Issue | Impact | Fix Applied |
|---|-------|--------|-------------|
| 1 | **`todayString()` used server local time instead of IST** — appointment date filtering broke on servers in non-IST timezones | Wrong appointments shown to users; queue logic breaks | Changed to explicit IST offset calculation in `app.ts` |
| 2 | **Password change required no current-password verification** — anyone with a valid token could change any user's password | Account takeover if token leaked | Backend now requires `currentPassword` field and verifies with `bcrypt.compare`. Web and mobile UIs updated with current-password input |
| 3 | **Profile update had no name validation** — empty or extremely long names accepted | Data integrity, potential UI breakage, abuse | Added 1–50 character trim validation for firstName/lastName |
| 4 | **Admin user role update accepted arbitrary values** — no enum validation on role field | Could set invalid roles, bypass role checks | Added explicit `['ADMIN', 'CLIENT'].includes(role)` check |
| 5 | **Missing ObjectId validation on `:id` param routes** — invalid IDs caused Mongoose CastErrors (500) | Information disclosure, ugly error responses | Added `isValidObjectId()` guard to all parameterized routes (services, gallery, appointments) |
| 6 | **Reserved appointment creation used public booking endpoint** — web admin "reserve slot" called `submitBookingRequest` with fake phone `0000000000` | Bypassed admin auth, created orphan bookings, polluted data | Created proper `POST /api/appointments/reserve` admin-only endpoint; web now calls it directly |
| 7 | **Service/gallery updates passed `undefined` fields to MongoDB** — entire update body was spread into `$set` | Could unintentionally unset fields in MongoDB | Refactored to only include defined fields in update object |
| 8 | **`in-service` status change didn't resequence queue** — setting a booking to in-service left gap in queue positions | Queue ordering displayed incorrectly | Added `resequenceQueue()` call after status change |
| 9 | **Dead code caused import/type errors** — `backend/src/config/database.ts` imported PrismaClient, `types/index.ts` imported `@prisma/client` | Build failures if dead modules referenced, developer confusion | Cleaned up Prisma imports; replaced with Mongoose-compatible exports |

### HIGH — Fixed ✅

| # | Issue | Impact | Fix Applied |
|---|-------|--------|-------------|
| 10 | **Appointments not sorted by time** — API returned `{ date: -1, time: -1 }` (newest first) | Closest appointment buried at bottom of list | Backend queries changed to `{ date: 1, time: 1 }`. Mobile added `parseTimeToMinutes()` client-side sorting for today/upcoming/past sections |

### MEDIUM — Documented (Not Fixed)

| # | Issue | Impact | Recommendation |
|---|-------|--------|----------------|
| 11 | **Hardcoded admin password `admin12345`** in seed.ts, .env files, test scripts, and Postman collection | Credential exposure if production uses defaults | Use strong password via env variable `ADMIN_PASSWORD`; remove from committed .env files; add .env to .gitignore |
| 12 | **Web stores JWT in `localStorage`** — vulnerable to XSS | Token theft via XSS attack | Migrate to `httpOnly` cookies with `SameSite=Strict`, or use in-memory token storage with silent refresh |
| 13 | **No automatic token refresh (interceptor)** — both web and mobile require manual re-login when access token expires | Poor UX; users see 401 errors after 15 minutes | Add Axios response interceptor that catches 401, calls `/auth/refresh`, retries original request |
| 14 | **No CSRF protection** — no CSRF tokens on state-changing requests | CSRF attacks possible (less critical since API uses Authorization header, not cookies) | If migrating to cookie-based auth, add CSRF tokens. Current bearer-token auth provides partial protection |
| 15 | **Phone regex inconsistency** — booking validation allows 7–15 digits, registration requires 10–15 digits | Bookings can be made with invalid short phone numbers | Standardize phone validation regex across all endpoints |
| 16 | **Booking queue position race condition** — `countDocuments` + 1 for position is not atomic | Two concurrent bookings could get same queue position | Use MongoDB `$inc` on a counter document or `findOneAndUpdate` with `$max` |
| 17 | **Gallery fallback returns inconsistent response** — index route returns `{ gallery: [] }` but other endpoints return `{ items: [...] }` | Frontend may break on empty gallery | Standardize response shape across all gallery endpoints |

### LOW — Documented (Not Fixed)

| # | Issue | Impact | Recommendation |
|---|-------|--------|----------------|
| 18 | **Admin conclude-queue auto-completes all today's bookings** — no individual result tracking | Bookings completed without verifying service was actually performed | Add individual completion confirmation or result field |
| 19 | **No request body size differentiation** — 1 MB limit applied globally | Image base64 uploads may fail; text endpoints accept unnecessarily large payloads | Set route-specific body limits (smaller for auth, larger for gallery uploads) |
| 20 | **Monolithic `app.ts`** (~1400+ lines) — all routes, middleware, and logic in one file | Hard to maintain, review, and test | Refactor into route modules using Express Router |
| 21 | **Dead code in `backend/src/modules/`** — entire Prisma-based modular architecture unused | Developer confusion, false sense of modularity | Remove or migrate to Mongoose-based modules |
| 22 | **No input sanitization for HTML/XSS in text fields** — names, descriptions, reviews stored as-is | Stored XSS if rendered without escaping (React auto-escapes, but API consumers may not) | Sanitize text inputs on the backend using a library like `sanitize-html` |
| 23 | **No pagination on list endpoints** — services, gallery, bookings return all records | Performance degrades as data grows | Add `?page=&limit=` query parameters with defaults |

---

## 3. Files Modified

| File | Changes |
|------|---------|
| `backend/src/app.ts` | Fixed `todayString()` IST calculation; changed 3 appointment sort orders to ascending; added ObjectId validation on all `:id` routes; added name validation on profile update; added `currentPassword` verification for password changes; fixed admin role enum validation; refactored service/gallery update to only set defined fields; added `POST /api/appointments/reserve` endpoint; added `resequenceQueue()` to in-service endpoint |
| `backend/src/config/database.ts` | Removed PrismaClient import; replaced with placeholder comment |
| `backend/src/config/index.ts` | Changed exports from Prisma to Mongoose (env, connectDatabase, disconnectDatabase) |
| `backend/src/types/index.ts` | Removed `@prisma/client` import; defined local `Role` type |
| `web/src/lib/api.ts` | Changed `adminCreateReservedAppointment` from `submitBookingRequest` hack to proper `/appointments/reserve` call |
| `web/src/pages/ProfilePage.tsx` | Added `currentPassword` field to form state, validation, API call, and UI |
| `mobile/app/(tabs)/appointments.tsx` | Added `parseTimeToMinutes()` helper; sorted today/upcoming/past sections by time |
| `mobile/app/(admin)/appointments.tsx` | Added `parseTimeToMinutes()` helper; sorted appointments by time slot |
| `mobile/app/(tabs)/profile.tsx` | Added `currentPassword` field to form state, validation, API call, and UI |

---

## 4. Security Summary

### Protections Already In Place
- **Helmet.js** — HTTP security headers
- **express-rate-limit** — brute-force protection (100 req/15min general, 20 req/15min auth)
- **express-mongo-sanitize** — NoSQL injection prevention
- **bcryptjs** — password hashing (10 rounds)
- **JWT with rotation** — refresh token reuse detection
- **CORS** — configurable origin whitelist
- **Input validation** — Mongoose schema validation + manual checks

### Remaining Risks (prioritized)
1. **localStorage token storage** — migrate to httpOnly cookies
2. **Hardcoded default credentials** — rotate immediately in production
3. **No auto-refresh interceptor** — users get logged out after 15 minutes
4. **No pagination** — large datasets will degrade performance
5. **Monolithic architecture** — makes code review and testing difficult

---

## 5. Recommendations

1. **Immediate:** Change default admin password in production; add `ADMIN_PASSWORD` to environment config
2. **Short-term:** Add Axios interceptor for automatic token refresh; add pagination to list endpoints
3. **Medium-term:** Refactor `app.ts` into Express Router modules; migrate tokens to httpOnly cookies
4. **Long-term:** Remove all dead code in `modules/`, `middleware/`; add comprehensive test suite; add CI/CD pipeline with security scanning
