/**
 * AtysPro Design System — theme aligné sur globals.css dashboard
 */

import { colors } from './colors';

export const theme = {
  colors,
  gradients: {
    primary: ['#1A56DB', '#7c3aed'] as const,
    success: ['#16A34A', '#059669'] as const,
    danger: ['#ef4444', '#DC2626'] as const,
    urgent: ['#ef4444', '#DC2626'] as const,
    warning: ['#f59e0b', '#D97706'] as const,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.08,
      shadowRadius: 40,
      elevation: 6,
    },
    cardHover: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 32 },
      shadowOpacity: 0.12,
      shadowRadius: 64,
      elevation: 8,
    },
    button: {
      shadowColor: '#1A56DB',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 4,
    },
  },
} as const;

export type Theme = typeof theme;
