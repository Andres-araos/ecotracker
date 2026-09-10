import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius } from '@/constants/colors';
import Card from '@/components/ui/Card';

const OPTIONS = [
  { key: 'Meal', emoji: '🍽️', title: 'Comida', desc: 'Registra lo que comiste', color: colors.meal },
  { key: 'Transport', emoji: '🚗', title: 'Transporte', desc: 'Registra tus viajes', color: colors.transport },
  { key: 'Energy', emoji: '⚡', title: 'Energía', desc: 'Registra tu consumo eléctrico', color: colors.energy },
];

export default function RegisterActivityScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ padding: spacing.md }}>
        <Text style={styles.title}>¿Qué quieres registrar?</Text>
        <Text style={styles.subtitle}>Elige una categoría para calcular su impacto</Text>

        {OPTIONS.map((opt) => (
          <TouchableOpacity key={opt.key} onPress={() => navigation.navigate(opt.key)}>
            <Card style={{ ...styles.optionCard, borderLeftColor: opt.color }}>
              <Text style={styles.optionEmoji}>{opt.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>{opt.title}</Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: spacing.md },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
  },
  optionEmoji: { fontSize: 28, marginRight: spacing.md },
  optionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  optionDesc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  chevron: { fontSize: 24, color: colors.textMuted },
});
