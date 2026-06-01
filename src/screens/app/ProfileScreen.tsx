import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Avatar, Chip, Divider, IconButton, Switch, Snackbar } from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import {
  getUserProfile,
  UserProfile,
  unmatchUser,
  recordSwipe,
  checkForMatch,
} from '../../services/userService';
import ScreenWrapper from '../../components/ScreenWrapper';
import EmptyState from '../../components/EmptyState';
import LoadingView from '../../components/LoadingView';
import MatchModal from '../../components/MatchModal';
import { useIsFocused } from '@react-navigation/native';
import { useAppTheme, usePalette } from '../../theme/ThemeProvider';
import { Palette, spacing } from '../../theme';

export default function ProfileScreen({ route, navigation }: any) {
  const [profile, setProfile] = useState<UserProfile | null>(route.params?.user || null);
  const [loading, setLoading] = useState(!route.params?.user);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const [snackbar, setSnackbar] = useState('');
  const isFocused = useIsFocused();
  const isOwnProfile = !route.params?.user || route.params?.user?.uid === auth.currentUser?.uid;

  const palette = usePalette();
  const { isDark, toggle } = useAppTheme();
  const styles = useMemo(() => makeStyles(palette), [palette]);

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

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (error) {
            Alert.alert('Error', 'Failed to log out');
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    navigation.navigate('Onboarding', { isEditing: true, profileData: profile });
  };

  const handleConnect = () => {
    if (!profile) return;
    Alert.alert('Connect', `Send a match request to ${profile.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Connect',
        onPress: async () => {
          if (!auth.currentUser || !profile) return;
          await recordSwipe(auth.currentUser.uid, profile.uid, 'like');
          const isMatch = await checkForMatch(auth.currentUser.uid, profile.uid);
          if (isMatch) {
            setMatchedUser(profile);
          } else {
            setSnackbar(`Request sent to ${profile.name.split(' ')[0]}!`);
          }
        },
      },
    ]);
  };

  const handleUnmatch = () => {
    if (!profile) return;
    Alert.alert('Unmatch', `Unmatch with ${profile.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unmatch',
        style: 'destructive',
        onPress: async () => {
          if (auth.currentUser && profile) {
            await unmatchUser(auth.currentUser.uid, profile.uid);
            navigation.navigate('MainTabs', { screen: 'Chat' });
          }
        },
      },
    ]);
  };

  if (loading && !profile) {
    return (
      <ScreenWrapper>
        <LoadingView label="Loading profile…" />
      </ScreenWrapper>
    );
  }

  if (!profile) {
    return (
      <ScreenWrapper>
        <EmptyState
          icon="account-question-outline"
          title="Profile not found"
          subtitle="We couldn't load this profile."
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {!isOwnProfile && (
        <IconButton
          icon="arrow-left"
          accessibilityLabel="Go back"
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
                <Chip key={index} style={[styles.chip, styles.learnChip]}>{skill}</Chip>
              ))}
            </View>
          </View>
        )}

        {isOwnProfile ? (
          <>
            <Divider style={styles.divider} />
            <View style={styles.prefRow}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Dark mode</Text>
              <Switch value={isDark} onValueChange={toggle} accessibilityLabel="Toggle dark mode" />
            </View>

            <View style={styles.actions}>
              <Button mode="contained" onPress={handleEdit} icon="pencil">
                Edit Profile
              </Button>
              <Button mode="text" textColor={palette.error} onPress={handleLogout} icon="logout">
                Log out
              </Button>
            </View>
          </>
        ) : (
          <View style={styles.actions}>
            <Button mode="contained" onPress={handleConnect} icon="heart">
              Connect with {profile.name.split(' ')[0]}
            </Button>
            <Button mode="outlined" textColor={palette.error} onPress={handleUnmatch} icon="account-remove">
              Unmatch
            </Button>
          </View>
        )}
      </ScrollView>

      <MatchModal
        visible={!!matchedUser}
        matchedUser={matchedUser}
        onClose={() => setMatchedUser(null)}
        onSendMessage={() => {
          const target = matchedUser;
          setMatchedUser(null);
          navigation.navigate('ChatRoom', { recipient: target });
        }}
      />

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={3000}>
        {snackbar}
      </Snackbar>
    </ScreenWrapper>
  );
}

const makeStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      padding: spacing.xl,
      paddingBottom: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xl,
      marginTop: spacing.sm,
    },
    name: {
      marginTop: spacing.sm,
      fontWeight: 'bold',
      color: palette.slate800,
    },
    detail: {
      color: palette.slate500,
      marginTop: spacing.xs,
    },
    email: {
      color: palette.slate400,
      marginTop: spacing.xs,
    },
    divider: {
      marginVertical: spacing.xl,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      marginBottom: spacing.sm,
      fontWeight: 'bold',
      color: palette.slate800,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      backgroundColor: palette.slate200,
    },
    learnChip: {
      backgroundColor: palette.learnTintAlt,
    },
    prefRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    actions: {
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    backButton: {
      position: 'absolute',
      top: spacing.sm,
      left: spacing.sm,
      zIndex: 1,
    },
  });
