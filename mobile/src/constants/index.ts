export const API_BASE_URL = __DEV__
  ? 'http://192.168.8.184:3000/api/v1'  // Your local Wi-Fi IP
  : 'https://your-salon-api.railway.app/api/v1';

export const SOCKET_URL = __DEV__
  ? 'http://192.168.8.184:3000'
  : 'https://your-salon-api.railway.app';

export const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  secondary: '#7C3AED',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',

  text: '#0F172A',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  textWhite: '#FFFFFF',

  border: '#E2E8F0',
  borderDark: '#CBD5E1',

  // Status colors
  statusAvailable: '#10B981',
  statusBooked: '#3B82F6',
  statusInService: '#F59E0B',
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
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
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
