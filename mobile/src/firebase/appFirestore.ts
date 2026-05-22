import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage'
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import type { Ogloszenie } from '../types/ogloszenie'
import type {
  Application,
  Complaint,
  ComplaintModerationStatus,
  InAppNotification,
  MvpPersistedState,
  StoredUser,
} from '../types/mvp'
import { uid as localUid } from '../storage/mvpPersistence'
import {
  applicationPublicIdFromLegacy,
  generateApplicationPublicId,
  resolveComplaintTargetId,
  publicIdForFirebaseUser,
} from '../utils/publicIds'
import { normalizeNipInput, nipValidationError, normalizedKrsDigits, krsValidationErrorOptional } from '../utils/polishOrgIds'
import { ORG_REGISTRATION_STATUT_OPTIONAL } from '../config/featureFlags'
import { getFirebaseAuth, getFirebaseDb, getFirebaseStorage } from './client'
import type { UserRole as AuthRole } from './adminAuth'

const db = () => getFirebaseDb()

/**
 * Konto organizacji bez wpisu organizations (np. ręczny dokument users lub stara wersja app)
 * nie trafia na listę panelu admina. Przy następnym pobraniu profilu dopisujemy brakujący wpis kolejki weryfikacji.
 */
async function syncMissingOrganizationsQueueDoc(
  uid: string,
  userData: Record<string, unknown>,
  orgSnapExists: boolean,
): Promise<boolean> {
  if (orgSnapExists) return false
  const role = userData.role as string | undefined
  if (role !== 'organization') return false
  const ovs = userData.orgVerificationStatus as string | undefined
  if (ovs !== 'pending') return false
  const auth = getFirebaseAuth().currentUser
  if (!auth || auth.uid !== uid) return false
  const nazwa = String(userData.organizationName ?? '').trim()
  await setDoc(doc(db(), 'organizations', uid), {
    verificationStatus: 'pending',
    ownerUid: uid,
    nazwa,
    email: String(userData.email ?? '').trim().toLowerCase(),
    telefon: String(userData.phone ?? '').trim(),
    nip: '',
    krs: '',
    kod: `ORG-${Math.floor(100 + Math.random() * 899)}`,
    zgloszonoData: new Date().toISOString(),
    zgloszonoPelna: new Date().toLocaleString('pl-PL'),
    adres: '',
    www: '',
    dokumenty: { statut: false, krs: false, nip: false },
    dokumentyPliki: [],
  })
  return true
}

export function extractFirebaseErr(e: unknown): { code: string; message: string } {
  if (e && typeof e === 'object' && 'code' in e) {
    const code = String((e as { code: string }).code)
    const message =
      'message' in e && typeof (e as { message: unknown }).message === 'string'
        ? (e as { message: string }).message
        : ''
    return { code, message }
  }
  return { code: '', message: '' }
}

export async function fetchUserProfile(userId: string): Promise<StoredUser | null> {
  const userRef = doc(db(), 'users', userId)
  const orgRef = doc(db(), 'organizations', userId)
  const [snap, orgSnapBefore] = await Promise.all([getDoc(userRef), getDoc(orgRef)])
  if (!snap.exists()) return null
  const d = snap.data()
  const role = d.role as string | undefined
  if (role !== 'volunteer' && role !== 'organization') return null

  let orgSnap = orgSnapBefore
  try {
    const wrote = await syncMissingOrganizationsQueueDoc(userId, d, orgSnapBefore.exists())
    if (wrote) orgSnap = await getDoc(orgRef)
  } catch (e) {
    if (__DEV__) {
      const { code } = extractFirebaseErr(e)
      console.warn('[fetchUserProfile] sync organizations/', code || e)
    }
  }

  const ovs = d.orgVerificationStatus as string | undefined
  let orgVerificationStatus: StoredUser['orgVerificationStatus']
  if (role === 'organization') {
    const orgData = orgSnap.exists() ? orgSnap.data() : null
    const fromOrg = orgData?.verificationStatus as string | undefined
    if (fromOrg === 'pending' || fromOrg === 'approved' || fromOrg === 'rejected') {
      orgVerificationStatus = fromOrg
    } else if (ovs === 'pending' || ovs === 'approved' || ovs === 'rejected') {
      orgVerificationStatus = ovs
    } else {
      /** Brak wpisu organizations — konto sprzed kolejki weryfikacji; nie blokuj publikacji. */
      orgVerificationStatus = orgSnap.exists() ? 'pending' : 'approved'
    }
  }
  const rawInt = d.interests
  const interestsParsed = Array.isArray(rawInt)
    ? rawInt.map((x) => String(x)).filter((s) => s.trim().length > 0)
    : []
  /** Wolontariusz: zawsze tablica (także []), żeby zapis z edycji profilu wracał do widoku. */
  const interests = role === 'volunteer' ? interestsParsed : undefined
  let orgVerificationRejectionReason: string | undefined
  if (role === 'organization' && orgSnap.exists()) {
    const od = orgSnap.data() as Record<string, unknown>
    const raw = od.verificationRejectionReason
    const t = typeof raw === 'string' ? raw.trim() : ''
    orgVerificationRejectionReason = t.length > 0 ? t : undefined
  }
  const savedPid = typeof d.accountPublicId === 'string' ? String(d.accountPublicId).trim() : ''
  const derivedPid = publicIdForFirebaseUser(userId, role)
  const accountSuspended = d.accountSuspended === true
  return {
    email: String(d.email ?? '').trim().toLowerCase(),
    password: '',
    role,
    displayName: String(d.displayName ?? ''),
    phone: String(d.phone ?? ''),
    publicId: savedPid.length > 0 ? savedPid : derivedPid,
    accountPublicId: savedPid.length > 0 ? savedPid : undefined,
    accountSuspended: accountSuspended ? true : undefined,
    avatarUri: d.avatarUrl ? String(d.avatarUrl) : undefined,
    organizationName: d.organizationName ? String(d.organizationName) : undefined,
    about: d.about ? String(d.about) : undefined,
    city: d.city ? String(d.city) : undefined,
    interests,
    orgVerificationStatus,
    orgVerificationRejectionReason,
  }
}

