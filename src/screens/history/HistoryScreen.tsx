import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius } from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { getMeals, deleteMeal } from '@/services/mealsService';
import { getTransportRecords, deleteTransportRecord } from '@/services/transportService';
import { getEnergyRecords, deleteEnergyRecord } from '@/services/energyService';
import { formatCO2 } from '@/utils/co2Calculations';
import { formatDate } from '@/utils/dateUtils';
import { TRANSPORT_ICONS } from '@/constants/transportTypes';

type Row = { id: string; icon: string; title: string; date: string; co2: number; category: 'meal' | 'transport' | 'energy' };

const FILTERS = [
  { key: 'all', label: 'Todo' },
  { key: 'meal', label: 'Comida' },
  { key: 'transport', label: 'Transporte' },
  { key: 'energy', label: 'Energía' },
] as const;

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const [meals, transport, energy] = await Promise.all([
      getMeals(profile.id),
      getTransportRecords(profile.id),
      getEnergyRecords(profile.id),
    ]);

    const combined: Row[] = [
      ...meals.map((m) => ({ id: m.id, icon: '🍽️', title: m.meal_types?.name ?? 'Comida', date: m.recorded_at, co2: m.co2_kg, category: 'meal' as const })),
      ...transport.map((t) => ({ id: t.id, icon: TRANSPORT_ICONS[t.transport_types?.name ?? ''] ?? '🚙', title: t.transport_types?.name ?? 'Transporte', date: t.recorded_at, co2: t.co2_kg, category: 'transport' as const })),
      ...energy.map((e) => ({ id: e.id, icon: '⚡', title: `${e.kwh} kWh`, date: e.recorded_at, co2: e.co2_kg, category: 'energy' as const })),
    ].sort((a, b) => (a.date < b.date ? 1 : -1));

    setRows(combined);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation, load]);

  async function handleDelete(row: Row) {
    if (row.category === 'meal') await deleteMeal(row.id);
    if (row.category === 'transport') await deleteTransportRecord(row.id);
    if (row.category === 'energy') await deleteEnergyRecord(row.id);
    load();
  }

  const filtered = filter === 'all' ? rows : rows.filter((r) => r.category === filter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
        <Text style={styles.title}>Historial</Text>
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} style={[styles.filterChip, filter === f.key && styles.filterChipActive]}>
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={<Text style={styles.empty}>Aún no tienes registros en esta categoría.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => handleDelete(item)} style={styles.row}>
            <Text style={styles.rowEmoji}>{item.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowDate}>{formatDate(item.date)}</Text>
            </View>
            <Text style={styles.rowCO2}>{formatCO2(item.co2)}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: spacing.sm, marginBottom: spacing.xs },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 12, color: colors.text },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.xs },
  rowEmoji: { fontSize: 22, marginRight: spacing.sm },
  rowTitle: { fontSize: 14, fontWeight: '600', color: colors.text, textTransform: 'capitalize' },
  rowDate: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  rowCO2: { fontSize: 14, fontWeight: '700', color: colors.primary },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
