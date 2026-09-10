import { supabase } from './supabase';
import { TransportRecord, TransportType } from '@/types/database.types';

export async function getTransportTypes() {
  const { data, error } = await supabase.from('transport_types').select('*').order('id');
  if (error) throw error;
  return data as TransportType[];
}

export async function addTransportRecord(userId: string, transportTypeId: number, distanceKm: number, co2Kg: number, recordedAt: string) {
  const { data, error } = await supabase
    .from('transport_records')
    .insert({ user_id: userId, transport_type_id: transportTypeId, distance_km: distanceKm, co2_kg: co2Kg, recorded_at: recordedAt })
    .select()
    .single();
  if (error) throw error;
  return data as TransportRecord;
}

export async function getTransportRecords(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('transport_records')
    .select('*, transport_types(*)')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as TransportRecord[];
}

export async function deleteTransportRecord(id: string) {
  const { error } = await supabase.from('transport_records').delete().eq('id', id);
  if (error) throw error;
}
