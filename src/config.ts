/**
 * Configuration centralisée de l'app (URL backend, etc.)
 */
export const BACKEND_BASE_URL =
  (process.env.EXPO_PUBLIC_BACKEND_URL as string) || 'http://192.168.1.80:3000';
