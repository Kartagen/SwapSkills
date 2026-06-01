import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { usePalette } from '../theme/ThemeProvider';
import { spacing } from '../theme';

interface LoadingViewProps {
  label?: string;
}

/** Centered spinner with an optional context label. */
export default function LoadingView({ label }: LoadingViewProps) {
  const palette = usePalette();

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <ActivityIndicator size="large" color={palette.primary} />
      {label ? (
        <Text variant="bodyMedium" style={[styles.label, { color: palette.slate500 }]}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: spacing.md,
  },
});
