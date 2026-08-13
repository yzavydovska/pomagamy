import {
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, type DocumentSnapshot } from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from './client'
import { isFirebaseConfigured } from './env'

export type UserRole = 'admin' | 'volunteer' | 'organization'

function parseRoleFromSnap(snap: DocumentSnapshot): UserRole | null {
  if (!snap.exists()) return null
  const role = snap.data()?.role as string | undefined
  if (role === 'admin' || role === 'volunteer' || role === 'organization') {
    return role
  }
  return null
}
async function refreshAuthTokenForUid(uid: string, force = false): Promise<void> {
  const me = getFirebaseAuth().currentUser
  if (me?.uid !== uid) return
  await me.getIdToken(force).catch(() => undefined)
}

export async function fetchUserRole(uid: string): Promise<UserRole | null> {
  await refreshAuthTokenForUid(uid, true)

  const db = getFirebaseDb()
  const ref = doc(db, 'users', uid)
  let lastErr: unknown
  const attempts = 3

  for (let i = 0; i < attempts; i++) {
    try {
      const snap = await getDoc(ref)
      return parseRoleFromSnap(snap)
    } catch (e) {
      lastErr = e
      if (i === attempts - 1) break
      await new Promise<void>((r) => setTimeout(r, 250 * (i + 1)))
      await refreshAuthTokenForUid(uid, true)
    }
  }

  throw lastErr
}

export async function resolveUserRoleAfterLogin(uid: string): Promise<UserRole | null> {
  await refreshAuthTokenForUid(uid, true)
  let role = await fetchUserRole(uid)
  if (role) return role
  await new Promise<void>((r) => setTimeout(r, 450))
  await refreshAuthTokenForUid(uid, true)
  return fetchUserRole(uid)
}

export async function signInAsAdmin(email: string, password: string): Promise<User> {
  const auth = getFirebaseAuth()
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
  const role = await fetchUserRole(cred.user.uid)
  if (role !== 'admin') {
    await signOut(auth)
    throw new Error('To konto nie ma uprawnień administratora (users/{uid}.role !== "admin").')
  }
  return cred.user
}

export async function signOutFirebase(): Promise<void> {
  if (!isFirebaseConfigured()) return
  const auth = getFirebaseAuth()
  await signOut(auth)
}
