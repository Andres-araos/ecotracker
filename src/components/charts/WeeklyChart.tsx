import React from 'react';
import { Dimensions, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { colors } from '@/constants/colors';

interface Props {
  labels: string[];
  data: number[];
}

export default function WeeklyChart({ labels, data }: Props) {
  const screenWidth = Dimensions.get('window').width - 48;

  return (
    <View>
      <BarChart
        data={{ labels, datasets: [{ data }] }}
        width={screenWidth}
        height={200}
        yAxisLabel=""
        yAxisSuffix=" kg"
        fromZero
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalPlaces: 1,
          color: () => colors.primaryLight,
          labelColor: () => colors.textMuted,
          barPercentage: 0.6,
          propsForBackgroundLines: { stroke: colors.border },
        }}
        style={{ borderRadius: 16 }}
      />
    </View>
  );
}
