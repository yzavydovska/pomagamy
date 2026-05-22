import * as FileSystem from 'expo-file-system/legacy'

/** Kopiuje wybrane zdjęcie do katalogu dokumentów (trwały plik `file://` pod Androidem/iOS). */
export async function persistPickedAvatarLocal(sourceUri: string, registryKey: string): Promise<string> {
  const base = FileSystem.documentDirectory
  if (!base) return sourceUri
  const safe = registryKey.replace(/[^a-z0-9@._-]/gi, '_').slice(0, 80)
  const dest = `${base}avatar_${safe}.jpg`
  try {
    await FileSystem.copyAsync({ from: sourceUri, to: dest })
    return dest
  } catch {
    try {
      const base64 = await FileSystem.readAsStringAsync(sourceUri, {
        encoding: FileSystem.EncodingType.Base64,
      })
      await FileSystem.writeAsStringAsync(dest, base64, {
        encoding: FileSystem.EncodingType.Base64,
      })
      return dest
    } catch {
      return sourceUri
    }
  }
}
