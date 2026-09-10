import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '@/constants/colors';

import DashboardScreen from '@/screens/home/DashboardScreen';
import RegisterActivityScreen from '@/screens/activity/RegisterActivityScreen';
import MealScreen from '@/screens/activity/MealScreen';
import TransportScreen from '@/screens/activity/TransportScreen';
import EnergyScreen from '@/screens/activity/EnergyScreen';
import HistoryScreen from '@/screens/history/HistoryScreen';
import StatsScreen from '@/screens/stats/StatsScreen';
import TipsScreen from '@/screens/tips/TipsScreen';
import CompetitionsScreen from '@/screens/competitions/CompetitionsScreen';
import RankingScreen from '@/screens/competitions/RankingScreen';
import CompetitionDetailScreen from '@/screens/competitions/CompetitionDetailScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const HomeStackNav = createNativeStackNavigator();
const RegisterStackNav = createNativeStackNavigator();
const StatsStackNav = createNativeStackNavigator();
const CompetitionsStackNav = createNativeStackNavigator();

function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="Dashboard" component={DashboardScreen} />
      <HomeStackNav.Screen name="History" component={HistoryScreen} />
    </HomeStackNav.Navigator>
  );
}

function RegisterStack() {
  return (
    <RegisterStackNav.Navigator screenOptions={{ headerShown: false }}>
      <RegisterStackNav.Screen name="RegisterActivity" component={RegisterActivityScreen} />
      <RegisterStackNav.Screen name="Meal" component={MealScreen} />
      <RegisterStackNav.Screen name="Transport" component={TransportScreen} />
      <RegisterStackNav.Screen name="Energy" component={EnergyScreen} />
    </RegisterStackNav.Navigator>
  );
}

function StatsStack() {
  return (
    <StatsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <StatsStackNav.Screen name="Stats" component={StatsScreen} />
      <StatsStackNav.Screen name="Tips" component={TipsScreen} />
    </StatsStackNav.Navigator>
  );
}

function CompetitionsStack() {
  return (
    <CompetitionsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <CompetitionsStackNav.Screen name="Competitions" component={CompetitionsScreen} />
      <CompetitionsStackNav.Screen name="Ranking" component={RankingScreen} />
      <CompetitionsStackNav.Screen name="CompetitionDetail" component={CompetitionDetailScreen} />
    </CompetitionsStackNav.Navigator>
  );
}

const ICONS: Record<string, string> = {
  Inicio: '🏠',
  Registrar: '➕',
  Estadísticas: '📊',
  Competencias: '🏆',
  Perfil: '👤',
};

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{ICONS[route.name]}</Text>,
        tabBarStyle: { borderTopColor: colors.border, height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Inicio" component={HomeStack} />
      <Tab.Screen name="Registrar" component={RegisterStack} />
      <Tab.Screen name="Estadísticas" component={StatsStack} />
      <Tab.Screen name="Competencias" component={CompetitionsStack} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
