import type { UserRole } from '../types/mvp'

export function publicIdForFirebaseUser(uid: string, role: UserRole): string {
  const compact = uid.replace(/-/g, '').toUpperCase().slice(0, 10)
  const prefix = role === 'organization' ? 'O' : 'W'
  return `${prefix}-${compact}`
}

export function generateLocalAccountPublicId(role: UserRole): string {
  const n = Math.floor(100000 + Math.random() * 900000)
  return role === 'organization' ? `O-L${n}` : `W-L${n}`
}

export function generateApplicationPublicId(): string {
  const n = Math.floor(100000 + Math.random() * 900000)
  return `Z-${n}`
}

export function applicationPublicIdFromLegacy(appId: string, stored?: string | null): string {
  if (stored && String(stored).trim()) return String(stored).trim().toUpperCase()
  const tail = appId.replace(/-/g, '').slice(-8).toUpperCase() || 'UNKNOWN'
  return `Z-${tail}`
}

export function normalizeComplaintTargetId(raw: string): string {
  const t = raw.trim().replace(/\s+/g, '').toUpperCase()
  if (!t) return ''
  
  if (t.startsWith('ORG')) {
    const rest = t.slice(3).replace(/^-+/, '')
    return rest ? `ORG-${rest.replace(/^-+/, '')}` : 'ORG-'
  }
  if (t.startsWith('OG')) {
    const rest = t.slice(2).replace(/^-+/, '')
    return `OG-${rest}`
  }
  const m = t.match(/^([WOZ])-?(.*)$/)
  if (m) {
    const pre = m[1]
    const rest = (m[2] ?? '').replace(/^-+/, '')
    return `${pre}-${rest}`
  }
  return t
}

export function isValidComplaintTargetId(raw: string): boolean {
  const s = normalizeComplaintTargetId(raw)
  if (s.length < 5) return false
  return (
    /^(W|O|Z)-[A-Z0-9]+$/.test(s) || /^OG-[A-Z0-9]+$/.test(s) || /^ORG-[A-Z0-9]+$/.test(s)
  )
}

export function resolveComplaintTargetId(raw: string): string {
  const normalized = normalizeComplaintTargetId(raw)
  if (isValidComplaintTargetId(normalized)) {
    return normalized
  }
  const compact = raw.trim().replace(/\s+/g, '')
  if (/^\d{2,}$/.test(compact)) {
    const asOg = normalizeComplaintTargetId(`OG-${compact}`)
    if (isValidComplaintTargetId(asOg)) return asOg
  }
  return normalized
}
