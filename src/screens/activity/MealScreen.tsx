import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius } from '@/constants/colors';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { getMealTypes, addMeal } from '@/services/mealsService';
import { getCarbonFactors, calculateCO2 } from '@/services/carbonService';
import { MealType, CarbonFactor } from '@/types/database.types';
import { todayISO } from '@/utils/dateUtils';
import { formatCO2 } from '@/utils/co2Calculations';

export default function MealScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [factors, setFactors] = useState<CarbonFactor[]>([]);
  const [selectedType, setSelectedType] = useState<MealType | null>(null);
  const [portions, setPortions] = useState('1');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getMealTypes(), getCarbonFactors('meal')]).then(([types, f]) => {
      setMealTypes(types);
      setFactors(f);
      setSelectedType(types[0] ?? null);
    });
  }, []);

  const factor = factors.find((f) => f.reference_id === selectedType?.id)?.factor ?? 0;
  const estimatedCO2 = calculateCO2(Number(portions) || 0, factor);

  async function handleSave() {
    if (!profile || !selectedType) return;
    setLoading(true);
    try {
      await addMeal(profile.id, selectedType.id, Number(portions) || 0, estimatedCO2, todayISO());
      Alert.alert('Registrado', `Comida guardada: ${formatCO2(estimatedCO2)} de CO₂`);
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
        <Text style={styles.title}>🍽️ Registrar comida</Text>

        <Text style={styles.label}>Tipo de comida</Text>
        <View style={styles.chipsRow}>
          {mealTypes.map((mt) => (
            <TouchableOpacity
              key={mt.id}
              onPress={() => setSelectedType(mt)}
              style={[styles.chip, selectedType?.id === mt.id && styles.chipActive]}
            >
              <Text style={[styles.chipText, selectedType?.id === mt.id && styles.chipTextActive]}>{mt.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input label="Porciones" keyboardType="numeric" value={portions} onChangeText={setPortions} />

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
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.meal, borderColor: colors.meal },
  chipText: { color: colors.text, fontSize: 13 },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  estimateBox: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  estimateLabel: { fontSize: 12, color: colors.textMuted },
  estimateValue: { fontSize: 24, fontWeight: '800', color: colors.meal, marginTop: 4 },
});
