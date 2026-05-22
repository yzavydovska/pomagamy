import { useState } from 'react'
import {
  Alert,
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
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { persistAdminSession } from '../auth/adminSession'
import { isFirebaseConfigured } from '../firebase/env'
import { AuthHeader } from '../components/AuthHeader'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'

type Props = NativeStackScreenProps<RootStackParamList, 'AdminLogin'>

/** Przy Firebase admin loguje się przez zwykły ekran «Logowanie» — tu zostaje tylko tryb bez Firebase (sesja lokalna). */
export function AdminLoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [secure, setSecure] = useState(true)
  const [busy, setBusy] = useState(false)

  if (isFirebaseConfigured()) {
    return (
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <AuthHeader title="Administrator" onBack={() => navigation.goBack()} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.badge}>
            <Ionicons name="log-in-outline" size={40} color={colors.primary} />
          </View>
          <Text style={styles.h1}>Jedno logowanie</Text>
          <Text style={styles.sub}>
            Administrator loguje się przez główny ekran «Zaloguj się» — ten sam adres e-mail i hasło co przy koncie Firebase. W Firestore dokument{' '}
            <Text style={styles.mono}>users/[uid]</Text> musi mieć pole{' '}
            <Text style={styles.mono}>role: &quot;admin&quot;</Text>.
          </Text>
          <Pressable style={styles.btn} onPress={() => navigation.replace('Login')}>
            <Text style={styles.btnText}>Przejdź do logowania</Text>
          </Pressable>
          <Pressable style={styles.ghostBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.ghostBtnText}>Wróć</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  const onLogin = async () => {
    const e = email.trim()
    if (!e) {
      Alert.alert('Brak danych', 'Podaj adres e-mail administratora.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      Alert.alert('Email', 'Podaj poprawny adres e-mail.')
      return
    }
    if (password.length < 6) {
      Alert.alert('Hasło', 'Hasło musi mieć co najmniej 6 znaków.')
      return
    }

    try {
      await persistAdminSession(e)
    } catch {
      Alert.alert('Błąd', 'Nie udało się zapisać sesji. Spróbuj ponownie.')
      return
    }
    navigation.replace('AdminMain')
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthHeader title="Administrator" onBack={() => navigation.goBack()} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={40} color={colors.primary} />
        </View>
        <Text style={styles.h1}>Panel administratora</Text>
        <Text style={styles.sub}>Wprowadź poprawny adres e-mail i hasło (minimum 6 znaków).</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail administratora"
          placeholderTextColor={colors.textLight}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
        <View style={styles.passRow}>
          <TextInput
            style={[styles.input, styles.inputInRow]}
            placeholder="Hasło"
            placeholderTextColor={colors.textLight}
            secureTextEntry={secure}
            value={password}
            onChangeText={setPassword}
          />
          <Pressable style={styles.eye} onPress={() => setSecure((s) => !s)} hitSlop={8}>
            <Ionicons name={secure ? 'eye-off-outline' : 'eye-outline'} size={24} color={colors.textMuted} />
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [styles.btn, (pressed || busy) && { opacity: 0.9 }, busy && { opacity: 0.7 }]}
          onPress={() => void onLogin()}
          disabled={busy}
        >
          <Text style={styles.btnText}>{busy ? 'Logowanie…' : 'Zaloguj jako administrator'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  badge: { alignItems: 'center', marginBottom: spacing.md },
  h1: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  sub: {
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 22,
    textAlign: 'center',
    fontSize: 15,
  },
  mono: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) },
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
    marginBottom: spacing.lg,
  },
  inputInRow: { flex: 1, marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent' },
  eye: { padding: 8 },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    elevation: 2,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  ghostBtn: { marginTop: spacing.md, alignItems: 'center', padding: spacing.sm },
  ghostBtnText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
})
