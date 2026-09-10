import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors, spacing, radius } from '@/constants/colors';
import Button from '@/components/ui/Button';
import { getCompetitionRanking } from '@/services/competitionsService';

export default function CompetitionDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { competitionId, name } = route.params;
  const [ranking, setRanking] = useState<{ userId: string; username: string; greenPoints: number }[]>([]);

  useEffect(() => {
    getCompetitionRanking(competitionId).then(setRanking);
  }, [competitionId]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ padding: spacing.md }}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.subtitle}>Ranking de participantes</Text>
      </View>

      <FlatList
        data={ranking}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item, index }) => (
          <View style={styles.row}>
            <Text style={styles.position}>{index + 1}</Text>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.points}>{item.greenPoints} pts</Text>
          </View>
        )}
      />

      <View style={{ padding: spacing.md }}>
        <Button title="Volver" variant="outline" onPress={() => navigation.goBack()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.xs },
  position: { fontSize: 14, fontWeight: '800', color: colors.primary, width: 28 },
  username: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  points: { fontSize: 14, fontWeight: '700', color: colors.secondary },
});
