import type { FirebaseOptions } from 'firebase/app'

/** Wszystkie zmienne muszą mieć prefiks EXPO_PUBLIC_ (Expo wstrzykuje je przy bundlowaniu). */
export function getFirebaseOptions(): FirebaseOptions | null {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
  const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
  const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID

  if (!apiKey || !projectId) return null

  return {
    apiKey,
    authDomain: authDomain ?? `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: storageBucket ?? `${projectId}.appspot.com`,
    messagingSenderId: messagingSenderId ?? '',
    appId: appId ?? '',
  }
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseOptions() !== null
}
