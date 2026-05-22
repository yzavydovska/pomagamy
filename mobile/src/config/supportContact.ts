/**
 * Opcjonalna infolinia / telefon do zgłaszania skarg (poza formularzem w aplikacji).
 * Ustaw w `.env`: EXPO_PUBLIC_COMPLAINTS_PHONE="+48 123 456 789" (+ i cyfry; spacje OK)
 */
export type ComplaintsHotline = {
  /** Tekst dla użytkownika (np. z kierunkowym) */
  display: string
  /** `tel:+48123456789` */
  telUrl: string
}

function normalizeTelUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const digits = trimmed.replace(/[^\d+]/g, '')
  if (!digits || digits === '+') return null
  const withPlus = digits.startsWith('+') ? digits : `+${digits.replace(/^\+/, '')}`
  return `tel:${withPlus}`
}

/** Zwraca null, jeśli zmienna nie jest ustawiona — wtedy nie pokazuj bloku z numerem. */
export function getComplaintsHotline(): ComplaintsHotline | null {
  const raw = process.env.EXPO_PUBLIC_COMPLAINTS_PHONE?.trim()
  if (!raw) return null
  const telUrl = normalizeTelUrl(raw)
  if (!telUrl) return null
  return { display: raw, telUrl }
}
