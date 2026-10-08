import { Platform } from 'react-native';

export const THEME = {
  colors: {
    bg: '#09090b',
    surface: '#121216',
    surfaceElevated: '#1a1a22',
    border: '#27272a',
    borderHighlight: '#3f3f46',
    
    // Emerald phosphor accent
    accent: '#10b981',
    accentLight: '#34d399',
    accentMuted: 'rgba(16, 185, 129, 0.15)',
    accentBorder: 'rgba(16, 185, 129, 0.3)',

    // Alerts
    warning: '#f59e0b',
    warningMuted: 'rgba(245, 158, 11, 0.15)',
    danger: '#f43f5e',
    dangerMuted: 'rgba(244, 63, 94, 0.15)',

    // Text hierarchy
    textPrimary: '#f4f4f5',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
  },
  fonts: {
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
};
