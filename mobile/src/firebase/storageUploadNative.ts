import * as FileSystem from 'expo-file-system/legacy'
import { getFirebaseAuth } from './client'
import { getFirebaseOptions } from './env'

function storageBucketName(): string {
  const bucket = getFirebaseOptions()?.storageBucket?.trim()
  if (!bucket) throw new Error('Brak EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET w pliku .env.')
  return bucket
}

function guessImageContentType(uri: string): string {
  const lower = uri.split('?')[0].toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

async function ensureFileUri(uri: string): Promise<string> {
  if (uri.startsWith('file://')) return uri
  const base = FileSystem.cacheDirectory
  if (!base) throw new Error('Brak katalogu tymczasowego na urządzeniu.')
  const dest = `${base}upload_${Date.now()}.bin`
  try {
    await FileSystem.copyAsync({ from: uri, to: dest })
    return dest
  } catch {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    if (!base64) throw new Error('Nie udało się odczytać pliku ze urządzenia.')
    await FileSystem.writeAsStringAsync(dest, base64, {
      encoding: FileSystem.EncodingType.Base64,
    })
    return dest
  }
}

function downloadUrlFromUploadResponse(bucket: string, body: string): string {
  const parsed = JSON.parse(body) as {
    name?: string
    downloadTokens?: string
    error?: { message?: string }
  }
  if (parsed.error?.message) throw new Error(parsed.error.message)
  const name = parsed.name
  const token = parsed.downloadTokens
  if (!name || !token) throw new Error('Nieprawidłowa odpowiedź Firebase Storage.')
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(name)}?alt=media&token=${token}`
}

export async function uploadLocalFileToStorage(
  storagePath: string,
  localUri: string,
  contentType: string,
  maxBytes: number,
): Promise<string> {
  const auth = getFirebaseAuth().currentUser
  if (!auth) throw new Error('Zaloguj się ponownie.')

  const fileUri = await ensureFileUri(localUri)
  const info = await FileSystem.getInfoAsync(fileUri)
  if (!info.exists) throw new Error('Nie znaleziono pliku do przesłania.')
  if (typeof info.size === 'number' && info.size > maxBytes) {
    throw new Error(`Plik jest za duży (max ${Math.round(maxBytes / (1024 * 1024))} MB).`)
  }

  const bucket = storageBucketName()
  const token = await auth.getIdToken()
  const url =
    `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o` +
    `?uploadType=media&name=${encodeURIComponent(storagePath)}`

  const mt =
    contentType && contentType !== 'application/octet-stream'
      ? contentType
      : guessImageContentType(localUri)

  const response = await FileSystem.uploadAsync(url, fileUri, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': mt,
    },
  })

  if (response.status < 200 || response.status >= 300) {
    let message = `Upload nie powiódł się (HTTP ${response.status}).`
    try {
      const err = JSON.parse(response.body) as { error?: { message?: string } }
      if (err.error?.message) message = err.error.message
    } catch {
      void 0
    }
    if (response.status === 403) {
      message =
        'Brak uprawnień do przesłania pliku. Opublikuj reguły z pliku mobile/storage.rules w Firebase Console → Storage → Reguły.'
    }
    throw new Error(message)
  }

  return downloadUrlFromUploadResponse(bucket, response.body)
}
