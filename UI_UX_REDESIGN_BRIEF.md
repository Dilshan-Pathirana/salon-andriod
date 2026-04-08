# SALON APP - UI/UX REDESIGN BRIEF

**Application Name:** Salon Ru Zero One  
**Type:** Mobile-First PWA (Progressive Web App) for Salon Booking & Management  
**Target Users:** Salon Clients, Admin Staff, Salon Managers  
**Platform:** React 18 + TypeScript + Vite + Tailwind CSS  
**Current Status:** Production-Ready with PWA capabilities

---

## EXECUTIVE OVERVIEW FOR DESIGN AI

This is a **complete modern salon booking and queue management application** with dual interfaces (CLIENT and ADMIN modes). The app serves three user types:
1. **Visitors** - Browse services and book appointments
2. **Clients** - Manage their appointments, view queue position, access profile
3. **Admins** - Manage services, teams, schedules, queues, and client data

The design philosophy is **mobile-first minimalism with warm accent colors, smooth animations, and real-time feedback mechanisms.**

---

## CURRENT DESIGN SYSTEM

### Color Palette
```
PRIMARY COLORS:
- Emerald Green: #10B981 (primary CTAs, success states, badges)
- Teal: #14B8A6 (secondary accent, secondary buttons, highlights)
- Orange: #F97316 (alerts, warnings, "now serving" states)

NEUTRAL GRAYS:
- Dark: #1F2937 (text, headings)
- Medium: #6B7280 (secondary text, borders)
- Light: #E5E7EB (dividers, backgrounds)
- Very Light: #F9FAFB (page background, card backgrounds)

SEMANTIC COLORS:
- Success: #10B981 (confirmed, completed)
- Warning: #F97316 (alert, important)
- Error: #EF4444 (cancellation, errors)
- Info: #3B82F6 (informational badges)
```

### Typography
```
HEADINGS:
- Page Titles: 32px, 700 weight (Hero/Landing)
- Section Titles: 24px, 600 weight
- Card Titles: 18px, 600 weight
- Subsections: 16px, 600 weight

BODY TEXT:
- Primary Text: 16px, 400 weight (normal reading)
- Secondary Text: 14px, 400 weight (captions, helper text)
- Small Text: 12px, 400 weight (metadata, timestamps)

FONT FAMILY: System fonts (san-serif), fallback to -apple-system
```

### Spacing System (Tailwind)
```
16px base unit:
- xs: 4px (gap between elements)
- sm: 8px (padding within components)
- md: 16px (padding, margins between sections)
- lg: 24px (section spacing)
- xl: 32px (page margins)
- 2xl: 48px (major content spacing)
```

### Design Tokens
```
BORDER RADIUS:
- sm: 4px (input fields, small buttons)
- md: 8px (cards, modals)
- lg: 12px (larger containers)
- full: 50px/999px (badges, rounded buttons, circles)

SHADOWS:
- sm: 0 1px 2px rgba(0,0,0,0.05)
- md: 0 4px 6px rgba(0,0,0,0.1) (cards)
- lg: 0 10px 15px rgba(0,0,0,0.1) (modals)

TRANSITIONS:
- sm: 150ms ease-in-out (hover states)
- md: 300ms ease-in-out (page transitions)
- lg: 500ms ease-out (entrance animations)
```

---

## NAVIGATION ARCHITECTURE

### Layout Structure
```
┌─────────────────────────────────┐
│  TOP BAR (Header)               │
│  Logo | Hamburger Menu          │
├─────────────────────────────────┤
│                                 │
│  PAGE CONTENT                   │
│  (Scrollable area)              │
│                                 │
├─────────────────────────────────┤
│  BOTTOM NAVIGATION (5 tabs)     │
│  Home | Services | Appointments │
│  Queue | Profile                │
└─────────────────────────────────┘
```

### Top Bar
- **Logo/Title:** Left-aligned
- **Hamburger Menu:** Right-aligned, expandable overlay menu
- **Admin Badge:** Shows when in ADMIN mode
- **Height:** 64px (fixed position)
- **Sticky:** Stays at top during scroll

### Bottom Navigation
**5 Persistent Tabs:**
1. **Home** (lucide-react: Home icon) - Landing/Dashboard
2. **Services** (lucide-react: Wrench icon) - Service catalog
3. **Appointments** (lucide-react: Calendar icon) - User appointments list
4. **Queue** (lucide-react: Users icon) - Live queue display
5. **Profile** (lucide-react: User icon) - User profile/settings

**Properties:**
- Fixed position at bottom
- Height: 64px
- Active tab: Emerald green icon + label
- Inactive: Gray icon + label
- Always visible except during keyboard input

