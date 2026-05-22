import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { onAuthStateChanged } from 'firebase/auth'
import type { RootStackParamList } from './types'
import { getAdminSession } from '../auth/adminSession'
import { getFirebaseAuth } from '../firebase/client'
import { fetchUserRole } from '../firebase/adminAuth'
import { isFirebaseConfigured } from '../firebase/env'
import { usePomagaMY } from '../context/PomagaMYContext'
import { AuthBlockingOverlay } from '../components/AuthBlockingOverlay'
import { WelcomeScreen } from '../screens/WelcomeScreen'
import { LoginScreen } from '../screens/LoginScreen'
import { RegisterScreen } from '../screens/RegisterScreen'
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen'
import { AdminLoginScreen } from '../screens/AdminLoginScreen'
import { AdminMainStack } from './AdminMainStack'
import { MainTabs } from './MainTabs'
import { EditProfileScreen } from '../screens/EditProfileScreen'
import { ReportComplaintScreen } from '../screens/ReportComplaintScreen'

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  const { ready, session, authOverlay } = usePomagaMY()
  const [adminMode, setAdminMode] = useState<'unknown' | 'yes' | 'no'>('unknown')

  useEffect(() => {
    let cancelled = false

    if (isFirebaseConfigured()) {
      const auth = getFirebaseAuth()
      const unsub = onAuthStateChanged(auth, async (user) => {
        if (cancelled) return
        if (user) {
          try {
            const role = await fetchUserRole(user.uid)
            if (role === 'admin') {
              setAdminMode('yes')
              return
            }
          } catch {
            // brak sieci / reguł — nie traktuj jako panel admina
          }
        }
        // Przy włączonym Firebase panel admina tylko po zalogowaniu kontem z users/{uid}.role == "admin".
        // Plik adminSession (tryb bez Firebase) nie może tu otwierać AdminMain — inaczej brak currentUser i zera na dashboardzie.
        setAdminMode('no')
      })
      return () => {
        cancelled = true
        unsub()
      }
    }

    ;(async () => {
      const local = await getAdminSession()
      if (!cancelled) setAdminMode(local ? 'yes' : 'no')
    })()

    return () => {
      cancelled = true
    }
  }, [])

  if (!ready || adminMode === 'unknown') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  const initialRoute: keyof RootStackParamList =
    adminMode === 'yes' ? 'AdminMain' : session ? 'Main' : 'Welcome'

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        key={`${adminMode}-${session?.email ?? 'guest'}`}
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="AdminMain" component={AdminMainStack} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="ReportComplaint" component={ReportComplaintScreen} />
      </Stack.Navigator>
      <AuthBlockingOverlay visible={authOverlay.visible} message={authOverlay.message} />
    </View>
  )
}
