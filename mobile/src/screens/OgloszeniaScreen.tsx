import { useMemo, useState } from 'react'
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { HomeStackParamList } from '../navigation/types'
import { usePomagaMY } from '../context/PomagaMYContext'
import { colors } from '../theme/colors'
import { radius, spacing } from '../theme/spacing'
import type { Ogloszenie } from '../types/ogloszenie'
import { OGLOSZENIA_KATEGORIE, normalizeOgloszenieKategoria } from '../data/ogloszeniaKategorie'

const filters = ['Wszystkie', ...OGLOSZENIA_KATEGORIE] as const

export function OgloszeniaScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>()
  const { allOgloszenia } = usePomagaMY()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<string>('Wszystkie')
  const [filterModalVisible, setFilterModalVisible] = useState(false)

  const data = useMemo(() => {
    let list = allOgloszenia
    if (filter !== 'Wszystkie') {
      list = list.filter((o) => normalizeOgloszenieKategoria(o.kategoria) === filter)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (o) =>
          o.tytul.toLowerCase().includes(q) ||
          o.organizacja.toLowerCase().includes(q) ||
          o.lokalizacja.toLowerCase().includes(q),
      )
    }
    return list
  }, [filter, query, allOgloszenia])

  const listHeader = useMemo(
    () => (
      <View>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Wyszukaj..."
            placeholderTextColor={colors.textLight}
            value={query}
            onChangeText={setQuery}
          />
          <Pressable style={styles.searchBtn} accessibilityRole="button">
            <Ionicons name="search" size={22} color="#fff" />
          </Pressable>
        </View>

        <Pressable
          style={styles.filterSummaryRow}
          onPress={() => setFilterModalVisible(true)}
          accessibilityLabel={`Wybrana kategoria: ${filter}. Dotknij, aby zmienić.`}
        >
          <View style={styles.filterSummaryIconWrap}>
            <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.filterSummaryTextCol}>
            <Text style={styles.filterSummaryCaption}>Wybrana kategoria</Text>
            <Text style={styles.filterSummaryValue} numberOfLines={2}>
              {filter}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
      </View>
    ),
    [filter, query],
  )

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ogłoszenia</Text>
      </View>

      <FlatList
        style={styles.listFlex}
        data={data}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.list, { paddingBottom: 88 }]}
        renderItem={({ item }) => (
          <OgloszenieCard
            item={item}
            onPress={() => navigation.navigate('OgloszenieDetail', { id: item.id })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Brak ogłoszeń dla wybranych kryteriów.</Text>
        }
      />

      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setFilterModalVisible(false)} />
          <View style={styles.modalSheet} pointerEvents="box-none">
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Kategoria</Text>
              <Text style={styles.modalSubtitle}>Wybierz filtr listy ogłoszeń</Text>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={styles.modalScroll}
                contentContainerStyle={styles.modalChipsWrap}
              >
                {filters.map((item) => {
                  const active = filter === item
                  return (
                    <Pressable
                      key={item}
                      onPress={() => {
                        setFilter(item)
                        setFilterModalVisible(false)
                      }}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                    </Pressable>
                  )
                })}
              </ScrollView>
              <Pressable style={styles.modalDone} onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.modalDoneText}>Zamknij</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function OgloszenieCard({
  item,
  onPress,
}: {
  item: Ogloszenie
  onPress: () => void
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
        <Pressable onPress={onPress} style={styles.detailsBtn}>
          <Text style={styles.detailsBtnText}>Szczegóły</Text>
        </Pressable>
      </View>
      <Text style={styles.cardTitle}>{item.tytul}</Text>
      <Pressable onPress={onPress}>
        <Text style={styles.org}>
          🏢 {item.organizacja} →
        </Text>
      </Pressable>
      <Text style={styles.desc} numberOfLines={3}>
        {item.opis}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.meta}>📅 {item.data}</Text>
        <Text style={styles.meta}>📍 {item.lokalizacja}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchBtn: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterSummaryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSummaryTextCol: {
    flex: 1,
    minWidth: 0,
  },
  filterSummaryCaption: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 2,
  },
  filterSummaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  modalRoot: {
    flex: 1,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: 480,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  modalScroll: {
    maxHeight: 360,
  },
  modalChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  modalDone: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  modalDoneText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  listFlex: { flex: 1 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  chipTextActive: { color: '#fff' },
  list: { paddingHorizontal: spacing.lg, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeText: { color: colors.successText, fontWeight: '700', fontSize: 12 },
  detailsBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  detailsBtnText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6 },
  org: { color: colors.primary, fontWeight: '600', marginBottom: spacing.sm },
  desc: { color: colors.textMuted, lineHeight: 22, marginBottom: spacing.md },
  cardFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  meta: { color: colors.text, fontSize: 14 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
})
