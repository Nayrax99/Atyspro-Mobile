/**
 * Calls service - historique des appels
 */
import { apiGet } from './api';

export interface Call {
  id: string;
  twilio_call_sid: string;
  direction: 'inbound' | 'outbound';
  from_number: string;
  to_number: string;
  status: string;
  started_at: string;
  ended_at?: string | null;
  lead?: { id: string; full_name: string | null; description: string | null } | null;
}

export async function fetchCalls(): Promise<{ data: Call[]; error?: string }> {
  try {
    const res = await apiGet<Call[]>('/api/calls');
    if (!res.success) {
      return { data: [] };
    }
    return { data: res.data ?? [] };
  } catch {
    return { data: [] };
  }
}
