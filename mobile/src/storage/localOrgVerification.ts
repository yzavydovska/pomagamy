/**
 * Weryfikacja organizacji przy trybie bez Firebase — kolejka i status trzymane w rejestrze użytkowników
 * oraz widoczność ogłoszeń (pole visibleToVolunteers na dokumentach MVP).
 */
import type { OrganizacjaDoWeryfikacji } from '../data/adminMock'
import type { StoredUser } from '../types/mvp'
import { loadMvpState, loadRegistry, saveMvpState, saveRegistry, type UserRegistry } from './mvpPersistence'

function resolveLocalVerification(u: StoredUser): OrganizacjaDoWeryfikacji['verificationStatus'] {
  const v = u.orgVerificationStatus
  return v === 'approved' || v === 'rejected' || v === 'pending' ? v : 'pending'
}

export function storedUserToPendingOrganization(email: string, u: StoredUser): OrganizacjaDoWeryfikacji {
  const pid = u.publicId?.trim() || ''
  const kodFromPid = /^O-/i.test(pid) ? pid.replace(/^O-/i, 'ORG-') : ''
  const nip = (u.orgNip ?? '').trim()
  const krs = (u.orgKrs ?? '').trim()
  const statutLabel = (u.orgStatutLabel ?? '').trim()
  const reasonTrim = (u.orgVerificationRejectionReason ?? '').trim()
  return {
    id: email.toLowerCase(),
    kod: kodFromPid || `ORG-${email.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase() || 'LOCAL'}`,
    nazwa: (u.organizationName ?? u.displayName ?? '').trim() || '(bez nazwy)',
    nip,
    krs,
    verificationStatus: resolveLocalVerification(u),
    ...(reasonTrim.length > 0 ? { verificationRejectionReason: reasonTrim } : {}),
    dokumenty: {
      statut: statutLabel.length > 0,
      krs: krs.length > 0,
      nip: nip.length > 0,
    },
    zgloszonoData: '',
    zgloszonoPelna: new Date().toLocaleString('pl-PL'),
    email: email.toLowerCase(),
    telefon: u.phone ?? '',
    adres: u.city ?? '',
    www: '',
    dokumentyPliki: statutLabel ? [{ tytul: 'Statut organizacji', podtytul: statutLabel }] : [],
  }
}

export async function loadOrganizationsLocalByVerification(
  filter: OrganizacjaDoWeryfikacji['verificationStatus'],
): Promise<OrganizacjaDoWeryfikacji[]> {
  const registry = await loadRegistry()
  const out: OrganizacjaDoWeryfikacji[] = []
  for (const [email, u] of Object.entries(registry)) {
    if (u.role !== 'organization') continue
    if (resolveLocalVerification(u) !== filter) continue
    out.push(storedUserToPendingOrganization(email, u))
  }
  out.sort((a, b) => a.email.localeCompare(b.email))
  return out
}

/** @deprecated Użyj loadOrganizationsLocalByVerification('pending') */
export async function loadPendingOrganizationsLocal(): Promise<OrganizacjaDoWeryfikacji[]> {
  return loadOrganizationsLocalByVerification('pending')
}

export async function fetchLocalOrganizationByEmail(emailKey: string): Promise<OrganizacjaDoWeryfikacji | null> {
  const registry = await loadRegistry()
  const email = emailKey.toLowerCase()
  const u = registry[email]
  if (!u || u.role !== 'organization') return null
  return storedUserToPendingOrganization(email, u)
}

function orgDisplayLabel(u: StoredUser): string {
  return (u.organizationName ?? u.displayName ?? '').trim()
}

async function patchListingsVisibility(orgLabel: string, visible: boolean): Promise<void> {
  if (!orgLabel) return
  const mvp = await loadMvpState()
  const customOgloszenia = mvp.customOgloszenia.map((o) =>
    o.organizacja === orgLabel ? { ...o, visibleToVolunteers: visible } : o,
  )
  await saveMvpState({ ...mvp, customOgloszenia })
}

export async function approveOrganizationLocal(ownerEmail: string): Promise<void> {
  const email = ownerEmail.toLowerCase()
  const registry = await loadRegistry()
  const u = registry[email]
  if (!u || u.role !== 'organization') {
    throw new Error('Nie znaleziono konta organizacji.')
  }
  const nextReg: UserRegistry = {
    ...registry,
    [email]: (() => {
      const cleared: StoredUser = { ...u, orgVerificationStatus: 'approved' }
      delete cleared.orgVerificationRejectionReason
      return cleared
    })(),
  }
  await saveRegistry(nextReg)
  await patchListingsVisibility(orgDisplayLabel(u), true)
}

const LOCAL_REJECT_REASON_MIN = 10

export async function rejectOrganizationLocal(ownerEmail: string, reason: string): Promise<void> {
  const trimmed = String(reason ?? '').trim()
  if (trimmed.length < LOCAL_REJECT_REASON_MIN) {
    throw new Error(`Podaj powód odrzucenia (minimum ${LOCAL_REJECT_REASON_MIN} znaków).`)
  }
  const email = ownerEmail.toLowerCase()
  const registry = await loadRegistry()
  const u = registry[email]
  if (!u || u.role !== 'organization') {
    throw new Error('Nie znaleziono konta organizacji.')
  }
  const nextReg: UserRegistry = {
    ...registry,
    [email]: {
      ...u,
      orgVerificationStatus: 'rejected',
      orgVerificationRejectionReason: trimmed.slice(0, 2000),
    },
  }
  await saveRegistry(nextReg)
  await patchListingsVisibility(orgDisplayLabel(u), false)
}
