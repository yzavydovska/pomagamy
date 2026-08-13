
export type ComplaintsHotline = {
  
  display: string
  
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

export function getComplaintsHotline(): ComplaintsHotline | null {
  const raw = process.env.EXPO_PUBLIC_COMPLAINTS_PHONE?.trim()
  if (!raw) return null
  const telUrl = normalizeTelUrl(raw)
  if (!telUrl) return null
  return { display: raw, telUrl }
}
