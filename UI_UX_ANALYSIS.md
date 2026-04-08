# SALON ANDROID - COMPREHENSIVE UI/UX ANALYSIS

**Application:** Salon Ru Zero One - Premium Salon Booking & Management System  
**Project Type:** Full-stack React TypeScript PWA with Node.js/Express Backend  
**Analysis Date:** April 9, 2026  
**Status:** Production-Ready SPA with PWA capabilities

---

## TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Application Architecture](#application-architecture)
3. [Technology Stack](#technology-stack)
4. [Design System](#design-system)
5. [Navigation & Layout Structure](#navigation--layout-structure)
6. [User Personas & Journeys](#user-personas--journeys)
7. [Component Library](#component-library)
8. [Page Layouts & Flows](#page-layouts--flows)
9. [Admin Interface](#admin-interface)
10. [Forms & Data Input](#forms--data-input)
11. [Data Display Patterns](#data-display-patterns)
12. [Authentication & Security](#authentication--security)
13. [Animations & Interactions](#animations--interactions)
14. [Responsive Design](#responsive-design)
15. [PWA & Mobile Features](#pwa--mobile-features)
16. [Accessibility & UX Patterns](#accessibility--ux-patterns)
17. [API Integration](#api-integration)
18. [State Management](#state-management)
19. [Current Visual Language](#current-visual-language)
20. [Mobile Optimization Details](#mobile-optimization-details)

---

## EXECUTIVE SUMMARY

**Salon Ru Zero One** is a modern, mobile-first Progressive Web Application designed for salon customers and staff to manage appointments, view live queues, and handle administrative tasks. The application features a dual-role interface (CLIENT and ADMIN), real-time queue management, appointment booking with calendar selection, and comprehensive admin dashboard with analytics.

### Key Characteristics:
- **Mobile-First Design:** Optimized for portrait orientation, touch interfaces, bottom navigation
- **Role-Based UI:** Different navigation and features for visitors, clients, and admins
- **Real-Time Features:** Live queue display with position tracking and wait time estimation
- **Modern Aesthetic:** Minimalist design with warm accent colors (emerald, orange, teal)
- **Animation-Heavy:** Extensive use of Framer Motion for transitions, interactions, and visual feedback
- **PWA Capabilities:** Offline support, installable, push-ready infrastructure
- **Performance-Focused:** Optimized Tailwind CSS, lazy loading, efficient state management

---

## APPLICATION ARCHITECTURE

### Project Structure
```
salon-andriod/
├── web/                          # React TypeScript SPA
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Page-level components
│   │   ├── lib/                  # API client, types
│   │   ├── App.tsx               # Main router & layout
│   │   ├── index.tsx             # Entry point with PWA registration
│   │   └── index.css             # Global styles with Tailwind
│   ├── public/                   # Static assets (PWA icons, favicon)
│   ├── index.html                # HTML template with PWA meta tags
│   ├── vite.config.ts            # Vite + PWA plugin config
│   └── package.json              # Dependencies
│
└── backend/                      # Node.js/Express API
    ├── src/
    │   ├── app.ts                # Express app setup
    │   ├── server.ts             # Server bootup
    │   ├── routes/               # API endpoints
    │   ├── config/               # Database, env config
    │   ├── socket/               # WebSocket (future)
    │   └── types/                # TypeScript interfaces
    │
    ├── prisma/
    │   ├── schema.prisma         # Data models (User, Booking, Service, etc.)
    │   └── migrations/           # Database versioning
    │
    └── package.json              # Backend dependencies
```

### Request Flow
```
User Browser
    ↓
React SPA (Vite bundled)
    ↓
Axios HTTP Client (with interceptors)
    ↓
Express API (/api/*)
    ↓
PostgreSQL (Prisma ORM)
```

---

## TECHNOLOGY STACK

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | ^18.3.1 | UI library |
| **TypeScript** | ^5.6.3 | Type safety |
| **Vite** | ^7.3.1 | Build tool & dev server |
| **Tailwind CSS** | ^3.4.16 | Utility-first styling |
| **Framer Motion** | ^11.11.17 | Animation library |
| **Lucide React** | ^0.460.0 | Icon library (25+ icons) |
| **React Router DOM** | ^7.9.2 | Client-side routing |
| **Axios** | ^1.8.4 | HTTP client |
| **Vite PWA Plugin** | ^1.2.0 | Service Worker, manifest |

### Backend
| Technology | Purpose |
|------------|---------|
| **Express.js** | HTTP server & routing |
| **TypeScript** | Type-safe backend code |
| **Prisma** | ORM for PostgreSQL |
| **PostgreSQL** | Relational database |
| **Helmet** | HTTP header security |
| **CORS** | Cross-origin resource sharing |
| **Rate Limiting** | DDoS protection |
| **Morgan** | Request logging |

---

## DESIGN SYSTEM

### Color Palette

#### Primary Colors
```
--brand-amber:   #f59e0b (Warm amber/gold)
--brand-orange:  #f97316 (Vibrant orange)
--brand-ink:     #0f172a (Deep navy/slate)
```

#### Semantic Colors
| Role | Color | Usage |
|------|-------|-------|
| **Success** | Emerald-600 (#059669) | Success messages, completed items, CTAs |
| **Primary Action** | Emerald-600 / Teal-600 | Buttons, active states |
| **Secondary** | Orange-500/600 (#f97316) | Accents, highlights, hover states |
| **Neutral** | Slate-400/500/700/900 | Text, borders, backgrounds |
| **Danger** | Red-300/400/500 | Destructive actions, errors |
| **Info** | Blue-600 | Admin interface, badges |
| **Background** | White/Slate-50 | Card backgrounds, surfaces |
| **Border** | Slate-200/Teal-100 | Dividers, card borders |

#### Gradient Backgrounds
```css
/* Hero section background */
radial-gradient(circle at 18% 10%, rgba(251, 191, 36, 0.18), transparent 45%),
radial-gradient(circle at 80% 90%, rgba(249, 115, 22, 0.18), transparent 40%),
linear-gradient(160deg, #fffaf6 0%, #fffdf9 100%);

/* Premium surfaces */
background: radial-gradient(circle at 18% 10%, rgba(251, 191, 36, 0.18), transparent 45%)
```

### Typography

#### Font Families
```
--sans: 'Inter' (System fallback)
--serif: 'Playfair Display' (Headings - unused currently)
```

#### Type Scale
| Element | Class | Weight | Size | Line Height |
|---------|-------|--------|------|-------------|
| **Hero H1** | text-[2.75rem] | extrabold | 44px | 1.1 |
| **Page H1** | text-3xl | semibold | 30px | 1.2 |
| **Section H2** | text-2xl/text-xl | semibold | 24px/20px | 1.2 |
| **Card Title** | text-base/text-sm | medium/semibold | 16px/14px | 1.4 |
| **Body Text** | text-base/text-sm | regular/light | 16px/14px | 1.5 |
| **Caption** | text-xs | light/medium | 12px | 1.4 |
| **Label** | text-[10px] | semibold | 10px | 1.2 |

#### Font Usage
- **Inter (sans):** All body text, UI labels, buttons, form inputs
- **Playfair Display:** Not actively used; available for premium headings/hero expansion

### Spacing System
```
Tailwind default scale:
- 2px (0.5)
- 4px (1)
- 8px (2)
- 12px (3)
- 16px (4)
- 20px (5)
- 24px (6)
- 32px (8)
- 40px (10)
```

#### Common Spacing Patterns
| Spacing | Use Cases |
|---------|-----------|
| **px-4** | Page horizontal padding |
| **py-6** | Page vertical padding |
| **gap-3** | Item spacing (flex/grid) |
| **mt-8** | Section margins |
| **mb-6** | Bottom spacing before new section |
| **space-y-3** | Vertical list spacing |

### Glass-morphism & Background Effects

#### `.glass-card` Utility
```css
border: 1px solid #e2e8f0
background: rgba(255, 255, 255, 0.9)
backdrop-filter: blur(80px) / blur-xl
border-radius: 12px / rounded-xl
box-shadow: 0 1px 2px rgba(0,0,0,0.05)
```

**Usage:** Modal overlays, sticky headers, premium surfaces

### Border Radius
| Size | Classes | Use |
|------|---------|-----|
| **Small** | rounded-lg | Buttons, inputs, small chips |
| **Medium** | rounded-xl | Cards, modals, medium components |
| **Large** | rounded-2xl | Hero sections, premium surfaces |
| **Full** | rounded-full | Badges, circular buttons |

### Shadows
```
shadow-sm:     0 1px 2px rgba(0,0,0,0.05)
shadow-md:     0 4px 6px rgba(0,0,0,0.1)
shadow-lg:     0 10px 15px rgba(0,0,0,0.1)
shadow-xl:     0 20px 25px rgba(0,0,0,0.1)

Contextual shadows:
- Bottom nav: shadow-[0_-6px_16px_rgba(146,64,14,0.08)]
- Emergency: shadow-lg shadow-emerald-500/30
- Float effect: shadow-xl shadow-emerald-900/30
```

---

## NAVIGATION & LAYOUT STRUCTURE

### Main Layout Components

#### 1. **Top Bar** (`<TopBar />`)
```tsx
Position: sticky top-0 z-40
Height: 64px (h-16)
Structure:
├── Menu Button (40x40 px, orange-100 border)
├── Page Title (centered, font-semibold)
└── Spacer (for 3-column grid)

Features:
- Sticky positioning during scroll
- Glass morphism background (backdrop-blur-xl)
- Orange accent on hover (menu button)
- Truncated title for long names
```

**Desktop Context:** Navigation only appears on pages within authenticated routes

#### 2. **Bottom Navigation** (`<BottomNav />`)
```tsx
Position: fixed bottom-0, z-40
Height: 64px (h-16)
Full-width smartphone nav bar

Role-Based Items:
├── Visitor (not logged in)
│   ├── HOME
│   └── LOGIN
│
├── Client (logged in, role: CLIENT)
│   ├── HOME
│   ├── BOOK (calendar icon)
│   ├── QUEUE (users icon)
│   └── PROFILE (user icon)
│
└── Admin (logged in, role: ADMIN)
    ├── HOME
    └── PROFILE

Active State Indicator:
- Orange bar animates to top (layoutId: "bottomNavIndicator")
- Icon scales up (1.05x) and shifts down 2px
- Label color changes to orange-500
- Icon stroke weight increases (2.5)
```

#### 3. **Hamburger Menu** (`<HamburgerMenu />`)
```tsx
Position: fixed inset-0, z-50
Structure:
├── Header section (h-28)
│   ├── Gradient bg: blue-600 to indigo-700
│   ├── "Menu" title + "Manage your dashboard" subtitle
│   └── Close button (X icon)
│
├── Menu items (staggered animation)
│   └── Each item: rounded-xl hover:bg-blue-50
│       ├── Icon placeholder
│       ├── Label (slate-700 text)
│       └── Chevron indicator
│
├── Divider (border-t border-slate-100)
│
└── Footer (p-6)
    └── Auth action button (Login/Logout)

Animation:
- Backdrop: fade in (opacity)
- Menu slide in from left (spring physics)
- Items stagger with 50ms delay per item
- Close on item selection or backdrop click
```

### Page Layout Pattern

Every authenticated page follows this structure:
```
┌─────────────────────────────────┐
│         Top Bar (sticky)        │ height: h-16
├─────────────────────────────────┤
│                                 │
│     Page Content Area           │ min-height: calc(100vh - h-32)
│     (px-4 py-6 / px-6 pt-12)  │ padding: varies per page
│                                 │
├─────────────────────────────────┤
│      Bottom Navigation (fixed)  │ height: h-16
└─────────────────────────────────┘
```

**Padding Patterns:**
- **Home/Services:** `px-4 py-3` (compact)
- **Booking/Auth:** `px-4 py-6` (breathing room)
- **Admin Pages:** `px-4 py-6` or `px-6 pt-12` (spacious)
- **Appointments:** `px-6 pt-12 pb-32` (extra bottom padding for nav clearance)

### Route Map

```
/ (HOME)
├── /services (SERVICES - public)
├── /book (BOOKING - requires auth)
├── /queue (QUEUE - requires auth)
├── /appointments (APPOINTMENTS - requires auth)
├── /profile (PROFILE - requires auth)
├── /auth (AUTH PAGE - public)
└── /admin/* (ADMIN ROUTES - requires admin role)
    ├── /admin (DASHBOARD)
    ├── /admin/services (SERVICE MANAGEMENT)
    ├── /admin/session (SESSION MANAGEMENT)
    ├── /admin/appointments (APPOINTMENT MANAGEMENT)
    ├── /admin/queue (QUEUE MANAGEMENT)
    └── /admin/users (USER MANAGEMENT)
```

**Navigation Guard Logic:**
```
If user tries to access /appointments or /profile while not logged in:
  → Redirect to /auth
  → Store desired path in authTarget
  → After successful auth, redirect to stored path
```

---

## USER PERSONAS & JOURNEYS

### Persona 1: **Client** (Logged-In User)

**Profile:**
- Role: CLIENT
- Needs: Book appointments, view live queue, manage own appointments
- Device: Smartphone (primary)
- Technical Level: Basic to intermediate

**Key Characteristics:**
- Uses app primarily for booking and queue checking
- Visits 2-3 times per week
- Prefers quick interactions (<2 mins)
- Values real-time queue status

**User Journey: Book Appointment**
```
1. Open app → HOME page
2. Tap "BOOK" button in bottom nav or hero CTA
3. Navigate to /book (BOOKING PAGE)
   ├── Select date from calendar
   ├── System loads available time slots
   ├── Select service from list
   ├── Select time slot
   └── Confirm booking
4. Success screen shows confirmation
5. Auto-redirect to appointments page
```

**User Journey: Check Queue**
```
1. Bottom nav → QUEUE
2. QueuePage displays:
   ├── Your slot # (if you're in queue)
   ├── Currently serving (name)
   ├── Total in queue (circular display)
   └── Full ordered list with positions
3. Real-time updates (manual refresh)
```

**User Journey: Manage Profile**
```
1. Bottom nav → PROFILE
2. ProfilePage shows:
   ├── Avatar with initials
   ├── Name + phone
   ├── Menu with 3 actions:
   │   ├── My Appointments
   │   ├── Edit Profile
   │   └── Preferences
   └── Sign Out button
```

---

### Persona 2: **Admin** (Staff)

**Profile:**
- Role: ADMIN
- Needs: Manage schedules, queue, services, appointments, users
- Device: Smartphone + Tablet
- Technical Level: Intermediate

**Key Characteristics:**
- Uses app throughout the day
- Needs quick access to real-time data
- Makes frequent small edits
- Manages multiple clients

**User Journey: Start Work Day**
```
1. Login with admin credentials
2. Navigate to /admin (Dashboard)
3. View KPIs:
   ├── Total registered users
   ├── Active services
   ├── Appointments today
   ├── Average appointment time
   ├── In queue count
   ├── Completed today
   └── User growth trend (7-day chart)
4. Access hamburger menu for other tools
```

**User Journey: Manage Queue**
```
1. Menu → Queue Management
2. Select queue date
3. View live queue list
4. Actions per item:
   ├── Move up/down in queue
   ├── Mark as complete
   └── Delete from queue
5. Conclude session at end of day
```

**User Journey: Add Service**
```
1. Menu → Service Management
2. Fill form:
   ├── Category (dropdown)
   ├── Name
   ├── Duration (minutes)
   ├── Price
   └── Description
3. Click "Add Service" or auto-save when editing
```

---

### Persona 3: **Visitor** (Not Logged In)

**Profile:**
- Role: None (unauthenticated)
- Needs: Explore salon, view services, navigate to login
- Device: Smartphone (primary)
- Technical Level: Basic

**User Journey: First Visit**
```
1. Open app → HOME page
2. View:
   ├── Hero section with "Signature Salon for Modern Style"
   ├── CTA: "Login to Continue"
   ├── Why choose us section (3 cards)
   ├── Barber shop gallery (4 images)
   ├── Services page link
   └── Testimonials (with 5-star ratings)
3. Tap "Services" in hamburger menu
4. View all active services with pricing
5. Tap "Login to Continue" → /auth
```

---

## COMPONENT LIBRARY

### UI Components

#### **BottomNav Component**
```tsx
Props: {
  activePage: 'home' | 'book' | 'queue' | 'profile'
  onChange: (page: PageType) => void
  role: 'visitor' | 'user' | 'admin'
}

Features:
- Dynamic item rendering based on role
- Motion-animated active indicator (spring physics)
- Stroke weight change on active
- Scale animation (1 → 1.05)
- Touch-optimized (64px height)
```

**Lucide Icons Used:**
- `<Home />` - Home page
- `<CalendarDays />` - Booking page
- `<Users />` - Queue page
- `<User />` - Profile page

---

#### **TopBar Component**
```tsx
Props: {
  title: string
  onMenuClick: () => void
}

Features:
- Sticky positioning (top-0)
- Menu button with hamburger icon
- Centered title (truncates if too long)
- Orange accent on hover
```

---

#### **HamburgerMenu Component**
```tsx
Props: {
  isOpen: boolean
  onClose: () => void
  onSelect: (tab: MenuTab) => void
  items: MenuItem[]
  isLoggedIn: boolean
  onAuthAction: () => void
}

MenuTab Options:
- 'home', 'services', 'book', 'queue', 'appointments', 'profile'
- 'admin-home', 'admin-services', 'admin-session'
- 'admin-appointments', 'admin-queue', 'admin-users'

Animation Details:
- Backdrop: fade in/out (200ms)
- Menu: slide from left (spring: stiffness 300, damping 30)
- Items: stagger delay (i * 50ms)
- Icon+Text combo animate together

Styling:
- Header: gradient bg-blue-600 to bg-indigo-700
- Items: rounded-xl, hover:bg-blue-50
- Footer: border-t, auth button with logout icon
```

---

#### **GoldSpinner Component**
```tsx
Purpose: Loading indicator

Features:
- Rotating circular border animation
- Colors: teal-100 (main), emerald-500/600 (accent)
- Duration: 2s linear infinite rotation
- Used on: Queue page (while loading), everywhere else needs loading

CSS:
border-2 border-teal-100 border-t-emerald-500 border-r-emerald-600
```

---

#### **BookingCalendar Component**
```tsx
Props: {
  selectedDate: string | null
  onSelectDate: (date: YYYY-MM-DD) => void
}

Features:
- Full calendar view with month navigation
- Disabled dates: before today, after 30 days
- Selected date highlighted in emerald-600
- Hover state on selectable dates
- Animated tap feedback (scale 0.9)

Date Calculation:
- Min: today (00:00:00 hours)
- Max: today + 30 days
- Display range: current month (prev/next disabled at bounds)

Styling:
- Header: month name, prev/next buttons
- Weekday labels: S M T W T F S
- Date buttons: rounded-full, 40px diameter
- Active: bg-emerald-600 text-white font-semibold
```

---

#### **TimeSlots Component**
```tsx
Props: {
  selectedTime: string | null
  onSelectTime: (time: HH:MM) => void
  slots: Array<{ time: string; available: boolean }>
}

Features:
- Flex wrap layout for time buttons
- Staggered animation (i * 50ms delay)
- Available vs unavailable states
- Selected state with emerald background
- Disabled interaction if unavailable

Styling:
- Available: border-emerald-600/50, hover enabled
- Selected: bg-emerald-500, border-emerald-500, text-white
- Unavailable: border-teal-100/30, text-slate-400/50, cursor-not-allowed

Animation:
- whileTap: scale 0.95 (if available)
- Initial: opacity 0, y: 10
- Animate: opacity 1, y: 0 (duration 0.3s)
```

---

#### **ServiceCard Component**
```tsx
Props: {
  name: string
  price: number
  delay?: number (for stagger animation)
}

Features:
- Simple flex layout with space-between
- Animated entrance (whileInView)
- Underline border on bottom (teal-100/50)

Styling:
- Name: text-slate-800, font-light
- Price: text-emerald-500, font-semibold, text-lg

Animation:
- Initial: opacity 0, y: 10
- whileInView: opacity 1, y: 0
- Margin: -50px (starts animating earlier)
```

---

#### **PriceList Component**
```tsx
Description: Full categorized pricing display

Structure:
├── Hair (section)
│   ├── Precision Haircut - $45
│   ├── Executive Cut - $60
│   └── Buzz Cut - $25
├── Beard (section)
│   ├── Hot Towel Shave - $35
│   ├── Beard Sculpting - $30
│   └── Line Up - $15
└── Premium (section)
    ├── The Full Experience - $95
    └── Groom's Package - $120

Styling:
- H3 labels: uppercase, emerald-600, text-xs
- Items: flex justify-between, border-b border-teal-100/30
- Each item animated with delay based on index
```

---

#### **TestimonialCard Component**
```tsx
Props: {
  quote: string
  name: string
  rating?: number (default 5)
  delay?: number
}

Features:
- Centered layout with rounded border
- Star rating display (filled blue Stars)
- Quote in italics (implicit via styling)
- Name in uppercase, small

Styling:
- Border: border-slate-200
- Background: white, hover:shadow-md
- Stars: fill-blue-500

Animation:
- whileInView with ease timing
- Staggered by delay prop
```

---

#### **HeroSection Component**
```tsx
Props: {
  isLoggedIn: boolean
  onBookClick: () => void
}

Features:
- Full-height section with background image
- Gradient overlay (black/20/45 blend)
- Animated heading and CTA
- Responsive image from Unsplash

Content:
├── Status badge (animated pulse)
│   └── "Open Today 9:00 - 18:00"
├── Main heading
│   ├── "Signature salon"
│   └── "for modern style" (amber-200)
├── Subheading
├── CTA button
│   ├── Text changes based on login state
│   └── Hover: gradient shift, scale animation

Background Image:
URL: 'https://images.unsplash.com/photo-1503951458645-643d53bfd90f'
Caption: Barber shop

Animation:
- Container: opacity 0→1, duration 0.8s
- Heading: fade in with easing
- Button: scale 0.98 on tap, y movement on hover
```

---

#### **PwaInstallButton Component**
```tsx
Purpose: Prompt users to install PWA

Features:
- Listens to beforeinstallprompt event
- Shows button only if PWA-installable
- Displays message after install attempt

State:
- deferredPrompt: Event | null
- message: '' | installation feedback

Styling:
- Fixed position: bottom-24 right-4
- emerald-600 bg with hover:emerald-500
- Shadow: emerald-900/30

Messages:
- Installation success: "App installed. Open from home screen."
- No beforeinstallprompt: "Use browser menu: Install app..."

Uses:
- Smartphone icon, Download icon
```

---

### Form Components

#### Authentication Form (Inline in AuthPage)
```tsx
Modes:
├── Login
│   ├── Phone Number input
│   ├── Password input
│   └── Login button
│
└── Signup
    ├── First Name input
    ├── Last Name input
    ├── Phone Number input
    ├── Password input
    └── Create Account button

Validation (Client-side):
- Phone: 10-15 digits only
- Password: ≥8 characters
- Name fields: required, ≤50 chars
- Trimming & sanitization

Styling:
- Border: border-teal-100
- Background: white
- Focus: implicit (Tailwind default)
- Error message: text-rose-600, text-xs

Error Handling:
- Displays user-friendly error messages
- Filters out server internals (mongod, validation errors)
```

---

## PAGE LAYOUTS & FLOWS

### **Home Page** (`/`)
**Role Access:** All (visitor, user, admin)

```
Layout:
├── HeroSection (68vh)
│   └── Background image + gradient overlay
│   └── CTA: "Go to Booking" or "Login to Continue"
│
├── Section: "Why Clients Choose Us"
│   ├── Premium Styling (Sparkles icon)
│   ├── On-Time Sessions (Clock icon)
│   └── Modern Techniques (Brush icon)
│   └── 3 grid cards, motion-animated
│
├── Section: "Barber Shop Showcase"
│   ├── 2x2 grid of salon images
│   └── "Continue to Booking" button
│
└── Section: Testimonials (future expansion)
```

**Interactions:**
- Hero CTA → Navigate to booking (if logged in) or auth
- Card animations trigger on scroll (whileInView)
- Image gallery is static (no carousel)

---

### **Services Page** (`/services`)
**Role Access:** All (visitor, user, admin)

```
Layout:
├── H1: "Services & Pricing"
│
└── Services List (space-y-3)
    └── Service cards fetched from API
        ├── Service name (left)
        ├── Price (right)
        └── Description (subtitle)
```

**Behavior:**
- Fetches active services on mount
- Falls back to hardcoded list if API fails
- Real-time updates from backend
- No interactive state per service card

---

### **Booking Page** (`/book`)
**Role Access:** Authenticated clients only

```
Multi-Step Form Layout:

Step 1: Select Date
├── H1: "Reserve Your Time"
├── BookingCalendar component
│   └── Month view with date selection
│
Step 2: Select Service (appears after date)
├── H3: "Select Service"
├── Service list (motion-enter animation)
│   └── Each service: name + price
│   └── Selection border highlight (teal)
│
Step 3: Select Time Slot (appears after service)
├── H3: "Select Your Time"
├── TimeSlots component (flex wrap)
│   └── Auto-loads available slots based on date
│
Step 4: Confirm Booking
├── Confirm CTA: "Complete Booking"
├── Loading state: spinner
└── Validation: all 3 steps required

Success State:
├── Overlay fullscreen
├── Checkmark icon (emerald-600)
├── "Your Time Has Been Secured"
├── Countdown (1.8s)
└── Auto-redirect to appointments
```

**State Management:**
```tsx
const [selectedDate, setSelectedDate] = useState<string | null>(null)
const [selectedService, setSelectedService] = useState<string | null>(null)
const [selectedTime, setSelectedTime] = useState<string | null>(null)
const [isSuccess, setIsSuccess] = useState(false)
const [isSubmitting, setIsSubmitting] = useState(false)
const [slots, setSlots] = useState<Array<{ time: string; available: boolean }>>([])
const [loadingSlots, setLoadingSlots] = useState(false)
const [noSchedule, setNoSchedule] = useState(false)
```

**API Calls:**
- `getServices()` - Fetch active services on mount
- `getClientScheduleByDate(date)` - Load time slots for selected date
- `createAppointment({ date, timeSlot })` - Submit booking

---

### **Queue Page** (`/queue`)
**Role Access:** Authenticated clients only

```
Layout:
├── H1: "Live Queue"
│
├── Your Queue Position (if you're in queue)
│   ├── "Your Slot Number"
│   ├── Position number (large, teal-700)
│   └── "Approx wait: X mins"
│
├── Currently Serving Section
│   ├── "Now Serving"
│   └── Customer name (large heading)
│
├── Queue Count Display
│   ├── Circular badge (28px border)
│   ├── Large number (total in queue)
│   └── "In Queue" label
│
└── Full Queue List
    └── Ordered list of all appointments
        ├── Position number
        ├── Name (or "You" if current user)
        ├── Status badge
        └── "In Chair" label if in service
```

**Data:**
- Fetches on mount using `getLiveQueue(date)`
- Re-renders on tab focus (future: WebSocket)
- Shows "No appointments for today" if empty

**Animations:**
- All list items slide in with staggered delay
- Queue circle scales in with spring easing
- Currently serving name has bottom border accent

---

### **Appointments Page** (`/appointments`)
**Role Access:** Authenticated clients only

```
Layout:
├── H1: "Appointments"
│
├── Section: Today
│   ├── H2: "Today"
│   └── Appointment list (sorted by time, nearest first)
│       ├── Upcoming first, then past
│       ├── Cancel button (if BOOKED/IN_SERVICE)
│       └── Border highlight for today
│
├── Section: Upcoming
│   ├── H2: "Upcoming"
│   └── List sorted ascending by time
│
└── Section: Past
    ├── H2: "Past"
    └── List sorted descending (newest first)
```

**Appointment Item:**
```
├── Date (left side)
├── Time slot (subtitle)
├── Status badge (right)
└── Cancel button (conditional)
```

**Sorting Logic:**
```
Today:
  - Upcoming appointments first (time > now)
  - Past appointments last (time < now)
  
Upcoming:
  - Sorted ascending by date/time

Past:
  - Sorted descending (newest first)
```

---

### **Profile Page** (`/profile`)
**Role Access:** Authenticated clients only

```
Layout:
├── Profile Header
│   ├── Avatar with initials (based on name)
│   ├── Full name
│   ├── Phone number
│   └── Profile image URL
│
├── Menu Actions
│   ├── 📅 My Appointments
│   ├── ✏️ Edit Profile
│   ├── ⚙️ Preferences
│   └── 🚪 Sign Out
│
├── Active Action Panel (below menu)
│   ├── My Appointments view
│   │   └── All appointments (sorted by time)
│   ├── Edit Profile form
│   │   ├── First name input
│   │   ├── Last name input
│   │   ├── Current password (if changing)
│   │   ├── New password input
│   │   ├── Profile image URL
│   │   └── Save button
│   └── Preferences panel
│       ├── Queue Alerts toggle
│       └── Appointment Reminders toggle
│
└── Status messages (toast-like)
```

**Profile Edit Features:**
- Change name
- Change profile image URL
- Change password (requires current password)
- Auto-save on successful update
- Toast notification on changes

**Preferences Storage:**
- Stored in localStorage: `salon_preferences`
- Key-value: `{ queueAlerts: boolean, appointmentReminders: boolean }`

---

### **Auth Page** (`/auth`)
**Role Access:** Public (non-authenticated)

```
Layout:
├── H1: "Login" or "Sign Up" (depends on mode)
│
├── Form section
│   ├── Card with teal-100 border
│   │
│   ├── Login Mode:
│   │   ├── Phone number input
│   │   └── Password input
│   │
│   ├── Signup Mode:
│   │   ├── First name input
│   │   ├── Last name input
│   │   ├── Phone number input
│   │   └── Password input
│   │
│   ├── Action button
│   │   ├── "Login" or "Create Account"
│   │   └── Disabled during submission (opacity-60)
│   │
│   ├── Toggle mode button
│   │   └── "Need an account? Sign Up" or reverse
│   │
│   └── Error message (if any)
│       └── text-rose-600, text-xs
```

**Form Validation:**
```
Client-side:
- Phone: 10-15 digits only, required
- Password: ≥8 chars, required
- FirstName/LastName: ≤50 chars each

Server-side (handled in api.ts errors):
- Duplicate phone rejection
- Password hash comparison
- User creation/authentication
```

**Navigation After Auth:**
```
1. Extract authTarget from App state (default: /profile)
2. On successful auth:
   - Update sessionUser state
   - Redirect to authTarget or /profile
   - Admin role detected → redirect to /admin instead
```

---

## ADMIN INTERFACE

### **Admin Dashboard Page** (`/admin`)
**Role Access:** Admin only

```
Layout:
├── H1: "Dashboard" + Live status badge (green)
│
├── KPI Grid (2x2)
│   ├── Users (blue icon)
│   ├── Services (purple icon)
│   ├── Appointments Today (emerald icon)
│   └── Average Appointment Time (orange icon)
│
├── User Growth Trend (SVG line chart)
│   ├── 7-day registration trend
│   ├── Linear gradient fill (blue)
│   ├── Interactive points (hover effect)
│   └── Day labels below (S M T W T F S)
│
├── Quick Metrics (2x2)
│   ├── In Queue (slate)
│   └── Completed (emerald)
│
└── Loading state (spin animation)
```

**Data Source:**
- Fetches `adminGetDashboardStats()` on mount
- Stats struct: `{ registeredUsers, activeServices, appointmentsToday, inQueue, completed, userRegistrationTrend[] }`

**SVG Chart:**
```
- Polyline: stroked in #2563eb (blue-600)
- Fill: gradient from blue-600 to transparent
- Points: svg circles, interactive on hover
- XAxis labels: formatted day abbreviations
```

---

### **Service Management Page** (`/admin/services`)
**Role Access:** Admin only

```
Layout:
├── H1: "Service Management"
│
├── Add Service Form (card)
│   ├── Category dropdown
│   ├── Service name input
│   ├── Duration (minutes) input
│   ├── Price input
│   ├── Description (full-width)
│   └── "Add Service" CTA
│
└── Services List (space-y-3)
    └── Each service card
        ├── Category dropdown
        ├── Name input (onBlur auto-save)
        ├── Duration input (onBlur auto-save)
        ├── Price input (onBlur auto-save)
        ├── Active checkbox
        └── Delete button
```

**Auto-Save Behavior:**
- Optimistic UI update
- onBlur triggers API call
- Reverts if save fails
- Toast feedback: "Saved" / "Auto-save failed"

**Service Categories:**
- HAIRCUT
- BEARD
- COMBO
- PREMIUM

---

### **Session Management Page** (`/admin/session`)
**Role Access:** Admin only

```
Layout:
├── H1: "Session Management"
│
├── Calendar Section
│   ├── Prev/Next month navigation
│   ├── 7x5 grid of dates
│   ├── Color coding:
│   │   ├── Blue bg: OPEN status
│   │   ├── Brown bg: CLOSED status
│   │   └── Light: no schedule set
│   └── Min: today, Max: today + 30 days
│
└── Selected Day Editor
    ├── "Selected day: YYYY-MM-DD"
    ├── Status dropdown (OPEN/CLOSED)
    ├── Start time input
    ├── End time input
    ├── Auto-calculated appointment count
    │   └── Formula: (endTime - startTime) / 30 mins
    └── "Save Day" button
```

**Date Navigation:**
- Previous month disabled if viewing current month
- Next month disabled at max date boundary
- Selected date shows current schedule (if exists)
- Form populates with default values if no schedule

---

### **Appointment Management Page** (`/admin/appointments`)
**Role Access:** Admin only

```
Layout:
├── H1: "Appointment Management"
│
├── Create Reserved Appointment Form
│   ├── Date input (HTML date picker)
│   ├── Time input (HTML time picker)
│   └── "Save Reserved Slot" button
│
├── Status message
│
└── Appointment Sections
    ├── Today (sorted: upcoming first, then past)
    ├── Upcoming (sorted: ascending by time)
    └── Past (sorted: descending by time)
    
    └── Each appointment item:
        ├── Customer name (or "Reserved")
        ├── Phone number (or dash)
        ├── Date · Time
        ├── Status badge
        └── Delete button
```

**Status Classes:**
- BOOKED, IN_SERVICE, COMPLETED, CANCELLED, NO_SHOW
- Reserved appointments: "RESERVED" badge in blue

---

### **Queue Management Page** (`/admin/queue`)
**Role Access:** Admin only

```
Layout:
├── H1: "Queue Management"
│
├── Queue Date Selector (input type="date")
│
├── Status message
│
└── Queue List (space-y-3)
    └── Each queue item:
        ├── Position #N · Name
        ├── Phone · Time slot
        ├── Status badge
        └── Action buttons:
            ├── ⬆️ Up (disabled if first)
            ├── ⬇️ Down (disabled if last)
            ├── ✓ Complete
            └── 🗑️ Delete
        
        └── All in grid grid-cols-4 gap-2
```

**Queue Reordering:**
- Optimistic UI update (drag-and-drop-like)
- Calls `adminReorderQueue(date, newOrder)` API
- Reverts if API fails
- Updates positions on reorder

**Conclude Session:**
- Button at bottom: "Conclude Session" (red border)
- Confirmation dialog
- Moves to next day's queue

---

### **User Management Page** (`/admin/users`)
**Role Access:** Admin only

```
Layout:
├── H1: "User Management"
│
├── Add User Form
│   ├── First name input
│   ├── Last name input
│   ├── Phone number input
│   ├── Password input
│   ├── Role dropdown (CLIENT/ADMIN)
│   └── "Add User" button
│
├── Status message
│
└── Users List (space-y-3)
    └── Click any user to expand edit panel
        ├── Basic info display
        │   ├── Name
        │   ├── Phone
        │   ├── Role badge
        │   └── Active status
        ├── Delete button
        │
        └── [Optional] Edit Panel (if selected)
            ├── H4: "Edit User"
            ├── First/Last name inputs
            ├── Phone input
            ├── Role dropdown
            ├── Active checkbox
            ├── Action buttons:
            │   ├── Update User
            │   └── Cancel
            └── Stops event propagation
```

**Click Behavior:**
- Click user card → expand edit form
- Click within edit form → stop propagation
- Can only edit one user at a time
- Edit form nested inside user card

---

## FORMS & DATA INPUT

### Common Input Styling
```css
input, select, textarea {
  @apply bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-900
}
```

### Input Types Used
1. **Text inputs** - Name fields, service names
2. **Number inputs** - Price, duration
3. **Password inputs** - Auth page
4. **Date inputs** - Session/appointment dates
5. **Time inputs** - Session times, appointment times
6. **Select dropdowns** - Categories, roles, status
7. **Checkboxes** - Active/inactive, toggles
8. **Textarea** - Descriptions (implicit, no examples found)

### Validation Patterns

**Client-Side (in components):**
```tsx
// Phone validation
if (!/^\d{10,15}$/.test(phoneNumber)) {
  setMessage('Phone number must be 10–15 digits')
}

// Password validation
if (password.length < 8) {
  setMessage('Password must be at least 8 characters')
}

// Name validation
if (firstName.length > 50) {
  setMessage('Name fields must be 50 characters or fewer')
}
```

**Server-Side Feedback:**
- User-friendly messages displayed on errors
- Technical errors filtered out (no mongod/validation errors shown)
- API returns: `{ success: boolean, data?: T, message?: string }`

---

## DATA DISPLAY PATTERNS

### Lists
```tsx
// Appointments list
<div className="space-y-3">
  {items.map((item) => (
    <div key={item.id} className="border border-teal-100/40 rounded-lg p-4">
      {/* item content */}
    </div>
  ))}
</div>
```

**Spacing:** `space-y-3` (12px gap)  
**Card Style:** `border rounded-lg p-4`

### Tables/Admin Lists
```tsx
// Queue list: position # · name · actions
// Admin users: name · phone · role · active status
// Appointments: date · time · status
```

No HTML tables used; CSS grid/flex instead

### Status Badges
```tsx
// Status: BOOKED, IN_SERVICE, COMPLETED, CANCELLED, NO_SHOW

// Styling:
<span className="text-xs text-emerald-600 tracking-wider">
  {status}
</span>

// Colors by status:
- BOOKED/IN_SERVICE: emerald-600
- COMPLETED: emerald-500
- CANCELLED: red-300
- NO_SHOW: slate-400
- RESERVED: blue-600 (admin)
```

### Empty States
```tsx
if (isEmpty) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-sm text-slate-400 uppercase">
        No appointments for today
      </p>
    </div>
  )
}
```

### Loading States
```tsx
// Spinner overlay (GoldSpinner component)
if (isLoading) {
  return <div className="flex justify-center py-8"><GoldSpinner /></div>
}

// Inline spinner
<div className="flex items-center justify-center py-8">
  <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
  <span className="ml-3 text-sm text-slate-400">Loading...</span>
</div>
```

### Messages/Toasts
```tsx
// Info/Success
{message ? <p className="text-xs text-blue-600 mb-4">{message}</p> : null}

// Error
{message ? <p className="text-sm text-rose-600 mb-4">{message}</p> : null}

// Success with icon
<div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-3">
  <Activity className="w-4 h-4" />
  {message}
</div>
```

---

## AUTHENTICATION & SECURITY

### Session Management
```tsx
// Session structure (localStorage + memory)
type SessionState = {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    firstName: string
    lastName: string
    phoneNumber: string
    role: 'ADMIN' | 'CLIENT'
    profileImageUrl?: string | null
  }
}

// Storage key
localStorage.getItem('salon_web_session')

// Functions:
- getCurrentSession(): SessionState | null
- setStoredSession(session: SessionState): void
- clearStoredSession(): void
- isSessionAuthenticated(): boolean
```

### Token Auth
```tsx
// Axios interceptor adds Bearer token
config.headers.Authorization = `Bearer ${session.accessToken}`

// Two-token system:
1. Access token (short-lived, in API calls)
2. Refresh token (long-lived, for silent refresh)

// 401 handling:
- Intercepts failed requests (status 401)
- Calls silentRefresh using refreshToken
- Retries original request with new access token
- Clears session if refresh fails
```

### Endpoints Requiring Auth
```
POST /auth/login
POST /auth/register
POST /auth/logout
POST /auth/refresh (refresh token)
GET /users/profile
PUT /users/profile
GET /appointments/my
POST /appointments
PUT /appointments/:id/cancel
GET /queue
(all /admin/* routes)
```

### CSRF Protection
```
- All POST/PUT/DELETE requests must include 'X-Requested-With' header
- Express middleware rejects requests without this header
- Axios client includes: { 'X-Requested-With': 'XMLHttpRequest' }
```

### Password Requirements
- Minimum 8 characters
- Phone: 10-15 digits (digits only)
- Stored as hash (bcrypt, implicit in backend)

### Role-Based Access
```
CLIENT roles:
- /profile, /appointments, /queue, /book, /services, /auth

ADMIN roles:
- /admin, /admin/services, /admin/session
- /admin/appointments, /admin/queue, /admin/users

Visitor (no auth):
- /, /services, /auth

Guards in App.tsx:
- Redirect to /auth if accessing protected routes without login
- Store authTarget, auto-navigate after auth
```

---

## ANIMATIONS & INTERACTIONS

### Animation Library
**Framer Motion** is the primary animation library used throughout the app.

### Motion Patterns

#### 1. **Page Transitions**
```tsx
// Fade in on mount
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.5 }}
>
```

#### 2. **Container Animations**
```tsx
// Staggered children
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35 }}
>
```

#### 3. **Component-Level**

**Bottom Nav Active Indicator:**
```tsx
<motion.div 
  layoutId="bottomNavIndicator"
  className="absolute top-0 w-8 h-[3px] bg-orange-500 rounded-b-full"
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
/>
```

**List Item Stagger:**
```tsx
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.6 + i * 0.1 }}
  >
    {item.content}
  </motion.div>
))}
```

#### 4. **Interactive Animations**

**Tap Scale:**
```tsx
<motion.button
  whileTap={{ scale: 0.95 }}
  whileHover={{ y: -2 }}
>
```

**Hover Effects:**
```tsx
<motion.div whileHover={{ y: -2 }} />.
```

#### 5. **Entrance Animations**

**WhileInView:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-50px' }}
  transition={{ duration: 0.5, delay, ease: 'easeOut' }}
/>
```

### Lucide Icons

**Icons Used:**
```
Navigation:
- Home (home-like, general)
- CalendarDays (booking dates)
- Users (queue/group)
- User (profile/person)
- Menu (hamburger icon)
- X (close button)
- ChevronLeft/Right (navigation)
- ChevronRight (menu items)

Actions:
- Check / CheckCircle2 (success)
- LogOut / LogIn (auth)
- Edit (edit mode)
- Settings (preferences)
- List (generic menu item)
- Download / Smartphone (PWA install)

Admin:
- Users, Scissors, CalendarDays
- Clock, Activity, CheckCircle2, Brush
- Sparkles (highlights)

Sizes:
- w-4 h-4 (small)
- w-5 h-5 (medium)
- w-12 h-12 (large background)
```

### Custom CSS Animations

**Tailwind animations:**
```css
@layer utilities {
  .glass-card {
    @apply border border-slate-200 bg-white/90 backdrop-blur-xl 
           shadow-sm rounded-xl;
  }
}

// Available animations:
animate-spin (Tailwind built-in)
animate-pulse (Tailwind built-in)
animate-spin-slow (custom in tailwind config: 3s linear)
```

---

## RESPONSIVE DESIGN

### Breakpoints (Tailwind)
```
Mobile:   <640px (no prefix)
sm:       ≥640px
md:       ≥768px
lg:       ≥1024px
xl:       ≥1280px
2xl:      ≥1536px
```

### Mobile-First Strategy

**The entire design is mobile-first.** Layouts are designed for:
- Portrait orientation (mobile phones)
- Touch interactions (44px+ tap targets)
- Single column (flex column)
- Bottom navigation (easier thumb reach)
- Smaller viewports (375-400px minimum)

### Responsive Patterns

**Layout Widths:**
```tsx
// Most pages: full width
<div className="px-4 py-6"> {/* 16px padding */}

// Admin pages: centered max-width
<div className="px-4 py-6 max-w-5xl mx-auto"> {/* max-width: 64rem */}
```

**Grids:**
```
// 2x2 grid (mobile)
<div className="grid grid-cols-2 gap-4"> {/* 2 columns */}

// 4-up grid (admin) - always 4 (no responsive changes observed)
<div className="grid grid-cols-2 gap-3"> {/* 2 cols on mobile */}
```

**Typography Scaling:**
```
Page H1: text-3xl   (30px on mobile, no md: variant)
Section H2: text-2xl (24px on mobile)
Body text: text-base (16px on mobile)
```

### Focus on Mobile Interaction

**Touch-Optimized:**
- Buttons: 40-44px minimum height
- Bottom nav items: 64px height
- Input padding: p-3 (12px)
- Card spacing: gap-3/gap-4 (12-16px)

**Viewport Meta:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

**Orientation:** Portrait primary (no landscape mode detected in design)

---

## PWA & MOBILE FEATURES

### PWA Configuration

**Manifest (`vite.config.ts`):**
```json
{
  "name": "Salon Ru Zero One",
  "short_name": "Salon R01",
  "description": "Book your appointment at Salon Ru Zero One",
  "theme_color": "#0D9488",
  "background_color": "#F0FDFA",
  "display": "standalone",
  "start_url": "/",
  "scope": "/",
  "orientation": "portrait-primary",
  "icons": [
    { "src": "pwa-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "pwa-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "pwa-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

### Service Worker
**Managed by:** Vite PWA plugin (`registerSW`)
```tsx
import { registerSW } from "virtual:pwa-register"
registerSW({ immediate: true })
```

**Caching Strategy:**
```
Static assets: Network-first
Public API routes: Stale-while-revalidate
(Cache expiration: 1 hour max)
API routes: Excluded from cache
```

### Offline Support
```
- Service Worker enables offline navigation
- Cached pages accessible offline
- API calls fail gracefully
- User sees appropriate messages
- Queue refresh/bookings require connectivity
```

### Install Prompt
**Component:** PwaInstallButton

```tsx
- Listens to beforeinstallprompt event
- Shows install button on installable devices
- Prompts user to install app
- Success message: "Open from your home screen"
```

### iOS/Apple Support
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Salon R01" />
<link rel="apple-touch-icon" href="/pwa-192.png" />
```

### Microsoft Support
```html
<meta name="msapplication-TileImage" content="/pwa-192.png" />
<meta name="msapplication-TileColor" content="#0D9488" />
```

---

## ACCESSIBILITY & UX PATTERNS

### ARIA Labels
```tsx
// Navigation items
<button aria-label="Open menu">
<button aria-label="Close menu">

// Icons-only buttons
<button aria-label="Login">
  <Menu className="w-5 h-5" />
</button>
```

### Semantic HTML
```
<html>, <body>, <main>, <section>, <nav>, <button>, <input>
```

### Keyboard Navigation
- Tab through form inputs
- Enter to submit forms
- Escape to close menus (not explicitly coded, native browser behavior)

### Focus States
- Native Tailwind focus rings (implicit)
- No custom focus styles observed
- Input borders indicate focus (default browser)

### Loading Indicators
- GoldSpinner for loading states
- Inline spinners for async operations
- Disabled buttons during submission

### Error Messaging
- Prominent red color (text-rose-600)
- Clear, user-friendly text
- No technical jargon exposed

### Success Feedback
- Animated success screen (booking confirmation)
- Toast-like messages
- Auto-dismiss or user action required

---

## API INTEGRATION

### Axios Client Configuration
```tsx
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
})
```

### Interceptors

**Request:**
```tsx
// Adds Authorization header if authenticated
client.interceptors.request.use((config) => {
  const session = getStoredSession()
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }
  return config
})
```

**Response:**
```tsx
// Auto-refresh on 401
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Silently refresh token
      // Retry original request
      // Clear session if refresh fails
    }
  }
)
```

### Main API Endpoints

#### Authentication
```
POST /auth/login
POST /auth/register
POST /auth/logout
POST /auth/refresh
```

#### User Profile
```
GET /users/profile
PUT /users/profile
GET /users (admin)
POST /users (admin)
PUT /users/:id (admin)
DELETE /users/:id (admin)
```

#### Services
```
GET /services
POST /services (admin)
PUT /services/:id (admin)
DELETE /services/:id (admin)
```

#### Schedule
```
GET /schedule/:date
GET /schedule?startDate&endDate (admin)
PUT /schedule (admin)
POST /session/open (admin)
PUT /session/close (admin)
```

#### Appointments
```
GET /appointments/my
POST /appointments
PUT /appointments/:id/cancel
GET /appointments (admin)
POST /appointments/reserve (admin)
PUT /appointments/:id/complete (admin)
DELETE /appointments/:id (admin)
```

#### Queue
```
GET /queue?date
PUT /queue/reorder (admin)
```

#### Bookings/Time Slots
```
POST /bookings
GET /time-slots?date
```

### Data Mapping Functions

```tsx
// SessionUser from API
mapSessionUser(raw: any): SessionUser
- Extracts: id, firstName, lastName, phoneNumber, role
- Maps: MongoDB _id → id, defaults missing fields

// Service from API
mapService(raw: any): Service
- Handles field variations: durationMinutes/durationMins/duration

// ManagedService (admin view)
mapManagedService(raw: any): ManagedService
- Adds category field for service categorization

// Appointment Mapping
mapBookingToAppointment(raw: any): Appointment
mapBookingToManagedAppointment(raw: any): ManagedAppointment
- Handles status transformations: IN_SERVICE → BOOKED
```

### Error Handling
```tsx
// Network errors caught + user-friendly message
try {
  await apiCall()
} catch (error: unknown) {
  const serverMsg = error?.response?.data?.message ?? ''
  const isUserFacing = /* message safety checks */
  setMessage(isUserFacing ? serverMsg : 'Operation failed')
}
```

---

## STATE MANAGEMENT

### Local Component State
All state is managed with React hooks (useState).

```tsx
// Example: Booking page
const [selectedDate, setSelectedDate] = useState<string | null>(null)
const [selectedService, setSelectedService] = useState<string | null>(null)
const [selectedTime, setSelectedTime] = useState<string | null>(null)
const [isSubmitting, setIsSubmitting] = useState(false)
const [slots, setSlots] = useState<Array<{ time: string; available: boolean }>>([])
```

### Session State
```tsx
// App.tsx (root level)
const [sessionUser, setSessionUser] = useState(() => getCurrentSession()?.user ?? null)

// Updated on:
- Page load (from localStorage)
- Successful auth
- Profile updates
- Logout
```

### Side Effects
```tsx
// useEffect triggers:
- Component mount (load data from API)
- Dependency changes (re-fetch on date change)
- Navigation (clean up, reset state)

// No cleanup observed in code, but could prevent memory leaks
```

### Derived State (useMemo)
```tsx
// Admin dashboard: calculate user growth chart
const trendPoints = useMemo(() => {
  // Recalculate only when stats changes
}, [stats])

// Appointments: group by date/status
const grouped = useMemo(() => {
  // Sort/filter appointments
}, [rows])

// Menu items: build based on role
const menuItems = useMemo<MenuItem[]>(() => {
  return isAdmin ? [...adminItems] : [...clientItems]
}, [isAdmin, isLoggedIn])
```

### Props & Context
- No Redux, Context API found
- Props drilled down for state
- Top-level App.tsx manages:
  - sessionUser
  - authTarget
  - isMenuOpen
  - isOnline

---

## CURRENT VISUAL LANGUAGE

### Brand Identity
**Name:** Salon Ru Zero One  
**Tagline:** "Signature salon for modern style"  
**Target:** Premium, modern, contemporary salon

### Visual Direction

**Primary Emotions:**
- Elegance, Professionalism
- Trust, Modernity
- Premium quality, Approachability

**Design Principles:**
1. **Minimalism:** Clean white spaces, subtle accents
2. **Warmth:** Orange & amber accents (welcoming)
3. **Sophistication:** Fine typography, spacing
4. **Modernity:** Smooth animations, glass-morphism
5. **Accessibility:** Dark text on light backgrounds

### Hero Section
- Large background image (barber shop scene)
- Gradient overlay (dark to light, black/20 to #fffdf9)
- Bold, large typography (2.75rem)
- Warm accent color on key phrase
- Clear CTA button (emerald bg)

### Card-Based UI
- Light borders (slate-200, teal-100)
- White backgrounds with subtle shadows
- Rounded corners (xl for cards, lg for inputs)
- Consistent 16px padding (p-4)
- Hover effects (shadow increase, subtle color shift)

### Color Blocking
- Admin section: blue/indigo (different from client orange)
- Emergency/destructive: red
- Success: emerald (strong, confident)
- Info: blue (administrative)

---

## MOBILE OPTIMIZATION DETAILS

### Screen Size Optimization
```
iPhone SE:       375px wide
iPhone 12:       390px wide
iPhone 14:       390px wide  ← Target minimum
Larger phones:   400-450px
Tablets:         768px+ (not optimized; works as-is)
```

### Touch Targets
```
Minimum tap size: 44px (Apple/Material guidelines)
Bottom nav items: 64px height = 60+ pixels
Buttons: ≥40px height (py-2 min)
Input fields: 44px height (p-3 ≈ 40-48px total with border)
```

### Viewport Handling
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```
- `viewport-fit=cover`: Extends to notch/safe areas (iPhone X+)
- `initial-scale=1.0`: No pre-zoom

### Safe Areas
- Status bar height: ~44px (iOS)
- Bottom home indicator: ~34px (iPhone X+)
- Bottom nav accounts for this (fixed bottom-0)

### Fixed Positioning
```
Fixed elements:
- TopBar: position sticky top-0 z-40
- BottomNav: position fixed bottom-0 z-40
- PwaInstallButton: position fixed bottom-24 right-4 z-50

z-index layering:
- z-50 (modals, installButton)
- z-40 (topBar, bottomNav)
- z-10 (hero content)
- z-0 (default)
```

### Performance Optimizations
```
Vite bundling:
- Code splitting via React Router
- Lazy component loading (implicit via Routes)
- Tree-shaking unused code

Service Worker:
- Caches static assets
- Stale-while-revalidate for public API data
- Runtime caching for /api/services

Image Optimization:
- External Unsplash images (CDN)
- No local image optimization (external URLs)
```

### Gesture Support
```
Animations respond to:
- tap (whileTap scale)
- hover (whileHover y shift)
- scroll (whileInView entrance)

No pinch-zoom overrides (default browser behavior preserved)
```

---

## SUMMARY: KEY DESIGN DECISIONS

### 1. **Architecture Choices**
- **SPA with SSR-ready structure** but no SSR implemented
- **PWA-first:** Installable, offline-capable
- **Mobile-first design:** Single column, touch-optimized
- **Dual-role UI:** Seamless switch between client/admin modes

### 2. **Tech Stack Rationale**
- **React + TypeScript:** Type safety, component reusability
- **Tailwind CSS:** Rapid prototyping, consistent spacing
- **Framer Motion:** Smooth animations, professional feel
- **Lucide React:** Lightweight icon library, 25+ different icons
- **Axios + Custom Interceptors:** Simplified token management

### 3. **Visual Strategy**
- **Color Palette:** Warm (amber/orange) + cool (emerald/teal) balance
- **Typography:** Inter (sans-serif, modern) throughout
- **Spacing:** Consistent 4px/8px/12px/16px scale
- **Animations:** 300-600ms (noticeable but not slow)
- **Shadows:** Subtle (@apply shadow-sm default, shadow-xl on CTAs)

### 4. **UX Foundations**
- **Clear Navigation:** Bottom nav for users, hamburger for extended menu
- **Feedback:** Spinners, toasts, animations for every action
- **Validation:** Client-side + server-side error handling
- **Real-Time:** Queue/appointment status updates (polling, no WebSocket yet)
- **Accessibility:** Basic ARIA labels, semantic HTML, keyboard nav

### 5. **Admin Design**
- **Dashboard-heavy:** KPIs + metrics first
- **Quick edits:** Auto-save on blur for most forms
- **Confirmation dialogs:** Destructive actions require approval
- **Color differentiation:** Blue/indigo for admin (different from orange)

---

## POTENTIAL EXPANSION AREAS

1. **Dark Mode:** Foundation colors support dark theming
2. **Internationalization:** Text strings centralized, ready for i18n
3. **WebSocket Integration:** Socket setup exists, queue could go real-time
4. **Analytics:** Dashboard structure supports additional metrics
5. **Notifications:** PWA ready for push notifications
6. **Payment Integration:** No payment found; ready for implementation
7. **Photo Gallery:** Team members + portfolio expansion possible
8. **Reviews/Ratings:** Testimonial section could integrate real data

---

## TECHNICAL METRICS

| Metric | Value |
|--------|-------|
| Total Components | 16 (pages + reusable) |
| Type Definitions | User, Service, Appointment, Schedule, etc. |
| API Endpoints | 40+ (auth, user, service, schedule, appointment, queue, admin) |
| Animation Library | Framer Motion (spring physics, staggering) |
| Icon Library | Lucide React (25+ icons) |
| CSS Framework | Tailwind CSS (3.4.16) |
| Build Tool | Vite (7.3.1) |
| Runtime | React 18.3.1 + React Router 7.9.2 |
| HTTP Client | Axios 1.8.4 |
| Database | PostgreSQL (Prisma ORM) |
| Backend | Express.js + TypeScript |

---

**END OF ANALYSIS**

This comprehensive report provides a complete blueprint for redesigning or updating the Salon Ru Zero One UI/UX system. All components, patterns, color schemes, typography, animations, and user flows are documented in detail.

