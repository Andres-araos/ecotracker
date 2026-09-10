import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/colors';

// Pantalla general de ranking (accesible desde Estadísticas/Competencias si se requiere un ranking global).
export default function RankingScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ padding: spacing.md }}>
        <Text style={styles.title}>Ranking</Text>
        <Text style={styles.subtitle}>Selecciona una competencia para ver su ranking detallado.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
});