function ogloszenieFromDoc(id: string, d: Record<string, unknown>): Ogloszenie {
  const wym = Array.isArray(d.wymagania) ? (d.wymagania as string[]) : []
  const nipRaw = d.organizerNip != null ? String(d.organizerNip).trim() : ''
  const krsRaw = d.organizerKrs != null ? String(d.organizerKrs).trim() : ''
  return {
    id: String(d.id ?? id),
    tytul: String(d.tytul ?? ''),
    organizacja: String(d.organizacja ?? ''),
    opis: String(d.opis ?? ''),
    data: String(d.data ?? ''),
    lokalizacja: String(d.lokalizacja ?? ''),
    kategoria: String(d.kategoria ?? ''),
    status: (d.status === 'Zakończone' ? 'Zakończone' : 'Aktywne') as Ogloszenie['status'],
    godziny: String(d.godziny ?? ''),
    liczbaWolontariuszy: String(d.liczbaWolontariuszy ?? ''),
    wymagania: wym,
    kod: String(d.kod ?? ''),
    createdByUid: d.createdByUid ? String(d.createdByUid) : undefined,
    organizerNip: nipRaw.length > 0 ? nipRaw : undefined,
    organizerKrs: krsRaw.length > 0 ? krsRaw : undefined,
    visibleToVolunteers: d.visibleToVolunteers === true,
    archived: d.archived === true,
  }
}

async function readOrganizationNipKrs(ownerUid: string): Promise<{ nip: string; krs: string }> {
  const snap = await getDoc(doc(db(), 'organizations', ownerUid))
  if (!snap.exists()) return { nip: '', krs: '' }
  const od = snap.data() as { nip?: string; krs?: string }
  return {
    nip: String(od.nip ?? '').trim(),
    krs: String(od.krs ?? '').trim(),
  }
}

function applicationFromDoc(id: string, d: Record<string, unknown>): Application {
  const storedPid = d.publicId != null && String(d.publicId).trim() ? String(d.publicId).trim() : undefined
  return {
    id: String(d.id ?? id),
    publicId: applicationPublicIdFromLegacy(String(d.id ?? id), storedPid),
    ogloszenieId: String(d.ogloszenieId ?? ''),
    ogloszenieTitle: String(d.ogloszenieTitle ?? ''),
    organizerName: String(d.organizerName ?? ''),
    volunteerEmail: String(d.volunteerEmail ?? ''),
    volunteerName: String(d.volunteerName ?? ''),
    status: d.status as Application['status'],
    createdAt: String(d.createdAt ?? ''),
    volunteerUid: d.volunteerUid ? String(d.volunteerUid) : undefined,
    organizerUid: d.organizerUid ? String(d.organizerUid) : undefined,
  }
}

function notificationFromDoc(id: string, d: Record<string, unknown>): InAppNotification {
  return {
    id: String(d.id ?? id),
    title: String(d.title ?? ''),
    body: String(d.body ?? ''),
    read: Boolean(d.read),
    createdAt: String(d.createdAt ?? ''),
    applicationId: d.applicationId ? String(d.applicationId) : undefined,
  }
}

function moderatedAtIsoFromFirestore(raw: unknown): string | undefined | null {
  if (raw == null) return raw === null ? null : undefined
  if (typeof raw === 'string') return raw
  const o = raw as { toDate?: () => Date; seconds?: number }
  if (typeof o?.toDate === 'function') {
    try {
      return o.toDate().toISOString()
    } catch {
      /* fall through */
    }
  }
  if (typeof o?.seconds === 'number') {
    return new Date(o.seconds * 1000).toISOString()
  }
  const s = String(raw)
  return s.length ? s : undefined
}

