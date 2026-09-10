export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  weekly_goal_kg: number;
  green_points: number;
  current_streak: number;
  created_at: string;
}

export interface MealType {
  id: number;
  name: string;
  category: string;
}

export interface TransportType {
  id: number;
  name: string;
  icon: string | null;
}

export interface CarbonFactor {
  id: number;
  category: 'meal' | 'transport' | 'energy';
  reference_id: number | null;
  factor: number;
  unit: string;
}

export interface Meal {
  id: string;
  user_id: string;
  meal_type_id: number;
  portions: number;
  co2_kg: number;
  recorded_at: string;
  meal_types?: MealType;
}

export interface TransportRecord {
  id: string;
  user_id: string;
  transport_type_id: number;
  distance_km: number;
  co2_kg: number;
  recorded_at: string;
  transport_types?: TransportType;
}

export interface EnergyRecord {
  id: string;
  user_id: string;
  kwh: number;
  co2_kg: number;
  recorded_at: string;
}

export interface Tip {
  id: number;
  category: string;
  content: string;
}

export interface Competition {
  id: string;
  name: string;
  created_by: string;
  start_date: string;
  end_date: string;
  invite_code: string;
}

export interface CompetitionMember {
  id: string;
  competition_id: string;
  user_id: string;
  joined_at: string;
  profiles?: Profile;
}

export interface Achievement {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  points_reward: number;
}