### Hamburger Menu (Overlay)
- Appears on menu icon click
- Slides from top
- Semi-transparent backdrop
- Menu items:
  - User greeting (if logged in)
  - "Admin Mode" toggle (if ADMIN role)
  - "Switch to Client Mode" (if in ADMIN)
  - "Logout"
  - "About" / "Help"
  - About the app section

---

## PAGE LAYOUTS & USER FLOWS

### PUBLIC/CLIENT PAGES

#### 1. HOME PAGE (Landing)
**Purpose:** Welcome screen, service highlights, CTA to booking

**Layout:**
```
┌──────────────────────────────┐
│ HERO SECTION                 │ (Image + tagline, animated)
│ "Book Your Perfect Look"     │
├──────────────────────────────┤
│ QUICK STATS (animated cards) │
│ - 500+ Happy Customers       │
│ - 50+ Services Available     │
│ - Expert Team Members        │
├──────────────────────────────┤
│ SERVICE SPOTLIGHT            │
│ (3-4 featured services)      │
│ Cards with image, price      │
├──────────────────────────────┤
│ TESTIMONIALS SECTION         │
│ (scrollable carousel)        │
├──────────────────────────────┤
│ CTA: "BOOK NOW"             │ (Emerald, full-width)
└──────────────────────────────┘
```

**Components Used:**
- HeroSection (animated background, gradient overlay)
- ServiceCard (image, name, price, rating)
- TestimonialCard (review, avatar, name)
- Button (primary CTA)

**Data:** Fetches featured services from API

**Interactions:**
- Click service → navigate to booking
- Click "Book Now" → scroll to booking form
- Smooth scroll animations

---

#### 2. SERVICES PAGE
**Purpose:** Browse all available salon services

**Layout:**
```
┌──────────────────────────────┐
│ SEARCH/FILTER BAR            │
│ (Search by name, sort)       │
├──────────────────────────────┤
│ SERVICE GRID                 │
│ (2 columns, mobile)          │
│ ┌─────────┐ ┌─────────┐     │
│ │ Service │ │ Service │     │
│ │ Card    │ │ Card    │     │
│ └─────────┘ └─────────┘     │
│ ┌─────────┐ ┌─────────┐     │
│ │ Service │ │ Service │     │
│ │ Card    │ │ Card    │     │
│ └─────────┘ └─────────┘     │
└──────────────────────────────┘
```

**ServiceCard Component:**
```
┌─────────────────────┐
│ SERVICE IMAGE       │
│ (4:3 aspect ratio)  │
├─────────────────────┤
│ Service Name        │
│ Price: Rs. 2,500    │
│ Duration: 30 mins   │
│ ⭐ 4.8 (25 reviews) │
├─────────────────────┤
│ [View Details]      │
└─────────────────────┘
```

**Interactions:**
- Click service → view details modal
- Search updates list in real-time
- Animated loading skeletons while fetching

---

#### 3. BOOKING PAGE
**Purpose:** Create new appointment

**Layout:**
```
┌──────────────────────────────┐
│ SELECTED SERVICE DISPLAY     │
│ (shows chosen service card)  │
├──────────────────────────────┤
│ DATE PICKER                  │
│ (Calendar, next 30 days)     │
│ ┌──────────────────────────┐ │
│ │ M  T  W  T  F  S  S      │ │
│ │ 7  8  9  10 11 12 13     │ │
│ │ 14 15 16 17 18 19 20     │ │
│ │ ✓21✓ 22 23 24 25 26 27   │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ TIME SLOT PICKER             │
│ (Available times from API)   │
│ ┌──────┐ ┌──────┐ ┌──────┐  │
│ │ 09:30│ │ 10:00│ │ 10:30│  │
│ └──────┘ └──────┘ └──────┘  │
│ ┌──────┐ ┌──────┐ ┌──────┐  │
│ │ 11:00│ │ 11:30│ │ 12:00│  │
│ └──────┘ └──────┘ └──────┘  │
├──────────────────────────────┤
│ CUSTOMER INFO (if not logged) │
│ [First Name]                 │
│ [Phone Number]               │
├──────────────────────────────┤
│ [CONFIRM BOOKING] (full-width)
└──────────────────────────────┘
```

**Interactions:**
- Calendar flips through months
- Available times update based on selected date
- Selected date/time highlighted in emerald
- Submit → confirmation modal with booking details
- Real-time validation of phone number

---

#### 4. APPOINTMENTS PAGE
**Purpose:** View user's booked appointments

