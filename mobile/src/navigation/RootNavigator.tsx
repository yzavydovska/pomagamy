import { useEffect, useRef, useState } from 'react'
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

async function resolveBootAdminMode(): Promise<'yes' | 'no'> {
  if (isFirebaseConfigured()) {
    const auth = getFirebaseAuth()
    if (typeof auth.authStateReady === 'function') {
      await auth.authStateReady()
    }
    const user = auth.currentUser
    if (user) {
      try {
        const role = await fetchUserRole(user.uid)
        if (role === 'admin') return 'yes'
      } catch {
        
      }
    }
    return 'no'
  }
  const local = await getAdminSession()
  return local ? 'yes' : 'no'
}

export function RootNavigator() {
  const { ready, session, authOverlay } = usePomagaMY()
  const [adminMode, setAdminMode] = useState<'unknown' | 'yes' | 'no'>('unknown')
  
  const bootRouteRef = useRef<keyof RootStackParamList | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const mode = await resolveBootAdminMode()
      if (!cancelled) setAdminMode(mode)
    })()

    if (!isFirebaseConfigured()) return () => {
      cancelled = true
    }

    const auth = getFirebaseAuth()
    const unsub = onAuthStateChanged(auth, (user) => {
      if (cancelled) return
      if (!user) {
        setAdminMode('no')
        return
      }
      void (async () => {
        try {
          const role = await fetchUserRole(user.uid)
          if (!cancelled) setAdminMode(role === 'admin' ? 'yes' : 'no')
        } catch {
          if (!cancelled) setAdminMode('no')
        }
      })()
    })

    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  if (!ready || adminMode === 'unknown') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (bootRouteRef.current === null) {
    bootRouteRef.current =
      adminMode === 'yes' ? 'AdminMain' : session ? 'Main' : 'Welcome'
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={bootRouteRef.current}
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
