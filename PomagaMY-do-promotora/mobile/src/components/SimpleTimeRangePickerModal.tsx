import { useEffect, useMemo, useState } from 'react'
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'

function pad2(n: number): string {
  return Math.min(99, Math.max(0, n)).toString().padStart(2, '0')
}

function formatRange(sh: number, sm: number, eh: number, em: number): string {
  return `${pad2(sh)}:${pad2(sm)} - ${pad2(eh)}:${pad2(em)}`
}

function minutesSinceMidnight(h: number, m: number): number {
  return h * 60 + m
}

const PRESETS: { label: string; value: string }[] = [
  { label: '9:00 – 15:00', value: '9:00 - 15:00' },
  { label: '10:00 – 14:00', value: '10:00 - 14:00' },
  { label: '14:00 – 17:00', value: '14:00 - 17:00' },
  { label: 'Poranek (8:00 – 12:00)', value: '8:00 - 12:00' },
  { label: 'Popołudnie (13:00 – 17:00)', value: '13:00 - 17:00' },
  { label: 'Cały dzień (8:00 – 20:00)', value: '8:00 - 20:00' },
  { label: 'Do uzgodnienia', value: 'do uzgodnienia' },
]

const HOUR_OPTIONS = Array.from({ length: 17 }, (_, i) => i + 6)
const MINUTE_OPTIONS = [0, 15, 30, 45]

