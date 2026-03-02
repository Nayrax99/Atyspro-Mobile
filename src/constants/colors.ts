/**
 * Centralized colors for AtysPro design system
 * Based on backend globals.css - AtysPro Électricien Premium
 */

export const colors = {
  // Primary palette
  atysBlue: '#2563eb',
  atysViolet: '#7c3aed',
  atysYellow: '#fbbf24',
  atysSuccess: '#10b981',
  atysDanger: '#ef4444',

  // Neutrals
  white: '#ffffff',
  black: '#000000',
  slate50: '#f8fafc',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1e293b',
  slate900: '#0f172a',

  // UI
  background: '#f8fafc',
  cardBackground: '#ffffff',
  borderLight: 'rgba(0, 0, 0, 0.06)',
  borderDefault: '#e2e8f0',

  // Text
  textPrimary: '#111111',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  placeholder: '#999999',
} as const;

export type Colors = typeof colors;