function parseModerationStatus(raw: unknown): ComplaintModerationStatus | undefined {
  const s = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  return s === 'pending' || s === 'resolved' || s === 'rejected' ? s : undefined
}

function complaintFromDoc(id: string, d: Record<string, unknown>): Complaint {
  const direct = d.refTargetId != null ? String(d.refTargetId).trim() : ''
  const legacyOgl = d.refOgloszenieKod != null ? String(d.refOgloszenieKod).trim() : ''
  const legacyUser = d.refUserHint != null ? String(d.refUserHint).trim() : ''
  const mod = parseModerationStatus(d.moderationStatus)
  const moderatedAt = moderatedAtIsoFromFirestore(d.moderatedAt)
  return {
    id: String(d.id ?? id),
    category: String(d.category ?? ''),
    description: String(d.description ?? ''),
    refTargetId: direct || legacyOgl || legacyUser,
    createdAt: String(d.createdAt ?? ''),
    reporterEmail: String(d.reporterEmail ?? ''),
    reporterUid: d.reporterUid ? String(d.reporterUid) : undefined,
    moderationStatus: mod,
    moderatedAt: moderatedAt === undefined ? undefined : moderatedAt,
  }
}

/** Ogłoszenia widoczne dla wolontariuszy — odczyt bez logowania (zgodnie z regułami Firestore). */
export function subscribePublicVolunteerListingsFirebase(
  onListings: (items: Ogloszenie[]) => void,
  onError?: () => void,
): Unsubscribe {
  const qListings = query(collection(db(), 'ogloszenia'), where('visibleToVolunteers', '==', true))
  return onSnapshot(
    qListings,
    (snap) => {
      onListings(snap.docs.map((x) => ogloszenieFromDoc(x.id, x.data() as Record<string, unknown>)))
    },
    () => {
      onListings([])
      onError?.()
    },
  )
}

/** Subskrypcja danych z Firestore: zgłoszenia, ogłoszenia, powiadomienia, skargi. */
export function subscribeMvpStateFirebase(
  userId: string,
  role: 'volunteer' | 'organization',
  onUpdate: (state: MvpPersistedState) => void,
): Unsubscribe {
  let applications: Application[] = []
  let customOgloszenia: Ogloszenie[] = []
  let notifications: InAppNotification[] = []
  let complaints: Complaint[] = []

  const emit = (): void => {
    onUpdate({
      applications,
      notifications,
      customOgloszenia,
      complaints,
    })
  }

  const qApps =
    role === 'volunteer'
      ? query(collection(db(), 'applications'), where('volunteerUid', '==', userId))
      : query(collection(db(), 'applications'), where('organizerUid', '==', userId))

  const qListings =
    role === 'volunteer'
      ? query(collection(db(), 'ogloszenia'), where('visibleToVolunteers', '==', true))
      : query(collection(db(), 'ogloszenia'), where('createdByUid', '==', userId))

  const unApps = onSnapshot(
    qApps,
    (snap) => {
      applications = snap.docs.map((x) => applicationFromDoc(x.id, x.data() as Record<string, unknown>))
      emit()
    },
    () => {
      applications = []
      emit()
    },
  )

  const unListings = onSnapshot(
    qListings,
    (snap) => {
      customOgloszenia = snap.docs.map((x) => ogloszenieFromDoc(x.id, x.data() as Record<string, unknown>))
      emit()
    },
    () => {
      customOgloszenia = []
      emit()
    },
  )

  const notifRef = collection(db(), 'users', userId, 'inAppNotifications')
  const qNotif = query(notifRef, orderBy('createdAt', 'desc'))
  const unNotif = onSnapshot(
    qNotif,
    (snap) => {
      notifications = snap.docs.map((x) => notificationFromDoc(x.id, x.data() as Record<string, unknown>))
      emit()
    },
    () => {
      notifications = []
      emit()
    },
  )

  const qComplaints = query(collection(db(), 'complaints'), where('reporterUid', '==', userId))
  const unComp = onSnapshot(
    qComplaints,
    (snap) => {
      complaints = snap.docs.map((x) => complaintFromDoc(x.id, x.data() as Record<string, unknown>))
      emit()
    },
    () => {
      complaints = []
      emit()
    },
  )

  return () => {
    unApps()
    unListings()
    unNotif()
    unComp()
  }
}

