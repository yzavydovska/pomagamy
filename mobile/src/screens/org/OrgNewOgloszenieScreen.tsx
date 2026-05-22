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
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { OrgStackParamList } from '../../navigation/types'
import { AuthHeader } from '../../components/AuthHeader'
import { SimpleDatePickerModal } from '../../components/SimpleDatePickerModal'
import { SimpleTimeRangePickerModal } from '../../components/SimpleTimeRangePickerModal'
import { SimpleVolunteerCountPickerModal } from '../../components/SimpleVolunteerCountPickerModal'
import { SimpleCategoryPickerModal } from '../../components/SimpleCategoryPickerModal'
import { usePomagaMY } from '../../context/PomagaMYContext'
import { DEFAULT_OGLOSZENIE_KATEGORIA, normalizeOgloszenieKategoria } from '../../data/ogloszeniaKategorie'
import { colors } from '../../theme/colors'
import { radius, spacing } from '../../theme/spacing'

type Props = NativeStackScreenProps<OrgStackParamList, 'OrgNewOgloszenie'>

function formatEventDate(d: Date): string {
  try {
    return d.toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return d.toISOString().slice(0, 10)
  }
}

/** Tylko nowe ogłoszenie — edycja przez organizacje wyłączona (osobny rozwój: zmiany + powiadomienia). */
export function OrgNewOgloszenieScreen({ navigation }: Props) {
  const { addOgloszenie } = usePomagaMY()

  const [tytul, setTytul] = useState('')
  const [opis, setOpis] = useState('')
  const [eventDate, setEventDate] = useState(() => new Date())
  const [dataStr, setDataStr] = useState(() => formatEventDate(new Date()))
  const [dateModalOpen, setDateModalOpen] = useState(false)
  const [timeModalOpen, setTimeModalOpen] = useState(false)
  const [countModalOpen, setCountModalOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [lokalizacja, setLokalizacja] = useState('')
  const [kategoria, setKategoria] = useState<string>(DEFAULT_OGLOSZENIE_KATEGORIA)
  const [godziny, setGodziny] = useState('')
  const [liczba, setLiczba] = useState('3 osoby')
  const [wym, setWym] = useState('')

  const buildPayload = () => ({
    tytul: tytul.trim(),
    opis: opis.trim(),
    data: dataStr.trim(),
    lokalizacja: lokalizacja.trim() || 'Polska',
    kategoria: normalizeOgloszenieKategoria(kategoria),
    godziny: godziny.trim() || 'do uzgodnienia',
    liczbaWolontariuszy: liczba.trim() || '1 osoba',
    wymagania: wym
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
    status: 'Aktywne' as const,
  })

  const onSave = async () => {
    if (!tytul.trim() || !opis.trim()) {
      Alert.alert('Formularz', 'Uzupełnij tytuł i opis.')
      return
    }
    try {
      await addOgloszenie(buildPayload())
      Alert.alert('Zapisano', 'Ogłoszenie zostało zapisane.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (e) {
      Alert.alert('Błąd', e instanceof Error ? e.message : 'Nie udało się zapisać.')
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AuthHeader title="Nowe ogłoszenie" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>Tytuł</Text>
        <TextInput style={styles.input} value={tytul} onChangeText={setTytul} placeholder="Krótki tytuł" />

        <Text style={styles.label}>Opis</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={opis}
          onChangeText={setOpis}
          placeholder="Opis zadania"
          multiline
        />

        <Text style={styles.label}>Termin / data</Text>
        <Pressable
          style={styles.dateField}
          onPress={() => setDateModalOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Wybierz datę"
        >
          <Text style={styles.dateFieldText}>{dataStr}</Text>
          <Text style={styles.dateFieldHint}>Dotknij, aby wybrać inną datę z kalendarza</Text>
        </Pressable>

        <SimpleDatePickerModal
          visible={dateModalOpen}
          value={eventDate}
          onClose={() => setDateModalOpen(false)}
          onConfirm={(d) => {
            setEventDate(d)
            setDataStr(formatEventDate(d))
          }}
        />

        <Text style={styles.label}>Lokalizacja</Text>
        <TextInput style={styles.input} value={lokalizacja} onChangeText={setLokalizacja} />

        <Text style={styles.label}>Kategoria</Text>
        <Pressable
          style={styles.dateField}
          onPress={() => setCategoryModalOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Wybierz kategorię"
        >
          <Text style={styles.dateFieldText}>{normalizeOgloszenieKategoria(kategoria)}</Text>
          <Text style={styles.dateFieldHint}>Dotknij, aby wybrać kategorię</Text>
        </Pressable>

        <SimpleCategoryPickerModal
          visible={categoryModalOpen}
          value={kategoria}
          onClose={() => setCategoryModalOpen(false)}
          onConfirm={(k) => setKategoria(k)}
        />

        <Text style={styles.label}>Godziny</Text>
        <Pressable
          style={styles.dateField}
          onPress={() => setTimeModalOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Wybierz godziny"
        >
          <Text style={styles.dateFieldText}>{godziny.trim() ? godziny : 'Do uzgodnienia'}</Text>
          <Text style={styles.dateFieldHint}>Dotknij, aby wybrać przedział godzin</Text>
        </Pressable>

        <SimpleTimeRangePickerModal
          visible={timeModalOpen}
          value={godziny}
          onClose={() => setTimeModalOpen(false)}
          onConfirm={(g) => setGodziny(g)}
        />

        <Text style={styles.label}>Liczba wolontariuszy</Text>
        <Pressable
          style={styles.dateField}
          onPress={() => setCountModalOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Wybierz liczbę wolontariuszy"
        >
          <Text style={styles.dateFieldText}>{liczba.trim() || '1 osoba'}</Text>
          <Text style={styles.dateFieldHint}>Dotknij, aby wybrać liczbę osób</Text>
        </Pressable>

        <SimpleVolunteerCountPickerModal
          visible={countModalOpen}
          value={liczba}
          onClose={() => setCountModalOpen(false)}
          onConfirm={(v) => setLiczba(v)}
        />

        <Text style={styles.label}>Wymagania (każde w nowej linii)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          value={wym}
          onChangeText={setWym}
          placeholder={'Punktualność\nKomunikatywność'}
          multiline
        />

        <Pressable style={styles.btn} onPress={() => void onSave()}>
          <Text style={styles.btnText}>Opublikuj ogłoszenie</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  label: { fontWeight: '700', color: colors.text, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: spacing.md,
    backgroundColor: colors.inputBg,
    fontSize: 16,
  },
  dateField: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: spacing.md,
    backgroundColor: colors.inputBg,
  },
  dateFieldText: { fontSize: 16, color: colors.text, fontWeight: '600' },
  dateFieldHint: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
})
