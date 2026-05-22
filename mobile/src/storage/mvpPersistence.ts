/**
 * Persystencja lokalna (AsyncStorage), gdy aplikacja działa bez połączenia z kontem w chmurze.
 * Najpierw sprawdzamy most (isAsyncStorageNativeAvailable); require pakietu bez natywu rzuca i Metro loguje ERROR.
 * Bez modułu natywnego: pamięć procesu — dane znikną po restarcie; pełna persystencja: npx expo run:android.
 */
import { isAsyncStorageNativeAvailable } from '../native/asyncStorageNativeAvailable'
import type { MvpPersistedState, StoredUser } from '../types/mvp'

type AsyncStore = {
  getItem: (key: string) => Promise<string | null>
  setItem: (key: string, value: string) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

const KEY_REGISTRY = 'pomagamy_users_registry_v1'
const KEY_CURRENT_EMAIL = 'pomagamy_current_user_email_v1'
const KEY_MVP = 'pomagamy_mvp_state_v1'

const mem = new Map<string, string>()

const memoryStore: AsyncStore = {
  getItem: async (k) => (mem.has(k) ? mem.get(k)! : null),
  setItem: async (k, v) => {
    mem.set(k, v)
  },
  removeItem: async (k) => {
    mem.delete(k)
  },
}

let storeSingleton: AsyncStore | undefined

function getStore(): AsyncStore {
  if (storeSingleton) return storeSingleton
  if (!isAsyncStorageNativeAvailable()) {
    storeSingleton = memoryStore
    return memoryStore
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    storeSingleton = require('@react-native-async-storage/async-storage').default as AsyncStore
    return storeSingleton
  } catch {
    storeSingleton = memoryStore
    return memoryStore
  }
}

export type UserRegistry = Record<string, StoredUser>

export async function loadRegistry(): Promise<UserRegistry> {
  try {
    const raw = await getStore().getItem(KEY_REGISTRY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as UserRegistry
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export async function saveRegistry(r: UserRegistry): Promise<void> {
  await getStore().setItem(KEY_REGISTRY, JSON.stringify(r))
}

export async function loadCurrentEmail(): Promise<string | null> {
  try {
    return await getStore().getItem(KEY_CURRENT_EMAIL)
  } catch {
    return null
  }
}

export async function saveCurrentEmail(email: string | null): Promise<void> {
  if (email === null) {
    await getStore().removeItem(KEY_CURRENT_EMAIL)
    return
  }
  await getStore().setItem(KEY_CURRENT_EMAIL, email.toLowerCase())
}

const emptyMvp = (): MvpPersistedState => ({
  applications: [],
  notifications: [],
  customOgloszenia: [],
  complaints: [],
})

export async function loadMvpState(): Promise<MvpPersistedState> {
  try {
    const raw = await getStore().getItem(KEY_MVP)
    if (!raw) return emptyMvp()
    const parsed = JSON.parse(raw) as MvpPersistedState
    return {
      applications: Array.isArray(parsed.applications) ? parsed.applications : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      customOgloszenia: Array.isArray(parsed.customOgloszenia) ? parsed.customOgloszenia : [],
      complaints: Array.isArray(parsed.complaints) ? parsed.complaints : [],
    }
  } catch {
    return emptyMvp()
  }
}

export async function saveMvpState(s: MvpPersistedState): Promise<void> {
  await getStore().setItem(KEY_MVP, JSON.stringify(s))
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export { uid }