export async function firebaseRegisterAppUser(data: {
  email: string
  password: string
  role: StoredUser['role']
  displayName: string
  phone: string
  organizationName?: string
  /** Tylko rola organization — oczyszczany NIP przed walidacją. */
  organizationNip?: string
  organizationKrs?: string
  /** Wybrany plik statutu (PDF / obraz), przesłany do Storage po utworzeniu konta Auth. */
  statutAsset?: { uri: string; name: string; mimeType?: string | null } | null
}): Promise<{ ok: true; user: User } | { ok: false; message: string }> {
  const key = data.email.trim().toLowerCase()
  const isOrg = data.role === 'organization'
  let nipDigits = ''
  let krsDigits = ''

  if (isOrg) {
    nipDigits = normalizeNipInput(data.organizationNip ?? '')
    const nipErr = nipValidationError(data.organizationNip ?? '')
    const krsErr = krsValidationErrorOptional(data.organizationKrs ?? '')
    if (nipErr) {
      return { ok: false, message: nipErr }
    }
    if (krsErr) {
      return { ok: false, message: krsErr }
    }
    krsDigits = normalizedKrsDigits(data.organizationKrs ?? '')
    if (!ORG_REGISTRATION_STATUT_OPTIONAL && !data.statutAsset?.uri) {
      return {
        ok: false,
        message:
          'Dołącz plik statutu (PDF lub zdjęcie), aby administrator mógł zweryfikować organizację.',
      }
    }
  }

  try {
    const auth = getFirebaseAuth()
    const cred = await createUserWithEmailAndPassword(auth, key, data.password)
    const uid = cred.user.uid

    let statutUrl: string | null = null
    let dokumentyPlikiOrg: { tytul: string; podtytul: string }[] = []

    if (isOrg && data.statutAsset) {
      try {
        statutUrl = await uploadOrganizationStatut(
          uid,
          data.statutAsset.uri,
          data.statutAsset.mimeType ?? undefined,
        )
        dokumentyPlikiOrg = [{ tytul: 'Statut organizacji', podtytul: statutUrl }]
      } catch {
        try {
          await deleteUser(cred.user)
        } catch {
          /* ignore */
        }
        return {
          ok: false,
          message:
            'Nie udało się przesłać statutu. Sprawdź połączenie, limit 15 MB (PDF lub obraz) oraz reguły Firebase Storage dla ścieżki orgDocs.',
        }
      }
    }

    const userPayload = {
      email: key,
      role: data.role as AuthRole,
      displayName: data.displayName.trim(),
      phone: data.phone.trim(),
      organizationName: isOrg ? (data.organizationName ?? '').trim() || null : null,
      about: '',
      city: '',
      interests: data.role === 'volunteer' ? [] : null,
      orgVerificationStatus: isOrg ? 'pending' : null,
      accountPublicId: publicIdForFirebaseUser(uid, data.role),
    }

    const database = db()
    const batch = writeBatch(database)
    batch.set(doc(database, 'users', uid), userPayload)

    if (isOrg) {
      const nazwa = (data.organizationName ?? '').trim()
      batch.set(doc(database, 'organizations', uid), {
        verificationStatus: 'pending',
        ownerUid: uid,
        nazwa,
        email: key,
        telefon: data.phone.trim(),
        nip: nipDigits,
        krs: krsDigits,
        kod: `ORG-${Math.floor(100 + Math.random() * 899)}`,
        zgloszonoData: new Date().toISOString(),
        zgloszonoPelna: new Date().toLocaleString('pl-PL'),
        adres: '',
        www: '',
        dokumenty: {
          nip: true,
          krs: krsDigits.length > 0,
          statut: !!statutUrl,
        },
        dokumentyPliki: dokumentyPlikiOrg,
      })
    }

    try {
      await batch.commit()
    } catch (commitErr) {
      try {
        await deleteUser(cred.user)
      } catch {
        /* ignore — i nie blokuj pierwotnego błędu */
      }
      throw commitErr
    }

    return { ok: true, user: cred.user }
  } catch (e: unknown) {
    const { code, message } = extractFirebaseErr(e)
    if (code === 'auth/email-already-in-use') {
      return { ok: false, message: 'Konto z tym adresem e-mail już istnieje.' }
    }
    if (code === 'auth/weak-password' || code === 'auth/password-does-not-meet-requirements') {
      return { ok: false, message: 'Hasło jest zbyt słabe dla Firebase.' }
    }
    if (code === 'auth/operation-not-allowed') {
      return {
        ok: false,
        message:
          'Logowanie e-mail/hasło jest wyłączone w Firebase. Włącz „Email/Password” w Authentication i zapisz.',
      }
    }
    if (code === 'auth/invalid-email') {
      return { ok: false, message: 'Nieprawidłowy adres e-mail.' }
    }
    if (code === 'auth/network-request-failed') {
      return { ok: false, message: 'Brak połączenia z siecią. Spróbuj ponownie.' }
    }
    if (code === 'permission-denied' || code === 'firestore/permission-denied') {
      return {
        ok: false,
        message:
          'Nie udało się zapisać konta. Sprawdź w panelu Firebase, czy baza Firestore jest utworzona, a reguły bezpieczeństwa są opublikowane (zakładka Reguły → Opublikuj). Po poprawnej konfiguracji spróbuj zarejestrować się ponownie.',
      }
    }
    if (__DEV__ && message) {
      console.warn('[firebaseRegister]', code, message)
    }
    return {
      ok: false,
      message: code
        ? `Rejestracja: ${code}${message ? ` — ${message}` : ''}`
        : 'Rejestracja nie powiodła się. Spróbuj ponownie.',
    }
  }
}

