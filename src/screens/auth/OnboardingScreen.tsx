import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, Chip, HelperText, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '../../config/firebase';
import { createUserProfile, uploadAvatar } from '../../services/userService';
import ScreenWrapper from '../../components/ScreenWrapper';

import { SKILLS_LIST } from '../../constants/skills';

export default function OnboardingScreen({ navigation, route }: any) {
  const { isEditing, profileData } = route.params || {};

  const [name, setName] = useState(auth.currentUser?.displayName || '');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [learning, setLearning] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const toggleLearning = (skill: string) => {
    if (learning.includes(skill)) {
      setLearning(learning.filter(s => s !== skill));
    } else {
      setLearning([...learning, skill]);
    }
  };

  const handleSave = async () => {
    if (!name || !age || !city) {
      setError('Please fill in all required fields');
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

      await createUserProfile(uid, {
        name,
        email,
        age,
        city,
        skills,
        learning,
        photoURL,
      });

      if (isEditing) {
          Alert.alert("Success", "Profile updated successfully");
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
    <ScreenWrapper withScrollView>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineMedium" style={styles.title}>
            {isEditing ? "Edit Profile" : "Complete Your Profile"}
        </Text>
        
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={pickImage}>
             {imageUri ? (
               <Image source={{ uri: imageUri }} style={styles.avatar} />
             ) : (
                <View style={styles.avatarPlaceholder}>
                  <IconButton icon="camera" size={32} iconColor="#666" />
                  <Text variant="labelLarge">Add Photo</Text>
                </View>
             )}
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
            <TextInput label="Display Name" value={name} onChangeText={setName} mode="outlined" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput label="Age" value={age} onChangeText={setAge} mode="outlined" keyboardType="numeric" style={{ flex: 1 }} />
                <TextInput label="City" value={city} onChangeText={setCity} mode="outlined" style={{ flex: 2 }} />
            </View>

            <Text variant="titleMedium" style={styles.sectionTitle}>I can teach / Skills I have</Text>
            <View style={styles.chips}>
                {SKILLS_LIST.map(skill => (
                    <Chip 
                        key={`skill-${skill}`} 
                        selected={skills.includes(skill)} 
                        onPress={() => toggleSkill(skill)}
                        showSelectedCheck
                        style={[styles.chip, skills.includes(skill) && { backgroundColor: '#E0E7FF' }]}
                    >
                        {skill}
                    </Chip>
                ))}
            </View>

            <Text variant="titleMedium" style={styles.sectionTitle}>I want to learn</Text>
            <View style={styles.chips}>
                {SKILLS_LIST.map(skill => (
                    <Chip 
                        key={`learn-${skill}`} 
                        selected={learning.includes(skill)} 
                        onPress={() => toggleLearning(skill)}
                        showSelectedCheck
                        style={[styles.chip, learning.includes(skill) && { backgroundColor: '#FEF3C7' }]}
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
                contentStyle={{ paddingVertical: 8 }}
            >
                {isEditing ? "Update Profile" : "Ready to Match"}
            </Button>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
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
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    gap: 15,
  },
  sectionTitle: {
    marginTop: 10,
    marginBottom: 5,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  button: {
    marginTop: 20,
  }
});
