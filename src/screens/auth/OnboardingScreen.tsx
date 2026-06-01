import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, Chip, HelperText, IconButton, Searchbar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../../config/firebase';
import { createUserProfile, uploadAvatar } from '../../services/userService';
import ScreenWrapper from '../../components/ScreenWrapper';
import { usePalette } from '../../theme/ThemeProvider';
import { Palette, spacing, radius } from '../../theme';

import { SKILLS_LIST } from '../../constants/skills';

export default function OnboardingScreen({ navigation, route }: any) {
  const { isEditing, profileData } = route.params || {};

  const [name, setName] = useState(auth.currentUser?.displayName || '');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [learning, setLearning] = useState<string[]>([]);
  const [skillQuery, setSkillQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const palette = usePalette();
  const styles = useMemo(() => makeStyles(palette), [palette]);

  useEffect(() => {
    if (isEditing && profileData) {
      setName(profileData.name);
      setAge(profileData.age || '');
      setCity(profileData.city || '');
      setSkills(profileData.skills || []);
      setLearning(profileData.learning || []);
      setImageUri(profileData.photoURL || null);
    }
  }, [isEditing, profileData]);

  const filteredSkills = useMemo(
    () => SKILLS_LIST.filter(s => s.toLowerCase().includes(skillQuery.toLowerCase())),
    [skillQuery]
  );

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const toggle = (list: string[], setList: (v: string[]) => void, skill: string) => {
    setList(list.includes(skill) ? list.filter(s => s !== skill) : [...list, skill]);
  };

  const handleSave = async () => {
    if (!name || !age || !city) {
      setError('Please fill in your name, age and city.');
      return;
    }
    if (skills.length === 0) {
      setError('Pick at least one skill you can teach.');
      return;
    }
    if (learning.length === 0) {
      setError('Pick at least one skill you want to learn.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const uid = auth.currentUser?.uid;
      const email = auth.currentUser?.email || '';
      if (!uid) throw new Error('No user logged in');

      let photoURL = imageUri || '';
      if (imageUri && !imageUri.startsWith('http')) {
        photoURL = await uploadAvatar(uid, imageUri);
      }

      await createUserProfile(uid, { name, email, age, city, skills, learning, photoURL });

      if (isEditing) {
        Alert.alert('Success', 'Profile updated successfully');
        navigation.goBack();
      } else {
        navigation.replace('MainTabs');
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text variant="headlineMedium" style={styles.title}>
          {isEditing ? 'Edit Profile' : 'Complete Your Profile'}
        </Text>

        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={pickImage} accessibilityLabel="Add profile photo">
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <IconButton icon="camera" size={32} iconColor={palette.slate500} />
                <Text variant="labelLarge" style={styles.placeholderLabel}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <TextInput label="Display Name" value={name} onChangeText={setName} mode="outlined" />
          <View style={styles.row}>
            <TextInput label="Age" value={age} onChangeText={setAge} mode="outlined" keyboardType="numeric" style={styles.ageInput} />
            <TextInput label="City" value={city} onChangeText={setCity} mode="outlined" style={styles.cityInput} />
          </View>

          <Searchbar
            placeholder="Search skills"
            value={skillQuery}
            onChangeText={setSkillQuery}
            style={styles.search}
            inputStyle={styles.searchInput}
          />

          <Text variant="titleMedium" style={styles.sectionTitle}>
            I can teach ({skills.length})
          </Text>
          <View style={styles.chips}>
            {filteredSkills.map(skill => (
              <Chip
                key={`skill-${skill}`}
                selected={skills.includes(skill)}
                onPress={() => toggle(skills, setSkills, skill)}
                showSelectedCheck
                style={[styles.chip, skills.includes(skill) && styles.skillSelected]}
              >
                {skill}
              </Chip>
            ))}
          </View>

          <Text variant="titleMedium" style={styles.sectionTitle}>
            I want to learn ({learning.length})
          </Text>
          <View style={styles.chips}>
            {filteredSkills.map(skill => (
              <Chip
                key={`learn-${skill}`}
                selected={learning.includes(skill)}
                onPress={() => toggle(learning, setLearning, skill)}
                showSelectedCheck
                style={[styles.chip, learning.includes(skill) && styles.learnSelected]}
              >
                {skill}
              </Chip>
            ))}
          </View>

          {error ? <HelperText type="error" visible={!!error}>{error}</HelperText> : null}

          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {isEditing ? 'Update Profile' : 'Ready to Match'}
          </Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      padding: spacing.xl,
      paddingBottom: 40,
    },
    title: {
      textAlign: 'center',
      marginBottom: spacing.xl,
      color: palette.slate800,
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: palette.slate200,
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderLabel: {
      color: palette.slate500,
    },
    form: {
      gap: spacing.md,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    ageInput: {
      flex: 1,
    },
    cityInput: {
      flex: 2,
    },
    search: {
      backgroundColor: palette.slate100,
      elevation: 0,
      borderRadius: radius.md,
      marginTop: spacing.sm,
    },
    searchInput: {
      fontSize: 15,
    },
    sectionTitle: {
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
      color: palette.slate800,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      marginBottom: spacing.xs,
    },
    skillSelected: {
      backgroundColor: palette.teachTintStrong,
    },
    learnSelected: {
      backgroundColor: palette.learnTintStrong,
    },
    button: {
      marginTop: spacing.xl,
    },
    buttonContent: {
      paddingVertical: spacing.sm,
    },
  });