export async function firebaseLoginAppUser(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const key = email.trim().toLowerCase()
  try {
    const auth = getFirebaseAuth()
    const cred = await signInWithEmailAndPassword(auth, key, password)
    const uid = cred.user.uid
    try {
      const snap = await getDoc(doc(db(), 'users', uid))
      if (snap.exists()) {
        const u = snap.data() as Record<string, unknown>
        const role = u.role as string | undefined
        const suspended = u.accountSuspended === true
        if (suspended && role !== 'admin') {
          await signOut(auth)
          return {
            ok: false,
            message:
              'To konto zostało zablokowane przez administratora. Nie możesz się zalogować.',
          }
        }
      }
    } catch {
      /** Sieć / Firestore przy starcie logowania — pozwól przejść; sesja zweryfikuje się przy ładowaniu profilu. */
    }
    return { ok: true }
  } catch (e: unknown) {
    const { code, message } = extractFirebaseErr(e)
    if (
      code === 'auth/invalid-credential' ||
      code === 'auth/wrong-password' ||
      code === 'auth/user-not-found' ||
      code === 'auth/invalid-email'
    ) {
      return { ok: false, message: 'Nieprawidłowy e-mail lub hasło.' }
    }
    if (code === 'auth/too-many-requests') {
      return { ok: false, message: 'Zbyt wiele prób. Spróbuj za chwilę.' }
    }
    if (code === 'auth/user-disabled') {
      return { ok: false, message: 'To konto zostało wyłączone.' }
    }
    if (code === 'auth/network-request-failed') {
      return { ok: false, message: 'Brak połączenia z siecią.' }
    }
    if (__DEV__ && message) {
      console.warn('[firebaseLogin]', code, message)
    }
    return {
      ok: false,
      message: code ? `Logowanie: ${code}` : 'Nieprawidłowy e-mail lub hasło.',
    }
  }
}

export async function firebaseLogoutAppUser(): Promise<void> {
  await signOut(getFirebaseAuth())
}

/**
 * Po odrzuceniu przez admina — organizacja ponownie trafia do kolejki (`pending`) bez usuwania konta.
 * Ogłoszenia pozostają z `visibleToVolunteers: false` do czasu ponownego zatwierdzenia.
 */
export async function firebaseResubmitOrganizationVerification(
  ownerUid: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const auth = getFirebaseAuth().currentUser
  if (!auth || auth.uid !== ownerUid) {
    return { ok: false, message: 'Musisz być zalogowany jako ta organizacja.' }
  }
  const database = db()
  const userRef = doc(database, 'users', ownerUid)
  const orgRef = doc(database, 'organizations', ownerUid)
  const [userSnap, orgSnap] = await Promise.all([getDoc(userRef), getDoc(orgRef)])
  if (!userSnap.exists()) return { ok: false, message: 'Nie znaleziono profilu konta.' }
  const ud = userSnap.data() as Record<string, unknown>
  if (ud.role !== 'organization') {
    return { ok: false, message: 'Ta opcja dotyczy wyłącznie kont organizacji.' }
  }
  if (ud.orgVerificationStatus !== 'rejected') {
    return {
      ok: false,
      message:
        'Ponowne zgłoszenie jest dostępne tylko wtedy, gdy administrator wcześniej odrzucił weryfikację.',
    }
  }
  if (!orgSnap.exists()) {
    return {
      ok: false,
      message: 'Brak wpisu organizacji w bazie. Skontaktuj się z administratorem aplikacji.',
    }
  }
  const od = orgSnap.data() as Record<string, unknown>
  if (od.verificationStatus !== 'rejected') {
    return { ok: false, message: 'Status w kolejce weryfikacji nie pozwala na ponowne zgłoszenie.' }
  }

  const nowIso = new Date().toISOString()
  const nowPl = new Date().toLocaleString('pl-PL')
  const batch = writeBatch(database)
  batch.update(userRef, { orgVerificationStatus: 'pending' })
  batch.update(orgRef, {
    verificationStatus: 'pending',
    zgloszonoData: nowIso,
    zgloszonoPelna: nowPl,
    verificationRejectionReason: '',
  })
  try {
    await batch.commit()
    return { ok: true }
  } catch (e) {
    const { code } = extractFirebaseErr(e)
    if (code === 'permission-denied' || code === 'firestore/permission-denied') {
      return {
        ok: false,
        message:
          'Brak uprawnień zapisu. Opublikuj w konsoli Firebase najnowsze reguły Firestore z pliku mobile/firestore.rules.',
      }
    }
    return { ok: false, message: 'Nie udało się zapisać. Sprawdź połączenie i spróbuj ponownie.' }
  }
}

