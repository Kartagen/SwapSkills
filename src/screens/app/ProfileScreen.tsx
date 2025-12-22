import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Avatar, Chip, ActivityIndicator, Divider, IconButton } from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { getUserProfile, UserProfile, unmatchUser } from '../../services/userService';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useIsFocused } from '@react-navigation/native';

export default function ProfileScreen({ route, navigation }: any) {
  const [profile, setProfile] = useState<UserProfile | null>(route.params?.user || null);
  const [loading, setLoading] = useState(!route.params?.user);
  const isFocused = useIsFocused();
  const isOwnProfile = !route.params?.user || route.params?.user?.uid === auth.currentUser?.uid;

  useEffect(() => {
    if (isFocused) {
      if (!route.params?.user) {
        loadProfile();
      } else {
        setProfile(route.params.user);
        setLoading(false);
      }
    }
  }, [isFocused, route.params?.user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', () => {
      navigation.setParams({ user: undefined });
      setProfile(null);
      setLoading(true);
    });
    return unsubscribe;
  }, [navigation]);

  const loadProfile = async () => {
    if (auth.currentUser) {
      setLoading(true);
      const data = await getUserProfile(auth.currentUser.uid);
      setProfile(data);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const handleEdit = () => {
    navigation.navigate('Onboarding', { isEditing: true, profileData: profile });
  };

  if (loading && !profile) {
     return (
        <ScreenWrapper style={[styles.container, styles.center]}>
            <ActivityIndicator size="large" />
        </ScreenWrapper>
     );
  }

  if (!profile) {
      return (
          <ScreenWrapper style={[styles.container, styles.center]}>
              <Text>No profile found.</Text>
              <Button onPress={() => navigation.goBack()}>Go Back</Button>
          </ScreenWrapper>
      )
  }

  return (
    <ScreenWrapper withScrollView>
      {!isOwnProfile && (
          <IconButton 
            icon="arrow-left" 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          />
      )}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
            {profile.photoURL ? (
                <Avatar.Image size={100} source={{ uri: profile.photoURL }} />
            ) : (
                <Avatar.Text size={100} label={profile.name.substring(0, 2).toUpperCase()} />
            )}
            <Text variant="headlineMedium" style={styles.name}>{profile.name}</Text>
            <Text variant="titleMedium" style={styles.detail}>{profile.age} • {profile.city}</Text>
            {isOwnProfile && <Text variant="bodyMedium" style={styles.email}>{profile.email}</Text>}
        </View>
        
        <Divider style={styles.divider} />

        <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Skills to Share</Text>
            <View style={styles.chips}>
                {profile.skills.map((skill, index) => (
                    <Chip key={index} style={styles.chip}>{skill}</Chip>
                ))}
            </View>
        </View>

        {profile.learning && profile.learning.length > 0 && (
            <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>Wants to Learn</Text>
                <View style={styles.chips}>
                    {profile.learning.map((skill, index) => (
                        <Chip key={index} style={[styles.chip, { backgroundColor: '#FDE68A' }]}>{skill}</Chip>
                    ))}
                </View>
            </View>
        )}

        {isOwnProfile ? (
            <View style={styles.actions}>
                <Button mode="outlined" onPress={handleEdit} icon="pencil">
                    Edit Profile
                </Button>
                <Button mode="contained" buttonColor="#ef4444" onPress={handleLogout} icon="logout">
                    Logout
                </Button>
            </View>
        ) : (
            <View style={styles.actions}>
                <Button 
                    mode="contained" 
                    onPress={() => {
                        Alert.alert("Connect", `Send a match request to ${profile.name}?`, [
                            { text: "Cancel", style: "cancel" },
                            { text: "Connect", onPress: () => {
                                // Logic for connect
                            }}
                        ])
                    }} 
                    icon="heart"
                >
                    Connect with {profile.name.split(' ')[0]}
                </Button>
                <Button 
                    mode="outlined" 
                    textColor="#ef4444" 
                    onPress={() => {
                        Alert.alert(
                            "Unmatch",
                            `Unmatch with ${profile.name}?`,
                            [
                                { text: "Cancel", style: "cancel" },
                                { 
                                    text: "Unmatch", 
                                    style: "destructive",
                                    onPress: async () => {
                                        if (auth.currentUser) {
                                            await unmatchUser(auth.currentUser.uid, profile.uid);
                                            navigation.navigate('MainTabs', { screen: 'Chat' });
                                        }
                                    } 
                                }
                            ]
                        )
                    }} 
                    icon="account-remove"
                >
                    Unmatch
                </Button>
            </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  name: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  detail: {
    opacity: 0.7,
    marginTop: 5,
  },
  email: {
    opacity: 0.5,
    marginTop: 5,
  },
  divider: {
    marginVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#e2e8f0',
  },
  actions: {
    gap: 15,
    marginTop: 20,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  }
});