**Layout:**
```
┌──────────────────────────────┐
│ APPOINTMENT STATUS TABS       │
│ [Upcoming] [Past] [Cancelled]│
├──────────────────────────────┤
│ APPOINTMENT CARD              │
│ ┌──────────────────────────┐ │
│ │ SERVICE: Hair Cut        │ │
│ │ 📅 Apr 15, 2026 | 10:30 AM│ │
│ │ 💇 John (Stylist)        │ │
│ │ ⏱️ 30 minutes             │ │
│ │ Price: Rs. 1,500         │ │
│ │                          │ │
│ │ [Reschedule] [Cancel]    │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ SERVICE: Facial          │ │
│ │ 📅 Apr 10, 2026 | 02:00 PM│ │
│ │ 👩 Emma (Esthetician)    │ │
│ │ ⏱️ 45 minutes             │ │
│ │ Price: Rs. 2,000         │ │
│ │ ✓ Completed              │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**AppointmentCard Component:**
```
Status Badge (top-right):
- Upcoming: Blue "UPCOMING"
- In Service: Orange "IN SERVICE"
- Completed: Green "COMPLETED"
- No Show: Red "NO SHOW"
- Cancelled: Gray "CANCELLED"
```

**Interactions:**
- Swipe between tabs
- Click appointment → view full details modal
- "Reschedule" → navigate to booking page
- "Cancel" → confirmation dialog with reason field

---

#### 5. QUEUE PAGE
**Purpose:** Show live queue position and estimated wait time

**Layout:**
```
┌──────────────────────────────┐
│ QUEUE STATUS (animated)      │
│ "You are #5 in queue"        │
│ "Est. wait: 45 minutes"      │
├──────────────────────────────┤
│ LIVE POSITION INDICATOR      │
│ ┌──────────────────────────┐ │
│ │ ⭕ 1 - Lisa (In Service) │ │
│ │ #2 - Mark (3 mins wait)  │ │
│ │ #3 - Sarah (7 mins wait) │ │
│ │ #4 - James (11 mins wait)│ │
│ │ 🔵 #5 - YOU              │ │
│ │ #6 - Emily (24 mins)     │ │
│ │ #7 - David (28 mins)     │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ TIPS & INFO                  │
│ "Come early if possible"     │
│ "Notify staff when you       │
│  arrive for your appointment"│
└──────────────────────────────┘
```

**Features:**
- Real-time updates (WebSocket or polling)
- Current serving position highlighted in orange
- User position highlighted in teal
- Countdown timer for estimated wait
- Animated entry/exit when queue changes

**Interactions:**
- Pull-to-refresh on mobile
- Live updates every 5 seconds
- Green checkmark when it's nearly your turn

---

#### 6. PROFILE PAGE
**Purpose:** User account management and settings

**Layout:**
```
┌──────────────────────────────┐
│ PROFILE HEADER               │
│ Avatar (circular, 80px)      │
│ "Hello, Sarah!"              │
│ sarah@email.com              │
├──────────────────────────────┤
│ PROFILE INFORMATION          │
│ ┌──────────────────────────┐ │
│ │ Profile Section Header   │ │
│ │ [Edit Button]            │ │
│ ├──────────────────────────┤ │
│ │ First Name: Sarah        │ │
│ │ Last Name: Johnson       │ │
│ │ Phone: +94 701234567     │ │
│ │ Email: sarah@email.com   │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ SECURITY SETTINGS            │
│ ┌──────────────────────────┐ │
│ │ Change Password          │ │
│ │ [Current Password]       │ │
│ │ [New Password]           │ │
│ │ [Confirm Password]       │ │
│ │ [Update Password] (green)│ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ PREFERENCES                  │
│ ☑️ Email Notifications      │
│ ☑️ SMS Reminders            │
│ ☐ Marketing Emails          │
├──────────────────────────────┤
│ DANGER ZONE                  │
│ [Logout]                     │
│ [Delete Account]             │
└──────────────────────────────┘
```

**Interactions:**
- Click "Edit" → toggle edit mode (inline editing)
- Password validation (min 8 chars, must have number)
- Success toast notification after updates
- Deactivate account → confirmation with email verification

---

### ADMIN PAGES

#### 7. ADMIN DASHBOARD
**Purpose:** Overview of salon operations

**Layout:**
```
┌──────────────────────────────┐
│ QUICK STATS (animated cards) │
│ ┌────────┐ ┌────────┐        │
│ │ 12     │ │ 8      │        │
│ │Bookings│ │In Queue│        │
│ └────────┘ └────────┘        │
│ ┌────────┐ ┌────────┐        │
│ │ 156    │ │ 4.8⭐  │        │
│ │Clients │ │ Rating │        │
│ └────────┘ └────────┘        │
├──────────────────────────────┤
│ TODAY'S APPOINTMENTS         │
│ (timeline view)              │
│ 09:30 - Hair Cut (Lisa)      │
│ ✓ COMPLETED                  │
│ 10:15 - Facial (Sarah)       │
│ 🟡 IN SERVICE                │
│ 11:00 - Manicure (Emily)     │
│ ⏱️ WAITLISTED                 │
├──────────────────────────────┤
│ REVENUE TODAY                │
│ ₨ 42,500 (12 services)       │
│ Average: ₨ 3,541 per service │
├──────────────────────────────┤
│ QUICK ACTIONS                │
│ [Mark In Service] [Complete] │
│ [No Show] [Reschedule]       │
└──────────────────────────────┘
```

**Components:**
- StatCard (number, label, trend arrow)
- AppointmentTimeline (visual timeline of bookings)
- ActionButtons (quick admin actions)

---

#### 8. ADMIN APPOINTMENT MANAGEMENT
**Purpose:** View and manage all appointments

**Layout:**
```
┌──────────────────────────────┐
│ FILTERS & SEARCH             │
│ [Search by name] [Date range]│
│ Status: [All] [Upcoming]     │
│        [In Service] [Completed]
├──────────────────────────────┤
│ APPOINTMENTS TABLE           │
│ (Scrollable)                 │
│ ┌──────────────────────────┐ │
│ │ Name    │ Service │ Time │ │
│ ├─────────┼─────────┼──────┤ │
│ │ Lisa    │ Haircut │ 09:30│ │
│ │ Sarah   │ Facial  │ 10:15│ │
│ │ Emily   │ Manicure│ 11:00│ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ APPOINTMENT DETAILS (modal)  │
│ Name: Sarah Johnson          │
│ Service: Facial (45 mins)    │
│ Date/Time: Apr 12, 10:15 AM │
│ Team Member: Emma Johnson    │
│ Phone: +94 701234567         │
│ Price: Rs. 2,000             │
│ Status: IN SERVICE           │
│                              │
│ [Reschedule] [Complete]      │
│ [No Show] [Cancel] [Delete]  │
└──────────────────────────────┘
```

---

#### 9. ADMIN QUEUE MANAGEMENT
**Purpose:** Reorder and manage live queue

**Layout:**
```
┌──────────────────────────────┐
│ LIVE QUEUE (drag-to-reorder) │
│                              │
│ <drag handle> #1 Lisa        │ (orange badge - IN SERVICE)
│ <drag handle> #2 Mark        │
│ <drag handle> #3 Sarah       │
│ <drag handle> #4 James       │
│ <drag handle> #5 Emily       │
│ <drag handle> #6 David       │
│                              │
│ [Conclude Queue]             │ (auto-complete all)
│ [Refresh] [Start Session]    │
└──────────────────────────────┘
```

**Interactions:**
- Drag queue items to reorder (touch & mouse)
- Right-click for context menu (remove, mark complete)
- Real-time sync with other admin devices

---

#### 10. ADMIN SERVICE MANAGEMENT
**Purpose:** Manage salon services

**Layout:**
```
┌──────────────────────────────┐
│ [+ ADD NEW SERVICE]          │ (emerald button)
├──────────────────────────────┤
│ SERVICE LIST (card view)     │
│ ┌─────────────────────────┐  │
│ │ [Image] Hair Cut        │  │
│ │ Price: Rs. 1,500        │  │
│ │ Duration: 30 mins       │  │
│ │ [Edit] [Delete]         │  │
│ └─────────────────────────┘  │
│ ┌─────────────────────────┐  │
│ │ [Image] Facial          │  │
│ │ Price: Rs. 2,000        │  │
│ │ Duration: 45 mins       │  │
│ │ [Edit] [Delete]         │  │
│ └─────────────────────────┘  │
└──────────────────────────────┘
```

**Service Form Modal:**
```
┌──────────────────────────────┐
│ Edit Service                 │
├──────────────────────────────┤
│ [Service Name]               │
│ [Price in Rs.]               │
│ [Duration in minutes]        │
│ [Description]                │
│ [Category dropdown]          │
│                              │
│ [Save] [Cancel]              │
└──────────────────────────────┘
```

---

#### 11. ADMIN USER MANAGEMENT
**Purpose:** Manage salon staff and clients

**Layout:**
```
┌──────────────────────────────┐
│ TEAM MEMBERS / STAFF         │
│ [+ Add Team Member]          │
├──────────────────────────────┤
│ STAFF LIST                   │
│ ┌──────────────────────────┐ │
│ │ Avatar Emma Johnson      │ │
│ │ Role: Stylist            │ │
│ │ Phone: +94 701234567     │ │
│ │ [Edit] [Deactivate]      │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Avatar John Smith        │ │
│ │ Role: Beautician         │ │
│ │ Phone: +94 701234567     │ │
│ │ [Edit] [Deactivate]      │ │
│ └──────────────────────────┘ │
│                              │
│ CLIENTS / CUSTOMERS          │
│ (searchable, sortable)       │
│ ┌──────────────────────────┐ │
│ │ Sarah Johnson            │ │
│ │ Phone, Email, Join Date  │ │
│ │ Bookings: 5              │ │
│ │ [View Details] [Message] │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

