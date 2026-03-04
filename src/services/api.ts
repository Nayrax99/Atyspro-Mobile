/**
 * Centralized API client - all HTTP requests go through this layer
 * Toutes les requêtes incluent le token Bearer si présent (expo-secure-store)
 */
import { getStoredToken } from './auth.service';
import { API_BASE_URL } from './api.config';

export { API_BASE_URL };
const baseUrl = API_BASE_URL;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const json = await res.json();
  if (!res.ok) {
    return {
      success: false,
      error: json.error || `HTTP ${res.status}`,
    };
  }
  return json as ApiResponse<T>;
}

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const token = await getStoredToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, { headers });
  return handleResponse<T>(res);
}

export async function apiPatch<T>(
  path: string,
  body: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const token = await getStoredToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiPost<T>(
  path: string,
  body?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const token = await getStoredToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}
