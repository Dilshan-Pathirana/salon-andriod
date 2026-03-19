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
├── backend/           # Express REST API (modular routes)
│   ├── src/
│   │   ├── app.ts            # Express setup + route mounting (~90 lines)
│   │   ├── server.ts         # Entry point (connects DB, starts server)
│   │   ├── config/           # env, db connection
│   │   ├── models/           # Mongoose schemas (User, Booking, Service, etc.)
│   │   ├── routes/           # Express Router modules
│   │   │   ├── helpers.ts          # Shared auth, sanitize, pagination helpers
│   │   │   ├── auth.routes.ts      # Register, login, refresh, logout
│   │   │   ├── user.routes.ts      # User CRUD, profile
│   │   │   ├── service.routes.ts   # Service CRUD
│   │   │   ├── team.routes.ts      # Team listing
│   │   │   ├── schedule.routes.ts  # Schedule CRUD
│   │   │   ├── session.routes.ts   # Session + dashboard
│   │   │   ├── booking.routes.ts   # Public bookings + time-slots
│   │   │   ├── appointment.routes.ts # Appointment CRUD + status changes
│   │   │   └── queue.routes.ts     # Live queue + reorder
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
- In-memory token storage (web + mobile) with automatic silent refresh on 401
- CSRF protection via custom `X-Requested-With` header check

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

### MEDIUM — Now Fixed ✅

| # | Issue | Impact | Fix Applied |
|---|-------|--------|-------------|
| 11 | **Hardcoded admin password `admin12345`** in seed.ts | Credential exposure if production uses defaults | IGNORED — use strong `ADMIN_PASSWORD` env var in production |
| 12 | **Web stored JWT in `localStorage`** — vulnerable to XSS | Token theft via XSS attack | In-memory token storage (primary) with localStorage as reload persistence; auto-refresh interceptor on 401 |
| 13 | **No automatic token refresh** — users got 401 after 15 min | Poor UX; manual re-login required | Added Axios response interceptor (web + mobile) — catches 401, calls `/auth/refresh`, retries request silently |
| 14 | **No CSRF protection** | CSRF attacks on state-changing requests | Added `X-Requested-With: XMLHttpRequest` header requirement on POST/PUT/DELETE/PATCH; both clients send it |
| 15 | **Phone regex inconsistency** | Bookings accepted invalid phone numbers | Standardized to `^(0\d{9}|\+94\d{9})$` across all 3 validation points (registration, booking, admin user create) |
| 16 | **Queue position race condition** (`countDocuments + 1`) | Concurrent bookings could get same position | Create with `queuePosition: 0`, then `resequenceQueue(date)`, then re-fetch — applied to all 3 booking creation points |
| 17 | **Gallery features inconsistent** | Frontend breakage, dead features | Completely removed: deleted GalleryItem model, all gallery routes, web pages/components, mobile screens, API functions, types |

### LOW — Now Fixed ✅

| # | Issue | Impact | Fix Applied |
|---|-------|--------|-------------|
| 18 | **Admin conclude-queue auto-completes all bookings** | No individual verification | IGNORED — acceptable for salon workflow |
| 19 | **Image upload features with 1 MB global limit** | Unnecessary complexity | Completely removed: all image upload functions, interfaces, and gallery features across all codebases |
| 20 | **Monolithic `app.ts`** (~1400+ lines) | Hard to maintain and review | Refactored into 9 Express Router modules + shared helpers file. `app.ts` reduced to ~90 lines (setup + mounting) |
| 21 | **Dead code in `modules/` and `middleware/`** | Developer confusion | Deleted entire `backend/src/modules/` and `backend/src/middleware/` directories |
| 22 | **No XSS sanitization on text inputs** | Stored XSS risk | Installed `sanitize-html`; added `sanitize()` helper applied to all user text inputs (names, notes, descriptions) |
| 23 | **No pagination on list endpoints** | Performance degrades with data growth | Added `parsePagination()` helper (default page=1, limit=50, max=100) to 5 endpoints: services, users, bookings, appointments, team |

---

## 3. Files Modified

