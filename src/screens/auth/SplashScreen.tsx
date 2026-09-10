import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@/constants/colors';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🌱</Text>
      <Text style={styles.title}>EcoTracker</Text>
      <Text style={styles.subtitle}>Reduce tu huella, un día a la vez</Text>
      <ActivityIndicator color="#fff" style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 14, color: colors.accent, marginTop: 6 },
});
