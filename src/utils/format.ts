/**
 * Formatting utilities
 */

/**
 * Format relative time (e.g. "il y a 25min")
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'à l\'instant';
  if (diffMins < 60) return `il y a ${diffMins}min`;
  if (diffHours < 24) return `il y a ${diffHours}h`;
  if (diffDays === 1) return 'hier';
  if (diffDays < 7) return `il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/** Type mission depuis type_code (backend leadScoring) */
export function formatType(lead: { job_type?: string | null; type_code?: number | null }): string {
  if (lead.job_type) return lead.job_type;
  const t = lead.type_code;
  if (t === 1) return 'Dépannage urgent';
  if (t === 2) return 'Installation';
  if (t === 3) return 'Devis';
  if (t === 4) return 'Autre';
  return 'Non renseigné';
}

/** Délai depuis delay_code */
export function formatDelay(lead: { delay_code?: number | null }): string {
  const d = lead.delay_code;
  if (d === 1) return "Sous 24h (urgent)";
  if (d === 2) return 'Sous 48h';
  if (d === 3) return 'Sous 1 semaine';
  if (d === 4) return 'Flexible';
  return 'Non renseigné';
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return String(phone);
}
