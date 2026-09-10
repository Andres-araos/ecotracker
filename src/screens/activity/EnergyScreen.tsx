import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius } from '@/constants/colors';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { addEnergyRecord } from '@/services/energyService';
import { getCarbonFactors, calculateCO2 } from '@/services/carbonService';
import { CarbonFactor } from '@/types/database.types';
import { todayISO } from '@/utils/dateUtils';
import { formatCO2 } from '@/utils/co2Calculations';

export default function EnergyScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const [factors, setFactors] = useState<CarbonFactor[]>([]);
  const [kwh, setKwh] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCarbonFactors('energy').then(setFactors);
  }, []);

  const factor = factors[0]?.factor ?? 0;
  const estimatedCO2 = calculateCO2(Number(kwh) || 0, factor);

  async function handleSave() {
    if (!profile) return;
    if (!kwh || Number(kwh) <= 0) {
      Alert.alert('Consumo inválido', 'Ingresa el consumo en kWh.');
      return;
    }
    setLoading(true);
    try {
      await addEnergyRecord(profile.id, Number(kwh), estimatedCO2, todayISO());
      Alert.alert('Registrado', `Consumo guardado: ${formatCO2(estimatedCO2)} de CO₂`);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={styles.title}>⚡ Registrar energía</Text>
        <Input label="Consumo (kWh)" keyboardType="numeric" value={kwh} onChangeText={setKwh} placeholder="ej. 12.3" />

        <View style={styles.estimateBox}>
          <Text style={styles.estimateLabel}>Emisión estimada</Text>
          <Text style={styles.estimateValue}>{formatCO2(estimatedCO2)}</Text>
        </View>

        <Button title="Guardar registro" onPress={handleSave} loading={loading} style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  estimateBox: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  estimateLabel: { fontSize: 12, color: colors.textMuted },
  estimateValue: { fontSize: 24, fontWeight: '800', color: colors.energy, marginTop: 4 },
});
