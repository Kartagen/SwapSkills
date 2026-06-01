import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../../components/ScreenWrapper';
import { usePalette } from '../../theme/ThemeProvider';
import { spacing } from '../../theme';

export default function WelcomeScreen({ navigation }: any) {
  const palette = usePalette();

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.logo, { backgroundColor: palette.primary }]}>
          <MaterialCommunityIcons name="swap-horizontal-bold" size={48} color={palette.onMedia} />
        </View>
        <Text variant="displaySmall" style={styles.title}>SwapSkill</Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: palette.slate500 }]}>
          Exchange skills, learn together.
        </Text>

        <View style={styles.buttons}>
          <Button mode="contained" onPress={() => navigation.navigate('Login')} style={styles.button}>
            Login
          </Button>
          <Button mode="outlined" onPress={() => navigation.navigate('Register')} style={styles.button}>
            Register
          </Button>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttons: {
    width: '100%',
    gap: spacing.sm,
  },
  button: {
    width: '100%',
  },
});
