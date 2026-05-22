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
import { sendPasswordResetEmail } from 'firebase/auth'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { AuthHeader } from '../components/AuthHeader'
import { getFirebaseAuth } from '../firebase/client'
import { isFirebaseConfigured } from '../firebase/env'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('')

  const onSubmit = () => {
    const trimmed = email.trim()
    if (!trimmed) {
      Alert.alert('Brak emaila', 'Wpisz adres e-mail powiązany z kontem.')
      return
    }
    const basicEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!basicEmail.test(trimmed)) {
      Alert.alert('Nieprawidłowy email', 'Sprawdź poprawność adresu e-mail.')
      return
    }
    if (isFirebaseConfigured()) {
      void sendPasswordResetEmail(getFirebaseAuth(), trimmed)
        .then(() =>
          Alert.alert(
            'Sprawdź skrzynkę',
            'Jeśli konto istnieje, na podany adres wysłano wiadomość z linkiem do resetu hasła.',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          ),
        )
        .catch(() =>
          Alert.alert('Błąd', 'Nie udało się wysłać resetu. Sprawdź e-mail lub spróbuj później.'),
        )
      return
    }
    Alert.alert(
      'Sprawdź skrzynkę',
      'W tej konfiguracji reset e-mail nie jest wysyłany. Spróbuj później lub skontaktuj się z pomocą.',
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthHeader title="Reset hasła" onBack={() => navigation.goBack()} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.h1}>Zapomniałeś hasła?</Text>
        <Text style={styles.sub}>
          Podaj e-mail użyty przy rejestracji. Wyślemy instrukcję resetu hasła.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textLight}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <Pressable
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}
          onPress={onSubmit}
        >
          <Text style={styles.btnText}>Wyślij link resetujący</Text>
        </Pressable>

        <Pressable style={styles.backLink} onPress={() => navigation.goBack()}>
          <Text style={styles.backLinkText}>Wróć do logowania</Text>
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
  h1: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sub: { color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 22 },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    elevation: 2,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  backLink: { alignItems: 'center', marginTop: spacing.xl },
  backLinkText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
})
