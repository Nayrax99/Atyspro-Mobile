/**
 * User / account service - onboarding
 */

import { apiPatch } from './api';

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
