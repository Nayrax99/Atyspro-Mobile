/**
 * User / Dev service - seed, simulate SMS, etc.
 * Placeholder for future auth and user-related API calls
 */

import { apiPost } from './api';

export async function seedDev(): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<unknown>('/api/dev/seed');
  return {
    success: res.success,
    error: res.success ? undefined : res.error,
  };
}

export async function simulateSms(payload: {
  to: string;
  from: string;
  body: string;
}): Promise<{ success: boolean; error?: string }> {
  const res = await apiPost<unknown>('/api/dev/simulate/sms', payload);
  return {
    success: res.success,
    error: res.success ? undefined : res.error,
  };
}