---

#### 12. ADMIN SESSION MANAGEMENT
**Purpose:** Open/close salon hours, set availability

**Layout:**
```
┌──────────────────────────────┐
│ TODAY'S SESSION              │
│ ╔════════════════════════════╗
│ ║ ✓ SESSION OPEN             ║
│ ║ Opened at: 09:00 AM        ║
│ ╚════════════════════════════╝
├──────────────────────────────┤
│ SCHEDULE MANAGEMENT          │
│ Date: [Apr 12, 2026] ✓       │
│                              │
│ Working Hours:               │
│ [Start Time] 09:00 AM        │
│ [End Time]   06:00 PM        │
│                              │
│ [Update Schedule]            │
├──────────────────────────────┤
│ AVAILABLE TIME SLOTS         │
│ (Generate from working hours)│
│ 09:30, 10:00, 10:30, 11:00  │
│ 11:30, 12:00, 02:00 PM ...   │
│                              │
│ [Update Slots] [Regenerate]  │
├──────────────────────────────┤
│ [Close Session] (red button) │
│ OR [End for Today]           │
└──────────────────────────────┘
```

---

## FORM COMPONENTS & PATTERNS

### Input Fields
```
Text Input:
┌──────────────────────────────┐
│ Field Label                  │
│ ┌──────────────────────────┐ │
│ │ Placeholder text...      │ │
│ └──────────────────────────┘ │
│ Helpertext or error message  │
└──────────────────────────────┘

Validation States:
- Default: Gray border, placeholder
- Focus: Emerald border, shadow
- Error: Red border, red error text
- Success: Green border, green checkmark
```

