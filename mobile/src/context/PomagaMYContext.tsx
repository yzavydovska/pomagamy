import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { ogloszenia as staticOgloszenia } from '../data/ogloszenia'
import type { Ogloszenie } from '../types/ogloszenie'
import type {
  Application,
  Complaint,
  InAppNotification,
  MvpPersistedState,
  StoredUser,
} from '../types/mvp'
import {
  loadCurrentEmail,
  loadMvpState,
  loadRegistry,
  saveCurrentEmail,
  saveMvpState,
  saveRegistry,
  uid,
  type UserRegistry,
} from '../storage/mvpPersistence'
import { validateEmail, validatePasswordStrength } from '../auth/passwordPolicy'
import { ORG_REGISTRATION_STATUT_OPTIONAL } from '../config/featureFlags'
import { fetchUserRole } from '../firebase/adminAuth'
import { normalizeKrsInput, normalizeNipInput, isPlausibleKrs, nipValidationError } from '../utils/polishOrgIds'
import {
  fetchUserProfile,
  firebaseAcceptApplication,
  firebaseAddOgloszenie,
  firebaseCompleteApplication,
  firebaseDeleteOgloszenie,
  firebaseFileComplaint,
  firebaseLoginAppUser,
  firebaseLogoutAppUser,
  firebaseMarkAllNotificationsRead,
  firebaseMarkNotificationRead,
  firebaseRegisterAppUser,
  firebaseResubmitOrganizationVerification,
  firebaseSetListingArchived,
  firebaseSubmitApplication,
  firebaseUpdateUserProfile,
  subscribeMvpStateFirebase,
  subscribePublicVolunteerListingsFirebase,
} from '../firebase/appFirestore'
import { getFirebaseAuth } from '../firebase/client'
import { isFirebaseConfigured } from '../firebase/env'
import {
  applicationPublicIdFromLegacy,
  generateApplicationPublicId,
  generateLocalAccountPublicId,
  resolveComplaintTargetId,
} from '../utils/publicIds'
import { persistPickedAvatarLocal } from '../utils/avatarPersist'

type PomagaMYContextValue = {
  ready: boolean
  session: StoredUser | null
  mvp: MvpPersistedState
  /** Dane z serwera (konto) lub zapisane na urządzeniu. */
  dataSource: 'firebase' | 'local'
  /** Ogłoszenia widoczne w tej sesji (łączone wg źródła danych). */
  allOgloszenia: Ogloszenie[]
  /** Spinner warstwowy dla operacji uwierzytelniających (logowanie / wylogowanie). */
  authOverlay: { visible: boolean; message: string }
  /**
   * Pokaż pełny ekran ładowania na czas wywołania `fn`.
   * Użyj przy logowaniu lub innych blokujących krokach, żeby UI nie sprawiał wrażenia zawieszenia.
   */
  runWithAuthOverlay: (message: string, fn: () => Promise<void>) => Promise<void>
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>
  register: (data: {
    email: string
    password: string
    role: StoredUser['role']
    displayName: string
    phone: string
    organizationName?: string
    organizationNip?: string
    organizationKrs?: string
    statutAsset?: { uri: string; name: string; mimeType?: string | null } | null
  }) => Promise<{ ok: true } | { ok: false; message: string }>
  logout: () => Promise<void>
  updateProfile: (
    partial: Partial<
      Pick<StoredUser, 'displayName' | 'phone' | 'about' | 'city' | 'organizationName' | 'interests'>
    > & {
      avatarUri?: string | null
    },
  ) => Promise<void>
  submitApplication: (ogloszenie: Ogloszenie) => Promise<{ ok: true } | { ok: false; message: string }>
  acceptApplication: (applicationId: string) => Promise<void>
  completeApplication: (applicationId: string) => Promise<void>
  addOgloszenie: (
    o: Omit<Ogloszenie, 'id' | 'kod' | 'organizacja' | 'createdByUid'> & {
      id?: string
      kod?: string
      organizacja?: string
      createdByUid?: string
    },
  ) => Promise<Ogloszenie>
  deleteOgloszenie: (listingId: string) => Promise<void>
  /** Ukrycie z widoku wolontariuszy (archiwum) lub przywrócenie według weryfikacji konta. */
  setListingArchived: (listingId: string, archived: boolean) => Promise<void>
  fileComplaint: (c: Omit<Complaint, 'id' | 'createdAt' | 'reporterEmail' | 'reporterUid'> & { reporterEmail?: string }) => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  refresh: () => Promise<void>
  /** Po odrzuceniu weryfikacji przez admina — ponowne `pending` (Firebase + tryb lokalny). */
  requestOrgVerificationResubmit: () => Promise<{ ok: true } | { ok: false; message: string }>
}

