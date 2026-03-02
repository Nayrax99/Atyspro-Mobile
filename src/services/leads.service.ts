/**
 * Leads service - all lead-related API calls
 */

import { apiGet, apiPatch } from './api';

export type LeadStatus = 'complete' | 'incomplete' | 'needs_review';

export interface Lead {
  id: string;
  created_at: string;
  status: LeadStatus;
  full_name?: string | null;
  contact_name?: string | null;
  client_phone?: string | null;
  phone?: string | null;
  address?: string | null;
  priority_score?: number | null;
  score?: number | null;
  job_type?: string | null;
  type_code?: number | null;
  delay_code?: number | null;
  value_estimate?: 'low' | 'medium' | 'high' | null;
  relance_count?: number | null;
  [key: string]: unknown;
}

export interface ListLeadsResponse {
  success: boolean;
  data?: Lead[];
  error?: string;
}

export async function fetchLeads(): Promise<{ data: Lead[]; error?: string }> {
  const res = await apiGet<ListLeadsResponse['data']>('/api/leads');
  return {
    data: res.data ?? [],
    error: res.success ? undefined : res.error,
  };
}

export async function fetchLeadById(
  id: string
): Promise<{ data: Lead | null; error?: string }> {
  const res = await apiGet<Lead>(`/api/leads/${id}`);
  return {
    data: res.success ? res.data ?? null : null,
    error: res.success ? undefined : res.error,
  };
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<{ data: Lead | null; error?: string }> {
  const res = await apiPatch<Lead>(`/api/leads/${id}`, { status });
  return {
    data: res.success ? res.data ?? null : null,
    error: res.success ? undefined : res.error,
  };
}
