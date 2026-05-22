import {
  deleteAsync,
  documentDirectory,
  getInfoAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from 'expo-file-system/legacy'

const FILE_NAME = 'pomagamy-admin-session-v1.json'

function sessionFileUri(): string | null {
  if (!documentDirectory) return null
  return `${documentDirectory}${FILE_NAME}`
}

export type AdminSessionPayload = {
  email: string
  savedAt: number
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const path = sessionFileUri()
  if (!path) return null
  try {
    const info = await getInfoAsync(path)
    if (!info.exists) return null
    const raw = await readAsStringAsync(path)
    const parsed = JSON.parse(raw) as AdminSessionPayload
    if (parsed && typeof parsed.email === 'string') return parsed
    return null
  } catch {
    return null
  }
}

export async function persistAdminSession(email: string): Promise<void> {
  const path = sessionFileUri()
  if (!path) {
    throw new Error('Brak ścieżki dokumentów — sesja nie może być zapisana.')
  }
  const payload: AdminSessionPayload = { email, savedAt: Date.now() }
  await writeAsStringAsync(path, JSON.stringify(payload))
}

export async function clearAdminSession(): Promise<void> {
  const path = sessionFileUri()
  if (!path) return
  try {
    const info = await getInfoAsync(path)
    if (info.exists) {
      await deleteAsync(path, { idempotent: true })
    }
  } catch {
    // ignore
  }
}