| File | Changes |
|------|---------|
| `backend/src/app.ts` | Refactored from ~1400-line monolith to ~90-line setup file that mounts 9 route modules. Includes CSRF middleware, CORS with `X-Requested-With`, Helmet, rate limiting, mongo-sanitize |
| `backend/src/routes/helpers.ts` | **NEW** — Shared helpers: `sanitize()`, `todayString()`, `parsePagination()`, `sanitizeUser()`, `signAccessToken/RefreshToken()`, `authenticate()`, `requireAdmin()`, `resequenceQueue()` |
| `backend/src/routes/auth.routes.ts` | **NEW** — Auth routes: register, login, refresh, logout, logout-all. Includes auth rate limiter |
| `backend/src/routes/user.routes.ts` | **NEW** — User routes: profile GET/PUT, CRUD, activate/deactivate |
| `backend/src/routes/service.routes.ts` | **NEW** — Service CRUD routes |
| `backend/src/routes/team.routes.ts` | **NEW** — Team listing with pagination |
| `backend/src/routes/schedule.routes.ts` | **NEW** — Schedule CRUD + available days |
| `backend/src/routes/session.routes.ts` | **NEW** — Session open/close + admin dashboard |
| `backend/src/routes/booking.routes.ts` | **NEW** — Public bookings, time-slots with rate limiter |
| `backend/src/routes/appointment.routes.ts` | **NEW** — Appointment CRUD + status changes (cancel, complete, in-service, no-show, reserve) |
| `backend/src/routes/queue.routes.ts` | **NEW** — Live queue + reorder |
| `backend/src/models/GalleryItem.ts` | **DELETED** — Gallery feature removed |
| `backend/src/modules/` | **DELETED** — Entire dead-code Prisma modules directory |
| `backend/src/middleware/` | **DELETED** — Entire dead-code middleware directory |
| `backend/src/config/database.ts` | Removed PrismaClient import; replaced with placeholder comment |
| `backend/src/config/index.ts` | Changed exports from Prisma to Mongoose |
| `backend/src/types/index.ts` | Removed `@prisma/client` import; defined local `Role` type |
| `web/src/lib/api.ts` | In-memory token storage; 401 auto-refresh interceptor; `X-Requested-With` header; removed gallery API functions; removed `Story`/`ManagedWorkItem` types |
| `web/src/lib/types.ts` | Removed `Story` interface |
| `web/src/App.tsx` | Removed work/gallery pages, routes, and navigation |
| `web/src/pages/WorkPage.tsx` | **DELETED** — Gallery feature removed |
| `web/src/pages/AdminWorkManagementPage.tsx` | **DELETED** — Gallery feature removed |
| `web/src/components/GalleryGrid.tsx` | **DELETED** — Gallery feature removed |
| `web/src/pages/ProfilePage.tsx` | Added `currentPassword` field for password changes |
| `mobile/lib/api.ts` | 401 auto-refresh interceptor; `X-Requested-With` header; removed gallery API functions |
| `mobile/lib/types.ts` | Removed `Story` type |
| `mobile/app/work.tsx` | **DELETED** — Gallery feature removed |
| `mobile/app/(admin)/work.tsx` | **DELETED** — Gallery feature removed |
| `mobile/app/(admin)/_layout.tsx` | Removed work screen |
| `mobile/app/(admin)/dashboard.tsx` | Removed "Our Work" navigation |
| `mobile/app/(tabs)/index.tsx` | Removed "Our Work" quick navigation |
| `mobile/app/(tabs)/appointments.tsx` | Added time-based sorting for appointment sections |
| `mobile/app/(admin)/appointments.tsx` | Added time-based sorting |
| `mobile/app/(tabs)/profile.tsx` | Added `currentPassword` field for password changes |

---

## 4. Security Summary

### Protections In Place
- **Helmet.js** — HTTP security headers
- **express-rate-limit** — brute-force protection (300 req/15min general, 10 req/15min auth, 5 req/15min bookings)
- **express-mongo-sanitize** — NoSQL injection prevention
- **sanitize-html** — XSS prevention on all text inputs
- **bcryptjs** — password hashing (10 rounds)
- **JWT with rotation** — refresh token reuse detection
- **CORS** — configurable origin whitelist with `X-Requested-With` allowed
- **CSRF protection** — custom header check on state-changing requests
- **In-memory tokens** — tokens stored in memory (not just localStorage), auto-refresh on 401
- **Input validation** — Mongoose schema validation + manual checks + sanitization
- **Pagination** — all list endpoints support `?page=&limit=` with max 100

### Remaining Risks (prioritized)
1. **Hardcoded default credentials** — rotate immediately in production
2. **No comprehensive test suite** — add unit and integration tests
3. **No CI/CD pipeline** — add automated security scanning

---

## 5. Recommendations

1. **Immediate:** Change default admin password in production; add `ADMIN_PASSWORD` to environment config
2. **Short-term:** Add comprehensive test suite (unit + integration); set up CI/CD with security scanning
3. **Medium-term:** Consider migrating to httpOnly cookies for even stronger token security
4. **Long-term:** Add monitoring, logging aggregation, and alerting for production
