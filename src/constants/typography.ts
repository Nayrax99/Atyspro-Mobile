/**
 * Typography — Plus Jakarta Sans avec fallback system
 * Sur RN, fontFamily et fontWeight ne se combinent pas.
 * Utiliser la variante correcte (ex: fontFamily.bold au lieu de fontWeight: '700').
 */
export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const fontSize = {
  caption: 12,
  bodySmall: 14,
  body: 16,
  sectionTitle: 20,
  pageTitle: 28,
  heroTitle: 40,
} as const;
