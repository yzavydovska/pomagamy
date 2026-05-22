import { onAuthStateChanged } from 'firebase/auth'
import type { DocumentData } from 'firebase/firestore'
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import type { Complaint, ComplaintModerationStatus } from '../types/mvp'
import type { OrganizacjaDoWeryfikacji } from '../data/adminMock'
import { adminStatystyki as mockStats } from '../data/adminMock'
import { normalizeComplaintTargetId } from '../utils/publicIds'
import { getFirebaseAuth, getFirebaseDb } from './client'

const AGGREGATE_PAUSE_MS = 40

async function pauseBetweenAggregates(): Promise<void> {
  await new Promise((r) => setTimeout(r, AGGREGATE_PAUSE_MS))
}

export type AdminDashboardStats = {
  /** Konta wolontariuszy i organizacji (bez ról admin w liczniku). */
  uzytkownicy: number
  ogloszenia: number
  /** Zgłoszenia wolontariuszy do zadań (kolekcja applications). */
  zgloszenia: number
  /** Organizacje ze statusem oczekującym na weryfikację. */
  doModeracji: number
  skargi: number
}

export type AdminActivityRow = {
  id: string
  typ: 'ok' | 'reject' | 'block'
  tekst: string
}

const POLL_MS = 18000
const ORG_REJECT_REASON_DISPLAY_MAX = 2000

const STATS_DOC = () => doc(getFirebaseDb(), 'admin', 'stats')

async function mergeStatsWithOptionalDoc(live: AdminDashboardStats): Promise<AdminDashboardStats> {
  const snap = await getDoc(STATS_DOC())
  if (!snap.exists()) return live
  const d = snap.data() as DocumentData
  // Domyślnie tylko agregacja (live). Nadpisanie z dokumentu tylko gdy jawnie włączone — inaczej
  // pusty lub testowy admin/stats z samymi zerami kasuje prawdziwe liczniki.
  if (d.mergeCounts !== true) return live
  return {
    uzytkownicy: d.uzytkownicy != null ? Number(d.uzytkownicy) : live.uzytkownicy,
    ogloszenia: d.ogloszenia != null ? Number(d.ogloszenia) : live.ogloszenia,
    zgloszenia: d.zgloszenia != null ? Number(d.zgloszenia) : live.zgloszenia,
    doModeracji: d.doModeracji != null ? Number(d.doModeracji) : live.doModeracji,
    skargi: d.skargi != null ? Number(d.skargi) : live.skargi,
  }
}

/** Zliczenia z Firestore (tylko metadane — bez pobierania wszystkich dokumentów). Wymaga zalogowanego konta administratora (token w żądaniu). */
export async function fetchAdminAggregatedStats(): Promise<AdminDashboardStats> {
  const user = getFirebaseAuth().currentUser
  if (!user) {
    throw new Error('Firestore: brak zalogowanego użytkownika — odrocz agregacje do onAuthStateChanged.')
  }
  await user.getIdToken()
  const db = getFirebaseDb()
  const usersVolQ = query(collection(db, 'users'), where('role', '==', 'volunteer'))
  const usersOrgQ = query(collection(db, 'users'), where('role', '==', 'organization'))
  const orgsPendingQ = query(collection(db, 'organizations'), where('verificationStatus', '==', 'pending'))

  // Kolejno zamiast Promise.all — łagodniej dla klienta RN/Hermes (unikanie sporadycznych INTERNAL ASSERTION przy watch + agregacjach).
  const usersVolSnap = await getCountFromServer(usersVolQ)
  await pauseBetweenAggregates()
  const usersOrgSnap = await getCountFromServer(usersOrgQ)
  await pauseBetweenAggregates()
  const oglSnap = await getCountFromServer(collection(db, 'ogloszenia'))
  await pauseBetweenAggregates()
  const appSnap = await getCountFromServer(collection(db, 'applications'))
  await pauseBetweenAggregates()
  const compSnap = await getCountFromServer(collection(db, 'complaints'))
  await pauseBetweenAggregates()
  const orgSnap = await getCountFromServer(orgsPendingQ)

  const live: AdminDashboardStats = {
    uzytkownicy: usersVolSnap.data().count + usersOrgSnap.data().count,
    ogloszenia: oglSnap.data().count,
    zgloszenia: appSnap.data().count,
    skargi: compSnap.data().count,
    doModeracji: orgSnap.data().count,
  }
  return mergeStatsWithOptionalDoc(live)
}

