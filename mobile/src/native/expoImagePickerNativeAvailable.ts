import { requireOptionalNativeModule } from 'expo-modules-core'

export function isExpoImagePickerNativeAvailable(): boolean {
  try {
    return requireOptionalNativeModule('ExponentImagePicker') != null
  } catch {
    return false
  }
}
