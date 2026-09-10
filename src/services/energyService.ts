import { supabase } from './supabase';
import { EnergyRecord } from '@/types/database.types';

export async function addEnergyRecord(userId: string, kwh: number, co2Kg: number, recordedAt: string) {
  const { data, error } = await supabase
    .from('energy_records')
    .insert({ user_id: userId, kwh, co2_kg: co2Kg, recorded_at: recordedAt })
    .select()
    .single();
  if (error) throw error;
  return data as EnergyRecord;
}

export async function getEnergyRecords(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('energy_records')
    .select('*')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as EnergyRecord[];
}

export async function deleteEnergyRecord(id: string) {
  const { error } = await supabase.from('energy_records').delete().eq('id', id);
  if (error) throw error;
}
