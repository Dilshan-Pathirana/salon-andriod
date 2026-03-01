export const API_BASE_URL = __DEV__
  ? 'http://192.168.8.184:3000/api/v1'  // Your local Wi-Fi IP
  : 'https://your-salon-api.railway.app/api/v1';

export const SOCKET_URL = __DEV__
  ? 'http://192.168.8.184:3000'
  : 'https://your-salon-api.railway.app';

export const COLORS = {
  // Luxury palette — L'Atelier style
  primary: '#97754D',                      // luxury-gold (warm, muted)
  primaryDark: '#7A5D3A',                  // luxury-gold darker
  primaryLight: 'rgba(151,117,77,0.15)',   // gold glow

  secondary: '#364442',                    // luxury-green
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  background: '#0C100E',                   // luxury-black (olive-tinted)
  surface: '#1A2421',                      // dark green-tinted surface
  surfaceSecondary: '#243230',             // lighter green surface

  text: '#F2F1ED',                         // luxury-white (warm)
  textSecondary: 'rgba(194,173,144,0.7)',  // luxury-muted (champagne)
  textLight: 'rgba(194,173,144,0.5)',      // luxury-muted lighter
  textWhite: '#F2F1ED',

  border: 'rgba(93,68,41,0.25)',           // luxury-brown border
  borderDark: 'rgba(93,68,41,0.4)',        // luxury-brown border stronger

  gold: '#97754D',
  goldDark: '#7A5D3A',
  champagne: '#C2AD90',                    // champagne accent
  brown: '#5D4429',                        // luxury-brown
  green: '#364442',                        // luxury-green
  charcoal: '#1A2421',
  luxuryBlack: '#0C100E',
  emerald: '#364442',

  // Status colors
  statusAvailable: '#10B981',
  statusBooked: '#3B82F6',
  statusInService: '#C2AD90',
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
    shadowColor: '#97754D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
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
