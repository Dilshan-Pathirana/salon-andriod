// Firebase-powered — no API_BASE_URL or SOCKET_URL needed.
// Auth, Firestore, and Cloud Functions are configured in src/config/firebase.ts.

export const COLORS = {
  // Luxury palette — White & Gold style (from style.txt)
  primary: '#C8A24D',                      // luxury-gold
  primaryDark: '#A67C00',                  // luxury-gold darker
  primaryLight: 'rgba(200,162,77,0.15)',   // gold glow

  secondary: '#1C1C1C',                    // luxury-charcoal
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  background: '#0F0F0F',                   // luxury-black
  surface: '#1C1C1C',                      // luxury-charcoal
  surfaceSecondary: '#2A2A2A',             // lighter charcoal

  text: '#F5F5F5',                         // luxury-white
  textSecondary: 'rgba(160,160,160,0.9)',  // luxury-grey
  textLight: 'rgba(160,160,160,0.6)',      // luxury-grey lighter
  textWhite: '#F5F5F5',

  border: 'rgba(200,162,77,0.1)',          // gold-tinted border
  borderDark: 'rgba(200,162,77,0.25)',     // gold-tinted border stronger

  gold: '#C8A24D',
  goldDark: '#A67C00',
  champagne: '#C8A24D',                    // gold accent (was champagne)
  brown: '#A67C00',                        // luxury-goldDark
  green: '#0E3B2E',                        // luxury-emerald
  charcoal: '#1C1C1C',
  luxuryBlack: '#0F0F0F',
  emerald: '#0E3B2E',

  // Status colors
  statusAvailable: '#10B981',
  statusBooked: '#3B82F6',
  statusInService: '#C8A24D',
  statusCompleted: '#6B7280',
  statusCancelled: '#EF4444',
  statusNoShow: '#DC2626',
  statusClosed: '#EF4444',
  statusHoliday: '#A855F7',
} as const;

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
  gold: {
    shadowColor: '#C8A24D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const STATUS_LABELS: Record<string, string> = {
  BOOKED: 'Booked',
  IN_SERVICE: 'In Service',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show',
  OPEN: 'Open',
  CLOSED: 'Closed',
  HOLIDAY: 'Holiday',
} as const;

export const STATUS_COLORS: Record<string, string> = {
  BOOKED: COLORS.statusBooked,
  IN_SERVICE: COLORS.statusInService,
  COMPLETED: COLORS.statusCompleted,
  CANCELLED: COLORS.statusCancelled,
  NO_SHOW: COLORS.statusNoShow,
  OPEN: COLORS.statusAvailable,
  CLOSED: COLORS.statusClosed,
  HOLIDAY: COLORS.statusHoliday,
} as const;
