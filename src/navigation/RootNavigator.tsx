import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { useAppTheme } from '../theme/ThemeProvider';

export default function RootNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDark, palette } = useAppTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const navTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: palette.background, card: palette.surface, primary: palette.primary } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: palette.background, card: palette.surface, primary: palette.primary } };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.background }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
