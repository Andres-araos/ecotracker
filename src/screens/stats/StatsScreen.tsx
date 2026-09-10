import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '@/constants/colors';
import Card from '@/components/ui/Card';
import WeeklyChart from '@/components/charts/WeeklyChart';
import { useAuth } from '@/hooks/useAuth';
import { useCarbonFootprint } from '@/hooks/useCarbonFootprint';
import { formatCO2, percentChange } from '@/utils/co2Calculations';

export default function StatsScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const { current, previous, loading } = useCarbonFootprint(profile?.id);

  const change = percentChange(current.total, previous.total);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        <Text style={styles.title}>Estadísticas</Text>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.label}>Comparación semanal</Text>
          <WeeklyChart labels={['Ant.', 'Actual']} data={[previous.total, current.total]} />
          <Text style={[styles.changeText, { color: change <= 0 ? colors.secondary : colors.danger }]}>
            {change <= 0 ? 'Mejoraste' : 'Aumentaste'} {Math.abs(change)}% respecto a la semana pasada
          </Text>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.label}>Distribución por categoría</Text>
          <WeeklyChart labels={['Comida', 'Transp.', 'Energía']} data={[current.meals, current.transport, current.energy]} />
        </Card>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total esta semana</Text>
          <Text style={styles.summaryValue}>{formatCO2(current.total)}</Text>
        </View>

        <TouchableOpacity style={styles.tipsLink} onPress={() => navigation.navigate('Tips')}>
          <Text style={styles.tipsLinkText}>💡 Ver consejos ambientales →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  label: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginBottom: spacing.sm },
  changeText: { fontSize: 13, fontWeight: '600', marginTop: spacing.sm, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, paddingHorizontal: spacing.xs },
  summaryLabel: { fontSize: 14, color: colors.textMuted },
  summaryValue: { fontSize: 16, fontWeight: '800', color: colors.primary },
  tipsLink: { alignItems: 'center', marginTop: spacing.lg },
  tipsLinkText: { color: colors.primary, fontWeight: '600' },
});
