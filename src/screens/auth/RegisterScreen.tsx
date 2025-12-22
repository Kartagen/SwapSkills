import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, TextInput, HelperText } from 'react-native-paper';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: name
      });
      // Navigation handled by RootNavigator, but for new users we might want to push to Onboarding
      // RootNavigator will send to AppStack or Onboarding based on profile existence later
    } catch (err: any) {
      let msg = 'Registration failed';
      if (err.code === 'auth/email-already-in-use') msg = 'Email already in use';
      if (err.code === 'auth/weak-password') msg = 'Password should be at least 6 characters';
      if (err.code === 'auth/invalid-email') msg = 'Invalid email address';
      console.log(err)
      setError(msg);
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
          error={!!error}
        />
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
