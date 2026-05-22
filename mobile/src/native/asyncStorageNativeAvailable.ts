import { NativeModules, Platform, TurboModuleRegistry } from 'react-native'

/**
 * Czy zlinkowany jest natywny moduł używany przez @react-native-async-storage/async-storage.
 * Sam pakiet JS rzuca przy imporcie, gdy go brakuje — dlatego sprawdzamy most zanim zrobimy require().
 */
export function isAsyncStorageNativeAvailable(): boolean {
  if (Platform.OS === 'web') return false
  try {
    if (typeof TurboModuleRegistry.get === 'function') {
      const t =
        TurboModuleRegistry.get('RNC_AsyncSQLiteDBStorage') ??
        TurboModuleRegistry.get('RNCAsyncStorage')
      if (t != null) return true
    }
    const nm = NativeModules as Record<string, unknown>
    return (
      nm.RNCAsyncStorage != null ||
      nm.RNC_AsyncSQLiteDBStorage != null ||
      nm.PlatformLocalStorage != null ||
      nm.AsyncSQLiteDBStorage != null ||
      nm.AsyncLocalStorage != null
    )
  } catch {
    return false
  }
}
