import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, HelperText, Snackbar } from 'react-native-paper';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import ScreenWrapper from '../../components/ScreenWrapper';
import { spacing } from '../../theme';

type Field = 'email' | 'password' | null;

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<Field>(null);
  const [snackbar, setSnackbar] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      setErrorField(!email ? 'email' : 'password');
      return;
    }

    setLoading(true);
    setError('');
    setErrorField(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation handled by RootNavigator's onAuthStateChanged
    } catch (err: any) {
      let msg = 'Login failed';
      let field: Field = null;
      if (err.code === 'auth/invalid-email') { msg = 'Invalid email address'; field = 'email'; }
      if (err.code === 'auth/user-not-found') { msg = 'No account found for this email'; field = 'email'; }
      if (err.code === 'auth/wrong-password') { msg = 'Incorrect password'; field = 'password'; }
      if (err.code === 'auth/invalid-credential') { msg = 'Invalid email or password'; field = 'password'; }
      setError(msg);
      setErrorField(field);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email first, then tap "Forgot password".');
      setErrorField('email');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError('');
      setErrorField(null);
      setSnackbar('Password reset email sent. Check your inbox.');
    } catch {
      setError('Could not send reset email. Check the address and try again.');
      setErrorField('email');
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
          error={errorField === 'email'}
        />
        <TextInput
          label="Password"
          mode="outlined"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          error={errorField === 'password'}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(s => !s)}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            />
          }
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
        <Button onPress={handleForgotPassword} disabled={loading} compact>
          Forgot password?
        </Button>
        <Button onPress={() => navigation.navigate('Register')} disabled={loading}>
          Don't have an account? Sign up
        </Button>
      </View>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={4000}>
        {snackbar}
      </Snackbar>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    gap: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
});
