import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, HelperText } from 'react-native-paper';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation will be handled by RootNavigator's onAuthStateChanged
    } catch (err: any) {
      let msg = 'Login failed';
      if (err.code === 'auth/invalid-email') msg = 'Invalid email address';
      if (err.code === 'auth/user-not-found') msg = 'User not found';
      if (err.code === 'auth/wrong-password') msg = 'Incorrect password';
      if (err.code === 'auth/invalid-credential') msg = 'Invalid credentials';
      setError(msg);
      // Optional: Log error for debugging
      // console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Welcome Back!</Text>

      <View style={styles.form}>
        <TextInput
          label="Email"
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          error={!!error}
        />
        <TextInput
          label="Password"
          mode="outlined"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={!!error}
        />

        {error ? <HelperText type="error" visible={!!error}>{error}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          Login
        </Button>
        <Button onPress={() => navigation.navigate('Register')} disabled={loading}>
          Don't have an account? Sign up
        </Button>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    gap: 15,
  },
  button: {
    marginTop: 10,
  }
});