### Form Example (Booking)
```
SERVICE SELECTION:
[Service Name Input] (searchable dropdown)

DATE PICKER:
Calendar with disabled dates (unavailable days)
Selected: Emerald highlight

TIME PICKER:
Grid of time buttons
Selected: Emerald background
Disabled: Gray, no interaction

CUSTOMER INFO:
[First Name] (required)
[Phone Number] (required, validated)

CTA BUTTON:
[CONFIRM BOOKING] (emerald, full-width, disabled until all fields filled)
```

### Validation Rules
```
Phone Number: ^(0\d{9}|\+94\d{9})$
  Valid: 0701234567 or +94701234567
  
Name Fields: 1-50 characters, trimmed
  
Password: Min 8 chars, must contain number
  
Email: Standard email regex
```

---

## COMPONENT LIBRARY

### Reusable Components

#### 1. ServiceCard
```
Props:
- id: string
- name: string
- price: number
- duration: number
- image?: string
- rating?: number
- onSelect?: () => void

States:
- Default (hover: slight scale + shadow)
- Loading (skeleton)
- Selected (emerald border)
```

#### 2. AppointmentCard
```
Props:
- id: string
- serviceName: string
- date: Date
- time: string
- teamMember?: string
- price: number
- status: 'UPCOMING' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED'
- onReschedule?: () => void
- onCancel?: () => void

Visual Indicators:
- Status badge (top-right)
- Timeline icon (left side)
- Date/time (center)
- Actions (bottom)
```

#### 3. StatCard
```
Props:
- label: string
- value: string | number
- icon?: ReactNode
- trend?: 'up' | 'down'
- color?: 'emerald' | 'teal' | 'orange'

Animation: Fade-in on load, number counter animation
```

#### 4. Button Variants
```
Primary: Emerald background, white text, full-width or auto
Secondary: Teal border, teal text, transparent background
Danger: Red background, white text
Ghost: Transparent, gray text
Icon: Just icon, no text

States:
- Default (cursor: pointer)
- Hover (shadow increase, slight scale)
- Active (darker shade)
- Disabled (opacity 0.5, cursor: not-allowed)
- Loading (spinner animation)
```

#### 5. Badge
```
Status Badges:
- UPCOMING: Blue #3B82F6
- IN_SERVICE: Orange #F97316
- COMPLETED: Green #10B981
- CANCELLED: Gray #6B7280
- NO_SHOW: Red #EF4444

Style: Rounded corners (full), padding, small font
```

#### 6. Modal/Dialog
```
Structure:
- Backdrop (semi-transparent black, click to close)
- Modal container (white, rounded corners, shadow)
- Header (title, close button)
- Body (content)
- Footer (action buttons)

Animation: Fade in backdrop, scale up modal (spring physics)
```

#### 7. Toast Notification
```
Variants:
- Success (green): "Booking confirmed!"
- Error (red): "Failed to cancel appointment"
- Info (blue): "Session started"
- Warning (orange): "Queue is long"

Position: Bottom-right or top-center
Animation: Slide in from edge, auto-dismiss after 3 seconds
```

