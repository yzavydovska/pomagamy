import { Alert, Platform, ToastAndroid } from 'react-native'
import { isExpoClipboardNativeAvailable } from '../native/expoClipboardNativeAvailable'

export async function copyTextToClipboard(
  text: string,
  options?: { errorTitle?: string },
): Promise<boolean> {
  const t = text.trim()
  if (!t) return false

  if (!isExpoClipboardNativeAvailable()) {
    Alert.alert(
      options?.errorTitle ?? 'Schowek',
      'Ta wersja aplikacji nie ma jeszcze modułu schowka. Zainstaluj ponowny build w folderze „mobile”: npx expo run:android (lub run:ios).\n\nMożesz też zaznaczyć numer palcem na ekranie i skopiować go ręcznie.',
    )
    return false
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Clipboard = require('expo-clipboard') as typeof import('expo-clipboard')
    await Clipboard.setStringAsync(t)
    if (Platform.OS === 'android') {
      ToastAndroid.show('Skopiowano do schowka', ToastAndroid.SHORT)
    } else {
      Alert.alert('Skopiowano', 'Numer jest w schowku.')
    }
    return true
  } catch {
    Alert.alert(options?.errorTitle ?? 'Schowek', 'Nie udało się skopiować.')
    return false
  }
}
