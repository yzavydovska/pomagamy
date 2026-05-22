import { requireOptionalNativeModule } from 'expo-modules-core'

/**
 * Czy w binarium aplikacji jest natywny moduł expo-image-picker.
 * `require('expo-image-picker')` woła requireNativeModule('ExponentImagePicker') i rzuca — stąd sprawdzamy wcześniej.
 */
export function isExpoImagePickerNativeAvailable(): boolean {
  try {
    return requireOptionalNativeModule('ExponentImagePicker') != null
  } catch {
    return false
  }
}
