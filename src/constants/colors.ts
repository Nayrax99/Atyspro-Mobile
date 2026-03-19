/**
 * AtysPro Design System — couleurs alignées sur globals.css dashboard
 * Source de vérité : atyspro-backend globals.css variables --ap-*
 */

export const colors = {
  // Primary — SKIN ÉLECTRICIEN (défaut)
  primary: '#1A56DB',        // --ap-primary (était #2563eb)
  primaryHover: '#1648C0',   // --ap-primary-hover
  primaryLight: '#EBF2FF',   // --ap-primary-light
  primaryBorder: '#BFDBFE',  // --ap-primary-border

  // Navy / Dark
  navy: '#0D1B38',           // --ap-navy (sidebar, headers)
  dark: '#0F172A',           // --ap-dark (texte principal)

  // Semantic
  success: '#16A34A',        // --ap-success
  successBg: '#F0FDF4',      // --ap-success-bg
  successBorder: '#BBF7D0',  // --ap-success-border
  danger: '#DC2626',         // --ap-danger
  dangerBg: '#FEF2F2',       // --ap-danger-bg
  dangerBorder: '#FECACA',   // --ap-danger-border
  warning: '#D97706',        // --ap-warning
  warningBg: '#FFFBEB',      // --ap-warning-bg
  warningBorder: '#FDE68A',  // --ap-warning-border
  whatsapp: '#25D366',       // --ap-whatsapp

  // Grays
  background: '#F0F2F7',     // --ap-bg (était #f8fafc)
  white: '#FFFFFF',
  gray100: '#F3F4F6',        // --ap-gray-100
  gray200: '#E5E7EB',        // --ap-gray-200
  gray300: '#D1D5DB',        // --ap-gray-300
  gray400: '#9CA3AF',        // --ap-gray-400
  gray500: '#6B7280',        // --ap-gray-500
  gray600: '#4B5563',        // --ap-gray-600

  // Text
  textPrimary: '#0F172A',    // --ap-dark
  textSecondary: '#4B5563',  // --ap-gray-600
  textMuted: '#9CA3AF',      // --ap-gray-400
  placeholder: '#9CA3AF',    // --ap-gray-400

  // UI
  cardBackground: '#FFFFFF',
  borderLight: 'rgba(0, 0, 0, 0.02)',
  borderDefault: '#E5E7EB',  // --ap-gray-200

  // ALIASES legacy (pour ne pas casser les imports existants)
  atysBlue: '#1A56DB',       // → primary
  atysViolet: '#7c3aed',     // gardé (gradient accent)
  atysYellow: '#fbbf24',     // gardé (brand)
  atysSuccess: '#16A34A',    // → success
  atysDanger: '#DC2626',     // → danger
  atysWarning: '#D97706',    // → warning

  // Slates legacy → remap vers grays
  slate50: '#F0F2F7',        // → background
  slate100: '#F3F4F6',       // → gray100
  slate200: '#E5E7EB',       // → gray200
  slate400: '#9CA3AF',       // → gray400
  slate500: '#6B7280',       // → gray500
  slate600: '#4B5563',       // → gray600
  slate700: '#4B5563',       // → gray600
  slate800: '#1e293b',       // gardé
  slate900: '#0F172A',       // → dark
  black: '#000000',

  // Gray aliases (cohérence legacy)
  gray50: '#F0F2F7',
  gray900: '#0F172A',
} as const;

export type Colors = typeof colors;