#### 8. Loading Skeleton
```
Service Card Skeleton:
┌─────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ (gray animated pulse)
│ ▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓▓ │
└─────────────────────┘

Animation: Shimmer effect (left to right)
```

---

## ANIMATIONS & INTERACTIONS

### Page Transitions
- **Fade + Slide Up:** New pages fade in while sliding up from bottom (300ms, easeOut)
- **Slide Out:** Exiting pages slide down and fade out

### Component Entrance Animations
- **Stagger Effect:** List items animate in sequence (50ms delay between each)
- **Bounce Scale:** Buttons/cards scale from 0.9 to 1.0 (spring physics)
- **Fade In:** Text and backgrounds fade in smoothly

### Interactive Animations
- **Hover Effects:** 
  - Cards: shadow grows, slight scale up (1.02x)
  - Buttons: background darkens, shadow increases
  
- **Click Feedback:**
  - Brief scale-down animation (0.98x) on press
  - Ripple effect (optional) on button press
  
- **State Changes:**
  - Status badge: pulse animation when transitioning
  - Loading spinner: continuous rotation

### Scroll Animations
- **Parallax:** Hero image moves slower than scrolling
- **Fade:** Elements fade in as they come into view
- **Blur:** Background content blurs during modal open

### Gesture Interactions (Mobile)
- **Swipe Between Tabs:** Smooth horizontal slide transition
- **Pull-to-Refresh:** Spring-back animation on queue refresh
- **Drag to Reorder:** Elevation shadow while dragging, snap-back on drag end

---

## RESPONSIVE DESIGN PATTERNS

### Breakpoints
```
Mobile: 0px - 640px (Portrait)
Tablet: 641px - 1024px (Portrait/Landscape)
Desktop: 1025px+ (Full width)

PRIMARY TARGET: Mobile (375px - 428px)
```

### Layout Adjustments
```
MOBILE (1 column):
- Full-width cards with padding
- Bottom navigation always visible
- Modals: Full-screen or bottom sheet
- Tables: Horizontal scroll or card view

TABLET (2 columns):
- Service grid: 2 columns
- Admin lists: 2-column layout
- Modals: Centered, 80% width
- Tables: More visible columns

DESKTOP (3+ columns):
- Service grid: 3-4 columns
- Admin tables: Full table view
- Sidebar navigation (optional)
- Wider modals
```

### Touch Optimization
- **Minimum Touch Target:** 44x44px (Apple recommendation)
- **Button Padding:** 12px vertical, 24px horizontal minimum
- **Spacing:** 16px minimum between interactive elements
- **Font Size:** 16px minimum to avoid mobile zoom on focus

### Safe Area Handling (iPhone Notch/Dynamic Island)
- Top padding: 16px (below status bar)
- Bottom padding: 16px on bottom nav areas
- Side padding: 16px on all sides (avoid edge)

---

## REAL-TIME FEATURES (WebSocket Ready)

### Live Queue Updates
- Queue position updates every 5 seconds
- Animation when user moves up/down
- "Now serving" notification with sound/vibration

### Appointment Status Changes
- Admin marks appointment complete
- Client notification received in real-time
- Status badge animates to green

### Notification System
- **Appointment Reminder:** 1 hour before
- **Queue Position Alert:** When 2 spots away
- **Service Ready:** When queue moves to you
- **Admin Alerts:** When new booking created

---

## PWA FEATURES

### Install Prompt
- Bottom banner: "Install App" → Install button
- Short name: "Salon Ru"
- App icon: 192x192 and 512x512 PNG

### Offline Capabilities
- Service Worker caches:
  - HTML/CSS/JS bundles
  - API responses (last 30 days of data)
  - Images (recent services, appointments)
  
### Splash Screen
- App icon (192x192)
- App name
- Background color: #F9FAFB (light gray)

### iOS Support
- Apple status bar style: black-translucent
- Safe area meta tag
- Home screen icon: 180x180 PNG

---

## ACCESSIBILITY FEATURES

### ARIA Labels
```
- Buttons: aria-label="Book Appointment"
- Links: aria-label="Navigate to Services"
- Icons: aria-hidden when decorative
- Form inputs: Associated labels
- Live regions: aria-live="polite" for notifications
```

### Keyboard Navigation
- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys in modal dialogs
- Escape to close modals
- Focus visible indicators (outline or border)

### Color Contrast
```
Minimum WCAG AA contrast ratio: 4.5:1
- Text on light bg: #1F2937 (dark gray)
- Text on emerald bg: White
- Links: Underlined or color + underline on hover
```

### Semantic HTML
- `<button>` for buttons (not `<div onClick>`)
- `<a>` for navigation links
- `<form>` for forms
- `<main>`, `<nav>`, `<header>`, `<footer>` landmarks
- `<input type="tel">` for phone inputs
- `<input type="email">` for email inputs

