import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius } from '@/constants/colors';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { getTransportTypes, addTransportRecord } from '@/services/transportService';
import { getCarbonFactors, calculateCO2 } from '@/services/carbonService';
import { TransportType, CarbonFactor } from '@/types/database.types';
import { todayISO } from '@/utils/dateUtils';
import { formatCO2 } from '@/utils/co2Calculations';
import { TRANSPORT_ICONS } from '@/constants/transportTypes';

export default function TransportScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const [types, setTypes] = useState<TransportType[]>([]);
  const [factors, setFactors] = useState<CarbonFactor[]>([]);
  const [selected, setSelected] = useState<TransportType | null>(null);
  const [distance, setDistance] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getTransportTypes(), getCarbonFactors('transport')]).then(([t, f]) => {
      setTypes(t);
      setFactors(f);
      setSelected(t[0] ?? null);
    });
  }, []);

  const factor = factors.find((f) => f.reference_id === selected?.id)?.factor ?? 0;
  const estimatedCO2 = calculateCO2(Number(distance) || 0, factor);

  async function handleSave() {
    if (!profile || !selected) return;
    if (!distance || Number(distance) <= 0) {
      Alert.alert('Distancia inválida', 'Ingresa la distancia recorrida en km.');
      return;
    }
    setLoading(true);
    try {
      await addTransportRecord(profile.id, selected.id, Number(distance), estimatedCO2, todayISO());
      Alert.alert('Registrado', `Viaje guardado: ${formatCO2(estimatedCO2)} de CO₂`);
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
        <Text style={styles.title}>🚗 Registrar transporte</Text>

        <Text style={styles.label}>Medio de transporte</Text>
        <View style={styles.grid}>
          {types.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setSelected(t)}
              style={[styles.gridItem, selected?.id === t.id && styles.gridItemActive]}
            >
              <Text style={styles.gridEmoji}>{TRANSPORT_ICONS[t.name] ?? '🚙'}</Text>
              <Text style={[styles.gridLabel, selected?.id === t.id && styles.gridLabelActive]}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input label="Distancia (km)" keyboardType="numeric" value={distance} onChangeText={setDistance} placeholder="ej. 5.5" />

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
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.md },
  gridItem: { width: '30%', alignItems: 'center', paddingVertical: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  gridItemActive: { backgroundColor: colors.transport, borderColor: colors.transport },
  gridEmoji: { fontSize: 24 },
  gridLabel: { fontSize: 11, color: colors.text, marginTop: 4, textTransform: 'capitalize' },
  gridLabelActive: { color: '#fff', fontWeight: '700' },
  estimateBox: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  estimateLabel: { fontSize: 12, color: colors.textMuted },
  estimateValue: { fontSize: 24, fontWeight: '800', color: colors.transport, marginTop: 4 },
});
