import { supabase } from './supabase';
import { Achievement } from '@/types/database.types';

export async function getUserAchievements(userId: string) {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*, achievements(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

export async function getAllAchievements() {
  const { data, error } = await supabase.from('achievements').select('*');
  if (error) throw error;
  return data as Achievement[];
}

export async function addGreenPoints(userId: string, points: number, currentPoints: number) {
  const { error } = await supabase
    .from('profiles')
    .update({ green_points: currentPoints + points })
    .eq('id', userId);
  if (error) throw error;
}
