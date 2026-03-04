/**
 * URL du backend - partagée par api.ts et auth.service pour éviter les cycles
 */
const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
export const API_BASE_URL = envUrl || 'https://atyspro-backend.vercel.app';
