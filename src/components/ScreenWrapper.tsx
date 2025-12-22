import React from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: any;
  withScrollView?: boolean; // Future proofing if we want scroll view wrapper
}

export default function ScreenWrapper({ children, style }: ScreenWrapperProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
        translucent={Platform.OS === 'android'}
      />
      <View style={[{ flex: 1 }, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
