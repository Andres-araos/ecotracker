import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, radius } from '@/constants/colors';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useCompetitions } from '@/hooks/useCompetitions';
import { createCompetition, joinCompetitionByCode } from '@/services/competitionsService';
import { todayISO } from '@/utils/dateUtils';

export default function CompetitionsScreen() {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const { competitions, loading, reload } = useCompetitions(profile?.id);
  const [modal, setModal] = useState<'none' | 'create' | 'join'>('none');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = navigation.addListener('focus', reload);
    return unsub;
  }, [navigation, reload]);

  async function handleCreate() {
    if (!profile || !name.trim()) return;
    setSaving(true);
    try {
      const end = new Date();
      end.setDate(end.getDate() + 7);
      await createCompetition(name.trim(), profile.id, todayISO(), end.toISOString().split('T')[0]);
      setModal('none');
      setName('');
      reload();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleJoin() {
    if (!profile || !code.trim()) return;
    setSaving(true);
    try {
      await joinCompetitionByCode(code.trim().toLowerCase(), profile.id);
      setModal('none');
      setCode('');
      reload();
    } catch (err: any) {
      Alert.alert('Código inválido', 'No se encontró una competencia con ese código.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ padding: spacing.md }}>
        <Text style={styles.title}>Competencias 🏆</Text>
        <View style={styles.actionsRow}>
          <Button title="+ Crear" onPress={() => setModal('create')} style={{ flex: 1 }} />
          <Button title="Unirme" variant="outline" onPress={() => setModal('join')} style={{ flex: 1 }} />
        </View>
      </View>

      <FlatList
        data={competitions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        refreshing={loading}
        onRefresh={reload}
        ListEmptyComponent={<Text style={styles.empty}>No estás en ninguna competencia todavía.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('CompetitionDetail', { competitionId: item.id, name: item.name })}>
            <Card style={{ marginBottom: spacing.sm }}>
              <Text style={styles.compName}>{item.name}</Text>
              <Text style={styles.compDates}>{item.start_date} → {item.end_date}</Text>
              <Text style={styles.compCode}>Código: {item.invite_code}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modal !== 'none'} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            {modal === 'create' ? (
              <>
                <Text style={styles.modalTitle}>Nueva competencia</Text>
                <Input placeholder="Nombre de la competencia" value={name} onChangeText={setName} />
                <Button title="Crear" onPress={handleCreate} loading={saving} />
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Unirme con código</Text>
                <Input placeholder="Código de invitación" autoCapitalize="none" value={code} onChangeText={setCode} />
                <Button title="Unirme" onPress={handleJoin} loading={saving} />
              </>
            )}
            <Button title="Cancelar" variant="ghost" onPress={() => setModal('none')} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  compName: { fontSize: 16, fontWeight: '700', color: colors.text },
  compDates: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  compCode: { fontSize: 12, color: colors.primary, marginTop: 4, fontWeight: '600' },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  modalBackdrop: { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', padding: spacing.lg },
  modalBox: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  modalTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
});
