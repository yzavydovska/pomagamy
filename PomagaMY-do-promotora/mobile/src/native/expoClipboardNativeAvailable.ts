import { requireOptionalNativeModule } from 'expo-modules-core'

export function isExpoClipboardNativeAvailable(): boolean {
  try {
    return requireOptionalNativeModule('ExpoClipboard') != null
  } catch {
    return false
  }
}
