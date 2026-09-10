import { supabase } from './supabase';
import { Tip } from '@/types/database.types';

export async function getTips(category?: string) {
  let query = supabase.from('tips').select('*');
  if (category) query = query.eq('category', category);
  const { data, error } = await query.order('id');
  if (error) throw error;
  return data as Tip[];
}

export async function getTipOfTheDay() {
  const { data, error } = await supabase.from('tips').select('*');
  if (error) throw error;
  if (!data || data.length === 0) return null;
  const dayIndex = new Date().getDate() % data.length;
  return data[dayIndex] as Tip;
}
