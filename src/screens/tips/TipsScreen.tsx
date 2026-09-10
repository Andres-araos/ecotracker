import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@/constants/colors';
import { getTips } from '@/services/tipsService';
import { Tip } from '@/types/database.types';

const CATEGORIES = [
  { key: undefined, label: 'Todos' },
  { key: 'meal', label: 'Comida' },
  { key: 'transport', label: 'Transporte' },
  { key: 'energy', label: 'Energía' },
  { key: 'general', label: 'General' },
];

const EMOJI: Record<string, string> = { meal: '🍽️', transport: '🚗', energy: '⚡', general: '🌍' };

export default function TipsScreen() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [category, setCategory] = useState<string | undefined>(undefined);

  useEffect(() => {
    getTips(category).then(setTips);
  }, [category]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
        <Text style={styles.title}>Tips ambientales</Text>
        <View style={styles.filterRow}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity key={c.label} onPress={() => setCategory(c.key)} style={[styles.chip, category === c.key && styles.chipActive]}>
              <Text style={[styles.chipText, category === c.key && styles.chipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={tips}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.tipCard}>
            <Text style={styles.tipEmoji}>{EMOJI[item.category] ?? '🌱'}</Text>
            <Text style={styles.tipText}>{item.content}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.sm, marginBottom: spacing.xs },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 12, color: colors.text },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  tipCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, alignItems: 'flex-start' },
  tipEmoji: { fontSize: 22, marginRight: spacing.sm },
  tipText: { flex: 1, fontSize: 14, color: colors.text, lineHeight: 20 },
});
