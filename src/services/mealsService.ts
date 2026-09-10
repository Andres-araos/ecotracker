import { supabase } from './supabase';
import { Meal, MealType } from '@/types/database.types';

export async function getMealTypes() {
  const { data, error } = await supabase.from('meal_types').select('*').order('name');
  if (error) throw error;
  return data as MealType[];
}

export async function addMeal(userId: string, mealTypeId: number, portions: number, co2Kg: number, recordedAt: string) {
  const { data, error } = await supabase
    .from('meals')
    .insert({ user_id: userId, meal_type_id: mealTypeId, portions, co2_kg: co2Kg, recorded_at: recordedAt })
    .select()
    .single();
  if (error) throw error;
  return data as Meal;
}

export async function getMeals(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('meals')
    .select('*, meal_types(*)')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Meal[];
}

export async function deleteMeal(id: string) {
  const { error } = await supabase.from('meals').delete().eq('id', id);
  if (error) throw error;
}
