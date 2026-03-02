/**
 * Centralized API client - all HTTP requests go through this layer
 */

const envUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
const baseUrl = envUrl || 'https://atyspro-backend.vercel.app';

export const API_BASE_URL = baseUrl;

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
  const res = await fetch(`${baseUrl}${path}`);
  return handleResponse<T>(res);
}

export async function apiPatch<T>(
  path: string,
  body: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiPost<T>(
  path: string,
  body?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}
