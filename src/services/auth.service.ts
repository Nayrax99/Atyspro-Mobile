/**
 * Service d'authentification - login, signup, token, fetchMe
 * Stockage : expo-secure-store (native) ou localStorage (web) via ./storage
 */
import * as storage from './storage';
import { API_BASE_URL } from './api.config';

const TOKEN_KEY = 'sb-access-token';

export async function getStoredToken(): Promise<string | null> {
  return storage.getItem(TOKEN_KEY);
}

export async function storeToken(token: string): Promise<void> {
  await storage.setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await storage.removeItem(TOKEN_KEY);
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (json.success && json.access_token) {
    await storeToken(json.access_token);
    return { success: true, token: json.access_token };
  }
  return { success: false, error: json.error || 'Identifiants incorrects' };
}

export async function signup(
  email: string,
  password: string,
  businessName: string
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, business_name: businessName }),
  });
  const json = await res.json();
  return { success: json.success ?? false, error: json.error };
}

export async function logout(): Promise<void> {
  await removeToken();
}

export async function fetchMe(token: string): Promise<{
  success: boolean;
  user?: { id: string; email: string };
  account?: { id: string; name: string; onboarding_completed: boolean };
  error?: string;
}> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  return json;
}