export type FirebaseProfilePatch = Partial<
  Pick<StoredUser, 'displayName' | 'phone' | 'about' | 'city' | 'organizationName' | 'interests'>
> & {
  /** `null` lub `''` — usuwa zdjęcie w Firestore */
  avatarUri?: string | null
}

async function uploadOrganizationStatut(uid: string, uri: string, mimeType: string | undefined): Promise<string> {
  const storage = getFirebaseStorage()
  const res = await fetch(uri)
  const blob = await res.blob()
  const mt = (mimeType || blob.type || 'application/octet-stream').trim()
  const lower = mt.toLowerCase()
  let ext = 'bin'
  if (lower === 'application/pdf' || lower.endsWith('/pdf')) ext = 'pdf'
  else if (lower.startsWith('image/jpeg')) ext = 'jpg'
  else if (lower.startsWith('image/png')) ext = 'png'
  else if (lower.startsWith('image/webp')) ext = 'webp'
  else if (lower.startsWith('image/')) ext = lower.replace('image/', '').split('+')[0] || 'jpg'

  const maxBytes = 15 * 1024 * 1024
  if (blob.size > maxBytes) throw new Error('Za duży plik.')

  const objectRef = storageRef(storage, `orgDocs/${uid}/statut.${ext}`)
  await uploadBytes(objectRef, blob, { contentType: mt })
  return getDownloadURL(objectRef)
}

async function firebaseUploadUserAvatar(userId: string, imageUri: string): Promise<string> {
  const storage = getFirebaseStorage()
  const objectRef = storageRef(storage, `avatars/${userId}.jpg`)
  const res = await fetch(imageUri)
  const blob = await res.blob()
  await uploadBytes(objectRef, blob, { contentType: blob.type && blob.type.startsWith('image/') ? blob.type : 'image/jpeg' })
  return getDownloadURL(objectRef)
}

export async function firebaseUpdateUserProfile(userId: string, partial: FirebaseProfilePatch): Promise<void> {
  const userRef = doc(db(), 'users', userId)
  const snapshot = await getDoc(userRef)
  const payload: Record<string, unknown> = {}
  if (snapshot.exists()) {
    const prev = snapshot.data() as Record<string, unknown>
    const prevRole = prev.role === 'organization' ? 'organization' : prev.role === 'volunteer' ? 'volunteer' : null
    const existingPid =
      typeof prev.accountPublicId === 'string' ? String(prev.accountPublicId).trim() : ''
    if (prevRole && existingPid === '') {
      payload.accountPublicId = publicIdForFirebaseUser(userId, prevRole)
    }
  }
  if (partial.displayName !== undefined) payload.displayName = partial.displayName
  if (partial.phone !== undefined) payload.phone = partial.phone
  if (partial.about !== undefined) payload.about = partial.about
  if (partial.city !== undefined) payload.city = partial.city
  if (partial.organizationName !== undefined) payload.organizationName = partial.organizationName || null
  if (partial.interests !== undefined) {
    payload.interests = partial.interests.length > 0 ? partial.interests : []
  }
  if (partial.avatarUri !== undefined) {
    if (partial.avatarUri === null || partial.avatarUri === '') {
      payload.avatarUrl = null
    } else if (/^https?:\/\//i.test(partial.avatarUri)) {
      payload.avatarUrl = partial.avatarUri
    } else {
      payload.avatarUrl = await firebaseUploadUserAvatar(userId, partial.avatarUri)
    }
  }
  if (Object.keys(payload).length === 0) return
  await setDoc(userRef, payload, { merge: true })
}

async function addVolunteerNotification(userId: string, n: Omit<InAppNotification, 'id'> & { id?: string }): Promise<void> {
  const id = n.id ?? localUid()
  await setDoc(doc(db(), 'users', userId, 'inAppNotifications', id), {
    id,
    title: n.title,
    body: n.body,
    read: n.read,
    createdAt: n.createdAt,
    applicationId: n.applicationId ?? null,
  })
}