---

## API INTEGRATION PATTERNS

### Endpoints Used (40+ total)
```
AUTHENTICATION:
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh (auto-called on 401)
POST /api/auth/logout

BOOKINGS & APPOINTMENTS:
GET /api/services
GET /api/time-slots?date=YYYY-MM-DD
POST /api/bookings (public booking)
POST /api/appointments (authenticated)
POST /api/appointments/reserve (admin only)
GET /api/appointments/my
PUT /api/appointments/:id/cancel
PUT /api/appointments/:id/complete (admin)
PUT /api/appointments/:id/no-show (admin)
DELETE /api/appointments/:id (admin)

QUEUE:
GET /api/queue
PUT /api/queue/reorder (admin, drag reorder)

USER PROFILE:
GET /api/users/profile
PUT /api/users/profile (update profile)
PUT /api/users/profile (change password endpoint)

ADMIN:
GET /api/users (list all users)
POST /api/users (create user)
PUT /api/users/:id (edit user)
DELETE /api/users/:id
PUT /api/users/:id/deactivate
PUT /api/users/:id/activate

SCHEDULE & SESSION:
GET /api/schedule/available
GET /api/schedule
PUT /api/schedule (update schedule)
POST /api/session/open
PUT /api/session/close
GET /api/session/dashboard (admin stats)

SERVICES:
GET /api/services (all services)
POST /api/services (admin create)
PUT /api/services/:id (admin edit)
DELETE /api/services/:id (admin delete)

TEAM:
GET /api/team
```

### Request/Response Pattern
```
SUCCESS RESPONSE (2xx):
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

ERROR RESPONSE (4xx, 5xx):
{
  "success": false,
  "error": "Validation failed",
  "details": { ... }
}

LOADING STATE:
- Show skeleton loaders while fetching
- Disable buttons/inputs during submission
- Show inline spinner in buttons
```

### Authentication Flow
```
1. Login → Receive accessToken + refreshToken
2. Store tokens in memory (localStorage as backup)
3. Include accessToken in Authorization header
4. Auto-refresh: If 401 → call POST /auth/refresh
5. Logout: Clear tokens, redirect to home
6. Role-based: ADMIN or CLIENT (checked on client + server)
```

---

## STATE MANAGEMENT

### React Hooks Pattern
```
useState: Form inputs, UI toggles, modals
useEffect: API calls, setup/cleanup
useContext: User auth state, theme
useMemo: list filtering, sorting
useCallback: Memoized handlers for performance
```

### Persisted State
```
- User authentication: Memory + localStorage
- User preferences: localStorage (notifications, theme)
- Recent searches: sessionStorage
- Form drafts: sessionStorage (auto-clear on reparse)
```

### Data Fetching
```
- Axios instance with interceptors for auth
- Request: Add `Authorization: Bearer {token}`
- Response: On 401, refresh and retry
- Error: Toast notification + logged to console
- Success: Optional toast confirmation
```

---

## UX PATTERNS & MICRO-INTERACTIONS

### Booking Flow (Key User Journey)
```
1. User clicks "Book Now"
2. If logged in → go to step 3
   If not logged in → show login/register modal
3. Select service → Navigate to booking page
4. Choose date → Calendar picker with disabled dates
5. Choose time → Grid of available time slots
6. Confirm → Booking confirmation modal
7. Success → Toast notification, navigate to appointments
```

### Cancellation Flow (Safety)
```
1. User clicks "Cancel" on appointment
2. Confirmation dialog appears: "Are you sure?"
3. Optional: Reason dropdown (if provided by API)
4. Confirm → Loading spinner
5. Success → Notification, appointment moves to "Cancelled" tab
```

### Queue Position Logic
```
- Update every 5 seconds (polling or WebSocket)
- Calculate estimated wait: (position count) * (avg service duration)
- Animate position number change (bounce effect)
- When position = 1: Green highlight + "You're next!" notification
- When called: Navigate to "Now Serving" state
```

### Error Handling
```
- Network error → "Check your connection, try again"
- Validation error → Highlight input field, show error message
- Server error → "Something went wrong, try again later"
- 401 Unauthorized → Auto-refresh, if fails → redirect to login
- 403 Forbidden → "You don't have permission"
```

---

## MOBILE OPTIMIZATION SPECIFICS