/**
 * Odświeżane liczniki: agregacje z kolekcji + opcjonalne nadpisanie polami z dokumentu admin/stats (np. Cloud Function).
 */
export type AdminDashboardStatsMeta = { source: 'firestore' | 'mock' }

export function subscribeAdminDashboardMetrics(
  onData: (stats: AdminDashboardStats, meta?: AdminDashboardStatsMeta) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  let alive = true

  const tick = async (): Promise<void> => {
    if (!alive || !getFirebaseAuth().currentUser) return
    try {
      const stats = await fetchAdminAggregatedStats()
      if (alive) onData(stats, { source: 'firestore' })
    } catch (e) {
      if (alive) {
        onError?.(e as Error)
        onData({ ...mockStats }, { source: 'mock' })
      }
    }
  }

  const authUnsub = onAuthStateChanged(getFirebaseAuth(), () => void tick())
  const interval = setInterval(() => void tick(), POLL_MS)

  return () => {
    alive = false
    clearInterval(interval)
    authUnsub()
  }
}

/** Ostatnie skargi jako wpisy „aktywności” (lekki snapshot, limit 12). */
export function subscribeAdminRecentComplaintActivity(
  onData: (rows: AdminActivityRow[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  let snapUnsub: Unsubscribe | undefined

  const attach = (): void => {
    snapUnsub?.()
    snapUnsub = undefined
    if (!getFirebaseAuth().currentUser) {
      onData([])
      return
    }
    const q = query(collection(getFirebaseDb(), 'complaints'), orderBy('createdAt', 'desc'), limit(12))
    snapUnsub = onSnapshot(
      q,
      (snap) => {
        const rows: AdminActivityRow[] = snap.docs.map((d) => {
          const x = d.data() as DocumentData
          const ref = String(x.refTargetId ?? x.refOgloszenieKod ?? '').trim()
          const cat = String(x.category ?? '').trim()
          const email = String(x.reporterEmail ?? '').trim()
          const bit = [ref && `Cel: ${ref}`, cat, email && `od ${email}`].filter(Boolean).join(' • ')
          return {
            id: d.id,
            typ: 'block' as const,
            tekst: `Nowa skarga${bit ? `: ${bit}` : ''}`,
          }
        })
        onData(rows)
      },
      (err) => onError?.(err as Error),
    )
  }

  attach()
  const authUnsub = onAuthStateChanged(getFirebaseAuth(), () => attach())

  return () => {
    snapUnsub?.()
    authUnsub()
  }
}

/** @deprecated Użyj subscribeAdminDashboardMetrics */
export function subscribeComplaintsCount(
  onCount: (n: number) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  return subscribeAdminDashboardMetrics(
    (s) => onCount(s.skargi),
    onError,
  )
}

/** @deprecated Użyj subscribeAdminDashboardMetrics */
export function subscribeAdminStats(
  onData: (stats: AdminDashboardStats) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  return subscribeAdminDashboardMetrics(onData, onError)
}

function moderatedAtIsoFromFirestoreAdmin(raw: unknown): string | undefined | null {
  if (raw == null) return raw === null ? null : undefined
  if (typeof raw === 'string') return raw
  const o = raw as { toDate?: () => Date; seconds?: number }
  if (typeof o?.toDate === 'function') {
    try {
      return o.toDate().toISOString()
    } catch {
      /* ignore */
    }
  }
  if (typeof o?.seconds === 'number') return new Date(o.seconds * 1000).toISOString()
  const s = String(raw)
  return s.length ? s : undefined
}

function complaintModerationFromDoc(raw: unknown): ComplaintModerationStatus | undefined {
  const s = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  return s === 'pending' || s === 'resolved' || s === 'rejected' ? s : undefined
}

function complaintDocToModel(docId: string, x: DocumentData): Complaint {
  const direct = x.refTargetId != null ? String(x.refTargetId).trim() : ''
  const legacyOgl = x.refOgloszenieKod != null ? String(x.refOgloszenieKod).trim() : ''
  const legacyUser = x.refUserHint != null ? String(x.refUserHint).trim() : ''
  const mod = complaintModerationFromDoc(x.moderationStatus)
  const moderatedAt = moderatedAtIsoFromFirestoreAdmin(x.moderatedAt)
  return {
    id: docId,
    category: String(x.category ?? ''),
    description: String(x.description ?? ''),
    refTargetId: direct || legacyOgl || legacyUser,
    createdAt: String(x.createdAt ?? ''),
    reporterEmail: String(x.reporterEmail ?? ''),
    reporterUid: x.reporterUid ? String(x.reporterUid) : undefined,
    moderationStatus: mod,
    moderatedAt,
  }
}

/** Pojedyncza skarga — ekran szczegółów (admin ma prawo odczytu dokumentu). */
export async function fetchComplaintDocumentForAdmin(complaintId: string): Promise<Complaint | null> {
  const trimmed = complaintId.trim()
  if (!trimmed) return null
  const snap = await getDoc(doc(getFirebaseDb(), 'complaints', trimmed))
  if (!snap.exists()) return null
  return complaintDocToModel(snap.id, snap.data())
}

/** Wszystkie skargi — tylko dla admina (reguły Firestore). */
export function subscribeComplaintsForAdmin(
  onData: (items: Complaint[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const q = query(collection(getFirebaseDb(), 'complaints'), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => {
      const items: Complaint[] = snap.docs.map((d) => complaintDocToModel(d.id, d.data()))
      onData(items)
    },
    (err) => onError?.(err as Error),
  )
}

/** Aktualny status moderacji lub «pending», jeśli w dokumencie brak pola. */
export function complaintEffectiveModeration(c: Complaint): ComplaintModerationStatus {
  return c.moderationStatus ?? 'pending'
}

export async function firebaseSetComplaintModerationAdmin(
  complaintId: string,
  status: ComplaintModerationStatus,
): Promise<void> {
  const id = complaintId.trim()
  if (!id) throw new Error('Brak identyfikatora skargi.')
  const moderatedAt = status === 'pending' ? null : new Date().toISOString()
  await updateDoc(doc(getFirebaseDb(), 'complaints', id), {
    moderationStatus: status,
    moderatedAt,
  })
}

export async function findUserUidByAccountPublicId(accountPublicId: string): Promise<{ uid: string } | null> {
  const t = normalizeComplaintTargetId(accountPublicId)
  if (!/^(W|O)-[A-Z0-9]+$/.test(t)) return null
  const database = getFirebaseDb()
  const q = query(collection(database, 'users'), where('accountPublicId', '==', t), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { uid: snap.docs[0].id }
}

/** Admin ustawia `accountSuspended` — nie dotyczy kont z rolą `admin`. */
export async function firebaseSetAccountSuspendedAdmin(
  targetUid: string,
  suspended: boolean,
): Promise<void> {
  const uid = targetUid.trim()
  if (!uid) throw new Error('Brak identyfikatora użytkownika.')
  const refUser = doc(getFirebaseDb(), 'users', uid)
  const snap = await getDoc(refUser)
  if (!snap.exists()) throw new Error('Nie znaleziono użytkownika w bazie.')
  const role = String(snap.data()?.role ?? '')
  if (role === 'admin') {
    throw new Error('Nie można zablokować konta administratora.')
  }
  await updateDoc(refUser, { accountSuspended: suspended })
}

export function mapOrgDoc(id: string, data: DocumentData): OrganizacjaDoWeryfikacji {
  const dok = data.dokumenty ?? {}
  const rawVs = String(data.verificationStatus ?? 'pending').toLowerCase()
  const verificationStatus: OrganizacjaDoWeryfikacji['verificationStatus'] =
    rawVs === 'approved' || rawVs === 'rejected' || rawVs === 'pending' ? rawVs : 'pending'
  return {
    id,
    kod: String(data.kod ?? ''),
    nazwa: String(data.nazwa ?? ''),
    nip: String(data.nip ?? ''),
    krs: String(data.krs ?? ''),
    verificationStatus,
    ...(() => {
      const raw = data.verificationRejectionReason
      const t = typeof raw === 'string' ? raw.trim().slice(0, ORG_REJECT_REASON_DISPLAY_MAX) : ''
      return t.length > 0 ? { verificationRejectionReason: t } : {}
    })(),
    dokumenty: {
      statut: Boolean(dok.statut),
      krs: Boolean(dok.krs),
      nip: Boolean(dok.nip),
    },
    zgloszonoData: String(data.zgloszonoData ?? ''),
    zgloszonoPelna: String(data.zgloszonoPelna ?? ''),
    email: String(data.email ?? ''),
    telefon: String(data.telefon ?? ''),
    adres: String(data.adres ?? ''),
    www: String(data.www ?? ''),
    dokumentyPliki: Array.isArray(data.dokumentyPliki)
      ? data.dokumentyPliki.map((x: DocumentData) => ({
          tytul: String(x?.tytul ?? ''),
          podtytul: String(x?.podtytul ?? ''),
        }))
      : [],
  }
}

/** Kolekcja organizations — pole verificationStatus: "pending" | "approved" | "rejected" */
export function subscribeOrganizationsByVerification(
  verificationStatus: 'pending' | 'approved' | 'rejected',
  onData: (orgs: OrganizacjaDoWeryfikacji[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  const q = query(
    collection(getFirebaseDb(), 'organizations'),
    where('verificationStatus', '==', verificationStatus),
  )
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => mapOrgDoc(d.id, d.data()))
      const key = (o: OrganizacjaDoWeryfikacji) => o.zgloszonoData || o.zgloszonoPelna || ''
      list.sort((a, b) => key(b).localeCompare(key(a)))
      onData(list)
    },
    (err) => onError?.(err as Error),
  )
}

export function subscribePendingOrganizations(
  onData: (orgs: OrganizacjaDoWeryfikacji[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  return subscribeOrganizationsByVerification('pending', onData, onError)
}

export async function fetchOrganizationById(id: string): Promise<OrganizacjaDoWeryfikacji | null> {
  const ref = doc(getFirebaseDb(), 'organizations', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return mapOrgDoc(snap.id, snap.data())
}

const BATCH_LIMIT = 400

/** Admin: zatwierdza organizację — profil, wpis organizations oraz publiczna widoczność ogłoszeń. */
export async function approveOrganization(ownerUid: string): Promise<void> {
  const database = getFirebaseDb()
  let batch = writeBatch(database)
  batch.update(doc(database, 'users', ownerUid), { orgVerificationStatus: 'approved' })
  batch.update(doc(database, 'organizations', ownerUid), {
    verificationStatus: 'approved',
    verificationRejectionReason: '',
  })
  await batch.commit()

  const q = query(collection(database, 'ogloszenia'), where('createdByUid', '==', ownerUid))
  const snap = await getDocs(q)
  batch = writeBatch(database)
  let n = 0
  for (const d of snap.docs) {
    batch.update(d.ref, { visibleToVolunteers: true })
    n++
    if (n >= BATCH_LIMIT) {
      await batch.commit()
      batch = writeBatch(database)
      n = 0
    }
  }
  if (n > 0) await batch.commit()
}

const REJECT_REASON_MIN = 10

/** Admin: odrzuca organizację — wymaga powodu widocznego dla organizacji w aplikacji. */
export async function rejectOrganization(ownerUid: string, reason: string): Promise<void> {
  const trimmed = String(reason ?? '').trim()
  if (trimmed.length < REJECT_REASON_MIN) {
    throw new Error(`Podaj powód odrzucenia (minimum ${REJECT_REASON_MIN} znaków), żeby organizacja wiedziała, co poprawić.`)
  }
  const safe = trimmed.slice(0, ORG_REJECT_REASON_DISPLAY_MAX)
  const database = getFirebaseDb()
  let batch = writeBatch(database)
  batch.update(doc(database, 'users', ownerUid), { orgVerificationStatus: 'rejected' })
  batch.update(doc(database, 'organizations', ownerUid), {
    verificationStatus: 'rejected',
    verificationRejectionReason: safe,
  })
  await batch.commit()

  const q = query(collection(database, 'ogloszenia'), where('createdByUid', '==', ownerUid))
  const snap = await getDocs(q)
  batch = writeBatch(database)
  let n = 0
  for (const d of snap.docs) {
    batch.update(d.ref, { visibleToVolunteers: false })
    n++
    if (n >= BATCH_LIMIT) {
      await batch.commit()
      batch = writeBatch(database)
      n = 0
    }
  }
  if (n > 0) await batch.commit()
}
