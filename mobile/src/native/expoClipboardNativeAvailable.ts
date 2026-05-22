import { requireOptionalNativeModule } from 'expo-modules-core'

/** Czy w binarium jest natywny moduł expo-clipboard (po npx expo run:android / run:ios). */
export function isExpoClipboardNativeAvailable(): boolean {
  try {
    return requireOptionalNativeModule('ExpoClipboard') != null
  } catch {
    return false
  }
}
