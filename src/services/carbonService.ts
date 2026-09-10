import { supabase } from './supabase';
import { CarbonFactor } from '@/types/database.types';

export async function getCarbonFactors(category: 'meal' | 'transport' | 'energy') {
  const { data, error } = await supabase
    .from('carbon_factors')
    .select('*')
    .eq('category', category);
  if (error) throw error;
  return data as CarbonFactor[];
}

export function calculateCO2(quantity: number, factor: number) {
  return Math.round(quantity * factor * 1000) / 1000;
}

export async function getWeeklySummary(userId: string, weekStart: string, weekEnd: string) {
  const [meals, transport, energy] = await Promise.all([
    supabase.from('meals').select('co2_kg').eq('user_id', userId).gte('recorded_at', weekStart).lte('recorded_at', weekEnd),
    supabase.from('transport_records').select('co2_kg').eq('user_id', userId).gte('recorded_at', weekStart).lte('recorded_at', weekEnd),
    supabase.from('energy_records').select('co2_kg').eq('user_id', userId).gte('recorded_at', weekStart).lte('recorded_at', weekEnd),
  ]);

  const sum = (rows: { co2_kg: number }[] | null) => (rows ?? []).reduce((acc, r) => acc + Number(r.co2_kg), 0);

  return {
    meals: sum(meals.data),
    transport: sum(transport.data),
    energy: sum(energy.data),
    total: sum(meals.data) + sum(transport.data) + sum(energy.data),
  };
}