const PomagaMYContext = createContext<PomagaMYContextValue | null>(null)

function mergeOgloszenia(staticList: Ogloszenie[], custom: Ogloszenie[]): Ogloszenie[] {
  const byId = new Map<string, Ogloszenie>()
  for (const o of staticList) byId.set(o.id, o)
  for (const o of custom) byId.set(o.id, o)
  return [...byId.values()]
}

function migrateLocalPersisted(
  registry: UserRegistry,
  mvpState: MvpPersistedState,
): { registry: UserRegistry; mvp: MvpPersistedState; changed: boolean } {
  let changed = false
  const reg: UserRegistry = { ...registry }
  for (const email of Object.keys(reg)) {
    const u = reg[email]
    if (!u.publicId?.trim()) {
      reg[email] = { ...u, publicId: generateLocalAccountPublicId(u.role) }
      changed = true
    }
    /** Konto organizacji sprzed weryfikacji — bez pola uznajemy za już zatwierdzone (kompatybilność). */
    if (u.role === 'organization' && u.orgVerificationStatus === undefined) {
      reg[email] = { ...reg[email], orgVerificationStatus: 'approved' }
      changed = true
    }
  }
  const applications = mvpState.applications.map((a) => {
    if (!a.publicId?.trim()) {
      changed = true
      return { ...a, publicId: applicationPublicIdFromLegacy(a.id, a.publicId) }
    }
    return a
  })
  const complaints = mvpState.complaints.map((row) => {
    const c = row as Complaint & { refOgloszenieKod?: string; refUserHint?: string }
    const ref =
      (c.refTargetId && String(c.refTargetId).trim()) ||
      (c.refOgloszenieKod && String(c.refOgloszenieKod).trim()) ||
      (c.refUserHint && String(c.refUserHint).trim()) ||
      ''
    const next: Complaint = {
      id: c.id,
      category: c.category,
      description: c.description,
      refTargetId: ref,
      createdAt: c.createdAt,
      reporterEmail: c.reporterEmail,
      reporterUid: c.reporterUid,
    }
    if (ref !== (c.refTargetId ?? '').trim()) changed = true
    return next
  })
  return {
    registry: reg,
    mvp: { ...mvpState, applications, complaints },
    changed,
  }
}

const emptyMvp = (): MvpPersistedState => ({
  applications: [],
  notifications: [],
  customOgloszenia: [],
  complaints: [],
})

