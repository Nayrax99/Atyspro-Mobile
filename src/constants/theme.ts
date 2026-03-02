/**
 * Theme configuration - AtysPro design system
 * Extends colors with gradients and semantic tokens
 */

import { colors } from './colors';

export const theme = {
  colors,
  gradients: {
    primary: ['#2563eb', '#7c3aed'] as const,
    success: ['#10b981', '#059669'] as const,
    danger: ['#ef4444', '#dc2626'] as const,
    urgent: ['#ef4444', '#dc2626'] as const,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
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
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 4,
    },
    cardHover: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 32,
      elevation: 6,
    },
  },
} as const;

export type Theme = typeof theme;
