import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function WelcomeScreen({ navigation }: any) {
  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.content}>
        <Text variant="displayMedium" style={styles.title}>Welcome to SwapSkill</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Exchange skills, learn together.</Text>
        
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
    padding: 20,
  },
  content: {
    alignItems: 'center',
    gap: 20,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
  },
  buttons: {
    width: '100%',
    gap: 10,
  },
  button: {
    width: '100%',
  }
});