export async function firebaseSubmitApplication(
  volunteerUid: string,
  volunteerEmail: string,
  volunteerName: string,
  og: Ogloszenie,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (og.visibleToVolunteers !== true) {
    return {
      ok: false,
      message: 'To ogłoszenie nie jest jeszcze dostępne dla wolontariuszy (organizacja oczekuje na weryfikację).',
    }
  }
  if (og.status === 'Zakończone') {
    return {
      ok: false,
      message: 'To ogłoszenie zostało zamknięte — nie można wysłać zgłoszenia.',
    }
  }

  const dupQ = query(
    collection(db(), 'applications'),
    where('volunteerUid', '==', volunteerUid),
    where('ogloszenieId', '==', og.id),
  )
  const existing = await getDocs(dupQ)
  const active = existing.docs.some((d) => (d.data() as { status?: string }).status !== 'zakończone')
  if (active) return { ok: false, message: 'Masz już aktywne zgłoszenie do tego ogłoszenia.' }

  const appId = localUid()
  const orgUid = og.createdByUid ?? null
  const publicId = generateApplicationPublicId()
  await setDoc(doc(db(), 'applications', appId), {
    id: appId,
    publicId,
    ogloszenieId: og.id,
    ogloszenieTitle: og.tytul,
    organizerName: og.organizacja,
    organizerUid: orgUid,
    volunteerEmail,
    volunteerName,
    volunteerUid,
    status: 'oczekujące',
    createdAt: new Date().toISOString(),
  })

  const nid = localUid()
  await addVolunteerNotification(volunteerUid, {
    id: nid,
    title: 'Zgłoszenie wysłane',
    body: `Czeka na decyzję organizacji: „${og.tytul}”.`,
    read: false,
    createdAt: new Date().toISOString(),
    applicationId: appId,
  })
  return { ok: true }
}

export async function firebaseAcceptApplication(
  orgUid: string,
  orgName: string,
  applicationId: string,
): Promise<void> {
  const ref = doc(db(), 'applications', applicationId)
  const docSnap = await getDoc(ref)
  if (!docSnap.exists()) return
  const d = docSnap.data() as {
    organizerName?: string
    organizerUid?: string
    ogloszenieTitle?: string
    volunteerUid?: string
  }
  const allowed =
    (d.organizerUid && d.organizerUid === orgUid) ||
    (!d.organizerUid && d.organizerName === orgName)
  if (!allowed) return
  await updateDoc(ref, { status: 'zaakceptowane' })
  const vUid = d.volunteerUid
  if (vUid) {
    await addVolunteerNotification(vUid, {
      title: 'Zgłoszenie zaakceptowane',
      body: `Organizacja zaakceptowała Twój udział: „${d.ogloszenieTitle ?? ''}”.`,
      read: false,
      createdAt: new Date().toISOString(),
      applicationId,
    })
  }
}

/**
 * Jeśli do danego ogłoszenia nie ma już zgłoszeń oczekujących ani zaakceptowanych
 * — ustaw dokument ogłoszenia na `status: Zakończone`.
 * Odczyt zapytań tylko po `organizerUid` (wszystkie zgłoszenia organizacji — filtrowanie po ogłoszeniu w kodzie),
 * żeby uniknąć dodatkowych indeksów złożonych.
 */
async function firebaseMaybeFinalizeListingDocument(orgUid: string, listingId: string): Promise<void> {
  const listingIdTrim = listingId.trim()
  if (!listingIdTrim) return
  const listRef = doc(db(), 'ogloszenia', listingIdTrim)
  const listSnap = await getDoc(listRef)
  if (!listSnap.exists()) return
  if (String(listSnap.data().createdByUid ?? '') !== orgUid) return

  const appsSnap = await getDocs(query(collection(db(), 'applications'), where('organizerUid', '==', orgUid)))
  const hasActiveStill = appsSnap.docs.some((x) => {
    const od = x.data() as { ogloszenieId?: string; status?: string }
    if (String(od.ogloszenieId ?? '') !== listingIdTrim) return false
    const s = String(od.status ?? '')
    return s === 'oczekujące' || s === 'zaakceptowane'
  })
  if (hasActiveStill) return

  await updateDoc(listRef, { status: 'Zakończone' })
}

export async function firebaseCompleteApplication(
  orgUid: string,
  orgName: string,
  applicationId: string,
): Promise<void> {
  const ref = doc(db(), 'applications', applicationId)
  const docSnap = await getDoc(ref)
  if (!docSnap.exists()) return
  const d = docSnap.data() as {
    organizerName?: string
    organizerUid?: string
    ogloszenieTitle?: string
    volunteerUid?: string
    status?: string
    ogloszenieId?: string
  }
  const allowed =
    (d.organizerUid && d.organizerUid === orgUid) ||
    (!d.organizerUid && d.organizerName === orgName)
  if (!allowed || d.status !== 'zaakceptowane') return
  await updateDoc(ref, { status: 'zakończone' })
  const vUid = d.volunteerUid
  if (vUid) {
    try {
      await addVolunteerNotification(vUid, {
        title: 'Zadanie zakończone',
        body: `Potwierdzono realizację: „${d.ogloszenieTitle ?? ''}”.`,
        read: false,
        createdAt: new Date().toISOString(),
        applicationId,
      })
    } catch (e) {
      if (__DEV__) {
        const msg = e instanceof Error ? e.message : String(e)
        console.warn('[firebaseCompleteApplication] powiadomienie:', msg)
      }
    }
  }
  if (d.ogloszenieId?.trim()) {
    /** `firebaseMaybeFinalizeListingDocument` sama sprawdza `createdByUid` dokumentu ogłoszenia. */
    await firebaseMaybeFinalizeListingDocument(orgUid, String(d.ogloszenieId))
  }
}

