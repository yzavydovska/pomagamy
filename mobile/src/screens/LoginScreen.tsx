import { useState } from 'react'
import {
  Alert,
  InteractionManager,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { CommonActions } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { AuthHeader } from '../components/AuthHeader'
import { usePomagaMY } from '../context/PomagaMYContext'
import { fetchUserRole } from '../firebase/adminAuth'
import { getFirebaseAuth } from '../firebase/client'
import { isFirebaseConfigured } from '../firebase/env'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

function resetRootStack(navigation: Props['navigation'], route: keyof RootStackParamList) {
  let p = navigation as ReturnType<Props['navigation']['getParent']> | typeof navigation
  let current: typeof navigation = navigation
  while (current.getParent?.()) {
    current = current.getParent()!
    p = current
  }
  ;(p as Props['navigation']).dispatch(CommonActions.reset({ index: 0, routes: [{ name: route }] }))
}

export function LoginScreen({ navigation }: Props) {
  const { login, runWithAuthOverlay } = usePomagaMY()
  const [secure, setSecure] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  /** Zapas na Androidzie, gdzie Alert po await bywa niewidoczny bez odroczenia. */
  const [inlineError, setInlineError] = useState<string | null>(null)

  const openLoginFailedAlert = (message: string) => {
    const previewCta = isFirebaseConfigured()
      ? 'Podgląd — bez konta'
      : 'Kontynuuj bez logowania'
    const fullMessage = `${message}\n\nMożesz obejrzeć aplikację bez logowania (podgląd — np. lista ogłoszeń). Pełne funkcje po zalogowaniu.`
    const buttons = [
      { text: 'Spróbuj ponownie', style: 'cancel' as const },
      {
        text: previewCta,
        onPress: () => navigation.replace('Main'),
      },
    ]
    const show = () => Alert.alert('Coś poszło nie tak', fullMessage, buttons)
    // Po zamknięciu klawiatury / zakończeniu interakcji Alert na Androidzie nie ginie.
    InteractionManager.runAfterInteractions(() => {
      if (Platform.OS === 'android') {
        setTimeout(show, 50)
      } else {
        show()
      }
    })
  }

  const onSubmit = async () => {
    setInlineError(null)
    try {
      await runWithAuthOverlay('Logowanie…', async () => {
        const res = await login(email.trim(), password)
        if (!res.ok) {
          setInlineError(res.message)
          openLoginFailedAlert(res.message)
          return
        }
        if (isFirebaseConfigured()) {
          const auth = getFirebaseAuth()
          if (typeof auth.authStateReady === 'function') {
            await auth.authStateReady()
          }
          const u = auth.currentUser
          const role = u ? await fetchUserRole(u.uid) : null
          resetRootStack(navigation, role === 'admin' ? 'AdminMain' : 'Main')
        } else {
          navigation.replace('Main')
        }
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Nie udało się zalogować. Spróbuj ponownie.'
      setInlineError(msg)
      InteractionManager.runAfterInteractions(() => {
        if (Platform.OS === 'android') {
          setTimeout(() => Alert.alert('Logowanie', msg), 50)
        } else {
          Alert.alert('Logowanie', msg)
        }
      })
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthHeader title="Logowanie" onBack={() => navigation.goBack()} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="hand-left-outline" size={48} color={colors.text} />
        </View>
        <Text style={styles.h1}>Witaj ponownie</Text>
        <Text style={styles.sub}>Zaloguj się, aby korzystać z aplikacji.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textLight}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(t) => {
            setEmail(t)
            setInlineError(null)
          }}
        />
        <View style={styles.passRow}>
          <TextInput
            style={[styles.input, styles.inputInRow]}
            placeholder="Hasło"
            placeholderTextColor={colors.textLight}
            secureTextEntry={secure}
            value={password}
            onChangeText={(t) => {
              setPassword(t)
              setInlineError(null)
            }}
          />
          <Pressable style={styles.eye} onPress={() => setSecure((s) => !s)} hitSlop={8}>
            <Ionicons name={secure ? 'eye-off-outline' : 'eye-outline'} size={24} color={colors.textMuted} />
          </Pressable>
        </View>

        <Pressable
          style={styles.forgot}
          onPress={() => navigation.navigate('ForgotPassword')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.forgotText}>Zapomniałeś hasła?</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.94 }]}
          onPress={() => void onSubmit()}
        >
          <Text style={styles.btnText}>Zaloguj się</Text>
        </Pressable>

        {inlineError ? (
          <View style={styles.errorBox} accessibilityLiveRegion="polite">
            <Text style={styles.errorText}>{inlineError}</Text>
            <Pressable
              onPress={() => navigation.replace('Main')}
              style={styles.errorPreviewLink}
              hitSlop={8}
            >
              <Text style={styles.errorPreviewLinkText}>
                {isFirebaseConfigured()
                  ? 'Wejdź w podgląd bez konta'
                  : 'Kontynuuj bez logowania'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <Pressable style={styles.registerRow} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.muted}>Nie masz konta? </Text>
          <Text style={styles.link}>Zarejestruj się</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  iconWrap: { alignItems: 'center', marginVertical: spacing.md },
  h1: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sub: { color: colors.textMuted, marginBottom: spacing.lg },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: spacing.md,
  },
  passRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingRight: 8,
    marginBottom: spacing.md,
  },
  inputInRow: { flex: 1, marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent' },
  eye: { padding: 8 },
  forgot: { alignSelf: 'flex-end', marginBottom: spacing.lg },
  forgotText: { color: colors.primary, fontWeight: '600' },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    elevation: 2,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  errorBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#f0c4c4',
  },
  errorText: { color: '#b42318', fontSize: 15, lineHeight: 22, fontWeight: '600' },
  errorPreviewLink: { marginTop: spacing.sm, alignSelf: 'flex-start' },
  errorPreviewLinkText: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  muted: { color: colors.text },
  link: { color: colors.primary, fontWeight: '700' },
})
