import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import SplashScreen from '@/screens/auth/SplashScreen';
import AuthStack from './AuthStack';
import AppTabs from './AppTabs';

export default function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      {session ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
