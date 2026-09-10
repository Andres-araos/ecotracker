import { supabase } from './supabase';
import { Competition } from '@/types/database.types';

export async function createCompetition(name: string, createdBy: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('competitions')
    .insert({ name, created_by: createdBy, start_date: startDate, end_date: endDate })
    .select()
    .single();
  if (error) throw error;

  await supabase.from('competition_members').insert({ competition_id: data.id, user_id: createdBy });
  return data as Competition;
}

export async function joinCompetitionByCode(inviteCode: string, userId: string) {
  const { data, error } = await supabase.rpc('join_competition_by_code', {
    p_invite_code: inviteCode.trim().toLowerCase(),
  });
  if (error) throw error;
  return data as Competition;
}

export async function getUserCompetitions(userId: string) {
  const { data, error } = await supabase
    .from('competition_members')
    .select('competitions(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return data.map((row: any) => row.competitions) as Competition[];
}

export async function getCompetitionRanking(competitionId: string) {
  const { data, error } = await supabase
    .from('competition_members')
    .select('user_id, profiles(username, green_points, avatar_url)')
    .eq('competition_id', competitionId);
  if (error) throw error;

  return (data as any[])
    .map((row) => ({
      userId: row.user_id,
      username: row.profiles?.username,
      greenPoints: row.profiles?.green_points ?? 0,
      avatarUrl: row.profiles?.avatar_url,
    }))
    .sort((a, b) => b.greenPoints - a.greenPoints);
}
