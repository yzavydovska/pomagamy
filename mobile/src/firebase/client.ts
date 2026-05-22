import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, initializeAuth, type Auth, type Persistence } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { isAsyncStorageNativeAvailable } from '../native/asyncStorageNativeAvailable'
import { getFirebaseOptions, isFirebaseConfigured } from './env'

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined
let storage: FirebaseStorage | undefined

function getFirebaseAuthInternal(a: FirebaseApp): Auth {
  // Bez require() na pakiecie async-storage, gdy brak natywu — inaczej Metro loguje ERROR mimo try/catch.
  if (!isAsyncStorageNativeAvailable()) {
    return getAuth(a)
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AsyncStorage = require('@react-native-async-storage/async-storage').default
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getReactNativePersistence } = require('firebase/auth') as {
      getReactNativePersistence: (storage: typeof AsyncStorage) => unknown
    }
    return initializeAuth(a, {
      persistence: getReactNativePersistence(AsyncStorage) as Persistence,
    })
  } catch {
    return getAuth(a)
  }
}

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase: brak konfiguracji (ustaw zmienne EXPO_PUBLIC_FIREBASE_* w .env).')
  }
  if (!app) {
    const opts = getFirebaseOptions()!
    app = getApps().length ? getApp() : initializeApp(opts)
  }
  return app
}

export function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase: brak konfiguracji.')
  }
  if (!auth) {
    auth = getFirebaseAuthInternal(getFirebaseApp())
  }
  return auth
}

export function getFirebaseDb(): Firestore {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase: brak konfiguracji.')
  }
  if (!db) {
    db = getFirestore(getFirebaseApp())
  }
  return db
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase: brak konfiguracji.')
  }
  if (!storage) {
    storage = getStorage(getFirebaseApp())
  }
  return storage
}
