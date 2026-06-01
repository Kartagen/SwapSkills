import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePalette } from '../theme/ThemeProvider';
import { spacing } from '../theme';

interface EmptyStateProps {
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Consistent illustration-style placeholder for empty/zero-data screens.
 */
export default function EmptyState({
  icon = 'inbox-outline',
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const palette = usePalette();

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: palette.slate100 }]}>
        <MaterialCommunityIcons name={icon} size={40} color={palette.primary} />
      </View>
      <Text variant="titleMedium" style={[styles.title, { color: palette.slate800 }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="bodyMedium" style={[styles.subtitle, { color: palette.slate500 }]}>
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button mode="contained" onPress={onAction} style={styles.action}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  action: {
    marginTop: spacing.xl,
  },
});