### Viewport & Meta Tags
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="true">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="theme-color" content="#10B981">
```

### Touch Gestures Supported
```
- Tap: Select, navigate
- Double-tap: Zoom text (16px font prevents auto-zoom)
- Swipe left/right: Tab navigation
- Long-press: Context menu (admin drag-to-reorder)
- Pinch: Zoom (allowed)
```

### Performance Optimizations
```
- Code splitting: Lazy load admin pages
- Image optimization: Webp format with fallback
- Lazy loading: Images load on scroll
- Critical CSS: Inline above-fold styles
- Minification: All JS/CSS minified in production
```

### Viewport Optimization
```
Landscape orientation: Restricted (portrait-only app)
Safe areas: Padding for notch + home indicator
Fullscreen: Status bar always visible
Maximum zoom: Prevents pinch zoom on buttons (user-scalable=no)
```

---

## CURRENT DESIGN LANGUAGE SUMMARY

### Visual Hierarchy
1. **Primary CTA:** Emerald buttons, full-width, bottom of screen
2. **Secondary CTA:** Teal buttons or outlined buttons
3. **Information:** Dark gray text on light backgrounds
4. **Emphasis:** Orange for alerts/status, emerald for success
5. **De-emphasis:** Light gray text, smaller font

### Design Principles
- **Minimalism:** Clean, uncluttered layouts
- **Clarity:** Clear labels, obvious interactive elements
- **Consistency:** Same patterns across all pages
- **Feedback:** Immediate response to user actions
- **Trust:** Professional design, secure authentication

### Emotional Tone
- Friendly, welcoming, professional
- Empowering (users are in control)
- Efficient (quick bookings, clear queue)
- Trustworthy (secure, authenticated)

---

## DESIGN CONSTRAINTS & CONSIDERATIONS

### Device Compatibility
- **Min iOS:** iOS 12+ (iPhone 6S+)
- **Min Android:** Android 8+
- **Browsers:** Chrome, Firefox, Safari, Edge (latest)

### Network Conditions
- **Optimization for:** 3G/4G networks
- **Offline:** Basic offline support (show cached data)
- **Slow Network:** Progressive image loading, skeleton screens

### Accessibility Requirements
- **WCAG 2.1 AA minimum**
- **Screen reader support:** All interactive elements must be labeled
- **Keyboard navigation:** Tab through all interactive elements
- **Color not sole indicator:** Status must be shown with text + color

### Performance Targets
- **Page load:** < 3 seconds (3G)
- **First Contentful Paint:** < 1 second
- **Time to Interactive:** < 5 seconds
- **Lighthouse Score:** > 90

---

## SUMMARY FOR DESIGN AI

This salon booking application is a **modern, animation-rich, mobile-first PWA** with a focus on **real-time queue management and seamless appointment booking**. 

**Target for redesign:**
- Keep the dual role (CLIENT/ADMIN) system
- Maintain the mobile-first, bottom-nav structure
- Preserve emerald/teal/orange color scheme (or suggest alternatives)
- Sustain smooth animations and micro-interactions
- Keep form simplicity and validation patterns
- Preserve real-time queue visualization
- Maintain admin dashboard readability

**Flexibility:**
- Can redesign color palette while maintaining warm aesthetic
- Can reorganize admin features with grid/sidebar layouts
- Can modernize animations (glassmorphism, neumorphism, etc.)
- Can add new visual patterns (cards, gradients, illustrations)
- Can improve form UX with new patterns
- Can redesign admin tables/lists for desktop

**Key Requirements:**
- Must remain fully responsive (mobile-first)
- Must support touch interactions
- Must preserve all functionality
- Must maintain accessibility standards
- Must support PWA installation

---

## FILES TO INSPECT IN PROJECT

For full context, these files implement the current design:

**Frontend Structure:**
- `web/src/App.tsx` - Main router and layout
- `web/src/components/` - All reusable components
- `web/src/pages/` - All page implementations
- `web/src/lib/api.ts` - API client and constants
- `web/src/lib/types.ts` - TypeScript interfaces
- `web/tailwind.config.js` - Design tokens and theme
- `web/index.css` - Global styles
- `web/vite.config.ts` - Build configuration with PWA

**Backend Routes (for API context):**
- `backend/src/routes/` - All API endpoint definitions
- `backend/src/types/index.ts` - Shared TypeScript types

**Configuration:**
- `web/package.json` - Dependencies (React, Tailwind, Framer Motion, etc.)
- `.gitignore`, `.env.example` - Environment variables

---

## READY FOR AI REDESIGN

This brief provides everything an AI design system needs to:
1. ✅ Understand app purpose and user flows
2. ✅ Grasp current visual design language
3. ✅ Know component patterns and interactions
4. ✅ Understand responsive requirements
5. ✅ See color palette and typography
6. ✅ Know animation patterns
7. ✅ Understand accessibility needs
8. ✅ Know performance constraints
9. ✅ See current admin interface design
10. ✅ Know PWA and mobile-specific features

**You can now paste this brief into any UI/UX design AI and request a complete redesign of the interface while maintaining full functionality.**