export async function firebaseAddOgloszenie(
  ownerUid: string,
  orgName: string,
  draft: Omit<Ogloszenie, 'id' | 'kod' | 'organizacja' | 'createdByUid' | 'visibleToVolunteers'> & {
    id?: string
    kod?: string
    organizacja?: string
  },
  visibleToVolunteers: boolean,
): Promise<Ogloszenie> {
  const id = draft.id ?? localUid()
  const kod = draft.kod ?? `OG-${Math.floor(100 + Math.random() * 899)}`
  let organizerNip = ''
  let organizerKrs = ''
  try {
    const ids = await readOrganizationNipKrs(ownerUid)
    organizerNip = ids.nip
    organizerKrs = ids.krs
  } catch {
    /** Brak kolejki organizations / brak uprawnień — publikacja bez snapshotu NIP/KRS. */
  }
  const o: Ogloszenie = {
    id,
    kod,
    tytul: draft.tytul,
    organizacja: draft.organizacja ?? orgName,
    opis: draft.opis,
    data: draft.data,
    lokalizacja: draft.lokalizacja,
    kategoria: draft.kategoria,
    status: draft.status ?? 'Aktywne',
    godziny: draft.godziny,
    liczbaWolontariuszy: draft.liczbaWolontariuszy,
    wymagania: draft.wymagania,
    createdByUid: ownerUid,
    ...(organizerNip ? { organizerNip } : {}),
    ...(organizerKrs ? { organizerKrs } : {}),
    visibleToVolunteers,
    archived: false,
  }
  await setDoc(doc(db(), 'ogloszenia', id), {
    ...o,
    createdByUid: ownerUid,
    visibleToVolunteers,
    archived: false,
  })
  return o
}

export async function firebaseDeleteOgloszenie(ownerUid: string, listingId: string): Promise<void> {
  const ref = doc(db(), 'ogloszenia', listingId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Ogłoszenie nie zostało znalezione.')
  if (String(snap.data().createdByUid ?? '') !== ownerUid) {
    throw new Error('Możesz usunąć tylko własne ogłoszenia.')
  }
  await deleteDoc(ref)
}

/**
 * Ukrywa ogłoszenie z widoku wolontariuszy (archiwum) lub przywraca publikację.
 * Nie edytuje treści — według reguł Firestore tylko `archived` + `visibleToVolunteers`.
 */
export async function firebaseSetListingArchived(
  ownerUid: string,
  listingId: string,
  archived: boolean,
  organizationApprovedForPublish: boolean,
): Promise<void> {
  const ref = doc(db(), 'ogloszenia', listingId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Ogłoszenie nie zostało znalezione.')
  if (String(snap.data().createdByUid ?? '') !== ownerUid) {
    throw new Error('Możesz archiwizować tylko własne ogłoszenia.')
  }
  await updateDoc(ref, {
    archived,
    visibleToVolunteers: archived ? false : organizationApprovedForPublish,
  })
}

export async function firebaseFileComplaint(
  reporterUid: string,
  reporterEmail: string,
  c: Omit<Complaint, 'id' | 'createdAt' | 'reporterEmail' | 'reporterUid'>,
): Promise<void> {
  const refTargetId = resolveComplaintTargetId(c.refTargetId)
  await addDoc(collection(db(), 'complaints'), {
    category: c.category,
    description: c.description,
    refTargetId,
    createdAt: new Date().toISOString(),
    reporterEmail,
    reporterUid,
    moderationStatus: 'pending',
    moderatedAt: null,
  })

  /** Potwierdzenie w zakładce „Wiadomości” — działa na regule `request.auth.uid == userId` (własne powiadomienie). */
  try {
    const nid = localUid()
    await addVolunteerNotification(reporterUid, {
      id: nid,
      title: 'Skarga została przyjęta',
      body: `Dziękujemy za zgłoszenie („${c.category}”). Dotyczy: ${refTargetId}. Administrator rozpatrzy sprawę.`,
      read: false,
      createdAt: new Date().toISOString(),
    })
  } catch (e) {
    if (__DEV__) {
      const msg = e instanceof Error ? e.message : String(e)
      console.warn('[firebaseFileComplaint] powiadomienie potwierdzające:', msg)
    }
  }
}

export async function firebaseMarkNotificationRead(userId: string, notificationId: string): Promise<void> {
  await updateDoc(doc(db(), 'users', userId, 'inAppNotifications', notificationId), { read: true })
}

export async function firebaseMarkAllNotificationsRead(userId: string): Promise<void> {
  const snap = await getDocs(collection(db(), 'users', userId, 'inAppNotifications'))
  const batch = writeBatch(db())
  snap.docs.forEach((d) => {
    if (d.data().read !== true) batch.update(d.ref, { read: true })
  })
  await batch.commit()
}
