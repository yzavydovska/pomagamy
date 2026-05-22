import { useEffect, useMemo, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'

const MONTHS_PL = [
  'styczeń',
  'luty',
  'marzec',
  'kwiecień',
  'maj',
  'czerwiec',
  'lipiec',
  'sierpień',
  'wrzesień',
  'październik',
  'listopad',
  'grudzień',
] as const

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function clampDay(year: number, monthIndex: number, day: number): number {
  const max = daysInMonth(year, monthIndex)
  return Math.min(Math.max(1, day), max)
}

type Props = {
  visible: boolean
  value: Date
  onClose: () => void
  onConfirm: (date: Date) => void
}

export function SimpleDatePickerModal({ visible, value, onClose, onConfirm }: Props) {
  const [year, setYear] = useState(value.getFullYear())
  const [monthIndex, setMonthIndex] = useState(value.getMonth())
  const [day, setDay] = useState(value.getDate())

  useEffect(() => {
    if (!visible) return
    setYear(value.getFullYear())
    setMonthIndex(value.getMonth())
    setDay(value.getDate())
  }, [visible, value])

  const maxDay = useMemo(() => daysInMonth(year, monthIndex), [year, monthIndex])
  const dayNumbers = useMemo(() => Array.from({ length: maxDay }, (_, i) => i + 1), [maxDay])

  const shiftYear = (delta: number): void => {
    const y = year + delta
    const max = 2100
    const min = new Date().getFullYear() - 1
    if (y < min || y > max) return
    setYear(y)
    setDay((d) => clampDay(y, monthIndex, d))
  }

  const selectMonth = (m: number): void => {
    setMonthIndex(m)
    setDay((d) => clampDay(year, m, d))
  }

  const selectDay = (d: number): void => {
    setDay(clampDay(year, monthIndex, d))
  }

  const handleConfirm = (): void => {
    const d = new Date(year, monthIndex, clampDay(year, monthIndex, day))
    onConfirm(d)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Wybierz datę</Text>

          <View style={styles.yearRow}>
            <Pressable style={styles.yearBtn} onPress={() => shiftYear(-1)} hitSlop={8}>
              <Text style={styles.yearBtnText}>◀</Text>
            </Pressable>
            <Text style={styles.yearValue}>{year}</Text>
            <Pressable style={styles.yearBtn} onPress={() => shiftYear(1)} hitSlop={8}>
              <Text style={styles.yearBtnText}>▶</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Miesiąc</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsRow}
          >
            {MONTHS_PL.map((name, i) => (
              <Pressable
                key={name}
                style={[styles.monthChip, i === monthIndex && styles.monthChipOn]}
                onPress={() => selectMonth(i)}
              >
                <Text style={[styles.monthChipText, i === monthIndex && styles.monthChipTextOn]}>{name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.sectionLabel}>Dzień</Text>
          <View style={styles.daysGrid}>
            {dayNumbers.map((n) => (
              <Pressable
                key={n}
                style={[styles.dayCell, n === day && styles.dayCellOn]}
                onPress={() => selectDay(n)}
              >
                <Text style={[styles.dayCellText, n === day && styles.dayCellTextOn]}>{n}</Text>
              </Pressable>
            ))}
          </View>

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
    maxHeight: '90%',
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  yearBtn: { padding: spacing.sm },
  yearBtnText: { fontSize: 18, color: colors.primary, fontWeight: '800' },
  yearValue: { fontSize: 22, fontWeight: '800', color: colors.text, minWidth: 72, textAlign: 'center' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: spacing.sm },
  chipsScroll: { flexGrow: 0, flexShrink: 0 },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: spacing.md,
  },
  monthChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
    backgroundColor: colors.inputBg,
  },
  monthChipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  monthChipText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  monthChipTextOn: { color: '#fff' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  dayCell: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBg,
  },
  dayCellOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayCellText: { fontSize: 16, fontWeight: '600', color: colors.text },
  dayCellTextOn: { color: '#fff' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
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
