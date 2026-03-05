/**
 * User / account service - onboarding, seed, simulate SMS
 */

import { apiPatch, apiPost } from './api';

export interface OnboardingPayload {
  owner_phone: string;
  city: string;
  specialty: string;
}

export async function patchOnboarding(
  payload: OnboardingPayload
): Promise<{ success: boolean; error?: string }> {
  const res = await apiPatch<unknown>('/api/auth/onboarding', payload);
  return {
    success: res.success,
    error: res.success ? undefined : res.error,
  };
}

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
