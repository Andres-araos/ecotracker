import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '@/constants/colors';

export default function ProgressBar({ progress, color = colors.secondary }: { progress: number; color?: string }) {
  const pct = Math.min(Math.max(progress, 0), 1) * 100;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