export function PomagaMYProvider({ children }: { children: ReactNode }) {
  const useCloud = isFirebaseConfigured()
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<StoredUser | null>(null)
  const [mvp, setMvp] = useState<MvpPersistedState>(emptyMvp())
  const [authOverlay, setAuthOverlay] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: '',
  })
  const mvpUnsubRef = useRef<(() => void) | null>(null)
  const publicListingsUnsubRef = useRef<(() => void) | null>(null)

  const runWithAuthOverlay = useCallback(async (message: string, fn: () => Promise<void>) => {
    setAuthOverlay({ visible: true, message })
    try {
      await fn()
    } finally {
      /** Krótka zwłoka zmniega „mruganie”, gdy nawigacja przełączy się zaraz po zakończeniu. */
      await new Promise<void>((resolve) => setTimeout(resolve, 180))
      setAuthOverlay({ visible: false, message: '' })
    }
  }, [])

  const refresh = useCallback(async () => {
    if (useCloud) {
      const auth = getFirebaseAuth()
      const u = auth.currentUser
      if (!u) {
        setSession(null)
        setMvp(emptyMvp())
        publicListingsUnsubRef.current?.()
        publicListingsUnsubRef.current = subscribePublicVolunteerListingsFirebase((items) => {
          setMvp((prev) => ({ ...prev, customOgloszenia: items }))
        })
        return
      }
      const role = await fetchUserRole(u.uid)
      if (role === 'admin' || (role !== 'volunteer' && role !== 'organization')) {
        setSession(null)
        return
      }
      const profile = await fetchUserProfile(u.uid)
      if (profile?.accountSuspended === true) {
        await firebaseLogoutAppUser()
        setSession(null)
        setMvp(emptyMvp())
        publicListingsUnsubRef.current?.()
        publicListingsUnsubRef.current = subscribePublicVolunteerListingsFirebase((items) => {
          setMvp((prev) => ({ ...prev, customOgloszenia: items }))
        })
        return
      }
      if (profile) setSession(profile)
      return
    }
    const [registry, email, mvpState] = await Promise.all([
      loadRegistry(),
      loadCurrentEmail(),
      loadMvpState(),
    ])
    const migrated = migrateLocalPersisted(registry, mvpState)
    if (migrated.changed) {
      await saveRegistry(migrated.registry)
      await saveMvpState(migrated.mvp)
    }
    setMvp(migrated.mvp)
    if (email && migrated.registry[email]) {
      setSession({ ...migrated.registry[email] })
    } else {
      setSession(null)
    }
  }, [useCloud])

  useEffect(() => {
    if (useCloud) return
    let alive = true
    ;(async () => {
      await refresh()
      if (alive) setReady(true)
    })()
    return () => {
      alive = false
    }
  }, [refresh, useCloud])

  useEffect(() => {
    if (!useCloud) return
    const auth = getFirebaseAuth()
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      mvpUnsubRef.current?.()
      mvpUnsubRef.current = null
      publicListingsUnsubRef.current?.()
      publicListingsUnsubRef.current = null
      if (!user) {
        setSession(null)
        setMvp(emptyMvp())
        publicListingsUnsubRef.current = subscribePublicVolunteerListingsFirebase((items) => {
          setMvp((prev) => ({ ...prev, customOgloszenia: items }))
        })
        setReady(true)
        return
      }
      try {
        const role = await fetchUserRole(user.uid)
        if (role === 'admin') {
          setSession(null)
          setMvp(emptyMvp())
          return
        }
        if (role !== 'volunteer' && role !== 'organization') {
          setSession(null)
          setMvp(emptyMvp())
          return
        }
        const profile = await fetchUserProfile(user.uid)
        if (!profile) {
          setSession(null)
          setMvp(emptyMvp())
          return
        }
        if (profile.accountSuspended === true) {
          await firebaseLogoutAppUser()
          setSession(null)
          setMvp(emptyMvp())
          publicListingsUnsubRef.current = subscribePublicVolunteerListingsFirebase((items) => {
            setMvp((prev) => ({ ...prev, customOgloszenia: items }))
          })
          return
        }
        setSession(profile)
        const unsubMvp = subscribeMvpStateFirebase(user.uid, role, setMvp)
        mvpUnsubRef.current = unsubMvp
      } finally {
        setReady(true)
      }
    })
    return () => {
      unsubAuth()
      mvpUnsubRef.current?.()
      mvpUnsubRef.current = null
      publicListingsUnsubRef.current?.()
      publicListingsUnsubRef.current = null
    }
  }, [useCloud])

  const persistMvp = useCallback(
    async (next: MvpPersistedState) => {
      if (useCloud) return
      setMvp(next)
      await saveMvpState(next)
    },
    [useCloud],
  )

  const login = useCallback(
    async (email: string, password: string) => {
      const key = email.trim().toLowerCase()
      if (!validateEmail(key)) return { ok: false as const, message: 'Podaj poprawny e-mail.' }
      if (useCloud) return firebaseLoginAppUser(key, password)
      const registry = await loadRegistry()
      const user = registry[key]
      if (!user || user.password !== password) {
        return { ok: false as const, message: 'Nieprawidłowy e-mail lub hasło.' }
      }
      await saveCurrentEmail(key)
      setSession({ ...user })
      return { ok: true as const }
    },
    [useCloud],
  )

  const register = useCallback(
    async (data: {
      email: string
      password: string
      role: StoredUser['role']
      displayName: string
      phone: string
      organizationName?: string
      organizationNip?: string
      organizationKrs?: string
      statutAsset?: { uri: string; name: string; mimeType?: string | null } | null
    }) => {
      const key = data.email.trim().toLowerCase()
      if (!validateEmail(key)) return { ok: false as const, message: 'Podaj poprawny e-mail.' }
      const pw = validatePasswordStrength(data.password)
      if (!pw.ok) return { ok: false as const, message: pw.message }
      if (data.role === 'organization' && !(data.organizationName ?? '').trim()) {
        return { ok: false as const, message: 'Podaj nazwę organizacji.' }
      }
      if (data.role === 'organization') {
        const nipErr = nipValidationError(data.organizationNip ?? '')
        const krsOk = normalizeKrsInput(data.organizationKrs ?? '')
        if (nipErr) {
          return { ok: false as const, message: nipErr }
        }
        if (!isPlausibleKrs(krsOk)) {
          return { ok: false as const, message: 'Podaj poprawny numer KRS (9–10 cyfr).' }
        }
        if (!ORG_REGISTRATION_STATUT_OPTIONAL && !data.statutAsset?.uri) {
          return {
            ok: false as const,
            message: 'Dołącz plik statutu (PDF lub zdjęcie), aby kontynuować rejestrację organizacji.',
          }
        }
      }
      if (useCloud) {
        const fr = await firebaseRegisterAppUser({
          email: key,
          password: data.password,
          role: data.role,
          displayName: data.displayName,
          phone: data.phone,
          organizationName: data.organizationName,
          organizationNip: data.organizationNip,
          organizationKrs: data.organizationKrs,
          statutAsset: data.statutAsset,
        })
        if (!fr.ok) return { ok: false as const, message: fr.message }
        return { ok: true as const }
      }
      const registry = await loadRegistry()
      if (registry[key]) return { ok: false as const, message: 'Konto z tym adresem e-mail już istnieje.' }
      const user: StoredUser = {
        email: key,
        password: data.password,
        role: data.role,
        displayName: data.displayName.trim(),
        phone: data.phone.trim(),
        publicId: generateLocalAccountPublicId(data.role),
        organizationName:
          data.role === 'organization' ? (data.organizationName ?? '').trim() : undefined,
        about: '',
        city: '',
        interests: data.role === 'volunteer' ? [] : undefined,
        orgVerificationStatus: data.role === 'organization' ? 'pending' : undefined,
        orgNip: data.role === 'organization' ? normalizeNipInput(data.organizationNip ?? '') : undefined,
        orgKrs: data.role === 'organization' ? normalizeKrsInput(data.organizationKrs ?? '') : undefined,
        orgStatutLabel:
          data.role === 'organization' && data.statutAsset?.name
            ? data.statutAsset.name.trim()
            : undefined,
      }
      const nextReg: UserRegistry = { ...registry, [key]: user }
      await saveRegistry(nextReg)
      await saveCurrentEmail(key)
      setSession(user)
      return { ok: true as const }
    },
    [useCloud],
  )

  const logout = useCallback(async () => {
    await runWithAuthOverlay('Wylogowywanie…', async () => {
      if (useCloud) {
        await firebaseLogoutAppUser()
        return
      }
      await saveCurrentEmail(null)
      setSession(null)
    })
  }, [useCloud, runWithAuthOverlay])

  const updateProfile = useCallback(
    async (
      partial: Partial<
        Pick<StoredUser, 'displayName' | 'phone' | 'about' | 'city' | 'organizationName' | 'interests'>
      > & {
        avatarUri?: string | null
      },
    ) => {
      if (!session) return
      if (useCloud) {
        const u = getFirebaseAuth().currentUser
        if (!u) return
        await firebaseUpdateUserProfile(u.uid, partial)
        const profile = await fetchUserProfile(u.uid)
        if (profile) setSession(profile)
        return
      }
      const registry = await loadRegistry()
      const key = session.email.toLowerCase()
      const prev = registry[key]
      if (!prev) return
      const merged: StoredUser = { ...prev }
      if (partial.displayName !== undefined) merged.displayName = partial.displayName
      if (partial.phone !== undefined) merged.phone = partial.phone
      if (partial.about !== undefined) merged.about = partial.about
      if (partial.city !== undefined) merged.city = partial.city
      if (partial.organizationName !== undefined) merged.organizationName = partial.organizationName
      if (partial.interests !== undefined) merged.interests = [...partial.interests]
      if (partial.avatarUri !== undefined) {
        if (partial.avatarUri === null || partial.avatarUri === '') {
          delete merged.avatarUri
        } else {
          merged.avatarUri = await persistPickedAvatarLocal(partial.avatarUri, key)
        }
      }
      await saveRegistry({ ...registry, [key]: merged })
      setSession(merged)
    },
    [session, useCloud],
  )

  const requestOrgVerificationResubmit = useCallback(async () => {
    if (!session || session.role !== 'organization') {
      return { ok: false as const, message: 'Ta opcja dotyczy kont organizacji.' }
    }
    if (session.orgVerificationStatus !== 'rejected') {
      return {
        ok: false as const,
        message: 'Ponowne zgłoszenie jest potrzebne tylko po odrzuceniu przez administratora.',
      }
    }
    if (useCloud) {
      const u = getFirebaseAuth().currentUser
      if (!u) return { ok: false as const, message: 'Zaloguj się ponownie.' }
      const r = await firebaseResubmitOrganizationVerification(u.uid)
      if (!r.ok) return r
      const profile = await fetchUserProfile(u.uid)
      if (profile) setSession(profile)
      return { ok: true as const }
    }
    const registry = await loadRegistry()
    const key = session.email.toLowerCase()
    const prev = registry[key]
    if (!prev || prev.role !== 'organization') {
      return { ok: false as const, message: 'Nie znaleziono konta w rejestrze lokalnym.' }
    }
    await saveRegistry({
      ...registry,
      [key]: (() => {
        const merged: StoredUser = { ...prev, orgVerificationStatus: 'pending' }
        delete merged.orgVerificationRejectionReason
        return merged
      })(),
    })
    const nextSession = { ...session, orgVerificationStatus: 'pending' as const }
    delete nextSession.orgVerificationRejectionReason
    setSession(nextSession)
    return { ok: true as const }
  }, [session, useCloud])

  const submitApplication = useCallback(
    async (og: Ogloszenie) => {
      if (!session) {
        return { ok: false as const, message: 'Zaloguj się, aby pomóc.' }
      }
      if (session.role !== 'volunteer') {
        return { ok: false as const, message: 'Tylko wolontariusz może zgłaszać chęć udziału w zadaniu.' }
      }
      if (useCloud) {
        const u = getFirebaseAuth().currentUser
        if (!u) return { ok: false as const, message: 'Brak sesji.' }
        return firebaseSubmitApplication(u.uid, session.email, session.displayName, og)
      }
      const exists = mvp.applications.some(
        (a) => a.ogloszenieId === og.id && a.volunteerEmail === session.email && a.status !== 'zakończone',
      )
      if (exists) return { ok: false as const, message: 'Masz już aktywne zgłoszenie do tego ogłoszenia.' }
      if (og.status === 'Zakończone') {
        return {
          ok: false as const,
          message: 'Ogłoszenie jest zamknięte — nie można wysłać zgłoszenia.',
        }
      }
      const app: Application = {
        id: uid(),
        publicId: generateApplicationPublicId(),
        ogloszenieId: og.id,
        ogloszenieTitle: og.tytul,
        organizerName: og.organizacja,
        volunteerEmail: session.email,
        volunteerName: session.displayName,
        status: 'oczekujące',
        createdAt: new Date().toISOString(),
      }
      const notice: InAppNotification = {
        id: uid(),
        title: 'Zgłoszenie wysłane',
        body: `Czeka na decyzję organizacji: „${og.tytul}”.`,
        read: false,
        createdAt: new Date().toISOString(),
        applicationId: app.id,
      }
      const next: MvpPersistedState = {
        ...mvp,
        applications: [...mvp.applications, app],
        notifications: [notice, ...mvp.notifications],
      }
      await persistMvp(next)
      return { ok: true as const }
    },
    [mvp, persistMvp, session, useCloud],
  )

  const acceptApplicationImpl = useCallback(
    async (applicationId: string) => {
      if (!session || session.role !== 'organization') return
      const orgName = session.organizationName ?? session.displayName
      if (useCloud) {
        const u = getFirebaseAuth().currentUser
        if (!u) return
        await firebaseAcceptApplication(u.uid, orgName, applicationId)
        return
      }
      const target = mvp.applications.find((a) => a.id === applicationId)
      if (!target || target.organizerName !== orgName) return
      const nextApps = mvp.applications.map((a) =>
        a.id === applicationId ? { ...a, status: 'zaakceptowane' as const } : a,
      )
      const n: InAppNotification = {
        id: uid(),
        title: 'Zgłoszenie zaakceptowane',
        body: `Organizacja zaakceptowała Twój udział: „${target.ogloszenieTitle}”.`,
        read: false,
        createdAt: new Date().toISOString(),
        applicationId: target.id,
      }
      await persistMvp({ ...mvp, applications: nextApps, notifications: [n, ...mvp.notifications] })
    },
    [mvp, persistMvp, session, useCloud],
  )

  const completeApplication = useCallback(
    async (applicationId: string) => {
      if (!session || session.role !== 'organization') return
      const orgName = session.organizationName ?? session.displayName
      if (useCloud) {
        const u = getFirebaseAuth().currentUser
        if (!u) return
        await firebaseCompleteApplication(u.uid, orgName, applicationId)
        return
      }
      const target = mvp.applications.find((a) => a.id === applicationId)
      if (!target || target.status !== 'zaakceptowane' || target.organizerName !== orgName) return
      const nextApps = mvp.applications.map((a) =>
        a.id === applicationId ? { ...a, status: 'zakończone' as const } : a,
      )
      const hasActiveStill = nextApps.some(
        (a) =>
          a.ogloszenieId === target.ogloszenieId &&
          a.organizerName === orgName &&
          (a.status === 'oczekujące' || a.status === 'zaakceptowane'),
      )
      const customOgloszenia = !hasActiveStill
        ? mvp.customOgloszenia.map((o) =>
            o.id === target.ogloszenieId ? { ...o, status: 'Zakończone' as const } : o,
          )
        : mvp.customOgloszenia
      const n: InAppNotification = {
        id: uid(),
        title: 'Zadanie zakończone',
        body: `Potwierdzono realizację: „${target.ogloszenieTitle}”.`,
        read: false,
        createdAt: new Date().toISOString(),
        applicationId: target.id,
      }
      await persistMvp({
        ...mvp,
        applications: nextApps,
        customOgloszenia,
        notifications: [n, ...mvp.notifications],
      })
    },
    [mvp, persistMvp, session, useCloud],
  )

  const addOgloszenie = useCallback(
    async (
      draft: Omit<Ogloszenie, 'id' | 'kod' | 'organizacja' | 'createdByUid'> & {
        id?: string
        kod?: string
        organizacja?: string
        createdByUid?: string
      },
    ) => {
      if (!session || session.role !== 'organization') throw new Error('Brak uprawnień.')
      const orgName = session.organizationName ?? session.displayName
      if (useCloud) {
        const u = getFirebaseAuth().currentUser
        if (!u) throw new Error('Brak sesji.')
        const visible = session.orgVerificationStatus === 'approved'
        return firebaseAddOgloszenie(u.uid, orgName, draft, visible)
      }
      const visible = session.orgVerificationStatus === 'approved'
      const nip = normalizeNipInput(session.orgNip ?? '')
      const krs = normalizeKrsInput(session.orgKrs ?? '')
      const o: Ogloszenie = {
        id: draft.id ?? uid(),
        kod: draft.kod ?? `OG-${Math.floor(100 + Math.random() * 899)}`,
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
        ...(nip ? { organizerNip: nip } : {}),
        ...(krs ? { organizerKrs: krs } : {}),
        visibleToVolunteers: visible,
        archived: false,
      }
      const next: MvpPersistedState = {
        ...mvp,
        customOgloszenia: [o, ...mvp.customOgloszenia],
      }
      await persistMvp(next)
      return o
    },
    [mvp, persistMvp, session, useCloud],
  )

  const deleteOgloszenie = useCallback(
    async (listingId: string) => {
      if (!session || session.role !== 'organization') throw new Error('Brak uprawnień.')
      const orgName = session.organizationName ?? session.displayName
      if (useCloud) {
        const u = getFirebaseAuth().currentUser
        if (!u) throw new Error('Brak sesji.')
        await firebaseDeleteOgloszenie(u.uid, listingId)
        return
      }
      const prev = mvp.customOgloszenia.find((o) => o.id === listingId)
      if (!prev || prev.organizacja !== orgName) {
        throw new Error('Nie można usunąć tego ogłoszenia.')
      }
      await persistMvp({
        ...mvp,
        customOgloszenia: mvp.customOgloszenia.filter((o) => o.id !== listingId),
      })
    },
    [mvp, persistMvp, session, useCloud],
  )

  const setListingArchived = useCallback(
    async (listingId: string, archived: boolean) => {
      if (!session || session.role !== 'organization') throw new Error('Brak uprawnień.')
      const orgName = session.organizationName ?? session.displayName
      const orgApprovedForPublish = session.orgVerificationStatus === 'approved'
      if (useCloud) {
        const u = getFirebaseAuth().currentUser
        if (!u) throw new Error('Brak sesji.')
        await firebaseSetListingArchived(u.uid, listingId, archived, orgApprovedForPublish)
        return
      }
      const prev = mvp.customOgloszenia.find((o) => o.id === listingId)
      if (!prev || prev.organizacja !== orgName) {
        throw new Error('Nie można zmienić archiwum tego ogłoszenia.')
      }
      const merged = mvp.customOgloszenia.map((o) =>
        o.id === listingId
          ? {
              ...o,
              archived,
              visibleToVolunteers: archived ? false : orgApprovedForPublish,
            }
          : o,
      )
      await persistMvp({ ...mvp, customOgloszenia: merged })
    },
    [mvp, persistMvp, session, useCloud],
  )

  const fileComplaint = useCallback(
    async (
      c: Omit<Complaint, 'id' | 'createdAt' | 'reporterEmail' | 'reporterUid'> & {
        reporterEmail?: string
      },
    ) => {
      if (useCloud) {
        const u = getFirebaseAuth().currentUser
        if (!u) throw new Error('Zaloguj się, aby zgłosić skargę.')
        const role = await fetchUserRole(u.uid)
        if (role === 'admin') {
          throw new Error('Konto administratora nie może składać skarg w aplikacji.')
        }
        const email =
          (c.reporterEmail?.trim() || session?.email?.trim() || u.email?.trim() || '').trim()
        await firebaseFileComplaint(u.uid, email || '(brak adresu)', c)
        return
      }
      if (!session) throw new Error('Zaloguj się, aby zgłosić skargę.')
      const complaint: Complaint = {
        ...c,
        refTargetId: resolveComplaintTargetId(c.refTargetId),
        id: uid(),
        createdAt: new Date().toISOString(),
        reporterEmail: c.reporterEmail ?? session.email,
      }
      const receipt: InAppNotification = {
        id: uid(),
        title: 'Skarga została przyjęta',
        body: `Dziękujemy za zgłoszenie („${c.category}”). Dotyczy: ${complaint.refTargetId}. Administrator rozpatrzy sprawę.`,
        read: false,
        createdAt: new Date().toISOString(),
      }
      const next = {
        ...mvp,
        complaints: [complaint, ...mvp.complaints],
        notifications: [receipt, ...mvp.notifications],
      }
      await persistMvp(next)
    },
    [mvp, persistMvp, session, useCloud],
  )

  const markNotificationRead = useCallback(
    async (id: string) => {
      if (useCloud) {
        const u = getFirebaseAuth().currentUser
        if (!u) return
        await firebaseMarkNotificationRead(u.uid, id)
        return
      }
      const next = {
        ...mvp,
        notifications: mvp.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }
      await persistMvp(next)
    },
    [mvp, persistMvp, useCloud],
  )

  const markAllNotificationsRead = useCallback(async () => {
    if (useCloud) {
      const u = getFirebaseAuth().currentUser
      if (!u) return
      await firebaseMarkAllNotificationsRead(u.uid)
      return
    }
    const next = {
      ...mvp,
      notifications: mvp.notifications.map((n) => ({ ...n, read: true })),
    }
    await persistMvp(next)
  }, [mvp, persistMvp, useCloud])

  const allOgloszenia = useMemo(() => {
    if (useCloud) return mvp.customOgloszenia
    const merged = mergeOgloszenia(staticOgloszenia, mvp.customOgloszenia)
    if (session?.role === 'volunteer') {
      return merged.filter((o) => o.visibleToVolunteers !== false && o.archived !== true)
    }
    return merged
  }, [mvp.customOgloszenia, useCloud, session?.role])

  const value = useMemo<PomagaMYContextValue>(
    () => ({
      ready,
      session,
      mvp,
      dataSource: useCloud ? 'firebase' : 'local',
      allOgloszenia,
      authOverlay,
      runWithAuthOverlay,
      login,
      register,
      logout,
      updateProfile,
      submitApplication,
      acceptApplication: acceptApplicationImpl,
      completeApplication,
      addOgloszenie,
      deleteOgloszenie,
      setListingArchived,
      fileComplaint,
      markNotificationRead,
      markAllNotificationsRead,
      refresh,
      requestOrgVerificationResubmit,
    }),
    [
      ready,
      session,
      mvp,
      useCloud,
      allOgloszenia,
      authOverlay,
      runWithAuthOverlay,
      login,
      register,
      logout,
      updateProfile,
      submitApplication,
      acceptApplicationImpl,
      completeApplication,
      addOgloszenie,
      deleteOgloszenie,
      setListingArchived,
      fileComplaint,
      markNotificationRead,
      markAllNotificationsRead,
      refresh,
      requestOrgVerificationResubmit,
    ],
  )

  return <PomagaMYContext.Provider value={value}>{children}</PomagaMYContext.Provider>
}

export function usePomagaMY(): PomagaMYContextValue {
  const ctx = useContext(PomagaMYContext)
  if (!ctx) throw new Error('usePomagaMY wymaga PomagaMYProvider')
  return ctx
}
