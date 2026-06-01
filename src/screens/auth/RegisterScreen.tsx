import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, HelperText } from 'react-native-paper';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import ScreenWrapper from '../../components/ScreenWrapper';
import { spacing } from '../../theme';

type Field = 'name' | 'email' | 'password' | null;

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState<Field>(null);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      setErrorField(!name ? 'name' : !email ? 'email' : 'password');
      return;
    }

    setLoading(true);
    setError('');
    setErrorField(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      // RootNavigator routes new users to Onboarding based on profile existence.
    } catch (err: any) {
      let msg = 'Registration failed';
      let field: Field = null;
      if (err.code === 'auth/email-already-in-use') { msg = 'Email already in use'; field = 'email'; }
      if (err.code === 'auth/weak-password') { msg = 'Password should be at least 6 characters'; field = 'password'; }
      if (err.code === 'auth/invalid-email') { msg = 'Invalid email address'; field = 'email'; }
      setError(msg);
      setErrorField(field);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Create Account</Text>

      <View style={styles.form}>
        <TextInput
          label="Name"
          mode="outlined"
          value={name}
          onChangeText={setName}
          error={errorField === 'name'}
        />
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
        <HelperText type={errorField === 'password' ? 'error' : 'info'} visible={!error || errorField === 'password'}>
          Use at least 6 characters.
        </HelperText>

        {error && errorField !== 'password' ? (
          <HelperText type="error" visible={!!error}>{error}</HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleRegister}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          Sign Up
        </Button>
        <Button onPress={() => navigation.navigate('Login')} disabled={loading}>
          Already have an account? Login
        </Button>
      </View>
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
