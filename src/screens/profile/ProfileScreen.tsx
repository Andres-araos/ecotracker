import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '@/constants/colors';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/services/authService';
import { getUserAchievements } from '@/services/achievementsService';

export default function ProfileScreen() {
  const { profile, refreshProfile } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    if (profile) getUserAchievements(profile.id).then(setAchievements).catch(() => {});
  }, [profile]);

  async function handleSignOut() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.username?.[0]?.toUpperCase() ?? '🌱'}</Text>
          </View>
          <Text style={styles.username}>{profile?.username}</Text>
          <Text style={styles.fullName}>{profile?.full_name}</Text>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.green_points ?? 0}</Text>
            <Text style={styles.statLabel}>Puntos verdes</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{profile?.current_streak ?? 0}</Text>
            <Text style={styles.statLabel}>Racha (días)</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{achievements.length}</Text>
            <Text style={styles.statLabel}>Logros</Text>
          </Card>
        </View>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.sectionLabel}>Meta semanal</Text>
          <Text style={styles.goalValue}>{profile?.weekly_goal_kg ?? 50} kg CO₂</Text>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.sectionLabel}>🏅 Logros obtenidos</Text>
          {achievements.length === 0 ? (
            <Text style={styles.emptyAchievements}>Aún no tienes logros. ¡Sigue registrando actividades!</Text>
          ) : (
            achievements.map((a) => (
              <View key={a.id} style={styles.achievementRow}>
                <Text style={styles.achievementIcon}>{a.achievements?.icon ?? '🏅'}</Text>
                <Text style={styles.achievementName}>{a.achievements?.name}</Text>
              </View>
            ))
          )}
        </Card>

        <Button title="Cerrar sesión" variant="outline" onPress={handleSignOut} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', marginBottom: spacing.md },
  avatar: { width: 72, height: 72, borderRadius: radius.full, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarText: { fontSize: 28, color: '#fff', fontWeight: '800' },
  username: { fontSize: 18, fontWeight: '800', color: colors.text },
  fullName: { fontSize: 13, color: colors.textMuted },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginBottom: spacing.sm },
  goalValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  emptyAchievements: { fontSize: 13, color: colors.textMuted },
  achievementRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  achievementIcon: { fontSize: 18, marginRight: spacing.sm },
  achievementName: { fontSize: 14, color: colors.text },
});
