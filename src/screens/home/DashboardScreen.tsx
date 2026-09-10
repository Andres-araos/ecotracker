import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius } from '@/constants/colors';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import WeeklyChart from '@/components/charts/WeeklyChart';
import { useAuth } from '@/hooks/useAuth';
import { useCarbonFootprint } from '@/hooks/useCarbonFootprint';
import { formatCO2, percentChange } from '@/utils/co2Calculations';
import { getTipOfTheDay } from '@/services/tipsService';
import { Tip } from '@/types/database.types';

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const { current, previous, loading, reload } = useCarbonFootprint(profile?.id);
  const [tip, setTip] = React.useState<Tip | null>(null);

  React.useEffect(() => {
    getTipOfTheDay().then(setTip).catch(() => {});
  }, []);

  React.useEffect(() => {
    const unsub = navigation.addListener('focus', reload);
    return unsub;
  }, [navigation, reload]);

  const goal = profile?.weekly_goal_kg ?? 50;
  const progress = goal > 0 ? current.total / goal : 0;
  const change = percentChange(current.total, previous.total);
  const dailyAvg = current.total / 7;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        <Text style={styles.greeting}>Hola, {profile?.username ?? 'eco-usuario'} 🌱</Text>
        <Text style={styles.subGreeting}>Este es tu resumen semanal</Text>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.cardLabel}>Huella semanal</Text>
          <Text style={styles.bigNumber}>{formatCO2(current.total)}</Text>
          <ProgressBar progress={progress} color={progress > 1 ? colors.danger : colors.secondary} />
          <View style={styles.rowBetween}>
            <Text style={styles.smallMuted}>Meta: {formatCO2(goal)}</Text>
            <Text style={[styles.smallMuted, { color: change <= 0 ? colors.secondary : colors.danger }]}>
              {change <= 0 ? '↓' : '↑'} {Math.abs(change)}% vs. semana anterior
            </Text>
          </View>
        </Card>

        <View style={styles.rowCards}>
          <Card style={styles.smallCard}>
            <Text style={styles.smallCardEmoji}>🍽️</Text>
            <Text style={styles.smallCardValue}>{formatCO2(current.meals)}</Text>
            <Text style={styles.smallCardLabel}>Comidas</Text>
          </Card>
          <Card style={styles.smallCard}>
            <Text style={styles.smallCardEmoji}>🚗</Text>
            <Text style={styles.smallCardValue}>{formatCO2(current.transport)}</Text>
            <Text style={styles.smallCardLabel}>Transporte</Text>
          </Card>
          <Card style={styles.smallCard}>
            <Text style={styles.smallCardEmoji}>⚡</Text>
            <Text style={styles.smallCardValue}>{formatCO2(current.energy)}</Text>
            <Text style={styles.smallCardLabel}>Energía</Text>
          </Card>
        </View>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.cardLabel}>Promedio diario</Text>
          <Text style={styles.bigNumberSmall}>{formatCO2(dailyAvg)} / día</Text>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.cardLabel}>Categorías esta semana</Text>
          <WeeklyChart
            labels={['Comida', 'Transp.', 'Energía']}
            data={[current.meals, current.transport, current.energy]}
          />
        </Card>

        {tip && (
          <Card style={{ marginTop: spacing.md, backgroundColor: colors.accent + '33' }}>
            <Text style={styles.cardLabel}>💡 Consejo del día</Text>
            <Text style={styles.tipText}>{tip.content}</Text>
          </Card>
        )}

        <TouchableOpacity style={styles.historyLink} onPress={() => navigation.navigate('History')}>
          <Text style={styles.historyLinkText}>Ver historial completo →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  greeting: { fontSize: 22, fontWeight: '800', color: colors.text },
  subGreeting: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  cardLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  bigNumber: { fontSize: 36, fontWeight: '800', color: colors.primary, marginVertical: spacing.sm },
  bigNumberSmall: { fontSize: 22, fontWeight: '700', color: colors.primary, marginTop: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  smallMuted: { fontSize: 12, color: colors.textMuted },
  rowCards: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  smallCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  smallCardEmoji: { fontSize: 22 },
  smallCardValue: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 4 },
  smallCardLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  tipText: { fontSize: 14, color: colors.text, marginTop: spacing.sm, lineHeight: 20 },
  historyLink: { alignItems: 'center', marginTop: spacing.lg },
  historyLinkText: { color: colors.primary, fontWeight: '600' },
});