function parseCustomRange(s: string): { sh: number; sm: number; eh: number; em: number } | null {
  const m = s.trim().match(/^(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const sh = Number(m[1])
  const sm = Number(m[2])
  const eh = Number(m[3])
  const em = Number(m[4])
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return null
  if (sm < 0 || sm > 59 || em < 0 || em > 59) return null
  if (sh < 0 || sh > 23 || eh < 0 || eh > 23) return null
  return { sh, sm, eh, em }
}

function snapMinute(m: number): number {
  return MINUTE_OPTIONS.reduce((best, cur) => (Math.abs(cur - m) < Math.abs(best - m) ? cur : best), MINUTE_OPTIONS[0])
}

function clampHour(h: number): number {
  return Math.min(22, Math.max(6, h))
}

type Props = {
  visible: boolean
  value: string
  onClose: () => void
  onConfirm: (godziny: string) => void
}

export function SimpleTimeRangePickerModal({ visible, value, onClose, onConfirm }: Props) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>('do uzgodnienia')
  const [customActive, setCustomActive] = useState(false)
  const [sh, setSh] = useState(9)
  const [sm, setSm] = useState(0)
  const [eh, setEh] = useState(15)
  const [em, setEm] = useState(0)

  useEffect(() => {
    if (!visible) return
    const raw = value.trim()
    if (!raw || /^do uzgodnienia$/i.test(raw)) {
      setSelectedPreset('do uzgodnienia')
      setCustomActive(false)
      return
    }
    const presetExact = PRESETS.find((p) => p.value.toLowerCase() === raw.toLowerCase())
    if (presetExact) {
      setSelectedPreset(presetExact.value)
      setCustomActive(false)
      return
    }
    const normalized = raw.replace(/\s*–\s*/g, ' - ').replace(/\s+/g, ' ')
    const presetNorm = PRESETS.find((p) => p.value.replace(/\s+/g, ' ') === normalized)
    if (presetNorm) {
      setSelectedPreset(presetNorm.value)
      setCustomActive(false)
      return
    }
    const parsed = parseCustomRange(raw)
    if (parsed) {
      setCustomActive(true)
      setSelectedPreset(null)
      setSh(clampHour(parsed.sh))
      setSm(snapMinute(parsed.sm))
      setEh(clampHour(parsed.eh))
      setEm(snapMinute(parsed.em))
      return
    }
    setSelectedPreset('do uzgodnienia')
    setCustomActive(false)
  }, [visible, value])

  const previewCustom = useMemo(() => formatRange(sh, sm, eh, em), [sh, sm, eh, em])

  const previewDisplay = useMemo(() => {
    if (!customActive && selectedPreset) {
      if (selectedPreset === 'do uzgodnienia') return 'Do uzgodnienia'
      return selectedPreset
    }
    return previewCustom
  }, [customActive, selectedPreset, previewCustom])

  const handleConfirm = (): void => {
    if (!customActive && selectedPreset) {
      onConfirm(selectedPreset === 'do uzgodnienia' ? '' : selectedPreset)
      onClose()
      return
    }
    const start = minutesSinceMidnight(sh, sm)
    const end = minutesSinceMidnight(eh, em)
    if (end <= start) {
      Alert.alert('Godziny', 'Godzina „Do” musi być późniejsza niż „Od”.')
      return
    }
    onConfirm(previewCustom)
    onClose()
  }

  const pickPreset = (presetValue: string): void => {
    setSelectedPreset(presetValue)
    setCustomActive(false)
  }

  const activateCustom = (): void => {
    setCustomActive(true)
    setSelectedPreset(null)
  }

  const onPickCustomPart = (): void => {
    activateCustom()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Godziny</Text>
          <Text style={styles.preview}>{previewDisplay}</Text>

          <Text style={styles.sectionLabel}>Szybki wybór</Text>
          <ScrollView style={styles.presetsScroll} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            <View style={styles.presetsWrap}>
              {PRESETS.map((p) => {
                const on = !customActive && selectedPreset === p.value
                return (
                  <Pressable
                    key={p.value}
                    style={[styles.presetChip, on && styles.presetChipOn]}
                    onPress={() => pickPreset(p.value)}
                  >
                    <Text style={[styles.presetChipText, on && styles.presetChipTextOn]}>{p.label}</Text>
                  </Pressable>
                )
              })}
            </View>
          </ScrollView>

          <Text style={styles.sectionLabel}>Własny zakres</Text>
          <Pressable onPress={activateCustom} hitSlop={8}>
            <Text style={styles.customHint}>Dotknij godzinę lub minuty, aby ustawić inny przedział</Text>
          </Pressable>

          <Text style={styles.rowLabel}>Od</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chipsRow}>
              {HOUR_OPTIONS.map((h) => (
                <Pressable
                  key={`sh-${h}`}
                  style={[styles.miniChip, customActive && sh === h && styles.miniChipOn]}
                  onPress={() => {
                    onPickCustomPart()
                    setSh(h)
                  }}
                >
                  <Text style={[styles.miniChipText, customActive && sh === h && styles.miniChipTextOn]}>{pad2(h)}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chipsRow}>
              {MINUTE_OPTIONS.map((m) => (
                <Pressable
                  key={`sm-${m}`}
                  style={[styles.miniChip, customActive && sm === m && styles.miniChipOn]}
                  onPress={() => {
                    onPickCustomPart()
                    setSm(m)
                  }}
                >
                  <Text style={[styles.miniChipText, customActive && sm === m && styles.miniChipTextOn]}>{pad2(m)}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.rowLabel}>Do</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chipsRow}>
              {HOUR_OPTIONS.map((h) => (
                <Pressable
                  key={`eh-${h}`}
                  style={[styles.miniChip, customActive && eh === h && styles.miniChipOn]}
                  onPress={() => {
                    onPickCustomPart()
                    setEh(h)
                  }}
                >
                  <Text style={[styles.miniChipText, customActive && eh === h && styles.miniChipTextOn]}>{pad2(h)}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chipsRow}>
              {MINUTE_OPTIONS.map((m) => (
                <Pressable
                  key={`em-${m}`}
                  style={[styles.miniChip, customActive && em === m && styles.miniChipOn]}
                  onPress={() => {
                    onPickCustomPart()
                    setEm(m)
                  }}
                >
                  <Text style={[styles.miniChipText, customActive && em === m && styles.miniChipTextOn]}>{pad2(m)}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Pressable style={styles.btnGhost} onPress={onClose}>
              <Text style={styles.btnGhostText}>Anuluj</Text>
            </Pressable>
            <Pressable style={styles.btnPrimary} onPress={handleConfirm}>
              <Text style={styles.btnPrimaryText}>Gotowe</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    maxHeight: '92%',
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 4 },
  preview: { fontSize: 15, fontWeight: '600', color: colors.primary, marginBottom: spacing.sm },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  customHint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm },
  presetsScroll: { maxHeight: 200, marginBottom: spacing.sm },
  presetsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  presetChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  presetChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  presetChipText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  presetChipTextOn: { color: '#fff' },
  rowLabel: { fontSize: 12, fontWeight: '700', color: colors.text, marginTop: spacing.sm, marginBottom: 4 },
  chipsScroll: { flexGrow: 0, flexShrink: 0, marginBottom: 4 },
  chipsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  miniChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
  },
  miniChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  miniChipText: { fontSize: 14, fontWeight: '700', color: colors.text },
  miniChipTextOn: { color: '#fff' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  btnGhost: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  btnGhostText: { fontWeight: '800', color: colors.textMuted },
  btnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  btnPrimaryText: { fontWeight: '800', color: '#fff', fontSize: 16 },
})
